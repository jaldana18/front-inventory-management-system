import { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage debe usarse dentro de LanguageProvider');
  }
  return context;
};

const translations = {
  es: {
    // Navigation
    dashboard: 'Panel de Control',
    inventory: 'Inventario',
    products: 'Productos',
    orders: 'Pedidos',
    suppliers: 'Proveedores',
    reports: 'Reportes',
    settings: 'Configuración',
    logout: 'Cerrar sesión',

    // Common
    search: 'Buscar',
    add: 'Agregar',
    edit: 'Editar',
    delete: 'Eliminar',
    save: 'Guardar',
    cancel: 'Cancelar',
    actions: 'Acciones',
    status: 'Estado',
    category: 'Categoría',
    quantity: 'Cantidad',
    price: 'Precio',
    cost: 'Costo',
    sku: 'SKU',
    name: 'Nombre',
    description: 'Descripción',
    updatedAt: 'Actualizado',
    noInventoryItemsFound: 'No se encontraron artículos de inventario',
    startAddingItems: 'Comienza agregando tu primer artículo de inventario',
    editItem: 'Editar Artículo',
    updateItemDetails: 'Actualiza los detalles de tu artículo de inventario',
    addProductToInventory: 'Agrega un nuevo producto a tu inventario',
    supplier: 'Proveedor',
    minStock: 'Stock Mínimo',
    location: 'Ubicación',
    export: 'Exportar',
    print: 'Imprimir',
    allCategories: 'Todas las Categorías',

    // Inventory
    inventoryManagement: 'Gestión de Inventario',
    searchByNameOrSku: 'Buscar por nombre o SKU...',
    totalItems: 'Total de Artículos',
    productsInInventory: 'Productos en inventario',
    inventoryValue: 'Valor del Inventario',
    totalStockValue: 'Valor total del stock',
    lowStock: 'Stock Bajo',
    itemsNeedRestock: 'Artículos que necesitan reabastecimiento',
    outOfStock: 'Sin Stock',
    itemsUnavailable: 'Artículos no disponibles',
    inStock: 'En Stock',
    createNewItem: 'Crear Nuevo Artículo',
    confirmDelete: 'Confirmar Eliminación',
    areYouSure: '¿Estás seguro que deseas eliminar este artículo?',
    itemCreatedSuccessfully: 'Artículo creado exitosamente',
    itemUpdatedSuccessfully: 'Artículo actualizado exitosamente',
    itemDeletedSuccessfully: 'Artículo eliminado exitosamente',
    failedToCreateItem: 'Error al crear el artículo',
    failedToUpdateItem: 'Error al actualizar el artículo',
    failedToDeleteItem: 'Error al eliminar el artículo',

    // Dashboard
    welcomeToDashboard: 'Bienvenido a tu panel de control de inventario',
    totalProducts: 'Total de Productos',
    categories: 'Categorías',
    categoriesInUse: 'Categorías en uso',
    activeSuppliers: 'Proveedores activos',
    monthlyRevenue: 'Ingresos mensuales',
    revenue: 'Ingresos',
    recentProducts: 'Productos Recientes',
    noDashboardData: 'Sin datos disponibles aún',
    errorLoadingData: 'Error al cargar datos',

    // Auth
    login: 'Iniciar sesión',
    email: 'Correo electrónico',
    password: 'Contraseña',
    rememberMe: 'Recuérdame',
    invalidCredentials: 'Usuario o contraseña incorrecta',
    loginFailed: 'Error al iniciar sesión',
    loginSuccessful: 'Sesión iniciada correctamente',
    forgotPassword: '¿Olvidaste tu contraseña?',
    inventoryManagementSystem: 'Sistema de Gestión de Inventario',
    emailAddress: 'Correo electrónico',
    loginButton: 'Iniciar sesión',
    welcomeBack: 'Bienvenido de vuelta',

    // Reports & Analytics
    reportsAnalytics: 'Reportes y Análisis',
    monitorInventory: 'Monitorea el rendimiento de tu inventario y métricas de ventas',
    exportReport: 'Exportar Reporte',
    quickRange: 'Rango Rápido',
    last7Days: 'Últimos 7 Días',
    last30Days: 'Últimos 30 Días',
    last90Days: 'Últimos 90 Días',
    lastYear: 'Último Año',
    granularity: 'Granularidad',
    hourly: 'Por Hora',
    weekly: 'Semanal',
    startDate: 'Fecha de Inicio',
    endDate: 'Fecha de Fin',
    totalRevenue: 'Ingresos Totales',
    currentPeriod: 'Período actual',
    totalOrders: 'Órdenes Totales',
    ordersPlaced: 'Órdenes realizadas',
    avgOrderValue: 'Valor Promedio de Orden',
    perTransaction: 'Por transacción',
    currentStock: 'Stock actual',
    salesTimeline: 'Timeline de Ventas',
    topProducts: 'Productos Principales',
    topSellingProducts: 'Productos Más Vendidos',
    categoryPerformance: 'Rendimiento de Categorías',
    inventoryStatus: 'Estado del Inventario',
    noDataAvailable: 'No hay datos disponibles',
    unitsSold: 'Unidades Vendidas',
    alerts: 'Alertas',
    calendar: 'Calendario',
    units: 'unidades',

    // Language
    language: 'Idioma',
    spanish: 'Español',
    english: 'English',
  },
  en: {
    // Navigation
    dashboard: 'Dashboard',
    inventory: 'Inventory',
    products: 'Products',
    orders: 'Orders',
    suppliers: 'Suppliers',
    reports: 'Reports',
    settings: 'Settings',
    logout: 'Logout',

    // Common
    search: 'Search',
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    actions: 'Actions',
    status: 'Status',
    category: 'Category',
    quantity: 'Quantity',
    price: 'Price',
    cost: 'Cost',
    sku: 'SKU',
    name: 'Name',
    description: 'Description',
    updatedAt: 'Updated',
    noInventoryItemsFound: 'No inventory items found',
    startAddingItems: 'Start by adding your first inventory item',
    editItem: 'Edit Item',
    updateItemDetails: 'Update the details of your inventory item',
    addProductToInventory: 'Add a new product to your inventory',
    supplier: 'Supplier',
    minStock: 'Minimum Stock',
    location: 'Location',
    export: 'Export',
    print: 'Print',
    allCategories: 'All Categories',

    // Inventory
    inventoryManagement: 'Inventory Management',
    searchByNameOrSku: 'Search by product name or SKU...',
    totalItems: 'Total Items',
    productsInInventory: 'Products in inventory',
    inventoryValue: 'Inventory Value',
    totalStockValue: 'Total stock value',
    lowStock: 'Low Stock',
    itemsNeedRestock: 'Items need restock',
    outOfStock: 'Out of Stock',
    itemsUnavailable: 'Items unavailable',
    inStock: 'In Stock',
    createNewItem: 'Create New Item',
    confirmDelete: 'Confirm Deletion',
    areYouSure: 'Are you sure you want to delete this item?',
    itemCreatedSuccessfully: 'Item created successfully',
    itemUpdatedSuccessfully: 'Item updated successfully',
    itemDeletedSuccessfully: 'Item deleted successfully',
    failedToCreateItem: 'Failed to create item',
    failedToUpdateItem: 'Failed to update item',
    failedToDeleteItem: 'Failed to delete item',

    // Dashboard
    welcomeToDashboard: 'Welcome to your inventory dashboard',
    totalProducts: 'Total Products',
    categories: 'Categories',
    categoriesInUse: 'Categories in use',
    activeSuppliers: 'Active suppliers',
    monthlyRevenue: 'Monthly revenue',
    revenue: 'Revenue',
    recentProducts: 'Recently Added Products',
    noDashboardData: 'No data available yet',
    errorLoadingData: 'Error loading data',

    // Auth
    login: 'Login',
    email: 'Email',
    password: 'Password',
    rememberMe: 'Remember me',
    invalidCredentials: 'Invalid email or password',
    loginFailed: 'Login failed',
    loginSuccessful: 'Login successful',
    forgotPassword: 'Forgot password?',
    inventoryManagementSystem: 'Inventory Management System',
    emailAddress: 'Email Address',
    loginButton: 'Login',
    welcomeBack: 'Welcome back',

    // Reports & Analytics
    reportsAnalytics: 'Reports & Analytics',
    monitorInventory: 'Monitor your inventory performance and sales metrics',
    exportReport: 'Export Report',
    quickRange: 'Quick Range',
    last7Days: 'Last 7 Days',
    last30Days: 'Last 30 Days',
    last90Days: 'Last 90 Days',
    lastYear: 'Last Year',
    granularity: 'Granularity',
    hourly: 'Hourly',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    startDate: 'Start Date',
    endDate: 'End Date',
    totalRevenue: 'Total Revenue',
    currentPeriod: 'Current period',
    totalOrders: 'Total Orders',
    ordersPlaced: 'Orders placed',
    avgOrderValue: 'Avg Order Value',
    perTransaction: 'Per transaction',
    currentStock: 'Current stock',
    salesTimeline: 'Sales Timeline',
    topProducts: 'Top Products',
    topSellingProducts: 'Top Selling Products',
    categoryPerformance: 'Category Performance',
    inventoryStatus: 'Inventory Status',
    noDataAvailable: 'No data available',
    unitsSold: 'Units Sold',
    alerts: 'Alerts',
    calendar: 'Calendar',
    units: 'units',

    // Language
    language: 'Language',
    spanish: 'Español',
    english: 'English',
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Obtener idioma del localStorage o usar español por defecto
    return localStorage.getItem('language') || 'es';
  });

  useEffect(() => {
    // Guardar idioma en localStorage
    localStorage.setItem('language', language);
    // Actualizar lang del documento HTML
    document.documentElement.lang = language;
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations.es[key] || key;
  };

  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'en' : 'es');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
