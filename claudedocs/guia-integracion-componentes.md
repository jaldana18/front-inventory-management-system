# Guía de Integración - Componentes de Inventario Multi-Almacén

**Fecha:** 2025-11-17
**Estado:** ✅ Completado - Opción A (Carga Masiva y Transferencias)

---

## 🎉 Componentes Completados

### 1. **InboundTransactionForm** - Entrada Individual
**Ruta:** `src/components/inventory/InboundTransactionForm.jsx`

**Características:**
- ✅ Formulario de entrada de inventario
- ✅ Validación de acceso por rol
- ✅ Auto-selección de almacén para usuarios
- ✅ Soporte para: PURCHASE, RETURN, FOUND, INITIAL_STOCK
- ✅ Campos opcionales: costo unitario, referencia, ubicación, notas

**Uso:**
```jsx
import InboundTransactionForm from './components/inventory/InboundTransactionForm';

function InventoryPage() {
  const [openInbound, setOpenInbound] = useState(false);

  const handleSuccess = () => {
    // Recargar datos o actualizar lista
    console.log('Entrada registrada');
  };

  return (
    <>
      <Button onClick={() => setOpenInbound(true)}>
        Nueva Entrada
      </Button>

      <InboundTransactionForm
        open={openInbound}
        onClose={() => setOpenInbound(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}
```

---

### 2. **OutboundTransactionForm** - Salida Individual
**Ruta:** `src/components/inventory/OutboundTransactionForm.jsx`

**Características:**
- ✅ Formulario de salida de inventario
- ✅ Verificación de stock en tiempo real
- ✅ Alertas de stock insuficiente
- ✅ Validación de cantidad vs disponible
- ✅ Soporte para: SALE, DAMAGED, LOST

**Uso:**
```jsx
import OutboundTransactionForm from './components/inventory/OutboundTransactionForm';

function InventoryPage() {
  const [openOutbound, setOpenOutbound] = useState(false);

  return (
    <>
      <Button color="error" onClick={() => setOpenOutbound(true)}>
        Nueva Salida
      </Button>

      <OutboundTransactionForm
        open={openOutbound}
        onClose={() => setOpenOutbound(false)}
        onSuccess={() => console.log('Salida registrada')}
      />
    </>
  );
}
```

---

### 3. **BulkTransactionForm** - Carga Masiva
**Ruta:** `src/components/inventory/BulkTransactionForm.jsx`

**Características:**
- ✅ Tabla editable de productos
- ✅ Validación de stock para salidas masivas
- ✅ Agregar/eliminar productos dinámicamente
- ✅ Chips de estado de stock (OUTBOUND)
- ✅ Preview de cantidad total
- ✅ Soporte para entrada y salida

**Uso:**
```jsx
import BulkTransactionForm from './components/inventory/BulkTransactionForm';

function InventoryPage() {
  const [openBulk, setOpenBulk] = useState(false);
  const [bulkType, setBulkType] = useState('INBOUND'); // 'INBOUND' or 'OUTBOUND'

  const handleOpenBulkInbound = () => {
    setBulkType('INBOUND');
    setOpenBulk(true);
  };

  const handleOpenBulkOutbound = () => {
    setBulkType('OUTBOUND');
    setOpenBulk(true);
  };

  return (
    <>
      <Button onClick={handleOpenBulkInbound}>
        Carga Masiva - Entrada
      </Button>
      <Button color="error" onClick={handleOpenBulkOutbound}>
        Carga Masiva - Salida
      </Button>

      <BulkTransactionForm
        open={openBulk}
        onClose={() => setOpenBulk(false)}
        onSuccess={() => console.log('Carga masiva completada')}
        type={bulkType} // 'INBOUND' o 'OUTBOUND'
      />
    </>
  );
}
```

---

### 4. **TransferForm** - Transferencias entre Almacenes
**Ruta:** `src/components/inventory/TransferForm.jsx`

**Características:**
- ✅ Solo para admin y manager
- ✅ Validación de roles con mensaje de acceso denegado
- ✅ Selección de almacén origen/destino
- ✅ Verificación de stock en origen
- ✅ Preview de stock proyectado post-transferencia
- ✅ Prevención de transferencia al mismo almacén

**Uso:**
```jsx
import TransferForm from './components/inventory/TransferForm';
import { useAuth } from './context/useAuth';
import { canTransferBetweenWarehouses } from './utils/warehouse.utils';

function InventoryPage() {
  const { userRole } = useAuth();
  const [openTransfer, setOpenTransfer] = useState(false);

  const canTransfer = canTransferBetweenWarehouses(userRole);

  return (
    <>
      {canTransfer && (
        <Button color="warning" onClick={() => setOpenTransfer(true)}>
          Transferencia
        </Button>
      )}

      <TransferForm
        open={openTransfer}
        onClose={() => setOpenTransfer(false)}
        onSuccess={() => console.log('Transferencia completada')}
      />
    </>
  );
}
```

---

### 5. **StockAdjustmentForm** - Ajuste de Stock
**Ruta:** `src/components/inventory/StockAdjustmentForm.jsx`

**Características:**
- ✅ Mostrar stock actual del sistema
- ✅ Input para stock físico contado
- ✅ Cálculo automático de diferencia
- ✅ Indicadores visuales de entrada/salida
- ✅ Preview de stock proyectado
- ✅ Notas obligatorias para explicar el ajuste

**Uso:**
```jsx
import StockAdjustmentForm from './components/inventory/StockAdjustmentForm';

function InventoryPage() {
  const [openAdjustment, setOpenAdjustment] = useState(false);

  return (
    <>
      <Button onClick={() => setOpenAdjustment(true)}>
        Ajuste de Stock
      </Button>

      <StockAdjustmentForm
        open={openAdjustment}
        onClose={() => setOpenAdjustment(false)}
        onSuccess={() => console.log('Ajuste registrado')}
      />
    </>
  );
}
```

---

## 🎨 Ejemplo de Integración Completa

### InventoryPage.jsx - Página Principal de Inventario

```jsx
import { useState } from 'react';
import { Box, Button, ButtonGroup, Paper, Typography } from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  SwapHoriz as TransferIcon,
  Edit as AdjustIcon,
  Upload as BulkIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/useAuth';
import { canTransferBetweenWarehouses } from '../utils/warehouse.utils';

// Importar componentes
import InboundTransactionForm from '../components/inventory/InboundTransactionForm';
import OutboundTransactionForm from '../components/inventory/OutboundTransactionForm';
import BulkTransactionForm from '../components/inventory/BulkTransactionForm';
import TransferForm from '../components/inventory/TransferForm';
import StockAdjustmentForm from '../components/inventory/StockAdjustmentForm';

export default function InventoryPage() {
  const { userRole } = useAuth();

  // Estados para controlar diálogos
  const [openInbound, setOpenInbound] = useState(false);
  const [openOutbound, setOpenOutbound] = useState(false);
  const [openBulk, setOpenBulk] = useState(false);
  const [bulkType, setBulkType] = useState('INBOUND');
  const [openTransfer, setOpenTransfer] = useState(false);
  const [openAdjustment, setOpenAdjustment] = useState(false);

  const canTransfer = canTransferBetweenWarehouses(userRole);

  const handleRefresh = () => {
    // Recargar datos de inventario
    console.log('Refrescando datos...');
  };

  const handleOpenBulk = (type) => {
    setBulkType(type);
    setOpenBulk(true);
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Operaciones de Inventario
        </Typography>

        <Box display="flex" gap={2} flexWrap="wrap">
          {/* Operaciones Individuales */}
          <ButtonGroup variant="contained">
            <Button
              startIcon={<AddIcon />}
              color="success"
              onClick={() => setOpenInbound(true)}
            >
              Nueva Entrada
            </Button>
            <Button
              startIcon={<RemoveIcon />}
              color="error"
              onClick={() => setOpenOutbound(true)}
            >
              Nueva Salida
            </Button>
          </ButtonGroup>

          {/* Operaciones Masivas */}
          <ButtonGroup variant="outlined">
            <Button
              startIcon={<BulkIcon />}
              onClick={() => handleOpenBulk('INBOUND')}
            >
              Carga Masiva Entrada
            </Button>
            <Button
              startIcon={<BulkIcon />}
              color="error"
              onClick={() => handleOpenBulk('OUTBOUND')}
            >
              Carga Masiva Salida
            </Button>
          </ButtonGroup>

          {/* Transferencias (solo admin/manager) */}
          {canTransfer && (
            <Button
              variant="contained"
              color="warning"
              startIcon={<TransferIcon />}
              onClick={() => setOpenTransfer(true)}
            >
              Transferencia
            </Button>
          )}

          {/* Ajuste de Stock */}
          <Button
            variant="outlined"
            color="info"
            startIcon={<AdjustIcon />}
            onClick={() => setOpenAdjustment(true)}
          >
            Ajuste de Stock
          </Button>
        </Box>
      </Paper>

      {/* Aquí iría la tabla de inventario, filtros, etc. */}

      {/* Diálogos */}
      <InboundTransactionForm
        open={openInbound}
        onClose={() => setOpenInbound(false)}
        onSuccess={handleRefresh}
      />

      <OutboundTransactionForm
        open={openOutbound}
        onClose={() => setOpenOutbound(false)}
        onSuccess={handleRefresh}
      />

      <BulkTransactionForm
        open={openBulk}
        onClose={() => setOpenBulk(false)}
        onSuccess={handleRefresh}
        type={bulkType}
      />

      <TransferForm
        open={openTransfer}
        onClose={() => setOpenTransfer(false)}
        onSuccess={handleRefresh}
      />

      <StockAdjustmentForm
        open={openAdjustment}
        onClose={() => setOpenAdjustment(false)}
        onSuccess={handleRefresh}
      />
    </Box>
  );
}
```

---

## 🔐 Validaciones Implementadas

### Control de Acceso por Rol

| Componente | Admin | Manager | User |
|------------|-------|---------|------|
| InboundTransactionForm | ✅ Todos los almacenes | ✅ Todos los almacenes | ⚠️ Solo su almacén |
| OutboundTransactionForm | ✅ Todos los almacenes | ✅ Todos los almacenes | ⚠️ Solo su almacén |
| BulkTransactionForm | ✅ Todos los almacenes | ✅ Todos los almacenes | ⚠️ Solo su almacén |
| TransferForm | ✅ Cualquier transferencia | ✅ Cualquier transferencia | ❌ **Bloqueado** |
| StockAdjustmentForm | ✅ Todos los almacenes | ✅ Todos los almacenes | ⚠️ Solo su almacén |

### Validaciones de Stock

| Componente | Validación de Stock |
|------------|-------------------|
| InboundTransactionForm | ❌ No requiere (entrada) |
| OutboundTransactionForm | ✅ Verifica stock en tiempo real |
| BulkTransactionForm (OUTBOUND) | ✅ Valida stock de cada producto |
| TransferForm | ✅ Valida stock en almacén origen |
| StockAdjustmentForm | ✅ Muestra stock actual para comparación |

---

## 🚀 Próximos Pasos

### Componentes Pendientes:
1. ⏳ **ProductStockView** - Vista de stock multi-almacén por producto
2. ⏳ **WarehouseDetailView** - Vista detallada de un almacén
3. ⏳ **WarehousesDashboard** - Dashboard administrativo

### Integración:
1. ⏳ Actualizar rutas en `App.jsx`
2. ⏳ Actualizar navegación en `MainLayout.jsx`
3. ⏳ Crear menú de operaciones de inventario

---

## 📚 Dependencias Requeridas

Todas las dependencias ya están instaladas en `package.json`:
- ✅ `@mui/material` - UI Components
- ✅ `@mui/icons-material` - Icons
- ✅ `react-hook-form` - Form management
- ✅ `react-hot-toast` - Notifications
- ✅ `axios` - HTTP client

---

## 🧪 Testing Sugerido

### Test Cases por Componente:

**InboundTransactionForm:**
- [ ] Usuario puede crear entrada en su almacén
- [ ] Admin puede crear entrada en cualquier almacén
- [ ] Validación de campos requeridos
- [ ] Success toast al guardar

**OutboundTransactionForm:**
- [ ] Muestra stock disponible correctamente
- [ ] Bloquea salida si stock insuficiente
- [ ] Usuario solo ve su almacén
- [ ] Error toast si stock insuficiente

**BulkTransactionForm:**
- [ ] Agregar/eliminar filas funciona
- [ ] Validación de stock para outbound
- [ ] Chips de stock se actualizan
- [ ] Success toast con cantidad procesada

**TransferForm:**
- [ ] Usuario normal ve mensaje de acceso denegado
- [ ] Admin/Manager pueden transferir
- [ ] No permite transferir al mismo almacén
- [ ] Muestra stock proyectado

**StockAdjustmentForm:**
- [ ] Calcula diferencia correctamente
- [ ] Muestra iconos según tipo de ajuste
- [ ] Bloquea si no hay cambios
- [ ] Notas son requeridas

---

## 💡 Notas de Implementación

### Auto-selección de Almacén
Los usuarios con rol `user` tienen el selector de almacén deshabilitado y pre-seleccionado con su almacén asignado.

### Validación de Stock en Tiempo Real
- **OutboundTransactionForm**: Verifica stock al seleccionar producto/almacén
- **BulkTransactionForm (OUTBOUND)**: Valida cada fila al cambiar producto/cantidad
- **TransferForm**: Verifica stock en ambos almacenes

### Manejo de Errores
Todos los componentes manejan códigos de error específicos del backend:
- `WAREHOUSE_ACCESS_DENIED`
- `INSUFFICIENT_STOCK`
- `PRODUCT_NOT_FOUND`
- `WAREHOUSE_NOT_FOUND`

---

## 📞 Soporte

Para preguntas o problemas con la integración, consultar:
- Documentación Backend: `backend/docs/FRONTEND_INTEGRATION_GUIDE.md`
- Estado de Implementación: `docsIntegration/implementacion-multi-almacen-status.md`
