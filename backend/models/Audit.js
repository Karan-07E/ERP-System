const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Audit Report Model
const AuditReport = sequelize.define('AuditReport', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  auditNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  auditType: {
    type: DataTypes.ENUM('internal', 'external', 'customer', 'certification_body'),
    allowNull: false
  },
  isoStandard: {
    type: DataTypes.ENUM('ISO_9001', 'ISO_14001', 'ISO_45001', 'ISO_13485', 'ISO_27001', 'ISO_22000', 'IATF_16949', 'AS_9100', 'other'),
    allowNull: false
  },
  auditDate: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  auditScope: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  auditCriteria: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  auditor: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  leadAuditor: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  auditTeam: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  departments: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  findings: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  overallAssessment: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  followUpActions: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  nextAuditDate: {
    type: DataTypes.DATE
  },
  attachments: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  status: {
    type: DataTypes.ENUM('draft', 'in_progress', 'completed', 'approved', 'closed'),
    defaultValue: 'draft'
  },
  approvedBy: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approvalDate: {
    type: DataTypes.DATE
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'audit_reports',
  timestamps: true
});

// Standard Audit Form Model
const StandardAuditForm = sequelize.define('StandardAuditForm', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  formName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  formCode: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  isoStandard: {
    type: DataTypes.ENUM('ISO_9001', 'ISO_14001', 'ISO_45001', 'ISO_13485', 'ISO_27001', 'ISO_22000', 'IATF_16949', 'AS_9100', 'other'),
    allowNull: false
  },
  version: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '1.0'
  },
  description: {
    type: DataTypes.TEXT
  },
  sections: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approvedBy: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'standard_audit_forms',
  timestamps: true
});

// Audit Form Response Model
const AuditFormResponse = sequelize.define('AuditFormResponse', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  form: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'standard_audit_forms',
      key: 'id'
    }
  },
  auditReport: {
    type: DataTypes.UUID,
    references: {
      model: 'audit_reports',
      key: 'id'
    }
  },
  responseDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  respondent: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  department: {
    type: DataTypes.STRING
  },
  responses: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  score: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  status: {
    type: DataTypes.ENUM('draft', 'submitted', 'reviewed', 'approved'),
    defaultValue: 'draft'
  },
  reviewedBy: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reviewDate: {
    type: DataTypes.DATE
  },
  reviewComments: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'audit_form_responses',
  timestamps: true
});

module.exports = {
  AuditReport,
  StandardAuditForm,
  AuditFormResponse
};
