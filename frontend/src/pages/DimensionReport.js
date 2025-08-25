import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, FileText, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const DimensionReport = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingReport, setEditingReport] = useState(null);

  // Mock data for demonstration
  useEffect(() => {
    const mockReports = [
      {
        id: 1,
        cocId: 'COC-001',
        jobId: 'JOB-2024-001',
        checkType: 'dimensional',
        checkDescription: 'Outer Diameter Check',
        specification: '50.0 ± 0.1mm',
        tolerance: '±0.1',
        sample1: { value: 49.95, status: 'OK' },
        sample2: { value: 50.02, status: 'OK' },
        sample3: { value: 49.98, status: 'OK' },
        sample4: { value: 50.01, status: 'OK' },
        sample5: { value: 49.97, status: 'OK' },
        result: 'OK',
        measuredBy: 'John Smith',
        measurementDate: '2024-08-24',
        notes: 'All samples within tolerance'
      },
      {
        id: 2,
        cocId: 'COC-002',
        jobId: 'JOB-2024-002',
        checkType: 'visual',
        checkDescription: 'Surface Finish Inspection',
        specification: 'Ra 3.2μm',
        tolerance: 'Max 3.2',
        sample1: { value: 2.8, status: 'OK' },
        sample2: { value: 3.1, status: 'OK' },
        sample3: { value: 2.9, status: 'OK' },
        sample4: { value: 3.0, status: 'OK' },
        sample5: { value: 2.7, status: 'OK' },
        result: 'OK',
        measuredBy: 'Sarah Johnson',
        measurementDate: '2024-08-23',
        notes: 'Excellent surface finish quality'
      }
    ];
    
    setTimeout(() => {
      setReports(mockReports);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredReports = reports.filter(report =>
    report.checkDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.cocId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.jobId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateReport = (formData) => {
    const newReport = {
      id: reports.length + 1,
      ...formData,
      measurementDate: new Date().toISOString().split('T')[0]
    };
    setReports([...reports, newReport]);
    setShowCreateModal(false);
    toast.success('Dimension report created successfully!');
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

  if (loading) {
    return <div className="loading">Loading dimension reports...</div>;
  }

  return (
    <div className="dimension-report-page">
      <div className="page-header">
        <h1>Dimension Reports</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={20} />
          Create Report
        </button>
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
                  className="btn-icon"
                  onClick={() => handleEditReport(report)}
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button 
                  className="btn-icon"
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
                  <span className="value">{report.cocId}</span>
                </div>
                <div className="info-row">
                  <span className="label">Job ID:</span>
                  <span className="value">{report.jobId}</span>
                </div>
                <div className="info-row">
                  <span className="label">Check Type:</span>
                  <span className="value badge">{report.checkType}</span>
                </div>
                <div className="info-row">
                  <span className="label">Specification:</span>
                  <span className="value">{report.specification}</span>
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
                        <span className={`sample-value ${sample.status.toLowerCase()}`}>
                          {sample.value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="result-section">
                <div className="final-result">
                  <span className="label">Result:</span>
                  <span className={`result-badge ${report.result.toLowerCase()}`}>
                    {report.result}
                  </span>
                </div>
                <div className="measurement-info">
                  <span className="measured-by">By: {report.measuredBy}</span>
                  <span className="measurement-date">{report.measurementDate}</span>
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

        .btn-secondary {
          background: #f5f5f5;
          color: #333;
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
      `}</style>
    </div>
  );
};

export default DimensionReport;
