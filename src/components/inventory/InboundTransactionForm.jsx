import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import {
  X,
  Package,
  DollarSign,
  FileText,
  Loader2,
  Warehouse,
  Hash,
  MapPin,
  QrCode,
  Sparkles,
  Box,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { inventoryService } from '../../services/inventory.service';
import { productService } from '../../services/product.service';
import { warehouseService } from '../../services/warehouse.service';
import { categoryService } from '../../services/category.service';
import { unitOfMeasureService } from '../../services/unitOfMeasure.service';
import { getAccessibleWarehouses, getDefaultWarehouseId } from '../../utils/warehouse.utils';
import { ROLES } from '../../config/roles.config';
import { useLanguage } from '../../context/LanguageContext';
import { translateCategories, translateUnits } from '../../utils/catalogTranslations';
import toast from 'react-hot-toast';

const INBOUND_REASONS = [
  { value: 'purchase', label: 'Compra' },
  { value: 'return', label: 'Devolución' },
  { value: 'found', label: 'Encontrado' },
  { value: 'initial_stock', label: 'Stock Inicial' },
];

export default function InboundTransactionForm({ open, onClose, onSuccess }) {
  const { userRole, userWarehouseId } = useAuth();
  const { language } = useLanguage();
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [productSearch, setProductSearch] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loadMode, setLoadMode] = useState('existing'); // 'existing' or 'new'
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch categories and units for new product mode
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories-active'],
    queryFn: () => categoryService.getActive(),
    enabled: open && loadMode === 'new',
  });

  const { data: unitsData, isLoading: unitsLoading } = useQuery({
    queryKey: ['units-of-measure-active'],
    queryFn: () => unitOfMeasureService.getActive(),
    enabled: open && loadMode === 'new',
  });

  const categories = translateCategories(categoriesData?.data || [], language);
  const units = translateUnits(unitsData?.data || [], language);

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
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      productId: '',
      warehouseId: getDefaultWarehouseId(userRole, userWarehouseId, ''),
      reason: 'purchase',
      quantity: '',
      unitCost: '',
      reference: '',
      location: '',
      notes: '',
      // New product fields
      newProductName: '',
      newProductSku: '',
      newProductDescription: '',
      newProductCategory: '',
      newProductUnit: '',
      newProductCost: '',
      newProductPrice: '',
      newProductMinStock: '',
      newProductReorderPoint: '',
      newProductSupplier: '',
      newProductLocation: '',
      newProductIsActive: true,
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
      const productsList = Array.isArray(productsData) ? productsData : [];
      setProducts(productsList);
      setFilteredProducts(productsList);

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
      let productId = data.productId;

      // If creating a new product, create it first
      if (loadMode === 'new') {
        const newProductData = {
          sku: data.newProductSku,
          name: data.newProductName,
          description: data.newProductDescription || null,
          category: data.newProductCategory || null,
          unitOfMeasure: data.newProductUnit,
          cost: data.newProductCost ? parseFloat(data.newProductCost) : 0,
          price: data.newProductPrice ? parseFloat(data.newProductPrice) : 0,
          minimumStock: data.newProductMinStock ? parseInt(data.newProductMinStock) : 0,
          reorderPoint: data.newProductReorderPoint ? parseInt(data.newProductReorderPoint) : (data.newProductMinStock ? parseInt(data.newProductMinStock) : 0),
          isActive: data.newProductIsActive !== undefined ? data.newProductIsActive : true,
          imageUrl: null,
          initialStock: 0, // Initial stock will be set by the transaction
        };

        const newProduct = await productService.create(newProductData);
        productId = newProduct.data?.id || newProduct.id;
        
        if (!productId) {
          throw new Error('No se pudo crear el producto');
        }
      }

      // Create the inbound transaction
      const transactionData = {
        productId: parseInt(productId),
        warehouseId: parseInt(data.warehouseId),
        type: 'inbound',
        reason: data.reason,
        quantity: parseFloat(data.quantity),
        unitCost: loadMode === 'new' 
          ? (data.newProductCost ? parseFloat(data.newProductCost) : undefined)
          : (data.unitCost ? parseFloat(data.unitCost) : undefined),
        reference: data.reference || undefined,
        location: data.location || undefined,
        notes: data.notes || undefined,
      };

      await inventoryService.create(transactionData);

      toast.success(loadMode === 'new' 
        ? 'Producto creado y entrada registrada correctamente' 
        : 'Entrada de inventario registrada correctamente');
      reset();
      setLoadMode('existing');
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
      setProductSearch('');
      setFilteredProducts(products);
      setLoadMode('existing');
      setShowDropdown(false);
      onClose();
    }
  };

  const handleModeChange = (mode) => {
    setLoadMode(mode);
    setProductSearch('');
    setValue('productId', '');
    setShowDropdown(false);
    if (mode === 'existing') {
      setFilteredProducts(products);
    }
  };

  const handleProductSearch = (searchValue) => {
    setProductSearch(searchValue);
    
    if (!searchValue.trim()) {
      setFilteredProducts(products);
      setShowDropdown(false);
      return;
    }

    const searchLower = searchValue.toLowerCase();
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(searchLower) ||
      product.sku.toLowerCase().includes(searchLower)
    );
    setFilteredProducts(filtered);
    setShowDropdown(true);
  };

  const handleProductSelect = (productId) => {
    const selectedProduct = products.find(p => p.id === parseInt(productId));
    if (selectedProduct) {
      setValue('productId', productId);
      setProductSearch(`${selectedProduct.name} (${selectedProduct.sku})`);
      setShowDropdown(false);
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
                {/* Mode Selector */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Tipo de Carga
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleModeChange('existing')}
                      className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                        loadMode === 'existing'
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      📦 Producto Existente
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModeChange('new')}
                      className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                        loadMode === 'new'
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      ✨ Nuevo Producto
                    </button>
                  </div>
                </div>

                {/* Información Básica */}
                <div className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Package className="h-5 w-5 text-indigo-600" />
                    Información Básica
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Producto - Modo Existente */}
                    {loadMode === 'existing' && (
                      <div className="space-y-2">
                        <label htmlFor="productId" className="block text-sm font-semibold text-gray-700">
                          Producto <span className="text-red-500">*</span>
                        </label>
                        <Controller
                          name="productId"
                          control={control}
                          rules={{ required: loadMode === 'existing' ? 'Producto es requerido' : false }}
                          render={({ field }) => (
                            <div className="relative">
                              <Package className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                              <input
                                type="text"
                                value={productSearch}
                                onChange={(e) => handleProductSearch(e.target.value)}
                                onFocus={() => {
                                  if (productSearch) {
                                    setShowDropdown(true);
                                  }
                                }}
                                onBlur={() => {
                                  // Delay to allow click on dropdown items
                                  setTimeout(() => setShowDropdown(false), 200);
                                }}
                                className="w-full pl-11 h-12 px-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors"
                                placeholder="Buscar producto por nombre o código..."
                                autoComplete="off"
                              />
                              {/* Dropdown de resultados */}
                              {showDropdown && productSearch && filteredProducts.length > 0 && (
                                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                  {filteredProducts.map((product) => (
                                    <button
                                      key={product.id}
                                      type="button"
                                      onClick={() => {
                                        handleProductSelect(product.id);
                                        field.onChange(product.id);
                                      }}
                                      className="w-full text-left px-4 py-3 hover:bg-indigo-50 transition-colors border-b border-gray-100 last:border-b-0"
                                    >
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="font-medium text-gray-900">{product.name}</p>
                                          <p className="text-sm text-gray-500">{product.sku}</p>
                                        </div>
                                        {product.category && (
                                          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                                            {product.category}
                                          </span>
                                        )}
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )}
                              {showDropdown && productSearch && filteredProducts.length === 0 && (
                                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
                                  No se encontraron productos
                                </div>
                              )}
                            </div>
                          )}
                        />
                        {errors.productId && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            ⚠️ {errors.productId.message}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Nuevo Producto - Formulario Completo */}
                    {loadMode === 'new' && (
                      <>
                        {/* Nombre del Producto */}
                        <div className="md:col-span-2 space-y-2">
                          <label htmlFor="newProductName" className="block text-sm font-semibold text-gray-700">
                            Nombre del Producto <span className="text-red-500">*</span>
                          </label>
                          <Controller
                            name="newProductName"
                            control={control}
                            rules={{ required: loadMode === 'new' ? 'Nombre es requerido' : false }}
                            render={({ field }) => (
                              <div className="relative">
                                <Package className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                                <input
                                  {...field}
                                  id="newProductName"
                                  type="text"
                                  className="w-full pl-11 h-12 px-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors"
                                  placeholder="Ej: Laptop HP Pavilion"
                                />
                              </div>
                            )}
                          />
                          {errors.newProductName && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              ⚠️ {errors.newProductName.message}
                            </p>
                          )}
                        </div>

                        {/* Código, Unidad y Categoría - Grid Layout */}
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-12 gap-4">
                          {/* SKU del Producto */}
                          <div className="md:col-span-5 space-y-2">
                            <label htmlFor="newProductSku" className="block text-sm font-semibold text-gray-700">
                              Código del Producto <span className="text-red-500">*</span>
                            </label>
                            <Controller
                              name="newProductSku"
                              control={control}
                              rules={{ required: loadMode === 'new' ? 'SKU es requerido' : false }}
                              render={({ field }) => (
                                <div className="relative">
                                  <QrCode className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                                  <input
                                    {...field}
                                    id="newProductSku"
                                    type="text"
                                    className="w-full pl-11 pr-12 h-12 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors"
                                    placeholder="PRD-123456"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const timestamp = Date.now().toString().slice(-6);
                                      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
                                      setValue('newProductSku', `PRD-${timestamp}${random}`);
                                    }}
                                    className="absolute right-2 top-2.5 p-1.5 rounded-md bg-indigo-50 hover:bg-indigo-100 transition-colors group"
                                    title="Generar código automático"
                                  >
                                    <Sparkles className="h-5 w-5 text-indigo-600 group-hover:text-indigo-700" />
                                  </button>
                                </div>
                              )}
                            />
                            {errors.newProductSku && (
                              <p className="text-sm text-red-500 flex items-center gap-1">
                                ⚠️ {errors.newProductSku.message}
                              </p>
                            )}
                          </div>

                          {/* Unidad de Medida */}
                          <div className="md:col-span-3 space-y-2">
                            <label htmlFor="newProductUnit" className="block text-sm font-semibold text-gray-700">
                              Unidad de Medida <span className="text-red-500">*</span>
                            </label>
                            <Controller
                              name="newProductUnit"
                              control={control}
                              rules={{ required: loadMode === 'new' ? 'Unidad es requerida' : false }}
                              render={({ field }) => (
                                <select
                                  {...field}
                                  id="newProductUnit"
                                  disabled={unitsLoading}
                                  className="w-full h-12 px-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors bg-white cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                                >
                                  <option value="">
                                    {unitsLoading ? "Cargando..." : "Seleccionar..."}
                                  </option>
                                  {units.map((unit) => (
                                    <option key={unit.id} value={unit.code}>
                                      {unit.translatedName} ({unit.symbol})
                                    </option>
                                  ))}
                                </select>
                              )}
                            />
                            {errors.newProductUnit && (
                              <p className="text-sm text-red-500 flex items-center gap-1">
                                ⚠️ {errors.newProductUnit.message}
                              </p>
                            )}
                          </div>

                          {/* Categoría */}
                          <div className="md:col-span-4 space-y-2">
                            <label htmlFor="newProductCategory" className="block text-sm font-semibold text-gray-700">
                              Categoría <span className="text-red-500">*</span>
                            </label>
                            <Controller
                              name="newProductCategory"
                              control={control}
                              rules={{ required: loadMode === 'new' ? 'Categoría es requerida' : false }}
                              render={({ field }) => (
                                <select
                                  {...field}
                                  id="newProductCategory"
                                  disabled={categoriesLoading}
                                  className="w-full h-12 px-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors bg-white cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                                >
                                  <option value="">
                                    {categoriesLoading ? "Cargando..." : "Seleccionar..."}
                                  </option>
                                  {categories.map((category) => (
                                    <option key={category.id} value={category.name}>
                                      {category.translatedName}
                                    </option>
                                  ))}
                                </select>
                              )}
                            />
                            {errors.newProductCategory && (
                              <p className="text-sm text-red-500 flex items-center gap-1">
                                ⚠️ {errors.newProductCategory.message}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Descripción */}
                        <div className="md:col-span-2 space-y-2">
                          <label htmlFor="newProductDescription" className="block text-sm font-semibold text-gray-700">
                            Descripción
                          </label>
                          <Controller
                            name="newProductDescription"
                            control={control}
                            render={({ field }) => (
                              <textarea
                                {...field}
                                id="newProductDescription"
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors resize-none"
                                placeholder="Opcional - Descripción detallada del producto"
                              />
                            )}
                          />
                        </div>

                        {/* Costo Unitario */}
                        <div className="space-y-2">
                          <label htmlFor="newProductCost" className="block text-sm font-semibold text-gray-700">
                            Costo Unitario <span className="text-red-500">*</span>
                          </label>
                          <Controller
                            name="newProductCost"
                            control={control}
                            render={({ field }) => (
                              <div className="relative">
                                <span className="absolute left-3 top-3.5 text-gray-500 font-medium text-sm pointer-events-none">COP $</span>
                                <input
                                  {...field}
                                  id="newProductCost"
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
                        </div>

                        {/* Precio de Venta */}
                        <div className="space-y-2">
                          <label htmlFor="newProductPrice" className="block text-sm font-semibold text-gray-700">
                            Precio de Venta <span className="text-red-500">*</span>
                          </label>
                          <Controller
                            name="newProductPrice"
                            control={control}
                            rules={{ required: loadMode === 'new' ? 'Precio es requerido' : false }}
                            render={({ field }) => (
                              <div className="relative">
                                <span className="absolute left-3 top-3.5 text-gray-500 font-medium text-sm pointer-events-none">COP $</span>
                                <input
                                  {...field}
                                  id="newProductPrice"
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
                          {errors.newProductPrice && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              ⚠️ {errors.newProductPrice.message}
                            </p>
                          )}
                        </div>

                        {/* Stock Mínimo */}
                        <div className="space-y-2">
                          <label htmlFor="newProductMinStock" className="block text-sm font-semibold text-gray-700">
                            Stock Mínimo <span className="text-red-500">*</span>
                          </label>
                          <Controller
                            name="newProductMinStock"
                            control={control}
                            render={({ field }) => (
                              <input
                                {...field}
                                id="newProductMinStock"
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
                          <p className="text-xs text-gray-400">
                            Nivel mínimo antes de reordenar
                          </p>
                        </div>

                        {/* Punto de Reorden */}
                        <div className="space-y-2">
                          <label htmlFor="newProductReorderPoint" className="block text-sm font-semibold text-gray-700">
                            Punto de Reorden
                          </label>
                          <Controller
                            name="newProductReorderPoint"
                            control={control}
                            render={({ field }) => (
                              <div className="relative">
                                <Hash className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                                <input
                                  {...field}
                                  id="newProductReorderPoint"
                                  type="number"
                                  min="0"
                                  className="w-full pl-11 h-12 px-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors"
                                  placeholder="0"
                                />
                              </div>
                            )}
                          />
                          <p className="text-xs text-gray-400">
                            Nivel para generar alerta de reabastecimiento
                          </p>
                        </div>

                        {/* Ubicación en Almacén */}
                        <div className="md:col-span-2 space-y-2">
                          <label htmlFor="newProductLocation" className="block text-sm font-semibold text-gray-700">
                            Ubicación en Almacén
                          </label>
                          <Controller
                            name="newProductLocation"
                            control={control}
                            render={({ field }) => (
                              <div className="relative">
                                <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                                <input
                                  {...field}
                                  id="newProductLocation"
                                  type="text"
                                  className="w-full pl-11 h-12 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors"
                                  placeholder="Ej: Pasillo A, Estante 3"
                                />
                              </div>
                            )}
                          />
                          <p className="text-xs text-gray-400">
                            Opcional - Ej: Almacén A, Estante 3
                          </p>
                        </div>

                        {/* Proveedor */}
                        <div className="space-y-2">
                          <label htmlFor="newProductSupplier" className="block text-sm font-semibold text-gray-700">
                            Proveedor
                          </label>
                          <Controller
                            name="newProductSupplier"
                            control={control}
                            render={({ field }) => (
                              <div className="relative">
                                <Box className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                                <input
                                  {...field}
                                  id="newProductSupplier"
                                  type="text"
                                  className="w-full pl-11 h-12 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors"
                                  placeholder="Nombre del proveedor"
                                />
                              </div>
                            )}
                          />
                          <p className="text-xs text-gray-400">
                            Opcional - Nombre del proveedor
                          </p>
                        </div>

                        {/* Estado Activo */}
                        <div className="md:col-span-2 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
                          <label htmlFor="newProductIsActive" className="text-sm font-semibold text-gray-700 cursor-pointer">
                            Producto activo
                          </label>
                          <Controller
                            name="newProductIsActive"
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
                      </>
                    )}

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
                              onKeyDown={(e) => {
                                if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                  e.preventDefault();
                                }
                              }}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === '' || parseInt(value) >= 0) {
                                  field.onChange(value);
                                }
                              }}
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
                    {/* Costo Unitario - Solo para producto existente */}
                    {loadMode === 'existing' && (
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
                    )}

                    {/* Referencia */}
                    <div className={`space-y-2 ${loadMode === 'new' ? 'md:col-span-2' : ''}`}>
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
