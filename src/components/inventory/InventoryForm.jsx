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
  Autocomplete,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Alert,
  Tooltip,
  FormControlLabel,
  Switch,
  Collapse,
} from '@mui/material';
import {
  Close as CloseIcon,
  Inventory as InventoryIcon,
  QrCode as QrCodeIcon,
  AttachMoney as MoneyIcon,
  Category as CategoryIcon,
  LocationOn as LocationIcon,
  Business as SupplierIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
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
  const [activeStep, setActiveStep] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
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
  const profit = watchedValues.cost ? watchedValues.unitPrice - watchedValues.cost : 0;
  const profitMargin = watchedValues.cost ? ((profit / watchedValues.unitPrice) * 100).toFixed(2) : 0;
  const isLowStock = watchedValues.quantity <= watchedValues.minStock;

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
    setActiveStep(0);
    setShowAdvanced(false);
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

  // Validación por pasos
  const validateStep = (step) => {
    const values = watchedValues;
    
    switch (step) {
      case 0: // Información Básica
        return !!(
          values.name && 
          values.name.length >= 3 &&
          values.sku && 
          values.sku.length >= 3 &&
          values.category &&
          values.unit
        );
      case 1: // Precios e Inventario
        return !!(
          values.unitPrice && 
          values.unitPrice > 0 &&
          values.quantity >= 0 &&
          values.minStock >= 0
        );
      case 2: // Detalles Adicionales
        return true; // Opcionales
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(activeStep + 1);
    }
  };

  const steps = ['Información Básica', 'Precios e Inventario', 'Detalles Adicionales'];

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
              Complete la información básica del producto
            </Alert>
            
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
                      helperText={errors.name?.message || 'Nombre descriptivo del producto'}
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

              <Grid item xs={12} sm={6}>
                <Controller
                  name="sku"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Código del Producto *"
                      fullWidth
                      error={!!errors.sku}
                      helperText={errors.sku?.message || 'Código único del producto'}
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

              <Grid item xs={12} sm={6}>
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
                      helperText={errors.unit?.message || 'Seleccione la unidad'}
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
                      helperText={errors.category?.message || 'Seleccione la categoría del producto'}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CategoryIcon color="action" />
                          </InputAdornment>
                        ),
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
                      rows={3}
                      error={!!errors.description}
                      helperText={errors.description?.message || 'Descripción detallada del producto (opcional)'}
                      placeholder="Ingrese características, especificaciones y detalles del producto..."
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <Alert severity="warning" icon={<MoneyIcon />}>
                Configure los precios y niveles de inventario
              </Alert>
            </Grid>

            <Grid item xs={12} sm={6}>
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
                    helperText={errors.cost?.message || 'Costo de adquisición del producto'}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    placeholder="0"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
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
                    label="Precio de Venta"
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

            {watchedValues.cost > 0 && watchedValues.unitPrice > 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: profit > 0 ? 'success.50' : 'error.50', border: 1, borderColor: profit > 0 ? 'success.main' : 'error.main' }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUpIcon fontSize="small" />
                    Análisis de Rentabilidad
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 3, mt: 1 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Ganancia</Typography>
                      <Typography variant="h6" color={profit > 0 ? 'success.main' : 'error.main'}>
                        ${profit.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Margen</Typography>
                      <Typography variant="h6" color={profit > 0 ? 'success.main' : 'error.main'}>
                        {profitMargin}%
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <Controller
                name="quantity"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Cantidad Actual"
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

            <Grid item xs={12} sm={6}>
              <Controller
                name="minStock"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Stock Mínimo"
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

            {isLowStock && watchedValues.quantity > 0 && (
              <Grid item xs={12}>
                <Alert severity="warning" icon={<WarningIcon />}>
                  ⚠️ La cantidad actual está en o por debajo del stock mínimo. Considere reabastecer.
                </Alert>
              </Grid>
            )}
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <Alert severity="info" icon={<InfoIcon />}>
                Información adicional opcional
              </Alert>
            </Grid>

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
                    helperText={errors.supplier?.message}
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

            <Grid item xs={12} sm={6}>
              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Ubicación"
                    fullWidth
                    error={!!errors.location}
                    helperText={errors.location?.message || 'Ej: Almacén A, Estante 3, Nivel 2'}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Etiquetas
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  {tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => handleDeleteTag(tag)}
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
                    placeholder="Ej: nuevo, promoción, temporada"
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
        );

      default:
        return null;
    }
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
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <InventoryIcon sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
                {initialData ? 'Editar Producto' : 'Nuevo Producto'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                {initialData
                  ? 'Actualiza la información del producto'
                  : 'Complete el formulario en 3 simples pasos'}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={handleClose}
            sx={{
              color: 'white',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Box sx={{ px: 3, pt: 3, pb: 2, bgcolor: '#f8f9fa' }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent sx={{ pt: 3, pb: 2, minHeight: 400 }}>
          {renderStepContent()}
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 3, gap: 1, justifyContent: 'space-between' }}>
          <Box>
            {activeStep > 0 && (
              <Button
                onClick={() => setActiveStep(activeStep - 1)}
                variant="outlined"
                color="inherit"
              >
                Atrás
              </Button>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
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
              Cancelar
            </Button>
            {activeStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                variant="contained"
                disabled={!validateStep(activeStep)}
                sx={{
                  px: 4,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(102, 126, 234, 0.5)',
                  },
                  '&:disabled': {
                    background: '#ccc',
                    color: '#666',
                  },
                }}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                type="submit"
                variant="contained"
                sx={{
                  px: 4,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(102, 126, 234, 0.5)',
                  },
                }}
              >
                {initialData ? 'Actualizar' : 'Crear Producto'}
              </Button>
            )}
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default InventoryForm;
