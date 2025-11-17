import apiClient from './api.service';
import { API_ENDPOINTS } from '../config/api.config';

export const userService = {
  // Get all users
  getAll: async (params = {}) => {
    return apiClient.get(API_ENDPOINTS.users.list, { params });
  },

  // Get user by ID
  getById: async (id) => {
    return apiClient.get(API_ENDPOINTS.users.getById(id));
  },

  // Get current authenticated user
  getCurrentUser: async () => {
    return apiClient.get(API_ENDPOINTS.users.me);
  },

  // Get user statistics
  getStats: async () => {
    return apiClient.get(API_ENDPOINTS.users.stats);
  },

  // Create a new user
  create: async (data) => {
    // Expected data: { email, password, firstName, lastName, role?, companyId? }
    return apiClient.post(API_ENDPOINTS.users.create, data);
  },

  // Update user
  update: async (id, data) => {
    return apiClient.put(API_ENDPOINTS.users.update(id), data);
  },

  // Update current user
  updateCurrentUser: async (data) => {
    return apiClient.put(API_ENDPOINTS.users.updateMe, data);
  },

  // Delete user
  delete: async (id) => {
    return apiClient.delete(API_ENDPOINTS.users.delete(id));
  },
};
