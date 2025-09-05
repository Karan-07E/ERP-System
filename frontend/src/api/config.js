import axios from 'axios';
import { getValidToken } from '../utils/tokenUtils';

// Configure axios for API calls
export const API_BASE_URL = process.env.REACT_APP_API_URL || (
  process.env.NODE_ENV === 'production' 
    ? 'https://eee111.onrender.com'
    : ''  // Empty base URL for development
);

// Set default base URL
axios.defaults.baseURL = API_BASE_URL;

// Add request interceptor for authentication and debugging
axios.interceptors.request.use((config) => {
  // Get valid token (not expired) and add it to headers
  const token = getValidToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // If token is expired, remove it and force re-login
    const existingToken = localStorage.getItem('token');
    if (existingToken) {
      localStorage.removeItem('token');
      // Only redirect if not already on login page and not a token verification request
      if (!window.location.pathname.includes('/login') && !config.url.includes('/auth/verify')) {
        window.location.href = '/login';
      }
    }
  }
  
  console.log('API Request:', config.method?.toUpperCase(), config.url);
  return config;
});

// Add response interceptor for error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Build a more detailed error log
    const errorDetails = {
      url: error.config?.url || 'unknown',
      method: error.config?.method?.toUpperCase() || 'unknown',
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    };
    
    console.error('API Error:', errorDetails);
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      if (error.response?.data?.message === 'Token is not valid' || 
          error.response?.data?.message === 'Token has expired') {
        localStorage.removeItem('token');
        
        // Only redirect if we're not already on the login page
        if (!window.location.pathname.includes('/login')) {
          console.log('Authentication failed, redirecting to login');
          window.location.href = '/login';
        }
      }
    }
    
    // Enhance error with more details for easier debugging
    if (!error.isAxiosError) {
      // This is likely a network error or CORS issue
      const enhancedError = new Error(`Network Error: Cannot connect to ${error.config?.url || 'API'}`);
      enhancedError.originalError = error;
      return Promise.reject(enhancedError);
    }
    
    // Add route not found handling
    if (error.response?.status === 404) {
      const enhancedError = new Error(`API Route Not Found: ${error.config.url}`);
      enhancedError.originalError = error;
      enhancedError.response = error.response;
      return Promise.reject(enhancedError);
    }
    
    return Promise.reject(error);
  }
);

export default axios;
