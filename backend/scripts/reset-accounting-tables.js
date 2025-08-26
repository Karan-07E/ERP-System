const sequelize = require('../config/database');

async function resetAccountingTables() {
  try {
    console.log('🔄 Starting accounting tables reset...');
    
    // Drop tables in the correct order to avoid foreign key constraints
    const tablesToDrop = [
      'payments',
      'quotations', 
      'invoices',
      // Note: We're not dropping 'parties' table as it might have data
    ];

    for (const table of tablesToDrop) {
      try {
        await sequelize.query(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
        console.log(`✅ Dropped table: ${table}`);
      } catch (error) {
        console.log(`⚠️  Table ${table} not found or already dropped`);
      }
    }

    console.log('🔄 Recreating tables with new schema...');
    
    // Force sync only the updated models
    const { Invoice, Quotation, Payment } = require('../models/Accounting');
    
    // Sync with force: true to recreate tables
    await Invoice.sync({ force: true });
    console.log('✅ Invoice table recreated');
    
    await Quotation.sync({ force: true });
    console.log('✅ Quotation table recreated');
    
    await Payment.sync({ force: true });
    console.log('✅ Payment table recreated');

    console.log('🎉 Accounting tables reset completed successfully!');
    console.log('💡 You can now start the server normally.');
    
  } catch (error) {
    console.error('❌ Error resetting tables:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the script
if (require.main === module) {
  resetAccountingTables()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = resetAccountingTables;
