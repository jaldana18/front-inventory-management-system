import { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Warehouse, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Globe,
  Building2,
  X,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { countries, colombiaDepartments, colombiaCities } from '../../data/colombiaData';

// Esquema de validación
const warehouseSchema = z.object({
  code: z.string().min(1, 'El código es requerido'),
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  managerName: z.string().optional(),
  isMain: z.boolean().optional(),
});

export default function WarehouseFormDialog({ open, warehouse, onClose, onSubmit, isLoading }) {
  const { t } = useLanguage();
  
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      country: '',
      phone: '',
      email: '',
      managerName: '',
      isMain: false,
    },
  });

  const selectedCountry = watch('country');
  const selectedState = watch('state');

  useEffect(() => {
    if (warehouse) {
      reset({
        code: warehouse.code || '',
        name: warehouse.name || '',
        description: warehouse.description || '',
        address: warehouse.address || '',
        city: warehouse.city || '',
        state: warehouse.state || '',
        zip: warehouse.zip || '',
        country: warehouse.country || '',
        phone: warehouse.phone || '',
        email: warehouse.email || '',
        managerName: warehouse.managerName || '',
        isMain: warehouse.isMain || false,
      });
    } else {
      reset({
        code: '',
        name: '',
        description: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        phone: '',
        email: '',
        managerName: '',
        isMain: false,
      });
    }
  }, [warehouse, open, reset]);

  // Reset state and city when country changes
  useEffect(() => {
    if (selectedCountry !== 'CO') {
      setValue('state', '');
      setValue('city', '');
    }
  }, [selectedCountry, setValue]);

  // Reset city when state changes
  useEffect(() => {
    if (selectedCountry === 'CO' && selectedState) {
      setValue('city', '');
    }
  }, [selectedState, selectedCountry, setValue]);
  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5) return `+57 (${numbers.slice(2)})`;
    if (numbers.length <= 8) return `+57 (${numbers.slice(2, 5)}) ${numbers.slice(5)}`;
    return `+57 (${numbers.slice(2, 5)}) ${numbers.slice(5, 8)}-${numbers.slice(8, 12)}`;
  };

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleFormSubmit = useCallback((data) => {
    const cleanedData = Object.entries(data).reduce((acc, [key, value]) => {
      if (typeof value === 'string' && value.trim() === '') {
        return acc;
      }
      acc[key] = value;
      return acc;
    }, {});
    
    onSubmit(cleanedData);
  }, [onSubmit]);

  const handleGenerateCode = useCallback(() => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    setValue('code', `WH-${timestamp}${random}`);
  }, [setValue]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 md:pt-20 pointer-events-none overflow-y-auto">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[calc(100vh-6rem)] overflow-y-auto pointer-events-auto my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-gray-200 pb-4 mb-2 px-6 pt-6 sticky top-0 bg-white z-10">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold text-indigo-600 mb-1">
                  {warehouse ? '✏️ Editar Almacén' : 'Nuevo Almacén'}
                </h2>
                <p className="text-sm text-gray-500">
                  Complete la información del {warehouse ? 'almacén' : 'nuevo almacén'}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                disabled={isLoading}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8 px-6 pb-6">
            {/* Información Básica */}
            <div className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Warehouse className="h-5 w-5 text-indigo-600" />
                Información Básica
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Código */}
                <div className="md:col-span-4 space-y-2">
                  <label htmlFor="code" className="block text-sm font-semibold text-gray-700">
                    Código <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="code"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                        <input
                          {...field}
                          id="code"
                          type="text"
                          className="w-full pl-11 pr-12 h-12 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors"
                          placeholder="WH-001"
                        />
                        <button
                          type="button"
                          onClick={handleGenerateCode}
                          className="absolute right-2 top-2.5 p-1.5 rounded-md bg-indigo-50 hover:bg-indigo-100 transition-colors group"
                          title="Generar código automático"
                        >
                          <Sparkles className="h-5 w-5 text-indigo-600 group-hover:text-indigo-700" />
                        </button>
                      </div>
                    )}
                  />
                  {errors.code && (
                    <p className="text-sm text-red-500 flex items-center gap-1">⚠️ {errors.code.message}</p>
                  )}
                </div>

                {/* Nombre */}
                <div className="md:col-span-8 space-y-2">
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <Warehouse className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                        <input
                          {...field}
                          id="name"
                          type="text"
                          className="w-full pl-11 h-12 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors"
                          placeholder="Almacén Central"
                        />
                      </div>
                    )}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 flex items-center gap-1">⚠️ {errors.name.message}</p>
                  )}
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700">
                  Descripción
                </label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      id="description"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors resize-none"
                      placeholder="Descripción del almacén..."
                    />
                  )}
                />
              </div>
            </div>

            {/* Información de Ubicación */}
            <div className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Información de Ubicación
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <select
                          {...field}
                          id="country"
                          className="w-full pl-11 h-12 px-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors bg-white cursor-pointer"
                        >
                          <option value="">Seleccione un país</option>
                          {countries.map((country) => (
                            <option key={country.code} value={country.code}>
                              {country.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  />
                </div>

                {/* Departamento/Estado */}
                <div className="space-y-2">
                  <label htmlFor="state" className="block text-sm font-semibold text-gray-700">
                    {selectedCountry === 'CO' ? 'Departamento' : 'Estado/Provincia'}
                  </label>
                  <Controller
                    name="state"
                    control={control}
                    render={({ field }) => (
                      selectedCountry === 'CO' ? (
                        <select
                          {...field}
                          id="state"
                          className="w-full h-12 px-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors bg-white cursor-pointer"
                        >
                          <option value="">Seleccione un departamento</option>
                          {colombiaDepartments.map((dept) => (
                            <option key={dept.code} value={dept.code}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          {...field}
                          id="state"
                          type="text"
                          className="w-full h-12 px-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors"
                          placeholder="Estado"
                        />
                      )
                    )}
                  />
                </div>

                {/* Ciudad */}
                <div className="space-y-2">
                  <label htmlFor="city" className="block text-sm font-semibold text-gray-700">
                    Ciudad
                  </label>
                  <Controller
                    name="city"
                    control={control}
                    render={({ field }) => (
                      selectedCountry === 'CO' && selectedState ? (
                        <select
                          {...field}
                          id="city"
                          className="w-full h-12 px-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors bg-white cursor-pointer"
                        >
                          <option value="">Seleccione una ciudad</option>
                          {colombiaCities[selectedState]?.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          {...field}
                          id="city"
                          type="text"
                          className="w-full h-12 px-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors"
                          placeholder="Ciudad"
                        />
                      )
                    )}
                  />
                </div>

                {/* Código Postal */}
                <div className="space-y-2">
                  <label htmlFor="zip" className="block text-sm font-semibold text-gray-700">
                    Código Postal
                  </label>
                  <Controller
                    name="zip"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        id="zip"
                        type="text"
                        className="w-full h-12 px-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors"
                        placeholder="12345"
                      />
                    )}
                  />
                  <p className="text-xs text-gray-400">Opcional</p>
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
                        placeholder="Calle Principal 123"
                      />
                    </div>
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
                {/* Teléfono */}
                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
                    Teléfono
                  </label>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                        <input
                          {...field}
                          id="phone"
                          type="text"
                          maxLength={19}
                          onChange={(e) => {
                            const formatted = formatPhoneNumber(e.target.value);
                            field.onChange(formatted);
                          }}
                          className="w-full pl-11 h-12 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-200 focus:outline-none transition-colors"
                          placeholder="+57 (300) 123-4567"
                        />
                      </div>
                    )}
                  />
                  <p className="text-xs text-gray-400">Formato: +57 (XXX) XXX-XXXX</p>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                    Email
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
                          className="w-full pl-11 h-12 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-200 focus:outline-none transition-colors"
                          placeholder="almacen@empresa.com"
                        />
                      </div>
                    )}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>
              </div>

              {/* Responsable */}
              <div className="space-y-2">
                <label htmlFor="managerName" className="block text-sm font-semibold text-gray-700">
                  Responsable
                </label>
                <Controller
                  name="managerName"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                      <input
                        {...field}
                        id="managerName"
                        type="text"
                        className="w-full pl-11 h-12 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors"
                        placeholder="Nombre del responsable"
                      />
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Configuración */}
            <div className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-600" />
                Configuración
              </h3>

              {/* Switch Almacén Principal */}
              <div className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
                <div>
                  <label htmlFor="isMain" className="block text-sm font-semibold text-gray-700 cursor-pointer">
                    Almacén Principal
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Marca este almacén como principal
                  </p>
                </div>
                <Controller
                  name="isMain"
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
                disabled={isLoading}
                className="px-6 h-11 border-2 border-gray-300 hover:bg-gray-50 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading
                  ? 'Guardando...'
                  : warehouse
                  ? 'Actualizar Almacén'
                  : 'Crear Almacén'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
