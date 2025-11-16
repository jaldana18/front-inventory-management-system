import { useQuery } from '@tanstack/react-query';
import {
  mockDashboardStats,
  mockInventoryCategoryDistribution,
  mockStockLevelDistribution,
  mockDailyTransactions,
  mockInventoryTrendData,
  mockWarehouseOccupancy,
  mockTopMovingProducts,
  mockInventoryValueTrendByCategory,
  mockRecentActivities,
  mockInventoryHealth,
  mockMonthlyComparison,
  mockInventoryAging,
} from '../mocks/dashboard.mock.js';

/**
 * Hook to fetch dashboard statistics
 */
export const useDashboardStats = (options = {}) => {
  const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      if (useMocks) {
        console.log('[MOCK] Using mock dashboard stats');
        return mockDashboardStats;
      }
      // In production, call the actual API
      // return await dashboardService.getStats();
      return mockDashboardStats;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch category distribution data
 */
export const useCategoryDistribution = (options = {}) => {
  const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

  return useQuery({
    queryKey: ['category-distribution'],
    queryFn: async () => {
      if (useMocks) {
        console.log('[MOCK] Using mock category distribution');
        return mockInventoryCategoryDistribution;
      }
      return mockInventoryCategoryDistribution;
    },
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch stock level distribution
 */
export const useStockLevelDistribution = (options = {}) => {
  const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

  return useQuery({
    queryKey: ['stock-level-distribution'],
    queryFn: async () => {
      if (useMocks) {
        console.log('[MOCK] Using mock stock level distribution');
        return mockStockLevelDistribution;
      }
      return mockStockLevelDistribution;
    },
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch daily transaction data
 */
export const useDailyTransactions = (options = {}) => {
  const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

  return useQuery({
    queryKey: ['daily-transactions'],
    queryFn: async () => {
      if (useMocks) {
        console.log('[MOCK] Using mock daily transactions');
        return mockDailyTransactions;
      }
      return mockDailyTransactions;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch inventory trend data
 */
export const useInventoryTrend = (options = {}) => {
  const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

  return useQuery({
    queryKey: ['inventory-trend'],
    queryFn: async () => {
      if (useMocks) {
        console.log('[MOCK] Using mock inventory trend');
        return mockInventoryTrendData;
      }
      return mockInventoryTrendData;
    },
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch warehouse occupancy data
 */
export const useWarehouseOccupancy = (options = {}) => {
  const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

  return useQuery({
    queryKey: ['warehouse-occupancy'],
    queryFn: async () => {
      if (useMocks) {
        console.log('[MOCK] Using mock warehouse occupancy');
        return mockWarehouseOccupancy;
      }
      return mockWarehouseOccupancy;
    },
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch top moving products
 */
export const useTopMovingProducts = (options = {}) => {
  const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

  return useQuery({
    queryKey: ['top-moving-products'],
    queryFn: async () => {
      if (useMocks) {
        console.log('[MOCK] Using mock top moving products');
        return mockTopMovingProducts;
      }
      return mockTopMovingProducts;
    },
    staleTime: 15 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch inventory value trend by category
 */
export const useInventoryValueTrend = (options = {}) => {
  const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

  return useQuery({
    queryKey: ['inventory-value-trend'],
    queryFn: async () => {
      if (useMocks) {
        console.log('[MOCK] Using mock inventory value trend');
        return mockInventoryValueTrendByCategory;
      }
      return mockInventoryValueTrendByCategory;
    },
    staleTime: 15 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch recent activities
 */
export const useRecentActivities = (options = {}) => {
  const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

  return useQuery({
    queryKey: ['recent-activities'],
    queryFn: async () => {
      if (useMocks) {
        console.log('[MOCK] Using mock recent activities');
        return mockRecentActivities;
      }
      return mockRecentActivities;
    },
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch inventory health score and recommendations
 */
export const useInventoryHealth = (options = {}) => {
  const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

  return useQuery({
    queryKey: ['inventory-health'],
    queryFn: async () => {
      if (useMocks) {
        console.log('[MOCK] Using mock inventory health');
        return mockInventoryHealth;
      }
      return mockInventoryHealth;
    },
    staleTime: 30 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch monthly comparison data
 */
export const useMonthlyComparison = (options = {}) => {
  const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

  return useQuery({
    queryKey: ['monthly-comparison'],
    queryFn: async () => {
      if (useMocks) {
        console.log('[MOCK] Using mock monthly comparison');
        return mockMonthlyComparison;
      }
      return mockMonthlyComparison;
    },
    staleTime: 60 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch inventory aging data
 */
export const useInventoryAging = (options = {}) => {
  const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

  return useQuery({
    queryKey: ['inventory-aging'],
    queryFn: async () => {
      if (useMocks) {
        console.log('[MOCK] Using mock inventory aging');
        return mockInventoryAging;
      }
      return mockInventoryAging;
    },
    staleTime: 30 * 60 * 1000,
    ...options,
  });
};
