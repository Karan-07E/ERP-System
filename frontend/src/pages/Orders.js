import React, { useState, useEffect } from 'react';
import axios from '../api/config';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Package, 
  Truck, 
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Calendar,
  User,
  FileText
} from 'lucide-react';

const Orders = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [orders, setOrders] = useState([]);
  const [jobCards, setJobCards] = useState([]);
  const [deliveryNotes, setDeliveryNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    fetchData();
    loadCustomersAndVendors();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch real demo data from backend
      const ordersResponse = await axios.get('/api/orders/demo/list');
      setOrders(ordersResponse.data.orders || []);
      
      // Mock job cards and delivery notes for now
      const mockJobCards = [
        {
          _id: 'jc-001',
          jobCardNumber: 'JC-001',
          title: 'Manufacturing Job A',
          order: { orderNumber: 'SO-001' },
          status: 'in_progress',
          priority: 'high',
          assignedTo: { firstName: 'John', lastName: 'Doe' },
          startDate: new Date('2025-08-05'),
          targetCompletionDate: new Date('2025-08-12')
        }
      ];

      const mockDeliveryNotes = [
        {
          _id: 'dn-001',
          challanNumber: 'DN-001',
          type: 'sales',
          customer: { name: 'Acme Corp' },
          status: 'delivered',
          deliveryDate: new Date('2025-08-14'),
          items: [{ item: { name: 'Product A' }, quantity: 10 }]
        }
      ];

      setJobCards(mockJobCards);
      setDeliveryNotes(mockDeliveryNotes);
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Fallback to mock data if API fails
      const fallbackData = [
        {
          _id: 'so-fallback',
          orderNumber: 'SO-DEMO',
          type: 'sales_order',
          customer: { name: 'Demo Customer' },
          status: 'draft',
          priority: 'medium',
          orderDate: new Date(),
          expectedDeliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          grandTotal: 10000,
          items: []
        }
      ];
      setOrders(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomersAndVendors = async () => {
    try {
      // Load customers and vendors from backend
      const [customersResponse, vendorsResponse] = await Promise.all([
        axios.get('/api/accounting/customers/demo/list'),
        axios.get('/api/accounting/vendors/demo/list')
      ]);
      
      setCustomers(customersResponse.data.customers || []);
      setVendors(vendorsResponse.data.vendors || []);
    } catch (error) {
      console.error('Error loading customers and vendors:', error);
      // Fallback to mock data
      setCustomers([
        { _id: 'c1', name: 'Demo Customer', companyName: 'Demo Corp' }
      ]);
      setVendors([
        { _id: 'v1', name: 'Demo Vendor', companyName: 'Demo Supplies' }
      ]);
    }
  };

  const handleCreateOrder = (type) => {
    setModalType('create');
    setSelectedOrder(null);
    setFormData({
      type: type === 'sales' ? 'sales_order' : 'purchase_order',
      customer: '',
      vendor: '',
      priority: 'medium',
      items: [],
      notes: ''
    });
    setShowModal(true);
  };

  const handleEditOrder = (order) => {
    setModalType('edit');
    setSelectedOrder(order);
    setFormData({
      type: order.type,
      customer: order.customer?._id || '',
      vendor: order.vendor?._id || '',
      priority: order.priority,
      status: order.status,
      notes: order.notes || '',
      items: order.items || []
    });
    setShowModal(true);
  };

  const handleViewOrder = (order) => {
    setModalType('view');
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      // Update status via backend API
      await axios.put(`/api/orders/demo/${orderId}/status`, {
        status: newStatus
      });

      // Update status in the local state
      const updatedOrders = orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
      
      console.log(`Updated order ${orderId} status to ${newStatus}`);
      alert(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status');
    }
  };

  const handleCreateJobCard = (order) => {
    setModalType('jobcard');
    setSelectedOrder(order);
    setFormData({
      orderId: order._id,
      title: `Job for ${order.orderNumber}`,
      description: '',
      priority: order.priority,
      assignedTo: ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (modalType === 'create') {
        // Create new order
        const endpoint = '/api/orders/simple';
        const payload = {
          type: formData.type,
          customer: formData.customer,
          vendor: formData.vendor,
          priority: formData.priority,
          description: formData.notes
        };

        const response = await axios.post(endpoint, payload);
        
        // Add to local state for demo
        const newOrder = {
          _id: `new-${Date.now()}`,
          orderNumber: response.data.order?.orderNumber || `${formData.type === 'sales_order' ? 'SO' : 'PO'}-${Date.now()}`,
          type: formData.type,
          customer: customers.find(c => c._id === formData.customer),
          vendor: vendors.find(v => v._id === formData.vendor),
          status: 'draft',
          priority: formData.priority,
          orderDate: new Date(),
          expectedDeliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          grandTotal: 0,
          items: [],
          notes: formData.notes
        };
        
        setOrders(prev => [newOrder, ...prev]);
        alert('Order created successfully!');
        
      } else if (modalType === 'edit') {
        // Update existing order
        const updatedOrders = orders.map(order => 
          order._id === selectedOrder._id 
            ? { 
                ...order, 
                priority: formData.priority,
                status: formData.status,
                notes: formData.notes 
              }
            : order
        );
        setOrders(updatedOrders);
        alert('Order updated successfully!');
        
      } else if (modalType === 'jobcard') {
        // Create job card
        const endpoint = '/api/orders/job-cards/simple';
        const payload = {
          title: formData.title,
          description: formData.description,
          priority: formData.priority
        };

        await axios.post(endpoint, payload);
        
        const newJobCard = {
          _id: `jc-${Date.now()}`,
          jobCardNumber: `JC-${Date.now()}`,
          title: formData.title,
          order: selectedOrder,
          status: 'assigned',
          priority: formData.priority,
          description: formData.description,
          startDate: new Date()
        };
        
        setJobCards(prev => [newJobCard, ...prev]);
        alert('Job card created successfully!');
      }

      setShowModal(false);
      setFormData({});
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getStatusBadge = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      confirmed: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      in_production: 'bg-orange-100 text-orange-800',
      ready_to_ship: 'bg-purple-100 text-purple-800',
      shipped: 'bg-green-100 text-green-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.draft}`}>
        {status?.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.customer?.name || order.vendor?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesTab = activeTab === 'sales' ? order.type === 'sales_order' : 
                      activeTab === 'purchase' ? order.type === 'purchase_order' : true;
    return matchesSearch && matchesStatus && matchesTab;
  });

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }
  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">
          <ShoppingCart size={24} />
          <h1>Orders Management</h1>
        </div>
        <p>Manage sales orders, purchase orders, job cards, and delivery tracking</p>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveTab('sales')}
        >
          <ShoppingCart size={18} />
          Sales Orders
        </button>
        <button 
          className={`tab ${activeTab === 'purchase' ? 'active' : ''}`}
          onClick={() => setActiveTab('purchase')}
        >
          <Package size={18} />
          Purchase Orders
        </button>
        <button 
          className={`tab ${activeTab === 'jobcards' ? 'active' : ''}`}
          onClick={() => setActiveTab('jobcards')}
        >
          <FileText size={18} />
          Job Cards
        </button>
        <button 
          className={`tab ${activeTab === 'delivery' ? 'active' : ''}`}
          onClick={() => setActiveTab('delivery')}
        >
          <Truck size={18} />
          Delivery Notes
        </button>
      </div>

      {/* Search and Filters */}
      <div className="controls">
        <div className="search-section">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="in_production">In Production</option>
            <option value="ready_to_ship">Ready to Ship</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="action-buttons">
          {(activeTab === 'sales' || activeTab === 'purchase') && (
            <button 
              className="btn btn-primary"
              onClick={() => handleCreateOrder(activeTab)}
            >
              <Plus size={18} />
              New {activeTab === 'sales' ? 'Sales' : 'Purchase'} Order
            </button>
          )}
        </div>
      </div>

      {/* Content based on active tab */}
      {(activeTab === 'sales' || activeTab === 'purchase') && (
        <div className="orders-section">
          <div className="orders-grid">
            {filteredOrders.length === 0 ? (
              <div className="empty-state">
                <ShoppingCart size={48} />
                <h3>No orders found</h3>
                <p>Start by creating your first {activeTab} order</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => handleCreateOrder(activeTab)}
                >
                  Create {activeTab === 'sales' ? 'Sales' : 'Purchase'} Order
                </button>
              </div>
            ) : (
              filteredOrders.map(order => (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <div className="order-number">
                      <strong>{order.orderNumber}</strong>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="order-actions">
                      <button onClick={() => handleViewOrder(order)} title="View">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => handleEditOrder(order)} title="Edit">
                        <Edit size={16} />
                      </button>
                      {order.status === 'confirmed' && (
                        <button onClick={() => handleCreateJobCard(order)} title="Create Job Card">
                          <FileText size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="order-details">
                    <div className="detail-row">
                      <User size={14} />
                      <span>{order.customer?.name || order.vendor?.name}</span>
                    </div>
                    <div className="detail-row">
                      <Calendar size={14} />
                      <span>{new Date(order.orderDate).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-row">
                      <span className={`priority-badge priority-${order.priority}`}>
                        {order.priority?.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="order-footer">
                    <div className="order-total">
                      ₹{order.grandTotal?.toLocaleString() || '0'}
                    </div>
                    <select 
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="status-select"
                    >
                      <option value="draft">Draft</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="in_production">In Production</option>
                      <option value="ready_to_ship">Ready to Ship</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Job Cards Tab */}
      {activeTab === 'jobcards' && (
        <div className="jobcards-section">
          <div className="section-header">
            <h2>Job Cards</h2>
            <p>Track production jobs and work orders</p>
          </div>
          <div className="cards-grid">
            {jobCards.map(jobCard => (
              <div key={jobCard._id} className="job-card">
                <div className="job-header">
                  <div>
                    <strong>{jobCard.jobCardNumber}</strong>
                    {getStatusBadge(jobCard.status)}
                  </div>
                </div>
                <h4>{jobCard.title}</h4>
                <div className="job-details">
                  <div className="detail-row">
                    <span>Order: {jobCard.order?.orderNumber}</span>
                  </div>
                  <div className="detail-row">
                    <span>Assigned: {jobCard.assignedTo?.firstName} {jobCard.assignedTo?.lastName}</span>
                  </div>
                  <div className="detail-row">
                    <span>Priority: {jobCard.priority}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delivery Notes Tab */}
      {activeTab === 'delivery' && (
        <div className="delivery-section">
          <div className="section-header">
            <h2>Delivery Notes</h2>
            <p>Manage delivery documentation and tracking</p>
          </div>
          <div className="cards-grid">
            {deliveryNotes.map(note => (
              <div key={note._id} className="delivery-card">
                <div className="delivery-header">
                  <div>
                    <strong>{note.challanNumber}</strong>
                    {getStatusBadge(note.status)}
                  </div>
                </div>
                <div className="delivery-details">
                  <div className="detail-row">
                    <span>Customer: {note.customer?.name}</span>
                  </div>
                  <div className="detail-row">
                    <span>Delivery: {new Date(note.deliveryDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal for Create/Edit/View */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {modalType === 'create' && `Create ${formData.type === 'sales_order' ? 'Sales' : 'Purchase'} Order`}
                {modalType === 'edit' && 'Edit Order'}
                {modalType === 'view' && 'Order Details'}
                {modalType === 'jobcard' && 'Create Job Card'}
              </h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            {modalType === 'view' ? (
              <div className="modal-body">
                <div className="view-details">
                  <div className="detail-section">
                    <h4>Order Information</h4>
                    <div className="detail-grid">
                      <div><strong>Order Number:</strong> {selectedOrder?.orderNumber}</div>
                      <div><strong>Type:</strong> {selectedOrder?.type?.replace('_', ' ')}</div>
                      <div><strong>Status:</strong> {selectedOrder?.status}</div>
                      <div><strong>Priority:</strong> {selectedOrder?.priority}</div>
                      <div><strong>Customer/Vendor:</strong> {selectedOrder?.customer?.name || selectedOrder?.vendor?.name}</div>
                      <div><strong>Order Date:</strong> {new Date(selectedOrder?.orderDate).toLocaleDateString()}</div>
                      <div><strong>Expected Delivery:</strong> {new Date(selectedOrder?.expectedDeliveryDate).toLocaleDateString()}</div>
                      <div><strong>Total Amount:</strong> ₹{selectedOrder?.grandTotal?.toLocaleString() || '0'}</div>
                    </div>
                  </div>
                  
                  {selectedOrder?.items?.length > 0 && (
                    <div className="detail-section">
                      <h4>Items</h4>
                      <div className="items-list">
                        {selectedOrder.items.map((item, index) => (
                          <div key={index} className="item-row">
                            <span>{item.item?.name}</span>
                            <span>Qty: {item.quantity}</span>
                            <span>₹{item.unitPrice?.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="modal-body">
                {(modalType === 'create' || modalType === 'edit') && (
                  <>
                    {modalType === 'create' && (
                      <div className="form-group">
                        <label>Order Type</label>
                        <select
                          name="type"
                          value={formData.type || ''}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="sales_order">Sales Order</option>
                          <option value="purchase_order">Purchase Order</option>
                        </select>
                      </div>
                    )}

                    {formData.type === 'sales_order' && (
                      <div className="form-group">
                        <label>Customer</label>
                        <select
                          name="customer"
                          value={formData.customer || ''}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select Customer</option>
                          {customers.map(customer => (
                            <option key={customer._id} value={customer._id}>
                              {customer.name} - {customer.companyName}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {formData.type === 'purchase_order' && (
                      <div className="form-group">
                        <label>Vendor</label>
                        <select
                          name="vendor"
                          value={formData.vendor || ''}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select Vendor</option>
                          {vendors.map(vendor => (
                            <option key={vendor._id} value={vendor._id}>
                              {vendor.name} - {vendor.companyName}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="form-group">
                      <label>Priority</label>
                      <select
                        name="priority"
                        value={formData.priority || 'medium'}
                        onChange={handleInputChange}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>

                    {modalType === 'edit' && (
                      <div className="form-group">
                        <label>Status</label>
                        <select
                          name="status"
                          value={formData.status || ''}
                          onChange={handleInputChange}
                        >
                          <option value="draft">Draft</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="in_production">In Production</option>
                          <option value="ready_to_ship">Ready to Ship</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    )}

                    <div className="form-group">
                      <label>Notes</label>
                      <textarea
                        name="notes"
                        value={formData.notes || ''}
                        onChange={handleInputChange}
                        placeholder="Order notes and special instructions"
                        rows="3"
                      />
                    </div>
                  </>
                )}

                {modalType === 'jobcard' && (
                  <>
                    <div className="form-group">
                      <label>Job Title</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title || ''}
                        onChange={handleInputChange}
                        placeholder="Job card title"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        name="description"
                        value={formData.description || ''}
                        onChange={handleInputChange}
                        placeholder="Job description and requirements"
                        rows="4"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Priority</label>
                      <select
                        name="priority"
                        value={formData.priority || 'medium'}
                        onChange={handleInputChange}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="form-actions">
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn btn-primary">
                    {submitting ? 'Processing...' : (modalType === 'create' ? 'Create' : modalType === 'edit' ? 'Update' : 'Create Job Card')}
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
          gap: 2px;
          margin-bottom: 24px;
          border-bottom: 2px solid #f0f0f0;
        }

        .tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          color: #666;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
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
          max-width: 500px;
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

        .filter-select {
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          background: white;
          font-size: 14px;
          min-width: 140px;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        /* Orders Grid */
        .orders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .order-card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          border: 1px solid #e0e0e0;
          transition: box-shadow 0.2s;
        }

        .order-card:hover {
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .order-number {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .order-actions {
          display: flex;
          gap: 4px;
        }

        .order-actions button {
          background: #f8f9fa;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          padding: 6px;
          cursor: pointer;
          color: #666;
          transition: all 0.2s;
        }

        .order-actions button:hover {
          background: #e9ecef;
          color: #007bff;
        }

        .order-details {
          margin-bottom: 16px;
        }

        .detail-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-size: 14px;
          color: #666;
        }

        .priority-badge {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .priority-low {
          background: #e8f5e8;
          color: #2e7d32;
        }

        .priority-medium {
          background: #fff3e0;
          color: #f57c00;
        }

        .priority-high {
          background: #ffebee;
          color: #c62828;
        }

        .priority-urgent {
          background: #fce4ec;
          color: #ad1457;
        }

        .order-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid #f0f0f0;
        }

        .order-total {
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }

        .status-select {
          padding: 6px 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 12px;
          background: white;
        }

        /* Status badges */
        .bg-gray-100 { background-color: #f8f9fa; }
        .text-gray-800 { color: #495057; }
        .bg-blue-100 { background-color: #e3f2fd; }
        .text-blue-800 { color: #1565c0; }
        .bg-yellow-100 { background-color: #fff8e1; }
        .text-yellow-800 { color: #f57f17; }
        .bg-orange-100 { background-color: #fff3e0; }
        .text-orange-800 { color: #ef6c00; }
        .bg-purple-100 { background-color: #f3e5f5; }
        .text-purple-800 { color: #6a1b9a; }
        .bg-green-100 { background-color: #e8f5e8; }
        .text-green-800 { color: #2e7d32; }
        .bg-red-100 { background-color: #ffebee; }
        .text-red-800 { color: #c62828; }

        /* Cards Grid */
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .job-card, .delivery-card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          border: 1px solid #e0e0e0;
        }

        .job-header, .delivery-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .job-details, .delivery-details {
          margin-top: 12px;
        }

        .section-header {
          margin-bottom: 24px;
        }

        .section-header h2 {
          font-size: 24px;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
        }

        .section-header p {
          color: #666;
          margin: 0;
        }

        /* Empty State */
        .empty-state {
          grid-column: 1 / -1;
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
          max-width: 600px;
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

        .form-group {
          margin-bottom: 20px;
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
          max-height: 400px;
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

        .items-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .item-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: #f8f9fa;
          border-radius: 4px;
          font-size: 14px;
        }

        .loading {
          text-align: center;
          padding: 60px 20px;
          font-size: 18px;
          color: #666;
        }

        /* Icon colors */
        .text-gray-500 { color: #6c757d; }
        .text-blue-500 { color: #007bff; }
        .text-orange-500 { color: #fd7e14; }
        .text-purple-500 { color: #6610f2; }
        .text-green-500 { color: #28a745; }
        .text-green-600 { color: #218838; }
        .text-red-500 { color: #dc3545; }
        .text-yellow-500 { color: #ffc107; }
        
        @media (max-width: 768px) {
          .controls {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .search-section {
            max-width: none;
          }

          .orders-grid,
          .cards-grid {
            grid-template-columns: 1fr;
          }

          .tabs {
            overflow-x: auto;
            white-space: nowrap;
          }

          .detail-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Orders;
