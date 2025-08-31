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

// Login user
router.post('/login', validate(userSchemas.login), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(400).json({ message: 'Account is deactivated' });
    }

    // Verify password
    const isMatch = user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        permissions: user.permissions,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
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
        role: req.user.role,
        permissions: req.user.permissions
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Server error during token verification' });
  }
});

module.exports = router;
