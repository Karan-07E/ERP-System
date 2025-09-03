import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, FileText, Eye, X, Upload, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '../api/config';

const DimensionReport = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [dimensionFormData, setDimensionFormData] = useState({
    cocId: '',
    jobId: '',
    checkType: 'dimensional',
    checkDescription: '',
    parameter: '',
    specification: '',
    measuredValue: '',
    unit: '',
    tolerance: '',
    result: 'OK',
    sample1Value: '',
    sample2Value: '',
    sample3Value: '',
    sample4Value: '',
    sample5Value: '',
    measuredBy: '',
    measurementDate: new Date().toISOString().split('T')[0],
    image: null
  });

  // Fetch dimension reports from backend
  useEffect(() => {
    fetchDimensionReports();
  }, []);

  const fetchDimensionReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/dimension-reports', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.data) {
        setReports(response.data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dimension reports:', error);
      setReports([]);
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(report =>
    report.checkDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.cocId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.jobId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDimensionFormChange = (e) => {
    const { name, value, files } = e.target;
    setDimensionFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleCreateDimensionReport = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.keys(dimensionFormData).forEach(key => {
        if (dimensionFormData[key] !== null) {
          formDataToSend.append(key, dimensionFormData[key]);
        }
      });

      const token = localStorage.getItem('token');
      const response = await axios.post('/dimension-reports', formDataToSend, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Dimension report created successfully:', response.data);
      setShowCreateModal(false);
      resetDimensionForm();
      toast.success('Dimension report created successfully!');
      // Refresh reports
      fetchDimensionReports();
    } catch (error) {
      console.error('Error creating dimension report:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      toast.error(`Error creating dimension report: ${errorMessage}`);
    }
  };

  const resetDimensionForm = () => {
    setDimensionFormData({
      cocId: '',
      jobId: '',
      checkType: 'dimensional',
      checkDescription: '',
      parameter: '',
      specification: '',
      measuredValue: '',
      unit: '',
      tolerance: '',
      result: 'OK',
      sample1Value: '',
      sample2Value: '',
      sample3Value: '',
      sample4Value: '',
      sample5Value: '',
      measuredBy: '',
      measurementDate: new Date().toISOString().split('T')[0],
      image: null
    });
  };

  const handleEditReport = (report) => {
    setEditingReport(report);
    setShowCreateModal(true);
  };

  const handleDeleteReport = (id) => {
    if (window.confirm('Are you sure you want to delete this dimension report?')) {
      setReports(reports.filter(report => report.id !== id));
      toast.success('Dimension report deleted successfully!');
    }
  };

  const handleExportReportPDF = async (report) => {
    try {
      // For individual report PDF, we'll create a simple PDF client-side
      // or make a backend call with specific report ID
      const response = await fetch(`/api/dimension-reports/export/pdf?reportId=${report.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export report to PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dimension_report_${report.cocId}_${report.id}.pdf`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Report exported to PDF successfully!');
    } catch (error) {
      console.error('PDF Export error:', error);
      toast.error('Failed to export report to PDF');
    }
  };

  const handleExportReport = (report) => {
    try {
      // Create CSV content
      const csvContent = generateCSVContent(report);
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `dimension_report_${report.cocId}_${report.id}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Report exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    }
  };

  const generateCSVContent = (report) => {
    const headers = [
      'Report ID',
      'COC ID', 
      'Job ID',
      'Check Type',
      'Check Description',
      'Parameter',
      'Specification',
      'Tolerance',
      'Sample 1 Value',
      'Sample 1 Status',
      'Sample 2 Value', 
      'Sample 2 Status',
      'Sample 3 Value',
      'Sample 3 Status', 
      'Sample 4 Value',
      'Sample 4 Status',
      'Sample 5 Value',
      'Sample 5 Status',
      'Final Result',
      'Measured By',
      'Measurement Date',
      'Overall Measured Value',
      'Unit',
      'Notes'
    ];

    // Format date properly
    const formatDate = (dateString) => {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US') + ' ' + date.toLocaleTimeString('en-US', { hour12: false });
      } catch (e) {
        return dateString;
      }
    };

    // Clean and format measured by field
    const formatMeasuredBy = (measuredBy) => {
      if (typeof measuredBy === 'object' && measuredBy?.firstName && measuredBy?.lastName) {
        return `${measuredBy.firstName} ${measuredBy.lastName}`;
      }
      return measuredBy || '';
    };

    // Clean notes field
    const formatNotes = (notes) => {
      if (!notes) return '';
      return String(notes).replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
    };

    const rows = [
      report.id || '',
      report.cocId || '',
      report.jobId || '',
      report.checkType || '',
      report.checkDescription || '',
      report.parameter || '',
      report.specification || '',
      report.tolerance || '',
      report.sample1?.value || '',
      report.sample1?.status || '',
      report.sample2?.value || '',
      report.sample2?.status || '',
      report.sample3?.value || '',
      report.sample3?.status || '',
      report.sample4?.value || '',
      report.sample4?.status || '',
      report.sample5?.value || '',
      report.sample5?.status || '',
      report.result || '',
      formatMeasuredBy(report.MeasuredBy || report.measuredBy),
      formatDate(report.measurementDate),
      report.measuredValue || '',
      report.unit || '',
      formatNotes(report.notes)
    ];

    // Escape and wrap values that contain commas, quotes, or newlines
    const escapeCSVValue = (value) => {
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      // Always wrap values in quotes for consistent alignment
      return `"${stringValue.replace(/"/g, '""')}"`;
    };

    const csvRows = [
      headers.map(escapeCSVValue).join(','),
      rows.map(escapeCSVValue).join(',')
    ];

    // Add UTF-8 BOM for better Excel compatibility
    return '\uFEFF' + csvRows.join('\n');
  };

  const handleExportAllPDF = async () => {
    try {
      if (filteredReports.length === 0) {
        toast.error('No reports to export');
        return;
      }

      // Use backend PDF export
      const response = await fetch('/api/dimension-reports/export/pdf', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export reports to PDF');
      }

      // Get the PDF content as blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dimension_reports_all_${new Date().toISOString().split('T')[0]}.pdf`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Exported ${filteredReports.length} reports to PDF successfully`);
    } catch (error) {
      console.error('PDF Export error:', error);
      toast.error('Failed to export reports to PDF');
    }
  };

  const handleExportAll = async () => {
    try {
      if (filteredReports.length === 0) {
        toast.error('No reports to export');
        return;
      }

      // Use backend CSV export for better alignment and formatting
      const response = await fetch('/api/dimension-reports/export/csv', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export reports');
      }

      // Get the CSV content as blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dimension_reports_all_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Exported ${filteredReports.length} reports successfully`);
    } catch (error) {
      console.error('Export error:', error);
      
      // Fallback to client-side export if backend fails
      console.log('Falling back to client-side export...');
      
      // Generate CSV content for all reports (client-side fallback)
      const headers = [
        'Report ID',
        'COC ID', 
        'Job ID',
        'Check Type',
        'Check Description',
        'Parameter',
        'Specification',
        'Tolerance',
        'Sample 1 Value',
        'Sample 1 Status',
        'Sample 2 Value', 
        'Sample 2 Status',
        'Sample 3 Value',
        'Sample 3 Status', 
        'Sample 4 Value',
        'Sample 4 Status',
        'Sample 5 Value',
        'Sample 5 Status',
        'Final Result',
        'Measured By',
        'Measurement Date',
        'Overall Measured Value',
        'Unit',
        'Notes'
      ];

      // Format date properly
      const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
          const date = new Date(dateString);
          return date.toLocaleDateString('en-US') + ' ' + date.toLocaleTimeString('en-US', { hour12: false });
        } catch (e) {
          return dateString;
        }
      };

      // Clean and format measured by field
      const formatMeasuredBy = (measuredBy) => {
        if (typeof measuredBy === 'object' && measuredBy?.firstName && measuredBy?.lastName) {
          return `${measuredBy.firstName} ${measuredBy.lastName}`;
        }
        return measuredBy || '';
      };

      // Clean notes field
      const formatNotes = (notes) => {
        if (!notes) return '';
        return String(notes).replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
      };

      // Escape and wrap all values consistently
      const escapeCSVValue = (value) => {
        if (value === null || value === undefined) return '""';
        const stringValue = String(value);
        // Always wrap values in quotes for consistent alignment
        return `"${stringValue.replace(/"/g, '""')}"`;
      };

      const csvRows = [headers.map(escapeCSVValue).join(',')];
      
      filteredReports.forEach(report => {
        const rows = [
          report.id || '',
          report.cocId || '',
          report.jobId || '',
          report.checkType || '',
          report.checkDescription || '',
          report.parameter || '',
          report.specification || '',
          report.tolerance || '',
          report.sample1?.value || '',
          report.sample1?.status || '',
          report.sample2?.value || '',
          report.sample2?.status || '',
          report.sample3?.value || '',
          report.sample3?.status || '',
          report.sample4?.value || '',
          report.sample4?.status || '',
          report.sample5?.value || '',
          report.sample5?.status || '',
          report.result || '',
          formatMeasuredBy(report.MeasuredBy || report.measuredBy),
          formatDate(report.measurementDate),
          report.measuredValue || '',
          report.unit || '',
          formatNotes(report.notes)
        ];
        csvRows.push(rows.map(escapeCSVValue).join(','));
      });

      // Add UTF-8 BOM for better Excel compatibility
      const csvContent = '\uFEFF' + csvRows.join('\n');
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `dimension_reports_all_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${filteredReports.length} reports successfully (fallback mode)`);
    }
  };

  if (loading) {
    return <div className="loading">Loading dimension reports...</div>;
  }

  return (
    <div className="dimension-report-page">
      <div className="page-header">
        <h1>Dimension Reports</h1>
        <div className="header-actions">
          <div className="export-buttons">
            <button 
              className="btn btn-secondary"
              onClick={handleExportAll}
              disabled={filteredReports.length === 0}
              title="Export to CSV"
            >
              <Download size={20} />
              CSV ({filteredReports.length})
            </button>
            <button 
              className="btn btn-secondary"
              onClick={handleExportAllPDF}
              disabled={filteredReports.length === 0}
              title="Export to PDF"
            >
              <Download size={20} />
              PDF ({filteredReports.length})
            </button>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => {
              resetDimensionForm();
              setShowCreateModal(true);
            }}
          >
            <Plus size={20} />
            Create Report
          </button>
        </div>
      </div>

      <div className="page-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn btn-secondary">
          <Filter size={20} />
          Filter
        </button>
      </div>

      <div className="reports-grid">
        {filteredReports.map(report => (
          <div key={report.id} className="report-card">
            <div className="card-header">
              <div className="card-title">
                <FileText size={20} />
                <span>{report.checkDescription}</span>
              </div>
              <div className="card-actions">
                <button 
                  className="btn-icon export-btn"
                  onClick={() => handleExportReport(report)}
                  title="Export CSV"
                >
                  <Download size={16} />
                </button>
                <button 
                  className="btn-icon"
                  onClick={() => handleEditReport(report)}
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button 
                  className="btn-icon delete-btn"
                  onClick={() => handleDeleteReport(report.id)}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="card-content">
              <div className="report-info">
                <div className="info-row">
                  <span className="label">COC ID:</span>
                  <span className="value">{report.cocId || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Job ID:</span>
                  <span className="value">{report.jobId || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Check Type:</span>
                  <span className="value badge">{report.checkType || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Specification:</span>
                  <span className="value">{report.specification || 'N/A'}</span>
                </div>
              </div>

              <div className="samples-section">
                <h4>Sample Results</h4>
                <div className="samples-grid">
                  {[1, 2, 3, 4, 5].map(num => {
                    const sample = report[`sample${num}`];
                    return (
                      <div key={num} className="sample-result">
                        <span className="sample-label">S{num}</span>
                        <span className={`sample-value ${sample?.status?.toLowerCase() || 'n/a'}`}>
                          {sample?.value || 'N/A'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="result-section">
                <div className="final-result">
                  <span className="label">Result:</span>
                  <span className={`result-badge ${report.result?.toLowerCase() || 'n/a'}`}>
                    {report.result || 'N/A'}
                  </span>
                </div>
                <div className="measurement-info">
                  <span className="measured-by">By: {report.measuredBy || 'N/A'}</span>
                  <span className="measurement-date">{report.measurementDate || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="empty-state">
          <FileText size={48} />
          <h3>No dimension reports found</h3>
          <p>Create your first dimension report to get started.</p>
        </div>
      )}

      {/* Create Dimension Report Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Dimension Report</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="modal-close"
              >
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <form onSubmit={handleCreateDimensionReport}>
                <div className="form-grid">
                  <div className="form-field">
                    <label htmlFor="cocId">COC ID</label>
                    <input
                      type="text"
                      id="cocId"
                      name="cocId"
                      value={dimensionFormData.cocId}
                      onChange={handleDimensionFormChange}
                      placeholder="e.g., COC-001"
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="jobId">Job ID</label>
                    <input
                      type="text"
                      id="jobId"
                      name="jobId"
                      value={dimensionFormData.jobId}
                      onChange={handleDimensionFormChange}
                      placeholder="e.g., JOB-2024-001"
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="checkType">Check Type *</label>
                    <select
                      id="checkType"
                      name="checkType"
                      value={dimensionFormData.checkType}
                      onChange={handleDimensionFormChange}
                      required
                    >
                      <option value="dimensional">Dimensional</option>
                      <option value="visual">Visual</option>
                      <option value="functional">Functional</option>
                      <option value="material">Material</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label htmlFor="parameter">Parameter *</label>
                    <input
                      type="text"
                      id="parameter"
                      name="parameter"
                      value={dimensionFormData.parameter}
                      onChange={handleDimensionFormChange}
                      placeholder="e.g., Length, Width, Diameter"
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="specification">Specification</label>
                    <input
                      type="text"
                      id="specification"
                      name="specification"
                      value={dimensionFormData.specification}
                      onChange={handleDimensionFormChange}
                      placeholder="e.g., 50.0 ± 0.1mm"
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="tolerance">Tolerance</label>
                    <input
                      type="text"
                      id="tolerance"
                      name="tolerance"
                      value={dimensionFormData.tolerance}
                      onChange={handleDimensionFormChange}
                      placeholder="e.g., ±0.1"
                    />
                  </div>

                  <div className="form-field full-width">
                    <h4 style={{ margin: '16px 0 8px 0', color: '#374151' }}>Sample Results</h4>
                  </div>

                  <div className="form-field">
                    <label htmlFor="sample1Value">Sample 1 (S1)</label>
                    <input
                      type="number"
                      step="0.001"
                      id="sample1Value"
                      name="sample1Value"
                      value={dimensionFormData.sample1Value}
                      onChange={handleDimensionFormChange}
                      placeholder="e.g., 49.95"
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="sample2Value">Sample 2 (S2)</label>
                    <input
                      type="number"
                      step="0.001"
                      id="sample2Value"
                      name="sample2Value"
                      value={dimensionFormData.sample2Value}
                      onChange={handleDimensionFormChange}
                      placeholder="e.g., 50.02"
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="sample3Value">Sample 3 (S3)</label>
                    <input
                      type="number"
                      step="0.001"
                      id="sample3Value"
                      name="sample3Value"
                      value={dimensionFormData.sample3Value}
                      onChange={handleDimensionFormChange}
                      placeholder="e.g., 49.98"
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="sample4Value">Sample 4 (S4)</label>
                    <input
                      type="number"
                      step="0.001"
                      id="sample4Value"
                      name="sample4Value"
                      value={dimensionFormData.sample4Value}
                      onChange={handleDimensionFormChange}
                      placeholder="e.g., 50.01"
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="sample5Value">Sample 5 (S5)</label>
                    <input
                      type="number"
                      step="0.001"
                      id="sample5Value"
                      name="sample5Value"
                      value={dimensionFormData.sample5Value}
                      onChange={handleDimensionFormChange}
                      placeholder="e.g., 49.97"
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="result">Result *</label>
                    <select
                      id="result"
                      name="result"
                      value={dimensionFormData.result}
                      onChange={handleDimensionFormChange}
                      required
                    >
                      <option value="OK">OK</option>
                      <option value="NOT_OK">NOT OK</option>
                      <option value="NA">N/A</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label htmlFor="measuredBy">Measured By</label>
                    <input
                      type="text"
                      id="measuredBy"
                      name="measuredBy"
                      value={dimensionFormData.measuredBy}
                      onChange={handleDimensionFormChange}
                      placeholder="e.g., John Smith"
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="measurementDate">Measurement Date</label>
                    <input
                      type="date"
                      id="measurementDate"
                      name="measurementDate"
                      value={dimensionFormData.measurementDate}
                      onChange={handleDimensionFormChange}
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="unit">Unit</label>
                    <select
                      id="unit"
                      name="unit"
                      value={dimensionFormData.unit}
                      onChange={handleDimensionFormChange}
                    >
                      <option value="">Select Unit</option>
                      <option value="mm">mm</option>
                      <option value="cm">cm</option>
                      <option value="m">m</option>
                      <option value="inch">inch</option>
                      <option value="ft">ft</option>
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="lb">lb</option>
                      <option value="°">Degrees</option>
                      <option value="°C">°C</option>
                      <option value="°F">°F</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label htmlFor="measuredValue">Overall Measured Value</label>
                    <input
                      type="number"
                      step="0.001"
                      id="measuredValue"
                      name="measuredValue"
                      value={dimensionFormData.measuredValue}
                      onChange={handleDimensionFormChange}
                      placeholder="e.g., 99.95"
                    />
                  </div>

                  <div className="form-field full-width">
                    <label htmlFor="image">Upload Image (Optional)</label>
                    <input
                      type="file"
                      id="image"
                      name="image"
                      onChange={handleDimensionFormChange}
                      accept="image/*"
                      className="file-input"
                    />
                    <small className="form-help">
                      Upload an image showing the measurement or inspection result
                    </small>
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetDimensionForm();
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Report
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .dimension-report-page {
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .page-header h1 {
          margin: 0;
          font-size: 28px;
          color: #333;
        }

        .header-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .page-controls {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
        }

        .search-box {
          display: flex;
          align-items: center;
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 8px 12px;
          flex: 1;
          max-width: 400px;
        }

        .search-box input {
          border: none;
          outline: none;
          margin-left: 8px;
          flex: 1;
        }

        .reports-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 24px;
        }

        .report-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: #f8f9fa;
          border-bottom: 1px solid #eee;
        }

        .card-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #333;
        }

        .card-actions {
          display: flex;
          gap: 8px;
        }

        .btn-icon {
          background: none;
          border: none;
          padding: 4px;
          border-radius: 4px;
          cursor: pointer;
          color: #666;
        }

        .btn-icon:hover {
          background: #f0f0f0;
          color: #333;
        }

        .btn-icon.export-btn:hover {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .btn-icon.delete-btn:hover {
          background: #ffebee;
          color: #d32f2f;
        }

        .card-content {
          padding: 16px;
        }

        .report-info {
          margin-bottom: 16px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .label {
          font-weight: 500;
          color: #666;
        }

        .value {
          color: #333;
        }

        .badge {
          background: #e3f2fd;
          color: #1976d2;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          text-transform: uppercase;
        }

        .samples-section h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .samples-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
          margin-bottom: 16px;
        }

        .sample-result {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 8px;
          background: #f8f9fa;
          border-radius: 6px;
        }

        .sample-label {
          font-size: 10px;
          color: #666;
          text-transform: uppercase;
        }

        .sample-value {
          font-weight: 600;
          font-size: 12px;
        }

        .sample-value.ok {
          color: #2e7d32;
        }

        .sample-value.not_ok {
          color: #d32f2f;
        }

        .result-section {
          border-top: 1px solid #eee;
          padding-top: 16px;
        }

        .final-result {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .result-badge {
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .result-badge.ok {
          background: #e8f5e8;
          color: #2e7d32;
        }

        .result-badge.not_ok {
          background: #ffebee;
          color: #d32f2f;
        }

        .measurement-info {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #666;
        }

        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-primary {
          background: #1976d2;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #1565c0;
        }

        .btn-secondary {
          background: #f5f5f5;
          color: #333;
          border: 1px solid #ddd;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #e8f5e9;
          color: #2e7d32;
          border-color: #4caf50;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .empty-state {
          text-align: center;
          padding: 48px;
          color: #666;
        }

        .empty-state h3 {
          margin: 16px 0 8px 0;
        }

        .loading {
          text-align: center;
          padding: 48px;
          color: #666;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow-y: auto;
          padding: 20px;
        }

        .modal {
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
        }

        .modal-header {
          background: white;
          padding: 24px;
          border-bottom: 1px solid #e5e7eb;
          border-radius: 12px 12px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h3 {
          font-size: 20px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .modal-close {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-close:hover {
          color: #111827;
          background-color: #f3f4f6;
        }

        .modal-body {
          padding: 24px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
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

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding-top: 24px;
          border-top: 1px solid #e5e7eb;
        }
      `}</style>
    </div>
  );
};

export default DimensionReport;
