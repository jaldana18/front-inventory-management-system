import { useState } from 'react';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { AuditStats } from '../components/audit/AuditStats';
import { AuditFilters } from '../components/audit/AuditFilters';
import { AuditLogTable } from '../components/audit/AuditLogTable';
import { AuditLogDetails } from '../components/audit/AuditLogDetails';
import { useAuditLogs } from '../hooks/useAuditLogs';

/**
 * AuditLogsPage Component
 * Main page for viewing and filtering audit logs
 */
const AuditLogsPage = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    sortOrder: 'desc',
  });
  const [selectedLog, setSelectedLog] = useState(null);

  const { logs, loading, error, pagination, refetch, exportLogs } =
    useAuditLogs(filters);

  const handleFilterChange = (newFilters) => {
    setFilters({ ...newFilters, page: 1 });
  };

  const handlePageChange = (page, limit) => {
    setFilters((prev) => ({
      ...prev,
      page,
      limit: limit || prev.limit,
    }));
  };

  const handleExport = async () => {
    try {
      await exportLogs(filters);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const handleLogClick = (log) => {
    setSelectedLog(log);
  };

  const handleCloseDetails = () => {
    setSelectedLog(null);
  };

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 2,
        }}
      >
        <Typography variant="h6" color="error">
          Error al cargar los logs de auditoría
        </Typography>
        <Button variant="contained" onClick={refetch}>
          Reintentar
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
          Auditoría de Operaciones
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Historial completo de operaciones realizadas en el sistema
        </Typography>
      </Box>

      {/* Statistics */}
      <AuditStats filters={filters} />

      {/* Filters */}
      <AuditFilters
        onFilterChange={handleFilterChange}
        initialFilters={filters}
      />

      {/* Export Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
          disabled={loading || logs.length === 0}
          sx={{
            textTransform: 'none',
            px: 3,
            py: 1,
            fontWeight: 600,
          }}
        >
          Exportar CSV
        </Button>
      </Box>

      {/* Loading State */}
      {loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 400,
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        /* Results Table */
        <AuditLogTable
          logs={logs}
          pagination={pagination}
          onPageChange={handlePageChange}
          onLogClick={handleLogClick}
        />
      )}

      {/* Details Modal */}
      {selectedLog && (
        <AuditLogDetails log={selectedLog} onClose={handleCloseDetails} />
      )}
    </Box>
  );
};

export default AuditLogsPage;
