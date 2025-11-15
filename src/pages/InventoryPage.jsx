import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  Typography,
  Alert,
  Grid,
  CircularProgress,
  Stack,
  Skeleton,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Inventory2 as InventoryIcon,
  TrendingDown as LowStockIcon,
  AttachMoney as ValueIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import InventoryTable from '../components/inventory/InventoryTable';
import InventoryForm from '../components/inventory/InventoryForm';
import StatsCard from '../components/common/StatsCard';
import { inventoryService } from '../services/inventory.service';
import { useInventoryStore } from '../store/inventoryStore';

const InventoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const queryClient = useQueryClient();
  const { setItems } = useInventoryStore();

  // Fetch inventory data
  const { data, isLoading, error } = useQuery({
    queryKey: ['inventory'],
    queryFn: inventoryService.getAll,
    onSuccess: (data) => {
      setItems(data);
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: inventoryService.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['inventory']);
      toast.success('Item created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create item');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => inventoryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['inventory']);
      toast.success('Item updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update item');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: inventoryService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['inventory']);
      toast.success('Item deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete item');
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
    if (window.confirm(`Are you sure you want to delete ${item.name}?`)) {
      deleteMutation.mutate(item.id);
    }
  };

  const filteredData = data?.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const stats = useMemo(() => {
    if (!data) return null;

    const totalItems = data.length;
    const lowStockItems = data.filter(
      (item) => item.quantity <= item.minStock && item.quantity > 0
    ).length;
    const outOfStock = data.filter((item) => item.quantity === 0).length;
    const totalValue = data.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const categories = [...new Set(data.map((item) => item.category))].length;

    return {
      totalItems,
      lowStockItems,
      outOfStock,
      totalValue,
      categories,
    };
  }, [data]);

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
            Inventory Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your products and track stock levels
          </Typography>
        </Box>
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
          Add New Item
        </Button>
      </Stack>

      {isLoading ? (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      ) : stats ? (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Total Items"
              value={stats.totalItems}
              subtitle="Products in inventory"
              icon={InventoryIcon}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Inventory Value"
              value={`$${stats.totalValue.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              subtitle="Total stock value"
              icon={ValueIcon}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Low Stock"
              value={stats.lowStockItems}
              subtitle="Items need restock"
              icon={LowStockIcon}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Out of Stock"
              value={stats.outOfStock}
              subtitle="Items unavailable"
              icon={CategoryIcon}
              color="error"
            />
          </Grid>
        </Grid>
      ) : null}

      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Search by product name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
            },
          }}
        />
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <InventoryTable
          data={filteredData}
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
    </Box>
  );
};

export default InventoryPage;
