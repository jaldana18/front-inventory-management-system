import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salesService } from '../services/sales.service';
import toast from 'react-hot-toast';

// Query keys for cache management
export const saleKeys = {
  all: ['sales'],
  lists: () => [...saleKeys.all, 'list'],
  list: (params) => [...saleKeys.lists(), params],
  details: () => [...saleKeys.all, 'detail'],
  detail: (id) => [...saleKeys.details(), id],
  summary: (params) => [...saleKeys.all, 'summary', params],
  validation: (items, warehouseId) => [...saleKeys.all, 'validation', items, warehouseId],
};

/**
 * Hook to get paginated list of sales
 * @param {Object} params - Query parameters
 * @param {Object} options - React Query options
 */
export const useSales = (params = {}, options = {}) => {
  return useQuery({
    queryKey: saleKeys.list(params),
    queryFn: () => salesService.getAll(params),
    staleTime: 1 * 60 * 1000, // 1 minute - sales change frequently
    ...options,
  });
};

/**
 * Hook to get sale details by ID
 * @param {number} id - Sale ID
 * @param {Object} options - React Query options
 */
export const useSale = (id, options = {}) => {
  return useQuery({
    queryKey: saleKeys.detail(id),
    queryFn: () => salesService.getById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

/**
 * Hook to get sales summary/statistics
 * @param {Object} params - Filter parameters
 * @param {Object} options - React Query options
 */
export const useSalesSummary = (params = {}, options = {}) => {
  return useQuery({
    queryKey: saleKeys.summary(params),
    queryFn: () => salesService.getSummary(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to validate stock availability
 * @param {Array} items - Items to validate
 * @param {number} warehouseId - Warehouse ID
 * @param {Object} options - React Query options
 */
export const useValidateStock = (items, warehouseId, options = {}) => {
  return useQuery({
    queryKey: saleKeys.validation(items, warehouseId),
    queryFn: () => salesService.validateStock(items, warehouseId),
    enabled: items.length > 0 && !!warehouseId,
    staleTime: 30 * 1000, // 30 seconds - stock changes quickly
    ...options,
  });
};

/**
 * Hook to create a new sale
 * @param {Object} options - Mutation options
 */
export const useCreateSale = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => salesService.create(data),
    onSuccess: (response, variables) => {
      // Invalidate sales lists
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: saleKeys.summary() });

      // Show success message
      toast.success(`Venta ${response.data.saleNumber} creada exitosamente`);

      // Call user-provided onSuccess if exists
      options.onSuccess?.(response, variables);
    },
    onError: (error, variables) => {
      // Show error message
      const errorMessage = error.response?.data?.message || 'Error al crear la venta';
      toast.error(errorMessage);

      // Call user-provided onError if exists
      options.onError?.(error, variables);
    },
    ...options,
  });
};

/**
 * Hook to update a sale (only draft status)
 * @param {Object} options - Mutation options
 */
export const useUpdateSale = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => salesService.update(id, data),
    onSuccess: (response, variables) => {
      // Invalidate specific sale and lists
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });

      // Show success message
      toast.success('Venta actualizada exitosamente');

      // Call user-provided onSuccess if exists
      options.onSuccess?.(response, variables);
    },
    onError: (error, variables) => {
      // Show error message
      const errorMessage = error.response?.data?.message || 'Error al actualizar la venta';
      toast.error(errorMessage);

      // Call user-provided onError if exists
      options.onError?.(error, variables);
    },
    ...options,
  });
};

/**
 * Hook to confirm a sale (validates stock and affects inventory)
 * @param {Object} options - Mutation options
 */
export const useConfirmSale = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => salesService.confirm(id),
    onMutate: async (id) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: saleKeys.detail(id) });

      // Snapshot previous value
      const previousSale = queryClient.getQueryData(saleKeys.detail(id));

      // Optimistically update to confirmed status
      queryClient.setQueryData(saleKeys.detail(id), (old) => ({
        ...old,
        data: {
          ...old?.data,
          status: 'confirmed',
        },
      }));

      return { previousSale };
    },
    onSuccess: (response, id) => {
      // Invalidate sale, lists, and inventory
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: saleKeys.summary() });
      queryClient.invalidateQueries({ queryKey: ['inventory'] }); // Invalidate inventory

      // Show success message
      toast.success('Venta confirmada exitosamente');

      // Call user-provided onSuccess if exists
      options.onSuccess?.(response, id);
    },
    onError: (error, id, context) => {
      // Rollback on error
      if (context?.previousSale) {
        queryClient.setQueryData(saleKeys.detail(id), context.previousSale);
      }

      // Show error message
      const errorMessage = error.response?.data?.message || 'Error al confirmar la venta';
      toast.error(errorMessage);

      // Call user-provided onError if exists
      options.onError?.(error, id, context);
    },
    ...options,
  });
};

/**
 * Hook to cancel a sale
 * @param {Object} options - Mutation options
 */
export const useCancelSale = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => salesService.cancel(id),
    onSuccess: (response, id) => {
      // Invalidate sale, lists, and inventory
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: saleKeys.summary() });
      queryClient.invalidateQueries({ queryKey: ['inventory'] }); // Invalidate inventory

      // Show success message
      toast.success('Venta cancelada exitosamente');

      // Call user-provided onSuccess if exists
      options.onSuccess?.(response, id);
    },
    onError: (error, id) => {
      // Show error message
      const errorMessage = error.response?.data?.message || 'Error al cancelar la venta';
      toast.error(errorMessage);

      // Call user-provided onError if exists
      options.onError?.(error, id);
    },
    ...options,
  });
};

/**
 * Hook to convert quote to invoice
 * @param {Object} options - Mutation options
 */
export const useConvertToInvoice = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => salesService.convertToInvoice(id),
    onSuccess: (response, id) => {
      // Invalidate original quote and lists
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });

      // Show success message
      toast.success(`Factura ${response.data.saleNumber} creada desde cotización`);

      // Call user-provided onSuccess if exists
      options.onSuccess?.(response, id);
    },
    onError: (error, id) => {
      // Show error message
      const errorMessage = error.response?.data?.message || 'Error al convertir a factura';
      toast.error(errorMessage);

      // Call user-provided onError if exists
      options.onError?.(error, id);
    },
    ...options,
  });
};

/**
 * Hook to create credit note
 * @param {Object} options - Mutation options
 */
export const useCreateCreditNote = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }) => salesService.createCreditNote(id, reason),
    onSuccess: (response, variables) => {
      // Invalidate original sale, lists, and inventory
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: saleKeys.summary() });
      queryClient.invalidateQueries({ queryKey: ['inventory'] }); // Invalidate inventory

      // Show success message
      toast.success(`Nota de crédito ${response.data.saleNumber} creada exitosamente`);

      // Call user-provided onSuccess if exists
      options.onSuccess?.(response, variables);
    },
    onError: (error, variables) => {
      // Show error message
      const errorMessage = error.response?.data?.message || 'Error al crear nota de crédito';
      toast.error(errorMessage);

      // Call user-provided onError if exists
      options.onError?.(error, variables);
    },
    ...options,
  });
};

/**
 * Hook to dispatch a sale
 * @param {Object} options - Mutation options
 */
export const useDispatchSale = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => salesService.dispatch(id, data),
    onSuccess: (response, variables) => {
      // Invalidate sale and lists
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });

      // Show success message
      toast.success('Venta marcada como despachada');

      // Call user-provided onSuccess if exists
      options.onSuccess?.(response, variables);
    },
    onError: (error, variables) => {
      // Show error message
      const errorMessage = error.response?.data?.message || 'Error al despachar la venta';
      toast.error(errorMessage);

      // Call user-provided onError if exists
      options.onError?.(error, variables);
    },
    ...options,
  });
};

/**
 * Hook to deliver a sale
 * @param {Object} options - Mutation options
 */
export const useDeliverSale = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => salesService.deliver(id, data),
    onSuccess: (response, variables) => {
      // Invalidate sale and lists
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });

      // Show success message
      toast.success('Venta marcada como entregada');

      // Call user-provided onSuccess if exists
      options.onSuccess?.(response, variables);
    },
    onError: (error, variables) => {
      // Show error message
      const errorMessage = error.response?.data?.message || 'Error al marcar como entregada';
      toast.error(errorMessage);

      // Call user-provided onError if exists
      options.onError?.(error, variables);
    },
    ...options,
  });
};

/**
 * Hook to create remission
 * @param {Object} options - Mutation options
 */
export const useCreateRemission = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => salesService.createRemission(data),
    onSuccess: (response, variables) => {
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: saleKeys.summary() });

      // Show success message
      toast.success(`Remisión ${response.data.saleNumber} creada exitosamente`);

      // Call user-provided onSuccess if exists
      options.onSuccess?.(response, variables);
    },
    onError: (error, variables) => {
      // Show error message
      const errorMessage = error.response?.data?.message || 'Error al crear la remisión';
      toast.error(errorMessage);

      // Call user-provided onError if exists
      options.onError?.(error, variables);
    },
    ...options,
  });
};
