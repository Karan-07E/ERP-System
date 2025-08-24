const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

// Import models
const { 
  User, Order, OrderItem, Invoice, Party, Job, JobProcessStep, 
  Material, Inventory, Process, QualityControl 
} = require('../models');

const { auth } = require('../middleware/auth');

// Simple permission check function
const checkAnalyticsPermission = (req, res, next) => {
  // For now, allow all authenticated users to access analytics
  // In production, you'd implement proper role-based access control
  next();
};

// GST Compliance Reports
router.get('/gst-reports', auth, checkAnalyticsPermission, async (req, res) => {
  try {
    const { startDate, endDate, gstType = 'all', format = 'summary' } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();
    
    // GSTR-1 (Sales) Report
    const salesData = await Invoice.findAll({
      where: {
        invoiceDate: { [Op.between]: [start, end] },
        type: 'sales_invoice',
        status: { [Op.ne]: 'cancelled' }
      },
      include: [{
        model: Order,
        as: 'order',
        include: [{
          model: Party,
          as: 'party',
          attributes: ['id', 'name', 'gstNumber', 'state']
        }]
      }],
      attributes: ['id', 'invoiceNumber', 'invoiceDate', 'subtotal', 'cgst', 'sgst', 'igst', 'grandTotal']
    });

    // GSTR-2 (Purchases) Report  
    const purchaseData = await Invoice.findAll({
      where: {
        invoiceDate: { [Op.between]: [start, end] },
        type: 'purchase_invoice',
        status: { [Op.ne]: 'cancelled' }
      },
      include: [{
        model: Order,
        as: 'order',
        include: [{
          model: Party,
          as: 'party',
          attributes: ['id', 'name', 'gstNumber', 'state']
        }]
      }],
      attributes: ['id', 'invoiceNumber', 'invoiceDate', 'subtotal', 'cgst', 'sgst', 'igst', 'grandTotal']
    });

    // Calculate GST Summary
    const calculateGSTSummary = (invoices) => {
      return invoices.reduce((acc, inv) => {
        acc.totalTaxableValue += inv.subtotal || 0;
        acc.totalCGST += inv.cgst || 0;
        acc.totalSGST += inv.sgst || 0;
        acc.totalIGST += inv.igst || 0;
        acc.totalTax += (inv.cgst || 0) + (inv.sgst || 0) + (inv.igst || 0);
        acc.totalInvoiceValue += inv.grandTotal || 0;
        return acc;
      }, {
        totalTaxableValue: 0,
        totalCGST: 0,
        totalSGST: 0,
        totalIGST: 0,
        totalTax: 0,
        totalInvoiceValue: 0,
        invoiceCount: invoices.length
      });
    };

    const salesSummary = calculateGSTSummary(salesData);
    const purchaseSummary = calculateGSTSummary(purchaseData);

    // HSN-wise Summary
    const hsnSummary = []; // Temporarily disabled to avoid model issues
    /*
    const hsnSummary = await OrderItem.findAll({
      include: [{
        model: Order,
        as: 'order',
        include: [{
          model: Invoice,
          as: 'invoices',
          where: {
            invoiceDate: { [Op.between]: [start, end] },
            status: { [Op.ne]: 'cancelled' }
          }
        }]
      }, {
        model: Material,
        as: 'material',
        attributes: ['hsnCode', 'name', 'unit']
      }],
      attributes: ['quantity', 'rate', 'amount']
    });
    */

    // Group by HSN Code (temporarily using empty object)
    const hsnGrouped = {};

    res.json({
      success: true,
      period: { startDate: start, endDate: end },
      gstr1: {
        summary: salesSummary,
        invoices: format === 'detailed' ? salesData : salesData.length,
        hsnSummary: Object.values(hsnGrouped)
      },
      gstr2: {
        summary: purchaseSummary,
        invoices: format === 'detailed' ? purchaseData : purchaseData.length
      },
      netGSTPosition: {
        outputTax: salesSummary.totalTax,
        inputTax: purchaseSummary.totalTax,
        netTax: salesSummary.totalTax - purchaseSummary.totalTax
      }
    });

  } catch (error) {
    console.error('GST reports error:', error);
    res.status(500).json({ message: 'Error generating GST reports', error: error.message });
  }
});

// Job Progress Analytics
router.get('/job-analytics', auth, checkAnalyticsPermission, async (req, res) => {
  try {
    const { period = '30', status = 'all', department = 'all' } = req.query;
    
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // Job Performance Metrics
    const jobMetrics = await Job.findAll({
      where: {
        createdAt: { [Op.gte]: daysAgo }
      },
      include: [{
        model: JobProcessStep,
        as: 'processSteps',
        attributes: ['processName', 'status', 'plannedStartDate', 'actualStartDate', 'plannedEndDate', 'actualEndDate']
      }, {
        model: OrderItem,
        as: 'orderItem',
        include: [{
          model: Order,
          as: 'order',
          include: [{
            model: Party,
            as: 'party',
            attributes: ['name']
          }]
        }]
      }, {
        model: User,
        as: 'Employee',
        attributes: ['name', 'department']
      }],
      attributes: ['id', 'jobCardNumber', 'status', 'priority', 'plannedStartDate', 'actualStartDate', 
                  'plannedEndDate', 'actualEndDate', 'completionPercentage', 'createdAt']
    });

    // Calculate job performance statistics
    const jobStats = {
      totalJobs: jobMetrics.length,
      completedJobs: jobMetrics.filter(j => j.status === 'completed').length,
      inProgressJobs: jobMetrics.filter(j => j.status === 'in_progress').length,
      delayedJobs: jobMetrics.filter(j => {
        if (j.plannedEndDate && j.actualEndDate) {
          return new Date(j.actualEndDate) > new Date(j.plannedEndDate);
        }
        if (j.plannedEndDate && j.status !== 'completed') {
          return new Date() > new Date(j.plannedEndDate);
        }
        return false;
      }).length,
      onTimeDelivery: 0,
      averageCompletionTime: 0,
      efficiencyRate: 0
    };

    // Calculate efficiency metrics
    const completedJobs = jobMetrics.filter(j => j.status === 'completed' && j.plannedStartDate && j.actualEndDate);
    if (completedJobs.length > 0) {
      const totalPlannedDays = completedJobs.reduce((acc, job) => {
        const planned = Math.ceil((new Date(job.plannedEndDate) - new Date(job.plannedStartDate)) / (1000 * 60 * 60 * 24));
        return acc + planned;
      }, 0);

      const totalActualDays = completedJobs.reduce((acc, job) => {
        const actual = Math.ceil((new Date(job.actualEndDate) - new Date(job.actualStartDate)) / (1000 * 60 * 60 * 24));
        return acc + actual;
      }, 0);

      jobStats.averageCompletionTime = totalActualDays / completedJobs.length;
      jobStats.efficiencyRate = ((totalPlannedDays / totalActualDays) * 100).toFixed(2);
      jobStats.onTimeDelivery = ((jobStats.completedJobs - jobStats.delayedJobs) / jobStats.completedJobs * 100).toFixed(2);
    }

    // Department-wise Performance
    const departmentStats = jobMetrics.reduce((acc, job) => {
      const dept = job.Employee?.department || 'Unassigned';
      if (!acc[dept]) {
        acc[dept] = {
          department: dept,
          totalJobs: 0,
          completedJobs: 0,
          inProgressJobs: 0,
          delayedJobs: 0,
          avgCompletion: 0
        };
      }
      acc[dept].totalJobs++;
      if (job.status === 'completed') acc[dept].completedJobs++;
      if (job.status === 'in_progress') acc[dept].inProgressJobs++;
      acc[dept].avgCompletion += job.completionPercentage || 0;
      return acc;
    }, {});

    // Calculate department averages
    Object.values(departmentStats).forEach(dept => {
      dept.avgCompletion = dept.totalJobs > 0 ? (dept.avgCompletion / dept.totalJobs).toFixed(2) : 0;
    });

    // Process-wise Analysis
    const processAnalysis = {};
    jobMetrics.forEach(job => {
      job.processSteps?.forEach(step => {
        if (!processAnalysis[step.processName]) {
          processAnalysis[step.processName] = {
            processName: step.processName,
            totalSteps: 0,
            completedSteps: 0,
            delayedSteps: 0,
            avgDuration: 0
          };
        }
        processAnalysis[step.processName].totalSteps++;
        if (step.status === 'completed') {
          processAnalysis[step.processName].completedSteps++;
        }
        if (step.plannedEndDate && step.actualEndDate && new Date(step.actualEndDate) > new Date(step.plannedEndDate)) {
          processAnalysis[step.processName].delayedSteps++;
        }
      });
    });

    // Job Trend Analysis (daily completion rate)
    const trendData = [];
    for (let i = parseInt(period); i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const dayJobs = jobMetrics.filter(job => {
        const jobDate = new Date(job.actualEndDate || job.createdAt);
        return jobDate >= dayStart && jobDate <= dayEnd;
      });

      trendData.push({
        date: dayStart.toISOString().split('T')[0],
        completed: dayJobs.filter(j => j.status === 'completed').length,
        started: dayJobs.filter(j => j.actualStartDate && new Date(j.actualStartDate) >= dayStart && new Date(j.actualStartDate) <= dayEnd).length,
        total: dayJobs.length
      });
    }

    res.json({
      success: true,
      period: `${period} days`,
      summary: jobStats,
      departmentPerformance: Object.values(departmentStats),
      processAnalysis: Object.values(processAnalysis),
      trendData,
      jobs: jobMetrics.slice(0, 50) // Limit for performance
    });

  } catch (error) {
    console.error('Job analytics error:', error);
    res.status(500).json({ message: 'Error generating job analytics', error: error.message });
  }
});

// Party-wise Sales Analysis
router.get('/party-analysis', auth, checkAnalyticsPermission, async (req, res) => {
  try {
    const { period = '90', partyType = 'all', sortBy = 'revenue' } = req.query;
    
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // Party performance data
    const partyData = await Party.findAll({
      include: [{
        model: Order,
        as: 'orders',
        where: {
          createdAt: { [Op.gte]: daysAgo },
          status: { [Op.ne]: 'cancelled' }
        },
        required: false,
        include: [{
          model: OrderItem,
          as: 'orderItems',
          attributes: ['quantity', 'rate', 'amount']
        }]
      }],
      attributes: ['id', 'name', 'companyName', 'type', 'gstNumber', 'state', 'city', 'creditLimit', 'paymentTerms']
    });

    // Calculate party metrics
    const partyMetrics = partyData.map(party => {
      const orders = party.orders || [];
      const totalRevenue = orders.reduce((acc, order) => {
        return acc + (order.orderItems?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0);
      }, 0);

      const lastOrderDate = orders.length > 0 ? 
        new Date(Math.max(...orders.map(o => new Date(o.createdAt)))) : null;

      const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

      // Payment behavior analysis
      const overdueOrders = orders.filter(o => {
        const dueDate = new Date(o.createdAt);
        dueDate.setDate(dueDate.getDate() + parseInt(party.paymentTerms || 30));
        return new Date() > dueDate && o.status !== 'completed';
      });

      return {
        partyId: party.id,
        name: party.name,
        companyName: party.companyName,
        type: party.type,
        location: `${party.city}, ${party.state}`,
        gstNumber: party.gstNumber,
        totalOrders: orders.length,
        totalRevenue,
        avgOrderValue,
        lastOrderDate,
        daysSinceLastOrder: lastOrderDate ? Math.ceil((new Date() - lastOrderDate) / (1000 * 60 * 60 * 24)) : null,
        paymentTerms: party.paymentTerms,
        creditLimit: party.creditLimit,
        creditUtilization: party.creditLimit > 0 ? ((totalRevenue / party.creditLimit) * 100).toFixed(2) : 0,
        overdueCount: overdueOrders.length,
        riskScore: this.calculateRiskScore(party, orders, overdueOrders)
      };
    });

    // Sort by specified criteria
    partyMetrics.sort((a, b) => {
      switch (sortBy) {
        case 'revenue': return b.totalRevenue - a.totalRevenue;
        case 'orders': return b.totalOrders - a.totalOrders;
        case 'recent': return (a.daysSinceLastOrder || Infinity) - (b.daysSinceLastOrder || Infinity);
        default: return b.totalRevenue - a.totalRevenue;
      }
    });

    // Calculate summary statistics
    const summary = {
      totalParties: partyMetrics.length,
      activeParties: partyMetrics.filter(p => p.lastOrderDate && p.daysSinceLastOrder <= 30).length,
      totalRevenue: partyMetrics.reduce((acc, p) => acc + p.totalRevenue, 0),
      avgOrderValue: partyMetrics.reduce((acc, p) => acc + p.avgOrderValue, 0) / partyMetrics.length || 0,
      topPerformers: partyMetrics.slice(0, 10),
      riskCustomers: partyMetrics.filter(p => p.riskScore > 70).slice(0, 10)
    };

    // Geographic distribution
    const geographicData = partyMetrics.reduce((acc, party) => {
      const location = party.location;
      if (!acc[location]) {
        acc[location] = {
          location,
          partyCount: 0,
          totalRevenue: 0,
          avgRevenue: 0
        };
      }
      acc[location].partyCount++;
      acc[location].totalRevenue += party.totalRevenue;
      acc[location].avgRevenue = acc[location].totalRevenue / acc[location].partyCount;
      return acc;
    }, {});

    // Customer lifecycle analysis
    const lifecycleData = {
      new: partyMetrics.filter(p => p.totalOrders <= 2).length,
      growing: partyMetrics.filter(p => p.totalOrders > 2 && p.totalOrders <= 10).length,
      mature: partyMetrics.filter(p => p.totalOrders > 10 && p.daysSinceLastOrder <= 60).length,
      dormant: partyMetrics.filter(p => p.daysSinceLastOrder > 60).length
    };

    res.json({
      success: true,
      period: `${period} days`,
      summary,
      parties: partyMetrics,
      geographicDistribution: Object.values(geographicData),
      lifecycleAnalysis: lifecycleData
    });

  } catch (error) {
    console.error('Party analysis error:', error);
    res.status(500).json({ message: 'Error generating party analysis', error: error.message });
  }
});

// Risk score calculation helper
function calculateRiskScore(party, orders, overdueOrders) {
  let score = 0;
  
  // Payment history (40% weight)
  if (overdueOrders.length > 0) {
    const overdueRatio = overdueOrders.length / orders.length;
    score += overdueRatio * 40;
  }
  
  // Credit utilization (25% weight)
  if (party.creditLimit > 0) {
    const totalRevenue = orders.reduce((acc, order) => acc + (order.grandTotal || 0), 0);
    const utilization = totalRevenue / party.creditLimit;
    if (utilization > 0.8) score += 25;
    else if (utilization > 0.6) score += 15;
  }
  
  // Order frequency (20% weight)
  const daysSinceFirst = orders.length > 0 ? 
    Math.ceil((new Date() - new Date(orders[orders.length - 1].createdAt)) / (1000 * 60 * 60 * 24)) : 0;
  const orderFrequency = daysSinceFirst > 0 ? orders.length / (daysSinceFirst / 30) : 0;
  if (orderFrequency < 0.5) score += 20;
  
  // Recent activity (15% weight)
  const lastOrderDate = orders.length > 0 ? new Date(Math.max(...orders.map(o => new Date(o.createdAt)))) : null;
  const daysSinceLastOrder = lastOrderDate ? Math.ceil((new Date() - lastOrderDate) / (1000 * 60 * 60 * 24)) : Infinity;
  if (daysSinceLastOrder > 90) score += 15;
  
  return Math.min(100, Math.max(0, score));
}

// Performance Dashboard Data
router.get('/performance-dashboard', auth, checkAnalyticsPermission, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // Key Performance Indicators
    const [
      totalRevenue,
      totalOrders,
      completedJobs,
      qualityIssues,
      activeParties,
      inventoryValue
    ] = await Promise.all([
      Invoice.sum('grandTotal', {
        where: {
          invoiceDate: { [Op.gte]: daysAgo },
          status: { [Op.ne]: 'cancelled' }
        }
      }),
      Order.count({
        where: { createdAt: { [Op.gte]: daysAgo } }
      }),
      Job.count({
        where: {
          status: 'completed',
          actualEndDate: { [Op.gte]: daysAgo }
        }
      }),
      QualityControl.count({
        where: {
          result: 'failed',
          createdAt: { [Op.gte]: daysAgo }
        }
      }),
      Party.count({
        include: [{
          model: Order,
          as: 'orders',
          where: { createdAt: { [Op.gte]: daysAgo } },
          required: true
        }]
      }),
      Inventory.sum('currentStock')
    ]);

    // Trend data for charts
    const trendData = [];
    for (let i = parseInt(period); i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const [dayRevenue, dayOrders, dayJobs] = await Promise.all([
        Invoice.sum('grandTotal', {
          where: {
            invoiceDate: { [Op.between]: [dayStart, dayEnd] },
            status: { [Op.ne]: 'cancelled' }
          }
        }),
        Order.count({
          where: { createdAt: { [Op.between]: [dayStart, dayEnd] } }
        }),
        Job.count({
          where: {
            status: 'completed',
            actualEndDate: { [Op.between]: [dayStart, dayEnd] }
          }
        })
      ]);

      trendData.push({
        date: dayStart.toISOString().split('T')[0],
        revenue: dayRevenue || 0,
        orders: dayOrders || 0,
        completedJobs: dayJobs || 0
      });
    }

    // Department wise productivity
    const departmentData = await Job.findAll({
      where: { createdAt: { [Op.gte]: daysAgo } },
      include: [{
        model: User,
        as: 'Employee',
        attributes: ['department']
      }],
      attributes: ['status', 'completionPercentage']
    });

    const departmentStats = departmentData.reduce((acc, job) => {
      const dept = job.Employee?.department || 'Unassigned';
      if (!acc[dept]) {
        acc[dept] = { name: dept, jobs: 0, completed: 0, avgProgress: 0 };
      }
      acc[dept].jobs++;
      if (job.status === 'completed') acc[dept].completed++;
      acc[dept].avgProgress += job.completionPercentage || 0;
      return acc;
    }, {});

    Object.values(departmentStats).forEach(dept => {
      dept.avgProgress = dept.jobs > 0 ? (dept.avgProgress / dept.jobs).toFixed(1) : 0;
      dept.completionRate = dept.jobs > 0 ? ((dept.completed / dept.jobs) * 100).toFixed(1) : 0;
    });

    res.json({
      success: true,
      period: `${period} days`,
      kpis: {
        revenue: totalRevenue || 0,
        orders: totalOrders || 0,
        completedJobs: completedJobs || 0,
        qualityIssues: qualityIssues || 0,
        activeParties: activeParties || 0,
        inventoryValue: inventoryValue || 0
      },
      trends: trendData,
      departmentPerformance: Object.values(departmentStats),
      alerts: await generatePerformanceAlerts(daysAgo)
    });

  } catch (error) {
    console.error('Performance dashboard error:', error);
    res.status(500).json({ message: 'Error generating performance dashboard', error: error.message });
  }
});

// Helper function to generate performance alerts
async function generatePerformanceAlerts(since) {
  const alerts = [];

  try {
    // Check for overdue jobs
    const overdueJobs = await Job.count({
      where: {
        plannedEndDate: { [Op.lt]: new Date() },
        status: { [Op.notIn]: ['completed', 'cancelled'] }
      }
    });

    if (overdueJobs > 0) {
      alerts.push({
        type: 'warning',
        message: `${overdueJobs} jobs are overdue`,
        count: overdueJobs,
        action: 'Review job scheduling'
      });
    }

    // Check for low stock
    const lowStockItems = await Inventory.count({
      where: { currentStock: { [Op.lte]: 10 } }
    });

    if (lowStockItems > 0) {
      alerts.push({
        type: 'info',
        message: `${lowStockItems} items have low stock`,
        count: lowStockItems,
        action: 'Review inventory levels'
      });
    }

    // Check for quality issues trend
    const qualityIssues = await QualityControl.count({
      where: {
        result: 'failed',
        createdAt: { [Op.gte]: since }
      }
    });

    if (qualityIssues > 5) {
      alerts.push({
        type: 'error',
        message: `${qualityIssues} quality issues reported recently`,
        count: qualityIssues,
        action: 'Review quality processes'
      });
    }

  } catch (error) {
    console.error('Error generating alerts:', error);
  }

  return alerts;
}

// Export Reports (CSV/PDF)
router.get('/export/:reportType', auth, checkAnalyticsPermission, async (req, res) => {
  try {
    const { reportType } = req.params;
    const { format = 'csv', startDate, endDate } = req.query;

    // This would integrate with a PDF/CSV generation library
    // For now, returning JSON data that frontend can export
    
    let data = {};
    
    switch (reportType) {
      case 'gst':
        // Fetch GST data (similar to gst-reports endpoint)
        data = { message: 'GST report data would be here' };
        break;
      case 'jobs':
        // Fetch job analytics data
        data = { message: 'Job analytics data would be here' };
        break;
      case 'parties':
        // Fetch party analysis data  
        data = { message: 'Party analysis data would be here' };
        break;
      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }

    res.json({
      success: true,
      reportType,
      format,
      data,
      message: 'Export functionality would generate file here'
    });

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Error exporting report', error: error.message });
  }
});

module.exports = router;
