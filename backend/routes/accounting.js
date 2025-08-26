const express = require('express');
const { Op } = require('sequelize');
const { Invoice, Quotation, Payment, Party } = require('../models/Accounting');
const { calculateInvoiceTax, validateGSTNumber, calculateHSNSummary } = require('../utils/gstCalculations');
const { auth, checkPermission } = require('../middleware/auth');
const { validate, invoiceSchemas } = require('../middleware/validation');
const router = express.Router();

// PARTIES ROUTES (Unified Customer/Vendor Entity)
// Get all parties
router.get('/parties', auth, checkPermission('accounting', 'read'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, type, isActive } = req.query;
    
    let whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { companyName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { gstNumber: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (type) whereClause.type = type;
    if (isActive !== undefined) whereClause.isActive = isActive === 'true';

    const { count, rows: parties } = await Party.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      parties,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    console.error('Get parties error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create party
router.post('/parties', auth, checkPermission('accounting', 'create'), async (req, res) => {
  try {
    // Validate GST number if provided
    if (req.body.gstNumber && !validateGSTNumber(req.body.gstNumber)) {
      return res.status(400).json({ message: 'Invalid GST number format' });
    }

    const party = await Party.create({
      ...req.body,
      createdBy: req.user.id
    });
    
    res.status(201).json({ message: 'Party created successfully', party });
  } catch (error) {
    console.error('Create party error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ message: 'Party with this email or GST number already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// Update party
router.put('/parties/:id', auth, checkPermission('accounting', 'update'), async (req, res) => {
  try {
    // Validate GST number if provided
    if (req.body.gstNumber && !validateGSTNumber(req.body.gstNumber)) {
      return res.status(400).json({ message: 'Invalid GST number format' });
    }

    const [updatedRowsCount] = await Party.update(req.body, {
      where: { id: req.params.id },
      returning: true
    });
    
    if (updatedRowsCount === 0) {
      return res.status(404).json({ message: 'Party not found' });
    }
    
    const updatedParty = await Party.findByPk(req.params.id);
    res.json({ message: 'Party updated successfully', party: updatedParty });
  } catch (error) {
    console.error('Update party error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ message: 'Party with this email or GST number already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// Delete party (soft delete)
router.delete('/parties/:id', auth, checkPermission('accounting', 'delete'), async (req, res) => {
  try {
    const [updatedRowsCount] = await Party.update(
      { isActive: false },
      { where: { id: req.params.id } }
    );
    
    if (updatedRowsCount === 0) {
      return res.status(404).json({ message: 'Party not found' });
    }
    
    res.json({ message: 'Party deleted successfully' });
  } catch (error) {
    console.error('Delete party error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// VENDORS ROUTES
// Get all vendors
router.get('/vendors', auth, checkPermission('accounting', 'read'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;
    
    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const vendors = await Vendor.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Vendor.countDocuments(query);

    res.json({
      vendors,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create vendor
router.post('/vendors', auth, checkPermission('accounting', 'create'), async (req, res) => {
  try {
    const vendor = new Vendor(req.body);
    await vendor.save();
    res.status(201).json({ message: 'Vendor created successfully', vendor });
  } catch (error) {
    console.error('Create vendor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update vendor
router.put('/vendors/:id', auth, checkPermission('accounting', 'update'), async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.json({ message: 'Vendor updated successfully', vendor });
  } catch (error) {
    console.error('Update vendor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ITEMS ROUTES
// Get all items
router.get('/items', auth, checkPermission('accounting', 'read'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, isActive } = req.query;
    
    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { itemCode: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const items = await Item.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Item.countDocuments(query);

    res.json({
      items,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create item
router.post('/items', auth, checkPermission('accounting', 'create'), validate(itemSchemas.create), async (req, res) => {
  try {
    const item = new Item(req.body);
    await item.save();
    res.status(201).json({ message: 'Item created successfully', item });
  } catch (error) {
    console.error('Create item error:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Item with this code already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// Update item
router.put('/items/:id', auth, checkPermission('accounting', 'update'), validate(itemSchemas.update), async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json({ message: 'Item updated successfully', item });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// INVOICES ROUTES
// Get all invoices
router.get('/invoices', auth, checkPermission('accounting', 'read'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, type, status, partyId } = req.query;
    
    let whereClause = {};
    if (search) {
      whereClause.invoiceNumber = { [Op.iLike]: `%${search}%` };
    }
    if (type) whereClause.type = type;
    if (status) whereClause.status = status;
    if (partyId) whereClause.partyId = partyId;

    const { count, rows: invoices } = await Invoice.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Party,
          as: 'party',
          attributes: ['id', 'name', 'companyName', 'gstNumber', 'stateCode']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      invoices,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create invoice with GST calculations
router.post('/invoices', auth, checkPermission('accounting', 'create'), async (req, res) => {
  try {
    const { partyId, items, placeOfSupply, additionalDiscount = 0, ...otherData } = req.body;

    // Get party details for GST calculation
    const party = await Party.findByPk(partyId);
    if (!party) {
      return res.status(404).json({ message: 'Party not found' });
    }

    // Generate invoice number
    const invoiceCount = await Invoice.count();
    const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(6, '0')}`;

    // Calculate GST split and tax breakdown
    const taxCalculation = calculateInvoiceTax(
      items,
      additionalDiscount,
      placeOfSupply,
      party.stateCode
    );

    const invoice = await Invoice.create({
      ...otherData,
      invoiceNumber,
      partyId,
      placeOfSupply,
      items: taxCalculation.itemCalculations,
      beforeTaxAmount: taxCalculation.beforeTaxAmount,
      taxableAmount: taxCalculation.taxableAmount,
      totalDiscount: taxCalculation.totalDiscount,
      cgstAmount: taxCalculation.cgstAmount,
      sgstAmount: taxCalculation.sgstAmount,
      igstAmount: taxCalculation.igstAmount,
      totalGstAmount: taxCalculation.totalGstAmount,
      afterTaxAmount: taxCalculation.afterTaxAmount,
      grandTotal: taxCalculation.grandTotal,
      createdBy: req.user.id
    });

    // Fetch the created invoice with party details
    const createdInvoice = await Invoice.findByPk(invoice.id, {
      include: [
        {
          model: Party,
          as: 'party',
          attributes: ['id', 'name', 'companyName', 'gstNumber', 'stateCode']
        }
      ]
    });

    res.status(201).json({ 
      message: 'Invoice created successfully', 
      invoice: createdInvoice 
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update invoice with GST recalculation
router.put('/invoices/:id', auth, checkPermission('accounting', 'update'), async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [{ model: Party, as: 'party' }]
    });
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Don't allow updating paid invoices
    if (invoice.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Cannot update paid invoice' });
    }

    const { partyId, items, placeOfSupply, additionalDiscount = 0, ...otherData } = req.body;

    // If items are being updated, recalculate GST
    if (items) {
      let party = invoice.party;
      
      // If party is being changed, fetch new party
      if (partyId && partyId !== invoice.partyId) {
        party = await Party.findByPk(partyId);
        if (!party) {
          return res.status(404).json({ message: 'Party not found' });
        }
      }

      // Recalculate taxes
      const taxCalculation = calculateInvoiceTax(
        items,
        additionalDiscount,
        placeOfSupply || invoice.placeOfSupply,
        party.stateCode
      );

      // Update with new calculations
      await invoice.update({
        ...otherData,
        partyId: partyId || invoice.partyId,
        placeOfSupply: placeOfSupply || invoice.placeOfSupply,
        items: taxCalculation.itemCalculations,
        beforeTaxAmount: taxCalculation.beforeTaxAmount,
        taxableAmount: taxCalculation.taxableAmount,
        totalDiscount: taxCalculation.totalDiscount,
        cgstAmount: taxCalculation.cgstAmount,
        sgstAmount: taxCalculation.sgstAmount,
        igstAmount: taxCalculation.igstAmount,
        totalGstAmount: taxCalculation.totalGstAmount,
        afterTaxAmount: taxCalculation.afterTaxAmount,
        grandTotal: taxCalculation.grandTotal
      });
    } else {
      // Simple update without recalculation
      await invoice.update(otherData);
    }

    // Fetch updated invoice
    const updatedInvoice = await Invoice.findByPk(req.params.id, {
      include: [
        {
          model: Party,
          as: 'party',
          attributes: ['id', 'name', 'companyName', 'gstNumber', 'stateCode']
        }
      ]
    });

    res.json({ message: 'Invoice updated successfully', invoice: updatedInvoice });
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// QUOTATIONS ROUTES
// Get all quotations
router.get('/quotations', auth, checkPermission('accounting', 'read'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, partyId } = req.query;
    
    let query = {};
    if (search) {
      query.quotationNumber = { $regex: search, $options: 'i' };
    }
    if (status) query.status = status;
    if (customer) query.customer = customer;

    const quotations = await Quotation.find(query)
      .populate('customer', 'name companyName')
      .populate('items.item', 'name itemCode')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Quotation.countDocuments(query);

    res.json({
      quotations,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get quotations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PAYMENTS ROUTES
// Get all payments
router.get('/payments', auth, checkPermission('accounting', 'read'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, type, paymentMethod } = req.query;
    
    let query = {};
    if (search) {
      query.$or = [
        { paymentNumber: { $regex: search, $options: 'i' } },
        { reference: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (type) query.type = type;
    if (paymentMethod) query.paymentMethod = paymentMethod;

    const payments = await Payment.find(query)
      .populate('customer', 'name companyName')
      .populate('vendor', 'name companyName')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(query);

    res.json({
      payments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create payment
router.post('/payments', auth, checkPermission('accounting', 'create'), async (req, res) => {
  try {
    const paymentNumber = `PAY-${Date.now()}`;
    
    const payment = new Payment({
      ...req.body,
      paymentNumber,
      createdBy: req.user._id
    });

    await payment.save();
    await payment.populate('customer', 'name companyName');
    await payment.populate('vendor', 'name companyName');

    res.status(201).json({ message: 'Payment created successfully', payment });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Demo endpoints for customers and vendors (no auth)
router.get('/customers/demo/list', async (req, res) => {
  try {
    const mockCustomers = [
      { _id: 'c1', name: 'Acme Corp', companyName: 'Acme Corporation', email: 'contact@acme.com', phone: '123-456-7890' },
      { _id: 'c2', name: 'TechCorp', companyName: 'Tech Corporation', email: 'info@techcorp.com', phone: '123-456-7891' },
      { _id: 'c3', name: 'Global Inc', companyName: 'Global Incorporated', email: 'hello@global.com', phone: '123-456-7892' }
    ];
    
    res.json({ customers: mockCustomers });
  } catch (error) {
    console.error('Error fetching demo customers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/vendors/demo/list', async (req, res) => {
  try {
    const mockVendors = [
      { _id: 'v1', name: 'Supplier Inc', companyName: 'Supplier Incorporated', email: 'sales@supplier.com', phone: '123-456-8890' },
      { _id: 'v2', name: 'Materials Co', companyName: 'Materials Company', email: 'orders@materials.com', phone: '123-456-8891' }
    ];
    
    res.json({ vendors: mockVendors });
  } catch (error) {
    console.error('Error fetching demo vendors:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Simple create customer endpoint (no auth for demo)
router.post('/customers/simple', async (req, res) => {
  try {
    console.log('Creating simple customer:', req.body);
    
    const customerData = {
      name: req.body.name || 'Demo Customer',
      companyName: req.body.companyName || '',
      email: req.body.email || `demo-${Date.now()}@example.com`,
      phone: req.body.phone || '1234567890', // Phone is required
      address: req.body.address ? {
        street: req.body.address,
        city: '',
        state: '',
        zipCode: '',
        country: 'India'
      } : {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India'
      },
      customerType: req.body.customerType || 'regular',
      gstNumber: req.body.gstNumber || '',
      panNumber: req.body.panNumber || '',
      paymentTerms: '30 days',
      creditLimit: 100000,
      isActive: true
    };

    const customer = new Customer(customerData);
    await customer.save();
    
    res.status(201).json({ 
      message: 'Customer created successfully', 
      customer: {
        _id: customer._id,
        name: customer.name,
        companyName: customer.companyName,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        customerType: customer.customerType,
        createdAt: customer.createdAt
      }
    });
  } catch (error) {
    console.error('Create simple customer error:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Customer with this email already exists' });
    } else {
      res.status(500).json({ message: error.message || 'Failed to create customer. Please try again.' });
    }
  }
});

// Get accounting dashboard stats
router.get('/dashboard', auth, checkPermission('accounting', 'read'), async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments({ isActive: true });
    const totalVendors = await Vendor.countDocuments({ isActive: true });
    const totalItems = await Item.countDocuments({ isActive: true });
    
    const pendingInvoices = await Invoice.countDocuments({ status: 'sent' });
    const overdueInvoices = await Invoice.countDocuments({ 
      status: 'sent', 
      dueDate: { $lt: new Date() } 
    });
    
    const totalSales = await Invoice.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } }
    ]);

    const unpaidAmount = await Invoice.aggregate([
      { $match: { paymentStatus: { $in: ['unpaid', 'partial'] } } },
      { $group: { _id: null, total: { $sum: { $subtract: ['$grandTotal', '$paidAmount'] } } } }
    ]);

    res.json({
      customers: totalCustomers,
      vendors: totalVendors,
      items: totalItems,
      pendingInvoices,
      overdueInvoices,
      totalSales: totalSales[0]?.total || 0,
      unpaidAmount: unpaidAmount[0]?.total || 0
    });
  } catch (error) {
    console.error('Get accounting dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GST REPORTS ROUTES
// HSN Summary Report
router.get('/reports/hsn-summary', auth, checkPermission('accounting', 'read'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const whereClause = {
      invoiceDate: {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      },
      status: { [Op.in]: ['sent', 'paid', 'partial'] }
    };

    const invoices = await Invoice.findAll({
      where: whereClause,
      attributes: ['items', 'cgstAmount', 'sgstAmount', 'igstAmount']
    });

    const hsnSummary = calculateHSNSummary(invoices);

    res.json({
      period: { startDate, endDate },
      hsnSummary,
      totalRecords: hsnSummary.length
    });
  } catch (error) {
    console.error('HSN Summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GSTR-1 Report (Sales)
router.get('/reports/gstr1', auth, checkPermission('accounting', 'read'), async (req, res) => {
  try {
    const { month, year } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year are required' });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const salesInvoices = await Invoice.findAll({
      where: {
        type: 'sales',
        invoiceDate: {
          [Op.between]: [startDate, endDate]
        },
        status: { [Op.in]: ['sent', 'paid', 'partial'] }
      },
      include: [
        {
          model: Party,
          as: 'party',
          attributes: ['id', 'name', 'gstNumber', 'stateCode', 'type']
        }
      ],
      order: [['invoiceDate', 'ASC']]
    });

    // Group by party for B2B transactions
    const b2bTransactions = {};
    const b2cTransactions = [];
    let totalTaxableValue = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;

    salesInvoices.forEach(invoice => {
      const partyGst = invoice.party.gstNumber;
      
      if (partyGst && invoice.afterTaxAmount >= 250000) { // B2B transactions
        if (!b2bTransactions[partyGst]) {
          b2bTransactions[partyGst] = {
            gstNumber: partyGst,
            partyName: invoice.party.name,
            stateCode: invoice.party.stateCode,
            invoices: [],
            totalTaxableValue: 0,
            totalTax: 0
          };
        }
        
        b2bTransactions[partyGst].invoices.push({
          invoiceNumber: invoice.invoiceNumber,
          invoiceDate: invoice.invoiceDate,
          taxableValue: invoice.taxableAmount,
          cgstAmount: invoice.cgstAmount,
          sgstAmount: invoice.sgstAmount,
          igstAmount: invoice.igstAmount,
          totalTax: invoice.totalGstAmount
        });
        
        b2bTransactions[partyGst].totalTaxableValue += invoice.taxableAmount;
        b2bTransactions[partyGst].totalTax += invoice.totalGstAmount;
      } else { // B2C transactions
        b2cTransactions.push({
          invoiceNumber: invoice.invoiceNumber,
          invoiceDate: invoice.invoiceDate,
          taxableValue: invoice.taxableAmount,
          cgstAmount: invoice.cgstAmount,
          sgstAmount: invoice.sgstAmount,
          igstAmount: invoice.igstAmount,
          totalTax: invoice.totalGstAmount,
          placeOfSupply: invoice.placeOfSupply
        });
      }

      totalTaxableValue += invoice.taxableAmount;
      totalCgst += invoice.cgstAmount;
      totalSgst += invoice.sgstAmount;
      totalIgst += invoice.igstAmount;
    });

    res.json({
      period: { month, year },
      summary: {
        totalTaxableValue: parseFloat(totalTaxableValue.toFixed(2)),
        totalCgst: parseFloat(totalCgst.toFixed(2)),
        totalSgst: parseFloat(totalSgst.toFixed(2)),
        totalIgst: parseFloat(totalIgst.toFixed(2)),
        totalTax: parseFloat((totalCgst + totalSgst + totalIgst).toFixed(2))
      },
      b2bTransactions: Object.values(b2bTransactions),
      b2cTransactions,
      hsnSummary: calculateHSNSummary(salesInvoices)
    });
  } catch (error) {
    console.error('GSTR-1 error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Sales Summary Report
router.get('/reports/sales-summary', auth, checkPermission('accounting', 'read'), async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'month' } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const whereClause = {
      type: 'sales',
      invoiceDate: {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      },
      status: { [Op.in]: ['sent', 'paid', 'partial'] }
    };

    const salesData = await Invoice.findAll({
      where: whereClause,
      include: [
        {
          model: Party,
          as: 'party',
          attributes: ['id', 'name', 'stateCode']
        }
      ],
      attributes: [
        'invoiceDate',
        'beforeTaxAmount',
        'taxableAmount',
        'cgstAmount',
        'sgstAmount',
        'igstAmount',
        'totalGstAmount',
        'afterTaxAmount',
        'placeOfSupply'
      ],
      order: [['invoiceDate', 'ASC']]
    });

    // Group sales data
    const groupedData = {};
    salesData.forEach(invoice => {
      let key;
      const date = new Date(invoice.invoiceDate);
      
      if (groupBy === 'month') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else if (groupBy === 'quarter') {
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        key = `${date.getFullYear()}-Q${quarter}`;
      } else {
        key = date.toISOString().split('T')[0];
      }

      if (!groupedData[key]) {
        groupedData[key] = {
          period: key,
          totalSales: 0,
          taxableAmount: 0,
          totalTax: 0,
          cgstAmount: 0,
          sgstAmount: 0,
          igstAmount: 0,
          invoiceCount: 0
        };
      }

      groupedData[key].totalSales += invoice.afterTaxAmount;
      groupedData[key].taxableAmount += invoice.taxableAmount;
      groupedData[key].totalTax += invoice.totalGstAmount;
      groupedData[key].cgstAmount += invoice.cgstAmount;
      groupedData[key].sgstAmount += invoice.sgstAmount;
      groupedData[key].igstAmount += invoice.igstAmount;
      groupedData[key].invoiceCount += 1;
    });

    // Round values
    Object.values(groupedData).forEach(item => {
      item.totalSales = parseFloat(item.totalSales.toFixed(2));
      item.taxableAmount = parseFloat(item.taxableAmount.toFixed(2));
      item.totalTax = parseFloat(item.totalTax.toFixed(2));
      item.cgstAmount = parseFloat(item.cgstAmount.toFixed(2));
      item.sgstAmount = parseFloat(item.sgstAmount.toFixed(2));
      item.igstAmount = parseFloat(item.igstAmount.toFixed(2));
    });

    res.json({
      period: { startDate, endDate },
      groupBy,
      data: Object.values(groupedData),
      totalRecords: Object.keys(groupedData).length
    });
  } catch (error) {
    console.error('Sales summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
