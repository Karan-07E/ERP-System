const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Enhanced Order Model with Party support and GST compliance
const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  poNumber: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('sales_order', 'purchase_order'),
    allowNull: false
  },
  // Updated to use Party instead of separate customer/vendor
  partyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'parties',
      key: 'id'
    }
  },
  // Legacy fields updated to reference unified parties table
  customer: {
    type: DataTypes.UUID,
    references: {
      model: 'parties',
      key: 'id'
    }
  },
  vendor: {
    type: DataTypes.UUID,
    references: {
      model: 'parties',
      key: 'id'
    }
  },
  orderDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  expectedDeliveryDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  actualDeliveryDate: {
    type: DataTypes.DATE
  },
  items: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  // Enhanced GST calculations
  subtotal: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  cgstAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  sgstAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  igstAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  totalGst: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  grandTotal: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  // Enhanced status management
  status: {
    type: DataTypes.ENUM('open', 'processing', 'hold', 'completed', 'cancelled', 'draft', 'confirmed', 'in_production', 'ready_to_ship', 'shipped', 'delivered'),
    defaultValue: 'open'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  // Additional compliance fields
  hsnSummary: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  paymentTerms: {
    type: DataTypes.STRING(255)
  },
  deliveryTerms: {
    type: DataTypes.STRING(255)
  },
  specialInstructions: {
    type: DataTypes.TEXT
  },
  notes: {
    type: DataTypes.TEXT
  },
  attachments: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  // Flags for dashboard
  hasNegativeFlag: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  flagReason: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'orders',
  timestamps: true,
  indexes: [
    {
      fields: ['order_number']
    },
    {
      fields: ['po_number']
    },
    {
      fields: ['party_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['order_date']
    },
    {
      fields: ['has_negative_flag']
    }
  ]
});

// Job Card Model
const JobCard = sequelize.define('JobCard', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  jobCardNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  order: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id'
    }
  },
  item: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'items',
      key: 'id'
    }
  },
  process: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'processes',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  assignedTo: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  startDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  targetCompletionDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  actualCompletionDate: {
    type: DataTypes.DATE
  },
  status: {
    type: DataTypes.ENUM('assigned', 'in_progress', 'completed', 'on_hold', 'cancelled'),
    defaultValue: 'assigned'
  },
  materials: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  qualityChecks: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  workInstructions: {
    type: DataTypes.TEXT
  },
  completionNotes: {
    type: DataTypes.TEXT
  },
  attachments: {
    type: DataTypes.JSONB,
    defaultValue: []
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
  tableName: 'job_cards',
  timestamps: true
});

// Delivery Challan Model
const DeliveryChallan = sequelize.define('DeliveryChallan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  challanNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  type: {
    type: DataTypes.ENUM('sales', 'purchase', 'job_work', 'sample'),
    allowNull: false
  },
  customer: {
    type: DataTypes.UUID,
    references: {
      model: 'parties',
      key: 'id'
    }
  },
  vendor: {
    type: DataTypes.UUID,
    references: {
      model: 'parties',
      key: 'id'
    }
  },
  order: {
    type: DataTypes.UUID,
    references: {
      model: 'orders',
      key: 'id'
    }
  },
  challanDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  expectedReturnDate: {
    type: DataTypes.DATE
  },
  actualReturnDate: {
    type: DataTypes.DATE
  },
  items: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  transportDetails: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  status: {
    type: DataTypes.ENUM('draft', 'dispatched', 'delivered', 'returned', 'completed'),
    defaultValue: 'draft'
  },
  remarks: {
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
  tableName: 'delivery_challans',
  timestamps: true
});

module.exports = {
  Order,
  JobCard,
  DeliveryChallan
};
