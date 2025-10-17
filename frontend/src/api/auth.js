import axios from './config';

/**
 * Production-Ready Authentication API Helper
 * 
 * This file contains all authentication-related API calls
 * with proper error handling and token management
 */

// Login API call - DOES NOT require existing token
export const loginUser = async (email, password) => {
  try {
    console.log('🔐 Attempting login for:', email);
    
    const response = await axios.post('/api/auth/login', {
      email: email.trim().toLowerCase(),
      password: password
    });

    console.log('✅ Login response received:', response.status);

    if (response.data.success && response.data.token) {
      // Store token in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      console.log('🎫 Token stored successfully');
      console.log('👤 User data stored:', response.data.user.email);

      return {
        success: true,
        token: response.data.token,
        user: response.data.user,
        message: response.data.message
      };
    } else {
      throw new Error('Invalid response format from server');
    }

  } catch (error) {
    console.error('❌ Login error:', error);

    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const errorData = error.response.data;
      return {
        success: false,
        message: errorData.message || 'Login failed',
        code: errorData.code || 'LOGIN_FAILED',
        status: error.response.status
      };
    } else if (error.request) {
      // Network error
      return {
        success: false,
        message: 'Cannot connect to server. Please check your connection.',
        code: 'NETWORK_ERROR'
      };
    } else {
      // Other error
      return {
        success: false,
        message: error.message || 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR'
      };
    }
  }
};

// Logout - clear local storage and redirect
export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  console.log('🚪 User logged out, tokens cleared');
  
  // Redirect to login page
  window.location.href = '/login';
};

// Verify token validity
export const verifyToken = async () => {
  try {
    const response = await axios.get('/api/auth/verify');
    return {
      success: true,
      user: response.data.user
    };
  } catch (error) {
    console.log('❌ Token verification failed:', error.message);
    
    // Clear invalid token
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    return {
      success: false,
      message: 'Token invalid or expired'
    };
  }
};

// Get current user from localStorage
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = getCurrentUser();
  
  const isAuth = !!(token && user);
  console.log('🔍 Authentication check:', isAuth);
  
  return isAuth;
};

// Register new user
export const registerUser = async (userData) => {
  try {
    const response = await axios.post('/api/auth/register', userData);
    
    if (response.data.token) {
      // Auto-login after registration
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return {
      success: true,
      token: response.data.token,
      user: response.data.user,
      message: response.data.message
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Registration failed',
      code: error.response?.data?.code || 'REGISTRATION_FAILED'
    };
  }
};

// Change password
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await axios.put('/api/auth/change-password', {
      currentPassword,
      newPassword
    });
    
    return {
      success: true,
      message: response.data.message
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Password change failed'
    };
  }
};

// Update user profile
export const updateProfile = async (profileData) => {
  try {
    const response = await axios.put('/api/auth/profile', profileData);
    
    // Update stored user data
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    return {
      success: true,
      user: response.data.user,
      message: response.data.message
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Profile update failed'
    };
  }
};

// Protected API call helper
export const makeAuthenticatedRequest = async (method, url, data = null) => {
  try {
    const config = {
      method: method.toLowerCase(),
      url,
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    
    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error) {
    if (error.response?.status === 401) {
      // Token expired or invalid - logout user
      logoutUser();
      return {
        success: false,
        message: 'Session expired. Please login again.',
        code: 'SESSION_EXPIRED'
      };
    }
    
    return {
      success: false,
      message: error.response?.data?.message || 'Request failed',
      status: error.response?.status,
      code: error.response?.data?.code
    };
  }
};

export default {
  loginUser,
  logoutUser,
  verifyToken,
  getCurrentUser,
  isAuthenticated,
  registerUser,
  changePassword,
  updateProfile,
  makeAuthenticatedRequest
};