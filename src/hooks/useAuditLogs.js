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
  }, [
    filters.page,
    filters.limit,
    filters.startDate,
    filters.endDate,
    filters.userId,
    filters.search,
    filters.action,
    filters.entityType,
    filters.entityId,
    filters.severity,
    filters.module,
    filters.sortOrder,
    filters.companyId,
  ]);

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
 * @param {Object} [filters] - Optional query filters (startDate, endDate, companyId)
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
  }, [filters.startDate, filters.endDate, filters.companyId]);

  return { stats, loading, error };
};

/**
 * Hook to fetch entity history
 * @param {string} entityType - Type of entity
 * @param {number} entityId - Entity ID
 * @param {Object} [params] - Additional query parameters
 * @returns {Object} Entity history state
 */
export const useEntityHistory = (entityType, entityId, params = {}) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    if (!entityType || !entityId) {
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await auditLogService.getEntityHistory(entityType, entityId, params);
        setHistory(response.data?.logs || []);
        setPagination(response.data?.pagination || {
          page: 1,
          limit: 50,
          total: 0,
          totalPages: 0,
        });
      } catch (err) {
        setError(err);
        console.error('Error fetching entity history:', err);
        toast.error('Error al cargar el historial de la entidad');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [entityType, entityId, params]);

  return { history, loading, error, pagination };
};

/**
 * Hook to fetch user activity
 * @param {number} userId - User ID
 * @param {Object} [params] - Additional query parameters
 * @returns {Object} User activity state
 */
export const useUserActivity = (userId, params = {}) => {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchActivity = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await auditLogService.getUserActivity(userId, params);
        setActivity(response.data?.logs || []);
        setPagination(response.data?.pagination || {
          page: 1,
          limit: 50,
          total: 0,
          totalPages: 0,
        });
      } catch (err) {
        setError(err);
        console.error('Error fetching user activity:', err);
        toast.error('Error al cargar la actividad del usuario');
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [userId, params]);

  return { activity, loading, error, pagination };
};

/**
 * Hook to get available filter options from backend
 * @returns {Object} Filter options state
 */
export const useAvailableFilters = () => {
  const [actions, setActions] = useState([]);
  const [entityTypes, setEntityTypes] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [actionsData, entityTypesData, modulesData] = await Promise.all([
          auditLogService.getAvailableActions(),
          auditLogService.getAvailableEntityTypes(),
          auditLogService.getAvailableModules(),
        ]);
        setActions(actionsData);
        setEntityTypes(entityTypesData);
        setModules(modulesData);
      } catch (err) {
        console.error('Error fetching filter options:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilters();
  }, []);

  return { actions, entityTypes, modules, loading };
};
