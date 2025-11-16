/**
 * Environment Configuration
 * Carga variables de entorno desde .env.local
 */

export const ENV_CONFIG = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  
  // App Information
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Inventory Management System',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Feature Flags
  USE_MOCKS: import.meta.env.VITE_USE_MOCKS === 'true',
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  
  // Theme
  THEME: import.meta.env.VITE_THEME || 'light',
  
  // Environment Detection
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

// Log configuration in development
if (ENV_CONFIG.isDevelopment) {
  console.log('🔧 Environment Configuration:', {
    API_BASE_URL: ENV_CONFIG.API_BASE_URL,
    APP_NAME: ENV_CONFIG.APP_NAME,
    APP_VERSION: ENV_CONFIG.APP_VERSION,
    USE_MOCKS: ENV_CONFIG.USE_MOCKS,
    ENABLE_ANALYTICS: ENV_CONFIG.ENABLE_ANALYTICS,
  });
}

export default ENV_CONFIG;
