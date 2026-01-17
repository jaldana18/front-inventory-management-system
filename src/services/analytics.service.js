import apiClient from './api.service';
import { API_ENDPOINTS } from '../config/api.config';

export const analyticsService = {
  // Get dashboard KPIs
  getDashboard: async () => {
    return apiClient.get(API_ENDPOINTS.analytics.dashboard);
  },

  // Get sales timeline
  getSalesTimeline: async ({ startDate, endDate, granularity = 'daily' }) => {
    return apiClient.get(API_ENDPOINTS.analytics.salesTimeline, {
      params: { startDate, endDate, granularity },
    });
  },

  // Get top selling products
  getTopSellingProducts: async ({ period = '7days', limit = 10 } = {}) => {
    return apiClient.get(API_ENDPOINTS.analytics.topProducts, {
      params: { period, limit },
    });
  },

  // Get category performance
  getCategoryPerformance: async ({ period = '7days' } = {}) => {
    return apiClient.get(API_ENDPOINTS.analytics.categoryPerformance, {
      params: { period },
    });
  },

  // Compare periods
  comparePeriods: async ({ startDate1, endDate1, startDate2, endDate2 }) => {
    return apiClient.get(API_ENDPOINTS.analytics.salesComparison, {
      params: { startDate1, endDate1, startDate2, endDate2 },
    });
  },

  // Get inventory status
  getInventoryStatus: async () => {
    return apiClient.get(API_ENDPOINTS.analytics.inventoryStatus);
  },
};
