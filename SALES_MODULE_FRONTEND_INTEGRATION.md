# Guía de Integración Frontend - Módulo de Ventas

## Índice
1. [Introducción](#introducción)
2. [Autenticación y Permisos](#autenticación-y-permisos)
3. [Gestión de Clientes](#gestión-de-clientes)
4. [Métodos de Pago](#métodos-de-pago)
5. [Ciclo de Vida de Ventas](#ciclo-de-vida-de-ventas)
6. [Gestión de Pagos](#gestión-de-pagos)
7. [Ejemplos de Integración](#ejemplos-de-integración)
8. [Manejo de Errores](#manejo-de-errores)

---

## Introducción

Este documento describe cómo integrar el módulo de ventas desde el frontend. El módulo implementa un flujo completo de ventas con gestión de inventario, pagos múltiples, notas crédito y seguimiento de despachos.

### Base URL
```
http://localhost:3000/api/v1
```

### Headers Requeridos
```javascript
{
  'Authorization': 'Bearer {token}',
  'Content-Type': 'application/json'
}
```

---

## Autenticación y Permisos

### Roles Disponibles
- **admin**: Acceso completo a todas las funcionalidades
- **manager**: Gestión de ventas, confirmaciones, cancelaciones
- **salesperson**: Crear y editar ventas en borrador, convertir cotizaciones
- **warehouse**: Marcar despachos y entregas
- **accountant**: Gestión de pagos y reportes financieros
- **viewer**: Solo lectura

### Matriz de Permisos

| Operación | Admin | Manager | Salesperson | Warehouse | Accountant |
|-----------|-------|---------|-------------|-----------|------------|
| Crear venta | ✅ | ✅ | ✅ | ❌ | ❌ |
| Confirmar venta | ✅ | ✅ | ❌ | ❌ | ❌ |
| Cancelar venta | ✅ | ✅ | ❌ | ❌ | ❌ |
| Crear nota crédito | ✅ | ✅ | ❌ | ❌ | ❌ |
| Registrar pago | ✅ | ✅ | ❌ | ❌ | ✅ |
| Despachar venta | ✅ | ✅ | ❌ | ✅ | ❌ |
| Ver reportes | ✅ | ✅ | ❌ | ❌ | ✅ |

---

## Gestión de Clientes

### 1. Listar Clientes

**Endpoint:** `GET /customers`

**Query Parameters:**
```typescript
interface QueryCustomersParams {
  page?: number;          // Default: 1
  limit?: number;         // Default: 10
  search?: string;        // Busca en nombre, documento, código
  type?: 'retail' | 'wholesale' | 'vip' | 'distributor';
  isActive?: boolean;
}
```

**Ejemplo:**
```javascript
const fetchCustomers = async (params) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(`/api/v1/customers?${queryString}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};

// Uso
const customers = await fetchCustomers({
  page: 1,
  limit: 20,
  search: 'Juan',
  isActive: true
});
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "code": "CLI-0001",
        "documentType": "CC",
        "documentNumber": "12345678",
        "name": "Juan Pérez",
        "email": "juan@example.com",
        "phone": "3001234567",
        "creditLimit": 5000000,
        "currentBalance": 1200000,
        "customerType": "retail",
        "isActive": true
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 20,
      "totalPages": 3
    }
  }
}
```

### 2. Crear Cliente

**Endpoint:** `POST /customers`

**Roles:** admin, manager

**Request Body:**
```typescript
interface CreateCustomerDto {
  code?: string;                    // Auto-generado si no se provee
  documentType: 'CC' | 'NIT' | 'CE' | 'PASSPORT';
  documentNumber: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  creditLimit?: number;             // Default: 0
  customerType?: 'retail' | 'wholesale' | 'vip' | 'distributor'; // Default: retail
  taxResponsible?: boolean;         // Default: false
  notes?: string;
  metadata?: any;
}
```

**Ejemplo:**
```javascript
const createCustomer = async (customerData) => {
  const response = await fetch('/api/v1/customers', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(customerData)
  });
  return response.json();
};

// Uso
const newCustomer = await createCustomer({
  documentType: 'CC',
  documentNumber: '12345678',
  name: 'María García',
  email: 'maria@example.com',
  phone: '3009876543',
  creditLimit: 3000000,
  customerType: 'wholesale'
});
```

---

## Métodos de Pago

### 1. Listar Métodos de Pago

**Endpoint:** `GET /payment-methods`

**Ejemplo:**
```javascript
const fetchPaymentMethods = async () => {
  const response = await fetch('/api/v1/payment-methods', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};

const methods = await fetchPaymentMethods();
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Efectivo",
      "code": "cash",
      "requiresReference": false,
      "isActive": true
    },
    {
      "id": 2,
      "name": "Transferencia Bancaria",
      "code": "transfer",
      "requiresReference": true,
      "isActive": true
    }
  ]
}
```

---

## Ciclo de Vida de Ventas

### Estados de Venta

```
DRAFT → CONFIRMED → DISPATCHED → DELIVERED
  ↓         ↓
CANCELLED  CREDITED
```

### Tipos de Venta

- **quote**: Cotización (no afecta inventario)
- **proforma**: Factura proforma (no afecta inventario hasta confirmación)
- **invoice**: Factura (afecta inventario al confirmar)
- **remission**: Remisión (no afecta inventario, solo documento)
- **credit_note**: Nota crédito (reversa inventario)

---

### 1. Crear Venta (Borrador)

**Endpoint:** `POST /sales`

**Roles:** admin, manager, salesperson

**Request Body:**
```typescript
interface CreateSaleDto {
  saleType: 'quote' | 'proforma' | 'invoice' | 'remission';
  customerId: number;
  warehouseId?: number;           // Requerido para confirmar
  saleDate?: string;              // ISO 8601, default: now
  dueDate?: string;               // ISO 8601, para créditos
  taxPercentage?: number;         // Default: 19
  discountAmount?: number;        // Default: 0
  notes?: string;
  metadata?: any;
  details: CreateSaleDetailDto[];
}

interface CreateSaleDetailDto {
  productId: number;
  quantity: number;
  unitPrice: number;
  taxPercentage?: number;         // Default: 19
  discountPercentage?: number;    // Default: 0
}
```

**Ejemplo - Crear Cotización:**
```javascript
const createQuote = async (quoteData) => {
  const response = await fetch('/api/v1/sales', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(quoteData)
  });
  return response.json();
};

// Uso
const quote = await createQuote({
  saleType: 'quote',
  customerId: 1,
  warehouseId: 1,
  taxPercentage: 19,
  details: [
    {
      productId: 10,
      quantity: 5,
      unitPrice: 50000,
      taxPercentage: 19
    },
    {
      productId: 15,
      quantity: 2,
      unitPrice: 120000,
      discountPercentage: 10
    }
  ],
  notes: 'Cotización válida por 30 días'
});
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "saleNumber": "COT-0045",
    "saleType": "quote",
    "status": "draft",
    "customerId": 1,
    "warehouseId": 1,
    "saleDate": "2025-01-21T10:30:00Z",
    "subtotal": 466000,
    "taxAmount": 88540,
    "total": 554540,
    "balance": 554540,
    "paymentStatus": "pending",
    "details": [
      {
        "id": 456,
        "productId": 10,
        "description": "Producto A",
        "quantity": 5,
        "unitPrice": 50000,
        "lineTotal": 297500
      },
      {
        "id": 457,
        "productId": 15,
        "description": "Producto B",
        "quantity": 2,
        "unitPrice": 120000,
        "discountPercentage": 10,
        "lineTotal": 257040
      }
    ]
  }
}
```

---

### 2. Confirmar Venta

**Endpoint:** `POST /sales/:id/confirm`

**Roles:** admin, manager

**Importante:**
- Solo ventas en estado `draft`
- Requiere `warehouseId` asignado
- Valida disponibilidad de stock
- Crea transacciones de inventario (outbound)

**Ejemplo:**
```javascript
const confirmSale = async (saleId) => {
  const response = await fetch(`/api/v1/sales/${saleId}/confirm`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};

// Uso
const confirmedSale = await confirmSale(123);
```

**Respuesta Exitosa:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "status": "confirmed",
    "saleNumber": "FAC-0045"
  },
  "message": "Sale confirmed successfully"
}
```

**Error - Stock Insuficiente:**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Insufficient stock for product \"Producto A\". Available: 3, Required: 5"
  }
}
```

---

### 3. Convertir Cotización a Factura

**Endpoint:** `POST /sales/:id/convert-to-invoice`

**Roles:** admin, manager, salesperson

**Ejemplo:**
```javascript
const convertQuoteToInvoice = async (quoteId) => {
  const response = await fetch(`/api/v1/sales/${quoteId}/convert-to-invoice`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};

// Uso
const invoice = await convertQuoteToInvoice(123);
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 124,
    "saleNumber": "FAC-0046",
    "saleType": "invoice",
    "status": "draft",
    "referenceSaleId": 123,
    "notes": "Converted from quote COT-0045"
  },
  "message": "Quote converted to invoice successfully"
}
```

---

### 4. Crear Nota Crédito

**Endpoint:** `POST /sales/:id/credit-note`

**Roles:** admin, manager

**Request Body:**
```typescript
interface CreateCreditNoteRequest {
  reason: string;  // Requerido
}
```

**Importante:**
- Solo para ventas confirmadas/facturadas
- Crea transacciones de inventario (inbound) para reversar
- Actualiza balance del cliente
- Marca venta original como `credited`

**Ejemplo:**
```javascript
const createCreditNote = async (saleId, reason) => {
  const response = await fetch(`/api/v1/sales/${saleId}/credit-note`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ reason })
  });
  return response.json();
};

// Uso
const creditNote = await createCreditNote(123, 'Cliente devolvió productos defectuosos');
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 125,
    "saleNumber": "NC-0001",
    "saleType": "credit_note",
    "status": "confirmed",
    "referenceSaleId": 123,
    "subtotal": -466000,
    "taxAmount": -88540,
    "total": -554540,
    "notes": "Credit note for FAC-0045. Reason: Cliente devolvió productos defectuosos"
  },
  "message": "Credit note created successfully"
}
```

---

### 5. Cancelar Venta

**Endpoint:** `POST /sales/:id/cancel`

**Roles:** admin, manager

**Importante:**
- No puede tener pagos registrados (usar nota crédito en ese caso)
- Si la venta afectó inventario, lo reversa automáticamente

**Ejemplo:**
```javascript
const cancelSale = async (saleId) => {
  const response = await fetch(`/api/v1/sales/${saleId}/cancel`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

---

### 6. Crear Remisión

**Endpoint:** `POST /sales/remission`

**Roles:** admin, manager, salesperson

**Importante:**
- No afecta inventario
- Se usa para muestras, demostraciones, etc.
- Se confirma automáticamente

**Ejemplo:**
```javascript
const createRemission = async (remissionData) => {
  const response = await fetch('/api/v1/sales/remission', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      customerId: 1,
      details: [
        {
          productId: 10,
          quantity: 1,
          unitPrice: 0  // Precio en 0 para muestras
        }
      ],
      notes: 'Muestra para cliente'
    })
  });
  return response.json();
};
```

---

### 7. Marcar como Despachada

**Endpoint:** `POST /sales/:id/dispatch`

**Roles:** admin, manager, warehouse

**Ejemplo:**
```javascript
const dispatchSale = async (saleId) => {
  const response = await fetch(`/api/v1/sales/${saleId}/dispatch`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

---

### 8. Marcar como Entregada

**Endpoint:** `POST /sales/:id/deliver`

**Roles:** admin, manager, warehouse

**Ejemplo:**
```javascript
const deliverSale = async (saleId) => {
  const response = await fetch(`/api/v1/sales/${saleId}/deliver`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

---

## Gestión de Pagos

### 1. Registrar Pago

**Endpoint:** `POST /payments`

**Roles:** admin, manager, accountant

**Request Body:**
```typescript
interface CreatePaymentDto {
  saleId: number;
  paymentMethodId: number;
  amount: number;
  paymentDate?: string;         // ISO 8601, default: now
  referenceNumber?: string;     // Requerido si el método lo requiere
  notes?: string;
  metadata?: any;
}
```

**Ejemplo - Pago Completo:**
```javascript
const createPayment = async (paymentData) => {
  const response = await fetch('/api/v1/payments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(paymentData)
  });
  return response.json();
};

// Pago completo en efectivo
const payment = await createPayment({
  saleId: 123,
  paymentMethodId: 1,  // Efectivo
  amount: 554540,
  notes: 'Pago completo al contado'
});
```

**Ejemplo - Pago Parcial:**
```javascript
// Primer abono
const payment1 = await createPayment({
  saleId: 123,
  paymentMethodId: 2,  // Transferencia
  amount: 300000,
  referenceNumber: 'TRANS-12345',
  notes: 'Primer abono del cliente'
});

// Segundo abono
const payment2 = await createPayment({
  saleId: 123,
  paymentMethodId: 1,  // Efectivo
  amount: 254540,
  notes: 'Pago del saldo restante'
});
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 78,
    "paymentNumber": "PAG-0078",
    "saleId": 123,
    "paymentMethodId": 1,
    "amount": 554540,
    "paymentDate": "2025-01-21T14:30:00Z",
    "status": "completed",
    "referenceNumber": null
  },
  "message": "Payment created successfully"
}
```

---

### 2. Listar Pagos de una Venta

**Endpoint:** `GET /payments/sale/:saleId`

**Ejemplo:**
```javascript
const fetchSalePayments = async (saleId) => {
  const response = await fetch(`/api/v1/payments/sale/${saleId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};

const payments = await fetchSalePayments(123);
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 78,
      "paymentNumber": "PAG-0078",
      "amount": 300000,
      "paymentDate": "2025-01-21T10:00:00Z",
      "status": "completed",
      "paymentMethod": {
        "id": 2,
        "name": "Transferencia Bancaria"
      }
    },
    {
      "id": 79,
      "paymentNumber": "PAG-0079",
      "amount": 254540,
      "paymentDate": "2025-01-21T14:00:00Z",
      "status": "completed",
      "paymentMethod": {
        "id": 1,
        "name": "Efectivo"
      }
    }
  ]
}
```

---

### 3. Reembolsar Pago

**Endpoint:** `POST /payments/:id/refund`

**Roles:** admin, manager

**Request Body:**
```typescript
interface RefundPaymentRequest {
  reason?: string;
}
```

**Ejemplo:**
```javascript
const refundPayment = async (paymentId, reason) => {
  const response = await fetch(`/api/v1/payments/${paymentId}/refund`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ reason })
  });
  return response.json();
};

const refunded = await refundPayment(78, 'Cliente solicitó devolución');
```

---

### 4. Resumen de Pagos

**Endpoint:** `GET /payments/summary`

**Roles:** admin, manager, accountant

**Query Parameters:**
```typescript
interface PaymentSummaryParams {
  startDate?: string;  // ISO 8601
  endDate?: string;    // ISO 8601
}
```

**Ejemplo:**
```javascript
const fetchPaymentSummary = async (startDate, endDate) => {
  const params = new URLSearchParams({
    startDate,
    endDate
  });

  const response = await fetch(`/api/v1/payments/summary?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};

const summary = await fetchPaymentSummary('2025-01-01', '2025-01-31');
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalAmount": 15680000,
      "totalCount": 45,
      "startDate": "2025-01-01",
      "endDate": "2025-01-31"
    },
    "byPaymentMethod": [
      {
        "paymentMethodId": 1,
        "paymentMethodName": "Efectivo",
        "count": 28,
        "amount": 8450000,
        "percentage": 53.87
      },
      {
        "paymentMethodId": 2,
        "paymentMethodName": "Transferencia Bancaria",
        "count": 17,
        "amount": 7230000,
        "percentage": 46.13
      }
    ]
  }
}
```

---

## Ejemplos de Integración

### Flujo Completo: Cotización → Factura → Pago

```javascript
// 1. Crear cotización
const quote = await createQuote({
  saleType: 'quote',
  customerId: 1,
  warehouseId: 1,
  details: [
    { productId: 10, quantity: 5, unitPrice: 50000 }
  ]
});

console.log(`Cotización creada: ${quote.data.saleNumber}`);

// 2. Cliente aprueba, convertir a factura
const invoice = await convertQuoteToInvoice(quote.data.id);
console.log(`Factura creada: ${invoice.data.saleNumber}`);

// 3. Confirmar factura (afecta inventario)
const confirmed = await confirmSale(invoice.data.id);
console.log(`Factura confirmada, inventario actualizado`);

// 4. Registrar pago
const payment = await createPayment({
  saleId: invoice.data.id,
  paymentMethodId: 1,
  amount: invoice.data.total
});
console.log(`Pago registrado: ${payment.data.paymentNumber}`);

// 5. Marcar como despachada
await dispatchSale(invoice.data.id);
console.log('Orden despachada');

// 6. Marcar como entregada
await deliverSale(invoice.data.id);
console.log('Orden entregada al cliente');
```

---

### Componente React: Formulario de Venta

```jsx
import { useState, useEffect } from 'react';

function SaleForm({ customerId, onSaleCreated }) {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [saleData, setSaleData] = useState({
    saleType: 'invoice',
    customerId,
    warehouseId: '',
    details: [{ productId: '', quantity: 1, unitPrice: 0 }]
  });

  useEffect(() => {
    // Cargar productos y almacenes
    fetchProducts().then(setProducts);
    fetchWarehouses().then(setWarehouses);
  }, []);

  const addDetail = () => {
    setSaleData({
      ...saleData,
      details: [
        ...saleData.details,
        { productId: '', quantity: 1, unitPrice: 0 }
      ]
    });
  };

  const updateDetail = (index, field, value) => {
    const newDetails = [...saleData.details];
    newDetails[index][field] = value;

    // Auto-completar precio del producto
    if (field === 'productId') {
      const product = products.find(p => p.id === parseInt(value));
      if (product) {
        newDetails[index].unitPrice = product.price;
      }
    }

    setSaleData({ ...saleData, details: newDetails });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/v1/sales', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(saleData)
      });

      const result = await response.json();

      if (result.success) {
        onSaleCreated(result.data);
      } else {
        alert(result.error.message);
      }
    } catch (error) {
      console.error('Error creating sale:', error);
      alert('Error al crear la venta');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Tipo de Venta:</label>
        <select
          value={saleData.saleType}
          onChange={(e) => setSaleData({ ...saleData, saleType: e.target.value })}
        >
          <option value="quote">Cotización</option>
          <option value="proforma">Proforma</option>
          <option value="invoice">Factura</option>
          <option value="remission">Remisión</option>
        </select>
      </div>

      <div>
        <label>Almacén:</label>
        <select
          value={saleData.warehouseId}
          onChange={(e) => setSaleData({ ...saleData, warehouseId: e.target.value })}
          required
        >
          <option value="">Seleccionar almacén</option>
          {warehouses.map(w => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </div>

      <h3>Detalles de Venta</h3>
      {saleData.details.map((detail, index) => (
        <div key={index} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
          <label>Producto:</label>
          <select
            value={detail.productId}
            onChange={(e) => updateDetail(index, 'productId', e.target.value)}
            required
          >
            <option value="">Seleccionar producto</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} - ${p.price}
              </option>
            ))}
          </select>

          <label>Cantidad:</label>
          <input
            type="number"
            min="1"
            value={detail.quantity}
            onChange={(e) => updateDetail(index, 'quantity', e.target.value)}
            required
          />

          <label>Precio Unitario:</label>
          <input
            type="number"
            min="0"
            value={detail.unitPrice}
            onChange={(e) => updateDetail(index, 'unitPrice', e.target.value)}
            required
          />
        </div>
      ))}

      <button type="button" onClick={addDetail}>
        + Agregar Producto
      </button>

      <button type="submit">Crear Venta</button>
    </form>
  );
}
```

---

### Componente React: Gestión de Pagos

```jsx
import { useState, useEffect } from 'react';

function PaymentManager({ sale }) {
  const [payments, setPayments] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [newPayment, setNewPayment] = useState({
    paymentMethodId: '',
    amount: '',
    referenceNumber: ''
  });

  useEffect(() => {
    loadPayments();
    loadPaymentMethods();
  }, [sale.id]);

  const loadPayments = async () => {
    const response = await fetch(`/api/v1/payments/sale/${sale.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await response.json();
    setPayments(result.data);
  };

  const loadPaymentMethods = async () => {
    const response = await fetch('/api/v1/payment-methods', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await response.json();
    setPaymentMethods(result.data);
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();

    const response = await fetch('/api/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        saleId: sale.id,
        ...newPayment,
        amount: parseFloat(newPayment.amount)
      })
    });

    const result = await response.json();

    if (result.success) {
      loadPayments();
      setNewPayment({ paymentMethodId: '', amount: '', referenceNumber: '' });
    } else {
      alert(result.error.message);
    }
  };

  const selectedMethod = paymentMethods.find(
    m => m.id === parseInt(newPayment.paymentMethodId)
  );

  return (
    <div>
      <h3>Pagos Registrados</h3>
      <div>
        <strong>Total Venta:</strong> ${sale.total.toLocaleString()}
      </div>
      <div>
        <strong>Total Pagado:</strong> ${sale.paidAmount.toLocaleString()}
      </div>
      <div>
        <strong>Saldo Pendiente:</strong> ${sale.balance.toLocaleString()}
      </div>

      <table>
        <thead>
          <tr>
            <th>Número</th>
            <th>Fecha</th>
            <th>Método</th>
            <th>Monto</th>
            <th>Referencia</th>
          </tr>
        </thead>
        <tbody>
          {payments.map(payment => (
            <tr key={payment.id}>
              <td>{payment.paymentNumber}</td>
              <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
              <td>{payment.paymentMethod.name}</td>
              <td>${payment.amount.toLocaleString()}</td>
              <td>{payment.referenceNumber || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {sale.balance > 0 && (
        <form onSubmit={handleAddPayment}>
          <h4>Registrar Nuevo Pago</h4>

          <label>Método de Pago:</label>
          <select
            value={newPayment.paymentMethodId}
            onChange={(e) => setNewPayment({ ...newPayment, paymentMethodId: e.target.value })}
            required
          >
            <option value="">Seleccionar método</option>
            {paymentMethods.filter(m => m.isActive).map(method => (
              <option key={method.id} value={method.id}>
                {method.name}
              </option>
            ))}
          </select>

          <label>Monto:</label>
          <input
            type="number"
            min="0.01"
            max={sale.balance}
            step="0.01"
            value={newPayment.amount}
            onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
            required
          />

          {selectedMethod?.requiresReference && (
            <>
              <label>Número de Referencia:</label>
              <input
                type="text"
                value={newPayment.referenceNumber}
                onChange={(e) => setNewPayment({ ...newPayment, referenceNumber: e.target.value })}
                required
                placeholder="Ej: TRANS-12345"
              />
            </>
          )}

          <button type="submit">Registrar Pago</button>
        </form>
      )}
    </div>
  );
}
```

---

## Manejo de Errores

### Códigos de Error Comunes

| Código | Descripción | Solución |
|--------|-------------|----------|
| `INSUFFICIENT_STOCK` | No hay suficiente inventario | Verificar disponibilidad antes de confirmar |
| `SALE_NOT_DRAFT` | La venta no está en borrador | Solo las ventas en borrador pueden confirmarse |
| `WAREHOUSE_REQUIRED` | Falta asignar almacén | Asignar almacén antes de confirmar |
| `AMOUNT_EXCEEDS_BALANCE` | Pago mayor al saldo | Validar monto del pago contra balance |
| `PAYMENT_METHOD_NOT_FOUND` | Método de pago no existe | Usar método de pago activo y válido |
| `REFERENCE_REQUIRED` | Falta número de referencia | Proporcionar referencia para transferencias/cheques |
| `HAS_PAYMENTS` | Venta tiene pagos | Usar nota crédito en lugar de cancelación |
| `NOT_DISPATCHED` | No se puede entregar sin despachar | Marcar como despachada primero |

### Ejemplo de Manejo de Errores

```javascript
async function confirmSaleWithValidation(saleId) {
  try {
    // 1. Obtener detalles de la venta
    const saleResponse = await fetch(`/api/v1/sales/${saleId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const saleResult = await saleResponse.json();
    const sale = saleResult.data;

    // 2. Validar que tiene almacén
    if (!sale.warehouseId) {
      alert('Debe asignar un almacén antes de confirmar la venta');
      return;
    }

    // 3. Validar disponibilidad de stock
    const stockValidation = await Promise.all(
      sale.details.map(async detail => {
        const stockResponse = await fetch(
          `/api/v1/inventory/stock/${detail.productId}/warehouse/${sale.warehouseId}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        const stockResult = await stockResponse.json();
        return {
          productId: detail.productId,
          productName: detail.description,
          required: detail.quantity,
          available: stockResult.data.currentStock
        };
      })
    );

    const insufficientStock = stockValidation.filter(
      item => item.available < item.required
    );

    if (insufficientStock.length > 0) {
      const message = insufficientStock.map(
        item => `${item.productName}: Necesita ${item.required}, Disponible ${item.available}`
      ).join('\n');

      alert(`Stock insuficiente:\n${message}`);
      return;
    }

    // 4. Confirmar venta
    const confirmResponse = await fetch(`/api/v1/sales/${saleId}/confirm`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const confirmResult = await confirmResponse.json();

    if (confirmResult.success) {
      alert('Venta confirmada exitosamente');
      return confirmResult.data;
    } else {
      alert(`Error: ${confirmResult.error.message}`);
    }

  } catch (error) {
    console.error('Error al confirmar venta:', error);
    alert('Error de conexión. Intente nuevamente.');
  }
}
```

---

## Notas Adicionales

### Cálculos de Totales

Los totales se calculan automáticamente en el backend:

```
Subtotal por línea = (cantidad × precio unitario) - descuento
Impuesto por línea = subtotal × (porcentaje impuesto / 100)
Total por línea = subtotal + impuesto

Subtotal venta = Σ subtotales de líneas
Impuesto venta = Σ impuestos de líneas
Total venta = subtotal + impuesto - descuento general
Saldo = total - monto pagado
```

### Estados de Pago

- **pending**: Sin pagos
- **partial**: Pagos parciales
- **paid**: Pagado completamente
- **overdue**: Vencido y sin pagar

### Preparación para Facturación Electrónica

Las ventas incluyen campos preparatorios para integración futura:
- `externalInvoiceId`: ID de la factura en el proveedor externo
- `externalInvoiceProvider`: Nombre del proveedor (ej: "alegra", "siigo")
- `externalInvoiceData`: JSON con datos de la factura externa

---

## Soporte

Para preguntas o problemas con la integración, contactar al equipo de desarrollo backend.
