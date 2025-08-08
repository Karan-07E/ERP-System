import axios from 'axios';

// Configure axios for API calls
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// Set default base URL if provided
if (API_BASE_URL) {
  axios.defaults.baseURL = API_BASE_URL;
}

// Add request interceptor for debugging
axios.interceptors.request.use((config) => {
  console.log('API Request:', config.method?.toUpperCase(), config.url);
  return config;
});

// Add response interceptor for error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axios;
