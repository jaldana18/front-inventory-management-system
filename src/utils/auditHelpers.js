import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Get icon for operation type
 * @param {string} operation - Operation name
 * @returns {string} Emoji icon
 */
export const getOperationIcon = (operation) => {
  const icons = {
    // Ventas
    sale_created: '🛒',
    sale_confirmed: '✅',
    sale_cancelled: '❌',
    sale_updated: '✏️',
    sale_deleted: '🗑️',
    credit_note_created: '📝',
    quote_converted_to_invoice: '🔄',
    quote_converted_to_proforma: '🔄',
    remission_created: '📋',
    sale_dispatched: '🚚',
    sale_delivered: '📦',

    // Inventario
    inventory_transaction_created: '📦',
    bulk_inventory_upload: '📊',
    bulk_inbound_created: '📥',
    bulk_outbound_created: '📤',
    warehouse_transfer: '🔄',
    product_auto_created: '🤖',

    // Pagos
    payment_created: '💳',
    payment_refunded: '💰',
    payment_cancelled: '❌',

    // Productos
    product_created: '➕',
    product_updated: '✏️',
    product_deleted: '🗑️',
    product_permanently_deleted: '❌',

    // Usuarios
    user_created: '👤',
    user_updated: '✏️',
    user_deleted: '🗑️',

    // Clientes
    customer_created: '👥',
    customer_updated: '✏️',
    customer_activated: '✅',
    customer_deactivated: '❌',

    // Empresas
    company_created: '🏢',
    company_updated: '✏️',
    company_deleted: '🗑️',

    // Almacenes
    warehouse_created: '🏭',
    warehouse_updated: '✏️',
    warehouse_deleted: '🗑️',

    // Categorías
    category_created: '📁',
    category_updated: '✏️',
    category_deleted: '🗑️',

    // Métodos de Pago
    payment_method_created: '💳',
    payment_method_updated: '✏️',
    payment_method_deactivated: '❌',

    // Autenticación
    login_success: '🔓',
    login_failed: '🔒',
    logout: '🚪',
    token_refreshed: '🔄',
    password_changed: '🔑',
  };

  return operation ? icons[operation] || '📋' : '📋';
};

/**
 * Get label for operation type
 * @param {string} operation - Operation name
 * @returns {string} Human readable label
 */
export const getOperationLabel = (operation) => {
  const labels = {
    // Ventas
    sale_created: 'Venta Creada',
    sale_confirmed: 'Venta Confirmada',
    sale_cancelled: 'Venta Cancelada',
    sale_updated: 'Venta Actualizada',
    sale_deleted: 'Venta Eliminada',
    credit_note_created: 'Nota de Crédito',
    quote_converted_to_invoice: 'Cotización → Factura',
    quote_converted_to_proforma: 'Cotización → Proforma',
    remission_created: 'Remisión Creada',
    sale_dispatched: 'Venta Despachada',
    sale_delivered: 'Venta Entregada',

    // Inventario
    inventory_transaction_created: 'Transacción de Inventario',
    bulk_inventory_upload: 'Carga Masiva Excel',
    bulk_inbound_created: 'Entrada Masiva',
    bulk_outbound_created: 'Salida Masiva',
    warehouse_transfer: 'Transferencia',
    product_auto_created: 'Producto Auto-creado',

    // Pagos
    payment_created: 'Pago Registrado',
    payment_refunded: 'Pago Reembolsado',
    payment_cancelled: 'Pago Cancelado',

    // Productos
    product_created: 'Producto Creado',
    product_updated: 'Producto Actualizado',
    product_deleted: 'Producto Eliminado',
    product_permanently_deleted: 'Producto Eliminado Permanentemente',

    // Usuarios
    user_created: 'Usuario Creado',
    user_updated: 'Usuario Actualizado',
    user_deleted: 'Usuario Eliminado',

    // Clientes
    customer_created: 'Cliente Creado',
    customer_updated: 'Cliente Actualizado',
    customer_activated: 'Cliente Activado',
    customer_deactivated: 'Cliente Desactivado',

    // Empresas
    company_created: 'Empresa Creada',
    company_updated: 'Empresa Actualizada',
    company_deleted: 'Empresa Eliminada',

    // Almacenes
    warehouse_created: 'Almacén Creado',
    warehouse_updated: 'Almacén Actualizado',
    warehouse_deleted: 'Almacén Eliminado',

    // Categorías
    category_created: 'Categoría Creada',
    category_updated: 'Categoría Actualizada',
    category_deleted: 'Categoría Eliminada',

    // Métodos de Pago
    payment_method_created: 'Método de Pago Creado',
    payment_method_updated: 'Método de Pago Actualizado',
    payment_method_deactivated: 'Método de Pago Desactivado',

    // Autenticación
    login_success: 'Inicio de Sesión Exitoso',
    login_failed: 'Inicio de Sesión Fallido',
    logout: 'Cierre de Sesión',
    token_refreshed: 'Token Renovado',
    password_changed: 'Contraseña Cambiada',
  };

  return operation ? labels[operation] || operation : 'Operación';
};

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @param {string} formatString - Format string (default: 'dd/MM/yyyy HH:mm:ss')
 * @returns {string} Formatted date
 */
export const formatAuditDate = (date, formatString = 'dd/MM/yyyy HH:mm:ss') => {
  if (!date) return '-';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatString, { locale: es });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
};

/**
 * Get color for log level
 * @param {string} level - Log level
 * @returns {string} Color code
 */
export const getLogLevelColor = (level) => {
  const colors = {
    error: '#dc2626',
    warn: '#f59e0b',
    info: '#3b82f6',
    http: '#8b5cf6',
    debug: '#6b7280',
  };
  return colors[level] || colors.info;
};

/**
 * Get badge color for log level
 * @param {string} level - Log level
 * @returns {Object} Background and text color
 */
export const getLogLevelBadgeColor = (level) => {
  const colors = {
    error: { bg: '#fee2e2', text: '#991b1b' },
    warn: { bg: '#fef3c7', text: '#92400e' },
    info: { bg: '#dbeafe', text: '#1e40af' },
    http: { bg: '#ede9fe', text: '#5b21b6' },
    debug: { bg: '#f3f4f6', text: '#374151' },
  };
  return colors[level] || colors.info;
};

/**
 * Format number with thousands separator
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return num.toLocaleString('es-ES');
};

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '$0.00';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
