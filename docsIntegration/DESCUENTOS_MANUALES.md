# Sistema de Descuentos Manuales - Documentación

## Descripción General

El sistema de descuentos manuales permite a los usuarios aplicar descuentos flexibles tanto a nivel de venta completa como a nivel de productos individuales durante la creación de ventas (cotizaciones, facturas, etc.).

## Características Implementadas

### 1. Descuentos a Nivel de Venta (Global)

Los descuentos globales se aplican al subtotal completo de la venta antes de calcular impuestos.

**Tipos de Descuento:**
- `none`: Sin descuento (valor por defecto)
- `percentage`: Descuento porcentual (ej: 10%)
- `fixed`: Descuento de monto fijo (ej: $5000)

**Campos Agregados a Sale:**
- `discountType`: Tipo de descuento aplicado
- `discountPercentage`: Porcentaje de descuento (0-100)
- `discountAmount`: Monto calculado o fijo del descuento
- `discountReason`: Justificación opcional del descuento

### 2. Descuentos a Nivel de Producto (Por Línea)

Los descuentos por producto se aplican a cada ítem individual en el detalle de la venta.

**Campos en SaleDetail:**
- `discountPercentage`: Porcentaje de descuento para este producto (0-100)
- `discountAmount`: Monto calculado del descuento

### 3. Validaciones Implementadas

- ✅ Descuento porcentual: 0% - 100%
- ✅ Descuento fijo: >= 0
- ✅ Validación de tipo requerido según discount type
- ✅ Cálculo automático de totales
- ✅ Prevención de descuentos negativos

## Estructura de Base de Datos

### Migración: `1764300000000-AddDiscountFieldsToSales.ts`

```sql
ALTER TABLE sales ADD COLUMN discount_type VARCHAR(20) DEFAULT 'none';
ALTER TABLE sales ADD COLUMN discount_percentage DECIMAL(5,2) DEFAULT 0;
ALTER TABLE sales ADD COLUMN discount_reason NVARCHAR(500) NULL;
```

**Nota**: `discount_amount` ya existía previamente en la tabla.

## API Endpoints

### Crear Venta con Descuento Global

**POST** `/api/v1/sales`

#### Ejemplo 1: Descuento Porcentual (10%)

```json
{
  "saleType": "invoice",
  "customerId": 1,
  "warehouseId": 1,
  "discountType": "percentage",
  "discountPercentage": 10,
  "discountReason": "Cliente frecuente",
  "details": [
    {
      "productId": 1,
      "quantity": 2,
      "unitPrice": 100000
    },
    {
      "productId": 2,
      "quantity": 1,
      "unitPrice": 50000
    }
  ]
}
```

**Cálculo:**
- Subtotal: $250,000
- Descuento (10%): $25,000
- Subtotal después descuento: $225,000
- IVA (19%): $42,750
- Total: $267,750

#### Ejemplo 2: Descuento Fijo ($20,000)

```json
{
  "saleType": "quote",
  "customerId": 2,
  "discountType": "fixed",
  "discountAmount": 20000,
  "discountReason": "Negociación especial",
  "details": [
    {
      "productId": 3,
      "quantity": 5,
      "unitPrice": 80000
    }
  ]
}
```

**Cálculo:**
- Subtotal: $400,000
- Descuento fijo: $20,000
- Subtotal después descuento: $380,000
- IVA (19%): $72,200
- Total: $452,200

### Crear Venta con Descuentos por Producto

**POST** `/api/v1/sales`

```json
{
  "saleType": "invoice",
  "customerId": 1,
  "warehouseId": 1,
  "details": [
    {
      "productId": 1,
      "quantity": 2,
      "unitPrice": 100000,
      "discountPercentage": 5
    },
    {
      "productId": 2,
      "quantity": 3,
      "unitPrice": 50000,
      "discountPercentage": 10
    },
    {
      "productId": 3,
      "quantity": 1,
      "unitPrice": 75000
    }
  ]
}
```

**Cálculo:**
- Producto 1: ($100,000 × 2) - 5% = $190,000
- Producto 2: ($50,000 × 3) - 10% = $135,000
- Producto 3: ($75,000 × 1) - 0% = $75,000
- Subtotal: $400,000
- IVA (19%): $76,000
- Total: $476,000

### Actualizar Descuento de Venta en Borrador

**PUT** `/api/v1/sales/:id`

```json
{
  "discountType": "percentage",
  "discountPercentage": 15,
  "discountReason": "Descuento por volumen actualizado"
}
```

**Restricción**: Solo se pueden editar ventas en estado `draft`.

## Lógica de Cálculo

### Cálculo de Descuento Global (Sale.calculateTotals())

```typescript
if (discountType === 'percentage' && discountPercentage) {
  discountAmount = (subtotal * discountPercentage) / 100;
} else if (discountType === 'fixed') {
  // discountAmount ya está establecido
} else {
  discountAmount = 0;
}

taxAmount = (subtotal * taxPercentage) / 100;
total = subtotal + taxAmount - discountAmount;
```

### Cálculo de Descuento por Producto (SaleDetail.calculateLineTotal())

```typescript
const subtotal = quantity * unitPrice;
const discount = discountPercentage
  ? (subtotal * discountPercentage) / 100
  : discountAmount;
const subtotalAfterDiscount = subtotal - discount;
const tax = (subtotalAfterDiscount * taxPercentage) / 100;
lineTotal = subtotalAfterDiscount + tax;
```

## Validaciones de Negocio

### En CreateSaleDto y UpdateSaleDto

```typescript
@IsOptional()
@IsEnum(DiscountType)
discountType?: DiscountType;

@ValidateIf((o) => o.discountType === DiscountType.PERCENTAGE)
@IsNumber()
@Min(0)
@Max(100)
discountPercentage?: number;

@ValidateIf((o) => o.discountType === DiscountType.FIXED)
@IsNumber()
@Min(0)
discountAmount?: number;

@IsOptional()
@IsString()
discountReason?: string;
```

### En CreateSaleDetailDto

```typescript
@IsOptional()
@IsNumber()
@Min(0)
@Max(100)
discountPercentage?: number;
```

### En SaleService

```typescript
private validateDiscount(dto: CreateSaleDto | UpdateSaleDto): void {
  // Valida que si discountType es 'percentage', discountPercentage esté presente
  // Valida que si discountType es 'fixed', discountAmount esté presente
  // Valida rangos: 0-100% para porcentaje, >= 0 para monto fijo
}
```

## Casos de Uso del Frontend

### Caso 1: Descuento Aplicado Manualmente por Vendedor

El vendedor está creando una factura y decide aplicar un descuento del 5% por ser cliente frecuente:

```javascript
const saleData = {
  saleType: 'invoice',
  customerId: selectedCustomer.id,
  warehouseId: userWarehouse.id,
  discountType: 'percentage',
  discountPercentage: 5,
  discountReason: 'Cliente frecuente',
  details: cartItems.map(item => ({
    productId: item.productId,
    quantity: item.quantity,
    unitPrice: item.price
  }))
};

await fetch('/api/v1/sales', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(saleData)
});
```

### Caso 2: Descuento por Producto en Interfaz de Venta

El vendedor aplica descuentos diferentes a cada producto en el carrito:

```javascript
const saleData = {
  saleType: 'invoice',
  customerId: selectedCustomer.id,
  warehouseId: userWarehouse.id,
  details: [
    {
      productId: 1,
      quantity: 10,
      unitPrice: 5000,
      discountPercentage: 10  // 10% descuento por volumen
    },
    {
      productId: 2,
      quantity: 2,
      unitPrice: 15000,
      discountPercentage: 5   // 5% descuento normal
    },
    {
      productId: 3,
      quantity: 1,
      unitPrice: 25000
      // Sin descuento
    }
  ]
};
```

### Caso 3: Descuento Fijo Negociado

El cliente negoció un descuento fijo de $50,000 en la compra:

```javascript
const saleData = {
  saleType: 'quote',
  customerId: selectedCustomer.id,
  discountType: 'fixed',
  discountAmount: 50000,
  discountReason: 'Negociación especial - Compra por volumen',
  details: cartItems.map(item => ({
    productId: item.productId,
    quantity: item.quantity,
    unitPrice: item.price
  }))
};
```

## Flujo de Trabajo Recomendado

### Para el Frontend

1. **Interfaz de Venta**:
   - Campo selector de tipo de descuento: "Sin descuento", "Porcentaje", "Monto fijo"
   - Input numérico para porcentaje (0-100) o monto (>= 0)
   - Campo de texto opcional para razón del descuento
   - Previsualización del total con descuento aplicado

2. **Tabla de Productos**:
   - Columna adicional para descuento por producto
   - Input de porcentaje en cada fila (0-100)
   - Actualización en tiempo real de totales

3. **Cálculo en Tiempo Real**:
   ```javascript
   function calculateTotal(cart, globalDiscount) {
     let subtotal = 0;

     // Calcular subtotal con descuentos por producto
     cart.forEach(item => {
       const itemSubtotal = item.quantity * item.unitPrice;
       const itemDiscount = item.discountPercentage
         ? (itemSubtotal * item.discountPercentage / 100)
         : 0;
       subtotal += (itemSubtotal - itemDiscount);
     });

     // Aplicar descuento global
     let discount = 0;
     if (globalDiscount.type === 'percentage') {
       discount = subtotal * globalDiscount.percentage / 100;
     } else if (globalDiscount.type === 'fixed') {
       discount = globalDiscount.amount;
     }

     const subtotalAfterDiscount = subtotal - discount;
     const tax = subtotalAfterDiscount * 0.19; // IVA 19%
     const total = subtotalAfterDiscount + tax;

     return { subtotal, discount, tax, total };
   }
   ```

## Consideraciones de Auditoría

### Tracking de Descuentos

Todos los descuentos quedan registrados en:

1. **Base de Datos**:
   - Campo `discountType`, `discountPercentage`, `discountAmount`, `discountReason`
   - Relación con `userId` (quién aplicó el descuento)

2. **Activity Log**:
   ```typescript
   await loggers.logActivity({
     activityType: ActivityType.SALE_CREATE,
     description: `Creó factura ${saleNumber} con descuento del ${discountPercentage}%`,
     metadata: {
       discountType,
       discountPercentage,
       discountAmount,
       discountReason
     }
   });
   ```

3. **Operational Log**:
   ```typescript
   loggers.logOperation('sale_created', userId, companyId, {
     saleId,
     saleNumber,
     total,
     discountApplied: discountAmount
   });
   ```

## Limitaciones Actuales

### Qué NO está implementado (Fase 2 - Eventos de Descuento)

- ❌ Descuentos automáticos por eventos (Black Friday, etc.)
- ❌ Descuentos por categoría de producto
- ❌ Descuentos por cliente automáticos
- ❌ Límites de descuento por rol de usuario
- ❌ Historial de descuentos aplicados por vendedor
- ❌ Descuentos apilables (múltiples descuentos combinados)

Estas características están planificadas para la Fase 2.

## Migración de Datos

### Ejecutar Migración

```bash
npm run migration:run
```

### Verificar Migración

```sql
SELECT
  COLUMN_NAME,
  DATA_TYPE,
  IS_NULLABLE,
  COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'sales'
  AND COLUMN_NAME IN ('discount_type', 'discount_percentage', 'discount_reason');
```

### Datos Existentes

Las ventas existentes tendrán:
- `discount_type`: `'none'`
- `discount_percentage`: `0`
- `discount_amount`: valor existente (mantenido)
- `discount_reason`: `NULL`

## Testing

### Test Manual desde Swagger UI

1. Acceder a `http://localhost:3000/api-docs`
2. Autenticarse con Bearer token
3. Probar endpoint `POST /api/v1/sales` con los ejemplos anteriores
4. Verificar cálculos de totales en la respuesta

### Test Unitario Recomendado

```typescript
describe('Sale Discount Calculations', () => {
  it('should apply percentage discount correctly', () => {
    const sale = new Sale();
    sale.subtotal = 100000;
    sale.taxPercentage = 19;
    sale.discountType = DiscountType.PERCENTAGE;
    sale.discountPercentage = 10;

    sale.calculateTotals();

    expect(sale.discountAmount).toBe(10000);
    expect(sale.total).toBe(107100); // (100000 - 10000) * 1.19
  });

  it('should apply fixed discount correctly', () => {
    const sale = new Sale();
    sale.subtotal = 100000;
    sale.taxPercentage = 19;
    sale.discountType = DiscountType.FIXED;
    sale.discountAmount = 15000;

    sale.calculateTotals();

    expect(sale.total).toBe(101150); // (100000 - 15000) * 1.19
  });
});
```

## Soporte y Preguntas

Para preguntas sobre implementación o extensión del sistema de descuentos, revisar:
- Código fuente: `src/entities/Sale.entity.ts`
- Lógica de negocio: `src/services/SaleService.ts`
- Validaciones: `src/dto/sale/create-sale.dto.ts`
- Migración: `src/migrations/1764300000000-AddDiscountFieldsToSales.ts`
