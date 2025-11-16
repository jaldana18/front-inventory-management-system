import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
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
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Inventory2 as InventoryIcon,
  TrendingDown as LowStockIcon,
  ShoppingCart as OrdersIcon,
  People as SuppliersIcon,
  AttachMoney as RevenueIcon,
} from '@mui/icons-material';
import { inventoryService } from '../services/inventory.service';
import { useLanguage } from '../context/LanguageContext';
import StatsCard from '../components/common/StatsCard';

const DashboardPage = () => {
  const { t } = useLanguage();

  // Fetch inventory data
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-inventory'],
    queryFn: () => inventoryService.getAll(),
  });

  // Extract the data array from the API response
  const inventoryData = useMemo(() => {
    const rawData = data?.data?.items || data?.items || data?.data || [];
    return Array.isArray(rawData) ? rawData : [];
  }, [data]);

  const dashboardStats = useMemo(() => {
    if (!inventoryData || inventoryData.length === 0) return null;

    const totalProducts = inventoryData.length;
    const categories = [...new Set(inventoryData.map((item) => item.category).filter(Boolean))].length;
    const totalValue = 0; // Would need quantity data
    const recentlyAdded = inventoryData.slice(0, 5); // Last 5 products

    return {
      totalProducts,
      categories,
      totalValue,
      recentlyAdded,
    };
  }, [inventoryData]);

  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        {t('errorLoadingData') || 'Error loading dashboard data'}: {error.message}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
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
          {t('welcomeToDashboard') || 'Welcome to your inventory dashboard'}
        </Typography>
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
      ) : dashboardStats ? (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title={t('totalProducts') || 'Total Products'}
              value={dashboardStats.totalProducts}
              subtitle={t('productsInInventory')}
              icon={InventoryIcon}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title={t('categories')}
              value={dashboardStats.categories}
              subtitle={t('categoriesInUse') || 'Categories in use'}
              icon={OrdersIcon}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title={t('suppliers') || 'Suppliers'}
              value={0}
              subtitle={t('activeSuppliers') || 'Active suppliers'}
              icon={SuppliersIcon}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title={t('revenue') || 'Revenue'}
              value="$0.00"
              subtitle={t('monthlyRevenue') || 'This month'}
              icon={RevenueIcon}
              color="warning"
            />
          </Grid>
        </Grid>
      ) : null}

      {/* Recent Products Section */}
      {dashboardStats && dashboardStats.recentlyAdded.length > 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                {t('recentProducts') || 'Recently Added Products'}
              </Typography>
              <Stack spacing={2}>
                {dashboardStats.recentlyAdded.map((product) => (
                  <Card
                    key={product.id}
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
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {product.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {t('sku')}: {product.sku} • {t('category')}: {product.category}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                            ${product.price?.toFixed(2) || '0.00'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {t('price')}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Empty State */}
      {!isLoading && (!dashboardStats || inventoryData.length === 0) && (
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
            {t('startAddingItems')}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default DashboardPage;
