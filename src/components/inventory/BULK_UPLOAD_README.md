# 📦 Sistema de Carga Masiva - Documentación

## 🎯 Funcionalidad Implementada

Se ha implementado un sistema de carga masiva con selector que permite al usuario elegir entre:
- **Productos**: Carga masiva de productos (códigos, nombres, precios, categorías)
- **Inventario**: Carga masiva de transacciones de inventario (entradas, salidas, ajustes)

## 🔄 Flujo de Interacción

```
┌─────────────────────────────────┐
│   Página de Inventario          │
│                                 │
│  [Botón: Carga masiva] ──────┐ │
└─────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────┐
│        BulkUploadSelector (Nuevo)               │
│                                                  │
│  ┌────────────────┐    ┌────────────────┐      │
│  │   Productos    │    │   Inventario   │      │
│  │   [Icono]      │    │   [Icono]      │      │
│  │   Descripción  │    │   Descripción  │      │
│  └────────────────┘    └────────────────┘      │
└──────────────────────────────────────────────────┘
           │                        │
           ▼                        ▼
┌─────────────────────┐  ┌──────────────────────────┐
│ BulkUploadDialog    │  │ BulkInventoryUploadDialog│
│ (Productos)         │  │ (Inventario)             │
└─────────────────────┘  └──────────────────────────┘
```

## 📁 Archivos Modificados/Creados

### ✨ Nuevos Componentes

1. **`BulkUploadSelector.jsx`**
   - Diálogo de selección con dos opciones
   - Animaciones hover para mejor UX
   - Diseño visual con cards interactivas

2. **`BulkInventoryUploadDialog.jsx`**
   - Componente específico para carga de inventario
   - 3 pasos: Seleccionar → Vista previa → Confirmar
   - Validaciones y manejo de errores

### 🔧 Archivos Modificados

3. **`InventoryPage.jsx`**
   - Integración del selector
   - Gestión de 3 estados de diálogo
   - Flujo de interacción mejorado

4. **`inventory.service.js`**
   - Métodos bulk: upload, preview, validate, downloadTemplate

5. **`api.config.js`**
   - Endpoints de bulk inventory

## 🎨 Características del Selector

### Diseño Visual
- ✅ Cards interactivas con hover effect
- ✅ Iconos distintivos para cada opción
- ✅ Colores diferenciados (azul para productos, verde para inventario)
- ✅ Animaciones suaves de transición
- ✅ Responsive design

### Experiencia de Usuario
- ✅ Descripción clara de cada opción
- ✅ Feedback visual al pasar el mouse
- ✅ Navegación intuitiva
- ✅ Cancelación fácil

## 🔌 Integración en Otras Páginas

Para usar el selector en otra página:

```jsx
import { useState } from 'react';
import BulkUploadSelector from '../components/inventory/BulkUploadSelector';
import BulkUploadDialog from '../components/inventory/BulkUploadDialog';
import BulkInventoryUploadDialog from '../components/inventory/BulkInventoryUploadDialog';

function MiPagina() {
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [productUploadOpen, setProductUploadOpen] = useState(false);
  const [inventoryUploadOpen, setInventoryUploadOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setSelectorOpen(true)}>
        Carga Masiva
      </Button>

      <BulkUploadSelector
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        onSelectProduct={() => setProductUploadOpen(true)}
        onSelectInventory={() => setInventoryUploadOpen(true)}
      />

      <BulkUploadDialog
        open={productUploadOpen}
        onClose={() => setProductUploadOpen(false)}
        onSuccess={handleSuccess}
      />

      <BulkInventoryUploadDialog
        open={inventoryUploadOpen}
        onClose={() => setInventoryUploadOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}
```

## 📊 Datos Esperados

### Productos Excel Template
| Código | Nombre | Descripción | Categoría | Precio | Costo | Stock Mínimo | Unidad |
|-----|--------|-------------|-----------|--------|-------|--------------|--------|
| PROD-001 | Laptop Dell | ... | Electronics | 1299.99 | 999.99 | 5 | piece |

### Inventario Excel Template
| Código Producto | Código Almacén | Tipo | Motivo | Cantidad | Costo Unitario | Referencia | Ubicación | Notas |
|--------------|----------------|------|--------|----------|----------------|------------|-----------|-------|
| PROD-001 | WH-001 | inbound | purchase | 10 | 999.99 | PO-12345 | A-12 | ... |

## 🎯 Ventajas de esta Implementación

1. **Separación de Responsabilidades**: Cada diálogo maneja un tipo de carga
2. **Escalabilidad**: Fácil añadir más tipos de carga en el futuro
3. **UX Mejorada**: El usuario ve claramente qué está cargando
4. **Código Limpio**: Componentes reutilizables y bien organizados
5. **Mantenibilidad**: Cada componente es independiente

## 🚀 Próximas Mejoras Sugeridas

- [ ] Añadir drag & drop en el selector
- [ ] Historial de cargas masivas
- [ ] Programar cargas automáticas
- [ ] Validación en tiempo real del Excel
- [ ] Soporte para CSV además de Excel
