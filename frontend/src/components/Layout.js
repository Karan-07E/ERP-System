import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="layout">
      <Navbar toggleSidebar={toggleSidebar} />
      <div className="layout-content">
        <Sidebar isOpen={sidebarOpen} />
        <main className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className="content-wrapper">
            <Outlet />
          </div>
        </main>
      </div>
      
      <style jsx>{`
        .layout {
          height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        .layout-content {
          display: flex;
          flex: 1;
          overflow: hidden;
        }
        
        .main-content {
          flex: 1;
          padding: 20px;
          background-color: #f5f5f5;
          overflow-y: auto;
          transition: margin-left 0.3s ease;
        }
        
        .main-content.sidebar-open {
          margin-left: 0;
        }
        
        .main-content.sidebar-closed {
          margin-left: 0;
        }
        
        .content-wrapper {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        @media (max-width: 768px) {
          .main-content {
            padding: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;
