const { Sequelize } = require('sequelize');

// Load environment variables
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

// Production-ready database configuration
const createSequelizeInstance = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isRender = process.env.RENDER || process.env.DATABASE_URL?.includes('render');
  
  console.log(`🗄️ Database config - Production: ${isProduction}, Render: ${isRender}`);
  
  if (process.env.DATABASE_URL) {
    console.log('� Using DATABASE_URL for connection');
    
    return new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: isProduction ? false : console.log,
      dialectOptions: {
        ssl: (isProduction || isRender) ? {
          require: true,
          rejectUnauthorized: false
        } : false,
        // Enhanced connection options for Render/Neon
        connectTimeout: 60000,
        socketTimeout: 60000,
        idleTimeoutMillis: 30000,
        application_name: 'erp-system'
      },
      pool: {
        max: 5,          // Reduced for free tier limits
        min: 0,
        acquire: 60000,
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
      },
      benchmark: !isProduction
    });
  } else {
    console.log('🏠 Using individual database credentials for local development');
    
    return new Sequelize(
      process.env.DB_NAME || 'erp_development',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || 'password',
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: console.log,
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
