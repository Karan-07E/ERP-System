/**
 * Example API Test Functions
 * Use these to verify your API is working after deployment
 */

// Configuration
const API_BASE_URL = 'https://eee111.onrender.com'; // Replace with your actual URL

// Test functions for different scenarios

// 1. Basic server health check
async function testBasicHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    
    console.log('✅ Basic Health Check:', data);
    return data.status === 'healthy';
  } catch (error) {
    console.error('❌ Basic Health Check Failed:', error.message);
    return false;
  }
}

// 2. API health check
async function testAPIHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    const data = await response.json();
    
    console.log('✅ API Health Check:', data);
    return data.status === 'OK';
  } catch (error) {
    console.error('❌ API Health Check Failed:', error.message);
    return false;
  }
}

// 3. Test dashboard safe initial data (no auth required)
async function testDashboardSafeData() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/safe-initial`);
    const data = await response.json();
    
    console.log('✅ Dashboard Safe Data:', data);
    return response.ok;
  } catch (error) {
    console.error('❌ Dashboard Safe Data Failed:', error.message);
    return false;
  }
}

// 4. Test authentication endpoint (should return error without credentials)
async function testAuthEndpoint() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/test`);
    const data = await response.json();
    
    // This should fail (401 or 404), which is expected
    console.log('✅ Auth Endpoint Test (Expected to fail):', response.status, data);
    return response.status === 401 || response.status === 404;
  } catch (error) {
    console.error('❌ Auth Endpoint Test Failed:', error.message);
    return false;
  }
}

// 5. Test login functionality
async function testLogin(username = 'test', password = 'test') {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Login Successful:', data);
      return data.token;
    } else {
      console.log('ℹ️ Login Failed (Expected if no test user):', data);
      return null;
    }
  } catch (error) {
    console.error('❌ Login Test Failed:', error.message);
    return null;
  }
}

// 6. Test authenticated endpoint
async function testAuthenticatedEndpoint(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Authenticated Request Successful:', data);
      return true;
    } else {
      console.log('ℹ️ Authenticated Request Failed:', response.status, data);
      return false;
    }
  } catch (error) {
    console.error('❌ Authenticated Request Failed:', error.message);
    return false;
  }
}

// 7. Run all tests
async function runAllTests() {
  console.log('🚀 Starting API Tests...');
  console.log('🔗 Testing URL:', API_BASE_URL);
  console.log('=' .repeat(50));
  
  const results = {};
  
  // Test 1: Basic Health
  console.log('\n1. Testing Basic Health...');
  results.basicHealth = await testBasicHealth();
  
  // Test 2: API Health
  console.log('\n2. Testing API Health...');
  results.apiHealth = await testAPIHealth();
  
  // Test 3: Dashboard Safe Data
  console.log('\n3. Testing Dashboard Safe Data...');
  results.dashboardSafe = await testDashboardSafeData();
  
  // Test 4: Auth Endpoint
  console.log('\n4. Testing Auth Endpoint...');
  results.authEndpoint = await testAuthEndpoint();
  
  // Test 5: Login (optional - might fail if no test user)
  console.log('\n5. Testing Login...');
  const token = await testLogin();
  results.login = !!token;
  
  // Test 6: Authenticated Endpoint (only if login succeeded)
  if (token) {
    console.log('\n6. Testing Authenticated Endpoint...');
    results.authenticated = await testAuthenticatedEndpoint(token);
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(50));
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests >= 4) { // Basic tests should pass
    console.log('🎉 API is working correctly!');
  } else {
    console.log('⚠️ Some tests failed. Check your deployment.');
  }
  
  return results;
}

// Browser usage (paste in browser console)
if (typeof window !== 'undefined') {
  console.log('🌐 Browser mode detected. Available functions:');
  console.log('- testBasicHealth()');
  console.log('- testAPIHealth()');
  console.log('- testDashboardSafeData()');
  console.log('- runAllTests()');
  
  // Make functions global
  window.testBasicHealth = testBasicHealth;
  window.testAPIHealth = testAPIHealth;
  window.testDashboardSafeData = testDashboardSafeData;
  window.runAllTests = runAllTests;
}

// Node.js usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testBasicHealth,
    testAPIHealth,
    testDashboardSafeData,
    testAuthEndpoint,
    testLogin,
    testAuthenticatedEndpoint,
    runAllTests
  };
}

// Auto-run if called directly
if (typeof require !== 'undefined' && require.main === module) {
  runAllTests();
}