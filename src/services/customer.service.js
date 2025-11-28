import apiClient from './api.service';
import { API_ENDPOINTS } from '../config/api.config';

export const customerService = {
  /**
   * Get all customers with pagination and filters
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 10)
   * @param {string} params.search - Search term (name, document, code)
   * @param {string} params.type - Customer type filter (retail, wholesale, vip, distributor)
   * @param {boolean} params.isActive - Active status filter
   */
  getAll: async (params = {}) => {
    return apiClient.get(API_ENDPOINTS.customers.list, { params });
  },

  /**
   * Get customer by ID with full details
   * @param {number} id - Customer ID
   */
  getById: async (id) => {
    return apiClient.get(API_ENDPOINTS.customers.getById(id));
  },

  /**
   * Create a new customer
   * @param {Object} data - Customer data
   * @param {string} data.documentType - Document type (CC, NIT, CE, PASSPORT)
   * @param {string} data.documentNumber - Document number (unique)
   * @param {string} data.name - Customer full name or business name
   * @param {string} [data.code] - Customer code (auto-generated if not provided)
   * @param {string} [data.email] - Email address
   * @param {string} [data.phone] - Phone number
   * @param {string} [data.address] - Full address
   * @param {string} [data.city] - City name
   * @param {string} [data.state] - State/Department name
   * @param {string} [data.zipCode] - Postal code
   * @param {number} [data.creditLimit=0] - Credit limit amount
   * @param {string} [data.customerType='retail'] - Customer type (retail, wholesale, vip, distributor)
   * @param {boolean} [data.taxResponsible=false] - Tax responsible flag
   * @param {string} [data.notes] - Additional notes
   * @param {Object} [data.metadata] - Additional metadata
   */
  create: async (data) => {
    return apiClient.post(API_ENDPOINTS.customers.create, data);
  },

  /**
   * Update existing customer
   * @param {number} id - Customer ID
   * @param {Object} data - Customer data to update
   */
  update: async (id, data) => {
    return apiClient.put(API_ENDPOINTS.customers.update(id), data);
  },

  /**
   * Delete customer (soft delete)
   * @param {number} id - Customer ID
   */
  delete: async (id) => {
    return apiClient.delete(API_ENDPOINTS.customers.delete(id));
  },

  /**
   * Search customers by query
   * @param {string} query - Search query
   * @returns {Promise} List of matching customers for autocomplete
   */
  search: async (query) => {
    return apiClient.get(API_ENDPOINTS.customers.search, {
      params: { q: query },
    });
  },

  /**
   * Get customer balance and credit information
   * @param {number} id - Customer ID
   */
  getBalance: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.customers.getById(id));
    return {
      creditLimit: response.data?.creditLimit || 0,
      currentBalance: response.data?.currentBalance || 0,
      availableCredit: (response.data?.creditLimit || 0) - (response.data?.currentBalance || 0),
    };
  },

  /**
   * Get customer sales history
   * @param {number} id - Customer ID
   * @param {Object} params - Query parameters for sales filtering
   */
  getSalesHistory: async (id, params = {}) => {
    return apiClient.get(`/customers/${id}/sales`, { params });
  },
};

export default customerService;
