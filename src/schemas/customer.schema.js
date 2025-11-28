import { z } from 'zod';

/**
 * Customer validation schema
 * Used for create and update operations
 */
export const customerSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(200, 'El nombre no puede exceder 200 caracteres'),

  email: z
    .string()
    .email('Email inválido')
    .optional()
    .nullable()
    .or(z.literal('')),

  phone: z
    .string()
    .regex(/^(\+57)?[\s]?[3][0-9]{9}$|^[0-9]{7,10}$/, 'Formato de teléfono inválido. Use formato colombiano: +57 3001234567 o 3001234567')
    .optional()
    .nullable()
    .or(z.literal('')),

  documentType: z
    .string()
    .min(1, 'El tipo de documento es requerido')
    .refine((val) => ['CC', 'CE', 'NIT', 'PASSPORT'].includes(val), {
      message: 'Tipo de documento inválido',
    }),

  documentNumber: z
    .string()
    .min(1, 'El número de documento es requerido')
    .min(5, 'El número de documento debe tener al menos 5 caracteres')
    .max(20, 'El número de documento no puede exceder 20 caracteres')
    .regex(/^[0-9A-Za-z\-]+$/, 'El documento solo puede contener letras, números y guiones')
    .refine(
      (val) => {
        // Validación básica de documento
        const numericVal = val.replace(/\D/g, '');
        return numericVal.length >= 5;
      },
      { message: 'El documento debe contener al menos 5 dígitos' }
    ),

  customerType: z
    .string()
    .refine((val) => ['retail', 'wholesale', 'vip', 'distributor'].includes(val), {
      message: 'Tipo de cliente inválido',
    })
    .optional()
    .default('retail'),

  address: z
    .string()
    .max(255, 'La dirección no puede exceder 255 caracteres')
    .optional()
    .nullable(),

  city: z
    .string()
    .max(100, 'La ciudad no puede exceder 100 caracteres')
    .optional()
    .nullable(),

  state: z
    .string()
    .max(100, 'El estado/departamento no puede exceder 100 caracteres')
    .optional()
    .nullable(),

  country: z
    .string()
    .max(100, 'El país no puede exceder 100 caracteres')
    .optional()
    .nullable(),

  zipCode: z
    .string()
    .max(20, 'El código postal no puede exceder 20 caracteres')
    .optional()
    .nullable(),

  taxResponsible: z
    .boolean()
    .optional()
    .default(false),

  creditLimit: z
    .number()
    .min(0, 'El límite de crédito no puede ser negativo')
    .optional()
    .nullable()
    .default(0),

  notes: z
    .string()
    .max(1000, 'Las notas no pueden exceder 1000 caracteres')
    .optional()
    .nullable(),

  isActive: z.boolean().optional().default(true),
});

/**
 * Default values for customer form
 */
export const customerDefaultValues = {
  name: '',
  email: '',
  phone: '',
  documentType: 'CC',
  documentNumber: '',
  customerType: 'retail',
  address: '',
  city: '',
  state: '',
  country: 'Colombia',
  zipCode: '',
  taxResponsible: false,
  creditLimit: 0,
  notes: '',
  isActive: true,
};

/**
 * Document type options (matching backend API)
 */
export const documentTypeOptions = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'NIT', label: 'NIT' },
  { value: 'PASSPORT', label: 'Pasaporte' },
];

/**
 * Customer type options (matching backend API)
 */
export const customerTypeOptions = [
  { value: 'retail', label: 'Minorista' },
  { value: 'wholesale', label: 'Mayorista' },
  { value: 'vip', label: 'VIP' },
  { value: 'distributor', label: 'Distribuidor' },
];
