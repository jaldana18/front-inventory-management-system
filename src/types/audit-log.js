/**
 * Audit Log Types and Interfaces
 * Based on AUDIT_LOGS_FRONTEND_INTEGRATION.md
 */

/**
 * @typedef {'error' | 'warn' | 'info' | 'http' | 'debug'} LogLevel
 */

/**
 * @typedef {'http_request' | 'database_query' | 'database_query_error' | 'authentication' | 'business_operation' | 'application_error' | 'security_event' | 'migration_status'} LogType
 */

/**
 * @typedef {Object} AuditLogEntry
 * @property {string} id - Unique identifier
 * @property {LogLevel} level - Log level
 * @property {string} message - Log message
 * @property {string} timestamp - ISO 8601 timestamp
 * @property {string} service - Service name
 * @property {string} environment - Environment (development, production)
 * @property {LogType} [type] - Type of log
 * @property {string} [operation] - Operation identifier
 * @property {number} [userId] - User ID who performed the action
 * @property {number} [companyId] - Company ID
 * @property {Object} [details] - Additional details
 */

/**
 * @typedef {Object} AuditLogQueryParams
 * @property {string} [startDate] - ISO 8601 start date
 * @property {string} [endDate] - ISO 8601 end date
 * @property {LogLevel[]} [level] - Filter by log levels
 * @property {LogType[]} [type] - Filter by log types
 * @property {string[]} [operation] - Filter by operations
 * @property {number} [userId] - Filter by user ID
 * @property {number} [companyId] - Filter by company ID
 * @property {string} [search] - Text search
 * @property {number} [page] - Page number (default: 1)
 * @property {number} [limit] - Items per page (default: 50, max: 500)
 * @property {'timestamp' | 'level' | 'type'} [sortBy] - Sort field
 * @property {'asc' | 'desc'} [sortOrder] - Sort order (default: 'desc')
 */

/**
 * @typedef {Object} PaginationInfo
 * @property {number} page - Current page
 * @property {number} limit - Items per page
 * @property {number} total - Total items
 * @property {number} totalPages - Total pages
 */

/**
 * @typedef {Object} AppliedFilters
 * @property {LogLevel[]} [level]
 * @property {LogType[]} [type]
 * @property {string[]} [operation]
 * @property {number} [userId]
 * @property {number} [companyId]
 * @property {string} [search]
 * @property {string} [startDate]
 * @property {string} [endDate]
 */

/**
 * @typedef {Object} AuditLogsResponse
 * @property {boolean} success
 * @property {Object} data
 * @property {AuditLogEntry[]} data.logs
 * @property {PaginationInfo} data.pagination
 * @property {AppliedFilters} data.filters
 */

/**
 * @typedef {Object} AuditStats
 * @property {number} totalLogs
 * @property {Object.<LogLevel, number>} byLevel
 * @property {Object.<string, number>} byType
 * @property {Object.<string, number>} byOperation
 * @property {number} lastHour
 * @property {number} last24Hours
 * @property {number} last7Days
 */

/**
 * @typedef {Object} AuditStatsResponse
 * @property {boolean} success
 * @property {AuditStats} data
 */

export {};
