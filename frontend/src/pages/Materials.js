import React, { useState, useEffect } from 'react';
import axios from '../api/config';
import { 
  Wrench, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  X,
  FileText,
  ClipboardList,
  TrendingUp,
  Calculator,
  CheckCircle,
  Clock,
  AlertTriangle,
  Package,
  Settings,
  BarChart3,
  Download
} from 'lucide-react';

const Materials = () => {
  const [activeTab, setActiveTab] = useState('bom');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Data states
  const [boms, setBoms] = useState([]);
  const [specifications, setSpecifications] = useState([]);
  const [consumptions, setConsumptions] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Mock available items for BOMs
      const mockItems = [
        { _id: 'item1', name: 'Motor Assembly', itemCode: 'MOT-ASY-001', unit: 'pieces' },
        { _id: 'item2', name: 'Steel Rod 12mm', itemCode: 'STEEL-ROD-12', unit: 'pieces' },
        { _id: 'item3', name: 'Cement Bag 50kg', itemCode: 'CEMENT-BAG-50', unit: 'bags' },
        { _id: 'item4', name: 'Welding Electrodes', itemCode: 'WELD-ELEC-01', unit: 'kg' }
      ];
      setAvailableItems(mockItems);

      if (activeTab === 'bom') {
        const mockBoms = [
          {
            _id: 'bom1',
            itemCode: 'BOM-MOT-ASY-001',
            bomNumber: 'BOM-001',
            parentItem: { name: 'Motor Assembly', itemCode: 'MOT-ASY-001' },
            version: 'V1.0',
            description: 'Bill of Materials for Motor Assembly',
            materials: [
              {
                material: { name: 'Steel Rod 12mm', itemCode: 'STEEL-ROD-12', unit: 'pieces' },
                quantity: 2.5,
                unit: 'KG',
                wastagePercentage: 5,
                actualQuantity: 2.625,
                costPerUnit: 180,
                totalCost: 472.5
              },
              {
                material: { name: 'Welding Electrodes', itemCode: 'WELD-ELEC-01', unit: 'kg' },
                quantity: 2,
                unit: 'PCS',
                wastagePercentage: 2,
                actualQuantity: 2.04,
                costPerUnit: 95,
                totalCost: 193.8
              }
            ],
            totalMaterialCost: 666.3,
            laborCost: 200,
            overheadCost: 100,
            totalCost: 966.3,
            profitMargin: 15,
            sellingPrice: 1111.25,
            isActive: true,
            approvedBy: null,
            createdAt: new Date('2025-07-01'),
            status: 'draft'
          },
          {
            _id: 'bom2',
            itemCode: 'BOM-PUMP-001',
            bomNumber: 'BOM-002',
            parentItem: { name: 'Water Pump', itemCode: 'PUMP-001' },
            version: 'V2.0',
            description: 'Updated BOM for Water Pump with new materials',
            materials: [
              {
                material: { name: 'Steel Rod 12mm', itemCode: 'STEEL-ROD-12', unit: 'pieces' },
                quantity: 1.5,
                unit: 'KG',
                wastagePercentage: 3,
                actualQuantity: 1.545,
                costPerUnit: 180,
                totalCost: 278.1
              }
            ],
            totalMaterialCost: 278.1,
            laborCost: 150,
            overheadCost: 75,
            totalCost: 503.1,
            profitMargin: 20,
            sellingPrice: 603.72,
            isActive: true,
            approvedBy: { firstName: 'John', lastName: 'Manager' },
            createdAt: new Date('2025-07-15'),
            status: 'approved'
          }
        ];
        setBoms(mockBoms);
      } else if (activeTab === 'specifications') {
        const mockSpecifications = [
          {
            _id: 'spec1',
            material: { name: 'Steel Rod 12mm', itemCode: 'STEEL-ROD-12' },
            specificationName: 'High Grade Steel Rod Specification',
            version: 'V1.2',
            specifications: [
              { parameter: 'Diameter', value: '12mm', unit: 'mm', tolerance: { min: 11.8, max: 12.2 } },
              { parameter: 'Tensile Strength', value: '500MPa', unit: 'MPa', tolerance: { min: 480, max: 520 } },
              { parameter: 'Carbon Content', value: '0.25%', unit: '%', tolerance: { min: 0.2, max: 0.3 } }
            ],
            qualityGrade: 'Premium',
            isActive: true,
            createdAt: new Date('2025-06-15')
          },
          {
            _id: 'spec2',
            material: { name: 'Welding Electrodes', itemCode: 'WELD-ELEC-01' },
            specificationName: 'E6013 Welding Electrode Specification',
            version: 'V1.0',
            specifications: [
              { parameter: 'Diameter', value: '3.2mm', unit: 'mm', tolerance: { min: 3.1, max: 3.3 } },
              { parameter: 'Coating Type', value: 'Rutile', unit: '', tolerance: {} },
              { parameter: 'Current Range', value: '90-130A', unit: 'A', tolerance: {} }
            ],
            qualityGrade: 'Standard',
            isActive: true,
            createdAt: new Date('2025-06-20')
          }
        ];
        setSpecifications(mockSpecifications);
      } else if (activeTab === 'consumption') {
        const mockConsumptions = [
          {
            _id: 'cons1',
            jobCard: { jobCardNumber: 'JC-001' },
            order: { orderNumber: 'SO-001' },
            consumptionDate: new Date('2025-07-30'),
            materials: [
              {
                material: { name: 'Steel Rod 12mm', itemCode: 'STEEL-ROD-12', unit: 'kg' },
                plannedQuantity: 2.625,
                actualQuantity: 2.8,
                wastedQuantity: 0.175,
                returnedQuantity: 0,
                unitCost: 180,
                totalCost: 504,
                batchNumber: 'BATCH-001',
                reason: 'Production variance',
                remarks: 'Slightly higher consumption than planned'
              },
              {
                material: { name: 'Welding Electrodes', itemCode: 'WELD-ELEC-01', unit: 'kg' },
                plannedQuantity: 2.04,
                actualQuantity: 2.1,
                wastedQuantity: 0.06,
                returnedQuantity: 0,
                unitCost: 95,
                totalCost: 199.5,
                batchNumber: 'BATCH-002',
                reason: 'Normal consumption',
                remarks: 'Within acceptable range'
              }
            ],
            totalPlannedCost: 666.3,
            totalActualCost: 703.5,
            variance: 37.2,
            variancePercentage: 5.58,
            status: 'approved',
            approvedBy: { firstName: 'Jane', lastName: 'Supervisor' },
            createdAt: new Date('2025-07-30')
          },
          {
            _id: 'cons2',
            jobCard: { jobCardNumber: 'JC-002' },
            order: { orderNumber: 'SO-002' },
            consumptionDate: new Date('2025-08-01'),
            materials: [
              {
                material: { name: 'Steel Rod 12mm', itemCode: 'STEEL-ROD-12', unit: 'kg' },
                plannedQuantity: 1.545,
                actualQuantity: 1.6,
                wastedQuantity: 0.055,
                returnedQuantity: 0,
                unitCost: 180,
                totalCost: 288,
                batchNumber: 'BATCH-003',
                reason: 'Minor adjustment needed',
                remarks: 'Small variance due to material adjustment'
              }
            ],
            totalPlannedCost: 278.1,
            totalActualCost: 288,
            variance: 9.9,
            variancePercentage: 3.56,
            status: 'submitted',
            approvedBy: null,
            createdAt: new Date('2025-08-01')
          }
        ];
        setConsumptions(mockConsumptions);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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
    if (window.confirm(`Are you sure you want to delete this ${activeTab === 'bom' ? 'BOM' : activeTab}?`)) {
      try {
        if (activeTab === 'bom') {
          setBoms(prev => prev.filter(b => b._id !== item._id));
        } else if (activeTab === 'specifications') {
          setSpecifications(prev => prev.filter(s => s._id !== item._id));
        }
        alert(`${activeTab === 'bom' ? 'BOM' : 'Specification'} deleted successfully!`);
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Error deleting item');
      }
    }
  };

  const handleApprove = async (item) => {
    if (window.confirm('Are you sure you want to approve this BOM?')) {
      try {
        const updatedBoms = boms.map(bom => 
          bom._id === item._id 
            ? { ...bom, status: 'approved', approvedBy: { firstName: 'Current', lastName: 'User' } }
            : bom
        );
        setBoms(updatedBoms);
        alert('BOM approved successfully!');
      } catch (error) {
        console.error('Error approving BOM:', error);
        alert('Error approving BOM');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (modalType === 'create') {
        const newItem = {
          _id: `${activeTab}${Date.now()}`,
          ...formData,
          createdAt: new Date(),
          isActive: true
        };

        if (activeTab === 'bom') {
          newItem.itemCode = formData.itemCode || `BOM-${Date.now()}`;
          newItem.status = 'draft';
          newItem.version = formData.version || 'V1.0';
          setBoms(prev => [newItem, ...prev]);
        } else if (activeTab === 'specifications') {
          newItem.version = formData.version || 'V1.0';
          setSpecifications(prev => [newItem, ...prev]);
        }

        alert(`${activeTab === 'bom' ? 'BOM' : 'Specification'} created successfully!`);
      } else if (modalType === 'edit') {
        const updatedItem = { ...selectedItem, ...formData };

        if (activeTab === 'bom') {
          setBoms(prev => prev.map(b => b._id === selectedItem._id ? updatedItem : b));
        } else if (activeTab === 'specifications') {
          setSpecifications(prev => prev.map(s => s._id === selectedItem._id ? updatedItem : s));
        }

        alert(`${activeTab === 'bom' ? 'BOM' : 'Specification'} updated successfully!`);
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
      case 'bom':
        return {
          itemCode: '',
          parentItem: '',
          version: 'V1.0',
          description: '',
          materials: [],
          laborCost: 0,
          overheadCost: 0,
          profitMargin: 15
        };
      case 'specifications':
        return {
          material: '',
          specificationName: '',
          version: 'V1.0',
          specifications: [],
          qualityGrade: 'Standard'
        };
      default:
        return {};
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'bom': return boms;
      case 'specifications': return specifications;
      case 'consumption': return consumptions;
      default: return [];
    }
  };

  const filteredData = getCurrentData().filter(item => {
    if (!searchTerm) return true;
    
    const searchFields = {
      bom: ['itemCode', 'description', 'parentItem.name'],
      specifications: ['specificationName', 'material.name'],
      consumption: ['jobCard.jobCardNumber', 'order.orderNumber']
    };

    return searchFields[activeTab]?.some(field => {
      const value = field.includes('.') 
        ? field.split('.').reduce((obj, key) => obj?.[key], item)
        : item[field];
      return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  const getStatusBadge = (status, approvedBy) => {
    let statusText = status;
    let colorClass = 'bg-gray-100 text-gray-800';

    if (activeTab === 'bom') {
      if (approvedBy) {
        statusText = 'approved';
        colorClass = 'bg-green-100 text-green-800';
      } else {
        statusText = 'draft';
        colorClass = 'bg-yellow-100 text-yellow-800';
      }
    } else if (activeTab === 'consumption') {
      const colors = {
        draft: 'bg-gray-100 text-gray-800',
        submitted: 'bg-blue-100 text-blue-800',
        approved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800'
      };
      colorClass = colors[status] || colors.draft;
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {statusText?.toUpperCase()}
      </span>
    );
  };

  const exportToCSV = () => {
    const data = filteredData;
    if (data.length === 0) return;

    let headers = [];
    let rows = [];

    switch (activeTab) {
      case 'bom':
        headers = ['Item Code', 'Parent Item', 'Version', 'Total Cost', 'Status', 'Created Date'];
        rows = data.map(item => [
          item.itemCode, item.parentItem?.name, item.version, 
          item.totalCost, item.status, item.createdAt?.toLocaleDateString()
        ]);
        break;
      case 'specifications':
        headers = ['Specification Name', 'Material', 'Version', 'Quality Grade', 'Created Date'];
        rows = data.map(item => [
          item.specificationName, item.material?.name, item.version,
          item.qualityGrade, item.createdAt?.toLocaleDateString()
        ]);
        break;
      case 'consumption':
        headers = ['Job Card', 'Order', 'Planned Cost', 'Actual Cost', 'Variance %', 'Status'];
        rows = data.map(item => [
          item.jobCard?.jobCardNumber, item.order?.orderNumber, 
          item.totalPlannedCost, item.totalActualCost, 
          item.variancePercentage?.toFixed(2) + '%', item.status
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
    return <div className="loading">Loading material data...</div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">
          <Wrench size={24} />
          <h1>Material Management</h1>
        </div>
        <p>Comprehensive material planning, BOMs, specifications, and consumption tracking</p>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'bom' ? 'active' : ''}`}
          onClick={() => setActiveTab('bom')}
        >
          <FileText size={18} />
          Bill of Materials
        </button>
        <button 
          className={`tab ${activeTab === 'specifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('specifications')}
        >
          <Settings size={18} />
          Specifications
        </button>
        <button 
          className={`tab ${activeTab === 'consumption' ? 'active' : ''}`}
          onClick={() => setActiveTab('consumption')}
        >
          <BarChart3 size={18} />
          Consumption Tracking
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
          {(activeTab === 'bom' || activeTab === 'specifications') && (
            <button className="btn btn-primary" onClick={handleCreate}>
              <Plus size={18} />
              Add {activeTab === 'bom' ? 'BOM' : 'Specification'}
            </button>
          )}
        </div>
      </div>

      {/* Data Section */}
      <div className="data-section">
        {filteredData.length === 0 ? (
          <div className="empty-state">
            <Wrench size={48} />
            <h3>No {activeTab} found</h3>
            <p>Start by adding your first {activeTab === 'bom' ? 'BOM' : activeTab}</p>
            {(activeTab === 'bom' || activeTab === 'specifications') && (
              <button className="btn btn-primary" onClick={handleCreate}>
                Add {activeTab === 'bom' ? 'BOM' : 'Specification'}
              </button>
            )}
          </div>
        ) : (
          <>
            {/* BOM Grid View */}
            {activeTab === 'bom' && (
              <div className="bom-grid">
                {filteredData.map(bom => (
                  <div key={bom._id} className="bom-card">
                    <div className="bom-header">
                      <div>
                        <h4>{bom.parentItem?.name}</h4>
                        <span className="item-code">{bom.itemCode}</span>
                      </div>
                      {getStatusBadge(bom.status, bom.approvedBy)}
                    </div>
                    
                    <div className="bom-details">
                      <div className="detail-row">
                        <span className="label">Version:</span>
                        <span>{bom.version}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Materials:</span>
                        <span>{bom.materials?.length || 0} items</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Total Cost:</span>
                        <span className="cost">₹{bom.totalCost?.toLocaleString()}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Selling Price:</span>
                        <span className="price">₹{bom.sellingPrice?.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="bom-actions">
                      <button onClick={() => handleView(bom)} className="btn-icon">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => handleEdit(bom)} className="btn-icon">
                        <Edit size={16} />
                      </button>
                      {!bom.approvedBy && (
                        <button onClick={() => handleApprove(bom)} className="btn-icon btn-success">
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <button onClick={() => handleDelete(bom)} className="btn-icon btn-danger">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Specifications Table */}
            {activeTab === 'specifications' && (
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Specification Name</th>
                      <th>Material</th>
                      <th>Version</th>
                      <th>Quality Grade</th>
                      <th>Parameters</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map(spec => (
                      <tr key={spec._id}>
                        <td className="font-medium">{spec.specificationName}</td>
                        <td>{spec.material?.name}</td>
                        <td>{spec.version}</td>
                        <td>
                          <span className={`quality-badge quality-${spec.qualityGrade?.toLowerCase()}`}>
                            {spec.qualityGrade}
                          </span>
                        </td>
                        <td>{spec.specifications?.length || 0} parameters</td>
                        <td>
                          <div className="action-buttons">
                            <button onClick={() => handleView(spec)} className="btn-icon">
                              <Eye size={16} />
                            </button>
                            <button onClick={() => handleEdit(spec)} className="btn-icon">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleDelete(spec)} className="btn-icon btn-danger">
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

            {/* Consumption Table */}
            {activeTab === 'consumption' && (
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Job Card</th>
                      <th>Order</th>
                      <th>Date</th>
                      <th>Materials</th>
                      <th>Planned Cost</th>
                      <th>Actual Cost</th>
                      <th>Variance</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map(consumption => (
                      <tr key={consumption._id}>
                        <td className="font-medium">{consumption.jobCard?.jobCardNumber}</td>
                        <td>{consumption.order?.orderNumber}</td>
                        <td>{consumption.consumptionDate?.toLocaleDateString()}</td>
                        <td>{consumption.materials?.length || 0} items</td>
                        <td>₹{consumption.totalPlannedCost?.toLocaleString()}</td>
                        <td>₹{consumption.totalActualCost?.toLocaleString()}</td>
                        <td>
                          <span className={`variance ${consumption.variance >= 0 ? 'positive' : 'negative'}`}>
                            {consumption.variancePercentage?.toFixed(2)}%
                          </span>
                        </td>
                        <td>{getStatusBadge(consumption.status)}</td>
                        <td>
                          <div className="action-buttons">
                            <button onClick={() => handleView(consumption)} className="btn-icon">
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
          </>
        )}
      </div>

      {/* Modal for Create/Edit/View */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {modalType === 'create' && `Add New ${activeTab === 'bom' ? 'BOM' : 'Specification'}`}
                {modalType === 'edit' && `Edit ${activeTab === 'bom' ? 'BOM' : 'Specification'}`}
                {modalType === 'view' && `${activeTab === 'bom' ? 'BOM' : activeTab} Details`}
              </h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            {modalType === 'view' ? (
              <div className="modal-body">
                {selectedItem && (
                  <div className="view-details">
                    {activeTab === 'bom' && (
                      <>
                        <div className="detail-section">
                          <h4>BOM Information</h4>
                          <div className="detail-grid">
                            <div><strong>Item Code:</strong> {selectedItem.itemCode}</div>
                            <div><strong>Parent Item:</strong> {selectedItem.parentItem?.name}</div>
                            <div><strong>Version:</strong> {selectedItem.version}</div>
                            <div><strong>Status:</strong> {selectedItem.approvedBy ? 'Approved' : 'Draft'}</div>
                            <div><strong>Total Cost:</strong> ₹{selectedItem.totalCost?.toLocaleString()}</div>
                            <div><strong>Selling Price:</strong> ₹{selectedItem.sellingPrice?.toLocaleString()}</div>
                          </div>
                          {selectedItem.description && (
                            <div>
                              <strong>Description:</strong><br/>
                              {selectedItem.description}
                            </div>
                          )}
                        </div>
                        
                        {selectedItem.materials?.length > 0 && (
                          <div className="detail-section">
                            <h4>Materials ({selectedItem.materials.length})</h4>
                            <div className="materials-list">
                              {selectedItem.materials.map((material, index) => (
                                <div key={index} className="material-row">
                                  <div className="material-info">
                                    <strong>{material.material?.name}</strong>
                                    <span>{material.material?.itemCode}</span>
                                  </div>
                                  <div className="material-qty">
                                    Qty: {material.quantity} {material.unit}
                                    <small>Wastage: {material.wastagePercentage}%</small>
                                  </div>
                                  <div className="material-cost">
                                    ₹{material.totalCost?.toLocaleString()}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {activeTab === 'specifications' && (
                      <>
                        <div className="detail-section">
                          <h4>Specification Information</h4>
                          <div className="detail-grid">
                            <div><strong>Name:</strong> {selectedItem.specificationName}</div>
                            <div><strong>Material:</strong> {selectedItem.material?.name}</div>
                            <div><strong>Version:</strong> {selectedItem.version}</div>
                            <div><strong>Quality Grade:</strong> {selectedItem.qualityGrade}</div>
                          </div>
                        </div>
                        
                        {selectedItem.specifications?.length > 0 && (
                          <div className="detail-section">
                            <h4>Parameters ({selectedItem.specifications.length})</h4>
                            <div className="parameters-list">
                              {selectedItem.specifications.map((param, index) => (
                                <div key={index} className="parameter-row">
                                  <div className="param-name">{param.parameter}</div>
                                  <div className="param-value">{param.value} {param.unit}</div>
                                  {param.tolerance && (
                                    <div className="param-tolerance">
                                      Tolerance: {param.tolerance.min} - {param.tolerance.max}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {activeTab === 'consumption' && (
                      <>
                        <div className="detail-section">
                          <h4>Consumption Information</h4>
                          <div className="detail-grid">
                            <div><strong>Job Card:</strong> {selectedItem.jobCard?.jobCardNumber}</div>
                            <div><strong>Order:</strong> {selectedItem.order?.orderNumber}</div>
                            <div><strong>Date:</strong> {selectedItem.consumptionDate?.toLocaleDateString()}</div>
                            <div><strong>Status:</strong> {selectedItem.status}</div>
                            <div><strong>Planned Cost:</strong> ₹{selectedItem.totalPlannedCost?.toLocaleString()}</div>
                            <div><strong>Actual Cost:</strong> ₹{selectedItem.totalActualCost?.toLocaleString()}</div>
                            <div><strong>Variance:</strong> {selectedItem.variancePercentage?.toFixed(2)}%</div>
                            <div><strong>Approved By:</strong> {selectedItem.approvedBy ? `${selectedItem.approvedBy.firstName} ${selectedItem.approvedBy.lastName}` : 'Pending'}</div>
                          </div>
                        </div>

                        {selectedItem.materials?.length > 0 && (
                          <div className="detail-section">
                            <h4>Material Consumption ({selectedItem.materials.length})</h4>
                            <div className="consumption-list">
                              {selectedItem.materials.map((material, index) => (
                                <div key={index} className="consumption-row">
                                  <div className="material-info">
                                    <strong>{material.material?.name}</strong>
                                    <span>Batch: {material.batchNumber}</span>
                                  </div>
                                  <div className="consumption-qty">
                                    <div>Planned: {material.plannedQuantity} {material.material?.unit}</div>
                                    <div>Actual: {material.actualQuantity} {material.material?.unit}</div>
                                    <div>Wasted: {material.wastedQuantity} {material.material?.unit}</div>
                                  </div>
                                  <div className="consumption-cost">
                                    <div>Cost: ₹{material.totalCost?.toLocaleString()}</div>
                                    <div>Reason: {material.reason}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="modal-body">
                {activeTab === 'bom' && (
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
                        <label>Parent Item *</label>
                        <select
                          name="parentItem"
                          value={formData.parentItem || ''}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select Parent Item</option>
                          {availableItems.map(item => (
                            <option key={item._id} value={item._id}>
                              {item.name} ({item.itemCode})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Version</label>
                        <input
                          type="text"
                          name="version"
                          value={formData.version || 'V1.0'}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Profit Margin (%)</label>
                        <input
                          type="number"
                          name="profitMargin"
                          value={formData.profitMargin || 15}
                          onChange={handleInputChange}
                          min="0"
                          step="0.1"
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
                        <label>Labor Cost</label>
                        <input
                          type="number"
                          name="laborCost"
                          value={formData.laborCost || 0}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="form-group">
                        <label>Overhead Cost</label>
                        <input
                          type="number"
                          name="overheadCost"
                          value={formData.overheadCost || 0}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'specifications' && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Specification Name *</label>
                        <input
                          type="text"
                          name="specificationName"
                          value={formData.specificationName || ''}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Material *</label>
                        <select
                          name="material"
                          value={formData.material || ''}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select Material</option>
                          {availableItems.map(item => (
                            <option key={item._id} value={item._id}>
                              {item.name} ({item.itemCode})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Version</label>
                        <input
                          type="text"
                          name="version"
                          value={formData.version || 'V1.0'}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Quality Grade</label>
                        <select
                          name="qualityGrade"
                          value={formData.qualityGrade || 'Standard'}
                          onChange={handleInputChange}
                        >
                          <option value="Economy">Economy</option>
                          <option value="Standard">Standard</option>
                          <option value="Premium">Premium</option>
                          <option value="A">Grade A</option>
                          <option value="B">Grade B</option>
                          <option value="C">Grade C</option>
                        </select>
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

        /* BOM Grid */
        .bom-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .bom-card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          border: 1px solid #e0e0e0;
          transition: box-shadow 0.2s;
        }

        .bom-card:hover {
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        .bom-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .bom-header h4 {
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

        .bom-details {
          margin-bottom: 16px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .detail-row .label {
          color: #666;
        }

        .detail-row .cost,
        .detail-row .price {
          font-weight: 600;
          color: #007bff;
        }

        .bom-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
          padding-top: 16px;
          border-top: 1px solid #f0f0f0;
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

        .btn-icon.btn-success:hover {
          background: #d4edda;
          color: #28a745;
        }

        .btn-icon.btn-danger:hover {
          background: #fee2e2;
          color: #dc2626;
        }

        /* Quality Badges */
        .quality-badge {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .quality-premium {
          background: #fef3c7;
          color: #92400e;
        }

        .quality-standard {
          background: #dbeafe;
          color: #1e40af;
        }

        .quality-economy {
          background: #f3f4f6;
          color: #1f2937;
        }

        .quality-a {
          background: #dcfce7;
          color: #166534;
        }

        .quality-b {
          background: #fef3c7;
          color: #92400e;
        }

        .quality-c {
          background: #fee2e2;
          color: #991b1b;
        }

        /* Variance */
        .variance {
          font-weight: 600;
        }

        .variance.positive {
          color: #dc2626;
        }

        .variance.negative {
          color: #16a34a;
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
          max-width: 800px;
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
          max-height: 600px;
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
          margin-bottom: 16px;
        }

        .detail-grid > div {
          font-size: 14px;
          color: #666;
        }

        /* Materials List */
        .materials-list,
        .parameters-list,
        .consumption-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .material-row,
        .parameter-row,
        .consumption-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 6px;
          border: 1px solid #e9ecef;
        }

        .material-info,
        .consumption-qty {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .material-info strong {
          font-size: 14px;
          color: #333;
        }

        .material-info span,
        .consumption-qty div {
          font-size: 12px;
          color: #666;
        }

        .material-cost,
        .consumption-cost {
          text-align: right;
          font-weight: 600;
          color: #007bff;
        }

        .param-name {
          font-weight: 600;
          color: #333;
        }

        .param-value {
          color: #007bff;
          font-weight: 500;
        }

        .param-tolerance {
          font-size: 12px;
          color: #666;
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

          .bom-grid {
            grid-template-columns: 1fr;
          }

          .form-row {
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

          .material-row,
          .parameter-row,
          .consumption-row {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default Materials;
