import apiClient from './api.service';
import { API_ENDPOINTS } from '../config/api.config';

export const paymentService = {
  // ==================== PAYMENT MANAGEMENT ====================

  /**
   * Get all payments with pagination and filters
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 10)
   * @param {string} params.startDate - Start date filter (ISO format)
   * @param {string} params.endDate - End date filter (ISO format)
   * @param {number} params.saleId - Filter by sale
   * @param {number} params.customerId - Filter by customer
   * @param {number} params.paymentMethodId - Filter by payment method
   * @param {string} params.status - Filter by status (completed, refunded)
   */
  getAll: async (params = {}) => {
    return apiClient.get(API_ENDPOINTS.payments.list, { params });
  },

  /**
   * Get all payments for a specific sale
   * Includes payment method details and running balance
   *
   * @param {number} saleId - Sale ID
   * @returns {Promise} Array of payments with totals
   */
  getBySaleId: async (saleId) => {
    return apiClient.get(API_ENDPOINTS.payments.getBySale(saleId));
  },

  /**
   * Create a new payment
   * Important: Updates sale balance and payment status automatically
   * Validates that amount does not exceed sale balance
   *
   * @param {Object} data - Payment data
   * @param {number} data.saleId - Sale ID
   * @param {number} data.paymentMethodId - Payment method ID
   * @param {number} data.amount - Payment amount (must be > 0 and <= sale balance)
   * @param {string} [data.paymentDate] - Payment date (ISO format, default: now)
   * @param {string} [data.referenceNumber] - Reference number (required if payment method requires it)
   * @param {string} [data.notes] - Additional notes
   * @param {Object} [data.metadata] - Additional metadata
   *
   * @throws {Error} If amount exceeds sale balance or reference is required but missing
   */
  create: async (data) => {
    return apiClient.post(API_ENDPOINTS.payments.create, data);
  },

  /**
   * Refund a payment
   * Important: Only completed payments can be refunded
   * Updates sale balance accordingly
   * Does not reverse inventory (use credit note for that)
   *
   * @param {number} id - Payment ID
   * @param {string} [reason] - Reason for refund
   */
  refund: async (id, reason = '') => {
    return apiClient.post(API_ENDPOINTS.payments.refund(id), { reason });
  },

  // ==================== PAYMENT SUMMARY & ANALYTICS ====================

  /**
   * Get payment summary/statistics
   * @param {Object} params - Filter parameters
   * @param {string} params.startDate - Start date (ISO format)
   * @param {string} params.endDate - End date (ISO format)
   * @param {number} [params.paymentMethodId] - Filter by payment method
   * @param {number} [params.warehouseId] - Filter by warehouse
   * @param {number} [params.customerId] - Filter by customer
   *
   * @returns {Promise} Summary object with:
   * - totalAmount: Total payments amount
   * - totalCount: Number of payments
   * - byPaymentMethod: Breakdown by payment method with counts and amounts
   * - byStatus: Breakdown by status
   */
  getSummary: async (params = {}) => {
    return apiClient.get(API_ENDPOINTS.payments.summary, { params });
  },

  /**
   * Get payment statistics for dashboard
   * @param {string} period - Period: today, week, month, year
   * @returns {Promise} Statistics object
   */
  getStatistics: async (period = 'month') => {
    return apiClient.get(`${API_ENDPOINTS.payments.list}/statistics`, {
      params: { period },
    });
  },

  // ==================== VALIDATION & HELPERS ====================

  /**
   * Validate payment amount against sale balance
   * @param {number} saleId - Sale ID
   * @param {number} amount - Payment amount to validate
   * @returns {Promise<Object>} Validation result
   */
  validatePaymentAmount: async (saleId, amount) => {
    try {
      const { salesService } = await import('./sales.service');
      const saleResponse = await salesService.getById(saleId);
      const sale = saleResponse.data;

      const isValid = amount > 0 && amount <= sale.balance;

      return {
        isValid,
        saleBalance: sale.balance,
        saleTotal: sale.total,
        salePaidAmount: sale.paidAmount || 0,
        maxPaymentAmount: sale.balance,
        error: !isValid
          ? amount <= 0
            ? 'El monto debe ser mayor a 0'
            : `El monto no puede exceder el saldo pendiente (${sale.balance})`
          : null,
      };
    } catch (error) {
      return {
        isValid: false,
        error: error.message || 'Error al validar el monto del pago',
      };
    }
  },

  /**
   * Calculate payment distribution for partial payments
   * Useful for showing remaining balance after multiple payments
   *
   * @param {number} saleTotal - Total sale amount
   * @param {Array<number>} paymentAmounts - Array of payment amounts
   * @returns {Object} Distribution calculation
   */
  calculatePaymentDistribution: (saleTotal, paymentAmounts) => {
    const totalPaid = paymentAmounts.reduce((sum, amount) => sum + amount, 0);
    const balance = saleTotal - totalPaid;
    const paidPercentage = (totalPaid / saleTotal) * 100;

    return {
      total: saleTotal,
      totalPaid,
      balance,
      paidPercentage: Math.min(100, Math.max(0, paidPercentage)),
      paymentCount: paymentAmounts.length,
      averagePayment: paymentAmounts.length > 0 ? totalPaid / paymentAmounts.length : 0,
      isPaid: balance <= 0,
      isPartial: balance > 0 && totalPaid > 0,
      isPending: totalPaid === 0,
    };
  },

  /**
   * Format payment reference number
   * @param {string} paymentNumber - Payment number
   * @param {string} referenceNumber - Reference number
   * @returns {string} Formatted reference
   */
  formatPaymentReference: (paymentNumber, referenceNumber) => {
    if (!referenceNumber) return paymentNumber;
    return `${paymentNumber} (Ref: ${referenceNumber})`;
  },

  /**
   * Get payment status label
   * @param {string} status - Payment status
   * @returns {Object} Status configuration with label and color
   */
  getPaymentStatusConfig: (status) => {
    const statusMap = {
      completed: { label: 'Completado', color: 'success' },
      refunded: { label: 'Reembolsado', color: 'error' },
      pending: { label: 'Pendiente', color: 'warning' },
    };

    return statusMap[status] || { label: status, color: 'default' };
  },
};

export default paymentService;
