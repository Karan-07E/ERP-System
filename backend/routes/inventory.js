const express = require('express');
const { Inventory, StockMovement, GRN, GatePass } = require('../models/Inventory');
const { Item } = require('../models/Accounting');
const { auth, checkPermission } = require('../middleware/auth');
const router = express.Router();

// INVENTORY ROUTES
// Get all inventory
router.get('/', auth, checkPermission('inventory', 'read'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, location, lowStock } = req.query;
    
    let query = {};
    if (search) {
      const items = await Item.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { itemCode: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      query.item = { $in: items.map(item => item._id) };
    }
    if (location) {
      query['location.warehouse'] = location;
    }

    let inventory = await Inventory.find(query)
      .populate('item', 'name itemCode unit category')
      .sort({ 'item.name': 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Filter for low stock if requested
    if (lowStock === 'true') {
      inventory = inventory.filter(inv => inv.currentStock <= inv.minimumStock);
    }

    const total = await Inventory.countDocuments(query);

    res.json({
      inventory,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get inventory by item
router.get('/item/:itemId', auth, checkPermission('inventory', 'read'), async (req, res) => {
  try {
    const inventory = await Inventory.findOne({ item: req.params.itemId })
      .populate('item', 'name itemCode unit category');
    
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found for this item' });
    }

    res.json({ inventory });
  } catch (error) {
    console.error('Get inventory by item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update inventory stock
router.put('/:id/stock', auth, checkPermission('inventory', 'update'), async (req, res) => {
  try {
    const { quantity, type, reason, reference } = req.body;
    
    if (!quantity || !type || !reason) {
      return res.status(400).json({ message: 'Quantity, type, and reason are required' });
    }

    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found' });
    }

    const oldStock = inventory.currentStock;
    let newStock = oldStock;

    if (type === 'stock_in') {
      newStock += quantity;
    } else if (type === 'stock_out') {
      if (quantity > inventory.currentStock) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }
      newStock -= quantity;
    } else if (type === 'adjustment') {
      newStock = quantity;
    }

    // Update inventory
    inventory.currentStock = newStock;
    inventory.lastStockUpdate = new Date();
    await inventory.save();

    // Create stock movement record
    const stockMovement = new StockMovement({
      item: inventory.item,
      movementType: type,
      transactionType: 'manual',
      quantity: type === 'adjustment' ? newStock - oldStock : quantity,
      reason,
      reference: {
        referenceType: 'manual',
        referenceNumber: reference || 'Manual Update'
      },
      toLocation: inventory.location,
      createdBy: req.user._id
    });

    await stockMovement.save();

    res.json({ 
      message: 'Stock updated successfully', 
      inventory,
      stockMovement 
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create/Update inventory location
router.post('/location', auth, checkPermission('inventory', 'create'), async (req, res) => {
  try {
    const { itemId, location, currentStock, minimumStock, maximumStock } = req.body;

    let inventory = await Inventory.findOne({ item: itemId });
    
    if (inventory) {
      // Update existing inventory
      inventory.location = location;
      inventory.currentStock = currentStock || inventory.currentStock;
      inventory.minimumStock = minimumStock || inventory.minimumStock;
      inventory.maximumStock = maximumStock || inventory.maximumStock;
      inventory.lastStockUpdate = new Date();
    } else {
      // Create new inventory
      inventory = new Inventory({
        item: itemId,
        location,
        currentStock: currentStock || 0,
        minimumStock: minimumStock || 10,
        maximumStock: maximumStock || 1000
      });
    }

    await inventory.save();
    await inventory.populate('item', 'name itemCode unit');

    res.status(201).json({ 
      message: 'Inventory location updated successfully', 
      inventory 
    });
  } catch (error) {
    console.error('Update inventory location error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// STOCK MOVEMENTS ROUTES
// Get stock movements
router.get('/movements', auth, checkPermission('inventory', 'read'), async (req, res) => {
  try {
    const { page = 1, limit = 10, itemId, movementType, startDate, endDate } = req.query;
    
    let query = {};
    if (itemId) query.item = itemId;
    if (movementType) query.movementType = movementType;
    if (startDate || endDate) {
      query.movementDate = {};
      if (startDate) query.movementDate.$gte = new Date(startDate);
      if (endDate) query.movementDate.$lte = new Date(endDate);
    }

    const movements = await StockMovement.find(query)
      .populate('item', 'name itemCode unit')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await StockMovement.countDocuments(query);

    res.json({
      movements,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get stock movements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GRN ROUTES
// Get all GRNs
router.get('/grn', auth, checkPermission('inventory', 'read'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, vendor } = req.query;
    
    let query = {};
    if (search) {
      query.grnNumber = { $regex: search, $options: 'i' };
    }
    if (status) query.status = status;
    if (vendor) query.vendor = vendor;

    const grns = await GRN.find(query)
      .populate('vendor', 'name companyName')
      .populate('purchaseOrder', 'orderNumber')
      .populate('items.item', 'name itemCode unit')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await GRN.countDocuments(query);

    res.json({
      grns,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get GRNs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create GRN
router.post('/grn', auth, checkPermission('inventory', 'create'), async (req, res) => {
  try {
    const grnNumber = `GRN-${Date.now()}`;
    
    // Calculate total amount
    const totalAmount = req.body.items.reduce((sum, item) => 
      sum + (item.acceptedQuantity * item.unitPrice), 0
    );

    const grn = new GRN({
      ...req.body,
      grnNumber,
      totalAmount,
      createdBy: req.user._id
    });

    await grn.save();
    await grn.populate('vendor', 'name companyName');
    await grn.populate('items.item', 'name itemCode');

    res.status(201).json({ message: 'GRN created successfully', grn });
  } catch (error) {
    console.error('Create GRN error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve GRN and update inventory
router.post('/grn/:id/approve', auth, checkPermission('inventory', 'update'), async (req, res) => {
  try {
    const grn = await GRN.findById(req.params.id);
    if (!grn) {
      return res.status(404).json({ message: 'GRN not found' });
    }

    if (grn.status !== 'submitted') {
      return res.status(400).json({ message: 'GRN is not in submitted status' });
    }

    // Update inventory for each item
    for (const item of grn.items) {
      if (item.acceptedQuantity > 0) {
        let inventory = await Inventory.findOne({ item: item.item });
        
        if (!inventory) {
          // Create new inventory entry
          inventory = new Inventory({
            item: item.item,
            location: item.location || { warehouse: 'Main Warehouse' },
            currentStock: item.acceptedQuantity,
            minimumStock: 10,
            maximumStock: 1000
          });
        } else {
          // Update existing inventory
          inventory.currentStock += item.acceptedQuantity;
          inventory.lastStockUpdate = new Date();
        }

        await inventory.save();

        // Create stock movement
        const stockMovement = new StockMovement({
          item: item.item,
          movementType: 'stock_in',
          transactionType: 'purchase',
          quantity: item.acceptedQuantity,
          unitPrice: item.unitPrice,
          totalValue: item.acceptedQuantity * item.unitPrice,
          toLocation: item.location || inventory.location,
          reference: {
            referenceType: 'grn',
            referenceId: grn._id,
            referenceNumber: grn.grnNumber
          },
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate,
          reason: 'Purchase receipt',
          createdBy: req.user._id
        });

        await stockMovement.save();
      }
    }

    // Update GRN status
    grn.status = 'approved';
    grn.approvedBy = req.user._id;
    await grn.save();

    res.json({ message: 'GRN approved and inventory updated successfully', grn });
  } catch (error) {
    console.error('Approve GRN error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GATE PASS ROUTES
// Get all gate passes
router.get('/gate-pass', auth, checkPermission('inventory', 'read'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, type, status } = req.query;
    
    let query = {};
    if (search) {
      query.$or = [
        { gatePassNumber: { $regex: search, $options: 'i' } },
        { 'party.name': { $regex: search, $options: 'i' } }
      ];
    }
    if (type) query.type = type;
    if (status) query.status = status;

    const gatePasses = await GatePass.find(query)
      .populate('items.item', 'name itemCode unit')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await GatePass.countDocuments(query);

    res.json({
      gatePasses,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get gate passes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create gate pass
router.post('/gate-pass', auth, checkPermission('inventory', 'create'), async (req, res) => {
  try {
    const gatePassNumber = `GP-${Date.now()}`;
    
    const gatePass = new GatePass({
      ...req.body,
      gatePassNumber,
      createdBy: req.user._id
    });

    await gatePass.save();
    await gatePass.populate('items.item', 'name itemCode');

    res.status(201).json({ message: 'Gate pass created successfully', gatePass });
  } catch (error) {
    console.error('Create gate pass error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get low stock items
router.get('/low-stock', auth, checkPermission('inventory', 'read'), async (req, res) => {
  try {
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ['$currentStock', '$minimumStock'] }
    }).populate('item', 'name itemCode unit category');

    res.json({ lowStockItems });
  } catch (error) {
    console.error('Get low stock items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get inventory dashboard stats
router.get('/stats/dashboard', auth, checkPermission('inventory', 'read'), async (req, res) => {
  try {
    const totalItems = await Inventory.countDocuments();
    const lowStockItems = await Inventory.countDocuments({
      $expr: { $lte: ['$currentStock', '$minimumStock'] }
    });
    const outOfStockItems = await Inventory.countDocuments({ currentStock: 0 });
    
    const totalStockValue = await Inventory.aggregate([
      {
        $lookup: {
          from: 'items',
          localField: 'item',
          foreignField: '_id',
          as: 'itemDetails'
        }
      },
      {
        $project: {
          stockValue: {
            $multiply: ['$currentStock', { $arrayElemAt: ['$itemDetails.purchasePrice', 0] }]
          }
        }
      },
      {
        $group: {
          _id: null,
          totalValue: { $sum: '$stockValue' }
        }
      }
    ]);

    const pendingGRNs = await GRN.countDocuments({ status: 'submitted' });
    const activeGatePasses = await GatePass.countDocuments({ 
      status: { $in: ['issued', 'in_transit'] } 
    });

    res.json({
      totalItems,
      lowStockItems,
      outOfStockItems,
      totalStockValue: totalStockValue[0]?.totalValue || 0,
      pendingGRNs,
      activeGatePasses
    });
  } catch (error) {
    console.error('Get inventory dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
