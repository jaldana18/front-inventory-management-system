import apiClient from './api.service';
import { API_ENDPOINTS } from '../config/api.config';

export const invoiceService = {
  // ==================== INVOICE MANAGEMENT ====================

  // Get all invoices with pagination
  getAll: async (params = {}) => {
    return apiClient.get(API_ENDPOINTS.invoices.list, { params });
  },

  // Get invoice by ID
  getById: async (id) => {
    return apiClient.get(API_ENDPOINTS.invoices.getById(id));
  },

  // Create new invoice
  create: async (data) => {
    // Expected data: {
    //   customerId?: string,
    //   customerName: string,
    //   customerEmail?: string,
    //   customerPhone?: string,
    //   customerAddress?: string,
    //   warehouseId: string,
    //   items: [{ productId, quantity, unitPrice, discount?, tax? }],
    //   subtotal: number,
    //   totalDiscount: number,
    //   totalTax: number,
    //   total: number,
    //   notes?: string,
    //   dueDate?: string,
    //   paymentStatus?: 'PENDING' | 'PARTIAL' | 'PAID',
    // }
    return apiClient.post(API_ENDPOINTS.invoices.create, data);
  },

  // Update invoice
  update: async (id, data) => {
    return apiClient.put(API_ENDPOINTS.invoices.update(id), data);
  },

  // Delete invoice
  delete: async (id) => {
    return apiClient.delete(API_ENDPOINTS.invoices.delete(id));
  },

  // Update payment status
  updatePaymentStatus: async (id, status) => {
    return apiClient.patch(API_ENDPOINTS.invoices.updatePaymentStatus(id), { paymentStatus: status });
  },

  // Get invoice summary
  getSummary: async (params = {}) => {
    return apiClient.get(API_ENDPOINTS.invoices.summary, { params });
  },

  // Export invoice to PDF
  exportToPDF: async (id) => {
    return apiClient.get(API_ENDPOINTS.invoices.exportPDF(id), {
      responseType: 'blob',
    });
  },

  // Send invoice by email
  sendByEmail: async (id, email) => {
    return apiClient.post(API_ENDPOINTS.invoices.sendEmail(id), { email });
  },
};
