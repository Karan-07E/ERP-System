const express = require('express');
const { AuditReport, StandardAuditForm, AuditFormResponse } = require('../models/Audit');
const { auth, checkPermission } = require('../middleware/auth');
const router = express.Router();

// AUDIT REPORTS ROUTES
// Get all audit reports
router.get('/reports', auth, checkPermission('audit', 'read'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, auditType, isoStandard, status } = req.query;
    
    let query = {};
    if (search) {
      query.$or = [
        { auditNumber: { $regex: search, $options: 'i' } },
        { auditScope: { $regex: search, $options: 'i' } }
      ];
    }
    if (auditType) query.auditType = auditType;
    if (isoStandard) query.isoStandard = isoStandard;
    if (status) query.status = status;

    const reports = await AuditReport.find(query)
      .populate('departments.head', 'firstName lastName')
      .populate('findings.correctiveAction.responsiblePerson', 'firstName lastName')
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AuditReport.countDocuments(query);

    res.json({
      reports,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get audit reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get audit report by ID
router.get('/reports/:id', auth, checkPermission('audit', 'read'), async (req, res) => {
  try {
    const report = await AuditReport.findById(req.params.id)
      .populate('departments.head', 'firstName lastName')
      .populate('findings.correctiveAction.responsiblePerson', 'firstName lastName')
      .populate('findings.preventiveAction.responsiblePerson', 'firstName lastName')
      .populate('followUpActions.responsiblePerson', 'firstName lastName')
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName');

    if (!report) {
      return res.status(404).json({ message: 'Audit report not found' });
    }

    res.json({ report });
  } catch (error) {
    console.error('Get audit report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create audit report
router.post('/reports', auth, checkPermission('audit', 'create'), async (req, res) => {
  try {
    const auditNumber = `AUDIT-${Date.now()}`;
    
    const report = new AuditReport({
      ...req.body,
      auditNumber,
      createdBy: req.user._id
    });

    await report.save();
    res.status(201).json({ message: 'Audit report created successfully', report });
  } catch (error) {
    console.error('Create audit report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update audit report
router.put('/reports/:id', auth, checkPermission('audit', 'update'), async (req, res) => {
  try {
    const report = await AuditReport.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!report) {
      return res.status(404).json({ message: 'Audit report not found' });
    }

    res.json({ message: 'Audit report updated successfully', report });
  } catch (error) {
    console.error('Update audit report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve audit report
router.post('/reports/:id/approve', auth, checkPermission('audit', 'update'), async (req, res) => {
  try {
    const report = await AuditReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Audit report not found' });
    }

    report.status = 'approved';
    report.approvedBy = req.user._id;
    report.approvalDate = new Date();
    await report.save();

    res.json({ message: 'Audit report approved successfully', report });
  } catch (error) {
    console.error('Approve audit report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update corrective action status
router.put('/reports/:reportId/findings/:findingId/corrective-action', auth, checkPermission('audit', 'update'), async (req, res) => {
  try {
    const { status, completionDate, verification } = req.body;

    const report = await AuditReport.findById(req.params.reportId);
    if (!report) {
      return res.status(404).json({ message: 'Audit report not found' });
    }

    const finding = report.findings.id(req.params.findingId);
    if (!finding) {
      return res.status(404).json({ message: 'Finding not found' });
    }

    if (status) finding.correctiveAction.status = status;
    if (completionDate) finding.correctiveAction.completionDate = completionDate;
    if (verification) finding.correctiveAction.verification = verification;

    await report.save();

    res.json({ message: 'Corrective action updated successfully', report });
  } catch (error) {
    console.error('Update corrective action error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// STANDARD AUDIT FORMS ROUTES
// Get all standard forms
router.get('/forms', auth, checkPermission('audit', 'read'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isoStandard, isActive } = req.query;
    
    let query = {};
    if (search) {
      query.$or = [
        { formName: { $regex: search, $options: 'i' } },
        { formCode: { $regex: search, $options: 'i' } }
      ];
    }
    if (isoStandard) query.isoStandard = isoStandard;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const forms = await StandardAuditForm.find(query)
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await StandardAuditForm.countDocuments(query);

    res.json({
      forms,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get audit forms error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create standard audit form
router.post('/forms', auth, checkPermission('audit', 'create'), async (req, res) => {
  try {
    const form = new StandardAuditForm({
      ...req.body,
      createdBy: req.user._id
    });

    await form.save();
    res.status(201).json({ message: 'Audit form created successfully', form });
  } catch (error) {
    console.error('Create audit form error:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Form with this code already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// Update standard audit form
router.put('/forms/:id', auth, checkPermission('audit', 'update'), async (req, res) => {
  try {
    const form = await StandardAuditForm.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!form) {
      return res.status(404).json({ message: 'Audit form not found' });
    }

    res.json({ message: 'Audit form updated successfully', form });
  } catch (error) {
    console.error('Update audit form error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// AUDIT FORM RESPONSES ROUTES
// Get all form responses
router.get('/responses', auth, checkPermission('audit', 'read'), async (req, res) => {
  try {
    const { page = 1, limit = 10, form, department, status, respondent } = req.query;
    
    let query = {};
    if (form) query.form = form;
    if (department) query.department = department;
    if (status) query.status = status;
    if (respondent) query.respondent = respondent;

    const responses = await AuditFormResponse.find(query)
      .populate('form', 'formName formCode')
      .populate('respondent', 'firstName lastName')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AuditFormResponse.countDocuments(query);

    res.json({
      responses,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get form responses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create form response
router.post('/responses', auth, checkPermission('audit', 'create'), async (req, res) => {
  try {
    const response = new AuditFormResponse({
      ...req.body,
      respondent: req.user._id
    });

    await response.save();
    await response.populate('form', 'formName formCode');

    res.status(201).json({ message: 'Form response submitted successfully', response });
  } catch (error) {
    console.error('Create form response error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update form response
router.put('/responses/:id', auth, checkPermission('audit', 'update'), async (req, res) => {
  try {
    const response = await AuditFormResponse.findById(req.params.id);
    if (!response) {
      return res.status(404).json({ message: 'Form response not found' });
    }

    // Only allow updating own responses or if admin/manager
    if (response.respondent.toString() !== req.user._id.toString() && 
        !['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedResponse = await AuditFormResponse.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('form', 'formName formCode');

    res.json({ message: 'Form response updated successfully', response: updatedResponse });
  } catch (error) {
    console.error('Update form response error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Review form response
router.post('/responses/:id/review', auth, checkPermission('audit', 'update'), async (req, res) => {
  try {
    const { reviewComments } = req.body;

    const response = await AuditFormResponse.findById(req.params.id);
    if (!response) {
      return res.status(404).json({ message: 'Form response not found' });
    }

    response.status = 'reviewed';
    response.reviewedBy = req.user._id;
    response.reviewDate = new Date();
    if (reviewComments) response.reviewComments = reviewComments;

    await response.save();

    res.json({ message: 'Form response reviewed successfully', response });
  } catch (error) {
    console.error('Review form response error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get audit statistics
router.get('/stats', auth, checkPermission('audit', 'read'), async (req, res) => {
  try {
    const totalReports = await AuditReport.countDocuments();
    const pendingReports = await AuditReport.countDocuments({ status: 'in_progress' });
    const approvedReports = await AuditReport.countDocuments({ status: 'approved' });
    
    const findingsByType = await AuditReport.aggregate([
      { $unwind: '$findings' },
      { $group: { _id: '$findings.findingType', count: { $sum: 1 } } }
    ]);

    const openCorrectiveActions = await AuditReport.aggregate([
      { $unwind: '$findings' },
      { $match: { 'findings.correctiveAction.status': { $in: ['pending', 'in_progress'] } } },
      { $count: 'total' }
    ]);

    const auditsByStandard = await AuditReport.aggregate([
      { $group: { _id: '$isoStandard', count: { $sum: 1 } } }
    ]);

    const completedForms = await AuditFormResponse.countDocuments({ status: 'submitted' });
    const pendingReviews = await AuditFormResponse.countDocuments({ status: 'submitted' });

    res.json({
      totalReports,
      pendingReports,
      approvedReports,
      findingsByType,
      openCorrectiveActions: openCorrectiveActions[0]?.total || 0,
      auditsByStandard,
      completedForms,
      pendingReviews
    });
  } catch (error) {
    console.error('Get audit stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get audit dashboard
router.get('/dashboard', auth, checkPermission('audit', 'read'), async (req, res) => {
  try {
    const upcomingAudits = await AuditReport.find({
      'auditDate.start': { $gte: new Date() },
      status: { $ne: 'completed' }
    }).sort({ 'auditDate.start': 1 }).limit(5);

    const overdueCorrective = await AuditReport.aggregate([
      { $unwind: '$findings' },
      { 
        $match: { 
          'findings.correctiveAction.targetDate': { $lt: new Date() },
          'findings.correctiveAction.status': { $in: ['pending', 'in_progress'] }
        } 
      },
      { $count: 'total' }
    ]);

    const recentFindings = await AuditReport.aggregate([
      { $unwind: '$findings' },
      { $sort: { createdAt: -1 } },
      { $limit: 10 },
      {
        $group: {
          _id: '$findings.findingType',
          count: { $sum: 1 },
          latest: { $first: '$createdAt' }
        }
      }
    ]);

    res.json({
      upcomingAudits,
      overdueCorrective: overdueCorrective[0]?.total || 0,
      recentFindings
    });
  } catch (error) {
    console.error('Get audit dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
