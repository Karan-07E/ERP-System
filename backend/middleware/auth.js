const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'User account is deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Role-based authorization middleware
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Convert single role to array
    if (typeof roles === 'string') {
      roles = [roles];
    }

    // Check if user role is in allowed roles
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.' 
      });
    }

    next();
  };
};

// Permission-based authorization middleware
const checkPermission = (module, action) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Admin has all permissions
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user has specific permission
    const hasPermission = req.user.permissions.some(permission => 
      permission.module === module && permission.actions.includes(action)
    );

    if (!hasPermission) {
      return res.status(403).json({ 
        message: `Access denied. You don't have ${action} permission for ${module} module.` 
      });
    }

    next();
  };
};

// Middleware to check if user owns the resource or has admin role
const checkOwnership = (resourceField = 'createdBy') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Admin can access all resources
    if (req.user.role === 'admin') {
      return next();
    }

    // For POST requests, automatically set the owner
    if (req.method === 'POST') {
      req.body[resourceField] = req.user.id;
      return next();
    }

    // For other methods, check in the middleware or route handler
    req.ownershipField = resourceField;
    next();
  };
};

// Optional authentication middleware (for public/private endpoints)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId, {
        attributes: { exclude: ['password'] }
      });
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // If token is invalid, continue without user
    next();
  }
};

module.exports = {
  auth,
  authorize,
  checkPermission,
  checkOwnership,
  optionalAuth
};
