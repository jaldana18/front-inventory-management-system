import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Chip,
  Divider,
  Stack,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Close as CloseIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  CheckCircle as ConfirmIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { useSalesStore } from '../../store/salesStore';
import { useLanguage } from '../../context/LanguageContext';
import { usePaymentsBySale } from '../../hooks/usePayments';

const SaleDetailDialog = () => {
  const { t } = useLanguage();
  const {
    sales: { detailDialogOpen, selectedSale },
    setSaleDetailDialogOpen,
  } = useSalesStore();

  const { data: paymentsData } = usePaymentsBySale(selectedSale?.id, {
    enabled: detailDialogOpen && !!selectedSale,
  });

  const handleClose = () => {
    setSaleDetailDialogOpen(false);
  };

  if (!selectedSale) return null;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  const getSaleTypeLabel = (type) => {
    const labels = {
      invoice: t('invoice'),
      quote: t('quote'),
      remission: t('remission'),
      credit_note: t('creditNote'),
    };
    return labels[type] || type;
  };

  const getSaleTypeColor = (type) => {
    const colors = {
      invoice: 'primary',
      quote: 'info',
      remission: 'warning',
      credit_note: 'error',
    };
    return colors[type] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      draft: t('draft'),
      confirmed: t('confirmed'),
      cancelled: t('cancelled'),
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      confirmed: 'success',
      cancelled: 'error',
    };
    return colors[status] || 'default';
  };

  const getPaymentStatusLabel = (status) => {
    const labels = {
      pending: t('pending'),
      partial: t('partial'),
      paid: t('paid'),
    };
    return labels[status] || status;
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      partial: 'info',
      paid: 'success',
    };
    return colors[status] || 'default';
  };

  return (
    <Dialog
      open={detailDialogOpen}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Detalle de Venta
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedSale.saleNumber}
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {/* Header with Status */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                {formatCurrency(selectedSale.total)}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip label={getSaleTypeLabel(selectedSale.saleType)} color={getSaleTypeColor(selectedSale.saleType)} size="small" />
                <Chip label={getStatusLabel(selectedSale.status)} color={getStatusColor(selectedSale.status)} size="small" />
                <Chip
                  label={getPaymentStatusLabel(selectedSale.paymentStatus)}
                  color={getPaymentStatusColor(selectedSale.paymentStatus)}
                  size="small"
                />
              </Stack>
            </Box>
          </Stack>
        </Box>

        {/* Sale Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            Información de la Venta
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">
                Cliente
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {selectedSale.customer?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedSale.customer?.documentType}: {selectedSale.customer?.documentNumber}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">
                Almacén
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {selectedSale.warehouse?.name}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">
                Fecha de Venta
              </Typography>
              <Typography variant="body1">
                {new Date(selectedSale.saleDate).toLocaleDateString('es-CO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Typography>
            </Grid>
            {selectedSale.dueDate && (
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Fecha de Vencimiento
                </Typography>
                <Typography variant="body1">
                  {new Date(selectedSale.dueDate).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Items */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            Productos
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Producto</TableCell>
                  <TableCell align="right">Cantidad</TableCell>
                  <TableCell align="right">Precio Unit.</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedSale.items?.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {item.product?.name || item.productName}
                      </Typography>
                      {item.product?.sku && (
                        <Typography variant="caption" color="text.secondary">
                          SKU: {item.product.sku}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatCurrency(item.subtotal)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Totals */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Box sx={{ width: 300 }}>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Subtotal:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatCurrency(selectedSale.subtotal)}
                </Typography>
              </Box>
              {selectedSale.totalTax > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Impuestos:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatCurrency(selectedSale.totalTax)}
                  </Typography>
                </Box>
              )}
              {selectedSale.totalDiscount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Descuentos:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                    -{formatCurrency(selectedSale.totalDiscount)}
                  </Typography>
                </Box>
              )}
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Total:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {formatCurrency(selectedSale.total)}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Box>

        {/* Payment Information */}
        {selectedSale.paymentStatus !== 'paid' && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Estado de Pago
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ p: 2, bgcolor: 'success.50', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Monto Pagado
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                      {formatCurrency(selectedSale.paidAmount || 0)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ p: 2, bgcolor: 'warning.50', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Saldo Pendiente
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'warning.main' }}>
                      {formatCurrency(selectedSale.balance || 0)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Total
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'info.main' }}>
                      {formatCurrency(selectedSale.total)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </>
        )}

        {/* Payment History */}
        {paymentsData?.data && paymentsData.data.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Historial de Pagos
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Método</TableCell>
                      <TableCell align="right">Monto</TableCell>
                      <TableCell>Referencia</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paymentsData.data.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {new Date(payment.paymentDate).toLocaleDateString('es-CO')}
                        </TableCell>
                        <TableCell>{payment.paymentMethod?.name}</TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                            {formatCurrency(payment.amount)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {payment.reference || '-'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </>
        )}

        {/* Notes */}
        {selectedSale.notes && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                {t('notes')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedSale.notes}
              </Typography>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose}>Cerrar</Button>
        <Button startIcon={<PrintIcon />} variant="outlined">
          Imprimir
        </Button>
        {selectedSale.paymentStatus !== 'paid' && (
          <Button startIcon={<PaymentIcon />} variant="contained">
            Registrar Pago
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SaleDetailDialog;
