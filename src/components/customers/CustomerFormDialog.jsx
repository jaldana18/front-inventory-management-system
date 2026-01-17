import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  User,
  FileText,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  Building2,
  DollarSign,
  X,
  Users,
  Globe,
} from 'lucide-react';
import { customerSchema, customerDefaultValues, documentTypeOptions, customerTypeOptions } from '../../schemas/customer.schema';
import { useCreateCustomer, useUpdateCustomer } from '../../hooks/useCustomers';
import { useSalesStore } from '../../store/salesStore';
import { useLanguage } from '../../context/LanguageContext';
import PhoneInput from '../common/PhoneInput';

const CustomerFormDialog = ({ onCustomerCreated } = {}) => {
  const { t } = useLanguage();
  const {
    customers: { dialogOpen, selectedCustomer },
    setCustomerDialogOpen,
  } = useSalesStore();

  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: customerDefaultValues,
  });

  const customerType = watch('customerType');
  const isEditMode = Boolean(selectedCustomer);

  useEffect(() => {
    if (dialogOpen && selectedCustomer) {
      reset(selectedCustomer);
    } else if (dialogOpen) {
      reset(customerDefaultValues);
    }
  }, [dialogOpen, selectedCustomer, reset]);

  const onSubmit = async (data) => {
    // Normalize empty strings to null for optional string fields
    const normalize = (val) => (typeof val === 'string' && val.trim() === '' ? null : val);
    const payload = {
      ...data,
      email: normalize(data.email),
      phone: normalize(data.phone),
      address: normalize(data.address),
      city: normalize(data.city),
      state: normalize(data.state),
      zipCode: normalize(data.zipCode),
      notes: normalize(data.notes),
      country: normalize(data.country),
    };
    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({
          id: selectedCustomer.id,
          data: payload,
        });
      } else {
        const newCustomer = await createMutation.mutateAsync(payload);
        // Callback para notificar al componente padre sobre el cliente creado
        if (onCustomerCreated && newCustomer) {
          onCustomerCreated(newCustomer);
        }
      }
      handleClose();
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  };

  const handleClose = () => {
    setCustomerDialogOpen(false);
    reset(customerDefaultValues);
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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[calc(100vh-6rem)] overflow-y-auto pointer-events-auto animate-in zoom-in-95 duration-200 my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-gray-200 pb-4 mb-2 px-6 pt-6 sticky top-0 bg-white z-10">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold text-indigo-600 mb-1">
                  {isEditMode ? "✏️ Editar Cliente" : "Nuevo Cliente"}
                </h2>
                <p className="text-sm text-gray-500">
                  {isEditMode ? "Actualiza la información del cliente" : "Complete la información del nuevo cliente"}
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 px-6 pb-6">
            {/* Información Básica */}
            <div className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <User className="h-5 w-5 text-indigo-600" />
                Información Básica
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nombre del Cliente */}
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                    Nombre del Cliente <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                        <input
                          {...field}
                          id="name"
                          type="text"
                          className="w-full pl-11 h-12 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors"
                          placeholder="Ej: Juan Pérez"
                        />
                      </div>
                    )}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 flex items-center gap-1">⚠️ {errors.name.message}</p>
                  )}
                </div>

                {/* Tipo de Cliente */}
                <div className="space-y-2">
                  <label htmlFor="customerType" className="block text-sm font-semibold text-gray-700">
                    Tipo de Cliente
                  </label>
                  <Controller
                    name="customerType"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <Users className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                        <select
                          {...field}
                          id="customerType"
                          className="w-full pl-11 h-12 px-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors bg-white cursor-pointer appearance-none"
                        >
                          <option value="">Seleccionar tipo...</option>
                          {customerTypeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  />
                  {errors.customerType && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      ⚠️ {errors.customerType.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tipo de Documento */}
                <div className="space-y-2">
                  <label htmlFor="documentType" className="block text-sm font-semibold text-gray-700">
                    Tipo de Documento <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="documentType"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <FileText className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                        <select
                          {...field}
                          id="documentType"
                          className="w-full pl-11 h-12 px-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors bg-white cursor-pointer appearance-none"
                        >
                          <option value="">Seleccionar tipo...</option>
                          {documentTypeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  />
                  {errors.documentType && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      ⚠️ {errors.documentType.message}
                    </p>
                  )}
                </div>

                {/* Número de Documento */}
                <div className="space-y-2">
                  <label htmlFor="documentNumber" className="block text-sm font-semibold text-gray-700">
                    Número de Documento <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="documentNumber"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                        <input
                          {...field}
                          id="documentNumber"
                          type="text"
                          inputMode="numeric"
                          maxLength={15}
                          value={field.value}
                          onChange={(e) => {
                            // Solo permitir números y máximo 15 dígitos
                            const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 15);
                            field.onChange(value);
                          }}
                          className="w-full pl-11 h-12 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors"
                          placeholder="Ej: 1234567890"
                        />
                      </div>
                    )}
                  />
                  {errors.documentNumber && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      ⚠️ {errors.documentNumber.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Switch Responsable de IVA */}
              <div className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
                <label htmlFor="taxResponsible" className="text-sm font-semibold text-gray-700 cursor-pointer">
                  Responsable de IVA
                </label>
                <Controller
                  name="taxResponsible"
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

            {/* Información de Contacto */}
            <div className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Phone className="h-5 w-5 text-green-600" />
                Información de Contacto
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                    Correo Electrónico
                  </label>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                        <input
                          {...field}
                          id="email"
                          type="email"
                          className="w-full pl-11 h-12 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors"
                          placeholder="correo@ejemplo.com"
                        />
                      </div>
                    )}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                {/* Teléfono */}
                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
                    Teléfono
                  </label>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field: phoneField }) => (
                      <Controller
                        name="phoneCountryCode"
                        control={control}
                        render={({ field: countryField }) => (
                          <PhoneInput
                            value={phoneField.value || ''}
                            onChange={phoneField.onChange}
                            countryCode={countryField.value}
                            onCountryChange={countryField.onChange}
                            id="phone"
                            placeholder="Número de teléfono"
                            error={errors.phone?.message}
                          />
                        )}
                      />
                    )}
                  />
                </div>
              </div>

              {/* Dirección */}
              <div className="space-y-2">
                <label htmlFor="address" className="block text-sm font-semibold text-gray-700">
                  Dirección
                </label>
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                      <input
                        {...field}
                        id="address"
                        type="text"
                        className="w-full pl-11 h-12 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors"
                        placeholder="Calle 123 #45-67"
                      />
                    </div>
                  )}
                />
                {errors.address && (
                  <p className="text-sm text-red-500">{errors.address.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Ciudad */}
                <div className="space-y-2">
                  <label htmlFor="city" className="block text-sm font-semibold text-gray-700">
                    Ciudad
                  </label>
                  <Controller
                    name="city"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                        <input
                          {...field}
                          id="city"
                          type="text"
                          className="w-full pl-11 h-12 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors"
                          placeholder="Bogotá"
                        />
                      </div>
                    )}
                  />
                  {errors.city && (
                    <p className="text-sm text-red-500">{errors.city.message}</p>
                  )}
                </div>

                {/* Estado/Provincia */}
                <div className="space-y-2">
                  <label htmlFor="state" className="block text-sm font-semibold text-gray-700">
                    Estado/Provincia
                  </label>
                  <Controller
                    name="state"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        id="state"
                        type="text"
                        className="w-full h-12 px-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors"
                        placeholder="Cundinamarca"
                      />
                    )}
                  />
                  {errors.state && (
                    <p className="text-sm text-red-500">{errors.state.message}</p>
                  )}
                </div>

                {/* País */}
                <div className="space-y-2">
                  <label htmlFor="country" className="block text-sm font-semibold text-gray-700">
                    País
                  </label>
                  <Controller
                    name="country"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <Globe className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                        <input
                          {...field}
                          id="country"
                          type="text"
                          className="w-full pl-11 h-12 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors"
                          placeholder="Colombia"
                        />
                      </div>
                    )}
                  />
                  {errors.country && (
                    <p className="text-sm text-red-500">{errors.country.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Código Postal */}
                <div className="space-y-2">
                  <label htmlFor="zipCode" className="block text-sm font-semibold text-gray-700">
                    Código Postal
                  </label>
                  <Controller
                    name="zipCode"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        id="zipCode"
                        type="text"
                        className="w-full h-12 px-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors"
                        placeholder="110111"
                      />
                    )}
                  />
                  {errors.zipCode && (
                    <p className="text-sm text-red-500">{errors.zipCode.message}</p>
                  )}
                </div>

                {/* Límite de Crédito */}
                <div className="space-y-2">
                  <label htmlFor="creditLimit" className="block text-sm font-semibold text-gray-700">
                    Límite de Crédito
                  </label>
                  <Controller
                    name="creditLimit"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <span className="absolute left-3 top-3.5 text-gray-500 font-medium text-sm pointer-events-none">COP $</span>
                        <input
                          {...field}
                          id="creditLimit"
                          type="text"
                          inputMode="numeric"
                          value={field.value ? new Intl.NumberFormat('es-CO').format(field.value) : ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            field.onChange(value ? parseFloat(value) : 0);
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
                  {errors.creditLimit && (
                    <p className="text-sm text-red-500">{errors.creditLimit.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Información Adicional */}
            <div className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Información Adicional
              </h3>

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
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors resize-none"
                      placeholder="Notas adicionales sobre el cliente..."
                    />
                  )}
                />
                {errors.notes && (
                  <p className="text-sm text-red-500">{errors.notes.message}</p>
                )}
              </div>

              {/* Switch Cliente Activo */}
              <div className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
                <label htmlFor="isActive" className="text-sm font-semibold text-gray-700 cursor-pointer">
                  Cliente activo
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
                disabled={isSubmitting}
                className="px-6 h-11 border-2 border-gray-300 hover:bg-gray-50 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 h-11 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Guardando...' : isEditMode ? 'Actualizar Cliente' : 'Crear Cliente'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CustomerFormDialog;
