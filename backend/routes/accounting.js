const express = require('express');
const { Customer, Vendor, Item, Invoice, Quotation, Payment } = require('../models/Accounting');
const { auth, checkPermission } = require('../middleware/auth');
const { validate, customerSchemas, itemSchemas, invoiceSchemas } = require('../middleware/validation');
const router = express.Router();

// CUSTOMERS ROUTES
// Get all customers
router.get('/customers', auth, checkPermission('accounting', 'read'), async (req, res) => {
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

    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Customer.countDocuments(query);

    res.json({
      customers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create customer
router.post('/customers', auth, checkPermission('accounting', 'create'), validate(customerSchemas.create), async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json({ message: 'Customer created successfully', customer });
  } catch (error) {
    console.error('Create customer error:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Customer with this email already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// Update customer
router.put('/customers/:id', auth, checkPermission('accounting', 'update'), async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json({ message: 'Customer updated successfully', customer });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete customer
router.delete('/customers/:id', auth, checkPermission('accounting', 'delete'), async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Delete customer error:', error);
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
    const { page = 1, limit = 10, search, type, status, customer } = req.query;
    
    let query = {};
    if (search) {
      query.invoiceNumber = { $regex: search, $options: 'i' };
    }
    if (type) query.type = type;
    if (status) query.status = status;
    if (customer) query.customer = customer;

    const invoices = await Invoice.find(query)
      .populate('customer', 'name companyName')
      .populate('items.item', 'name itemCode')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Invoice.countDocuments(query);

    res.json({
      invoices,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create invoice
router.post('/invoices', auth, checkPermission('accounting', 'create'), validate(invoiceSchemas.create), async (req, res) => {
  try {
    // Generate invoice number
    const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 });
    const invoiceNumber = `INV-${Date.now()}`;

    // Calculate totals
    let subtotal = 0;
    let totalGst = 0;

    const items = await Promise.all(
      req.body.items.map(async (itemData) => {
        const item = await Item.findById(itemData.item);
        if (!item) {
          throw new Error(`Item not found: ${itemData.item}`);
        }

        const amount = (itemData.quantity * itemData.unitPrice) - (itemData.discount || 0);
        const gstAmount = (amount * (itemData.gstRate || item.gstRate)) / 100;

        subtotal += amount;
        totalGst += gstAmount;

        return {
          ...itemData,
          amount,
          gstRate: itemData.gstRate || item.gstRate
        };
      })
    );

    const invoice = new Invoice({
      ...req.body,
      invoiceNumber,
      items,
      subtotal,
      totalGst,
      grandTotal: subtotal + totalGst,
      createdBy: req.user._id
    });

    await invoice.save();
    await invoice.populate('customer', 'name companyName');
    await invoice.populate('items.item', 'name itemCode');

    res.status(201).json({ message: 'Invoice created successfully', invoice });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Update invoice
router.put('/invoices/:id', auth, checkPermission('accounting', 'update'), async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Don't allow updating paid invoices
    if (invoice.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Cannot update paid invoice' });
    }

    // Recalculate if items are updated
    if (req.body.items) {
      let subtotal = 0;
      let totalGst = 0;

      const items = await Promise.all(
        req.body.items.map(async (itemData) => {
          const item = await Item.findById(itemData.item);
          if (!item) {
            throw new Error(`Item not found: ${itemData.item}`);
          }

          const amount = (itemData.quantity * itemData.unitPrice) - (itemData.discount || 0);
          const gstAmount = (amount * (itemData.gstRate || item.gstRate)) / 100;

          subtotal += amount;
          totalGst += gstAmount;

          return {
            ...itemData,
            amount,
            gstRate: itemData.gstRate || item.gstRate
          };
        })
      );

      req.body.items = items;
      req.body.subtotal = subtotal;
      req.body.totalGst = totalGst;
      req.body.grandTotal = subtotal + totalGst;
    }

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('customer', 'name companyName')
     .populate('items.item', 'name itemCode');

    res.json({ message: 'Invoice updated successfully', invoice: updatedInvoice });
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// QUOTATIONS ROUTES
// Get all quotations
router.get('/quotations', auth, checkPermission('accounting', 'read'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, customer } = req.query;
    
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

module.exports = router;
