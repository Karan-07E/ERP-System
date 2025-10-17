const axios = require('axios');

/**
 * Production Deployment Verification Script
 * 
 * This script verifies that the deployed ERP system is working correctly:
 * 1. Health check endpoint
 * 2. Database connectivity
 * 3. Authentication system
 * 4. API endpoints
 * 5. Frontend serving
 */

const BASE_URL = process.env.DEPLOYED_URL || 'https://erp-system-rmum.onrender.com';

console.log(`🧪 Testing deployment at: ${BASE_URL}`);

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runDeploymentTests() {
  let passed = 0;
  let failed = 0;
  
  console.log('\n🚀 Starting Production Deployment Verification...\n');
  
  // Test 1: Health Check
  console.log('1️⃣ Testing Health Check Endpoint...');
  try {
    const response = await axios.get(`${BASE_URL}/health`, { timeout: 30000 });
    if (response.status === 200) {
      console.log('✅ Health check passed');
      console.log(`   Response: ${JSON.stringify(response.data)}`);
      passed++;
    } else {
      console.log(`❌ Health check failed with status: ${response.status}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ Health check failed: ${error.message}`);
    failed++;
  }
  
  await delay(2000);
  
  // Test 2: Database Migration Status
  console.log('\n2️⃣ Testing Database Migration Status...');
  try {
    const response = await axios.get(`${BASE_URL}/api/migrate`, { timeout: 30000 });
    if (response.status === 200) {
      console.log('✅ Database migration status check passed');
      console.log(`   Tables created: ${response.data.tables || 'N/A'}`);
      passed++;
    } else {
      console.log(`❌ Database migration status failed: ${response.status}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ Database migration status failed: ${error.message}`);
    failed++;
  }
  
  await delay(2000);
  
  // Test 3: Test API Route (without auth)
  console.log('\n3️⃣ Testing Test API Endpoint...');
  try {
    const response = await axios.get(`${BASE_URL}/test`, { timeout: 30000 });
    if (response.status === 200) {
      console.log('✅ Test API endpoint passed');
      console.log(`   Response: ${JSON.stringify(response.data)}`);
      passed++;
    } else {
      console.log(`❌ Test API endpoint failed with status: ${response.status}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ Test API endpoint failed: ${error.message}`);
    failed++;
  }
  
  await delay(2000);
  
  // Test 4: Authentication Endpoint Structure
  console.log('\n4️⃣ Testing Authentication Endpoint Structure...');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'test@test.com',
      password: 'wrongpassword'
    }, { 
      timeout: 30000,
      validateStatus: () => true // Accept any status
    });
    
    // We expect this to fail with 401 or 400, which means the endpoint exists
    if (response.status === 401 || response.status === 400) {
      console.log('✅ Authentication endpoint exists and responds correctly');
      console.log(`   Status: ${response.status} (expected for wrong credentials)`);
      passed++;
    } else if (response.status === 500) {
      console.log(`⚠️ Authentication endpoint exists but has server error`);
      console.log(`   This might indicate database issues`);
      failed++;
    } else {
      console.log(`❌ Unexpected response from auth endpoint: ${response.status}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ Authentication endpoint test failed: ${error.message}`);
    failed++;
  }
  
  await delay(2000);
  
  // Test 5: Protected API Endpoint (should return 401)
  console.log('\n5️⃣ Testing Protected API Endpoint...');
  try {
    const response = await axios.get(`${BASE_URL}/api/parties`, { 
      timeout: 30000,
      validateStatus: () => true // Accept any status
    });
    
    // We expect 401 Unauthorized for unauthenticated requests
    if (response.status === 401) {
      console.log('✅ Protected endpoint correctly returns 401 for unauthenticated requests');
      passed++;
    } else if (response.status === 500) {
      console.log(`❌ Protected endpoint returns 500 (server error)`);
      console.log(`   This indicates database or configuration issues`);
      failed++;
    } else {
      console.log(`⚠️ Protected endpoint returned unexpected status: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data)}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ Protected endpoint test failed: ${error.message}`);
    failed++;
  }
  
  await delay(2000);
  
  // Test 6: Frontend Serving (React app)
  console.log('\n6️⃣ Testing Frontend Serving...');
  try {
    const response = await axios.get(BASE_URL, { 
      timeout: 30000,
      headers: { 'Accept': 'text/html' }
    });
    
    if (response.status === 200 && response.data.includes('<!DOCTYPE html>')) {
      console.log('✅ Frontend serving correctly');
      console.log(`   Content-Type: ${response.headers['content-type']}`);
      passed++;
    } else {
      console.log(`❌ Frontend serving issue - Status: ${response.status}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ Frontend serving test failed: ${error.message}`);
    failed++;
  }
  
  // Summary
  console.log('\n📊 DEPLOYMENT VERIFICATION SUMMARY');
  console.log('═══════════════════════════════════════');
  console.log(`✅ Tests Passed: ${passed}`);
  console.log(`❌ Tests Failed: ${failed}`);
  console.log(`🎯 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Deployment is successful.');
    console.log('\n📝 Next Steps:');
    console.log('1. Create admin user through the UI');
    console.log('2. Test login functionality');
    console.log('3. Verify all main features work');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the issues above.');
    console.log('\n🔧 Common Solutions:');
    
    if (failed >= 3) {
      console.log('• Check environment variables (JWT_SECRET, DATABASE_URL)');
      console.log('• Verify database connection and migrations');
      console.log('• Check Render deployment logs');
    }
    
    console.log('• Run database migration manually if needed');
    console.log('• Check CORS configuration for frontend');
    console.log('• Verify all required environment variables are set');
  }
  
  console.log(`\n🌐 Deployed URL: ${BASE_URL}`);
  console.log(`📋 Admin Panel: ${BASE_URL}/login`);
  console.log(`🔍 Health Check: ${BASE_URL}/health`);
  
  process.exit(failed === 0 ? 0 : 1);
}

// Run the tests
runDeploymentTests().catch(error => {
  console.error('💥 Verification script error:', error);
  process.exit(1);
});