const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Simple test user for login
const testUser = {
  id: 1,
  username: 'admin',
  email: 'admin@test.com',
  password: 'admin123', // In real app, this would be hashed
  role: 'admin'
};

// Health check
app.get('/api/auth/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server running' });
});

// Login route
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  console.log('Login attempt:', { username, password });
  
  // Simple validation
  if (username === testUser.username && password === testUser.password) {
    const token = jwt.sign(
      { id: testUser.id, username: testUser.username, role: testUser.role },
      'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: testUser.id,
        username: testUser.username,
        email: testUser.email,
        role: testUser.role
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// Dashboard route
app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    totalOrders: 45,
    pendingOrders: 12,
    completedJobs: 28,
    activeJobs: 8,
    totalRevenue: 125000,
    monthlyRevenue: 25000
  });
});

// Catch all for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`✅ Simple server running on port ${PORT}`);
  console.log(`📱 Frontend should connect to: http://localhost:${PORT}`);
  console.log(`🔐 Test login: username="admin", password="admin123"`);
});
