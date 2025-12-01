import apiClient from './api.service';
import { API_ENDPOINTS } from '../config/api.config';

export const categoryService = {
  // Get all categories
  getAll: async (params = {}) => {
    return apiClient.get(API_ENDPOINTS.categories.list, { params });
  },

  // Get only active categories
  getActive: async () => {
    return apiClient.get(API_ENDPOINTS.categories.active);
  },

  // Get category by ID
  getById: async (id) => {
    return apiClient.get(API_ENDPOINTS.categories.getById(id));
  },

  // Create a new category
  create: async (data) => {
    return apiClient.post(API_ENDPOINTS.categories.create, data);
  },

  // Update category
  update: async (id, data) => {
    return apiClient.put(API_ENDPOINTS.categories.update(id), data);
  },

  // Delete category
  delete: async (id) => {
    return apiClient.delete(API_ENDPOINTS.categories.delete(id));
  },
};
