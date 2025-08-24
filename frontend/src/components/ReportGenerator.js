import React, { useState } from 'react';
import { Download, Calendar, Filter, FileText, Table, PieChart } from 'lucide-react';
import API_BASE_URL from '../api/config';

const ReportGenerator = ({ onClose }) => {
  const [reportConfig, setReportConfig] = useState({
    type: 'gst',
    format: 'pdf',
    period: 'monthly',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    filters: {
      partyType: 'all',
      status: 'all',
      department: 'all'
    }
  });

  const [generating, setGenerating] = useState(false);

  const reportTypes = [
    { value: 'gst', label: 'GST Compliance Report', icon: FileText },
    { value: 'jobs', label: 'Job Analytics Report', icon: Table },
    { value: 'parties', label: 'Party Analysis Report', icon: PieChart },
    { value: 'performance', label: 'Performance Dashboard', icon: TrendingUp }
  ];

  const formatOptions = [
    { value: 'pdf', label: 'PDF Document' },
    { value: 'excel', label: 'Excel Spreadsheet' },
    { value: 'csv', label: 'CSV Data' }
  ];

  const periodOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/analytics/export/${reportConfig.type}?` + 
        new URLSearchParams({
          format: reportConfig.format,
          startDate: reportConfig.startDate,
          endDate: reportConfig.endDate,
          ...reportConfig.filters
        }),
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportConfig.type}_report_${Date.now()}.${reportConfig.format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        alert('Report generated successfully!');
        onClose();
      } else {
        alert('Failed to generate report');
      }
    } catch (error) {
      console.error('Report generation error:', error);
      alert('Error generating report');
    } finally {
      setGenerating(false);
    }
  };

  const handleConfigChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setReportConfig(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setReportConfig(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <div className="modal-overlay">
      <div className="report-generator">
        <div className="modal-header">
          <h2>Generate Report</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <div className="modal-body">
          {/* Report Type Selection */}
          <div className="form-section">
            <label className="section-label">Report Type</label>
            <div className="report-type-grid">
              {reportTypes.map(type => {
                const Icon = type.icon;
                return (
                  <div
                    key={type.value}
                    className={`report-type-card ${reportConfig.type === type.value ? 'selected' : ''}`}
                    onClick={() => handleConfigChange('type', type.value)}
                  >
                    <Icon size={24} />
                    <span>{type.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Format and Period */}
          <div className="form-row">
            <div className="form-group">
              <label>Format</label>
              <select
                value={reportConfig.format}
                onChange={(e) => handleConfigChange('format', e.target.value)}
                className="form-select"
              >
                {formatOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Period</label>
              <select
                value={reportConfig.period}
                onChange={(e) => handleConfigChange('period', e.target.value)}
                className="form-select"
              >
                {periodOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Range */}
          {(reportConfig.period === 'custom' || reportConfig.period === 'monthly') && (
            <div className="form-row">
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={reportConfig.startDate}
                  onChange={(e) => handleConfigChange('startDate', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={reportConfig.endDate}
                  onChange={(e) => handleConfigChange('endDate', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          )}

          {/* Filters based on report type */}
          {reportConfig.type === 'parties' && (
            <div className="form-section">
              <label className="section-label">Filters</label>
              <div className="form-row">
                <div className="form-group">
                  <label>Party Type</label>
                  <select
                    value={reportConfig.filters.partyType}
                    onChange={(e) => handleConfigChange('filters.partyType', e.target.value)}
                    className="form-select"
                  >
                    <option value="all">All Parties</option>
                    <option value="customer">Customers Only</option>
                    <option value="vendor">Vendors Only</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {reportConfig.type === 'jobs' && (
            <div className="form-section">
              <label className="section-label">Filters</label>
              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={reportConfig.filters.status}
                    onChange={(e) => handleConfigChange('filters.status', e.target.value)}
                    className="form-select"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed Only</option>
                    <option value="in_progress">In Progress</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Department</label>
                  <select
                    value={reportConfig.filters.department}
                    onChange={(e) => handleConfigChange('filters.department', e.target.value)}
                    className="form-select"
                  >
                    <option value="all">All Departments</option>
                    <option value="production">Production</option>
                    <option value="quality">Quality</option>
                    <option value="assembly">Assembly</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Report Preview Info */}
          <div className="report-preview">
            <h4>Report Preview</h4>
            <div className="preview-details">
              <div className="detail-item">
                <span>Type:</span>
                <span>{reportTypes.find(t => t.value === reportConfig.type)?.label}</span>
              </div>
              <div className="detail-item">
                <span>Format:</span>
                <span>{formatOptions.find(f => f.value === reportConfig.format)?.label}</span>
              </div>
              <div className="detail-item">
                <span>Period:</span>
                <span>{reportConfig.startDate} to {reportConfig.endDate}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button 
            onClick={handleGenerate} 
            disabled={generating}
            className="btn-primary"
          >
            {generating ? (
              <>
                <div className="spinner"></div>
                Generating...
              </>
            ) : (
              <>
                <Download size={16} />
                Generate Report
              </>
            )}
          </button>
        </div>

        <style jsx>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }

          .report-generator {
            background: white;
            border-radius: 12px;
            width: 90vw;
            max-width: 600px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          }

          .modal-header {
            padding: 20px;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .modal-header h2 {
            margin: 0;
            color: #1a202c;
            font-size: 20px;
            font-weight: 600;
          }

          .close-button {
            background: none;
            border: none;
            font-size: 24px;
            color: #64748b;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            transition: background 0.2s;
          }

          .close-button:hover {
            background: #f1f5f9;
          }

          .modal-body {
            padding: 20px;
          }

          .form-section {
            margin-bottom: 24px;
          }

          .section-label {
            display: block;
            margin-bottom: 12px;
            color: #374151;
            font-weight: 600;
            font-size: 14px;
          }

          .report-type-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .report-type-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            padding: 16px;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            text-align: center;
          }

          .report-type-card:hover {
            border-color: #3b82f6;
            background: #f8fafc;
          }

          .report-type-card.selected {
            border-color: #3b82f6;
            background: #dbeafe;
            color: #1e40af;
          }

          .report-type-card span {
            font-size: 12px;
            font-weight: 500;
          }

          .form-row {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            margin-bottom: 16px;
          }

          .form-group {
            display: flex;
            flex-direction: column;
          }

          .form-group label {
            margin-bottom: 6px;
            color: #374151;
            font-weight: 500;
            font-size: 14px;
          }

          .form-input,
          .form-select {
            padding: 8px 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 14px;
            transition: border-color 0.2s;
          }

          .form-input:focus,
          .form-select:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }

          .report-preview {
            background: #f8fafc;
            padding: 16px;
            border-radius: 8px;
            margin-top: 20px;
          }

          .report-preview h4 {
            margin: 0 0 12px 0;
            color: #374151;
            font-size: 14px;
            font-weight: 600;
          }

          .preview-details {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .detail-item {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
          }

          .detail-item span:first-child {
            color: #64748b;
            font-weight: 500;
          }

          .detail-item span:last-child {
            color: #1f2937;
            font-weight: 600;
          }

          .modal-footer {
            padding: 20px;
            border-top: 1px solid #e2e8f0;
            display: flex;
            justify-content: flex-end;
            gap: 12px;
          }

          .btn-secondary {
            padding: 8px 16px;
            background: #f8fafc;
            color: #374151;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
          }

          .btn-secondary:hover {
            background: #f1f5f9;
          }

          .btn-primary {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: background 0.2s;
          }

          .btn-primary:hover:not(:disabled) {
            background: #2563eb;
          }

          .btn-primary:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .spinner {
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top: 2px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @media (max-width: 640px) {
            .report-generator {
              width: 95vw;
              margin: 20px;
            }

            .report-type-grid {
              grid-template-columns: 1fr;
            }

            .form-row {
              grid-template-columns: 1fr;
            }

            .modal-footer {
              flex-direction: column;
            }

            .btn-secondary,
            .btn-primary {
              width: 100%;
              justify-content: center;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default ReportGenerator;
