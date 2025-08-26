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
    allowNull: true,  // Allow null for parties without GST
    validate: {
      len: [15, 15],
      isAlphanumeric: true,
      isValidGST(value) {
        if (value && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value)) {
          throw new Error('Invalid GST number format');
        }
      }
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
  hooks: {
    beforeCreate: async (party) => {
      // Generate unique party code if not provided
      if (!party.partyCode) {
        const prefix = party.type === 'customer' ? 'CUST' : 
                      party.type === 'vendor' ? 'VEND' : 'PRTY';
        
        const latestParty = await Party.findOne({
          where: { type: party.type },
          order: [['createdAt', 'DESC']]
        });
        
        let nextNumber = 1;
        if (latestParty && latestParty.partyCode) {
          const match = latestParty.partyCode.match(/\d+$/);
          if (match) {
            nextNumber = parseInt(match[0]) + 1;
          }
        }
        
        party.partyCode = `${prefix}${nextNumber.toString().padStart(4, '0')}`;
      }
    }
  },
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
