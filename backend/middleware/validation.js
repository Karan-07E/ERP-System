const Joi = require('joi');

// Generic validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

// User validation schemas
const userSchemas = {
  register: Joi.object({
    username: Joi.string().alphanum().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    role: Joi.string().valid('admin', 'accountant', 'production', 'manager').optional(),
    phone: Joi.string().optional(),
    address: Joi.object({
      street: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      zipCode: Joi.string().optional(),
      country: Joi.string().optional()
    }).optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  updateProfile: Joi.object({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    phone: Joi.string().optional(),
    address: Joi.object({
      street: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      zipCode: Joi.string().optional(),
      country: Joi.string().optional()
    }).optional()
  })
};

// Item validation schemas
const itemSchemas = {
  create: Joi.object({
    itemCode: Joi.string().required(),
    name: Joi.string().required(),
    description: Joi.string().optional(),
    category: Joi.string().valid('raw_material', 'finished_goods', 'semi_finished', 'consumables').required(),
    unit: Joi.string().valid('pieces', 'kg', 'liters', 'meters', 'boxes', 'tons').required(),
    purchasePrice: Joi.number().min(0).required(),
    salePrice: Joi.number().min(0).required(),
    hsnCode: Joi.string().optional(),
    gstRate: Joi.number().min(0).max(100).optional(),
    reorderLevel: Joi.number().min(0).optional(),
    maxStock: Joi.number().min(0).optional(),
    specifications: Joi.object({
      length: Joi.number().optional(),
      width: Joi.number().optional(),
      height: Joi.number().optional(),
      weight: Joi.number().optional(),
      color: Joi.string().optional(),
      material: Joi.string().optional()
    }).optional()
  }),

  update: Joi.object({
    name: Joi.string().optional(),
    description: Joi.string().optional(),
    category: Joi.string().valid('raw_material', 'finished_goods', 'semi_finished', 'consumables').optional(),
    unit: Joi.string().valid('pieces', 'kg', 'liters', 'meters', 'boxes', 'tons').optional(),
    purchasePrice: Joi.number().min(0).optional(),
    salePrice: Joi.number().min(0).optional(),
    hsnCode: Joi.string().optional(),
    gstRate: Joi.number().min(0).max(100).optional(),
    reorderLevel: Joi.number().min(0).optional(),
    maxStock: Joi.number().min(0).optional(),
    isActive: Joi.boolean().optional(),
    specifications: Joi.object({
      length: Joi.number().optional(),
      width: Joi.number().optional(),
      height: Joi.number().optional(),
      weight: Joi.number().optional(),
      color: Joi.string().optional(),
      material: Joi.string().optional()
    }).optional()
  })
};

// Customer validation schemas
const customerSchemas = {
  create: Joi.object({
    name: Joi.string().required(),
    companyName: Joi.string().optional(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    address: Joi.object({
      street: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      zipCode: Joi.string().optional(),
      country: Joi.string().optional()
    }).optional(),
    gstNumber: Joi.string().optional(),
    panNumber: Joi.string().optional(),
    creditLimit: Joi.number().min(0).optional(),
    paymentTerms: Joi.string().optional()
  })
};

// Order validation schemas
const orderSchemas = {
  create: Joi.object({
    type: Joi.string().valid('sales_order', 'purchase_order').required(),
    customer: Joi.string().when('type', { is: 'sales_order', then: Joi.required() }),
    vendor: Joi.string().when('type', { is: 'purchase_order', then: Joi.required() }),
    expectedDeliveryDate: Joi.date().required(),
    items: Joi.array().items(
      Joi.object({
        item: Joi.string().required(),
        quantity: Joi.number().min(0).required(),
        unitPrice: Joi.number().min(0).required()
      })
    ).min(1).required(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
    notes: Joi.string().optional()
  })
};

// Invoice validation schemas
const invoiceSchemas = {
  create: Joi.object({
    type: Joi.string().valid('proforma', 'normal', 'credit_note').optional(),
    customer: Joi.string().required(),
    dueDate: Joi.date().required(),
    items: Joi.array().items(
      Joi.object({
        item: Joi.string().required(),
        quantity: Joi.number().min(0).required(),
        unitPrice: Joi.number().min(0).required(),
        discount: Joi.number().min(0).optional(),
        gstRate: Joi.number().min(0).max(100).optional()
      })
    ).min(1).required(),
    notes: Joi.string().optional(),
    termsAndConditions: Joi.string().optional()
  })
};

// Process validation schemas
const processSchemas = {
  create: Joi.object({
    processCode: Joi.string().required(),
    processName: Joi.string().required(),
    description: Joi.string().optional(),
    category: Joi.string().valid('machining', 'assembly', 'finishing', 'quality_check', 'packaging', 'other').optional(),
    department: Joi.string().optional(),
    estimatedTime: Joi.number().min(0).optional(),
    skillLevel: Joi.string().valid('beginner', 'intermediate', 'advanced', 'expert').optional(),
    workInstructions: Joi.string().optional(),
    safetyInstructions: Joi.string().optional(),
    costPerHour: Joi.number().min(0).optional(),
    isActive: Joi.boolean().optional()
  })
};

// Message validation schemas
const messageSchemas = {
  create: Joi.object({
    receiver: Joi.string().required(),
    subject: Joi.string().max(200).required(),
    content: Joi.string().max(5000).required(),
    messageType: Joi.string().valid('normal', 'urgent', 'info', 'warning').optional(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
    relatedTo: Joi.object({
      type: Joi.string().valid('order', 'invoice', 'job_card', 'quality_report', 'audit', 'other').optional(),
      id: Joi.string().optional(),
      reference: Joi.string().optional()
    }).optional()
  })
};

module.exports = {
  validate,
  userSchemas,
  itemSchemas,
  customerSchemas,
  orderSchemas,
  invoiceSchemas,
  processSchemas,
  messageSchemas
};
