import apiClient from './api.service';
import { API_ENDPOINTS } from '../config/api.config';

export const companyService = {
  // Get all companies
  getAll: async (params = {}) => {
    return apiClient.get(API_ENDPOINTS.companies.list, { params });
  },

  // Get company by ID
  getById: async (id) => {
    return apiClient.get(API_ENDPOINTS.companies.getById(id));
  },

  // Get current user's company
  getCurrentCompany: async () => {
    return apiClient.get(API_ENDPOINTS.companies.current);
  },

  // Create a new company
  create: async (data) => {
    // Expected data: { name, legalName?, taxId, email?, phone?, address?, metadata? }
    return apiClient.post(API_ENDPOINTS.companies.create, data);
  },

  // Update company
  update: async (id, data) => {
    return apiClient.put(API_ENDPOINTS.companies.update(id), data);
  },

  // Delete company
  delete: async (id) => {
    return apiClient.delete(API_ENDPOINTS.companies.delete(id));
  },
};
