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
  Eye,
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
      'open': 'bg-blue-100 text-blue-800',
      'processing': 'bg-yellow-100 text-yellow-800',
      'in_progress': 'bg-yellow-100 text-yellow-800',
      'assigned': 'bg-gray-100 text-gray-800',
      'completed': 'bg-green-100 text-green-800',
      'on_hold': 'bg-red-100 text-red-800',
      'hold': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'text-green-600',
      'medium': 'text-yellow-600',
      'high': 'text-orange-600',
      'urgent': 'text-red-600'
    };
    return colors[priority] || 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ERP Dashboard</h1>
          <p className="text-gray-600">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className={`bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 ${
            refreshing ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Alert Section - Flagged Negatives */}
      {dashboardData.flaggedOrders?.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold text-red-800">Flagged Issues</h3>
          </div>
          <div className="space-y-2">
            {dashboardData.flaggedOrders.map((order) => (
              <div key={order.id} className="flex justify-between items-center bg-white p-2 rounded">
                <span className="text-sm">{order.orderNumber} - {order.flagReason}</span>
                <span className="text-xs text-gray-500">{order.party?.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{dashboardData.sales.totalSales?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed Jobs</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.jobStats.completed || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Jobs</p>
              <p className="text-2xl font-bold text-gray-900">
                {(dashboardData.jobStats.assigned || 0) + (dashboardData.jobStats.in_progress || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.stockAlerts?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Jobs Dropdown */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Active Jobs</h3>
            <select className="px-3 py-1 border border-gray-300 rounded text-sm">
              <option value="all">All Active</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {dashboardData.activeJobs?.length > 0 ? (
            dashboardData.activeJobs.map((job) => (
              <div key={job.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{job.jobId}</h4>
                    <p className="text-sm text-gray-600">{job.partNumber} - {job.description}</p>
                    <p className="text-xs text-gray-500">
                      Employee: {job.Employee?.firstName} {job.Employee?.lastName}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(job.status)}`}>
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
            <div className="p-4 text-center text-gray-500">No active jobs</div>
          )}
        </div>
      </div>

      {/* Expandable Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Sales Card */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Sales
              </h3>
              <button
                onClick={() => toggleCard('sales')}
                className="text-gray-400 hover:text-gray-600"
              >
                {expandedCards.sales ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
          </div>
          <div className="p-4">
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
              <div className="mt-4 pt-4 border-t space-y-2">
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
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Package className="h-5 w-5 text-green-600" />
                Stocks
              </h3>
              <button
                onClick={() => toggleCard('stocks')}
                className="text-gray-400 hover:text-gray-600"
              >
                {expandedCards.stocks ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
          </div>
          <div className="p-4">
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
              <div className="mt-4 pt-4 border-t">
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
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-600" />
                Jobs
              </h3>
              <button
                onClick={() => toggleCard('jobs')}
                className="text-gray-400 hover:text-gray-600"
              >
                {expandedCards.jobs ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
          </div>
          <div className="p-4">
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
              <div className="mt-4 pt-4 border-t">
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
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Low Stock Alerts
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
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
    </div>
  );
};

export default Dashboard;
