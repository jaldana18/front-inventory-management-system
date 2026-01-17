import { useQuery } from '@tanstack/react-query';
import { inventoryService } from '../services/inventory.service';
import {
  mockInventoryItems,
  mockInventoryTransactions,
  mockLowStockItems,
  mockInventorySummary,
  mockWarehouses,
} from '../mocks/inventory.mock.js';

/**
 * Hook to fetch inventory data with mock fallback support
 * Use VITE_USE_MOCKS=true to enable mock data in development
 */
export const useInventoryData = (options = {}) => {
  const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

  return useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      if (useMocks) {
        console.log('[MOCK] Using mock inventory data');
        return mockInventoryItems;
      }
      try {
        return await inventoryService.getAll();
      } catch (error) {
        console.warn('[FALLBACK] API error, using mock inventory data:', error);
        return mockInventoryItems;
      }
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch inventory transactions
 */
export const useInventoryTransactions = (options = {}) => {
  const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

  return useQuery({
    queryKey: ['inventory-transactions'],
    queryFn: async () => {
      if (useMocks) {
        console.log('[MOCK] Using mock transaction data');
        return mockInventoryTransactions;
      }
      try {
        return await inventoryService.getTransactions?.();
      } catch (error) {
        console.warn('[FALLBACK] API error, using mock transactions:', error);
        return mockInventoryTransactions;
      }
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch low stock items
 */
export const useLowStockItems = (options = {}) => {
  const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

  return useQuery({
    queryKey: ['low-stock'],
    queryFn: async () => {
      if (useMocks) {
        console.log('[MOCK] Using mock low stock data');
        return mockLowStockItems;
      }
      try {
        return await inventoryService.getLowStock();
      } catch (error) {
        console.warn('[FALLBACK] API error, using mock low stock:', error);
        return mockLowStockItems;
      }
    },
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch inventory summary/statistics
 */
export const useInventorySummary = (options = {}) => {
  const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

  return useQuery({
    queryKey: ['inventory-summary'],
    queryFn: async () => {
      if (useMocks) {
        console.log('[MOCK] Using mock inventory summary');
        return mockInventorySummary;
      }
      try {
        return await inventoryService.getSummary?.();
      } catch (error) {
        console.warn('[FALLBACK] API error, using mock summary:', error);
        return mockInventorySummary;
      }
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch warehouses
 */
export const useWarehouses = (options = {}) => {
  const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

  return useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      if (useMocks) {
        console.log('[MOCK] Using mock warehouses data');
        return mockWarehouses;
      }
      try {
        return await inventoryService.getWarehouses?.();
      } catch (error) {
        console.warn('[FALLBACK] API error, using mock warehouses:', error);
        return mockWarehouses;
      }
    },
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};
