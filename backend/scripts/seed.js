require('dotenv').config();
const {
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
} = require('../models');

async function seedDatabase() {
  try {
    console.log('🔌 Connecting to PostgreSQL...');
    await sequelize.authenticate();
    console.log('✅ Connection established successfully.');

    console.log('🔄 Syncing database tables...');
    await sequelize.sync();
    console.log('✅ Database tables created/updated successfully.');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await sequelize.query('TRUNCATE TABLE users, customers, vendors, items, orders, inventory, processes, job_cards, quality_controls, boms, audit_reports, messages, conversations, notifications, broadcast_messages RESTART IDENTITY CASCADE;');
    console.log('✅ Existing data cleared.');

    console.log('🌱 Creating comprehensive seed data...');

    // Create users with different roles
    console.log('👥 Creating users...');
    const admin = await User.create({
      username: 'admin',
      email: 'admin@company.com',
      password: 'admin123',
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin',
      permissions: ['all'],
      phone: '+1-555-0001',
      address: '123 Admin Street, Admin City, AC 12345'
    });

    const manager = await User.create({
      username: 'jsmith',
      email: 'john.smith@company.com',
      password: 'manager123',
      firstName: 'John',
      lastName: 'Smith',
      role: 'manager',
      permissions: ['read_all', 'write_orders', 'write_production'],
      phone: '+1-555-0002',
      address: '234 Manager Ave, Management City, MC 23456'
    });

    const accountant = await User.create({
      username: 'sjohnson',
      email: 'sarah.johnson@company.com',
      password: 'accountant123',
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'accountant',
      permissions: ['read_accounting', 'write_accounting', 'read_orders'],
      phone: '+1-555-0003',
      address: '345 Finance Blvd, Money City, MC 34567'
    });

    const production = await User.create({
      username: 'mdavis',
      email: 'mike.davis@company.com',
      password: 'password123',
      firstName: 'Mike',
      lastName: 'Davis',
      role: 'production',
      permissions: ['read_production', 'write_production', 'read_orders'],
      phone: '+1-555-0004',
      address: '456 Production Lane, Factory City, FC 45678'
    });

    const quality = await User.create({
      username: 'echen',
      email: 'emily.chen@company.com',
      password: 'password123',
      firstName: 'Emily',
      lastName: 'Chen',
      role: 'production',
      permissions: ['read_quality', 'write_quality', 'read_production'],
      phone: '+1-555-0005',
      address: '555 Quality Street, Inspector City, IC 56789'
    });

    const maintenance = await User.create({
      username: 'dwilson',
      email: 'david.wilson@company.com',
      password: 'password123',
      firstName: 'David',
      lastName: 'Wilson',
      role: 'production',
      permissions: ['read_maintenance', 'write_maintenance'],
      phone: '+1-555-0006',
      address: '666 Maintenance Blvd, Fix City, FC 67890'
    });

    const managerUser = await User.create({
      username: 'manager',
      email: 'manager@erpsystem.com',
      password: 'manager123',
      firstName: 'John',
      lastName: 'Smith',
      role: 'manager',
      permissions: [
        { module: 'accounting', actions: ['read'] },
        { module: 'orders', actions: ['create', 'read', 'update'] },
        { module: 'inventory', actions: ['read', 'update'] },
        { module: 'materials', actions: ['read', 'update'] },
        { module: 'processes', actions: ['create', 'read', 'update'] },
        { module: 'audit', actions: ['create', 'read', 'update'] },
        { module: 'messages', actions: ['create', 'read', 'update'] },
        { module: 'dashboard', actions: ['read'] }
      ],
      phone: '+1-555-0002',
      address: '456 Manager Lane, Manager City, MC 23456',
      department: 'Production'
    });

    const accountantUser = await User.create({
      username: 'accountant',
      email: 'accountant@erpsystem.com',
      password: 'accountant123',
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'accountant',
      permissions: [
        { module: 'accounting', actions: ['create', 'read', 'update', 'delete'] },
        { module: 'orders', actions: ['read', 'update'] },
        { module: 'inventory', actions: ['read'] },
        { module: 'dashboard', actions: ['read'] },
        { module: 'messages', actions: ['create', 'read'] }
      ],
      phone: '+1-555-0003',
      address: '789 Finance Street, Accounting City, FC 34567',
      department: 'Finance'
    });

    const productionUser = await User.create({
      username: 'production',
      email: 'production@erpsystem.com',
      password: 'production123',
      firstName: 'Mike',
      lastName: 'Davis',
      role: 'production',
      permissions: [
        { module: 'orders', actions: ['read', 'update'] },
        { module: 'inventory', actions: ['read'] },
        { module: 'materials', actions: ['read'] },
        { module: 'processes', actions: ['read', 'update'] },
        { module: 'messages', actions: ['create', 'read'] },
        { module: 'dashboard', actions: ['read'] }
      ],
      phone: '+1-555-0004',
      address: '321 Production Ave, Factory City, FC 45678',
      department: 'Production'
    });

    // Additional users for complete testing
    const qualityUser = await User.create({
      username: 'quality',
      email: 'quality@erpsystem.com',
      password: 'quality123',
      firstName: 'Emily',
      lastName: 'Chen',
      role: 'manager',
      phone: '+1-555-0005',
      address: '555 Quality Street, QC City, QC 56789',
      department: 'Quality Assurance'
    });

    const maintenanceUser = await User.create({
      username: 'maintenance',
      email: 'maintenance@erpsystem.com',
      password: 'maintenance123',
      firstName: 'David',
      lastName: 'Wilson',
      role: 'production',
      phone: '+1-555-0006',
      address: '666 Maintenance Blvd, Fix City, FC 67890',
      department: 'Maintenance'
    });

    // Create Customers
    console.log('🏢 Creating customers...');
    const acmeCorp = await Customer.create({
      name: 'Robert Johnson',
      companyName: 'Acme Corporation',
      email: 'robert@acmecorp.com',
      phone: '+1-555-1001',
      address: {
        street: '100 Business Ave',
        city: 'Corporate City',
        state: 'Business State',
        pincode: '10001',
        country: 'USA'
      },
      gstNumber: 'TAX-ACME-001',
      paymentTerms: 'Net 30',
      creditLimit: 100000
    });

    const techSolutions = await Customer.create({
      name: 'Lisa Anderson',
      companyName: 'TechSolutions Pvt Ltd',
      email: 'lisa@techsolutions.com',
      phone: '+1-555-1002',
      address: {
        street: '200 Tech Park',
        city: 'Innovation City',
        state: 'Tech State',
        pincode: '20002',
        country: 'USA'
      },
      gstNumber: 'TAX-TECH-002',
      paymentTerms: 'Net 15',
      creditLimit: 150000
    });

    const industrialMotors = await Customer.create({
      name: 'Mark Thompson',
      companyName: 'Industrial Motors Inc',
      email: 'mark@industrialmotors.com',
      phone: '+1-555-1003',
      address: {
        street: '300 Industrial Drive',
        city: 'Motor City',
        state: 'Industrial State',
        pincode: '30003',
        country: 'USA'
      },
      gstNumber: 'TAX-MOTORS-003',
      paymentTerms: 'Net 45',
      creditLimit: 200000
    });

    // Create Vendors
    console.log('🏭 Creating vendors...');
    const steelCorp = await Vendor.create({
      name: 'Thomas Steel',
      companyName: 'Steel Corp Ltd',
      email: 'thomas@steelcorp.com',
      phone: '+1-555-2001',
      address: {
        street: '400 Steel Road',
        city: 'Metal City',
        state: 'Steel State',
        pincode: '40004',
        country: 'USA'
      },
      gstNumber: 'TAX-STEEL-001',
      paymentTerms: 'Net 30'
    });

    const electronicsSupply = await Vendor.create({
      name: 'Nancy Electronics',
      companyName: 'Electronics Supply Co',
      email: 'nancy@electronicsupply.com',
      phone: '+1-555-2002',
      address: {
        street: '500 Circuit Blvd',
        city: 'Electronics City',
        state: 'Tech State',
        pincode: '50005',
        country: 'USA'
      },
      gstNumber: 'TAX-ELEC-002',
      paymentTerms: 'Net 45'
    });

    // Create Items
    console.log('📦 Creating items...');
    const steelRod = await Item.create({
      itemCode: 'ITM-001',
      name: 'Steel Rod 12mm',
      description: 'High grade steel rod 12mm diameter',
      category: 'raw_material',
      unit: 'pieces',
      purchasePrice: 25.50,
      salePrice: 35.50,
      hsnCode: '7213',
      gstRate: 18,
      reorderLevel: 100,
      maxStock: 500,
      specifications: {
        diameter: '12mm',
        length: '6 meters',
        grade: 'Grade A',
        material: 'Carbon Steel'
      }
    });

    const motorAssembly = await Item.create({
      itemCode: 'ITM-002',
      name: 'Motor Assembly Unit',
      description: 'Complete motor assembly with housing',
      category: 'finished_goods',
      unit: 'pieces',
      purchasePrice: 1250.00,
      salePrice: 1850.00,
      hsnCode: '8501',
      gstRate: 18,
      reorderLevel: 10,
      maxStock: 50,
      specifications: {
        power: '5HP',
        voltage: '240V',
        speed: '1800 RPM',
        type: 'AC Motor'
      }
    });

    const cementBags = await Item.create({
      itemCode: 'ITM-003',
      name: 'Cement Bags',
      description: 'Portland Cement 50kg bags',
      category: 'raw_material',
      unit: 'kg',
      purchasePrice: 350.00,
      salePrice: 420.00,
      hsnCode: '2523',
      gstRate: 28,
      reorderLevel: 200,
      maxStock: 1000,
      specifications: {
        weight: '50kg',
        type: 'OPC 53 Grade',
        brand: 'UltraTech'
      }
    });

    // Create Inventory Records
    console.log('📊 Creating inventory records...');
    await Inventory.create({
      item: steelRod.id,
      currentStock: 250,
      reservedStock: 50,
      availableStock: 200,
      location: 'Warehouse A',
      binLocation: 'A-01-001',
      lastStockUpdate: new Date(),
      averageCost: 25.50,
      totalValue: 6375.00
    });

    await Inventory.create({
      item: motorAssembly.id,
      currentStock: 25,
      reservedStock: 5,
      availableStock: 20,
      location: 'Warehouse B',
      binLocation: 'B-02-001',
      lastStockUpdate: new Date(),
      averageCost: 1250.00,
      totalValue: 31250.00
    });

    await Inventory.create({
      item: cementBags.id,
      currentStock: 45,
      reservedStock: 0,
      availableStock: 45,
      location: 'Warehouse A',
      binLocation: 'A-03-001',
      lastStockUpdate: new Date(),
      averageCost: 8.75,
      totalValue: 393.75
    });

    // Create Sales Orders
    console.log('📋 Creating orders...');
    const salesOrder1 = await Order.create({
      orderNumber: 'SO-2025-145',
      type: 'sales_order',
      customer: acmeCorp.id,
      orderDate: new Date('2025-08-05'),
      expectedDeliveryDate: new Date('2025-08-15'),
      status: 'confirmed',
      priority: 'high',
      items: [
        {
          item: motorAssembly.id,
          itemName: 'Motor Assembly Unit',
          quantity: 10,
          unitPrice: 1250.00,
          totalPrice: 12500.00,
          specifications: 'Standard 5HP motor assembly'
        }
      ],
      subtotal: 12500.00,
      totalGst: 2250.00,
      grandTotal: 14750.00,
      paymentTerms: 'Net 30',
      notes: 'Urgent delivery required for production line',
      createdBy: managerUser.id
    });

    const salesOrder2 = await Order.create({
      orderNumber: 'SO-2025-144',
      type: 'sales_order',
      customer: techSolutions.id,
      orderDate: new Date('2025-08-03'),
      expectedDeliveryDate: new Date('2025-08-13'),
      status: 'shipped',
      priority: 'medium',
      items: [
        {
          item: motorAssembly.id,
          itemName: 'Motor Assembly Unit',
          quantity: 15,
          unitPrice: 1250.00,
          totalPrice: 18750.00,
          specifications: 'High performance motor assembly'
        }
      ],
      subtotal: 18750.00,
      totalGst: 3375.00,
      grandTotal: 22125.00,
      paymentTerms: 'Net 15',
      shippingDate: new Date('2025-08-08'),
      trackingNumber: 'TRK-789012345',
      createdBy: managerUser.id
    });

    // Create Purchase Orders
    const purchaseOrder1 = await Order.create({
      orderNumber: 'PO-2025-078',
      type: 'purchase_order',
      vendor: steelCorp.id,
      orderDate: new Date('2025-08-01'),
      expectedDeliveryDate: new Date('2025-08-10'),
      status: 'in_production',
      priority: 'medium',
      items: [
        {
          item: steelRod.id,
          itemName: 'Steel Rod 12mm',
          quantity: 200,
          unitPrice: 25.50,
          totalPrice: 5100.00,
          specifications: 'Grade A carbon steel'
        }
      ],
      subtotal: 5100.00,
      totalGst: 918.00,
      grandTotal: 6018.00,
      paymentTerms: 'Net 30',
      createdBy: managerUser.id
    });

    // Create Processes first
    console.log('⚙️ Creating processes...');
    const assemblyProcess = await Process.create({
      processCode: 'PROC-001',
      processName: 'Motor Assembly',
      description: 'Complete motor assembly process including testing',
      category: 'assembly',
      department: 'Production',
      estimatedTime: {
        setup: 30,
        cycle: 240,
        total: 270
      },
      skillLevel: 'intermediate',
      workInstructions: 'Follow standard assembly procedure AP-001. Ensure quality checks at each stage.',
      safetyInstructions: 'Wear safety glasses and gloves. Ensure power is disconnected.',
      requiredEquipment: ['Assembly station', 'Testing equipment', 'Torque wrench'],
      qualityParameters: [
        { parameter: 'Visual inspection', target: 'No visible defects' },
        { parameter: 'Electrical test', target: 'Voltage within ±5%' }
      ],
      costPerHour: 50.00,
      createdBy: managerUser.id
    });

    // Create Job Cards
    console.log('🔧 Creating job cards...');
    await JobCard.create({
      jobCardNumber: 'JC-2025-089',
      order: salesOrder1.id,
      item: motorAssembly.id,
      process: assemblyProcess.id,
      quantity: 10,
      startDate: new Date('2025-08-06'),
      targetCompletionDate: new Date('2025-08-12'),
      status: 'in_progress',
      priority: 'high',
      assignedTo: production.id,
      estimatedHours: 40,
      actualHours: 28,
      instructions: 'Follow assembly procedure AP-001. Ensure quality checks at each stage.',
      createdBy: managerUser.id
    });

    await JobCard.create({
      jobCardNumber: 'JC-2025-156',
      order: salesOrder2.id,
      item: motorAssembly.id,
      process: assemblyProcess.id,
      quantity: 15,
      startDate: new Date('2025-08-04'),
      targetCompletionDate: new Date('2025-08-10'),
      status: 'completed',
      priority: 'medium',
      assignedTo: production.id,
      estimatedHours: 60,
      actualHours: 58,
      completionDate: new Date('2025-08-09'),
      instructions: 'Special performance specifications required',
      createdBy: managerUser.id
    });

    // Create Quality Control Records
    console.log('✅ Creating quality control records...');
    await QualityControl.create({
      qcNumber: 'QC-2025-089',
      type: 'final',
      item: motorAssembly.id,
      batchNumber: 'BATCH-001',
      quantity: {
        checked: 50,
        passed: 48,
        failed: 2,
        rework: 0
      },
      checkDate: new Date('2025-08-07'),
      checkedBy: qualityUser.id,
      parameters: [
        { test: 'Visual Inspection', result: 'Pass', remarks: 'No defects found' },
        { test: 'Electrical Test', result: 'Pass', remarks: 'Voltage within specs' },
        { test: 'Performance Test', result: 'Pass', remarks: 'Speed optimal' }
      ],
      overallStatus: 'passed',
      approvedBy: managerUser.id
    });

    // Create BOM
    console.log('📋 Creating BOM...');
    await BOM.create({
      itemCode: 'BOM-MOT-045',
      bomNumber: 'BOM-UPD-045',
      parentItem: motorAssembly.id,
      version: '3.2',
      description: 'Motor Assembly BOM - Revision 3.2',
      effectiveDate: new Date('2025-08-01'),
      status: 'active',
      materials: [
        {
          item: steelRod.id,
          itemName: 'Steel Rod 12mm',
          quantity: 2,
          unit: 'PCS',
          costPerUnit: 25.50,
          totalCost: 51.00
        }
      ],
      totalCost: 800.00,
      laborCost: 150.00,
      overheadCost: 50.00,
      createdBy: managerUser.id,
      approvedBy: admin.id
    });

    // Create Audit Reports
    console.log('📊 Creating audit reports...');
    await AuditReport.create({
      auditNumber: 'IA-2025-001',
      auditType: 'internal',
      isoStandard: 'ISO_9001',
      auditScope: 'Production and Quality Management System',
      auditCriteria: 'ISO 9001:2015 clauses 4-10, Company Quality Manual QM-001',
      auditDate: { start: '2025-07-15', end: '2025-07-18' },
      auditor: { 
        name: 'Sarah Johnson', 
        email: 'sarah.johnson@company.com', 
        certification: 'Lead Auditor ISO 9001' 
      },
      departments: ['Production', 'Quality Assurance', 'Maintenance'],
      findings: [
        {
          type: 'minor_nc',
          clause: '8.5.1',
          description: 'Production control records not consistently maintained',
          evidence: 'Missing production logs for night shift',
          corrective_action: 'Implement mandatory training for all shift supervisors',
          responsible: 'Production Manager',
          due_date: '2025-08-30',
          status: 'open'
        }
      ],
      overallAssessment: { 
        score: 85, 
        recommendation: 'QMS is generally effective with minor improvements needed',
        improvementAreas: ['Production record consistency'],
        strengths: ['Strong management commitment', 'Effective corrective action process']
      },
      status: 'completed',
      createdBy: qualityUser.id
    });

    // Create Messages for real-time testing
    console.log('💬 Creating messages...');
    await Message.create({
      sender: managerUser.id,
      receiver: productionUser.id,
      subject: 'Production Schedule Update',
      content: 'Please check the updated production schedule for next week. Priority items need to be completed by Friday.',
      messageType: 'urgent',
      priority: 'medium',
      status: 'delivered',
      sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    });

    await Message.create({
      sender: qualityUser.id,
      receiver: managerUser.id,
      subject: 'Quality Report Ready',
      content: 'The monthly quality report is ready for review. Overall performance is excellent this month.',
      messageType: 'info',
      priority: 'low',
      status: 'read',
      sentAt: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
    });

    // Create Notifications
    console.log('🔔 Creating notifications...');
    await Notification.create({
      recipient: managerUser.id,
      type: 'warning',
      category: 'inventory',
      title: 'Low Inventory Alert',
      message: 'Steel Rod 12mm stock below minimum threshold',
      relatedTo: { itemCode: 'ITM-001', currentStock: 45, reorderLevel: 50 }
    });

    await Notification.create({
      recipient: qualityUser.id,
      type: 'reminder',
      category: 'deadline',
      title: 'Audit Deadline Approaching',
      message: 'ISO audit documentation due in 3 days',
      relatedTo: { auditNumber: 'IA-2025-002', dueDate: '2025-08-11' }
    });

    console.log('✅ Comprehensive seed data created successfully!');
    console.log('');
    console.log('🔑 Login credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👑 Admin:      admin@company.com / admin123');
    console.log('👔 Manager:     manager@erpsystem.com / manager123');
    console.log('💰 Accountant:  accountant@erpsystem.com / accountant123');
    console.log('🔧 Production:  production@erpsystem.com / production123');
    console.log('🔍 Quality:     quality@erpsystem.com / quality123');
    console.log('⚙️  Maintenance: maintenance@erpsystem.com / maintenance123');
    console.log('');
    console.log('📊 Sample data includes:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('• 6 Users with different roles');
    console.log('• 3 Customers (Acme Corp, TechSolutions, Industrial Motors)');
    console.log('• 2 Vendors (Steel Corp, Electronics Supply)');
    console.log('• 3 Items (Steel Rod, Motor Assembly, Cement Bags)');
    console.log('• 3 Orders (2 Sales, 1 Purchase)');
    console.log('• 2 Job Cards (1 in progress, 1 completed)');
    console.log('• 1 Manufacturing Process');
    console.log('• 1 Quality Control Record');
    console.log('• 1 BOM Record');
    console.log('• 1 Audit Report');
    console.log('• Sample Messages & Notifications');
    console.log('• Complete Inventory Records');
    console.log('');
    console.log('🚀 Database is now ready for ERP system testing!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT. Graceful shutdown...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM. Graceful shutdown...');
  process.exit(0);
});

seedDatabase();
