import { useState, useEffect } from 'react';
import { auditLogService } from '../services/auditLog.service';
import toast from 'react-hot-toast';

/**
 * Hook to fetch and manage audit logs
 * @param {import('../types/audit-log').AuditLogQueryParams} filters - Query filters
 * @returns {Object} Audit logs state and actions
 */
export const useAuditLogs = (filters = {}) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
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
      console.log('🔍 Audit Logs Response:', response);
      console.log('📊 Logs data:', response.data?.logs);
      setLogs(response.data?.logs || []);
      setPagination(response.data?.pagination || {
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 0,
      });
    } catch (err) {
      setError(err);
      console.error('Error fetching audit logs:', err);
      toast.error('Error al cargar los logs de auditoría');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.limit, filters.startDate, filters.endDate, filters.userId, filters.search, filters.operation, filters.type, filters.level, filters.sortOrder]);

  const exportLogs = async (exportFilters) => {
    try {
      await auditLogService.exportLogs(exportFilters);
      toast.success('Logs exportados exitosamente');
    } catch (err) {
      console.error('Error exporting logs:', err);
      toast.error('Error al exportar los logs');
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

/**
 * Hook to fetch audit log statistics
 * @param {import('../types/audit-log').AuditLogQueryParams} [filters] - Optional query filters
 * @returns {Object} Statistics state
 */
export const useAuditStats = (filters = {}) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await auditLogService.getStats(filters);
        setStats(response.data || null);
      } catch (err) {
        setError(err);
        console.error('Error fetching audit stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.startDate, filters.endDate]);

  return { stats, loading, error };
};

/**
 * Hook to get available operations
 * @returns {Object} Operations state
 */
export const useAvailableOperations = () => {
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOperations = async () => {
      try {
        const data = await auditLogService.getAvailableOperations();
        setOperations(data);
      } catch (err) {
        console.error('Error fetching operations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOperations();
  }, []);

  return { operations, loading };
};
