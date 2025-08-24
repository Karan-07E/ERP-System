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
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Certificate of Conformance</h1>
          <p className="text-gray-600">Manage quality certificates and compliance documents</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Create COC
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by COC number, job, or order..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="approved">Approved</option>
            </select>
            <button
              onClick={fetchCOCs}
              className="p-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* COC List */}
      <div className="bg-white rounded-lg shadow-sm">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading COCs...</p>
          </div>
        ) : cocs.length === 0 ? (
          <div className="p-8 text-center">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No COCs found</h3>
            <p className="text-gray-600">Create your first Certificate of Conformance to get started.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      COC Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job & Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cocs.map((coc) => (
                    <tr key={coc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {coc.cocNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            Inspection: {formatDate(coc.inspectionDate)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {coc.job?.jobNumber || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            Order: {coc.job?.orderItem?.order?.orderNumber || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {coc.job?.orderItem?.order?.party?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(coc.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(coc.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedCOC(coc);
                              setShowViewModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(coc.id, coc.cocNumber)}
                            className="text-green-600 hover:text-green-800"
                            title="Download PDF"
                          >
                            <Download size={16} />
                          </button>
                          {coc.status === 'draft' && (
                            <button
                              onClick={() => handleApproveCOC(coc.id)}
                              className="text-purple-600 hover:text-purple-800"
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Page <span className="font-medium">{currentPage}</span> of{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === currentPage
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create COC Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Create Certificate of Conformance</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

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

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create COC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View COC Modal */}
      {showViewModal && selectedCOC && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Certificate of Conformance - {selectedCOC.cocNumber}
              </h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

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
                                <span className={`px-2 py-1 text-xs rounded ${
                                  report.result === 'pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
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
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => handleDownloadPDF(selectedCOC.id, selectedCOC.cocNumber)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
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
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center gap-2"
                  >
                    <Check size={16} />
                    Approve COC
                  </button>
                )}
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default COC;
