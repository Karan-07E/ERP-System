const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Customer Model
const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  companyName: {
    type: DataTypes.STRING
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  gstNumber: {
    type: DataTypes.STRING
  },
  panNumber: {
    type: DataTypes.STRING
  },
  creditLimit: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  paymentTerms: {
    type: DataTypes.STRING,
    defaultValue: 'Net 30'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'customers',
  timestamps: true
});

// Vendor Model
const Vendor = sequelize.define('Vendor', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  companyName: {
    type: DataTypes.STRING
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  gstNumber: {
    type: DataTypes.STRING
  },
  panNumber: {
    type: DataTypes.STRING
  },
  paymentTerms: {
    type: DataTypes.STRING,
    defaultValue: 'Net 30'
  },
  bankDetails: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'vendors',
  timestamps: true
});

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

// Invoice Model
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
    type: DataTypes.ENUM('proforma', 'normal', 'credit_note'),
    defaultValue: 'normal'
  },
  customer: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'customers',
      key: 'id'
    }
  },
  invoiceDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  items: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  subtotal: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  totalDiscount: {
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
  timestamps: true
});

// Quotation Model
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
  customer: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'customers',
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
  items: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  subtotal: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  totalDiscount: {
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
  timestamps: true
});

// Payment Model
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
    type: DataTypes.ENUM('payment_in', 'payment_out'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  paymentDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'cheque', 'bank_transfer', 'card', 'upi'),
    allowNull: false
  },
  reference: {
    type: DataTypes.STRING
  },
  description: {
    type: DataTypes.STRING,
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
  invoice: {
    type: DataTypes.UUID,
    references: {
      model: 'invoices',
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
  tableName: 'payments',
  timestamps: true
});

module.exports = {
  Customer,
  Vendor,
  Item,
  Invoice,
  Quotation,
  Payment
};
