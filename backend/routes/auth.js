const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { validate, userSchemas } = require('../middleware/validation');
const { auth } = require('../middleware/auth');
const { Op } = require('sequelize');
const router = express.Router();

// Register new user
router.post('/register', validate(userSchemas.register), async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, role, phone, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      where: {
        [Op.or]: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email or username already exists' 
      });
    }

    // Set default permissions based on role
    let permissions = [];
    switch (role || 'production') {
      case 'admin':
        permissions = [
          { module: 'accounting', actions: ['create', 'read', 'update', 'delete'] },
          { module: 'orders', actions: ['create', 'read', 'update', 'delete'] },
          { module: 'inventory', actions: ['create', 'read', 'update', 'delete'] },
          { module: 'materials', actions: ['create', 'read', 'update', 'delete'] },
          { module: 'processes', actions: ['create', 'read', 'update', 'delete'] },
          { module: 'audit', actions: ['create', 'read', 'update', 'delete'] },
          { module: 'messages', actions: ['create', 'read', 'update', 'delete'] },
          { module: 'dashboard', actions: ['read'] },
          { module: 'users', actions: ['create', 'read', 'update', 'delete'] }
        ];
        break;
      case 'accountant':
        permissions = [
          { module: 'accounting', actions: ['create', 'read', 'update', 'delete'] },
          { module: 'orders', actions: ['read', 'update'] },
          { module: 'inventory', actions: ['read'] },
          { module: 'dashboard', actions: ['read'] },
          { module: 'messages', actions: ['create', 'read'] }
        ];
        break;
      case 'manager':
        permissions = [
          { module: 'accounting', actions: ['read'] },
          { module: 'orders', actions: ['create', 'read', 'update'] },
          { module: 'inventory', actions: ['read', 'update'] },
          { module: 'materials', actions: ['read', 'update'] },
          { module: 'processes', actions: ['create', 'read', 'update'] },
          { module: 'audit', actions: ['create', 'read', 'update'] },
          { module: 'messages', actions: ['create', 'read', 'update'] },
          { module: 'dashboard', actions: ['read'] }
        ];
        break;
      case 'production':
        permissions = [
          { module: 'orders', actions: ['read', 'update'] },
          { module: 'inventory', actions: ['read'] },
          { module: 'materials', actions: ['read'] },
          { module: 'processes', actions: ['read', 'update'] },
          { module: 'messages', actions: ['create', 'read'] },
          { module: 'dashboard', actions: ['read'] }
        ];
        break;
    }

    // Generate userId
    const userCount = await User.count();
    const userId = `U${String(userCount + 1).padStart(4, '0')}`;

    // Create new user
    const user = await User.create({
      userId,
      username,
      email,
      password,
      firstName,
      lastName,
      roles: [role || 'production'],
      permissions,
      phone,
      address
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        permissions: user.permissions
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login user - NO AUTH MIDDLEWARE REQUIRED
router.post('/login', async (req, res) => {
  try {
    console.log('🔐 LOGIN REQUEST RECEIVED');
    console.log('📝 Request body:', JSON.stringify(req.body, null, 2));
    console.log('� Request headers:', JSON.stringify(req.headers, null, 2));
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔑 JWT_SECRET configured: ${!!process.env.JWT_SECRET}`);
    
    const { email, password } = req.body;

    console.log(`🔐 Production Login attempt for email: ${email}`);
    console.log(`🔒 Password provided: ${!!password}`);

    // Validate input
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required',
        code: 'MISSING_CREDENTIALS',
        received: { email: !!email, password: !!password }
      });
    }

    // Validate JWT_SECRET first
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('❌ JWT_SECRET not configured in production');
      return res.status(500).json({ 
        success: false,
        message: 'Server configuration error - contact administrator',
        code: 'JWT_SECRET_MISSING'
      });
    }

    // Find user by email (case insensitive)
    let user;
    try {
      user = await User.findOne({ 
        where: { 
          email: {
            [Op.iLike]: email.toLowerCase() // Case insensitive for PostgreSQL
          }
        } 
      });
      console.log(`🔍 Database query completed for: ${email}`);
    } catch (dbError) {
      console.error('💥 Database error during user lookup:', dbError);
      return res.status(500).json({ 
        success: false,
        message: 'Database connection error',
        code: 'DB_ERROR'
      });
    }
    
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return res.status(400).json({ 
        success: false,
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    console.log(`✅ User found: ${user.username}, ID: ${user.id}, Active: ${user.isActive}`);

    // Check if user is active
    if (!user.isActive) {
      console.log(`❌ User account deactivated: ${email}`);
      return res.status(400).json({ 
        success: false,
        message: 'Account is deactivated',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Verify password
    let isMatch = false;
    try {
      isMatch = await user.comparePassword(password);
      console.log(`🔑 Password verification result: ${isMatch}`);
    } catch (passwordError) {
      console.error('💥 Password comparison error:', passwordError);
      return res.status(500).json({ 
        success: false,
        message: 'Password verification failed',
        code: 'PASSWORD_SYSTEM_ERROR'
      });
    }

    if (!isMatch) {
      console.log(`❌ Password mismatch for: ${email}`);
      return res.status(400).json({ 
        success: false,
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    console.log(`✅ Password verified for: ${email}`);

    // Update last login
    try {
      user.lastLogin = new Date();
      await user.save();
    } catch (saveError) {
      console.warn('⚠️ Could not update last login:', saveError.message);
      // Don't fail login for this
    }

    // Generate JWT token
    let token;
    try {
      token = jwt.sign(
        { 
          userId: user.id,
          email: user.email,
          username: user.username
        },
        jwtSecret,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );
      console.log(`🎫 Token generated for: ${email}`);
    } catch (tokenError) {
      console.error('💥 Token generation error:', tokenError);
      return res.status(500).json({ 
        message: 'Token generation failed',
        debug: process.env.NODE_ENV === 'development' ? tokenError.message : undefined
      });
    }

    const responseUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.roles && user.roles.length > 0 ? user.roles[0] : 'production',
      permissions: user.permissions || [],
      lastLogin: user.lastLogin
    };

    console.log(`🎉 Login successful for: ${email}`);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: responseUser
    });

  } catch (error) {
    console.error('💥 Login route error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({ 
      success: false,
      message: 'Server error during login',
      code: 'LOGIN_SERVER_ERROR',
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        type: error.name
      } : undefined
    });
  }
});

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    res.json({ user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, validate(userSchemas.updateProfile), async (req, res) => {
  try {
    const updates = req.body;
    await User.update(updates, {
      where: { id: req.user.id }
    });
    
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Current password and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'New password must be at least 6 characters long' 
      });
    }

    const user = await User.findByPk(req.user.id);
    
    // Verify current password
    const isMatch = user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Server error during password change' });
  }
});

// Logout (client-side token removal, but we can track it)
router.post('/logout', auth, async (req, res) => {
  try {
    // In a more sophisticated system, you might want to blacklist the token
    // For now, just send a success response
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
});

// Verify token validity
router.get('/verify', auth, async (req, res) => {
  try {
    res.json({
      valid: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        role: req.user.roles ? req.user.roles[0] : 'production',
        permissions: req.user.permissions
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Server error during token verification' });
  }
});

// Create default admin user (for testing)
router.post('/create-admin', async (req, res) => {
  try {
    console.log('🔧 Attempting to create admin user...');
    
    // Check if any admin already exists
    const existingAdmin = await User.findOne({ 
      where: { 
        email: { [Op.or]: ['admin@erp.com', 'admin@company.com'] }
      } 
    });
    
    if (existingAdmin) {
      console.log('ℹ️ Admin user already exists');
      return res.status(200).json({ 
        message: 'Admin user already exists',
        existingUser: {
          id: existingAdmin.id,
          email: existingAdmin.email,
          username: existingAdmin.username
        }
      });
    }

    console.log('🆕 Creating new admin user...');

    // Find a unique username
    let username = 'admin';
    let usernameExists = await User.findOne({ where: { username } });
    let counter = 1;
    
    while (usernameExists) {
      username = `admin${counter}`;
      usernameExists = await User.findOne({ where: { username } });
      counter++;
    }

    // Create admin user
    const admin = await User.create({
      username: username,
      email: 'admin@erp.com',
      password: 'admin123',
      firstName: 'System',
      lastName: 'Administrator',
      roles: ['admin'],
      permissions: [
        { module: 'all', actions: ['create', 'read', 'update', 'delete'] }
      ]
    });

    console.log('✅ Admin user created successfully:', admin.id);

    res.status(201).json({
      message: 'Admin user created successfully',
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName
      }
    });
  } catch (error) {
    console.error('💥 Admin creation error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    res.status(500).json({ 
      message: 'Error creating admin user',
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        type: error.name,
        details: error.stack
      } : undefined
    });
  }
});

// Migration endpoint for production setup
router.post('/migrate', async (req, res) => {
  try {
    console.log('🚧 Running production database migration...');
    
    const { sequelize } = require('../models');
    
    // Check if already migrated
    try {
      await sequelize.query('SELECT 1 FROM users LIMIT 1');
      return res.status(200).json({
        message: 'Database already migrated',
        timestamp: new Date().toISOString()
      });
    } catch (tableError) {
      console.log('📋 Tables not found, running migration...');
    }
    
    // Run migration
    await sequelize.sync({ alter: true, force: false });
    console.log('✅ Tables created successfully');
    
    // Create indexes
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
    `);
    
    // Create default admin user
    const existingAdmin = await User.findOne({ 
      where: { email: 'admin@company.com' }
    });
    
    if (!existingAdmin) {
      const admin = await User.create({
        username: 'admin',
        email: 'admin@company.com',
        password: 'admin123',
        firstName: 'System',
        lastName: 'Administrator',
        roles: ['admin'],
        permissions: [
          { module: 'all', actions: ['create', 'read', 'update', 'delete'] }
        ]
      });
      console.log('👤 Default admin user created');
    }
    
    res.status(201).json({
      message: 'Database migration completed successfully',
      tables_created: true,
      admin_user: existingAdmin ? 'exists' : 'created',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('💥 Migration error:', error);
    res.status(500).json({
      message: 'Migration failed',
      error: {
        message: error.message,
        type: error.name
      }
    });
  }
});

// Debug route to check database and users
router.get('/debug', async (req, res) => {
  try {
    console.log('🔍 Debug route accessed');
    
    // Check database connection
    const { sequelize } = require('../models');
    await sequelize.authenticate();
    
    // Check if tables exist
    let tablesExist = false;
    let userCount = 0;
    let users = [];
    
    try {
      userCount = await User.count();
      tablesExist = true;
      
      // Get first few users (without passwords)
      users = await User.findAll({
        attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'roles', 'isActive'],
        limit: 5
      });
    } catch (tableError) {
      console.log('⚠️ Tables do not exist:', tableError.message);
    }
    
    res.json({
      message: 'Debug information',
      database: 'connected',
      tablesExist,
      userCount,
      users,
      environment: process.env.NODE_ENV,
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('💥 Debug route error:', error);
    res.status(500).json({
      message: 'Debug route failed',
      error: {
        message: error.message,
        type: error.name
      }
    });
  }
});

module.exports = router;
