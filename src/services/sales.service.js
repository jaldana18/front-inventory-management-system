import apiClient from './api.service';
import { API_ENDPOINTS } from '../config/api.config';

export const salesService = {
  // ==================== SALES MANAGEMENT ====================

  /**
   * Get all sales with pagination and filters
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 10)
   * @param {string} params.search - Search by sale number
   * @param {string} params.status - Filter by status (draft, confirmed, dispatched, delivered, cancelled, credited)
   * @param {string} params.paymentStatus - Filter by payment status (pending, partial, paid, overdue)
   * @param {string} params.saleType - Filter by type (quote, proforma, invoice, remission, credit_note)
   * @param {number} params.customerId - Filter by customer
   * @param {number} params.warehouseId - Filter by warehouse
   * @param {string} params.startDate - Start date filter (ISO format)
   * @param {string} params.endDate - End date filter (ISO format)
   */
  getAll: async (params = {}) => {
    return apiClient.get(API_ENDPOINTS.sales.list, { params });
  },

  /**
   * Get sale by ID with full details including items
   * @param {number} id - Sale ID
   */
  getById: async (id) => {
    return apiClient.get(API_ENDPOINTS.sales.getById(id));
  },

  /**
   * Create a new sale (initially in draft status)
   * @param {Object} data - Sale data
   * @param {string} data.saleType - Type: quote, proforma, invoice, remission
   * @param {number} data.customerId - Customer ID
   * @param {number} [data.warehouseId] - Warehouse ID (required for confirmation)
   * @param {string} [data.saleDate] - Sale date (ISO format, default: now)
   * @param {string} [data.dueDate] - Due date for credit sales (ISO format)
   * @param {number} [data.taxPercentage=19] - General tax percentage
   * @param {number} [data.discountAmount=0] - General discount amount
   * @param {string} [data.notes] - Additional notes
   * @param {Object} [data.metadata] - Additional metadata
   * @param {Array} data.details - Sale line items
   * @param {number} data.details[].productId - Product ID
   * @param {number} data.details[].quantity - Quantity
   * @param {number} data.details[].unitPrice - Unit price
   * @param {number} [data.details[].taxPercentage=19] - Tax percentage for this item
   * @param {number} [data.details[].discountPercentage=0] - Discount percentage for this item
   */
  create: async (data) => {
    return apiClient.post(API_ENDPOINTS.sales.create, data);
  },

  /**
   * Update sale (only allowed for draft status)
   * @param {number} id - Sale ID
   * @param {Object} data - Sale data to update
   */
  update: async (id, data) => {
    return apiClient.put(API_ENDPOINTS.sales.update(id), data);
  },

  /**
   * Confirm sale - validates stock and creates inventory transactions
   * Important: Only sales in draft status can be confirmed
   * Validates stock availability before confirming
   * Creates outbound inventory transactions
   *
   * @param {number} id - Sale ID
   * @throws {Error} If stock is insufficient or sale is not in draft status
   */
  confirm: async (id) => {
    return apiClient.post(API_ENDPOINTS.sales.confirm(id));
  },

  /**
   * Cancel sale
   * Important: Cannot cancel if sale has payments (use credit note instead)
   * Reverses inventory transactions if sale was confirmed
   *
   * @param {number} id - Sale ID
   * @throws {Error} If sale has payments
   */
  cancel: async (id) => {
    return apiClient.post(API_ENDPOINTS.sales.cancel(id));
  },

  /**
   * Convert quote to invoice
   * Creates a new sale (type: invoice) based on quote data
   * Links new invoice to original quote via referenceSaleId
   *
   * @param {number} id - Quote ID
   * @returns {Promise} New invoice data
   */
  convertToInvoice: async (id) => {
    return apiClient.post(API_ENDPOINTS.sales.convertToInvoice(id));
  },

  /**
   * Create credit note for a sale
   * Important: Only for confirmed/delivered sales
   * Creates inbound inventory transactions (reverses original sale)
   * Updates customer balance
   * Marks original sale as credited
   *
   * @param {number} id - Sale ID
   * @param {string} reason - Reason for credit note (required)
   */
  createCreditNote: async (id, reason) => {
    return apiClient.post(API_ENDPOINTS.sales.createCreditNote(id), { reason });
  },

  /**
   * Mark sale as dispatched
   * Changes status from confirmed to dispatched
   *
   * @param {number} id - Sale ID
   * @param {Object} [data] - Optional dispatch data
   * @param {string} [data.carrier] - Carrier/shipping company name
   * @param {string} [data.trackingNumber] - Tracking number
   * @param {string} [data.notes] - Dispatch notes
   */
  dispatch: async (id, data = {}) => {
    return apiClient.post(API_ENDPOINTS.sales.dispatch(id), data);
  },

  /**
   * Mark sale as delivered
   * Changes status from dispatched to delivered
   * Important: Can only deliver sales that are dispatched
   *
   * @param {number} id - Sale ID
   * @param {Object} [data] - Optional delivery data
   * @param {string} [data.deliveryDate] - Actual delivery date (ISO format)
   * @param {string} [data.receivedBy] - Name of person who received
   * @param {string} [data.notes] - Delivery notes
   */
  deliver: async (id, data = {}) => {
    return apiClient.post(API_ENDPOINTS.sales.deliver(id), data);
  },

  /**
   * Create remission (non-inventory affecting document)
   * Used for samples, demonstrations, etc.
   * Auto-confirmed, does not affect inventory
   *
   * @param {Object} data - Remission data (same structure as create)
   */
  createRemission: async (data) => {
    return apiClient.post(API_ENDPOINTS.sales.remission, data);
  },

  // ==================== VALIDATION & HELPERS ====================

  /**
   * Validate stock availability before confirming sale
   * @param {Array} items - Sale items to validate
   * @param {number} items[].productId - Product ID
   * @param {number} items[].quantity - Quantity needed
   * @param {number} warehouseId - Warehouse ID
   * @returns {Promise} Validation result with stock information
   */
  validateStock: async (items, warehouseId) => {
    const { inventoryService } = await import('./inventory.service');

    const validations = await Promise.all(
      items.map(async (item) => {
        try {
          const stockResponse = await inventoryService.getProductStockInWarehouse(
            item.productId,
            warehouseId
          );

          const availableStock = stockResponse.data?.quantity || 0;

          return {
            productId: item.productId,
            required: item.quantity,
            available: availableStock,
            isValid: availableStock >= item.quantity,
            deficit: Math.max(0, item.quantity - availableStock),
          };
        } catch (error) {
          return {
            productId: item.productId,
            required: item.quantity,
            available: 0,
            isValid: false,
            deficit: item.quantity,
            error: error.message,
          };
        }
      })
    );

    const hasErrors = validations.some((v) => !v.isValid);

    return {
      isValid: !hasErrors,
      validations,
      errors: hasErrors ? validations.filter((v) => !v.isValid) : [],
    };
  },

  /**
   * Get sales summary/statistics
   * @param {Object} params - Filter parameters
   * @param {string} params.startDate - Start date (ISO format)
   * @param {string} params.endDate - End date (ISO format)
   * @param {number} [params.customerId] - Filter by customer
   * @param {number} [params.warehouseId] - Filter by warehouse
   */
  getSummary: async (params = {}) => {
    return apiClient.get(`${API_ENDPOINTS.sales.list}/summary`, { params });
  },

  /**
   * Export sale to PDF
   * @param {number} id - Sale ID
   * @returns {Promise<Blob>} PDF file
   */
  exportToPDF: async (id) => {
    return apiClient.get(`${API_ENDPOINTS.sales.getById(id)}/pdf`, {
      responseType: 'blob',
    });
  },

  /**
   * Send sale by email
   * @param {number} id - Sale ID
   * @param {string} email - Recipient email
   */
  sendByEmail: async (id, email) => {
    return apiClient.post(`${API_ENDPOINTS.sales.getById(id)}/send-email`, { email });
  },
};

export default salesService;
