const sequelize = require('../config/database');
const { QueryInterface, DataTypes } = require('sequelize');

async function addCocIdField() {
  const queryInterface = sequelize.getQueryInterface();
  
  try {
    console.log('Adding cocId field to certificates_of_conformance table...');
    
    // Add the new cocId column
    await queryInterface.addColumn('certificates_of_conformance', 'cocId', {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
      after: 'cocNumber'
    });
    
    console.log('Successfully added cocId field to certificates_of_conformance table');
    
    // Add unique constraint
    await queryInterface.addIndex('certificates_of_conformance', ['cocId'], {
      unique: true,
      name: 'certificates_of_conformance_cocId_unique'
    });
    
    console.log('Successfully added unique index for cocId field');
    
  } catch (error) {
    console.error('Error adding cocId field:', error);
    throw error;
  }
}

// Run the migration
if (require.main === module) {
  addCocIdField()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = addCocIdField;
