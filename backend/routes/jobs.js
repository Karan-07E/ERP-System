const express = require('express');
const router = express.Router();
const { Job, JobProcessStep, User, OrderItem, Order, Party } = require('../models');
const { auth } = require('../middleware/auth');
const { Op } = require('sequelize');

// Helper function to generate job ID
const generateJobId = async (employeeId) => {
  const user = await User.findByPk(employeeId);
  const timestamp = Date.now().toString().slice(-6);
  const jobCount = await Job.count({ where: { employeeId } });
  return `${user.userId}-${timestamp}-${String(jobCount + 1).padStart(3, '0')}`;
};

// Get all jobs with filters
router.get('/', auth, async (req, res) => {
  try {
    const {
      status,
      employeeId,
      priority,
      dateFrom,
      dateTo,
      page = 1,
      limit = 20,
      sortBy = 'targetCompletionDate',
      sortOrder = 'ASC'
    } = req.query;

    const where = {};
    
    if (status) {
      if (Array.isArray(status)) {
        where.status = { [Op.in]: status };
      } else {
        where.status = status;
      }
    }
    
    if (employeeId) where.employeeId = employeeId;
    if (priority) where.priority = priority;
    
    if (dateFrom || dateTo) {
      where.targetCompletionDate = {};
      if (dateFrom) where.targetCompletionDate[Op.gte] = new Date(dateFrom);
      if (dateTo) where.targetCompletionDate[Op.lte] = new Date(dateTo);
    }

    const offset = (page - 1) * limit;
    
    const { count, rows } = await Job.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'Employee',
          attributes: ['id', 'userId', 'firstName', 'lastName', 'department']
        },
        {
          model: User,
          as: 'Creator',
          attributes: ['id', 'userId', 'firstName', 'lastName']
        },
        {
          model: OrderItem,
          as: 'orderItem',
          include: [
            {
              model: Order,
              as: 'order',
              include: [
                {
                  model: Party,
                  as: 'party',
                  attributes: ['id', 'name', 'partyCode']
                }
              ]
            }
          ]
        }
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        jobs: rows,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(count / limit),
          total: count
        }
      }
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs',
      error: error.message
    });
  }
});

// Get job by ID with full details
router.get('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'Employee',
          attributes: ['id', 'userId', 'firstName', 'lastName', 'department', 'skillSet']
        },
        {
          model: User,
          as: 'Creator',
          attributes: ['id', 'userId', 'firstName', 'lastName']
        },
        {
          model: OrderItem,
          as: 'orderItem',
          include: [
            {
              model: Order,
              as: 'order',
              include: [
                {
                  model: Party,
                  as: 'party',
                  attributes: ['id', 'name', 'partyCode', 'contactPerson']
                }
              ]
            }
          ]
        },
        {
          model: JobProcessStep,
          as: 'processSteps',
          include: [
            {
              model: User,
              as: 'Employee',
              attributes: ['id', 'userId', 'firstName', 'lastName']
            }
          ],
          order: [['stepNumber', 'ASC']]
        }
      ]
    });
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job',
      error: error.message
    });
  }
});

// Create new job from order item
router.post('/', auth, async (req, res) => {
  try {
    const {
      orderItemId,
      employeeId,
      targetCompletionDate,
      priority = 'medium',
      workInstructions,
      notes
    } = req.body;

    // Get order item details
    const orderItem = await OrderItem.findByPk(orderItemId, {
      include: [
        {
          model: Order,
          as: 'order',
          include: [
            {
              model: Party,
              as: 'party'
            }
          ]
        }
      ]
    });

    if (!orderItem) {
      return res.status(404).json({
        success: false,
        message: 'Order item not found'
      });
    }

    // Generate unique job ID
    const jobId = await generateJobId(employeeId);

    const job = await Job.create({
      jobId,
      orderItemId,
      employeeId,
      partNumber: orderItem.partNumber,
      description: orderItem.description,
      quantity: orderItem.quantity,
      targetCompletionDate,
      priority,
      workInstructions,
      notes,
      createdBy: req.user.id
    });

    // Update order item with job reference
    await orderItem.update({ jobId: job.id, status: 'in_production' });

    // Fetch the created job with includes
    const createdJob = await Job.findByPk(job.id, {
      include: [
        {
          model: User,
          as: 'Employee',
          attributes: ['id', 'userId', 'firstName', 'lastName']
        },
        {
          model: OrderItem,
          as: 'orderItem',
          include: [
            {
              model: Order,
              as: 'order',
              include: [
                {
                  model: Party,
                  as: 'party',
                  attributes: ['id', 'name', 'partyCode']
                }
              ]
            }
          ]
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: createdJob
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating job',
      error: error.message
    });
  }
});

// Update job
router.put('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    await job.update(req.body);

    const updatedJob = await Job.findByPk(job.id, {
      include: [
        {
          model: User,
          as: 'Employee',
          attributes: ['id', 'userId', 'firstName', 'lastName']
        },
        {
          model: OrderItem,
          as: 'orderItem'
        }
      ]
    });

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: updatedJob
    });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating job',
      error: error.message
    });
  }
});

// Start job
router.post('/:id/start', auth, async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.status !== 'assigned') {
      return res.status(400).json({
        success: false,
        message: 'Job can only be started from assigned status'
      });
    }

    await job.update({
      status: 'in_progress',
      startDate: new Date()
    });

    res.json({
      success: true,
      message: 'Job started successfully',
      data: job
    });
  } catch (error) {
    console.error('Error starting job:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting job',
      error: error.message
    });
  }
});

// Complete job
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const { completionNotes, qualityCheck } = req.body;
    
    const job = await Job.findByPk(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    await job.update({
      status: 'completed',
      actualCompletionDate: new Date(),
      notes: completionNotes || job.notes,
      qualityChecks: qualityCheck ? [...job.qualityChecks, qualityCheck] : job.qualityChecks
    });

    // Update order item status
    const orderItem = await OrderItem.findByPk(job.orderItemId);
    if (orderItem) {
      await orderItem.update({ status: 'completed' });
    }

    res.json({
      success: true,
      message: 'Job completed successfully',
      data: job
    });
  } catch (error) {
    console.error('Error completing job:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing job',
      error: error.message
    });
  }
});

// Get job calendar view
router.get('/calendar/:year/:month', auth, async (req, res) => {
  try {
    const { year, month } = req.params;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const jobs = await Job.findAll({
      where: {
        targetCompletionDate: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [
        {
          model: User,
          as: 'Employee',
          attributes: ['id', 'userId', 'firstName', 'lastName']
        },
        {
          model: OrderItem,
          as: 'orderItem',
          attributes: ['partNumber', 'description']
        }
      ],
      order: [['targetCompletionDate', 'ASC']]
    });

    // Group jobs by date
    const calendar = {};
    jobs.forEach(job => {
      const date = job.targetCompletionDate.toISOString().split('T')[0];
      if (!calendar[date]) {
        calendar[date] = [];
      }
      calendar[date].push(job);
    });

    res.json({
      success: true,
      data: calendar
    });
  } catch (error) {
    console.error('Error fetching job calendar:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job calendar',
      error: error.message
    });
  }
});

// Get job statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const stats = await Job.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    const priorityStats = await Job.findAll({
      attributes: [
        'priority',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['priority'],
      raw: true
    });

    // Get overdue jobs
    const overdueCount = await Job.count({
      where: {
        targetCompletionDate: {
          [Op.lt]: new Date()
        },
        status: {
          [Op.not]: 'completed'
        }
      }
    });

    res.json({
      success: true,
      data: {
        statusStats: stats,
        priorityStats,
        overdueCount
      }
    });
  } catch (error) {
    console.error('Error fetching job stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job stats',
      error: error.message
    });
  }
});

module.exports = router;
