#!/usr/bin/env node

/**
 * Smoke Tests for Production Deployment
 * Quick health checks after deployment
 */

const https = require('https');
const http = require('http');

const config = {
  baseUrl: process.env.BASE_URL || 'https://tetrix-production.ondigitalocean.app',
  timeout: 10000,
  retries: 3
};

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'blue') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.request(url, { timeout: config.timeout, ...options }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data, headers: res.headers }));
    });
    
    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    req.end();
  });
}

async function testHealthEndpoint() {
  log('🔍 Testing health endpoint...');
  
  try {
    const response = await makeRequest(`${config.baseUrl}/health`);
    
    if (response.status === 200) {
      const health = JSON.parse(response.data);
      log(`✅ Health check passed: ${health.status}`, 'green');
      return true;
    } else {
      log(`❌ Health check failed: ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Health check error: ${error.message}`, 'red');
    return false;
  }
}

async function testMainPage() {
  log('🔍 Testing main page...');
  
  try {
    const response = await makeRequest(config.baseUrl);
    
    if (response.status === 200) {
      log('✅ Main page accessible', 'green');
      return true;
    } else {
      log(`❌ Main page failed: ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Main page error: ${error.message}`, 'red');
    return false;
  }
}

async function testAPIEndpoints() {
  log('🔍 Testing API endpoints...');
  
  const endpoints = [
    '/api/test',
    '/api/health'
  ];
  
  let passed = 0;
  
  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(`${config.baseUrl}${endpoint}`);
      if (response.status === 200) {
        log(`✅ ${endpoint} - OK`, 'green');
        passed++;
      } else {
        log(`❌ ${endpoint} - ${response.status}`, 'red');
      }
    } catch (error) {
      log(`❌ ${endpoint} - ${error.message}`, 'red');
    }
  }
  
  return passed === endpoints.length;
}

async function testPerformance() {
  log('🔍 Testing performance...');
  
  const start = Date.now();
  
  try {
    await makeRequest(config.baseUrl);
    const duration = Date.now() - start;
    
    if (duration < 5000) {
      log(`✅ Response time: ${duration}ms`, 'green');
      return true;
    } else {
      log(`⚠️ Slow response: ${duration}ms`, 'yellow');
      return false;
    }
  } catch (error) {
    log(`❌ Performance test error: ${error.message}`, 'red');
    return false;
  }
}

async function runSmokeTests() {
  log('🚀 Starting smoke tests...', 'blue');
  log(`Target: ${config.baseUrl}`, 'blue');
  log('', 'blue');
  
  const tests = [
    { name: 'Health Endpoint', fn: testHealthEndpoint },
    { name: 'Main Page', fn: testMainPage },
    { name: 'API Endpoints', fn: testAPIEndpoints },
    { name: 'Performance', fn: testPerformance }
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) passed++;
    } catch (error) {
      log(`❌ ${test.name} failed: ${error.message}`, 'red');
    }
    log('', 'blue');
  }
  
  log(`📊 Results: ${passed}/${total} tests passed`, passed === total ? 'green' : 'red');
  
  if (passed === total) {
    log('🎉 All smoke tests passed!', 'green');
    process.exit(0);
  } else {
    log('💥 Some smoke tests failed!', 'red');
    process.exit(1);
  }
}

// Run tests
runSmokeTests().catch(error => {
  log(`💥 Smoke test runner failed: ${error.message}`, 'red');
  process.exit(1);
});
