const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Process Model
const Process = sequelize.define('Process', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  processCode: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  processName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  category: {
    type: DataTypes.ENUM('machining', 'assembly', 'finishing', 'quality_check', 'packaging', 'other'),
    allowNull: false
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false
  },
  estimatedTime: {
    type: DataTypes.JSONB,
    defaultValue: {
      setup: 0,
      cycle: 0,
      total: 0
    }
  },
  skillLevel: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced', 'expert'),
    defaultValue: 'intermediate'
  },
  requiredEquipment: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  workInstructions: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  safetyInstructions: {
    type: DataTypes.TEXT
  },
  qualityParameters: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  inputMaterials: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  outputItems: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  costPerHour: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
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
  }
}, {
  tableName: 'processes',
  timestamps: true
});

// Quality Control Model
const QualityControl = sequelize.define('QualityControl', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  qcNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  type: {
    type: DataTypes.ENUM('incoming', 'in_process', 'final', 'customer_return'),
    allowNull: false
  },
  item: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'items',
      key: 'id'
    }
  },
  batchNumber: {
    type: DataTypes.STRING
  },
  quantity: {
    type: DataTypes.JSONB,
    defaultValue: {
      checked: 0,
      passed: 0,
      failed: 0,
      rework: 0
    }
  },
  reference: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  checkDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  checkedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  parameters: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  overallStatus: {
    type: DataTypes.ENUM('passed', 'failed', 'conditional', 'on_hold'),
    allowNull: false
  },
  defects: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  correctiveActions: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  attachments: {
    type: DataTypes.JSONB,
    defaultValue: []
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
  remarks: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'quality_controls',
  timestamps: true
});

// Inspection Report Model
const InspectionReport = sequelize.define('InspectionReport', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  reportNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  type: {
    type: DataTypes.ENUM('material', 'process', 'final_product', 'customer_audit', 'internal_audit'),
    allowNull: false
  },
  item: {
    type: DataTypes.UUID,
    references: {
      model: 'items',
      key: 'id'
    }
  },
  process: {
    type: DataTypes.UUID,
    references: {
      model: 'processes',
      key: 'id'
    }
  },
  inspectionDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  inspector: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  customer: {
    type: DataTypes.UUID,
    references: {
      model: 'customers',
      key: 'id'
    }
  },
  vendor: {
    type: DataTypes.UUID,
    references: {
      model: 'vendors',
      key: 'id'
    }
  },
  batchDetails: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  checkpoints: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  overallResult: {
    type: DataTypes.ENUM('approved', 'rejected', 'conditional', 'pending'),
    allowNull: false
  },
  nonConformities: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  certificates: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  recommendations: {
    type: DataTypes.TEXT
  },
  nextInspectionDate: {
    type: DataTypes.DATE
  },
  attachments: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  approvedBy: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
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
  tableName: 'inspection_reports',
  timestamps: true
});

module.exports = {
  Process,
  QualityControl,
  InspectionReport
};
