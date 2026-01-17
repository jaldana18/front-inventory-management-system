import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  Skeleton,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
  Button,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Inventory2 as InventoryIcon,
  TrendingDown as LowStockIcon,
  ShoppingCart as OrdersIcon,
  People as SuppliersIcon,
  AttachMoney as RevenueIcon,
  Warehouse as WarehouseIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { analyticsService } from '../services/analytics.service';
import { inventoryService } from '../services/inventory.service';
import { warehouseService } from '../services/warehouse.service';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/useAuth';
import StatsCard from '../components/common/StatsCard';

const DashboardPage = () => {
  const { t } = useLanguage();
  const { userRole, userWarehouseId } = useAuth();
  const navigate = useNavigate();

  // Fetch dashboard analytics (may fail if endpoint doesn't exist)
  const { 
    data: dashboardData, 
    isLoading: isLoadingAnalytics,
  } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: () => analyticsService.getDashboard(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry if it fails
    enabled: true,
  });

  // Fallback: Fetch inventory data
  const {
    data: inventoryData,
    isLoading: isLoadingInventory,
  } = useQuery({
    queryKey: ['dashboard-inventory'],
    queryFn: () => inventoryService.getAll(),
    enabled: !dashboardData, // Only fetch if analytics failed
  });

  // Fallback: Fetch warehouses data
  const {
    data: warehousesData,
    isLoading: isLoadingWarehouses,
  } = useQuery({
    queryKey: ['dashboard-warehouses'],
    queryFn: () => warehouseService.getAll(),
    enabled: !dashboardData, // Only fetch if analytics failed
  });

  const isLoading = isLoadingAnalytics || isLoadingInventory || isLoadingWarehouses;

  // Extract analytics data or build from inventory
  const analytics = useMemo(() => {
    // If we have analytics data, use it
    if (dashboardData?.data) {
      return dashboardData.data;
    }

    // Otherwise, build analytics from inventory and warehouses
    const items = inventoryData?.data?.items || inventoryData?.data || [];
    const itemsList = Array.isArray(items) ? items : [];
    
    const warehouses = warehousesData?.data?.items || warehousesData?.data || [];
    const warehousesList = Array.isArray(warehouses) ? warehouses : [];

    if (itemsList.length === 0) return null;

    // Calculate stats from inventory
    const totalProducts = itemsList.length;
    const totalStock = itemsList.reduce((sum, item) => sum + (item.quantity || item.currentStock || 0), 0);

    // Mejorar detección de productos con bajo stock
    const lowStockItems = itemsList
      .map(item => {
        const stock = item.quantity || item.currentStock || 0;
        const minStock = item.minStock || 10; // usar minStock del producto si existe
        return {
          ...item,
          stock,
          minStock,
          isLow: stock > 0 && stock <= minStock,
          isCritical: stock > 0 && stock <= minStock * 0.5,
          stockPercentage: minStock > 0 ? Math.round((stock / minStock) * 100) : 0,
        };
      })
      .filter(item => item.isLow)
      .sort((a, b) => a.stock - b.stock); // ordenar por stock más bajo primero

    const lowStockCount = lowStockItems.length;
    const criticalStockCount = lowStockItems.filter(item => item.isCritical).length;

    // Build warehouse inventory data with better metrics
    const inventoryByWarehouse = warehousesList.map(warehouse => {
      // Por ahora, distribuir items entre warehouses proporcionalmente
      // En producción, esto vendría del backend con datos reales
      const warehouseItemCount = itemsList.length;
      const warehouseTotalStock = totalStock;
      const warehouseLowStock = lowStockCount;

      // Calcular capacidad (ejemplo: asumir capacidad basada en stock actual)
      const estimatedCapacity = warehouseTotalStock * 1.5;
      const occupancyPercentage = Math.round((warehouseTotalStock / estimatedCapacity) * 100);

      return {
        warehouseId: warehouse.id,
        warehouseName: warehouse.name,
        productCount: warehouseItemCount,
        totalStock: warehouseTotalStock,
        lowStockCount: warehouseLowStock,
        criticalStockCount: Math.round(criticalStockCount / warehousesList.length),
        occupancyPercentage,
        status: occupancyPercentage > 90 ? 'full' : occupancyPercentage > 70 ? 'high' : 'normal',
      };
    });

    // Build enhanced low stock items list
    const topLowStockItems = lowStockItems
      .slice(0, 8)
      .map(item => ({
        productId: item.id,
        productName: item.name,
        sku: item.sku || item.code,
        currentStock: item.stock,
        minStock: item.minStock,
        stockPercentage: item.stockPercentage,
        isCritical: item.isCritical,
        warehouseName: warehousesList[0]?.name || 'Almacén',
        category: item.category || 'General',
      }));

    return {
      totalProducts,
      totalStock,
      totalWarehouses: warehousesList.length,
      lowStockCount,
      criticalStockCount,
      inventoryByWarehouse,
      lowStockItems: topLowStockItems,
    };
  }, [dashboardData, inventoryData, warehousesData]);

  // Calculate warehouse-specific stats if user is warehouse-level
  const warehouseStats = useMemo(() => {
    if (!analytics || userRole !== 'user' || !userWarehouseId) return null;
    
    // Filter data for specific warehouse
    const warehouseInventory = analytics.inventoryByWarehouse?.find(
      w => w.warehouseId === userWarehouseId
    );
    
    return warehouseInventory;
  }, [analytics, userRole, userWarehouseId]);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
            {t('dashboard')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {userRole === 'user' && warehouseStats
              ? `${t('warehouseDashboard')}: ${warehouseStats.warehouseName}`
              : t('welcomeToDashboard')
            }
          </Typography>
        </Box>
        <Tooltip title={t('refresh')}>
          <IconButton onClick={handleRefresh} disabled={isLoading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Stats Cards */}
      {isLoading ? (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      ) : analytics ? (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title={t('totalProducts') || 'Total Products'}
              value={analytics.totalProducts || 0}
              subtitle={t('uniqueItems') || 'Unique items in system'}
              icon={InventoryIcon}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title={t('totalStock') || 'Total Stock'}
              value={warehouseStats?.totalStock || analytics.totalStock || 0}
              subtitle={t('unitsAvailable') || 'Units available'}
              icon={OrdersIcon}
              color="info"
              trend={analytics.stockTrend}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title={t('warehouses') || 'Warehouses'}
              value={analytics.totalWarehouses || 0}
              subtitle={t('activeLocations') || 'Active locations'}
              icon={WarehouseIcon}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title={t('lowStockItems')}
              value={analytics.lowStockCount || 0}
              subtitle={
                analytics.criticalStockCount > 0
                  ? `${analytics.criticalStockCount} ${t('critical')}`
                  : t('itemsNeedingAttention')
              }
              icon={WarningIcon}
              color={analytics.criticalStockCount > 0 ? 'error' : 'warning'}
            />
          </Grid>
        </Grid>
      ) : null}

      {/* Warehouse Breakdown Section */}
      {analytics && analytics.inventoryByWarehouse && analytics.inventoryByWarehouse.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {t('stockByWarehouse')}
                </Typography>
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/stock-overview')}
                >
                  {t('viewAll')}
                </Button>
              </Box>
              <Stack spacing={2}>
                {analytics.inventoryByWarehouse.map((warehouse) => (
                  <Card
                    key={warehouse.warehouseId}
                    sx={{
                      borderRadius: 2,
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#f8fafc',
                      '&:hover': {
                        backgroundColor: '#f1f5f9',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <CardContent sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <WarehouseIcon color="primary" />
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {warehouse.warehouseName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {warehouse.productCount} {t('products')}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                            {warehouse.totalStock.toLocaleString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {t('units')}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Barra de ocupación */}
                      <Box sx={{ mb: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            {t('occupancy')}
                          </Typography>
                          <Typography variant="caption" fontWeight={500}>
                            {warehouse.occupancyPercentage}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={warehouse.occupancyPercentage}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: '#e2e8f0',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 3,
                              backgroundColor:
                                warehouse.status === 'full'
                                  ? '#ef4444'
                                  : warehouse.status === 'high'
                                  ? '#f59e0b'
                                  : '#10b981',
                            },
                          }}
                        />
                      </Box>

                      {/* Alertas de stock */}
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {warehouse.lowStockCount > 0 && (
                          <Chip
                            size="small"
                            icon={<WarningIcon />}
                            label={`${warehouse.lowStockCount} ${t('lowStock')}`}
                            color="warning"
                            variant="outlined"
                          />
                        )}
                        {warehouse.criticalStockCount > 0 && (
                          <Chip
                            size="small"
                            icon={<WarningIcon />}
                            label={`${warehouse.criticalStockCount} ${t('critical')}`}
                            color="error"
                            variant="filled"
                          />
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Paper>
          </Grid>

          {/* Recent Activity / Low Stock Items */}
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                height: '100%',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {t('lowStockAlert')}
                </Typography>
                <Button
                  size="small"
                  onClick={() => navigate('/inventory')}
                >
                  {t('manage')}
                </Button>
              </Box>
              {analytics.lowStockItems && analytics.lowStockItems.length > 0 ? (
                <List sx={{ maxHeight: 480, overflow: 'auto' }}>
                  {analytics.lowStockItems.map((item, index) => (
                    <Box key={item.productId}>
                      <ListItem
                        sx={{
                          px: 0,
                          py: 1.5,
                          '&:hover': {
                            backgroundColor: '#f8fafc',
                            borderRadius: 1,
                          },
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {item.productName}
                              </Typography>
                              {item.isCritical && (
                                <Chip
                                  size="small"
                                  label={t('critical')}
                                  color="error"
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 0.5 }}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                SKU: {item.sku || 'N/A'} • {item.category}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={Math.min(item.stockPercentage, 100)}
                                  sx={{
                                    flex: 1,
                                    height: 4,
                                    borderRadius: 2,
                                    backgroundColor: '#e2e8f0',
                                    '& .MuiLinearProgress-bar': {
                                      borderRadius: 2,
                                      backgroundColor: item.isCritical ? '#ef4444' : '#f59e0b',
                                    },
                                  }}
                                />
                                <Typography variant="caption" sx={{ minWidth: 80, fontWeight: 500 }}>
                                  {item.currentStock}/{item.minStock} {t('units')}
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < analytics.lowStockItems.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('noLowStockItems')}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Empty State */}
      {!isLoading && !analytics && (
        <Paper
          sx={{
            p: 8,
            textAlign: 'center',
            borderRadius: 3,
            backgroundColor: '#f8fafc',
          }}
        >
          <InventoryIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t('noDashboardData')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('startAddingItems')}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default DashboardPage;
