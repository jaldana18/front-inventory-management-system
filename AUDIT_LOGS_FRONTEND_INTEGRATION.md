# Integración Frontend - Sistema de Auditoría de Operaciones

## 📋 Índice
1. [Visión General](#visión-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Endpoints Disponibles](#endpoints-disponibles)
4. [Pantalla de Auditoría](#pantalla-de-auditoría)
5. [Sistema de Filtros](#sistema-de-filtros)
6. [Componentes React](#componentes-react)
7. [Servicios y Hooks](#servicios-y-hooks)
8. [Tipos TypeScript](#tipos-typescript)
9. [Ejemplos de Implementación](#ejemplos-de-implementación)
10. [Casos de Uso](#casos-de-uso)

---

## Visión General

El sistema de auditoría permite **visualizar todas las operaciones realizadas por los usuarios** en el sistema de inventario, incluyendo:

- ✅ **Ventas:** Creación, confirmación, cancelación, notas de crédito
- ✅ **Inventario:** Entradas, salidas, transferencias, carga masiva
- ✅ **Productos:** Creación, actualización, eliminación
- ✅ **Pagos:** Registro, reembolsos, cancelaciones
- ✅ **Usuarios:** Creación, actualización, eliminación
- ✅ **Autenticación:** Login, logout, renovación de tokens

### Características Principales
- 📊 **45+ tipos de operaciones** registradas
- 🔍 **Filtros avanzados** por fecha, usuario, tipo, operación
- 📈 **Estadísticas en tiempo real**
- 📥 **Exportación a CSV**
- 🔒 **Control de acceso por rol**
- 💾 **Detalles completos** de cada operación

---

## Arquitectura del Sistema

### Flujo de Datos

```
Usuario → Acción → Backend → Winston Logger → Archivo .log
                                                    ↓
Frontend → API Request → AuditLogService → Lee archivos .log → Filtra/Pagina → Respuesta JSON
```

### Operaciones Disponibles (45 total)

#### 🛒 Ventas (11 operaciones)
```typescript
type SaleOperations =
  | 'sale_created'              // Venta creada
  | 'sale_updated'              // Venta actualizada
  | 'sale_deleted'              // Venta eliminada
  | 'sale_confirmed'            // Venta confirmada (afecta inventario)
  | 'sale_cancelled'            // Venta cancelada
  | 'quote_converted_to_invoice' // Cotización → Factura
  | 'quote_converted_to_proforma' // Cotización → Proforma
  | 'credit_note_created'       // Nota crédito creada
  | 'remission_created'         // Remisión creada
  | 'sale_dispatched'           // Venta despachada
  | 'sale_delivered';           // Venta entregada
```

#### 📦 Inventario (6 operaciones)
```typescript
type InventoryOperations =
  | 'inventory_transaction_created' // Transacción de inventario
  | 'bulk_inbound_created'         // Carga masiva entrada
  | 'bulk_outbound_created'        // Carga masiva salida
  | 'warehouse_transfer'           // Transferencia entre almacenes
  | 'bulk_inventory_upload'        // Carga masiva desde Excel
  | 'product_auto_created';        // Producto creado automáticamente
```

#### 💳 Pagos (3 operaciones)
```typescript
type PaymentOperations =
  | 'payment_created'    // Pago registrado
  | 'payment_refunded'   // Pago reembolsado
  | 'payment_cancelled'; // Pago cancelado
```

#### 📦 Productos (4 operaciones)
```typescript
type ProductOperations =
  | 'product_created'              // Producto creado
  | 'product_updated'              // Producto actualizado
  | 'product_deleted'              // Producto desactivado
  | 'product_permanently_deleted'; // Producto eliminado
```

#### 👥 Usuarios (3 operaciones)
```typescript
type UserOperations =
  | 'user_created'   // Usuario creado
  | 'user_updated'   // Usuario actualizado
  | 'user_deleted';  // Usuario eliminado
```

#### 🏢 Otras Operaciones
- **Clientes:** 4 operaciones (created, updated, activated, deactivated)
- **Empresas:** 3 operaciones (created, updated, deleted)
- **Almacenes:** 3 operaciones (created, updated, deleted)
- **Categorías:** 3 operaciones (created, updated, deleted)
- **Métodos de Pago:** 3 operaciones (created, updated, deactivated)
- **Autenticación:** 5 operaciones (login_success, login_failed, etc.)

---

## Endpoints Disponibles

### 1. GET `/api/audit-logs` - Obtener Logs con Filtros

**Autenticación:** Bearer Token (todos los roles)

**Query Parameters:**
```typescript
interface AuditLogQueryParams {
  // Filtros de tiempo
  startDate?: string;      // ISO 8601: "2025-11-01T00:00:00Z"
  endDate?: string;        // ISO 8601: "2025-11-26T23:59:59Z"

  // Filtros de nivel y tipo
  level?: LogLevel[];      // ["error", "warn", "info", "http", "debug"]
  type?: LogType[];        // ["business_operation", "authentication", ...]
  operation?: string[];    // ["sale_created", "bulk_inventory_upload", ...]

  // Filtros de contexto
  userId?: number;         // ID del usuario
  companyId?: number;      // ID de la empresa (solo admin)

  // Búsqueda
  search?: string;         // Búsqueda en mensaje y detalles

  // Paginación
  page?: number;           // Página actual (default: 1)
  limit?: number;          // Registros por página (default: 50, max: 500)

  // Ordenamiento
  sortOrder?: 'asc' | 'desc';  // default: 'desc'
}
```

**Respuesta:**
```typescript
interface AuditLogsResponse {
  success: boolean;
  data: {
    logs: AuditLogEntry[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    filters: AppliedFilters;
  };
}
```

**Ejemplo de Request:**
```bash
GET /api/v1/audit-logs?operation[]=sale_created&operation[]=sale_confirmed&startDate=2025-11-01T00:00:00Z&page=1&limit=50
```

**Ejemplo de Respuesta:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "1732659347000-abc123",
        "level": "info",
        "message": "Business operation logged",
        "timestamp": "2025-11-26T19:55:47.000Z",
        "service": "inventory-api",
        "environment": "development",
        "type": "business_operation",
        "operation": "sale_created",
        "userId": 5,
        "companyId": 1,
        "details": {
          "saleId": 123,
          "saleNumber": "FAC-2025-001",
          "saleType": "invoice",
          "total": 1500.50,
          "customerId": 45,
          "warehouseId": 2
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 1250,
      "totalPages": 25
    },
    "filters": {
      "operation": ["sale_created", "sale_confirmed"],
      "startDate": "2025-11-01T00:00:00.000Z"
    }
  }
}
```

---

### 2. GET `/api/audit-logs/stats` - Obtener Estadísticas

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "totalLogs": 15420,
    "byLevel": {
      "error": 45,
      "warn": 120,
      "info": 14500,
      "http": 650,
      "debug": 105
    },
    "byType": {
      "business_operation": 12000,
      "authentication": 1500,
      "http_request": 1800,
      "application_error": 120
    },
    "byOperation": {
      "sale_created": 3500,
      "inventory_transaction_created": 4200,
      "bulk_inventory_upload": 25,
      "product_created": 850
    },
    "lastHour": 45,
    "last24Hours": 1250,
    "last7Days": 8500
  }
}
```

---

### 3. GET `/api/audit-logs/export` - Exportar a CSV

**Query Parameters:** Mismos que `/api/audit-logs`

**Respuesta:** Archivo CSV descargable

---

### 4. GET `/api/audit-logs/operations` - Lista de Operaciones

**Respuesta:**
```json
{
  "success": true,
  "data": [
    "bulk_inventory_upload",
    "category_created",
    "payment_created",
    "product_auto_created",
    "sale_created",
    "sale_confirmed",
    "warehouse_transfer"
  ]
}
```

---

### 5. GET `/api/audit-logs/types` - Lista de Tipos de Log

**Respuesta:**
```json
{
  "success": true,
  "data": [
    "business_operation",
    "authentication",
    "http_request",
    "security_event",
    "application_error"
  ]
}
```

---

## Pantalla de Auditoría

### Diseño UI/UX Recomendado

```
┌─────────────────────────────────────────────────────────────────────────┐
│  📊 Auditoría de Operaciones                    [Exportar CSV]  [⚙️]   │
├─────────────────────────────────────────────────────────────────────────┤
│  📈 Resumen Rápido                                                      │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐        │
│  │ 📊 Total     │ 🛒 Ventas    │ 📦 Inventario│ 💳 Pagos     │        │
│  │ 15,420 ops   │ 3,500 ops    │ 4,200 ops    │ 850 ops      │        │
│  └──────────────┴──────────────┴──────────────┴──────────────┘        │
├─────────────────────────────────────────────────────────────────────────┤
│  🔍 Filtros Avanzados                                     [Limpiar]     │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ 📅 Fecha: [01/11/2025] - [26/11/2025]   📊 Tipo: [Todas]        │ │
│  │                                                                     │ │
│  │ 🔧 Operación:                                                      │ │
│  │ [×] Ventas                     [×] Inventario                     │ │
│  │   ☑️ Venta creada                ☑️ Carga masiva                   │ │
│  │   ☐ Venta confirmada             ☐ Transferencia                  │ │
│  │   ☐ Nota de crédito              ☐ Transacción                    │ │
│  │                                                                     │ │
│  │ 👤 Usuario: [Buscar usuario...]    🔍 Buscar: [texto...]          │ │
│  │                                                                     │ │
│  │                                              [Aplicar Filtros]     │ │
│  └───────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│  📋 Historial de Operaciones (1,250 registros)                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ Fecha/Hora          Usuario      Operación          Detalles       │ │
│  ├───────────────────────────────────────────────────────────────────┤ │
│  │ 26/11/25 19:55:47  Juan Pérez   🛒 Venta creada    FAC-2025-001  │ │
│  │                                   Total: $1,500.50  Ver más ▶     │ │
│  ├───────────────────────────────────────────────────────────────────┤ │
│  │ 26/11/25 19:50:23  María Gómez  📦 Carga masiva    150 productos │ │
│  │                                   145 exitosos      Ver más ▶     │ │
│  ├───────────────────────────────────────────────────────────────────┤ │
│  │ 26/11/25 19:45:12  Carlos Ruiz  💳 Pago creado     $2,300.00     │ │
│  │                                   Método: Efectivo  Ver más ▶     │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ◀ Anterior    Página 1 de 25    Siguiente ▶                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Modal de Detalles de Operación

```
┌─────────────────────────────────────────────────────────┐
│  📄 Detalles de Operación                        [✕]   │
├─────────────────────────────────────────────────────────┤
│  🛒 Venta Creada                                        │
│                                                         │
│  📅 Fecha/Hora: 26/11/2025 19:55:47                    │
│  👤 Usuario: Juan Pérez (ID: 5)                        │
│  🏢 Empresa: Mi Empresa S.A.                           │
│                                                         │
│  ─────────────────────────────────────────             │
│                                                         │
│  📊 Información de la Venta:                           │
│  • ID Venta: 123                                       │
│  • Número: FAC-2025-001                                │
│  • Tipo: Factura                                       │
│  • Total: $1,500.50                                    │
│  • Cliente: Cliente ABC (ID: 45)                       │
│  • Almacén: Almacén Principal (ID: 2)                  │
│                                                         │
│  ─────────────────────────────────────────             │
│                                                         │
│  🔗 Acciones Relacionadas:                             │
│  → Ver venta completa                                  │
│  → Ver historial del cliente                           │
│  → Ver operaciones del usuario                         │
│                                                         │
│  [Cerrar]                                              │
└─────────────────────────────────────────────────────────┘
```

---

## Sistema de Filtros

### Componente de Filtros Avanzados

```typescript
interface AuditFiltersState {
  // Filtros de fecha
  dateRange: {
    start: Date | null;
    end: Date | null;
  };

  // Filtros de categoría
  selectedCategories: {
    sales: boolean;
    inventory: boolean;
    payments: boolean;
    products: boolean;
    users: boolean;
  };

  // Operaciones específicas por categoría
  selectedOperations: {
    sales: string[];      // ['sale_created', 'sale_confirmed']
    inventory: string[];  // ['bulk_inventory_upload', 'warehouse_transfer']
    payments: string[];   // ['payment_created']
    products: string[];   // ['product_created']
    users: string[];      // ['user_created']
  };

  // Usuario y búsqueda
  userId: number | null;
  searchText: string;
}
```

### Agrupación de Operaciones por Módulo

```typescript
const OPERATIONS_BY_MODULE = {
  sales: {
    label: '🛒 Ventas',
    operations: [
      { value: 'sale_created', label: 'Venta creada' },
      { value: 'sale_confirmed', label: 'Venta confirmada' },
      { value: 'sale_cancelled', label: 'Venta cancelada' },
      { value: 'credit_note_created', label: 'Nota de crédito' },
      { value: 'quote_converted_to_invoice', label: 'Cotización → Factura' },
      { value: 'quote_converted_to_proforma', label: 'Cotización → Proforma' },
      { value: 'remission_created', label: 'Remisión creada' },
      { value: 'sale_dispatched', label: 'Venta despachada' },
      { value: 'sale_delivered', label: 'Venta entregada' },
    ],
  },
  inventory: {
    label: '📦 Inventario',
    operations: [
      { value: 'inventory_transaction_created', label: 'Transacción creada' },
      { value: 'bulk_inventory_upload', label: 'Carga masiva Excel' },
      { value: 'bulk_inbound_created', label: 'Entrada masiva' },
      { value: 'bulk_outbound_created', label: 'Salida masiva' },
      { value: 'warehouse_transfer', label: 'Transferencia' },
      { value: 'product_auto_created', label: 'Producto auto-creado' },
    ],
  },
  payments: {
    label: '💳 Pagos',
    operations: [
      { value: 'payment_created', label: 'Pago registrado' },
      { value: 'payment_refunded', label: 'Pago reembolsado' },
      { value: 'payment_cancelled', label: 'Pago cancelado' },
    ],
  },
  products: {
    label: '📦 Productos',
    operations: [
      { value: 'product_created', label: 'Producto creado' },
      { value: 'product_updated', label: 'Producto actualizado' },
      { value: 'product_deleted', label: 'Producto eliminado' },
    ],
  },
  users: {
    label: '👥 Usuarios',
    operations: [
      { value: 'user_created', label: 'Usuario creado' },
      { value: 'user_updated', label: 'Usuario actualizado' },
      { value: 'user_deleted', label: 'Usuario eliminado' },
    ],
  },
};
```

---

## Componentes React

### 1. AuditLogPage (Página Principal)

```tsx
// src/pages/admin/AuditLogPage.tsx
import React, { useState, useEffect } from 'react';
import { AuditFilters } from '@/components/audit/AuditFilters';
import { AuditLogTable } from '@/components/audit/AuditLogTable';
import { AuditLogDetails } from '@/components/audit/AuditLogDetails';
import { AuditStats } from '@/components/audit/AuditStats';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { useAuth } from '@/contexts/AuthContext';
import { AuditLogQueryParams, AuditLogEntry } from '@/types/audit-log';

export const AuditLogPage: React.FC = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<AuditLogQueryParams>({
    page: 1,
    limit: 50,
    sortOrder: 'desc',
    type: ['business_operation'], // Focus on business operations by default
  });
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  const {
    logs,
    loading,
    error,
    pagination,
    refetch,
    exportLogs,
  } = useAuditLogs(filters);

  const handleFilterChange = (newFilters: AuditLogQueryParams) => {
    setFilters({ ...newFilters, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handleExport = async () => {
    try {
      await exportLogs(filters);
      // Show success notification
    } catch (err) {
      console.error('Export failed:', err);
      // Show error notification
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} onRetry={refetch} />;

  return (
    <div className="audit-log-page">
      {/* Header */}
      <div className="page-header">
        <h1>📊 Auditoría de Operaciones</h1>
        <button onClick={handleExport} className="btn-export">
          📥 Exportar CSV
        </button>
      </div>

      {/* Statistics Dashboard */}
      <AuditStats filters={filters} />

      {/* Filters */}
      <AuditFilters
        onFilterChange={handleFilterChange}
        initialFilters={filters}
      />

      {/* Results Table */}
      <AuditLogTable
        logs={logs}
        pagination={pagination}
        onPageChange={handlePageChange}
        onLogClick={setSelectedLog}
      />

      {/* Details Modal */}
      {selectedLog && (
        <AuditLogDetails
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
};
```

---

### 2. AuditFilters (Componente de Filtros)

```tsx
// src/components/audit/AuditFilters.tsx
import React, { useState, useEffect } from 'react';
import { DateRangePicker } from '@/components/common/DateRangePicker';
import { UserAutocomplete } from '@/components/common/UserAutocomplete';
import { SearchInput } from '@/components/common/SearchInput';
import { AuditLogQueryParams } from '@/types/audit-log';
import { useAvailableOperations } from '@/hooks/useAvailableOperations';

interface AuditFiltersProps {
  onFilterChange: (filters: AuditLogQueryParams) => void;
  initialFilters?: Partial<AuditLogQueryParams>;
}

const OPERATIONS_BY_MODULE = {
  sales: {
    label: '🛒 Ventas',
    operations: [
      { value: 'sale_created', label: 'Venta creada' },
      { value: 'sale_confirmed', label: 'Venta confirmada' },
      { value: 'sale_cancelled', label: 'Venta cancelada' },
      { value: 'credit_note_created', label: 'Nota de crédito' },
    ],
  },
  inventory: {
    label: '📦 Inventario',
    operations: [
      { value: 'inventory_transaction_created', label: 'Transacción creada' },
      { value: 'bulk_inventory_upload', label: 'Carga masiva Excel' },
      { value: 'warehouse_transfer', label: 'Transferencia' },
    ],
  },
  payments: {
    label: '💳 Pagos',
    operations: [
      { value: 'payment_created', label: 'Pago registrado' },
      { value: 'payment_refunded', label: 'Pago reembolsado' },
    ],
  },
};

export const AuditFilters: React.FC<AuditFiltersProps> = ({
  onFilterChange,
  initialFilters = {},
}) => {
  const [dateRange, setDateRange] = useState({
    start: initialFilters.startDate ? new Date(initialFilters.startDate) : null,
    end: initialFilters.endDate ? new Date(initialFilters.endDate) : null,
  });

  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [selectedOperations, setSelectedOperations] = useState<string[]>(
    initialFilters.operation || []
  );

  const [userId, setUserId] = useState<number | null>(
    initialFilters.userId || null
  );
  const [search, setSearch] = useState(initialFilters.search || '');

  const handleModuleToggle = (module: string) => {
    const isSelected = selectedModules.includes(module);

    if (isSelected) {
      // Deselect module and all its operations
      setSelectedModules(prev => prev.filter(m => m !== module));
      const moduleOps = OPERATIONS_BY_MODULE[module].operations.map(op => op.value);
      setSelectedOperations(prev => prev.filter(op => !moduleOps.includes(op)));
    } else {
      // Select module and all its operations
      setSelectedModules(prev => [...prev, module]);
      const moduleOps = OPERATIONS_BY_MODULE[module].operations.map(op => op.value);
      setSelectedOperations(prev => [...prev, ...moduleOps]);
    }
  };

  const handleOperationToggle = (operation: string, module: string) => {
    const isSelected = selectedOperations.includes(operation);

    if (isSelected) {
      setSelectedOperations(prev => prev.filter(op => op !== operation));
      // Check if all operations of this module are deselected
      const moduleOps = OPERATIONS_BY_MODULE[module].operations.map(op => op.value);
      const remainingOps = selectedOperations.filter(op =>
        op !== operation && moduleOps.includes(op)
      );
      if (remainingOps.length === 0) {
        setSelectedModules(prev => prev.filter(m => m !== module));
      }
    } else {
      setSelectedOperations(prev => [...prev, operation]);
      // Check if all operations of this module are now selected
      const moduleOps = OPERATIONS_BY_MODULE[module].operations.map(op => op.value);
      const allSelected = moduleOps.every(op =>
        op === operation || selectedOperations.includes(op)
      );
      if (allSelected && !selectedModules.includes(module)) {
        setSelectedModules(prev => [...prev, module]);
      }
    }
  };

  const handleApplyFilters = () => {
    const filters: AuditLogQueryParams = {
      page: 1,
      limit: 50,
      sortOrder: 'desc',
      type: ['business_operation'], // Focus on business operations
    };

    if (dateRange.start) {
      filters.startDate = dateRange.start.toISOString();
    }
    if (dateRange.end) {
      filters.endDate = dateRange.end.toISOString();
    }
    if (selectedOperations.length > 0) {
      filters.operation = selectedOperations;
    }
    if (userId) {
      filters.userId = userId;
    }
    if (search.trim()) {
      filters.search = search.trim();
    }

    onFilterChange(filters);
  };

  const handleResetFilters = () => {
    setDateRange({ start: null, end: null });
    setSelectedModules([]);
    setSelectedOperations([]);
    setUserId(null);
    setSearch('');
    onFilterChange({
      page: 1,
      limit: 50,
      sortOrder: 'desc',
      type: ['business_operation']
    });
  };

  return (
    <div className="audit-filters">
      <div className="filters-section">
        <h3>🔍 Filtros Avanzados</h3>

        {/* Date Range */}
        <div className="filter-group">
          <label>📅 Rango de Fechas</label>
          <DateRangePicker
            startDate={dateRange.start}
            endDate={dateRange.end}
            onChange={setDateRange}
            maxDays={90}
          />
        </div>

        {/* Operations by Module */}
        <div className="filter-group">
          <label>🔧 Operaciones por Módulo</label>
          <div className="modules-grid">
            {Object.entries(OPERATIONS_BY_MODULE).map(([moduleKey, module]) => (
              <div key={moduleKey} className="module-section">
                <label className="module-header">
                  <input
                    type="checkbox"
                    checked={selectedModules.includes(moduleKey)}
                    onChange={() => handleModuleToggle(moduleKey)}
                  />
                  <strong>{module.label}</strong>
                </label>
                <div className="operations-list">
                  {module.operations.map((op) => (
                    <label key={op.value} className="operation-item">
                      <input
                        type="checkbox"
                        checked={selectedOperations.includes(op.value)}
                        onChange={() => handleOperationToggle(op.value, moduleKey)}
                      />
                      {op.label}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Filter */}
        <div className="filter-group">
          <label>👤 Usuario</label>
          <UserAutocomplete
            value={userId}
            onChange={setUserId}
            placeholder="Buscar usuario..."
          />
        </div>

        {/* Search */}
        <div className="filter-group">
          <label>🔍 Búsqueda de Texto</label>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar en detalles..."
            debounceMs={500}
          />
        </div>

        {/* Action Buttons */}
        <div className="filter-actions">
          <button onClick={handleResetFilters} className="btn-reset">
            Limpiar Filtros
          </button>
          <button onClick={handleApplyFilters} className="btn-apply">
            Aplicar Filtros
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

### 3. AuditLogTable (Tabla de Resultados)

```tsx
// src/components/audit/AuditLogTable.tsx
import React from 'react';
import { AuditLogEntry, PaginationInfo } from '@/types/audit-log';
import { formatDate } from '@/utils/dateFormatter';
import { getOperationIcon, getOperationLabel } from '@/utils/auditHelpers';

interface AuditLogTableProps {
  logs: AuditLogEntry[];
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onLogClick: (log: AuditLogEntry) => void;
}

export const AuditLogTable: React.FC<AuditLogTableProps> = ({
  logs,
  pagination,
  onPageChange,
  onLogClick,
}) => {
  return (
    <div className="audit-log-table-container">
      <div className="table-header">
        <h3>📋 Historial de Operaciones ({pagination.total} registros)</h3>
      </div>

      <table className="audit-log-table">
        <thead>
          <tr>
            <th>Fecha/Hora</th>
            <th>Usuario</th>
            <th>Operación</th>
            <th>Detalles</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr
              key={log.id}
              className="log-row"
              onClick={() => onLogClick(log)}
            >
              <td className="timestamp">
                {formatDate(log.timestamp, 'dd/MM/yy HH:mm:ss')}
              </td>
              <td className="user">
                {log.details?.email || `Usuario #${log.userId}`}
              </td>
              <td className="operation">
                <span className="operation-badge">
                  {getOperationIcon(log.operation)} {getOperationLabel(log.operation)}
                </span>
              </td>
              <td className="details">
                {renderDetailsPreview(log)}
              </td>
              <td className="actions">
                <button
                  className="btn-view-details"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLogClick(log);
                  }}
                >
                  Ver más ▶
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination">
        <button
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={pagination.page === 1}
          className="btn-page"
        >
          ◀ Anterior
        </button>

        <span className="page-info">
          Página {pagination.page} de {pagination.totalPages}
          {' '}({pagination.total} registros)
        </span>

        <button
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={pagination.page === pagination.totalPages}
          className="btn-page"
        >
          Siguiente ▶
        </button>
      </div>
    </div>
  );
};

// Helper function to render details preview
function renderDetailsPreview(log: AuditLogEntry): React.ReactNode {
  switch (log.operation) {
    case 'sale_created':
    case 'sale_confirmed':
      return (
        <div className="preview">
          <div>{log.details?.saleNumber}</div>
          <div className="amount">Total: ${log.details?.total?.toFixed(2)}</div>
        </div>
      );

    case 'bulk_inventory_upload':
      return (
        <div className="preview">
          <div>{log.details?.totalRows} productos</div>
          <div>{log.details?.successCount} exitosos</div>
        </div>
      );

    case 'payment_created':
      return (
        <div className="preview">
          <div className="amount">${log.details?.amount?.toFixed(2)}</div>
          <div>Método: {log.details?.paymentMethod}</div>
        </div>
      );

    case 'product_created':
      return (
        <div className="preview">
          <div>{log.details?.sku}</div>
          <div>{log.details?.name}</div>
        </div>
      );

    default:
      return <div className="preview">{log.message}</div>;
  }
}
```

---

### 4. AuditLogDetails (Modal de Detalles)

```tsx
// src/components/audit/AuditLogDetails.tsx
import React from 'react';
import { AuditLogEntry } from '@/types/audit-log';
import { formatDate } from '@/utils/dateFormatter';
import { getOperationIcon, getOperationLabel } from '@/utils/auditHelpers';

interface AuditLogDetailsProps {
  log: AuditLogEntry;
  onClose: () => void;
}

export const AuditLogDetails: React.FC<AuditLogDetailsProps> = ({
  log,
  onClose,
}) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {getOperationIcon(log.operation)} {getOperationLabel(log.operation)}
          </h2>
          <button onClick={onClose} className="btn-close">✕</button>
        </div>

        <div className="modal-body">
          {/* Basic Info */}
          <div className="info-section">
            <div className="info-row">
              <label>📅 Fecha/Hora:</label>
              <span>{formatDate(log.timestamp, 'dd/MM/yyyy HH:mm:ss')}</span>
            </div>
            <div className="info-row">
              <label>👤 Usuario:</label>
              <span>{log.details?.email || `Usuario #${log.userId}`}</span>
            </div>
            <div className="info-row">
              <label>🏢 Empresa:</label>
              <span>Empresa #{log.companyId}</span>
            </div>
            <div className="info-row">
              <label>🆔 ID de Registro:</label>
              <span className="mono">{log.id}</span>
            </div>
          </div>

          {/* Operation Details */}
          <div className="details-section">
            <h3>📊 Detalles de la Operación</h3>
            {renderOperationDetails(log)}
          </div>

          {/* Related Actions */}
          <div className="actions-section">
            <h3>🔗 Acciones Relacionadas</h3>
            {renderRelatedActions(log)}
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to render operation-specific details
function renderOperationDetails(log: AuditLogEntry): React.ReactNode {
  const details = log.details || {};

  switch (log.operation) {
    case 'sale_created':
    case 'sale_confirmed':
      return (
        <div className="details-grid">
          <div className="detail-item">
            <label>ID Venta:</label>
            <span>{details.saleId}</span>
          </div>
          <div className="detail-item">
            <label>Número:</label>
            <span>{details.saleNumber}</span>
          </div>
          <div className="detail-item">
            <label>Tipo:</label>
            <span>{details.saleType}</span>
          </div>
          <div className="detail-item">
            <label>Total:</label>
            <span className="amount">${details.total?.toFixed(2)}</span>
          </div>
          <div className="detail-item">
            <label>Cliente:</label>
            <span>Cliente #{details.customerId}</span>
          </div>
          <div className="detail-item">
            <label>Almacén:</label>
            <span>Almacén #{details.warehouseId}</span>
          </div>
        </div>
      );

    case 'bulk_inventory_upload':
      return (
        <div className="details-grid">
          <div className="detail-item">
            <label>Filas Procesadas:</label>
            <span>{details.totalRows}</span>
          </div>
          <div className="detail-item">
            <label>Exitosos:</label>
            <span className="success">{details.successCount}</span>
          </div>
          <div className="detail-item">
            <label>Errores:</label>
            <span className="error">{details.errorCount}</span>
          </div>
          <div className="detail-item">
            <label>Productos Creados:</label>
            <span>{details.productsCreated}</span>
          </div>
          <div className="detail-item">
            <label>Lotes Creados:</label>
            <span>{details.batchesCreated}</span>
          </div>
          <div className="detail-item">
            <label>Cantidad Total:</label>
            <span>{details.totalQuantity}</span>
          </div>
          <div className="detail-item">
            <label>Costo Total:</label>
            <span className="amount">${details.totalCost?.toFixed(2)}</span>
          </div>
        </div>
      );

    case 'payment_created':
      return (
        <div className="details-grid">
          <div className="detail-item">
            <label>ID Pago:</label>
            <span>{details.paymentId}</span>
          </div>
          <div className="detail-item">
            <label>Monto:</label>
            <span className="amount">${details.amount?.toFixed(2)}</span>
          </div>
          <div className="detail-item">
            <label>Método:</label>
            <span>{details.paymentMethod}</span>
          </div>
          <div className="detail-item">
            <label>Venta:</label>
            <span>{details.saleNumber}</span>
          </div>
        </div>
      );

    case 'product_created':
    case 'product_auto_created':
      return (
        <div className="details-grid">
          <div className="detail-item">
            <label>ID Producto:</label>
            <span>{details.productId}</span>
          </div>
          <div className="detail-item">
            <label>SKU:</label>
            <span>{details.sku}</span>
          </div>
          <div className="detail-item">
            <label>Nombre:</label>
            <span>{details.name}</span>
          </div>
          {log.operation === 'product_auto_created' && (
            <div className="detail-item">
              <label>Fila del Excel:</label>
              <span>Fila {details.rowNumber}</span>
            </div>
          )}
        </div>
      );

    default:
      return (
        <pre className="json-details">
          {JSON.stringify(details, null, 2)}
        </pre>
      );
  }
}

// Helper function to render related actions
function renderRelatedActions(log: AuditLogEntry): React.ReactNode {
  const details = log.details || {};

  switch (log.operation) {
    case 'sale_created':
    case 'sale_confirmed':
      return (
        <div className="related-actions">
          <a href={`/sales/${details.saleId}`} className="action-link">
            → Ver venta completa
          </a>
          <a href={`/customers/${details.customerId}`} className="action-link">
            → Ver historial del cliente
          </a>
          <a href={`/audit?userId=${log.userId}`} className="action-link">
            → Ver operaciones del usuario
          </a>
        </div>
      );

    case 'bulk_inventory_upload':
      return (
        <div className="related-actions">
          <a href={`/inventory?date=${log.timestamp}`} className="action-link">
            → Ver transacciones creadas
          </a>
          {details.productsCreated > 0 && (
            <a href={`/products?source=bulk_upload&date=${log.timestamp}`} className="action-link">
              → Ver productos auto-creados
            </a>
          )}
        </div>
      );

    case 'payment_created':
      return (
        <div className="related-actions">
          <a href={`/payments/${details.paymentId}`} className="action-link">
            → Ver pago completo
          </a>
          <a href={`/sales/${details.saleId}`} className="action-link">
            → Ver venta asociada
          </a>
        </div>
      );

    default:
      return (
        <div className="related-actions">
          <a href={`/audit?userId=${log.userId}`} className="action-link">
            → Ver operaciones del usuario
          </a>
        </div>
      );
  }
}
```

---

### 5. AuditStats (Estadísticas)

```tsx
// src/components/audit/AuditStats.tsx
import React from 'react';
import { useAuditStats } from '@/hooks/useAuditStats';
import { AuditLogQueryParams } from '@/types/audit-log';

interface AuditStatsProps {
  filters: AuditLogQueryParams;
}

export const AuditStats: React.FC<AuditStatsProps> = ({ filters }) => {
  const { stats, loading } = useAuditStats(filters);

  if (loading) return <div>Cargando estadísticas...</div>;

  const topOperations = Object.entries(stats?.byOperation || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  return (
    <div className="audit-stats">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.totalLogs || 0}</div>
            <div className="stat-label">Total Operaciones</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.last24Hours || 0}</div>
            <div className="stat-label">Últimas 24h</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.last7Days || 0}</div>
            <div className="stat-label">Últimos 7 días</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔴</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.byLevel.error || 0}</div>
            <div className="stat-label">Errores</div>
          </div>
        </div>
      </div>

      {/* Top Operations */}
      <div className="top-operations">
        <h4>🔥 Operaciones Más Frecuentes</h4>
        <div className="operations-list">
          {topOperations.map(([operation, count]) => (
            <div key={operation} className="operation-stat">
              <span className="operation-name">{operation}</span>
              <span className="operation-count">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

---

## Servicios y Hooks

### 1. Hook useAuditLogs

```typescript
// src/hooks/useAuditLogs.ts
import { useState, useEffect } from 'react';
import { auditLogService } from '@/services/auditLogService';
import { AuditLogEntry, AuditLogQueryParams, PaginationInfo } from '@/types/audit-log';

interface UseAuditLogsReturn {
  logs: AuditLogEntry[];
  loading: boolean;
  error: Error | null;
  pagination: PaginationInfo;
  refetch: () => void;
  exportLogs: (filters: AuditLogQueryParams) => Promise<void>;
}

export const useAuditLogs = (filters: AuditLogQueryParams): UseAuditLogsReturn => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await auditLogService.getLogs(filters);
      setLogs(response.data.logs);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const exportLogs = async (exportFilters: AuditLogQueryParams) => {
    try {
      await auditLogService.exportLogs(exportFilters);
    } catch (err) {
      console.error('Error exporting logs:', err);
      throw err;
    }
  };

  return {
    logs,
    loading,
    error,
    pagination,
    refetch: fetchLogs,
    exportLogs,
  };
};
```

---

### 2. Hook useAuditStats

```typescript
// src/hooks/useAuditStats.ts
import { useState, useEffect } from 'react';
import { auditLogService } from '@/services/auditLogService';
import { AuditStats, AuditLogQueryParams } from '@/types/audit-log';

interface UseAuditStatsReturn {
  stats: AuditStats | null;
  loading: boolean;
  error: Error | null;
}

export const useAuditStats = (filters?: AuditLogQueryParams): UseAuditStatsReturn => {
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await auditLogService.getStats(filters);
        setStats(response.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [filters]);

  return { stats, loading, error };
};
```

---

### 3. Servicio de Auditoría

```typescript
// src/services/auditLogService.ts
import { apiClient } from './apiClient';
import {
  AuditLogQueryParams,
  AuditLogsResponse,
  AuditStatsResponse
} from '@/types/audit-log';

export const auditLogService = {
  /**
   * Obtener logs de auditoría con filtros
   */
  getLogs: async (params: AuditLogQueryParams): Promise<AuditLogsResponse> => {
    const response = await apiClient.get('/api/v1/audit-logs', { params });
    return response.data;
  },

  /**
   * Obtener estadísticas de auditoría
   */
  getStats: async (params?: AuditLogQueryParams): Promise<AuditStatsResponse> => {
    const response = await apiClient.get('/api/v1/audit-logs/stats', { params });
    return response.data;
  },

  /**
   * Exportar logs a CSV
   */
  exportLogs: async (params: AuditLogQueryParams): Promise<void> => {
    const response = await apiClient.get('/api/v1/audit-logs/export', {
      params,
      responseType: 'blob',
    });

    // Crear URL de descarga
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `audit-logs-${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  /**
   * Obtener operaciones disponibles
   */
  getAvailableOperations: async (): Promise<string[]> => {
    const response = await apiClient.get('/api/v1/audit-logs/operations');
    return response.data.data;
  },

  /**
   * Obtener tipos de log disponibles
   */
  getAvailableTypes: async (): Promise<string[]> => {
    const response = await apiClient.get('/api/v1/audit-logs/types');
    return response.data.data;
  },
};
```

---

## Tipos TypeScript

```typescript
// src/types/audit-log.ts

export type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'debug';

export type LogType =
  | 'http_request'
  | 'database_query'
  | 'database_query_error'
  | 'authentication'
  | 'business_operation'
  | 'application_error'
  | 'security_event'
  | 'migration_status';

export interface AuditLogEntry {
  id: string;
  level: LogLevel;
  message: string;
  timestamp: string;
  service: string;
  environment: string;
  type?: LogType;
  operation?: string;
  userId?: number;
  companyId?: number;
  details?: Record<string, any>;
}

export interface AuditLogQueryParams {
  startDate?: string;
  endDate?: string;
  level?: LogLevel[];
  type?: LogType[];
  operation?: string[];
  userId?: number;
  companyId?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'timestamp' | 'level' | 'type';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AppliedFilters {
  level?: LogLevel[];
  type?: LogType[];
  operation?: string[];
  userId?: number;
  companyId?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface AuditLogsResponse {
  success: boolean;
  data: {
    logs: AuditLogEntry[];
    pagination: PaginationInfo;
    filters: AppliedFilters;
  };
}

export interface AuditStats {
  totalLogs: number;
  byLevel: Record<LogLevel, number>;
  byType: Record<string, number>;
  byOperation: Record<string, number>;
  lastHour: number;
  last24Hours: number;
  last7Days: number;
}

export interface AuditStatsResponse {
  success: boolean;
  data: AuditStats;
}
```

---

## Utilidades y Helpers

```typescript
// src/utils/auditHelpers.ts

export const getOperationIcon = (operation?: string): string => {
  const icons: Record<string, string> = {
    // Ventas
    sale_created: '🛒',
    sale_confirmed: '✅',
    sale_cancelled: '❌',
    credit_note_created: '📝',

    // Inventario
    inventory_transaction_created: '📦',
    bulk_inventory_upload: '📊',
    warehouse_transfer: '🔄',

    // Pagos
    payment_created: '💳',
    payment_refunded: '💰',

    // Productos
    product_created: '➕',
    product_updated: '✏️',
    product_deleted: '🗑️',
    product_auto_created: '🤖',

    // Usuarios
    user_created: '👤',
    user_updated: '👤',
    user_deleted: '👤',
  };

  return operation ? icons[operation] || '📋' : '📋';
};

export const getOperationLabel = (operation?: string): string => {
  const labels: Record<string, string> = {
    // Ventas
    sale_created: 'Venta Creada',
    sale_confirmed: 'Venta Confirmada',
    sale_cancelled: 'Venta Cancelada',
    credit_note_created: 'Nota de Crédito',
    quote_converted_to_invoice: 'Cotización → Factura',
    quote_converted_to_proforma: 'Cotización → Proforma',

    // Inventario
    inventory_transaction_created: 'Transacción de Inventario',
    bulk_inventory_upload: 'Carga Masiva Excel',
    bulk_inbound_created: 'Entrada Masiva',
    bulk_outbound_created: 'Salida Masiva',
    warehouse_transfer: 'Transferencia',
    product_auto_created: 'Producto Auto-creado',

    // Pagos
    payment_created: 'Pago Registrado',
    payment_refunded: 'Pago Reembolsado',
    payment_cancelled: 'Pago Cancelado',

    // Productos
    product_created: 'Producto Creado',
    product_updated: 'Producto Actualizado',
    product_deleted: 'Producto Eliminado',

    // Usuarios
    user_created: 'Usuario Creado',
    user_updated: 'Usuario Actualizado',
    user_deleted: 'Usuario Eliminado',
  };

  return operation ? labels[operation] || operation : 'Operación';
};

export const formatDate = (
  date: string | Date,
  format: string = 'dd/MM/yyyy HH:mm:ss'
): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('es-ES');
};
```

---

## Casos de Uso

### Caso 1: Auditoría de Ventas del Día

**Objetivo:** Ver todas las ventas realizadas hoy

```typescript
// Filtros aplicados
const filters: AuditLogQueryParams = {
  operation: ['sale_created', 'sale_confirmed'],
  startDate: new Date().setHours(0, 0, 0, 0).toISOString(),
  endDate: new Date().toISOString(),
  page: 1,
  limit: 100,
};
```

**Resultado:** Lista de todas las ventas creadas y confirmadas hoy

---

### Caso 2: Investigar Error en Carga Masiva

**Objetivo:** Ver detalles de una carga masiva que falló parcialmente

```typescript
const filters: AuditLogQueryParams = {
  operation: ['bulk_inventory_upload'],
  search: 'hasErrors:true',
  startDate: '2025-11-20T00:00:00Z',
  page: 1,
  limit: 10,
};
```

**Resultado:** Cargas masivas con errores, mostrando:
- Total de filas procesadas
- Cantidad de errores
- Productos creados exitosamente

---

### Caso 3: Auditoría por Usuario

**Objetivo:** Ver todas las operaciones de un usuario específico

```typescript
const filters: AuditLogQueryParams = {
  userId: 123,
  type: ['business_operation'],
  startDate: '2025-11-01T00:00:00Z',
  endDate: '2025-11-30T23:59:59Z',
  page: 1,
  limit: 50,
};
```

**Resultado:** Todas las operaciones realizadas por el usuario en noviembre

---

### Caso 4: Reporte Mensual de Operaciones

**Objetivo:** Exportar todas las operaciones del mes para análisis

```typescript
const filters: AuditLogQueryParams = {
  type: ['business_operation'],
  startDate: '2025-11-01T00:00:00Z',
  endDate: '2025-11-30T23:59:59Z',
};

await auditLogService.exportLogs(filters);
```

**Resultado:** Archivo CSV con todas las operaciones del mes

---

### Caso 5: Monitor de Pagos

**Objetivo:** Ver todos los pagos y reembolsos del día

```typescript
const filters: AuditLogQueryParams = {
  operation: ['payment_created', 'payment_refunded', 'payment_cancelled'],
  startDate: new Date().setHours(0, 0, 0, 0).toISOString(),
  page: 1,
  limit: 100,
};
```

**Resultado:** Lista completa de actividad de pagos del día

---

## Estilos CSS Recomendados

```css
/* src/styles/audit-log.css */

.audit-log-page {
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

/* Statistics Cards */
.audit-stats {
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 2rem;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: bold;
  color: #2c3e50;
}

.stat-label {
  color: #7f8c8d;
  font-size: 0.875rem;
}

/* Filters */
.audit-filters {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.module-section {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 1rem;
}

.module-header {
  font-weight: 600;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.operations-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-left: 1.5rem;
}

.operation-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

/* Table */
.audit-log-table-container {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.audit-log-table {
  width: 100%;
  border-collapse: collapse;
}

.audit-log-table th {
  text-align: left;
  padding: 1rem;
  border-bottom: 2px solid #e0e0e0;
  font-weight: 600;
  color: #2c3e50;
}

.audit-log-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.log-row {
  cursor: pointer;
  transition: background-color 0.2s;
}

.log-row:hover {
  background-color: #f8f9fa;
}

.operation-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background-color: #e3f2fd;
  color: #1976d2;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

.preview {
  font-size: 0.875rem;
  color: #666;
}

.amount {
  font-weight: 600;
  color: #2e7d32;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.modal-body {
  padding: 1.5rem;
}

.info-section,
.details-section,
.actions-section {
  margin-bottom: 1.5rem;
}

.info-row {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.info-row label {
  font-weight: 600;
  color: #666;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item label {
  font-size: 0.75rem;
  color: #888;
  text-transform: uppercase;
}

.detail-item span {
  font-weight: 500;
}

.related-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.action-link {
  color: #1976d2;
  text-decoration: none;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.action-link:hover {
  background-color: #f0f0f0;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.btn-page {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

---

## Checklist de Implementación

- [ ] Crear tipos TypeScript (`src/types/audit-log.ts`)
- [ ] Implementar servicio (`src/services/auditLogService.ts`)
- [ ] Crear hooks (`useAuditLogs`, `useAuditStats`)
- [ ] Implementar componente `AuditFilters`
- [ ] Implementar componente `AuditLogTable`
- [ ] Implementar componente `AuditLogDetails`
- [ ] Implementar componente `AuditStats`
- [ ] Crear página principal `AuditLogPage`
- [ ] Agregar utilidades (`auditHelpers.ts`)
- [ ] Agregar estilos CSS
- [ ] Configurar rutas (protección admin/manager)
- [ ] Pruebas de integración
- [ ] Documentación de uso

---

## Notas Importantes

1. **Control de Acceso:** Solo usuarios con roles `admin` o `manager` deberían tener acceso completo
2. **Performance:** Implementar paginación obligatoria (máximo 500 registros por página)
3. **Exportación:** Limitar a 10,000 registros máximo
4. **Filtros por Defecto:** Mostrar solo `business_operation` por defecto para enfocarse en operaciones de usuario
5. **Búsqueda:** Implementar debounce de 500ms para optimizar búsquedas

---

**Documento generado:** 26/11/2025
**Versión:** 1.0
**Autor:** Sistema de Inventario Multi-Empresa
