const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const { auth } = require('../middleware/auth');
const { DimensionReport } = require('../models/COC');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/dimension-reports';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'dimension-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Create dimension report
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { 
      cocId,
      jobId,
      checkType,
      checkDescription,
      parameter, 
      specification, 
      measuredValue, 
      unit, 
      tolerance, 
      result,
      sample1Value,
      sample2Value,
      sample3Value,
      sample4Value,
      sample5Value,
      measuredBy,
      measurementDate
    } = req.body;
    
    console.log('Received dimension report data:', req.body);
    
    // Validate required fields
    if (!parameter || !checkDescription || !checkType) {
      return res.status(400).json({
        message: 'Missing required fields: parameter, checkDescription, and checkType are required'
      });
    }

    // Create dimension report in database
    const dimensionReport = await DimensionReport.create({
      cocId: cocId || null,
      jobId: jobId || null,
      checkType: checkType || 'dimensional',
      checkDescription: parameter, // Using parameter as checkDescription for now
      specification: specification || null,
      tolerance: tolerance || null,
      sample1: {
        value: sample1Value ? parseFloat(sample1Value) : null,
        status: sample1Value ? 'OK' : null
      },
      sample2: {
        value: sample2Value ? parseFloat(sample2Value) : null,
        status: sample2Value ? 'OK' : null
      },
      sample3: {
        value: sample3Value ? parseFloat(sample3Value) : null,
        status: sample3Value ? 'OK' : null
      },
      sample4: {
        value: sample4Value ? parseFloat(sample4Value) : null,
        status: sample4Value ? 'OK' : null
      },
      sample5: {
        value: sample5Value ? parseFloat(sample5Value) : null,
        status: sample5Value ? 'OK' : null
      },
      result: result || 'OK',
      hasImage: !!req.file,
      imagePath: req.file ? req.file.path : null,
      measuredBy: req.user.id, // Use authenticated user ID
      measurementDate: measurementDate ? new Date(measurementDate) : new Date(),
      notes: `Unit: ${unit || 'N/A'}\nMeasured Value: ${measuredValue || 'N/A'}\nMeasured By: ${measuredBy || 'N/A'}`
    });

    console.log('Dimension report created:', dimensionReport.id);

    res.status(201).json({
      message: 'Dimension report created successfully',
      data: dimensionReport
    });

  } catch (error) {
    console.error('Error creating dimension report:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get all dimension reports
router.get('/', auth, async (req, res) => {
  try {
    const dimensionReports = await DimensionReport.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: require('../models').User,
          as: 'MeasuredBy',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    res.json({
      message: 'Dimension reports fetched successfully',
      data: dimensionReports
    });
  } catch (error) {
    console.error('Error fetching dimension reports:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Serve uploaded images
router.get('/image/:filename', (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(__dirname, '../uploads/dimension-reports', filename);
  
  if (fs.existsSync(imagePath)) {
    res.sendFile(path.resolve(imagePath));
  } else {
    res.status(404).json({ message: 'Image not found' });
  }
});

// Export dimension reports to CSV
router.get('/export/csv', auth, async (req, res) => {
  try {
    const dimensionReports = await DimensionReport.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: require('../models').User,
          as: 'MeasuredBy',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    // CSV Headers
    const headers = [
      'Report ID',
      'COC ID', 
      'Job ID',
      'Check Type',
      'Check Description',
      'Parameter',
      'Specification',
      'Tolerance',
      'Sample 1 Value',
      'Sample 1 Status',
      'Sample 2 Value', 
      'Sample 2 Status',
      'Sample 3 Value',
      'Sample 3 Status', 
      'Sample 4 Value',
      'Sample 4 Status',
      'Sample 5 Value',
      'Sample 5 Status',
      'Final Result',
      'Measured By',
      'Measurement Date',
      'Notes'
    ];

    // Helper functions for formatting
    const formatDate = (dateString) => {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US') + ' ' + date.toLocaleTimeString('en-US', { hour12: false });
      } catch (e) {
        return '';
      }
    };

    const formatMeasuredBy = (user) => {
      if (user && user.firstName && user.lastName) {
        return `${user.firstName} ${user.lastName}`;
      }
      return '';
    };

    const formatNotes = (notes) => {
      if (!notes) return '';
      return String(notes).replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
    };

    const escapeCSVValue = (value) => {
      if (value === null || value === undefined) return '""';
      const stringValue = String(value);
      // Always wrap values in quotes for consistent alignment
      return `"${stringValue.replace(/"/g, '""')}"`;
    };

    // Build CSV content
    const csvRows = [headers.map(escapeCSVValue).join(',')];
    
    dimensionReports.forEach(report => {
      const rows = [
        report.id || '',
        report.cocId || '',
        report.jobId || '',
        report.checkType || '',
        report.checkDescription || '',
        report.checkDescription || '', // parameter field
        report.specification || '',
        report.tolerance || '',
        report.sample1?.value || '',
        report.sample1?.status || '',
        report.sample2?.value || '',
        report.sample2?.status || '',
        report.sample3?.value || '',
        report.sample3?.status || '',
        report.sample4?.value || '',
        report.sample4?.status || '',
        report.sample5?.value || '',
        report.sample5?.status || '',
        report.result || '',
        formatMeasuredBy(report.MeasuredBy),
        formatDate(report.measurementDate),
        formatNotes(report.notes)
      ];
      csvRows.push(rows.map(escapeCSVValue).join(','));
    });

    // Add UTF-8 BOM for better Excel compatibility
    const csvContent = '\uFEFF' + csvRows.join('\n');

    // Set headers for file download
    const filename = `dimension_reports_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Pragma', 'no-cache');

    res.send(csvContent);

  } catch (error) {
    console.error('Error exporting dimension reports to CSV:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Export dimension reports to PDF
router.get('/export/pdf', auth, async (req, res) => {
  try {
    const dimensionReports = await DimensionReport.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: require('../models').User,
          as: 'MeasuredBy',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    // Create a new PDF document
    const doc = new PDFDocument({
      margin: 50,
      size: 'A4',
      layout: 'landscape' // Better for tables
    });

    // Set response headers for PDF download
    const filename = `dimension_reports_${new Date().toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Pragma', 'no-cache');

    // Pipe the PDF to the response
    doc.pipe(res);

    // Helper functions
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US') + ' ' + date.toLocaleTimeString('en-US', { hour12: false });
      } catch (e) {
        return 'N/A';
      }
    };

    const formatMeasuredBy = (user) => {
      if (user && user.firstName && user.lastName) {
        return `${user.firstName} ${user.lastName}`;
      }
      return 'N/A';
    };

    const formatNotes = (notes) => {
      if (!notes) return 'N/A';
      return String(notes).replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
    };

    // Add title and header
    doc.fontSize(20).font('Helvetica-Bold').text('Dimension Reports', { align: 'center' });
    doc.fontSize(12).font('Helvetica').text(`Generated on: ${new Date().toLocaleDateString('en-US')}`, { align: 'center' });
    doc.text(`Total Reports: ${dimensionReports.length}`, { align: 'center' });
    doc.moveDown(2);

    // Table configuration
    const tableTop = doc.y;
    const tableLeft = 50;
    const rowHeight = 25;
    const colWidths = {
      cocId: 80,
      jobId: 80,
      checkType: 70,
      description: 120,
      specification: 80,
      samples: 150,
      result: 50,
      measuredBy: 100,
      date: 120
    };

    let currentY = tableTop;

    // Draw table headers
    doc.fontSize(10).font('Helvetica-Bold');
    let currentX = tableLeft;
    
    // Header row
    doc.rect(currentX, currentY, colWidths.cocId, rowHeight).stroke();
    doc.text('COC ID', currentX + 5, currentY + 8, { width: colWidths.cocId - 10 });
    currentX += colWidths.cocId;

    doc.rect(currentX, currentY, colWidths.jobId, rowHeight).stroke();
    doc.text('Job ID', currentX + 5, currentY + 8, { width: colWidths.jobId - 10 });
    currentX += colWidths.jobId;

    doc.rect(currentX, currentY, colWidths.checkType, rowHeight).stroke();
    doc.text('Check Type', currentX + 5, currentY + 8, { width: colWidths.checkType - 10 });
    currentX += colWidths.checkType;

    doc.rect(currentX, currentY, colWidths.description, rowHeight).stroke();
    doc.text('Description', currentX + 5, currentY + 8, { width: colWidths.description - 10 });
    currentX += colWidths.description;

    doc.rect(currentX, currentY, colWidths.specification, rowHeight).stroke();
    doc.text('Specification', currentX + 5, currentY + 8, { width: colWidths.specification - 10 });
    currentX += colWidths.specification;

    doc.rect(currentX, currentY, colWidths.samples, rowHeight).stroke();
    doc.text('Sample Results', currentX + 5, currentY + 8, { width: colWidths.samples - 10 });
    currentX += colWidths.samples;

    doc.rect(currentX, currentY, colWidths.result, rowHeight).stroke();
    doc.text('Result', currentX + 5, currentY + 8, { width: colWidths.result - 10 });
    currentX += colWidths.result;

    doc.rect(currentX, currentY, colWidths.measuredBy, rowHeight).stroke();
    doc.text('Measured By', currentX + 5, currentY + 8, { width: colWidths.measuredBy - 10 });
    currentX += colWidths.measuredBy;

    doc.rect(currentX, currentY, colWidths.date, rowHeight).stroke();
    doc.text('Date', currentX + 5, currentY + 8, { width: colWidths.date - 10 });

    currentY += rowHeight;

    // Add data rows
    doc.font('Helvetica').fontSize(8);
    
    dimensionReports.forEach((report, index) => {
      // Check if we need a new page
      if (currentY > 500) {
        doc.addPage();
        currentY = 50;
      }

      currentX = tableLeft;

      // Format sample results
      const samples = [];
      for (let i = 1; i <= 5; i++) {
        const sample = report[`sample${i}`];
        if (sample && sample.value) {
          samples.push(`S${i}:${sample.value}(${sample.status || 'OK'})`);
        }
      }
      const samplesText = samples.length > 0 ? samples.join(', ') : 'No samples';

      // COC ID
      doc.rect(currentX, currentY, colWidths.cocId, rowHeight).stroke();
      doc.text(report.cocId || 'N/A', currentX + 5, currentY + 8, { width: colWidths.cocId - 10 });
      currentX += colWidths.cocId;

      // Job ID
      doc.rect(currentX, currentY, colWidths.jobId, rowHeight).stroke();
      doc.text(report.jobId || 'N/A', currentX + 5, currentY + 8, { width: colWidths.jobId - 10 });
      currentX += colWidths.jobId;

      // Check Type
      doc.rect(currentX, currentY, colWidths.checkType, rowHeight).stroke();
      doc.text(report.checkType || 'N/A', currentX + 5, currentY + 8, { width: colWidths.checkType - 10 });
      currentX += colWidths.checkType;

      // Description
      doc.rect(currentX, currentY, colWidths.description, rowHeight).stroke();
      const description = (report.checkDescription || 'N/A').substring(0, 40);
      doc.text(description, currentX + 5, currentY + 8, { width: colWidths.description - 10 });
      currentX += colWidths.description;

      // Specification
      doc.rect(currentX, currentY, colWidths.specification, rowHeight).stroke();
      doc.text(report.specification || 'N/A', currentX + 5, currentY + 8, { width: colWidths.specification - 10 });
      currentX += colWidths.specification;

      // Sample Results
      doc.rect(currentX, currentY, colWidths.samples, rowHeight).stroke();
      doc.text(samplesText.substring(0, 50), currentX + 5, currentY + 8, { width: colWidths.samples - 10 });
      currentX += colWidths.samples;

      // Result
      doc.rect(currentX, currentY, colWidths.result, rowHeight).stroke();
      doc.fillColor(report.result === 'OK' ? 'green' : report.result === 'NOT_OK' ? 'red' : 'black');
      doc.text(report.result || 'N/A', currentX + 5, currentY + 8, { width: colWidths.result - 10 });
      doc.fillColor('black');
      currentX += colWidths.result;

      // Measured By
      doc.rect(currentX, currentY, colWidths.measuredBy, rowHeight).stroke();
      doc.text(formatMeasuredBy(report.MeasuredBy), currentX + 5, currentY + 8, { width: colWidths.measuredBy - 10 });
      currentX += colWidths.measuredBy;

      // Date
      doc.rect(currentX, currentY, colWidths.date, rowHeight).stroke();
      doc.text(formatDate(report.measurementDate), currentX + 5, currentY + 8, { width: colWidths.date - 10 });

      currentY += rowHeight;
    });

    // Add summary at the end
    doc.addPage();
    doc.fontSize(16).font('Helvetica-Bold').text('Summary', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).font('Helvetica');

    const okCount = dimensionReports.filter(r => r.result === 'OK').length;
    const notOkCount = dimensionReports.filter(r => r.result === 'NOT_OK').length;
    const naCount = dimensionReports.filter(r => r.result === 'NA').length;

    doc.text(`Total Reports: ${dimensionReports.length}`);
    doc.fillColor('green').text(`OK: ${okCount}`, { continued: true });
    doc.fillColor('red').text(`  NOT OK: ${notOkCount}`, { continued: true });
    doc.fillColor('black').text(`  N/A: ${naCount}`);

    // Check types summary
    doc.moveDown();
    doc.text('Check Types Distribution:');
    const checkTypes = {};
    dimensionReports.forEach(report => {
      const type = report.checkType || 'Unknown';
      checkTypes[type] = (checkTypes[type] || 0) + 1;
    });

    Object.entries(checkTypes).forEach(([type, count]) => {
      doc.text(`• ${type}: ${count} reports`);
    });

    // Footer
    doc.moveDown(2);
    doc.fontSize(10).text(`Report generated by ERP System on ${new Date().toLocaleString()}`, { align: 'center' });

    // Finalize the PDF
    doc.end();

  } catch (error) {
    console.error('Error exporting dimension reports to PDF:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
