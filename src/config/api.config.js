import ENV_CONFIG from './env.config';

export const API_CONFIG = {
  baseURL: ENV_CONFIG.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const API_ENDPOINTS = {
  // ==================== AUTHENTICATION ====================
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
  },

  // ==================== PRODUCTS ====================
  products: {
    list: '/products',
    create: '/products',
    getById: (id) => `/products/${id}`,
    update: (id) => `/products/${id}`,
    delete: (id) => `/products/${id}`,
    categories: '/products/categories',
    search: (query) => `/products/search?query=${query}`,
    // Bulk operations
    bulkUpload: '/products/bulk/upload',
    bulkValidate: '/products/bulk/validate',
    bulkPreview: '/products/bulk/preview',
    bulkTemplate: '/products/bulk/template',
  },

  // ==================== WAREHOUSES ====================
  warehouses: {
    list: '/warehouses',
    create: '/warehouses',
    getById: (id) => `/warehouses/${id}`,
    update: (id) => `/warehouses/${id}`,
    delete: (id) => `/warehouses/${id}`,
  },

  // ==================== INVENTORY TRANSACTIONS ====================
  transactions: {
    list: '/inventory/transactions',
    create: '/inventory/transactions',
    getById: (id) => `/inventory/transactions/${id}`,
    summary: '/inventory/transactions/summary',
    byProduct: (productId) => `/inventory/transactions/product/${productId}`,
  },

  // ==================== INVENTORY - STOCK MANAGEMENT ====================
  inventory: {
    // Get current stock for a product
    getStock: (productId) => `/inventory/stock/${productId}`,
    // Adjust stock level directly
    adjust: '/inventory/adjust-stock',
    // Transfer stock between warehouses
    transfer: '/inventory/transfer',
    // Get low stock products
    lowStock: '/products?lowStock=true',
    // Get inventory summary - uses analytics dashboard
    summary: '/analytics/inventory/status',
    // Get all inventory with pagination - lists products with current stock
    list: '/products',
    // Bulk operations
    bulkUpload: '/inventory/bulk/upload',
    bulkValidate: '/inventory/bulk/validate',
    bulkPreview: '/inventory/bulk/preview',
    bulkTemplate: '/inventory/bulk/template',
  },

  // ==================== COMPANIES ====================
  companies: {
    list: '/companies',
    create: '/companies',
    getById: (id) => `/companies/${id}`,
    update: (id) => `/companies/${id}`,
    delete: (id) => `/companies/${id}`,
    current: '/companies/me', // Current user's company
  },

  // ==================== USERS ====================
  users: {
    list: '/users',
    create: '/users',
    getById: (id) => `/users/${id}`,
    update: (id) => `/users/${id}`,
    delete: (id) => `/users/${id}`,
    stats: '/users/stats', // User statistics
    me: '/users/me', // Current user
    updateMe: '/users/me',
  },

  // ==================== REPORTS ====================
  reports: {
    inventory: '/reports/inventory',
    stockMovement: '/reports/stock-movement',
    lowStockReport: '/reports/low-stock',
    categoryReport: '/reports/by-category',
  },

  // ==================== ANALYTICS ====================
  analytics: {
    dashboard: '/analytics/dashboard',
    salesTimeline: '/analytics/sales/timeline',
    salesComparison: '/analytics/sales/comparison',
    topProducts: '/analytics/products/top-selling',
    categoryPerformance: '/analytics/categories/performance',
    inventoryStatus: '/analytics/inventory/status',
  },

  // ==================== INVOICES ====================
  invoices: {
    list: '/invoices',
    create: '/invoices',
    getById: (id) => `/invoices/${id}`,
    update: (id) => `/invoices/${id}`,
    delete: (id) => `/invoices/${id}`,
    summary: '/invoices/summary',
    updatePaymentStatus: (id) => `/invoices/${id}/payment-status`,
    exportPDF: (id) => `/invoices/${id}/pdf`,
    sendEmail: (id) => `/invoices/${id}/send-email`,
  },

  // ==================== CUSTOMERS ====================
  customers: {
    list: '/customers',
    create: '/customers',
    getById: (id) => `/customers/${id}`,
    update: (id) => `/customers/${id}`,
    delete: (id) => `/customers/${id}`,
    search: '/customers/search',
  },

  // ==================== SALES ====================
  sales: {
    list: '/sales',
    create: '/sales',
    getById: (id) => `/sales/${id}`,
    update: (id) => `/sales/${id}`,
    confirm: (id) => `/sales/${id}/confirm`,
    cancel: (id) => `/sales/${id}/cancel`,
    convertToInvoice: (id) => `/sales/${id}/convert-to-invoice`,
    createCreditNote: (id) => `/sales/${id}/credit-note`,
    dispatch: (id) => `/sales/${id}/dispatch`,
    deliver: (id) => `/sales/${id}/deliver`,
    remission: '/sales/remission',
  },

  // ==================== PAYMENTS ====================
  payments: {
    list: '/payments',
    create: '/payments',
    getBySale: (saleId) => `/payments/sale/${saleId}`,
    refund: (id) => `/payments/${id}/refund`,
    summary: '/payments/summary',
  },

  // ==================== PAYMENT METHODS ====================
  paymentMethods: {
    list: '/payment-methods',
    getById: (id) => `/payment-methods/${id}`,
  },

  // ==================== CATEGORIES ====================
  categories: {
    list: '/categories',
    active: '/categories/active',
    getById: (id) => `/categories/${id}`,
    create: '/categories',
    update: (id) => `/categories/${id}`,
    delete: (id) => `/categories/${id}`,
  },

  // ==================== UNITS OF MEASURE ====================
  unitsOfMeasure: {
    list: '/units-of-measure',
    active: '/units-of-measure/active',
    getById: (id) => `/units-of-measure/${id}`,
    create: '/units-of-measure',
    update: (id) => `/units-of-measure/${id}`,
    delete: (id) => `/units-of-measure/${id}`,
  },
};
