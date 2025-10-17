#!/usr/bin/env node

/**
 * Route Verification Script for Render Deployment
 * This script tests all API endpoints after deployment
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.API_URL || 'https://eee111.onrender.com';
const isHTTPS = BASE_URL.startsWith('https');

console.log(`🔍 Testing API routes on: ${BASE_URL}`);
console.log(`📡 Protocol: ${isHTTPS ? 'HTTPS' : 'HTTP'}`);
console.log('=' .repeat(50));

// List of endpoints to test
const endpoints = [
  { path: '/test', method: 'GET', description: 'Basic server test' },
  { path: '/health', method: 'GET', description: 'Health check' },
  { path: '/api/health', method: 'GET', description: 'API health check' },
  { path: '/api/auth/test', method: 'GET', description: 'Auth route test', expectError: true },
  { path: '/api/dashboard/health', method: 'GET', description: 'Dashboard health' },
  { path: '/api/dashboard/safe-initial', method: 'GET', description: 'Dashboard safe data' },
];

// Make HTTP/HTTPS request
function makeRequest(endpoint) {
  return new Promise((resolve) => {
    const url = new URL(endpoint.path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || (isHTTPS ? 443 : 80),
      path: url.pathname,
      method: endpoint.method,
      headers: {
        'User-Agent': 'Route-Verification-Script/1.0',
        'Accept': 'application/json'
      },
      timeout: 10000
    };

    const request = (isHTTPS ? https : http).request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data,
          endpoint: endpoint
        });
      });
    });

    request.on('error', (error) => {
      resolve({
        status: 0,
        error: error.message,
        endpoint: endpoint
      });
    });

    request.on('timeout', () => {
      request.destroy();
      resolve({
        status: 0,
        error: 'Request timeout',
        endpoint: endpoint
      });
    });

    request.end();
  });
}

// Test all endpoints
async function testEndpoints() {
  console.log('🚀 Starting endpoint tests...\n');

  for (const endpoint of endpoints) {
    process.stdout.write(`Testing ${endpoint.method} ${endpoint.path} - ${endpoint.description}... `);
    
    const result = await makeRequest(endpoint);
    
    if (result.error) {
      console.log(`❌ ERROR: ${result.error}`);
    } else if (result.status === 200 || (endpoint.expectError && result.status >= 400)) {
      console.log(`✅ OK (${result.status})`);
      
      // Show response for health checks
      if (endpoint.path.includes('health') || endpoint.path === '/test') {
        try {
          const jsonData = JSON.parse(result.data);
          console.log(`   Response: ${JSON.stringify(jsonData, null, 2).substring(0, 200)}...`);
        } catch (e) {
          console.log(`   Response: ${result.data.substring(0, 100)}...`);
        }
      }
    } else {
      console.log(`⚠️  UNEXPECTED (${result.status})`);
      console.log(`   Response: ${result.data.substring(0, 200)}...`);
    }
    
    console.log(''); // Empty line for readability
  }

  console.log('🎉 Endpoint testing completed!');
  console.log('\n' + '='.repeat(50));
  console.log('✅ If all tests passed, your API is working correctly!');
  console.log('❌ If tests failed, check your Render logs for details.');
}

// Run the tests
testEndpoints().catch(console.error);