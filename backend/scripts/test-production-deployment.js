const axios = require('axios');

/**
 * Production Deployment Testing Script
 * 
 * Tests all critical functionality after deployment to Render
 */

const DEPLOYED_URL = process.env.DEPLOYED_URL || 'https://erp-system-rmum.onrender.com';
const TEST_EMAIL = 'admin@eee.com';
const TEST_PASSWORD = 'admin123';

console.log(`🧪 Testing Production Deployment: ${DEPLOYED_URL}`);
console.log(`⏰ Test started at: ${new Date().toISOString()}`);

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runProductionTests() {
  let passed = 0;
  let failed = 0;
  let authToken = null;

  console.log('\n🚀 Starting Production Authentication Tests...\n');

  // Test 1: Health Check
  console.log('1️⃣ Testing Health Check...');
  try {
    const response = await axios.get(`${DEPLOYED_URL}/health`, { timeout: 30000 });
    if (response.status === 200) {
      console.log('✅ Health check passed');
      console.log(`   Server status: ${response.data.status || 'OK'}`);
      passed++;
    } else {
      console.log(`❌ Health check failed: ${response.status}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ Health check error: ${error.message}`);
    failed++;
  }

  await delay(2000);

  // Test 2: Database Migration
  console.log('\n2️⃣ Testing Database Migration...');
  try {
    const response = await axios.post(`${DEPLOYED_URL}/api/auth/migrate`, {}, { 
      timeout: 45000,
      validateStatus: () => true 
    });
    if (response.status === 200 || response.status === 201) {
      console.log('✅ Database migration successful');
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data)}`);
      passed++;
    } else {
      console.log(`❌ Migration failed: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data)}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ Migration error: ${error.message}`);
    failed++;
  }

  await delay(3000);

  // Test 3: Login Authentication (CRITICAL TEST)
  console.log('\n3️⃣ Testing Login Authentication...');
  try {
    const response = await axios.post(`${DEPLOYED_URL}/api/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    }, { 
      timeout: 30000,
      validateStatus: () => true 
    });

    console.log(`   Login response status: ${response.status}`);
    console.log(`   Login response data:`, JSON.stringify(response.data, null, 2));

    if (response.status === 200 && response.data.success && response.data.token) {
      console.log('✅ Login successful - Authentication working!');
      console.log(`   Token received: ${response.data.token.substring(0, 30)}...`);
      console.log(`   User: ${response.data.user.email}`);
      authToken = response.data.token;
      passed++;
    } else if (response.status === 400) {
      console.log(`❌ Login failed: Bad Request`);
      console.log(`   Message: ${response.data.message}`);
      console.log(`   Code: ${response.data.code}`);
      failed++;
    } else if (response.status === 500) {
      console.log(`❌ Login failed: Server Error`);
      console.log(`   This indicates database or configuration issues`);
      console.log(`   Error: ${response.data.message}`);
      failed++;
    } else {
      console.log(`❌ Login failed: Unexpected status ${response.status}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ Login request failed: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Data: ${JSON.stringify(error.response.data)}`);
    }
    failed++;
  }

  await delay(2000);

  // Test 4: Protected Route Without Token (Should Fail)
  console.log('\n4️⃣ Testing Protected Route Without Token...');
  try {
    const response = await axios.get(`${DEPLOYED_URL}/api/parties`, { 
      timeout: 30000,
      validateStatus: () => true 
    });

    if (response.status === 401) {
      console.log('✅ Protected route correctly rejects unauthenticated requests');
      passed++;
    } else {
      console.log(`❌ Protected route should return 401, got: ${response.status}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ Protected route test error: ${error.message}`);
    failed++;
  }

  await delay(2000);

  // Test 5: Protected Route With Token (Should Work)
  if (authToken) {
    console.log('\n5️⃣ Testing Protected Route With Token...');
    try {
      const response = await axios.get(`${DEPLOYED_URL}/api/parties`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        timeout: 30000,
        validateStatus: () => true
      });

      if (response.status === 200) {
        console.log('✅ Protected route works with valid token');
        console.log(`   Data received: ${Array.isArray(response.data) ? response.data.length : 'object'} items`);
        passed++;
      } else if (response.status === 401) {
        console.log('❌ Token rejected by protected route');
        console.log('   This indicates JWT secret mismatch or token validation issues');
        failed++;
      } else {
        console.log(`❌ Protected route returned: ${response.status}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ Protected route with token error: ${error.message}`);
      failed++;
    }
  } else {
    console.log('\n5️⃣ Skipping protected route test - no auth token available');
    failed++;
  }

  await delay(2000);

  // Test 6: Frontend Loading
  console.log('\n6️⃣ Testing Frontend Loading...');
  try {
    const response = await axios.get(DEPLOYED_URL, {
      headers: { 'Accept': 'text/html' },
      timeout: 30000
    });

    if (response.status === 200 && response.data.includes('<!DOCTYPE html>')) {
      console.log('✅ Frontend loads correctly');
      console.log(`   Content-Type: ${response.headers['content-type']}`);
      passed++;
    } else {
      console.log(`❌ Frontend loading issue`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ Frontend loading error: ${error.message}`);
    failed++;
  }

  // Final Results
  console.log('\n' + '='.repeat(60));
  console.log('📊 PRODUCTION DEPLOYMENT TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`✅ Tests Passed: ${passed}`);
  console.log(`❌ Tests Failed: ${failed}`);
  console.log(`🎯 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  console.log(`⏰ Test completed at: ${new Date().toISOString()}`);

  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! 🎉');
    console.log('✅ Production deployment is fully functional');
    console.log('✅ Authentication system is working');
    console.log('✅ Database connection is established');
    console.log('✅ Protected routes are secured');
    console.log('✅ Frontend is serving correctly');
    
    console.log('\n📝 Ready for Production Use:');
    console.log(`🌐 App URL: ${DEPLOYED_URL}`);
    console.log(`🔐 Login: ${TEST_EMAIL} / ${TEST_PASSWORD}`);
    console.log('⚠️  Change default password after first login!');
  } else {
    console.log('\n⚠️ SOME TESTS FAILED');
    console.log('🔧 Issues to resolve:');
    
    if (!authToken) {
      console.log('• Login authentication is not working');
      console.log('  - Check JWT_SECRET environment variable');
      console.log('  - Verify DATABASE_URL connection');
      console.log('  - Check admin user creation');
    }
    
    console.log('• Review server logs on Render dashboard');
    console.log('• Verify all environment variables are set');
    console.log('• Check database connectivity');
  }

  console.log('\n📋 Environment Variables Checklist:');
  console.log('• DATABASE_URL (PostgreSQL connection string)');
  console.log('• JWT_SECRET (32+ character secure string)');
  console.log('• NODE_ENV=production');
  console.log('• FRONTEND_URL (your Render app URL)');
  console.log('• RENDER=true');

  process.exit(failed === 0 ? 0 : 1);
}

// Start the tests
runProductionTests().catch(error => {
  console.error('💥 Test script error:', error.message);
  process.exit(1);
});