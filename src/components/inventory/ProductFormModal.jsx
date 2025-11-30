import { useState, useEffect, useCallback, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Package,
  QrCode,
  Sparkles,
  X,
  DollarSign,
  Box,
  MapPin,
} from "lucide-react";

// Esquema de validación
const productSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  sku: z.string().min(3, "El código debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  category: z.string().min(1, "La categoría es requerida"),
  unit: z.string().min(1, "La unidad es requerida"),
  cost: z.coerce
    .number()
    .min(0, "El costo debe ser mayor o igual a 0"),
  price: z.coerce.number().min(0.01, "El precio debe ser mayor a 0"),
  quantity: z.coerce.number().min(0, "La cantidad debe ser mayor o igual a 0"),
  minStock: z.coerce
    .number()
    .min(0, "El stock mínimo debe ser mayor o igual a 0"),
  supplier: z.string().optional(),
  location: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Categorías predefinidas
const categories = [
  "Electrónica",
  "Ropa",
  "Alimentos",
  "Bebidas",
  "Muebles",
  "Herramientas",
  "Juguetes",
  "Deportes",
  "Libros",
  "Otros",
];

// Unidades de medida
const units = [
  { label: "Pieza", value: "Piez" },
  { label: "Caja", value: "Caja" },
  { label: "Paquete", value: "Paquete" },
  { label: "Kilogramo", value: "kg" },
  { label: "Gramo", value: "g" },
  { label: "Litro", value: "l" },
  { label: "Unidad", value: "Unidad" },
];

/**
 * @param {Object} props
 * @param {boolean} props.open
 * @param {Function} props.onClose
 * @param {Function} props.onSubmit
 * @param {any} props.initialData
 */
export const ProductFormModal = ({
  open,
  onClose,
  onSubmit,
  initialData = null,
}) => {
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      description: "",
      category: "",
      unit: "Piez",
      cost: 0,
      price: 0,
      quantity: 0,
      minStock: 0,
      supplier: "",
      location: "",
      isActive: true,
    },
  });

  // Cargar datos iniciales cuando se edita
  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || "",
        sku: initialData.sku || "",
        description: initialData.description || "",
        category: initialData.category || "",
        unit: initialData.unitOfMeasure || initialData.unit || "Piez",
        cost: initialData.cost || 0,
        price: initialData.price || initialData.unitPrice || 0,
        quantity: initialData.currentStock || initialData.quantity || 0,
        minStock: initialData.minimumStock || initialData.minStock || 0,
        supplier: initialData.supplier || "",
        location: initialData.location || "",
        isActive:
          initialData.isActive !== undefined ? initialData.isActive : true,
      });
      setTags(initialData.tags || []);
    } else {
      reset({
        name: "",
        sku: "",
        description: "",
        category: "",
        unit: "Piez",
        cost: 0,
        price: 0,
        quantity: 0,
        minStock: 0,
        supplier: "",
        location: "",
        isActive: true,
      });
      setTags([]);
    }
  }, [initialData, reset]);

  // Memoizar funciones para evitar re-renderizados
  const handleClose = useCallback(() => {
    reset();
    setTags([]);
    setCurrentTag("");
    onClose();
  }, [reset, onClose]);

  const handleFormSubmit = useCallback((data) => {
    const submitData = {
      ...data,
      tags: tags,
    };
    onSubmit(submitData);
    handleClose();
  }, [tags, onSubmit, handleClose]);

  // Generar código automático
  const handleGenerateSKU = useCallback(() => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    setValue("sku", `PRD-${timestamp}${random}`);
  }, [setValue]);

  // Agregar etiqueta
  const handleAddTag = useCallback(() => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  }, [currentTag, tags]);

  // Eliminar etiqueta
  const handleDeleteTag = useCallback((tagToDelete) => {
    setTags(tags.filter((tag) => tag !== tagToDelete));
  }, [tags]);

  // Manejar Enter en el campo de etiquetas
  const handleTagKeyPress = useCallback((e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  }, [handleAddTag]);

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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[calc(100vh-6rem)] overflow-y-auto pointer-events-auto animate-in zoom-in-95 duration-200 my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-gray-200 pb-4 mb-2 px-6 pt-6 sticky top-0 bg-white z-10">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold text-indigo-600 mb-1">
                  {initialData ? "✏️ Editar Producto" : "Nuevo Producto"}
                </h2>
                <p className="text-sm text-gray-500">
                  Complete la información del {initialData ? "producto" : "nuevo producto"}
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

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8 px-6 pb-6">
            {/* Información Básica */}
            <div className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Package className="h-5 w-5 text-indigo-600" />
                Información Básica
              </h3>

              {/* Nombre del Producto */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                  Nombre del Producto <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <Package className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                      <input
                        {...field}
                        id="name"
                        type="text"
                        className="w-full pl-11 h-12 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors"
                        placeholder="Ej: Laptop HP Pavilion"
                      />
                    </div>
                  )}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 flex items-center gap-1">⚠️ {errors.name.message}</p>
                )}
              </div>

              {/* Código, Unidad y Categoría */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Código del Producto */}
                <div className="md:col-span-5 space-y-2">
                  <label htmlFor="sku" className="block text-sm font-semibold text-gray-700">
                    Código del Producto <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="sku"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <QrCode className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                        <input
                          {...field}
                          id="sku"
                          type="text"
                          className="w-full pl-11 pr-12 h-12 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors"
                          placeholder="PRD-123456"
                        />
                        <button
                          type="button"
                          onClick={handleGenerateSKU}
                          className="absolute right-2 top-2.5 p-1.5 rounded-md bg-indigo-50 hover:bg-indigo-100 transition-colors group"
                          title="Generar código automático"
                        >
                          <Sparkles className="h-5 w-5 text-indigo-600 group-hover:text-indigo-700" />
                        </button>
                      </div>
                    )}
                  />
                  {errors.sku && (
                    <p className="text-sm text-red-500 flex items-center gap-1">⚠️ {errors.sku.message}</p>
                  )}
                </div>

                {/* Unidad de Medida */}
                <div className="md:col-span-3 space-y-2">
                  <label htmlFor="unit" className="block text-sm font-semibold text-gray-700">
                    Unidad de Medida <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="unit"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        id="unit"
                        className="w-full h-12 px-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors bg-white cursor-pointer"
                      >
                        {units.map((unit) => (
                          <option key={unit.value} value={unit.value}>
                            {unit.label}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.unit && (
                    <p className="text-sm text-red-500 flex items-center gap-1">⚠️ {errors.unit.message}</p>
                  )}
                </div>

                {/* Categoría */}
                <div className="md:col-span-4 space-y-2">
                  <label htmlFor="category" className="block text-sm font-semibold text-gray-700">
                    Categoría <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        id="category"
                        className="w-full h-12 px-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors bg-white cursor-pointer"
                      >
                        <option value="">Seleccionar...</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.category && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      ⚠️ {errors.category.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700">Descripción</label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      id="description"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors resize-none"
                      placeholder="Opcional - Descripción detallada del producto"
                    />
                  )}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>

            {/* Información Financiera */}
            <div className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Información Financiera
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Costo Unitario */}
                <div className="space-y-2">
                  <label htmlFor="cost" className="block text-sm font-semibold text-gray-700">
                    Costo Unitario <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="cost"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <span className="absolute left-3 top-3.5 text-gray-500 font-medium text-sm pointer-events-none">COP $</span>
                        <input
                          {...field}
                          id="cost"
                          type="text"
                          inputMode="numeric"
                          value={field.value ? new Intl.NumberFormat('es-CO').format(field.value) : ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            field.onChange(value ? parseInt(value) : 0);
                          }}
                          onFocus={(e) => {
                            if (field.value === 0) {
                              field.onChange('');
                            }
                          }}
                          onBlur={(e) => {
                            if (!field.value || field.value === '') {
                              field.onChange(0);
                            }
                          }}
                          className="w-full pl-20 h-12 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-200 focus:outline-none transition-colors"
                          placeholder="0"
                        />
                      </div>
                    )}
                  />
                  {errors.cost && (
                    <p className="text-sm text-red-500">{errors.cost.message}</p>
                  )}
                </div>

                {/* Precio de Venta */}
                <div className="space-y-2">
                  <label htmlFor="price" className="block text-sm font-semibold text-gray-700">
                    Precio de Venta <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="price"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <span className="absolute left-3 top-3.5 text-gray-500 font-medium text-sm pointer-events-none">COP $</span>
                        <input
                          {...field}
                          id="price"
                          type="text"
                          inputMode="numeric"
                          value={field.value ? new Intl.NumberFormat('es-CO').format(field.value) : ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            field.onChange(value ? parseInt(value) : 0);
                          }}
                          onFocus={(e) => {
                            if (field.value === 0) {
                              field.onChange('');
                            }
                          }}
                          onBlur={(e) => {
                            if (!field.value || field.value === '') {
                              field.onChange(0);
                            }
                          }}
                          className="w-full pl-20 h-12 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-200 focus:outline-none transition-colors"
                          placeholder="0"
                        />
                      </div>
                    )}
                  />
                  {errors.price && (
                    <p className="text-sm text-red-500">{errors.price.message}</p>
                  )}
                </div>

                {/* Cantidad Inicial */}
                <div className="space-y-2">
                  <label htmlFor="quantity" className="block text-sm font-semibold text-gray-700">
                    Cantidad Inicial <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="quantity"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        id="quantity"
                        type="number"
                        min="0"
                        step="1"
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
                        className="w-full h-12 px-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="0"
                      />
                    )}
                  />
                  {errors.quantity && (
                    <p className="text-sm text-red-500">
                      {errors.quantity.message}
                    </p>
                  )}
                </div>

                {/* Stock Mínimo */}
                <div className="space-y-2">
                  <label htmlFor="minStock" className="block text-sm font-semibold text-gray-700">
                    Stock Mínimo <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="minStock"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        id="minStock"
                        type="number"
                        min="0"
                        step="1"
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
                        className="w-full h-12 px-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="0"
                      />
                    )}
                  />
                  {errors.minStock && (
                    <p className="text-sm text-red-500">
                      {errors.minStock.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">
                    Nivel mínimo antes de reordenar
                  </p>
                </div>
              </div>
            </div>

            {/* Información Adicional */}
            <div className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Box className="h-5 w-5 text-blue-600" />
                Información Adicional
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Proveedor */}
                <div className="space-y-2">
                  <label htmlFor="supplier" className="block text-sm font-semibold text-gray-700">Proveedor</label>
                  <Controller
                    name="supplier"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <Box className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                        <input
                          {...field}
                          id="supplier"
                          type="text"
                          className="w-full pl-11 h-12 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors"
                          placeholder="Nombre del proveedor"
                        />
                      </div>
                    )}
                  />
                  {errors.supplier && (
                    <p className="text-sm text-red-500">
                      {errors.supplier.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">
                    Opcional - Nombre del proveedor
                  </p>
                </div>

                {/* Etiquetas */}
                <div className="space-y-2">
                  <label htmlFor="tags" className="block text-sm font-semibold text-gray-700">Etiquetas (Opcional)</label>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 pl-3 pr-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleDeleteTag(tag)}
                            className="ml-1 hover:bg-indigo-300 rounded-full p-0.5 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      id="tags"
                      type="text"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={handleTagKeyPress}
                      className="flex-1 h-12 px-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors"
                      placeholder="Agregar etiqueta"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="shrink-0 h-12 px-6 border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-semibold rounded-lg transition-colors"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              </div>

              {/* Ubicación en Almacén */}
              <div className="space-y-2">
                <label htmlFor="location" className="block text-sm font-semibold text-gray-700">Ubicación en Almacén</label>
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
                {errors.location && (
                  <p className="text-sm text-red-500">
                    {errors.location.message}
                  </p>
                )}
                <p className="text-xs text-gray-400">
                  Opcional - Ej: Almacén A, Estante 3
                </p>
              </div>

              {/* Switch Producto Activo */}
              <div className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
                <label htmlFor="isActive" className="text-sm font-semibold text-gray-700 cursor-pointer">
                  Producto activo
                </label>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <button
                      type="button"
                      role="switch"
                      aria-checked={field.value}
                      onClick={() => field.onChange(!field.value)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                        field.value ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          field.value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  )}
                />
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
                {initialData ? "Actualizar Producto" : "Crear Producto"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ProductFormModal;
