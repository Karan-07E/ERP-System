import axios from 'axios';

// Configure axios for API calls
const API_BASE_URL = process.env.REACT_APP_API_URL || (
  process.env.NODE_ENV === 'production' 
    ? 'https://your-backend-name.onrender.com'
    : 'http://localhost:5000'
);

// Set default base URL
axios.defaults.baseURL = API_BASE_URL;

// Add request interceptor for authentication and debugging
axios.interceptors.request.use((config) => {
  // Add auth token if available
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  console.log('API Request:', config.method?.toUpperCase(), config.url);
  return config;
});

// Add response interceptor for error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default axios;
