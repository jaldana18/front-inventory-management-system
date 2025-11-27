import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  CircularProgress,
  Alert,
  Box,
  Typography,
  Divider,
  Grid,
  InputAdornment,
} from '@mui/material';
import { useAuth } from '../../context/useAuth';
import { inventoryService } from '../../services/inventory.service';
import { productService } from '../../services/product.service';
import { warehouseService } from '../../services/warehouse.service';
import { getAccessibleWarehouses, getDefaultWarehouseId } from '../../utils/warehouse.utils';
import { ROLES } from '../../config/roles.config';
import toast from 'react-hot-toast';

const INBOUND_REASONS = [
  { value: 'PURCHASE', label: 'Compra' },
  { value: 'RETURN', label: 'Devolución' },
  { value: 'FOUND', label: 'Encontrado' },
  { value: 'INITIAL_STOCK', label: 'Stock Inicial' },
];

export default function InboundTransactionForm({ open, onClose, onSuccess }) {
  const { userRole, userWarehouseId } = useAuth();
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Currency formatting functions - flexible for any currency
  const formatCurrency = (value) => {
    if (!value && value !== 0) return '';
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const parseCurrency = (value) => {
    if (!value) return '';
    return value.toString().replace(/[^0-9.]/g, '');
  };

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      productId: '',
      warehouseId: getDefaultWarehouseId(userRole, userWarehouseId, ''),
      reason: 'PURCHASE',
      quantity: '',
      unitCost: '',
      reference: '',
      location: '',
      notes: '',
    },
  });

  // Load initial data
  useEffect(() => {
    if (open) {
      loadInitialData();
    }
  }, [open, userRole, userWarehouseId]);

  const loadInitialData = async () => {
    setLoadingData(true);
    try {
      const [productsRes, warehousesRes] = await Promise.all([
        productService.getAll({ isActive: true }),
        warehouseService.getAll(),
      ]);

      // Extract products from API response structure
      const productsData = productsRes?.data?.items || productsRes?.items || productsRes?.data || [];
      setProducts(Array.isArray(productsData) ? productsData : []);

      // Extract warehouses from API response structure
      const warehousesData = warehousesRes?.data?.items || warehousesRes?.items || warehousesRes?.data || [];

      // Filter warehouses based on user role
      const accessibleWarehouses = getAccessibleWarehouses(
        Array.isArray(warehousesData) ? warehousesData : [],
        userRole,
        userWarehouseId
      );
      setWarehouses(accessibleWarehouses);

      // Auto-select warehouse for users
      if (userRole === ROLES.USER && userWarehouseId) {
        setValue('warehouseId', userWarehouseId);
      } else if (accessibleWarehouses.length === 1) {
        // Auto-select if only one warehouse available
        setValue('warehouseId', accessibleWarehouses[0].id);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const transactionData = {
        productId: parseInt(data.productId),
        warehouseId: parseInt(data.warehouseId),
        type: 'INBOUND',
        reason: data.reason,
        quantity: parseInt(data.quantity),
        unitCost: data.unitCost ? parseFloat(data.unitCost) : undefined,
        reference: data.reference || undefined,
        location: data.location || undefined,
        notes: data.notes || undefined,
      };

      await inventoryService.create(transactionData);

      toast.success('Entrada de inventario registrada correctamente');
      reset();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error creating inbound transaction:', error);

      // Handle specific error codes
      if (error.response?.data?.error?.code === 'WAREHOUSE_ACCESS_DENIED') {
        toast.error('No tienes acceso a este almacén');
      } else {
        toast.error(error.response?.data?.error?.message || 'Error al registrar entrada');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      reset();
      onClose();
    }
  };

  const isUserRole = userRole === ROLES.USER;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Nueva Entrada de Inventario
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Registra la entrada de productos al almacén
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {loadingData ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ pt: 1 }}>
              {/* Información Básica */}
              <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                Información Básica
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                {/* Product Selection */}
                <Grid item xs={12} md={6}>
                  <Controller
                    name="productId"
                    control={control}
                    rules={{ required: 'Producto es requerido' }}
                    render={({ field }) => (
                      <FormControl error={!!errors.productId} sx={{ width: '100%', minWidth: 300 }}>
                        <InputLabel>Producto *</InputLabel>
                        <Select
                          {...field}
                          label="Producto *"
                          sx={{ minWidth: 300 }}
                          MenuProps={{
                            PaperProps: {
                              style: {
                                maxHeight: 300,
                              },
                            },
                          }}
                        >
                          <MenuItem value="">
                            <em>Seleccionar producto</em>
                          </MenuItem>
                          {products.map((product) => (
                            <MenuItem key={product.id} value={product.id}>
                              {product.name} ({product.sku})
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.productId && (
                          <FormHelperText>{errors.productId.message}</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>

                {/* Warehouse Selection */}
                <Grid item xs={12} md={6}>
                  <Controller
                    name="warehouseId"
                    control={control}
                    rules={{ required: 'Almacén es requerido' }}
                    render={({ field }) => (
                      <FormControl error={!!errors.warehouseId} sx={{ width: '100%', minWidth: 300 }}>
                        <InputLabel>Almacén *</InputLabel>
                        <Select
                          {...field}
                          label="Almacén *"
                          disabled={isUserRole}
                          sx={{ minWidth: 300 }}
                          MenuProps={{
                            PaperProps: {
                              style: {
                                maxHeight: 300,
                              },
                            },
                          }}
                        >
                          <MenuItem value="">
                            <em>Seleccionar almacén</em>
                          </MenuItem>
                          {warehouses.map((warehouse) => (
                            <MenuItem key={warehouse.id} value={warehouse.id}>
                              {warehouse.name} ({warehouse.code})
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.warehouseId && (
                          <FormHelperText>{errors.warehouseId.message}</FormHelperText>
                        )}
                        {isUserRole && (
                          <FormHelperText>Asignado automáticamente a tu almacén</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>

                {/* Reason */}
                <Grid item xs={12} md={6}>
                  <Controller
                    name="reason"
                    control={control}
                    rules={{ required: 'Motivo es requerido' }}
                    render={({ field }) => (
                      <FormControl error={!!errors.reason} sx={{ width: '100%', minWidth: 250 }}>
                        <InputLabel>Motivo *</InputLabel>
                        <Select
                          {...field}
                          label="Motivo *"
                          sx={{ minWidth: 250 }}
                          MenuProps={{
                            PaperProps: {
                              style: {
                                maxHeight: 300,
                              },
                            },
                          }}
                        >
                          {INBOUND_REASONS.map((reason) => (
                            <MenuItem key={reason.value} value={reason.value}>
                              {reason.label}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.reason && (
                          <FormHelperText>{errors.reason.message}</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>

                {/* Quantity */}
                <Grid item xs={12} md={6}>
                  <Controller
                    name="quantity"
                    control={control}
                    rules={{
                      required: 'Cantidad es requerida',
                      min: { value: 1, message: 'Cantidad debe ser mayor a 0' },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Cantidad *"
                        type="number"
                        fullWidth
                        error={!!errors.quantity}
                        helperText={errors.quantity?.message}
                        InputProps={{ inputProps: { min: 1 } }}
                      />
                    )}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Información Financiera */}
              <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                Información Financiera
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                {/* Unit Cost */}
                <Grid item xs={12} md={6}>
                  <Controller
                    name="unitCost"
                    control={control}
                    render={({ field: { onChange, value, ...field } }) => (
                      <TextField
                        {...field}
                        value={value ? formatCurrency(value) : ''}
                        onChange={(e) => {
                          const numericValue = parseCurrency(e.target.value);
                          onChange(numericValue);
                        }}
                        label="Costo Unitario"
                        fullWidth
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                        helperText="Opcional - Costo por unidad (acepta decimales)"
                        placeholder="0"
                      />
                    )}
                  />
                </Grid>

                {/* Reference */}
                <Grid item xs={12} md={6}>
                  <Controller
                    name="reference"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Referencia/Factura"
                        fullWidth
                        placeholder="FAC-12345"
                        helperText="Opcional - Número de factura o referencia"
                      />
                    )}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Información de Ubicación */}
              <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                Información Adicional
              </Typography>

              <Grid container spacing={2}>
                {/* Location */}
                <Grid item xs={12}>
                  <Controller
                    name="location"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Ubicación en Almacén"
                        fullWidth
                        placeholder="Estante A-12, Pasillo 3"
                        helperText="Opcional - Ubicación física del producto"
                      />
                    )}
                  />
                </Grid>

                {/* Notes */}
                <Grid item xs={12}>
                  <Controller
                    name="notes"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Notas"
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Detalles adicionales sobre esta entrada..."
                        helperText="Opcional - Información adicional relevante"
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
          <Button onClick={handleClose} disabled={loading} sx={{ mr: 1 }}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || loadingData}
            startIcon={loading && <CircularProgress size={20} color="inherit" />}
            sx={{
              px: 3,
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              },
              '&:disabled': {
                background: 'rgba(16, 185, 129, 0.5)',
              },
            }}
          >
            {loading ? 'Registrando...' : 'Registrar Entrada'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
