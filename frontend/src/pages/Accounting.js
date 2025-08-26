import React, { useState, useEffect } from 'react';
import axios from '../api/config';
import { 
  Calculator, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  X,
  Users,
  UserCheck,
  Package,
  FileText,
  CreditCard,
  DollarSign,
  Building,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Download,
  TrendingUp,
  BarChart3
} from 'lucide-react';

const Accounting = () => {
  const [activeTab, setActiveTab] = useState('parties');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Data states
  const [parties, setParties] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [reports, setReports] = useState({});

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      switch (activeTab) {
        case 'parties':
          const partiesResponse = await axios.get('/api/accounting/parties');
          setParties(partiesResponse.data.parties || []);
          break;
        case 'invoices':
          const invoicesResponse = await axios.get('/api/accounting/invoices');
          setInvoices(invoicesResponse.data.invoices || []);
          break;
        case 'quotations':
          const quotationsResponse = await axios.get('/api/accounting/quotations');
          setQuotations(quotationsResponse.data.quotations || []);
          break;
        case 'payments':
          const paymentsResponse = await axios.get('/api/accounting/payments');
          setPayments(paymentsResponse.data.payments || []);
          break;
        case 'reports':
          // Load basic report data
          const currentDate = new Date();
          const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
          
          try {
            const [salesSummary, hsnSummary] = await Promise.all([
              axios.get(`/api/accounting/reports/sales-summary?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`),
              axios.get(`/api/accounting/reports/hsn-summary?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
            ]);
            
            setReports({
              salesSummary: salesSummary.data,
              hsnSummary: hsnSummary.data
            });
          } catch (reportError) {
            console.log('Report data not available:', reportError);
            setReports({});
          }
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Fetch data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalType('create');
    setSelectedItem(null);
    setFormData(getDefaultFormData());
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setModalType('edit');
    setSelectedItem(item);
    setFormData(item);
    setShowModal(true);
  };

  const handleView = (item) => {
    setModalType('view');
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Are you sure you want to delete this ${activeTab.slice(0, -1)}?`)) {
      try {
        // Remove item from state (in real app, would call API)
        if (activeTab === 'customers') {
          setCustomers(prev => prev.filter(c => c._id !== item._id));
        } else if (activeTab === 'vendors') {
          setVendors(prev => prev.filter(v => v._id !== item._id));
        } else if (activeTab === 'items') {
          setItems(prev => prev.filter(i => i._id !== item._id));
        }
        alert(`${activeTab.slice(0, -1)} deleted successfully!`);
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Error deleting item');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (modalType === 'create') {
        const newItem = {
          _id: `${activeTab.slice(0, 1)}${Date.now()}`,
          ...formData,
          createdAt: new Date(),
          isActive: true
        };

        // Add specific fields based on tab
        if (activeTab === 'customers') {
          newItem.creditLimit = formData.creditLimit || 100000;
          newItem.paymentTerms = formData.paymentTerms || 'Net 30';
          setCustomers(prev => [newItem, ...prev]);
        } else if (activeTab === 'vendors') {
          newItem.paymentTerms = formData.paymentTerms || 'Net 30';
          setVendors(prev => [newItem, ...prev]);
        } else if (activeTab === 'items') {
          newItem.itemCode = formData.itemCode || `ITEM-${Date.now()}`;
          setItems(prev => [newItem, ...prev]);
        }

        alert(`${activeTab.slice(0, -1)} created successfully!`);
      } else if (modalType === 'edit') {
        const updatedItem = { ...selectedItem, ...formData };

        if (activeTab === 'customers') {
          setCustomers(prev => prev.map(c => c._id === selectedItem._id ? updatedItem : c));
        } else if (activeTab === 'vendors') {
          setVendors(prev => prev.map(v => v._id === selectedItem._id ? updatedItem : v));
        } else if (activeTab === 'items') {
          setItems(prev => prev.map(i => i._id === selectedItem._id ? updatedItem : i));
        }

        alert(`${activeTab.slice(0, -1)} updated successfully!`);
      }

      setShowModal(false);
      setFormData({});
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'number' ? parseFloat(value) || 0 : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value
      }));
    }
  };

  const getDefaultFormData = () => {
    switch (activeTab) {
      case 'customers':
        return {
          name: '',
          companyName: '',
          email: '',
          phone: '',
          address: { street: '', city: '', state: '', zipCode: '' },
          gstNumber: '',
          creditLimit: 100000,
          paymentTerms: 'Net 30'
        };
      case 'vendors':
        return {
          name: '',
          companyName: '',
          email: '',
          phone: '',
          address: { street: '', city: '', state: '', zipCode: '' },
          gstNumber: '',
          paymentTerms: 'Net 30'
        };
      case 'items':
        return {
          itemCode: '',
          name: '',
          description: '',
          category: 'raw_material',
          unit: 'pieces',
          purchasePrice: 0,
          salePrice: 0,
          hsnCode: '',
          gstRate: 18,
          reorderLevel: 10,
          maxStock: 1000
        };
      default:
        return {};
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'customers': return customers;
      case 'vendors': return vendors;
      case 'items': return items;
      case 'invoices': return invoices;
      case 'quotations': return quotations;
      case 'payments': return payments;
      default: return [];
    }
  };

  const filteredData = getCurrentData().filter(item => {
    if (!searchTerm) return true;
    
    const searchFields = {
      customers: ['name', 'companyName', 'email'],
      vendors: ['name', 'companyName', 'email'],
      items: ['name', 'itemCode', 'description'],
      invoices: ['invoiceNumber', 'customer.name'],
      quotations: ['quotationNumber', 'customer.name'],
      payments: ['paymentNumber', 'description']
    };

    return searchFields[activeTab]?.some(field => {
      const value = field.includes('.') 
        ? field.split('.').reduce((obj, key) => obj?.[key], item)
        : item[field];
      return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  const getStatusBadge = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      unpaid: 'bg-red-100 text-red-800',
      partial: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800',
      payment_in: 'bg-green-100 text-green-800',
      payment_out: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.draft}`}>
        {status?.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const exportToCSV = () => {
    const data = filteredData;
    if (data.length === 0) return;

    let headers = [];
    let rows = [];

    switch (activeTab) {
      case 'customers':
        headers = ['Name', 'Company', 'Email', 'Phone', 'GST Number', 'Credit Limit', 'Payment Terms'];
        rows = data.map(item => [
          item.name, item.companyName, item.email, item.phone,
          item.gstNumber || '', item.creditLimit, item.paymentTerms
        ]);
        break;
      case 'vendors':
        headers = ['Name', 'Company', 'Email', 'Phone', 'GST Number', 'Payment Terms'];
        rows = data.map(item => [
          item.name, item.companyName, item.email, item.phone,
          item.gstNumber || '', item.paymentTerms
        ]);
        break;
      case 'items':
        headers = ['Item Code', 'Name', 'Category', 'Unit', 'Purchase Price', 'Sale Price', 'GST Rate'];
        rows = data.map(item => [
          item.itemCode, item.name, item.category, item.unit,
          item.purchasePrice, item.salePrice, item.gstRate
        ]);
        break;
      case 'invoices':
        headers = ['Invoice Number', 'Customer', 'Amount', 'Status', 'Payment Status', 'Due Date'];
        rows = data.map(item => [
          item.invoiceNumber, item.customer?.name || '', item.grandTotal,
          item.status, item.paymentStatus, item.dueDate?.toLocaleDateString()
        ]);
        break;
    }

    const csvContent = [headers, ...rows].map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="loading">Loading accounting data...</div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">
          <Calculator size={24} />
          <h1>Accounting Management</h1>
        </div>
        <p>Comprehensive financial management and business transactions</p>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'parties' ? 'active' : ''}`}
          onClick={() => setActiveTab('parties')}
        >
          <Users size={18} />
          Parties
        </button>
        <button 
          className={`tab ${activeTab === 'invoices' ? 'active' : ''}`}
          onClick={() => setActiveTab('invoices')}
        >
          <FileText size={18} />
          Invoices
        </button>
        <button 
          className={`tab ${activeTab === 'quotations' ? 'active' : ''}`}
          onClick={() => setActiveTab('quotations')}
        >
          <Calculator size={18} />
          Quotations
        </button>
        <button 
          className={`tab ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          <CreditCard size={18} />
          Payments
        </button>
        <button 
          className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <BarChart3 size={18} />
          GST Reports
        </button>
      </div>

      {/* Controls */}
      <div className="controls">
        <div className="search-section">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="action-buttons">
          <button className="btn btn-secondary" onClick={exportToCSV}>
            <Download size={18} />
            Export CSV
          </button>
          {['customers', 'vendors', 'items'].includes(activeTab) && (
            <button className="btn btn-primary" onClick={handleCreate}>
              <Plus size={18} />
              Add {activeTab.slice(0, -1)}
            </button>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="data-section">
        {filteredData.length === 0 ? (
          <div className="empty-state">
            <Calculator size={48} />
            <h3>No {activeTab} found</h3>
            <p>Start by adding your first {activeTab.slice(0, -1)}</p>
            {['customers', 'vendors', 'items'].includes(activeTab) && (
              <button className="btn btn-primary" onClick={handleCreate}>
                Add {activeTab.slice(0, -1)}
              </button>
            )}
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  {activeTab === 'customers' && (
                    <>
                      <th>Name</th>
                      <th>Company</th>
                      <th>Contact</th>
                      <th>Credit Limit</th>
                      <th>Payment Terms</th>
                      <th>Actions</th>
                    </>
                  )}
                  {activeTab === 'vendors' && (
                    <>
                      <th>Name</th>
                      <th>Company</th>
                      <th>Contact</th>
                      <th>Payment Terms</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </>
                  )}
                  {activeTab === 'items' && (
                    <>
                      <th>Item Code</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Unit</th>
                      <th>Purchase Price</th>
                      <th>Sale Price</th>
                      <th>Actions</th>
                    </>
                  )}
                  {activeTab === 'invoices' && (
                    <>
                      <th>Invoice Number</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Payment Status</th>
                      <th>Due Date</th>
                      <th>Actions</th>
                    </>
                  )}
                  {activeTab === 'quotations' && (
                    <>
                      <th>Quotation Number</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Valid Until</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </>
                  )}
                  {activeTab === 'payments' && (
                    <>
                      <th>Payment Number</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredData.map(item => (
                  <tr key={item._id}>
                    {activeTab === 'customers' && (
                      <>
                        <td className="font-medium">{item.name}</td>
                        <td>{item.companyName}</td>
                        <td>
                          <div>{item.email}</div>
                          <div className="text-sm text-gray-500">{item.phone}</div>
                        </td>
                        <td>₹{item.creditLimit?.toLocaleString()}</td>
                        <td>{item.paymentTerms}</td>
                        <td>
                          <div className="action-buttons">
                            <button onClick={() => handleView(item)} className="btn-icon">
                              <Eye size={16} />
                            </button>
                            <button onClick={() => handleEdit(item)} className="btn-icon">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleDelete(item)} className="btn-icon btn-danger">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                    {activeTab === 'vendors' && (
                      <>
                        <td className="font-medium">{item.name}</td>
                        <td>{item.companyName}</td>
                        <td>
                          <div>{item.email}</div>
                          <div className="text-sm text-gray-500">{item.phone}</div>
                        </td>
                        <td>{item.paymentTerms}</td>
                        <td>{getStatusBadge(item.isActive ? 'active' : 'inactive')}</td>
                        <td>
                          <div className="action-buttons">
                            <button onClick={() => handleView(item)} className="btn-icon">
                              <Eye size={16} />
                            </button>
                            <button onClick={() => handleEdit(item)} className="btn-icon">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleDelete(item)} className="btn-icon btn-danger">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                    {activeTab === 'items' && (
                      <>
                        <td className="font-medium">{item.itemCode}</td>
                        <td>{item.name}</td>
                        <td>{item.category?.replace('_', ' ')}</td>
                        <td>{item.unit}</td>
                        <td>₹{item.purchasePrice?.toLocaleString()}</td>
                        <td>₹{item.salePrice?.toLocaleString()}</td>
                        <td>
                          <div className="action-buttons">
                            <button onClick={() => handleView(item)} className="btn-icon">
                              <Eye size={16} />
                            </button>
                            <button onClick={() => handleEdit(item)} className="btn-icon">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleDelete(item)} className="btn-icon btn-danger">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                    {activeTab === 'invoices' && (
                      <>
                        <td className="font-medium">{item.invoiceNumber}</td>
                        <td>{item.customer?.name}</td>
                        <td>₹{item.grandTotal?.toLocaleString()}</td>
                        <td>{getStatusBadge(item.status)}</td>
                        <td>{getStatusBadge(item.paymentStatus)}</td>
                        <td>{item.dueDate?.toLocaleDateString()}</td>
                        <td>
                          <div className="action-buttons">
                            <button onClick={() => handleView(item)} className="btn-icon">
                              <Eye size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                    {activeTab === 'quotations' && (
                      <>
                        <td className="font-medium">{item.quotationNumber}</td>
                        <td>{item.customer?.name}</td>
                        <td>₹{item.grandTotal?.toLocaleString()}</td>
                        <td>{item.validUntil?.toLocaleDateString()}</td>
                        <td>{getStatusBadge(item.status)}</td>
                        <td>
                          <div className="action-buttons">
                            <button onClick={() => handleView(item)} className="btn-icon">
                              <Eye size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                    {activeTab === 'payments' && (
                      <>
                        <td className="font-medium">{item.paymentNumber}</td>
                        <td>{getStatusBadge(item.type)}</td>
                        <td>₹{item.amount?.toLocaleString()}</td>
                        <td>{item.paymentMethod?.replace('_', ' ')}</td>
                        <td>{item.paymentDate?.toLocaleDateString()}</td>
                        <td>{item.description}</td>
                        <td>
                          <div className="action-buttons">
                            <button onClick={() => handleView(item)} className="btn-icon">
                              <Eye size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Create/Edit/View */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {modalType === 'create' && `Add New ${activeTab.slice(0, -1)}`}
                {modalType === 'edit' && `Edit ${activeTab.slice(0, -1)}`}
                {modalType === 'view' && `${activeTab.slice(0, -1)} Details`}
              </h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            {modalType === 'view' ? (
              <div className="modal-body">
                {selectedItem && (
                  <div className="view-details">
                    {(activeTab === 'customers' || activeTab === 'vendors') && (
                      <>
                        <div className="detail-section">
                          <h4>Basic Information</h4>
                          <div className="detail-grid">
                            <div><strong>Name:</strong> {selectedItem.name}</div>
                            <div><strong>Company:</strong> {selectedItem.companyName}</div>
                            <div><strong>Email:</strong> {selectedItem.email}</div>
                            <div><strong>Phone:</strong> {selectedItem.phone}</div>
                            <div><strong>GST Number:</strong> {selectedItem.gstNumber || 'N/A'}</div>
                            <div><strong>Payment Terms:</strong> {selectedItem.paymentTerms}</div>
                            {activeTab === 'customers' && (
                              <div><strong>Credit Limit:</strong> ₹{selectedItem.creditLimit?.toLocaleString()}</div>
                            )}
                          </div>
                        </div>
                        
                        {selectedItem.address && (
                          <div className="detail-section">
                            <h4>Address</h4>
                            <div className="address-display">
                              {selectedItem.address.street}<br/>
                              {selectedItem.address.city}, {selectedItem.address.state} {selectedItem.address.zipCode}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    
                    {activeTab === 'items' && (
                      <div className="detail-section">
                        <h4>Item Information</h4>
                        <div className="detail-grid">
                          <div><strong>Item Code:</strong> {selectedItem.itemCode}</div>
                          <div><strong>Name:</strong> {selectedItem.name}</div>
                          <div><strong>Category:</strong> {selectedItem.category?.replace('_', ' ')}</div>
                          <div><strong>Unit:</strong> {selectedItem.unit}</div>
                          <div><strong>Purchase Price:</strong> ₹{selectedItem.purchasePrice?.toLocaleString()}</div>
                          <div><strong>Sale Price:</strong> ₹{selectedItem.salePrice?.toLocaleString()}</div>
                          <div><strong>HSN Code:</strong> {selectedItem.hsnCode || 'N/A'}</div>
                          <div><strong>GST Rate:</strong> {selectedItem.gstRate}%</div>
                          <div><strong>Reorder Level:</strong> {selectedItem.reorderLevel}</div>
                          <div><strong>Max Stock:</strong> {selectedItem.maxStock}</div>
                        </div>
                        {selectedItem.description && (
                          <div>
                            <strong>Description:</strong><br/>
                            {selectedItem.description}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="modal-body">
                {(activeTab === 'customers' || activeTab === 'vendors') && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name || ''}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Company Name</label>
                        <input
                          type="text"
                          name="companyName"
                          value={formData.companyName || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Email *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email || ''}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Phone *</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone || ''}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Address</label>
                      <input
                        type="text"
                        name="address.street"
                        placeholder="Street Address"
                        value={formData.address?.street || ''}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <input
                          type="text"
                          name="address.city"
                          placeholder="City"
                          value={formData.address?.city || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <input
                          type="text"
                          name="address.state"
                          placeholder="State"
                          value={formData.address?.state || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <input
                          type="text"
                          name="address.zipCode"
                          placeholder="ZIP Code"
                          value={formData.address?.zipCode || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>GST Number</label>
                        <input
                          type="text"
                          name="gstNumber"
                          value={formData.gstNumber || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Payment Terms</label>
                        <select
                          name="paymentTerms"
                          value={formData.paymentTerms || 'Net 30'}
                          onChange={handleInputChange}
                        >
                          <option value="Net 15">Net 15</option>
                          <option value="Net 30">Net 30</option>
                          <option value="Net 45">Net 45</option>
                          <option value="Net 60">Net 60</option>
                          <option value="COD">Cash on Delivery</option>
                          <option value="Advance">Advance Payment</option>
                        </select>
                      </div>
                    </div>

                    {activeTab === 'customers' && (
                      <div className="form-group">
                        <label>Credit Limit</label>
                        <input
                          type="number"
                          name="creditLimit"
                          value={formData.creditLimit || 100000}
                          onChange={handleInputChange}
                          min="0"
                        />
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'items' && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Item Code *</label>
                        <input
                          type="text"
                          name="itemCode"
                          value={formData.itemCode || ''}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name || ''}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        name="description"
                        value={formData.description || ''}
                        onChange={handleInputChange}
                        rows="3"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Category *</label>
                        <select
                          name="category"
                          value={formData.category || 'raw_material'}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="raw_material">Raw Material</option>
                          <option value="finished_goods">Finished Goods</option>
                          <option value="semi_finished">Semi Finished</option>
                          <option value="consumables">Consumables</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Unit *</label>
                        <select
                          name="unit"
                          value={formData.unit || 'pieces'}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="pieces">Pieces</option>
                          <option value="kg">Kilograms</option>
                          <option value="liters">Liters</option>
                          <option value="meters">Meters</option>
                          <option value="boxes">Boxes</option>
                          <option value="tons">Tons</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Purchase Price *</label>
                        <input
                          type="number"
                          name="purchasePrice"
                          value={formData.purchasePrice || 0}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Sale Price *</label>
                        <input
                          type="number"
                          name="salePrice"
                          value={formData.salePrice || 0}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>HSN Code</label>
                        <input
                          type="text"
                          name="hsnCode"
                          value={formData.hsnCode || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>GST Rate (%)</label>
                        <select
                          name="gstRate"
                          value={formData.gstRate || 18}
                          onChange={handleInputChange}
                        >
                          <option value={0}>0%</option>
                          <option value={5}>5%</option>
                          <option value={12}>12%</option>
                          <option value={18}>18%</option>
                          <option value={28}>28%</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Reorder Level</label>
                        <input
                          type="number"
                          name="reorderLevel"
                          value={formData.reorderLevel || 10}
                          onChange={handleInputChange}
                          min="0"
                        />
                      </div>
                      <div className="form-group">
                        <label>Max Stock</label>
                        <input
                          type="number"
                          name="maxStock"
                          value={formData.maxStock || 1000}
                          onChange={handleInputChange}
                          min="0"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="form-actions">
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn btn-primary">
                    {submitting ? 'Processing...' : (modalType === 'create' ? 'Create' : 'Update')}
                  </button>
                </div>
              </form>
            )}
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
        
        .page-header p {
          color: #666;
          font-size: 16px;
          margin: 0;
        }

        /* Tabs */
        .tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 20px;
          border-bottom: 2px solid #f0f0f0;
          overflow-x: auto;
        }

        .tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          font-weight: 500;
          color: #666;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .tab:hover {
          color: #007bff;
          background-color: #f8f9fa;
        }

        .tab.active {
          color: #007bff;
          border-bottom-color: #007bff;
          background-color: #f8f9fa;
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
        }

        /* Data Table */
        .data-section {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          border: 1px solid #e0e0e0;
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

        .btn-icon.btn-danger:hover {
          background: #fee2e2;
          color: #dc2626;
        }

        /* Status badges */
        .bg-green-100 { background-color: #dcfce7; }
        .text-green-800 { color: #166534; }
        .bg-yellow-100 { background-color: #fef3c7; }
        .text-yellow-800 { color: #92400e; }
        .bg-red-100 { background-color: #fee2e2; }
        .text-red-800 { color: #991b1b; }
        .bg-blue-100 { background-color: #dbeafe; }
        .text-blue-800 { color: #1e40af; }
        .bg-gray-100 { background-color: #f3f4f6; }
        .text-gray-800 { color: #1f2937; }

        /* Empty State */
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
        }

        .modal-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }

        .close-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 5px;
          border-radius: 4px;
          color: #666;
        }

        .close-btn:hover {
          background-color: #f0f0f0;
          color: #333;
        }

        .modal-body {
          padding: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        .form-row.three-cols {
          grid-template-columns: 1fr 1fr 1fr;
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

        .form-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
        }

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

        .btn-primary:disabled {
          background-color: #6c757d;
          border-color: #6c757d;
          cursor: not-allowed;
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

        /* View Details */
        .view-details {
          max-height: 500px;
          overflow-y: auto;
        }

        .detail-section {
          margin-bottom: 24px;
        }

        .detail-section h4 {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e0e0e0;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .detail-grid > div {
          font-size: 14px;
          color: #666;
        }

        .address-display {
          font-size: 14px;
          color: #666;
          line-height: 1.5;
        }

        .loading {
          text-align: center;
          padding: 60px 20px;
          font-size: 18px;
          color: #666;
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

          .form-row {
            grid-template-columns: 1fr;
          }

          .form-row.three-cols {
            grid-template-columns: 1fr;
          }

          .detail-grid {
            grid-template-columns: 1fr;
          }

          .modal {
            width: 95%;
            margin: 10px;
          }

          .tabs {
            flex-wrap: nowrap;
            overflow-x: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default Accounting;
