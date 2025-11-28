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
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  CreditCard as CreditCardIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { useSalesStore } from '../../store/salesStore';
import { useLanguage } from '../../context/LanguageContext';
import { useCustomerBalance, useCustomerSalesHistory } from '../../hooks/useCustomers';

const CustomerDetailDialog = () => {
  const { t } = useLanguage();
  const {
    customers: { detailDialogOpen, selectedCustomer },
    setCustomerDetailDialogOpen,
  } = useSalesStore();

  const { data: balanceData } = useCustomerBalance(selectedCustomer?.id, {
    enabled: detailDialogOpen && !!selectedCustomer,
  });

  const { data: salesHistoryData, isLoading: loadingSales } = useCustomerSalesHistory(
    selectedCustomer?.id,
    { page: 1, limit: 5 },
    { enabled: detailDialogOpen && !!selectedCustomer }
  );

  const handleClose = () => {
    setCustomerDetailDialogOpen(false);
  };

  if (!selectedCustomer) return null;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  const getCustomerTypeLabel = (type) => {
    const typeMap = {
      retail: 'Minorista',
      wholesale: 'Mayorista',
      vip: 'VIP',
      distributor: 'Distribuidor',
    };
    return typeMap[type] || type;
  };

  const getCustomerTypeColor = (type) => {
    const colorMap = {
      retail: 'default',
      wholesale: 'primary',
      vip: 'secondary',
      distributor: 'success',
    };
    return colorMap[type] || 'default';
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
              {t('customerDetails')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Información completa del cliente
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {/* Header with Customer Name and Status */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                {selectedCustomer.name}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={getCustomerTypeLabel(selectedCustomer.customerType)}
                  size="small"
                  color={getCustomerTypeColor(selectedCustomer.customerType)}
                />
              </Stack>
            </Box>
            <Chip
              label={selectedCustomer.isActive ? 'Activo' : 'Inactivo'}
              color={selectedCustomer.isActive ? 'success' : 'default'}
            />
          </Stack>
        </Box>

        {/* Document Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            Información de Identificación
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">
                {t('documentType')}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {selectedCustomer.documentType}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">
                {t('documentNumber')}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {selectedCustomer.documentNumber}
              </Typography>
            </Grid>
            {selectedCustomer.taxResponsible && (
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Responsable de IVA
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Sí
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Contact Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            Información de Contacto
          </Typography>
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <EmailIcon fontSize="small" color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t('email')}
                </Typography>
                <Typography variant="body1">{selectedCustomer.email}</Typography>
              </Box>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <PhoneIcon fontSize="small" color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t('phone')}
                </Typography>
                <Typography variant="body1">{selectedCustomer.phone}</Typography>
              </Box>
            </Stack>
            {selectedCustomer.address && (
              <Stack direction="row" alignItems="flex-start" spacing={1}>
                <LocationIcon fontSize="small" color="action" sx={{ mt: 0.5 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t('address')}
                  </Typography>
                  <Typography variant="body1">{selectedCustomer.address}</Typography>
                  {(selectedCustomer.city || selectedCustomer.state || selectedCustomer.country) && (
                    <Typography variant="body2" color="text.secondary">
                      {[selectedCustomer.city, selectedCustomer.state, selectedCustomer.country]
                        .filter(Boolean)
                        .join(', ')}
                    </Typography>
                  )}
                  {selectedCustomer.zipCode && (
                    <Typography variant="body2" color="text.secondary">
                      {t('zipCode')}: {selectedCustomer.zipCode}
                    </Typography>
                  )}
                </Box>
              </Stack>
            )}
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Financial Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            Información Financiera
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ p: 2, bgcolor: 'success.50', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Límite de Crédito
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {formatCurrency(selectedCustomer.creditLimit)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Saldo Actual
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'info.main' }}>
                  {formatCurrency(balanceData?.data?.balance || 0)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Notes */}
        {selectedCustomer.notes && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                {t('notes')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedCustomer.notes}
              </Typography>
            </Box>
          </>
        )}

        {/* Sales History */}
        <Divider sx={{ my: 2 }} />
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <ReceiptIcon fontSize="small" color="primary" />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Historial de Ventas (Últimas 5)
            </Typography>
          </Stack>
          {loadingSales ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : salesHistoryData?.data?.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {salesHistoryData.data.map((sale) => (
                    <TableRow key={sale.id} hover>
                      <TableCell>
                        {new Date(sale.createdAt).toLocaleDateString('es-CO')}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={sale.saleType}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(sale.total)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={sale.status}
                          size="small"
                          color={sale.status === 'confirmed' ? 'success' : 'default'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
              No hay ventas registradas
            </Typography>
          )}
        </Box>

        {/* Metadata */}
        <Divider sx={{ my: 2 }} />
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">
                Fecha de Registro
              </Typography>
              <Typography variant="body2">
                {new Date(selectedCustomer.createdAt).toLocaleDateString('es-CO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">
                Última Actualización
              </Typography>
              <Typography variant="body2">
                {new Date(selectedCustomer.updatedAt).toLocaleDateString('es-CO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} variant="contained">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomerDetailDialog;
