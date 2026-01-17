import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  X,
  Package,
  DollarSign,
  FileText,
} from 'lucide-react';

const inventoryEntrySchema = z.object({
  productId: z.string().min(1, 'Producto es requerido'),
  warehouseId: z.string().min(1, 'Almacén es requerido'),
  reason: z.string().min(1, 'Motivo es requerido'),
  quantity: z.coerce.number().min(1, 'Cantidad debe ser mayor a 0'),
  unitCost: z.coerce.number().min(0, 'Costo debe ser 0 o mayor').optional(),
  reference: z.string().max(100, 'Referencia no puede exceder 100 caracteres').optional(),
  location: z.string().max(100, 'Ubicación no puede exceder 100 caracteres').optional(),
  notes: z.string().max(500, 'Notas no pueden exceder 500 caracteres').optional(),
});

const reasons = [
  { label: 'Compra', value: 'purchase' },
  { label: 'Devolución', value: 'return' },
  { label: 'Ajuste de Inventario', value: 'adjustment' },
  { label: 'Transferencia', value: 'transfer' },
  { label: 'Producción', value: 'production' },
];

const InventoryEntryDialog = ({
  open,
  onClose,
  onSubmit,
  products = [],
  warehouses = []
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(inventoryEntrySchema),
    defaultValues: {
      productId: '',
      warehouseId: '',
      reason: '',
      quantity: '',
      unitCost: '',
      reference: '',
      location: '',
      notes: '',
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = (data) => {
    onSubmit(data);
    handleClose();
  };

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
                <h2 className="text-2xl font-bold text-indigo-600 mb-1">
                  Nueva Entrada de Inventario
                </h2>
                <p className="text-sm text-gray-500">
                  Registra la entrada de productos al almacén
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="px-6 pb-6">
            {/* Información Básica */}
            <div className="space-y-4 mb-6">
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
                    render={({ field }) => (
                      <select
                        {...field}
                        id="productId"
                        className="w-full h-12 px-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors bg-white cursor-pointer"
                      >
                        <option value="">Seleccionar producto</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
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
                    render={({ field }) => (
                      <select
                        {...field}
                        id="warehouseId"
                        className="w-full h-12 px-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors bg-white cursor-pointer"
                      >
                        <option value="">Seleccionar almacén</option>
                        {warehouses.map((warehouse) => (
                          <option key={warehouse.id} value={warehouse.id}>
                            {warehouse.name} ({warehouse.code})
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.warehouseId && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      ⚠️ {errors.warehouseId.message}
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
                    render={({ field }) => (
                      <select
                        {...field}
                        id="reason"
                        className="w-full h-12 px-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors bg-white cursor-pointer"
                      >
                        <option value="">Seleccionar motivo</option>
                        {reasons.map((reason) => (
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
                    render={({ field }) => (
                      <input
                        {...field}
                        id="quantity"
                        type="number"
                        min="1"
                        className="w-full h-12 px-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors"
                        placeholder="Ej: 100"
                      />
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
            <div className="space-y-4 mb-6">
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
                    render={({ field }) => (
                      <div className="relative">
                        <span className="absolute left-3 top-3.5 text-gray-500 font-medium text-sm pointer-events-none">COP $</span>
                        <input
                          {...field}
                          id="unitCost"
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-full pl-20 h-12 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-200 focus:outline-none transition-colors"
                          placeholder="0.00"
                        />
                      </div>
                    )}
                  />
                  {errors.unitCost && (
                    <p className="text-sm text-red-500">{errors.unitCost.message}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    Opcional - Costo por unidad (acepta decimales)
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
                      <input
                        {...field}
                        id="reference"
                        type="text"
                        className="w-full h-12 px-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors"
                        placeholder="Ej: F-12345"
                      />
                    )}
                  />
                  {errors.reference && (
                    <p className="text-sm text-red-500">{errors.reference.message}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    Opcional - Número de factura o referencia
                  </p>
                </div>
              </div>
            </div>

            {/* Información Adicional */}
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Información Adicional
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Ubicación */}
                <div className="space-y-2">
                  <label htmlFor="location" className="block text-sm font-semibold text-gray-700">
                    Ubicación en Almacén
                  </label>
                  <Controller
                    name="location"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        id="location"
                        type="text"
                        className="w-full h-12 px-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors"
                        placeholder="Ej: Pasillo A, Estante 3"
                      />
                    )}
                  />
                  {errors.location && (
                    <p className="text-sm text-red-500">{errors.location.message}</p>
                  )}
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
                        rows={1}
                        className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors resize-none"
                        placeholder="Añadir notas..."
                      />
                    )}
                  />
                  {errors.notes && (
                    <p className="text-sm text-red-500">{errors.notes.message}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    Opcional - Información adicional relevante
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 pt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 h-11 border-2 border-gray-300 hover:bg-gray-50 font-semibold rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-8 h-11 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg transition-colors"
              >
                Registrar Entrada
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default InventoryEntryDialog;
