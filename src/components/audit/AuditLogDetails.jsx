import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Chip,
  Divider,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {
  getOperationIcon,
  getOperationLabel,
  formatAuditDate,
  getLogLevelBadgeColor,
  formatCurrency,
  formatNumber,
} from '../../utils/auditHelpers';

/**
 * Render operation-specific details
 */
const renderOperationDetails = (log) => {
  const details = log.details || {};

  switch (log.operation) {
    case 'sale_created':
    case 'sale_confirmed':
      return (
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              ID Venta
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {details.saleId || '-'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Número
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {details.saleNumber || '-'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Tipo
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {details.saleType || '-'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Total
            </Typography>
            <Typography variant="body2" fontWeight={600} color="success.main">
              {formatCurrency(details.total || 0)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Cliente
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              Cliente #{details.customerId || '-'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Almacén
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              Almacén #{details.warehouseId || '-'}
            </Typography>
          </Grid>
        </Grid>
      );

    case 'bulk_inventory_upload':
      return (
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Filas Procesadas
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {formatNumber(details.totalRows || 0)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Exitosos
            </Typography>
            <Typography variant="body2" fontWeight={600} color="success.main">
              {formatNumber(details.successCount || 0)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Errores
            </Typography>
            <Typography variant="body2" fontWeight={600} color="error.main">
              {formatNumber(details.errorCount || 0)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Productos Creados
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {formatNumber(details.productsCreated || 0)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Lotes Creados
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {formatNumber(details.batchesCreated || 0)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Cantidad Total
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {formatNumber(details.totalQuantity || 0)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Costo Total
            </Typography>
            <Typography variant="body2" fontWeight={600} color="primary.main">
              {formatCurrency(details.totalCost || 0)}
            </Typography>
          </Grid>
        </Grid>
      );

    case 'payment_created':
      return (
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              ID Pago
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {details.paymentId || '-'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Monto
            </Typography>
            <Typography variant="body2" fontWeight={600} color="success.main">
              {formatCurrency(details.amount || 0)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Método
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {details.paymentMethod || '-'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Venta
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {details.saleNumber || '-'}
            </Typography>
          </Grid>
        </Grid>
      );

    case 'product_created':
    case 'product_auto_created':
      return (
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              ID Producto
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {details.productId || '-'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              SKU
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {details.sku || '-'}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary">
              Nombre
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {details.name || '-'}
            </Typography>
          </Grid>
          {log.operation === 'product_auto_created' && details.rowNumber && (
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">
                Fila del Excel
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                Fila {details.rowNumber}
              </Typography>
            </Grid>
          )}
        </Grid>
      );

    case 'warehouse_transfer':
      return (
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Producto
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {details.productName || `Producto #${details.productId || '-'}`}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Cantidad
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {formatNumber(details.quantity || 0)} unidades
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Almacén Origen
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              Almacén #{details.fromWarehouseId || '-'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Almacén Destino
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              Almacén #{details.toWarehouseId || '-'}
            </Typography>
          </Grid>
        </Grid>
      );

    default:
      return (
        <Box
          sx={{
            p: 2,
            backgroundColor: 'grey.50',
            borderRadius: 1,
            fontFamily: 'monospace',
            fontSize: '0.813rem',
            overflow: 'auto',
            maxHeight: 300,
          }}
        >
          <pre>{JSON.stringify(details, null, 2)}</pre>
        </Box>
      );
  }
};

/**
 * AuditLogDetails Component
 * Modal to display detailed information about an audit log entry
 */
export const AuditLogDetails = ({ log, onClose }) => {
  if (!log) return null;

  const levelColors = getLogLevelBadgeColor(log.level);

  return (
    <Dialog
      open={Boolean(log)}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          pb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
          <span style={{ fontSize: '1.5rem' }}>
            {getOperationIcon(log.operation)}
          </span>
          <Typography variant="h6" fontWeight={600}>
            {getOperationLabel(log.operation)}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        {/* Basic Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
            Información Básica
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                📅 Fecha/Hora
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {formatAuditDate(log.timestamp)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                👤 Usuario
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {log.details?.email ||
                  (log.userId ? `Usuario #${log.userId}` : '-')}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                🏢 Empresa
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                Empresa #{log.companyId || '-'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Nivel
              </Typography>
              <Box>
                <Chip
                  label={log.level?.toUpperCase() || 'INFO'}
                  size="small"
                  sx={{
                    backgroundColor: levelColors.bg,
                    color: levelColors.text,
                    fontWeight: 600,
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">
                🆔 ID de Registro
              </Typography>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{ fontFamily: 'monospace', fontSize: '0.813rem' }}
              >
                {log.id}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Operation Details */}
        <Box>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
            📊 Detalles de la Operación
          </Typography>
          {renderOperationDetails(log)}
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
