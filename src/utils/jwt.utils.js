/**
 * JWT Token utilities for decoding and extracting user information
 */

/**
 * Decode JWT token (simple base64 decode - for non-sensitive operations)
 * For production, consider using jwt-decode library
 */
export const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

/**
 * Extract user information from JWT token
 */
export const extractUserFromToken = (token) => {
  const decoded = decodeJWT(token);
  if (!decoded) return null;

  return {
    userId: decoded.userId,
    companyId: decoded.companyId,
    email: decoded.email,
    role: decoded.role, // 'admin', 'manager', 'user'
    warehouseId: decoded.warehouseId, // null for admin/manager, number for user
  };
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token) => {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;

  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

/**
 * Get remaining token time in seconds
 */
export const getTokenRemainingTime = (token) => {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return 0;

  const currentTime = Date.now() / 1000;
  return Math.max(0, decoded.exp - currentTime);
};
