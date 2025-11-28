import { useQuery } from '@tanstack/react-query';
import { warehouseService } from '../services/warehouse.service';

/**
 * Hook to get warehouses list
 * @param {Object} params - Query parameters
 * @param {Object} options - React Query options
 */
export const useWarehouses = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['warehouses', params],
    queryFn: () => warehouseService.getAll(params),
    staleTime: 10 * 60 * 1000, // 10 minutes - warehouses rarely change
    ...options,
  });
};
