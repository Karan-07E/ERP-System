const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Enhanced Material Model with alerts
const Material = sequelize.define('Material', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  materialCode: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  category: {
    type: DataTypes.STRING(100)
  },
  type: {
    type: DataTypes.ENUM('raw_material', 'semi_finished', 'finished_goods', 'consumables'),
    allowNull: false
  },
  unit: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  currentStock: {
    type: DataTypes.DECIMAL(15, 3),
    defaultValue: 0
  },
  minimumStock: {
    type: DataTypes.DECIMAL(15, 3),
    defaultValue: 0
  },
  maximumStock: {
    type: DataTypes.DECIMAL(15, 3),
    defaultValue: 0
  },
  reorderLevel: {
    type: DataTypes.DECIMAL(15, 3),
    defaultValue: 0
  },
  standardCost: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  averageCost: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  lastPurchaseCost: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  // Stock alerts
  lowStockAlert: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isLowStock: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  expiryDate: {
    type: DataTypes.DATEONLY
  },
  expiryAlert: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // HSN and GST
  hsnCode: {
    type: DataTypes.STRING(10)
  },
  gstRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0
  },
  // Storage details
  storageLocation: {
    type: DataTypes.STRING(100)
  },
  storageConditions: {
    type: DataTypes.TEXT
  },
  // Quality specifications
  qualityParameters: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  certifications: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  // Supplier information
  preferredSupplierId: {
    type: DataTypes.UUID,
    references: {
      model: 'parties',
      key: 'id'
    }
  },
  alternativeSuppliers: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  leadTime: {
    type: DataTypes.INTEGER, // in days
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
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
  tableName: 'materials',
  timestamps: true,
  hooks: {
    beforeSave: (material) => {
      // Check for low stock
      if (material.currentStock <= material.reorderLevel) {
        material.isLowStock = true;
      } else {
        material.isLowStock = false;
      }
      
      // Check for expiry alert (30 days before expiry)
      if (material.expiryDate) {
        const today = new Date();
        const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
        if (new Date(material.expiryDate) <= thirtyDaysFromNow) {
          material.expiryAlert = true;
        } else {
          material.expiryAlert = false;
        }
      }
    }
  },
  indexes: [
    {
      fields: ['material_code']
    },
    {
      fields: ['name']
    },
    {
      fields: ['category']
    },
    {
      fields: ['type']
    },
    {
      fields: ['is_low_stock']
    },
    {
      fields: ['expiry_alert']
    },
    {
      fields: ['hsn_code']
    }
  ]
});

// BOM (Bill of Materials) Model
const BOM = sequelize.define('BOM', {
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
  parentItem: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'items',
      key: 'id'
    }
  },
  version: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '1.0'
  },
  description: {
    type: DataTypes.TEXT
  },
  materials: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  totalMaterialCost: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  laborCost: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  overheadCost: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  totalCost: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  profitMargin: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0
  },
  sellingPrice: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  approvedBy: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approvalDate: {
    type: DataTypes.DATE
  },
  effectiveDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  expiryDate: {
    type: DataTypes.DATE
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
  tableName: 'boms',
  timestamps: true,
  hooks: {
    beforeSave: (bom) => {
      // Calculate costs
      let totalMaterialCost = 0;
      if (bom.materials && Array.isArray(bom.materials)) {
        bom.materials.forEach(material => {
          const wastageQuantity = (material.quantity * (material.wastagePercentage || 0)) / 100;
          material.actualQuantity = material.quantity + wastageQuantity;
          material.totalCost = material.actualQuantity * (material.costPerUnit || 0);
          totalMaterialCost += material.totalCost;
        });
      }
      
      bom.totalMaterialCost = totalMaterialCost;
      bom.totalCost = totalMaterialCost + (bom.laborCost || 0) + (bom.overheadCost || 0);
      bom.sellingPrice = bom.totalCost + (bom.totalCost * (bom.profitMargin || 0) / 100);
    }
  }
});

// Material Specification Model
const MaterialSpecification = sequelize.define('MaterialSpecification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  material: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'items',
      key: 'id'
    }
  },
  specificationName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  version: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '1.0'
  },
  specifications: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  variations: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  qualityGrade: {
    type: DataTypes.ENUM('A', 'B', 'C', 'Premium', 'Standard', 'Economy'),
    defaultValue: 'Standard'
  },
  certifications: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  testReports: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
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
  tableName: 'material_specifications',
  timestamps: true
});

// Material Consumption Model
const MaterialConsumption = sequelize.define('MaterialConsumption', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  jobCard: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'job_cards',
      key: 'id'
    }
  },
  order: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id'
    }
  },
  consumptionDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  materials: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  totalPlannedCost: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  totalActualCost: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  variance: {
    type: DataTypes.DECIMAL(15, 2)
  },
  variancePercentage: {
    type: DataTypes.DECIMAL(5, 2)
  },
  status: {
    type: DataTypes.ENUM('draft', 'submitted', 'approved', 'rejected'),
    defaultValue: 'draft'
  },
  approvedBy: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
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
  tableName: 'material_consumptions',
  timestamps: true,
  hooks: {
    beforeSave: (consumption) => {
      // Calculate costs
      let totalActualCost = 0;
      if (consumption.materials && Array.isArray(consumption.materials)) {
        consumption.materials.forEach(material => {
          material.totalCost = material.actualQuantity * material.unitCost;
          totalActualCost += material.totalCost;
        });
      }
      
      consumption.totalActualCost = totalActualCost;
      consumption.variance = consumption.totalActualCost - consumption.totalPlannedCost;
      consumption.variancePercentage = consumption.totalPlannedCost > 0 
        ? (consumption.variance / consumption.totalPlannedCost) * 100 
        : 0;
    }
  }
});

module.exports = {
  Material,
  BOM,
  MaterialSpecification,
  MaterialConsumption
};
