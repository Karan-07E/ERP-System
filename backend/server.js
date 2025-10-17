require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const express = require('express');
const { sequelize } = require('./models');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const fileUpload = require('express-fileupload');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const orderRoutes = require('./routes/orders');
const inventoryRoutes = require('./routes/inventory');
const materialRoutes = require('./routes/materials');
const processRoutes = require('./routes/processes');
const accountingRoutes = require('./routes/accounting');
const messageRoutes = require('./routes/messages');
const partyRoutes = require('./routes/parties');
const jobRoutes = require('./routes/jobs');
const dashboardRoutes = require('./routes/dashboard');
const cocRoutes = require('./routes/coc');
const analyticsRoutes = require('./routes/analytics');
const dimensionReportsRoutes = require('./routes/dimensionReports');

const app = express();
const server = createServer(app);

// Environment detection - Force production mode on Render
const isRenderDeployment = process.env.RENDER || process.env.DATABASE_URL?.includes('render') || process.env.PORT;
const isProduction = process.env.NODE_ENV === 'production' || isRenderDeployment;
const PORT = process.env.PORT || 5000;

// Set NODE_ENV to production if on Render but not explicitly set
if (isRenderDeployment && process.env.NODE_ENV !== 'production') {
  process.env.NODE_ENV = 'production';
  console.log('🔧 Detected Render deployment, forcing NODE_ENV=production');
}

// Frontend URL configuration
const FRONTEND_URL = process.env.FRONTEND_URL || 
  (isProduction ? 'https://erp-system-rmum.onrender.com' : 'http://localhost:3000');

console.log(`🌟 Starting server in ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} mode`);
console.log(`🔗 Frontend URL: ${FRONTEND_URL}`);
console.log(`🗄️ Database URL configured: ${!!process.env.DATABASE_URL}`);
console.log(`🚀 Render deployment detected: ${isRenderDeployment}`);

// Simple test route - should work before any middleware
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Server is working!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    frontend_url: FRONTEND_URL
  });
});

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.set('trust proxy', 1); // Trust first proxy for rate limiting

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Allow embedding for Socket.IO
  contentSecurityPolicy: false // Disable CSP in production for now
}));

app.use(compression());

// CORS configuration - more specific for production
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      FRONTEND_URL,
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// File upload middleware
app.use(fileUpload({
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
  abortOnLimit: true,
  responseOnLimit: 'File size limit exceeded',
  createParentPath: true
}));

// Static files
app.use('/uploads', express.static('uploads'));

// Database connection and migration
// Database initialization with production migration
async function initializeDatabase() {
  try {
    console.log('� Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Use production migration for comprehensive setup
    const productionMigrate = require('./scripts/production-migrate');
    
    console.log('� Running production migration...');
    const migrationResult = await productionMigrate();
    
    console.log('🎉 Production migration completed successfully');
    console.log(`� Migration results:`, migrationResult);
    
    return true;
  } catch (err) {
    console.error('❌ Database initialization error:', {
      message: err.message,
      code: err.code,
      errno: err.errno,
      stack: err.stack
    });
    
    // Fallback to basic sync if production migration fails
    console.log('� Attempting fallback database sync...');
    try {
      await sequelize.sync({ alter: true, force: false });
      console.log('✅ Fallback sync completed');
      return true;
    } catch (fallbackErr) {
      console.error('❌ Fallback sync also failed:', fallbackErr.message);
      throw fallbackErr;
    }
  }
}

// Start server function
async function startServer() {
  try {
    // Initialize database first
    await initializeDatabase();
    
    // Start the HTTP server
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Frontend URL: ${FRONTEND_URL}`);
      console.log(`🌐 Server accessible at: http://0.0.0.0:${PORT}`);
      console.log(`🔍 Health check: http://0.0.0.0:${PORT}/health`);
      console.log(`🧪 Test endpoint: http://0.0.0.0:${PORT}/test`);
    });
  } catch (err) {
    console.error('💥 Failed to start server:', err);
    process.exit(1);
  }
}

// Start the server
startServer();

// Socket.IO for real-time messaging
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join_room', (userId) => {
    socket.join(userId);
  });
  
  socket.on('send_message', (data) => {
    io.to(data.receiverId).emit('receive_message', data);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: 'connected',
      port: PORT,
      frontend_url: FRONTEND_URL,
      version: '1.0.0'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: 'disconnected',
      error: error.message,
      port: PORT,
      frontend_url: FRONTEND_URL
    });
  }
});

// Routes - ALL API routes are mounted with /api prefix
console.log('🔧 Setting up API routes...');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/accounting', accountingRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/processes', processRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/parties', partyRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/coc', cocRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/dimension-reports', dimensionReportsRoutes);

console.log('✅ All API routes configured');

// API Health check - v2
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'API endpoints are working',
    routes: [
      '/api/auth', '/api/users', '/api/accounting', '/api/orders',
      '/api/inventory', '/api/materials', '/api/processes', '/api/dashboard',
      '/api/messages', '/api/parties', '/api/jobs', '/api/coc',
      '/api/analytics', '/api/dimension-reports'
    ]
  });
});

// Seed database endpoint (for initial setup)
app.post('/api/seed', async (req, res) => {
  try {
    console.log('Running database seed...');
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    await execAsync('node scripts/seed.js', { cwd: __dirname });
    res.json({ 
      success: true, 
      message: 'Database seeded successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to seed database',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Serve React static files in production
if (isProduction) {
  console.log('🎭 Setting up static file serving for production...');
  
  const buildPath = path.join(__dirname, '../frontend/build');
  const fs = require('fs');
  
  // Check if build directory exists
  if (fs.existsSync(buildPath)) {
    app.use(express.static(buildPath));
    console.log(`✅ Static files configured from: ${buildPath}`);
  } else {
    console.warn(`⚠️ Build directory not found: ${buildPath}`);
    console.log('📁 Available directories:', fs.readdirSync(path.join(__dirname, '..')));
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Serve React app for all non-API routes in production
if (isProduction) {
  app.get('*', (req, res) => {
    // Only serve React app for non-API routes
    if (!req.path.startsWith('/api/')) {
      const htmlPath = path.join(__dirname, '../frontend/build', 'index.html');
      const fs = require('fs');
      
      // Check if index.html exists
      if (fs.existsSync(htmlPath)) {
        console.log(`📄 Serving React app for path: ${req.path}`);
        res.sendFile(htmlPath);
      } else {
        console.error(`❌ React build not found: ${htmlPath}`);
        res.status(404).json({ 
          message: 'Frontend build not found - please build the frontend first',
          path: req.path,
          method: req.method,
          environment: 'production',
          buildPath: htmlPath,
          timestamp: new Date().toISOString()
        });
      }
    } else {
      console.log(`❌ API route not found: ${req.method} ${req.path}`);
      res.status(404).json({ 
        message: 'API route not found',
        path: req.path,
        method: req.method,
        environment: 'production',
        timestamp: new Date().toISOString()
      });
    }
  });
} else {
  // 404 handler for development
  app.use('*', (req, res) => {
    console.log(`❌ Route not found in development: ${req.method} ${req.path}`);
    res.status(404).json({ 
      message: 'Route not found - server running in development mode',
      path: req.path,
      method: req.method,
      environment: 'development',
      note: 'Set NODE_ENV=production for production deployment',
      timestamp: new Date().toISOString()
    });
  });
}

module.exports = app;
