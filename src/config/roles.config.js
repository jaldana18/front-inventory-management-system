/**
 * Role-based access control configuration
 *
 * Roles hierarchy:
 * - admin: Full access to all features
 * - manager: Access to all features except user administration
 * - user: Limited access to inventory and invoices only
 */

export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
};

/**
 * Route permissions by role
 */
export const ROUTE_PERMISSIONS = {
  '/': [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER], // Dashboard
  '/inventory': [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER], // Inventory
  '/stock-overview': [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER], // Stock Overview
  '/warehouses': [ROLES.ADMIN, ROLES.MANAGER], // Warehouses
  '/sales': [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER], // Sales
  '/customers': [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER], // Customers
  '/invoicing': [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER], // Invoicing
  '/orders': [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER], // Orders/Invoices (pending)
  '/suppliers': [ROLES.ADMIN, ROLES.MANAGER], // Suppliers
  '/reports': [ROLES.ADMIN, ROLES.MANAGER], // Reports
  '/settings': [ROLES.ADMIN, ROLES.MANAGER], // Settings
  '/users': [ROLES.ADMIN], // User Administration (pending)
  '/audit-logs': [ROLES.ADMIN, ROLES.MANAGER], // Audit Logs
};

/**
 * Menu items visibility by role
 */
export const MENU_ITEMS_CONFIG = [
  {
    id: 'dashboard',
    path: '/',
    roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
  },
  {
    id: 'inventory',
    path: '/inventory',
    roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
  },
  {
    id: 'stock-overview',
    path: '/stock-overview',
    roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
  },
  {
    id: 'warehouses',
    path: '/warehouses',
    roles: [ROLES.ADMIN, ROLES.MANAGER],
  },
  {
    id: 'sales',
    path: '/sales',
    roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
  },
  {
    id: 'customers',
    path: '/customers',
    roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
  },
  {
    id: 'invoicing',
    path: '/invoicing',
    roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
  },
  {
    id: 'orders',
    path: '/orders',
    roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
  },
  {
    id: 'suppliers',
    path: '/suppliers',
    roles: [ROLES.ADMIN, ROLES.MANAGER],
  },
  {
    id: 'reports',
    path: '/reports',
    roles: [ROLES.ADMIN, ROLES.MANAGER],
  },
  {
    id: 'settings',
    path: '/settings',
    roles: [ROLES.ADMIN, ROLES.MANAGER],
  },
  {
    id: 'users',
    path: '/users',
    roles: [ROLES.ADMIN],
  },
  {
    id: 'audit-logs',
    path: '/audit-logs',
    roles: [ROLES.ADMIN, ROLES.MANAGER],
  },
];

/**
 * Check if user has permission to access a route
 * @param {string} userRole - User's role
 * @param {string} route - Route path
 * @returns {boolean} - Whether user has access
 */
export const hasRoutePermission = (userRole, route) => {
  if (!userRole || !route) return false;

  const permissions = ROUTE_PERMISSIONS[route];
  if (!permissions) return false;

  return permissions.includes(userRole);
};

/**
 * Check if user can see a menu item
 * @param {string} userRole - User's role
 * @param {string} menuItemId - Menu item identifier
 * @returns {boolean} - Whether menu item should be visible
 */
export const canViewMenuItem = (userRole, menuItemId) => {
  if (!userRole || !menuItemId) return false;

  const menuItem = MENU_ITEMS_CONFIG.find(item => item.id === menuItemId);
  if (!menuItem) return false;

  return menuItem.roles.includes(userRole);
};

/**
 * Get filtered menu items based on user role
 * @param {string} userRole - User's role
 * @returns {Array} - Array of menu item IDs user can access
 */
export const getAccessibleMenuItems = (userRole) => {
  if (!userRole) return [];

  return MENU_ITEMS_CONFIG
    .filter(item => item.roles.includes(userRole))
    .map(item => item.id);
};

/**
 * Get accessible routes based on user role
 * @param {string} userRole - User's role
 * @returns {Array} - Array of route paths user can access
 */
export const getAccessibleRoutes = (userRole) => {
  if (!userRole) return [];

  return Object.entries(ROUTE_PERMISSIONS)
    .filter(([, roles]) => roles.includes(userRole))
    .map(([route]) => route);
};
