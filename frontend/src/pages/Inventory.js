import React, { useState, useEffect } from 'react';
import axios from '../api/config';
import { 
  Package, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  X, 
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock,
  Truck,
  ArrowUpDown,
  Filter,
  Calendar,
  User,
  Building,
  MapPin
} from 'lucide-react';

const Inventory = () => {
  const [activeTab, setActiveTab] = useState('stock');
  const [stockItems, setStockItems] = useState([]);
  const [grns, setGrns] = useState([]);
  const [gatePasses, setGatePasses] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      
      // Mock data for stock items
      const mockStockItems = [
        {
          _id: 'stock-001',
          itemCode: 'ITM-001',
          itemName: 'Steel Rod 12mm',
          category: 'Raw Materials',
          currentStock: 250,
          reorderLevel: 100,
          maxLevel: 500,
          unit: 'PCS',
          location: 'Warehouse A',
          supplier: 'Steel Corp Ltd',
          lastUpdated: new Date('2025-08-01'),
          status: 'in_stock'
        },
        {
          _id: 'stock-002',
          itemCode: 'ITM-002',
          itemName: 'Cement Bags',
          category: 'Construction',
          currentStock: 45,
          reorderLevel: 50,
          maxLevel: 200,
          unit: 'BAGS',
          location: 'Warehouse B',
          supplier: 'Cement Industries',
          lastUpdated: new Date('2025-08-02'),
          status: 'low_stock'
        },
        {
          _id: 'stock-003',
          itemCode: 'ITM-003',
          itemName: 'Welding Electrodes',
          category: 'Consumables',
          currentStock: 0,
          reorderLevel: 20,
          maxLevel: 100,
          unit: 'KG',
          location: 'Store Room',
          supplier: 'Welding Supplies',
          lastUpdated: new Date('2025-08-03'),
          status: 'out_of_stock'
        }
      ];

      // Mock data for GRNs
      const mockGrns = [
        {
          _id: 'grn-001',
          grnNumber: 'GRN-001',
          supplier: 'Steel Corp Ltd',
          purchaseOrder: 'PO-001',
          receivedDate: new Date('2025-08-01'),
          receivedBy: 'John Doe',
          status: 'completed',
          items: [
            { itemName: 'Steel Rod 12mm', orderedQty: 100, receivedQty: 100, unit: 'PCS' }
          ],
          qualityCheck: 'passed',
          remarks: 'Good quality materials received'
        },
        {
          _id: 'grn-002',
          grnNumber: 'GRN-002',
          supplier: 'Cement Industries',
          purchaseOrder: 'PO-002',
          receivedDate: new Date('2025-08-02'),
          receivedBy: 'Jane Smith',
          status: 'pending',
          items: [
            { itemName: 'Cement Bags', orderedQty: 50, receivedQty: 45, unit: 'BAGS' }
          ],
          qualityCheck: 'pending',
          remarks: 'Short delivery - 5 bags missing'
        }
      ];

      // Mock data for Gate Passes
      const mockGatePasses = [
        {
          _id: 'gp-001',
          gatePassNumber: 'GP-001',
          type: 'outward',
          vehicleNumber: 'MH12AB1234',
          driverName: 'Raj Kumar',
          purpose: 'Delivery to Site A',
          approvedBy: 'Manager A',
          status: 'approved',
          issueDate: new Date('2025-08-01'),
          items: [
            { itemName: 'Steel Rod 12mm', quantity: 50, unit: 'PCS' }
          ]
        },
        {
          _id: 'gp-002',
          gatePassNumber: 'GP-002',
          type: 'inward',
          vehicleNumber: 'GJ01CD5678',
          driverName: 'Suresh Patel',
          purpose: 'Material Supply',
          approvedBy: 'Manager B',
          status: 'pending',
          issueDate: new Date('2025-08-02'),
          items: [
            { itemName: 'Cement Bags', quantity: 30, unit: 'BAGS' }
          ]
        }
      ];

      // Mock data for Stock Movements
      const mockMovements = [
        {
          _id: 'mov-001',
          transactionType: 'inward',
          itemName: 'Steel Rod 12mm',
          quantity: 100,
          unit: 'PCS',
          fromLocation: 'Supplier',
          toLocation: 'Warehouse A',
          date: new Date('2025-08-01'),
          reference: 'GRN-001',
          performedBy: 'John Doe',
          remarks: 'Goods received from supplier'
        },
        {
          _id: 'mov-002',
          transactionType: 'outward',
          itemName: 'Steel Rod 12mm',
          quantity: 50,
          unit: 'PCS',
          fromLocation: 'Warehouse A',
          toLocation: 'Site A',
          date: new Date('2025-08-01'),
          reference: 'GP-001',
          performedBy: 'Jane Smith',
          remarks: 'Material sent to construction site'
        },
        {
          _id: 'mov-003',
          transactionType: 'transfer',
          itemName: 'Cement Bags',
          quantity: 20,
          unit: 'BAGS',
          fromLocation: 'Warehouse B',
          toLocation: 'Warehouse A',
          date: new Date('2025-08-02'),
          reference: 'TRF-001',
          performedBy: 'Admin',
          remarks: 'Internal transfer between warehouses'
        }
      ];

      setStockItems(mockStockItems);
      setGrns(mockGrns);
      setGatePasses(mockGatePasses);
      setMovements(mockMovements);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = (type) => {
    setModalType(type);
    setSelectedItem(null);
    setFormData({});
    setShowModal(true);
  };

  const handleView = (item, type) => {
    setModalType(`view_${type}`);
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleEdit = (item, type) => {
    setModalType(`edit_${type}`);
    setSelectedItem(item);
    setFormData(item);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (modalType === 'create_stock') {
        const newStock = {
          _id: `stock-${Date.now()}`,
          itemCode: formData.itemCode || `ITM-${Date.now()}`,
          itemName: formData.itemName,
          category: formData.category,
          currentStock: parseInt(formData.currentStock) || 0,
          reorderLevel: parseInt(formData.reorderLevel) || 0,
          maxLevel: parseInt(formData.maxLevel) || 0,
          unit: formData.unit,
          location: formData.location,
          supplier: formData.supplier,
          lastUpdated: new Date(),
          status: parseInt(formData.currentStock) > parseInt(formData.reorderLevel) ? 'in_stock' : 'low_stock'
        };
        setStockItems(prev => [newStock, ...prev]);
      } else if (modalType === 'create_grn') {
        const newGrn = {
          _id: `grn-${Date.now()}`,
          grnNumber: `GRN-${Date.now()}`,
          supplier: formData.supplier,
          purchaseOrder: formData.purchaseOrder,
          receivedDate: new Date(),
          receivedBy: formData.receivedBy,
          status: 'completed',
          items: [
            { 
              itemName: formData.itemName, 
              orderedQty: parseInt(formData.orderedQty), 
              receivedQty: parseInt(formData.receivedQty), 
              unit: formData.unit 
            }
          ],
          qualityCheck: formData.qualityCheck,
          remarks: formData.remarks
        };
        setGrns(prev => [newGrn, ...prev]);
      } else if (modalType === 'create_gatepass') {
        const newGatePass = {
          _id: `gp-${Date.now()}`,
          gatePassNumber: `GP-${Date.now()}`,
          type: formData.type,
          vehicleNumber: formData.vehicleNumber,
          driverName: formData.driverName,
          purpose: formData.purpose,
          approvedBy: formData.approvedBy,
          status: 'approved',
          issueDate: new Date(),
          items: [
            { itemName: formData.itemName, quantity: parseInt(formData.quantity), unit: formData.unit }
          ]
        };
        setGatePasses(prev => [newGatePass, ...prev]);
      } else if (modalType === 'create_movement') {
        const newMovement = {
          _id: `mov-${Date.now()}`,
          transactionType: formData.transactionType,
          itemName: formData.itemName,
          quantity: parseInt(formData.quantity),
          unit: formData.unit,
          fromLocation: formData.fromLocation,
          toLocation: formData.toLocation,
          date: new Date(),
          reference: formData.reference,
          performedBy: formData.performedBy,
          remarks: formData.remarks
        };
        setMovements(prev => [newMovement, ...prev]);
      }

      setShowModal(false);
      setFormData({});
      alert('Item created successfully!');
    } catch (error) {
      console.error('Error creating item:', error);
      alert('Error creating item');
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
      in_stock: 'bg-green-100 text-green-800',
      low_stock: 'bg-yellow-100 text-yellow-800',
      out_of_stock: 'bg-red-100 text-red-800',
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
      inward: 'bg-green-100 text-green-800',
      outward: 'bg-blue-100 text-blue-800',
      transfer: 'bg-purple-100 text-purple-800'
    };

    return (
      <span className={`status-badge ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const filterData = (data, type) => {
    return data.filter(item => {
      const matchesSearch = searchTerm === '' || 
        (type === 'stock' && (item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) || item.itemCode?.toLowerCase().includes(searchTerm.toLowerCase()))) ||
        (type === 'grn' && (item.grnNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || item.supplier?.toLowerCase().includes(searchTerm.toLowerCase()))) ||
        (type === 'gatepass' && (item.gatePassNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || item.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()))) ||
        (type === 'movement' && (item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) || item.reference?.toLowerCase().includes(searchTerm.toLowerCase())));

      const matchesFilter = filterStatus === 'all' || 
        (type === 'stock' && item.status === filterStatus) ||
        (type === 'grn' && item.status === filterStatus) ||
        (type === 'gatepass' && item.status === filterStatus) ||
        (type === 'movement' && item.transactionType === filterStatus);

      return matchesSearch && matchesFilter;
    });
  };

  const handleExport = () => {
    try {
      let dataToExport = [];
      let filename = '';
      let headers = [];

      // Determine what data to export based on active tab
      switch (activeTab) {
        case 'stock':
          dataToExport = filterData(stockItems, 'stock');
          filename = 'stock_items';
          headers = ['Item Code', 'Item Name', 'Category', 'Current Stock', 'Reorder Level', 'Max Level', 'Unit', 'Location', 'Supplier', 'Status', 'Last Updated'];
          break;
        case 'grn':
          dataToExport = filterData(grns, 'grn');
          filename = 'goods_receipt_notes';
          headers = ['GRN Number', 'Supplier', 'Purchase Order', 'Received Date', 'Received By', 'Status', 'Quality Check', 'Remarks'];
          break;
        case 'gatepass':
          dataToExport = filterData(gatePasses, 'gatepass');
          filename = 'gate_passes';
          headers = ['Gate Pass Number', 'Type', 'Vehicle Number', 'Driver Name', 'Purpose', 'Status', 'Issue Date', 'Approved By'];
          break;
        case 'movements':
          dataToExport = filterData(movements, 'movement');
          filename = 'stock_movements';
          headers = ['Date', 'Transaction Type', 'Item Name', 'Quantity', 'Unit', 'From Location', 'To Location', 'Reference', 'Performed By', 'Remarks'];
          break;
        default:
          throw new Error('Invalid tab selected');
      }

      if (dataToExport.length === 0) {
        alert('No data to export. Please check your filters.');
        return;
      }

      // Convert data to CSV format
      const csvContent = exportToCSV(dataToExport, headers, activeTab);
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert(`Successfully exported ${dataToExport.length} ${activeTab} records to CSV!`);
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting data. Please try again.');
    }
  };

  const exportToCSV = (data, headers, type) => {
    // Create CSV header
    let csv = headers.join(',') + '\n';

    // Add data rows
    data.forEach(item => {
      let row = [];
      
      switch (type) {
        case 'stock':
          row = [
            `"${item.itemCode || ''}"`,
            `"${item.itemName || ''}"`,
            `"${item.category || ''}"`,
            item.currentStock || 0,
            item.reorderLevel || 0,
            item.maxLevel || 0,
            `"${item.unit || ''}"`,
            `"${item.location || ''}"`,
            `"${item.supplier || ''}"`,
            `"${item.status || ''}"`,
            `"${item.lastUpdated ? item.lastUpdated.toLocaleDateString() : ''}"`
          ];
          break;
        case 'grn':
          row = [
            `"${item.grnNumber || ''}"`,
            `"${item.supplier || ''}"`,
            `"${item.purchaseOrder || ''}"`,
            `"${item.receivedDate ? item.receivedDate.toLocaleDateString() : ''}"`,
            `"${item.receivedBy || ''}"`,
            `"${item.status || ''}"`,
            `"${item.qualityCheck || ''}"`,
            `"${item.remarks || ''}"`
          ];
          break;
        case 'gatepass':
          row = [
            `"${item.gatePassNumber || ''}"`,
            `"${item.type || ''}"`,
            `"${item.vehicleNumber || ''}"`,
            `"${item.driverName || ''}"`,
            `"${item.purpose || ''}"`,
            `"${item.status || ''}"`,
            `"${item.issueDate ? item.issueDate.toLocaleDateString() : ''}"`,
            `"${item.approvedBy || ''}"`
          ];
          break;
        case 'movements':
          row = [
            `"${item.date ? item.date.toLocaleDateString() : ''}"`,
            `"${item.transactionType || ''}"`,
            `"${item.itemName || ''}"`,
            item.quantity || 0,
            `"${item.unit || ''}"`,
            `"${item.fromLocation || ''}"`,
            `"${item.toLocation || ''}"`,
            `"${item.reference || ''}"`,
            `"${item.performedBy || ''}"`,
            `"${item.remarks || ''}"`
          ];
          break;
      }
      
      csv += row.join(',') + '\n';
    });

    return csv;
  };

  if (loading) {
    return <div className="loading">Loading inventory data...</div>;
  }
  return (
    <div className="inventory">
      <div className="page-header">
        <div className="page-title">
          <Package size={24} />
          <h1>Inventory Management</h1>
        </div>
        <p>Track stock levels, movements, and warehouse operations</p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'stock' ? 'active' : ''}`}
          onClick={() => setActiveTab('stock')}
        >
          <Package size={16} />
          Stock Management
        </button>
        <button 
          className={`tab ${activeTab === 'grn' ? 'active' : ''}`}
          onClick={() => setActiveTab('grn')}
        >
          <Upload size={16} />
          GRN
        </button>
        <button 
          className={`tab ${activeTab === 'gatepass' ? 'active' : ''}`}
          onClick={() => setActiveTab('gatepass')}
        >
          <Truck size={16} />
          Gate Pass
        </button>
        <button 
          className={`tab ${activeTab === 'movements' ? 'active' : ''}`}
          onClick={() => setActiveTab('movements')}
        >
          <ArrowUpDown size={16} />
          Stock Movements
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
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            {activeTab === 'stock' && (
              <>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </>
            )}
            {activeTab === 'grn' && (
              <>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </>
            )}
            {activeTab === 'gatepass' && (
              <>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </>
            )}
            {activeTab === 'movements' && (
              <>
                <option value="inward">Inward</option>
                <option value="outward">Outward</option>
                <option value="transfer">Transfer</option>
              </>
            )}
          </select>
        </div>

        <div className="action-buttons">
          <button 
            className="btn btn-primary"
            onClick={() => handleCreateNew(`create_${activeTab}`)}
          >
            <Plus size={16} />
            Add New
          </button>
          <button 
            className="btn btn-secondary"
            onClick={handleExport}
            title={`Export ${activeTab} data to CSV`}
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'stock' && (
        <div className="stock-grid">
          {filterData(stockItems, 'stock').map(item => (
            <div key={item._id} className="stock-card">
              <div className="stock-header">
                <div>
                  <h4>{item.itemName}</h4>
                  <span className="item-code">{item.itemCode}</span>
                </div>
                {getStatusBadge(item.status)}
              </div>
              
              <div className="stock-details">
                <div className="stock-metric">
                  <label>Current Stock</label>
                  <span className="stock-value">{item.currentStock} {item.unit}</span>
                </div>
                <div className="stock-metric">
                  <label>Reorder Level</label>
                  <span>{item.reorderLevel} {item.unit}</span>
                </div>
                <div className="stock-metric">
                  <label>Location</label>
                  <span>{item.location}</span>
                </div>
              </div>

              <div className="stock-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${Math.min((item.currentStock / item.maxLevel) * 100, 100)}%`,
                      backgroundColor: item.currentStock <= item.reorderLevel ? '#ef4444' : '#10b981'
                    }}
                  />
                </div>
                <small>{item.currentStock}/{item.maxLevel} {item.unit}</small>
              </div>

              <div className="stock-actions">
                <button onClick={() => handleView(item, 'stock')} className="btn-icon">
                  <Eye size={16} />
                </button>
                <button onClick={() => handleEdit(item, 'stock')} className="btn-icon">
                  <Edit size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'grn' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>GRN Number</th>
                <th>Supplier</th>
                <th>PO Number</th>
                <th>Received Date</th>
                <th>Status</th>
                <th>Quality Check</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filterData(grns, 'grn').map(grn => (
                <tr key={grn._id}>
                  <td className="font-medium">{grn.grnNumber}</td>
                  <td>{grn.supplier}</td>
                  <td>{grn.purchaseOrder}</td>
                  <td>{grn.receivedDate.toLocaleDateString()}</td>
                  <td>{getStatusBadge(grn.status)}</td>
                  <td>{getStatusBadge(grn.qualityCheck)}</td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => handleView(grn, 'grn')} className="btn-icon">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => handleEdit(grn, 'grn')} className="btn-icon">
                        <Edit size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'gatepass' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Gate Pass No.</th>
                <th>Type</th>
                <th>Vehicle Number</th>
                <th>Driver Name</th>
                <th>Purpose</th>
                <th>Status</th>
                <th>Issue Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filterData(gatePasses, 'gatepass').map(gp => (
                <tr key={gp._id}>
                  <td className="font-medium">{gp.gatePassNumber}</td>
                  <td>{getStatusBadge(gp.type)}</td>
                  <td>{gp.vehicleNumber}</td>
                  <td>{gp.driverName}</td>
                  <td>{gp.purpose}</td>
                  <td>{getStatusBadge(gp.status)}</td>
                  <td>{gp.issueDate.toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => handleView(gp, 'gatepass')} className="btn-icon">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => handleEdit(gp, 'gatepass')} className="btn-icon">
                        <Edit size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'movements' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>From</th>
                <th>To</th>
                <th>Reference</th>
                <th>Performed By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filterData(movements, 'movement').map(movement => (
                <tr key={movement._id}>
                  <td>{movement.date.toLocaleDateString()}</td>
                  <td>{getStatusBadge(movement.transactionType)}</td>
                  <td className="font-medium">{movement.itemName}</td>
                  <td>{movement.quantity} {movement.unit}</td>
                  <td>{movement.fromLocation}</td>
                  <td>{movement.toLocation}</td>
                  <td>{movement.reference}</td>
                  <td>{movement.performedBy}</td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => handleView(movement, 'movement')} className="btn-icon">
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for creating/editing/viewing items */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {modalType.includes('create') && `Create New ${modalType.split('_')[1].toUpperCase()}`}
                {modalType.includes('edit') && `Edit ${modalType.split('_')[1].toUpperCase()}`}
                {modalType.includes('view') && `View ${modalType.split('_')[1].toUpperCase()} Details`}
              </h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            {modalType.includes('view') ? (
              <div className="modal-body">
                {/* View details for different items */}
                {selectedItem && (
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Item Name</label>
                      <span>{selectedItem.itemName || selectedItem.grnNumber || selectedItem.gatePassNumber || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Status</label>
                      {getStatusBadge(selectedItem.status || selectedItem.transactionType)}
                    </div>
                    <div className="detail-item">
                      <label>Date</label>
                      <span>{(selectedItem.lastUpdated || selectedItem.receivedDate || selectedItem.issueDate || selectedItem.date)?.toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="modal-body">
                {/* Create/Edit forms */}
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    name="itemName"
                    value={formData.itemName || ''}
                    onChange={handleInputChange}
                    placeholder="Enter name"
                    required
                  />
                </div>

                <div className="form-actions">
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn btn-primary">
                    {submitting ? 'Saving...' : modalType.includes('create') ? 'Create' : 'Update'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .inventory {
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

        .tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 20px;
          border-bottom: 2px solid #f0f0f0;
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
        }

        .tab:hover {
          color: #007bff;
          background-color: #f8f9fa;
        }

        .tab.active {
          color: #007bff;
          border-bottom-color: #007bff;
        }

        .controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          gap: 20px;
        }

        .search-section {
          display: flex;
          gap: 12px;
          flex: 1;
          max-width: 600px;
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
          padding: 10px 12px 10px 40px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
        }

        .filter-select {
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          background: white;
          min-width: 150px;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid transparent;
          transition: all 0.2s;
        }

        .btn-primary {
          background-color: #007bff;
          color: white;
          border-color: #007bff;
        }

        .btn-primary:hover {
          background-color: #0056b3;
        }

        .btn-secondary {
          background-color: #6c757d;
          color: white;
          border-color: #6c757d;
        }

        .btn-secondary:hover {
          background-color: #5a6268;
        }

        .btn-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-icon:hover {
          background-color: #f8f9fa;
          border-color: #007bff;
          color: #007bff;
        }

        .stock-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .stock-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          position: relative;
        }

        .stock-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
        }

        .stock-header h4 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }

        .item-code {
          font-size: 12px;
          color: #666;
          font-weight: 500;
        }

        .stock-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 15px;
        }

        .stock-metric {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stock-metric label {
          font-size: 12px;
          color: #666;
          font-weight: 500;
        }

        .stock-metric span {
          font-size: 14px;
          color: #333;
          font-weight: 500;
        }

        .stock-value {
          font-size: 18px !important;
          font-weight: 600 !important;
          color: #007bff !important;
        }

        .stock-progress {
          margin-bottom: 15px;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background-color: #f0f0f0;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 4px;
        }

        .progress-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .stock-progress small {
          font-size: 12px;
          color: #666;
        }

        .stock-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }

        .table-container {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

        .status-badge {
          display: inline-block;
          padding: 4px 8px;
          font-size: 12px;
          font-weight: 500;
          border-radius: 12px;
          text-transform: uppercase;
        }

        .bg-green-100 {
          background-color: #dcfce7;
        }
        .text-green-800 {
          color: #166534;
        }
        .bg-yellow-100 {
          background-color: #fef3c7;
        }
        .text-yellow-800 {
          color: #92400e;
        }
        .bg-red-100 {
          background-color: #fee2e2;
        }
        .text-red-800 {
          color: #991b1b;
        }
        .bg-blue-100 {
          background-color: #dbeafe;
        }
        .text-blue-800 {
          color: #1e40af;
        }
        .bg-purple-100 {
          background-color: #ede9fe;
        }
        .text-purple-800 {
          color: #5b21b6;
        }
        .bg-gray-100 {
          background-color: #f3f4f6;
        }
        .text-gray-800 {
          color: #1f2937;
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
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
        }

        .close-btn:hover {
          background-color: #f0f0f0;
          color: #333;
        }

        .modal-body {
          padding: 20px;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .detail-item.full-width {
          grid-column: 1 / -1;
        }

        .detail-item label {
          font-size: 12px;
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
        }

        .detail-item span {
          font-size: 14px;
          color: #333;
          font-weight: 500;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 4px;
          font-weight: 500;
          color: #333;
          font-size: 14px;
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

        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 200px;
          font-size: 16px;
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

          .stock-grid {
            grid-template-columns: 1fr;
          }

          .tabs {
            overflow-x: auto;
            white-space: nowrap;
          }

          .detail-grid {
            grid-template-columns: 1fr;
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Inventory;
