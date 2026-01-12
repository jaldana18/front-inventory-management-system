/**
 * Lista de países con códigos telefónicos y validaciones
 */
export const countries = [
  {
    code: 'CO',
    name: 'Colombia',
    dialCode: '+57',
    flag: '🇨🇴',
    digitCount: 10,
    format: '(###) ### ####',
  },
  {
    code: 'US',
    name: 'Estados Unidos',
    dialCode: '+1',
    flag: '🇺🇸',
    digitCount: 10,
    format: '(###) ###-####',
  },
  {
    code: 'MX',
    name: 'México',
    dialCode: '+52',
    flag: '🇲🇽',
    digitCount: 10,
    format: '(###) ### ####',
  },
  {
    code: 'AR',
    name: 'Argentina',
    dialCode: '+54',
    flag: '🇦🇷',
    digitCount: 10,
    format: '(###) ###-####',
  },
  {
    code: 'BR',
    name: 'Brasil',
    dialCode: '+55',
    flag: '🇧🇷',
    digitCount: 11,
    format: '(##) #####-####',
  },
  {
    code: 'CL',
    name: 'Chile',
    dialCode: '+56',
    flag: '🇨🇱',
    digitCount: 9,
    format: '# #### ####',
  },
  {
    code: 'PE',
    name: 'Perú',
    dialCode: '+51',
    flag: '🇵🇪',
    digitCount: 9,
    format: '### ### ###',
  },
  {
    code: 'EC',
    name: 'Ecuador',
    dialCode: '+593',
    flag: '🇪🇨',
    digitCount: 9,
    format: '## ### ####',
  },
  {
    code: 'VE',
    name: 'Venezuela',
    dialCode: '+58',
    flag: '🇻🇪',
    digitCount: 10,
    format: '(###) ###-####',
  },
  {
    code: 'ES',
    name: 'España',
    dialCode: '+34',
    flag: '🇪🇸',
    digitCount: 9,
    format: '### ## ## ##',
  },
  {
    code: 'PA',
    name: 'Panamá',
    dialCode: '+507',
    flag: '🇵🇦',
    digitCount: 8,
    format: '####-####',
  },
  {
    code: 'CR',
    name: 'Costa Rica',
    dialCode: '+506',
    flag: '🇨🇷',
    digitCount: 8,
    format: '####-####',
  },
];

/**
 * Obtener país por código
 */
export const getCountryByCode = (code) => {
  return countries.find((country) => country.code === code) || countries[0];
};

/**
 * Obtener país por código de marcación
 */
export const getCountryByDialCode = (dialCode) => {
  return countries.find((country) => country.dialCode === dialCode) || countries[0];
};

/**
 * Formatear número de teléfono según el formato del país
 */
export const formatPhoneNumber = (phone, countryCode) => {
  if (!phone) return '';
  
  const country = getCountryByCode(countryCode);
  const digits = phone.replace(/\D/g, '');
  
  if (!country.format) return digits;
  
  let formatted = '';
  let digitIndex = 0;
  
  for (let i = 0; i < country.format.length && digitIndex < digits.length; i++) {
    if (country.format[i] === '#') {
      formatted += digits[digitIndex];
      digitIndex++;
    } else {
      formatted += country.format[i];
    }
  }
  
  return formatted;
};

/**
 * Validar número de teléfono según el país
 */
export const validatePhone = (phone, countryCode) => {
  if (!phone) return { isValid: false, error: 'El teléfono es requerido' };
  
  const country = getCountryByCode(countryCode);
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length === 0) {
    return { isValid: false, error: 'El teléfono es requerido' };
  }
  
  if (country.digitCount && digits.length !== country.digitCount) {
    return {
      isValid: false,
      error: `Debe tener ${country.digitCount} dígitos`,
    };
  }
  
  return { isValid: true };
};

/**
 * Limpiar número de teléfono (solo dígitos)
 */
export const cleanPhoneNumber = (phone) => {
  return phone ? phone.replace(/\D/g, '') : '';
};

/**
 * Obtener número completo con código de país
 */
export const getFullPhoneNumber = (phone, countryCode) => {
  const country = getCountryByCode(countryCode);
  const digits = cleanPhoneNumber(phone);
  return digits ? `${country.dialCode}${digits}` : '';
};

export default {
  countries,
  getCountryByCode,
  getCountryByDialCode,
  formatPhoneNumber,
  validatePhone,
  cleanPhoneNumber,
  getFullPhoneNumber,
};
