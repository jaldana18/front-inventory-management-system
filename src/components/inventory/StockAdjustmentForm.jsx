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
  Paper,
  Divider,
} from '@mui/material';
import {
  TrendingUp as IncreaseIcon,
  TrendingDown as DecreaseIcon,
  CheckCircle as NoChangeIcon,
  Edit as AdjustIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/useAuth';
import { inventoryService } from '../../services/inventory.service';
import { productService } from '../../services/product.service';
import { warehouseService } from '../../services/warehouse.service';
import { getAccessibleWarehouses, getDefaultWarehouseId } from '../../utils/warehouse.utils';
import { ROLES } from '../../config/roles.config';
import toast from 'react-hot-toast';

export default function StockAdjustmentForm({ open, onClose, onSuccess }) {
  const { userRole, userWarehouseId } = useAuth();
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [currentStock, setCurrentStock] = useState(null);
  const [checkingStock, setCheckingStock] = useState(false);

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
      newStock: '',
      reason: 'CORRECTION',
      notes: '',
    },
  });

  const selectedProductId = watch('productId');
  const selectedWarehouseId = watch('warehouseId');
  const newStock = watch('newStock');

  // Load initial data
  useEffect(() => {
    if (open) {
      loadInitialData();
    }
  }, [open, userRole, userWarehouseId]);

  // Check current stock when product or warehouse changes
  useEffect(() => {
    if (selectedProductId && selectedWarehouseId) {
      checkCurrentStock(selectedProductId, selectedWarehouseId);
    } else {
      setCurrentStock(null);
    }
  }, [selectedProductId, selectedWarehouseId]);

  const loadInitialData = async () => {
    setLoadingData(true);
    try {
      const [productsRes, warehousesRes] = await Promise.all([
        productService.getAll({ isActive: true }),
        warehouseService.getActive(),
      ]);

      setProducts(productsRes.data || []);

      // Filter warehouses based on user role
      const accessibleWarehouses = getAccessibleWarehouses(
        warehousesRes.data || [],
        userRole,
        userWarehouseId
      );
      setWarehouses(accessibleWarehouses);

      // Auto-select warehouse for users
      if (userRole === ROLES.USER && userWarehouseId) {
        setValue('warehouseId', userWarehouseId);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoadingData(false);
    }
  };

  const checkCurrentStock = async (productId, warehouseId) => {
    setCheckingStock(true);
    try {
      const response = await inventoryService.getProductStockInWarehouse(productId, warehouseId);
      setCurrentStock(response.data?.currentStock || 0);
    } catch (error) {
      console.error('Error checking stock:', error);
      setCurrentStock(0);
    } finally {
      setCheckingStock(false);
    }
  };

  const onSubmit = async (data) => {
    const newStockValue = parseInt(data.newStock);

    // Check if there's actually a difference
    if (currentStock !== null && newStockValue === currentStock) {
      toast.error('No hay diferencia entre el stock actual y el nuevo stock');
      return;
    }

    setLoading(true);
    try {
      const adjustmentData = {
        productId: parseInt(data.productId),
        warehouseId: parseInt(data.warehouseId),
        newStock: newStockValue,
        reason: data.reason,
        notes: data.notes || undefined,
      };

      await inventoryService.adjustStock(adjustmentData);

      const difference = newStockValue - currentStock;
      const action = difference > 0 ? 'Entrada' : 'Salida';
      const amount = Math.abs(difference);

      toast.success(
        `Ajuste registrado: ${action} de ${amount} unidades. Stock actualizado a ${newStockValue}`
      );

      reset();
      setCurrentStock(null);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error creating adjustment:', error);

      const errorCode = error.response?.data?.error?.code;
      if (errorCode === 'WAREHOUSE_ACCESS_DENIED') {
        toast.error('No tienes acceso a este almacén');
      } else {
        toast.error(error.response?.data?.error?.message || 'Error al registrar ajuste');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      reset();
      setCurrentStock(null);
      onClose();
    }
  };

  const isUserRole = userRole === ROLES.USER;

  // Calculate difference
  const difference =
    currentStock !== null && newStock ? parseInt(newStock) - currentStock : null;
  const hasIncrease = difference !== null && difference > 0;
  const hasDecrease = difference !== null && difference < 0;
  const hasNoChange = difference !== null && difference === 0;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <AdjustIcon />
          <span>Ajuste de Stock</span>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {loadingData ? (
            <div className="flex justify-center py-8">
              <CircularProgress />
            </div>
          ) : (
            <div className="space-y-4">
              <Alert severity="info">
                Use este formulario para ajustar el stock después de un conteo físico. El sistema
                calculará automáticamente la diferencia.
              </Alert>

              {/* Product Selection */}
              <Controller
                name="productId"
                control={control}
                rules={{ required: 'Producto es requerido' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.productId}>
                    <InputLabel>Producto</InputLabel>
                    <Select {...field} label="Producto">
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

              {/* Warehouse Selection */}
              <Controller
                name="warehouseId"
                control={control}
                rules={{ required: 'Almacén es requerido' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.warehouseId}>
                    <InputLabel>Almacén</InputLabel>
                    <Select
                      {...field}
                      label="Almacén"
                      disabled={isUserRole} // Disabled for users
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
                  </FormControl>
                )}
              />

              <Divider />

              {/* Current Stock Display */}
              {selectedProductId && selectedWarehouseId && (
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Stock Actual en Sistema
                  </Typography>
                  {checkingStock ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <CircularProgress size={20} />
                      <Typography variant="body2">Verificando...</Typography>
                    </Box>
                  ) : (
                    <Typography variant="h4" color="primary">
                      {currentStock !== null ? currentStock : '—'} unidades
                    </Typography>
                  )}
                </Paper>
              )}

              {/* New Stock Input */}
              <Controller
                name="newStock"
                control={control}
                rules={{
                  required: 'Stock físico es requerido',
                  min: { value: 0, message: 'Stock no puede ser negativo' },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Stock Físico Contado"
                    type="number"
                    fullWidth
                    error={!!errors.newStock}
                    helperText={errors.newStock?.message || 'Ingrese el stock real después del conteo'}
                    InputProps={{
                      inputProps: { min: 0 },
                    }}
                  />
                )}
              />

              {/* Difference Calculation Display */}
              {difference !== null && (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    bgcolor: hasIncrease
                      ? 'success.light'
                      : hasDecrease
                      ? 'error.light'
                      : 'grey.100',
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    Ajuste Calculado
                  </Typography>

                  <Box display="flex" alignItems="center" gap={2}>
                    {hasIncrease && <IncreaseIcon color="success" fontSize="large" />}
                    {hasDecrease && <DecreaseIcon color="error" fontSize="large" />}
                    {hasNoChange && <NoChangeIcon color="action" fontSize="large" />}

                    <Box>
                      {hasIncrease && (
                        <>
                          <Typography variant="h6" color="success.main">
                            ↑ Entrada: +{difference} unidades
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Se agregará stock al inventario
                          </Typography>
                        </>
                      )}
                      {hasDecrease && (
                        <>
                          <Typography variant="h6" color="error.main">
                            ↓ Salida: {difference} unidades
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Se reducirá stock del inventario
                          </Typography>
                        </>
                      )}
                      {hasNoChange && (
                        <>
                          <Typography variant="h6" color="text.secondary">
                            ✓ Sin cambios
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            El stock físico coincide con el sistema
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Box>
                </Paper>
              )}

              {/* Reason (Hidden, always CORRECTION) */}
              <Controller
                name="reason"
                control={control}
                render={({ field }) => <input type="hidden" {...field} />}
              />

              {/* Notes */}
              <Controller
                name="notes"
                control={control}
                rules={{ required: 'Debe indicar el motivo del ajuste' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Motivo del Ajuste *"
                    fullWidth
                    multiline
                    rows={3}
                    error={!!errors.notes}
                    helperText={
                      errors.notes?.message || 'Ej: Ajuste por inventario físico del 2025-11-17'
                    }
                    placeholder="Explique el motivo del ajuste..."
                  />
                )}
              />
            </div>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color={hasIncrease ? 'success' : hasDecrease ? 'error' : 'primary'}
            disabled={loading || loadingData || hasNoChange || currentStock === null}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? 'Ajustando...' : 'Confirmar Ajuste'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
