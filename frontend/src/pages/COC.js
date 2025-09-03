import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  X, 
  Download, 
  Check, 
  FileText,
  Plus,
  Search,
  RefreshCw,
  Eye
} from 'lucide-react';

const COC = () => {
  const [cocs, setCocs] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCOC, setSelectedCOC] = useState(null);
  const [formData, setFormData] = useState({
    cocId: '',
    productPartNumber: '',
    lotBatchNumber: '',
    jobOrderId: '',
    customerId: '',
    inspectionDate: new Date().toISOString().split('T')[0],
    referenceStandard: '',
    statementOfCompliance: '',
    qaPersonSignature: ''
  });

    useEffect(() => {
    fetchCOCs();
    fetchJobs();
    fetchCustomers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

    const fetchCOCs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/coc', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: currentPage,
          search: searchTerm,
          status: statusFilter
        }
      });
      setCocs(response.data.cocs || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching COCs:', error);
      setCocs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/jobs?status=completed', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(response.data.jobs || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    }
  };

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/parties?type=customer', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(response.data.parties || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
    }
  };  const handleCreateCOC = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      console.log('Creating COC with data:', formData);
      
      const response = await axios.post('/coc', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('COC created successfully:', response.data);
      setShowCreateModal(false);
      resetForm();
      fetchCOCs();
    } catch (error) {
      console.error('Error creating COC:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      alert(`Error creating COC: ${errorMessage}`);
    }
  };

  const handleApproveCOC = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/coc/${id}/approve`, {}, {
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
      const response = await axios.get(`/coc/${cocId}/pdf`, {
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

  const resetForm = () => {
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      cocId: '',
      productPartNumber: '',
      lotBatchNumber: '',
      jobOrderId: '',
      customerId: '',
      inspectionDate: today,
      referenceStandard: '',
      statementOfCompliance: '',
      qaPersonSignature: ''
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
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="coc-page">
      <div className="coc-container">
        <div className="content-wrapper">
          {/* Header */}
          <div className="page-header">
            <div className="header-content">
              <div className="page-title">
                <FileText size={24} />
                <h1>Certificate of Conformance</h1>
              </div>
              <div className="header-actions">
                <button
                  onClick={() => {
                    resetForm();
                    setShowCreateModal(true);
                  }}
                  className="btn btn-primary"
                >
                  <Plus size={20} />
                  Create COC
                </button>
              </div>
            </div>
            <p>Manage quality certificates and compliance documents</p>
          </div>

          {/* Controls */}
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
                <FileText size={64} />
                <h3>No COCs found</h3>
                <p>Create your first Certificate of Conformance to get started.</p>
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
                              COC ID: {coc.cocId || 'N/A'}
                            </div>
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
                      className={`pagination-button ${page === currentPage ? 'active' : ''}`}
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
              
              <div className="modal-body">
                <form onSubmit={handleCreateCOC}>
                  <div className="form-group">
                    <label>COC ID</label>
                    <input
                      type="text"
                      value={formData.cocId}
                      onChange={(e) => setFormData(prev => ({ ...prev, cocId: e.target.value }))}
                      required
                      placeholder="Enter COC identification number"
                    />
                  </div>

                  <div className="form-group">
                    <label>Product / Part Number</label>
                    <input
                      type="text"
                      value={formData.productPartNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, productPartNumber: e.target.value }))}
                      required
                      placeholder="Enter product or part number"
                    />
                  </div>

                  <div className="form-group">
                    <label>Lot / Batch Number</label>
                    <input
                      type="text"
                      value={formData.lotBatchNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, lotBatchNumber: e.target.value }))}
                      required
                      placeholder="Enter lot or batch number"
                    />
                  </div>

                  <div className="form-group">
                    <label>Job & Order</label>
                    <select
                      value={formData.jobOrderId}
                      onChange={(e) => setFormData(prev => ({ ...prev, jobOrderId: e.target.value }))}
                      required
                    >
                      <option value="">Select Job & Order</option>
                      {jobs.map((job) => (
                        <option key={job.id} value={job.id}>
                          Job: {job.jobNumber} - Order: {job.orderItem?.order?.orderNumber || 'N/A'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Customer</label>
                    <select
                      value={formData.customerId}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
                      required
                    >
                      <option value="">Select Customer</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} ({customer.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Inspection Date</label>
                    <input
                      type="date"
                      value={formData.inspectionDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, inspectionDate: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Reference Standard or Specification</label>
                    <textarea
                      value={formData.referenceStandard}
                      onChange={(e) => setFormData(prev => ({ ...prev, referenceStandard: e.target.value }))}
                      required
                      rows={3}
                      placeholder="Enter applicable standards, specifications, or requirements..."
                    />
                  </div>

                  <div className="form-group">
                    <label>Statement of Compliance</label>
                    <textarea
                      value={formData.statementOfCompliance}
                      onChange={(e) => setFormData(prev => ({ ...prev, statementOfCompliance: e.target.value }))}
                      required
                      rows={4}
                      placeholder="Enter statement confirming compliance with specifications..."
                    />
                  </div>

                  <div className="form-group">
                    <label>Signature of Authorized QA Person</label>
                    <input
                      type="text"
                      value={formData.qaPersonSignature}
                      onChange={(e) => setFormData(prev => ({ ...prev, qaPersonSignature: e.target.value }))}
                      required
                      placeholder="Enter name and signature of QA person"
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="form-actions">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        resetForm();
                      }}
                      className="cancel-btn"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="submit-btn"
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
          <div className="view-modal-overlay" onClick={() => setShowViewModal(false)}>
            <div className="view-modal" onClick={(e) => e.stopPropagation()}>
              <div className="view-modal-header">
                <div className="view-modal-header-content">
                  <h3>Certificate of Conformance - {selectedCOC.cocNumber}</h3>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="view-modal-close"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="view-modal-body">
                <div className="view-form">
                  {/* Single unified form layout */}
                  <div className="view-form-grid">
                    <div className="view-form-field">
                      <label>COC ID</label>
                      <div className="view-form-value">{selectedCOC.cocId || 'N/A'}</div>
                    </div>
                    
                    <div className="view-form-field">
                      <label>COC Number</label>
                      <div className="view-form-value">{selectedCOC.cocNumber}</div>
                    </div>
                    
                    <div className="view-form-field">
                      <label>Status</label>
                      <div className="view-form-value">{getStatusBadge(selectedCOC.status)}</div>
                    </div>
                    
                    <div className="view-form-field">
                      <label>Created Date</label>
                      <div className="view-form-value">{formatDate(selectedCOC.createdAt)}</div>
                    </div>
                    
                    <div className="view-form-field">
                      <label>Product / Part Number</label>
                      <div className="view-form-value">{selectedCOC.partDescription || 'N/A'}</div>
                    </div>
                    
                    <div className="view-form-field">
                      <label>Lot / Batch Number</label>
                      <div className="view-form-value">{selectedCOC.batchNumber || 'N/A'}</div>
                    </div>
                    
                    <div className="view-form-field">
                      <label>Quantity</label>
                      <div className="view-form-value">{selectedCOC.quantity || 'N/A'}</div>
                    </div>
                    
                    {selectedCOC.job && (
                      <>
                        <div className="view-form-field">
                          <label>Job ID</label>
                          <div className="view-form-value">{selectedCOC.job.jobId || 'N/A'}</div>
                        </div>
                        
                        <div className="view-form-field">
                          <label>Order Number</label>
                          <div className="view-form-value">{selectedCOC.job.orderItem?.order?.orderNumber || 'N/A'}</div>
                        </div>
                        
                        <div className="view-form-field">
                          <label>Customer</label>
                          <div className="view-form-value">{selectedCOC.job.orderItem?.order?.party?.name || 'N/A'}</div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Full width fields */}
                  <div className="view-form-field full-width">
                    <label>Reference Standard or Specification</label>
                    <div className="view-form-textarea">{selectedCOC.complianceDeclaration?.split('\n\n')[0]?.replace('Reference Standard: ', '') || 'N/A'}</div>
                  </div>
                  
                  <div className="view-form-field full-width">
                    <label>Statement of Compliance</label>
                    <div className="view-form-textarea">{selectedCOC.complianceDeclaration?.split('\n\n')[1]?.replace('Statement of Compliance: ', '') || 'N/A'}</div>
                  </div>
                  
                  <div className="view-form-field full-width">
                    <label>Signature of Authorized QA Person</label>
                    <div className="view-form-textarea">{selectedCOC.complianceDeclaration?.split('\n\n')[2]?.replace('QA Person: ', '') || 'N/A'}</div>
                  </div>

                  {/* Notes */}
                  {selectedCOC.notes && (
                    <div className="view-form-field full-width">
                      <label>Additional Notes</label>
                      <div className="view-form-textarea">{selectedCOC.notes}</div>
                    </div>
                  )}

                  {/* Dimension Reports */}
                  {selectedCOC.dimensionReports && selectedCOC.dimensionReports.length > 0 && (
                    <div className="view-section">
                      <h4 className="view-section-title">Dimension Reports</h4>
                      <div className="view-content-box">
                        <div className="dimension-table-container">
                          <table className="dimension-table">
                            <thead>
                              <tr>
                                <th>Parameter</th>
                                <th>Specification</th>
                                <th>Measured</th>
                                <th>Tolerance</th>
                                <th>Result</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedCOC.dimensionReports.map((report, index) => (
                                <tr key={index}>
                                  <td>{report.parameter}</td>
                                  <td>{report.specification || '-'}</td>
                                  <td>{report.measuredValue} {report.unit}</td>
                                  <td>{report.tolerance || '-'}</td>
                                  <td>
                                    <span className={`result-badge ${report.result === 'pass' ? 'pass' : 'fail'}`}>
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

                  {/* Approval Info */}
                  {selectedCOC.status === 'approved' && selectedCOC.Approver && (
                    <div className="view-form-field full-width">
                      <label>Approval Information</label>
                      <div className="view-form-textarea">
                        <strong>Approved by:</strong> {selectedCOC.Approver.firstName} {selectedCOC.Approver.lastName}<br />
                        <strong>Approved on:</strong> {formatDate(selectedCOC.approvedAt)}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="view-modal-actions">
                    <button
                      onClick={() => handleDownloadPDF(selectedCOC.id, selectedCOC.cocNumber)}
                      className="view-action-btn download-btn"
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
                        className="view-action-btn approve-btn"
                      >
                        <Check size={16} />
                        Approve COC
                      </button>
                    )}
                    <button
                      onClick={() => setShowViewModal(false)}
                      className="view-action-btn close-btn"
                    >
                      Close
                    </button>
                  </div>
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

          .header-content {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 8px;
          }
          
          .page-title {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 0;
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
            flex-shrink: 0;
          }

          .btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 20px;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            text-decoration: none;
          }

          .btn-primary {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
          }

          .btn-primary:hover {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
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

          /* Form Actions */
          .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            margin-top: 24px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }

          .cancel-btn {
            padding: 12px 24px;
            border: 1px solid #d1d5db;
            background: white;
            color: #374151;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.2s;
          }

          .cancel-btn:hover {
            background: #f9fafb;
            border-color: #9ca3af;
          }

          .submit-btn {
            padding: 12px 24px;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s;
          }

          .submit-btn:hover {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
          }

          /* View Modal Styles */
          .view-modal-overlay {
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
            overflow-y: auto;
            padding: 20px;
          }

          .view-modal {
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            width: 100%;
            max-width: 900px;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
          }

          .view-modal-header {
            background: white;
            color: #111827;
            padding: 24px;
            border-radius: 12px 12px 0 0;
            border-bottom: 1px solid #e5e7eb;
          }

          .view-modal-header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .view-modal-header h3 {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
          }

          .view-modal-close {
            background: none;
            border: none;
            color: #6b7280;
            cursor: pointer;
            padding: 8px;
            border-radius: 6px;
            transition: all 0.2s;
          }

          .view-modal-close:hover {
            background: #f3f4f6;
            color: #111827;
          }

          .view-modal-body {
            padding: 24px;
          }

          .view-modal-sections {
            display: flex;
            flex-direction: column;
            gap: 24px;
          }

          .view-section {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
          }

          .view-section-title {
            background: #f9fafb;
            padding: 16px 20px;
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            color: #374151;
            border-bottom: 1px solid #e5e7eb;
          }

          .view-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            padding: 20px;
          }

          .view-field {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .view-field label {
            font-size: 12px;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .view-field p {
            margin: 0;
            font-size: 14px;
            color: #111827;
            font-weight: 500;
          }

          .view-content-box {
            padding: 20px;
            background: #f8f9fa;
            border-radius: 6px;
            margin: 20px;
          }

          .compliance-text {
            margin: 0;
            font-size: 14px;
            line-height: 1.6;
            color: #374151;
            white-space: pre-wrap;
          }

          .notes-text {
            margin: 0;
            font-size: 14px;
            line-height: 1.6;
            color: #374151;
            white-space: pre-wrap;
          }

          .dimension-table-container {
            overflow-x: auto;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
          }

          .dimension-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
          }

          .dimension-table th {
            background: #f3f4f6;
            padding: 12px;
            text-align: left;
            font-size: 12px;
            font-weight: 600;
            color: #374151;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid #e5e7eb;
          }

          .dimension-table td {
            padding: 12px;
            font-size: 14px;
            color: #374151;
            border-bottom: 1px solid #f3f4f6;
          }

          .dimension-table tr:hover {
            background: #f9fafb;
          }

          .result-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
          }

          .result-badge.pass {
            background: #dcfce7;
            color: #166534;
          }

          .result-badge.fail {
            background: #fecaca;
            color: #dc2626;
          }

          .approval-box {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 6px;
            padding: 20px;
            margin: 20px;
          }

          .approval-box p {
            margin: 0;
            font-size: 14px;
            color: #166534;
            line-height: 1.6;
          }

          .view-form {
            display: flex;
            flex-direction: column;
            gap: 24px;
          }

          .view-form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
          }

          .view-form-field {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .view-form-field.full-width {
            grid-column: 1 / -1;
          }

          .view-form-field label {
            font-size: 12px;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .view-form-value {
            padding: 12px;
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            font-size: 14px;
            color: #111827;
            min-height: 20px;
          }

          .view-form-textarea {
            padding: 12px;
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            font-size: 14px;
            color: #111827;
            line-height: 1.6;
            white-space: pre-wrap;
            min-height: 80px;
          }

          /* Form Grid and Field Styles */
          .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
          }

          .form-field {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .form-field.full-width {
            grid-column: 1 / -1;
          }

          .form-field label {
            font-size: 14px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 4px;
          }

          .form-field input,
          .form-field select,
          .form-field textarea {
            padding: 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 14px;
            transition: border-color 0.2s;
          }

          .form-field input:focus,
          .form-field select:focus,
          .form-field textarea:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }

          .file-input {
            padding: 8px !important;
            border: 2px dashed #d1d5db !important;
            background-color: #f9fafb;
            cursor: pointer;
          }

          .file-input:hover {
            border-color: #3b82f6 !important;
            background-color: #eff6ff;
          }

          .form-help {
            font-size: 12px;
            color: #6b7280;
            margin-top: 4px;
          }

          .view-modal-actions {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            padding: 24px;
            border-top: 1px solid #e5e7eb;
            background: #f9fafb;
            border-radius: 0 0 12px 12px;
          }

          .view-action-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 20px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
          }

          .download-btn {
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            color: white;
          }

          .download-btn:hover {
            background: linear-gradient(135deg, #047857 0%, #065f46 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(5, 150, 105, 0.4);
          }

          .approve-btn {
            background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
            color: white;
          }

          .approve-btn:hover {
            background: linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
          }

          .close-btn {
            background: white;
            color: #374151;
            border: 1px solid #d1d5db;
          }

          .close-btn:hover {
            background: #f9fafb;
            border-color: #9ca3af;
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

            .view-modal {
              width: 95%;
              margin: 10px;
              max-height: 85vh;
            }

            .view-modal-overlay {
              padding: 10px;
            }

            .view-grid {
              grid-template-columns: 1fr;
            }

            .view-modal-actions {
              flex-direction: column;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default COC;
