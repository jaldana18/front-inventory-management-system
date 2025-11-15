import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export const useInventoryStore = create(
  devtools(
    persist(
      (set, get) => ({
        // State
        items: [],
        selectedItem: null,
        filters: {
          search: '',
          category: '',
          status: '',
        },
        pagination: {
          page: 0,
          pageSize: 10,
          total: 0,
        },

        // Actions
        setItems: (items) => set({ items }),

        setSelectedItem: (item) => set({ selectedItem: item }),

        addItem: (item) =>
          set((state) => ({
            items: [...state.items, item],
          })),

        updateItem: (id, updates) =>
          set((state) => ({
            items: state.items.map((item) =>
              item.id === id ? { ...item, ...updates } : item
            ),
          })),

        removeItem: (id) =>
          set((state) => ({
            items: state.items.filter((item) => item.id !== id),
          })),

        setFilters: (filters) =>
          set((state) => ({
            filters: { ...state.filters, ...filters },
          })),

        clearFilters: () =>
          set({
            filters: {
              search: '',
              category: '',
              status: '',
            },
          }),

        setPagination: (pagination) =>
          set((state) => ({
            pagination: { ...state.pagination, ...pagination },
          })),

        // Computed values
        getFilteredItems: () => {
          const { items, filters } = get();
          return items.filter((item) => {
            const matchesSearch = filters.search
              ? item.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                item.sku.toLowerCase().includes(filters.search.toLowerCase())
              : true;

            const matchesCategory = filters.category
              ? item.category === filters.category
              : true;

            const matchesStatus = filters.status
              ? item.status === filters.status
              : true;

            return matchesSearch && matchesCategory && matchesStatus;
          });
        },

        getLowStockItems: () => {
          const { items } = get();
          return items.filter((item) => item.quantity <= item.minStock);
        },
      }),
      {
        name: 'inventory-storage',
        partialize: (state) => ({
          filters: state.filters,
          pagination: state.pagination,
        }),
      }
    )
  )
);
