const axios = require('axios');

// Test the production fixes locally before deployment
const BASE_URL = 'http://localhost:5000';

console.log('🧪 Testing production fixes locally...\n');

async function testLocalDeploymentFixes() {
  let testsPassed = 0;
  let testsFailed = 0;

  // Test 1: Health Check
  console.log('1️⃣ Testing Health Check...');
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    if (response.status === 200) {
      console.log('✅ Health check working');
      testsPassed++;
    }
  } catch (error) {
    console.log(`❌ Health check failed: ${error.message}`);
    testsFailed++;
  }

  // Test 2: Test Endpoint
  console.log('\n2️⃣ Testing Basic API...');
  try {
    const response = await axios.get(`${BASE_URL}/test`);
    if (response.status === 200) {
      console.log('✅ Test endpoint working');
      testsPassed++;
    }
  } catch (error) {
    console.log(`❌ Test endpoint failed: ${error.message}`);
    testsFailed++;
  }

  // Test 3: Database Migration
  console.log('\n3️⃣ Testing Database Migration...');
  try {
    const response = await axios.get(`${BASE_URL}/api/migrate`);
    if (response.status === 200) {
      console.log('✅ Database migration working');
      console.log(`   Tables: ${response.data.tables || 'N/A'}`);
      testsPassed++;
    }
  } catch (error) {
    console.log(`❌ Migration failed: ${error.message}`);
    testsFailed++;
  }

  // Test 4: Authentication (wrong credentials should give 401)
  console.log('\n4️⃣ Testing Authentication System...');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'wrong@email.com',
      password: 'wrongpassword'
    }, { validateStatus: () => true });

    if (response.status === 401 || response.status === 400) {
      console.log('✅ Authentication system working (correctly rejected)');
      testsPassed++;
    } else {
      console.log(`❌ Unexpected auth response: ${response.status}`);
      testsFailed++;
    }
  } catch (error) {
    console.log(`❌ Auth test failed: ${error.message}`);
    testsFailed++;
  }

  // Test 5: Admin Login (should work)
  console.log('\n5️⃣ Testing Admin Login...');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@eee.com',
      password: 'admin123'
    });

    if (response.status === 200 && response.data.token) {
      console.log('✅ Admin login working');
      console.log(`   Token received: ${response.data.token.substring(0, 20)}...`);
      testsPassed++;

      // Test 6: Protected Endpoint with Token
      console.log('\n6️⃣ Testing Protected API with Token...');
      try {
        const protectedResponse = await axios.get(`${BASE_URL}/api/parties`, {
          headers: {
            'Authorization': `Bearer ${response.data.token}`
          }
        });

        if (protectedResponse.status === 200) {
          console.log('✅ Protected API working with authentication');
          testsPassed++;
        }
      } catch (protectedError) {
        console.log(`❌ Protected API failed: ${protectedError.message}`);
        testsFailed++;
      }
    } else {
      console.log(`❌ Admin login failed: ${response.status}`);
      testsFailed++;
    }
  } catch (error) {
    console.log(`❌ Admin login failed: ${error.message}`);
    testsFailed++;
  }

  // Summary
  console.log('\n📊 LOCAL TEST SUMMARY');
  console.log('═══════════════════════════');
  console.log(`✅ Tests Passed: ${testsPassed}`);
  console.log(`❌ Tests Failed: ${testsFailed}`);
  console.log(`🎯 Success Rate: ${Math.round((testsPassed / (testsPassed + testsFailed)) * 100)}%`);

  if (testsFailed === 0) {
    console.log('\n🎉 ALL LOCAL TESTS PASSED!');
    console.log('✅ Ready for production deployment');
    console.log('\n📋 Next Steps:');
    console.log('1. Set environment variables on Render');
    console.log('2. Deploy to production');
    console.log('3. Run deployment verification script');
  } else {
    console.log('\n⚠️ Some tests failed locally');
    console.log('🔧 Fix these issues before deploying to production');
  }
}

// Only run if server is available
axios.get(`${BASE_URL}/health`, { timeout: 5000 })
  .then(() => {
    testLocalDeploymentFixes();
  })
  .catch(() => {
    console.log('❌ Server not running locally');
    console.log('🚀 Start the server first: cd backend && node server.js');
  });