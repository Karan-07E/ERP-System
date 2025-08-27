const { sequelize } = require('../models');

const resetDatabase = async () => {
  try {
    console.log('🔄 Resetting database for clean start...');
    
    // Check connection
    await sequelize.authenticate();
    console.log('✅ Database connected.');
    
    // Drop all tables and recreate (force: true)
    console.log('🗑️  Dropping existing tables...');
    await sequelize.sync({ force: true });
    
    console.log('✅ Database reset successfully!');
    console.log('');
    console.log('🎉 All 4 phases are now ready for implementation:');
    console.log('   📊 Phase 1: Core Data Model Changes (Party, Order, Job, GST)');
    console.log('   🎛️  Phase 2: Enhanced Dashboard & UI');  
    console.log('   📄 Phase 3: COC & Advanced Reporting');
    console.log('   🔧 Phase 4: Material Management');
    console.log('');
    console.log('🏃‍♂️ Run the server now with: node server.js');
    
  } catch (error) {
    console.error('❌ Reset failed:', error);
    throw error;
  }
};

// Run the reset
if (require.main === module) {
  resetDatabase()
    .then(() => {
      console.log('Database reset completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database reset failed:', error);
      process.exit(1);
    });
}

module.exports = { resetDatabase };
