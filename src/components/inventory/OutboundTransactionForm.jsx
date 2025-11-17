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
} from '@mui/material';
import { useAuth } from '../context/useAuth';
import { inventoryService } from '../../services/inventory.service';
import { productService } from '../../services/product.service';
import { warehouseService } from '../../services/warehouse.service';
import { getAccessibleWarehouses, getDefaultWarehouseId } from '../../utils/warehouse.utils';
import { ROLES } from '../../config/roles.config';
import toast from 'react-hot-toast';

const OUTBOUND_REASONS = [
  { value: 'SALE', label: 'Venta' },
  { value: 'DAMAGED', label: 'Dañado' },
  { value: 'LOST', label: 'Perdido' },
];

export default function OutboundTransactionForm({ open, onClose, onSuccess }) {
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
      reason: 'SALE',
      quantity: '',
      reference: '',
      notes: '',
    },
  });

  const selectedProductId = watch('productId');
  const selectedWarehouseId = watch('warehouseId');
  const quantity = watch('quantity');

  // Load initial data
  useEffect(() => {
    if (open) {
      loadInitialData();
    }
  }, [open, userRole, userWarehouseId]);

  // Check stock when product or warehouse changes
  useEffect(() => {
    if (selectedProductId && selectedWarehouseId) {
      checkStockAvailability(selectedProductId, selectedWarehouseId);
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

  const checkStockAvailability = async (productId, warehouseId) => {
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
    // Validate stock availability
    if (currentStock !== null && parseInt(data.quantity) > currentStock) {
      toast.error(`Stock insuficiente. Disponible: ${currentStock} unidades`);
      return;
    }

    setLoading(true);
    try {
      const transactionData = {
        productId: parseInt(data.productId),
        warehouseId: parseInt(data.warehouseId),
        type: 'OUTBOUND',
        reason: data.reason,
        quantity: parseInt(data.quantity),
        reference: data.reference || undefined,
        notes: data.notes || undefined,
      };

      await inventoryService.create(transactionData);

      toast.success('Salida de inventario registrada correctamente');
      reset();
      setCurrentStock(null);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error creating outbound transaction:', error);

      // Handle specific error codes
      const errorCode = error.response?.data?.error?.code;
      const errorDetails = error.response?.data?.error?.details;

      if (errorCode === 'WAREHOUSE_ACCESS_DENIED') {
        toast.error('No tienes acceso a este almacén');
      } else if (errorCode === 'INSUFFICIENT_STOCK') {
        toast.error(
          `Stock insuficiente. Disponible: ${errorDetails?.available || 0} unidades`
        );
      } else {
        toast.error(error.response?.data?.error?.message || 'Error al registrar salida');
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
  const hasInsufficientStock =
    currentStock !== null && quantity && parseInt(quantity) > currentStock;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Nueva Salida de Inventario</DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {loadingData ? (
            <div className="flex justify-center py-8">
              <CircularProgress />
            </div>
          ) : (
            <div className="space-y-4">
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

              {/* Stock Availability Display */}
              {selectedProductId && selectedWarehouseId && (
                <Box
                  sx={{
                    p: 2,
                    bgcolor: currentStock > 0 ? 'success.light' : 'error.light',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2" fontWeight="bold">
                    {checkingStock ? (
                      'Verificando stock...'
                    ) : (
                      <>
                        Stock disponible:{' '}
                        <span style={{ fontSize: '1.2em' }}>
                          {currentStock !== null ? currentStock : '—'}
                        </span>{' '}
                        unidades
                      </>
                    )}
                  </Typography>
                </Box>
              )}

              {/* Insufficient Stock Warning */}
              {hasInsufficientStock && (
                <Alert severity="error">
                  La cantidad solicitada ({quantity}) excede el stock disponible ({currentStock})
                </Alert>
              )}

              {/* Reason */}
              <Controller
                name="reason"
                control={control}
                rules={{ required: 'Motivo es requerido' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.reason}>
                    <InputLabel>Motivo</InputLabel>
                    <Select {...field} label="Motivo">
                      {OUTBOUND_REASONS.map((reason) => (
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

              {/* Quantity */}
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
                    label="Cantidad"
                    type="number"
                    fullWidth
                    error={!!errors.quantity || hasInsufficientStock}
                    helperText={
                      errors.quantity?.message ||
                      (hasInsufficientStock && 'Stock insuficiente')
                    }
                    InputProps={{
                      inputProps: {
                        min: 1,
                        max: currentStock || undefined,
                      },
                    }}
                  />
                )}
              />

              {/* Reference */}
              <Controller
                name="reference"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Referencia/Venta (Opcional)"
                    fullWidth
                    placeholder="VENTA-001"
                  />
                )}
              />

              {/* Notes */}
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Notas (Opcional)"
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Detalles adicionales..."
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
            color="error"
            disabled={loading || loadingData || hasInsufficientStock || currentStock === 0}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? 'Guardando...' : 'Guardar Salida'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
