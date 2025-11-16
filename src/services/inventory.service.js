import apiClient from './api.service';
import { API_ENDPOINTS } from '../config/api.config';

export const inventoryService = {
  // ==================== INVENTORY MANAGEMENT ====================

  // Get all inventory items with pagination
  getAll: async (params = {}) => {
    return apiClient.get(API_ENDPOINTS.inventory.list, { params });
  },

  // Get current stock for a specific product
  getStock: async (productId) => {
    return apiClient.get(API_ENDPOINTS.inventory.getStock(productId));
  },

  // Get low stock items
  getLowStock: async (params = {}) => {
    return apiClient.get(API_ENDPOINTS.inventory.lowStock, { params });
  },

  // Get inventory summary
  getSummary: async (params = {}) => {
    return apiClient.get(API_ENDPOINTS.inventory.summary, { params });
  },

  // Adjust stock level directly
  adjustStock: async (data) => {
    // Expected data: { productId, warehouseId?, newStock, reason, notes? }
    return apiClient.post(API_ENDPOINTS.inventory.adjust, data);
  },

  // Transfer stock between warehouses
  transferStock: async (data) => {
    // Expected data: { productId, fromWarehouseId, toWarehouseId, quantity, reference?, notes? }
    return apiClient.post(API_ENDPOINTS.inventory.transfer, data);
  },

  // ==================== INVENTORY TRANSACTIONS ====================

  // Get all transactions
  getTransactions: async (params = {}) => {
    return apiClient.get(API_ENDPOINTS.transactions.list, { params });
  },

  // Get transaction by ID
  getTransactionById: async (id) => {
    return apiClient.get(API_ENDPOINTS.transactions.getById(id));
  },

  // Create a new transaction (inbound, outbound, adjustment, transfer)
  // This is the primary way to manage inventory changes
  create: async (data) => {
    // Expected data: { productId, warehouseId?, type, reason, quantity, unitCost?, reference?, location?, notes?, metadata? }
    return apiClient.post(API_ENDPOINTS.transactions.create, data);
  },

  // Legacy alias for create
  createTransaction: async (data) => {
    return inventoryService.create(data);
  },

  // Get transactions for a specific product
  getProductTransactions: async (productId, params = {}) => {
    return apiClient.get(API_ENDPOINTS.transactions.byProduct(productId), { params });
  },

  // Get transaction summary
  getTransactionSummary: async (params = {}) => {
    return apiClient.get(API_ENDPOINTS.transactions.summary, { params });
  },

  // ==================== LEGACY COMPATIBILITY ====================
  // These methods are kept for backward compatibility

  // Update inventory item (maps to create transaction with type 'adjustment')
  update: async (id, data) => {
    // Convert update to adjustment transaction
    return inventoryService.create({
      productId: id,
      type: 'adjustment',
      reason: 'correction',
      quantity: data.quantity,
      notes: data.notes,
      warehouseId: data.warehouseId,
    });
  },

  // Delete/remove inventory (maps to create transaction with negative quantity)
  delete: async () => {
    // This would require more context in a real app
    console.warn('Delete operation not directly supported for inventory. Use create transaction instead.');
    return Promise.reject(new Error('Use createTransaction instead of delete'));
  },
};
