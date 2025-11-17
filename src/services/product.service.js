import axios from 'axios';
import apiClient from './api.service';
import { API_ENDPOINTS, API_CONFIG } from '../config/api.config';

export const productService = {
  // Get all products with pagination
  getAll: async (params = {}) => {
    return apiClient.get(API_ENDPOINTS.products.list, { params });
  },

  // Get product by ID
  getById: async (id) => {
    return apiClient.get(API_ENDPOINTS.products.getById(id));
  },

  // Create a new product
  create: async (data) => {
    // Expected data: { sku, name, description?, category?, price, cost?, minimumStock?, unit, metadata? }
    return apiClient.post(API_ENDPOINTS.products.create, data);
  },

  // Update product
  update: async (id, data) => {
    return apiClient.put(API_ENDPOINTS.products.update(id), data);
  },

  // Delete product
  delete: async (id) => {
    return apiClient.delete(API_ENDPOINTS.products.delete(id));
  },

  // Get all product categories
  getCategories: async () => {
    return apiClient.get(API_ENDPOINTS.products.categories);
  },

  // Search products
  search: async (query) => {
    return apiClient.get(API_ENDPOINTS.products.search(query));
  },

  // ==================== BULK OPERATIONS ====================

  // Upload bulk products from Excel file
  bulkUpload: async (file, options = {}) => {
    const formData = new FormData();
    formData.append('file', file);

    if (options.updateExisting !== undefined) {
      formData.append('updateExisting', options.updateExisting.toString());
    }
    if (options.skipErrors !== undefined) {
      formData.append('skipErrors', options.skipErrors.toString());
    }
    if (options.dryRun !== undefined) {
      formData.append('dryRun', options.dryRun.toString());
    }

    return apiClient.post(API_ENDPOINTS.products.bulkUpload, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Validate Excel file structure
  bulkValidate: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.post(API_ENDPOINTS.products.bulkValidate, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Preview bulk upload without saving
  bulkPreview: async (file, updateExisting = false) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('updateExisting', updateExisting.toString());

    return apiClient.post(API_ENDPOINTS.products.bulkPreview, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Download Excel template
  downloadTemplate: async () => {
    // Use axios directly to avoid the response interceptor that returns response.data
    const token = localStorage.getItem('accessToken');

    const response = await axios.get(
      `${API_CONFIG.baseURL}${API_ENDPOINTS.products.bulkTemplate}`,
      {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'plantilla-productos.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return response;
  },
};
