import apiClient from './api.service';

/**
 * Audit Log Service
 * Handles all audit log related API calls
 */
export const auditLogService = {
  /**
   * Get audit logs with filters
   * @param {import('../types/audit-log').AuditLogQueryParams} params - Query parameters
   * @returns {Promise<import('../types/audit-log').AuditLogsResponse>}
   */
  getLogs: async (params = {}) => {
    const response = await apiClient.get('/audit-logs', { params });
    return response;
  },

  /**
   * Get audit log statistics
   * @param {import('../types/audit-log').AuditLogQueryParams} [params] - Optional query parameters
   * @returns {Promise<import('../types/audit-log').AuditStatsResponse>}
   */
  getStats: async (params = {}) => {
    const response = await apiClient.get('/audit-logs/stats', { params });
    return response;
  },

  /**
   * Export logs to CSV
   * @param {import('../types/audit-log').AuditLogQueryParams} params - Query parameters
   * @returns {Promise<void>}
   */
  exportLogs: async (params = {}) => {
    const response = await apiClient.get('/audit-logs/export', {
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

  /**
   * Get available operations
   * @returns {Promise<string[]>}
   */
  getAvailableOperations: async () => {
    const response = await apiClient.get('/audit-logs/operations');
    return response.data || [];
  },

  /**
   * Get available log types
   * @returns {Promise<string[]>}
   */
  getAvailableTypes: async () => {
    const response = await apiClient.get('/audit-logs/types');
    return response.data || [];
  },
};

export default auditLogService;
