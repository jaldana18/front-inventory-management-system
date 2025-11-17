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
  Badge,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Warehouse as WarehouseIcon,
  TrendingUp as InboundIcon,
  TrendingDown as OutboundIcon,
  Edit as AdjustmentIcon,
  Inventory as ProductsIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/useAuth';
import { inventoryService } from '../../services/inventory.service';
import { canAccessWarehouse } from '../../utils/warehouse.utils';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function WarehouseDetailView({ warehouseId }) {
  const { userRole, userWarehouseId } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Validate access
    if (!canAccessWarehouse(userRole, userWarehouseId, warehouseId)) {
      toast.error('No tienes acceso a este almacén');
      navigate('/');
      return;
    }

    loadWarehouseDetail();
  }, [warehouseId, userRole, userWarehouseId]);

  const loadWarehouseDetail = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await inventoryService.getWarehouseSummary(warehouseId);
      setData(response.data);
    } catch (error) {
      console.error('Error loading warehouse detail:', error);
      toast.error('Error al cargar detalles del almacén');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadWarehouseDetail(true);
  };

  const getTransactionTypeIcon = (type) => {
    switch (type) {
      case 'INBOUND':
        return <InboundIcon fontSize="small" color="success" />;
      case 'OUTBOUND':
        return <OutboundIcon fontSize="small" color="error" />;
      default:
        return <AdjustmentIcon fontSize="small" color="info" />;
    }
  };

  const getStockChipColor = (stock) => {
    if (stock === 0) return 'error';
    if (stock < 10) return 'warning';
    return 'success';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data) {
    return <Alert severity="error">No se pudo cargar la información del almacén</Alert>;
  }

  const { warehouse, stats, products, recentTransactions } = data;

  return (
    <Box>
      {/* Warehouse Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Box display="flex" alignItems="center" gap={2} mb={1}>
              <Typography variant="h4">{warehouse.name}</Typography>
              <Chip label={warehouse.code} color="primary" />
              {warehouse.isMain && <Chip label="Principal" color="warning" />}
            </Box>

            <Box display="flex" flexDirection="column" gap={1} mt={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <PersonIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  Gerente: {warehouse.managerName || 'No asignado'}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1}>
                <LocationIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {warehouse.address}
                  {warehouse.city && `, ${warehouse.city}`}
                </Typography>
              </Box>

              {warehouse.phone && (
                <Box display="flex" alignItems="center" gap={1}>
                  <PhoneIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {warehouse.phone}
                  </Typography>
                </Box>
              )}

              {warehouse.email && (
                <Box display="flex" alignItems="center" gap={1}>
                  <EmailIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {warehouse.email}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          <Tooltip title="Actualizar">
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    bgcolor: 'primary.light',
                    borderRadius: 2,
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <WarehouseIcon sx={{ color: 'primary.main', fontSize: 30 }} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Stock Total
                  </Typography>
                  <Typography variant="h5">{stats.currentStock}</Typography>
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
                    bgcolor: 'success.light',
                    borderRadius: 2,
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <InboundIcon sx={{ color: 'success.main', fontSize: 30 }} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total Entradas
                  </Typography>
                  <Typography variant="h5" color="success.main">
                    +{stats.totalInbound}
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
                    bgcolor: 'error.light',
                    borderRadius: 2,
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <OutboundIcon sx={{ color: 'error.main', fontSize: 30 }} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total Salidas
                  </Typography>
                  <Typography variant="h5" color="error.main">
                    -{stats.totalOutbound}
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
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ProductsIcon sx={{ color: 'info.main', fontSize: 30 }} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Productos Únicos
                  </Typography>
                  <Typography variant="h5">{stats.uniqueProducts}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Products in Stock */}
        <Grid item xs={12} lg={7}>
          <Paper>
            <Box p={2} borderBottom={1} borderColor="divider">
              <Typography variant="h6">Productos en Stock</Typography>
            </Box>

            {products && products.length > 0 ? (
              <TableContainer sx={{ maxHeight: 500 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>SKU</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell align="right">Stock</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Última Actualización</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow
                        key={product.productId}
                        hover
                        sx={{
                          bgcolor: product.currentStock === 0 ? 'error.light' : 'inherit',
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {product.productSku}
                          </Typography>
                        </TableCell>
                        <TableCell>{product.productName}</TableCell>
                        <TableCell align="right">
                          <Typography variant="body1" fontWeight="bold">
                            {product.currentStock}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              product.currentStock === 0
                                ? 'Sin Stock'
                                : product.currentStock < 10
                                ? 'Bajo'
                                : 'OK'
                            }
                            size="small"
                            color={getStockChipColor(product.currentStock)}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {product.lastUpdated
                              ? format(new Date(product.lastUpdated), 'dd/MM/yyyy')
                              : '—'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box p={3}>
                <Alert severity="info">No hay productos con stock en este almacén</Alert>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} lg={5}>
          <Paper>
            <Box p={2} borderBottom={1} borderColor="divider">
              <Typography variant="h6">Actividad Reciente</Typography>
            </Box>

            {recentTransactions && recentTransactions.length > 0 ? (
              <List sx={{ maxHeight: 500, overflow: 'auto' }}>
                {recentTransactions.map((transaction, index) => (
                  <Box key={transaction.id}>
                    <ListItem alignItems="flex-start">
                      <Box mr={2}>{getTransactionTypeIcon(transaction.type)}</Box>
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" fontWeight="medium">
                              {transaction.productName}
                            </Typography>
                            <Chip
                              label={
                                transaction.quantity > 0
                                  ? `+${transaction.quantity}`
                                  : transaction.quantity
                              }
                              size="small"
                              color={transaction.quantity > 0 ? 'success' : 'error'}
                            />
                          </Box>
                        }
                        secondary={
                          <Box mt={0.5}>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {transaction.type} - {transaction.reason}
                            </Typography>
                            {transaction.reference && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                Ref: {transaction.reference}
                              </Typography>
                            )}
                            <Typography variant="caption" color="text.secondary" display="block">
                              {format(new Date(transaction.createdAt), 'dd/MM/yyyy HH:mm')}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentTransactions.length - 1 && <Divider variant="inset" />}
                  </Box>
                ))}
              </List>
            ) : (
              <Box p={3}>
                <Alert severity="info">No hay transacciones recientes</Alert>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
