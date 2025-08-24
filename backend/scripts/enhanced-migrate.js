const { sequelize } = require('../models');

const runMigrations = async () => {
  try {
    console.log('🚀 Starting ERP System Migration...');
    
    // Check database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Create/update tables with new schema
    await sequelize.sync({ alter: true });
    console.log('✅ Database schema updated successfully.');
    
    // Create indexes for better performance
    console.log('📊 Creating performance indexes...');
    
    // Party indexes
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_parties_gst_number ON parties(gst_number);
      CREATE INDEX IF NOT EXISTS idx_parties_state ON parties(state);
      CREATE INDEX IF NOT EXISTS idx_parties_type ON parties(type);
    `);
    
    // Order indexes
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_party_id ON orders(party_id);
      CREATE INDEX IF NOT EXISTS idx_orders_po_number ON orders(po_number);
      CREATE INDEX IF NOT EXISTS idx_orders_negative_flag ON orders(has_negative_flag);
    `);
    
    // Job indexes
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_jobs_employee_id ON jobs(employee_id);
      CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
      CREATE INDEX IF NOT EXISTS idx_jobs_target_date ON jobs(target_completion_date);
    `);
    
    // Material indexes
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_materials_low_stock ON materials(is_low_stock);
      CREATE INDEX IF NOT EXISTS idx_materials_expiry_alert ON materials(expiry_alert);
      CREATE INDEX IF NOT EXISTS idx_materials_hsn_code ON materials(hsn_code);
    `);
    
    console.log('✅ Performance indexes created successfully.');
    
    // Seed initial data
    console.log('🌱 Seeding initial data...');
    
    // Create default admin user with new userId field
    const { User } = require('../models');
    const bcrypt = require('bcrypt');
    
    const adminExists = await User.findOne({ where: { email: 'admin@eee.com' } });
    if (!adminExists) {
      await User.create({
        userId: 'ADM001',
        username: 'admin',
        email: 'admin@eee.com',
        password: 'admin123',
        firstName: 'System',
        lastName: 'Administrator',
        roles: ['admin', 'manager', 'accountant'],
        department: 'Administration',
        designation: 'System Administrator',
        employeeCode: 'EMP001',
        isActive: true
      });
      console.log('✅ Default admin user created.');
    }
    
    // Create sample party
    const { Party } = require('../models');
    const partyExists = await Party.findOne({ where: { partyCode: 'C00001' } });
    if (!partyExists) {
      await Party.create({
        partyCode: 'C00001',
        name: 'Sample Customer Ltd.',
        type: 'customer',
        contactPerson: 'John Doe',
        email: 'customer@sample.com',
        phone: '+91-9876543210',
        address: 'Sample Address',
        city: 'Mumbai',
        state: 'Maharashtra',
        stateCode: '27',
        pincode: '400001',
        gstNumber: '27AABCU9603R1ZX',
        panNumber: 'AABCU9603R'
      });
      console.log('✅ Sample party created.');
    }
    
    // Create sample materials
    const { Material } = require('../models');
    const materialExists = await Material.findOne({ where: { materialCode: 'MAT001' } });
    if (!materialExists) {
      const admin = await User.findOne({ where: { email: 'admin@eee.com' } });
      
      await Material.create({
        materialCode: 'MAT001',
        name: 'Steel Rod 12mm',
        description: 'High grade steel rod 12mm diameter',
        category: 'Raw Material',
        type: 'raw_material',
        unit: 'KG',
        currentStock: 100,
        minimumStock: 20,
        reorderLevel: 25,
        standardCost: 45.50,
        hsnCode: '7213',
        gstRate: 18,
        createdBy: admin.id
      });
      
      await Material.create({
        materialCode: 'MAT002',
        name: 'Aluminum Sheet 2mm',
        description: 'Aluminum sheet 2mm thickness',
        category: 'Raw Material',
        type: 'raw_material',
        unit: 'SQM',
        currentStock: 15, // Low stock to test alerts
        minimumStock: 25,
        reorderLevel: 30,
        standardCost: 120.00,
        hsnCode: '7606',
        gstRate: 18,
        createdBy: admin.id
      });
      
      console.log('✅ Sample materials created.');
    }
    
    console.log('🎉 Migration completed successfully!');
    console.log('\n📋 System Status:');
    console.log('✅ Database: Ready');
    console.log('✅ Models: Synchronized');
    console.log('✅ Indexes: Created');
    console.log('✅ Initial Data: Seeded');
    console.log('\n🚀 ERP System is ready for use!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

module.exports = runMigrations;

// Run if called directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('✅ Migration script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}
