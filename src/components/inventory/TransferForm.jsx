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
  Paper,
} from '@mui/material';
import {
  SwapHoriz as TransferIcon,
  Warehouse as WarehouseIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/useAuth';
import { inventoryService } from '../../services/inventory.service';
import { productService } from '../../services/product.service';
import { warehouseService } from '../../services/warehouse.service';
import { canTransferBetweenWarehouses } from '../../utils/warehouse.utils';
import toast from 'react-hot-toast';

export default function TransferForm({ open, onClose, onSuccess }) {
  const { userRole } = useAuth();
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [sourceStock, setSourceStock] = useState(null);
  const [destinationStock, setDestinationStock] = useState(null);
  const [checkingStock, setCheckingStock] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      productId: '',
      fromWarehouseId: '',
      toWarehouseId: '',
      quantity: '',
      reference: '',
      notes: '',
    },
  });

  const selectedProductId = watch('productId');
  const fromWarehouseId = watch('fromWarehouseId');
  const toWarehouseId = watch('toWarehouseId');
  const quantity = watch('quantity');

  // Check if user can perform transfers
  const canTransfer = canTransferBetweenWarehouses(userRole);

  // Load initial data
  useEffect(() => {
    if (open && canTransfer) {
      loadInitialData();
    }
  }, [open, canTransfer]);

  // Check stock when product or warehouses change
  useEffect(() => {
    if (selectedProductId && fromWarehouseId) {
      checkStockInWarehouses(selectedProductId, fromWarehouseId, toWarehouseId);
    } else {
      setSourceStock(null);
      setDestinationStock(null);
    }
  }, [selectedProductId, fromWarehouseId, toWarehouseId]);

  const loadInitialData = async () => {
    setLoadingData(true);
    try {
      const [productsRes, warehousesRes] = await Promise.all([
        productService.getAll({ isActive: true }),
        warehouseService.getActive(),
      ]);

      setProducts(productsRes.data || []);
      setWarehouses(warehousesRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoadingData(false);
    }
  };

  const checkStockInWarehouses = async (productId, fromId, toId) => {
    setCheckingStock(true);
    try {
      // Check source warehouse stock
      const sourceRes = await inventoryService.getProductStockInWarehouse(productId, fromId);
      setSourceStock(sourceRes.data?.currentStock || 0);

      // Check destination warehouse stock (optional, for info)
      if (toId) {
        const destRes = await inventoryService.getProductStockInWarehouse(productId, toId);
        setDestinationStock(destRes.data?.currentStock || 0);
      } else {
        setDestinationStock(null);
      }
    } catch (error) {
      console.error('Error checking stock:', error);
      setSourceStock(0);
      setDestinationStock(null);
    } finally {
      setCheckingStock(false);
    }
  };

  const onSubmit = async (data) => {
    // Validate stock availability
    if (sourceStock !== null && parseInt(data.quantity) > sourceStock) {
      toast.error(`Stock insuficiente en origen. Disponible: ${sourceStock} unidades`);
      return;
    }

    // Validate different warehouses
    if (data.fromWarehouseId === data.toWarehouseId) {
      toast.error('Los almacenes de origen y destino deben ser diferentes');
      return;
    }

    setLoading(true);
    try {
      const transferData = {
        productId: parseInt(data.productId),
        fromWarehouseId: parseInt(data.fromWarehouseId),
        toWarehouseId: parseInt(data.toWarehouseId),
        quantity: parseInt(data.quantity),
        reference: data.reference || undefined,
        notes: data.notes || undefined,
      };

      await inventoryService.transferStock(transferData);

      toast.success('Transferencia registrada correctamente');
      reset();
      setSourceStock(null);
      setDestinationStock(null);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error creating transfer:', error);

      const errorCode = error.response?.data?.error?.code;
      const errorDetails = error.response?.data?.error?.details;

      if (errorCode === 'WAREHOUSE_ACCESS_DENIED') {
        toast.error('No tienes acceso a uno de los almacenes');
      } else if (errorCode === 'INSUFFICIENT_STOCK') {
        toast.error(
          `Stock insuficiente. Disponible: ${errorDetails?.available || 0} unidades`
        );
      } else {
        toast.error(error.response?.data?.error?.message || 'Error al registrar transferencia');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      reset();
      setSourceStock(null);
      setDestinationStock(null);
      onClose();
    }
  };

  // If user cannot transfer, show access denied
  if (!canTransfer) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm">
        <DialogTitle>Acceso Denegado</DialogTitle>
        <DialogContent>
          <Alert severity="error">
            Solo los usuarios con rol <strong>admin</strong> o <strong>manager</strong> pueden
            realizar transferencias entre almacenes.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    );
  }

  const hasInsufficientStock =
    sourceStock !== null && quantity && parseInt(quantity) > sourceStock;

  // Calculate projected stock after transfer
  const projectedSourceStock =
    sourceStock !== null && quantity ? sourceStock - parseInt(quantity) : null;
  const projectedDestStock =
    destinationStock !== null && quantity ? destinationStock + parseInt(quantity) : null;

  // Filter destination warehouses (exclude source)
  const availableDestinations = warehouses.filter(
    (w) => !fromWarehouseId || w.id !== parseInt(fromWarehouseId)
  );

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <TransferIcon />
          <span>Transferencia entre Almacenes</span>
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
              {/* Product Selection */}
              <Controller
                name="productId"
                control={control}
                rules={{ required: 'Producto es requerido' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.productId}>
                    <InputLabel>Producto a Transferir</InputLabel>
                    <Select {...field} label="Producto a Transferir">
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

              <Divider />

              {/* Warehouse Selection */}
              <Box display="flex" gap={2}>
                {/* From Warehouse */}
                <Controller
                  name="fromWarehouseId"
                  control={control}
                  rules={{ required: 'Almacén origen es requerido' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.fromWarehouseId}>
                      <InputLabel>Almacén Origen</InputLabel>
                      <Select {...field} label="Almacén Origen">
                        <MenuItem value="">
                          <em>Seleccionar</em>
                        </MenuItem>
                        {warehouses.map((warehouse) => (
                          <MenuItem key={warehouse.id} value={warehouse.id}>
                            {warehouse.name} ({warehouse.code})
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.fromWarehouseId && (
                        <FormHelperText>{errors.fromWarehouseId.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />

                {/* To Warehouse */}
                <Controller
                  name="toWarehouseId"
                  control={control}
                  rules={{ required: 'Almacén destino es requerido' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.toWarehouseId}>
                      <InputLabel>Almacén Destino</InputLabel>
                      <Select {...field} label="Almacén Destino" disabled={!fromWarehouseId}>
                        <MenuItem value="">
                          <em>Seleccionar</em>
                        </MenuItem>
                        {availableDestinations.map((warehouse) => (
                          <MenuItem key={warehouse.id} value={warehouse.id}>
                            {warehouse.name} ({warehouse.code})
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.toWarehouseId && (
                        <FormHelperText>{errors.toWarehouseId.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Box>

              {/* Stock Information Display */}
              {selectedProductId && fromWarehouseId && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Información de Stock
                  </Typography>

                  {checkingStock ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <CircularProgress size={16} />
                      <Typography variant="body2">Verificando stock...</Typography>
                    </Box>
                  ) : (
                    <Box display="flex" gap={3}>
                      {/* Source Stock */}
                      <Box flex={1}>
                        <Typography variant="caption" color="text.secondary">
                          Stock en Origen
                        </Typography>
                        <Typography variant="h6" color={sourceStock > 0 ? 'success.main' : 'error.main'}>
                          {sourceStock !== null ? sourceStock : '—'} unidades
                        </Typography>
                        {projectedSourceStock !== null && (
                          <Typography variant="caption" color="text.secondary">
                            Después: {projectedSourceStock} unidades
                          </Typography>
                        )}
                      </Box>

                      {/* Arrow */}
                      <Box display="flex" alignItems="center">
                        <TransferIcon color="action" />
                      </Box>

                      {/* Destination Stock */}
                      <Box flex={1}>
                        <Typography variant="caption" color="text.secondary">
                          Stock en Destino
                        </Typography>
                        <Typography variant="h6">
                          {destinationStock !== null ? destinationStock : '—'} unidades
                        </Typography>
                        {projectedDestStock !== null && (
                          <Typography variant="caption" color="success.main">
                            Después: {projectedDestStock} unidades
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  )}
                </Paper>
              )}

              {/* Insufficient Stock Warning */}
              {hasInsufficientStock && (
                <Alert severity="error">
                  La cantidad solicitada ({quantity}) excede el stock disponible en origen (
                  {sourceStock})
                </Alert>
              )}

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
                    label="Cantidad a Transferir"
                    type="number"
                    fullWidth
                    error={!!errors.quantity || hasInsufficientStock}
                    helperText={
                      errors.quantity?.message ||
                      (hasInsufficientStock && 'Stock insuficiente en origen')
                    }
                    InputProps={{
                      inputProps: {
                        min: 1,
                        max: sourceStock || undefined,
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
                    label="Referencia (Opcional)"
                    fullWidth
                    placeholder="TRF-001"
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
                    placeholder="Motivo de la transferencia..."
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
            color="warning"
            disabled={loading || loadingData || hasInsufficientStock || sourceStock === 0}
            startIcon={loading ? <CircularProgress size={20} /> : <TransferIcon />}
          >
            {loading ? 'Transfiriendo...' : 'Confirmar Transferencia'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
