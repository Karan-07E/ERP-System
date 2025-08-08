const express = require('express');
const { BOM, MaterialSpecification, MaterialConsumption } = require('../models/Material');
const { Item } = require('../models/Accounting');
const { auth, checkPermission } = require('../middleware/auth');
const router = express.Router();

// BOM ROUTES
// Get all BOMs
router.get('/bom', auth, checkPermission('materials', 'read'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;
    
    let query = {};
    if (search) {
      query.$or = [
        { itemCode: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const boms = await BOM.find(query)
      .populate('parentItem', 'name itemCode')
      .populate('materials.material', 'name itemCode unit')
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await BOM.countDocuments(query);

    res.json({
      boms,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get BOMs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get BOM by ID
router.get('/bom/:id', auth, checkPermission('materials', 'read'), async (req, res) => {
  try {
    const bom = await BOM.findById(req.params.id)
      .populate('parentItem', 'name itemCode unit')
      .populate('materials.material', 'name itemCode unit purchasePrice')
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName');

    if (!bom) {
      return res.status(404).json({ message: 'BOM not found' });
    }

    res.json({ bom });
  } catch (error) {
    console.error('Get BOM error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create BOM
router.post('/bom', auth, checkPermission('materials', 'create'), async (req, res) => {
  try {
    const { parentItem, materials, laborCost, overheadCost, profitMargin } = req.body;

    // Check if BOM already exists for this item
    const existingBOM = await BOM.findOne({ 
      parentItem, 
      isActive: true 
    });

    if (existingBOM) {
      return res.status(400).json({ 
        message: 'Active BOM already exists for this item' 
      });
    }

    // Generate item code
    const itemCode = `BOM-${Date.now()}`;

    const bom = new BOM({
      itemCode,
      parentItem,
      materials,
      laborCost: laborCost || 0,
      overheadCost: overheadCost || 0,
      profitMargin: profitMargin || 0,
      createdBy: req.user._id
    });

    await bom.save();
    await bom.populate('parentItem', 'name itemCode');
    await bom.populate('materials.material', 'name itemCode unit');

    res.status(201).json({ message: 'BOM created successfully', bom });
  } catch (error) {
    console.error('Create BOM error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update BOM
router.put('/bom/:id', auth, checkPermission('materials', 'update'), async (req, res) => {
  try {
    const bom = await BOM.findById(req.params.id);
    if (!bom) {
      return res.status(404).json({ message: 'BOM not found' });
    }

    // Don't allow updating approved BOMs
    if (bom.approvedBy) {
      return res.status(400).json({ message: 'Cannot update approved BOM' });
    }

    const updatedBOM = await BOM.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('parentItem', 'name itemCode')
     .populate('materials.material', 'name itemCode unit');

    res.json({ message: 'BOM updated successfully', bom: updatedBOM });
  } catch (error) {
    console.error('Update BOM error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve BOM
router.post('/bom/:id/approve', auth, checkPermission('materials', 'update'), async (req, res) => {
  try {
    const bom = await BOM.findById(req.params.id);
    if (!bom) {
      return res.status(404).json({ message: 'BOM not found' });
    }

    if (bom.approvedBy) {
      return res.status(400).json({ message: 'BOM already approved' });
    }

    bom.approvedBy = req.user._id;
    bom.approvalDate = new Date();
    await bom.save();

    res.json({ message: 'BOM approved successfully', bom });
  } catch (error) {
    console.error('Approve BOM error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Calculate material requirement for quantity
router.post('/bom/:id/calculate', auth, checkPermission('materials', 'read'), async (req, res) => {
  try {
    const { quantity } = req.body;
    
    const bom = await BOM.findById(req.params.id)
      .populate('materials.material', 'name itemCode unit purchasePrice');

    if (!bom) {
      return res.status(404).json({ message: 'BOM not found' });
    }

    const materialRequirement = bom.materials.map(material => ({
      material: material.material,
      requiredQuantity: material.actualQuantity * quantity,
      totalCost: material.totalCost * quantity,
      unit: material.unit
    }));

    const totalMaterialCost = bom.totalMaterialCost * quantity;
    const totalCost = bom.totalCost * quantity;
    const sellingPrice = bom.sellingPrice * quantity;

    res.json({
      quantity,
      materialRequirement,
      totalMaterialCost,
      totalCost,
      sellingPrice,
      laborCost: bom.laborCost * quantity,
      overheadCost: bom.overheadCost * quantity
    });
  } catch (error) {
    console.error('Calculate BOM error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// MATERIAL SPECIFICATIONS ROUTES
// Get all material specifications
router.get('/specifications', auth, checkPermission('materials', 'read'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, material, isActive } = req.query;
    
    let query = {};
    if (search) {
      query.specificationName = { $regex: search, $options: 'i' };
    }
    if (material) query.material = material;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const specifications = await MaterialSpecification.find(query)
      .populate('material', 'name itemCode')
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MaterialSpecification.countDocuments(query);

    res.json({
      specifications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get specifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create material specification
router.post('/specifications', auth, checkPermission('materials', 'create'), async (req, res) => {
  try {
    const specification = new MaterialSpecification({
      ...req.body,
      createdBy: req.user._id
    });

    await specification.save();
    await specification.populate('material', 'name itemCode');

    res.status(201).json({ 
      message: 'Material specification created successfully', 
      specification 
    });
  } catch (error) {
    console.error('Create specification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update material specification
router.put('/specifications/:id', auth, checkPermission('materials', 'update'), async (req, res) => {
  try {
    const specification = await MaterialSpecification.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('material', 'name itemCode');

    if (!specification) {
      return res.status(404).json({ message: 'Specification not found' });
    }

    res.json({ 
      message: 'Specification updated successfully', 
      specification 
    });
  } catch (error) {
    console.error('Update specification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// MATERIAL CONSUMPTION ROUTES
// Get all material consumptions
router.get('/consumption', auth, checkPermission('materials', 'read'), async (req, res) => {
  try {
    const { page = 1, limit = 10, jobCard, order, status } = req.query;
    
    let query = {};
    if (jobCard) query.jobCard = jobCard;
    if (order) query.order = order;
    if (status) query.status = status;

    const consumptions = await MaterialConsumption.find(query)
      .populate('jobCard', 'jobCardNumber')
      .populate('order', 'orderNumber')
      .populate('materials.material', 'name itemCode unit')
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MaterialConsumption.countDocuments(query);

    res.json({
      consumptions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get consumptions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create material consumption
router.post('/consumption', auth, checkPermission('materials', 'create'), async (req, res) => {
  try {
    const consumption = new MaterialConsumption({
      ...req.body,
      createdBy: req.user._id
    });

    await consumption.save();
    await consumption.populate('jobCard', 'jobCardNumber');
    await consumption.populate('order', 'orderNumber');
    await consumption.populate('materials.material', 'name itemCode');

    res.status(201).json({ 
      message: 'Material consumption created successfully', 
      consumption 
    });
  } catch (error) {
    console.error('Create consumption error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve material consumption
router.post('/consumption/:id/approve', auth, checkPermission('materials', 'update'), async (req, res) => {
  try {
    const consumption = await MaterialConsumption.findById(req.params.id);
    if (!consumption) {
      return res.status(404).json({ message: 'Consumption record not found' });
    }

    if (consumption.status !== 'submitted') {
      return res.status(400).json({ message: 'Consumption is not in submitted status' });
    }

    consumption.status = 'approved';
    consumption.approvedBy = req.user._id;
    await consumption.save();

    res.json({ message: 'Material consumption approved successfully', consumption });
  } catch (error) {
    console.error('Approve consumption error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get material requirements for order
router.get('/requirements/:orderId', auth, checkPermission('materials', 'read'), async (req, res) => {
  try {
    const { Order } = require('../models/Order');
    
    const order = await Order.findById(req.params.orderId)
      .populate('items.item');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const materialRequirements = [];

    for (const orderItem of order.items) {
      const bom = await BOM.findOne({ 
        parentItem: orderItem.item._id, 
        isActive: true 
      }).populate('materials.material', 'name itemCode unit');

      if (bom) {
        for (const bomMaterial of bom.materials) {
          const totalRequired = bomMaterial.actualQuantity * orderItem.quantity;
          
          const existingReq = materialRequirements.find(req => 
            req.material._id.toString() === bomMaterial.material._id.toString()
          );

          if (existingReq) {
            existingReq.totalQuantity += totalRequired;
          } else {
            materialRequirements.push({
              material: bomMaterial.material,
              unitQuantity: bomMaterial.actualQuantity,
              totalQuantity: totalRequired,
              unit: bomMaterial.unit,
              forItem: orderItem.item.name
            });
          }
        }
      }
    }

    res.json({ materialRequirements });
  } catch (error) {
    console.error('Get material requirements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get materials dashboard stats
router.get('/stats/dashboard', auth, checkPermission('materials', 'read'), async (req, res) => {
  try {
    const totalBOMs = await BOM.countDocuments({ isActive: true });
    const approvedBOMs = await BOM.countDocuments({ isActive: true, approvedBy: { $exists: true } });
    const totalSpecifications = await MaterialSpecification.countDocuments({ isActive: true });
    
    const pendingConsumptions = await MaterialConsumption.countDocuments({ 
      status: 'submitted' 
    });

    const avgWastage = await MaterialConsumption.aggregate([
      { $unwind: '$materials' },
      {
        $group: {
          _id: null,
          avgWastagePercentage: {
            $avg: {
              $multiply: [
                { $divide: ['$materials.wastedQuantity', '$materials.actualQuantity'] },
                100
              ]
            }
          }
        }
      }
    ]);

    res.json({
      totalBOMs,
      approvedBOMs,
      pendingBOMApprovals: totalBOMs - approvedBOMs,
      totalSpecifications,
      pendingConsumptions,
      avgWastagePercentage: avgWastage[0]?.avgWastagePercentage || 0
    });
  } catch (error) {
    console.error('Get materials dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
