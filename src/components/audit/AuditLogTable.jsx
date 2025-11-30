import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  getOperationIcon,
  getOperationLabel,
  formatAuditDate,
  getLogLevelBadgeColor,
  formatCurrency,
  formatNumber,
} from '../../utils/auditHelpers';

/**
 * Render details preview based on operation type
 */
const renderDetailsPreview = (log) => {
  // Validar que details sea un objeto
  const details = typeof log.details === 'object' && log.details !== null ? log.details : {};

  switch (log.operation || log.event) {
    case 'sale_created':
    case 'sale_confirmed':
      return (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {details.saleNumber || '-'}
          </Typography>
          <Typography variant="caption" color="success.main">
            Total: {formatCurrency(details.total || 0)}
          </Typography>
        </Box>
      );

    case 'bulk_inventory_upload':
      return (
        <Box>
          <Typography variant="body2">
            {formatNumber(details.totalRows || 0)} productos
          </Typography>
          <Typography variant="caption" color="success.main">
            {formatNumber(details.successCount || 0)} exitosos
          </Typography>
        </Box>
      );

    case 'payment_created':
      return (
        <Box>
          <Typography variant="body2" color="success.main" fontWeight={600}>
            {formatCurrency(details.amount || 0)}
          </Typography>
          <Typography variant="caption">
            Método: {details.paymentMethod || '-'}
          </Typography>
        </Box>
      );

    case 'product_created':
    case 'product_auto_created':
      return (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {details.sku || '-'}
          </Typography>
          <Typography variant="caption">{details.name || '-'}</Typography>
        </Box>
      );

    case 'warehouse_transfer':
      return (
        <Box>
          <Typography variant="body2">
            {formatNumber(details.quantity || 0)} unidades
          </Typography>
          <Typography variant="caption">
            De: Almacén #{details.fromWarehouseId || '-'} → Almacén #
            {details.toWarehouseId || '-'}
          </Typography>
        </Box>
      );

    default:
      return (
        <Typography variant="body2" color="text.secondary">
          {typeof log.message === 'string' ? log.message : 'Sin detalles'}
        </Typography>
      );
  }
};

/**
 * AuditLogTable Component
 * Displays audit logs in a table format
 */
export const AuditLogTable = ({
  logs,
  pagination,
  onPageChange,
  onLogClick,
}) => {
  const handleChangePage = (event, newPage) => {
    onPageChange(newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    const newLimit = parseInt(event.target.value, 10);
    onPageChange(1, newLimit);
  };

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'background.default' }}>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', width: '15%' }}>
                Fecha/Hora
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', width: '12%' }}>
                Usuario
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', width: '10%' }}>
                Nivel
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', width: '18%' }}>
                Operación
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', width: '35%' }}>
                Detalles
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', width: '10%' }} align="center">
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Typography variant="body1" color="text.secondary">
                    No se encontraron registros
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log, index) => {
                const levelColors = getLogLevelBadgeColor(log.level);
                // Extraer datos del log de forma segura
                const logId = log.id || log._id || `log-${index}`;
                const timestamp = log.timestamp || log.createdAt || new Date().toISOString();
                const operation = log.operation || log.event || 'unknown';
                const userEmail = typeof log.details === 'object' ? log.details?.email : log.email;
                const userId = log.userId;
                const level = log.level || 'info';
                
                return (
                  <TableRow
                    key={logId}
                    hover
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'grey.50' },
                    }}
                    onClick={() => onLogClick(log)}
                  >
                    <TableCell>
                      <Typography variant="body2">
                        {formatAuditDate(timestamp)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {userEmail || (userId ? `Usuario #${userId}` : '-')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={String(level).toUpperCase()}
                        size="small"
                        sx={{
                          backgroundColor: levelColors.bg,
                          color: levelColors.text,
                          fontWeight: 600,
                          fontSize: '0.688rem',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span style={{ fontSize: '1.25rem' }}>
                          {getOperationIcon(operation)}
                        </span>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {getOperationLabel(operation)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{renderDetailsPreview(log)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Ver detalles">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onLogClick(log);
                          }}
                          sx={{
                            color: 'primary.main',
                            '&:hover': {
                              backgroundColor: 'primary.light',
                              color: 'primary.dark',
                            },
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {logs.length > 0 && (
        <TablePagination
          component="div"
          count={pagination.total || 0}
          page={(pagination.page || 1) - 1}
          onPageChange={handleChangePage}
          rowsPerPage={pagination.limit || 50}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
      )}
    </Paper>
  );
};
