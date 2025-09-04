import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../api/config';
import toast from 'react-hot-toast';
import { getValidToken } from '../utils/tokenUtils';
import { setupTabCloseListener } from '../utils/sessionUtils';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);
  
  // Set up tab close listener to automatically log out when the tab is closed
  useEffect(() => {
    // Only set up the listener if the user is logged in
    if (user) {
      const cleanup = setupTabCloseListener(() => {
        console.log('Tab was previously closed. Logging out...');
        logout(false); // Silent logout without toast notification
      });
      
      // Clean up event listeners when component unmounts or user changes
      return cleanup;
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      // Get token and check if it's valid (not expired)
      const token = getValidToken();
      
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        // Verify with the server
        const response = await axios.get('/auth/verify');
        if (response.data.valid) {
          setUser(response.data.user);
        }
      } else {
        // If token doesn't exist or is expired, clear it
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = (showNotification = true) => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    
    // Only show the toast notification if requested
    if (showNotification) {
      toast.success('Logged out successfully');
    } else {
      console.log('Silent logout completed');
    }
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
