const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'orders',
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
    allowNull: false,
    validate: {
      min: 1
    }
  },
  unitPrice: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  totalPrice: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  hsnCode: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  gstRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: {
      min: 0,
      max: 100
    }
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
  totalTaxAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  finalAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  // Optional size/dimensions
  dimensions: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  materialId: {
    type: DataTypes.UUID,
    references: {
      model: 'materials',
      key: 'id'
    }
  },
  // Job tracking
  jobId: {
    type: DataTypes.UUID,
    references: {
      model: 'jobs',
      key: 'id'
    }
  },
  deliveryDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_production', 'completed', 'delivered'),
    defaultValue: 'pending'
  },
  notes: {
    type: DataTypes.TEXT
  },
  attachments: {
    type: DataTypes.JSONB,
    defaultValue: []
  }
}, {
  tableName: 'order_items',
  timestamps: true,
  indexes: [
    {
      fields: ['order_id']
    },
    {
      fields: ['part_number']
    },
    {
      fields: ['hsn_code']
    },
    {
      fields: ['status']
    },
    {
      fields: ['job_id']
    }
  ]
});

module.exports = OrderItem;
