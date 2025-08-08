require('dotenv').config();
const { sequelize } = require('../models');

async function createDatabase() {
  try {
    console.log('Connecting to PostgreSQL...');
    await sequelize.authenticate();
    console.log('Connection established successfully.');

    console.log('Creating database tables...');
    await sequelize.sync({ force: false }); // Set to true to drop and recreate tables
    console.log('Database tables created successfully.');

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

createDatabase();
