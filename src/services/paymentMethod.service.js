import apiClient from './api.service';
import { API_ENDPOINTS } from '../config/api.config';

export const paymentMethodService = {
  /**
   * Get all payment methods
   * Returns only active payment methods by default
   *
   * @param {Object} params - Query parameters
   * @param {boolean} [params.includeInactive=false] - Include inactive methods
   * @returns {Promise} Array of payment methods
   */
  getAll: async (params = {}) => {
    return apiClient.get(API_ENDPOINTS.paymentMethods.list, { params });
  },

  /**
   * Get payment method by ID
   * @param {number} id - Payment method ID
   * @returns {Promise} Payment method details
   */
  getById: async (id) => {
    return apiClient.get(API_ENDPOINTS.paymentMethods.getById(id));
  },

  /**
   * Get active payment methods for dropdown/selector
   * Optimized for UI components
   *
   * @returns {Promise} Array of active payment methods with minimal data
   */
  getActiveForSelector: async () => {
    const response = await apiClient.get(API_ENDPOINTS.paymentMethods.list, {
      params: { isActive: true },
    });

    // Return data in format suitable for selects/dropdowns
    return response.data?.map((method) => ({
      id: method.id,
      name: method.name,
      code: method.code,
      requiresReference: method.requiresReference || false,
    }));
  },

  /**
   * Check if payment method requires reference number
   * @param {number} id - Payment method ID
   * @returns {Promise<boolean>} True if reference is required
   */
  requiresReference: async (id) => {
    try {
      const response = await paymentMethodService.getById(id);
      return response.data?.requiresReference || false;
    } catch (error) {
      console.error('Error checking payment method reference requirement:', error);
      return false;
    }
  },

  /**
   * Get payment method configuration
   * Returns configuration object for UI rendering
   *
   * @param {number} id - Payment method ID
   * @returns {Promise<Object>} Configuration object
   */
  getConfig: async (id) => {
    const response = await paymentMethodService.getById(id);
    const method = response.data;

    return {
      id: method.id,
      name: method.name,
      code: method.code,
      requiresReference: method.requiresReference || false,
      icon: paymentMethodService.getIcon(method.code),
      color: paymentMethodService.getColor(method.code),
      placeholder: method.requiresReference
        ? paymentMethodService.getReferencePlaceholder(method.code)
        : null,
    };
  },

  // ==================== UI HELPERS ====================

  /**
   * Get icon name for payment method
   * @param {string} code - Payment method code
   * @returns {string} Icon name for Material-UI
   */
  getIcon: (code) => {
    const iconMap = {
      cash: 'Payments',
      transfer: 'AccountBalance',
      card: 'CreditCard',
      check: 'Receipt',
      credit: 'AccountBalanceWallet',
      other: 'Payment',
    };

    return iconMap[code] || 'Payment';
  },

  /**
   * Get color for payment method badge/chip
   * @param {string} code - Payment method code
   * @returns {string} MUI color name
   */
  getColor: (code) => {
    const colorMap = {
      cash: 'success',
      transfer: 'primary',
      card: 'info',
      check: 'warning',
      credit: 'secondary',
      other: 'default',
    };

    return colorMap[code] || 'default';
  },

  /**
   * Get placeholder text for reference input
   * @param {string} code - Payment method code
   * @returns {string} Placeholder text
   */
  getReferencePlaceholder: (code) => {
    const placeholderMap = {
      transfer: 'Ej: TRANS-123456',
      card: 'Ej: **** **** **** 1234',
      check: 'Ej: CHQ-789012',
      credit: 'Ej: CRED-345678',
      other: 'Número de referencia',
    };

    return placeholderMap[code] || 'Número de referencia';
  },

  /**
   * Format payment method display name
   * @param {Object} method - Payment method object
   * @returns {string} Formatted display name
   */
  formatDisplayName: (method) => {
    if (!method) return '';

    if (method.requiresReference) {
      return `${method.name} (requiere referencia)`;
    }

    return method.name;
  },

  /**
   * Validate reference number format
   * @param {string} code - Payment method code
   * @param {string} reference - Reference number to validate
   * @returns {Object} Validation result
   */
  validateReference: (code, reference) => {
    if (!reference || reference.trim() === '') {
      return {
        isValid: false,
        error: 'El número de referencia es requerido',
      };
    }

    // Basic validation rules by payment method type
    const validationRules = {
      transfer: {
        minLength: 5,
        pattern: /^[A-Z0-9-]+$/,
        error: 'Formato inválido. Use mayúsculas, números y guiones',
      },
      card: {
        minLength: 4,
        pattern: /^[\d*\s-]+$/,
        error: 'Formato inválido. Use números, espacios y guiones',
      },
      check: {
        minLength: 3,
        pattern: /^[A-Z0-9-]+$/,
        error: 'Formato inválido. Use mayúsculas, números y guiones',
      },
    };

    const rule = validationRules[code];

    if (!rule) {
      // No specific validation for this method
      return { isValid: true };
    }

    if (reference.length < rule.minLength) {
      return {
        isValid: false,
        error: `Mínimo ${rule.minLength} caracteres`,
      };
    }

    if (!rule.pattern.test(reference)) {
      return {
        isValid: false,
        error: rule.error,
      };
    }

    return { isValid: true };
  },
};

export default paymentMethodService;
