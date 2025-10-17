import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Mail, Lock } from 'lucide-react';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(credentials.email, credentials.password);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <LogIn size={32} color="#007bff" />
            <h1>ERP System</h1>
            <p>Sign in to your account</p>
          </div>
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">
                <Mail size={18} />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <Lock size={18} />
                Password
              </label>
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter your password"
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary login-button"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          
          <div className="demo-credentials">
            <h3>Demo Credentials:</h3>
            <div className="credentials-list">
              <div className="credential-item">
                <strong>Admin:</strong> admin@eee.com / admin123
              </div>
              <div className="credential-item">
                <em>More users will be created after initial setup</em>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }
        
        .login-container {
          width: 100%;
          max-width: 400px;
        }
        
        .login-card {
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        .login-header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .login-header h1 {
          font-size: 28px;
          font-weight: 700;
          color: #333;
          margin: 10px 0 5px 0;
        }
        
        .login-header p {
          color: #666;
          font-size: 14px;
          margin: 0;
        }
        
        .login-form {
          margin-bottom: 30px;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-weight: 500;
          color: #333;
          font-size: 14px;
        }
        
        .form-control {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        
        .form-control:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        }
        
        .login-button {
          width: 100%;
          padding: 12px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 6px;
          transition: background-color 0.2s;
        }
        
        .login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .demo-credentials {
          border-top: 1px solid #eee;
          padding-top: 20px;
        }
        
        .demo-credentials h3 {
          font-size: 14px;
          font-weight: 600;
          color: #333;
          margin-bottom: 10px;
        }
        
        .credentials-list {
          space-y: 8px;
        }
        
        .credential-item {
          font-size: 12px;
          color: #666;
          margin-bottom: 5px;
        }
        
        .credential-item strong {
          color: #333;
        }
        
        @media (max-width: 480px) {
          .login-card {
            padding: 30px 20px;
          }
          
          .login-header h1 {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
