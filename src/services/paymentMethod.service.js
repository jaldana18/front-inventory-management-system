import apiClient from './api.service';
import { API_ENDPOINTS } from '../config/api.config';

export const paymentMethodService = {
  /**
   * Parse metadata field from JSON string
   * @private
   */
  _parseMetadata: (metadataString) => {
    try {
      return typeof metadataString === 'string' 
        ? JSON.parse(metadataString) 
        : metadataString || {};
    } catch (error) {
      console.error('Error parsing payment method metadata:', error);
      return {};
    }
  },

  /**
   * Transform payment method from API response
   * @private
   */
  _transformPaymentMethod: (method) => {
    const metadata = paymentMethodService._parseMetadata(method.metadata);
    
    return {
      id: method.id,
      companyId: method.companyId,
      name: method.name,
      code: method.code,
      channel: method.channel,
      requiresReference: method.requiresReference,
      isActive: method.isActive,
      metadata,
      icon: metadata.icon || paymentMethodService.getIcon(method.code),
      color: metadata.color || paymentMethodService.getColor(method.code),
      description: metadata.description || method.name,
      createdAt: method.createdAt,
      updatedAt: method.updatedAt,
    };
  },

  /**
   * Get all payment methods
   * Returns only active payment methods by default
   *
   * @param {Object} params - Query parameters
   * @param {boolean} [params.includeInactive=false] - Include inactive methods
   * @returns {Promise} Array of payment methods
   */
  getAll: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.paymentMethods.list, { params });
    const methods = response.data || response || [];
    
    return methods.map(paymentMethodService._transformPaymentMethod);
  },

  /**
   * Get payment method by ID
   * @param {number} id - Payment method ID
   * @returns {Promise} Payment method details
   */
  getById: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.paymentMethods.getById(id));
    return paymentMethodService._transformPaymentMethod(response.data || response);
  },

  /**
   * Get active payment methods for dropdown/selector
   * Optimized for UI components
   *
   * @returns {Promise} Array of active payment methods with minimal data
   */
  getActiveForSelector: async () => {
    const response = await apiClient.get(API_ENDPOINTS.paymentMethods.list, {
      params: { activeOnly: true },
    });

    const methods = response.data || response || [];

    // Return data in format suitable for selects/dropdowns
    return methods.map((method) => {
      const metadata = paymentMethodService._parseMetadata(method.metadata);
      
      return {
        id: method.id,
        name: method.name,
        code: method.code,
        channel: method.channel,
        requiresReference: method.requiresReference || false,
        icon: metadata.icon || paymentMethodService.getIcon(method.code),
        color: metadata.color || paymentMethodService.getColor(method.code),
      };
    });
  },

  /**
   * Check if payment method requires reference number
   * @param {number} id - Payment method ID
   * @returns {Promise<boolean>} True if reference is required
   */
  requiresReference: async (id) => {
    try {
      const method = await paymentMethodService.getById(id);
      return method.requiresReference || false;
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
    const method = await paymentMethodService.getById(id);

    return {
      id: method.id,
      name: method.name,
      code: method.code,
      channel: method.channel,
      requiresReference: method.requiresReference || false,
      icon: method.icon,
      color: method.color,
      description: method.description,
      placeholder: method.requiresReference
        ? paymentMethodService.getReferencePlaceholder(method.code)
        : null,
    };
  },

  // ==================== UI HELPERS ====================

  /**
   * Get icon name for payment method
   * @param {string} code - Payment method code
   * @returns {string} Default icon name
   */
  getIcon: (code) => {
    const iconMap = {
      cash: 'banknote',
      transfer: 'bank',
      card: 'credit-card',
      check: 'receipt',
      credit: 'wallet',
      digital_wallet: 'smartphone',
      other: 'payment',
    };

    return iconMap[code] || 'payment';
  },

  /**
   * Get color for payment method badge/chip
   * @param {string} code - Payment method code
   * @returns {string} Hex color code
   */
  getColor: (code) => {
    const colorMap = {
      cash: '#10B981',      // Green
      transfer: '#3B82F6',  // Blue
      card: '#06B6D4',      // Cyan
      check: '#F59E0B',     // Amber
      credit: '#8B5CF6',    // Purple
      digital_wallet: '#EC4899', // Pink
      other: '#6B7280',     // Gray
    };

    return colorMap[code] || '#6B7280';
  },

  /**
   * Get placeholder text for reference input
   * @param {string} code - Payment method code
   * @param {string} channel - Payment channel (optional)
   * @returns {string} Placeholder text
   */
  getReferencePlaceholder: (code, channel = null) => {
    // Channel-specific placeholders
    if (channel) {
      const channelPlaceholders = {
        nequi: 'Ej: Número de aprobación Nequi',
        daviplata: 'Ej: Número de aprobación Daviplata',
        bancolombia: 'Ej: Número de transacción Bancolombia',
        pse: 'Ej: CUS PSE',
      };
      
      if (channelPlaceholders[channel]) {
        return channelPlaceholders[channel];
      }
    }

    // Code-specific placeholders
    const placeholderMap = {
      transfer: 'Ej: TRANS-123456',
      card: 'Ej: **** **** **** 1234',
      check: 'Ej: CHQ-789012',
      credit: 'Ej: CRED-345678',
      digital_wallet: 'Ej: Número de aprobación',
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
