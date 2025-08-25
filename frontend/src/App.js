import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Inventory from './pages/Inventory';
import Accounting from './pages/Accounting';
import Materials from './pages/Materials';
import Processes from './pages/Processes';
import Reports from './pages/Reports';
import Messages from './pages/Messages';
import Users from './pages/Users';
import Parties from './pages/Parties';
import EnhancedDashboard from './pages/EnhancedDashboard';
import BackupRestore from './pages/BackupRestore';
import Analytics from './pages/Analytics';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return user ? <Navigate to="/dashboard" /> : children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
          <Routes>
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="orders/*" element={<Orders />} />
              <Route path="inventory/*" element={<Inventory />} />
              <Route path="accounting/*" element={<Accounting />} />
              <Route path="materials/*" element={<Materials />} />
              <Route path="processes/*" element={<Processes />} />
              <Route path="reports/*" element={<Reports />} />
              <Route path="messages/*" element={<Messages />} />
              <Route path="users/*" element={<Users />} />
              <Route path="parties/*" element={<Parties />} />
              <Route path="backup/*" element={<BackupRestore />} />
              <Route path="analytics/*" element={<Analytics />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
