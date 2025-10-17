const { Sequelize } = require('sequelize');

// Load environment variables
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

// Enhanced database configuration for Render deployment
const createSequelizeInstance = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (process.env.DATABASE_URL) {
    console.log('🗄️ Using DATABASE_URL for connection');
    
    return new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      dialectOptions: {
        ssl: isProduction ? {
          require: true,
          rejectUnauthorized: false
        } : false,
        // Additional options for Render
        connectTimeout: 30000,
        socketTimeout: 30000,
        idleTimeoutMillis: 30000
      },
      pool: {
        max: 20,
        min: 0,
        acquire: 60000,    // Increased for Render
        idle: 10000,
        evict: 1000,
        handleDisconnects: true
      },
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
      },
      retry: {
        max: 3
      }
    });
  } else {
    console.log('🗄️ Using individual database credentials');
    
    return new Sequelize(
      process.env.DB_NAME || 'erp_development',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || 'password',
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
          max: 20,
          min: 0,
          acquire: 30000,
          idle: 10000
        },
        define: {
          timestamps: true,
          underscored: true,
          freezeTableName: true
        }
      }
    );
  }
};

const sequelize = createSequelizeInstance();

module.exports = sequelize;
