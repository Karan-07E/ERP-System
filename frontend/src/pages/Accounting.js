import React, { useState, useEffect, useCallback } from 'react';
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
  FileText,
  CreditCard,
  Download,
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
  // const [reports, setReports] = useState({}); // Commented out as it's assigned but never used

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      switch (activeTab) {
        case 'parties':
          const partiesResponse = await axios.get('/api/parties');
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
            
            // setReports({
            //   salesSummary: salesSummary.data,
            //   hsnSummary: hsnSummary.data
            // });
            console.log('Reports data loaded:', { salesSummary: salesSummary.data, hsnSummary: hsnSummary.data });
          } catch (reportError) {
            console.log('Report data not available:', reportError);
            // setReports({});
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
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [activeTab, fetchData]);

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
        if (activeTab === 'parties') {
          const response = await axios.delete(`/api/parties/${item.id}`);
          if (response.data.success) {
            alert('Party deleted successfully!');
            await fetchData(); // Refresh the data
          }
        } else {
          // Remove item from state (in real app, would call API)
          if (activeTab === 'invoices') {
            setInvoices(prev => prev.filter(i => i.id !== item.id));
          } else if (activeTab === 'quotations') {
            setQuotations(prev => prev.filter(q => q.id !== item.id));
          } else if (activeTab === 'payments') {
            setPayments(prev => prev.filter(p => p.id !== item.id));
          }
          alert(`${activeTab.slice(0, -1)} deleted successfully!`);
        }
      } catch (error) {
        console.error('Error deleting item:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Error deleting item';
        alert(`Error: ${errorMessage}`);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (activeTab === 'parties') {
        if (modalType === 'create') {
          const response = await axios.post('/api/parties', formData);
          if (response.data.success) {
            alert('Party created successfully!');
            setShowModal(false);
            await fetchData(); // Refresh the data
            setFormData({});
          }
        } else if (modalType === 'edit') {
          const response = await axios.put(`/api/parties/${selectedItem.id}`, formData);
          if (response.data.success) {
            alert('Party updated successfully!');
            setShowModal(false);
            await fetchData(); // Refresh the data
            setFormData({});
          }
        }
      } else {
        // Enhanced logic for other tabs with better calculations
        if (modalType === 'create') {
          const newItem = {
            id: `${activeTab.slice(0, 1)}${Date.now()}`,
            ...formData,
            createdAt: new Date(),
            isActive: true
          };

          // Add specific fields based on tab
          if (activeTab === 'invoices') {
            const taxAmount = (formData.amount * formData.taxRate) / 100;
            const grandTotal = formData.amount + taxAmount;
            
            newItem.invoiceNumber = `INV-${String(invoices.length + 1).padStart(4, '0')}`;
            newItem.taxAmount = taxAmount;
            newItem.grandTotal = grandTotal;
            newItem.status = 'draft';
            newItem.paymentStatus = 'unpaid';
            
            // Find party details
            const party = parties.find(p => p.id === formData.partyId);
            newItem.party = party ? { name: party.name, type: party.type } : null;
            
            setInvoices(prev => [newItem, ...prev]);
          } else if (activeTab === 'quotations') {
            const taxAmount = (formData.amount * formData.taxRate) / 100;
            const grandTotal = formData.amount + taxAmount;
            
            newItem.quotationNumber = `QUO-${String(quotations.length + 1).padStart(4, '0')}`;
            newItem.taxAmount = taxAmount;
            newItem.grandTotal = grandTotal;
            
            // Find party details
            const party = parties.find(p => p.id === formData.partyId);
            newItem.party = party ? { name: party.name, type: party.type } : null;
            
            setQuotations(prev => [newItem, ...prev]);
          } else if (activeTab === 'payments') {
            newItem.paymentNumber = `PAY-${String(payments.length + 1).padStart(4, '0')}`;
            
            // Find party details
            const party = parties.find(p => p.id === formData.partyId);
            newItem.party = party ? { name: party.name, type: party.type } : null;
            
            setPayments(prev => [newItem, ...prev]);
          }

          alert(`${activeTab.slice(0, -1)} created successfully!`);
        } else if (modalType === 'edit') {
          const updatedItem = { ...selectedItem, ...formData };

          if (activeTab === 'invoices') {
            setInvoices(prev => prev.map(i => i.id === selectedItem.id ? updatedItem : i));
          } else if (activeTab === 'quotations') {
            setQuotations(prev => prev.map(q => q.id === selectedItem.id ? updatedItem : q));
          } else if (activeTab === 'payments') {
            setPayments(prev => prev.map(p => p.id === selectedItem.id ? updatedItem : p));
          }

          alert(`${activeTab.slice(0, -1)} updated successfully!`);
        }

        setShowModal(false);
        setFormData({});
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error submitting form';
      alert(`Error: ${errorMessage}`);
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
      case 'parties':
        return {
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
        };
      case 'invoices':
        return {
          partyId: '',
          invoiceDate: new Date().toISOString().split('T')[0],
          dueDate: '',
          placeOfSupply: '',
          amount: 0,
          taxRate: 18,
          description: '',
          notes: ''
        };
      case 'quotations':
        return {
          partyId: '',
          quotationDate: new Date().toISOString().split('T')[0],
          validUntil: '',
          status: 'draft',
          amount: 0,
          taxRate: 18,
          description: '',
          terms: '',
          notes: ''
        };
      case 'payments':
        return {
          partyId: '',
          type: 'payment_in',
          amount: 0,
          paymentDate: new Date().toISOString().split('T')[0],
          paymentMode: 'cash',
          referenceNumber: '',
          description: '',
          notes: ''
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
      case 'parties': return parties;
      case 'invoices': return invoices;
      case 'quotations': return quotations;
      case 'payments': return payments;
      case 'reports': return [];
      default: return [];
    }
  };

  const filteredData = getCurrentData().filter(item => {
    if (!searchTerm) return true;
    
    const searchFields = {
      parties: ['name', 'companyName', 'email', 'gstNumber'],
      invoices: ['invoiceNumber', 'party.name'],
      quotations: ['quotationNumber', 'party.name'],
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
      case 'parties':
        headers = ['Name', 'Company', 'Email', 'Phone', 'GST Number', 'Type', 'Credit Limit', 'Payment Terms'];
        rows = data.map(item => [
          item.name, item.companyName, item.email, item.phone,
          item.gstNumber || '', item.type, item.creditLimit, item.paymentTerms
        ]);
        break;
      case 'invoices':
        headers = ['Invoice Number', 'Party', 'Amount', 'Status', 'Payment Status', 'Due Date'];
        rows = data.map(item => [
          item.invoiceNumber, item.party?.name || 'N/A', item.grandTotal,
          item.status, item.paymentStatus, item.dueDate
        ]);
        break;
      case 'quotations':
        headers = ['Quotation Number', 'Party', 'Amount', 'Status', 'Valid Until'];
        rows = data.map(item => [
          item.quotationNumber, item.party?.name || 'N/A', item.grandTotal,
          item.status, item.validUntil
        ]);
        break;
      case 'payments':
        headers = ['Payment Number', 'Party', 'Amount', 'Type', 'Payment Mode', 'Date'];
        rows = data.map(item => [
          item.paymentNumber, item.party?.name || 'N/A', item.amount,
          item.type, item.paymentMode, item.paymentDate
        ]);
        break;
      default:
        return;
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
          {!['reports'].includes(activeTab) && (
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
            {!['reports'].includes(activeTab) && (
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
                  {activeTab === 'parties' && (
                    <>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Contact</th>
                      <th>GST Number</th>
                      <th>Credit Limit</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </>
                  )}
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
                      <th>Party</th>
                      <th>Actions</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredData.map(item => (
                  <tr key={item.id || item._id}>
                    {activeTab === 'parties' && (
                      <>
                        <td className="font-medium">{item.name}</td>
                        <td>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.type === 'customer' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {item.type?.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <div>{item.email}</div>
                          <div className="text-sm text-gray-500">{item.phone}</div>
                        </td>
                        <td>{item.gstNumber || 'N/A'}</td>
                        <td>₹{item.creditLimit?.toLocaleString()}</td>
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
                        <td>{item.party?.name || 'N/A'}</td>
                        <td>₹{item.grandTotal?.toLocaleString()}</td>
                        <td>{getStatusBadge(item.status)}</td>
                        <td>{getStatusBadge(item.paymentStatus)}</td>
                        <td>{new Date(item.dueDate).toLocaleDateString()}</td>
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
                    {activeTab === 'quotations' && (
                      <>
                        <td className="font-medium">{item.quotationNumber}</td>
                        <td>{item.party?.name || 'N/A'}</td>
                        <td>₹{item.grandTotal?.toLocaleString()}</td>
                        <td>{new Date(item.validUntil).toLocaleDateString()}</td>
                        <td>{getStatusBadge(item.status)}</td>
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
                    {activeTab === 'payments' && (
                      <>
                        <td className="font-medium">{item.paymentNumber}</td>
                        <td>{getStatusBadge(item.type)}</td>
                        <td>₹{item.amount?.toLocaleString()}</td>
                        <td>{item.paymentMode?.replace('_', ' ')}</td>
                        <td>{new Date(item.paymentDate).toLocaleDateString()}</td>
                        <td>{item.party?.name || 'N/A'}</td>
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
                    {(activeTab === 'parties' || activeTab === 'customers' || activeTab === 'vendors') && (
                      <>
                        <div className="detail-section">
                          <h4>Basic Information</h4>
                          <div className="detail-grid">
                            <div><strong>Name:</strong> {selectedItem.name}</div>
                            {activeTab === 'parties' && (
                              <>
                                <div><strong>Type:</strong> {selectedItem.type?.toUpperCase()}</div>
                                <div><strong>Contact Person:</strong> {selectedItem.contactPerson || 'N/A'}</div>
                              </>
                            )}
                            {(activeTab === 'customers' || activeTab === 'vendors') && (
                              <div><strong>Company:</strong> {selectedItem.companyName}</div>
                            )}
                            <div><strong>Email:</strong> {selectedItem.email}</div>
                            <div><strong>Phone:</strong> {selectedItem.phone}</div>
                            {activeTab === 'parties' && selectedItem.mobile && (
                              <div><strong>Mobile:</strong> {selectedItem.mobile}</div>
                            )}
                            <div><strong>GST Number:</strong> {selectedItem.gstNumber || 'N/A'}</div>
                            {activeTab === 'parties' && (
                              <>
                                <div><strong>PAN Number:</strong> {selectedItem.panNumber || 'N/A'}</div>
                                <div><strong>State Code:</strong> {selectedItem.stateCode || 'N/A'}</div>
                              </>
                            )}
                            <div><strong>Payment Terms:</strong> {selectedItem.paymentTerms}</div>
                            <div><strong>Credit Limit:</strong> ₹{selectedItem.creditLimit?.toLocaleString()}</div>
                            {activeTab === 'parties' && (
                              <div><strong>Credit Days:</strong> {selectedItem.creditDays || 0} days</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="detail-section">
                          <h4>Address</h4>
                          <div className="address-display">
                            {activeTab === 'parties' ? (
                              <>
                                {selectedItem.address && <>{selectedItem.address}<br/></>}
                                {selectedItem.city && <>{selectedItem.city}</>}
                                {selectedItem.state && <>, {selectedItem.state}</>}
                                {selectedItem.pincode && <> - {selectedItem.pincode}</>}
                              </>
                            ) : selectedItem.address ? (
                              <>
                                {selectedItem.address.street}<br/>
                                {selectedItem.address.city}, {selectedItem.address.state} {selectedItem.address.zipCode}
                              </>
                            ) : (
                              'No address provided'
                            )}
                          </div>
                        </div>

                        {activeTab === 'parties' && selectedItem.notes && (
                          <div className="detail-section">
                            <h4>Notes</h4>
                            <div>{selectedItem.notes}</div>
                          </div>
                        )}
                      </>
                    )}

                    {activeTab === 'invoices' && (
                      <div className="detail-section">
                        <h4>Invoice Information</h4>
                        <div className="detail-grid">
                          <div><strong>Invoice Number:</strong> {selectedItem.invoiceNumber}</div>
                          <div><strong>Party:</strong> {selectedItem.party?.name || 'N/A'}</div>
                          <div><strong>Invoice Date:</strong> {new Date(selectedItem.invoiceDate).toLocaleDateString()}</div>
                          <div><strong>Due Date:</strong> {new Date(selectedItem.dueDate).toLocaleDateString()}</div>
                          <div><strong>Place of Supply:</strong> {selectedItem.placeOfSupply}</div>
                          <div><strong>Amount:</strong> ₹{selectedItem.amount?.toLocaleString()}</div>
                          <div><strong>Tax Rate:</strong> {selectedItem.taxRate}%</div>
                          <div><strong>Tax Amount:</strong> ₹{selectedItem.taxAmount?.toLocaleString()}</div>
                          <div><strong>Grand Total:</strong> ₹{selectedItem.grandTotal?.toLocaleString()}</div>
                          <div><strong>Status:</strong> {selectedItem.status?.toUpperCase()}</div>
                          <div><strong>Payment Status:</strong> {selectedItem.paymentStatus?.toUpperCase()}</div>
                        </div>
                        {selectedItem.description && (
                          <div style={{marginTop: '16px'}}>
                            <strong>Description:</strong><br/>
                            {selectedItem.description}
                          </div>
                        )}
                        {selectedItem.notes && (
                          <div style={{marginTop: '16px'}}>
                            <strong>Notes:</strong><br/>
                            {selectedItem.notes}
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'quotations' && (
                      <div className="detail-section">
                        <h4>Quotation Information</h4>
                        <div className="detail-grid">
                          <div><strong>Quotation Number:</strong> {selectedItem.quotationNumber}</div>
                          <div><strong>Party:</strong> {selectedItem.party?.name || 'N/A'}</div>
                          <div><strong>Quotation Date:</strong> {new Date(selectedItem.quotationDate).toLocaleDateString()}</div>
                          <div><strong>Valid Until:</strong> {new Date(selectedItem.validUntil).toLocaleDateString()}</div>
                          <div><strong>Status:</strong> {selectedItem.status?.toUpperCase()}</div>
                          <div><strong>Amount:</strong> ₹{selectedItem.amount?.toLocaleString()}</div>
                          <div><strong>Tax Rate:</strong> {selectedItem.taxRate}%</div>
                          <div><strong>Tax Amount:</strong> ₹{selectedItem.taxAmount?.toLocaleString()}</div>
                          <div><strong>Grand Total:</strong> ₹{selectedItem.grandTotal?.toLocaleString()}</div>
                        </div>
                        {selectedItem.description && (
                          <div style={{marginTop: '16px'}}>
                            <strong>Description:</strong><br/>
                            {selectedItem.description}
                          </div>
                        )}
                        {selectedItem.terms && (
                          <div style={{marginTop: '16px'}}>
                            <strong>Terms & Conditions:</strong><br/>
                            {selectedItem.terms}
                          </div>
                        )}
                        {selectedItem.notes && (
                          <div style={{marginTop: '16px'}}>
                            <strong>Notes:</strong><br/>
                            {selectedItem.notes}
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'payments' && (
                      <div className="detail-section">
                        <h4>Payment Information</h4>
                        <div className="detail-grid">
                          <div><strong>Payment Number:</strong> {selectedItem.paymentNumber}</div>
                          <div><strong>Party:</strong> {selectedItem.party?.name || 'N/A'}</div>
                          <div><strong>Type:</strong> {selectedItem.type?.replace('_', ' ').toUpperCase()}</div>
                          <div><strong>Amount:</strong> ₹{selectedItem.amount?.toLocaleString()}</div>
                          <div><strong>Payment Date:</strong> {new Date(selectedItem.paymentDate).toLocaleDateString()}</div>
                          <div><strong>Payment Mode:</strong> {selectedItem.paymentMode?.replace('_', ' ').toUpperCase()}</div>
                          <div><strong>Reference Number:</strong> {selectedItem.referenceNumber || 'N/A'}</div>
                        </div>
                        {selectedItem.description && (
                          <div style={{marginTop: '16px'}}>
                            <strong>Description:</strong><br/>
                            {selectedItem.description}
                          </div>
                        )}
                        {selectedItem.notes && (
                          <div style={{marginTop: '16px'}}>
                            <strong>Notes:</strong><br/>
                            {selectedItem.notes}
                          </div>
                        )}
                      </div>
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
                {(activeTab === 'parties' || activeTab === 'customers' || activeTab === 'vendors') && (
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
                        <label>Type *</label>
                        <select
                          name="type"
                          value={formData.type || 'customer'}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="customer">Customer</option>
                          <option value="vendor">Vendor</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Contact Person</label>
                        <input
                          type="text"
                          name="contactPerson"
                          value={formData.contactPerson || ''}
                          onChange={handleInputChange}
                        />
                      </div>
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
                    </div>

                    <div className="form-row">
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
                      <div className="form-group">
                        <label>Mobile</label>
                        <input
                          type="tel"
                          name="mobile"
                          value={formData.mobile || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Address</label>
                      <input
                        type="text"
                        name="address"
                        placeholder="Street Address"
                        value={formData.address || ''}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>City</label>
                        <input
                          type="text"
                          name="city"
                          placeholder="City"
                          value={formData.city || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>State</label>
                        <input
                          type="text"
                          name="state"
                          placeholder="State"
                          value={formData.state || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Pincode</label>
                        <input
                          type="text"
                          name="pincode"
                          placeholder="Pincode"
                          value={formData.pincode || ''}
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
                        <label>PAN Number</label>
                        <input
                          type="text"
                          name="panNumber"
                          value={formData.panNumber || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>State Code</label>
                        <input
                          type="text"
                          name="stateCode"
                          value={formData.stateCode || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Payment Terms</label>
                        <select
                          name="paymentTerms"
                          value={formData.paymentTerms || ''}
                          onChange={handleInputChange}
                        >
                          <option value="">Select Terms</option>
                          <option value="Net 15">Net 15</option>
                          <option value="Net 30">Net 30</option>
                          <option value="Net 45">Net 45</option>
                          <option value="Net 60">Net 60</option>
                          <option value="COD">Cash on Delivery</option>
                          <option value="Advance">Advance Payment</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Credit Limit</label>
                        <input
                          type="number"
                          name="creditLimit"
                          value={formData.creditLimit || 0}
                          onChange={handleInputChange}
                          min="0"
                        />
                      </div>
                      <div className="form-group">
                        <label>Credit Days</label>
                        <input
                          type="number"
                          name="creditDays"
                          value={formData.creditDays || 0}
                          onChange={handleInputChange}
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Notes</label>
                      <textarea
                        name="notes"
                        value={formData.notes || ''}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Additional notes..."
                      />
                    </div>
                  </>
                )}

                {activeTab === 'invoices' && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Party *</label>
                        <select
                          name="partyId"
                          value={formData.partyId || ''}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select Party</option>
                          {parties.filter(p => p.type === 'customer').map(party => (
                            <option key={party.id} value={party.id}>{party.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Invoice Date *</label>
                        <input
                          type="date"
                          name="invoiceDate"
                          value={formData.invoiceDate || new Date().toISOString().split('T')[0]}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Due Date *</label>
                        <input
                          type="date"
                          name="dueDate"
                          value={formData.dueDate || ''}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Place of Supply *</label>
                        <input
                          type="text"
                          name="placeOfSupply"
                          value={formData.placeOfSupply || ''}
                          onChange={handleInputChange}
                          placeholder="e.g., Maharashtra"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Amount *</label>
                        <input
                          type="number"
                          name="amount"
                          value={formData.amount || 0}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Tax Rate (%)</label>
                        <select
                          name="taxRate"
                          value={formData.taxRate || 18}
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

                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        name="description"
                        value={formData.description || ''}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Invoice description..."
                      />
                    </div>

                    <div className="form-group">
                      <label>Notes</label>
                      <textarea
                        name="notes"
                        value={formData.notes || ''}
                        onChange={handleInputChange}
                        rows="2"
                        placeholder="Additional notes..."
                      />
                    </div>
                  </>
                )}

                {activeTab === 'quotations' && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Party *</label>
                        <select
                          name="partyId"
                          value={formData.partyId || ''}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select Party</option>
                          {parties.filter(p => p.type === 'customer').map(party => (
                            <option key={party.id} value={party.id}>{party.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Quotation Date *</label>
                        <input
                          type="date"
                          name="quotationDate"
                          value={formData.quotationDate || new Date().toISOString().split('T')[0]}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Valid Until *</label>
                        <input
                          type="date"
                          name="validUntil"
                          value={formData.validUntil || ''}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Status</label>
                        <select
                          name="status"
                          value={formData.status || 'draft'}
                          onChange={handleInputChange}
                        >
                          <option value="draft">Draft</option>
                          <option value="sent">Sent</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                          <option value="expired">Expired</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Amount *</label>
                        <input
                          type="number"
                          name="amount"
                          value={formData.amount || 0}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Tax Rate (%)</label>
                        <select
                          name="taxRate"
                          value={formData.taxRate || 18}
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

                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        name="description"
                        value={formData.description || ''}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Quotation description..."
                      />
                    </div>

                    <div className="form-group">
                      <label>Terms & Conditions</label>
                      <textarea
                        name="terms"
                        value={formData.terms || ''}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Terms and conditions..."
                      />
                    </div>

                    <div className="form-group">
                      <label>Notes</label>
                      <textarea
                        name="notes"
                        value={formData.notes || ''}
                        onChange={handleInputChange}
                        rows="2"
                        placeholder="Additional notes..."
                      />
                    </div>
                  </>
                )}

                {activeTab === 'payments' && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Party *</label>
                        <select
                          name="partyId"
                          value={formData.partyId || ''}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select Party</option>
                          {parties.map(party => (
                            <option key={party.id} value={party.id}>{party.name} ({party.type})</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Payment Type *</label>
                        <select
                          name="type"
                          value={formData.type || 'payment_in'}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="payment_in">Payment In (Received)</option>
                          <option value="payment_out">Payment Out (Made)</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Amount *</label>
                        <input
                          type="number"
                          name="amount"
                          value={formData.amount || 0}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Payment Date *</label>
                        <input
                          type="date"
                          name="paymentDate"
                          value={formData.paymentDate || new Date().toISOString().split('T')[0]}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Payment Mode *</label>
                        <select
                          name="paymentMode"
                          value={formData.paymentMode || 'cash'}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="cash">Cash</option>
                          <option value="bank_transfer">Bank Transfer</option>
                          <option value="cheque">Cheque</option>
                          <option value="upi">UPI</option>
                          <option value="credit_card">Credit Card</option>
                          <option value="debit_card">Debit Card</option>
                          <option value="online">Online Payment</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Reference Number</label>
                        <input
                          type="text"
                          name="referenceNumber"
                          value={formData.referenceNumber || ''}
                          onChange={handleInputChange}
                          placeholder="Transaction/Cheque No."
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
                        placeholder="Payment description..."
                      />
                    </div>

                    <div className="form-group">
                      <label>Notes</label>
                      <textarea
                        name="notes"
                        value={formData.notes || ''}
                        onChange={handleInputChange}
                        rows="2"
                        placeholder="Additional notes..."
                      />
                    </div>
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
