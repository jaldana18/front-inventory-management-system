import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

/**
 * Zustand Store for Sales Module
 *
 * Manages client-side state for:
 * - Filters and pagination
 * - UI state (dialogs, selected items)
 * - Temporary form data
 * - User preferences
 *
 * NOTE: Server state (customers, sales, payments) is managed by TanStack Query hooks
 */

const initialState = {
  // ==================== CUSTOMERS ====================
  customers: {
    filters: {
      search: '',
      documentType: '',
      customerType: '',
      isActive: null,
    },
    pagination: {
      page: 1,
      pageSize: 10,
      total: 0,
    },
    selectedCustomer: null,
    dialogOpen: false,
    detailDialogOpen: false,
  },

  // ==================== SALES ====================
  sales: {
    filters: {
      search: '',
      saleType: '', // invoice, quote, remission, credit_note
      status: '', // draft, confirmed, cancelled
      paymentStatus: '', // pending, partial, paid
      warehouseId: null,
      customerId: null,
      dateFrom: null,
      dateTo: null,
    },
    pagination: {
      page: 1,
      pageSize: 10,
      total: 0,
    },
    selectedSale: null,
    dialogOpen: false,
    detailDialogOpen: false,
    activeTab: 'invoice', // invoice, quote, remission, credit_note
  },

  // ==================== PAYMENTS ====================
  payments: {
    filters: {
      search: '',
      paymentMethodId: null,
      status: '', // completed, refunded, pending
      dateFrom: null,
      dateTo: null,
    },
    pagination: {
      page: 1,
      pageSize: 10,
      total: 0,
    },
    selectedPayment: null,
    dialogOpen: false,
    saleIdForPayment: null, // When creating payment from sale detail
  },

  // ==================== SALE FORM (DRAFT) ====================
  saleForm: {
    saleType: 'invoice',
    customerId: null,
    warehouseId: null,
    items: [], // { productId, productName, quantity, price, tax, discount, subtotal }
    subtotal: 0,
    totalTax: 0,
    totalDiscount: 0,
    total: 0,
    notes: '',
    isDraft: true,
  },

  // ==================== UI PREFERENCES ====================
  preferences: {
    defaultWarehouseId: null,
    defaultSaleType: 'invoice',
    showStockWarnings: true,
    autoCalculateTotals: true,
  },
};

export const useSalesStore = create(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // ==================== CUSTOMERS ACTIONS ====================
        setCustomerFilters: (filters) =>
          set(
            (state) => ({
              customers: {
                ...state.customers,
                filters: { ...state.customers.filters, ...filters },
                pagination: { ...state.customers.pagination, page: 1 }, // Reset page
              },
            }),
            false,
            'setCustomerFilters'
          ),

        resetCustomerFilters: () =>
          set(
            (state) => ({
              customers: {
                ...state.customers,
                filters: initialState.customers.filters,
                pagination: { ...state.customers.pagination, page: 1 },
              },
            }),
            false,
            'resetCustomerFilters'
          ),

        setCustomerPagination: (pagination) =>
          set(
            (state) => ({
              customers: {
                ...state.customers,
                pagination: { ...state.customers.pagination, ...pagination },
              },
            }),
            false,
            'setCustomerPagination'
          ),

        setSelectedCustomer: (customer) =>
          set(
            (state) => ({
              customers: { ...state.customers, selectedCustomer: customer },
            }),
            false,
            'setSelectedCustomer'
          ),

        setCustomerDialogOpen: (isOpen) =>
          set(
            (state) => ({
              customers: {
                ...state.customers,
                dialogOpen: isOpen,
                selectedCustomer: isOpen ? state.customers.selectedCustomer : null,
              },
            }),
            false,
            'setCustomerDialogOpen'
          ),

        setCustomerDetailDialogOpen: (isOpen) =>
          set(
            (state) => ({
              customers: {
                ...state.customers,
                detailDialogOpen: isOpen,
                selectedCustomer: isOpen ? state.customers.selectedCustomer : null,
              },
            }),
            false,
            'setCustomerDetailDialogOpen'
          ),

        // ==================== SALES ACTIONS ====================
        setSaleFilters: (filters) =>
          set(
            (state) => ({
              sales: {
                ...state.sales,
                filters: { ...state.sales.filters, ...filters },
                pagination: { ...state.sales.pagination, page: 1 },
              },
            }),
            false,
            'setSaleFilters'
          ),

        resetSaleFilters: () =>
          set(
            (state) => ({
              sales: {
                ...state.sales,
                filters: initialState.sales.filters,
                pagination: { ...state.sales.pagination, page: 1 },
              },
            }),
            false,
            'resetSaleFilters'
          ),

        setSalePagination: (pagination) =>
          set(
            (state) => ({
              sales: {
                ...state.sales,
                pagination: { ...state.sales.pagination, ...pagination },
              },
            }),
            false,
            'setSalePagination'
          ),

        setSelectedSale: (sale) =>
          set(
            (state) => ({
              sales: { ...state.sales, selectedSale: sale },
            }),
            false,
            'setSelectedSale'
          ),

        setSaleDialogOpen: (isOpen) =>
          set(
            (state) => ({
              sales: {
                ...state.sales,
                dialogOpen: isOpen,
                selectedSale: isOpen ? state.sales.selectedSale : null,
              },
            }),
            false,
            'setSaleDialogOpen'
          ),

        setSaleDetailDialogOpen: (isOpen) =>
          set(
            (state) => ({
              sales: {
                ...state.sales,
                detailDialogOpen: isOpen,
                selectedSale: isOpen ? state.sales.selectedSale : null,
              },
            }),
            false,
            'setSaleDetailDialogOpen'
          ),

        setSaleActiveTab: (tab) =>
          set(
            (state) => ({
              sales: { ...state.sales, activeTab: tab },
            }),
            false,
            'setSaleActiveTab'
          ),

        // ==================== PAYMENTS ACTIONS ====================
        setPaymentFilters: (filters) =>
          set(
            (state) => ({
              payments: {
                ...state.payments,
                filters: { ...state.payments.filters, ...filters },
                pagination: { ...state.payments.pagination, page: 1 },
              },
            }),
            false,
            'setPaymentFilters'
          ),

        resetPaymentFilters: () =>
          set(
            (state) => ({
              payments: {
                ...state.payments,
                filters: initialState.payments.filters,
                pagination: { ...state.payments.pagination, page: 1 },
              },
            }),
            false,
            'resetPaymentFilters'
          ),

        setPaymentPagination: (pagination) =>
          set(
            (state) => ({
              payments: {
                ...state.payments,
                pagination: { ...state.payments.pagination, ...pagination },
              },
            }),
            false,
            'setPaymentPagination'
          ),

        setSelectedPayment: (payment) =>
          set(
            (state) => ({
              payments: { ...state.payments, selectedPayment: payment },
            }),
            false,
            'setSelectedPayment'
          ),

        setPaymentDialogOpen: (isOpen, saleId = null) =>
          set(
            (state) => ({
              payments: {
                ...state.payments,
                dialogOpen: isOpen,
                saleIdForPayment: isOpen ? saleId : null,
                selectedPayment: isOpen ? state.payments.selectedPayment : null,
              },
            }),
            false,
            'setPaymentDialogOpen'
          ),

        // ==================== SALE FORM (DRAFT) ACTIONS ====================
        setSaleFormField: (field, value) =>
          set(
            (state) => ({
              saleForm: { ...state.saleForm, [field]: value },
            }),
            false,
            'setSaleFormField'
          ),

        addSaleFormItem: (item) =>
          set(
            (state) => {
              const newItems = [...state.saleForm.items, item];
              const totals = calculateSaleTotals(newItems);
              return {
                saleForm: {
                  ...state.saleForm,
                  items: newItems,
                  ...totals,
                },
              };
            },
            false,
            'addSaleFormItem'
          ),

        updateSaleFormItem: (index, updatedItem) =>
          set(
            (state) => {
              const newItems = [...state.saleForm.items];
              newItems[index] = updatedItem;
              const totals = calculateSaleTotals(newItems);
              return {
                saleForm: {
                  ...state.saleForm,
                  items: newItems,
                  ...totals,
                },
              };
            },
            false,
            'updateSaleFormItem'
          ),

        removeSaleFormItem: (index) =>
          set(
            (state) => {
              const newItems = state.saleForm.items.filter((_, i) => i !== index);
              const totals = calculateSaleTotals(newItems);
              return {
                saleForm: {
                  ...state.saleForm,
                  items: newItems,
                  ...totals,
                },
              };
            },
            false,
            'removeSaleFormItem'
          ),

        clearSaleForm: () =>
          set(
            {
              saleForm: {
                ...initialState.saleForm,
                saleType: get().preferences.defaultSaleType,
                warehouseId: get().preferences.defaultWarehouseId,
              },
            },
            false,
            'clearSaleForm'
          ),

        loadSaleFormFromDraft: (draft) =>
          set(
            {
              saleForm: {
                ...draft,
                isDraft: true,
              },
            },
            false,
            'loadSaleFormFromDraft'
          ),

        // ==================== PREFERENCES ACTIONS ====================
        setPreference: (key, value) =>
          set(
            (state) => ({
              preferences: { ...state.preferences, [key]: value },
            }),
            false,
            'setPreference'
          ),

        setPreferences: (preferences) =>
          set(
            (state) => ({
              preferences: { ...state.preferences, ...preferences },
            }),
            false,
            'setPreferences'
          ),

        // ==================== GLOBAL ACTIONS ====================
        resetAll: () =>
          set(
            {
              ...initialState,
              preferences: get().preferences, // Preserve preferences
            },
            false,
            'resetAll'
          ),

        resetModule: (module) =>
          set(
            (state) => ({
              [module]: initialState[module],
            }),
            false,
            'resetModule'
          ),
      }),
      {
        name: 'sales-storage',
        partialize: (state) => ({
          // Only persist preferences and sale form drafts
          preferences: state.preferences,
          saleForm: state.saleForm.isDraft ? state.saleForm : initialState.saleForm,
        }),
      }
    ),
    { name: 'SalesStore' }
  )
);

// ==================== HELPER FUNCTIONS ====================

/**
 * Calculate sale totals from items
 * @param {Array} items - Sale items
 * @returns {Object} Calculated totals
 */
const calculateSaleTotals = (items) => {
  const subtotal = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  const totalTax = items.reduce((sum, item) => sum + (item.tax || 0) * (item.quantity || 0), 0);
  const totalDiscount = items.reduce((sum, item) => sum + (item.discount || 0), 0);
  const total = subtotal + totalTax - totalDiscount;

  return {
    subtotal,
    totalTax,
    totalDiscount,
    total,
  };
};

// ==================== SELECTORS ====================

/**
 * Get customer filters
 */
export const selectCustomerFilters = (state) => state.customers.filters;

/**
 * Get sale filters
 */
export const selectSaleFilters = (state) => state.sales.filters;

/**
 * Get payment filters
 */
export const selectPaymentFilters = (state) => state.payments.filters;

/**
 * Get sale form
 */
export const selectSaleForm = (state) => state.saleForm;

/**
 * Get sale form items count
 */
export const selectSaleFormItemsCount = (state) => state.saleForm.items.length;

/**
 * Get sale form total
 */
export const selectSaleFormTotal = (state) => state.saleForm.total;

/**
 * Get preferences
 */
export const selectPreferences = (state) => state.preferences;

/**
 * Check if sale form has unsaved changes
 */
export const selectHasUnsavedChanges = (state) =>
  state.saleForm.isDraft && state.saleForm.items.length > 0;

export default useSalesStore;
