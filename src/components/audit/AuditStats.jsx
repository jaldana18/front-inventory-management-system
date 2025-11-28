import { Stack, Paper, Typography, Skeleton } from '@mui/material';
import { useAuditStats } from '../../hooks/useAuditLogs';

/**
 * AuditStats Component
 * Displays statistics cards for audit logs
 */
export const AuditStats = ({ filters = {} }) => {
  const { stats, loading } = useAuditStats(filters);

  if (loading) {
    return (
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="rounded" height={100} sx={{ flex: 1 }} />
        ))}
      </Stack>
    );
  }

  const statCards = [
    {
      label: 'Total Operaciones',
      value: stats?.totalLogs || 0,
      color: 'text.primary',
    },
    {
      label: 'Últimas 24h',
      value: stats?.last24Hours || 0,
      color: 'primary.main',
    },
    {
      label: 'Últimos 7 días',
      value: stats?.last7Days || 0,
      color: 'info.main',
    },
    {
      label: 'Errores',
      value: stats?.byLevel?.error || 0,
      color: 'error.main',
    },
  ];

  return (
    <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
      {statCards.map((stat, index) => (
        <Paper key={index} sx={{ p: 3, flex: 1, bgcolor: 'background.default' }}>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: '0.875rem' }}>
            {stat.label}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color }}>
            {stat.value.toLocaleString('es-CO')}
          </Typography>
        </Paper>
      ))}
    </Stack>
  );
};
