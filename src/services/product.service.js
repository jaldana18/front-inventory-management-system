import apiClient from './api.service';
import { API_ENDPOINTS } from '../config/api.config';

export const productService = {
  // Get all products with pagination
  getAll: async (params = {}) => {
    return apiClient.get(API_ENDPOINTS.products.list, { params });
  },

  // Get product by ID
  getById: async (id) => {
    return apiClient.get(API_ENDPOINTS.products.getById(id));
  },

  // Create a new product
  create: async (data) => {
    // Expected data: { sku, name, description?, category?, price, cost?, minimumStock?, unit, metadata? }
    return apiClient.post(API_ENDPOINTS.products.create, data);
  },

  // Update product
  update: async (id, data) => {
    return apiClient.put(API_ENDPOINTS.products.update(id), data);
  },

  // Delete product
  delete: async (id) => {
    return apiClient.delete(API_ENDPOINTS.products.delete(id));
  },

  // Get all product categories
  getCategories: async () => {
    return apiClient.get(API_ENDPOINTS.products.categories);
  },

  // Search products
  search: async (query) => {
    return apiClient.get(API_ENDPOINTS.products.search(query));
  },
};
