const express = require('express');
const { Process, QualityControl, InspectionReport, sequelize } = require('../models');
const { auth, checkPermission } = require('../middleware/auth');
const { validate, processSchemas } = require('../middleware/validation');
const { Op } = require('sequelize');
const router = express.Router();

// PROCESSES ROUTES
// Get all processes
router.get('/', auth, checkPermission('processes', 'read'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, department, isActive } = req.query;
    
    let where = {};
    if (search) {
      where[Op.or] = [
        { processName: { [Op.iLike]: `%${search}%` } },
        { processCode: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (category) where.category = category;
    if (department) where.department = department;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const { count, rows: processes } = await Process.findAndCountAll({
      where,
      include: [
        {
          association: 'creator',
          attributes: ['firstName', 'lastName']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit
    });

    res.json({
      processes,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    console.error('Get processes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get process by ID
router.get('/:id', auth, checkPermission('processes', 'read'), async (req, res) => {
  try {
    const process = await Process.findByPk(req.params.id, {
      include: [
        {
          association: 'creator',
          attributes: ['firstName', 'lastName']
        }
      ]
    });

    if (!process) {
      return res.status(404).json({ message: 'Process not found' });
    }

    res.json({ process });
  } catch (error) {
    console.error('Get process error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create process
router.post('/', auth, checkPermission('processes', 'create'), validate(processSchemas.create), async (req, res) => {
  try {
    const process = await Process.create({
      ...req.body,
      createdBy: req.user.id
    });

    const processWithAssociations = await Process.findByPk(process.id, {
      include: [
        {
          association: 'creator',
          attributes: ['firstName', 'lastName']
        }
      ]
    });

    res.status(201).json({ message: 'Process created successfully', process: processWithAssociations });
  } catch (error) {
    console.error('Create process error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ message: 'Process with this code already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// Update process
router.put('/:id', auth, checkPermission('processes', 'update'), async (req, res) => {
  try {
    const [updatedRowsCount] = await Process.update(req.body, {
      where: { id: req.params.id }
    });

    if (updatedRowsCount === 0) {
      return res.status(404).json({ message: 'Process not found' });
    }

    const process = await Process.findByPk(req.params.id, {
      include: [
        {
          association: 'creator',
          attributes: ['firstName', 'lastName']
        }
      ]
    });

    res.json({ message: 'Process updated successfully', process });
  } catch (error) {
    console.error('Update process error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete process (soft delete)
router.delete('/:id', auth, checkPermission('processes', 'delete'), async (req, res) => {
  try {
    const [updatedRowsCount] = await Process.update(
      { isActive: false },
      { where: { id: req.params.id } }
    );

    if (updatedRowsCount === 0) {
      return res.status(404).json({ message: 'Process not found' });
    }

    res.json({ message: 'Process deleted successfully' });
  } catch (error) {
    console.error('Delete process error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// QUALITY CONTROL ROUTES
// Get all quality controls
router.get('/quality-control', auth, checkPermission('processes', 'read'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, type, status, item } = req.query;
    
    let where = {};
    if (search) {
      where.qcNumber = { [Op.iLike]: `%${search}%` };
    }
    if (type) where.type = type;
    if (status) where.overall_status = status;
    if (item) where.item = item;

    const { count, rows: qualityControls } = await QualityControl.findAndCountAll({
      where,
      include: [
        {
          association: 'itemDetails',
          attributes: ['name', 'itemCode']
        },
        {
          association: 'checker',
          attributes: ['firstName', 'lastName']
        },
        {
          association: 'approver',
          attributes: ['firstName', 'lastName']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit
    });

    res.json({
      qualityControls,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    console.error('Get quality controls error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create quality control
router.post('/quality-control', auth, checkPermission('processes', 'create'), async (req, res) => {
  try {
    const qcNumber = `QC-${Date.now()}`;
    
    const qualityControl = await QualityControl.create({
      ...req.body,
      qcNumber,
      checkedBy: req.user.id
    });

    const qualityControlWithAssociations = await QualityControl.findByPk(qualityControl.id, {
      include: [
        {
          association: 'itemDetails',
          attributes: ['name', 'itemCode']
        }
      ]
    });

    res.status(201).json({ 
      message: 'Quality control created successfully', 
      qualityControl: qualityControlWithAssociations 
    });
  } catch (error) {
    console.error('Create quality control error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update quality control
router.put('/quality-control/:id', auth, checkPermission('processes', 'update'), async (req, res) => {
  try {
    const [updatedRowsCount] = await QualityControl.update(req.body, {
      where: { id: req.params.id }
    });

    if (updatedRowsCount === 0) {
      return res.status(404).json({ message: 'Quality control not found' });
    }

    const qualityControl = await QualityControl.findByPk(req.params.id, {
      include: [
        {
          association: 'itemDetails',
          attributes: ['name', 'itemCode']
        },
        {
          association: 'checker',
          attributes: ['firstName', 'lastName']
        }
      ]
    });

    res.json({ 
      message: 'Quality control updated successfully', 
      qualityControl 
    });
  } catch (error) {
    console.error('Update quality control error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve quality control
router.post('/quality-control/:id/approve', auth, checkPermission('processes', 'update'), async (req, res) => {
  try {
    const qualityControl = await QualityControl.findByPk(req.params.id);
    if (!qualityControl) {
      return res.status(404).json({ message: 'Quality control not found' });
    }

    await qualityControl.update({
      approvedBy: req.user.id,
      approvalDate: new Date()
    });

    res.json({ message: 'Quality control approved successfully', qualityControl });
  } catch (error) {
    console.error('Approve quality control error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// INSPECTION REPORTS ROUTES
// Get all inspection reports
router.get('/inspection-reports', auth, checkPermission('processes', 'read'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, type, result, inspector } = req.query;
    
    let where = {};
    if (search) {
      where.reportNumber = { [Op.iLike]: `%${search}%` };
    }
    if (type) where.type = type;
    if (result) where.overallResult = result;
    if (inspector) where.inspector = inspector;

    const { count, rows: reports } = await InspectionReport.findAndCountAll({
      where,
      include: [
        {
          association: 'itemDetails',
          attributes: ['name', 'itemCode']
        },
        {
          association: 'processDetails',
          attributes: ['processName']
        },
        {
          association: 'inspectorDetails',
          attributes: ['firstName', 'lastName']
        },
        {
          association: 'customerDetails',
          attributes: ['name', 'companyName']
        },
        {
          association: 'vendorDetails',
          attributes: ['name', 'companyName']
        },
        {
          association: 'creator',
          attributes: ['firstName', 'lastName']
        },
        {
          association: 'approver',
          attributes: ['firstName', 'lastName']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit
    });

    res.json({
      reports,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    console.error('Get inspection reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create inspection report
router.post('/inspection-reports', auth, checkPermission('processes', 'create'), async (req, res) => {
  try {
    const reportNumber = `IR-${Date.now()}`;
    
    const report = await InspectionReport.create({
      ...req.body,
      reportNumber,
      createdBy: req.user.id
    });

    const reportWithAssociations = await InspectionReport.findByPk(report.id, {
      include: [
        {
          association: 'itemDetails',
          attributes: ['name', 'itemCode']
        },
        {
          association: 'processDetails',
          attributes: ['processName']
        },
        {
          association: 'inspectorDetails',
          attributes: ['firstName', 'lastName']
        }
      ]
    });

    res.status(201).json({ 
      message: 'Inspection report created successfully', 
      report: reportWithAssociations 
    });
  } catch (error) {
    console.error('Create inspection report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update inspection report
router.put('/inspection-reports/:id', auth, checkPermission('processes', 'update'), async (req, res) => {
  try {
    const [updatedRowsCount] = await InspectionReport.update(req.body, {
      where: { id: req.params.id }
    });

    if (updatedRowsCount === 0) {
      return res.status(404).json({ message: 'Inspection report not found' });
    }

    const report = await InspectionReport.findByPk(req.params.id, {
      include: [
        {
          association: 'itemDetails',
          attributes: ['name', 'itemCode']
        },
        {
          association: 'processDetails',
          attributes: ['processName']
        },
        {
          association: 'inspectorDetails',
          attributes: ['firstName', 'lastName']
        }
      ]
    });

    res.json({ 
      message: 'Inspection report updated successfully', 
      report 
    });
  } catch (error) {
    console.error('Update inspection report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve inspection report
router.post('/inspection-reports/:id/approve', auth, checkPermission('processes', 'update'), async (req, res) => {
  try {
    const report = await InspectionReport.findByPk(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Inspection report not found' });
    }

    await report.update({
      approvedBy: req.user.id
    });

    res.json({ message: 'Inspection report approved successfully', report });
  } catch (error) {
    console.error('Approve inspection report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get process efficiency stats
router.get('/stats/efficiency', auth, checkPermission('processes', 'read'), async (req, res) => {
  try {
    const { JobCard } = require('../models');
    const { sequelize } = require('../models');
    
    const processEfficiency = await JobCard.findAll({
      attributes: [
        'process',
        [sequelize.fn('COUNT', sequelize.col('JobCard.id')), 'totalJobs'],
        [sequelize.fn('AVG', 
          sequelize.literal('EXTRACT(EPOCH FROM ("actualCompletionDate" - "startDate")) / 3600')
        ), 'avgCycleTime'],
        [sequelize.fn('SUM', 
          sequelize.literal('CASE WHEN "actualCompletionDate" <= "targetCompletionDate" THEN 1 ELSE 0 END')
        ), 'onTimeDelivery']
      ],
      where: {
        status: 'completed',
        actualCompletionDate: { [Op.ne]: null }
      },
      include: [
        {
          association: 'processDetails',
          attributes: ['processName']
        }
      ],
      group: ['process', 'processDetails.id', 'processDetails.processName'],
      raw: false
    });

    // Calculate on-time percentage
    const processEfficiencyWithPercentage = processEfficiency.map(item => {
      const data = item.get({ plain: true });
      data.onTimePercentage = (data.onTimeDelivery / data.totalJobs) * 100;
      return data;
    });

    res.json({ processEfficiency: processEfficiencyWithPercentage });
  } catch (error) {
    console.error('Get process efficiency error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get quality statistics
router.get('/stats/quality', auth, checkPermission('processes', 'read'), async (req, res) => {
  try {
    const { sequelize } = require('../models');
    
    // Quality status distribution
    const qualityStats = await QualityControl.findAll({
      attributes: [
        'overall_status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['overall_status']
    });

    // Since JSONB defects are stored as JSON, we'll get all QC records and process in JavaScript
    const allQC = await QualityControl.findAll({
      attributes: ['defects']
    });

    // Process defect statistics
    const defectCounts = {};
    allQC.forEach(qc => {
      if (qc.defects && Array.isArray(qc.defects)) {
        qc.defects.forEach(defect => {
          if (defect.defectType) {
            defectCounts[defect.defectType] = (defectCounts[defect.defectType] || 0) + 1;
          }
        });
      }
    });

    const defectStats = Object.entries(defectCounts)
      .map(([defectType, count]) => ({ defectType, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Quality trend (last 12 months)
    const qualityTrend = await QualityControl.findAll({
      attributes: [
        [sequelize.fn('EXTRACT', sequelize.literal('YEAR FROM "checkDate"')), 'year'],
        [sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM "checkDate"')), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('SUM', 
          sequelize.literal('CASE WHEN "overall_status" = \'passed\' THEN 1 ELSE 0 END')
        ), 'passed']
      ],
      group: [
        sequelize.fn('EXTRACT', sequelize.literal('YEAR FROM "checkDate"')),
        sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM "checkDate"'))
      ],
      order: [
        [sequelize.fn('EXTRACT', sequelize.literal('YEAR FROM "checkDate"')), 'ASC'],
        [sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM "checkDate"')), 'ASC']
      ],
      limit: 12
    });

    // Calculate pass rate for trend data
    const qualityTrendWithPassRate = qualityTrend.map(item => {
      const data = item.get({ plain: true });
      data.passRate = (data.passed / data.total) * 100;
      return data;
    });

    res.json({
      qualityStats,
      defectStats,
      qualityTrend: qualityTrendWithPassRate
    });
  } catch (error) {
    console.error('Get quality stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get processes dashboard stats
router.get('/stats/dashboard', auth, checkPermission('processes', 'read'), async (req, res) => {
  try {
    const totalProcesses = await Process.count({ 
      where: { isActive: true } 
    });
    
    const activeQualityChecks = await QualityControl.count({ 
      where: { overall_status: 'on_hold' } 
    });
    
    const pendingInspections = await InspectionReport.count({ 
      where: { overallResult: 'pending' } 
    });
    
    // Calculate quality pass rate
    const qualityPassRateData = await QualityControl.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('SUM', 
          sequelize.literal('CASE WHEN "overall_status" = \'passed\' THEN 1 ELSE 0 END')
        ), 'passed']
      ]
    });

    const qualityPassRate = qualityPassRateData[0] ? 
      (qualityPassRateData[0].get('passed') / qualityPassRateData[0].get('total')) * 100 : 0;

    res.json({
      totalProcesses,
      activeQualityChecks,
      pendingInspections,
      qualityPassRate
    });
  } catch (error) {
    console.error('Get processes dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
