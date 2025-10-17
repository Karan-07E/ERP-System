#!/usr/bin/env node

/**
 * Local Authentication Test
 * Run this to test authentication before deploying
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Import models after env is loaded
const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function testAuth() {
  console.log('🧪 Testing authentication locally...');
  console.log('📍 Environment:', process.env.NODE_ENV);
  console.log('🔑 JWT_SECRET exists:', !!process.env.JWT_SECRET);
  
  try {
    // Test database connection
    const { sequelize } = require('../models');
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    // Check if users exist
    const userCount = await User.count();
    console.log(`👥 Users in database: ${userCount}`);
    
    // List existing users
    if (userCount > 0) {
      const existingUsers = await User.findAll({
        attributes: ['id', 'username', 'email', 'firstName', 'lastName'],
        limit: 5
      });
      console.log('📋 Existing users:');
      existingUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.username})`);
      });
    }
    
    // Create test user if none exist
    let testUser;
    const existingUser = await User.findOne({ where: { email: 'admin@erp.com' } });
    
    if (!existingUser) {
      console.log('🆕 Creating test admin user...');
      
      // Try to find a unique username
      let username = 'admin';
      let usernameExists = await User.findOne({ where: { username } });
      let counter = 1;
      
      while (usernameExists) {
        username = `admin${counter}`;
        usernameExists = await User.findOne({ where: { username } });
        counter++;
      }
      
      testUser = await User.create({
        username: username,
        email: 'admin@erp.com',
        password: 'admin123',
        firstName: 'Test',
        lastName: 'Admin',
        roles: ['admin'],
        permissions: []
      });
      console.log('✅ Test user created:', testUser.id, 'with username:', username);
    } else {
      testUser = existingUser;
      console.log('✅ Using existing test user:', testUser.id);
    }
    
    // Test password comparison
    console.log('🔐 Testing password comparison...');
    const passwordMatch = await testUser.comparePassword('admin123');
    console.log('🔑 Password match result:', passwordMatch);
    
    if (!passwordMatch) {
      console.log('❌ Password comparison failed!');
      return;
    }
    
    // Test JWT token generation
    console.log('🎫 Testing JWT token generation...');
    const token = jwt.sign(
      { userId: testUser.id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );
    console.log('✅ Token generated:', token.substring(0, 50) + '...');
    
    // Test token verification
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    console.log('✅ Token verified:', decoded.userId);
    
    console.log('\n🎉 All authentication tests passed!');
    console.log('📋 Test credentials:');
    console.log('   Email: admin@erp.com');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('💥 Authentication test failed:', {
      message: error.message,
      type: error.name,
      stack: error.stack
    });
  }
  
  process.exit(0);
}

testAuth();