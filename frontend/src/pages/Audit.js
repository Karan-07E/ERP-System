import React, { useState, useEffect } from 'react';
import { 
  FileCheck, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  FileText,
  ClipboardList,
  Settings
} from 'lucide-react';

const Audit = () => {
  const [activeTab, setActiveTab] = useState('reports');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  // Audit Reports State
  const [auditReports, setAuditReports] = useState([]);
  const [editingReport, setEditingReport] = useState(null);
  const [reportFormData, setReportFormData] = useState({
    auditType: '',
    isoStandard: '',
    auditScope: '',
    auditCriteria: '',
    auditDate: { start: '', end: '' },
    auditor: { name: '', email: '', certification: '' },
    leadAuditor: { name: '', email: '', certification: '' },
    departments: [],
    findings: [],
    overallAssessment: { 
      score: 0, 
      recommendation: '', 
      improvementAreas: [],
      strengths: []
    },
    followUpActions: [],
    nextAuditDate: ''
  });

  // Standard Forms State
  const [standardForms, setStandardForms] = useState([]);
  const [editingForm, setEditingForm] = useState(null);
  const [formData, setFormData] = useState({
    formName: '',
    formCode: '',
    isoStandard: '',
    version: '1.0',
    description: '',
    sections: [],
    isActive: true
  });

  // Form Responses State (Non-Conformances)
  const [formResponses, setFormResponses] = useState([]);
  const [editingResponse, setEditingResponse] = useState(null);
  const [responseFormData, setResponseFormData] = useState({
    form: '',
    department: '',
    responses: [],
    status: 'draft'
  });

  // Dropdown options
  const auditTypes = ['internal', 'external', 'customer', 'certification_body'];
  const isoStandards = ['ISO_9001', 'ISO_14001', 'ISO_45001', 'ISO_13485', 'ISO_27001', 'ISO_22000', 'IATF_16949', 'AS_9100', 'other'];
  const reportStatuses = ['draft', 'in_progress', 'completed', 'approved', 'closed'];
  const findingTypes = ['observation', 'minor_nc', 'major_nc', 'opportunity'];
  const responseStatuses = ['draft', 'submitted', 'reviewed', 'approved'];

  // Load data on component mount and tab change
  useEffect(() => {
    if (activeTab === 'reports') {
      fetchAuditReports();
    } else if (activeTab === 'forms') {
      fetchStandardForms();
    } else if (activeTab === 'ncr') {
      fetchFormResponses();
    }
  }, [activeTab]);

  // API calls
  const fetchAuditReports = async () => {
    setLoading(true);
    try {
      // Sample audit reports data
      const mockAuditReports = [
        {
          id: 'audit1',
          auditNumber: 'IA-2025-001',
          auditType: 'internal',
          isoStandard: 'ISO_9001',
          auditScope: 'Production and Quality Management System',
          auditCriteria: 'ISO 9001:2015 clauses 4-10, Company Quality Manual QM-001',
          auditDate: { start: '2025-07-15', end: '2025-07-18' },
          auditor: { 
            name: 'Sarah Johnson', 
            email: 'sarah.johnson@company.com', 
            certification: 'Lead Auditor ISO 9001' 
          },
          leadAuditor: { 
            name: 'Michael Davis', 
            email: 'michael.davis@company.com', 
            certification: 'Certified Quality Manager' 
          },
          departments: ['Production', 'Quality Assurance', 'Maintenance'],
          findings: [
            {
              id: 'f1',
              type: 'minor_nc',
              clause: '8.5.1',
              description: 'Production control records not consistently maintained for all shifts',
              evidence: 'Missing production logs for night shift on 3 occasions in July',
              rootCause: 'Inadequate training for night shift supervisors',
              corrective_action: 'Implement mandatory training for all shift supervisors',
              responsible: 'Production Manager',
              due_date: '2025-08-30',
              status: 'open'
            },
            {
              id: 'f2',
              type: 'observation',
              clause: '7.1.5',
              description: 'Calibration records storage could be improved',
              evidence: 'Physical calibration certificates stored in unsecured location',
              rootCause: 'No dedicated secure storage facility',
              corrective_action: 'Install locked filing cabinet for calibration records',
              responsible: 'Quality Manager',
              due_date: '2025-08-15',
              status: 'in_progress'
            },
            {
              id: 'f3',
              type: 'opportunity',
              clause: '10.2',
              description: 'Opportunity to enhance non-conformity tracking system',
              evidence: 'Current system lacks trend analysis capabilities',
              rootCause: 'Manual tracking system limitations',
              corrective_action: 'Implement digital NCR tracking system',
              responsible: 'IT Manager',
              due_date: '2025-09-30',
              status: 'planned'
            }
          ],
          overallAssessment: { 
            score: 85, 
            recommendation: 'QMS is generally effective with minor improvements needed', 
            improvementAreas: [
              'Production record consistency',
              'Document storage security',
              'Digital tracking implementation'
            ],
            strengths: [
              'Strong management commitment',
              'Effective corrective action process',
              'Good customer satisfaction levels'
            ]
          },
          followUpActions: [
            {
              action: 'Schedule follow-up audit for critical findings',
              responsible: 'Lead Auditor',
              due_date: '2025-09-01'
            },
            {
              action: 'Management review of audit findings',
              responsible: 'Quality Manager',
              due_date: '2025-08-01'
            }
          ],
          nextAuditDate: '2026-07-15',
          status: 'completed',
          createdAt: new Date('2025-07-20')
        },
        {
          id: 'audit2',
          auditNumber: 'EA-2025-002',
          auditType: 'external',
          isoStandard: 'ISO_14001',
          auditScope: 'Environmental Management System - All Operations',
          auditCriteria: 'ISO 14001:2015, Environmental policy ENV-001, Legal requirements',
          auditDate: { start: '2025-06-10', end: '2025-06-12' },
          auditor: { 
            name: 'Environmental Auditors Ltd', 
            email: 'audit@envauditors.com', 
            certification: 'IRCA Certified Environmental Auditor' 
          },
          leadAuditor: { 
            name: 'Dr. Emma Green', 
            email: 'emma.green@envauditors.com', 
            certification: 'Lead Environmental Auditor' 
          },
          departments: ['Production', 'Maintenance', 'Waste Management'],
          findings: [
            {
              id: 'f4',
              type: 'major_nc',
              clause: '8.1',
              description: 'Waste segregation not properly implemented in production area',
              evidence: 'Hazardous and non-hazardous waste mixed in 3 collection points',
              rootCause: 'Insufficient training and unclear labeling',
              corrective_action: 'Retrain all staff and improve waste labeling system',
              responsible: 'Environmental Manager',
              due_date: '2025-07-31',
              status: 'in_progress'
            },
            {
              id: 'f5',
              type: 'minor_nc',
              clause: '9.1.1',
              description: 'Environmental monitoring data analysis incomplete',
              evidence: 'Air quality monitoring results not analyzed for trends',
              rootCause: 'Lack of systematic review process',
              corrective_action: 'Establish monthly environmental data review meetings',
              responsible: 'Environmental Officer',
              due_date: '2025-08-15',
              status: 'open'
            }
          ],
          overallAssessment: { 
            score: 75, 
            recommendation: 'EMS requires significant improvements in waste management', 
            improvementAreas: [
              'Waste segregation procedures',
              'Environmental monitoring analysis',
              'Staff training effectiveness'
            ],
            strengths: [
              'Good environmental policy framework',
              'Effective emergency response procedures',
              'Strong management support'
            ]
          },
          followUpActions: [
            {
              action: 'Surveillance audit for major NC closure verification',
              responsible: 'External Auditor',
              due_date: '2025-08-30'
            }
          ],
          nextAuditDate: '2026-06-10',
          status: 'approved',
          createdAt: new Date('2025-06-15')
        },
        {
          id: 'audit3',
          auditNumber: 'CA-2025-003',
          auditType: 'customer',
          isoStandard: 'IATF_16949',
          auditScope: 'Automotive Quality Management System - Supplier Assessment',
          auditCriteria: 'IATF 16949:2016, Customer specific requirements CSR-2024',
          auditDate: { start: '2025-08-01', end: '2025-08-02' },
          auditor: { 
            name: 'AutoCorp Quality Team', 
            email: 'quality@autocorp.com', 
            certification: 'IATF 16949 Auditor' 
          },
          leadAuditor: { 
            name: 'James Wilson', 
            email: 'james.wilson@autocorp.com', 
            certification: 'Senior Automotive Auditor' 
          },
          departments: ['Production', 'Quality Control', 'Engineering'],
          findings: [
            {
              id: 'f6',
              type: 'observation',
              clause: '8.3.5',
              description: 'Design verification documentation could be enhanced',
              evidence: 'Some design verification tests lack detailed acceptance criteria',
              rootCause: 'Template does not include all required elements',
              corrective_action: 'Update design verification template and procedures',
              responsible: 'Engineering Manager',
              due_date: '2025-09-01',
              status: 'planned'
            }
          ],
          overallAssessment: { 
            score: 92, 
            recommendation: 'Excellent QMS performance, approved supplier status maintained', 
            improvementAreas: [
              'Design verification documentation completeness'
            ],
            strengths: [
              'Excellent process control',
              'Strong problem-solving culture',
              'Effective supplier management',
              'Outstanding quality performance'
            ]
          },
          followUpActions: [
            {
              action: 'Quarterly business review meeting',
              responsible: 'Customer Quality Manager',
              due_date: '2025-11-01'
            }
          ],
          nextAuditDate: '2026-08-01',
          status: 'approved',
          createdAt: new Date('2025-08-03')
        }
      ];
      
      setAuditReports(mockAuditReports);
    } catch (error) {
      console.error('Error fetching audit reports:', error);
    }
    setLoading(false);
  };

  const fetchStandardForms = async () => {
    setLoading(true);
    try {
      // Sample standard forms data
      const mockStandardForms = [
        {
          id: 'form1',
          formName: 'ISO 9001 Internal Audit Checklist',
          formCode: 'QF-001',
          isoStandard: 'ISO_9001',
          version: '3.1',
          description: 'Comprehensive checklist for ISO 9001:2015 internal audits covering all clauses',
          sections: [
            {
              id: 's1',
              sectionName: 'Context of the Organization (Clause 4)',
              questions: [
                {
                  id: 'q1',
                  question: 'Has the organization determined external and internal issues relevant to its purpose?',
                  clause: '4.1',
                  requiresEvidence: true,
                  criticalQuestion: true
                },
                {
                  id: 'q2',
                  question: 'Are interested parties and their requirements documented and monitored?',
                  clause: '4.2',
                  requiresEvidence: true,
                  criticalQuestion: false
                },
                {
                  id: 'q3',
                  question: 'Is the scope of the QMS documented and maintained?',
                  clause: '4.3',
                  requiresEvidence: true,
                  criticalQuestion: true
                }
              ]
            },
            {
              id: 's2',
              sectionName: 'Leadership (Clause 5)',
              questions: [
                {
                  id: 'q4',
                  question: 'Does top management demonstrate leadership and commitment to the QMS?',
                  clause: '5.1.1',
                  requiresEvidence: true,
                  criticalQuestion: true
                },
                {
                  id: 'q5',
                  question: 'Is the quality policy appropriate and communicated within the organization?',
                  clause: '5.2.1',
                  requiresEvidence: true,
                  criticalQuestion: true
                }
              ]
            },
            {
              id: 's3',
              sectionName: 'Planning (Clause 6)',
              questions: [
                {
                  id: 'q6',
                  question: 'Has the organization planned actions to address risks and opportunities?',
                  clause: '6.1.1',
                  requiresEvidence: true,
                  criticalQuestion: true
                },
                {
                  id: 'q7',
                  question: 'Are quality objectives established and plans to achieve them documented?',
                  clause: '6.2.1',
                  requiresEvidence: true,
                  criticalQuestion: false
                }
              ]
            }
          ],
          isActive: true,
          createdAt: new Date('2025-01-15'),
          updatedAt: new Date('2025-07-01')
        },
        {
          id: 'form2',
          formName: 'Environmental Compliance Audit Form',
          formCode: 'EF-002',
          isoStandard: 'ISO_14001',
          version: '2.0',
          description: 'Environmental management system audit form focusing on compliance and performance',
          sections: [
            {
              id: 's4',
              sectionName: 'Environmental Policy and Planning (Clause 5 & 6)',
              questions: [
                {
                  id: 'q8',
                  question: 'Is the environmental policy appropriate to the nature and scale of environmental impacts?',
                  clause: '5.2',
                  requiresEvidence: true,
                  criticalQuestion: true
                },
                {
                  id: 'q9',
                  question: 'Are environmental aspects and impacts identified and evaluated?',
                  clause: '6.1.2',
                  requiresEvidence: true,
                  criticalQuestion: true
                },
                {
                  id: 'q10',
                  question: 'Are applicable legal requirements identified and compliance ensured?',
                  clause: '6.1.3',
                  requiresEvidence: true,
                  criticalQuestion: true
                }
              ]
            },
            {
              id: 's5',
              sectionName: 'Operational Planning and Control (Clause 8)',
              questions: [
                {
                  id: 'q11',
                  question: 'Are operational controls established for significant environmental aspects?',
                  clause: '8.1',
                  requiresEvidence: true,
                  criticalQuestion: true
                },
                {
                  id: 'q12',
                  question: 'Is there a documented procedure for emergency preparedness and response?',
                  clause: '8.2',
                  requiresEvidence: true,
                  criticalQuestion: false
                }
              ]
            }
          ],
          isActive: true,
          createdAt: new Date('2025-02-01'),
          updatedAt: new Date('2025-06-15')
        },
        {
          id: 'form3',
          formName: 'Occupational Health & Safety Audit Checklist',
          formCode: 'SF-003',
          isoStandard: 'ISO_45001',
          version: '1.5',
          description: 'Comprehensive OH&S management system audit focusing on worker safety and health',
          sections: [
            {
              id: 's6',
              sectionName: 'Worker Participation and Consultation (Clause 5.4)',
              questions: [
                {
                  id: 'q13',
                  question: 'Are workers consulted in the development of OH&S policy?',
                  clause: '5.4.1',
                  requiresEvidence: true,
                  criticalQuestion: true
                },
                {
                  id: 'q14',
                  question: 'Do workers participate in hazard identification and risk assessment?',
                  clause: '5.4.2',
                  requiresEvidence: true,
                  criticalQuestion: true
                }
              ]
            },
            {
              id: 's7',
              sectionName: 'Hazard Identification and Risk Assessment (Clause 6.1.2)',
              questions: [
                {
                  id: 'q15',
                  question: 'Is there a systematic process for hazard identification?',
                  clause: '6.1.2.1',
                  requiresEvidence: true,
                  criticalQuestion: true
                },
                {
                  id: 'q16',
                  question: 'Are OH&S risks evaluated and controls implemented?',
                  clause: '6.1.2.3',
                  requiresEvidence: true,
                  criticalQuestion: true
                }
              ]
            }
          ],
          isActive: true,
          createdAt: new Date('2025-03-10'),
          updatedAt: new Date('2025-07-20')
        },
        {
          id: 'form4',
          formName: 'Supplier Quality Audit Form',
          formCode: 'QF-004',
          isoStandard: 'IATF_16949',
          version: '4.2',
          description: 'Automotive supplier quality assessment based on IATF 16949 requirements',
          sections: [
            {
              id: 's8',
              sectionName: 'Product Safety (Clause 8.4.2.3)',
              questions: [
                {
                  id: 'q17',
                  question: 'Are products with safety characteristics identified and controlled?',
                  clause: '8.4.2.3.1',
                  requiresEvidence: true,
                  criticalQuestion: true
                },
                {
                  id: 'q18',
                  question: 'Is there documented approval for products with safety characteristics?',
                  clause: '8.4.2.3.2',
                  requiresEvidence: true,
                  criticalQuestion: true
                }
              ]
            },
            {
              id: 's9',
              sectionName: 'Control of Externally Provided Processes (Clause 8.4)',
              questions: [
                {
                  id: 'q19',
                  question: 'Are supplier development activities planned and implemented?',
                  clause: '8.4.2.2',
                  requiresEvidence: true,
                  criticalQuestion: false
                },
                {
                  id: 'q20',
                  question: 'Is supplier performance monitored and evaluated?',
                  clause: '8.4.2.4',
                  requiresEvidence: true,
                  criticalQuestion: true
                }
              ]
            }
          ],
          isActive: true,
          createdAt: new Date('2025-04-05'),
          updatedAt: new Date('2025-07-10')
        }
      ];
      
      setStandardForms(mockStandardForms);
    } catch (error) {
      console.error('Error fetching standard forms:', error);
    }
    setLoading(false);
  };

  const fetchFormResponses = async () => {
    setLoading(true);
    try {
      // Sample form responses (Non-Conformances) data
      const mockFormResponses = [
        {
          id: 'response1',
          form: {
            id: 'form1',
            formName: 'ISO 9001 Internal Audit Checklist',
            formCode: 'QF-001'
          },
          auditDate: new Date('2025-07-16'),
          auditor: 'Sarah Johnson',
          department: 'Production',
          area: 'Manufacturing Floor A',
          shift: 'Day Shift',
          responses: [
            {
              questionId: 'q1',
              question: 'Has the organization determined external and internal issues relevant to its purpose?',
              clause: '4.1',
              response: 'yes',
              evidence: 'SWOT analysis document QD-001 reviewed, updated quarterly',
              conformity: 'conforming',
              notes: 'Comprehensive analysis includes market trends, regulatory changes, and internal capabilities'
            },
            {
              questionId: 'q2',
              question: 'Are interested parties and their requirements documented and monitored?',
              clause: '4.2',
              response: 'partial',
              evidence: 'Stakeholder register available but not all requirements monitored',
              conformity: 'minor_nc',
              notes: 'Customer requirements tracked but supplier and regulatory requirements need improvement',
              corrective_action: 'Enhance stakeholder monitoring process by Q3 2025',
              responsible_person: 'Quality Manager'
            },
            {
              questionId: 'q3',
              question: 'Is the scope of the QMS documented and maintained?',
              clause: '4.3',
              response: 'yes',
              evidence: 'QMS scope document QM-002, version 3.1',
              conformity: 'conforming',
              notes: 'Scope clearly defined and regularly reviewed during management review'
            },
            {
              questionId: 'q4',
              question: 'Does top management demonstrate leadership and commitment to the QMS?',
              clause: '5.1.1',
              response: 'yes',
              evidence: 'Management review minutes, quality policy communication records',
              conformity: 'conforming',
              notes: 'Strong leadership commitment evidenced through resource allocation and policy enforcement'
            }
          ],
          overallConformity: 'minor_nc',
          totalQuestions: 15,
          conformingQuestions: 12,
          nonConformingQuestions: 3,
          summary: 'Good overall compliance with minor improvements needed in stakeholder monitoring',
          status: 'completed',
          createdAt: new Date('2025-07-16'),
          reviewedBy: 'Michael Davis',
          reviewDate: new Date('2025-07-18')
        },
        {
          id: 'response2',
          form: {
            id: 'form2',
            formName: 'Environmental Compliance Audit Form',
            formCode: 'EF-002'
          },
          auditDate: new Date('2025-06-11'),
          auditor: 'Dr. Emma Green',
          department: 'Maintenance',
          area: 'Waste Storage Area',
          shift: 'All Shifts',
          responses: [
            {
              questionId: 'q8',
              question: 'Is the environmental policy appropriate to the nature and scale of environmental impacts?',
              clause: '5.2',
              response: 'yes',
              evidence: 'Environmental policy ENV-001, version 2.0',
              conformity: 'conforming',
              notes: 'Policy addresses all significant environmental aspects identified'
            },
            {
              questionId: 'q9',
              question: 'Are environmental aspects and impacts identified and evaluated?',
              clause: '6.1.2',
              response: 'yes',
              evidence: 'Environmental aspects register EA-001, last updated May 2025',
              conformity: 'conforming',
              notes: 'Comprehensive identification covering all processes and activities'
            },
            {
              questionId: 'q11',
              question: 'Are operational controls established for significant environmental aspects?',
              clause: '8.1',
              response: 'no',
              evidence: 'Waste segregation procedures not implemented in practice',
              conformity: 'major_nc',
              notes: 'Hazardous and non-hazardous waste found mixed at collection points',
              corrective_action: 'Implement comprehensive waste segregation training and improve labeling',
              responsible_person: 'Environmental Manager',
              due_date: '2025-07-31'
            },
            {
              questionId: 'q12',
              question: 'Is there a documented procedure for emergency preparedness and response?',
              clause: '8.2',
              response: 'yes',
              evidence: 'Emergency response plan ERP-001, tested annually',
              conformity: 'conforming',
              notes: 'Comprehensive emergency procedures with regular testing and training'
            }
          ],
          overallConformity: 'major_nc',
          totalQuestions: 8,
          conformingQuestions: 6,
          nonConformingQuestions: 2,
          summary: 'Major non-conformance identified in waste management operational controls',
          status: 'approved',
          createdAt: new Date('2025-06-11'),
          reviewedBy: 'Environmental Manager',
          reviewDate: new Date('2025-06-13')
        },
        {
          id: 'response3',
          form: {
            id: 'form3',
            formName: 'Occupational Health & Safety Audit Checklist',
            formCode: 'SF-003'
          },
          auditDate: new Date('2025-07-25'),
          auditor: 'Safety Consultant Team',
          department: 'Production',
          area: 'Assembly Line B',
          shift: 'Night Shift',
          responses: [
            {
              questionId: 'q13',
              question: 'Are workers consulted in the development of OH&S policy?',
              clause: '5.4.1',
              response: 'yes',
              evidence: 'Safety committee meeting minutes, worker consultation records',
              conformity: 'conforming',
              notes: 'Active worker participation in policy development through safety committee'
            },
            {
              questionId: 'q14',
              question: 'Do workers participate in hazard identification and risk assessment?',
              clause: '5.4.2',
              response: 'partial',
              evidence: 'Some workers participate but not systematic across all areas',
              conformity: 'minor_nc',
              notes: 'Need to expand worker participation in hazard identification to all departments',
              corrective_action: 'Establish department-specific hazard identification teams',
              responsible_person: 'Safety Manager'
            },
            {
              questionId: 'q15',
              question: 'Is there a systematic process for hazard identification?',
              clause: '6.1.2.1',
              response: 'yes',
              evidence: 'Hazard identification procedure HI-001, hazard register HR-001',
              conformity: 'conforming',
              notes: 'Systematic process in place with regular reviews and updates'
            },
            {
              questionId: 'q16',
              question: 'Are OH&S risks evaluated and controls implemented?',
              clause: '6.1.2.3',
              response: 'yes',
              evidence: 'Risk assessment matrix RA-001, control implementation records',
              conformity: 'conforming',
              notes: 'Comprehensive risk evaluation with appropriate control measures'
            }
          ],
          overallConformity: 'minor_nc',
          totalQuestions: 12,
          conformingQuestions: 10,
          nonConformingQuestions: 2,
          summary: 'Good OH&S system with minor improvement needed in worker participation',
          status: 'submitted',
          createdAt: new Date('2025-07-25'),
          reviewedBy: null,
          reviewDate: null
        },
        {
          id: 'response4',
          form: {
            id: 'form4',
            formName: 'Supplier Quality Audit Form',
            formCode: 'QF-004'
          },
          auditDate: new Date('2025-08-01'),
          auditor: 'James Wilson',
          department: 'Quality Control',
          area: 'Incoming Inspection',
          shift: 'Day Shift',
          responses: [
            {
              questionId: 'q17',
              question: 'Are products with safety characteristics identified and controlled?',
              clause: '8.4.2.3.1',
              response: 'yes',
              evidence: 'Safety characteristic matrix SC-001, control plan CP-001',
              conformity: 'conforming',
              notes: 'All safety-critical components properly identified and controlled'
            },
            {
              questionId: 'q18',
              question: 'Is there documented approval for products with safety characteristics?',
              clause: '8.4.2.3.2',
              response: 'yes',
              evidence: 'Customer approval certificates, PPAP documentation',
              conformity: 'conforming',
              notes: 'Complete approval documentation maintained for all safety products'
            },
            {
              questionId: 'q19',
              question: 'Are supplier development activities planned and implemented?',
              clause: '8.4.2.2',
              response: 'yes',
              evidence: 'Supplier development plan SD-001, training records',
              conformity: 'conforming',
              notes: 'Comprehensive supplier development program with regular assessments'
            },
            {
              questionId: 'q20',
              question: 'Is supplier performance monitored and evaluated?',
              clause: '8.4.2.4',
              response: 'yes',
              evidence: 'Supplier scorecard system, monthly performance reports',
              conformity: 'conforming',
              notes: 'Excellent supplier performance monitoring with trend analysis'
            }
          ],
          overallConformity: 'conforming',
          totalQuestions: 18,
          conformingQuestions: 18,
          nonConformingQuestions: 0,
          summary: 'Excellent supplier quality management system - no non-conformances identified',
          status: 'approved',
          createdAt: new Date('2025-08-01'),
          reviewedBy: 'James Wilson',
          reviewDate: new Date('2025-08-02')
        },
        {
          id: 'response5',
          form: {
            id: 'form1',
            formName: 'ISO 9001 Internal Audit Checklist',
            formCode: 'QF-001'
          },
          auditDate: new Date('2025-07-30'),
          auditor: 'Michael Davis',
          department: 'Quality Assurance',
          area: 'Quality Laboratory',
          shift: 'Day Shift',
          responses: [
            {
              questionId: 'q6',
              question: 'Has the organization planned actions to address risks and opportunities?',
              clause: '6.1.1',
              response: 'partial',
              evidence: 'Risk register exists but some identified risks lack action plans',
              conformity: 'minor_nc',
              notes: 'Risk identification good but action planning needs improvement',
              corrective_action: 'Develop action plans for all identified risks by August 2025',
              responsible_person: 'Risk Manager'
            },
            {
              questionId: 'q7',
              question: 'Are quality objectives established and plans to achieve them documented?',
              clause: '6.2.1',
              response: 'yes',
              evidence: 'Quality objectives QO-2025, implementation plans QP-001',
              conformity: 'conforming',
              notes: 'Clear objectives with measurable targets and action plans'
            }
          ],
          overallConformity: 'minor_nc',
          totalQuestions: 15,
          conformingQuestions: 13,
          nonConformingQuestions: 2,
          summary: 'Minor improvements needed in risk management action planning',
          status: 'draft',
          createdAt: new Date('2025-07-30'),
          reviewedBy: null,
          reviewDate: null
        }
      ];
      
      setFormResponses(mockFormResponses);
    } catch (error) {
      console.error('Error fetching form responses:', error);
    }
    setLoading(false);
  };

  // Form submission handlers
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = editingReport ? 'PUT' : 'POST';
      const url = editingReport ? `/api/audit/reports/${editingReport.id}` : '/api/audit/reports';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(reportFormData)
      });

      if (response.ok) {
        await fetchAuditReports();
        handleCloseModal();
        alert(editingReport ? 'Audit report updated successfully!' : 'Audit report created successfully!');
      }
    } catch (error) {
      console.error('Error saving audit report:', error);
      alert('Error saving audit report');
    }
    setLoading(false);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = editingForm ? 'PUT' : 'POST';
      const url = editingForm ? `/api/audit/forms/${editingForm.id}` : '/api/audit/forms';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchStandardForms();
        handleCloseModal();
        alert(editingForm ? 'Standard form updated successfully!' : 'Standard form created successfully!');
      }
    } catch (error) {
      console.error('Error saving standard form:', error);
      alert('Error saving standard form');
    }
    setLoading(false);
  };

  const handleResponseSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = editingResponse ? 'PUT' : 'POST';
      const url = editingResponse ? `/api/audit/responses/${editingResponse.id}` : '/api/audit/responses';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(responseFormData)
      });

      if (response.ok) {
        await fetchFormResponses();
        handleCloseModal();
        alert(editingResponse ? 'Form response updated successfully!' : 'Form response created successfully!');
      }
    } catch (error) {
      console.error('Error saving form response:', error);
      alert('Error saving form response');
    }
    setLoading(false);
  };

  // Delete handlers
  const handleDeleteReport = async (id) => {
    if (window.confirm('Are you sure you want to delete this audit report?')) {
      try {
        const response = await fetch(`/api/audit/reports/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          await fetchAuditReports();
          alert('Audit report deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting audit report:', error);
        alert('Error deleting audit report');
      }
    }
  };

  const handleDeleteForm = async (id) => {
    if (window.confirm('Are you sure you want to delete this standard form?')) {
      try {
        const response = await fetch(`/api/audit/forms/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          await fetchStandardForms();
          alert('Standard form deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting standard form:', error);
        alert('Error deleting standard form');
      }
    }
  };

  const handleDeleteResponse = async (id) => {
    if (window.confirm('Are you sure you want to delete this form response?')) {
      try {
        const response = await fetch(`/api/audit/responses/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          await fetchFormResponses();
          alert('Form response deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting form response:', error);
        alert('Error deleting form response');
      }
    }
  };

  // Edit handlers
  const handleEditReport = (report) => {
    setEditingReport(report);
    setReportFormData({
      auditType: report.auditType || '',
      isoStandard: report.isoStandard || '',
      auditScope: report.auditScope || '',
      auditCriteria: report.auditCriteria || '',
      auditDate: report.auditDate || { start: '', end: '' },
      auditor: report.auditor || { name: '', email: '', certification: '' },
      leadAuditor: report.leadAuditor || { name: '', email: '', certification: '' },
      departments: report.departments || [],
      findings: report.findings || [],
      overallAssessment: report.overallAssessment || { 
        score: 0, 
        recommendation: '', 
        improvementAreas: [],
        strengths: []
      },
      followUpActions: report.followUpActions || [],
      nextAuditDate: report.nextAuditDate || ''
    });
    setShowModal(true);
  };

  const handleEditForm = (form) => {
    setEditingForm(form);
    setFormData({
      formName: form.formName || '',
      formCode: form.formCode || '',
      isoStandard: form.isoStandard || '',
      version: form.version || '1.0',
      description: form.description || '',
      sections: form.sections || [],
      isActive: form.isActive !== undefined ? form.isActive : true
    });
    setShowModal(true);
  };

  const handleEditResponse = (response) => {
    setEditingResponse(response);
    setResponseFormData({
      form: response.form || '',
      department: response.department || '',
      responses: response.responses || [],
      status: response.status || 'draft'
    });
    setShowModal(true);
  };

  // Modal close handler
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingReport(null);
    setEditingForm(null);
    setEditingResponse(null);
    setReportFormData({
      auditType: '',
      isoStandard: '',
      auditScope: '',
      auditCriteria: '',
      auditDate: { start: '', end: '' },
      auditor: { name: '', email: '', certification: '' },
      leadAuditor: { name: '', email: '', certification: '' },
      departments: [],
      findings: [],
      overallAssessment: { 
        score: 0, 
        recommendation: '', 
        improvementAreas: [],
        strengths: []
      },
      followUpActions: [],
      nextAuditDate: ''
    });
    setFormData({
      formName: '',
      formCode: '',
      isoStandard: '',
      version: '1.0',
      description: '',
      sections: [],
      isActive: true
    });
    setResponseFormData({
      form: '',
      department: '',
      responses: [],
      status: 'draft'
    });
  };

  // Filter data
  const filteredReports = auditReports.filter(report => {
    const matchesSearch = report.auditNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.auditScope?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterCategory || report.auditType === filterCategory;
    return matchesSearch && matchesFilter;
  });

  const filteredForms = standardForms.filter(form => {
    const matchesSearch = form.formName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.formCode?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterCategory || form.isoStandard === filterCategory;
    return matchesSearch && matchesFilter;
  });

  const filteredResponses = formResponses.filter(response => {
    const matchesSearch = response.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterCategory || response.status === filterCategory;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">
          <FileCheck size={24} />
          <h1>ISO Audit Reports</h1>
        </div>
        <p>Manage audit reports, compliance tracking, and corrective actions</p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <FileCheck size={16} />
          Audit Reports
        </button>
        <button
          className={`tab ${activeTab === 'forms' ? 'active' : ''}`}
          onClick={() => setActiveTab('forms')}
        >
          <ClipboardList size={16} />
          Standard Forms
        </button>
        <button
          className={`tab ${activeTab === 'ncr' ? 'active' : ''}`}
          onClick={() => setActiveTab('ncr')}
        >
          <AlertTriangle size={16} />
          Non-Conformances
        </button>
      </div>

      {/* Audit Reports Tab */}
      {activeTab === 'reports' && (
        <div className="controls">
          {/* Filters */}
          <div className="search-section">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search audit reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filter-group">
              <Filter size={20} />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="filter-select"
              >
                <option value="">All Types</option>
                {auditTypes.map(type => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingReport(null);
                setEditingForm(null);
                setEditingResponse(null);
                setShowModal(true);
              }}
            >
              <Plus size={20} />
              Add Audit Report
            </button>
          </div>

          {/* Audit Reports Table */}
          <div className="data-section">
          <div className="table-container">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Audit Number</th>
                  <th>Type</th>
                  <th>ISO Standard</th>
                  <th>Scope</th>
                  <th>Audit Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="loading-cell">
                      Loading audit reports...
                    </td>
                  </tr>
                ) : filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-cell">
                      No audit reports found
                    </td>
                  </tr>
                ) : (
                  filteredReports.map(report => (
                    <tr key={report.id}>
                      <td className="report-number">
                        <strong>{report.auditNumber}</strong>
                      </td>
                      <td>
                        <span className="type-badge">
                          {report.auditType?.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span className="standard-badge">
                          {report.isoStandard?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="scope-cell">
                        {report.auditScope ? 
                          (report.auditScope.length > 50 ? 
                            `${report.auditScope.substring(0, 50)}...` : 
                            report.auditScope) : 'N/A'}
                      </td>
                      <td>
                        <div className="date-info">
                          <Calendar size={14} />
                          {report.auditDate?.start ? 
                            new Date(report.auditDate.start).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${report.status === 'approved' ? 'active' : 
                          report.status === 'completed' ? 'completed' : 
                          report.status === 'in_progress' ? 'pending' : 'inactive'}`}>
                          {report.status?.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon btn-view"
                            onClick={() => handleEditReport(report)}
                            title="View/Edit Report"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="btn-icon btn-edit"
                            onClick={() => handleEditReport(report)}
                            title="Edit Report"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="btn-icon btn-delete"
                            onClick={() => handleDeleteReport(report.id)}
                            title="Delete Report"
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
        </div>
      )}

      {/* Standard Forms Tab */}
      {activeTab === 'forms' && (
        <div className="controls">
          {/* Filters */}
          <div className="search-section">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search standard forms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filter-group">
              <Filter size={20} />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="filter-select"
              >
                <option value="">All Standards</option>
                {isoStandards.map(standard => (
                  <option key={standard} value={standard}>
                    {standard.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingReport(null);
                setEditingForm(null);
                setEditingResponse(null);
                setShowModal(true);
              }}
            >
              <Plus size={20} />
              Add Standard Form
            </button>
          </div>

          {/* Standard Forms Table */}
          <div className="data-section">
          <div className="table-container">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Form Name</th>
                  <th>Form Code</th>
                  <th>ISO Standard</th>
                  <th>Version</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="loading-cell">
                      Loading standard forms...
                    </td>
                  </tr>
                ) : filteredForms.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-cell">
                      No standard forms found
                    </td>
                  </tr>
                ) : (
                  filteredForms.map(form => (
                    <tr key={form.id}>
                      <td className="form-name">
                        <strong>{form.formName}</strong>
                        {form.description && (
                          <small className="form-description">
                            {form.description}
                          </small>
                        )}
                      </td>
                      <td>
                        <code className="form-code">{form.formCode}</code>
                      </td>
                      <td>
                        <span className="standard-badge">
                          {form.isoStandard?.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <span className="version-badge">v{form.version}</span>
                      </td>
                      <td>
                        <span className={`status-badge ${form.isActive ? 'active' : 'inactive'}`}>
                          {form.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="date-info">
                          <Calendar size={14} />
                          {form.createdAt ? new Date(form.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon btn-view"
                            onClick={() => handleEditForm(form)}
                            title="View/Edit Form"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="btn-icon btn-edit"
                            onClick={() => handleEditForm(form)}
                            title="Edit Form"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="btn-icon btn-delete"
                            onClick={() => handleDeleteForm(form.id)}
                            title="Delete Form"
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
        </div>
      )}

      {/* Non-Conformances Tab */}
      {activeTab === 'ncr' && (
        <div className="controls">
          {/* Filters */}
          <div className="search-section">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search non-conformances..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filter-group">
              <Filter size={20} />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="filter-select"
              >
                <option value="">All Status</option>
                {responseStatuses.map(status => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingReport(null);
                setEditingForm(null);
                setEditingResponse(null);
                setShowModal(true);
              }}
            >
              <Plus size={20} />
              Add NCR
            </button>
          </div>

          {/* Non-Conformances Table */}
          <div className="data-section">
            <div className="table-container">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Form</th>
                  <th>Department</th>
                  <th>Respondent</th>
                  <th>Response Date</th>
                  <th>Status</th>
                  <th>Review Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="loading-cell">
                      Loading non-conformances...
                    </td>
                  </tr>
                ) : filteredResponses.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-cell">
                      No non-conformances found
                    </td>
                  </tr>
                ) : (
                  filteredResponses.map(response => (
                    <tr key={response.id}>
                      <td className="form-info">
                        <strong>{response.form?.formName || 'N/A'}</strong>
                        {response.form?.formCode && (
                          <small className="form-code">
                            {response.form.formCode}
                          </small>
                        )}
                      </td>
                      <td>{response.department || 'N/A'}</td>
                      <td>
                        <div className="user-info">
                          <User size={14} />
                          {response.respondent ? 
                            `${response.respondent.firstName} ${response.respondent.lastName}` : 
                            'N/A'}
                        </div>
                      </td>
                      <td>
                        <div className="date-info">
                          <Calendar size={14} />
                          {response.responseDate ? 
                            new Date(response.responseDate).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${response.status === 'approved' ? 'active' : 
                          response.status === 'reviewed' ? 'completed' : 
                          response.status === 'submitted' ? 'pending' : 'inactive'}`}>
                          {response.status?.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {response.reviewedBy ? (
                          <div className="reviewer-info">
                            <CheckCircle size={14} className="reviewed-icon" />
                            <small>Reviewed</small>
                          </div>
                        ) : (
                          <div className="reviewer-info">
                            <Clock size={14} className="pending-icon" />
                            <small>Pending</small>
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon btn-view"
                            onClick={() => handleEditResponse(response)}
                            title="View/Edit Response"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="btn-icon btn-edit"
                            onClick={() => handleEditResponse(response)}
                            title="Edit Response"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="btn-icon btn-delete"
                            onClick={() => handleDeleteResponse(response.id)}
                            title="Delete Response"
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
        </div>
      )}

      {/* Modal for Add/Edit Audit Report */}
      {showModal && activeTab === 'reports' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingReport ? 'Edit Audit Report' : 'Add New Audit Report'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleReportSubmit} className="audit-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="auditType">Audit Type *</label>
                  <select
                    id="auditType"
                    value={reportFormData.auditType}
                    onChange={(e) => setReportFormData({...reportFormData, auditType: e.target.value})}
                    required
                    className="form-select"
                  >
                    <option value="">Select Audit Type</option>
                    {auditTypes.map(type => (
                      <option key={type} value={type}>
                        {type.replace('_', ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="isoStandard">ISO Standard *</label>
                  <select
                    id="isoStandard"
                    value={reportFormData.isoStandard}
                    onChange={(e) => setReportFormData({...reportFormData, isoStandard: e.target.value})}
                    required
                    className="form-select"
                  >
                    <option value="">Select ISO Standard</option>
                    {isoStandards.map(standard => (
                      <option key={standard} value={standard}>
                        {standard.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="auditStartDate">Audit Start Date *</label>
                  <input
                    type="date"
                    id="auditStartDate"
                    value={reportFormData.auditDate.start}
                    onChange={(e) => setReportFormData({
                      ...reportFormData, 
                      auditDate: {...reportFormData.auditDate, start: e.target.value}
                    })}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="auditEndDate">Audit End Date</label>
                  <input
                    type="date"
                    id="auditEndDate"
                    value={reportFormData.auditDate.end}
                    onChange={(e) => setReportFormData({
                      ...reportFormData, 
                      auditDate: {...reportFormData.auditDate, end: e.target.value}
                    })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="auditorName">Auditor Name *</label>
                  <input
                    type="text"
                    id="auditorName"
                    value={reportFormData.auditor.name}
                    onChange={(e) => setReportFormData({
                      ...reportFormData, 
                      auditor: {...reportFormData.auditor, name: e.target.value}
                    })}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="auditorEmail">Auditor Email</label>
                  <input
                    type="email"
                    id="auditorEmail"
                    value={reportFormData.auditor.email}
                    onChange={(e) => setReportFormData({
                      ...reportFormData, 
                      auditor: {...reportFormData.auditor, email: e.target.value}
                    })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="auditScope">Audit Scope *</label>
                <textarea
                  id="auditScope"
                  value={reportFormData.auditScope}
                  onChange={(e) => setReportFormData({...reportFormData, auditScope: e.target.value})}
                  required
                  rows="3"
                  className="form-textarea"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="auditCriteria">Audit Criteria *</label>
                <textarea
                  id="auditCriteria"
                  value={reportFormData.auditCriteria}
                  onChange={(e) => setReportFormData({...reportFormData, auditCriteria: e.target.value})}
                  required
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
                  {loading ? 'Saving...' : (editingReport ? 'Update Report' : 'Create Report')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Add/Edit Standard Form */}
      {showModal && activeTab === 'forms' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingForm ? 'Edit Standard Form' : 'Add New Standard Form'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="audit-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="formName">Form Name *</label>
                  <input
                    type="text"
                    id="formName"
                    value={formData.formName}
                    onChange={(e) => setFormData({...formData, formName: e.target.value})}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="formCode">Form Code *</label>
                  <input
                    type="text"
                    id="formCode"
                    value={formData.formCode}
                    onChange={(e) => setFormData({...formData, formCode: e.target.value})}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="formIsoStandard">ISO Standard *</label>
                  <select
                    id="formIsoStandard"
                    value={formData.isoStandard}
                    onChange={(e) => setFormData({...formData, isoStandard: e.target.value})}
                    required
                    className="form-select"
                  >
                    <option value="">Select ISO Standard</option>
                    {isoStandards.map(standard => (
                      <option key={standard} value={standard}>
                        {standard.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="formVersion">Version</label>
                  <input
                    type="text"
                    id="formVersion"
                    value={formData.version}
                    onChange={(e) => setFormData({...formData, version: e.target.value})}
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
                    Active Form
                  </label>
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="formDescription">Description</label>
                <textarea
                  id="formDescription"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
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
                  {loading ? 'Saving...' : (editingForm ? 'Update Form' : 'Create Form')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Add/Edit Non-Conformance */}
      {showModal && activeTab === 'ncr' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingResponse ? 'Edit Non-Conformance' : 'Add New Non-Conformance'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleResponseSubmit} className="audit-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="responseForm">Related Form</label>
                  <select
                    id="responseForm"
                    value={responseFormData.form}
                    onChange={(e) => setResponseFormData({...responseFormData, form: e.target.value})}
                    className="form-select"
                  >
                    <option value="">Select Form</option>
                    {standardForms.map(form => (
                      <option key={form.id} value={form.id}>
                        {form.formName} ({form.formCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="responseDepartment">Department *</label>
                  <input
                    type="text"
                    id="responseDepartment"
                    value={responseFormData.department}
                    onChange={(e) => setResponseFormData({...responseFormData, department: e.target.value})}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="responseStatus">Status *</label>
                  <select
                    id="responseStatus"
                    value={responseFormData.status}
                    onChange={(e) => setResponseFormData({...responseFormData, status: e.target.value})}
                    required
                    className="form-select"
                  >
                    {responseStatuses.map(status => (
                      <option key={status} value={status}>
                        {status.replace('_', ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
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
                  {loading ? 'Saving...' : (editingResponse ? 'Update NCR' : 'Create NCR')}
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
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .search-section {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
          align-items: center;
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 300px;
        }

        .search-box svg {
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

        .filter-group svg {
          color: #94a3b8;
        }

        .filter-select {
          padding: 12px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          background: white;
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

        .data-section {
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .table-container {
          overflow-x: auto;
        }

        .audit-table {
          width: 100%;
          border-collapse: collapse;
        }

        .audit-table th {
          background: #f8fafc;
          padding: 12px 16px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 1px solid #e5e7eb;
        }

        .audit-table td {
          padding: 16px;
          border-bottom: 1px solid #f3f4f6;
          vertical-align: middle;
        }

        .report-number strong,
        .form-name strong {
          color: #1e293b;
          display: block;
          margin-bottom: 4px;
        }

        .form-description {
          color: #64748b;
          font-size: 12px;
        }

        .type-badge,
        .standard-badge,
        .status-badge,
        .version-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .type-badge {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .standard-badge {
          background: #ecfdf5;
          color: #065f46;
        }

        .version-badge {
          background: #fef3c7;
          color: #92400e;
        }

        .status-badge.active {
          background: #dcfce7;
          color: #166534;
        }

        .status-badge.inactive {
          background: #fee2e2;
          color: #991b1b;
        }

        .status-badge.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .status-badge.completed {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .date-info,
        .user-info {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #64748b;
          font-size: 14px;
        }

        .scope-cell {
          max-width: 200px;
        }

        .form-code {
          background: #f1f5f9;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          color: #475569;
        }

        .reviewer-info {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
        }

        .reviewed-icon {
          color: #10b981;
        }

        .pending-icon {
          color: #f59e0b;
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

        .btn-view {
          background: #f0f9ff;
          color: #0284c7;
        }

        .btn-view:hover {
          background: #e0f2fe;
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

        .loading-cell,
        .empty-cell {
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
          color: #94a3b8;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .modal-close:hover {
          background: #f1f5f9;
          color: #64748b;
        }

        .audit-form {
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

        .form-input,
        .form-select,
        .form-textarea {
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
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

        @media (max-width: 768px) {
          .page {
            padding: 16px;
          }

          .search-section {
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

export default Audit;
