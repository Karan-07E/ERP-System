import React, { useState, useEffect } from 'react';
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
    fetchParties();
  }, [currentPage, searchTerm, filterType]);

  const fetchParties = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...(searchTerm && { search: searchTerm }),
        ...(filterType !== 'all' && { type: filterType })
      });

      const response = await api.get(`/parties?${params}`);
      if (response.data.success) {
        setParties(response.data.data.parties);
        setTotalPages(response.data.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching parties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedParty) {
        // Update party
        const response = await api.put(`/parties/${selectedParty.id}`, formData);
        if (response.data.success) {
          setShowEditModal(false);
          fetchParties();
          resetForm();
        }
      } else {
        // Create party
        const response = await api.post('/parties', formData);
        if (response.data.success) {
          setShowAddModal(false);
          fetchParties();
          resetForm();
        }
      }
    } catch (error) {
      console.error('Error saving party:', error);
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
      <div className="parties-container">
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
        </div>

        {/* Parties Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {parties.length === 0 ? (
            <div className="p-12 text-center">
              <Building size={64} className="mx-auto text-gray-300 mb-6" />
              <h3 className="text-xl font-medium text-gray-900 mb-3">No parties found</h3>
              <p className="text-gray-600 mb-6">Add your first party to get started.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
              >
                <Plus size={20} />
                Add Party
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Party Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      GST Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
              {parties.map((party) => (
                <tr key={party.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Building className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{party.name}</div>
                        <div className="text-sm text-gray-500">{party.partyCode}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(party.type)}`}>
                      {party.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{party.contactPerson}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Phone size={12} />
                      {party.phone || party.mobile}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{party.gstNumber}</div>
                    <div className="text-sm text-gray-500">State: {party.stateCode}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{party.city}</div>
                    <div className="text-sm text-gray-500">{party.state}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleView(party)}
                        className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-md transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(party)}
                        className="text-indigo-600 hover:text-indigo-800 p-2 hover:bg-indigo-50 rounded-md transition-colors"
                        title="Edit Party"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(party.id)}
                        className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-md transition-colors"
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
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
            <div className="text-sm text-gray-700 font-medium">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-white transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-white transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
        </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
              <h2 className="text-xl font-semibold">
                {selectedParty ? 'Edit Party' : 'Add New Party'}
              </h2>
            </div>
            
            <div className="p-6">
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Party Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="customer">Customer</option>
                    <option value="vendor">Vendor</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile
                  </label>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GST Number
                  </label>
                  <input
                    type="text"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({...formData, gstNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength="15"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PAN Number
                  </label>
                  <input
                    type="text"
                    value={formData.panNumber}
                    onChange={(e) => setFormData({...formData, panNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select State</option>
                    {stateOptions.map(state => (
                      <option key={state.code} value={state.name}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Credit Limit
                  </label>
                  <input
                    type="number"
                    value={formData.creditLimit}
                    onChange={(e) => setFormData({...formData, creditLimit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Terms
                </label>
                <input
                  type="text"
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData({...formData, paymentTerms: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors"
                >
                  {selectedParty ? 'Update' : 'Create'} Party
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
