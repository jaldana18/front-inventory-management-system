import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Stack,
  Paper,
  Tab,
  Tabs,
  Skeleton,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Download as DownloadIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import {
  format,
  subDays,
} from 'date-fns';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { analyticsService } from '../services/analytics.service';
import StatsCard from '../components/common/StatsCard';
import DatePickerCustom from '../components/common/DatePickerCustom';
import DateRangePicker from '../components/common/DateRangePicker';
import { useLanguage } from '../context/LanguageContext';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

const ReportsPage = () => {
  const { t } = useLanguage();
  const [selectedTab, setSelectedTab] = useState(0);
  const [dateRange, setDateRange] = useState('7days');
  const [granularity, setGranularity] = useState('daily');
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Fetch dashboard data
  const { data: dashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: analyticsService.getDashboard,
  });

  // Fetch sales timeline
  const { data: salesTimeline, isLoading: timelineLoading } = useQuery({
    queryKey: ['analytics', 'sales-timeline', startDate, endDate, granularity],
    queryFn: () =>
      analyticsService.getSalesTimeline({
        startDate,
        endDate,
        granularity,
      }),
  });

  // Fetch top selling products
  const { data: topProducts, isLoading: topProductsLoading } = useQuery({
    queryKey: ['analytics', 'top-products', dateRange],
    queryFn: () => analyticsService.getTopSellingProducts({ period: dateRange }),
  });

  // Fetch category performance
  const { data: categoryPerformance, isLoading: categoryLoading } = useQuery({
    queryKey: ['analytics', 'category-performance', dateRange],
    queryFn: () => analyticsService.getCategoryPerformance({ period: dateRange }),
  });

  // Fetch inventory status
  const { data: inventoryStatus, isLoading: inventoryLoading } = useQuery({
    queryKey: ['analytics', 'inventory-status'],
    queryFn: analyticsService.getInventoryStatus,
  });

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    const today = new Date();
    let start;

    switch (range) {
      case '7days':
        start = subDays(today, 7);
        break;
      case '30days':
        start = subDays(today, 30);
        break;
      case '90days':
        start = subDays(today, 90);
        break;
      case '1year':
        start = subDays(today, 365);
        break;
      default:
        start = subDays(today, 7);
    }

    setStartDate(format(start, 'yyyy-MM-dd'));
    setEndDate(format(today, 'yyyy-MM-dd'));
  };

  const handleExportData = () => {
    console.log('Exporting data...');
  };

  return (
    <Box>
      {/* Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 0.5,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('reportsAnalytics') || 'Reports & Analytics'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('monitorInventory') || 'Monitor your inventory performance and sales metrics'}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleExportData}
          sx={{
            px: 3,
            py: 1.25,
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
            '&:hover': {
              boxShadow: '0 6px 16px rgba(99, 102, 241, 0.35)',
            },
          }}
        >
          {t('exportReport') || 'Export Report'}
        </Button>
      </Stack>

      {/* Main KPIs */}
      {dashboardLoading ? (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      ) : dashboard ? (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title={t('totalRevenue') || 'Total Revenue'}
              value={`$${dashboard.totalRevenue?.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) || '0.00'}`}
              subtitle={t('currentPeriod') || 'Current period'}
              color="primary"
              trend={dashboard.revenueTrend}
              trendValue={`${dashboard.revenueTrendPercent}%`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title={t('totalOrders') || 'Total Orders'}
              value={dashboard.totalOrders || 0}
              subtitle={t('ordersPlaced') || 'Orders placed'}
              color="success"
              trend={dashboard.ordersTrend}
              trendValue={`${dashboard.ordersTrendPercent}%`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title={t('avgOrderValue') || 'Avg Order Value'}
              value={`$${dashboard.averageOrderValue?.toFixed(2) || '0.00'}`}
              subtitle={t('perTransaction') || 'Per transaction'}
              color="info"
              trend={dashboard.aovTrend}
              trendValue={`${dashboard.aovTrendPercent}%`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title={t('inventoryValue') || 'Inventory Value'}
              value={`$${dashboard.totalInventoryValue?.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) || '0.00'}`}
              subtitle={t('currentStock') || 'Current stock'}
              color="warning"
            />
          </Grid>
        </Grid>
      ) : null}

      {/* Tabs for different reports */}
      <Paper sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            px: 2,
            backgroundColor: '#fafbfc',
            minHeight: 40,
            '& .MuiTab-root': {
              minHeight: 40,
              fontSize: '0.8rem',
              py: 1,
            },
          }}
        >
          <Tab label={t('salesTimeline') || 'Sales Timeline'} />
          <Tab label={t('topProducts') || 'Top Products'} />
          <Tab label={t('categoryPerformance') || 'Category Performance'} />
          <Tab label={t('calendar') || 'Calendar'} />
          <Tab label={t('inventoryStatus') || 'Inventory Status'} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* Sales Timeline Tab */}
          {selectedTab === 0 && (
            <Box>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <DateRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    onStartDateChange={(e) => setStartDate(e.target.value)}
                    onEndDateChange={(e) => setEndDate(e.target.value)}
                    label={t('dateRange') || 'Rango de fechas'}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    select
                    label={t('granularity') || 'Granularity'}
                    value={granularity}
                    onChange={(e) => setGranularity(e.target.value)}
                    fullWidth
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: '#f8fafc',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: '#f1f5f9',
                          borderColor: '#6366f1',
                        },
                        '&.Mui-focused': {
                          backgroundColor: '#ffffff',
                          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
                        },
                      },
                    }}
                  >
                    <MenuItem value="hourly">{t('hourly') || 'Hourly'}</MenuItem>
                    <MenuItem value="daily">{t('daily') || 'Daily'}</MenuItem>
                    <MenuItem value="weekly">{t('weekly') || 'Weekly'}</MenuItem>
                    <MenuItem value="monthly">{t('monthly') || 'Monthly'}</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              {timelineLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : salesTimeline?.data && salesTimeline.data.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesTimeline.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#6366f1" name="Revenue" />
                    <Line type="monotone" dataKey="orders" stroke="#8b5cf6" name="Orders" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Alert severity="info">{t('noDataAvailable') || 'No sales data available'}</Alert>
              )}
            </Box>
          )}

          {/* Top Products Tab */}
          {selectedTab === 1 && (
            <Box>
              {topProductsLoading ? (
                <CircularProgress />
              ) : topProducts?.data ? (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      {t('topSellingProducts') || 'Top Selling Products'}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {topProducts.data.map((product, index) => (
                        <Box
                          key={product.id}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: 2,
                            backgroundColor: '#f8fafc',
                            borderRadius: 2,
                            borderLeft: `4px solid ${COLORS[index]}`,
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.25 }}>
                              {index + 1}. {product.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {t('sku')}: {product.sku}
                            </Typography>
                          </Box>
                          <Chip
                            label={`${product.unitsSold || 0} ${t('units') || 'units'}`}
                            color="primary"
                            size="small"
                          />
                        </Box>
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    {topProducts.data.length > 0 && (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topProducts.data}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="unitsSold" fill="#6366f1" name="Units Sold" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </Grid>
                </Grid>
              ) : (
                <Alert severity="info">{t('noDataAvailable') || 'No product data available'}</Alert>
              )}
            </Box>
          )}

          {/* Category Performance Tab */}
          {selectedTab === 2 && (
            <Box>
              {categoryLoading ? (
                <CircularProgress />
              ) : categoryPerformance?.data ? (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    {categoryPerformance.data.length > 0 && (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={categoryPerformance.data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percentage }) => `${name}: ${percentage}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="percentage"
                          >
                            {categoryPerformance.data.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      {t('categoryPerformance') || 'Category Performance'}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {categoryPerformance.data.map((category, index) => (
                        <Box key={category.id}>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              mb: 1,
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {category.name}
                            </Typography>
                            <Chip
                              label={`${category.percentage}%`}
                              size="small"
                              sx={{ backgroundColor: COLORS[index] }}
                            />
                          </Box>
                          <Box
                            sx={{
                              height: 8,
                              backgroundColor: '#e2e8f0',
                              borderRadius: 4,
                              overflow: 'hidden',
                            }}
                          >
                            <Box
                              sx={{
                                height: '100%',
                                width: `${category.percentage}%`,
                                backgroundColor: COLORS[index],
                                borderRadius: 4,
                                transition: 'width 0.3s ease',
                              }}
                            />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                <Alert severity="info">{t('noDataAvailable') || 'No category data available'}</Alert>
              )}
            </Box>
          )}

          {/* Calendar Tab */}
          {selectedTab === 3 && (
            <Box>
              <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                {/* Calendar Header */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                  }}
                >
                  <Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: '#1e293b',
                        mb: 0.5,
                      }}
                    >
                      {format(new Date(), 'MMMM yyyy')}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      {format(new Date(), 'EEEE, d MMMM')}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        textTransform: 'none',
                        borderColor: '#e2e8f0',
                        color: '#64748b',
                        '&:hover': {
                          borderColor: '#6366f1',
                          color: '#6366f1',
                          backgroundColor: 'rgba(99, 102, 241, 0.05)',
                        },
                      }}
                    >
                      ← Anterior
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      sx={{
                        textTransform: 'none',
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                      }}
                    >
                      Hoy
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        textTransform: 'none',
                        borderColor: '#e2e8f0',
                        color: '#64748b',
                        '&:hover': {
                          borderColor: '#6366f1',
                          color: '#6366f1',
                          backgroundColor: 'rgba(99, 102, 241, 0.05)',
                        },
                      }}
                    >
                      Siguiente →
                    </Button>
                  </Stack>
                </Box>

                {/* Day Headers */}
                <Grid container spacing={1} sx={{ mb: 2 }}>
                  {['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'].map((day) => (
                    <Grid item xs={12 / 7} key={day}>
                      <Box
                        sx={{
                          textAlign: 'center',
                          fontWeight: 700,
                          color: '#94a3b8',
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          py: 1.5,
                          letterSpacing: '0.5px',
                        }}
                      >
                        {day}
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                {/* Calendar Grid */}
                <Grid container spacing={1}>
                  {Array.from({ length: 35 }).map((_, index) => {
                    const today = new Date();
                    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                    const startDate = new Date(firstDay);
                    startDate.setDate(startDate.getDate() - firstDay.getDay());
                    const currentDate = new Date(startDate);
                    currentDate.setDate(currentDate.getDate() + index);
                    
                    const isToday =
                      currentDate.toDateString() === today.toDateString();
                    const isCurrentMonth =
                      currentDate.getMonth() === today.getMonth();
                    const dayNumber = currentDate.getDate();

                    return (
                      <Grid item xs={12 / 7} key={index}>
                        <Box
                          sx={{
                            aspectRatio: '1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 2,
                            fontSize: '1rem',
                            fontWeight: isToday ? 700 : 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            backgroundColor: isToday
                              ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                              : isCurrentMonth
                              ? '#f8fafc'
                              : 'transparent',
                            color: isToday
                              ? '#ffffff'
                              : isCurrentMonth
                              ? '#1e293b'
                              : '#cbd5e1',
                            border: isToday
                              ? 'none'
                              : isCurrentMonth
                              ? '2px solid #e2e8f0'
                              : 'none',
                            boxShadow: isToday
                              ? '0 4px 12px rgba(99, 102, 241, 0.3)'
                              : 'none',
                            '&:hover': {
                              backgroundColor: isToday
                                ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                                : isCurrentMonth
                                ? '#e2e8f0'
                                : 'transparent',
                              transform: 'translateY(-2px)',
                              boxShadow: isCurrentMonth
                                ? '0 6px 16px rgba(0, 0, 0, 0.08)'
                                : 'none',
                            },
                          }}
                        >
                          {dayNumber}
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>

                {/* Legend */}
                <Box
                  sx={{
                    display: 'flex',
                    gap: 3,
                    mt: 4,
                    pt: 3,
                    borderTop: '1px solid #e2e8f0',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      }}
                    />
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      Hoy
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '4px',
                        backgroundColor: '#f8fafc',
                        border: '2px solid #e2e8f0',
                      }}
                    />
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      Este mes
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '4px',
                        backgroundColor: 'transparent',
                      }}
                    />
                    <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                      Otro mes
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
          )}

          {/* Inventory Status Tab */}
          {selectedTab === 4 && (
            <Box>
              {inventoryLoading ? (
                <CircularProgress />
              ) : inventoryStatus?.data ? (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    {t('inventoryStatus') || 'Inventory Status'}
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card
                        sx={{
                          borderRadius: 2,
                          background:
                            'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        }}
                      >
                        <CardContent>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              color: '#ffffff',
                            }}
                          >
                            {t('totalItems') || 'Total Items'}
                          </Typography>
                          <Typography
                            variant="h4"
                            sx={{
                              fontWeight: 700,
                              color: '#ffffff',
                            }}
                          >
                            {inventoryStatus.data.totalItems || 0}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card
                        sx={{
                          borderRadius: 2,
                          borderLeft: '4px solid #10b981',
                          background:
                            'linear-gradient(135deg, #f0fdf4 0%, #dbeafe 100%)',
                        }}
                      >
                        <CardContent>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              fontWeight: 600,
                              textTransform: 'uppercase',
                            }}
                          >
                            {t('inStock') || 'In Stock'}
                          </Typography>
                          <Typography
                            variant="h4"
                            sx={{
                              fontWeight: 700,
                              color: '#10b981',
                            }}
                          >
                            {inventoryStatus.data.inStock || 0}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card
                        sx={{
                          borderRadius: 2,
                          borderLeft: '4px solid #f59e0b',
                          background:
                            'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                        }}
                      >
                        <CardContent>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              fontWeight: 600,
                              textTransform: 'uppercase',
                            }}
                          >
                            {t('lowStock') || 'Low Stock'}
                          </Typography>
                          <Typography
                            variant="h4"
                            sx={{
                              fontWeight: 700,
                              color: '#f59e0b',
                            }}
                          >
                            {inventoryStatus.data.lowStock || 0}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card
                        sx={{
                          borderRadius: 2,
                          borderLeft: '4px solid #ef4444',
                          background:
                            'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                        }}
                      >
                        <CardContent>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              fontWeight: 600,
                              textTransform: 'uppercase',
                            }}
                          >
                            {t('outOfStock') || 'Out of Stock'}
                          </Typography>
                          <Typography
                            variant="h4"
                            sx={{
                              fontWeight: 700,
                              color: '#ef4444',
                            }}
                          >
                            {inventoryStatus.data.outOfStock || 0}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {inventoryStatus.data.alerts?.length > 0 && (
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 2,
                          fontWeight: 600,
                        }}
                      >
                        {t('alerts') || 'Alerts'}
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1,
                        }}
                      >
                        {inventoryStatus.data.alerts.map((alert, index) => (
                          <Alert
                            key={index}
                            severity={
                              alert.type === 'critical'
                                ? 'error'
                                : alert.type === 'warning'
                                ? 'warning'
                                : 'info'
                            }
                            sx={{
                              borderRadius: 2,
                            }}
                          >
                            {alert.message}
                          </Alert>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              ) : (
                <Alert severity="info">
                  {t('noDataAvailable') || 'No inventory data available'}
                </Alert>
              )}
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default ReportsPage;
