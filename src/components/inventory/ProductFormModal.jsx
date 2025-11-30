import { useState, useEffect } from 'react';
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
  Typography,
  Box,
  IconButton,
  InputAdornment,
  Chip,
  Switch,
  FormControlLabel,
  MenuItem,
} from '@mui/material';
import {
  Close as CloseIcon,
  Inventory2 as InventoryIcon,
  QrCode2 as QrCodeIcon,
  AutoAwesome as AutoGenerateIcon,
  LocalOffer as TagIcon,
} from '@mui/icons-material';
import { useLanguage } from '../../context/LanguageContext';

// Esquema de validación
const productSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  sku: z.string().min(3, 'El código debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  category: z.string().min(1, 'La categoría es requerida'),
  unit: z.string().min(1, 'La unidad es requerida'),
  cost: z.coerce.number().min(0, 'El costo debe ser mayor o igual a 0').optional(),
  price: z.coerce.number().min(0.01, 'El precio debe ser mayor a 0'),
  quantity: z.coerce.number().min(0, 'La cantidad debe ser mayor o igual a 0'),
  minStock: z.coerce.number().min(0, 'El stock mínimo debe ser mayor o igual a 0'),
  supplier: z.string().optional(),
  location: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Categorías predefinidas
const categories = [
  'Electrónica',
  'Ropa',
  'Alimentos',
  'Bebidas',
  'Muebles',
  'Herramientas',
  'Juguetes',
  'Deportes',
  'Libros',
  'Otros',
];

// Unidades de medida
const units = [
  { label: 'Pieza', value: 'Piez' },
  { label: 'Caja', value: 'Caja' },
  { label: 'Paquete', value: 'Paquete' },
  { label: 'Kilogramo', value: 'kg' },
  { label: 'Gramo', value: 'g' },
  { label: 'Litro', value: 'l' },
  { label: 'Unidad', value: 'Unidad' },
];

const ProductFormModal = ({ open, onClose, onSubmit, initialData = null }) => {
  const { t } = useLanguage();
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      sku: '',
      description: '',
      category: '',
      unit: 'Piez',
      cost: 0,
      price: 0,
      quantity: 0,
      minStock: 0,
      supplier: '',
      location: '',
      isActive: true,
    },
  });

  const watchedValues = watch();

  // Log para depuración
  useEffect(() => {
    console.log('ProductFormModal open:', open);
  }, [open]);

  // Cargar datos iniciales cuando se edita
  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || '',
        sku: initialData.sku || '',
        description: initialData.description || '',
        category: initialData.category || '',
        unit: initialData.unitOfMeasure || initialData.unit || 'Piez',
        cost: initialData.cost || 0,
        price: initialData.price || initialData.unitPrice || 0,
        quantity: initialData.currentStock || initialData.quantity || 0,
        minStock: initialData.minimumStock || initialData.minStock || 0,
        supplier: initialData.supplier || '',
        location: initialData.location || '',
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
      });
      setTags(initialData.tags || []);
    } else {
      reset({
        name: '',
        sku: '',
        description: '',
        category: '',
        unit: 'Piez',
        cost: 0,
        price: 0,
        quantity: 0,
        minStock: 0,
        supplier: '',
        location: '',
        isActive: true,
      });
      setTags([]);
    }
  }, [initialData, reset]);

  const handleClose = () => {
    reset();
    setTags([]);
    setCurrentTag('');
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

  // Generar código automático
  const handleGenerateSKU = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    setValue('sku', `PRD-${timestamp}${random}`);
  };

  // Agregar etiqueta
  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  // Eliminar etiqueta
  const handleDeleteTag = (tagToDelete) => {
    setTags(tags.filter((tag) => tag !== tagToDelete));
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
      {/* Header */}
      <DialogTitle
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              NUEVO DISEÑO - Nuevo Producto 🔥
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              Complete la información del nuevo producto
            </Typography>
          </Box>
          <IconButton
            onClick={handleClose}
            sx={{
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent sx={{ p: 3 }}>
          {/* Información Básica */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Información Básica
            </Typography>
            <Grid container spacing={2}>
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
                            <InventoryIcon sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
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
                            <QrCodeIcon sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={handleGenerateSKU} size="small" color="primary">
                              <AutoGenerateIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Controller
                  name="unit"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Unidad d... *"
                      fullWidth
                      error={!!errors.unit}
                      helperText={errors.unit?.message}
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

              <Grid item xs={12} sm={4}>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Categor... *"
                      fullWidth
                      error={!!errors.category}
                      helperText={errors.category?.message}
                    >
                      <MenuItem value="">...</MenuItem>
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
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
                      rows={3}
                      error={!!errors.description}
                      helperText={errors.description?.message || 'Opcional - Descripción detallada del producto'}
                      placeholder="Ingrese características y especificaciones..."
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Información Financiera */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Información Financiera
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <Controller
                  name="cost"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Costo Unitario"
                      type="number"
                      fullWidth
                      error={!!errors.cost}
                      helperText={errors.cost?.message || 'Opcional - Costo de adquisición'}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        inputProps: { min: 0, step: '0.01' },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <Controller
                  name="price"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Precio de Venta **"
                      type="number"
                      fullWidth
                      error={!!errors.price}
                      helperText={errors.price?.message}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        inputProps: { min: 0, step: '0.01' },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <Controller
                  name="quantity"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Cantidad Inicial **"
                      type="number"
                      fullWidth
                      error={!!errors.quantity}
                      helperText={errors.quantity?.message}
                      InputProps={{
                        inputProps: { min: 0 },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <Controller
                  name="minStock"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Stock Mínimo **"
                      type="number"
                      fullWidth
                      error={!!errors.minStock}
                      helperText={errors.minStock?.message || 'Nivel mínimo antes de reordenar'}
                      InputProps={{
                        inputProps: { min: 0 },
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Información Adicional */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Información Adicional
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
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
                            <InventoryIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                    Etiquetas (Opcional)
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
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
                      placeholder="Agregar etiqueta"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      sx={{ flex: 1 }}
                    />
                    <Button
                      onClick={handleAddTag}
                      variant="outlined"
                      size="small"
                      sx={{
                        color: '#8b5cf6',
                        borderColor: '#8b5cf6',
                        '&:hover': {
                          borderColor: '#7c3aed',
                          bgcolor: 'rgba(139, 92, 246, 0.05)',
                        },
                      }}
                    >
                      Agregar
                    </Button>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
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
                      placeholder="Ej: Pasillo A, Estante 3"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">📍</InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            {...field}
                            checked={field.value}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#8b5cf6',
                                '&:hover': {
                                  bgcolor: 'rgba(139, 92, 246, 0.08)',
                                },
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                bgcolor: '#8b5cf6',
                              },
                            }}
                          />
                        }
                        label={
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            Producto activo
                          </Typography>
                        }
                      />
                    )}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        {/* Actions */}
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            sx={{
              color: 'text.secondary',
              borderColor: 'divider',
              '&:hover': {
                borderColor: 'text.secondary',
                bgcolor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            sx={{
              px: 4,
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
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

export default ProductFormModal;
