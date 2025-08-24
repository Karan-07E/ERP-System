const sequelize = require('../config/database');

// Import all models
const User = require('./User');
const { Customer, Vendor, Item, Invoice, Quotation, Payment } = require('./Accounting');
const { Order, JobCard, DeliveryChallan } = require('./Order');
const { Inventory, StockMovement, GRN, GatePass } = require('./Inventory');
const { Process, QualityControl, InspectionReport } = require('./Process');
const { AuditReport, StandardAuditForm, AuditFormResponse } = require('./Audit');
const { Message, Conversation, Notification, BroadcastMessage } = require('./Message');

// Import new enhanced models
const Party = require('./Party');
const OrderItem = require('./OrderItem');
const { Job, JobProcessStep } = require('./Job');
const { COC, DimensionReport } = require('./COC');
const InternalMessage = require('./InternalMessage');

// Import enhanced Material model
const { Material, BOM, MaterialSpecification, MaterialConsumption } = require('./Material');

// Existing associations (preserved for backward compatibility)
User.hasMany(Invoice, { foreignKey: 'createdBy', as: 'createdInvoices' });
User.hasMany(Order, { foreignKey: 'createdBy', as: 'createdOrders' });
User.hasMany(Process, { foreignKey: 'createdBy', as: 'createdProcesses' });
User.hasMany(QualityControl, { foreignKey: 'checkedBy', as: 'qualityChecks' });
User.hasMany(InspectionReport, { foreignKey: 'inspector', as: 'inspectionReports' });
User.hasMany(AuditReport, { foreignKey: 'createdBy', as: 'auditReports' });
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

User.hasMany(InternalMessage, { foreignKey: 'fromUserId', as: 'SentInternalMessages' });
User.hasMany(InternalMessage, { foreignKey: 'toUserId', as: 'ReceivedInternalMessages' });
InternalMessage.belongsTo(User, { foreignKey: 'fromUserId', as: 'Sender' });
InternalMessage.belongsTo(User, { foreignKey: 'toUserId', as: 'Recipient' });

// Material relationships
Material.belongsTo(Party, { foreignKey: 'preferredSupplierId', as: 'PreferredSupplier' });
OrderItem.belongsTo(Material, { foreignKey: 'materialId', as: 'material' });

// Existing legacy associations (maintained for compatibility)
Customer.hasMany(Invoice, { foreignKey: 'customer', as: 'invoices' });
Customer.hasMany(Order, { foreignKey: 'customer', as: 'orders' });
Customer.hasMany(Quotation, { foreignKey: 'customer', as: 'quotations' });

Vendor.hasMany(Order, { foreignKey: 'vendor', as: 'orders' });
Vendor.hasMany(GRN, { foreignKey: 'vendor', as: 'grns' });

Item.hasMany(Inventory, { foreignKey: 'item', as: 'inventoryRecords' });
Item.hasMany(StockMovement, { foreignKey: 'item', as: 'stockMovements' });
Item.hasMany(BOM, { foreignKey: 'parentItem', as: 'boms' });
Item.hasMany(MaterialSpecification, { foreignKey: 'material', as: 'materialSpecs' });

Order.hasMany(JobCard, { foreignKey: 'order', as: 'jobCards' });
Order.hasMany(DeliveryChallan, { foreignKey: 'order', as: 'deliveryChallans' });
Order.hasMany(MaterialConsumption, { foreignKey: 'order', as: 'materialConsumptions' });

JobCard.hasMany(MaterialConsumption, { foreignKey: 'jobCard', as: 'materialConsumptions' });

Process.hasMany(JobCard, { foreignKey: 'process', as: 'jobCards' });
Process.hasMany(InspectionReport, { foreignKey: 'process', as: 'inspectionReports' });

// Reverse associations
Invoice.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Invoice.belongsTo(Customer, { foreignKey: 'customer', as: 'customerDetails' });

Order.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Order.belongsTo(Customer, { foreignKey: 'customer', as: 'customerDetails' });
Order.belongsTo(Vendor, { foreignKey: 'vendor', as: 'vendorDetails' });

JobCard.belongsTo(Order, { foreignKey: 'order', as: 'orderDetails' });
JobCard.belongsTo(Item, { foreignKey: 'item', as: 'itemDetails' });
JobCard.belongsTo(Process, { foreignKey: 'process', as: 'processDetails' });
JobCard.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });
JobCard.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

DeliveryChallan.belongsTo(Customer, { foreignKey: 'customer', as: 'customerDetails' });
DeliveryChallan.belongsTo(Vendor, { foreignKey: 'vendor', as: 'vendorDetails' });
DeliveryChallan.belongsTo(Order, { foreignKey: 'order', as: 'orderDetails' });
DeliveryChallan.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

Inventory.belongsTo(Item, { foreignKey: 'item', as: 'itemDetails' });

StockMovement.belongsTo(Item, { foreignKey: 'item', as: 'itemDetails' });
StockMovement.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
StockMovement.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });

GRN.belongsTo(Order, { foreignKey: 'purchaseOrder', as: 'purchaseOrderDetails' });
GRN.belongsTo(Vendor, { foreignKey: 'vendor', as: 'vendorDetails' });
GRN.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
GRN.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });

GatePass.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

BOM.belongsTo(Item, { foreignKey: 'parentItem', as: 'parentItemDetails' });
BOM.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
BOM.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });

MaterialSpecification.belongsTo(Item, { foreignKey: 'material', as: 'materialDetails' });
MaterialSpecification.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
MaterialSpecification.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });

MaterialConsumption.belongsTo(JobCard, { foreignKey: 'jobCard', as: 'jobCardDetails' });
MaterialConsumption.belongsTo(Order, { foreignKey: 'order', as: 'orderDetails' });
MaterialConsumption.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
MaterialConsumption.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });

Process.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

QualityControl.belongsTo(Item, { foreignKey: 'item', as: 'itemDetails' });
QualityControl.belongsTo(User, { foreignKey: 'checkedBy', as: 'checker' });
QualityControl.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });

InspectionReport.belongsTo(Item, { foreignKey: 'item', as: 'itemDetails' });
InspectionReport.belongsTo(Process, { foreignKey: 'process', as: 'processDetails' });
InspectionReport.belongsTo(User, { foreignKey: 'inspector', as: 'inspectorDetails' });
InspectionReport.belongsTo(Customer, { foreignKey: 'customer', as: 'customerDetails' });
InspectionReport.belongsTo(Vendor, { foreignKey: 'vendor', as: 'vendorDetails' });
InspectionReport.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
InspectionReport.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });

AuditReport.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
AuditReport.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });

StandardAuditForm.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
StandardAuditForm.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });

AuditFormResponse.belongsTo(StandardAuditForm, { foreignKey: 'form', as: 'formDetails' });
AuditFormResponse.belongsTo(AuditReport, { foreignKey: 'auditReport', as: 'auditReportDetails' });
AuditFormResponse.belongsTo(User, { foreignKey: 'respondent', as: 'respondentDetails' });
AuditFormResponse.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' });

Message.belongsTo(User, { foreignKey: 'sender', as: 'senderDetails' });
Message.belongsTo(User, { foreignKey: 'receiver', as: 'receiverDetails' });
Message.belongsTo(Message, { foreignKey: 'parentMessage', as: 'parentMessageDetails' });

Conversation.belongsTo(Message, { foreignKey: 'lastMessage', as: 'lastMessageDetails' });

Notification.belongsTo(User, { foreignKey: 'recipient', as: 'recipientDetails' });

BroadcastMessage.belongsTo(User, { foreignKey: 'sender', as: 'senderDetails' });

Quotation.belongsTo(Customer, { foreignKey: 'customer', as: 'customerDetails' });
Quotation.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

Payment.belongsTo(Customer, { foreignKey: 'customer', as: 'customerDetails' });
Payment.belongsTo(Vendor, { foreignKey: 'vendor', as: 'vendorDetails' });
Payment.belongsTo(Invoice, { foreignKey: 'invoice', as: 'invoiceDetails' });
Payment.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

module.exports = {
  sequelize,
  User,
  Customer,
  Vendor,
  Item,
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
  AuditReport,
  StandardAuditForm,
  AuditFormResponse,
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

// Sync all models
sequelize.sync({ force: false })
  .then(() => {
    console.log('All models were synchronized successfully.');
  })
  .catch(err => {
    console.error('Error synchronizing models:', err);
  });

module.exports = {
  sequelize,
  User,
  Customer,
  Vendor,
  Item,
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
  AuditReport,
  StandardAuditForm,
  AuditFormResponse,
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

// Define associations
User.hasMany(Invoice, { foreignKey: 'createdBy', as: 'createdInvoices' });
User.hasMany(Order, { foreignKey: 'createdBy', as: 'createdOrders' });
User.hasMany(Process, { foreignKey: 'createdBy', as: 'createdProcesses' });
User.hasMany(QualityControl, { foreignKey: 'checkedBy', as: 'qualityChecks' });
User.hasMany(InspectionReport, { foreignKey: 'inspector', as: 'inspectionReports' });
User.hasMany(AuditReport, { foreignKey: 'createdBy', as: 'auditReports' });
User.hasMany(Message, { foreignKey: 'sender', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiver', as: 'receivedMessages' });

Customer.hasMany(Invoice, { foreignKey: 'customer', as: 'invoices' });
Customer.hasMany(Order, { foreignKey: 'customer', as: 'orders' });
Customer.hasMany(Quotation, { foreignKey: 'customer', as: 'quotations' });

Vendor.hasMany(Order, { foreignKey: 'vendor', as: 'orders' });
Vendor.hasMany(GRN, { foreignKey: 'vendor', as: 'grns' });

Item.hasMany(Inventory, { foreignKey: 'item', as: 'inventoryRecords' });
Item.hasMany(StockMovement, { foreignKey: 'item', as: 'stockMovements' });
Item.hasMany(BOM, { foreignKey: 'parentItem', as: 'boms' });
Item.hasMany(MaterialSpecification, { foreignKey: 'material', as: 'materialSpecs' });

Order.hasMany(JobCard, { foreignKey: 'order', as: 'jobCards' });
Order.hasMany(DeliveryChallan, { foreignKey: 'order', as: 'deliveryChallans' });
Order.hasMany(MaterialConsumption, { foreignKey: 'order', as: 'materialConsumptions' });

JobCard.hasMany(MaterialConsumption, { foreignKey: 'jobCard', as: 'materialConsumptions' });

Process.hasMany(JobCard, { foreignKey: 'process', as: 'jobCards' });
Process.hasMany(InspectionReport, { foreignKey: 'process', as: 'inspectionReports' });

// Reverse associations
Invoice.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Invoice.belongsTo(Customer, { foreignKey: 'customer', as: 'customerDetails' });

Order.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Order.belongsTo(Customer, { foreignKey: 'customer', as: 'customerDetails' });
Order.belongsTo(Vendor, { foreignKey: 'vendor', as: 'vendorDetails' });

JobCard.belongsTo(Order, { foreignKey: 'order', as: 'orderDetails' });
JobCard.belongsTo(Item, { foreignKey: 'item', as: 'itemDetails' });
JobCard.belongsTo(Process, { foreignKey: 'process', as: 'processDetails' });
JobCard.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });
JobCard.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

DeliveryChallan.belongsTo(Customer, { foreignKey: 'customer', as: 'customerDetails' });
DeliveryChallan.belongsTo(Vendor, { foreignKey: 'vendor', as: 'vendorDetails' });
DeliveryChallan.belongsTo(Order, { foreignKey: 'order', as: 'orderDetails' });
DeliveryChallan.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

Inventory.belongsTo(Item, { foreignKey: 'item', as: 'itemDetails' });

StockMovement.belongsTo(Item, { foreignKey: 'item', as: 'itemDetails' });
StockMovement.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
StockMovement.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });

GRN.belongsTo(Order, { foreignKey: 'purchaseOrder', as: 'purchaseOrderDetails' });
GRN.belongsTo(Vendor, { foreignKey: 'vendor', as: 'vendorDetails' });
GRN.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
GRN.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });

GatePass.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

BOM.belongsTo(Item, { foreignKey: 'parentItem', as: 'parentItemDetails' });
BOM.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
BOM.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });

MaterialSpecification.belongsTo(Item, { foreignKey: 'material', as: 'materialDetails' });
MaterialSpecification.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
MaterialSpecification.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });

MaterialConsumption.belongsTo(JobCard, { foreignKey: 'jobCard', as: 'jobCardDetails' });
MaterialConsumption.belongsTo(Order, { foreignKey: 'order', as: 'orderDetails' });
MaterialConsumption.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
MaterialConsumption.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });

Process.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

QualityControl.belongsTo(Item, { foreignKey: 'item', as: 'itemDetails' });
QualityControl.belongsTo(User, { foreignKey: 'checkedBy', as: 'checker' });
QualityControl.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });

InspectionReport.belongsTo(Item, { foreignKey: 'item', as: 'itemDetails' });
InspectionReport.belongsTo(Process, { foreignKey: 'process', as: 'processDetails' });
InspectionReport.belongsTo(User, { foreignKey: 'inspector', as: 'inspectorDetails' });
InspectionReport.belongsTo(Customer, { foreignKey: 'customer', as: 'customerDetails' });
InspectionReport.belongsTo(Vendor, { foreignKey: 'vendor', as: 'vendorDetails' });
InspectionReport.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
InspectionReport.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });

AuditReport.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
AuditReport.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });

StandardAuditForm.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
StandardAuditForm.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });

AuditFormResponse.belongsTo(StandardAuditForm, { foreignKey: 'form', as: 'formDetails' });
AuditFormResponse.belongsTo(AuditReport, { foreignKey: 'auditReport', as: 'auditReportDetails' });
AuditFormResponse.belongsTo(User, { foreignKey: 'respondent', as: 'respondentDetails' });
AuditFormResponse.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' });

Message.belongsTo(User, { foreignKey: 'sender', as: 'senderDetails' });
Message.belongsTo(User, { foreignKey: 'receiver', as: 'receiverDetails' });
Message.belongsTo(Message, { foreignKey: 'parentMessage', as: 'parentMessageDetails' });

Conversation.belongsTo(Message, { foreignKey: 'lastMessage', as: 'lastMessageDetails' });

Notification.belongsTo(User, { foreignKey: 'recipient', as: 'recipientDetails' });

BroadcastMessage.belongsTo(User, { foreignKey: 'sender', as: 'senderDetails' });

Quotation.belongsTo(Customer, { foreignKey: 'customer', as: 'customerDetails' });
Quotation.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

Payment.belongsTo(Customer, { foreignKey: 'customer', as: 'customerDetails' });
Payment.belongsTo(Vendor, { foreignKey: 'vendor', as: 'vendorDetails' });
Payment.belongsTo(Invoice, { foreignKey: 'invoice', as: 'invoiceDetails' });
Payment.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

module.exports = {
  sequelize,
  User,
  Customer,
  Vendor,
  Item,
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
  AuditReport,
  StandardAuditForm,
  AuditFormResponse,
  Message,
  Conversation,
  Notification,
  BroadcastMessage
};
