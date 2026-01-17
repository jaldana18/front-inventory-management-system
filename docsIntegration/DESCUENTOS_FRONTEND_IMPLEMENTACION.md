# Implementación Frontend - Sistema de Descuentos Manuales

## Resumen de Cambios

Se ha implementado el sistema de descuentos manuales en el formulario de ventas según la documentación del backend (`DESCUENTOS_MANUALES.md`).

## Archivos Modificados

### 1. `src/schemas/sale.schema.js`

**Cambios realizados:**

- ✅ Agregado `discountPercentage` al schema de items (`saleItemSchema`)
- ✅ Agregados campos de descuento global al schema principal (`saleSchema`):
  - `discountType`: enum ['none', 'percentage', 'fixed']
  - `discountPercentage`: número (0-100)
  - `discountAmount`: número (>= 0)
  - `discountReason`: string opcional (max 500 caracteres)
- ✅ Actualizados valores por defecto (`saleDefaultValues`)
- ✅ Actualizada función `calculateSaleTotals()` para:
  - Calcular descuentos por producto
  - Aplicar descuento global (porcentaje o fijo)
  - Recalcular impuestos proporcionalmente después del descuento global

### 2. `src/components/sales/SaleFormDialog.jsx`

**Cambios realizados:**

#### A. Lógica de Cálculo
- ✅ Agregados watchers para `discountType`, `discountPercentage`, `discountAmount`
- ✅ Actualizado `useEffect` para recalcular totales cuando cambian los descuentos
- ✅ Actualizada función `handleQuantityChange` para usar `discountPercentage`
- ✅ Actualizada función `handlePriceChange` para usar `discountPercentage`
- ✅ Agregada función `handleDiscountChange` para manejar cambios de descuento por producto

#### B. Interfaz de Usuario

**Tabla de Productos:**
- ✅ Agregada columna "Desc. %" para descuento por producto
- ✅ Campo de precio cambiado a solo lectura (muestra el precio del producto)
- ✅ Input numérico para descuento (0-100%)

**Nueva Sección: Descuento Global**
- ✅ Selector de tipo de descuento (Sin descuento / Porcentaje / Monto fijo)
- ✅ Input condicional para porcentaje (cuando tipo = 'percentage')
- ✅ Input condicional para monto fijo (cuando tipo = 'fixed')
- ✅ Campo de razón del descuento (visible cuando hay descuento)
- ✅ Vista previa del descuento aplicado

#### C. Transformación de Datos
- ✅ Actualizado `onSubmit` para transformar datos al formato del backend:
  - Mapear `items.price` → `details.unitPrice`
  - Incluir campos de descuento global
  - Incluir `discountPercentage` por producto

## Características Implementadas

### 1. Descuentos por Producto (Línea)
- Usuario puede aplicar descuento porcentual (0-100%) a cada producto
- El precio del producto NO es modificable directamente (solo lectura)
- El descuento se aplica al subtotal del producto antes de impuestos
- Cálculo en tiempo real del subtotal con descuento

### 2. Descuentos Globales (Venta)

**Tipos de Descuento:**
- **Sin descuento** (default): No se aplica descuento global
- **Porcentaje**: Descuento del X% sobre el subtotal
- **Monto fijo**: Descuento de $X sobre el subtotal

**Campos:**
- Tipo de descuento (selector)
- Porcentaje o monto (según tipo seleccionado)
- Razón del descuento (campo de texto opcional)

**Vista Previa:**
- Muestra el descuento que se aplicará
- Se actualiza en tiempo real

### 3. Cálculo de Totales

El cálculo sigue esta secuencia:

```
1. Por cada producto:
   - Base = cantidad × precio
   - Descuento producto = Base × (descuentoProducto% / 100)
   - Subtotal producto = Base - Descuento producto

2. Subtotal = Σ(Subtotal producto)

3. Descuento global:
   - Si tipo = 'percentage': Descuento = Subtotal × (porcentaje / 100)
   - Si tipo = 'fixed': Descuento = monto fijo

4. Subtotal después descuento = Subtotal - Descuento global

5. Impuestos = Subtotal después descuento × (19% / 100) [proporcional por producto]

6. Total = Subtotal después descuento + Impuestos
```

## Validaciones

### Validaciones en Schema (Zod)
- ✅ `discountType`: debe ser 'none', 'percentage' o 'fixed'
- ✅ `discountPercentage`: 0-100
- ✅ `discountAmount`: >= 0
- ✅ `discountReason`: máximo 500 caracteres
- ✅ `discountPercentage` por producto: 0-100

### Validaciones en UI
- ✅ Inputs numéricos con min/max
- ✅ Campos condicionales según tipo de descuento
- ✅ Recalculo automático en tiempo real

## Estructura de Datos Enviada al Backend

```javascript
{
  "saleType": "invoice",
  "customerId": 1,
  "warehouseId": 1,
  "paymentMethodId": 1,
  "saleDate": "2026-01-11",
  "dueDate": null,
  "notes": "...",
  
  // Descuento global
  "discountType": "percentage",      // 'none' | 'percentage' | 'fixed'
  "discountPercentage": 10,          // 0-100 (cuando tipo = percentage)
  "discountAmount": 0,               // >= 0 (cuando tipo = fixed)
  "discountReason": "Cliente frecuente",
  
  // Detalles con descuentos por producto
  "details": [
    {
      "productId": 1,
      "quantity": 2,
      "unitPrice": 100000,
      "discountPercentage": 5        // Descuento específico de este producto
    },
    {
      "productId": 2,
      "quantity": 1,
      "unitPrice": 50000,
      "discountPercentage": 0        // Sin descuento
    }
  ]
}
```

## Casos de Uso

### Caso 1: Descuento por Producto
Usuario agrega productos y aplica descuentos individuales:
- Producto A: cantidad 2, precio $100,000, descuento 5%
- Producto B: cantidad 1, precio $50,000, descuento 10%

### Caso 2: Descuento Global Porcentual
Usuario aplica un descuento del 10% a toda la venta:
- Tipo: "Porcentaje"
- Valor: 10%
- Razón: "Cliente frecuente"

### Caso 3: Descuento Global Fijo
Usuario aplica un descuento fijo de $50,000:
- Tipo: "Monto fijo"
- Valor: $50,000
- Razón: "Negociación especial"

### Caso 4: Descuentos Combinados
Usuario aplica descuentos por producto Y descuento global:
1. Se calculan descuentos por producto
2. Se obtiene subtotal con descuentos por producto
3. Se aplica descuento global al subtotal
4. Se calculan impuestos sobre el resultado

## Mejoras Futuras (No Implementadas)

- ❌ Descuentos automáticos por eventos
- ❌ Límites de descuento por rol de usuario
- ❌ Historial de descuentos del vendedor
- ❌ Validación de límites de descuento desde backend
- ❌ Aprobación de descuentos superiores a X%

## Testing Recomendado

### Pruebas Manuales
1. ✅ Crear venta sin descuentos
2. ✅ Crear venta con descuento por producto (5%, 10%, 50%)
3. ✅ Crear venta con descuento global porcentual (10%)
4. ✅ Crear venta con descuento global fijo ($50,000)
5. ✅ Crear venta con descuentos combinados
6. ✅ Verificar cálculo de totales en cada caso
7. ✅ Verificar que se envíen correctamente los datos al backend

### Pruebas de Validación
1. ✅ Intentar aplicar descuento > 100%
2. ✅ Intentar aplicar descuento negativo
3. ✅ Cambiar tipo de descuento y verificar campos condicionales
4. ✅ Verificar razón de descuento (máx 500 caracteres)

## Notas Importantes

1. **Precio de Producto**: El campo de precio en la tabla de productos es de **solo lectura**. No se puede modificar directamente según los requisitos.

2. **Cálculo de Impuestos**: Los impuestos se calculan DESPUÉS de aplicar todos los descuentos (por producto y global).

3. **Compatibilidad con Backend**: La estructura de datos enviada es 100% compatible con la API documentada en `DESCUENTOS_MANUALES.md`.

4. **Valores por Defecto**: 
   - `discountType`: 'none'
   - `discountPercentage`: 0
   - `discountAmount`: 0
   - `discountReason`: ''

5. **Recalculo Automático**: Los totales se recalculan automáticamente cuando:
   - Se agregan/eliminan productos
   - Se cambia la cantidad de un producto
   - Se cambia el descuento de un producto
   - Se cambia el tipo de descuento global
   - Se cambia el valor del descuento global
