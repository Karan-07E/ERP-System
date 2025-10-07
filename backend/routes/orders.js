const express = require('express');
const Joi = require('joi');
const { Order, JobCard, DeliveryChallan } = require('../models/Order');
const { Item } = require('../models/Accounting');
const { Inventory } = require('../models/Inventory');
const { auth, checkPermission } = require('../middleware/auth');
const { validate, orderSchemas } = require('../middleware/validation');
const { getModelSafely } = require('../utils/modelHelper');
const router = express.Router();

// IMPORTANT: Define all the demo/simple routes FIRST before any parameterized routes
// to avoid Express interpreting 'simple' as a parameter

// Simple order schema validation for the demo endpoint
const simpleOrderSchema = Joi.object({
  type: Joi.string().valid('sales_order', 'purchase_order').required(),
  orderNumber: Joi.string().optional(), // Optional custom order number
  partyId: Joi.string().optional(), // Made optional for demo mode
  customer: Joi.string().optional(), // Added customer field
  vendor: Joi.string().optional(), // Added vendor field
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  price: Joi.number().min(0).optional(), // Optional price field
  description: Joi.string().optional(),
  notes: Joi.string().optional() // Added notes field
});

// Simple create order endpoint (no auth for demo)
router.post('/simple', async (req, res) => {
  // Debug log to see what's being received
  console.log('====== ORDER CREATION REQUEST ======');
  console.log('Headers:', req.headers);
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('===================================');
  
  // Validate schema but catch validation errors
  try {
    const { error } = simpleOrderSchema.validate(req.body);
    if (error) {
      console.error('Order validation error:', error.details);
      return res.status(400).json({
        message: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
  } catch (validationError) {
    console.error('Schema validation error:', validationError);
  }
  try {
    console.log('Creating simple order:', req.body);
    
    // Use custom order number if provided, otherwise generate one
    const orderNumber = req.body.orderNumber 
      ? req.body.orderNumber 
      : req.body.type === 'sales_order' 
        ? `SO-${Date.now()}` 
        : req.body.type === 'purchase_order' 
          ? `PO-${Date.now()}`
          : `QUO-${Date.now()}`;

    // Get party information - check for partyId or customer/vendor
    let partyInfo = { name: 'Demo Party' };
    let partyId = req.body.partyId;
    
    // If no direct partyId, try to use customer/vendor ID as fallback
    if (!partyId) {
      if (req.body.type === 'sales_order' && req.body.customer) {
        partyId = req.body.customer;
        console.log('Using customer ID as partyId:', partyId);
      } else if (req.body.type === 'purchase_order' && req.body.vendor) {
        partyId = req.body.vendor;
        console.log('Using vendor ID as partyId:', partyId);
      }
    }
    
    // Try to fetch party data if we have any kind of ID
    if (partyId) {
      try {
        console.log('Looking up party with ID:', partyId);
        
        // Try to find the party in the database using our helper
        const party = await getModelSafely('Party', partyId);
        if (party) {
          partyInfo = {
            id: party.id,
            name: party.name,
            city: party.city || '',
            type: party.type
          };
          console.log('Party found:', partyInfo);
        } else {
          console.log('No party found with ID:', partyId);
        }
      } catch (partyError) {
        console.log('Party fetch error (non-critical):', partyError.message);
      }
    } else {
      console.log('No party ID provided, using demo party data');
    }

    // For demo purposes, return a mock response instead of creating in DB
    // to avoid complexity with required references
    const mockOrder = {
      _id: `demo-order-${Date.now()}`,
      orderNumber,
      type: req.body.type || 'sales_order',
      status: 'draft',
      priority: req.body.priority || 'medium',
      partyId: partyId || null,
      partyInfo,
      // Use provided notes or generate default notes
      notes: req.body.notes || `${req.body.type === 'sales_order' ? 'Customer' : 'Vendor'}: ${partyInfo.name}`,
      description: req.body.description || '',
      price: req.body.price ? parseFloat(req.body.price) : 0,
      grandTotal: req.body.price ? parseFloat(req.body.price) : 0,
      createdAt: new Date()
    };

    res.status(201).json({ 
      message: 'Order created successfully', 
      order: mockOrder
    });
  } catch (error) {
    console.error('Create simple order error:', error);
    res.status(500).json({ message: error.message || 'Failed to create order. Please try again.' });
  }
});

// Simple create job card endpoint (no auth for demo)
// This endpoint is kept for API compatibility but is no longer directly called from the Orders page
router.post('/job-cards/simple', async (req, res) => {
  try {
    console.log('Creating simple job card:', req.body);
    
    // For demo purposes, we'll just return a success response without actually creating in DB
    const jobCardNumber = `JC-${Date.now()}`;
    
    const mockJobCard = {
      _id: `demo-${Date.now()}`,
      jobCardNumber,
      title: req.body.title || 'Demo Job Card',
      description: req.body.description || 'Demo job card for testing',
      status: 'assigned',
      priority: req.body.priority || 'medium',
      createdAt: new Date()
    };

    res.status(201).json({ 
      message: 'Job card created successfully', 
      jobCard: mockJobCard
    });
  } catch (error) {
    console.error('Create simple job card error:', error);
    res.status(500).json({ message: error.message || 'Failed to create job card. Please try again.' });
  }
});

// Simple endpoints for demo (no auth required)
router.get('/demo/list', async (req, res) => {
  try {
    const { type, status } = req.query;
    
    // Mock data for demo
    const mockOrders = [
      {
        _id: 'so-001',
        orderNumber: 'SO-001',
        type: 'sales_order',
        customer: { _id: 'c1', name: 'Acme Corp', companyName: 'Acme Corporation' },
        status: 'confirmed',
        priority: 'high',
        orderDate: new Date('2025-08-01'),
        expectedDeliveryDate: new Date('2025-08-15'),
        grandTotal: 45000,
        items: [{ item: { name: 'Product A' }, quantity: 10, unitPrice: 4500 }]
      },
      {
        _id: 'so-002',
        orderNumber: 'SO-002',
        type: 'sales_order',
        customer: { _id: 'c2', name: 'TechCorp', companyName: 'Tech Corporation' },
        status: 'in_production',
        priority: 'medium',
        orderDate: new Date('2025-08-03'),
        expectedDeliveryDate: new Date('2025-08-20'),
        grandTotal: 67500,
        items: [{ item: { name: 'Product B' }, quantity: 15, unitPrice: 4500 }]
      },
      {
        _id: 'po-001',
        orderNumber: 'PO-001',
        type: 'purchase_order',
        vendor: { _id: 'v1', name: 'Supplier Inc', companyName: 'Supplier Incorporated' },
        status: 'pending',
        priority: 'medium',
        orderDate: new Date('2025-08-02'),
        expectedDeliveryDate: new Date('2025-08-18'),
        grandTotal: 25000,
        items: [{ item: { name: 'Raw Material A' }, quantity: 100, unitPrice: 250 }]
      }
    ];
    
    let filteredOrders = mockOrders;
    
    if (type) {
      filteredOrders = filteredOrders.filter(order => order.type === type);
    }
    
    if (status && status !== 'all') {
      filteredOrders = filteredOrders.filter(order => order.status === status);
    }
    
    res.json({ 
      orders: filteredOrders,
      total: filteredOrders.length,
      totalPages: 1,
      currentPage: 1
    });
  } catch (error) {
    console.error('Error fetching demo orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status endpoint (demo)
router.put('/demo/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log(`Updating order ${id} status to ${status}`);
    
    // In real implementation, this would update the database
    res.json({ 
      message: `Order ${id} status updated to ${status}`,
      order: { _id: id, status }
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ORDERS ROUTES
// Get all orders
router.get('/', auth, checkPermission('orders', 'read'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, type, status, priority } = req.query;
    
    let query = {};
    if (search) {
      query.orderNumber = { $regex: search, $options: 'i' };
    }
    if (type) query.type = type;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const orders = await Order.find(query)
      .populate('customer', 'name companyName')
      .populate('vendor', 'name companyName')
      .populate('items.item', 'name itemCode')
      .populate('items.processes.process', 'processName')
      .populate('items.processes.assignedTo', 'firstName lastName')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get order by ID
router.get('/:id', auth, checkPermission('orders', 'read'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name companyName email phone')
      .populate('vendor', 'name companyName email phone')
      .populate('items.item', 'name itemCode unit')
      .populate('items.processes.process', 'processName estimatedTime')
      .populate('items.processes.assignedTo', 'firstName lastName')
      .populate('createdBy', 'firstName lastName');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create order
router.post('/', auth, checkPermission('orders', 'create'), validate(orderSchemas.create), async (req, res) => {
  try {
    // Generate order number
    const orderNumber = `${req.body.type === 'sales_order' ? 'SO' : 'PO'}-${Date.now()}`;

    // Calculate totals
    let subtotal = 0;
    let totalGst = 0;

    const items = await Promise.all(
      req.body.items.map(async (itemData) => {
        const item = await Item.findById(itemData.item);
        if (!item) {
          throw new Error(`Item not found: ${itemData.item}`);
        }

        const amount = itemData.quantity * itemData.unitPrice;
        const gstAmount = (amount * item.gstRate) / 100;

        subtotal += amount;
        totalGst += gstAmount;

        return {
          ...itemData,
          remainingQuantity: itemData.quantity,
          processStatus: 'not_started'
        };
      })
    );

    const order = new Order({
      ...req.body,
      orderNumber,
      items,
      subtotal,
      totalGst,
      grandTotal: subtotal + totalGst,
      createdBy: req.user._id
    });

    await order.save();
    await order.populate('customer', 'name companyName');
    await order.populate('vendor', 'name companyName');
    await order.populate('items.item', 'name itemCode');

    res.status(201).json({ message: 'Order created successfully', order });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Update order
router.put('/:id', auth, checkPermission('orders', 'update'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Don't allow updating completed or cancelled orders
    if (['completed', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ message: 'Cannot update completed or cancelled order' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('customer', 'name companyName')
     .populate('vendor', 'name companyName')
     .populate('items.item', 'name itemCode');

    res.json({ message: 'Order updated successfully', order: updatedOrder });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete order (soft delete)
router.delete('/:id', auth, checkPermission('orders', 'delete'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Don't allow deleting orders that are in production
    if (['in_production', 'ready_to_ship', 'shipped'].includes(order.status)) {
      return res.status(400).json({ message: 'Cannot delete order that is in production or shipped' });
    }

    order.status = 'cancelled';
    await order.save();

    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign process to order item
router.post('/:orderId/items/:itemId/processes', auth, checkPermission('orders', 'update'), async (req, res) => {
  try {
    const { processId, assignedTo, notes } = req.body;

    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const orderItem = order.items.id(req.params.itemId);
    if (!orderItem) {
      return res.status(404).json({ message: 'Order item not found' });
    }

    orderItem.processes.push({
      process: processId,
      assignedTo,
      notes,
      status: 'pending'
    });

    // Set current process if it's the first one
    if (!orderItem.currentProcess) {
      orderItem.currentProcess = processId;
      orderItem.processStatus = 'in_progress';
    }

    await order.save();
    res.json({ message: 'Process assigned successfully', order });
  } catch (error) {
    console.error('Assign process error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update process status
router.put('/:orderId/items/:itemId/processes/:processId', auth, checkPermission('orders', 'update'), async (req, res) => {
  try {
    const { status, notes, completionDate } = req.body;

    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const orderItem = order.items.id(req.params.itemId);
    if (!orderItem) {
      return res.status(404).json({ message: 'Order item not found' });
    }

    const process = orderItem.processes.id(req.params.processId);
    if (!process) {
      return res.status(404).json({ message: 'Process not found' });
    }

    process.status = status;
    if (notes) process.notes = notes;
    if (completionDate) process.completionDate = completionDate;

    // Update item process status
    if (status === 'completed') {
      // Find next process
      const processIndex = orderItem.processes.findIndex(p => p._id.toString() === req.params.processId);
      if (processIndex < orderItem.processes.length - 1) {
        orderItem.currentProcess = orderItem.processes[processIndex + 1].process;
        orderItem.processes[processIndex + 1].status = 'in_progress';
        orderItem.processes[processIndex + 1].startDate = new Date();
      } else {
        // All processes completed
        orderItem.processStatus = 'completed';
        orderItem.currentProcess = null;
      }
    }

    await order.save();
    res.json({ message: 'Process status updated successfully', order });
  } catch (error) {
    console.error('Update process status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check raw material availability
router.get('/:id/material-check', auth, checkPermission('orders', 'read'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.item');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const materialCheck = await Promise.all(
      order.items.map(async (orderItem) => {
        const inventory = await Inventory.findOne({ item: orderItem.item._id });
        const availableStock = inventory ? inventory.currentStock - inventory.reservedStock : 0;
        const requiredQuantity = orderItem.quantity;

        return {
          item: orderItem.item,
          requiredQuantity,
          availableStock,
          shortage: Math.max(0, requiredQuantity - availableStock),
          status: availableStock >= requiredQuantity ? 'available' : 'shortage'
        };
      })
    );

    res.json({ materialCheck });
  } catch (error) {
    console.error('Material check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// JOB CARDS ROUTES
// Get all job cards
router.get('/job-cards', auth, checkPermission('orders', 'read'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, assignedTo } = req.query;
    
    let query = {};
    if (search) {
      query.jobCardNumber = { $regex: search, $options: 'i' };
    }
    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;

    const jobCards = await JobCard.find(query)
      .populate('order', 'orderNumber type')
      .populate('item', 'name itemCode')
      .populate('process', 'processName')
      .populate('assignedTo', 'firstName lastName')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await JobCard.countDocuments(query);

    res.json({
      jobCards,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get job cards error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create job card
router.post('/job-cards', auth, checkPermission('orders', 'create'), async (req, res) => {
  try {
    const jobCardNumber = `JC-${Date.now()}`;
    
    const jobCard = new JobCard({
      ...req.body,
      jobCardNumber,
      createdBy: req.user._id
    });

    await jobCard.save();
    await jobCard.populate('order', 'orderNumber');
    await jobCard.populate('item', 'name itemCode');
    await jobCard.populate('process', 'processName');
    await jobCard.populate('assignedTo', 'firstName lastName');

    res.status(201).json({ message: 'Job card created successfully', jobCard });
  } catch (error) {
    console.error('Create job card error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update job card
router.put('/job-cards/:id', auth, checkPermission('orders', 'update'), async (req, res) => {
  try {
    const jobCard = await JobCard.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('order', 'orderNumber')
     .populate('item', 'name itemCode')
     .populate('process', 'processName')
     .populate('assignedTo', 'firstName lastName');

    if (!jobCard) {
      return res.status(404).json({ message: 'Job card not found' });
    }

    res.json({ message: 'Job card updated successfully', jobCard });
  } catch (error) {
    console.error('Update job card error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit job card completion
router.post('/job-cards/:id/complete', auth, checkPermission('orders', 'update'), async (req, res) => {
  try {
    const { completionNotes, qualityChecks, materials, attachments } = req.body;

    const jobCard = await JobCard.findById(req.params.id);
    if (!jobCard) {
      return res.status(404).json({ message: 'Job card not found' });
    }

    if (jobCard.status === 'completed') {
      return res.status(400).json({ message: 'Job card already completed' });
    }

    jobCard.status = 'completed';
    jobCard.actualCompletionDate = new Date();
    jobCard.completionNotes = completionNotes;
    if (qualityChecks) jobCard.qualityChecks = qualityChecks;
    if (materials) jobCard.materials = materials;
    if (attachments) jobCard.attachments = attachments;

    await jobCard.save();

    res.json({ message: 'Job card completed successfully', jobCard });
  } catch (error) {
    console.error('Complete job card error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELIVERY CHALLAN ROUTES
// Get all delivery challans
router.get('/delivery-challans', auth, checkPermission('orders', 'read'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, type, status } = req.query;
    
    let query = {};
    if (search) {
      query.challanNumber = { $regex: search, $options: 'i' };
    }
    if (type) query.type = type;
    if (status) query.status = status;

    const challans = await DeliveryChallan.find(query)
      .populate('customer', 'name companyName')
      .populate('vendor', 'name companyName')
      .populate('order', 'orderNumber')
      .populate('items.item', 'name itemCode')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await DeliveryChallan.countDocuments(query);

    res.json({
      challans,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get delivery challans error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create delivery challan
router.post('/delivery-challans', auth, checkPermission('orders', 'create'), async (req, res) => {
  try {
    const challanNumber = `DC-${Date.now()}`;
    
    const challan = new DeliveryChallan({
      ...req.body,
      challanNumber,
      createdBy: req.user._id
    });

    await challan.save();
    await challan.populate('customer', 'name companyName');
    await challan.populate('vendor', 'name companyName');
    await challan.populate('items.item', 'name itemCode');

    res.status(201).json({ message: 'Delivery challan created successfully', challan });
  } catch (error) {
    console.error('Create delivery challan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get orders dashboard stats
router.get('/stats/dashboard', auth, checkPermission('orders', 'read'), async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: { $in: ['draft', 'confirmed'] } });
    const inProductionOrders = await Order.countDocuments({ status: 'in_production' });
    const completedOrders = await Order.countDocuments({ status: 'completed' });
    
    const overdueOrders = await Order.countDocuments({
      expectedDeliveryDate: { $lt: new Date() },
      status: { $nin: ['completed', 'cancelled'] }
    });

    const activeJobCards = await JobCard.countDocuments({ 
      status: { $in: ['assigned', 'in_progress'] } 
    });

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const ordersByPriority = await Order.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    res.json({
      totalOrders,
      pendingOrders,
      inProductionOrders,
      completedOrders,
      overdueOrders,
      activeJobCards,
      ordersByStatus,
      ordersByPriority
    });
  } catch (error) {
    console.error('Get orders dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
