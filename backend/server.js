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

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const orderRoutes = require('./routes/orders');
const inventoryRoutes = require('./routes/inventory');
const materialRoutes = require('./routes/materials');
const processRoutes = require('./routes/processes');
const auditRoutes = require('./routes/audit');
const accountingRoutes = require('./routes/accounting');
const messageRoutes = require('./routes/messages');
const partyRoutes = require('./routes/parties');
const jobRoutes = require('./routes/jobs');
const dashboardRoutes = require('./routes/dashboard');
const cocRoutes = require('./routes/coc');
const backupRoutes = require('./routes/backup');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const server = createServer(app);

// Simple test route - should work before any middleware
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.set('trust proxy', 1); // Trust first proxy for rate limiting
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
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
async function initializeDatabase() {
  try {
    console.log('Connecting to PostgreSQL...');
    await sequelize.authenticate();
    console.log('Connected to PostgreSQL');
    
    // Skip sync since enhanced migration was already run
    console.log('Database already synchronized via enhanced migration script');
    console.log('Database initialization completed successfully');
  } catch (err) {
    console.error('Database initialization error:', err);
    throw err; // Don't exit process, let caller handle it
  }
}

// Start server function
async function startServer() {
  try {
    // Initialize database first
    await initializeDatabase();
    
    // Start the HTTP server
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Frontend URL: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
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
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: 'disconnected',
      error: error.message
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/accounting', accountingRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/processes', processRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/messages', messageRoutes);

// New enhanced routes
app.use('/api/parties', require('./routes/parties'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/coc', require('./routes/coc'));
app.use('/api/backup', require('./routes/backup'));
app.use('/api/analytics', require('./routes/analytics'));

// API Health check - v2
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
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
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  
  // Serve static files from React build
  app.use(express.static(path.join(__dirname, '../frontend/build')));
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
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.get('*', (req, res) => {
    // Only serve React app for non-API routes
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
    } else {
      res.status(404).json({ message: 'API route not found' });
    }
  });
} else {
  // 404 handler for development
  app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });
}

module.exports = app;
