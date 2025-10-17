// Quick test to debug login 400 error
const testLogin = async () => {
  const API_URL = 'https://erp-system-rmum.onrender.com';
  
  console.log('🧪 Testing login endpoint directly...');
  
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@eee.com',
        password: 'admin123'
      })
    });
    
    const data = await response.json();
    
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Data:', data);
    
    if (response.status === 400) {
      console.log('❌ 400 Bad Request Details:');
      console.log('- Message:', data.message);
      console.log('- Code:', data.code);
      console.log('- Success:', data.success);
    } else if (response.status === 200) {
      console.log('✅ Login successful!');
      console.log('- Token received:', !!data.token);
      console.log('- User data:', !!data.user);
    }
    
  } catch (error) {
    console.error('💥 Network error:', error.message);
  }
};

// Run the test
testLogin();

console.log('🔍 Run this in the browser console on your deployed site to debug the 400 error');