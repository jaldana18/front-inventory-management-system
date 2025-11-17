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
} from '@mui/material';
import { useAuth } from '../context/useAuth';
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
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Nueva Entrada de Inventario</DialogTitle>

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

              {/* Reason */}
              <Controller
                name="reason"
                control={control}
                rules={{ required: 'Motivo es requerido' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.reason}>
                    <InputLabel>Motivo</InputLabel>
                    <Select {...field} label="Motivo">
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
                    error={!!errors.quantity}
                    helperText={errors.quantity?.message}
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                )}
              />

              {/* Unit Cost (Optional) */}
              <Controller
                name="unitCost"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Costo Unitario (Opcional)"
                    type="number"
                    fullWidth
                    InputProps={{ inputProps: { min: 0, step: 0.01 } }}
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
                    label="Referencia/Factura (Opcional)"
                    fullWidth
                    placeholder="FAC-12345"
                  />
                )}
              />

              {/* Location */}
              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Ubicación (Opcional)"
                    fullWidth
                    placeholder="Estante A-12"
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
            disabled={loading || loadingData}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? 'Guardando...' : 'Guardar Entrada'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
