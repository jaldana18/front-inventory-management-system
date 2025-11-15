import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Typography,
  Box,
  Divider,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';

const inventorySchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  quantity: z.coerce.number().min(0, 'Quantity must be 0 or greater'),
  minStock: z.coerce.number().min(0, 'Minimum stock must be 0 or greater'),
  unitPrice: z.coerce.number().min(0, 'Unit price must be 0 or greater'),
  supplier: z.string().optional(),
  location: z.string().optional(),
});

const categories = [
  'Electronics',
  'Clothing',
  'Food & Beverages',
  'Office Supplies',
  'Furniture',
  'Tools',
  'Other',
];

const InventoryForm = ({ open, onClose, onSubmit, initialData = null }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(inventorySchema),
    defaultValues: initialData || {
      sku: '',
      name: '',
      description: '',
      category: '',
      quantity: 0,
      minStock: 0,
      unitPrice: 0,
      supplier: '',
      location: '',
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = (data) => {
    onSubmit(data);
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <InventoryIcon />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {initialData ? 'Edit Inventory Item' : 'Add New Item'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {initialData
                  ? 'Update the details of your inventory item'
                  : 'Add a new product to your inventory'}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={handleClose}
            sx={{
              color: 'text.secondary',
              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="sku"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="SKU"
                    fullWidth
                    error={!!errors.sku}
                    helperText={errors.sku?.message}
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Product Name"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    fullWidth
                    multiline
                    rows={3}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Category"
                    fullWidth
                    error={!!errors.category}
                    helperText={errors.category?.message}
                    required
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="supplier"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Supplier"
                    fullWidth
                    error={!!errors.supplier}
                    helperText={errors.supplier?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name="quantity"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Quantity"
                    type="number"
                    fullWidth
                    error={!!errors.quantity}
                    helperText={errors.quantity?.message}
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name="minStock"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Minimum Stock"
                    type="number"
                    fullWidth
                    error={!!errors.minStock}
                    helperText={errors.minStock?.message}
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name="unitPrice"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Unit Price"
                    type="number"
                    fullWidth
                    error={!!errors.unitPrice}
                    helperText={errors.unitPrice?.message}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">$</InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Location"
                    fullWidth
                    error={!!errors.location}
                    helperText={errors.location?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            color="inherit"
            sx={{
              borderColor: 'divider',
              color: 'text.secondary',
              '&:hover': {
                borderColor: 'text.secondary',
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{
              px: 4,
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(99, 102, 241, 0.35)',
              },
            }}
          >
            {initialData ? 'Update Item' : 'Create Item'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default InventoryForm;
