import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Settings,
  Clock,
  User,
  Calendar,
  BarChart3,
  TrendingUp,
  Activity
} from 'lucide-react';

const Processes = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [processes, setProcesses] = useState([]);
  const [qualityControls, setQualityControls] = useState([]);
  const [inspectionReports, setInspectionReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProcess, setEditingProcess] = useState(null);
  const [editingQC, setEditingQC] = useState(null);
  const [editingReport, setEditingReport] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    categories: {}
  });
  const [dashboardStats, setDashboardStats] = useState({
    totalProcesses: 0,
    activeQualityChecks: 0,
    pendingInspections: 0,
    qualityPassRate: 0
  });

  // Form state for processes
  const [formData, setFormData] = useState({
    processName: '',
    category: '',
    description: '',
    estimatedTime: '',
    skillLevel: '',
    department: '',
    isActive: true,
    instructions: '',
    qualityRequirements: '',
    safetyRequirements: ''
  });

  // Form state for quality control
  const [qcFormData, setQcFormData] = useState({
    type: '',
    item: '',
    batch: '',
    quantity: '',
    checkCriteria: '',
    checkMethod: '',
    tolerances: '',
    checkResults: '',
    defects: [],
    overall_status: 'pending',
    notes: ''
  });

  // Form state for inspection reports
  const [reportFormData, setReportFormData] = useState({
    type: '',
    item: '',
    process: '',
    customer: '',
    vendor: '',
    inspector: '',
    inspectionDate: '',
    batch: '',
    quantity: '',
    inspectionCriteria: '',
    checkpoints: [],
    overallResult: 'pending',
    findings: '',
    recommendations: '',
    correctiveActions: '',
    notes: ''
  });

  const categories = [
    'machining',
    'assembly',
    'finishing',
    'quality_check',
    'packaging',
    'other'
  ];

  const skillLevels = [
    'beginner',
    'intermediate',
    'advanced',
    'expert'
  ];

  const qcTypes = ['incoming', 'in_process', 'final', 'outgoing'];
  const qcStatuses = ['pending', 'on_hold', 'passed', 'failed', 'rework'];
  const reportTypes = ['incoming', 'in_process', 'final', 'customer', 'vendor'];
  const reportResults = ['pending', 'passed', 'failed', 'conditional'];

  // Fetch processes and stats
  const fetchData = async () => {
    setLoading(true);
    try {
      // Mock Processes Data
      const mockProcesses = [
        {
          id: 'proc1',
          processName: 'Steel Rod Cutting',
          category: 'machining',
          description: 'Precision cutting of steel rods to required dimensions',
          estimatedTime: '45 minutes',
          skillLevel: 'intermediate',
          department: 'Production',
          isActive: true,
          instructions: '1. Measure steel rod according to specifications\n2. Set cutting machine parameters\n3. Perform cutting operation\n4. Check dimensions with calipers',
          qualityRequirements: 'Cut accuracy: ±0.1mm\nSurface finish: Ra 1.6\nNo burrs or sharp edges',
          safetyRequirements: 'Wear safety glasses and gloves\nEnsure proper machine guarding\nFollow lockout/tagout procedures'
        },
        {
          id: 'proc2',
          processName: 'Welding Assembly',
          category: 'assembly',
          description: 'TIG welding of components according to drawing specifications',
          estimatedTime: '2 hours',
          skillLevel: 'advanced',
          department: 'Assembly',
          isActive: true,
          instructions: '1. Clean all surfaces to be welded\n2. Set up welding parameters\n3. Perform tack welding\n4. Complete final welding\n5. Post-weld inspection',
          qualityRequirements: 'Weld penetration: Full thickness\nVisual inspection: No cracks or porosity\nDimensional accuracy per drawing',
          safetyRequirements: 'Use proper welding helmet and protective clothing\nEnsure adequate ventilation\nCheck gas connections'
        },
        {
          id: 'proc3',
          processName: 'Surface Grinding',
          category: 'finishing',
          description: 'Precision surface grinding to achieve required surface finish',
          estimatedTime: '30 minutes',
          skillLevel: 'expert',
          department: 'Finishing',
          isActive: true,
          instructions: '1. Mount workpiece securely\n2. Set grinding wheel specifications\n3. Set depth of cut\n4. Perform grinding operation\n5. Check surface finish',
          qualityRequirements: 'Surface finish: Ra 0.8 max\nDimensional tolerance: ±0.02mm\nNo grinding burns',
          safetyRequirements: 'Wear safety glasses and face shield\nEnsure coolant flow\nCheck wheel balance before operation'
        },
        {
          id: 'proc4',
          processName: 'Final Quality Inspection',
          category: 'quality_check',
          description: 'Comprehensive quality inspection of finished products',
          estimatedTime: '20 minutes',
          skillLevel: 'intermediate',
          department: 'Quality',
          isActive: true,
          instructions: '1. Visual inspection for defects\n2. Dimensional verification\n3. Function testing\n4. Documentation\n5. Final approval or rejection',
          qualityRequirements: 'All dimensions within tolerance\nNo visual defects\nFunction test passed\nComplete documentation',
          safetyRequirements: 'Handle parts carefully\nUse appropriate measuring tools\nFollow inspection procedures'
        },
        {
          id: 'proc5',
          processName: 'Packaging & Labeling',
          category: 'packaging',
          description: 'Final packaging and labeling of products for shipment',
          estimatedTime: '15 minutes',
          skillLevel: 'beginner',
          department: 'Packaging',
          isActive: true,
          instructions: '1. Select appropriate packaging materials\n2. Wrap/box products securely\n3. Apply correct labels\n4. Update shipping documentation',
          qualityRequirements: 'Secure packaging\nCorrect labeling\nShipping documents complete',
          safetyRequirements: 'Proper lifting techniques\nUse appropriate packaging tools\nClear workspace of hazards'
        }
      ];
      setProcesses(mockProcesses);

      // Mock Quality Controls Data
      const mockQualityControls = [
        {
          id: 'qc1',
          qcNumber: 'QC-2025-001',
          type: 'incoming',
          item: 'Steel Rod 12mm',
          itemDetails: { name: 'Steel Rod 12mm' },
          batch: 'STL-001-2025',
          quantity: 100,
          checkCriteria: 'Diameter: 12mm ±0.1\nStraightness: 0.5mm/m max\nSurface finish: smooth',
          checkMethod: 'Caliper measurement, visual inspection',
          tolerances: 'Diameter: ±0.1mm, Length: ±5mm',
          checkResults: 'All measurements within specification\nNo surface defects observed',
          defects: [],
          overall_status: 'passed',
          notes: 'Material quality excellent, approved for production',
          checkDate: new Date('2025-08-01')
        },
        {
          id: 'qc2',
          qcNumber: 'QC-2025-002',
          type: 'in_process',
          item: 'Welded Assembly',
          itemDetails: { name: 'Welded Assembly' },
          batch: 'WLD-002-2025',
          quantity: 25,
          checkCriteria: 'Weld quality: Visual inspection class C\nDimensional accuracy per drawing\nNo cracks or porosity',
          checkMethod: 'Visual inspection, dimensional check, dye penetrant test',
          tolerances: 'Dimensional: ±0.5mm, Weld profile: smooth',
          checkResults: 'Minor weld spatter on 3 pieces, acceptable per standard\nAll dimensions within tolerance',
          defects: ['Minor weld spatter'],
          overall_status: 'passed',
          notes: 'Acceptable quality with minor cosmetic issues',
          checkDate: new Date('2025-08-02')
        },
        {
          id: 'qc3',
          qcNumber: 'QC-2025-003',
          type: 'final',
          item: 'Motor Assembly',
          itemDetails: { name: 'Motor Assembly' },
          batch: 'MOT-003-2025',
          quantity: 10,
          checkCriteria: 'Function test: All parameters within spec\nVisual inspection: No defects\nDimensional check: Final assembly',
          checkMethod: 'Performance testing, visual inspection, CMM measurement',
          tolerances: 'Performance: ±5% of nominal, Dimensions: ±0.1mm',
          checkResults: 'Function test failed on 2 units - low torque output\n8 units passed all tests',
          defects: ['Low torque output', 'Bearing noise'],
          overall_status: 'rework',
          notes: 'Requires investigation and rework of failed units',
          checkDate: new Date('2025-08-03')
        },
        {
          id: 'qc4',
          qcNumber: 'QC-2025-004',
          type: 'outgoing',
          item: 'Finished Product Batch A',
          itemDetails: { name: 'Finished Product Batch A' },
          batch: 'FIN-004-2025',
          quantity: 50,
          checkCriteria: 'Final inspection checklist complete\nPackaging intact\nLabeling correct\nDocumentation complete',
          checkMethod: 'Final inspection checklist, visual check',
          tolerances: 'Per customer specifications',
          checkResults: 'All units passed final inspection\nPackaging and labeling verified\nShipping documents complete',
          defects: [],
          overall_status: 'passed',
          notes: 'Ready for shipment to customer',
          checkDate: new Date('2025-08-04')
        }
      ];
      setQualityControls(mockQualityControls);

      // Mock Inspection Reports Data
      const mockInspectionReports = [
        {
          id: 'rpt1',
          reportNumber: 'INS-2025-001',
          type: 'incoming',
          item: 'Raw Material Inspection',
          itemDetails: { name: 'Raw Material Inspection' },
          process: 'Material Receipt',
          customer: '',
          vendor: 'Steel Industries Ltd',
          inspector: 'inspector1',
          inspectorDetails: { firstName: 'John', lastName: 'Inspector' },
          inspectionDate: new Date('2025-07-30'),
          batch: 'RM-001-2025',
          quantity: 500,
          inspectionCriteria: 'Material certification review\nDimensional verification\nSurface condition assessment\nChemical composition check',
          checkpoints: [
            { checkpoint: 'Material Certificate', result: 'pass', notes: 'Certificate provided and verified' },
            { checkpoint: 'Dimensions', result: 'pass', notes: 'All measurements within tolerance' },
            { checkpoint: 'Surface Condition', result: 'pass', notes: 'No visible defects' },
            { checkpoint: 'Chemistry', result: 'pass', notes: 'Composition meets specification' }
          ],
          overallResult: 'passed',
          findings: 'All incoming materials meet specifications and quality standards. Material certificates are valid and complete.',
          recommendations: 'Approve material for production use. Continue regular incoming inspection procedures.',
          correctiveActions: 'None required',
          notes: 'Excellent material quality from this supplier'
        },
        {
          id: 'rpt2',
          reportNumber: 'INS-2025-002',
          type: 'in_process',
          item: 'Machining Process Audit',
          itemDetails: { name: 'Machining Process Audit' },
          process: 'CNC Machining',
          customer: '',
          vendor: '',
          inspector: 'inspector2',
          inspectorDetails: { firstName: 'Sarah', lastName: 'QC Manager' },
          inspectionDate: new Date('2025-08-01'),
          batch: 'MAC-002-2025',
          quantity: 75,
          inspectionCriteria: 'Process capability study\nTool condition assessment\nDimensional accuracy check\nSurface finish verification',
          checkpoints: [
            { checkpoint: 'Process Control', result: 'pass', notes: 'Process in statistical control' },
            { checkpoint: 'Tool Condition', result: 'conditional', notes: 'Some tools showing wear, schedule replacement' },
            { checkpoint: 'Dimensions', result: 'pass', notes: 'All parts within tolerance' },
            { checkpoint: 'Surface Finish', result: 'pass', notes: 'Surface finish meets requirements' }
          ],
          overallResult: 'conditional',
          findings: 'Process is performing well overall. Tool wear detected on Station 3 requiring attention.',
          recommendations: 'Replace cutting tools on Station 3. Implement preventive tool replacement schedule.',
          correctiveActions: 'Tool replacement scheduled for next maintenance window. Updated tool management procedure.',
          notes: 'Process capability excellent except for tool wear issue'
        },
        {
          id: 'rpt3',
          reportNumber: 'INS-2025-003',
          type: 'final',
          item: 'Final Product Inspection',
          itemDetails: { name: 'Final Product Inspection' },
          process: 'Final Assembly',
          customer: 'Acme Corporation',
          vendor: '',
          inspector: 'inspector3',
          inspectorDetails: { firstName: 'Michael', lastName: 'Quality Lead' },
          inspectionDate: new Date('2025-08-03'),
          batch: 'FIN-003-2025',
          quantity: 30,
          inspectionCriteria: 'Final product functionality\nCosmetic appearance\nPackaging requirements\nDocumentation completeness',
          checkpoints: [
            { checkpoint: 'Functionality', result: 'pass', notes: 'All units tested and functional' },
            { checkpoint: 'Appearance', result: 'pass', notes: 'Cosmetic quality acceptable' },
            { checkpoint: 'Packaging', result: 'pass', notes: 'Packaging meets customer requirements' },
            { checkpoint: 'Documentation', result: 'pass', notes: 'All required documents present' }
          ],
          overallResult: 'passed',
          findings: 'All final products meet customer specifications and quality requirements. Ready for shipment.',
          recommendations: 'Approve for shipment to customer. Continue current quality procedures.',
          correctiveActions: 'None required',
          notes: 'Customer specifications fully met, excellent quality batch'
        },
        {
          id: 'rpt4',
          reportNumber: 'INS-2025-004',
          type: 'customer',
          item: 'Customer Return Investigation',
          itemDetails: { name: 'Customer Return Investigation' },
          process: 'Customer Complaint',
          customer: 'TechSolutions Pvt Ltd',
          vendor: '',
          inspector: 'inspector1',
          inspectorDetails: { firstName: 'John', lastName: 'Inspector' },
          inspectionDate: new Date('2025-08-05'),
          batch: 'RTN-004-2025',
          quantity: 5,
          inspectionCriteria: 'Root cause analysis\nFailure mode identification\nQuality system review\nPreventive action development',
          checkpoints: [
            { checkpoint: 'Failure Analysis', result: 'fail', notes: 'Material fatigue failure identified' },
            { checkpoint: 'Process Review', result: 'conditional', notes: 'Heat treatment process needs adjustment' },
            { checkpoint: 'Documentation', result: 'pass', notes: 'All records available for review' },
            { checkpoint: 'Corrective Action', result: 'pending', notes: 'Action plan being developed' }
          ],
          overallResult: 'failed',
          findings: 'Customer return due to premature failure caused by inadequate heat treatment. Process parameters were outside specification during production.',
          recommendations: 'Update heat treatment parameters. Retrain operators. Implement additional process monitoring.',
          correctiveActions: 'Heat treatment process updated. Operator retraining completed. Enhanced monitoring implemented.',
          notes: 'Process improvement implemented to prevent recurrence'
        }
      ];
      setInspectionReports(mockInspectionReports);

      // Mock Dashboard Stats
      const mockDashboardStats = {
        totalProcesses: mockProcesses.length,
        activeQualityChecks: mockQualityControls.filter(qc => qc.overall_status === 'pending' || qc.overall_status === 'on_hold').length,
        pendingInspections: mockInspectionReports.filter(report => report.overallResult === 'pending').length,
        qualityPassRate: (mockQualityControls.filter(qc => qc.overall_status === 'passed').length / mockQualityControls.length) * 100
      };
      setDashboardStats(mockDashboardStats);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle form submission for processes
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingProcess 
        ? `/api/processes/${editingProcess.id}`
        : '/api/processes';
      
      const method = editingProcess ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchData();
        handleCloseModal();
        alert(editingProcess ? 'Process updated successfully!' : 'Process created successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Error saving process');
      }
    } catch (error) {
      console.error('Error saving process:', error);
      alert('Error saving process');
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission for quality control
  const handleQCSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingQC 
        ? `/api/processes/quality-control/${editingQC.id}`
        : '/api/processes/quality-control';
      
      const method = editingQC ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(qcFormData)
      });

      if (response.ok) {
        await fetchData();
        handleCloseModal();
        alert(editingQC ? 'Quality control updated successfully!' : 'Quality control created successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Error saving quality control');
      }
    } catch (error) {
      console.error('Error saving quality control:', error);
      alert('Error saving quality control');
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission for inspection reports
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingReport 
        ? `/api/processes/inspection-reports/${editingReport.id}`
        : '/api/processes/inspection-reports';
      
      const method = editingReport ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(reportFormData)
      });

      if (response.ok) {
        await fetchData();
        handleCloseModal();
        alert(editingReport ? 'Inspection report updated successfully!' : 'Inspection report created successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Error saving inspection report');
      }
    } catch (error) {
      console.error('Error saving inspection report:', error);
      alert('Error saving inspection report');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete for processes
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this process?')) return;

    try {
      const response = await fetch(`/api/processes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await fetchData();
        alert('Process deleted successfully!');
      } else {
        alert('Error deleting process');
      }
    } catch (error) {
      console.error('Error deleting process:', error);
      alert('Error deleting process');
    }
  };

  // Handle delete for quality control
  const handleQCDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quality control record?')) return;

    try {
      const response = await fetch(`/api/processes/quality-control/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await fetchData();
        alert('Quality control deleted successfully!');
      } else {
        alert('Error deleting quality control');
      }
    } catch (error) {
      console.error('Error deleting quality control:', error);
      alert('Error deleting quality control');
    }
  };

  // Handle delete for inspection reports
  const handleReportDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inspection report?')) return;

    try {
      const response = await fetch(`/api/processes/inspection-reports/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await fetchData();
        alert('Inspection report deleted successfully!');
      } else {
        alert('Error deleting inspection report');
      }
    } catch (error) {
      console.error('Error deleting inspection report:', error);
      alert('Error deleting inspection report');
    }
  };

  // Handle edit for processes
  const handleEdit = (process) => {
    setEditingProcess(process);
    setFormData({
      processName: process.processName || '',
      category: process.category || '',
      description: process.description || '',
      estimatedTime: process.estimatedTime || '',
      skillLevel: process.skillLevel || '',
      department: process.department || '',
      isActive: process.isActive !== undefined ? process.isActive : true,
      instructions: process.instructions || '',
      qualityRequirements: process.qualityRequirements || '',
      safetyRequirements: process.safetyRequirements || ''
    });
    setShowModal(true);
  };

  // Handle edit for quality control
  const handleQCEdit = (qc) => {
    setEditingQC(qc);
    setQcFormData({
      type: qc.type || '',
      item: qc.item || '',
      batch: qc.batch || '',
      quantity: qc.quantity || '',
      checkCriteria: qc.checkCriteria || '',
      checkMethod: qc.checkMethod || '',
      tolerances: qc.tolerances || '',
      checkResults: qc.checkResults || '',
      defects: qc.defects || [],
      overall_status: qc.overall_status || 'pending',
      notes: qc.notes || ''
    });
    setShowModal(true);
  };

  // Handle edit for inspection reports
  const handleReportEdit = (report) => {
    setEditingReport(report);
    setReportFormData({
      type: report.type || '',
      item: report.item || '',
      process: report.process || '',
      customer: report.customer || '',
      vendor: report.vendor || '',
      inspector: report.inspector || '',
      inspectionDate: report.inspectionDate || '',
      batch: report.batch || '',
      quantity: report.quantity || '',
      inspectionCriteria: report.inspectionCriteria || '',
      checkpoints: report.checkpoints || [],
      overallResult: report.overallResult || 'pending',
      findings: report.findings || '',
      recommendations: report.recommendations || '',
      correctiveActions: report.correctiveActions || '',
      notes: report.notes || ''
    });
    setShowModal(true);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProcess(null);
    setEditingQC(null);
    setEditingReport(null);
    setFormData({
      processName: '',
      category: '',
      description: '',
      estimatedTime: '',
      skillLevel: '',
      department: '',
      isActive: true,
      instructions: '',
      qualityRequirements: '',
      safetyRequirements: ''
    });
    setQcFormData({
      type: '',
      item: '',
      batch: '',
      quantity: '',
      checkCriteria: '',
      checkMethod: '',
      tolerances: '',
      checkResults: '',
      defects: [],
      overall_status: 'pending',
      notes: ''
    });
    setReportFormData({
      type: '',
      item: '',
      process: '',
      customer: '',
      vendor: '',
      inspector: '',
      inspectionDate: '',
      batch: '',
      quantity: '',
      inspectionCriteria: '',
      checkpoints: [],
      overallResult: 'pending',
      findings: '',
      recommendations: '',
      correctiveActions: '',
      notes: ''
    });
  };

  // Filter data
  const filteredProcesses = processes.filter(process => {
    const matchesSearch = process.processName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         process.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || process.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredQualityControls = qualityControls.filter(qc => {
    const matchesSearch = qc.qcNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         qc.item?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterCategory || qc.type === filterCategory;
    return matchesSearch && matchesFilter;
  });

  const filteredInspectionReports = inspectionReports.filter(report => {
    const matchesSearch = report.reportNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.item?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterCategory || report.type === filterCategory;
    return matchesSearch && matchesFilter;
  });

  return (
      <div className="page">
      <div className="page-header">
        <div className="page-title">
          <Settings size={24} />
          <h1>Process Management</h1>
        </div>
        <p>Monitor production processes, quality control, and inspections</p>
      </div>
      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <BarChart3 size={16} />
          Dashboard
        </button>
        <button
          className={`tab ${activeTab === 'processes' ? 'active' : ''}`}
          onClick={() => setActiveTab('processes')}
        >
          <Settings size={16} />
          Processes
        </button>
        <button
          className={`tab ${activeTab === 'quality-control' ? 'active' : ''}`}
          onClick={() => setActiveTab('quality-control')}
        >
          <Activity size={16} />
          Quality Control
        </button>
        <button
          className={`tab ${activeTab === 'inspection-reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('inspection-reports')}
        >
          <Calendar size={16} />
          Inspection Reports
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="dashboard-content">
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <h3>Total Processes</h3>
                <Settings className="stat-icon" />
              </div>
              <div className="stat-value">{dashboardStats.totalProcesses || 0}</div>
              <div className="stat-change positive">All processes</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <h3>Active Quality Checks</h3>
                <Activity className="stat-icon active" />
              </div>
              <div className="stat-value">{dashboardStats.activeQualityChecks || 0}</div>
              <div className="stat-change positive">On hold checks</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <h3>Pending Inspections</h3>
                <Clock className="stat-icon inactive" />
              </div>
              <div className="stat-value">{dashboardStats.pendingInspections || 0}</div>
              <div className="stat-change neutral">Awaiting inspection</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <h3>Quality Pass Rate</h3>
                <TrendingUp className="stat-icon" />
              </div>
              <div className="stat-value">{dashboardStats.qualityPassRate?.toFixed(1) || 0}%</div>
              <div className="stat-change positive">Success rate</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-section">
            <h3>Quick Actions</h3>
            <div className="quick-actions-grid">
              <button 
                className="action-card"
                onClick={() => {
                  setActiveTab('processes');
                  setEditingProcess(null);
                  setEditingQC(null);
                  setEditingReport(null);
                  setShowModal(true);
                }}
              >
                <Plus size={24} />
                <span>New Process</span>
              </button>
              <button 
                className="action-card"
                onClick={() => {
                  setActiveTab('quality-control');
                  setEditingQC({});
                  setEditingProcess(null);
                  setEditingReport(null);
                  setShowModal(true);
                }}
              >
                <Activity size={24} />
                <span>New QC Check</span>
              </button>
              <button 
                className="action-card"
                onClick={() => {
                  setActiveTab('inspection-reports');
                  setEditingReport({});
                  setEditingProcess(null);
                  setEditingQC(null);
                  setShowModal(true);
                }}
              >
                <Calendar size={24} />
                <span>New Inspection</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quality Control Tab */}
      {activeTab === 'quality-control' && (
        <div className="processes-content">
          {/* Filters */}
          <div className="filters-section">
            <div className="search-box">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search quality controls..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filter-group">
              <Filter className="filter-icon" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="filter-select"
              >
                <option value="">All Types</option>
                {qcTypes.map(type => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingQC({});
                setEditingProcess(null);
                setEditingReport(null);
                setShowModal(true);
              }}
            >
              <Plus size={20} />
              Add Quality Control
            </button>
          </div>

          {/* Quality Control Table */}
          <div className="table-container">
            <table className="processes-table">
              <thead>
                <tr>
                  <th>QC Number</th>
                  <th>Type</th>
                  <th>Item</th>
                  <th>Batch</th>
                  <th>Status</th>
                  <th>Check Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="loading-cell">
                      Loading quality controls...
                    </td>
                  </tr>
                ) : filteredQualityControls.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-cell">
                      No quality controls found
                    </td>
                  </tr>
                ) : (
                  filteredQualityControls.map(qc => (
                    <tr key={qc.id}>
                      <td className="process-name">
                        <strong>{qc.qcNumber}</strong>
                      </td>
                      <td>
                        <span className="category-badge">
                          {qc.type?.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td>{qc.itemDetails?.name || qc.item || 'N/A'}</td>
                      <td>{qc.batch || 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${qc.overall_status === 'passed' ? 'active' : 
                          qc.overall_status === 'failed' ? 'inactive' : 'pending'}`}>
                          {qc.overall_status?.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div className="time-info">
                          <Calendar size={14} />
                          {qc.checkDate ? new Date(qc.checkDate).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon btn-edit"
                            onClick={() => handleQCEdit(qc)}
                            title="Edit Quality Control"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="btn-icon btn-delete"
                            onClick={() => handleQCDelete(qc.id)}
                            title="Delete Quality Control"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inspection Reports Tab */}
      {activeTab === 'inspection-reports' && (
        <div className="processes-content">
          {/* Filters */}
          <div className="filters-section">
            <div className="search-box">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search inspection reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filter-group">
              <Filter className="filter-icon" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="filter-select"
              >
                <option value="">All Types</option>
                {reportTypes.map(type => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingReport({});
                setEditingProcess(null);
                setEditingQC(null);
                setShowModal(true);
              }}
            >
              <Plus size={20} />
              Add Inspection Report
            </button>
          </div>

          {/* Inspection Reports Table */}
          <div className="table-container">
            <table className="processes-table">
              <thead>
                <tr>
                  <th>Report Number</th>
                  <th>Type</th>
                  <th>Item</th>
                  <th>Inspector</th>
                  <th>Result</th>
                  <th>Inspection Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="loading-cell">
                      Loading inspection reports...
                    </td>
                  </tr>
                ) : filteredInspectionReports.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-cell">
                      No inspection reports found
                    </td>
                  </tr>
                ) : (
                  filteredInspectionReports.map(report => (
                    <tr key={report.id}>
                      <td className="process-name">
                        <strong>{report.reportNumber}</strong>
                      </td>
                      <td>
                        <span className="category-badge">
                          {report.type?.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td>{report.itemDetails?.name || report.item || 'N/A'}</td>
                      <td>
                        <div className="inspector-info">
                          <User size={14} />
                          {report.inspectorDetails ? 
                            `${report.inspectorDetails.firstName} ${report.inspectorDetails.lastName}` : 
                            'N/A'}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${report.overallResult === 'passed' ? 'active' : 
                          report.overallResult === 'failed' ? 'inactive' : 'pending'}`}>
                          {report.overallResult?.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div className="time-info">
                          <Calendar size={14} />
                          {report.inspectionDate ? new Date(report.inspectionDate).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon btn-edit"
                            onClick={() => handleReportEdit(report)}
                            title="Edit Inspection Report"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="btn-icon btn-delete"
                            onClick={() => handleReportDelete(report.id)}
                            title="Delete Inspection Report"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Processes Tab */}
      {activeTab === 'processes' && (
        <div className="processes-content">
          {/* Filters */}
          <div className="filters-section">
            <div className="search-box">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search processes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filter-group">
              <Filter className="filter-icon" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="filter-select"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Processes Table */}
          <div className="table-container">
            <table className="processes-table">
              <thead>
                <tr>
                  <th>Process Name</th>
                  <th>Category</th>
                  <th>Skill Level</th>
                  <th>Est. Time</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="loading-cell">
                      Loading processes...
                    </td>
                  </tr>
                ) : filteredProcesses.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-cell">
                      No processes found
                    </td>
                  </tr>
                ) : (
                  filteredProcesses.map(process => (
                    <tr key={process.id}>
                      <td className="process-name">
                        <div className="process-info">
                          <strong>{process.processName}</strong>
                          {process.description && (
                            <small className="process-description">
                              {process.description}
                            </small>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="category-badge">
                          {process.category?.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span className={`skill-badge skill-${process.skillLevel}`}>
                          {process.skillLevel?.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div className="time-info">
                          <Clock size={14} />
                          {process.estimatedTime || 'N/A'}
                        </div>
                      </td>
                      <td>{process.department || 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${process.isActive ? 'active' : 'inactive'}`}>
                          {process.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon btn-edit"
                            onClick={() => handleEdit(process)}
                            title="Edit Process"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="btn-icon btn-delete"
                            onClick={() => handleDelete(process.id)}
                            title="Delete Process"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Add/Edit Process */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingProcess ? 'Edit Process' : 'Add New Process'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="process-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="processName">Process Name *</label>
                  <input
                    type="text"
                    id="processName"
                    value={formData.processName}
                    onChange={(e) => setFormData({...formData, processName: e.target.value})}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                    className="form-select"
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.replace('_', ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="skillLevel">Skill Level *</label>
                  <select
                    id="skillLevel"
                    value={formData.skillLevel}
                    onChange={(e) => setFormData({...formData, skillLevel: e.target.value})}
                    required
                    className="form-select"
                  >
                    <option value="">Select Skill Level</option>
                    {skillLevels.map(level => (
                      <option key={level} value={level}>
                        {level.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="estimatedTime">Estimated Time</label>
                  <input
                    type="text"
                    id="estimatedTime"
                    value={formData.estimatedTime}
                    onChange={(e) => setFormData({...formData, estimatedTime: e.target.value})}
                    placeholder="e.g., 2 hours, 30 minutes"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="department">Department</label>
                  <input
                    type="text"
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="form-checkbox"
                    />
                    Active Process
                  </label>
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  className="form-textarea"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="instructions">Instructions</label>
                <textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                  rows="4"
                  className="form-textarea"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="qualityRequirements">Quality Requirements</label>
                <textarea
                  id="qualityRequirements"
                  value={formData.qualityRequirements}
                  onChange={(e) => setFormData({...formData, qualityRequirements: e.target.value})}
                  rows="3"
                  className="form-textarea"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="safetyRequirements">Safety Requirements</label>
                <textarea
                  id="safetyRequirements"
                  value={formData.safetyRequirements}
                  onChange={(e) => setFormData({...formData, safetyRequirements: e.target.value})}
                  rows="3"
                  className="form-textarea"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? 'Saving...' : (editingProcess ? 'Update Process' : 'Create Process')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Add/Edit Quality Control */}
      {showModal && activeTab === 'quality-control' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingQC.id ? 'Edit Quality Control' : 'Add New Quality Control'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            
            <form onSubmit={handleQCSubmit} className="process-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="qcType">Type *</label>
                  <select
                    id="qcType"
                    value={qcFormData.type}
                    onChange={(e) => setQcFormData({...qcFormData, type: e.target.value})}
                    required
                    className="form-select"
                  >
                    <option value="">Select Type</option>
                    {qcTypes.map(type => (
                      <option key={type} value={type}>
                        {type.replace('_', ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="qcItem">Item *</label>
                  <input
                    type="text"
                    id="qcItem"
                    value={qcFormData.item}
                    onChange={(e) => setQcFormData({...qcFormData, item: e.target.value})}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="qcBatch">Batch Number</label>
                  <input
                    type="text"
                    id="qcBatch"
                    value={qcFormData.batch}
                    onChange={(e) => setQcFormData({...qcFormData, batch: e.target.value})}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="qcQuantity">Quantity</label>
                  <input
                    type="number"
                    id="qcQuantity"
                    value={qcFormData.quantity}
                    onChange={(e) => setQcFormData({...qcFormData, quantity: e.target.value})}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="qcMethod">Check Method</label>
                  <input
                    type="text"
                    id="qcMethod"
                    value={qcFormData.checkMethod}
                    onChange={(e) => setQcFormData({...qcFormData, checkMethod: e.target.value})}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="qcStatus">Status *</label>
                  <select
                    id="qcStatus"
                    value={qcFormData.overall_status}
                    onChange={(e) => setQcFormData({...qcFormData, overall_status: e.target.value})}
                    required
                    className="form-select"
                  >
                    {qcStatuses.map(status => (
                      <option key={status} value={status}>
                        {status.replace('_', ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="qcCriteria">Check Criteria</label>
                <textarea
                  id="qcCriteria"
                  value={qcFormData.checkCriteria}
                  onChange={(e) => setQcFormData({...qcFormData, checkCriteria: e.target.value})}
                  rows="3"
                  className="form-textarea"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="qcResults">Check Results</label>
                <textarea
                  id="qcResults"
                  value={qcFormData.checkResults}
                  onChange={(e) => setQcFormData({...qcFormData, checkResults: e.target.value})}
                  rows="3"
                  className="form-textarea"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="qcNotes">Notes</label>
                <textarea
                  id="qcNotes"
                  value={qcFormData.notes}
                  onChange={(e) => setQcFormData({...qcFormData, notes: e.target.value})}
                  rows="3"
                  className="form-textarea"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? 'Saving...' : (editingQC.id ? 'Update Quality Control' : 'Create Quality Control')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Add/Edit Inspection Report */}
      {showModal && activeTab === 'inspection-reports' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingReport.id ? 'Edit Inspection Report' : 'Add New Inspection Report'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            
            <form onSubmit={handleReportSubmit} className="process-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="reportType">Type *</label>
                  <select
                    id="reportType"
                    value={reportFormData.type}
                    onChange={(e) => setReportFormData({...reportFormData, type: e.target.value})}
                    required
                    className="form-select"
                  >
                    <option value="">Select Type</option>
                    {reportTypes.map(type => (
                      <option key={type} value={type}>
                        {type.replace('_', ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="reportItem">Item *</label>
                  <input
                    type="text"
                    id="reportItem"
                    value={reportFormData.item}
                    onChange={(e) => setReportFormData({...reportFormData, item: e.target.value})}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="reportInspector">Inspector</label>
                  <input
                    type="text"
                    id="reportInspector"
                    value={reportFormData.inspector}
                    onChange={(e) => setReportFormData({...reportFormData, inspector: e.target.value})}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="reportDate">Inspection Date</label>
                  <input
                    type="date"
                    id="reportDate"
                    value={reportFormData.inspectionDate}
                    onChange={(e) => setReportFormData({...reportFormData, inspectionDate: e.target.value})}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="reportBatch">Batch Number</label>
                  <input
                    type="text"
                    id="reportBatch"
                    value={reportFormData.batch}
                    onChange={(e) => setReportFormData({...reportFormData, batch: e.target.value})}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="reportResult">Overall Result *</label>
                  <select
                    id="reportResult"
                    value={reportFormData.overallResult}
                    onChange={(e) => setReportFormData({...reportFormData, overallResult: e.target.value})}
                    required
                    className="form-select"
                  >
                    {reportResults.map(result => (
                      <option key={result} value={result}>
                        {result.replace('_', ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="reportCriteria">Inspection Criteria</label>
                <textarea
                  id="reportCriteria"
                  value={reportFormData.inspectionCriteria}
                  onChange={(e) => setReportFormData({...reportFormData, inspectionCriteria: e.target.value})}
                  rows="3"
                  className="form-textarea"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="reportFindings">Findings</label>
                <textarea
                  id="reportFindings"
                  value={reportFormData.findings}
                  onChange={(e) => setReportFormData({...reportFormData, findings: e.target.value})}
                  rows="4"
                  className="form-textarea"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="reportRecommendations">Recommendations</label>
                <textarea
                  id="reportRecommendations"
                  value={reportFormData.recommendations}
                  onChange={(e) => setReportFormData({...reportFormData, recommendations: e.target.value})}
                  rows="3"
                  className="form-textarea"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? 'Saving...' : (editingReport.id ? 'Update Report' : 'Create Report')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Add/Edit Process */}
      {showModal && (activeTab === 'processes' || activeTab === 'dashboard') && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingProcess ? 'Edit Process' : 'Add New Process'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="process-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="processName">Process Name *</label>
                  <input
                    type="text"
                    id="processName"
                    value={formData.processName}
                    onChange={(e) => setFormData({...formData, processName: e.target.value})}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                    className="form-select"
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.replace('_', ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="skillLevel">Skill Level *</label>
                  <select
                    id="skillLevel"
                    value={formData.skillLevel}
                    onChange={(e) => setFormData({...formData, skillLevel: e.target.value})}
                    required
                    className="form-select"
                  >
                    <option value="">Select Skill Level</option>
                    {skillLevels.map(level => (
                      <option key={level} value={level}>
                        {level.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="estimatedTime">Estimated Time</label>
                  <input
                    type="text"
                    id="estimatedTime"
                    value={formData.estimatedTime}
                    onChange={(e) => setFormData({...formData, estimatedTime: e.target.value})}
                    placeholder="e.g., 2 hours, 30 minutes"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="department">Department</label>
                  <input
                    type="text"
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="form-checkbox"
                    />
                    Active Process
                  </label>
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  className="form-textarea"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="instructions">Instructions</label>
                <textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                  rows="4"
                  className="form-textarea"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? 'Saving...' : (editingProcess ? 'Update Process' : 'Create Process')}
                </button>
              </div>
            </form>
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

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: 500;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
        }

        .btn-primary:hover {
          background: #2563eb;
        }

        .btn-secondary {
          background: #e2e8f0;
          color: #475569;
        }

        .btn-secondary:hover {
          background: #cbd5e1;
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

        .dashboard-content, .processes-content {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .stat-header h3 {
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
          margin: 0;
        }

        .stat-icon {
          color: #94a3b8;
        }

        .stat-icon.active {
          color: #10b981;
        }

        .stat-icon.inactive {
          color: #f59e0b;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 4px;
        }

        .stat-change {
          font-size: 12px;
          font-weight: 500;
        }

        .stat-change.positive {
          color: #10b981;
        }

        .stat-change.neutral {
          color: #64748b;
        }

        .dashboard-section h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 16px;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }

        .category-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
          text-align: center;
        }

        .category-name {
          font-weight: 500;
          color: #475569;
          margin-bottom: 8px;
        }

        .category-count {
          font-size: 24px;
          font-weight: 700;
          color: #3b82f6;
        }

        .filters-section {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 300px;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .search-input {
          width: 100%;
          padding: 12px 12px 12px 40px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filter-icon {
          color: #94a3b8;
        }

        .filter-select {
          padding: 12px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          background: white;
        }

        .table-container {
          overflow-x: auto;
        }

        .processes-table {
          width: 100%;
          border-collapse: collapse;
        }

        .processes-table th {
          background: #f8fafc;
          padding: 12px 16px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 1px solid #e5e7eb;
        }

        .processes-table td {
          padding: 16px;
          border-bottom: 1px solid #f3f4f6;
          vertical-align: middle;
        }

        .process-info strong {
          color: #1e293b;
          display: block;
          margin-bottom: 4px;
        }

        .process-description {
          color: #64748b;
          font-size: 12px;
        }

        .category-badge, .skill-badge, .status-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .category-badge {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .skill-badge {
          background: #ecfdf5;
          color: #065f46;
        }

        .skill-badge.skill-expert {
          background: #fef3c7;
          color: #92400e;
        }

        .time-info {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #64748b;
          font-size: 14px;
        }

        .status-badge.active {
          background: #dcfce7;
          color: #166534;
        }

        .status-badge.inactive {
          background: #fee2e2;
          color: #991b1b;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .btn-icon {
          padding: 8px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-edit {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .btn-edit:hover {
          background: #bfdbfe;
        }

        .btn-delete {
          background: #fee2e2;
          color: #dc2626;
        }

        .btn-delete:hover {
          background: #fecaca;
        }

        .loading-cell, .empty-cell {
          text-align: center;
          padding: 40px;
          color: #64748b;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 24px 0;
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 24px;
        }

        .modal-header h2 {
          font-size: 20px;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          color: #94a3b8;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }

        .modal-close:hover {
          background: #f1f5f9;
          color: #64748b;
        }

        .process-form {
          padding: 0 24px 24px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          font-weight: 500;
          color: #374151;
          margin-bottom: 6px;
          font-size: 14px;
        }

        .form-input, .form-select, .form-textarea {
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .form-input:focus, .form-select:focus, .form-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          margin-top: 8px;
        }

        .form-checkbox {
          width: 16px;
          height: 16px;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-top: 16px;
        }

        .action-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 24px;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          color: #64748b;
          font-weight: 500;
        }

        .action-card:hover {
          border-color: #3b82f6;
          color: #3b82f6;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
        }

        .inspector-info {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #64748b;
          font-size: 14px;
        }

        .status-badge.pending {
          background: #fef3c7;
          color: #92400e;
        }

        @media (max-width: 768px) {
          .processes-page {
            padding: 16px;
          }

          .header-content {
            flex-direction: column;
            gap: 16px;
          }

          .filters-section {
            flex-direction: column;
          }

          .search-box {
            min-width: auto;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Processes;
