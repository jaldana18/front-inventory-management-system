import { createContext, useState, useEffect, useMemo } from 'react';
import authService from '../services/auth.service';
import { extractUserFromToken } from '../utils/jwt.utils';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tokenData, setTokenData] = useState(null);

  useEffect(() => {
    // Check if user is already authenticated on mount
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      // Decode JWT to get warehouseId and role
      const decoded = extractUserFromToken(token);
      setTokenData(decoded);
      setIsAuthenticated(true);
      setUser(JSON.parse(userStr));
    }

    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);

      // Decode JWT to extract warehouseId and role
      const decoded = extractUserFromToken(response.accessToken);
      setTokenData(decoded);

      setUser(response.user);
      setIsAuthenticated(true);
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setTokenData(null);
    setIsAuthenticated(false);
  };

  // Computed values from token
  const userRole = useMemo(() => tokenData?.role || user?.role, [tokenData, user]);
  const userWarehouseId = useMemo(() => tokenData?.warehouseId, [tokenData]);
  const companyId = useMemo(() => tokenData?.companyId || user?.companyId, [tokenData, user]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    // Additional user data from JWT
    userRole,
    userWarehouseId, // null for admin/manager, number for user
    companyId,
    tokenData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
