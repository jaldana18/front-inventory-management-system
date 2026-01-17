import apiClient from './api.service';

export const authService = {
  /**
   * Login with email and password
   */
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });
    
    // Store tokens in localStorage
    if (response.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken || '');
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  /**
   * Logout user
   */
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
  },

  /**
   * Get current user info
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },

  /**
   * Get access token
   */
  getAccessToken: () => {
    return localStorage.getItem('accessToken');
  },

  /**
   * Refresh token
   */
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post('/auth/refresh', {
      refreshToken,
    });

    if (response.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }

    return response.data;
  },
};

export default authService;
