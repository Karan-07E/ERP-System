const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const COC = sequelize.define('COC', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  cocNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  jobId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'jobs',
      key: 'id'
    }
  },
  partyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'parties',
      key: 'id'
    }
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id'
    }
  },
  invoiceNumber: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  batchNumber: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  partDescription: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  materialsUsed: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  processesUsed: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  qualityChecks: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  dimensionReport: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  complianceDeclaration: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  processChartList: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  generatedDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  approvedBy: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approvedDate: {
    type: DataTypes.DATE
  },
  status: {
    type: DataTypes.ENUM('draft', 'approved', 'issued'),
    defaultValue: 'draft'
  },
  filePath: {
    type: DataTypes.STRING
  },
  notes: {
    type: DataTypes.TEXT
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
  tableName: 'certificates_of_conformance',
  timestamps: true,
  indexes: [
    {
      fields: ['coc_number']
    },
    {
      fields: ['job_id']
    },
    {
      fields: ['party_id']
    },
    {
      fields: ['order_id']
    },
    {
      fields: ['invoice_number']
    },
    {
      fields: ['batch_number']
    },
    {
      fields: ['status']
    }
  ]
});

// Dimension Report model for detailed quality checks
const DimensionReport = sequelize.define('DimensionReport', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  cocId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'certificates_of_conformance',
      key: 'id'
    }
  },
  jobId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'jobs',
      key: 'id'
    }
  },
  checkType: {
    type: DataTypes.ENUM('dimensional', 'visual', 'functional', 'material'),
    allowNull: false
  },
  checkDescription: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  specification: {
    type: DataTypes.STRING(100)
  },
  tolerance: {
    type: DataTypes.STRING(50)
  },
  // 5-sample check data
  sample1: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  sample2: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  sample3: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  sample4: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  sample5: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  result: {
    type: DataTypes.ENUM('OK', 'NOT_OK', 'NA'),
    allowNull: false
  },
  hasImage: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  imagePath: {
    type: DataTypes.STRING
  },
  measuredBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  measurementDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'dimension_reports',
  timestamps: true,
  indexes: [
    {
      fields: ['coc_id']
    },
    {
      fields: ['job_id']
    },
    {
      fields: ['check_type']
    },
    {
      fields: ['result']
    },
    {
      fields: ['measured_by']
    }
  ]
});

module.exports = {
  COC,
  DimensionReport
};
