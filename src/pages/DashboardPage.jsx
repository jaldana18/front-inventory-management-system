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
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/useAuth';
import StatsCard from '../components/common/StatsCard';

const DashboardPage = () => {
  const { t } = useLanguage();
  const { userRole, userWarehouseId } = useAuth();
  const navigate = useNavigate();

  // Fetch dashboard analytics
  const { 
    data: dashboardData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: () => analyticsService.getDashboard(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Extract analytics data
  const analytics = useMemo(() => {
    return dashboardData?.data || null;
  }, [dashboardData]);

  // Calculate warehouse-specific stats if user is warehouse-level
  const warehouseStats = useMemo(() => {
    if (!analytics || userRole !== 'user' || !userWarehouseId) return null;
    
    // Filter data for specific warehouse
    const warehouseInventory = analytics.inventoryByWarehouse?.find(
      w => w.warehouseId === userWarehouseId
    );
    
    return warehouseInventory;
  }, [analytics, userRole, userWarehouseId]);

  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        {t('errorLoadingData') || 'Error loading dashboard data'}: {error.message}
      </Alert>
    );
  }

  const handleRefresh = () => {
    refetch();
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
              ? `${t('warehouseDashboard') || 'Warehouse Dashboard'}: ${warehouseStats.warehouseName}`
              : t('welcomeToDashboard') || 'Overview of your inventory system'
            }
          </Typography>
        </Box>
        <Tooltip title={t('refresh') || 'Refresh'}>
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
              title={t('lowStockItems') || 'Low Stock'}
              value={analytics.lowStockCount || 0}
              subtitle={t('itemsNeedingAttention') || 'Items needing attention'}
              icon={WarningIcon}
              color="warning"
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
                  {t('stockByWarehouse') || 'Stock by Warehouse'}
                </Typography>
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/stock-overview')}
                >
                  {t('viewAll') || 'View All'}
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
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <WarehouseIcon color="primary" />
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {warehouse.warehouseName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {warehouse.productCount} {t('products') || 'products'}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                            {warehouse.totalStock.toLocaleString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {t('units') || 'units'}
                          </Typography>
                        </Box>
                      </Box>
                      {warehouse.lowStockCount > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Chip
                            size="small"
                            icon={<WarningIcon />}
                            label={`${warehouse.lowStockCount} ${t('lowStockItems') || 'low stock items'}`}
                            color="warning"
                            variant="outlined"
                          />
                        </Box>
                      )}
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
                  {t('lowStockAlert') || 'Low Stock Alert'}
                </Typography>
                <Button
                  size="small"
                  onClick={() => navigate('/inventory')}
                >
                  {t('manage') || 'Manage'}
                </Button>
              </Box>
              {analytics.lowStockItems && analytics.lowStockItems.length > 0 ? (
                <List>
                  {analytics.lowStockItems.slice(0, 5).map((item, index) => (
                    <Box key={item.productId}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText
                          primary={item.productName}
                          secondary={`${item.currentStock} ${t('unitsLeft') || 'units left'}`}
                          primaryTypographyProps={{
                            variant: 'body2',
                            fontWeight: 500,
                          }}
                          secondaryTypographyProps={{
                            variant: 'caption',
                          }}
                        />
                        <Chip
                          size="small"
                          label={item.warehouseName}
                          variant="outlined"
                        />
                      </ListItem>
                      {index < Math.min(4, analytics.lowStockItems.length - 1) && <Divider />}
                    </Box>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('noLowStockItems') || 'All products are well stocked'}
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
            {t('noDashboardData') || 'No data available yet'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('startAddingItems') || 'Start by adding products and warehouses to your system'}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default DashboardPage;
