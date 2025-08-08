import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Menu, LogOut, User } from 'lucide-react';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          <button className="menu-button" onClick={toggleSidebar}>
            <Menu size={24} />
          </button>
          <h1 className="navbar-title">ERP System</h1>
        </div>
        
        <div className="navbar-right">
          <div className="user-info">
            <User size={20} />
            <span className="user-name">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="user-role">({user?.role})</span>
          </div>
          <button className="logout-button" onClick={logout}>
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>
      
      <style jsx>{`
        .navbar {
          background-color: #fff;
          border-bottom: 1px solid #e0e0e0;
          padding: 0 20px;
          height: 64px;
          display: flex;
          align-items: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .navbar-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }
        
        .navbar-left {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .menu-button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
        }
        
        .menu-button:hover {
          background-color: #f5f5f5;
        }
        
        .navbar-title {
          font-size: 24px;
          font-weight: 600;
          color: #333;
          margin: 0;
        }
        
        .navbar-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        
        .user-info {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #666;
          font-size: 14px;
        }
        
        .user-name {
          font-weight: 500;
        }
        
        .user-role {
          color: #999;
          font-size: 12px;
        }
        
        .logout-button {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 4px;
          color: #666;
          font-size: 14px;
          transition: background-color 0.2s;
        }
        
        .logout-button:hover {
          background-color: #f5f5f5;
          color: #333;
        }
        
        @media (max-width: 768px) {
          .navbar {
            padding: 0 10px;
          }
          
          .user-info {
            display: none;
          }
          
          .navbar-title {
            font-size: 18px;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
