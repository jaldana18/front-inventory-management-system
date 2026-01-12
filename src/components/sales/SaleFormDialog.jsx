import { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X,
  Package,
  Users,
  Calendar,
  FileText,
  DollarSign,
  Trash2,
  Search,
  ShoppingCart,
  Warehouse,
  CreditCard,
  Loader2,
  AlertCircle,
  Plus,
} from "lucide-react";
import {
  saleSchema,
  saleDefaultValues,
  saleTypeOptions,
  calculateSaleTotals,
} from "../../schemas/sale.schema";
import { useCreateSale } from "../../hooks/useSales";
import { useCustomers } from "../../hooks/useCustomers";
import { useWarehouses } from "../../hooks/useWarehouses";
import { useProducts } from "../../hooks/useProducts";
import { useActivePaymentMethods } from "../../hooks/usePaymentMethods";
import { useSalesStore } from "../../store/salesStore";
import { useLanguage } from "../../context/LanguageContext";
import toast from "react-hot-toast";
import CustomerFormDialog from "../customers/CustomerFormDialog";


const SaleFormDialog = () => {
  const { t } = useLanguage();
  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);

  const {
    sales: { dialogOpen },
    setSaleDialogOpen,
    setCustomerDialogOpen,
  } = useSalesStore();

  const createMutation = useCreateSale();

  // Queries - Usar useCustomers en lugar de useSearchCustomers
  const { data: customersData, isLoading: customersLoading } = useCustomers();
  const { data: warehousesData, isLoading: warehousesLoading } = useWarehouses();
  const { data: productsData, isLoading: productsLoading } = useProducts({ search: productSearch });
  const { data: paymentMethodsData, isLoading: paymentMethodsLoading } = useActivePaymentMethods();

  // Extraer datos y filtrar clientes localmente
  const allCustomers = customersData?.data?.items || customersData?.items || customersData?.data || [];
  const customers = customerSearch.trim() 
    ? allCustomers.filter(customer => 
        customer.name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
        customer.documentNumber?.toLowerCase().includes(customerSearch.toLowerCase()) ||
        customer.code?.toLowerCase().includes(customerSearch.toLowerCase())
      )
    : allCustomers;
  
  const warehouses = warehousesData?.data?.items || [];
  const products = productsData?.data?.items || [];
  const paymentMethods = paymentMethodsData || [];

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(saleSchema),
    defaultValues: saleDefaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const items = watch("items");

  // Recalculate totals when items change
  useEffect(() => {
    if (items && items.length > 0) {
      const totals = calculateSaleTotals(items);
      setValue("subtotal", totals.subtotal);
      setValue("totalTax", totals.totalTax);
      setValue("totalDiscount", totals.totalDiscount);
      setValue("total", totals.total);
    } else {
      setValue("subtotal", 0);
      setValue("totalTax", 0);
      setValue("totalDiscount", 0);
      setValue("total", 0);
    }
  }, [items, setValue]);

  const onSubmit = async (data) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success('Venta creada correctamente');
      handleClose();
    } catch (error) {
      console.error("Error creating sale:", error);
      toast.error(error.response?.data?.error?.message || 'Error al crear la venta');
    }
  };

  const handleClose = () => {
    setSaleDialogOpen(false);
    reset(saleDefaultValues);
    setCustomerSearch("");
    setProductSearch("");
    setSelectedCustomer(null);
    setShowCustomerDropdown(false);
    setShowProductDropdown(false);
  };

  const handleCustomerSearch = (searchValue) => {
    setCustomerSearch(searchValue);
    setShowCustomerDropdown(true); // Mostrar siempre que haya input o focus
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setValue('customerId', customer.id);
    setCustomerSearch(`${customer.name}${customer.documentNumber ? ' - ' + customer.documentNumber : ''}`);
    setShowCustomerDropdown(false);
  };

  const handleCustomerCreated = (newCustomer) => {
    // Seleccionar automáticamente el cliente recién creado
    if (newCustomer && newCustomer.data) {
      const customer = newCustomer.data;
      handleCustomerSelect(customer);
      toast.success('Cliente creado y seleccionado correctamente');
    }
  };

  const handleProductSearch = (searchValue) => {
    setProductSearch(searchValue);
    setShowProductDropdown(searchValue.trim().length > 0);
  };

  const handleAddProduct = (product) => {
    if (!product) return;

    const existingIndex = items.findIndex(
      (item) => item.productId === product.id
    );

    if (existingIndex >= 0) {
      // Increment quantity if product already exists
      const currentQty = items[existingIndex].quantity || 1;
      setValue(`items.${existingIndex}.quantity`, currentQty + 1);
      handleQuantityChange(existingIndex, currentQty + 1);
    } else {
      // Add new product con el tax (IVA) que viene del backend
      const basePrice = product.salePrice || product.price || 0;
      const taxRate = product.tax || 0; // Tax viene del producto en el backend
      const quantity = 1;
      
      // Calcular subtotal con el impuesto incluido
      const subtotal = basePrice * quantity * (1 + taxRate / 100);
      
      append({
        productId: product.id,
        productName: product.name,
        quantity: quantity,
        price: basePrice,
        tax: taxRate,
        discount: 0,
        subtotal: subtotal,
      });
    }

    setProductSearch("");
    setShowProductDropdown(false);
  };

  const handleQuantityChange = (index, quantity) => {
    const item = items[index];
    const subtotal =
      quantity *
      item.price *
      (1 + (item.tax || 0) / 100) *
      (1 - (item.discount || 0) / 100);
    setValue(`items.${index}.quantity`, quantity);
    setValue(`items.${index}.subtotal`, subtotal);
  };

  const handlePriceChange = (index, price) => {
    const item = items[index];
    const subtotal =
      item.quantity *
      price *
      (1 + (item.tax || 0) / 100) *
      (1 - (item.discount || 0) / 100);
    setValue(`items.${index}.price`, price);
    setValue(`items.${index}.subtotal`, subtotal);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (!dialogOpen) return null;

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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[calc(100vh-6rem)] overflow-y-auto pointer-events-auto animate-in zoom-in-95 duration-200 my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-gray-200 pb-4 mb-2 px-6 pt-6 sticky top-0 bg-white z-10">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold text-indigo-600 mb-1">
                  Nueva Venta
                </h2>
                <p className="text-sm text-gray-500">
                  Completa la información de la venta
                </p>
              </div>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 px-6 pb-6">
            {/* Información General */}
            <div className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                Información General
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Almacén */}
                <div className="space-y-2">
                  <label htmlFor="warehouseId" className="block text-sm font-semibold text-gray-700">
                    Almacén <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="warehouseId"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <Warehouse className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                        <select
                          {...field}
                          id="warehouseId"
                          disabled={warehousesLoading}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          className="w-full pl-11 h-12 px-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors bg-white cursor-pointer disabled:bg-gray-100"
                        >
                          <option value="">Seleccionar almacén</option>
                          {warehouses.map((warehouse) => (
                            <option key={warehouse.id} value={warehouse.id}>
                              {warehouse.name}
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
                </div>

                {/* Cliente */}
                <div className="space-y-2">
                  <label htmlFor="customerId" className="block text-sm font-semibold text-gray-700">
                    Cliente <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="customerId"
                    control={control}
                    render={({ field }) => (
                      <div className="relative flex gap-2">
                        <div className="relative flex-1">
                          <Users className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                          <input
                            type="text"
                            value={customerSearch}
                            onChange={(e) => handleCustomerSearch(e.target.value)}
                            onFocus={() => setShowCustomerDropdown(true)}
                            onBlur={() => {
                              setTimeout(() => setShowCustomerDropdown(false), 200);
                            }}
                            id="customerId"
                            className="w-full pl-11 h-12 px-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors"
                            placeholder="Buscar cliente..."
                          />
                          {showCustomerDropdown && customers.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-20">
                              {customers.map((customer) => (
                                <div
                                  key={customer.id}
                                  onClick={() => handleCustomerSelect(customer)}
                                  className="px-4 py-3 hover:bg-indigo-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                                >
                                  <p className="font-semibold text-gray-900">{customer.name}</p>
                                  <p className="text-sm text-gray-500">
                                    {customer.documentNumber ? `${customer.documentType || ''} ${customer.documentNumber}` : 'Sin documento'}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                          {showCustomerDropdown && customers.length === 0 && customerSearch && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-20">
                              <p className="text-sm text-gray-500 text-center">No se encontraron clientes</p>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setCustomerDialogOpen(true)}
                          className="h-12 w-12 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-md hover:shadow-lg flex-shrink-0"
                          title="Crear nuevo cliente"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  />
                  {errors.customerId && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      ⚠️ {errors.customerId.message}
                    </p>
                  )}
                </div>

                {/* Tipo de Documento */}
                <div className="space-y-2">
                  <label htmlFor="saleType" className="block text-sm font-semibold text-gray-700">
                    Tipo de Documento <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="saleType"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <FileText className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                        <select
                          {...field}
                          id="saleType"
                          className="w-full pl-11 h-12 px-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors bg-white cursor-pointer"
                        >
                          <option value="">Seleccionar tipo</option>
                          {saleTypeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  />
                  {errors.saleType && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      ⚠️ {errors.saleType.message}
                    </p>
                  )}
                </div>

                {/* Medio de Pago */}
                <div className="space-y-2">
                  <label htmlFor="paymentMethodId" className="block text-sm font-semibold text-gray-700">
                    Medio de Pago <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="paymentMethodId"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                        <select
                          {...field}
                          id="paymentMethodId"
                          disabled={paymentMethodsLoading}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          className="w-full pl-11 h-12 px-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors bg-white cursor-pointer disabled:bg-gray-100 appearance-none"
                          style={{ 
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                            backgroundPosition: 'right 0.5rem center',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: '1.5em 1.5em',
                          }}
                        >
                          <option value="">Seleccionar medio de pago</option>
                          {paymentMethods.map((method) => (
                            <option key={method.id} value={method.id}>
                              {method.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  />
                  {errors.paymentMethodId && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      ⚠️ {errors.paymentMethodId.message}
                    </p>
                  )}
                </div>

                {/* Fecha de Venta */}
                <div className="space-y-2">
                  <label htmlFor="saleDate" className="block text-sm font-semibold text-gray-700">
                    Fecha de Venta <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="saleDate"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                        <input
                          {...field}
                          type="date"
                          id="saleDate"
                          defaultValue={getTodayDate()}
                          className="w-full pl-11 h-12 px-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors"
                        />
                      </div>
                    )}
                  />
                  {errors.saleDate && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      ⚠️ {errors.saleDate.message}
                    </p>
                  )}
                </div>

                {/* Fecha de Vencimiento */}
                <div className="space-y-2">
                  <label htmlFor="dueDate" className="block text-sm font-semibold text-gray-700">
                    Fecha de Vencimiento
                  </label>
                  <Controller
                    name="dueDate"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                        <input
                          {...field}
                          type="date"
                          id="dueDate"
                          className="w-full pl-11 h-12 px-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors"
                        />
                      </div>
                    )}
                  />
                  {errors.dueDate && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      ⚠️ {errors.dueDate.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Productos */}
            <div className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-indigo-600" />
                Productos
              </h3>

              {/* Product Search */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => handleProductSearch(e.target.value)}
                    onFocus={() => {
                      if (productSearch) {
                        setShowProductDropdown(true);
                      }
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowProductDropdown(false), 200);
                    }}
                    className="w-full pl-11 h-12 px-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors"
                    placeholder="Buscar y agregar producto..."
                  />
                  {showProductDropdown && products.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-20">
                      {products.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => handleAddProduct(product)}
                          className="px-4 py-3 hover:bg-indigo-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-gray-900">{product.name}</p>
                              <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                            </div>
                            <p className="font-bold text-indigo-600">
                              {formatCurrency(product.salePrice || product.price)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Items Table or Empty State */}
              {fields.length > 0 ? (
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Producto</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase w-32">Cantidad</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase w-40">Precio</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase w-40">Subtotal</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase w-20">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {fields.map((field, index) => (
                        <tr key={field.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900">{items[index]?.productName}</p>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="1"
                              value={items[index]?.quantity || 1}
                              onChange={(e) =>
                                handleQuantityChange(index, parseInt(e.target.value) || 1)
                              }
                              className="w-full h-10 px-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={items[index]?.price || 0}
                              onChange={(e) =>
                                handlePriceChange(index, parseFloat(e.target.value) || 0)
                              }
                              className="w-full h-10 px-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(items[index]?.subtotal || 0)}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <AlertCircle className="h-12 w-12 text-blue-500 mx-auto mb-3" />
                  <p className="text-blue-700 font-medium">No hay productos agregados</p>
                  <p className="text-blue-600 text-sm mt-1">Busca y agrega productos para continuar</p>
                </div>
              )}
            </div>

            {/* Notas y Totales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors resize-none"
                      placeholder="Añade notas adicionales..."
                    />
                  )}
                />
              </div>

              {/* Totales */}
              <div className="space-y-4 bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200">
                <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Resumen de Venta
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Subtotal</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(watch("subtotal") || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Impuestos</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(watch("totalTax") || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Descuentos</span>
                    <span className="text-sm font-semibold text-red-600">
                      - {formatCurrency(watch("totalDiscount") || 0)}
                    </span>
                  </div>
                  <div className="border-t border-indigo-300 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total:</span>
                      <span className="text-2xl font-bold text-indigo-600">
                        {formatCurrency(watch("total") || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-gray-200 pt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-6 h-11 border-2 border-gray-300 hover:bg-gray-50 font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || fields.length === 0}
                className="px-8 h-11 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Crear Venta'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de creación de cliente anidado */}
      <CustomerFormDialog onCustomerCreated={handleCustomerCreated} />
    </>
  );
};

export default SaleFormDialog;
