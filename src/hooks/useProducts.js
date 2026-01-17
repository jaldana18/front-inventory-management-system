import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/product.service';

/**
 * Hook to get products list
 * @param {Object} params - Query parameters
 * @param {Object} options - React Query options
 */
export const useProducts = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productService.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};
