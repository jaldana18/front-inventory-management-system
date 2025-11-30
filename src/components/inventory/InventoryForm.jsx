import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
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
  Chip,
  Tooltip,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Close as CloseIcon,
  Inventory as InventoryIcon,
  QrCode as QrCodeIcon,
  AttachMoney as MoneyIcon,
  Category as CategoryIcon,
  LocationOn as LocationIcon,
  Business as SupplierIcon,
  AutoAwesome as AutoIcon,
} from '@mui/icons-material';
import { useLanguage } from '../../context/LanguageContext';

const inventorySchema = z.object({
  sku: z.string()
    .min(3, 'El código debe tener al menos 3 caracteres')
    .max(50, 'El código no puede exceder 50 caracteres')
    .regex(/^[A-Z0-9-]+$/, 'El código solo puede contener letras mayúsculas, números y guiones'),
  name: z.string()
    .min(3, 'Nombre debe tener al menos 3 caracteres')
    .max(200, 'Nombre no puede exceder 200 caracteres'),
  description: z.string().max(1000, 'Descripción no puede exceder 1000 caracteres').optional(),
  category: z.string().min(1, 'Categoría es requerida'),
  quantity: z.coerce.number().min(0, 'Cantidad debe ser 0 o mayor'),
  minStock: z.coerce.number().min(0, 'Stock mínimo debe ser 0 o mayor'),
  unitPrice: z.coerce.number().min(0.01, 'Precio debe ser mayor a 0'),
  cost: z.coerce.number().min(0, 'Costo debe ser 0 o mayor').optional(),
  supplier: z.string().max(200, 'Proveedor no puede exceder 200 caracteres').optional(),
  location: z.string().max(100, 'Ubicación no puede exceder 100 caracteres').optional(),
  unit: z.string().min(1, 'Unidad de medida es requerida'),
  isActive: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

const categories = [
  { label: 'Electrónica', value: 'Electronics', icon: '💻', color: '#3B82F6' },
  { label: 'Ropa y Textiles', value: 'Clothing', icon: '👔', color: '#EC4899' },
  { label: 'Alimentos y Bebidas', value: 'Food & Beverages', icon: '🍔', color: '#F59E0B' },
  { label: 'Suministros de Oficina', value: 'Office Supplies', icon: '📎', color: '#10B981' },
  { label: 'Muebles', value: 'Furniture', icon: '🪑', color: '#8B5CF6' },
  { label: 'Herramientas', value: 'Tools', icon: '🔧', color: '#EF4444' },
  { label: 'Deportes', value: 'Sports', icon: '⚽', color: '#06B6D4' },
  { label: 'Salud y Belleza', value: 'Health & Beauty', icon: '💄', color: '#F472B6' },
  { label: 'Automotriz', value: 'Automotive', icon: '🚗', color: '#64748B' },
  { label: 'Otro', value: 'Other', icon: '📦', color: '#6B7280' },
];

const units = [
  { label: 'Pieza', value: 'piece' },
  { label: 'Caja', value: 'box' },
  { label: 'Paquete', value: 'package' },
  { label: 'Kilogramo', value: 'kg' },
  { label: 'Gramo', value: 'g' },
  { label: 'Litro', value: 'l' },
  { label: 'Mililitro', value: 'ml' },
  { label: 'Metro', value: 'm' },
  { label: 'Centímetro', value: 'cm' },
  { label: 'Unidad', value: 'unit' },
  { label: 'Docena', value: 'dozen' },
  { label: 'Par', value: 'pair' },
];

const InventoryForm = ({ open, onClose, onSubmit, initialData = null }) => {
  const { t } = useLanguage();
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState('');

  // Funciones de formato de moneda
  const formatCurrency = (value) => {
    if (!value && value !== 0) return '';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const parseCurrency = (value) => {
    if (!value) return 0;
    return parseFloat(value.toString().replace(/[^0-9.-]/g, '')) || 0;
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
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
      cost: 0,
      supplier: '',
      location: '',
      unit: 'piece',
      isActive: true,
      tags: [],
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    if (initialData) {
      // Mapear datos del backend a los campos del formulario
      const mappedData = {
        sku: initialData.sku || '',
        name: initialData.name || '',
        description: initialData.description || '',
        category: initialData.category || '',
        quantity: initialData.currentStock || initialData.quantity || 0,
        minStock: initialData.minimumStock || initialData.minStock || 0,
        unitPrice: initialData.price || initialData.unitPrice || 0,
        cost: initialData.cost || 0,
        supplier: initialData.supplier || '',
        location: initialData.location || '',
        unit: initialData.unitOfMeasure || initialData.unit || 'piece',
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        tags: initialData.tags || [],
      };
      reset(mappedData);
      setTags(mappedData.tags);
    } else {
      // Resetear a valores por defecto cuando initialData es null
      reset({
        sku: '',
        name: '',
        description: '',
        category: '',
        quantity: 0,
        minStock: 0,
        unitPrice: 0,
        cost: 0,
        supplier: '',
        location: '',
        unit: 'piece',
        isActive: true,
        tags: [],
      });
      setTags([]);
    }
  }, [initialData, reset]);

  const handleClose = () => {
    reset();
    setTags([]);
    onClose();
  };

  const handleFormSubmit = (data) => {
    const submitData = {
      ...data,
      tags: tags,
    };
    onSubmit(submitData);
    handleClose();
  };

  const generateSKU = () => {
    const category = watchedValues.category;
    const categoryCode = categories.find(c => c.value === category)?.value.substring(0, 3).toUpperCase() || 'PRD';
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const timestamp = Date.now().toString().slice(-4);
    setValue('sku', `${categoryCode}-${randomNum}${timestamp}`);
  };

  const handleAddTag = () => {
    if (currentTag && !tags.includes(currentTag)) {
      setTags([...tags, currentTag]);
      setCurrentTag('');
    }
  };

  const handleDeleteTag = (tagToDelete) => {
    setTags(tags.filter(tag => tag !== tagToDelete));
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, pt: 3, px: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
              {initialData ? 'Editar Producto' : '🔥 NUEVO DISEÑO - Nuevo Producto 🔥'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {initialData
                ? 'Actualiza la información del producto'
                : 'Complete la información del nuevo producto'}
            </Typography>
          </Box>
          <IconButton
            onClick={handleClose}
            sx={{
              color: 'text.secondary',
              '&:hover': { backgroundColor: 'action.hover' },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider sx={{ mt: 2 }} />

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent sx={{ px: 3, py: 3, maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Información Básica */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2.5, color: 'text.primary' }}>
              Información Básica
            </Typography>
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nombre del Producto *"
                      fullWidth
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <InventoryIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="sku"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Código del Producto *"
                      fullWidth
                      error={!!errors.sku}
                      helperText={errors.sku?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <QrCodeIcon color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip title="Generar código automático">
                              <IconButton onClick={generateSKU} size="small" color="primary">
                                <AutoIcon />
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="unit"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Unidad de Medida *"
                      fullWidth
                      error={!!errors.unit}
                      helperText={errors.unit?.message}
                      sx={{ minWidth: '100%' }}
                      SelectProps={{
                        MenuProps: {
                          PaperProps: {
                            style: {
                              maxHeight: 300,
                            },
                          },
                        },
                      }}
                    >
                      {units.map((unit) => (
                        <MenuItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Categoría *"
                      fullWidth
                      error={!!errors.category}
                      helperText={errors.category?.message}
                      sx={{ minWidth: '100%' }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CategoryIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      SelectProps={{
                        MenuProps: {
                          PaperProps: {
                            style: {
                              maxHeight: 300,
                            },
                          },
                        },
                      }}
                    >
                      {categories.map((category) => (
                        <MenuItem key={category.value} value={category.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span style={{ fontSize: '18px' }}>{category.icon}</span>
                            <span>{category.label}</span>
                          </Box>
                        </MenuItem>
                      ))}
                    </TextField>
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
                      label="Descripción"
                      fullWidth
                      multiline
                      rows={2}
                      error={!!errors.description}
                      helperText={errors.description?.message || 'Opcional - Descripción detallada del producto'}
                      placeholder="Ingrese características y detalles del producto..."
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Información Financiera */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2.5, color: 'text.primary' }}>
              Información Financiera
            </Typography>
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="cost"
                  control={control}
                  render={({ field: { onChange, value, ...field } }) => (
                    <TextField
                      {...field}
                      value={value ? formatCurrency(value).replace('COP', '').trim() : ''}
                      onChange={(e) => {
                        const numericValue = parseCurrency(e.target.value);
                        onChange(numericValue);
                      }}
                      label="Costo Unitario"
                      fullWidth
                      error={!!errors.cost}
                      helperText={errors.cost?.message || 'Opcional - Costo de adquisición'}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      placeholder="0"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="unitPrice"
                  control={control}
                  render={({ field: { onChange, value, ...field } }) => (
                    <TextField
                      {...field}
                      value={value ? formatCurrency(value).replace('COP', '').trim() : ''}
                      onChange={(e) => {
                        const numericValue = parseCurrency(e.target.value);
                        onChange(numericValue);
                      }}
                      label="Precio de Venta *"
                      fullWidth
                      error={!!errors.unitPrice}
                      helperText={errors.unitPrice?.message}
                      required
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      placeholder="0"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="quantity"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Cantidad Inicial *"
                      type="number"
                      fullWidth
                      error={!!errors.quantity}
                      helperText={errors.quantity?.message}
                      required
                      InputProps={{
                        inputProps: { min: '0' }
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="minStock"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Stock Mínimo *"
                      type="number"
                      fullWidth
                      error={!!errors.minStock}
                      helperText={errors.minStock?.message || 'Nivel mínimo antes de reordenar'}
                      required
                      InputProps={{
                        inputProps: { min: '0' }
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Información Adicional */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2.5, color: 'text.primary' }}>
              Información Adicional
            </Typography>
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="supplier"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Proveedor"
                      fullWidth
                      error={!!errors.supplier}
                      helperText={errors.supplier?.message || 'Opcional - Nombre del proveedor'}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SupplierIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="location"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Ubicación en Almacén"
                      fullWidth
                      error={!!errors.location}
                      helperText={errors.location?.message || 'Opcional - Ej: Almacén A, Estante 3'}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      placeholder="Ej: Pasillo A, Estante 3"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                    Etiquetas (Opcional)
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                    {tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        onDelete={() => handleDeleteTag(tag)}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      size="small"
                      label="Agregar etiqueta"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      placeholder="Ej: nuevo, promoción"
                      sx={{ flexGrow: 1 }}
                    />
                    <Button onClick={handleAddTag} variant="outlined" size="small">
                      Agregar
                    </Button>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label="Producto activo"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 3, py: 2.5, gap: 1.5 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            sx={{
              color: 'text.secondary',
              borderColor: 'divider',
              px: 3,
              '&:hover': {
                borderColor: 'text.secondary',
                backgroundColor: 'action.hover',
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            sx={{
              px: 3,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)',
              },
            }}
          >
            {initialData ? 'Actualizar Producto' : 'Crear Producto'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default InventoryForm;
