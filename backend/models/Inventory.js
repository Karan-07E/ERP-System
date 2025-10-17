const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Inventory Model
const Inventory = sequelize.define('Inventory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  item: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'items',
      key: 'id'
    }
  },
  location: {
    type: DataTypes.JSONB,
    defaultValue: {
      warehouse: 'Main Warehouse',
      section: 'A',
      rack: '1',
      bin: '1'
    }
  },
  currentStock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  reservedStock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  minimumStock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10
  },
  maximumStock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1000
  },
  averageCost: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  lastStockUpdate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  shelfLife: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'inventory',
  timestamps: true,
  indexes: [
    {
      fields: ['item']
    }
  ]
});

// Stock Movement Model
const StockMovement = sequelize.define('StockMovement', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  item: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'items',
      key: 'id'
    }
  },
  movementType: {
    type: DataTypes.ENUM('stock_in', 'stock_out', 'transfer', 'adjustment', 'return'),
    allowNull: false
  },
  transactionType: {
    type: DataTypes.ENUM('purchase', 'sales', 'production', 'wastage', 'adjustment', 'return', 'transfer'),
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  unitPrice: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  totalValue: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  fromLocation: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  toLocation: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  reference: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  batchNumber: {
    type: DataTypes.STRING
  },
  expiryDate: {
    type: DataTypes.DATE
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: false
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
  },
  approvedBy: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  movementDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'stock_movements',
  timestamps: true,
  indexes: [
    {
      fields: ['item', 'movement_date']
    }
  ]
});

// GRN (Goods Receipt Note) Model
const GRN = sequelize.define('GRN', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  grnNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  purchaseOrder: {
    type: DataTypes.UUID,
    references: {
      model: 'orders',
      key: 'id'
    }
  },
  vendor: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'parties',
      key: 'id'
    }
  },
  receiptDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  invoiceNumber: {
    type: DataTypes.STRING
  },
  invoiceDate: {
    type: DataTypes.DATE
  },
  items: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  totalAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('draft', 'submitted', 'approved', 'rejected'),
    defaultValue: 'draft'
  },
  qualityCheck: {
    type: DataTypes.JSONB,
    defaultValue: {
      required: false,
      status: 'pending'
    }
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
  approvedBy: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'grns',
  timestamps: true,
  indexes: [
    {
      fields: ['vendor', 'receipt_date']
    }
  ]
});

// Gate Pass Model
const GatePass = sequelize.define('GatePass', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  gatePassNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  type: {
    type: DataTypes.ENUM('outward', 'inward', 'returnable', 'non_returnable'),
    allowNull: false
  },
  purpose: {
    type: DataTypes.ENUM('delivery', 'job_work', 'repair', 'sample', 'return', 'scrap', 'other'),
    allowNull: false
  },
  party: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  vehicleNumber: {
    type: DataTypes.STRING
  },
  driverName: {
    type: DataTypes.STRING
  },
  items: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  issueDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  expectedReturnDate: {
    type: DataTypes.DATE
  },
  actualReturnDate: {
    type: DataTypes.DATE
  },
  status: {
    type: DataTypes.ENUM('issued', 'in_transit', 'delivered', 'returned', 'closed'),
    defaultValue: 'issued'
  },
  securityOfficer: {
    type: DataTypes.JSONB,
    defaultValue: {}
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
  tableName: 'gate_passes',
  timestamps: true
});

module.exports = {
  Inventory,
  StockMovement,
  GRN,
  GatePass
};
