import axios from 'axios';
import { API_CONFIG } from '../config/api.config';
import toast from 'react-hot-toast';

const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers,
});

// Token refresh state management
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized) - but NOT for /auth/login endpoint
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          // No refresh token available, go to login
          processQueue(new Error('No refresh token'), null);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Crear una instancia de axios sin interceptores para evitar loop infinito
        const refreshClient = axios.create({
          baseURL: API_CONFIG.baseURL,
          timeout: API_CONFIG.timeout,
        });

        const response = await refreshClient.post(
          '/auth/refresh',
          { refreshToken },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        // Handle different API response structures
        const data = response.data?.data || response.data;
        const { accessToken, refreshToken: newRefreshToken } = data;

        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
        }
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        // Process all queued requests with the new token
        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Token refresh failed, clear auth and redirect to login
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // For /auth/login 401 errors, just return the error without toast
    // The LoginPage component will handle showing the error message
    if (originalRequest.url?.includes('/auth/login')) {
      return Promise.reject(error);
    }

    // Handle other errors
    const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || error.message || 'An error occurred';

    // Don't show toast for 401 errors (already handled above)
    if (error.response?.status !== 401) {
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
