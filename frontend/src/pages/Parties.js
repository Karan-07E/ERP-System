import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Building,
  Phone,
  X
} from 'lucide-react';
import api from '../api/config';

const Parties = () => {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedParty, setSelectedParty] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'customer',
    contactPerson: '',
    email: '',
    phone: '',
    mobile: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gstNumber: '',
    panNumber: '',
    stateCode: '',
    creditLimit: 0,
    creditDays: 0,
    paymentTerms: '',
    notes: ''
  });

  const stateOptions = [
    { code: '01', name: 'Jammu and Kashmir' },
    { code: '02', name: 'Himachal Pradesh' },
    { code: '03', name: 'Punjab' },
    { code: '04', name: 'Chandigarh' },
    { code: '05', name: 'Uttarakhand' },
    { code: '06', name: 'Haryana' },
    { code: '07', name: 'Delhi' },
    { code: '08', name: 'Rajasthan' },
    { code: '09', name: 'Uttar Pradesh' },
    { code: '10', name: 'Bihar' },
    { code: '11', name: 'Sikkim' },
    { code: '12', name: 'Arunachal Pradesh' },
    { code: '13', name: 'Nagaland' },
    { code: '14', name: 'Manipur' },
    { code: '15', name: 'Mizoram' },
    { code: '16', name: 'Tripura' },
    { code: '17', name: 'Meghalaya' },
    { code: '18', name: 'Assam' },
    { code: '19', name: 'West Bengal' },
    { code: '20', name: 'Jharkhand' },
    { code: '21', name: 'Odisha' },
    { code: '22', name: 'Chhattisgarh' },
    { code: '23', name: 'Madhya Pradesh' },
    { code: '24', name: 'Gujarat' },
    { code: '25', name: 'Daman and Diu' },
    { code: '26', name: 'Dadra and Nagar Haveli' },
    { code: '27', name: 'Maharashtra' },
    { code: '28', name: 'Andhra Pradesh' },
    { code: '29', name: 'Karnataka' },
    { code: '30', name: 'Goa' },
    { code: '31', name: 'Lakshadweep' },
    { code: '32', name: 'Kerala' },
    { code: '33', name: 'Tamil Nadu' },
    { code: '34', name: 'Puducherry' },
    { code: '35', name: 'Andaman and Nicobar Islands' },
    { code: '36', name: 'Telangana' },
    { code: '37', name: 'Andhra Pradesh (New)' }
  ];

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No authentication token found');
      setError('Please log in to access this page');
      return;
    }
    
    fetchParties();
  }, [currentPage, searchTerm, filterType]);

  const fetchParties = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...(searchTerm && { search: searchTerm }),
        ...(filterType !== 'all' && { type: filterType })
      });

      console.log('Fetching parties with params:', params.toString());
      const response = await api.get(`/parties?${params}`);
      console.log('Fetch parties response:', response.data);
      
      if (response.data.success) {
        setParties(response.data.data.parties || []);
        setTotalPages(response.data.data.pagination?.pages || 1);
      } else {
        setError('Failed to fetch parties');
        setParties([]);
      }
    } catch (error) {
      console.error('Error fetching parties:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch parties';
      setError(errorMessage);
      setParties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      console.log('Submitting form data:', formData);
      
      if (selectedParty) {
        // Update party
        console.log('Updating party with ID:', selectedParty.id);
        const response = await api.put(`/parties/${selectedParty.id}`, formData);
        console.log('Update response:', response.data);
        
        if (response.data.success) {
          setShowEditModal(false);
          await fetchParties();
          resetForm();
          alert('Party updated successfully!');
        }
      } else {
        // Create party
        console.log('Creating new party...');
        const response = await api.post('/parties', formData);
        console.log('Create response:', response.data);
        
        if (response.data.success) {
          setShowAddModal(false);
          await fetchParties();
          resetForm();
          alert('Party created successfully!');
        }
      }
    } catch (error) {
      console.error('Error saving party:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save party';
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (party) => {
    setSelectedParty(party);
    setFormData({ ...party });
    setShowEditModal(true);
  };

  const handleView = (party) => {
    setSelectedParty(party);
    setShowViewModal(true);
  };

  const handleDelete = async (partyId) => {
    if (window.confirm('Are you sure you want to deactivate this party?')) {
      try {
        const response = await api.delete(`/parties/${partyId}`);
        if (response.data.success) {
          fetchParties();
        }
      } catch (error) {
        console.error('Error deleting party:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'customer',
      contactPerson: '',
      email: '',
      phone: '',
      mobile: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      gstNumber: '',
      panNumber: '',
      stateCode: '',
      creditLimit: 0,
      creditDays: 0,
      paymentTerms: '',
      notes: ''
    });
    setSelectedParty(null);
    setError(null);
    setSubmitting(false);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'customer': return 'bg-blue-100 text-blue-800';
      case 'vendor': return 'bg-green-100 text-green-800';
      case 'both': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && parties.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-wrapper">
          <div className="loading-card">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading parties...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page">
        <div className="content-wrapper">
          {/* Header */}
          <div className="header-card">
            <div className="header-content">
              <div>
                <h1 className="header-title">
                  <Building className="text-blue-600" size={32} />
                  Parties Management
                </h1>
                <p className="header-subtitle">Manage customers, vendors, and business partners</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="add-button"
              >
                <Plus size={20} />
                Add Party
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="filters-card">
            <div className="filters-content">
              <div className="search-container">
                <div className="relative">
                  <Search className="search-icon" size={20} />
                  <input
                    type="text"
                    placeholder="Search parties by name, code, or contact..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>
              <div className="filter-controls">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Types</option>
                  <option value="customer">Customers</option>
                  <option value="vendor">Vendors</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>
            
            {/* Error Display */}
            {error && (
              <div className="error-message">
                <p>{error}</p>
                <button onClick={() => setError(null)} className="error-close">×</button>
              </div>
            )}
          </div>          {/* Parties Table */}
          <div className="table-card">
          {parties.length === 0 ? (
            <div className="empty-state">
              <Building size={64} className="empty-icon" />
              <h3 className="empty-title">No parties found</h3>
              <p className="empty-description">Add your first party to get started.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="add-button"
              >
                <Plus size={20} />
                Add Party
              </button>
            </div>
          ) : (
            <div className="data-table">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th>Party Details</th>
                    <th>Type</th>
                    <th>Contact</th>
                    <th>GST Details</th>
                    <th>Location</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {parties.map((party) => (
                    <tr key={party.id} className="table-row">
                      <td className="table-cell">
                        <div className="party-info">
                          <div className="party-avatar">
                            <Building className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="party-details">
                            <div className="party-name">{party.name}</div>
                            <div className="party-code">{party.partyCode}</div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className={`type-badge ${getTypeColor(party.type).replace('bg-', 'type-').replace('-100', '').replace(' text-', ' type-')}`}>
                          {party.type}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="contact-info">{party.contactPerson}</div>
                        <div className="contact-phone">
                          <Phone size={12} />
                          {party.phone || party.mobile}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="gst-info">{party.gstNumber}</div>
                        <div className="state-info">State: {party.stateCode}</div>
                      </td>
                      <td className="table-cell">
                        <div className="location-city">{party.city}</div>
                        <div className="location-state">{party.state}</div>
                      </td>
                      <td className="table-cell">
                        <div className="actions-container">
                          <button
                            onClick={() => handleView(party)}
                            className="action-button action-view"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEdit(party)}
                            className="action-button action-edit"
                            title="Edit Party"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(party.id)}
                            className="action-button action-delete"
                            title="Delete Party"
                          >
                            <Trash2 size={16} />
                          </button>
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
                Page {currentPage} of {totalPages}
              </div>
              <div className="pagination-buttons">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="pagination-button"
                >
                  Previous
                </button>
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

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <div className="modal-header-content">
                <h2 className="modal-title">
                  {selectedParty ? 'Edit Party' : 'Add New Party'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="close-button"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                {/* Basic Information Section */}
                <div className="form-section">
                  <h3 className="section-title">Basic Information</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">
                        Party Name <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="form-input"
                        placeholder="Enter party name"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">
                        Type <span className="required">*</span>
                      </label>
                      <select
                        required
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        className="form-select"
                      >
                        <option value="customer">Customer</option>
                        <option value="vendor">Vendor</option>
                        <option value="both">Both</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Contact Person</label>
                      <input
                        type="text"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                        className="form-input"
                        placeholder="Enter contact person name"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="form-input"
                        placeholder="Enter email address"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="form-input"
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Mobile</label>
                      <input
                        type="tel"
                        value={formData.mobile}
                        onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                        className="form-input"
                        placeholder="Enter mobile number"
                      />
                    </div>
                  </div>
                </div>

                {/* Tax Information Section */}
                <div className="form-section">
                  <h3 className="section-title">Tax Information</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">GST Number</label>
                      <input
                        type="text"
                        value={formData.gstNumber}
                        onChange={(e) => setFormData({...formData, gstNumber: e.target.value})}
                        className="form-input"
                        placeholder="Enter GST number"
                        maxLength="15"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">PAN Number</label>
                      <input
                        type="text"
                        value={formData.panNumber}
                        onChange={(e) => setFormData({...formData, panNumber: e.target.value})}
                        className="form-input"
                        placeholder="Enter PAN number"
                        maxLength="10"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Information Section */}
                <div className="form-section">
                  <h3 className="section-title">Address Information</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">
                        State <span className="required">*</span>
                      </label>
                      <select
                        required
                        value={formData.state}
                        onChange={(e) => {
                          const selectedState = stateOptions.find(s => s.name === e.target.value);
                          setFormData({
                            ...formData, 
                            state: e.target.value,
                            stateCode: selectedState?.code || ''
                          });
                        }}
                        className="form-select"
                      >
                        <option value="">Select State</option>
                        {stateOptions.map(state => (
                          <option key={state.code} value={state.name}>
                            {state.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        className="form-input"
                        placeholder="Enter city"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Pincode</label>
                      <input
                        type="text"
                        value={formData.pincode}
                        onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                        className="form-input"
                        placeholder="Enter pincode"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Credit Limit</label>
                      <input
                        type="number"
                        value={formData.creditLimit}
                        onChange={(e) => setFormData({...formData, creditLimit: e.target.value})}
                        className="form-input"
                        placeholder="Enter credit limit"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Credit Days</label>
                      <input
                        type="number"
                        value={formData.creditDays}
                        onChange={(e) => setFormData({...formData, creditDays: e.target.value})}
                        className="form-input"
                        placeholder="Enter credit days"
                        min="0"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Payment Terms</label>
                      <input
                        type="text"
                        value={formData.paymentTerms}
                        onChange={(e) => setFormData({...formData, paymentTerms: e.target.value})}
                        className="form-input"
                        placeholder="Enter payment terms"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Address</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      rows="3"
                      className="form-textarea"
                      placeholder="Enter complete address"
                    />
                  </div>
                </div>

                {/* Additional Information Section */}
                <div className="form-section">
                  <h3 className="section-title">Additional Information</h3>
                  <div className="form-group">
                    <label className="form-label">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      rows="3"
                      className="form-textarea"
                      placeholder="Enter any additional notes"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      resetForm();
                      setError(null);
                    }}
                    className="form-button-cancel"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="form-button-submit"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="loading-spinner-sm"></div>
                        {selectedParty ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        {selectedParty ? 'Update' : 'Create'} Party
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedParty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Party Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Party Code</label>
                  <p className="text-sm text-gray-900">{selectedParty.partyCode}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Name</label>
                  <p className="text-sm text-gray-900">{selectedParty.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Type</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(selectedParty.type)}`}>
                    {selectedParty.type}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Contact Person</label>
                  <p className="text-sm text-gray-900">{selectedParty.contactPerson}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <p className="text-sm text-gray-900">{selectedParty.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-sm text-gray-900">{selectedParty.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">GST Number</label>
                  <p className="text-sm text-gray-900">{selectedParty.gstNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">State</label>
                  <p className="text-sm text-gray-900">{selectedParty.state} ({selectedParty.stateCode})</p>
                </div>
              </div>
              
              {selectedParty.address && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Address</label>
                  <p className="text-sm text-gray-900">{selectedParty.address}</p>
                </div>
              )}
              
              {selectedParty.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Notes</label>
                  <p className="text-sm text-gray-900">{selectedParty.notes}</p>
                </div>
              )}
            </div>
            </div>
          </div>
        </div>
      )}
      </div>

    <style jsx>{`
      .page {
        padding: 20px 0;
        background-color: #f8fafc;
        min-height: 100vh;
      }

      .content-wrapper {
        max-width: 1280px;
        margin: 0 auto;
        padding: 0 16px;
      }

      .header-card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border: 1px solid #e5e7eb;
        padding: 24px;
        margin-bottom: 24px;
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

      .header-content {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      @media (min-width: 640px) {
        .header-content {
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
        }
      }

      .header-title {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 30px;
        font-weight: 700;
        color: #111827;
        margin: 0;
      }

      .header-subtitle {
        color: #6b7280;
        margin-top: 8px;
        font-size: 16px;
      }

      .add-button {
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

      .add-button:hover {
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

      .error-message {
        background-color: #fee2e2;
        border: 1px solid #fecaca;
        color: #dc2626;
        padding: 12px 16px;
        border-radius: 8px;
        margin-top: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .error-close {
        background: none;
        border: none;
        color: #dc2626;
        cursor: pointer;
        font-size: 20px;
        font-weight: bold;
        padding: 0;
        margin-left: 12px;
      }

      .loading-spinner-sm {
        animation: spin 1s linear infinite;
        border-radius: 50%;
        height: 16px;
        width: 16px;
        border: 2px solid transparent;
        border-bottom-color: white;
        margin-right: 8px;
        display: inline-block;
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

      .party-info {
        display: flex;
        align-items: center;
      }

      .party-avatar {
        flex-shrink: 0;
        height: 40px;
        width: 40px;
        background-color: #dbeafe;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .party-details {
        margin-left: 16px;
      }

      .party-name {
        font-size: 14px;
        font-weight: 500;
        color: #111827;
      }

      .party-code {
        font-size: 14px;
        color: #6b7280;
      }

      .type-badge {
        display: inline-flex;
        padding: 2px 8px;
        font-size: 12px;
        font-weight: 600;
        border-radius: 9999px;
      }

      .type-customer {
        background-color: #dbeafe;
        color: #1e40af;
      }

      .type-vendor {
        background-color: #dcfce7;
        color: #166534;
      }

      .type-both {
        background-color: #e9d5ff;
        color: #7c3aed;
      }

      .contact-info {
        font-size: 14px;
        color: #111827;
      }

      .contact-phone {
        font-size: 14px;
        color: #6b7280;
        display: flex;
        align-items: center;
        gap: 4px;
        margin-top: 2px;
      }

      .gst-info {
        font-size: 14px;
        color: #111827;
      }

      .state-info {
        font-size: 14px;
        color: #6b7280;
      }

      .location-city {
        font-size: 14px;
        color: #111827;
      }

      .location-state {
        font-size: 14px;
        color: #6b7280;
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

      .modal-header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .modal-title {
        font-size: 20px;
        font-weight: 600;
        margin: 0;
      }

      .modal-body {
        padding: 32px;
      }

      .form-section {
        margin-bottom: 32px;
        padding-bottom: 24px;
        border-bottom: 1px solid #e5e7eb;
      }

      .form-section:last-of-type {
        border-bottom: none;
        margin-bottom: 0;
      }

      .section-title {
        font-size: 18px;
        font-weight: 600;
        color: #111827;
        margin-bottom: 20px;
        padding-bottom: 8px;
        border-bottom: 2px solid #3b82f6;
        display: inline-block;
      }

      .form-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 20px;
      }

      @media (min-width: 768px) {
        .form-grid {
          grid-template-columns: 1fr 1fr;
        }
      }

      @media (min-width: 1024px) {
        .form-grid {
          grid-template-columns: 1fr 1fr 1fr;
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
        margin-bottom: 6px;
      }

      .required {
        color: #ef4444;
      }

      .form-input, .form-select, .form-textarea {
        width: 100%;
        padding: 12px 16px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 14px;
        transition: all 0.2s;
        background-color: white;
      }

      .form-input:focus, .form-select:focus, .form-textarea:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      .form-input:hover, .form-select:hover, .form-textarea:hover {
        border-color: #9ca3af;
      }

      .form-textarea {
        resize: vertical;
        min-height: 80px;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 16px;
        padding-top: 32px;
        border-top: 1px solid #e5e7eb;
        margin-top: 24px;
      }

      .form-button-cancel {
        padding: 12px 24px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        color: #374151;
        background: white;
        cursor: pointer;
        transition: all 0.2s;
        font-weight: 500;
      }

      .form-button-cancel:hover {
        background-color: #f9fafb;
        border-color: #9ca3af;
      }

      .form-button-submit {
        padding: 12px 24px;
        background: linear-gradient(to right, #2563eb, #1d4ed8);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        font-weight: 500;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      .form-button-submit:hover {
        background: linear-gradient(to right, #1d4ed8, #1e40af);
        box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
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
        color: #6b7280;
        font-size: 18px;
      }
    `}</style>
    </>
  );
};

export default Parties;
