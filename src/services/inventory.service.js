import axios from 'axios';
import apiClient from './api.service';
import { API_ENDPOINTS, API_CONFIG } from '../config/api.config';

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

  // ==================== MULTI-WAREHOUSE STOCK QUERIES ====================

  // Get stock of a product across all warehouses
  getProductStockAllWarehouses: async (productId) => {
    return apiClient.get(`/inventory/stock/${productId}/warehouses`);
  },

  // Get stock of a product in a specific warehouse
  getProductStockInWarehouse: async (productId, warehouseId) => {
    return apiClient.get(`/inventory/stock/${productId}/warehouse/${warehouseId}`);
  },

  // Get warehouse summary (stats, products, recent transactions)
  getWarehouseSummary: async (warehouseId) => {
    return apiClient.get(`/inventory/warehouses/${warehouseId}/summary`);
  },

  // Get summary of all warehouses (admin/manager only)
  getAllWarehousesSummary: async () => {
    return apiClient.get('/inventory/warehouses/summary');
  },

  // ==================== BULK OPERATIONS ====================

  // Bulk inbound transaction (multiple products into one warehouse)
  bulkInbound: async (data) => {
    // Expected: { warehouseId, items: [{ productId, quantity, unitCost?, reference? }], reason, notes? }
    return apiClient.post('/inventory/bulk/inbound', data);
  },

  // Bulk outbound transaction (multiple products from one warehouse)
  bulkOutbound: async (data) => {
    // Expected: { warehouseId, items: [{ productId, quantity, reference? }], reason, notes? }
    return apiClient.post('/inventory/bulk/outbound', data);
  },

  // Upload bulk inventory transactions from Excel file
  bulkUpload: async (file, options = {}) => {
    const formData = new FormData();
    formData.append('file', file);

    if (options.updateExisting !== undefined) {
      formData.append('updateExisting', options.updateExisting.toString());
    }
    if (options.skipErrors !== undefined) {
      formData.append('skipErrors', options.skipErrors.toString());
    }
    if (options.dryRun !== undefined) {
      formData.append('dryRun', options.dryRun.toString());
    }

    return apiClient.post(API_ENDPOINTS.inventory.bulkUpload, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Validate Excel file structure
  bulkValidate: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.post(API_ENDPOINTS.inventory.bulkValidate, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Preview bulk upload without saving
  bulkPreview: async (file, updateExisting = false) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('updateExisting', updateExisting.toString());

    return apiClient.post(API_ENDPOINTS.inventory.bulkPreview, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Download Excel template
  downloadTemplate: async () => {
    // Use axios directly to avoid the response interceptor that returns response.data
    const token = localStorage.getItem('accessToken');

    const response = await axios.get(
      `${API_CONFIG.baseURL}${API_ENDPOINTS.inventory.bulkTemplate}`,
      {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'plantilla-inventario.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return response;
  },
};
