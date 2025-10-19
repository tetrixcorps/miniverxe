#!/usr/bin/env node

/**
 * TETRIX 2FA Authentication System Endpoint Tester
 * Tests all 2FA endpoints to ensure they're working correctly
 */

import https from 'https';
import http from 'http';

// Configuration
const CONFIG = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:4321',
  testPhoneNumber: process.env.TEST_PHONE || '+15042749808', // Test number
  timeout: 10000
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Utility functions
const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const makeRequest = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      timeout: CONFIG.timeout,
      ...options
    };

    const req = client.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
};

// Test functions
const testHealthCheck = async () => {
  log('\n🔍 Testing Health Check...', 'blue');
  
  try {
    const response = await makeRequest(`${CONFIG.baseUrl}/api/v2/2fa/status?verificationId=test`);
    
    if (response.status === 200 || response.status === 404) {
      log('✅ Health check endpoint is responding', 'green');
      return true;
    } else {
      log(`❌ Health check failed with status: ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Health check failed: ${error.message}`, 'red');
    return false;
  }
};

const testInitiateEndpoint = async () => {
  log('\n📱 Testing Initiate Endpoint...', 'blue');
  
  const requestBody = {
    phoneNumber: CONFIG.testPhoneNumber,
    method: 'sms',
    userAgent: 'TETRIX-2FA-Tester/1.0',
    ipAddress: '127.0.0.1',
    sessionId: `test_session_${Date.now()}`
  };

  try {
    const response = await makeRequest(`${CONFIG.baseUrl}/api/v2/2fa/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    log(`Status: ${response.status}`, 'cyan');
    log(`Response: ${JSON.stringify(response.data, null, 2)}`, 'cyan');

    if (response.status === 200 && response.data.success) {
      log('✅ Initiate endpoint is working correctly', 'green');
      return response.data.verificationId;
    } else {
      log('❌ Initiate endpoint failed', 'red');
      return null;
    }
  } catch (error) {
    log(`❌ Initiate endpoint failed: ${error.message}`, 'red');
    return null;
  }
};

const testVerifyEndpoint = async (verificationId) => {
  log('\n🔐 Testing Verify Endpoint...', 'blue');
  
  if (!verificationId) {
    log('⚠️  No verification ID available, skipping verify test', 'yellow');
    return false;
  }

  const requestBody = {
    verificationId: verificationId,
    code: '123456', // Test code
    phoneNumber: CONFIG.testPhoneNumber
  };

  try {
    const response = await makeRequest(`${CONFIG.baseUrl}/api/v2/2fa/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    log(`Status: ${response.status}`, 'cyan');
    log(`Response: ${JSON.stringify(response.data, null, 2)}`, 'cyan');

    if (response.status === 200) {
      log('✅ Verify endpoint is working correctly', 'green');
      return true;
    } else {
      log('❌ Verify endpoint failed', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Verify endpoint failed: ${error.message}`, 'red');
    return false;
  }
};

const testStatusEndpoint = async (verificationId) => {
  log('\n📊 Testing Status Endpoint...', 'blue');
  
  if (!verificationId) {
    log('⚠️  No verification ID available, skipping status test', 'yellow');
    return false;
  }

  try {
    const response = await makeRequest(
      `${CONFIG.baseUrl}/api/v2/2fa/status?verificationId=${verificationId}&phoneNumber=${encodeURIComponent(CONFIG.testPhoneNumber)}`
    );

    log(`Status: ${response.status}`, 'cyan');
    log(`Response: ${JSON.stringify(response.data, null, 2)}`, 'cyan');

    if (response.status === 200) {
      log('✅ Status endpoint is working correctly', 'green');
      return true;
    } else {
      log('❌ Status endpoint failed', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Status endpoint failed: ${error.message}`, 'red');
    return false;
  }
};

// Main test function
const runTests = async () => {
  log('🚀 TETRIX 2FA Authentication System - Endpoint Tester', 'bright');
  log('====================================================', 'bright');
  log(`Base URL: ${CONFIG.baseUrl}`, 'cyan');
  log(`Test Phone: ${CONFIG.testPhoneNumber}`, 'cyan');
  log('', 'reset');

  const results = {
    healthCheck: false,
    initiate: false,
    verify: false,
    status: false
  };

  // Test health check
  results.healthCheck = await testHealthCheck();

  // Test initiate endpoint
  const verificationId = await testInitiateEndpoint();
  results.initiate = verificationId !== null;

  // Test verify endpoint
  results.verify = await testVerifyEndpoint(verificationId);

  // Test status endpoint
  results.status = await testStatusEndpoint(verificationId);

  // Summary
  log('\n📋 Test Results Summary', 'bright');
  log('======================', 'bright');
  log(`Health Check: ${results.healthCheck ? '✅ PASS' : '❌ FAIL'}`, results.healthCheck ? 'green' : 'red');
  log(`Initiate:     ${results.initiate ? '✅ PASS' : '❌ FAIL'}`, results.initiate ? 'green' : 'red');
  log(`Verify:       ${results.verify ? '✅ PASS' : '❌ FAIL'}`, results.verify ? 'green' : 'red');
  log(`Status:       ${results.status ? '✅ PASS' : '❌ FAIL'}`, results.status ? 'green' : 'red');

  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    log('\n🎉 All tests passed! 2FA system is working correctly.', 'green');
    process.exit(0);
  } else {
    log('\n⚠️  Some tests failed. Check the logs above for details.', 'yellow');
    process.exit(1);
  }
};

// Run tests
runTests().catch(error => {
  log(`\n💥 Test runner failed: ${error.message}`, 'red');
  process.exit(1);
});
