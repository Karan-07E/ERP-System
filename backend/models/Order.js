const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Order Model
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
  type: {
    type: DataTypes.ENUM('sales_order', 'purchase_order'),
    allowNull: false
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
  subtotal: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  totalGst: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  grandTotal: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('draft', 'confirmed', 'in_production', 'ready_to_ship', 'shipped', 'delivered', 'completed', 'cancelled'),
    defaultValue: 'draft'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
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
  }
}, {
  tableName: 'orders',
  timestamps: true
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
