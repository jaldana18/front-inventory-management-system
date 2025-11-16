import apiClient from './api.service';
import { API_ENDPOINTS } from '../config/api.config';

export const warehouseService = {
  // Get all warehouses
  getAll: async (params = {}) => {
    return apiClient.get(API_ENDPOINTS.warehouses.list, { params });
  },

  // Get warehouse by ID
  getById: async (id) => {
    return apiClient.get(API_ENDPOINTS.warehouses.getById(id));
  },

  // Create a new warehouse
  create: async (data) => {
    // Expected data: { code, name, description?, address?, city?, state?, zip?, country?, phone?, email?, managerName?, isMain?, metadata? }
    return apiClient.post(API_ENDPOINTS.warehouses.create, data);
  },

  // Update warehouse
  update: async (id, data) => {
    return apiClient.put(API_ENDPOINTS.warehouses.update(id), data);
  },

  // Delete warehouse
  delete: async (id) => {
    return apiClient.delete(API_ENDPOINTS.warehouses.delete(id));
  },
};
