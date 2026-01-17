import { useState, useEffect } from 'react';
import { Phone, ChevronDown } from 'lucide-react';
import { countries, getCountryByCode, formatPhoneNumber, cleanPhoneNumber } from '../../data/countries';

/**
 * Componente de input de teléfono con selector de país
 * @param {Object} props
 * @param {string} props.value - Valor del teléfono
 * @param {Function} props.onChange - Callback cuando cambia el valor
 * @param {string} props.countryCode - Código del país (por defecto 'CO')
 * @param {Function} props.onCountryChange - Callback cuando cambia el país
 * @param {string} props.id - ID del input
 * @param {string} props.placeholder - Placeholder del input
 * @param {boolean} props.required - Si el campo es requerido
 * @param {boolean} props.disabled - Si el campo está deshabilitado
 * @param {string} props.error - Mensaje de error
 * @param {string} props.className - Clases CSS adicionales
 */
export const PhoneInput = ({
  value = '',
  onChange,
  countryCode = 'CO',
  onCountryChange,
  id = 'phone',
  placeholder,
  required = false,
  disabled = false,
  error = null,
  className = '',
}) => {
  const [selectedCountry, setSelectedCountry] = useState(getCountryByCode(countryCode));
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [formattedValue, setFormattedValue] = useState('');

  useEffect(() => {
    setSelectedCountry(getCountryByCode(countryCode));
  }, [countryCode]);

  useEffect(() => {
    if (value) {
      const formatted = formatPhoneNumber(value, selectedCountry.code);
      setFormattedValue(formatted);
    } else {
      setFormattedValue('');
    }
  }, [value, selectedCountry]);

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setShowCountryDropdown(false);
    
    if (onCountryChange) {
      onCountryChange(country.code);
    }
    
    // Limpiar el valor si cambia de país
    if (onChange) {
      onChange('');
    }
  };

  const handlePhoneChange = (e) => {
    const input = e.target.value;
    
    // Solo permitir números
    const cleaned = cleanPhoneNumber(input);
    
    // Validar longitud máxima según el país
    if (selectedCountry.digitCount && cleaned.length > selectedCountry.digitCount) {
      return;
    }
    
    if (onChange) {
      onChange(cleaned);
    }
  };

  const handleKeyDown = (e) => {
    // Prevenir caracteres no numéricos
    if (
      e.key !== 'Backspace' &&
      e.key !== 'Delete' &&
      e.key !== 'Tab' &&
      e.key !== 'ArrowLeft' &&
      e.key !== 'ArrowRight' &&
      e.key !== 'Home' &&
      e.key !== 'End' &&
      !/^\d$/.test(e.key)
    ) {
      e.preventDefault();
    }
  };

  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    return selectedCountry.format.replace(/#/g, '0');
  };

  return (
    <div className={className}>
      <div className="relative flex">
        {/* Country Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => !disabled && setShowCountryDropdown(!showCountryDropdown)}
            onBlur={() => setTimeout(() => setShowCountryDropdown(false), 200)}
            disabled={disabled}
            className="h-12 px-3 flex items-center gap-2 border border-r-0 border-gray-200 rounded-l-lg bg-gray-50 hover:bg-gray-100 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-indigo-200"
          >
            <span className="text-xl">{selectedCountry.flag}</span>
            <span className="text-sm font-medium text-gray-700">{selectedCountry.dialCode}</span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>

          {/* Country Dropdown */}
          {showCountryDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-30 min-w-[280px]">
              {countries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className="w-full px-4 py-2 flex items-center gap-3 hover:bg-indigo-50 transition-colors text-left"
                >
                  <span className="text-xl">{country.flag}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{country.name}</p>
                    <p className="text-xs text-gray-500">{country.dialCode}</p>
                  </div>
                  {selectedCountry.code === country.code && (
                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Phone Input */}
        <div className="relative flex-1">
          <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            id={id}
            value={formattedValue}
            onChange={handlePhoneChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            required={required}
            placeholder={getPlaceholder()}
            className={`w-full pl-11 h-12 px-3 border border-gray-200 rounded-r-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed ${
              error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''
            }`}
          />
        </div>
      </div>

      {/* Helper Text */}
      {selectedCountry.digitCount && !error && (
        <p className="text-xs text-gray-500 mt-1">
          Debe tener {selectedCountry.digitCount} dígitos
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
          ⚠️ {error}
        </p>
      )}
    </div>
  );
};

export default PhoneInput;
