const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Import Party model (unified customer/vendor entity)
const Party = require('./Party');

// Item Model
const Item = sequelize.define('Item', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  itemCode: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  category: {
    type: DataTypes.ENUM('raw_material', 'finished_goods', 'semi_finished', 'consumables'),
    allowNull: false
  },
  unit: {
    type: DataTypes.ENUM('pieces', 'kg', 'liters', 'meters', 'boxes', 'tons'),
    allowNull: false
  },
  purchasePrice: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  salePrice: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  hsnCode: {
    type: DataTypes.STRING
  },
  gstRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 18
  },
  reorderLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  maxStock: {
    type: DataTypes.INTEGER,
    defaultValue: 1000
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  specifications: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'items',
  timestamps: true
});

// Invoice Model with GST split support
const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  type: {
    type: DataTypes.ENUM('proforma', 'normal', 'credit_note', 'debit_note'),
    defaultValue: 'normal'
  },
  partyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'parties',
      key: 'id'
    }
  },
  partyType: {
    type: DataTypes.ENUM('customer', 'vendor'),
    allowNull: false,
    defaultValue: 'customer'
  },
  invoiceDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  placeOfSupply: {
    type: DataTypes.STRING(2), // State code
    allowNull: false
  },
  items: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  // Tax breakdown
  beforeTaxAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  taxableAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  totalDiscount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  // GST Split
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
  totalGstAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  afterTaxAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  roundingAdjustment: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  grandTotal: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled'),
    defaultValue: 'draft'
  },
  paymentStatus: {
    type: DataTypes.ENUM('unpaid', 'partial', 'paid'),
    defaultValue: 'unpaid'
  },
  paidAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  // GST Compliance fields
  irnNumber: {
    type: DataTypes.STRING(64) // IRN for e-invoicing
  },
  eWayBillNumber: {
    type: DataTypes.STRING(20)
  },
  reverseCharge: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  notes: {
    type: DataTypes.TEXT
  },
  termsAndConditions: {
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
  tableName: 'invoices',
  timestamps: true,
  indexes: [
    { fields: ['invoice_number'] },
    { fields: ['party_id'] },
    { fields: ['invoice_date'] },
    { fields: ['status'] },
    { fields: ['payment_status'] }
  ]
});

// Quotation Model with GST split support
const Quotation = sequelize.define('Quotation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  quotationNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  partyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'parties',
      key: 'id'
    }
  },
  quotationDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  validUntil: {
    type: DataTypes.DATE,
    allowNull: false
  },
  placeOfSupply: {
    type: DataTypes.STRING(2), // State code
    allowNull: false
  },
  items: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  // Tax breakdown
  beforeTaxAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  taxableAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  totalDiscount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  // GST Split
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
  totalGstAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  afterTaxAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  grandTotal: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('draft', 'sent', 'accepted', 'rejected', 'expired'),
    defaultValue: 'draft'
  },
  notes: {
    type: DataTypes.TEXT
  },
  termsAndConditions: {
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
  tableName: 'quotations',
  timestamps: true,
  indexes: [
    { fields: ['quotation_number'] },
    { fields: ['party_id'] },
    { fields: ['quotation_date'] },
    { fields: ['status'] }
  ]
});

// Payment Model with GST support
const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  paymentNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  type: {
    type: DataTypes.ENUM('payment', 'receipt'),
    allowNull: false
  },
  partyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'parties',
      key: 'id'
    }
  },
  paymentDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  paymentMode: {
    type: DataTypes.ENUM('cash', 'cheque', 'bank_transfer', 'upi', 'card'),
    allowNull: false
  },
  referenceNumber: {
    type: DataTypes.STRING
  },
  bankDetails: {
    type: DataTypes.JSONB
  },
  invoiceId: {
    type: DataTypes.UUID,
    references: {
      model: 'invoices',
      key: 'id'
    }
  },
  tdsAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  tdsPercentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
    defaultValue: 'pending'
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
  tableName: 'payments',
  timestamps: true,
  indexes: [
    { fields: ['payment_number'] },
    { fields: ['party_id'] },
    { fields: ['payment_date'] },
    { fields: ['type'] },
    { fields: ['status'] }
  ]
});

module.exports = {
  Invoice,
  Quotation,
  Payment,
  Party
};
