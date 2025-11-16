import apiClient from './api.service';
import { API_ENDPOINTS } from '../config/api.config';

export const reportService = {
  // Get inventory report
  getInventoryReport: async (params = {}) => {
    return apiClient.get(API_ENDPOINTS.reports.inventory, { params });
  },

  // Get stock movement report
  getStockMovementReport: async (params = {}) => {
    return apiClient.get(API_ENDPOINTS.reports.stockMovement, { params });
  },

  // Get low stock report
  getLowStockReport: async (params = {}) => {
    return apiClient.get(API_ENDPOINTS.reports.lowStockReport, { params });
  },

  // Get products by category report
  getCategoryReport: async (params = {}) => {
    return apiClient.get(API_ENDPOINTS.reports.categoryReport, { params });
  },
};
