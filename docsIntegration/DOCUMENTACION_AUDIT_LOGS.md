# Documentación de Audit Logs - Sistema de Inventario

## 📋 Descripción General

El sistema de Audit Logs almacena un registro completo de todas las acciones realizadas por los usuarios en el sistema de inventario. Permite rastrear quién hizo qué, cuándo y desde dónde.

## 🔗 Endpoints Disponibles

### 1. Listado General de Logs
**Endpoint:** `GET /api/v1/audit-logs-db`

Obtiene un listado paginado de todos los logs de auditoría con capacidad de filtrado avanzado.

**Autenticación:** Requerida (Bearer Token)

**Permisos:**
- **Usuarios normales:** Solo pueden ver logs de su propia empresa
- **Administradores:** Pueden ver logs de todas las empresas especificando el `companyId`

---

### 2. Historial de una Entidad Específica
**Endpoint:** `GET /api/v1/audit-logs-db/entity/:entityType/:entityId`

Obtiene el historial completo de cambios de una entidad específica (ej: un producto, un cliente, un usuario).

**Parámetros de ruta:**
- `entityType`: Tipo de entidad (Product, User, Customer, Warehouse, etc.)
- `entityId`: ID numérico de la entidad

**Ejemplo:** `GET /api/v1/audit-logs-db/entity/Product/123`

---

### 3. Actividad de un Usuario
**Endpoint:** `GET /api/v1/audit-logs-db/user/:userId`

Obtiene todas las acciones realizadas por un usuario específico.

**Parámetros de ruta:**
- `userId`: ID numérico del usuario

**Ejemplo:** `GET /api/v1/audit-logs-db/user/5`

---

### 4. Estadísticas Agregadas
**Endpoint:** `GET /api/v1/audit-logs-db/stats`

Obtiene estadísticas agregadas de los logs, incluyendo conteos por acción, tipo de entidad y severidad.

**Filtros disponibles:**
- `startDate`: Fecha inicial para el rango de estadísticas
- `endDate`: Fecha final para el rango de estadísticas
- `companyId`: ID de empresa (solo para administradores)

---

### 5. Catálogos de Filtros

**Acciones disponibles:** `GET /api/v1/audit-logs-db/filters/actions`
- Retorna lista de todas las acciones rastreadas (CREATE, UPDATE, DELETE, etc.)

**Tipos de entidad:** `GET /api/v1/audit-logs-db/filters/entity-types`
- Retorna lista de todos los tipos de entidades (Product, User, Customer, etc.)

**Módulos disponibles:** `GET /api/v1/audit-logs-db/filters/modules`
- Retorna lista de todos los módulos del sistema (inventory, sales, users, etc.)

---

## 🔍 Filtros Disponibles

Todos los filtros se envían como parámetros de consulta (query parameters) en la URL.

### Filtros de Contenido

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `userId` | number | Filtrar por usuario específico que realizó la acción | `?userId=5` |
| `action` | string[] | Filtrar por tipo de acción (múltiples valores separados por coma) | `?action=CREATE,UPDATE` |
| `entityType` | string[] | Filtrar por tipo de entidad afectada | `?entityType=Product,Customer` |
| `entityId` | number | Filtrar por ID de entidad específica | `?entityId=123` |
| `severity` | string[] | Filtrar por nivel de severidad | `?severity=warning,critical` |
| `module` | string[] | Filtrar por módulo del sistema | `?module=inventory,sales` |
| `search` | string | Búsqueda de texto en la descripción | `?search=Laptop` |

### Filtros de Fecha

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `startDate` | string (ISO 8601) | Fecha inicial del rango | `?startDate=2024-01-01T00:00:00Z` |
| `endDate` | string (ISO 8601) | Fecha final del rango | `?endDate=2024-12-31T23:59:59Z` |

### Filtros de Paginación

| Parámetro | Tipo | Descripción | Valor por defecto | Límites |
|-----------|------|-------------|-------------------|---------|
| `page` | number | Número de página | 1 | Mínimo: 1 |
| `limit` | number | Registros por página | 50 | Mínimo: 1, Máximo: 500 |
| `sortOrder` | string | Orden de resultados | DESC | ASC o DESC |

### Filtros Administrativos

| Parámetro | Tipo | Descripción | Restricción |
|-----------|------|-------------|-------------|
| `companyId` | number | Filtrar por empresa específica | Solo administradores |

---

## 📊 Valores de Filtros

### Acciones (action)
- `CREATE` - Creación de registros
- `UPDATE` - Actualización de registros
- `DELETE` - Eliminación de registros
- `READ` - Lectura de datos sensibles
- `ACTIVATE` - Activación de registros
- `DEACTIVATE` - Desactivación de registros
- `LOGIN` - Inicio de sesión exitoso
- `LOGOUT` - Cierre de sesión
- `LOGIN_FAILED` - Intento de inicio de sesión fallido
- `PASSWORD_RESET` - Restablecimiento de contraseña
- `STOCK_IN` - Entrada de inventario
- `STOCK_OUT` - Salida de inventario
- `STOCK_ADJUSTMENT` - Ajuste de inventario
- `STOCK_TRANSFER` - Transferencia entre almacenes
- `SALE_CREATED` - Venta creada
- `SALE_CANCELLED` - Venta cancelada
- `PAYMENT_RECEIVED` - Pago recibido
- `BULK_IMPORT` - Importación masiva
- `BULK_UPDATE` - Actualización masiva
- `BULK_DELETE` - Eliminación masiva
- `CONFIG_CHANGE` - Cambio de configuración

### Tipos de Entidad (entityType)
- `User` - Usuarios del sistema
- `Product` - Productos
- `Customer` - Clientes
- `Warehouse` - Almacenes
- `InventoryTransaction` - Transacciones de inventario
- `Sale` - Ventas
- `SaleDetail` - Detalles de venta
- `Payment` - Pagos
- `PaymentMethod` - Métodos de pago
- `Category` - Categorías de productos
- `UnitOfMeasure` - Unidades de medida
- `Company` - Empresas
- `InventoryBatch` - Lotes de inventario

### Niveles de Severidad (severity)
- `info` - Operaciones normales (creación, lectura)
- `warning` - Cambios importantes (actualización, desactivación)
- `critical` - Acciones destructivas (eliminación, cambios de configuración críticos)

### Módulos del Sistema (module)
- `inventory` - Gestión de inventario
- `sales` - Ventas y transacciones
- `users` - Gestión de usuarios
- `products` - Gestión de productos
- `warehouses` - Gestión de almacenes
- `customers` - Gestión de clientes
- `auth` - Autenticación y seguridad
- `payments` - Gestión de pagos
- `reports` - Reportes y análisis
- `config` - Configuración del sistema

---

## 📤 Formato de Respuesta

### Respuesta Exitosa del Listado General

```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": 1,
        "companyId": 1,
        "userId": 5,
        "user": {
          "id": 5,
          "email": "usuario@example.com",
          "firstName": "Juan",
          "lastName": "Pérez"
        },
        "action": "CREATE",
        "entityType": "Product",
        "entityId": 123,
        "description": "Usuario creó producto 'Laptop Dell XPS 15' (SKU: PROD-001)",
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
        "oldValues": null,
        "newValues": "{\"sku\":\"PROD-001\",\"name\":\"Laptop Dell XPS 15\",\"price\":1299.99}",
        "metadata": "{\"warehouseId\":1}",
        "severity": "info",
        "module": "products",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150,
      "totalPages": 3
    }
  }
}
```

### Campos JSON

Los campos `oldValues`, `newValues` y `metadata` son cadenas JSON que deben ser parseadas en el frontend:

- **oldValues**: Valores anteriores antes del cambio (para acciones UPDATE)
- **newValues**: Valores nuevos después del cambio
- **metadata**: Información adicional contextual (IDs de almacén, referencias, etc.)

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Obtener todos los logs con paginación
```
GET /api/v1/audit-logs-db?page=1&limit=50&sortOrder=DESC
```

### Ejemplo 2: Filtrar solo creaciones de productos
```
GET /api/v1/audit-logs-db?action=CREATE&entityType=Product
```

### Ejemplo 3: Ver actividad de un usuario específico en un rango de fechas
```
GET /api/v1/audit-logs-db?userId=5&startDate=2024-01-01T00:00:00Z&endDate=2024-01-31T23:59:59Z
```

### Ejemplo 4: Buscar logs críticos de eliminación
```
GET /api/v1/audit-logs-db?severity=critical&action=DELETE
```

### Ejemplo 5: Ver todas las transacciones de inventario
```
GET /api/v1/audit-logs-db?module=inventory&action=STOCK_IN,STOCK_OUT,STOCK_ADJUSTMENT
```

### Ejemplo 6: Historial completo de un producto
```
GET /api/v1/audit-logs-db/entity/Product/123
```

### Ejemplo 7: Ver intentos de login fallidos
```
GET /api/v1/audit-logs-db?action=LOGIN_FAILED&severity=warning
```

### Ejemplo 8: Búsqueda de texto
```
GET /api/v1/audit-logs-db?search=Laptop&entityType=Product
```

### Ejemplo 9: Estadísticas del último mes
```
GET /api/v1/audit-logs-db/stats?startDate=2024-11-01T00:00:00Z&endDate=2024-11-30T23:59:59Z
```

### Ejemplo 10: Múltiples filtros combinados
```
GET /api/v1/audit-logs-db?module=sales&severity=info,warning&startDate=2024-01-01T00:00:00Z&limit=100&page=1
```

---

## 🔐 Seguridad y Permisos

### Aislamiento Multi-Tenant
- Todos los logs están aislados por `companyId`
- Los usuarios no-administradores solo pueden ver logs de su propia empresa
- El sistema automáticamente aplica el filtro de empresa según el usuario autenticado

### Información Forense
- **IP Address**: Dirección IP desde donde se realizó la acción
- **User Agent**: Información del navegador/cliente utilizado
- Útil para investigaciones de seguridad y auditorías

### Datos Sensibles
- Los campos `oldValues` y `newValues` pueden contener información sensible
- Se recomienda aplicar controles de acceso adicionales en el frontend según roles
- Las contraseñas nunca se almacenan en los logs

---

## 📈 Rendimiento y Escalabilidad

### Optimizaciones Implementadas
- **Índices compuestos**: Queries por empresa + fecha optimizados
- **Paginación servidor**: Límite máximo de 500 registros por consulta
- **Filtrado en BD**: Todos los filtros se aplican antes de enviar datos al cliente

### Recomendaciones de Uso
- Utilizar paginación para grandes volúmenes de datos
- Aplicar filtros de fecha para acotar resultados
- Usar el endpoint de historial de entidad para casos específicos
- Considerar implementar caché en el frontend para filtros frecuentes

### Política de Retención
- Los logs se mantienen según la política de retención configurada
- Por defecto: 90 días de retención
- Los logs antiguos se eliminan automáticamente

---

## ❓ Preguntas Frecuentes

**¿Cómo saber qué cambió en una actualización?**
Comparar los campos `oldValues` y `newValues` después de parsear el JSON.

**¿Puedo ver logs de otras empresas?**
Solo si tienes rol de administrador y especificas el parámetro `companyId`.

**¿Cuál es el límite máximo de registros por página?**
500 registros. Se recomienda usar 50-100 para mejor rendimiento.

**¿Los logs se eliminan automáticamente?**
Sí, según la política de retención (por defecto 90 días).

**¿Cómo busco todos los cambios de un producto específico?**
Usa el endpoint `/api/v1/audit-logs-db/entity/Product/{productId}`

**¿Puedo filtrar por múltiples acciones al mismo tiempo?**
Sí, separando los valores con comas: `?action=CREATE,UPDATE,DELETE`

**¿Qué significan los niveles de severidad?**
- `info`: Operaciones normales cotidianas
- `warning`: Cambios importantes que requieren atención
- `critical`: Acciones destructivas o críticas para el sistema

---

## 📞 Soporte Técnico

Para consultas adicionales o problemas con el sistema de audit logs, contactar al equipo de desarrollo.

**Endpoints disponibles:**
- `GET /api/v1/audit-logs-db` - Listado general
- `GET /api/v1/audit-logs-db/entity/:type/:id` - Historial de entidad
- `GET /api/v1/audit-logs-db/user/:userId` - Actividad de usuario
- `GET /api/v1/audit-logs-db/stats` - Estadísticas
- `GET /api/v1/audit-logs-db/filters/actions` - Catálogo de acciones
- `GET /api/v1/audit-logs-db/filters/entity-types` - Catálogo de entidades
- `GET /api/v1/audit-logs-db/filters/modules` - Catálogo de módulos
