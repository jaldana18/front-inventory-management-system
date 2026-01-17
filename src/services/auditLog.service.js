import apiClient from './api.service';

/**
 * Audit Log Service
 * Handles all audit log related API calls based on DOCUMENTACION_AUDIT_LOGS.md
 */
export const auditLogService = {
  /**
   * Get audit logs with filters
   * @param {import('../types/audit-log').AuditLogQueryParams} params - Query parameters
   * @returns {Promise<import('../types/audit-log').AuditLogsResponse>}
   */
  getLogs: async (params = {}) => {
    const response = await apiClient.get('/audit-logs-db', { params });
    return response;
  },

  /**
   * Get audit log statistics
   * @param {Object} [params] - Optional query parameters (startDate, endDate, companyId)
   * @returns {Promise<import('../types/audit-log').AuditStatsResponse>}
   */
  getStats: async (params = {}) => {
    const response = await apiClient.get('/audit-logs-db/stats', { params });
    return response;
  },

  /**
   * Get entity history (all changes for a specific entity)
   * @param {string} entityType - Type of entity (Product, User, Customer, etc.)
   * @param {number} entityId - ID of the entity
   * @param {Object} [params] - Optional query parameters
   * @returns {Promise<import('../types/audit-log').AuditLogsResponse>}
   */
  getEntityHistory: async (entityType, entityId, params = {}) => {
    const response = await apiClient.get(`/audit-logs-db/entity/${entityType}/${entityId}`, { params });
    return response;
  },

  /**
   * Get user activity (all actions performed by a specific user)
   * @param {number} userId - User ID
   * @param {Object} [params] - Optional query parameters
   * @returns {Promise<import('../types/audit-log').AuditLogsResponse>}
   */
  getUserActivity: async (userId, params = {}) => {
    const response = await apiClient.get(`/audit-logs-db/user/${userId}`, { params });
    return response;
  },

  /**
   * Get available actions catalog
   * @returns {Promise<string[]>}
   */
  getAvailableActions: async () => {
    const response = await apiClient.get('/audit-logs-db/filters/actions');
    return response.data || [];
  },

  /**
   * Get available entity types catalog
   * @returns {Promise<string[]>}
   */
  getAvailableEntityTypes: async () => {
    const response = await apiClient.get('/audit-logs-db/filters/entity-types');
    return response.data || [];
  },

  /**
   * Get available modules catalog
   * @returns {Promise<string[]>}
   */
  getAvailableModules: async () => {
    const response = await apiClient.get('/audit-logs-db/filters/modules');
    return response.data || [];
  },

  /**
   * Export logs to CSV (legacy - if needed)
   * @param {import('../types/audit-log').AuditLogQueryParams} params - Query parameters
   * @returns {Promise<void>}
   */
  exportLogs: async (params = {}) => {
    const response = await apiClient.get('/audit-logs-db/export', {
      params,
      responseType: 'blob',
    });

    // Create download URL
    const url = window.URL.createObjectURL(new Blob([response]));
    const link = document.createElement('a');
    link.href = url;
    const filename = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default auditLogService;
