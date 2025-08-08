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

// Import Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const accountingRoutes = require('./routes/accounting');
const orderRoutes = require('./routes/orders');
const inventoryRoutes = require('./routes/inventory');
const materialRoutes = require('./routes/materials');
const processRoutes = require('./routes/processes');
const dashboardRoutes = require('./routes/dashboard');
const auditRoutes = require('./routes/audit');
const messageRoutes = require('./routes/messages');

const app = express();
const server = createServer(app);
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
    
    // Run migrations in production
    if (process.env.NODE_ENV === 'production') {
      console.log('Running database migrations...');
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);
      
      try {
        await execAsync('node scripts/migrate.js', { cwd: __dirname });
        console.log('Database migrations completed');
      } catch (migrationError) {
        console.log('Migration script not found or failed, running sync...');
        await sequelize.sync({ alter: true });
        console.log('Database synchronized');
      }
    } else {
      await sequelize.sync({ force: false });
      console.log('Database synchronized');
    }
  } catch (err) {
    console.error('Database initialization error:', err);
    process.exit(1);
  }
}

// Initialize database before starting server
initializeDatabase();

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

// API Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Serve React static files in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  
  // Serve static files from React build
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
} else {
  // 404 handler for development
  app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
