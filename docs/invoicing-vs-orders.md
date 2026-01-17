# Diferencia entre Facturación y Pedidos

## 📋 Resumen Ejecutivo

En el contexto de tu sistema de inventario, actualmente **ambas rutas (`/invoicing` y `/orders`) apuntan al mismo componente** (`InvoicingPage`), pero conceptualmente representan dos procesos de negocio diferentes.

---

## 🎯 Conceptos Clave

### 🧾 **FACTURACIÓN (Invoicing)**
**Definición**: Proceso de generar documentos contables que **formalizan una venta ya realizada**.

#### Características:
- ✅ **Obligación Legal**: Documento fiscal con validez tributaria
- ✅ **Venta Confirmada**: El cliente ya aceptó comprar
- ✅ **Compromiso de Pago**: Genera una cuenta por cobrar
- ✅ **Afecta Inventario**: Reduce stock inmediatamente
- ✅ **Contabilidad**: Se registra en libros contables

#### Tipos de Documentos:
1. **Factura de Venta** - Venta con IVA
2. **Factura Electrónica** - Cumplimiento DIAN (Colombia)
3. **Nota de Crédito** - Devoluciones o descuentos
4. **Nota de Débito** - Cargos adicionales

#### Estados Típicos:
- `draft` - Borrador
- `confirmed` - Confirmada y enviada
- `paid` - Pagada
- `overdue` - Vencida
- `cancelled` - Anulada

---

### 📦 **PEDIDOS (Orders)**
**Definición**: Proceso de **solicitud o reserva de productos** antes de la venta definitiva.

#### Características:
- 📝 **Pre-venta**: Cliente muestra intención de compra
- 📝 **Cotización**: Puede incluir precios tentativos
- 📝 **No es Fiscal**: No genera obligaciones tributarias
- 📝 **Reserva de Stock**: Puede apartar productos temporalmente
- 📝 **Puede Cancelarse**: Sin consecuencias legales

#### Tipos de Documentos:
1. **Cotización** - Propuesta de venta con precios
2. **Orden de Compra** - Solicitud formal del cliente
3. **Pedido Interno** - Entre bodegas/sucursales
4. **Pre-orden** - Reserva anticipada

#### Estados Típicos:
- `draft` - Borrador de cotización
- `sent` - Enviada al cliente
- `approved` - Aceptada por cliente
- `in_progress` - En preparación
- `ready` - Lista para entrega
- `delivered` - Entregada
- `cancelled` - Cancelada

---

## 🔄 Flujo del Proceso de Negocio

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│  COTIZACIÓN │  -->  │    PEDIDO    │  -->  │  FACTURA    │
│  (Quote)    │       │   (Order)    │       │  (Invoice)  │
└─────────────┘       └──────────────┘       └─────────────┘
     📋                      📦                      🧾
  Propuesta            Reserva/Prepara         Venta Legal

  - Sin Stock          - Aparta Stock          - Reduce Stock
  - Sin Pago           - Puede pagar señal     - Pago completo
  - Modificable        - Confirma cantidades   - Inmutable
  - No contable        - Pre-contable          - Contabilidad
```

---

## 📊 Comparación Detallada

| Aspecto | 📦 Pedidos | 🧾 Facturación |
|---------|-----------|---------------|
| **Propósito** | Reservar/Cotizar | Formalizar venta |
| **Estado de Venta** | Intención de compra | Venta confirmada |
| **Inventario** | Aparta temporalmente | Reduce definitivamente |
| **Obligación Legal** | ❌ No | ✅ Sí (DIAN) |
| **Contabilidad** | ❌ No afecta | ✅ Afecta libros |
| **Pago** | Opcional (señal) | Obligatorio |
| **Modificación** | ✅ Se puede editar | ❌ No editable |
| **Cancelación** | ✅ Sin impacto | ⚠️ Requiere nota crédito |
| **Cliente** | Puede rechazar | Ya aceptó |
| **IVA** | Informativo | Se cobra |
| **Numeración** | Interna | Legal consecutiva |

---

## 💼 Casos de Uso

### Cuándo Usar PEDIDOS:
1. **Cliente solicita cotización** - "¿Cuánto me cuesta X?"
2. **Reserva anticipada** - "Aparta estos productos para mañana"
3. **Pedido entre bodegas** - Transferencia interna
4. **Pedidos mayoristas** - Requieren preparación
5. **E-commerce** - Carrito de compras confirmado

### Cuándo Usar FACTURACIÓN:
1. **Cliente confirma compra** - "Sí, lo llevo"
2. **Venta directa en mostrador** - Punto de venta
3. **Finalizar pedido** - Convertir pedido a factura
4. **Obligación fiscal** - Reportar a DIAN
5. **Control contable** - Registro de ingresos

---

## 🔧 Estado Actual en tu Código

### App.jsx (líneas 100-122)
```jsx
// FACTURACIÓN
<Route path="invoicing" element={
  <RoleBasedRoute path="/invoicing">
    <InvoicingPage />
  </RoleBasedRoute>
} />

// PEDIDOS (⚠️ MISMO COMPONENTE)
<Route path="orders" element={
  <RoleBasedRoute path="/orders">
    <InvoicingPage />  {/* ← Mismo componente */}
  </RoleBasedRoute>
} />
```

**Problema**: Ambas rutas usan `InvoicingPage`, no hay distinción.

---

## 🎯 Implementación Recomendada

### Opción 1: Componente Único con Tabs
**Recomendado para**: Equipos pequeños, flujo simple

```jsx
// SalesPage.jsx
<Tabs value={activeTab} onChange={handleTabChange}>
  <Tab label="Cotizaciones" />
  <Tab label="Pedidos" />
  <Tab label="Facturas" />
  <Tab label="Notas Crédito" />
</Tabs>

<TabPanel value={activeTab} index={0}>
  {/* Gestión de Cotizaciones */}
</TabPanel>
<TabPanel value={activeTab} index={1}>
  {/* Gestión de Pedidos */}
</TabPanel>
<TabPanel value={activeTab} index={2}>
  {/* Gestión de Facturas */}
</TabPanel>
```

### Opción 2: Componentes Separados
**Recomendado para**: Funcionalidad compleja, equipos grandes

```jsx
// OrdersPage.jsx - Gestión de Pedidos
- OrderFormDialog
- OrderDetailDialog
- OrderStatusChip
- Flujo: draft → sent → approved → in_progress → ready → delivered

// InvoicingPage.jsx - Gestión de Facturas
- InvoiceFormDialog
- InvoiceDetailDialog
- InvoiceStatusChip
- Flujo: draft → confirmed → paid
- Integración DIAN (factura electrónica)
```

### Opción 3: Módulo de Ventas Integrado
**Recomendado para**: Máxima flexibilidad

```jsx
// SalesPage.jsx - Hub principal
├── QuotesSection     // Cotizaciones
├── OrdersSection     // Pedidos confirmados
├── InvoicesSection   // Facturas emitidas
└── PaymentsSection   // Gestión de pagos

// Flujo completo:
Quote → Order → Invoice → Payment
```

---

## 🚀 Recomendación para tu Proyecto

Basado en tu estructura actual con `SalesPage.jsx` que ya existe:

### ✅ **Solución Práctica**:

1. **Renombrar conceptualmente**:
   - `/sales` → Gestión integral de ventas (ya existe)
   - `/invoicing` → Crear/Editar facturas rápido
   - `/orders` → Gestión de pedidos pendientes

2. **Usar SalesPage con Tabs**:
```jsx
// SalesPage.jsx ya tiene:
const [activeTab, setActiveTab] = useState('invoice');

// Agregar más tabs:
<Tabs value={activeTab}>
  <Tab value="quote" label="Cotizaciones" />
  <Tab value="order" label="Pedidos" />
  <Tab value="invoice" label="Facturas" />
  <Tab value="credit_note" label="Notas Crédito" />
</Tabs>
```

3. **Flujo recomendado**:
```
1. Cliente solicita → Crear Cotización (quote)
2. Cliente acepta → Convertir a Pedido (order)
3. Preparar mercancía → Marcar como "Ready"
4. Entregar → Generar Factura (invoice)
5. Cliente paga → Registrar Pago (payment)
```

---

## 📝 Campos Diferenciadores

### PEDIDO necesita:
```javascript
{
  orderNumber: "ORD-2025-001",
  quoteNumber: "COT-2025-015",  // Si viene de cotización
  orderDate: "2025-11-23",
  deliveryDate: "2025-11-25",   // Fecha compromiso
  status: "in_progress",
  paymentType: "credit",         // Contado/Crédito
  shippingAddress: {},
  shippingCost: 15000,
  notes: "Cliente prefiere entrega AM"
}
```

### FACTURA necesita:
```javascript
{
  invoiceNumber: "FV-2025-001",  // Numeración DIAN
  orderNumber: "ORD-2025-001",   // Referencia al pedido
  invoiceDate: "2025-11-23",
  dueDate: "2025-12-23",         // Para crédito
  status: "confirmed",
  taxId: "NIT 900123456-7",      // RUT cliente
  paymentMethod: "bank_transfer",
  paymentStatus: "paid",
  electronicKey: "CUFE...",      // Factura electrónica
  dianAuthorization: "18764...",
}
```

---

## 🎨 UI Sugerida

### Página de Pedidos
```
┌─────────────────────────────────────┐
│ 📦 Gestión de Pedidos               │
├─────────────────────────────────────┤
│ [Buscar...] [Filtros▼] [+ Pedido]  │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 📋 Pendientes │ 📦 En Prep │ ✅ │ │
│ │     15        │     8      │ 23 │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ [Tabla de pedidos con estados]     │
│ - ORD-001 | Cliente | En Prep | ... │
│ - ORD-002 | Cliente | Listo   | ... │
└─────────────────────────────────────┘
```

### Página de Facturación
```
┌─────────────────────────────────────┐
│ 🧾 Facturación                      │
├─────────────────────────────────────┤
│ [Buscar...] [Filtros▼] [+ Factura] │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 💰 Pagadas │ ⏳ Pendiente │ 🚨  │ │
│ │  $45.2M    │   $12.5M    │ 3   │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ [Tabla de facturas]                 │
│ - FV-001 | Cliente | Pagada  | ...  │
│ - FV-002 | Cliente | Vencida | ...  │
└─────────────────────────────────────┘
```

---

## 🔐 Permisos por Rol

### Pedidos:
- **Vendedor**: Crear, editar, ver propios
- **Admin Ventas**: Ver todos, aprobar, cancelar
- **Bodega**: Ver, marcar como preparado
- **Delivery**: Ver listos, marcar entregado

### Facturación:
- **Vendedor**: Ver propias, solicitar factura
- **Contador**: Crear, modificar, anular
- **Admin**: Todas las acciones
- **Gerente**: Solo lectura y reportes

---

## 📈 Métricas Clave

### Para Pedidos:
- Tiempo promedio de preparación
- Tasa de cancelación
- Pedidos pendientes por bodega
- Pedidos listos sin retirar

### Para Facturación:
- Ingresos facturados del mes
- Facturas vencidas (cuentas por cobrar)
- Tiempo promedio de pago
- Notas de crédito emitidas

---

## 🎓 Resumen

| | 📦 PEDIDOS | 🧾 FACTURACIÓN |
|---|------------|---------------|
| **Cuándo** | Cliente quiere comprar | Cliente compró |
| **Stock** | Reserva temporal | Reduce definitivo |
| **Legal** | No | Sí (DIAN) |
| **Editable** | Sí | No |
| **Objetivo** | Preparar venta | Legalizar venta |

---

**En resumen**:
- **PEDIDOS** = "Voy a comprar" (intención)
- **FACTURACIÓN** = "Ya compré" (compromiso legal)

**Actualmente en tu proyecto**: Ambas rutas usan el mismo componente, por lo que necesitas decidir si:
1. Separar en componentes distintos
2. Usar tabs en un solo componente
3. Mantener como está pero cambiar el enfoque

**Mi recomendación**: Usa `SalesPage.jsx` con tabs para gestionar todo el ciclo de ventas (cotización → pedido → factura).
