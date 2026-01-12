import { z } from 'zod';

/**
 * Sale item schema
 */
export const saleItemSchema = z.object({
  productId: z.number().min(1, 'Producto requerido'),
  productName: z.string().optional(),
  quantity: z
    .number()
    .min(1, 'La cantidad debe ser al menos 1')
    .max(100000, 'La cantidad es demasiado grande'),
  price: z
    .number()
    .min(0, 'El precio no puede ser negativo')
    .max(999999999, 'El precio es demasiado alto'),
  tax: z
    .number()
    .min(0, 'El impuesto no puede ser negativo')
    .max(100, 'El impuesto no puede exceder 100%')
    .optional()
    .default(0),
  discount: z
    .number()
    .min(0, 'El descuento no puede ser negativo')
    .max(100, 'El descuento no puede exceder 100%')
    .optional()
    .default(0),
  subtotal: z.number().min(0, 'El subtotal no puede ser negativo').optional(),
});

/**
 * Sale validation schema
 * Used for create and update operations
 */
export const saleSchema = z.object({
  saleType: z
    .string()
    .min(1, 'El tipo de venta es requerido')
    .refine((val) => ['invoice', 'quote', 'remission', 'credit_note'].includes(val), {
      message: 'Tipo de venta inválido',
    }),

  customerId: z.number().min(1, 'El cliente es requerido'),

  warehouseId: z.number().min(1, 'El almacén es requerido'),

  paymentMethodId: z.number().min(1, 'El medio de pago es requerido'),

  saleDate: z
    .string()
    .min(1, 'La fecha de venta es requerida')
    .or(z.date())
    .transform((val) => (val instanceof Date ? val.toISOString() : val)),

  dueDate: z
    .string()
    .optional()
    .nullable()
    .or(z.date())
    .transform((val) => {
      if (!val) return null;
      return val instanceof Date ? val.toISOString() : val;
    }),

  items: z
    .array(saleItemSchema)
    .min(1, 'Debe agregar al menos un artículo')
    .max(100, 'No puede agregar más de 100 artículos'),

  subtotal: z.number().min(0, 'El subtotal no puede ser negativo').optional(),

  totalTax: z.number().min(0, 'El impuesto total no puede ser negativo').optional(),

  totalDiscount: z.number().min(0, 'El descuento total no puede ser negativo').optional(),

  total: z.number().min(0.01, 'El total debe ser mayor a 0'),

  notes: z
    .string()
    .max(1000, 'Las notas no pueden exceder 1000 caracteres')
    .optional()
    .nullable(),

  status: z
    .string()
    .refine((val) => ['draft', 'confirmed', 'cancelled'].includes(val), {
      message: 'Estado inválido',
    })
    .optional()
    .default('draft'),
});

/**
 * Payment schema
 */
export const paymentSchema = z.object({
  saleId: z.number().min(1, 'La venta es requerida'),

  paymentMethodId: z.number().min(1, 'El método de pago es requerido'),

  amount: z
    .number()
    .min(0.01, 'El monto debe ser mayor a 0')
    .max(999999999, 'El monto es demasiado alto'),

  paymentDate: z
    .string()
    .min(1, 'La fecha de pago es requerida')
    .or(z.date())
    .transform((val) => (val instanceof Date ? val.toISOString() : val)),

  reference: z
    .string()
    .max(100, 'La referencia no puede exceder 100 caracteres')
    .optional()
    .nullable(),

  notes: z
    .string()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .optional()
    .nullable(),
});

/**
 * Default values for sale form
 */
export const saleDefaultValues = {
  saleType: 'invoice',
  customerId: null,
  warehouseId: null,
  paymentMethodId: null,
  saleDate: new Date().toISOString().split('T')[0],
  dueDate: null,
  items: [],
  subtotal: 0,
  totalTax: 0,
  totalDiscount: 0,
  total: 0,
  notes: '',
  status: 'draft',
};

/**
 * Default values for payment form
 */
export const paymentDefaultValues = {
  saleId: null,
  paymentMethodId: null,
  amount: 0,
  paymentDate: new Date().toISOString().split('T')[0],
  reference: '',
  notes: '',
};

/**
 * Sale type options
 */
export const saleTypeOptions = [
  { value: 'invoice', label: 'Factura', color: 'primary' },
  { value: 'quote', label: 'Cotización', color: 'info' },
  { value: 'remission', label: 'Remisión', color: 'warning' },
  { value: 'credit_note', label: 'Nota de Crédito', color: 'error' },
];

/**
 * Sale status options
 */
export const saleStatusOptions = [
  { value: 'draft', label: 'Borrador', color: 'default' },
  { value: 'confirmed', label: 'Confirmada', color: 'success' },
  { value: 'cancelled', label: 'Cancelada', color: 'error' },
];

/**
 * Payment status options
 */
export const paymentStatusOptions = [
  { value: 'pending', label: 'Pendiente', color: 'warning' },
  { value: 'partial', label: 'Parcial', color: 'info' },
  { value: 'paid', label: 'Pagado', color: 'success' },
];

/**
 * Helper function to calculate item subtotal
 */
export const calculateItemSubtotal = (quantity, price, tax = 0, discount = 0) => {
  const base = quantity * price;
  const taxAmount = base * (tax / 100);
  const discountAmount = base * (discount / 100);
  return base + taxAmount - discountAmount;
};

/**
 * Helper function to calculate sale totals
 */
export const calculateSaleTotals = (items) => {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const totalTax = items.reduce((sum, item) => {
    return sum + item.quantity * item.price * ((item.tax || 0) / 100);
  }, 0);
  const totalDiscount = items.reduce((sum, item) => {
    return sum + item.quantity * item.price * ((item.discount || 0) / 100);
  }, 0);
  const total = subtotal + totalTax - totalDiscount;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    totalTax: Number(totalTax.toFixed(2)),
    totalDiscount: Number(totalDiscount.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
};
