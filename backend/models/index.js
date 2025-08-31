const sequelize = require('../config/database');

// Import all models
const User = require('./User');
const { Invoice, Quotation, Payment } = require('./Accounting');
const { Order, JobCard, DeliveryChallan } = require('./Order');
const { Inventory, StockMovement, GRN, GatePass } = require('./Inventory');
const { Process, QualityControl, InspectionReport } = require('./Process');
const { Message, Conversation, Notification, BroadcastMessage } = require('./Message');

// Import new enhanced models
const Party = require('./Party');
const OrderItem = require('./OrderItem');
const { Job, JobProcessStep } = require('./Job');
const { COC, DimensionReport } = require('./COC');
const InternalMessage = require('./InternalMessage');

// Import enhanced Material model
const { Material, BOM, MaterialSpecification, MaterialConsumption } = require('./Material');

// Define associations (only once)
User.hasMany(Invoice, { foreignKey: 'createdBy', as: 'createdInvoices' });
User.hasMany(Order, { foreignKey: 'createdBy', as: 'createdOrders' });
User.hasMany(Process, { foreignKey: 'createdBy', as: 'createdProcesses' });
User.hasMany(QualityControl, { foreignKey: 'checkedBy', as: 'qualityChecks' });
User.hasMany(InspectionReport, { foreignKey: 'inspector', as: 'inspectionReports' });
User.hasMany(Message, { foreignKey: 'sender', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiver', as: 'receivedMessages' });

// New enhanced associations
User.hasMany(Job, { foreignKey: 'employeeId', as: 'assignedJobs' });
Job.belongsTo(User, { foreignKey: 'employeeId', as: 'Employee' });

User.hasMany(Job, { foreignKey: 'createdBy', as: 'createdJobs' });
Job.belongsTo(User, { foreignKey: 'createdBy', as: 'Creator' });

Party.hasMany(Order, { foreignKey: 'partyId', as: 'orders' });
Order.belongsTo(Party, { foreignKey: 'partyId', as: 'party' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'orderItems' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

OrderItem.hasOne(Job, { foreignKey: 'orderItemId', as: 'job' });
Job.belongsTo(OrderItem, { foreignKey: 'orderItemId', as: 'orderItem' });

Job.hasMany(JobProcessStep, { foreignKey: 'jobId', as: 'processSteps' });
JobProcessStep.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

Job.hasOne(COC, { foreignKey: 'jobId', as: 'certificate' });
COC.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

COC.hasMany(DimensionReport, { foreignKey: 'cocId', as: 'dimensionReports' });
DimensionReport.belongsTo(COC, { foreignKey: 'cocId', as: 'certificate' });

User.hasMany(InternalMessage, { foreignKey: 'fromUserId', as: 'sentInternalMessages' });
User.hasMany(InternalMessage, { foreignKey: 'toUserId', as: 'receivedInternalMessages' });
InternalMessage.belongsTo(User, { foreignKey: 'fromUserId', as: 'fromUser' });
InternalMessage.belongsTo(User, { foreignKey: 'toUserId', as: 'toUser' });

// Material relationships
Material.belongsTo(Party, { foreignKey: 'preferredSupplierId', as: 'PreferredSupplier' });
OrderItem.belongsTo(Material, { foreignKey: 'materialId', as: 'material' });

// Existing legacy associations (maintained for compatibility - using Party instead of Customer/Vendor)
Party.hasMany(Invoice, { foreignKey: 'partyId', as: 'invoices' });
Party.hasMany(Quotation, { foreignKey: 'partyId', as: 'quotations' });
Party.hasMany(Payment, { foreignKey: 'partyId', as: 'payments' });

// Invoice associations
Invoice.belongsTo(Party, { foreignKey: 'partyId', as: 'party' });
Quotation.belongsTo(Party, { foreignKey: 'partyId', as: 'party' });
Payment.belongsTo(Party, { foreignKey: 'partyId', as: 'party' });

Order.hasMany(JobCard, { foreignKey: 'order', as: 'jobCards' });
Order.hasMany(DeliveryChallan, { foreignKey: 'order', as: 'deliveryChallans' });
Order.hasMany(MaterialConsumption, { foreignKey: 'order', as: 'materialConsumptions' });

Process.hasMany(QualityControl, { foreignKey: 'process', as: 'qualityControls' });
Process.hasMany(InspectionReport, { foreignKey: 'process', as: 'inspectionReports' });

Conversation.hasMany(Message, { foreignKey: 'conversation', as: 'messages' });
Message.belongsTo(Conversation, { foreignKey: 'conversation', as: 'conversationData' });

User.hasMany(Notification, { foreignKey: 'user', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user', as: 'userData' });

// Note: Database synchronization is handled separately via migration scripts
// Models are ready to use without automatic sync

module.exports = {
  sequelize,
  User,
  Invoice,
  Quotation,
  Payment,
  Order,
  JobCard,
  DeliveryChallan,
  Inventory,
  StockMovement,
  GRN,
  GatePass,
  BOM,
  MaterialSpecification,
  MaterialConsumption,
  Process,
  QualityControl,
  InspectionReport,
  Message,
  Conversation,
  Notification,
  BroadcastMessage,
  // New enhanced models
  Party,
  OrderItem,
  Job,
  JobProcessStep,
  COC,
  DimensionReport,
  InternalMessage,
  Material
};
