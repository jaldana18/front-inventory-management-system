import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  X,
  Package,
  DollarSign,
  FileText,
  Loader2,
  Warehouse,
  Hash,
  MapPin,
} from 'lucide-react';
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

  // Currency formatting functions
  const formatCurrency = (value) => {
    if (!value && value !== 0) return '';
    const numericValue = typeof value === 'string' ? parseFloat(value.replace(/\./g, '').replace(',', '.')) : value;
    if (isNaN(numericValue)) return '';
    return new Intl.NumberFormat('es-CO', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numericValue);
  };

  const parseCurrency = (value) => {
    if (!value) return '';
    // Remove thousand separators (dots) and keep decimal separator (comma)
    const cleaned = value.toString().replace(/\./g, '').replace(',', '.');
    const parsed = cleaned.replace(/[^0-9.]/g, '');
    return parsed;
  };

  const {
    control,
    handleSubmit,
    reset,
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

      const productsData = productsRes?.data?.items || productsRes?.items || productsRes?.data || [];
      setProducts(Array.isArray(productsData) ? productsData : []);

      const warehousesData = warehousesRes?.data?.items || warehousesRes?.items || warehousesRes?.data || [];

      const accessibleWarehouses = getAccessibleWarehouses(
        Array.isArray(warehousesData) ? warehousesData : [],
        userRole,
        userWarehouseId
      );
      setWarehouses(accessibleWarehouses);

      if (userRole === ROLES.USER && userWarehouseId) {
        setValue('warehouseId', userWarehouseId);
      } else if (accessibleWarehouses.length === 1) {
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

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 md:pt-20 pointer-events-none overflow-y-auto">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[calc(100vh-6rem)] overflow-y-auto pointer-events-auto animate-in zoom-in-95 duration-200 my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-gray-200 pb-4 mb-2 px-6 pt-6 sticky top-0 bg-white z-10">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold text-indigo-600 mb-1">
                  Nueva Entrada de Inventario
                </h2>
                <p className="text-sm text-gray-500">
                  Registra la entrada de productos al almacén
                </p>
              </div>
              <button
                onClick={handleClose}
                disabled={loading}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 px-6 pb-6">
            {loadingData ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
            ) : (
              <>
                {/* Información Básica */}
                <div className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Package className="h-5 w-5 text-indigo-600" />
                    Información Básica
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Producto */}
                    <div className="space-y-2">
                      <label htmlFor="productId" className="block text-sm font-semibold text-gray-700">
                        Producto <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        name="productId"
                        control={control}
                        rules={{ required: 'Producto es requerido' }}
                        render={({ field }) => (
                          <div className="relative">
                            <Package className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                            <select
                              {...field}
                              id="productId"
                              className="w-full pl-11 h-12 px-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors bg-white cursor-pointer"
                            >
                              <option value="">Seleccionar producto</option>
                              {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                  {product.name} ({product.sku})
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      />
                      {errors.productId && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          ⚠️ {errors.productId.message}
                        </p>
                      )}
                    </div>

                    {/* Almacén */}
                    <div className="space-y-2">
                      <label htmlFor="warehouseId" className="block text-sm font-semibold text-gray-700">
                        Almacén <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        name="warehouseId"
                        control={control}
                        rules={{ required: 'Almacén es requerido' }}
                        render={({ field }) => (
                          <div className="relative">
                            <Warehouse className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                            <select
                              {...field}
                              id="warehouseId"
                              disabled={isUserRole}
                              className="w-full pl-11 h-12 px-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors bg-white cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                              <option value="">Seleccionar almacén</option>
                              {warehouses.map((warehouse) => (
                                <option key={warehouse.id} value={warehouse.id}>
                                  {warehouse.name} ({warehouse.code})
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      />
                      {errors.warehouseId && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          ⚠️ {errors.warehouseId.message}
                        </p>
                      )}
                      {isUserRole && (
                        <p className="text-xs text-gray-400">
                          Asignado automáticamente a tu almacén
                        </p>
                      )}
                    </div>

                    {/* Motivo */}
                    <div className="space-y-2">
                      <label htmlFor="reason" className="block text-sm font-semibold text-gray-700">
                        Motivo <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        name="reason"
                        control={control}
                        rules={{ required: 'Motivo es requerido' }}
                        render={({ field }) => (
                          <select
                            {...field}
                            id="reason"
                            className="w-full h-12 px-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors bg-white cursor-pointer"
                          >
                            {INBOUND_REASONS.map((reason) => (
                              <option key={reason.value} value={reason.value}>
                                {reason.label}
                              </option>
                            ))}
                          </select>
                        )}
                      />
                      {errors.reason && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          ⚠️ {errors.reason.message}
                        </p>
                      )}
                    </div>

                    {/* Cantidad */}
                    <div className="space-y-2">
                      <label htmlFor="quantity" className="block text-sm font-semibold text-gray-700">
                        Cantidad <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        name="quantity"
                        control={control}
                        rules={{
                          required: 'Cantidad es requerida',
                          min: { value: 1, message: 'Cantidad debe ser mayor a 0' },
                        }}
                        render={({ field }) => (
                          <div className="relative">
                            <Hash className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                            <input
                              {...field}
                              id="quantity"
                              type="number"
                              min="1"
                              onFocus={(e) => {
                                if (e.target.value === '0') {
                                  field.onChange('');
                                }
                              }}
                              onBlur={(e) => {
                                if (e.target.value === '') {
                                  field.onChange(0);
                                }
                              }}
                              className="w-full pl-11 h-12 px-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              placeholder="0"
                            />
                          </div>
                        )}
                      />
                      {errors.quantity && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          ⚠️ {errors.quantity.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Información Financiera */}
                <div className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Información Financiera
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Costo Unitario */}
                    <div className="space-y-2">
                      <label htmlFor="unitCost" className="block text-sm font-semibold text-gray-700">
                        Costo Unitario
                      </label>
                      <Controller
                        name="unitCost"
                        control={control}
                        render={({ field: { onChange, value, ...field } }) => (
                          <div className="relative">
                            <span className="absolute left-3 top-3.5 text-gray-500 font-medium text-sm pointer-events-none">COP $</span>
                            <input
                              {...field}
                              value={value ? formatCurrency(value) : ''}
                              onChange={(e) => {
                                const numericValue = parseCurrency(e.target.value);
                                onChange(numericValue);
                              }}
                              id="unitCost"
                              type="text"
                              inputMode="numeric"
                              className="w-full pl-20 h-12 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-200 focus:outline-none transition-colors"
                              placeholder="0"
                            />
                          </div>
                        )}
                      />
                      <p className="text-xs text-gray-400">
                        Opcional - Costo por unidad
                      </p>
                    </div>

                    {/* Referencia */}
                    <div className="space-y-2">
                      <label htmlFor="reference" className="block text-sm font-semibold text-gray-700">
                        Referencia/Factura
                      </label>
                      <Controller
                        name="reference"
                        control={control}
                        render={({ field }) => (
                          <div className="relative">
                            <FileText className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                            <input
                              {...field}
                              id="reference"
                              type="text"
                              className="w-full pl-11 h-12 px-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors"
                              placeholder="FAC-12345"
                            />
                          </div>
                        )}
                      />
                      <p className="text-xs text-gray-400">
                        Opcional - Número de factura o referencia
                      </p>
                    </div>
                  </div>
                </div>

                {/* Información Adicional */}
                <div className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    Información Adicional
                  </h3>

                  <div className="grid grid-cols-1 gap-4">
                    {/* Ubicación */}
                    <div className="space-y-2">
                      <label htmlFor="location" className="block text-sm font-semibold text-gray-700">
                        Ubicación en Almacén
                      </label>
                      <Controller
                        name="location"
                        control={control}
                        render={({ field }) => (
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                            <input
                              {...field}
                              id="location"
                              type="text"
                              className="w-full pl-11 h-12 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors"
                              placeholder="Ej: Pasillo A, Estante 3"
                            />
                          </div>
                        )}
                      />
                      <p className="text-xs text-gray-400">
                        Opcional - Ubicación física del producto
                      </p>
                    </div>

                    {/* Notas */}
                    <div className="space-y-2">
                      <label htmlFor="notes" className="block text-sm font-semibold text-gray-700">
                        Notas
                      </label>
                      <Controller
                        name="notes"
                        control={control}
                        render={({ field }) => (
                          <textarea
                            {...field}
                            id="notes"
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors resize-none"
                            placeholder="Detalles adicionales sobre esta entrada..."
                          />
                        )}
                      />
                      <p className="text-xs text-gray-400">
                        Opcional - Información adicional relevante
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Footer */}
            <div className="border-t border-gray-200 pt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-6 h-11 border-2 border-gray-300 hover:bg-gray-50 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || loadingData}
                className="px-8 h-11 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                {loading ? 'Registrando...' : 'Registrar Entrada'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
