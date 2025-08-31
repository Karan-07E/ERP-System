import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit3, 
  Check, 
  X, 
  FileText,
  Calendar,
  User,
  Building2,
  Trash2,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../api/config';

const COC = () => {
  const [cocs, setCocs] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCOC, setSelectedCOC] = useState(null);
  const [formData, setFormData] = useState({
    jobId: '',
    inspectionDate: '',
    qualityStandard: '',
    testResults: '',
    remarks: '',
    dimensionReports: []
  });

  const [dimensionReport, setDimensionReport] = useState({
    parameter: '',
    specification: '',
    measuredValue: '',
    unit: '',
    tolerance: '',
    result: 'pass'
  });

  useEffect(() => {
    fetchCOCs();
    fetchJobs();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchCOCs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/coc`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: currentPage,
          limit: 10,
          search: searchTerm,
          status: statusFilter
        }
      });
      setCocs(response.data.cocs);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching COCs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/jobs`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: 'completed', limit: 100 }
      });
      setJobs(response.data.jobs || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleCreateCOC = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/coc`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowCreateModal(false);
      resetForm();
      fetchCOCs();
    } catch (error) {
      console.error('Error creating COC:', error);
      alert('Error creating COC');
    }
  };

  const handleApproveCOC = async (cocId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/coc/${cocId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCOCs();
    } catch (error) {
      console.error('Error approving COC:', error);
      alert('Error approving COC');
    }
  };

  const handleDownloadPDF = async (cocId, cocNumber) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/coc/${cocId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `COC-${cocNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error downloading PDF');
    }
  };

  const addDimensionReport = () => {
    if (dimensionReport.parameter && dimensionReport.measuredValue) {
      setFormData(prev => ({
        ...prev,
        dimensionReports: [...prev.dimensionReports, dimensionReport]
      }));
      setDimensionReport({
        parameter: '',
        specification: '',
        measuredValue: '',
        unit: '',
        tolerance: '',
        result: 'pass'
      });
    }
  };

  const removeDimensionReport = (index) => {
    setFormData(prev => ({
      ...prev,
      dimensionReports: prev.dimensionReports.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setFormData({
      jobId: '',
      inspectionDate: '',
      qualityStandard: '',
      testResults: '',
      remarks: '',
      dimensionReports: []
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      draft: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <React.Fragment>
      <div className="coc-page">
        <div className="coc-container">
          <div className="content-wrapper">
        {/* Header */}
        <div className="page-header">
          <div className="page-title">
            <FileText size={24} />
            <h1>Certificate of Conformance</h1>
          </div>
          <p>Manage quality certificates and compliance documents</p>
          <div className="header-actions">
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              <Plus size={20} />
              Create COC
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="controls">
          <div className="search-section">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search by COC number, job, or order..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="action-buttons">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="approved">Approved</option>
            </select>
            <button
              onClick={fetchCOCs}
              className="btn btn-secondary"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>

        {/* COC List */}
        <div className="data-section">
          {loading ? (
            <div className="loading">Loading COCs...</div>
          ) : cocs.length === 0 ? (
            <div className="empty-state">
              <FileText size={48} />
              <h3>No COCs found</h3>
              <p>Create your first Certificate of Conformance to get started.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary"
              >
                <Plus size={20} />
                Create COC
              </button>
            </div>
          ) : (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>COC Details</th>
                    <th>Job & Order</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cocs.map((coc) => (
                    <tr key={coc.id}>
                      <td>
                        <div>
                          <div className="font-medium">{coc.cocNumber}</div>
                          <div className="text-sm text-gray-500">
                            Inspection: {formatDate(coc.inspectionDate)}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="font-medium">
                            {coc.job?.jobNumber || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            Order: {coc.job?.orderItem?.order?.orderNumber || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          {coc.job?.orderItem?.order?.party?.name || 'N/A'}
                        </div>
                      </td>
                      <td>
                        {getStatusBadge(coc.status)}
                      </td>
                      <td>
                        {formatDate(coc.createdAt)}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => {
                              setSelectedCOC(coc);
                              setShowViewModal(true);
                            }}
                            className="btn-icon"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(coc.id, coc.cocNumber)}
                            className="btn-icon btn-success"
                            title="Download PDF"
                          >
                            <Download size={16} />
                          </button>
                          {coc.status === 'draft' && (
                            <button
                              onClick={() => handleApproveCOC(coc.id)}
                              className="btn-icon btn-primary"
                              title="Approve COC"
                            >
                              <Check size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <div className="pagination-info">
                  <p>
                    Page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div className="pagination-buttons">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="pagination-button"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`pagination-button ${
                        page === currentPage ? 'active' : ''
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="pagination-button"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
            </div>
          )
        </div>
      </div>
      </div>

      {/* Create COC Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Certificate of Conformance</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="close-button"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">

            <form onSubmit={handleCreateCOC} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job
                </label>
                <select
                  value={formData.jobId}
                  onChange={(e) => setFormData(prev => ({ ...prev, jobId: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select a completed job</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.jobNumber} - {job.orderItem?.productName || 'N/A'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Inspection Date
                </label>
                <input
                  type="date"
                  value={formData.inspectionDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, inspectionDate: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quality Standard
                </label>
                <textarea
                  value={formData.qualityStandard}
                  onChange={(e) => setFormData(prev => ({ ...prev, qualityStandard: e.target.value }))}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter quality standards and specifications..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Results
                </label>
                <textarea
                  value={formData.testResults}
                  onChange={(e) => setFormData(prev => ({ ...prev, testResults: e.target.value }))}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter test results and measurements..."
                />
              </div>

              {/* Dimension Reports Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dimension Reports
                </label>
                
                {/* Add Dimension Report */}
                <div className="bg-gray-50 p-4 rounded-md mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <input
                      type="text"
                      placeholder="Parameter"
                      value={dimensionReport.parameter}
                      onChange={(e) => setDimensionReport(prev => ({ ...prev, parameter: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Measured Value"
                      value={dimensionReport.measuredValue}
                      onChange={(e) => setDimensionReport(prev => ({ ...prev, measuredValue: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Unit"
                      value={dimensionReport.unit}
                      onChange={(e) => setDimensionReport(prev => ({ ...prev, unit: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div className="flex gap-3 items-center">
                    <input
                      type="text"
                      placeholder="Specification"
                      value={dimensionReport.specification}
                      onChange={(e) => setDimensionReport(prev => ({ ...prev, specification: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Tolerance"
                      value={dimensionReport.tolerance}
                      onChange={(e) => setDimensionReport(prev => ({ ...prev, tolerance: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    <select
                      value={dimensionReport.result}
                      onChange={(e) => setDimensionReport(prev => ({ ...prev, result: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="pass">Pass</option>
                      <option value="fail">Fail</option>
                    </select>
                    <button
                      type="button"
                      onClick={addDimensionReport}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Display Added Reports */}
                {formData.dimensionReports.length > 0 && (
                  <div className="space-y-2">
                    {formData.dimensionReports.map((report, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-3 border rounded-md">
                        <div className="flex-1">
                          <span className="font-medium">{report.parameter}</span>: {report.measuredValue} {report.unit}
                          {report.specification && <span className="text-gray-500"> (Spec: {report.specification})</span>}
                          <span className={`ml-2 px-2 py-1 text-xs rounded ${
                            report.result === 'pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {report.result.toUpperCase()}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDimensionReport(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks
                </label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Additional remarks or notes..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors"
                >
                  Create COC
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {/* View COC Modal */}
      {showViewModal && selectedCOC && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-xl shadow-2xl w-11/12 md:w-3/4 lg:w-2/3 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">
                  Certificate of Conformance - {selectedCOC.cocNumber}
                </h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6">

            <div className="space-y-6">
              {/* COC Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">COC Number</label>
                  <p className="text-sm text-gray-900">{selectedCOC.cocNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedCOC.status)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Inspection Date</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedCOC.inspectionDate)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created Date</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedCOC.createdAt)}</p>
                </div>
              </div>

              {/* Job and Order Info */}
              {selectedCOC.job && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Job & Order Information</h4>
                  <div className="bg-gray-50 p-4 rounded-md grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Job Number</label>
                      <p className="text-sm text-gray-900">{selectedCOC.job.jobNumber}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Order Number</label>
                      <p className="text-sm text-gray-900">{selectedCOC.job.orderItem?.order?.orderNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Product</label>
                      <p className="text-sm text-gray-900">{selectedCOC.job.orderItem?.productName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Customer</label>
                      <p className="text-sm text-gray-900">{selectedCOC.job.orderItem?.order?.party?.name || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quality Standards */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quality Standard</label>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedCOC.qualityStandard}</p>
                </div>
              </div>

              {/* Test Results */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Test Results</label>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedCOC.testResults}</p>
                </div>
              </div>

              {/* Dimension Reports */}
              {selectedCOC.dimensionReports && selectedCOC.dimensionReports.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dimension Reports</label>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Parameter</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Specification</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Measured</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tolerance</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Result</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {selectedCOC.dimensionReports.map((report, index) => (
                            <tr key={index}>
                              <td className="px-3 py-2 text-sm text-gray-900">{report.parameter}</td>
                              <td className="px-3 py-2 text-sm text-gray-900">{report.specification || '-'}</td>
                              <td className="px-3 py-2 text-sm text-gray-900">{report.measuredValue} {report.unit}</td>
                              <td className="px-3 py-2 text-sm text-gray-900">{report.tolerance || '-'}</td>
                              <td className="px-3 py-2">
                                <span className={`px-2 py-1 text-xs rounded ${report.result === 'pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {report.result?.toUpperCase()}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Remarks */}
              {selectedCOC.remarks && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedCOC.remarks}</p>
                  </div>
                </div>
              )}

              {/* Approval Info */}
              {selectedCOC.status === 'approved' && selectedCOC.Approver && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Approval Information</label>
                  <div className="bg-green-50 p-4 rounded-md">
                    <p className="text-sm text-gray-900">
                      Approved by: {selectedCOC.Approver.name}<br />
                      Approved on: {formatDate(selectedCOC.approvedAt)}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => handleDownloadPDF(selectedCOC.id, selectedCOC.cocNumber)}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-colors flex items-center gap-2"
                >
                  <Download size={16} />
                  Download PDF
                </button>
                {selectedCOC.status === 'draft' && (
                  <button
                    onClick={() => {
                      handleApproveCOC(selectedCOC.id);
                      setShowViewModal(false);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-colors flex items-center gap-2"
                  >
                    <Check size={16} />
                    Approve COC
                  </button>
                )}
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
      .coc-page {
        min-height: 100vh;
        background-color: #f8fafc;
      }

      .coc-container {
        padding: 20px 0;
      }

      .content-wrapper {
        max-width: 1280px;
        margin: 0 auto;
        padding: 0 16px;
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
      
      .page-header p {
        color: #666;
        font-size: 16px;
        margin: 0 0 20px 0;
      }

      .header-actions {
        margin-top: 16px;
      }

      /* Controls */
      .controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        gap: 16px;
      }

      .search-section {
        display: flex;
        gap: 12px;
        flex: 1;
        max-width: 400px;
      }

      .search-box {
        position: relative;
        flex: 1;
      }

      .search-box svg {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: #666;
      }

      .search-box input {
        width: 100%;
        padding: 10px 10px 10px 40px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
      }

      .action-buttons {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .filter-select {
        padding: 10px 12px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
        background: white;
        min-width: 140px;
      }

      /* Data Section */
      .data-section {
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        border: 1px solid #e0e0e0;
      }

      .loading {
        text-align: center;
        padding: 60px 20px;
        font-size: 18px;
        color: #666;
      }

      .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: #666;
      }

      .empty-state svg {
        color: #ccc;
        margin-bottom: 16px;
      }

      .empty-state h3 {
        font-size: 20px;
        margin-bottom: 8px;
        color: #333;
      }

      .empty-state p {
        margin-bottom: 24px;
      }

      .data-table-container {
        overflow-x: auto;
      }

      .data-table {
        width: 100%;
        border-collapse: collapse;
      }

      .data-table th {
        background-color: #f8f9fa;
        padding: 12px;
        text-align: left;
        font-weight: 600;
        color: #333;
        border-bottom: 1px solid #e0e0e0;
        white-space: nowrap;
      }

      .data-table td {
        padding: 12px;
        border-bottom: 1px solid #f0f0f0;
        color: #333;
      }

      .data-table tr:hover {
        background-color: #f8f9fa;
      }

      .font-medium {
        font-weight: 500;
      }

      .text-sm {
        font-size: 12px;
      }

      .text-gray-500 {
        color: #6b7280;
      }

      .action-buttons {
        display: flex;
        gap: 4px;
      }

      /* Buttons */
      .btn {
        padding: 10px 20px;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        border: 1px solid transparent;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .btn-primary {
        background-color: #007bff;
        color: white;
        border-color: #007bff;
      }

      .btn-primary:hover:not(:disabled) {
        background-color: #0056b3;
        border-color: #0056b3;
      }

      .btn-secondary {
        background-color: #6c757d;
        color: white;
        border-color: #6c757d;
      }

      .btn-secondary:hover {
        background-color: #5a6268;
        border-color: #5a6268;
      }

      .btn-icon {
        background: #f8f9fa;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        padding: 6px;
        cursor: pointer;
        color: #666;
        transition: all 0.2s;
      }

      .btn-icon:hover {
        background: #e9ecef;
        color: #007bff;
      }

      .btn-icon.btn-success:hover {
        background: #d4edda;
        color: #28a745;
      }

      .btn-icon.btn-primary:hover {
        background: #dbeafe;
        color: #007bff;
      }

      /* Status badges */
      .bg-yellow-100 { background-color: #fef3c7; }
      .text-yellow-800 { color: #92400e; }
      .bg-green-100 { background-color: #dcfce7; }
      .text-green-800 { color: #166534; }
      .bg-gray-100 { background-color: #f3f4f6; }
      .text-gray-800 { color: #1f2937; }

      /* Pagination */
      .pagination {
        padding: 16px 24px;
        border-top: 1px solid #e0e0e0;
        background-color: #f8f9fa;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .pagination-info {
        font-size: 14px;
        color: #374151;
        font-weight: 500;
      }

      .pagination-buttons {
        display: flex;
        gap: 8px;
      }

      .pagination-button {
        padding: 8px 16px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        background: white;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 14px;
      }

      .pagination-button:hover:not(:disabled) {
        background-color: #f9fafb;
      }

      .pagination-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .pagination-button.active {
        background-color: #007bff;
        color: white;
        border-color: #007bff;
      }

      /* Modal Styles */
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }

      .modal {
        background: white;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        max-width: 700px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid #e0e0e0;
        background: white;
      }

      .modal-header h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #333;
      }

      .close-button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 5px;
        border-radius: 4px;
        color: #666;
      }

      .close-button:hover {
        background-color: #f0f0f0;
        color: #333;
      }

      .modal-body {
        padding: 20px;
      }

      .form-group {
        margin-bottom: 16px;
      }

      .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: 500;
        color: #333;
      }

      .form-group input,
      .form-group select,
      .form-group textarea {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        font-family: inherit;
      }

      .form-group input:focus,
      .form-group select:focus,
      .form-group textarea:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
      }

      @media (max-width: 768px) {
        .controls {
          flex-direction: column;
          align-items: stretch;
          gap: 12px;
        }

        .search-section {
          max-width: none;
        }

        .modal {
          width: 95%;
          margin: 10px;
        }
      }      .content-wrapper {
        max-width: 1280px;
        margin: 0 auto;
        padding: 0 16px;
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
      
      .page-header p {
        color: #666;
        font-size: 16px;
        margin: 0;
      }

      .create-button {
        background: linear-gradient(to right, #2563eb, #1d4ed8);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: all 0.2s;
        font-weight: 500;
      }

      .create-button:hover {
        background: linear-gradient(to right, #1d4ed8, #1e40af);
        box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
      }

      .filters-card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border: 1px solid #e5e7eb;
        padding: 24px;
        margin-bottom: 24px;
      }

      .filters-content {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      @media (min-width: 1024px) {
        .filters-content {
          flex-direction: row;
        }
      }

      .search-container {
        flex: 1;
        position: relative;
      }

      .search-input {
        width: 100%;
        padding: 12px 12px 12px 48px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 14px;
        transition: all 0.2s;
      }

      .search-input:focus {
        outline: none;
        ring: 2px;
        ring-color: #3b82f6;
        border-color: #3b82f6;
      }

      .search-icon {
        position: absolute;
        left: 16px;
        top: 50%;
        transform: translateY(-50%);
        color: #9ca3af;
      }

      .filter-controls {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      @media (min-width: 640px) {
        .filter-controls {
          flex-direction: row;
        }
      }

      .filter-select {
        padding: 12px 16px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        background: white;
        min-width: 140px;
        font-size: 14px;
        transition: all 0.2s;
      }

      .filter-select:focus {
        outline: none;
        ring: 2px;
        ring-color: #3b82f6;
        border-color: #3b82f6;
      }

      .table-card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border: 1px solid #e5e7eb;
        overflow: hidden;
      }

      .empty-state {
        padding: 48px;
        text-align: center;
      }

      .empty-icon {
        margin: 0 auto 24px;
        color: #d1d5db;
      }

      .empty-title {
        font-size: 20px;
        font-weight: 500;
        color: #111827;
        margin-bottom: 12px;
      }

      .empty-description {
        color: #6b7280;
        margin-bottom: 24px;
      }

      .data-table {
        min-width: 100%;
        overflow-x: auto;
      }

      .table {
        min-width: 100%;
        border-collapse: separate;
        border-spacing: 0;
      }

      .table-header {
        background-color: #f9fafb;
      }

      .table-header th {
        padding: 16px 24px;
        text-align: left;
        font-size: 12px;
        font-weight: 500;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border-bottom: 1px solid #e5e7eb;
      }

      .table-body {
        background: white;
      }

      .table-row {
        transition: background-color 0.2s;
      }

      .table-row:hover {
        background-color: #f9fafb;
      }

      .table-cell {
        padding: 16px 24px;
        white-space: nowrap;
        border-bottom: 1px solid #e5e7eb;
      }

      .coc-id {
        font-family: 'Monaco', monospace;
        font-size: 14px;
        font-weight: 500;
        color: #111827;
      }

      .job-info {
        display: flex;
        flex-direction: column;
      }

      .job-title {
        font-size: 14px;
        font-weight: 500;
        color: #111827;
      }

      .job-number {
        font-size: 12px;
        color: #6b7280;
        margin-top: 2px;
      }

      .date-info {
        font-size: 14px;
        color: #111827;
      }

      .status-badge {
        display: inline-flex;
        padding: 2px 8px;
        font-size: 12px;
        font-weight: 600;
        border-radius: 9999px;
      }

      .status-pending {
        background-color: #fef3c7;
        color: #d97706;
      }

      .status-in-progress {
        background-color: #dbeafe;
        color: #2563eb;
      }

      .status-completed {
        background-color: #dcfce7;
        color: #16a34a;
      }

      .status-approved {
        background-color: #dcfce7;
        color: #16a34a;
      }

      .status-rejected {
        background-color: #fee2e2;
        color: #dc2626;
      }

      .actions-container {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .action-button {
        padding: 8px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .action-view {
        color: #2563eb;
        background-color: #dbeafe;
      }

      .action-view:hover {
        color: #1d4ed8;
        background-color: #bfdbfe;
      }

      .action-edit {
        color: #7c3aed;
        background-color: #e9d5ff;
      }

      .action-edit:hover {
        color: #6d28d9;
        background-color: #ddd6fe;
      }

      .action-delete {
        color: #dc2626;
        background-color: #fee2e2;
      }

      .action-delete:hover {
        color: #b91c1c;
        background-color: #fecaca;
      }

      .pagination {
        padding: 16px 24px;
        border-top: 1px solid #e5e7eb;
        background-color: #f9fafb;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .pagination-info {
        font-size: 14px;
        color: #374151;
        font-weight: 500;
      }

      .pagination-buttons {
        display: flex;
        gap: 8px;
      }

      .pagination-button {
        padding: 8px 16px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        background: white;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 14px;
      }

      .pagination-button:hover:not(:disabled) {
        background-color: #f9fafb;
      }

      .pagination-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .modal-overlay {
        position: fixed;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 50;
      }

      .modal-container {
        background: white;
        border-radius: 12px;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
        width: 100%;
        max-width: 896px;
        max-height: 90vh;
        overflow-y: auto;
      }

      .modal-header {
        background: linear-gradient(to right, #2563eb, #1d4ed8);
        color: white;
        padding: 24px;
        border-radius: 12px 12px 0 0;
      }

      .modal-title {
        font-size: 20px;
        font-weight: 600;
        margin: 0;
      }

      .modal-body {
        padding: 24px;
      }

      .form-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 16px;
      }

      @media (min-width: 768px) {
        .form-grid {
          grid-template-columns: 1fr 1fr;
        }
      }

      .form-group {
        display: flex;
        flex-direction: column;
      }

      .form-label {
        display: block;
        font-size: 14px;
        font-weight: 500;
        color: #374151;
        margin-bottom: 4px;
      }

      .form-input, .form-select, .form-textarea {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 14px;
        transition: all 0.2s;
      }

      .form-input:focus, .form-select:focus, .form-textarea:focus {
        outline: none;
        ring: 2px;
        ring-color: #3b82f6;
        border-color: transparent;
      }

      .dimension-section {
        margin-top: 24px;
        padding-top: 24px;
        border-top: 1px solid #e5e7eb;
      }

      .dimension-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .dimension-title {
        font-size: 16px;
        font-weight: 600;
        color: #111827;
      }

      .add-dimension-button {
        background: #10b981;
        color: white;
        padding: 8px 16px;
        border-radius: 6px;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 14px;
        transition: all 0.2s;
      }

      .add-dimension-button:hover {
        background: #059669;
      }

      .dimension-form {
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 16px;
      }

      .dimension-list {
        max-height: 200px;
        overflow-y: auto;
      }

      .dimension-item {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .dimension-details {
        flex: 1;
      }

      .dimension-parameter {
        font-weight: 500;
        color: #111827;
      }

      .dimension-values {
        font-size: 12px;
        color: #6b7280;
        margin-top: 2px;
      }

      .dimension-result {
        margin-left: 12px;
      }

      .result-pass {
        background-color: #dcfce7;
        color: #16a34a;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
      }

      .result-fail {
        background-color: #fee2e2;
        color: #dc2626;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
      }

      .remove-dimension-button {
        color: #dc2626;
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s;
      }

      .remove-dimension-button:hover {
        background-color: #fee2e2;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 16px;
        padding-top: 24px;
        border-top: 1px solid #e5e7eb;
        margin-top: 16px;
      }

      .form-button-cancel {
        padding: 12px 24px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        color: #374151;
        background: white;
        cursor: pointer;
        transition: all 0.2s;
      }

      .form-button-cancel:hover {
        background-color: #f9fafb;
      }

      .form-button-submit {
        padding: 12px 24px;
        background: linear-gradient(to right, #2563eb, #1d4ed8);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .form-button-submit:hover {
        background: linear-gradient(to right, #1d4ed8, #1e40af);
      }

      .view-modal-header {
        background: linear-gradient(to right, #2563eb, #1d4ed8);
        color: white;
        padding: 24px;
        border-radius: 12px 12px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .view-modal-title {
        font-size: 20px;
        font-weight: 600;
        margin: 0;
      }

      .close-button {
        color: white;
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s;
      }

      .close-button:hover {
        color: #e5e7eb;
      }

      .view-content {
        padding: 24px;
      }

      .view-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 16px;
      }

      @media (min-width: 768px) {
        .view-grid {
          grid-template-columns: 1fr 1fr;
        }
      }

      .view-field {
        display: flex;
        flex-direction: column;
      }

      .view-label {
        display: block;
        font-size: 14px;
        font-weight: 500;
        color: #6b7280;
        margin-bottom: 4px;
      }

      .view-value {
        font-size: 14px;
        color: #111827;
      }

      .view-section {
        margin-top: 24px;
        padding-top: 24px;
        border-top: 1px solid #e5e7eb;
      }

      .view-section-title {
        font-size: 16px;
        font-weight: 600;
        color: #111827;
        margin-bottom: 16px;
      }

      .dimension-view-list {
        display: grid;
        gap: 12px;
      }

      .dimension-view-item {
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 16px;
      }

      .dimension-view-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }

      .dimension-view-parameter {
        font-weight: 500;
        color: #111827;
      }

      .dimension-view-result {
        font-size: 12px;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 4px;
      }

      .dimension-view-details {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        font-size: 12px;
        color: #6b7280;
      }

      .loading-container {
        min-height: 100vh;
        background-color: #f9fafb;
      }

      .loading-wrapper {
        max-width: 1280px;
        margin: 0 auto;
        padding: 32px 16px;
      }

      .loading-card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border: 1px solid #e5e7eb;
        padding: 48px;
        text-align: center;
      }

      .loading-spinner {
        animation: spin 1s linear infinite;
        border-radius: 50%;
        height: 64px;
        width: 64px;
        border: 2px solid transparent;
        border-bottom-color: #2563eb;
        margin: 0 auto;
      }

      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      .loading-text {
        margin-top: 24px;
        color: #666;
        font-size: 18px;
      }
    `}</style>
    </div>
  );
};

export default COC;
