import axios from 'axios';
import { getValidToken } from '../utils/tokenUtils';

// Production-Ready API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || (
  process.env.NODE_ENV === 'production' 
    ? window.location.origin  // Use same domain as frontend in production
    : 'http://localhost:5000'
);

console.log('🔗 API Base URL:', API_BASE_URL);
console.log('🌟 Environment:', process.env.NODE_ENV);
console.log('🌍 Window Origin:', window.location.origin);

// Set default base URL
axios.defaults.baseURL = API_BASE_URL;

// Add request interceptor for authentication and debugging
axios.interceptors.request.use((config) => {
  // Get valid token (not expired) and add it to headers
  const token = getValidToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('🎫 Token attached to request:', config.method?.toUpperCase(), config.url);
  } else {
    console.log('❌ No valid token for request:', config.method?.toUpperCase(), config.url);
    // If token is expired, remove it and force re-login
    const existingToken = localStorage.getItem('token');
    if (existingToken) {
      localStorage.removeItem('token');
      // Only redirect if not already on login page and not a token verification request
      if (!window.location.pathname.includes('/login') && !config.url.includes('/auth/verify')) {
        console.log('🔄 Redirecting to login due to expired token');
        window.location.href = '/login';
      }
    }
  }
  
  // Enhanced logging for debugging
  console.log('📡 API Request:', {
    method: config.method?.toUpperCase(),
    url: config.url,
    fullURL: `${API_BASE_URL}${config.url}`,
    hasToken: !!token,
    timestamp: new Date().toISOString()
  });
  
  return config;
});

// Add response interceptor for error handling
axios.interceptors.response.use(
  (response) => {
    console.log('✅ API Success:', response.config.method?.toUpperCase(), response.config.url, response.status);
    return response;
  },
  (error) => {
    // Build a more detailed error log
    const errorDetails = {
      url: error.config?.url || 'unknown',
      method: error.config?.method?.toUpperCase() || 'unknown',
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      fullURL: error.config ? `${API_BASE_URL}${error.config.url}` : 'unknown'
    };
    
    console.error('❌ API Error:', errorDetails);
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      console.log('🔐 Authentication error detected');
      
      if (error.response?.data?.message?.includes('Token') || 
          error.response?.data?.message?.includes('authorization denied') ||
          error.response?.data?.message?.includes('not valid')) {
        localStorage.removeItem('token');
        
        // Only redirect if we're not already on the login page
        if (!window.location.pathname.includes('/login')) {
          console.log('🔄 Authentication failed, redirecting to login');
          window.location.href = '/login';
        }
      }
    }
    
    // Enhanced error handling for network issues
    if (!error.response) {
      // This is likely a network error or CORS issue
      const enhancedError = new Error(`Network Error: Cannot connect to ${error.config?.url || 'API'}`);
      enhancedError.originalError = error;
      enhancedError.isNetworkError = true;
      return Promise.reject(enhancedError);
    }
    
    // Add route not found handling
    if (error.response?.status === 404) {
      const enhancedError = new Error(`API Route Not Found: ${error.config.url}`);
      enhancedError.originalError = error;
      enhancedError.response = error.response;
      enhancedError.isNotFoundError = true;
      return Promise.reject(enhancedError);
    }
    
    // Handle 500 errors with specific messaging
    if (error.response?.status === 500) {
      console.error('💥 Server Error 500:', error.response.data);
      const enhancedError = new Error('Server Error: ' + (error.response.data?.message || 'Internal server error'));
      enhancedError.originalError = error;
      enhancedError.response = error.response;
      enhancedError.isServerError = true;
      return Promise.reject(enhancedError);
    }
    
    return Promise.reject(error);
  }
);

export default axios;
