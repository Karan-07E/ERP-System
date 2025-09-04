import axios from 'axios';
import { getValidToken } from '../utils/tokenUtils';

// Configure axios for API calls
export const API_BASE_URL = process.env.REACT_APP_API_URL || (
  process.env.NODE_ENV === 'production' 
    ? 'https://eee111.onrender.com'
    : '/api'
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
    console.error('API Error:', error.response?.data || error.message);
    
    // Handle authentication errors - only redirect if it's a token validation error
    if (error.response?.status === 401 && 
        error.response?.data?.message === 'Token is not valid') {
      localStorage.removeItem('token');
      
      // Only redirect if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axios;
