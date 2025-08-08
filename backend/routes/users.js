const express = require('express');
const User = require('../models/User');
const { auth, authorize, checkPermission } = require('../middleware/auth');
const { validate, userSchemas } = require('../middleware/validation');
const router = express.Router();

// Get all users (admin only)
router.get('/', auth, authorize(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, isActive } = req.query;
    
    // Build query
    let query = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', auth, authorize(['admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new user (admin only)
router.post('/', auth, authorize(['admin']), validate(userSchemas.register), async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, role, phone, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
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

    const user = new User({
      username,
      email,
      password,
      firstName,
      lastName,
      role: role || 'production',
      permissions,
      phone,
      address
    });

    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error during user creation' });
  }
});

// Update user (admin only)
router.put('/:id', auth, authorize(['admin']), async (req, res) => {
  try {
    const { password, permissions, role, isActive, ...updates } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update basic info
    Object.assign(user, updates);
    
    // Update role and permissions if provided
    if (role) user.role = role;
    if (permissions) user.permissions = permissions;
    if (isActive !== undefined) user.isActive = isActive;

    // Update password if provided
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ 
          message: 'Password must be at least 6 characters long' 
        });
      }
      user.password = password;
    }

    await user.save();

    res.json({
      message: 'User updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error during user update' });
  }
});

// Deactivate user (admin only)
router.patch('/:id/deactivate', auth, authorize(['admin']), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User deactivated successfully',
      user
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Activate user (admin only)
router.patch('/:id/activate', auth, authorize(['admin']), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User activated successfully',
      user
    });
  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user permissions (admin only)
router.put('/:id/permissions', auth, authorize(['admin']), async (req, res) => {
  try {
    const { permissions } = req.body;

    if (!Array.isArray(permissions)) {
      return res.status(400).json({ message: 'Permissions must be an array' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { permissions },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User permissions updated successfully',
      user
    });
  } catch (error) {
    console.error('Update permissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (admin only) - soft delete
router.delete('/:id', auth, authorize(['admin']), async (req, res) => {
  try {
    // Don't allow deleting own account
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false, deletedAt: new Date() },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User deleted successfully',
      user
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user statistics (admin only)
router.get('/stats/overview', auth, authorize(['admin']), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      usersByRole,
      recentUsers
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
