const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Job = sequelize.define('Job', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  jobId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  orderItemId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'order_items',
      key: 'id'
    }
  },
  employeeId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  partNumber: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('assigned', 'in_progress', 'quality_check', 'completed', 'on_hold', 'rejected'),
    defaultValue: 'assigned'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  startDate: {
    type: DataTypes.DATE
  },
  targetCompletionDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  actualCompletionDate: {
    type: DataTypes.DATE
  },
  currentProcessStep: {
    type: DataTypes.STRING(100)
  },
  completedSteps: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  qualityChecks: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  materialsUsed: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  processHistory: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  workInstructions: {
    type: DataTypes.TEXT
  },
  notes: {
    type: DataTypes.TEXT
  },
  attachments: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  // Drawing and technical documents
  customerDrawing: {
    type: DataTypes.STRING
  },
  internalDrawing: {
    type: DataTypes.STRING
  },
  reportingDrawing: {
    type: DataTypes.STRING
  },
  // COC related fields
  batchNumber: {
    type: DataTypes.STRING(50)
  },
  certificateGenerated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
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
  tableName: 'jobs',
  timestamps: true,
  indexes: [
    {
      fields: ['job_id']
    },
    {
      fields: ['order_item_id']
    },
    {
      fields: ['employee_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['priority']
    },
    {
      fields: ['target_completion_date']
    },
    {
      fields: ['part_number']
    }
  ]
});

// Job Process Steps model for detailed tracking
const JobProcessStep = sequelize.define('JobProcessStep', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  jobId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'jobs',
      key: 'id'
    }
  },
  processId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'processes',
      key: 'id'
    }
  },
  stepNumber: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  stepName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  employeeId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'failed', 'skipped'),
    defaultValue: 'pending'
  },
  startTime: {
    type: DataTypes.DATE
  },
  endTime: {
    type: DataTypes.DATE
  },
  duration: {
    type: DataTypes.INTEGER // in minutes
  },
  qualityCheck: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  notes: {
    type: DataTypes.TEXT
  },
  attachments: {
    type: DataTypes.JSONB,
    defaultValue: []
  }
}, {
  tableName: 'job_process_steps',
  timestamps: true,
  indexes: [
    {
      fields: ['job_id']
    },
    {
      fields: ['process_id']
    },
    {
      fields: ['step_number']
    },
    {
      fields: ['employee_id']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = {
  Job,
  JobProcessStep
};
