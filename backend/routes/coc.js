const express = require('express');
const router = express.Router();
const { COC, DimensionReport, Job, OrderItem, Order, Party, User } = require('../models');
const { auth } = require('../middleware/auth');
const { Op } = require('sequelize');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Helper function to generate COC number
const generateCOCNumber = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `COC-${currentYear}-`;
  
  const lastCOC = await COC.findOne({
    where: {
      cocNumber: {
        [Op.like]: `${prefix}%`
      }
    },
    order: [['createdAt', 'DESC']]
  });
  
  let nextNumber = 1;
  if (lastCOC) {
    const lastNumber = parseInt(lastCOC.cocNumber.split('-').pop());
    nextNumber = lastNumber + 1;
  }
  
  return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
};

// Get all COCs with filters and pagination
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      jobId,
      orderId,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    
    let whereClause = {};
    
    if (search) {
      whereClause[Op.or] = [
        { cocNumber: { [Op.iLike]: `%${search}%` } },
        { '$Job.jobNumber$': { [Op.iLike]: `%${search}%` } },
        { '$Job.OrderItem.Order.orderNumber$': { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (status) {
      whereClause.status = status;
    }
    
    if (jobId) {
      whereClause.jobId = jobId;
    }

    const { count, rows } = await COC.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Job,
          as: 'job',
          include: [
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
                      as: 'party'
                    }
                  ]
                }
              ]
            },
            {
              model: User,
              as: 'Employee'
            }
          ]
        },
        {
          model: DimensionReport,
          as: 'dimensionReports'
        },
        {
          model: User,
          as: 'Creator'
        },
        {
          model: User,
          as: 'Approver'
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]]
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      cocs: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching COCs:', error);
    res.status(500).json({ message: 'Error fetching COCs', error: error.message });
  }
});

// Get COC by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const coc = await COC.findByPk(req.params.id, {
      include: [
        {
          model: Job,
          as: 'job',
          include: [
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
                      as: 'party'
                    }
                  ]
                }
              ]
            },
            {
              model: User,
              as: 'Employee'
            }
          ]
        },
        {
          model: DimensionReport,
          as: 'dimensionReports'
        },
        {
          model: User,
          as: 'Creator'
        },
        {
          model: User,
          as: 'Approver'
        }
      ]
    });

    if (!coc) {
      return res.status(404).json({ message: 'COC not found' });
    }

    res.json(coc);
  } catch (error) {
    console.error('Error fetching COC:', error);
    res.status(500).json({ message: 'Error fetching COC', error: error.message });
  }
});

// Create new COC
router.post('/', auth, async (req, res) => {
  try {
    const {
      jobId,
      inspectionDate,
      qualityStandard,
      testResults,
      remarks,
      dimensionReports = []
    } = req.body;

    // Validate job exists
    const job = await Job.findByPk(jobId, {
      include: [
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
                  as: 'party'
                }
              ]
            }
          ]
        }
      ]
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status !== 'completed') {
      return res.status(400).json({ message: 'COC can only be created for completed jobs' });
    }

    // Check if COC already exists for this job
    const existingCOC = await COC.findOne({ where: { jobId } });
    if (existingCOC) {
      return res.status(400).json({ message: 'COC already exists for this job' });
    }

    const cocNumber = await generateCOCNumber();

    const coc = await COC.create({
      cocNumber,
      jobId,
      inspectionDate,
      qualityStandard,
      testResults,
      remarks,
      createdBy: req.user.id,
      status: 'draft'
    });

    // Create dimension reports if provided
    if (dimensionReports.length > 0) {
      const reports = dimensionReports.map(report => ({
        ...report,
        cocId: coc.id
      }));
      await DimensionReport.bulkCreate(reports);
    }

    // Fetch the complete COC with associations
    const completeCOC = await COC.findByPk(coc.id, {
      include: [
        {
          model: Job,
          as: 'job',
          include: [
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
                      as: 'party'
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          model: DimensionReport,
          as: 'dimensionReports'
        },
        {
          model: User,
          as: 'Creator'
        }
      ]
    });

    res.status(201).json(completeCOC);
  } catch (error) {
    console.error('Error creating COC:', error);
    res.status(500).json({ message: 'Error creating COC', error: error.message });
  }
});

// Update COC
router.put('/:id', auth, async (req, res) => {
  try {
    const coc = await COC.findByPk(req.params.id);
    
    if (!coc) {
      return res.status(404).json({ message: 'COC not found' });
    }

    if (coc.status === 'approved') {
      return res.status(400).json({ message: 'Cannot update approved COC' });
    }

    const {
      inspectionDate,
      qualityStandard,
      testResults,
      remarks,
      dimensionReports = []
    } = req.body;

    await coc.update({
      inspectionDate,
      qualityStandard,
      testResults,
      remarks,
      updatedBy: req.user.id
    });

    // Update dimension reports
    if (dimensionReports.length > 0) {
      // Delete existing reports
      await DimensionReport.destroy({ where: { cocId: coc.id } });
      
      // Create new reports
      const reports = dimensionReports.map(report => ({
        ...report,
        cocId: coc.id
      }));
      await DimensionReport.bulkCreate(reports);
    }

    // Fetch the updated COC with associations
    const updatedCOC = await COC.findByPk(coc.id, {
      include: [
        {
          model: Job,
          as: 'job',
          include: [
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
                      as: 'party'
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          model: DimensionReport,
          as: 'dimensionReports'
        },
        {
          model: User,
          as: 'Creator'
        }
      ]
    });

    res.json(updatedCOC);
  } catch (error) {
    console.error('Error updating COC:', error);
    res.status(500).json({ message: 'Error updating COC', error: error.message });
  }
});

// Approve COC
router.post('/:id/approve', auth, async (req, res) => {
  try {
    const coc = await COC.findByPk(req.params.id);
    
    if (!coc) {
      return res.status(404).json({ message: 'COC not found' });
    }

    if (coc.status === 'approved') {
      return res.status(400).json({ message: 'COC is already approved' });
    }

    await coc.update({
      status: 'approved',
      approvedBy: req.user.id,
      approvedAt: new Date()
    });

    const approvedCOC = await COC.findByPk(coc.id, {
      include: [
        {
          model: Job,
          as: 'job',
          include: [
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
                      as: 'party'
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          model: DimensionReport,
          as: 'dimensionReports'
        },
        {
          model: User,
          as: 'Creator'
        },
        {
          model: User,
          as: 'Approver'
        }
      ]
    });

    res.json(approvedCOC);
  } catch (error) {
    console.error('Error approving COC:', error);
    res.status(500).json({ message: 'Error approving COC', error: error.message });
  }
});

// Generate PDF COC
router.get('/:id/pdf', auth, async (req, res) => {
  try {
    const coc = await COC.findByPk(req.params.id, {
      include: [
        {
          model: Job,
          as: 'job',
          include: [
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
                      as: 'party'
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          model: DimensionReport,
          as: 'dimensionReports'
        },
        {
          model: User,
          as: 'Creator'
        },
        {
          model: User,
          as: 'Approver'
        }
      ]
    });

    if (!coc) {
      return res.status(404).json({ message: 'COC not found' });
    }

    // Create PDF document
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="COC-${coc.cocNumber}.pdf"`);
    
    // Pipe the PDF to the response
    doc.pipe(res);

    // Company header
    doc.fontSize(20).text('CERTIFICATE OF CONFORMANCE', { align: 'center' });
    doc.moveDown();
    
    // COC details
    doc.fontSize(12)
       .text(`COC Number: ${coc.cocNumber}`, 50, 120)
       .text(`Date: ${new Date(coc.inspectionDate).toLocaleDateString()}`, 350, 120);
    
    doc.moveDown();
    
    // Customer details
    if (coc.job?.orderItem?.order?.party) {
      const party = coc.job.orderItem.order.party;
      doc.text('CUSTOMER DETAILS:', 50, 160);
      doc.text(`Name: ${party.name}`, 50, 175);
      doc.text(`Address: ${party.address}`, 50, 190);
      if (party.gstNumber) {
        doc.text(`GST No: ${party.gstNumber}`, 50, 205);
      }
    }
    
    doc.moveDown();
    
    // Job details
    doc.text('JOB DETAILS:', 50, 240);
    doc.text(`Job Number: ${coc.job?.jobNumber || 'N/A'}`, 50, 255);
    doc.text(`Order Number: ${coc.job?.orderItem?.order?.orderNumber || 'N/A'}`, 50, 270);
    doc.text(`Product: ${coc.job?.orderItem?.productName || 'N/A'}`, 50, 285);
    doc.text(`Quantity: ${coc.job?.orderItem?.quantity || 'N/A'}`, 50, 300);
    
    doc.moveDown();
    
    // Quality standards
    doc.text('QUALITY STANDARD:', 50, 335);
    doc.text(coc.qualityStandard || 'N/A', 50, 350);
    
    doc.moveDown();
    
    // Test results
    doc.text('TEST RESULTS:', 50, 385);
    doc.text(coc.testResults || 'N/A', 50, 400);
    
    // Dimension reports table
    if (coc.dimensionReports && coc.dimensionReports.length > 0) {
      doc.moveDown();
      doc.text('DIMENSION REPORTS:', 50, 450);
      
      let yPos = 470;
      coc.dimensionReports.forEach((report, index) => {
        doc.text(`${index + 1}. ${report.parameter}: ${report.measuredValue} ${report.unit}`, 50, yPos);
        yPos += 15;
      });
    }
    
    // Approval section
    if (coc.status === 'approved' && coc.Approver) {
      doc.text('APPROVED BY:', 50, 650);
      doc.text(`Name: ${coc.Approver.name}`, 50, 665);
      doc.text(`Date: ${new Date(coc.approvedAt).toLocaleDateString()}`, 50, 680);
      doc.text('Signature: ________________', 50, 695);
    }
    
    // Remarks
    if (coc.remarks) {
      doc.text('REMARKS:', 50, 730);
      doc.text(coc.remarks, 50, 745);
    }
    
    // Finalize the PDF
    doc.end();
    
  } catch (error) {
    console.error('Error generating COC PDF:', error);
    res.status(500).json({ message: 'Error generating COC PDF', error: error.message });
  }
});

// Delete COC
router.delete('/:id', auth, async (req, res) => {
  try {
    const coc = await COC.findByPk(req.params.id);
    
    if (!coc) {
      return res.status(404).json({ message: 'COC not found' });
    }

    if (coc.status === 'approved') {
      return res.status(400).json({ message: 'Cannot delete approved COC' });
    }

    // Delete associated dimension reports
    await DimensionReport.destroy({ where: { cocId: coc.id } });
    
    // Delete the COC
    await coc.destroy();
    
    res.json({ message: 'COC deleted successfully' });
  } catch (error) {
    console.error('Error deleting COC:', error);
    res.status(500).json({ message: 'Error deleting COC', error: error.message });
  }
});

module.exports = router;
