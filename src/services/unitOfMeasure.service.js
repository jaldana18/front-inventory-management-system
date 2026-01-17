import apiClient from './api.service';
import { API_ENDPOINTS } from '../config/api.config';

export const unitOfMeasureService = {
  // Get all units of measure
  getAll: async (params = {}) => {
    return apiClient.get(API_ENDPOINTS.unitsOfMeasure.list, { params });
  },

  // Get only active units of measure
  getActive: async () => {
    return apiClient.get(API_ENDPOINTS.unitsOfMeasure.active);
  },

  // Get unit of measure by ID
  getById: async (id) => {
    return apiClient.get(API_ENDPOINTS.unitsOfMeasure.getById(id));
  },

  // Create a new unit of measure
  create: async (data) => {
    return apiClient.post(API_ENDPOINTS.unitsOfMeasure.create, data);
  },

  // Update unit of measure
  update: async (id, data) => {
    return apiClient.put(API_ENDPOINTS.unitsOfMeasure.update(id), data);
  },

  // Delete unit of measure
  delete: async (id) => {
    return apiClient.delete(API_ENDPOINTS.unitsOfMeasure.delete(id));
  },
};
