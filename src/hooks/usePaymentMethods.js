import { useQuery } from '@tanstack/react-query';
import { paymentMethodService } from '../services/paymentMethod.service';

// Query keys for cache management
export const paymentMethodKeys = {
  all: ['paymentMethods'],
  lists: () => [...paymentMethodKeys.all, 'list'],
  list: (params) => [...paymentMethodKeys.lists(), params],
  details: () => [...paymentMethodKeys.all, 'detail'],
  detail: (id) => [...paymentMethodKeys.details(), id],
  active: () => [...paymentMethodKeys.all, 'active'],
  config: (id) => [...paymentMethodKeys.detail(id), 'config'],
};

/**
 * Hook to get all payment methods
 * @param {Object} params - Query parameters
 * @param {Object} options - React Query options
 */
export const usePaymentMethods = (params = {}, options = {}) => {
  return useQuery({
    queryKey: paymentMethodKeys.list(params),
    queryFn: () => paymentMethodService.getAll(params),
    staleTime: 10 * 60 * 1000, // 10 minutes - payment methods rarely change
    ...options,
  });
};

/**
 * Hook to get payment method by ID
 * @param {number} id - Payment method ID
 * @param {Object} options - React Query options
 */
export const usePaymentMethod = (id, options = {}) => {
  return useQuery({
    queryKey: paymentMethodKeys.detail(id),
    queryFn: () => paymentMethodService.getById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

/**
 * Hook to get active payment methods for selectors
 * Optimized for dropdown components
 * @param {Object} options - React Query options
 */
export const useActivePaymentMethods = (options = {}) => {
  return useQuery({
    queryKey: paymentMethodKeys.active(),
    queryFn: () => paymentMethodService.getActiveForSelector(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

/**
 * Hook to get payment method configuration
 * Returns UI configuration (icon, color, placeholder, etc.)
 * @param {number} id - Payment method ID
 * @param {Object} options - React Query options
 */
export const usePaymentMethodConfig = (id, options = {}) => {
  return useQuery({
    queryKey: paymentMethodKeys.config(id),
    queryFn: () => paymentMethodService.getConfig(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

/**
 * Hook to check if payment method requires reference
 * @param {number} id - Payment method ID
 * @param {Object} options - React Query options
 */
export const useRequiresReference = (id, options = {}) => {
  return useQuery({
    queryKey: [...paymentMethodKeys.detail(id), 'requiresReference'],
    queryFn: () => paymentMethodService.requiresReference(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

// ==================== HELPER HOOKS ====================

/**
 * Custom hook to get payment method by code
 * Useful when you have the code but need the full method object
 * @param {string} code - Payment method code
 * @param {Object} options - React Query options
 */
export const usePaymentMethodByCode = (code, options = {}) => {
  const { data: methods } = useActivePaymentMethods();

  return useQuery({
    queryKey: [...paymentMethodKeys.all, 'byCode', code],
    queryFn: () => {
      const method = methods?.find((m) => m.code === code);
      if (!method) {
        throw new Error(`Payment method with code "${code}" not found`);
      }
      return method;
    },
    enabled: !!code && !!methods,
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

/**
 * Custom hook to get payment methods grouped by category
 * Useful for complex payment method selectors
 * @param {Object} options - React Query options
 */
export const usePaymentMethodsGrouped = (options = {}) => {
  const { data: methods } = useActivePaymentMethods();

  return useQuery({
    queryKey: [...paymentMethodKeys.all, 'grouped'],
    queryFn: () => {
      if (!methods) return null;

      // Group by whether they require reference
      const withReference = methods.filter((m) => m.requiresReference);
      const withoutReference = methods.filter((m) => !m.requiresReference);

      return {
        withReference,
        withoutReference,
        all: methods,
      };
    },
    enabled: !!methods,
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

/**
 * Custom hook to validate reference format
 * Returns validation function for form validation
 * @param {number} paymentMethodId - Payment method ID
 */
export const useReferenceValidator = (paymentMethodId) => {
  const { data: method } = usePaymentMethod(paymentMethodId);

  const validate = (reference) => {
    if (!method) return { isValid: true };

    if (!method.requiresReference) {
      return { isValid: true };
    }

    return paymentMethodService.validateReference(method.code, reference);
  };

  return {
    validate,
    isRequired: method?.requiresReference || false,
    placeholder: method ? paymentMethodService.getReferencePlaceholder(method.code) : '',
  };
};
