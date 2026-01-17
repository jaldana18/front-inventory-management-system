import { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
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
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
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
  { value: 'INITIAL_STOCK', label: 'Stock Inicial' },
];

const OUTBOUND_REASONS = [
  { value: 'SALE', label: 'Venta' },
  { value: 'DAMAGED', label: 'Dañado' },
  { value: 'LOST', label: 'Perdido' },
];

export default function BulkTransactionForm({ open, onClose, onSuccess, type = 'INBOUND' }) {
  const { userRole, userWarehouseId } = useAuth();
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [stockValidation, setStockValidation] = useState({});
  const [validatingStock, setValidatingStock] = useState(false);

  const reasons = type === 'INBOUND' ? INBOUND_REASONS : OUTBOUND_REASONS;

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      warehouseId: getDefaultWarehouseId(userRole, userWarehouseId, ''),
      reason: type === 'INBOUND' ? 'PURCHASE' : 'SALE',
      items: [{ productId: '', quantity: '', unitCost: '', reference: '' }],
      notes: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const selectedWarehouseId = watch('warehouseId');
  const items = watch('items');

  // Load initial data
  useEffect(() => {
    if (open) {
      loadInitialData();
    }
  }, [open, userRole, userWarehouseId]);

  // Validate stock for outbound transactions
  useEffect(() => {
    if (type === 'OUTBOUND' && selectedWarehouseId && items.length > 0) {
      validateStockAvailability();
    }
  }, [type, selectedWarehouseId, items]);

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

  const validateStockAvailability = async () => {
    if (!selectedWarehouseId) return;

    setValidatingStock(true);
    const validation = {};

    try {
      // Get stock for all products in parallel
      const stockPromises = items
        .filter((item) => item.productId)
        .map(async (item, index) => {
          try {
            const response = await inventoryService.getProductStockInWarehouse(
              item.productId,
              selectedWarehouseId
            );
            return {
              index,
              productId: item.productId,
              available: response.data?.currentStock || 0,
              requested: parseInt(item.quantity) || 0,
            };
          } catch (error) {
            return {
              index,
              productId: item.productId,
              available: 0,
              requested: parseInt(item.quantity) || 0,
            };
          }
        });

      const stockResults = await Promise.all(stockPromises);

      stockResults.forEach((result) => {
        validation[result.index] = {
          available: result.available,
          requested: result.requested,
          isValid: result.requested <= result.available,
        };
      });

      setStockValidation(validation);
    } catch (error) {
      console.error('Error validating stock:', error);
    } finally {
      setValidatingStock(false);
    }
  };

  const addNewItem = () => {
    append({ productId: '', quantity: '', unitCost: '', reference: '' });
  };

  const removeItem = (index) => {
    if (fields.length > 1) {
      remove(index);
    } else {
      toast.error('Debe haber al menos un producto');
    }
  };

  const onSubmit = async (data) => {
    // Validate stock for outbound
    if (type === 'OUTBOUND') {
      const hasInvalidStock = Object.values(stockValidation).some((v) => !v.isValid);
      if (hasInvalidStock) {
        toast.error('Algunos productos tienen stock insuficiente');
        return;
      }
    }

    setLoading(true);
    try {
      const bulkData = {
        warehouseId: parseInt(data.warehouseId),
        items: data.items.map((item) => ({
          productId: parseInt(item.productId),
          quantity: parseInt(item.quantity),
          ...(type === 'INBOUND' && item.unitCost && { unitCost: parseFloat(item.unitCost) }),
          reference: item.reference || undefined,
        })),
        reason: data.reason,
        notes: data.notes || undefined,
      };

      // Call appropriate service method
      const response =
        type === 'INBOUND'
          ? await inventoryService.bulkInbound(bulkData)
          : await inventoryService.bulkOutbound(bulkData);

      const created = response.data?.created?.length || 0;
      toast.success(
        `✅ ${created} ${type === 'INBOUND' ? 'entradas' : 'salidas'} registradas correctamente`
      );

      reset();
      setStockValidation({});
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error creating bulk transaction:', error);

      const errorCode = error.response?.data?.error?.code;
      if (errorCode === 'WAREHOUSE_ACCESS_DENIED') {
        toast.error('No tienes acceso a este almacén');
      } else if (errorCode === 'INSUFFICIENT_STOCK') {
        toast.error('Stock insuficiente para algunos productos');
      } else {
        toast.error(
          error.response?.data?.error?.message || `Error al registrar ${type.toLowerCase()}`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      reset();
      setStockValidation({});
      onClose();
    }
  };

  const isUserRole = userRole === ROLES.USER;
  const hasStockErrors =
    type === 'OUTBOUND' && Object.values(stockValidation).some((v) => !v.isValid);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        {type === 'INBOUND' ? 'Carga Masiva - Entrada' : 'Carga Masiva - Salida'}
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {loadingData ? (
            <div className="flex justify-center py-8">
              <CircularProgress />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header Information */}
              <Box display="flex" gap={2}>
                {/* Warehouse Selection */}
                <Controller
                  name="warehouseId"
                  control={control}
                  rules={{ required: 'Almacén es requerido' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.warehouseId}>
                      <InputLabel>Almacén</InputLabel>
                      <Select {...field} label="Almacén" disabled={isUserRole}>
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
                        {reasons.map((reason) => (
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
              </Box>

              {/* Stock Validation Alert */}
              {type === 'OUTBOUND' && validatingStock && (
                <Alert severity="info" icon={<CircularProgress size={20} />}>
                  Verificando stock disponible...
                </Alert>
              )}

              {type === 'OUTBOUND' && hasStockErrors && (
                <Alert severity="error" icon={<WarningIcon />}>
                  Algunos productos tienen stock insuficiente. Verifica las cantidades marcadas en
                  rojo.
                </Alert>
              )}

              {/* Products Table */}
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell width="35%">Producto</TableCell>
                      <TableCell width="15%">Cantidad</TableCell>
                      {type === 'INBOUND' && <TableCell width="15%">Costo Unit.</TableCell>}
                      {type === 'OUTBOUND' && <TableCell width="15%">Stock Disp.</TableCell>}
                      <TableCell width="20%">Referencia</TableCell>
                      <TableCell width="10%" align="center">
                        Acciones
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fields.map((field, index) => {
                      const stockInfo = stockValidation[index];
                      const hasStockError = stockInfo && !stockInfo.isValid;

                      return (
                        <TableRow key={field.id}>
                          {/* Product */}
                          <TableCell>
                            <Controller
                              name={`items.${index}.productId`}
                              control={control}
                              rules={{ required: 'Requerido' }}
                              render={({ field }) => (
                                <FormControl
                                  fullWidth
                                  size="small"
                                  error={!!errors.items?.[index]?.productId}
                                >
                                  <Select {...field} displayEmpty>
                                    <MenuItem value="">
                                      <em>Seleccionar</em>
                                    </MenuItem>
                                    {products.map((product) => (
                                      <MenuItem key={product.id} value={product.id}>
                                        {product.name} ({product.sku})
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              )}
                            />
                          </TableCell>

                          {/* Quantity */}
                          <TableCell>
                            <Controller
                              name={`items.${index}.quantity`}
                              control={control}
                              rules={{
                                required: 'Requerido',
                                min: { value: 1, message: 'Min 1' },
                              }}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  type="number"
                                  size="small"
                                  fullWidth
                                  error={!!errors.items?.[index]?.quantity || hasStockError}
                                  InputProps={{
                                    inputProps: { min: 1 },
                                  }}
                                />
                              )}
                            />
                          </TableCell>

                          {/* Unit Cost (INBOUND only) */}
                          {type === 'INBOUND' && (
                            <TableCell>
                              <Controller
                                name={`items.${index}.unitCost`}
                                control={control}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    type="number"
                                    size="small"
                                    fullWidth
                                    placeholder="Opcional"
                                    InputProps={{
                                      inputProps: { min: 0, step: 0.01 },
                                    }}
                                  />
                                )}
                              />
                            </TableCell>
                          )}

                          {/* Stock Available (OUTBOUND only) */}
                          {type === 'OUTBOUND' && (
                            <TableCell>
                              {stockInfo ? (
                                <Chip
                                  label={`${stockInfo.available} unidades`}
                                  size="small"
                                  color={stockInfo.isValid ? 'success' : 'error'}
                                />
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  —
                                </Typography>
                              )}
                            </TableCell>
                          )}

                          {/* Reference */}
                          <TableCell>
                            <Controller
                              name={`items.${index}.reference`}
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  size="small"
                                  fullWidth
                                  placeholder="Opcional"
                                />
                              )}
                            />
                          </TableCell>

                          {/* Actions */}
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => removeItem(index)}
                              disabled={fields.length === 1}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Add Product Button */}
              <Button
                startIcon={<AddIcon />}
                onClick={addNewItem}
                variant="outlined"
                fullWidth
                disabled={loading}
              >
                Agregar Producto
              </Button>

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
                    rows={2}
                    placeholder="Detalles adicionales sobre esta operación..."
                  />
                )}
              />

              {/* Summary */}
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>Resumen:</strong> {fields.length} producto(s) -{' '}
                  {type === 'INBOUND' ? 'Entrada' : 'Salida'} de inventario
                </Typography>
              </Box>
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
            color={type === 'INBOUND' ? 'primary' : 'error'}
            disabled={loading || loadingData || hasStockErrors}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading
              ? 'Procesando...'
              : `Guardar ${fields.length} ${type === 'INBOUND' ? 'Entrada(s)' : 'Salida(s)'}`}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
