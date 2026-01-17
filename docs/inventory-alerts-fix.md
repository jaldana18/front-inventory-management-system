# Corrección de Alertas de Inventario

## Problema Identificado

Las alertas de inventario (stock bajo, sin stock, etc.) aparecían en 0 pese a tener datos, y se estaba llamando a un endpoint inexistente.

### Problemas encontrados:

1. **Endpoint inexistente**: El frontend llamaba a `/inventory/summary` que NO existe en el backend
2. **Método vacío**: `getLowStockAlerts()` en `analytics.service.ts` devuelve un array vacío
3. **Cálculo incorrecto**: Las estadísticas no se calculaban correctamente en el frontend

## Soluciones Implementadas

### 1. Corrección del Endpoint (Frontend)

**Archivo**: `src/config/api.config.js`

**Cambio realizado**:
```javascript
// ANTES (línea 64)
summary: '/inventory/summary',  // ❌ Endpoint inexistente

// DESPUÉS
summary: '/analytics/inventory/status',  // ✅ Endpoint correcto
```

### 2. Mejora del Cálculo de Estadísticas (Frontend)

**Archivo**: `src/pages/InventoryPage.jsx`

**Cambio realizado**: Se mejoró el cálculo de estadísticas con fallback a cálculo del lado del cliente:

```javascript
const stats = useMemo(() => {
  // Intenta usar datos del backend si están disponibles
  if (summaryData?.data?.summary) {
    return {
      totalItems: summaryData.data.summary.totalProducts || 0,
      lowStockItems: summaryData.data.summary.lowStockCount || 0,
      outOfStock: summaryData.data.summary.criticalStockCount || 0,
      totalValue: summaryData.data.summary.totalValue || 0,
      categories: categories.length,
    };
  }

  // Fallback: Calcula del lado del cliente
  if (!inventoryData || inventoryData.length === 0) return null;

  const totalItems = inventoryData.length;

  // Calcula productos con stock bajo (stock <= minimumStock)
  const lowStockItems = inventoryData.filter((item) => {
    const totalStock = item.totalStock || 0;
    const minStock = item.minimumStock || 0;
    return totalStock > 0 && totalStock <= minStock;
  }).length;

  // Calcula productos sin stock (stock = 0)
  const outOfStock = inventoryData.filter((item) => {
    const totalStock = item.totalStock || 0;
    return totalStock === 0;
  }).length;

  // Calcula valor total del inventario
  const totalValue = inventoryData.reduce((sum, item) => {
    const stock = item.totalStock || 0;
    const price = item.price || 0;
    return sum + (stock * price);
  }, 0);

  return {
    totalItems,
    lowStockItems,
    outOfStock,
    totalValue,
    categories: categories.length,
  };
}, [inventoryData, summaryData, categories]);
```

## Pendiente por Implementar (Backend)

### Implementar el método `getLowStockAlerts` en `analytics.service.ts`

**Archivo**: `backend/src/services/analytics.service.ts` (línea 336-339)

**Código actual**:
```typescript
private async getLowStockAlerts(companyId: number): Promise<LowStockAlertDto[]> {
  // TODO: implementar cálculo de stock actual y comparar con minimumStock
  return [];
}
```

**Implementación sugerida**:
```typescript
private async getLowStockAlerts(companyId: number): Promise<LowStockAlertDto[]> {
  // Obtener todos los productos de la compañía
  const products = await this.productRepo.find({
    where: { companyId, isActive: true },
    relations: ['stock'],
  });

  const alerts: LowStockAlertDto[] = [];

  for (const product of products) {
    // Calcular stock total sumando el stock de todos los almacenes
    const totalStock = product.stock?.reduce((sum, s) => sum + (s.currentStock || 0), 0) || 0;
    const minStock = product.minimumStock || 0;

    // Determinar el estado del stock
    let status: 'low' | 'critical' | 'ok';
    if (totalStock === 0) {
      status = 'critical'; // Sin stock
    } else if (totalStock <= minStock) {
      status = 'low'; // Stock bajo
    } else {
      continue; // No incluir productos con stock normal
    }

    alerts.push({
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      currentStock: totalStock,
      minimumStock: minStock,
      status,
      categoryName: product.category?.name,
    });
  }

  return alerts;
}
```

### Implementar el cálculo de valores en `getInventoryStatus`

**Archivo**: `backend/src/services/analytics.service.ts` (línea 306-319)

**Código actual**:
```typescript
async getInventoryStatus(companyId: number): Promise<InventoryStatusResponseDto> {
  const lowStockAlerts = await this.getLowStockAlerts(companyId);

  return {
    summary: {
      totalProducts: 0, // TODO: contar productos totales
      totalValue: 0, // TODO: calcular valor total
      lowStockCount: lowStockAlerts.filter(a => a.status === 'low').length,
      criticalStockCount: lowStockAlerts.filter(a => a.status === 'critical').length,
      overstockCount: 0, // TODO: detectar overstock
    },
    products: lowStockAlerts,
  };
}
```

**Implementación sugerida**:
```typescript
async getInventoryStatus(companyId: number): Promise<InventoryStatusResponseDto> {
  const lowStockAlerts = await this.getLowStockAlerts(companyId);

  // Obtener todos los productos activos
  const products = await this.productRepo.find({
    where: { companyId, isActive: true },
    relations: ['stock'],
  });

  // Calcular total de productos
  const totalProducts = products.length;

  // Calcular valor total del inventario
  const totalValue = products.reduce((sum, product) => {
    const totalStock = product.stock?.reduce((s, stock) => s + (stock.currentStock || 0), 0) || 0;
    const price = product.price || 0;
    return sum + (totalStock * price);
  }, 0);

  // Contar productos con overstock (opcional)
  const overstockCount = products.filter(p => {
    const totalStock = p.stock?.reduce((s, stock) => s + (stock.currentStock || 0), 0) || 0;
    const maxStock = p.maximumStock || Infinity;
    return totalStock > maxStock;
  }).length;

  return {
    summary: {
      totalProducts,
      totalValue,
      lowStockCount: lowStockAlerts.filter(a => a.status === 'low').length,
      criticalStockCount: lowStockAlerts.filter(a => a.status === 'critical').length,
      overstockCount,
    },
    products: lowStockAlerts,
  };
}
```

## Resultado Esperado

Una vez implementados los cambios en el backend:

1. ✅ El frontend mostrará las alertas correctamente
2. ✅ Los contadores de "Stock Bajo" y "Sin Stock" tendrán valores reales
3. ✅ El valor total del inventario se calculará correctamente
4. ✅ El endpoint `/analytics/inventory/status` devolverá datos completos

## Estado Actual

- ✅ **Frontend**: Correcciones aplicadas, funcionando con cálculo del lado del cliente
- ⏳ **Backend**: Pendiente implementar `getLowStockAlerts` y completar `getInventoryStatus`

## Notas Adicionales

- El cálculo del lado del cliente en el frontend funciona como solución temporal
- Se recomienda implementar la lógica en el backend para mejorar el rendimiento
- El endpoint correcto ya está configurado en `api.config.js`
