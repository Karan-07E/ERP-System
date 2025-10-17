/**
 * Utility functions for handling JWT tokens
 */

/**
 * Parse the JWT token to extract payload information
 * @param {string} token - The JWT token
 * @returns {object|null} - Decoded token payload or null if invalid
 */
export const parseJwt = (token) => {
  try {
    // Split the token and get the payload part
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
    console.error('Failed to parse JWT token:', error);
    return null;
  }
};

/**
 * Check if the token is expired
 * @param {string} token - The JWT token
 * @returns {boolean} - True if token is expired, false otherwise
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const decoded = parseJwt(token);
    if (!decoded) return true;
    
    // exp is in seconds, Date.now() is in milliseconds
    const expirationTime = decoded.exp * 1000;
    const currentTime = Date.now();
    
    // Return true if token is expired
    return currentTime >= expirationTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

/**
 * Get token from localStorage and verify it's not expired
 * @returns {string|null} - Valid token or null if expired/not found
 */
export const getValidToken = () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.log('🔍 No token found in localStorage');
    return null;
  }
  
  if (isTokenExpired(token)) {
    console.log('⏰ Token expired, removing from localStorage');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return null;
  }
  
  console.log('✅ Valid token found');
  return token;
};

/**
 * Set token in localStorage with validation
 * @param {string} token - JWT token to store
 * @returns {boolean} - Success status
 */
export const setToken = (token) => {
  try {
    if (!token || isTokenExpired(token)) {
      console.error('❌ Attempted to store invalid or expired token');
      return false;
    }
    
    localStorage.setItem('token', token);
    console.log('✅ Token stored successfully');
    return true;
  } catch (error) {
    console.error('❌ Error storing token:', error);
    return false;
  }
};

/**
 * Remove token and user data from localStorage
 */
export const clearTokens = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  console.log('🗑️ Tokens cleared from localStorage');
};

/**
 * Get user data from localStorage
 * @returns {object|null} - User data or null if not found
 */
export const getStoredUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('❌ Error parsing stored user data:', error);
    return null;
  }
};
