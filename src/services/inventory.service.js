import apiClient from './api.service';
import { API_ENDPOINTS } from '../config/api.config';

export const inventoryService = {
  // Get all inventory items
  getAll: async (params = {}) => {
    return apiClient.get(API_ENDPOINTS.inventory, { params });
  },

  // Get inventory item by ID
  getById: async (id) => {
    return apiClient.get(API_ENDPOINTS.inventoryById(id));
  },

  // Create new inventory item
  create: async (data) => {
    return apiClient.post(API_ENDPOINTS.inventory, data);
  },

  // Update inventory item
  update: async (id, data) => {
    return apiClient.put(API_ENDPOINTS.inventoryById(id), data);
  },

  // Delete inventory item
  delete: async (id) => {
    return apiClient.delete(API_ENDPOINTS.inventoryById(id));
  },

  // Search inventory
  search: async (query) => {
    return apiClient.get(API_ENDPOINTS.inventorySearch, {
      params: { q: query },
    });
  },

  // Get low stock items
  getLowStock: async () => {
    return apiClient.get(API_ENDPOINTS.inventoryLowStock);
  },

  // Adjust stock quantity
  adjustStock: async (id, quantity, reason) => {
    return apiClient.post(`${API_ENDPOINTS.inventoryById(id)}/adjust`, {
      quantity,
      reason,
    });
  },
};
