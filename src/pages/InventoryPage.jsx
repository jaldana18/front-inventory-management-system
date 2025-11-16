import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Typography,
  Alert,
  Grid,
  CircularProgress,
  Stack,
  Skeleton,
} from '@mui/material';
import {
  Add as AddIcon,
  Inventory2 as InventoryIcon,
  TrendingDown as LowStockIcon,
  AttachMoney as ValueIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import InventoryTable from '../components/inventory/InventoryTable';
import InventoryForm from '../components/inventory/InventoryForm';
import InventoryFilters from '../components/inventory/InventoryFilters';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ExportButton from '../components/common/ExportButton';
import PrintButton from '../components/common/PrintButton';
import StatsCard from '../components/common/StatsCard';
import { inventoryService } from '../services/inventory.service';
import { useInventoryStore } from '../store/inventoryStore';
import { useLanguage } from '../context/LanguageContext';

const InventoryPage = () => {
  const [filters, setFilters] = useState({
    search: '',
    sku: '',
    category: '',
    isActive: '',
    minPrice: '',
    maxPrice: '',
    minStock: '',
    maxStock: '',
    lowStock: false,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });
  const [formOpen, setFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const queryClient = useQueryClient();
  const { setItems } = useInventoryStore();
  const { t } = useLanguage();

  // Build query params from filters
  const buildQueryParams = () => {
    const params = {};

    if (filters.search) params.search = filters.search;
    if (filters.sku) params.sku = filters.sku;
    if (filters.category) params.category = filters.category;
    if (filters.isActive !== '') params.isActive = filters.isActive;
    if (filters.minPrice) params.minPrice = Number(filters.minPrice);
    if (filters.maxPrice) params.maxPrice = Number(filters.maxPrice);
    if (filters.minStock) params.minStock = Number(filters.minStock);
    if (filters.maxStock) params.maxStock = Number(filters.maxStock);
    if (filters.lowStock) params.lowStock = filters.lowStock;
    if (filters.sortBy) params.sortBy = filters.sortBy;
    if (filters.sortOrder) params.sortOrder = filters.sortOrder;

    return params;
  };

  // Fetch inventory data with filters
  const { data, isLoading, error } = useQuery({
    queryKey: ['inventory', filters],
    queryFn: () => inventoryService.getAll(buildQueryParams()),
    onSuccess: (response) => {
      // Extract the array from the API response
      const items = response?.data?.items || response?.items || [];
      setItems(items);
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => inventoryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success(t('itemCreatedSuccessfully'));
    },
    onError: (error) => {
      toast.error(t('failedToCreateItem'));
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => inventoryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success(t('itemUpdatedSuccessfully'));
    },
    onError: (error) => {
      toast.error(t('failedToUpdateItem'));
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => inventoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success(t('itemDeletedSuccessfully'));
    },
    onError: (error) => {
      toast.error(t('failedToDeleteItem'));
    },
  });

  const handleOpenForm = (item = null) => {
    setSelectedItem(item);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setSelectedItem(null);
    setFormOpen(false);
  };

  const handleSubmit = (formData) => {
    if (selectedItem) {
      updateMutation.mutate({ id: selectedItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (item) => {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete.id);
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  // Extract the data array from the API response
  // API returns { success: true, data: { items: [...], pagination: {...} } }
  const rawData = data?.data?.items || data?.items || data?.data || [];
  const inventoryData = Array.isArray(rawData) ? rawData : [];

  // Categories for filter dropdown
  const categories = useMemo(() => {
    return [...new Set(inventoryData.map((item) => item.category).filter(Boolean))].sort();
  }, [inventoryData]);

  const stats = useMemo(() => {
    if (!inventoryData || inventoryData.length === 0) return null;

    const totalItems = inventoryData.length;
    const lowStockItems = 0; // Products don't have quantity field, would need separate stock endpoint
    const outOfStock = 0;
    const totalValue = 0; // Need quantity data to calculate
    const categories = [...new Set(inventoryData.map((item) => item.category).filter(Boolean))].length;

    return {
      totalItems,
      lowStockItems,
      outOfStock,
      totalValue,
      categories,
    };
  }, [inventoryData]);

  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        Error loading inventory: {error.message}
      </Alert>
    );
  }

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('inventoryManagement')}
          </Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm()}
            sx={{
              px: 3,
              py: 1.25,
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(99, 102, 241, 0.35)',
              },
            }}
          >
            {t('createNewItem')}
          </Button>
          <ExportButton data={inventoryData} fileName="inventory.csv" />
          <PrintButton data={inventoryData} title={t('inventory')} />
        </Stack>
      </Stack>

      {isLoading ? (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={70} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      ) : stats ? (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title={t('totalItems')}
              value={stats.totalItems}
              icon={InventoryIcon}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title={t('inventoryValue')}
              value={`$${stats.totalValue.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              icon={ValueIcon}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title={t('lowStock')}
              value={stats.lowStockItems}
              icon={LowStockIcon}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title={t('outOfStock')}
              value={stats.outOfStock}
              icon={CategoryIcon}
              color="error"
            />
          </Grid>
        </Grid>
      ) : null}

      <InventoryFilters
        filters={filters}
        onFilterChange={setFilters}
        categories={categories}
      />

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <InventoryTable
          data={inventoryData}
          onEdit={handleOpenForm}
          onDelete={handleDelete}
          onView={handleOpenForm}
        />
      )}

      <InventoryForm
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        initialData={selectedItem}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title={t('confirmDelete')}
        message={`${t('areYouSure')} "${itemToDelete?.name}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isLoading={deleteMutation.isPending}
        color="error"
      />
    </Box>
  );
};

export default InventoryPage;
