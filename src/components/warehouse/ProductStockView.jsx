import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  History as HistoryIcon,
  Warehouse as WarehouseIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/useAuth';
import { inventoryService } from '../../services/inventory.service';
import { productService } from '../../services/product.service';
import { getAccessibleWarehouses } from '../../utils/warehouse.utils';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function ProductStockView({ productId }) {
  const { userRole, userWarehouseId } = useAuth();
  const [product, setProduct] = useState(null);
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (productId) {
      loadProductStock();
    }
  }, [productId, userRole, userWarehouseId]);

  const loadProductStock = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Load product details and stock in parallel
      const [productRes, stockRes] = await Promise.all([
        productService.getById(productId),
        inventoryService.getProductStockAllWarehouses(productId),
      ]);

      setProduct(productRes.data);

      // Filter stock data based on user role
      let filteredStock = stockRes.data || [];
      if (userRole === 'user' && userWarehouseId) {
        filteredStock = filteredStock.filter((w) => w.warehouseId === userWarehouseId);
      }

      setStockData(filteredStock);
    } catch (error) {
      console.error('Error loading product stock:', error);
      toast.error('Error al cargar stock del producto');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadProductStock(true);
  };

  const getTotalStock = () => {
    return stockData.reduce((total, item) => total + (item.currentStock || 0), 0);
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: 'Sin Stock', color: 'error' };
    if (stock < 10) return { label: 'Stock Bajo', color: 'warning' };
    return { label: 'Disponible', color: 'success' };
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (!product) {
    return (
      <Alert severity="error">
        No se pudo cargar la información del producto
      </Alert>
    );
  }

  const totalStock = getTotalStock();

  return (
    <Box>
      {/* Product Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h5" gutterBottom>
              {product.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              SKU: {product.sku}
            </Typography>
            {product.description && (
              <Typography variant="body2" color="text.secondary">
                {product.description}
              </Typography>
            )}
          </Box>
          <Tooltip title="Actualizar">
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <InventoryIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Stock Total
                  </Typography>
                  <Typography variant="h4">{totalStock}</Typography>
                  <Typography variant="caption">unidades</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <WarehouseIcon color="info" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Almacenes con Stock
                  </Typography>
                  <Typography variant="h4">
                    {stockData.filter((w) => w.currentStock > 0).length}
                  </Typography>
                  <Typography variant="caption">de {stockData.length}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: totalStock === 0 ? 'error.main' : totalStock < 20 ? 'warning.main' : 'success.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                  }}
                >
                  !
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Estado General
                  </Typography>
                  <Typography variant="h6">
                    {totalStock === 0 ? 'Sin Stock' : totalStock < 20 ? 'Stock Bajo' : 'Disponible'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Stock by Warehouse Table */}
      <Paper>
        <Box p={2} borderBottom={1} borderColor="divider">
          <Typography variant="h6">Stock por Almacén</Typography>
        </Box>

        {stockData.length === 0 ? (
          <Box p={3}>
            <Alert severity="info">
              No hay stock registrado en ningún almacén para este producto
            </Alert>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Almacén</TableCell>
                  <TableCell>Código</TableCell>
                  <TableCell align="right">Stock Actual</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Última Actualización</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stockData.map((warehouse) => {
                  const status = getStockStatus(warehouse.currentStock);
                  return (
                    <TableRow key={warehouse.warehouseId} hover>
                      <TableCell>
                        <Typography variant="body1" fontWeight="medium">
                          {warehouse.warehouseName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {warehouse.warehouseCode || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" color={status.color + '.main'}>
                          {warehouse.currentStock}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={status.label}
                          color={status.color}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {warehouse.lastUpdated
                            ? format(new Date(warehouse.lastUpdated), 'dd/MM/yyyy HH:mm')
                            : '—'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Ver Historial">
                          <IconButton
                            size="small"
                            onClick={() =>
                              toast.info(`Historial de ${warehouse.warehouseName}`)
                            }
                          >
                            <HistoryIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {/* Total Row */}
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell colSpan={2}>
                    <Typography variant="body1" fontWeight="bold">
                      TOTAL
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="h6" fontWeight="bold">
                      {totalStock}
                    </Typography>
                  </TableCell>
                  <TableCell colSpan={3} />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}
