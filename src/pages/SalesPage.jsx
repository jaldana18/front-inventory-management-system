import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Stack,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CheckCircle,
  Cancel as CancelIcon,
  Receipt as ReceiptIcon,
  PointOfSale as SalesIcon,
} from '@mui/icons-material';
import { useSales, useCancelSale } from '../hooks/useSales';
import { useSalesStore } from '../store/salesStore';
import { useLanguage } from '../context/LanguageContext';
import { useDebounce } from '../hooks/useDebounce';
import { useLocation } from 'react-router-dom';
import SaleFormDialog from '../components/sales/SaleFormDialog';
import SaleDetailDialog from '../components/sales/SaleDetailDialog';

const SalesPage = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSaleId, setSelectedSaleId] = useState(null);

  // Zustand store
  const {
    sales: { filters, pagination, activeTab },
    setSaleFilters,
    setSalePagination,
    setSelectedSale,
    setSaleDialogOpen,
    setSaleDetailDialogOpen,
    setSaleActiveTab,
    sales: { dialogOpen, detailDialogOpen, selectedSale },
  } = useSalesStore();

  // Debounce search
  const debouncedSearch = useDebounce(filters.search, 500);

  // Queries
  const {
    data: salesData,
    isLoading,
    error,
  } = useSales({
    search: debouncedSearch,
    saleType: activeTab !== 'all' ? activeTab : undefined,
    status: filters.status || undefined,
    paymentStatus: filters.paymentStatus || undefined,
    warehouseId: filters.warehouseId || undefined,
    customerId: filters.customerId || undefined,
    page: pagination.page,
    limit: pagination.pageSize,
  });

  const cancelSaleMutation = useCancelSale();

  // Leer query param y actualizar tab activo
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabFromUrl = searchParams.get('tab');

    if (tabFromUrl && ['all', 'invoice', 'quote', 'remission', 'credit_note'].includes(tabFromUrl)) {
      setSaleActiveTab(tabFromUrl);
    }
  }, [location.search, setSaleActiveTab]);

  // Handlers
  const handleSearchChange = (event) => {
    setSaleFilters({ search: event.target.value });
    setSalePagination({ page: 1 });
  };

  const handleTabChange = (event, newValue) => {
    setSaleActiveTab(newValue);
    setSalePagination({ page: 1 });
  };

  const handlePageChange = (event, newPage) => {
    setSalePagination({ page: newPage + 1 });
  };

  const handleRowsPerPageChange = (event) => {
    setSalePagination({
      pageSize: parseInt(event.target.value, 10),
      page: 1,
    });
  };

  const handleMenuOpen = (event, sale) => {
    setAnchorEl(event.currentTarget);
    setSelectedSaleId(sale.id);
    setSelectedSale(sale);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddSale = () => {
    setSelectedSale(null);
    setSaleDialogOpen(true);
  };

  const handleViewSale = () => {
    setSaleDetailDialogOpen(true);
    handleMenuClose();
  };

  const handleCancelSale = () => {
    if (window.confirm(`¿Estás seguro de cancelar la venta ${selectedSale?.saleNumber}?`)) {
      cancelSaleMutation.mutate(selectedSaleId);
    }
    handleMenuClose();
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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
          Inventario
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Gestiona tus ventas, cotizaciones y documentos
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minHeight: '80px',
              alignItems: 'flex-start',
              textTransform: 'none',
            }
          }}
        >
          <Tab
            label="TODAS"
            value="all"
            sx={{ fontWeight: 600 }}
          />
          <Tab
            icon={<ReceiptIcon sx={{ fontSize: 20 }} />}
            iconPosition="start"
            label={
              <Box sx={{ textAlign: 'left', ml: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  FACTURAS / VENTAS
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  VENTAS CONFIRMADAS QUE REDUCEN INVENTARIO
                </Typography>
              </Box>
            }
            value="invoice"
          />
          <Tab
            icon={<ReceiptIcon sx={{ fontSize: 20 }} />}
            iconPosition="start"
            label={
              <Box sx={{ textAlign: 'left', ml: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  COTIZACIONES
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  PROPUESTAS SIN AFECTAR INVENTARIO
                </Typography>
              </Box>
            }
            value="quote"
          />
          <Tab
            icon={<ReceiptIcon sx={{ fontSize: 20 }} />}
            iconPosition="start"
            label={
              <Box sx={{ textAlign: 'left', ml: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  REMISIONES
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  GUÍAS DE DESPACHO
                </Typography>
              </Box>
            }
            value="remission"
          />
          <Tab
            icon={<ReceiptIcon sx={{ fontSize: 20 }} />}
            iconPosition="start"
            label={
              <Box sx={{ textAlign: 'left', ml: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  NOTAS CRÉDITO
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  DEVOLUCIONES Y AJUSTES
                </Typography>
              </Box>
            }
            value="credit_note"
          />
        </Tabs>
      </Box>

      {/* Info Banner según tipo de documento */}
      {activeTab === 'invoice' && (
        <Alert
          severity="success"
          icon={<CheckCircle fontSize="small" />}
          sx={{
            mb: 2,
            backgroundColor: 'rgba(46, 125, 50, 0.1)',
            borderLeft: '4px solid',
            borderColor: 'success.main',
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            Facturas / Ventas - Documentos de Venta Confirmada
          </Typography>
          <Stack direction="row" spacing={3} flexWrap="wrap">
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              ☑ Reduce inventario automáticamente
            </Typography>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              📅 Afecta stock en bodega
            </Typography>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              💵 Genera cuenta por cobrar
            </Typography>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              📊 Se registra en reportes de ventas
            </Typography>
          </Stack>
        </Alert>
      )}

      {/* Filters and Actions */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <TextField
          placeholder="Buscar ventas..."
          value={filters.search}
          onChange={handleSearchChange}
          size="medium"
          sx={{ maxWidth: 400 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />
        <Box sx={{ flex: 1 }} />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddSale}
          sx={{
            textTransform: 'none',
            px: 3,
            py: 1,
            fontWeight: 600,
          }}
        >
          + Nueva Venta
        </Button>
      </Box>

      {/* Statistics */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Paper sx={{ p: 3, flex: 1, bgcolor: 'background.default' }}>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: '0.875rem' }}>
            Total Ventas
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {salesData?.data?.pagination?.total || 0}
          </Typography>
        </Paper>
        <Paper sx={{ p: 3, flex: 1, bgcolor: 'background.default' }}>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: '0.875rem' }}>
            Confirmadas
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
            {Array.isArray(salesData?.data?.items)
              ? salesData.data.items.filter((s) => s.status === 'confirmed')?.length
              : 0}
          </Typography>
        </Paper>
        <Paper sx={{ p: 3, flex: 1, bgcolor: 'background.default' }}>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: '0.875rem' }}>
            Total Monto
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {formatCurrency(
              Array.isArray(salesData?.data?.items)
                ? salesData.data.items.reduce((sum, sale) => sum + (sale.total || 0), 0)
                : 0
            )}
          </Typography>
        </Paper>
      </Stack>

      {/* Table */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            Error al cargar ventas: {error.message}
          </Alert>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default' }}>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Número
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Tipo
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Cliente
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Fecha
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Total
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Estado
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Pago
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : salesData?.data?.items?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <Typography variant="body2" color="text.secondary">
                      No se encontraron ventas
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                salesData?.data?.items?.map((sale) => (
                  <TableRow key={sale.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {sale.saleNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getSaleTypeLabel(sale.saleType)}
                        color={getSaleTypeColor(sale.saleType)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {sale.customer?.firstName} {sale.customer?.lastName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(sale.saleDate).toLocaleDateString('es-CO')}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatCurrency(sale.total)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(sale.status)}
                        color={getStatusColor(sale.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getPaymentStatusLabel(sale.paymentStatus)}
                        color={getPaymentStatusColor(sale.paymentStatus)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, sale)}>
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={salesData?.data?.pagination?.total || 0}
          page={(pagination.page || 1) - 1}
          onPageChange={handlePageChange}
          rowsPerPage={pagination.pageSize || 10}
          onRowsPerPageChange={handleRowsPerPageChange}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
      </Paper>

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleViewSale}>
          <ViewIcon fontSize="small" sx={{ mr: 1 }} />
          Ver Detalles
        </MenuItem>
        {selectedSale?.status === 'draft' && (
          <MenuItem onClick={handleCancelSale} sx={{ color: 'error.main' }}>
            <CancelIcon fontSize="small" sx={{ mr: 1 }} />
            Cancelar Venta
          </MenuItem>
        )}
      </Menu>

      {/* Dialogs */}
      <SaleFormDialog />
      <SaleDetailDialog />
    </Box>
  );
};

export default SalesPage;
