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
import { usePartyContext } from '../contexts/PartyContext';

const Parties = () => {
  const { 
    parties, 
    loading, 
    error: partyError, 
    fetchParties,
    createParty,
    updateParty,
    deleteParty,
    refreshParties
  } = usePartyContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
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

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState({});

  // Validation functions
  const validateField = (name, value) => {
    const errors = {};

    switch (name) {
      case 'name':
        if (!value.trim()) {
          errors.name = 'Party name is required';
        } else if (value.length < 2) {
          errors.name = 'Party name must be at least 2 characters';
        }
        break;

      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = 'Please enter a valid email address';
        }
        break;

      case 'phone':
        if (!value.trim()) {
          errors.phone = 'Phone number is required';
        } else if (!/^[+]?[\d\s\-()]{10,15}$/.test(value)) {
          errors.phone = 'Please enter a valid phone number (10-15 digits)';
        }
        break;

      case 'mobile':
        if (value && !/^[+]?[\d\s\-()]{10,15}$/.test(value)) {
          errors.mobile = 'Please enter a valid mobile number (10-15 digits)';
        }
        break;

      case 'address':
        if (!value.trim()) {
          errors.address = 'Address is required';
        }
        break;

      case 'city':
        if (!value.trim()) {
          errors.city = 'City is required';
        }
        break;

      case 'state':
        if (!value.trim()) {
          errors.state = 'State is required';
        }
        break;

      case 'pincode':
        if (!value.trim()) {
          errors.pincode = 'Pincode is required';
        } else if (!/^\d{6}$/.test(value)) {
          errors.pincode = 'Pincode must be exactly 6 digits';
        }
        break;

      case 'gstNumber':
        if (value && value.length !== 15) {
          errors.gstNumber = 'GST number must be exactly 15 characters';
        } else if (value && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value)) {
          errors.gstNumber = 'Please enter a valid GST number format';
        }
        break;

      case 'panNumber':
        if (value && value.length !== 10) {
          errors.panNumber = 'PAN number must be exactly 10 characters';
        } else if (value && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) {
          errors.panNumber = 'Please enter a valid PAN number format (e.g., ABCDE1234F)';
        }
        break;

      case 'creditLimit':
        if (value !== '' && (isNaN(value) || value < 0)) {
          errors.creditLimit = 'Credit limit cannot be negative';
        }
        break;

      case 'creditDays':
        if (value !== '' && (isNaN(value) || value < 0)) {
          errors.creditDays = 'Credit days cannot be negative';
        } else if (value !== '' && value > 365) {
          errors.creditDays = 'Credit days cannot exceed 365 days';
        }
        break;

      default:
        break;
    }

    return errors;
  };

  const validateForm = () => {
    const errors = {};
    
    // Only validate required fields for form submission
    const requiredFields = ['name', 'phone', 'address', 'city', 'state', 'pincode'];
    
    requiredFields.forEach(key => {
      const fieldErrors = validateField(key, formData[key]);
      Object.assign(errors, fieldErrors);
    });
    
    // Also validate optional fields if they have values
    const optionalFields = ['email', 'mobile', 'gstNumber', 'panNumber', 'creditLimit', 'creditDays'];
    optionalFields.forEach(key => {
      if (formData[key] && formData[key] !== '') {
        const fieldErrors = validateField(key, formData[key]);
        Object.assign(errors, fieldErrors);
      }
    });

    console.log('Form validation errors:', errors);
    console.log('Form data being validated:', formData);
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (name, value) => {
    // Update form data
    if (name === 'state') {
      // Special handling for state to also set stateCode
      const selectedState = stateOptions.find(s => s.name === value);
      setFormData(prev => ({
        ...prev,
        state: value,
        stateCode: selectedState?.code || ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Validate field on blur or for critical fields
    const fieldErrors = validateField(name, value);
    if (Object.keys(fieldErrors).length > 0) {
      setValidationErrors(prev => ({
        ...prev,
        ...fieldErrors
      }));
    }
  };

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
    { code: '36', name: 'Telangana' }
  ];

  // Debounce search term to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No authentication token found');
      setError('Please log in to access this page');
      return;
    }
    
    const params = {
      page: currentPage,
      limit: 20,
      ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
      ...(filterType !== 'all' && { type: filterType })
    };
    
    // Call fetchParties from context and get pagination data
    fetchParties(params)
      .then(result => {
        if (result && result.data && result.data.pagination) {
          setTotalPages(result.data.pagination.pages || 1);
        }
      })
      .catch(err => {
        console.error('Error fetching parties with pagination:', err);
      });
  }, [currentPage, debouncedSearchTerm, filterType, fetchParties]);

  // Ensure selectedParty is null when opening add modal
  useEffect(() => {
    if (showAddModal) {
      setSelectedParty(null);
    }
  }, [showAddModal]);

  // Using context's fetchParties instead of local function

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      setError('Please correct the errors below');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      console.log('Submitting form data:', formData);
      
      if (selectedParty) {
        // Update party using context
        console.log('Updating party with ID:', selectedParty.id);
        const result = await updateParty(selectedParty.id, formData);
        
        if (result.success) {
          setShowEditModal(false);
          resetForm();
          alert('Party updated successfully!');
          refreshParties();
        } else {
          setError(result.error);
          alert(`Error: ${result.error}`);
        }
      } else {
        // Create party using context
        console.log('Creating new party...');
        const result = await createParty(formData);
        
        if (result.success) {
          setShowAddModal(false);
          resetForm();
          alert('Party created successfully!');
          refreshParties();
        } else {
          setError(result.error);
          alert(`Error: ${result.error}`);
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
        const result = await deleteParty(partyId);
        if (result.success) {
          alert('Party deactivated successfully!');
          refreshParties();
        } else {
          setError(result.error);
          alert(`Error: ${result.error}`);
        }
      } catch (error) {
        console.error('Error deleting party:', error);
        setError('Failed to delete party: ' + error.message);
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
    setValidationErrors({}); // Clear validation errors
    setSelectedParty(null);
    setError(null);
    setSubmitting(false);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'customer': return 'bg-blue-100 text-blue-800';
      case 'vendor': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Use partyError from context if available
  useEffect(() => {
    if (partyError) {
      setError(partyError);
    }
  }, [partyError]);

  if (loading && (!parties || parties.length === 0)) {
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
                onClick={() => {
                  setSelectedParty(null);
                  resetForm();
                  setShowAddModal(true);
                }}
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
                onClick={() => {
                  setSelectedParty(null);
                  resetForm();
                  setShowAddModal(true);
                }}
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
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={`form-input ${validationErrors.name ? 'error' : ''}`}
                        placeholder="Enter party name"
                      />
                      {validationErrors.name && (
                        <span className="error-message">{validationErrors.name}</span>
                      )}
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
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`form-input ${validationErrors.email ? 'error' : ''}`}
                        placeholder="Enter email address"
                      />
                      {validationErrors.email && (
                        <span className="error-message">{validationErrors.email}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Phone <span className="required">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={`form-input ${validationErrors.phone ? 'error' : ''}`}
                        placeholder="Enter phone number"
                      />
                      {validationErrors.phone && (
                        <span className="error-message">{validationErrors.phone}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Mobile</label>
                      <input
                        type="tel"
                        value={formData.mobile}
                        onChange={(e) => handleInputChange('mobile', e.target.value)}
                        className={`form-input ${validationErrors.mobile ? 'error' : ''}`}
                        placeholder="Enter mobile number"
                      />
                      {validationErrors.mobile && (
                        <span className="error-message">{validationErrors.mobile}</span>
                      )}
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
                        onChange={(e) => handleInputChange('gstNumber', e.target.value.toUpperCase())}
                        className={`form-input ${validationErrors.gstNumber ? 'error' : ''}`}
                        placeholder="Enter GST number (15 characters)"
                        maxLength="15"
                      />
                      {validationErrors.gstNumber && (
                        <span className="error-message">{validationErrors.gstNumber}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">PAN Number</label>
                      <input
                        type="text"
                        value={formData.panNumber}
                        onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase())}
                        className={`form-input ${validationErrors.panNumber ? 'error' : ''}`}
                        placeholder="Enter PAN number (10 characters)"
                        maxLength="10"
                      />
                      {validationErrors.panNumber && (
                        <span className="error-message">{validationErrors.panNumber}</span>
                      )}
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
                          handleInputChange('state', e.target.value);
                        }}
                        className={`form-select ${validationErrors.state ? 'error' : ''}`}
                      >
                        <option value="">Select State</option>
                        {stateOptions.map(state => (
                          <option key={state.code} value={state.name}>
                            {state.name}
                          </option>
                        ))}
                      </select>
                      {validationErrors.state && (
                        <span className="error-message">{validationErrors.state}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        City <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className={`form-input ${validationErrors.city ? 'error' : ''}`}
                        placeholder="Enter city"
                      />
                      {validationErrors.city && (
                        <span className="error-message">{validationErrors.city}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Pincode <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.pincode}
                        onChange={(e) => handleInputChange('pincode', e.target.value)}
                        className={`form-input ${validationErrors.pincode ? 'error' : ''}`}
                        placeholder="Enter pincode (6 digits)"
                        maxLength="6"
                      />
                      {validationErrors.pincode && (
                        <span className="error-message">{validationErrors.pincode}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Credit Limit</label>
                      <input
                        type="number"
                        value={formData.creditLimit}
                        onChange={(e) => handleInputChange('creditLimit', e.target.value)}
                        className={`form-input ${validationErrors.creditLimit ? 'error' : ''}`}
                        placeholder="Enter credit limit"
                        min="0"
                        step="0.01"
                      />
                      {validationErrors.creditLimit && (
                        <span className="error-message">{validationErrors.creditLimit}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Credit Days</label>
                      <input
                        type="number"
                        value={formData.creditDays}
                        onChange={(e) => handleInputChange('creditDays', e.target.value)}
                        className={`form-input ${validationErrors.creditDays ? 'error' : ''}`}
                        placeholder="Enter credit days (max 365)"
                        min="0"
                        max="365"
                      />
                      {validationErrors.creditDays && (
                        <span className="error-message">{validationErrors.creditDays}</span>
                      )}
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
                    <label className="form-label">
                      Address <span className="required">*</span>
                    </label>
                    <textarea
                      required
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows="3"
                      className={`form-textarea ${validationErrors.address ? 'error' : ''}`}
                      placeholder="Enter complete address"
                    />
                    {validationErrors.address && (
                      <span className="error-message">{validationErrors.address}</span>
                    )}
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
        <div className="modal-overlay">
          <div className="view-modal-container">
            <div className="view-modal-header">
              <h2 className="view-modal-title">Party Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="close-button"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="view-modal-body">
              <div className="view-details-grid">
                <div className="view-field">
                  <label className="view-label">Party Code</label>
                  <p className="view-value">{selectedParty.partyCode}</p>
                </div>
                <div className="view-field">
                  <label className="view-label">Name</label>
                  <p className="view-value">{selectedParty.name}</p>
                </div>
                <div className="view-field">
                  <label className="view-label">Type</label>
                  <span className={`type-badge ${getTypeColor(selectedParty.type).replace('bg-', 'type-').replace('-100', '').replace(' text-', ' type-')}`}>
                    {selectedParty.type}
                  </span>
                </div>
                <div className="view-field">
                  <label className="view-label">Contact Person</label>
                  <p className="view-value">{selectedParty.contactPerson || 'N/A'}</p>
                </div>
                <div className="view-field">
                  <label className="view-label">Email</label>
                  <p className="view-value">{selectedParty.email || 'N/A'}</p>
                </div>
                <div className="view-field">
                  <label className="view-label">Phone</label>
                  <p className="view-value">{selectedParty.phone || 'N/A'}</p>
                </div>
                <div className="view-field">
                  <label className="view-label">Mobile</label>
                  <p className="view-value">{selectedParty.mobile || 'N/A'}</p>
                </div>
                <div className="view-field">
                  <label className="view-label">GST Number</label>
                  <p className="view-value">{selectedParty.gstNumber || 'N/A'}</p>
                </div>
                <div className="view-field">
                  <label className="view-label">PAN Number</label>
                  <p className="view-value">{selectedParty.panNumber || 'N/A'}</p>
                </div>
                <div className="view-field">
                  <label className="view-label">State</label>
                  <p className="view-value">{selectedParty.state} ({selectedParty.stateCode})</p>
                </div>
                <div className="view-field">
                  <label className="view-label">City</label>
                  <p className="view-value">{selectedParty.city || 'N/A'}</p>
                </div>
                <div className="view-field">
                  <label className="view-label">Pincode</label>
                  <p className="view-value">{selectedParty.pincode || 'N/A'}</p>
                </div>
                <div className="view-field">
                  <label className="view-label">Credit Limit</label>
                  <p className="view-value">₹{selectedParty.creditLimit || '0.00'}</p>
                </div>
                <div className="view-field">
                  <label className="view-label">Credit Days</label>
                  <p className="view-value">{selectedParty.creditDays || '0'} days</p>
                </div>
              </div>
              
              {selectedParty.address && (
                <div className="view-field-full">
                  <label className="view-label">Address</label>
                  <p className="view-value">{selectedParty.address}</p>
                </div>
              )}
              
              {selectedParty.paymentTerms && (
                <div className="view-field-full">
                  <label className="view-label">Payment Terms</label>
                  <p className="view-value">{selectedParty.paymentTerms}</p>
                </div>
              )}
              
              {selectedParty.notes && (
                <div className="view-field-full">
                  <label className="view-label">Notes</label>
                  <p className="view-value">{selectedParty.notes}</p>
                </div>
              )}
              
              <div className="view-field-full">
                <label className="view-label">Created</label>
                <p className="view-value">{new Date(selectedParty.createdAt).toLocaleString()}</p>
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
        background: white;
        color: #111827;
        padding: 24px;
        border-radius: 12px 12px 0 0;
        border-bottom: 1px solid #e5e7eb;
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
        color: #111827;
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

      .form-input.error, .form-select.error, .form-textarea.error {
        border-color: #dc2626;
        background-color: #fef2f2;
      }

      .form-input.error:focus, .form-select.error:focus, .form-textarea.error:focus {
        border-color: #dc2626;
        ring-color: #dc2626;
      }

      .error-message {
        display: block;
        color: #dc2626;
        font-size: 12px;
        margin-top: 4px;
        font-weight: 500;
      }

      .required {
        color: #dc2626;
        font-weight: bold;
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
        background: white;
        color: #111827;
        padding: 24px;
        border-radius: 12px 12px 0 0;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .view-modal-title {
        font-size: 20px;
        font-weight: 600;
        margin: 0;
        color: #111827;
      }

      .close-button {
        color: #6b7280;
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s;
      }

      .close-button:hover {
        color: #374151;
        background-color: #f3f4f6;
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

      /* View Modal Styles */
      .view-modal-container {
        background: white;
        border-radius: 12px;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
        width: 100%;
        max-width: 768px;
        max-height: 90vh;
        overflow-y: auto;
      }

      .view-modal-header {
        background: white;
        color: #111827;
        padding: 24px;
        border-radius: 12px 12px 0 0;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .view-modal-title {
        font-size: 20px;
        font-weight: 600;
        margin: 0;
        color: #111827;
      }

      .view-modal-body {
        padding: 24px;
      }

      .view-details-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 20px;
        margin-bottom: 24px;
      }

      @media (min-width: 768px) {
        .view-details-grid {
          grid-template-columns: 1fr 1fr;
        }
      }

      .view-field {
        display: flex;
        flex-direction: column;
        padding: 16px;
        background-color: #f9fafb;
        border-radius: 8px;
        border: 1px solid #e5e7eb;
      }

      .view-field-full {
        display: flex;
        flex-direction: column;
        padding: 16px;
        background-color: #f9fafb;
        border-radius: 8px;
        border: 1px solid #e5e7eb;
        margin-bottom: 16px;
      }

      .view-label {
        font-size: 12px;
        font-weight: 600;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 8px;
      }

      .view-value {
        font-size: 16px;
        font-weight: 500;
        color: #111827;
        line-height: 1.5;
      }

      .view-field .type-badge {
        align-self: flex-start;
        margin-top: 4px;
      }
    `}</style>
    </>
  );
};

export default Parties;
