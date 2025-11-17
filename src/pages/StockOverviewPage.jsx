import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Grid,
  Card,
  CardContent,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  TablePagination,
  Collapse,
  Stack,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Warehouse as WarehouseIcon,
  TrendingDown as LowStockIcon,
  Inventory as InventoryIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  GetApp as ExportIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { inventoryService } from '../services/inventory.service';
import { warehouseService } from '../services/warehouse.service';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/useAuth';
import toast from 'react-hot-toast';

export default function StockOverviewPage() {
  const { t } = useLanguage();
  const { userRole, userWarehouseId } = useAuth();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');
  const [stockFilter, setStockFilter] = useState('all'); // all, low, out
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Fetch warehouses
  const { data: warehousesData } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => warehouseService.getAll(),
  });

  // Fetch inventory with stock data
  const {
    data: inventoryData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['stock-overview'],
    queryFn: () => inventoryService.getAll(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const warehouses = useMemo(() => {
    const rawData = warehousesData?.data?.items || warehousesData?.data || warehousesData || [];
    const list = Array.isArray(rawData) ? rawData : [];
    // Filter by user warehouse if user role
    if (userRole === 'user' && userWarehouseId) {
      return list.filter((w) => w.id === userWarehouseId);
    }
    return list;
  }, [warehousesData, userRole, userWarehouseId]);

  // Process inventory data
  const processedData = useMemo(() => {
    const rawItems = inventoryData?.data?.items || inventoryData?.data || [];
    const items = Array.isArray(rawItems) ? rawItems : [];
    
    if (!Array.isArray(warehouses) || warehouses.length === 0) {
      return items.map((product) => ({
        ...product,
        stockByWarehouse: [],
        totalStock: product.quantity || product.currentStock || 0,
      }));
    }
    
    return items.map((product) => {
      // Calculate stock per warehouse and total
      const stockByWarehouse = warehouses.map((warehouse) => {
        // Check if product has stock array or use direct quantity
        let currentStock = 0;
        
        if (product.stock && Array.isArray(product.stock)) {
          const warehouseStock = product.stock.find((s) => s.warehouseId === warehouse.id);
          currentStock = warehouseStock?.currentStock || 0;
        } else if (product.quantity !== undefined) {
          // Fallback: distribute total quantity (simplified)
          currentStock = product.quantity || 0;
        } else if (product.currentStock !== undefined) {
          currentStock = product.currentStock || 0;
        }
        
        return {
          warehouseId: warehouse.id,
          warehouseName: warehouse.name,
          warehouseCode: warehouse.code,
          currentStock: currentStock,
        };
      });

      const totalStock = stockByWarehouse.reduce((sum, w) => sum + w.currentStock, 0);

      return {
        ...product,
        stockByWarehouse,
        totalStock: totalStock || product.quantity || product.currentStock || 0,
      };
    });
  }, [inventoryData, warehouses]);

  // Filtered data
  const filteredData = useMemo(() => {
    let filtered = processedData;

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name?.toLowerCase().includes(search) ||
          item.sku?.toLowerCase().includes(search) ||
          item.category?.toLowerCase().includes(search)
      );
    }

    // Warehouse filter
    if (selectedWarehouse !== 'all') {
      filtered = filtered.filter((item) =>
        item.stockByWarehouse?.some(
          (w) => w.warehouseId === selectedWarehouse && w.currentStock > 0
        )
      );
    }

    // Stock level filter
    if (stockFilter === 'low') {
      filtered = filtered.filter((item) => item.totalStock > 0 && item.totalStock < 20);
    } else if (stockFilter === 'out') {
      filtered = filtered.filter((item) => item.totalStock === 0);
    }

    return filtered;
  }, [processedData, searchTerm, selectedWarehouse, stockFilter]);

  // Summary stats
  const summaryStats = useMemo(() => {
    return {
      totalProducts: processedData.length,
      totalStock: processedData.reduce((sum, p) => sum + p.totalStock, 0),
      lowStockCount: processedData.filter((p) => p.totalStock > 0 && p.totalStock < 20).length,
      outOfStockCount: processedData.filter((p) => p.totalStock === 0).length,
    };
  }, [processedData]);

  // Handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const toggleRowExpansion = (productId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedRows(newExpanded);
  };

  const getStockChipProps = (stock) => {
    if (stock === 0) return { label: t('outOfStock') || 'Sin Stock', color: 'error' };
    if (stock < 10) return { label: t('critical') || 'Crítico', color: 'error' };
    if (stock < 20) return { label: t('low') || 'Bajo', color: 'warning' };
    return { label: t('available') || 'Disponible', color: 'success' };
  };

  const handleExport = () => {
    toast.info(t('exportFeatureComingSoon') || 'Función de exportación próximamente');
  };

  const handleRefresh = () => {
    refetch();
    toast.success(t('dataRefreshed') || 'Datos actualizados');
  };

  if (error) {
    return (
      <Alert severity="error">
        {t('errorLoadingData') || 'Error al cargar datos'}: {error.message}
      </Alert>
    );
  }

  // Paginated data
  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 1,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('stockOverview') || 'Resumen de Stock'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('viewStockAcrossWarehouses') || 'Visualiza y gestiona el stock en todos los almacenes'}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title={t('refresh') || 'Actualizar'}>
            <IconButton onClick={handleRefresh} disabled={isLoading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('export') || 'Exportar'}>
            <IconButton onClick={handleExport}>
              <ExportIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    bgcolor: 'primary.light',
                    borderRadius: 2,
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <InventoryIcon sx={{ color: 'primary.main', fontSize: 32 }} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t('totalProducts') || 'Total de Productos'}
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {summaryStats.totalProducts}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    bgcolor: 'info.light',
                    borderRadius: 2,
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <WarehouseIcon sx={{ color: 'info.main', fontSize: 32 }} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t('totalStock') || 'Stock Total'}
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {summaryStats.totalStock.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              cursor: 'pointer',
              '&:hover': { boxShadow: 3 },
            }}
            onClick={() => setStockFilter('low')}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    bgcolor: 'warning.light',
                    borderRadius: 2,
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <LowStockIcon sx={{ color: 'warning.main', fontSize: 32 }} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t('lowStock') || 'Stock Bajo'}
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="warning.main">
                    {summaryStats.lowStockCount}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              cursor: 'pointer',
              '&:hover': { boxShadow: 3 },
            }}
            onClick={() => setStockFilter('out')}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    bgcolor: 'error.light',
                    borderRadius: 2,
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <LowStockIcon sx={{ color: 'error.main', fontSize: 32 }} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t('lowStock') || 'Stock Bajo'}
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="error.main">
                    {summaryStats.outOfStockCount}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder={t('searchProducts') || 'Buscar productos...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('warehouse') || 'Almacén'}</InputLabel>
              <Select
                value={selectedWarehouse}
                label={t('warehouse') || 'Almacén'}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
              >
                <MenuItem value="all">{t('allWarehouses') || 'Todos los Almacenes'}</MenuItem>
                {Array.isArray(warehouses) && warehouses.map((warehouse) => (
                  <MenuItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('stockLevel') || 'Nivel de Stock'}</InputLabel>
              <Select
                value={stockFilter}
                label={t('stockLevel') || 'Nivel de Stock'}
                onChange={(e) => setStockFilter(e.target.value)}
              >
                <MenuItem value="all">{t('all') || 'Todos'}</MenuItem>
                <MenuItem value="low">{t('lowStock') || 'Stock Bajo'}</MenuItem>
                <MenuItem value="out">{t('outOfStock') || 'Sin Stock'}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Active Filters Display */}
        {(searchTerm || selectedWarehouse !== 'all' || stockFilter !== 'all') && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {searchTerm && (
              <Chip
                label={`${t('search')}: ${searchTerm}`}
                onDelete={() => setSearchTerm('')}
                size="small"
              />
            )}
            {selectedWarehouse !== 'all' && (
              <Chip
                label={`${t('warehouse')}: ${warehouses.find((w) => w.id === selectedWarehouse)?.name}`}
                onDelete={() => setSelectedWarehouse('all')}
                size="small"
              />
            )}
            {stockFilter !== 'all' && (
              <Chip
                label={`${t('stockLevel')}: ${stockFilter === 'low' ? t('lowStock') : t('outOfStock')}`}
                onDelete={() => setStockFilter('all')}
                size="small"
              />
            )}
            <Button
              size="small"
              onClick={() => {
                setSearchTerm('');
                setSelectedWarehouse('all');
                setStockFilter('all');
              }}
            >
              {t('clearAll') || 'Limpiar Todo'}
            </Button>
          </Box>
        )}
      </Paper>

      {/* Data Table */}
      <Paper>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : filteredData.length === 0 ? (
          <Box p={4} textAlign="center">
            <InventoryIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {t('noProductsFound') || 'No se encontraron productos'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('tryAdjustingFilters') || 'Intenta ajustar los filtros'}
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width={50}></TableCell>
                    <TableCell>{t('product') || 'Producto'}</TableCell>
                    <TableCell>{t('sku') || 'SKU'}</TableCell>
                    <TableCell>{t('category') || 'Categoría'}</TableCell>
                    <TableCell align="right">{t('totalStock') || 'Stock Total'}</TableCell>
                    <TableCell>{t('status') || 'Estado'}</TableCell>
                    <TableCell align="center">{t('actions') || 'Acciones'}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.map((product) => {
                    const isExpanded = expandedRows.has(product.id);
                    const stockProps = getStockChipProps(product.totalStock);

                    return (
                      <>
                        <TableRow key={product.id} hover>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => toggleRowExpansion(product.id)}
                            >
                              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {product.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {product.sku}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={product.category} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="h6" fontWeight="bold">
                              {product.totalStock.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={stockProps.label}
                              color={stockProps.color}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title={t('viewDetails') || 'Ver Detalles'}>
                              <IconButton size="small">
                                <ViewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>

                        {/* Expanded Row - Stock by Warehouse */}
                        <TableRow>
                          <TableCell colSpan={7} sx={{ py: 0, border: 0 }}>
                            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                              <Box sx={{ p: 2, bgcolor: 'background.default' }}>
                                <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                                  {t('stockByWarehouse') || 'Stock por Almacén'}
                                </Typography>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>{t('warehouse') || 'Almacén'}</TableCell>
                                      <TableCell>{t('code') || 'Código'}</TableCell>
                                      <TableCell align="right">{t('stock') || 'Stock'}</TableCell>
                                      <TableCell>{t('status') || 'Estado'}</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {product.stockByWarehouse?.map((warehouse) => {
                                      const whStockProps = getStockChipProps(warehouse.currentStock);
                                      return (
                                        <TableRow key={warehouse.warehouseId}>
                                          <TableCell>{warehouse.warehouseName}</TableCell>
                                          <TableCell>
                                            <Typography variant="caption" color="text.secondary">
                                              {warehouse.warehouseCode}
                                            </Typography>
                                          </TableCell>
                                          <TableCell align="right">
                                            <Typography
                                              variant="body2"
                                              fontWeight="bold"
                                              color={`${whStockProps.color}.main`}
                                            >
                                              {warehouse.currentStock}
                                            </Typography>
                                          </TableCell>
                                          <TableCell>
                                            <Chip
                                              label={whStockProps.label}
                                              color={whStockProps.color}
                                              size="small"
                                              variant="outlined"
                                            />
                                          </TableCell>
                                        </TableRow>
                                      );
                                    })}
                                  </TableBody>
                                </Table>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage={t('rowsPerPage') || 'Filas por página:'}
            />
          </>
        )}
      </Paper>
    </Box>
  );
}
