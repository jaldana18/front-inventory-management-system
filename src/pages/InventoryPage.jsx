import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Alert,
  Grid,
  CircularProgress,
  Stack,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Inventory2 as InventoryIcon,
  TrendingDown as LowStockIcon,
  AttachMoney as ValueIcon,
  Category as CategoryIcon,
  CloudUpload as UploadIcon,
  WarningAmber as WarningIcon,
  MoveToInbox as LoadInventoryIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import InventoryTable from '../components/inventory/InventoryTable';
import InventoryForm from '../components/inventory/InventoryForm';
import ProductFormModal from '../components/inventory/ProductFormModal';
import InventoryFilters from '../components/inventory/InventoryFilters';
import BulkUploadDialog from '../components/inventory/BulkUploadDialog';
import BulkInventoryUploadDialog from '../components/inventory/BulkInventoryUploadDialog';
import BulkUploadSelector from '../components/inventory/BulkUploadSelector';
import InboundTransactionForm from '../components/inventory/InboundTransactionForm';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ExportButton from '../components/common/ExportButton';
import PrintButton from '../components/common/PrintButton';
import StatsCard from '../components/common/StatsCard';
import { inventoryService } from '../services/inventory.service';
import { warehouseService } from '../services/warehouse.service';
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
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [bulkUploadSelectorOpen, setBulkUploadSelectorOpen] = useState(false);
  const [bulkUploadProductOpen, setBulkUploadProductOpen] = useState(false);
  const [bulkUploadInventoryOpen, setBulkUploadInventoryOpen] = useState(false);
  const [inventoryLoadFormOpen, setInventoryLoadFormOpen] = useState(false);
  const [noWarehousesDialogOpen, setNoWarehousesDialogOpen] = useState(false);

  const queryClient = useQueryClient();
  const navigate = useNavigate();
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

  // Validate warehouses on component mount
  useEffect(() => {
    const checkWarehouses = async () => {
      try {
        const response = await warehouseService.getAll();
        const warehouses = response?.data?.items || [];

        if (warehouses.length === 0) {
          setNoWarehousesDialogOpen(true);
        }
      } catch (error) {
        console.error('Error checking warehouses:', error);
        toast.error('Error al verificar almacenes');
      }
    };

    checkWarehouses();
  }, []);

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

  // Fetch inventory summary/statistics
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['inventory-summary'],
    queryFn: () => inventoryService.getSummary(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => inventoryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
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
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
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
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
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

  const handleOpenProductForm = (item = null) => {
    console.log('Opening ProductFormModal...');
    setSelectedItem(item);
    setProductFormOpen(true);
  };

  const handleCloseProductForm = () => {
    setSelectedItem(null);
    setProductFormOpen(false);
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

  // Process inventory data to calculate total stock
  const inventoryData = useMemo(() => {
    const items = Array.isArray(rawData) ? rawData : [];

    return items.map((product) => {
      // Calculate total stock from stock array if available
      let totalStock = 0;

      if (product.stock && Array.isArray(product.stock)) {
        totalStock = product.stock.reduce((sum, s) => sum + (s.currentStock || 0), 0);
      } else if (product.quantity !== undefined) {
        totalStock = product.quantity || 0;
      } else if (product.currentStock !== undefined) {
        totalStock = product.currentStock || 0;
      }

      return {
        ...product,
        totalStock,
      };
    });
  }, [rawData]);

  // Categories for filter dropdown
  const categories = useMemo(() => {
    return [...new Set(inventoryData.map((item) => item.category).filter(Boolean))].sort();
  }, [inventoryData]);

  const stats = useMemo(() => {
    // Use backend summary data if available
    if (summaryData?.data?.summary) {
      return {
        totalItems: summaryData.data.summary.totalProducts || 0,
        lowStockItems: summaryData.data.summary.lowStockCount || 0,
        outOfStock: summaryData.data.summary.criticalStockCount || 0,
        totalValue: summaryData.data.summary.totalValue || 0,
        categories: categories.length,
      };
    }

    // Fallback to client-side calculation if backend data not available
    if (!inventoryData || inventoryData.length === 0) return null;

    const totalItems = inventoryData.length;

    // Calculate low stock items (stock below minimumStock)
    const lowStockItems = inventoryData.filter((item) => {
      const totalStock = item.totalStock || 0;
      const minStock = item.minimumStock || 0;
      return totalStock > 0 && totalStock <= minStock;
    }).length;

    // Calculate out of stock items (stock = 0)
    const outOfStock = inventoryData.filter((item) => {
      const totalStock = item.totalStock || 0;
      return totalStock === 0;
    }).length;

    // Calculate total inventory value
    const totalValue = inventoryData.reduce((sum, item) => {
      const stock = item.totalStock || 0;
      const price = item.price || 0;
      return sum + (stock * price);
    }, 0);

    return {
      totalItems,
      lowStockItems,
      outOfStock,
      totalValue,
      categories: categories.length,
    };
  }, [inventoryData, summaryData, categories]);

  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        {t('errorLoadingInventory')}: {error.message}
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
            onClick={() => handleOpenProductForm()}
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
          <Button
            variant="contained"
            startIcon={<LoadInventoryIcon />}
            onClick={() => setInventoryLoadFormOpen(true)}
            sx={{
              px: 3,
              py: 1.25,
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                boxShadow: '0 6px 16px rgba(16, 185, 129, 0.35)',
              },
            }}
          >
            {t('loadInventory') || 'Cargar Inventario'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => setBulkUploadSelectorOpen(true)}
            sx={{
              px: 3,
              py: 1.25,
              borderColor: '#6366f1',
              color: '#6366f1',
              '&:hover': {
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(99, 102, 241, 0.05)',
              },
            }}
          >
            {t('bulkUpload') || 'Carga masiva'}
          </Button>
          <ExportButton data={inventoryData} fileName="inventory.csv" />
          <PrintButton data={inventoryData} title={t('inventory')} />
        </Stack>
      </Stack>

      {isLoading || summaryLoading ? (
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

      <ProductFormModal
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        initialData={selectedItem}
      />

      <ProductFormModal
        open={productFormOpen}
        onClose={handleCloseProductForm}
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

      <BulkUploadSelector
        open={bulkUploadSelectorOpen}
        onClose={() => setBulkUploadSelectorOpen(false)}
        onSelectProduct={() => setBulkUploadProductOpen(true)}
        onSelectInventory={() => setBulkUploadInventoryOpen(true)}
      />

      <BulkUploadDialog
        open={bulkUploadProductOpen}
        onClose={() => setBulkUploadProductOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['inventory'] });
          queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
          setBulkUploadProductOpen(false);
        }}
      />

      <BulkInventoryUploadDialog
        open={bulkUploadInventoryOpen}
        onClose={() => setBulkUploadInventoryOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['inventory'] });
          queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
          setBulkUploadInventoryOpen(false);
        }}
      />

      <InboundTransactionForm
        open={inventoryLoadFormOpen}
        onClose={() => setInventoryLoadFormOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['inventory'] });
          queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
          setInventoryLoadFormOpen(false);
          toast.success('Inventario cargado exitosamente');
        }}
      />

      {/* No Warehouses Warning Dialog */}
      <Dialog
        open={noWarehousesDialogOpen}
        onClose={() => {}}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <WarningIcon color="warning" sx={{ fontSize: 32 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Almacenes requeridos
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body1">
              Se requiere tener al menos un almacén creado para poder gestionar el inventario.
            </Typography>
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Por favor, cree al menos un almacén en la sección de Gestión de Almacenes antes de
            continuar con la gestión de inventario.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            variant="contained"
            onClick={() => {
              setNoWarehousesDialogOpen(false);
              navigate('/warehouses');
            }}
            fullWidth
          >
            Ir a Gestión de Almacenes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InventoryPage;
