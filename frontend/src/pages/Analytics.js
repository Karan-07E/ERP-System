import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, Package, AlertTriangle,
  Calendar, Download, Filter, Eye, RefreshCw, FileText, PieChart as PieChartIcon,
  BarChart3, Target, Award, Clock, CheckCircle
} from 'lucide-react';
import API_BASE_URL from '../api/config';
import ReportGenerator from '../components/ReportGenerator';

const Analytics = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Analytics data state
  const [dashboardData, setDashboardData] = useState(null);
  const [gstData, setGstData] = useState(null);
  const [jobAnalytics, setJobAnalytics] = useState(null);
  const [partyAnalysis, setPartyAnalysis] = useState(null);
  const [showReportGenerator, setShowReportGenerator] = useState(false);

  // Charts data
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'gst') fetchGSTData();
    if (activeTab === 'jobs') fetchJobAnalytics();
    if (activeTab === 'parties') fetchPartyAnalysis();
  }, [activeTab, dateRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/analytics/performance-dashboard?period=30`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGSTData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/analytics/gst-reports?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&format=detailed`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      const data = await response.json();
      if (data.success) {
        setGstData(data);
      }
    } catch (error) {
      console.error('Error fetching GST data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/analytics/job-analytics?period=30`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setJobAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching job analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPartyAnalysis = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/analytics/party-analysis?period=90&sortBy=revenue`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setPartyAnalysis(data);
      }
    } catch (error) {
      console.error('Error fetching party analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (reportType, format = 'csv') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/analytics/export/${reportType}?format=${format}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      const data = await response.json();
      // This would trigger file download in a real implementation
      console.log('Export data:', data);
      alert(`${reportType.toUpperCase()} report export initiated`);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const renderDashboard = () => (
    <div className="analytics-dashboard">
      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card revenue">
          <div className="kpi-icon">
            <DollarSign size={24} />
          </div>
          <div className="kpi-content">
            <h3>Total Revenue</h3>
            <p className="kpi-value">₹{dashboardData?.kpis?.revenue?.toLocaleString() || 0}</p>
            <span className="kpi-trend positive">
              <TrendingUp size={16} />
              +12.5%
            </span>
          </div>
        </div>

        <div className="kpi-card orders">
          <div className="kpi-icon">
            <Package size={24} />
          </div>
          <div className="kpi-content">
            <h3>Total Orders</h3>
            <p className="kpi-value">{dashboardData?.kpis?.orders || 0}</p>
            <span className="kpi-trend positive">
              <TrendingUp size={16} />
              +8.3%
            </span>
          </div>
        </div>

        <div className="kpi-card jobs">
          <div className="kpi-icon">
            <CheckCircle size={24} />
          </div>
          <div className="kpi-content">
            <h3>Completed Jobs</h3>
            <p className="kpi-value">{dashboardData?.kpis?.completedJobs || 0}</p>
            <span className="kpi-trend positive">
              <TrendingUp size={16} />
              +15.2%
            </span>
          </div>
        </div>

        <div className="kpi-card parties">
          <div className="kpi-icon">
            <Users size={24} />
          </div>
          <div className="kpi-content">
            <h3>Active Parties</h3>
            <p className="kpi-value">{dashboardData?.kpis?.activeParties || 0}</p>
            <span className="kpi-trend neutral">
              +2.1%
            </span>
          </div>
        </div>

        <div className="kpi-card quality">
          <div className="kpi-icon">
            <AlertTriangle size={24} />
          </div>
          <div className="kpi-content">
            <h3>Quality Issues</h3>
            <p className="kpi-value">{dashboardData?.kpis?.qualityIssues || 0}</p>
            <span className="kpi-trend negative">
              <TrendingDown size={16} />
              -5.4%
            </span>
          </div>
        </div>

        <div className="kpi-card inventory">
          <div className="kpi-icon">
            <Package size={24} />
          </div>
          <div className="kpi-content">
            <h3>Inventory Value</h3>
            <p className="kpi-value">₹{dashboardData?.kpis?.inventoryValue?.toLocaleString() || 0}</p>
            <span className="kpi-trend positive">
              +3.7%
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-row">
          {/* Revenue Trend */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Revenue Trend</h3>
              <button onClick={() => exportReport('revenue', 'csv')} className="btn-export">
                <Download size={16} />
                Export
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dashboardData?.trends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#0088FE" fill="#0088FE" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Orders & Jobs Trend */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Orders & Jobs Completion</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData?.trends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="orders" stroke="#00C49F" name="New Orders" />
                <Line type="monotone" dataKey="completedJobs" stroke="#FFBB28" name="Completed Jobs" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Performance */}
        <div className="chart-row">
          <div className="chart-card">
            <div className="chart-header">
              <h3>Department Performance</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData?.departmentPerformance || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completionRate" fill="#0088FE" name="Completion Rate %" />
                <Bar dataKey="avgProgress" fill="#00C49F" name="Avg Progress %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Alerts Panel */}
          <div className="alerts-panel">
            <h3>Performance Alerts</h3>
            <div className="alerts-list">
              {dashboardData?.alerts?.map((alert, index) => (
                <div key={index} className={`alert-item ${alert.type}`}>
                  <div className="alert-icon">
                    <AlertTriangle size={16} />
                  </div>
                  <div className="alert-content">
                    <p className="alert-message">{alert.message}</p>
                    <span className="alert-action">{alert.action}</span>
                  </div>
                </div>
              )) || (
                <div className="no-alerts">
                  <CheckCircle size={24} />
                  <p>No critical alerts</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGSTReports = () => (
    <div className="gst-reports">
      <div className="section-header">
        <h2>GST Compliance Reports</h2>
        <div className="report-controls">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            className="date-input"
          />
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            className="date-input"
          />
          <button onClick={() => exportReport('gst', 'pdf')} className="btn-export">
            <Download size={16} />
            Export PDF
          </button>
        </div>
      </div>

      {gstData && (
        <>
          {/* GST Summary Cards */}
          <div className="gst-summary">
            <div className="summary-card sales">
              <h3>GSTR-1 (Sales)</h3>
              <div className="summary-metrics">
                <div className="metric">
                  <label>Total Invoices</label>
                  <span>{gstData.gstr1?.summary?.invoiceCount || 0}</span>
                </div>
                <div className="metric">
                  <label>Taxable Value</label>
                  <span>₹{gstData.gstr1?.summary?.totalTaxableValue?.toLocaleString() || 0}</span>
                </div>
                <div className="metric">
                  <label>Total Tax</label>
                  <span>₹{gstData.gstr1?.summary?.totalTax?.toLocaleString() || 0}</span>
                </div>
                <div className="metric">
                  <label>Invoice Value</label>
                  <span>₹{gstData.gstr1?.summary?.totalInvoiceValue?.toLocaleString() || 0}</span>
                </div>
              </div>
            </div>

            <div className="summary-card purchases">
              <h3>GSTR-2 (Purchases)</h3>
              <div className="summary-metrics">
                <div className="metric">
                  <label>Total Invoices</label>
                  <span>{gstData.gstr2?.summary?.invoiceCount || 0}</span>
                </div>
                <div className="metric">
                  <label>Taxable Value</label>
                  <span>₹{gstData.gstr2?.summary?.totalTaxableValue?.toLocaleString() || 0}</span>
                </div>
                <div className="metric">
                  <label>Total Tax</label>
                  <span>₹{gstData.gstr2?.summary?.totalTax?.toLocaleString() || 0}</span>
                </div>
                <div className="metric">
                  <label>Invoice Value</label>
                  <span>₹{gstData.gstr2?.summary?.totalInvoiceValue?.toLocaleString() || 0}</span>
                </div>
              </div>
            </div>

            <div className="summary-card net-position">
              <h3>Net GST Position</h3>
              <div className="summary-metrics">
                <div className="metric">
                  <label>Output Tax</label>
                  <span>₹{gstData.netGSTPosition?.outputTax?.toLocaleString() || 0}</span>
                </div>
                <div className="metric">
                  <label>Input Tax</label>
                  <span>₹{gstData.netGSTPosition?.inputTax?.toLocaleString() || 0}</span>
                </div>
                <div className="metric">
                  <label>Net Tax Payable</label>
                  <span className={gstData.netGSTPosition?.netTax >= 0 ? 'positive' : 'negative'}>
                    ₹{Math.abs(gstData.netGSTPosition?.netTax || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* HSN Summary */}
          <div className="hsn-summary">
            <h3>HSN-wise Summary</h3>
            <div className="table-container">
              <table className="hsn-table">
                <thead>
                  <tr>
                    <th>HSN Code</th>
                    <th>Description</th>
                    <th>Unit</th>
                    <th>Quantity</th>
                    <th>Taxable Value</th>
                    <th>CGST</th>
                    <th>SGST</th>
                    <th>IGST</th>
                  </tr>
                </thead>
                <tbody>
                  {gstData.gstr1?.hsnSummary?.map((hsn, index) => (
                    <tr key={index}>
                      <td>{hsn.hsnCode}</td>
                      <td>{hsn.description}</td>
                      <td>{hsn.unit}</td>
                      <td>{hsn.quantity}</td>
                      <td>₹{hsn.taxableValue?.toLocaleString()}</td>
                      <td>₹{hsn.cgst?.toLocaleString()}</td>
                      <td>₹{hsn.sgst?.toLocaleString()}</td>
                      <td>₹{hsn.igst?.toLocaleString()}</td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan="8" className="no-data">No HSN data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderJobAnalytics = () => (
    <div className="job-analytics">
      <div className="section-header">
        <h2>Job Progress Analytics</h2>
        <button onClick={() => exportReport('jobs', 'excel')} className="btn-export">
          <Download size={16} />
          Export Excel
        </button>
      </div>

      {jobAnalytics && (
        <>
          {/* Job Performance Metrics */}
          <div className="job-metrics">
            <div className="metric-card">
              <div className="metric-icon">
                <Target size={24} />
              </div>
              <div className="metric-content">
                <h3>Total Jobs</h3>
                <p className="metric-value">{jobAnalytics.summary?.totalJobs || 0}</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">
                <CheckCircle size={24} />
              </div>
              <div className="metric-content">
                <h3>Completed</h3>
                <p className="metric-value">{jobAnalytics.summary?.completedJobs || 0}</p>
                <span className="completion-rate">
                  {jobAnalytics.summary?.totalJobs > 0 
                    ? ((jobAnalytics.summary.completedJobs / jobAnalytics.summary.totalJobs) * 100).toFixed(1)
                    : 0}% completion
                </span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">
                <Clock size={24} />
              </div>
              <div className="metric-content">
                <h3>On-Time Delivery</h3>
                <p className="metric-value">{jobAnalytics.summary?.onTimeDelivery || 0}%</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">
                <Award size={24} />
              </div>
              <div className="metric-content">
                <h3>Efficiency Rate</h3>
                <p className="metric-value">{jobAnalytics.summary?.efficiencyRate || 0}%</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">
                <AlertTriangle size={24} />
              </div>
              <div className="metric-content">
                <h3>Delayed Jobs</h3>
                <p className="metric-value">{jobAnalytics.summary?.delayedJobs || 0}</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">
                <Clock size={24} />
              </div>
              <div className="metric-content">
                <h3>Avg Completion Time</h3>
                <p className="metric-value">{jobAnalytics.summary?.averageCompletionTime?.toFixed(1) || 0}</p>
                <span className="metric-unit">days</span>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="job-charts">
            <div className="chart-row">
              {/* Department Performance */}
              <div className="chart-card">
                <h3>Department Performance</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={jobAnalytics.departmentPerformance || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completedJobs" fill="#00C49F" name="Completed" />
                    <Bar dataKey="inProgressJobs" fill="#FFBB28" name="In Progress" />
                    <Bar dataKey="delayedJobs" fill="#FF8042" name="Delayed" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Job Completion Trend */}
              <div className="chart-card">
                <h3>Daily Job Completion Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={jobAnalytics.trendData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="completed" stroke="#00C49F" name="Completed Jobs" />
                    <Line type="monotone" dataKey="started" stroke="#0088FE" name="Started Jobs" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Process Analysis */}
            <div className="process-analysis">
              <h3>Process-wise Analysis</h3>
              <div className="table-container">
                <table className="process-table">
                  <thead>
                    <tr>
                      <th>Process Name</th>
                      <th>Total Steps</th>
                      <th>Completed</th>
                      <th>Delayed</th>
                      <th>Success Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobAnalytics.processAnalysis?.map((process, index) => (
                      <tr key={index}>
                        <td>{process.processName}</td>
                        <td>{process.totalSteps}</td>
                        <td>{process.completedSteps}</td>
                        <td>{process.delayedSteps}</td>
                        <td>
                          {process.totalSteps > 0 
                            ? ((process.completedSteps / process.totalSteps) * 100).toFixed(1)
                            : 0}%
                        </td>
                      </tr>
                    )) || (
                      <tr>
                        <td colSpan="5" className="no-data">No process data available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderPartyAnalysis = () => (
    <div className="party-analysis">
      <div className="section-header">
        <h2>Party-wise Sales Analysis</h2>
        <button onClick={() => exportReport('parties', 'pdf')} className="btn-export">
          <Download size={16} />
          Export PDF
        </button>
      </div>

      {partyAnalysis && (
        <>
          {/* Summary Cards */}
          <div className="party-summary">
            <div className="summary-card">
              <h3>Total Parties</h3>
              <p className="summary-value">{partyAnalysis.summary?.totalParties || 0}</p>
            </div>
            <div className="summary-card">
              <h3>Active Parties</h3>
              <p className="summary-value">{partyAnalysis.summary?.activeParties || 0}</p>
              <span className="summary-percentage">
                {partyAnalysis.summary?.totalParties > 0 
                  ? ((partyAnalysis.summary.activeParties / partyAnalysis.summary.totalParties) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
            <div className="summary-card">
              <h3>Total Revenue</h3>
              <p className="summary-value">₹{partyAnalysis.summary?.totalRevenue?.toLocaleString() || 0}</p>
            </div>
            <div className="summary-card">
              <h3>Avg Order Value</h3>
              <p className="summary-value">₹{partyAnalysis.summary?.avgOrderValue?.toLocaleString() || 0}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="party-charts">
            <div className="chart-row">
              {/* Geographic Distribution */}
              <div className="chart-card">
                <h3>Geographic Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={partyAnalysis.geographicDistribution?.slice(0, 8) || []}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="totalRevenue"
                      label={({ location, percent }) => `${location} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {partyAnalysis.geographicDistribution?.slice(0, 8).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Customer Lifecycle */}
              <div className="chart-card">
                <h3>Customer Lifecycle Analysis</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: 'New', count: partyAnalysis.lifecycleAnalysis?.new || 0, color: '#00C49F' },
                    { name: 'Growing', count: partyAnalysis.lifecycleAnalysis?.growing || 0, color: '#0088FE' },
                    { name: 'Mature', count: partyAnalysis.lifecycleAnalysis?.mature || 0, color: '#FFBB28' },
                    { name: 'Dormant', count: partyAnalysis.lifecycleAnalysis?.dormant || 0, color: '#FF8042' }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8">
                      {[
                        { name: 'New', count: partyAnalysis.lifecycleAnalysis?.new || 0, color: '#00C49F' },
                        { name: 'Growing', count: partyAnalysis.lifecycleAnalysis?.growing || 0, color: '#0088FE' },
                        { name: 'Mature', count: partyAnalysis.lifecycleAnalysis?.mature || 0, color: '#FFBB28' },
                        { name: 'Dormant', count: partyAnalysis.lifecycleAnalysis?.dormant || 0, color: '#FF8042' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Top Performers Table */}
          <div className="top-performers">
            <h3>Top Performing Parties</h3>
            <div className="table-container">
              <table className="party-table">
                <thead>
                  <tr>
                    <th>Party Name</th>
                    <th>Type</th>
                    <th>Location</th>
                    <th>Total Orders</th>
                    <th>Total Revenue</th>
                    <th>Avg Order Value</th>
                    <th>Last Order</th>
                    <th>Risk Score</th>
                  </tr>
                </thead>
                <tbody>
                  {partyAnalysis.summary?.topPerformers?.slice(0, 10).map((party, index) => (
                    <tr key={party.partyId}>
                      <td className="party-name">
                        <strong>{party.name}</strong>
                        <div className="company-name">{party.companyName}</div>
                      </td>
                      <td>
                        <span className={`type-badge ${party.type}`}>
                          {party.type}
                        </span>
                      </td>
                      <td>{party.location}</td>
                      <td>{party.totalOrders}</td>
                      <td>₹{party.totalRevenue?.toLocaleString()}</td>
                      <td>₹{party.avgOrderValue?.toLocaleString()}</td>
                      <td>
                        {party.lastOrderDate 
                          ? new Date(party.lastOrderDate).toLocaleDateString()
                          : 'Never'
                        }
                        {party.daysSinceLastOrder && (
                          <div className="days-ago">{party.daysSinceLastOrder} days ago</div>
                        )}
                      </td>
                      <td>
                        <span className={`risk-score ${
                          party.riskScore > 70 ? 'high' : 
                          party.riskScore > 40 ? 'medium' : 'low'
                        }`}>
                          {party.riskScore}%
                        </span>
                      </td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan="8" className="no-data">No party data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">
          <BarChart3 size={24} />
          <div>
            <h1>Advanced Analytics</h1>
            <p>Comprehensive reporting and business intelligence</p>
          </div>
        </div>
        <div className="page-actions">
          <button 
            onClick={() => setShowReportGenerator(true)} 
            className="btn-generate-report"
          >
            <Download size={16} />
            Generate Report
          </button>
          <button onClick={() => window.location.reload()} className="btn-refresh">
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <PieChartIcon size={16} />
          Performance Dashboard
        </button>
        <button
          className={`tab ${activeTab === 'gst' ? 'active' : ''}`}
          onClick={() => setActiveTab('gst')}
        >
          <FileText size={16} />
          GST Reports
        </button>
        <button
          className={`tab ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('jobs')}
        >
          <Target size={16} />
          Job Analytics
        </button>
        <button
          className={`tab ${activeTab === 'parties' ? 'active' : ''}`}
          onClick={() => setActiveTab('parties')}
        >
          <Users size={16} />
          Party Analysis
        </button>
      </div>

      {/* Content */}
      <div className="tab-content">
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading analytics data...</p>
          </div>
        )}

        {!loading && (
          <>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'gst' && renderGSTReports()}
            {activeTab === 'jobs' && renderJobAnalytics()}
            {activeTab === 'parties' && renderPartyAnalysis()}
          </>
        )}
      </div>

      {/* Report Generator Modal */}
      {showReportGenerator && (
        <ReportGenerator onClose={() => setShowReportGenerator(false)} />
      )}

      <style jsx>{`
        .page {
          padding: 20px;
          background: #f8fafc;
          min-height: 100vh;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .page-title {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .page-title h1 {
          margin: 0;
          color: #1a202c;
          font-size: 24px;
          font-weight: 600;
        }

        .page-title p {
          margin: 5px 0 0 0;
          color: #64748b;
          font-size: 14px;
        }

        .page-actions {
          display: flex;
          gap: 10px;
        }

        .btn-refresh {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s;
        }

        .btn-refresh:hover {
          background: #2563eb;
        }

        .btn-generate-report {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s;
        }

        .btn-generate-report:hover {
          background: #059669;
        }

        .tab-navigation {
          display: flex;
          background: white;
          border-radius: 12px;
          padding: 6px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          overflow-x: auto;
        }

        .tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: transparent;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .tab:hover {
          background: #f1f5f9;
          color: #1e293b;
        }

        .tab.active {
          background: #3b82f6;
          color: white;
        }

        .tab-content {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px;
          color: #64748b;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e2e8f0;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Dashboard Styles */
        .analytics-dashboard {
          padding: 20px;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .kpi-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          border-left: 4px solid #3b82f6;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .kpi-card.revenue { border-left-color: #10b981; }
        .kpi-card.orders { border-left-color: #3b82f6; }
        .kpi-card.jobs { border-left-color: #8b5cf6; }
        .kpi-card.parties { border-left-color: #f59e0b; }
        .kpi-card.quality { border-left-color: #ef4444; }
        .kpi-card.inventory { border-left-color: #06b6d4; }

        .kpi-icon {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f1f5f9;
          color: #3b82f6;
        }

        .kpi-content h3 {
          margin: 0 0 5px 0;
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
        }

        .kpi-value {
          margin: 0 0 5px 0;
          color: #1a202c;
          font-size: 24px;
          font-weight: 700;
        }

        .kpi-trend {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .kpi-trend.positive { color: #10b981; }
        .kpi-trend.negative { color: #ef4444; }
        .kpi-trend.neutral { color: #64748b; }

        .charts-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .chart-row {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
        }

        .chart-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .chart-header h3 {
          margin: 0;
          color: #1a202c;
          font-size: 16px;
          font-weight: 600;
        }

        .btn-export {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #f1f5f9;
          color: #3b82f6;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
        }

        .btn-export:hover {
          background: #e2e8f0;
        }

        .alerts-panel {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .alerts-panel h3 {
          margin: 0 0 20px 0;
          color: #1a202c;
          font-size: 16px;
          font-weight: 600;
        }

        .alerts-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .alert-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px;
          border-radius: 8px;
          border-left: 4px solid;
        }

        .alert-item.warning {
          background: #fef3c7;
          border-left-color: #f59e0b;
        }

        .alert-item.error {
          background: #fee2e2;
          border-left-color: #ef4444;
        }

        .alert-item.info {
          background: #dbeafe;
          border-left-color: #3b82f6;
        }

        .alert-icon {
          color: inherit;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .alert-content {
          flex: 1;
        }

        .alert-message {
          margin: 0 0 4px 0;
          font-size: 14px;
          font-weight: 500;
          color: #1a202c;
        }

        .alert-action {
          font-size: 12px;
          color: #64748b;
        }

        .no-alerts {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 30px;
          color: #10b981;
          text-align: center;
        }

        /* GST Reports Styles */
        .gst-reports {
          padding: 20px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .section-header h2 {
          margin: 0;
          color: #1a202c;
          font-size: 20px;
          font-weight: 600;
        }

        .report-controls {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .date-input {
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 14px;
        }

        .gst-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .summary-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          border-top: 4px solid #3b82f6;
        }

        .summary-card.sales { border-top-color: #10b981; }
        .summary-card.purchases { border-top-color: #f59e0b; }
        .summary-card.net-position { border-top-color: #8b5cf6; }

        .summary-card h3 {
          margin: 0 0 20px 0;
          color: #1a202c;
          font-size: 16px;
          font-weight: 600;
        }

        .summary-metrics {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .metric {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .metric label {
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
        }

        .metric span {
          font-size: 16px;
          color: #1a202c;
          font-weight: 600;
        }

        .metric span.positive { color: #10b981; }
        .metric span.negative { color: #ef4444; }

        .hsn-summary {
          margin-top: 30px;
        }

        .hsn-summary h3 {
          margin: 0 0 20px 0;
          color: #1a202c;
          font-size: 18px;
          font-weight: 600;
        }

        .table-container {
          overflow-x: auto;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .hsn-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
        }

        .hsn-table th,
        .hsn-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }

        .hsn-table th {
          background: #f8fafc;
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }

        .hsn-table td {
          font-size: 14px;
          color: #1f2937;
        }

        .no-data {
          text-align: center;
          color: #64748b;
          font-style: italic;
          padding: 30px;
        }

        /* Job Analytics Styles */
        .job-analytics {
          padding: 20px;
        }

        .job-metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .metric-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .metric-icon {
          width: 45px;
          height: 45px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f1f5f9;
          color: #3b82f6;
        }

        .metric-content h3 {
          margin: 0 0 5px 0;
          color: #64748b;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .metric-value {
          margin: 0 0 5px 0;
          color: #1a202c;
          font-size: 20px;
          font-weight: 700;
        }

        .completion-rate,
        .metric-unit {
          font-size: 12px;
          color: #10b981;
          font-weight: 500;
        }

        .job-charts {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .process-analysis {
          margin-top: 30px;
        }

        .process-analysis h3 {
          margin: 0 0 20px 0;
          color: #1a202c;
          font-size: 18px;
          font-weight: 600;
        }

        .process-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
        }

        .process-table th,
        .process-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }

        .process-table th {
          background: #f8fafc;
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }

        /* Party Analysis Styles */
        .party-analysis {
          padding: 20px;
        }

        .party-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .summary-value {
          margin: 10px 0 5px 0;
          color: #1a202c;
          font-size: 24px;
          font-weight: 700;
        }

        .summary-percentage {
          font-size: 12px;
          color: #10b981;
          font-weight: 500;
        }

        .party-charts {
          margin-bottom: 30px;
        }

        .top-performers {
          margin-top: 30px;
        }

        .top-performers h3 {
          margin: 0 0 20px 0;
          color: #1a202c;
          font-size: 18px;
          font-weight: 600;
        }

        .party-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
        }

        .party-table th,
        .party-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }

        .party-table th {
          background: #f8fafc;
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }

        .party-name strong {
          color: #1a202c;
          font-weight: 600;
        }

        .company-name {
          font-size: 12px;
          color: #64748b;
          margin-top: 2px;
        }

        .type-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .type-badge.customer {
          background: #dbeafe;
          color: #1e40af;
        }

        .type-badge.vendor {
          background: #fef3c7;
          color: #92400e;
        }

        .days-ago {
          font-size: 11px;
          color: #64748b;
          margin-top: 2px;
        }

        .risk-score {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .risk-score.low {
          background: #d1fae5;
          color: #065f46;
        }

        .risk-score.medium {
          background: #fef3c7;
          color: #92400e;
        }

        .risk-score.high {
          background: #fee2e2;
          color: #991b1b;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .page {
            padding: 15px;
          }

          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }

          .kpi-grid {
            grid-template-columns: 1fr;
          }

          .chart-row {
            grid-template-columns: 1fr;
          }

          .tab-navigation {
            overflow-x: auto;
          }

          .report-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .gst-summary {
            grid-template-columns: 1fr;
          }

          .job-metrics {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          }

          .party-summary {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Analytics;
