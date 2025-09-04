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
      console.log('Setting up tab close detection for user:', user.email || user.username);
      
      const cleanup = setupTabCloseListener(() => {
        console.log('Tab session change detected. Performing automatic logout...');
        logout(false); // Silent logout without toast notification
      });
      
      // Clean up event listeners when component unmounts or user changes
      return cleanup;
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      // Check for tab close indicator first
      checkForTabClose();
      
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
  
  // Additional check for detecting tab close/reopen scenarios
  const checkForTabClose = () => {
    try {
      // Compare sessionStorage (tab-specific) with localStorage (persists across tabs)
      const authSessionId = sessionStorage.getItem('authSessionId');
      const storedSessionId = localStorage.getItem('authSessionId');
      
      // If we have a stored ID but no session ID, it means we're in a new tab session
      if (storedSessionId && !authSessionId) {
        console.log('New tab session detected. Clearing previous authentication.');
        localStorage.removeItem('token');
        localStorage.removeItem('authSessionId');
      } else {
        // Set/update the session identifier
        const newSessionId = Date.now().toString();
        sessionStorage.setItem('authSessionId', newSessionId);
        localStorage.setItem('authSessionId', newSessionId);
      }
    } catch (e) {
      console.warn('Session check error:', e);
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
