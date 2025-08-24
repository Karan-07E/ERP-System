import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Calculator, 
  Wrench, 
  Cog, 
  FileCheck, 
  MessageSquare, 
  Users,
  Building2,
  Shield,
  Database,
  TrendingUp
} from 'lucide-react';

const Sidebar = ({ isOpen }) => {
  const location = useLocation();

  const menuItems = [
    {
      path: '/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard'
    },
    {
      path: '/orders',
      icon: ShoppingCart,
      label: 'Orders'
    },
    {
      path: '/parties',
      icon: Building2,
      label: 'Parties'
    },
    {
      path: '/inventory',
      icon: Package,
      label: 'Inventory'
    },
    {
      path: '/accounting',
      icon: Calculator,
      label: 'Accounting'
    },
    {
      path: '/materials',
      icon: Wrench,
      label: 'Materials'
    },
    {
      path: '/processes',
      icon: Cog,
      label: 'Processes'
    },
    {
      path: '/coc',
      icon: Shield,
      label: 'COC'
    },
    {
      path: '/audit',
      icon: FileCheck,
      label: 'Audit'
    },
    {
      path: '/messages',
      icon: MessageSquare,
      label: 'Messages'
    },
    {
      path: '/users',
      icon: Users,
      label: 'Users'
    },
    {
      path: '/backup',
      icon: Database,
      label: 'Backup'
    },
    {
      path: '/analytics',
      icon: TrendingUp,
      label: 'Analytics'
    }
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            
            return (
              <li key={item.path} className="nav-item">
                <NavLink
                  to={item.path}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={20} />
                  <span className="nav-label">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <style jsx>{`
        .sidebar {
          width: 260px;
          background-color: #fff;
          border-right: 1px solid #e0e0e0;
          height: 100%;
          transition: width 0.3s ease;
          overflow: hidden;
        }
        
        .sidebar.closed {
          width: 70px;
        }
        
        .sidebar-nav {
          padding: 20px 0;
        }
        
        .nav-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .nav-item {
          margin-bottom: 5px;
        }
        
        .nav-link {
          display: flex;
          align-items: center;
          padding: 12px 20px;
          color: #666;
          text-decoration: none;
          transition: all 0.2s;
          border-right: 3px solid transparent;
        }
        
        .nav-link:hover {
          background-color: #f5f5f5;
          color: #333;
        }
        
        .nav-link.active {
          background-color: #e3f2fd;
          color: #1976d2;
          border-right-color: #1976d2;
        }
        
        .nav-label {
          margin-left: 12px;
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
          opacity: ${isOpen ? '1' : '0'};
          transition: opacity 0.3s ease;
        }
        
        .sidebar.closed .nav-link {
          justify-content: center;
          padding: 12px;
        }
        
        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            left: ${isOpen ? '0' : '-260px'};
            top: 64px;
            height: calc(100vh - 64px);
            z-index: 1000;
            box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
          }
          
          .sidebar.closed {
            left: -260px;
            width: 260px;
          }
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
