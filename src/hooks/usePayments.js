import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '../services/payment.service';
import { saleKeys } from './useSales';
import toast from 'react-hot-toast';

// Query keys for cache management
export const paymentKeys = {
  all: ['payments'],
  lists: () => [...paymentKeys.all, 'list'],
  list: (params) => [...paymentKeys.lists(), params],
  bySale: (saleId) => [...paymentKeys.all, 'bySale', saleId],
  summary: (params) => [...paymentKeys.all, 'summary', params],
  statistics: (period) => [...paymentKeys.all, 'statistics', period],
};

/**
 * Hook to get paginated list of payments
 * @param {Object} params - Query parameters
 * @param {Object} options - React Query options
 */
export const usePayments = (params = {}, options = {}) => {
  return useQuery({
    queryKey: paymentKeys.list(params),
    queryFn: () => paymentService.getAll(params),
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options,
  });
};

/**
 * Hook to get all payments for a specific sale
 * @param {number} saleId - Sale ID
 * @param {Object} options - React Query options
 */
export const usePaymentsBySale = (saleId, options = {}) => {
  return useQuery({
    queryKey: paymentKeys.bySale(saleId),
    queryFn: () => paymentService.getBySaleId(saleId),
    enabled: !!saleId,
    staleTime: 30 * 1000, // 30 seconds - payments change frequently
    ...options,
  });
};

/**
 * Hook to get payment summary/statistics
 * @param {Object} params - Filter parameters
 * @param {Object} options - React Query options
 */
export const usePaymentSummary = (params = {}, options = {}) => {
  return useQuery({
    queryKey: paymentKeys.summary(params),
    queryFn: () => paymentService.getSummary(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to get payment statistics for dashboard
 * @param {string} period - Period: today, week, month, year
 * @param {Object} options - React Query options
 */
export const usePaymentStatistics = (period = 'month', options = {}) => {
  return useQuery({
    queryKey: paymentKeys.statistics(period),
    queryFn: () => paymentService.getStatistics(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to create a new payment
 * @param {Object} options - Mutation options
 */
export const useCreatePayment = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => paymentService.create(data),
    onMutate: async (newPayment) => {
      // Cancel outgoing queries for the sale
      await queryClient.cancelQueries({ queryKey: saleKeys.detail(newPayment.saleId) });
      await queryClient.cancelQueries({ queryKey: paymentKeys.bySale(newPayment.saleId) });

      // Snapshot previous values
      const previousSale = queryClient.getQueryData(saleKeys.detail(newPayment.saleId));
      const previousPayments = queryClient.getQueryData(paymentKeys.bySale(newPayment.saleId));

      // Optimistically update sale balance
      queryClient.setQueryData(saleKeys.detail(newPayment.saleId), (old) => {
        if (!old?.data) return old;

        const newBalance = old.data.balance - newPayment.amount;
        const newPaidAmount = (old.data.paidAmount || 0) + newPayment.amount;

        let newPaymentStatus = 'pending';
        if (newBalance <= 0) {
          newPaymentStatus = 'paid';
        } else if (newPaidAmount > 0) {
          newPaymentStatus = 'partial';
        }

        return {
          ...old,
          data: {
            ...old.data,
            balance: newBalance,
            paidAmount: newPaidAmount,
            paymentStatus: newPaymentStatus,
          },
        };
      });

      // Optimistically add payment to list
      queryClient.setQueryData(paymentKeys.bySale(newPayment.saleId), (old) => {
        if (!old?.data) return old;

        const optimisticPayment = {
          id: 'temp-' + Date.now(),
          amount: newPayment.amount,
          paymentDate: newPayment.paymentDate || new Date().toISOString(),
          status: 'completed',
          paymentMethod: { id: newPayment.paymentMethodId },
        };

        return {
          ...old,
          data: [...(old.data || []), optimisticPayment],
        };
      });

      return { previousSale, previousPayments };
    },
    onSuccess: (response, variables, context) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(variables.saleId) });
      queryClient.invalidateQueries({ queryKey: paymentKeys.bySale(variables.saleId) });
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.summary() });
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });

      // Show success message
      toast.success(`Pago de ${formatCurrency(variables.amount)} registrado exitosamente`);

      // Call user-provided onSuccess if exists
      options.onSuccess?.(response, variables, context);
    },
    onError: (error, variables, context) => {
      // Rollback optimistic updates
      if (context?.previousSale) {
        queryClient.setQueryData(saleKeys.detail(variables.saleId), context.previousSale);
      }
      if (context?.previousPayments) {
        queryClient.setQueryData(paymentKeys.bySale(variables.saleId), context.previousPayments);
      }

      // Show error message
      const errorMessage = error.response?.data?.message || 'Error al registrar el pago';
      toast.error(errorMessage);

      // Call user-provided onError if exists
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};

/**
 * Hook to refund a payment
 * @param {Object} options - Mutation options
 */
export const useRefundPayment = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }) => paymentService.refund(id, reason),
    onSuccess: (response, variables) => {
      // Invalidate all payment and sale queries
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      queryClient.invalidateQueries({ queryKey: saleKeys.all });

      // Show success message
      toast.success('Pago reembolsado exitosamente');

      // Call user-provided onSuccess if exists
      options.onSuccess?.(response, variables);
    },
    onError: (error, variables) => {
      // Show error message
      const errorMessage = error.response?.data?.message || 'Error al reembolsar el pago';
      toast.error(errorMessage);

      // Call user-provided onError if exists
      options.onError?.(error, variables);
    },
    ...options,
  });
};

/**
 * Hook to validate payment amount
 * Custom hook for form validation
 * @param {number} saleId - Sale ID
 * @param {number} amount - Payment amount
 * @param {Object} options - React Query options
 */
export const useValidatePaymentAmount = (saleId, amount, options = {}) => {
  return useQuery({
    queryKey: [...paymentKeys.all, 'validate', saleId, amount],
    queryFn: () => paymentService.validatePaymentAmount(saleId, amount),
    enabled: !!saleId && amount > 0,
    staleTime: 0, // Always fresh for validation
    ...options,
  });
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Helper to format currency
 * @param {number} value - Amount to format
 * @returns {string} Formatted currency
 */
const formatCurrency = (value) => {
  if (!value && value !== 0) return '$0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Hook to calculate payment distribution
 * Useful for showing payment breakdown in UI
 * @param {number} saleTotal - Total sale amount
 * @param {Array} payments - Array of payment objects
 * @returns {Object} Payment distribution calculation
 */
export const usePaymentDistribution = (saleTotal, payments = []) => {
  return useQuery({
    queryKey: [...paymentKeys.all, 'distribution', saleTotal, payments.length],
    queryFn: () => {
      const paymentAmounts = payments.map((p) => p.amount);
      return paymentService.calculatePaymentDistribution(saleTotal, paymentAmounts);
    },
    enabled: saleTotal > 0,
    staleTime: Infinity, // Pure calculation, no need to refetch
  });
};
