const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Party = sequelize.define('Party', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  partyCode: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('customer', 'vendor', 'both'),
    allowNull: false,
    defaultValue: 'customer'
  },
  contactPerson: {
    type: DataTypes.STRING(100)
  },
  email: {
    type: DataTypes.STRING(100),
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING(20)
  },
  mobile: {
    type: DataTypes.STRING(20)
  },
  address: {
    type: DataTypes.TEXT
  },
  city: {
    type: DataTypes.STRING(100)
  },
  state: {
    type: DataTypes.STRING(100)
  },
  pincode: {
    type: DataTypes.STRING(10)
  },
  country: {
    type: DataTypes.STRING(100),
    defaultValue: 'India'
  },
  gstNumber: {
    type: DataTypes.STRING(15),
    unique: true,
    validate: {
      len: [15, 15],
      isAlphanumeric: true
    }
  },
  panNumber: {
    type: DataTypes.STRING(10),
    validate: {
      len: [10, 10]
    }
  },
  stateCode: {
    type: DataTypes.STRING(2),
    allowNull: false
  },
  creditLimit: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  creditDays: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  paymentTerms: {
    type: DataTypes.TEXT
  },
  bankDetails: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'parties',
  timestamps: true,
  indexes: [
    {
      fields: ['party_code']
    },
    {
      fields: ['gst_number']
    },
    {
      fields: ['type']
    },
    {
      fields: ['state']
    }
  ]
});

module.exports = Party;
