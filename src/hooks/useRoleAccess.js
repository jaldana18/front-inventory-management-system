import { useMemo } from 'react';
import { useAuth } from '../context/useAuth';
import {
  hasRoutePermission,
  canViewMenuItem,
  getAccessibleMenuItems,
  getAccessibleRoutes,
  ROLES,
} from '../config/roles.config';

/**
 * Custom hook for role-based access control
 * Provides utilities to check permissions and manage role-based UI
 */
export const useRoleAccess = () => {
  const { user } = useAuth();
  const userRole = user?.role;

  // Check if user has a specific role
  const hasRole = useMemo(
    () => ({
      isAdmin: userRole === ROLES.ADMIN,
      isManager: userRole === ROLES.MANAGER,
      isUser: userRole === ROLES.USER,
    }),
    [userRole]
  );

  // Check if user can access a specific route
  const canAccessRoute = (route) => hasRoutePermission(userRole, route);

  // Check if user can view a menu item
  const canAccessMenuItem = (menuItemId) => canViewMenuItem(userRole, menuItemId);

  // Get all accessible menu items for current user
  const accessibleMenuItems = useMemo(
    () => getAccessibleMenuItems(userRole),
    [userRole]
  );

  // Get all accessible routes for current user
  const accessibleRoutes = useMemo(
    () => getAccessibleRoutes(userRole),
    [userRole]
  );

  return {
    userRole,
    hasRole,
    canAccessRoute,
    canAccessMenuItem,
    accessibleMenuItems,
    accessibleRoutes,
  };
};

export default useRoleAccess;
