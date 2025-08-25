import React, { useState } from 'react';
import { FileText, Award } from 'lucide-react';
import COC from './COC';
import DimensionReport from './DimensionReport';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('coc');

  const tabs = [
    {
      id: 'coc',
      label: 'COC',
      icon: Award,
      component: COC
    },
    {
      id: 'dimension',
      label: 'Dimension Report',
      icon: FileText,
      component: DimensionReport
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="reports-page">
      <div className="reports-header">
        <h1>Reports</h1>
        <div className="tab-navigation">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="tab-content">
        {ActiveComponent && <ActiveComponent />}
      </div>

      <style jsx>{`
        .reports-page {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .reports-header {
          padding: 24px 24px 0 24px;
          border-bottom: 1px solid #e0e0e0;
          background: white;
        }

        .reports-header h1 {
          margin: 0 0 24px 0;
          font-size: 28px;
          color: #333;
        }

        .tab-navigation {
          display: flex;
          gap: 2px;
        }

        .tab-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: #f5f5f5;
          border: none;
          border-radius: 8px 8px 0 0;
          cursor: pointer;
          font-weight: 500;
          color: #666;
          transition: all 0.2s;
        }

        .tab-button:hover {
          background: #e3f2fd;
          color: #1976d2;
        }

        .tab-button.active {
          background: white;
          color: #1976d2;
          border-bottom: 2px solid #1976d2;
        }

        .tab-content {
          flex: 1;
          background: #f8f9fa;
          overflow: auto;
        }

        @media (max-width: 768px) {
          .reports-header {
            padding: 16px 16px 0 16px;
          }
          
          .tab-navigation {
            flex-wrap: wrap;
          }
          
          .tab-button {
            flex: 1;
            min-width: 140px;
          }
        }
      `}</style>
    </div>
  );
};

export default Reports;
