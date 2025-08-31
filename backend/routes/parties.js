const express = require('express');
const router = express.Router();
const { Party } = require('../models');
const { auth } = require('../middleware/auth');
const { Op } = require('sequelize');

// Helper function to generate party code
const generatePartyCode = async (type) => {
  const prefix = type === 'customer' ? 'C' : 'V';
  const count = await Party.count({ where: { type } });
  return `${prefix}${String(count + 1).padStart(5, '0')}`;
};

// Helper function to calculate GST breakdown
const calculateGSTBreakdown = (amount, gstRate, fromState, toState) => {
  const gstAmount = (amount * gstRate) / 100;
  
  if (fromState === toState) {
    // Intra-state: CGST + SGST
    return {
      cgstAmount: gstAmount / 2,
      sgstAmount: gstAmount / 2,
      igstAmount: 0,
      totalGstAmount: gstAmount
    };
  } else {
    // Inter-state: IGST
    return {
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: gstAmount,
      totalGstAmount: gstAmount
    };
  }
};

// Get all parties with filters
router.get('/', auth, async (req, res) => {
  try {
    const { 
      type, 
      state, 
      isActive, 
      search, 
      page = 1, 
      limit = 20,
      sortBy = 'name',
      sortOrder = 'ASC'
    } = req.query;

    const where = {};
    
    if (type) where.type = type;
    if (state) where.state = state;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { partyCode: { [Op.iLike]: `%${search}%` } },
        { gstNumber: { [Op.iLike]: `%${search}%` } },
        { contactPerson: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;
    
    const { count, rows } = await Party.findAndCountAll({
      where,
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        parties: rows,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(count / limit),
          total: count
        }
      }
    });
  } catch (error) {
    console.error('Error fetching parties:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching parties',
      error: error.message
    });
  }
});

// Get party by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const party = await Party.findByPk(req.params.id);
    
    if (!party) {
      return res.status(404).json({
        success: false,
        message: 'Party not found'
      });
    }

    res.json({
      success: true,
      data: party
    });
  } catch (error) {
    console.error('Error fetching party:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching party',
      error: error.message
    });
  }
});

// Create new party
router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      type,
      contactPerson,
      email,
      phone,
      mobile,
      address,
      city,
      state,
      pincode,
      country = 'India',
      gstNumber,
      panNumber,
      stateCode,
      creditLimit = 0,
      creditDays = 0,
      paymentTerms,
      bankDetails = {},
      notes
    } = req.body;

    // Generate party code
    const partyCode = await generatePartyCode(type);

    // Convert empty strings to null for optional fields
    const cleanGstNumber = gstNumber && gstNumber.trim() !== '' ? gstNumber.trim() : null;
    const cleanPanNumber = panNumber && panNumber.trim() !== '' ? panNumber.trim() : null;

    const party = await Party.create({
      partyCode,
      name,
      type,
      contactPerson,
      email,
      phone,
      mobile,
      address,
      city,
      state,
      pincode,
      country,
      gstNumber: cleanGstNumber,
      panNumber: cleanPanNumber,
      stateCode,
      creditLimit,
      creditDays,
      paymentTerms,
      bankDetails,
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Party created successfully',
      data: party
    });
  } catch (error) {
    console.error('Error creating party:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating party',
      error: error.message
    });
  }
});

// Update party
router.put('/:id', auth, async (req, res) => {
  try {
    const party = await Party.findByPk(req.params.id);
    
    if (!party) {
      return res.status(404).json({
        success: false,
        message: 'Party not found'
      });
    }

    await party.update(req.body);

    res.json({
      success: true,
      message: 'Party updated successfully',
      data: party
    });
  } catch (error) {
    console.error('Error updating party:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating party',
      error: error.message
    });
  }
});

// Delete party (soft delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    const party = await Party.findByPk(req.params.id);
    
    if (!party) {
      return res.status(404).json({
        success: false,
        message: 'Party not found'
      });
    }

    await party.update({ isActive: false });

    res.json({
      success: true,
      message: 'Party deactivated successfully'
    });
  } catch (error) {
    console.error('Error deleting party:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting party',
      error: error.message
    });
  }
});

// Get party GST details for calculations
router.get('/:id/gst-info', auth, async (req, res) => {
  try {
    const party = await Party.findByPk(req.params.id, {
      attributes: ['id', 'name', 'partyCode', 'gstNumber', 'state', 'stateCode']
    });
    
    if (!party) {
      return res.status(404).json({
        success: false,
        message: 'Party not found'
      });
    }

    res.json({
      success: true,
      data: party
    });
  } catch (error) {
    console.error('Error fetching party GST info:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching party GST info',
      error: error.message
    });
  }
});

// Get party dashboard stats
router.get('/:id/stats', auth, async (req, res) => {
  try {
    const party = await Party.findByPk(req.params.id);
    
    if (!party) {
      return res.status(404).json({
        success: false,
        message: 'Party not found'
      });
    }

    // Get order statistics
    const { Order } = require('../models');
    const orderStats = await Order.findAll({
      where: { partyId: req.params.id },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('grandTotal')), 'total']
      ],
      group: ['status'],
      raw: true
    });

    res.json({
      success: true,
      data: {
        party,
        orderStats
      }
    });
  } catch (error) {
    console.error('Error fetching party stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching party stats',
      error: error.message
    });
  }
});

module.exports = router;
