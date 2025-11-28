import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '../services/customer.service';
import toast from 'react-hot-toast';

// Query keys for cache management
export const customerKeys = {
  all: ['customers'],
  lists: () => [...customerKeys.all, 'list'],
  list: (params) => [...customerKeys.lists(), params],
  details: () => [...customerKeys.all, 'detail'],
  detail: (id) => [...customerKeys.details(), id],
  search: (query) => [...customerKeys.all, 'search', query],
  balance: (id) => [...customerKeys.detail(id), 'balance'],
  salesHistory: (id, params) => [...customerKeys.detail(id), 'sales', params],
};

/**
 * Hook to get paginated list of customers
 * @param {Object} params - Query parameters
 * @param {Object} options - React Query options
 */
export const useCustomers = (params = {}, options = {}) => {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => customerService.getAll(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

/**
 * Hook to get customer details by ID
 * @param {number} id - Customer ID
 * @param {Object} options - React Query options
 */
export const useCustomer = (id, options = {}) => {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => customerService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to search customers (for autocomplete)
 * @param {string} query - Search query
 * @param {Object} options - React Query options
 */
export const useSearchCustomers = (query, options = {}) => {
  return useQuery({
    queryKey: customerKeys.search(query),
    queryFn: () => customerService.search(query),
    enabled: query.length >= 2, // Only search with 2+ characters
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options,
  });
};

/**
 * Hook to get customer balance information
 * @param {number} id - Customer ID
 * @param {Object} options - React Query options
 */
export const useCustomerBalance = (id, options = {}) => {
  return useQuery({
    queryKey: customerKeys.balance(id),
    queryFn: () => customerService.getBalance(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute - balance changes frequently
    ...options,
  });
};

/**
 * Hook to get customer sales history
 * @param {number} id - Customer ID
 * @param {Object} params - Query parameters
 * @param {Object} options - React Query options
 */
export const useCustomerSalesHistory = (id, params = {}, options = {}) => {
  return useQuery({
    queryKey: customerKeys.salesHistory(id, params),
    queryFn: () => customerService.getSalesHistory(id, params),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to create a new customer
 * @param {Object} options - Mutation options
 */
export const useCreateCustomer = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => customerService.create(data),
    onSuccess: (response, variables) => {
      // Invalidate and refetch customer lists
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });

      // Show success message
      toast.success('Cliente creado exitosamente');

      // Call user-provided onSuccess if exists
      options.onSuccess?.(response, variables);
    },
    onError: (error, variables) => {
      // Show error message
      const errorMessage = error.response?.data?.message || 'Error al crear el cliente';
      toast.error(errorMessage);

      // Call user-provided onError if exists
      options.onError?.(error, variables);
    },
    ...options,
  });
};

/**
 * Hook to update an existing customer
 * @param {Object} options - Mutation options
 */
export const useUpdateCustomer = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => customerService.update(id, data),
    onSuccess: (response, variables) => {
      // Invalidate specific customer and lists
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });

      // Show success message
      toast.success('Cliente actualizado exitosamente');

      // Call user-provided onSuccess if exists
      options.onSuccess?.(response, variables);
    },
    onError: (error, variables) => {
      // Show error message
      const errorMessage = error.response?.data?.message || 'Error al actualizar el cliente';
      toast.error(errorMessage);

      // Call user-provided onError if exists
      options.onError?.(error, variables);
    },
    ...options,
  });
};

/**
 * Hook to delete a customer
 * @param {Object} options - Mutation options
 */
export const useDeleteCustomer = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => customerService.delete(id),
    onSuccess: (response, id) => {
      // Remove from cache and invalidate lists
      queryClient.removeQueries({ queryKey: customerKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });

      // Show success message
      toast.success('Cliente eliminado exitosamente');

      // Call user-provided onSuccess if exists
      options.onSuccess?.(response, id);
    },
    onError: (error, id) => {
      // Show error message
      const errorMessage = error.response?.data?.message || 'Error al eliminar el cliente';
      toast.error(errorMessage);

      // Call user-provided onError if exists
      options.onError?.(error, id);
    },
    ...options,
  });
};

/**
 * Hook to prefetch customer data (useful for hovering/navigation)
 * @returns {Function} Prefetch function
 */
export const usePrefetchCustomer = () => {
  const queryClient = useQueryClient();

  return (id) => {
    queryClient.prefetchQuery({
      queryKey: customerKeys.detail(id),
      queryFn: () => customerService.getById(id),
      staleTime: 5 * 60 * 1000,
    });
  };
};
