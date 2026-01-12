# Documentación de Transacciones de Inventario

## 📋 Descripción General

El sistema de transacciones de inventario permite registrar todos los movimientos de stock (entradas, salidas, ajustes y transferencias) de productos en los almacenes. Cada transacción queda registrada con información detallada para trazabilidad completa.

---

## 🔗 Endpoint Principal

### Crear Transacción de Inventario
**Endpoint:** `POST /api/v1/inventory/transactions`

Crea una nueva transacción de inventario para registrar movimientos de stock.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `admin`, `manager`, `user`

**Content-Type:** `application/json`

---

## 📥 Payload Esperado

### Estructura del JSON

```json
{
  // CAMPOS OBLIGATORIOS
  "productId": number,
  "type": "inbound" | "outbound" | "adjustment" | "transfer",
  "reason": string,
  "quantity": number,
  
  // CAMPOS OPCIONALES
  "warehouseId": number,
  "unitCost": number,
  "reference": "string",
  "location": "string",
  "notes": "string",
  "metadata": any
}
```

### Descripción de Campos

| Campo | Tipo | Requerido | Descripción | Validación |
|-------|------|-----------|-------------|------------|
| `productId` | number | ✅ Sí | ID del producto (debe existir previamente) | Entero positivo |
| `type` | string | ✅ Sí | Tipo de transacción | Valores: `inbound`, `outbound`, `adjustment`, `transfer` |
| `reason` | string | ✅ Sí | Razón/motivo de la transacción | Ver tabla de razones permitidas |
| `quantity` | number | ✅ Sí | Cantidad del movimiento | Número decimal positivo |
| `warehouseId` | number | ⚪ No | ID del almacén donde ocurre la transacción | Entero positivo |
| `unitCost` | number | ⚪ No | Costo unitario del producto | Número >= 0 |
| `reference` | string | ⚪ No | Referencia externa (factura, orden, etc.) | Máximo 100 caracteres |
| `location` | string | ⚪ No | Ubicación física dentro del almacén | Máximo 100 caracteres (ej: "Estante A-15") |
| `notes` | string | ⚪ No | Notas adicionales sobre la transacción | Máximo 500 caracteres |
| `metadata` | any | ⚪ No | Datos adicionales en formato JSON | Cualquier objeto JSON válido |

---

## 📊 Tipos de Transacción (type)

| Tipo | Descripción | Efecto en Stock |
|------|-------------|-----------------|
| `inbound` | Entrada de mercancía | ➕ Aumenta el inventario |
| `outbound` | Salida de mercancía | ➖ Disminuye el inventario |
| `adjustment` | Ajuste de inventario | ➕ o ➖ Según cantidad |
| `transfer` | Transferencia entre ubicaciones | ➕➖ Neutro (mover, no crear/destruir) |

---

## 🎯 Razones Permitidas (reason)

| Razón | Código | Descripción | Uso Común con Type |
|-------|--------|-------------|-------------------|
| Compra a proveedor | `purchase` | Ingreso de mercancía comprada | `inbound` |
| Venta a cliente | `sale` | Salida por venta | `outbound` |
| Devolución | `return` | Producto devuelto por cliente o a proveedor | `inbound` o `outbound` |
| Producto dañado | `damaged` | Mercancía en mal estado | `outbound` |
| Producto perdido | `lost` | Inventario extraviado | `outbound` |
| Producto encontrado | `found` | Inventario recuperado | `inbound` |
| Corrección | `correction` | Ajuste por error o conteo físico | `adjustment` |
| Inventario inicial | `initial_stock` | Carga inicial del sistema | `inbound` |
| Transferencia entrante | `transfer_in` | Recepción desde otro almacén | `transfer` |
| Transferencia saliente | `transfer_out` | Envío a otro almacén | `transfer` |
| Otro motivo | `other` | Cualquier otra razón no listada | Cualquiera |

---

## 📤 Ejemplos de Uso

### Ejemplo 1: Entrada por Compra a Proveedor

**Caso:** Recibimos 50 unidades de un producto comprado a un proveedor.

```json
POST /api/v1/inventory/transactions
Content-Type: application/json
Authorization: Bearer <token>

{
  "productId": 123,
  "warehouseId": 1,
  "type": "inbound",
  "reason": "purchase",
  "quantity": 50,
  "unitCost": 25.50,
  "reference": "PO-2024-001",
  "location": "Estante A-15",
  "notes": "Compra a proveedor ABC S.A. - Factura 12345"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 456,
    "productId": 123,
    "warehouseId": 1,
    "type": "inbound",
    "reason": "purchase",
    "quantity": 50,
    "unitCost": 25.50,
    "reference": "PO-2024-001",
    "location": "Estante A-15",
    "notes": "Compra a proveedor ABC S.A. - Factura 12345",
    "createdAt": "2024-11-30T10:30:00.000Z",
    "userId": 5
  }
}
```

---

### Ejemplo 2: Salida por Venta

**Caso:** Se vendieron 5 unidades del producto.

```json
{
  "productId": 123,
  "warehouseId": 1,
  "type": "outbound",
  "reason": "sale",
  "quantity": 5,
  "reference": "INV-2024-450",
  "notes": "Venta a cliente Juan Pérez - Factura 450"
}
```

---

### Ejemplo 3: Ajuste por Conteo Físico

**Caso:** Después de un inventario físico, encontramos 3 unidades más de lo registrado en el sistema.

```json
{
  "productId": 123,
  "warehouseId": 1,
  "type": "adjustment",
  "reason": "correction",
  "quantity": 3,
  "notes": "Ajuste positivo - Conteo físico 30/11/2024. Stock real: 103, Sistema: 100"
}
```

---

### Ejemplo 4: Producto Dañado

**Caso:** Se detectaron 2 unidades dañadas que deben darse de baja.

```json
{
  "productId": 123,
  "warehouseId": 1,
  "type": "outbound",
  "reason": "damaged",
  "quantity": 2,
  "notes": "Productos con daños en empaque. No aptos para venta.",
  "metadata": {
    "damageType": "packaging",
    "reportedBy": "supervisor-warehouse"
  }
}
```

---

### Ejemplo 5: Devolución de Cliente

**Caso:** Un cliente devuelve 1 unidad del producto.

```json
{
  "productId": 123,
  "warehouseId": 1,
  "type": "inbound",
  "reason": "return",
  "quantity": 1,
  "reference": "DEV-2024-015",
  "notes": "Devolución de cliente - No cumplía expectativas"
}
```

---

### Ejemplo 6: Inventario Inicial

**Caso:** Cargamos el stock inicial de un producto al implementar el sistema.

```json
{
  "productId": 123,
  "warehouseId": 1,
  "type": "inbound",
  "reason": "initial_stock",
  "quantity": 100,
  "unitCost": 20.00,
  "location": "Estante B-10",
  "notes": "Inventario inicial - Migración al nuevo sistema"
}
```

---

### Ejemplo 7: Transferencia entre Almacenes

**Caso:** Transferimos 10 unidades del almacén 1 al almacén 2.

**Paso 1 - Salida del almacén origen:**
```json
{
  "productId": 123,
  "warehouseId": 1,
  "type": "transfer",
  "reason": "transfer_out",
  "quantity": 10,
  "reference": "TRANS-2024-008",
  "notes": "Transferencia a Almacén Sur"
}
```

**Paso 2 - Entrada al almacén destino:**
```json
{
  "productId": 123,
  "warehouseId": 2,
  "type": "transfer",
  "reason": "transfer_in",
  "quantity": 10,
  "reference": "TRANS-2024-008",
  "notes": "Recepción desde Almacén Central"
}
```

> **Nota:** Para transferencias, también puedes usar el endpoint especializado:
> `POST /api/v1/inventory/transfer` que maneja ambas transacciones automáticamente.

---

### Ejemplo 8: Producto Perdido

**Caso:** No se encuentra un producto durante inventario.

```json
{
  "productId": 123,
  "warehouseId": 1,
  "type": "outbound",
  "reason": "lost",
  "quantity": 3,
  "notes": "Producto no localizado durante inventario físico. Posible hurto."
}
```

---

### Ejemplo 9: Producto Encontrado

**Caso:** Se encontraron productos que no estaban registrados.

```json
{
  "productId": 123,
  "warehouseId": 1,
  "type": "inbound",
  "reason": "found",
  "quantity": 2,
  "notes": "Productos encontrados en área de cuarentena sin registrar"
}
```

---

### Ejemplo 10: Con Metadata Personalizada

**Caso:** Entrada con información adicional estructurada.

```json
{
  "productId": 123,
  "warehouseId": 1,
  "type": "inbound",
  "reason": "purchase",
  "quantity": 100,
  "unitCost": 18.75,
  "reference": "PO-2024-015",
  "location": "Zona A - Rack 5 - Nivel 3",
  "notes": "Compra especial con descuento por volumen",
  "metadata": {
    "supplierId": 45,
    "supplierName": "Distribuidora XYZ",
    "invoiceNumber": "FAC-2024-7890",
    "invoiceDate": "2024-11-29",
    "discount": 15,
    "shippingCost": 50.00,
    "expectedDeliveryDate": "2024-11-28",
    "actualDeliveryDate": "2024-11-30",
    "receivedBy": "Juan García",
    "quality": "approved"
  }
}
```

---

## ✅ Validaciones del Sistema

### Validaciones Automáticas

1. **Producto Existente**
   - El `productId` debe corresponder a un producto existente en la base de datos
   - El producto debe pertenecer a la misma empresa del usuario

2. **Almacén Válido**
   - Si se proporciona `warehouseId`, debe existir en el sistema
   - El almacén debe pertenecer a la empresa del usuario

3. **Stock Suficiente (para salidas)**
   - En transacciones tipo `outbound`, se valida que haya stock disponible
   - No se permiten cantidades negativas en el inventario

4. **Tipos y Razones Válidas**
   - Los valores de `type` y `reason` deben ser de los enumerados permitidos
   - Combinaciones lógicas (ej: no tiene sentido `outbound` + `purchase`)

5. **Cantidades Positivas**
   - La `quantity` debe ser siempre mayor a 0
   - Se permiten valores decimales para productos fraccionables

6. **Costos No Negativos**
   - Si se proporciona `unitCost`, debe ser >= 0

---

## 🔐 Seguridad y Permisos

### Aislamiento Multi-Tenant
- Todas las transacciones están aisladas por `companyId`
- Los usuarios solo pueden crear transacciones para productos de su empresa
- Los almacenes también están filtrados por empresa

### Auditoría Automática
- Cada transacción registra automáticamente:
  - Usuario que creó la transacción (`userId`)
  - Fecha y hora exacta (`createdAt`)
  - IP y User Agent (en el sistema de audit logs)

### Permisos Requeridos
- **admin**: Acceso completo
- **manager**: Puede crear cualquier tipo de transacción
- **user**: Puede crear transacciones (según configuración)

---

## 📊 Formato de Respuesta

### Respuesta Exitosa (201 Created)

```json
{
  "success": true,
  "data": {
    "id": 789,
    "companyId": 1,
    "productId": 123,
    "warehouseId": 1,
    "userId": 5,
    "type": "inbound",
    "reason": "purchase",
    "quantity": 50,
    "unitCost": 25.50,
    "totalCost": 1275.00,
    "reference": "PO-2024-001",
    "location": "Estante A-15",
    "notes": "Compra a proveedor ABC",
    "metadata": null,
    "createdAt": "2024-11-30T10:30:00.000Z",
    "product": {
      "id": 123,
      "sku": "PROD-001",
      "name": "Laptop Dell XPS 15",
      "currentStock": 150
    },
    "warehouse": {
      "id": 1,
      "name": "Almacén Central",
      "code": "ALM-01"
    },
    "user": {
      "id": 5,
      "firstName": "Juan",
      "lastName": "Pérez",
      "email": "juan.perez@example.com"
    }
  }
}
```

### Respuesta de Error (400 Bad Request)

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "productId",
      "message": "Product ID is required"
    },
    {
      "field": "type",
      "message": "Invalid transaction type"
    }
  ]
}
```

### Errores Comunes

| Código | Error | Causa | Solución |
|--------|-------|-------|----------|
| 400 | `INVALID_PRODUCT` | El producto no existe | Verificar que el `productId` sea correcto |
| 400 | `INVALID_WAREHOUSE` | El almacén no existe | Verificar que el `warehouseId` sea válido |
| 400 | `INSUFFICIENT_STOCK` | No hay stock suficiente | Reducir la cantidad o verificar inventario |
| 400 | `INVALID_TYPE` | Tipo de transacción inválido | Usar: `inbound`, `outbound`, `adjustment` o `transfer` |
| 400 | `INVALID_REASON` | Razón no permitida | Usar una de las razones enumeradas |
| 401 | `UNAUTHORIZED` | Token inválido o expirado | Renovar token de autenticación |
| 403 | `FORBIDDEN` | Sin permisos suficientes | Verificar rol de usuario |

---

## 🔗 Endpoints Relacionados

### Consultar Transacciones
```
GET /api/v1/inventory/transactions
```
Obtiene un listado de transacciones con filtros y paginación.

### Obtener Transacción por ID
```
GET /api/v1/inventory/transactions/:id
```
Obtiene los detalles de una transacción específica.

### Transferencia entre Almacenes (Simplificado)
```
POST /api/v1/inventory/transfer
```
Endpoint especializado que crea automáticamente ambas transacciones (salida y entrada).

### Ajuste de Stock
```
POST /api/v1/inventory/adjust
```
Endpoint especializado para ajustar el stock a un valor específico.

### Transacciones Masivas
```
POST /api/v1/inventory/bulk/inbound
POST /api/v1/inventory/bulk/outbound
```
Crear múltiples transacciones en una sola operación.

---

## 💡 Mejores Prácticas

### 1. Siempre incluir `reference`
- Facilita la trazabilidad y auditoría
- Vincula la transacción con documentos externos (facturas, órdenes, etc.)

### 2. Usar `location` para mejor control
- Especifica la ubicación física exacta
- Útil para inventarios grandes con múltiples ubicaciones

### 3. Aprovechar `metadata`
- Almacena información adicional estructurada
- No sobrecargues el campo `notes` con datos estructurados

### 4. Ser descriptivo en `notes`
- Explica el contexto de la transacción
- Útil para auditorías futuras

### 5. Registrar costos en compras
- Siempre incluye `unitCost` en transacciones tipo `inbound` con `reason: purchase`
- Permite cálculos de valorización de inventario

### 6. Usar las razones correctas
- Selecciona la razón más específica posible
- Evita usar `other` a menos que sea necesario

### 7. Documentar transferencias
- Usa la misma `reference` en ambas transacciones (salida y entrada)
- Facilita el seguimiento del movimiento completo

---

## 📈 Casos de Uso Avanzados

### Integración con Sistema de Ventas
```javascript
// Cuando se confirma una venta, crear automáticamente la transacción
const sale = await createSale(saleData);

for (const item of sale.items) {
  await createTransaction({
    productId: item.productId,
    warehouseId: sale.warehouseId,
    type: "outbound",
    reason: "sale",
    quantity: item.quantity,
    reference: sale.invoiceNumber,
    notes: `Venta #${sale.id} - Cliente: ${sale.customer.name}`,
    metadata: {
      saleId: sale.id,
      customerId: sale.customerId,
      unitPrice: item.unitPrice
    }
  });
}
```

### Reconciliación de Inventario
```javascript
// Ajustar inventario después de un conteo físico
const physicalCount = 95;
const systemCount = await getCurrentStock(productId, warehouseId);
const difference = physicalCount - systemCount;

if (difference !== 0) {
  await createTransaction({
    productId: productId,
    warehouseId: warehouseId,
    type: "adjustment",
    reason: "correction",
    quantity: Math.abs(difference),
    notes: `Ajuste por conteo físico. Sistema: ${systemCount}, Físico: ${physicalCount}`,
    metadata: {
      countDate: new Date(),
      countedBy: "supervisor-1",
      systemStock: systemCount,
      physicalStock: physicalCount
    }
  });
}
```

---

## ❓ Preguntas Frecuentes

**¿Puedo crear una transacción sin especificar almacén?**
Sí, el campo `warehouseId` es opcional. Sin embargo, se recomienda especificarlo siempre para mejor control.

**¿Cómo registro una devolución de cliente?**
Usa `type: "inbound"` con `reason: "return"` y referencia a la venta original.

**¿Qué pasa si intento sacar más stock del disponible?**
El sistema rechazará la transacción con error `INSUFFICIENT_STOCK`.

**¿Puedo editar o eliminar una transacción?**
No. Las transacciones son inmutables para mantener la integridad del historial. Si hay un error, crea una transacción de ajuste.

**¿Cómo manejo productos con lotes o fechas de vencimiento?**
Usa el campo `metadata` para almacenar información de lote, fecha de vencimiento, etc.

**¿Las transacciones afectan inmediatamente el stock?**
Sí, el stock se actualiza automáticamente en tiempo real al crear la transacción.

**¿Puedo usar decimales en las cantidades?**
Sí, para productos que se venden por peso o medidas fraccionables.

---

## 📞 Soporte

Para dudas o problemas con el sistema de transacciones de inventario, contactar al equipo de desarrollo.

**Documentación relacionada:**
- [Sistema de Productos](PRODUCTS.md)
- [Sistema de Almacenes](WAREHOUSES.md)
- [Audit Logs](DOCUMENTACION_AUDIT_LOGS.md)
- [Reportes de Inventario](INVENTORY_REPORTS.md)

---

**Última actualización:** 30 de Noviembre, 2025
**Versión:** 1.0.0
