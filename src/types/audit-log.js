/**
 * Audit Log Types and Interfaces
 * Based on DOCUMENTACION_AUDIT_LOGS.md
 */

/**
 * Action types based on backend documentation
 * @typedef {'CREATE' | 'UPDATE' | 'DELETE' | 'READ' | 'ACTIVATE' | 'DEACTIVATE' |
 *   'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED' | 'PASSWORD_RESET' |
 *   'STOCK_IN' | 'STOCK_OUT' | 'STOCK_ADJUSTMENT' | 'STOCK_TRANSFER' |
 *   'SALE_CREATED' | 'SALE_CANCELLED' | 'PAYMENT_RECEIVED' |
 *   'BULK_IMPORT' | 'BULK_UPDATE' | 'BULK_DELETE' | 'CONFIG_CHANGE'} AuditAction
 */

/**
 * Entity types supported by the backend
 * @typedef {'User' | 'Product' | 'Customer' | 'Warehouse' | 'InventoryTransaction' |
 *   'Sale' | 'SaleDetail' | 'Payment' | 'PaymentMethod' | 'Category' |
 *   'UnitOfMeasure' | 'Company' | 'InventoryBatch'} EntityType
 */

/**
 * Severity levels for audit logs
 * @typedef {'info' | 'warning' | 'critical'} SeverityLevel
 */

/**
 * System modules
 * @typedef {'inventory' | 'sales' | 'users' | 'products' | 'warehouses' |
 *   'customers' | 'auth' | 'payments' | 'reports' | 'config'} SystemModule
 */

/**
 * Audit log entry from database
 * @typedef {Object} AuditLogEntry
 * @property {number} id - Unique identifier
 * @property {number} companyId - Company ID (multi-tenant isolation)
 * @property {number} userId - User who performed the action
 * @property {Object} [user] - User details object
 * @property {number} user.id - User ID
 * @property {string} user.email - User email
 * @property {string} user.firstName - User first name
 * @property {string} user.lastName - User last name
 * @property {AuditAction} action - Action performed
 * @property {EntityType} entityType - Type of entity affected
 * @property {number} [entityId] - ID of the entity affected
 * @property {string} description - Human-readable description of the action
 * @property {string} ipAddress - IP address from where the action was performed
 * @property {string} userAgent - Browser/client information
 * @property {string | null} oldValues - JSON string of old values (for UPDATE actions)
 * @property {string | null} newValues - JSON string of new values
 * @property {string | null} metadata - JSON string with additional contextual information
 * @property {SeverityLevel} severity - Severity level of the action
 * @property {SystemModule} module - Module where the action occurred
 * @property {string} createdAt - ISO 8601 timestamp
 */

/**
 * Query parameters for filtering audit logs
 * @typedef {Object} AuditLogQueryParams
 * @property {number} [userId] - Filter by user ID
 * @property {AuditAction | AuditAction[]} [action] - Filter by action(s)
 * @property {EntityType | EntityType[]} [entityType] - Filter by entity type(s)
 * @property {number} [entityId] - Filter by specific entity ID
 * @property {SeverityLevel | SeverityLevel[]} [severity] - Filter by severity level(s)
 * @property {SystemModule | SystemModule[]} [module] - Filter by module(s)
 * @property {string} [search] - Text search in description
 * @property {string} [startDate] - ISO 8601 start date
 * @property {string} [endDate] - ISO 8601 end date
 * @property {number} [page] - Page number (default: 1, min: 1)
 * @property {number} [limit] - Items per page (default: 50, min: 1, max: 500)
 * @property {'ASC' | 'DESC'} [sortOrder] - Sort order (default: 'DESC')
 * @property {number} [companyId] - Filter by company (admin only)
 */

/**
 * Pagination information
 * @typedef {Object} PaginationInfo
 * @property {number} page - Current page
 * @property {number} limit - Items per page
 * @property {number} total - Total items
 * @property {number} totalPages - Total pages
 */

/**
 * Response from audit logs endpoint
 * @typedef {Object} AuditLogsResponse
 * @property {boolean} success
 * @property {Object} data
 * @property {AuditLogEntry[]} data.logs
 * @property {PaginationInfo} data.pagination
 */

/**
 * Statistics for audit logs
 * @typedef {Object} AuditStats
 * @property {number} totalLogs - Total number of logs
 * @property {Object.<AuditAction, number>} byAction - Count by action type
 * @property {Object.<EntityType, number>} byEntityType - Count by entity type
 * @property {Object.<SeverityLevel, number>} bySeverity - Count by severity level
 * @property {Object.<SystemModule, number>} byModule - Count by module
 * @property {Object.<string, number>} byUser - Count by user
 * @property {Object} timeline - Timeline data
 */

/**
 * Response from stats endpoint
 * @typedef {Object} AuditStatsResponse
 * @property {boolean} success
 * @property {AuditStats} data
 */

/**
 * Available filter options
 * @typedef {Object} FilterOptions
 * @property {AuditAction[]} actions
 * @property {EntityType[]} entityTypes
 * @property {SystemModule[]} modules
 */

export {};
