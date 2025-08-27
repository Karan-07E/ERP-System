import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Package, 
  Users, 
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Zap
} from 'lucide-react';
import api from '../api/config';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    sales: { totalOrders: 0, totalSales: 0, avgOrderValue: 0 },
    purchases: { totalOrders: 0, totalPurchases: 0 },
    jobStats: {},
    activeJobs: [],
    flaggedOrders: [],
    stockAlerts: [],
    expiryAlerts: [],
    todaysJobs: [],
    overdueJobs: []
  });
  const [expandedCards, setExpandedCards] = useState({
    sales: false,
    stocks: false,
    jobs: false
  });
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/overview');
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set fallback data for demo
      setDashboardData({
        sales: { totalOrders: 12, totalSales: 125000, avgOrderValue: 10416 },
        purchases: { totalOrders: 8, totalPurchases: 85000 },
        jobStats: { assigned: 5, in_progress: 8, completed: 23, on_hold: 2 },
        activeJobs: [
          {
            id: 1,
            jobId: 'ADM001-123456-001',
            partNumber: 'PART-001',
            description: 'Steel Component',
            status: 'in_progress',
            priority: 'high',
            Employee: { firstName: 'John', lastName: 'Doe' }
          }
        ],
        stockAlerts: [
          {
            id: 1,
            name: 'Aluminum Sheet 2mm',
            materialCode: 'MAT002',
            currentStock: 15,
            minimumStock: 25,
            unit: 'SQM'
          }
        ],
        expiryAlerts: [],
        todaysJobs: [],
        overdueJobs: [],
        flaggedOrders: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await api.post('/dashboard/refresh');
      await fetchDashboardData();
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const toggleCard = (cardName) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardName]: !prev[cardName]
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      'open': 'status-open',
      'processing': 'status-processing',
      'in_progress': 'status-in-progress',
      'assigned': 'status-assigned',
      'completed': 'status-completed',
      'on_hold': 'status-on-hold',
      'hold': 'status-hold',
      'cancelled': 'status-cancelled'
    };
    return colors[status] || 'status-assigned';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'priority-low',
      'medium': 'priority-medium',
      'high': 'priority-high',
      'urgent': 'priority-urgent'
    };
    return colors[priority] || 'priority-low';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-text">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div className="page-title">
          <h1>ERP Dashboard</h1>
        </div>
        <p className="page-subtitle">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </p>
      </div>

      <div className="header-actions">
        <div></div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="refresh-button"
        >
          <RefreshCw size={20} className={refreshing ? 'refreshing' : ''} />
          Refresh
        </button>
      </div>

      {/* Alert Section - Flagged Negatives */}
      {dashboardData.flaggedOrders?.length > 0 && (
        <div className="alert-section">
          <div className="alert-header">
            <AlertTriangle className="icon-size text-red-600" />
            <h3 className="alert-title">Flagged Issues</h3>
          </div>
          <div className="alert-content">
            {dashboardData.flaggedOrders.map((order) => (
              <div key={order.id} className="alert-item">
                <span className="alert-text">{order.orderNumber} - {order.flagReason}</span>
                <span className="alert-party">{order.party?.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {/* Main Dashboard Grid */}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-title">
              <div className="icon-container bg-blue">
                <TrendingUp className="icon-size" />
              </div>
              <div>
                <p className="stat-label">Total Sales</p>
                <p className="stat-value">
                  ₹{dashboardData.sales.totalSales?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-title">
              <div className="icon-container bg-green">
                <CheckCircle className="icon-size" />
              </div>
              <div>
                <p className="stat-label">Completed Jobs</p>
                <p className="stat-value">
                  {dashboardData.jobStats.completed || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-title">
              <div className="icon-container bg-yellow">
                <Clock className="icon-size" />
              </div>
              <div>
                <p className="stat-label">Active Jobs</p>
                <p className="stat-value">
                  {(dashboardData.jobStats.assigned || 0) + (dashboardData.jobStats.in_progress || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-title">
              <div className="icon-container bg-red">
                <AlertCircle className="icon-size" />
              </div>
              <div>
                <p className="stat-label">Low Stock Items</p>
                <p className="stat-value">
                  {dashboardData.stockAlerts?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Jobs Dropdown */}
      <div className="dashboard-card">
        <div className="card-header">
          <div className="section-header">
            <h3 className="section-title">Active Jobs</h3>
            <select className="filter-select">
              <option value="all">All Active</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>
        </div>
        <div className="jobs-list">
          {dashboardData.activeJobs?.length > 0 ? (
            dashboardData.activeJobs.map((job) => (
              <div key={job.id} className="job-item">
                <div className="job-content">
                  <div className="job-details">
                    <h4 className="job-title">{job.jobId}</h4>
                    <p className="job-description">{job.partNumber} - {job.description}</p>
                    <p className="job-employee">
                      Employee: {job.Employee?.firstName} {job.Employee?.lastName}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`status-badge ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                    <p className={`text-xs font-medium mt-1 ${getPriorityColor(job.priority)}`}>
                      {job.priority}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">No active jobs</div>
          )}
        </div>
      </div>

      {/* Expandable Cards Row */}
      <div className="expandable-grid">
        {/* Sales Card */}
        <div className="dashboard-card">
          <div className="card-header">
            <div className="section-header">
              <h3 className="section-title flex items-center gap-2">
                <TrendingUp className="icon-size text-blue-600" />
                Sales
              </h3>
              <button
                onClick={() => toggleCard('sales')}
                className="text-gray-400 hover-gray-600"
              >
                {expandedCards.sales ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
          </div>
            <div className="card-padding">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Orders</span>
                <span className="font-medium">{dashboardData.sales.totalOrders}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Revenue</span>
                <span className="font-medium">₹{dashboardData.sales.totalSales?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Order Value</span>
                <span className="font-medium">₹{dashboardData.sales.avgOrderValue?.toLocaleString()}</span>
              </div>
            </div>
            {expandedCards.sales && (
              <div className="mt-4 pt-4 border-top space-y-2">
                <h4 className="font-medium text-gray-900">Purchase Summary</h4>
                <div className="text-sm text-gray-600">
                  Purchase Orders: {dashboardData.purchases.totalOrders}
                </div>
                <div className="text-sm text-gray-600">
                  Purchase Value: ₹{dashboardData.purchases.totalPurchases?.toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stocks Card */}
        <div className="expandable-card">
          <div className="card-padding border-bottom">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Package className="icon-size text-green-600" />
                Stocks
              </h3>
              <button
                onClick={() => toggleCard('stocks')}
                className="text-gray-400 hover-gray-600"
              >
                {expandedCards.stocks ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
          </div>
          <div className="card-padding">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Low Stock Items</span>
                <span className="font-medium text-red-600">{dashboardData.stockAlerts?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Expiry Alerts</span>
                <span className="font-medium text-orange-600">{dashboardData.expiryAlerts?.length || 0}</span>
              </div>
            </div>
            {expandedCards.stocks && (
              <div className="mt-4 pt-4 border-top">
                <h4 className="font-medium text-gray-900 mb-2">Stock Alerts</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {dashboardData.stockAlerts?.slice(0, 5).map((item) => (
                    <div key={item.id} className="text-xs text-gray-600 flex justify-between">
                      <span>{item.name}</span>
                      <span className="text-red-600">{item.currentStock} {item.unit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Jobs Card */}
        <div className="expandable-card">
          <div className="card-padding border-bottom">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Zap className="icon-size text-purple-600" />
                Jobs
              </h3>
              <button
                onClick={() => toggleCard('jobs')}
                className="text-gray-400 hover-gray-600"
              >
                {expandedCards.jobs ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
          </div>
          <div className="card-padding">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Today's Jobs</span>
                <span className="font-medium">{dashboardData.todaysJobs?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Overdue</span>
                <span className="font-medium text-red-600">{dashboardData.overdueJobs?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">In Progress</span>
                <span className="font-medium text-yellow-600">{dashboardData.jobStats.in_progress || 0}</span>
              </div>
            </div>
            {expandedCards.jobs && (
              <div className="mt-4 pt-4 border-top">
                <h4 className="font-medium text-gray-900 mb-2">Today's Jobs</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {dashboardData.todaysJobs?.slice(0, 3).map((job) => (
                    <div key={job.id} className="text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>{job.orderItem?.partNumber}</span>
                        <span className={getPriorityColor(job.priority)}>{job.priority}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stock Alerts */}
      {dashboardData.stockAlerts?.length > 0 && (
        <div className="expandable-card">
          <div className="card-padding border-bottom">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="icon-size text-red-600" />
              Low Stock Alerts
            </h3>
          </div>
          <div className="card-padding">
            <div className="space-y-2">
              {dashboardData.stockAlerts.slice(0, 5).map((item) => (
                <div key={item.id} className="flex justify-between items-center p-2 bg-red-50 rounded">
                  <div>
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-600">{item.materialCode}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-red-600">
                      {item.currentStock} {item.unit}
                    </div>
                    <div className="text-xs text-gray-500">
                      Min: {item.minimumStock} {item.unit}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .page {
          padding: 20px 0;
        }
        
        .page-header {
          margin-bottom: 30px;
        }
        
        .page-title {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }
        
        .page-title h1 {
          font-size: 28px;
          font-weight: 600;
          color: #333;
          margin: 0;
        }
        
        .page-subtitle {
          color: #666;
          font-size: 16px;
          margin: 0;
        }

        /* Header Actions */
        .header-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          gap: 16px;
        }

        .refresh-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .refresh-button:hover:not(:disabled) {
          background-color: #0056b3;
        }

        .refresh-button:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
        }

        .refreshing {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Alert Section */
        .alert-section {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
        }

        .alert-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .alert-title {
          font-size: 18px;
          font-weight: 600;
          color: #991b1b;
          margin: 0;
        }

        .alert-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .alert-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          padding: 8px;
          border-radius: 4px;
        }

        .alert-text {
          font-size: 14px;
          color: #111827;
        }

        .alert-party {
          font-size: 12px;
          color: #6b7280;
        }

        /* Dashboard Grid */
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }

        .dashboard-card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          border: 1px solid #e0e0e0;
          transition: box-shadow 0.2s;
        }

        .dashboard-card:hover {
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .card-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .icon-container {
          padding: 8px;
          border-radius: 8px;
        }

        .icon-container.bg-blue {
          background-color: #dbeafe;
        }

        .icon-container.bg-green {
          background-color: #dcfce7;
        }

        .icon-container.bg-yellow {
          background-color: #fef3c7;
        }

        .icon-container.bg-red {
          background-color: #fee2e2;
        }

        .icon-size {
          width: 24px;
          height: 24px;
        }

        .stat-label {
          font-size: 14px;
          font-weight: 500;
          color: #666;
          margin: 0 0 4px 0;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #333;
          margin: 0;
        }

        /* Jobs Section */
        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filter-select {
          padding: 4px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
          font-size: 14px;
          color: #333;
        }

        .jobs-list {
          max-height: 300px;
          overflow-y: auto;
        }

        .job-item {
          padding: 16px;
          border-bottom: 1px solid #f0f0f0;
          transition: background-color 0.2s;
        }

        .job-item:hover {
          background-color: #f8f9fa;
        }

        .job-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .job-details {
          flex: 1;
        }

        .job-title {
          font-weight: 500;
          color: #333;
          margin: 0 0 4px 0;
        }

        .job-description {
          font-size: 14px;
          color: #666;
          margin: 0 0 4px 0;
        }

        .job-employee {
          font-size: 12px;
          color: #999;
          margin: 0;
        }

        .status-badge {
          display: inline-flex;
          padding: 2px 8px;
          font-size: 12px;
          font-weight: 600;
          border-radius: 12px;
        }

        .status-open {
          background-color: #dbeafe;
          color: #1e40af;
        }

        .status-processing, .status-in-progress {
          background-color: #fef3c7;
          color: #92400e;
        }

        .status-assigned {
          background-color: #f3f4f6;
          color: #374151;
        }

        .status-completed {
          background-color: #dcfce7;
          color: #166534;
        }

        .status-on-hold, .status-hold {
          background-color: #fee2e2;
          color: #991b1b;
        }

        .status-cancelled {
          background-color: #f3f4f6;
          color: #374151;
        }

        .priority-low {
          color: #16a34a;
        }

        .priority-medium {
          color: #ca8a04;
        }

        .priority-high {
          color: #ea580c;
        }

        .priority-urgent {
          color: #dc2626;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #666;
        }

        /* Expandable Cards */
        .expandable-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }

        .expandable-card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          border: 1px solid #e0e0e0;
        }

        .card-padding {
          padding: 16px;
        }

        .border-bottom {
          border-bottom: 1px solid #e0e0e0;
        }

        .border-top {
          border-top: 1px solid #e0e0e0;
        }

        /* Utility Classes */
        .flex {
          display: flex;
        }

        .items-center {
          align-items: center;
        }

        .justify-between {
          justify-content: space-between;
        }

        .gap-2 {
          gap: 8px;
        }

        .text-sm {
          font-size: 14px;
        }

        .text-xs {
          font-size: 12px;
        }

        .text-lg {
          font-size: 18px;
        }

        .font-medium {
          font-weight: 500;
        }

        .font-semibold {
          font-weight: 600;
        }

        .text-gray-900 {
          color: #333;
        }

        .text-gray-600 {
          color: #666;
        }

        .text-gray-400 {
          color: #999;
        }

        .text-red-600 {
          color: #dc2626;
        }

        .text-orange-600 {
          color: #ea580c;
        }

        .text-blue-600 {
          color: #2563eb;
        }

        .text-green-600 {
          color: #16a34a;
        }

        .text-yellow-600 {
          color: #ca8a04;
        }

        .text-purple-600 {
          color: #9333ea;
        }

        .hover-gray-600:hover {
          color: #666;
        }

        .space-y-2 > * + * {
          margin-top: 8px;
        }

        .space-y-1 > * + * {
          margin-top: 4px;
        }

        .mt-4 {
          margin-top: 16px;
        }

        .pt-4 {
          padding-top: 16px;
        }

        .mb-2 {
          margin-bottom: 8px;
        }

        .mt-1 {
          margin-top: 4px;
        }

        .max-h-32 {
          max-height: 128px;
        }

        .overflow-y-auto {
          overflow-y: auto;
        }

        .bg-red-50 {
          background-color: #fef2f2;
        }

        .rounded {
          border-radius: 4px;
        }

        .rounded-lg {
          border-radius: 8px;
        }

        .text-right {
          text-align: right;
        }

        .loading-container {
          padding: 20px 0;
        }

        .loading-content {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 200px;
        }

        .loading-text {
          color: #666;
          font-size: 18px;
        }

        @media (min-width: 1024px) {
          .expandable-grid {
            grid-template-columns: 1fr 1fr 1fr;
          }
        }

        @media (max-width: 768px) {
          .page {
            padding: 16px 0;
          }

          .header-actions {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .dashboard-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .expandable-grid {
            grid-template-columns: 1fr;
          }

          .card-padding {
            padding: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
