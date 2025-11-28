import { useState } from 'react';
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
  Collapse,
  Grid,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Groups as CustomersIcon,
  FileDownload as ExportIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useCustomers, useDeleteCustomer } from '../hooks/useCustomers';
import { useSalesStore } from '../store/salesStore';
import { useLanguage } from '../context/LanguageContext';
import CustomerFormDialog from '../components/customers/CustomerFormDialog';
import CustomerDetailDialog from '../components/customers/CustomerDetailDialog';
import { useDebounce } from '../hooks/useDebounce';

const CustomersPage = () => {
  const { t } = useLanguage();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Zustand store
  const {
    customers: { filters, pagination },
    setCustomerFilters,
    setCustomerPagination,
    setSelectedCustomer,
    setCustomerDialogOpen,
    setCustomerDetailDialogOpen,
    customers: { dialogOpen, detailDialogOpen, selectedCustomer },
  } = useSalesStore();

  // Debounce search
  const debouncedSearch = useDebounce(filters.search, 500);

  // Queries
  const {
    data: customersData,
    isLoading,
    error,
  } = useCustomers({
    search: debouncedSearch,
    documentType: filters.documentType || undefined,
    type: filters.customerType || undefined,
    isActive: filters.isActive !== null ? filters.isActive : undefined,
    page: pagination.page,
    limit: pagination.pageSize,
  });

  const deleteCustomerMutation = useDeleteCustomer();

  // Handlers
  const handleSearchChange = (event) => {
    setCustomerFilters({ search: event.target.value });
    setCustomerPagination({ page: 1 });
  };

  const handlePageChange = (event, newPage) => {
    setCustomerPagination({ page: newPage + 1 });
  };

  const handleRowsPerPageChange = (event) => {
    setCustomerPagination({
      pageSize: parseInt(event.target.value, 10),
      page: 1,
    });
  };

  const handleMenuOpen = (event, customer) => {
    setAnchorEl(event.currentTarget);
    setSelectedCustomerId(customer.id);
    setSelectedCustomer(customer);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setCustomerDialogOpen(true);
  };

  const handleEditCustomer = () => {
    setCustomerDialogOpen(true);
    handleMenuClose();
  };

  const handleViewCustomer = () => {
    setCustomerDetailDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteCustomer = () => {
    if (window.confirm(`¿Estás seguro de eliminar al cliente ${selectedCustomer?.name}?`)) {
      deleteCustomerMutation.mutate(selectedCustomerId);
    }
    handleMenuClose();
  };

  const handleClearFilters = () => {
    setCustomerFilters({
      search: '',
      documentType: '',
      customerType: '',
      isActive: null,
    });
    setCustomerPagination({ page: 1 });
  };

  const handleExportData = () => {
    const dataToExport = Array.isArray(customersData?.data?.items)
      ? customersData.data.items
      : [];

    if (!dataToExport.length) {
      alert('No hay datos para exportar');
      return;
    }

    const csvContent = [
      ['Nombre', 'Tipo Documento', 'Número Documento', 'Email', 'Teléfono', 'Ciudad', 'Tipo Cliente', 'Estado'].join(','),
      ...dataToExport.map((customer) =>
        [
          customer.name,
          customer.documentType,
          customer.documentNumber,
          customer.email || '',
          customer.phone || '',
          customer.city || '',
          customer.customerType,
          customer.isActive ? 'Activo' : 'Inactivo',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `clientes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
          <CustomersIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {t('customers')}
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          Gestiona tu base de clientes
        </Typography>
      </Box>

      {/* Filters and Actions */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack spacing={2}>
          {/* Main Filter Row */}
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              placeholder={`${t('search')} clientes...`}
              value={filters.search}
              onChange={handleSearchChange}
              size="small"
              sx={{ flexGrow: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Tooltip title="Filtros avanzados">
              <Button
                variant="outlined"
                startIcon={showFilters ? <ExpandLessIcon /> : <FilterIcon />}
                onClick={() => setShowFilters(!showFilters)}
                size="small"
              >
                Filtros
              </Button>
            </Tooltip>
            <Tooltip title="Exportar a CSV">
              <Button
                variant="outlined"
                startIcon={<ExportIcon />}
                onClick={handleExportData}
                size="small"
              >
                Exportar
              </Button>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddCustomer}
            >
              {t('addCustomer')}
            </Button>
          </Stack>

          {/* Advanced Filters */}
          <Collapse in={showFilters}>
            <Box sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Tipo de Documento</InputLabel>
                    <Select
                      value={filters.documentType}
                      label="Tipo de Documento"
                      onChange={(e) => {
                        setCustomerFilters({ documentType: e.target.value });
                        setCustomerPagination({ page: 1 });
                      }}
                    >
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="CC">Cédula de Ciudadanía</MenuItem>
                      <MenuItem value="CE">Cédula de Extranjería</MenuItem>
                      <MenuItem value="NIT">NIT</MenuItem>
                      <MenuItem value="PASSPORT">Pasaporte</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Tipo de Cliente</InputLabel>
                    <Select
                      value={filters.customerType}
                      label="Tipo de Cliente"
                      onChange={(e) => {
                        setCustomerFilters({ customerType: e.target.value });
                        setCustomerPagination({ page: 1 });
                      }}
                    >
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="retail">Minorista</MenuItem>
                      <MenuItem value="wholesale">Mayorista</MenuItem>
                      <MenuItem value="vip">VIP</MenuItem>
                      <MenuItem value="distributor">Distribuidor</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Estado</InputLabel>
                    <Select
                      value={filters.isActive === null ? '' : filters.isActive.toString()}
                      label="Estado"
                      onChange={(e) => {
                        const value = e.target.value === '' ? null : e.target.value === 'true';
                        setCustomerFilters({ isActive: value });
                        setCustomerPagination({ page: 1 });
                      }}
                    >
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="true">Activo</MenuItem>
                      <MenuItem value="false">Inactivo</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    onClick={handleClearFilters}
                    fullWidth
                    size="small"
                  >
                    Limpiar Filtros
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </Stack>
      </Paper>

      {/* Statistics */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Paper
          sx={{
            p: 2.5,
            flex: 1,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                Total Clientes
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {customersData?.data?.pagination?.total || 0}
              </Typography>
            </Box>
            <CustomersIcon sx={{ fontSize: 48, opacity: 0.3 }} />
          </Stack>
        </Paper>
        <Paper
          sx={{
            p: 2.5,
            flex: 1,
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                Clientes Activos
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {Array.isArray(customersData?.data?.items)
                  ? customersData.data.items.filter((c) => c.isActive)?.length
                  : 0}
              </Typography>
            </Box>
            <CheckCircleIcon sx={{ fontSize: 48, opacity: 0.3 }} />
          </Stack>
        </Paper>
        <Paper
          sx={{
            p: 2.5,
            flex: 1,
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                Mayoristas/VIP
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {Array.isArray(customersData?.data?.items)
                  ? customersData.data.items.filter((c) => c.customerType === 'wholesale' || c.customerType === 'vip')?.length
                  : 0}
              </Typography>
            </Box>
            <StarIcon sx={{ fontSize: 48, opacity: 0.3 }} />
          </Stack>
        </Paper>
      </Stack>

      {/* Table */}
      <Paper>
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            Error al cargar clientes: {error.message}
          </Alert>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Cliente</TableCell>
                <TableCell>Documento</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : customersData?.data?.items?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography variant="body2" color="text.secondary">
                      No se encontraron clientes
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                customersData?.data?.items?.map((customer) => (
                  <TableRow key={customer.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {customer.name}
                    </Typography>
                    {customer.city && (
                      <Typography variant="caption" color="text.secondary">
                        {customer.city}
                      </Typography>
                    )}
                  </TableCell>
                    <TableCell>
                      <Typography variant="body2">{customer.documentType}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {customer.documentNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{customer.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{customer.phone}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getCustomerTypeLabel(customer.customerType)}
                        color={getCustomerTypeColor(customer.customerType)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={customer.isActive ? 'Activo' : 'Inactivo'}
                        color={customer.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, customer)}
                      >
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
          count={customersData?.data?.pagination?.total || 0}
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
        <MenuItem onClick={handleViewCustomer}>
          <ViewIcon fontSize="small" sx={{ mr: 1 }} />
          Ver Detalles
        </MenuItem>
        <MenuItem onClick={handleEditCustomer}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          {t('edit')}
        </MenuItem>
        <MenuItem onClick={handleDeleteCustomer} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          {t('delete')}
        </MenuItem>
      </Menu>

      {/* Dialogs */}
      <CustomerFormDialog />
      <CustomerDetailDialog />
    </Box>
  );
};

export default CustomersPage;
