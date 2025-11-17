# Role-Based Access Control (RBAC) Implementation

## Overview
This document describes the implementation of role-based access control in the inventory management system.

## Role Hierarchy

### Admin
- **Full Access**: Can access all features and pages
- **Permissions**:
  - Dashboard ✅
  - Inventory ✅
  - Orders/Invoices ✅
  - Suppliers ✅
  - Reports ✅
  - Settings ✅
  - User Administration ✅

### Manager
- **Limited Access**: Can access all features except user administration
- **Permissions**:
  - Dashboard ✅
  - Inventory ✅
  - Orders/Invoices ✅
  - Suppliers ✅
  - Reports ✅
  - Settings ✅
  - User Administration ❌

### User
- **Restricted Access**: Can only access inventory and invoices
- **Permissions**:
  - Dashboard ✅
  - Inventory ✅
  - Orders/Invoices ✅
  - Suppliers ❌
  - Reports ❌
  - Settings ❌
  - User Administration ❌

## Implementation Files

### 1. Configuration (`src/config/roles.config.js`)
Central configuration for all role-based permissions:
- `ROLES`: Role constants (admin, manager, user)
- `ROUTE_PERMISSIONS`: Route access by role
- `MENU_ITEMS_CONFIG`: Menu visibility by role
- Helper functions for permission checking

### 2. Route Guard (`src/components/RoleBasedRoute.jsx`)
Component that wraps routes requiring role-based access:
- Checks authentication status
- Validates role permissions
- Shows access denied page for unauthorized access
- Displays user information on denial

### 3. Main Layout (`src/components/layout/MainLayout.jsx`)
Updated to filter menu items based on user role:
- Dynamically shows/hides menu items
- Uses `canViewMenuItem` to filter navigation

### 4. App Routes (`src/App.jsx`)
All routes wrapped with `RoleBasedRoute`:
- Protects each route with role validation
- Prevents unauthorized navigation

### 5. Custom Hook (`src/hooks/useRoleAccess.js`)
Convenience hook for role-based logic:
- `hasRole`: Check specific roles
- `canAccessRoute`: Validate route access
- `canAccessMenuItem`: Check menu item visibility
- `accessibleMenuItems`: Get all accessible menu items
- `accessibleRoutes`: Get all accessible routes

## Token Response Structure

The authentication service expects this response from the API:

```json
{
  "success": true,
  "data": {
    "accessToken": "JWT_ACCESS_TOKEN",
    "refreshToken": "JWT_REFRESH_TOKEN",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "admin|manager|user",
      "companyId": 1,
      "company": {
        "id": 1,
        "name": "Company Name"
      }
    }
  }
}
```

**Important**: The `user.role` field must contain one of: `admin`, `manager`, or `user`

## Usage Examples

### Checking Route Access in Components
```jsx
import { useRoleAccess } from '../hooks/useRoleAccess';

function MyComponent() {
  const { canAccessRoute, hasRole } = useRoleAccess();

  if (hasRole.isAdmin) {
    // Admin-only logic
  }

  if (canAccessRoute('/users')) {
    // User can access user management
  }
}
```

### Conditional Rendering Based on Role
```jsx
import { useRoleAccess } from '../hooks/useRoleAccess';

function MyComponent() {
  const { hasRole } = useRoleAccess();

  return (
    <div>
      {hasRole.isAdmin && <AdminPanel />}
      {(hasRole.isAdmin || hasRole.isManager) && <ManagerFeatures />}
    </div>
  );
}
```

### Adding New Routes
1. Add route permission to `ROUTE_PERMISSIONS` in `roles.config.js`
2. Add menu item to `MENU_ITEMS_CONFIG` if needed
3. Wrap route with `RoleBasedRoute` in `App.jsx`

Example:
```jsx
// In roles.config.js
export const ROUTE_PERMISSIONS = {
  // ... existing routes
  '/new-feature': [ROLES.ADMIN, ROLES.MANAGER],
};

export const MENU_ITEMS_CONFIG = [
  // ... existing items
  {
    id: 'new-feature',
    path: '/new-feature',
    roles: [ROLES.ADMIN, ROLES.MANAGER],
  },
];

// In App.jsx
<Route
  path="new-feature"
  element={
    <RoleBasedRoute path="/new-feature">
      <NewFeaturePage />
    </RoleBasedRoute>
  }
/>
```

## Security Considerations

1. **Client-side only**: This implementation provides UI-level protection
2. **Backend validation required**: Always validate permissions on the backend
3. **Token-based**: Roles are derived from JWT token data
4. **Session persistence**: User role stored in localStorage with user data

## Testing

### Manual Testing Steps
1. **Test Admin Access**:
   - Login with admin credentials
   - Verify all menu items visible
   - Access all routes successfully

2. **Test Manager Access**:
   - Login with manager credentials
   - Verify user administration hidden
   - Attempt to access `/users` → Should see "Access Denied"

3. **Test User Access**:
   - Login with user credentials
   - Verify only Dashboard, Inventory, Orders visible
   - Attempt to access `/reports` → Should see "Access Denied"

### Test User Credentials
Based on the token response structure, create test users with different roles:
- Admin: `admin@democompany.com`
- Manager: Create a manager account
- User: Create a regular user account

## Future Enhancements

1. **User Management Page** (Admin only)
   - Create, edit, delete users
   - Assign roles to users
   - Manage company assignments

2. **Invoices/Orders Page** (All roles)
   - Create and manage invoices
   - Order processing workflow

3. **Fine-grained Permissions**
   - Resource-level permissions (read, write, delete)
   - Company-based data isolation
   - Custom role creation

4. **Audit Logging**
   - Track access attempts
   - Log permission denials
   - Monitor role changes

## Troubleshooting

### Issue: User sees all menu items despite role
**Solution**: Check that `user.role` is correctly set in localStorage and matches role constants

### Issue: Access denied on allowed route
**Solution**: Verify route path in `ROUTE_PERMISSIONS` matches exactly (including leading slash)

### Issue: Menu items not filtering
**Solution**: Ensure menu item `id` in `MainLayout` matches `id` in `MENU_ITEMS_CONFIG`

### Issue: Role not persisting after refresh
**Solution**: Check that user data is being stored correctly in `auth.service.js` login method
