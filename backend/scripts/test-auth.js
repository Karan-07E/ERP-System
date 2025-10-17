#!/usr/bin/env node

/**
 * Quick Authentication Fix Test
 * Tests authentication with the correct URL
 */

const https = require('https');

const BASE_URL = 'https://erp-system-rmum.onrender.com';

console.log('🔐 Testing Authentication on:', BASE_URL);
console.log('=' .repeat(50));

// Test 1: Create admin user
async function createAdmin() {
  return new Promise((resolve) => {
    const postData = JSON.stringify({});
    
    const options = {
      hostname: 'erp-system-rmum.onrender.com',
      port: 443,
      path: '/api/auth/create-admin',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, data });
      });
    });

    req.on('error', (error) => {
      resolve({ error: error.message });
    });

    req.write(postData);
    req.end();
  });
}

// Test 2: Login with admin
async function testLogin() {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      email: 'admin@erp.com',
      password: 'admin123'
    });
    
    const options = {
      hostname: 'erp-system-rmum.onrender.com',
      port: 443,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, data });
      });
    });

    req.on('error', (error) => {
      resolve({ error: error.message });
    });

    req.write(postData);
    req.end();
  });
}

// Run tests
async function runTests() {
  console.log('1. Creating admin user...');
  const adminResult = await createAdmin();
  
  if (adminResult.error) {
    console.log('❌ Admin creation failed:', adminResult.error);
  } else {
    console.log(`✅ Admin creation: ${adminResult.status}`);
    if (adminResult.data) {
      console.log('   Response:', adminResult.data.substring(0, 100));
    }
  }

  console.log('\n2. Testing login...');
  const loginResult = await testLogin();
  
  if (loginResult.error) {
    console.log('❌ Login failed:', loginResult.error);
  } else {
    console.log(`✅ Login test: ${loginResult.status}`);
    if (loginResult.data) {
      try {
        const jsonData = JSON.parse(loginResult.data);
        if (jsonData.token) {
          console.log('🎫 Token received successfully!');
          console.log('👤 User:', jsonData.user?.email);
        } else {
          console.log('❌ No token in response');
        }
      } catch (e) {
        console.log('   Response:', loginResult.data.substring(0, 200));
      }
    }
  }

  console.log('\n🎉 Authentication test completed!');
}

runTests().catch(console.error);