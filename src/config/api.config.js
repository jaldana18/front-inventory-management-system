export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const API_ENDPOINTS = {
  // Authentication
  login: '/auth/login',
  logout: '/auth/logout',
  refresh: '/auth/refresh',

  // Inventory
  inventory: '/inventory',
  inventoryById: (id) => `/inventory/${id}`,
  inventorySearch: '/inventory/search',
  inventoryLowStock: '/inventory/low-stock',

  // Products
  products: '/products',
  productById: (id) => `/products/${id}`,
  productCategories: '/products/categories',

  // Suppliers
  suppliers: '/suppliers',
  supplierById: (id) => `/suppliers/${id}`,

  // Orders
  orders: '/orders',
  orderById: (id) => `/orders/${id}`,

  // Reports
  reports: '/reports',
  reportsInventory: '/reports/inventory',
  reportsSales: '/reports/sales',
};
