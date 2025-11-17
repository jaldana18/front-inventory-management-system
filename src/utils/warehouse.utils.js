/**
 * Warehouse access control utilities
 */

import { ROLES } from '../config/roles.config';

/**
 * Check if user can access a specific warehouse
 * @param {string} userRole - User role ('admin', 'manager', 'user')
 * @param {number|null} userWarehouseId - User's assigned warehouse ID (null for admin/manager)
 * @param {number} targetWarehouseId - Warehouse to check access for
 * @returns {boolean}
 */
export const canAccessWarehouse = (userRole, userWarehouseId, targetWarehouseId) => {
  // Admin and Manager can access all warehouses
  if (userRole === ROLES.ADMIN || userRole === ROLES.MANAGER) {
    return true;
  }

  // User can only access their assigned warehouse
  if (userRole === ROLES.USER) {
    return targetWarehouseId === userWarehouseId;
  }

  return false;
};

/**
 * Filter warehouses based on user access
 * @param {Array} warehouses - All warehouses
 * @param {string} userRole - User role
 * @param {number|null} userWarehouseId - User's assigned warehouse ID
 * @returns {Array} Filtered warehouses
 */
export const getAccessibleWarehouses = (warehouses, userRole, userWarehouseId) => {
  if (!warehouses || !Array.isArray(warehouses)) return [];

  // Admin and Manager see all warehouses
  if (userRole === ROLES.ADMIN || userRole === ROLES.MANAGER) {
    return warehouses;
  }

  // User sees only their assigned warehouse
  if (userRole === ROLES.USER && userWarehouseId) {
    return warehouses.filter((w) => w.id === userWarehouseId);
  }

  return [];
};

/**
 * Auto-assign warehouse for user role
 * @param {Object} data - Transaction data
 * @param {string} userRole - User role
 * @param {number|null} userWarehouseId - User's assigned warehouse ID
 * @returns {Object} Data with warehouseId assigned if needed
 */
export const autoAssignWarehouse = (data, userRole, userWarehouseId) => {
  // If user role and no warehouse specified, auto-assign their warehouse
  if (userRole === ROLES.USER && !data.warehouseId && userWarehouseId) {
    return {
      ...data,
      warehouseId: userWarehouseId,
    };
  }

  return data;
};

/**
 * Validate warehouse access before operation
 * @param {number} warehouseId - Warehouse to validate
 * @param {string} userRole - User role
 * @param {number|null} userWarehouseId - User's assigned warehouse ID
 * @throws {Error} If access is denied
 */
export const validateWarehouseAccess = (warehouseId, userRole, userWarehouseId) => {
  if (!canAccessWarehouse(userRole, userWarehouseId, warehouseId)) {
    throw new Error('No tienes acceso a este almacén');
  }
};

/**
 * Check if user can perform transfers between warehouses
 * @param {string} userRole - User role
 * @returns {boolean}
 */
export const canTransferBetweenWarehouses = (userRole) => {
  return userRole === ROLES.ADMIN || userRole === ROLES.MANAGER;
};

/**
 * Get default warehouse ID for user
 * @param {string} userRole - User role
 * @param {number|null} userWarehouseId - User's assigned warehouse ID
 * @param {number|null} fallback - Fallback warehouse ID
 * @returns {number|null}
 */
export const getDefaultWarehouseId = (userRole, userWarehouseId, fallback = null) => {
  if (userRole === ROLES.USER && userWarehouseId) {
    return userWarehouseId;
  }
  return fallback;
};
