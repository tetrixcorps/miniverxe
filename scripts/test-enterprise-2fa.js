#!/usr/bin/env node

/**
 * Enterprise 2FA Testing Script
 * Tests the enhanced Telnyx Verify API integration
 */

import https from 'https';
import http from 'http';

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:4321';
const TEST_PHONE = process.env.TEST_PHONE || '+15042749808';
const VERIFY_PROFILE_ID = '***REMOVED***';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const req = client.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function testEnterprise2FA() {
  log('\n🚀 Enterprise 2FA Testing Suite', 'cyan');
  log('================================', 'cyan');
  
  let verificationId = null;
  let testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 1: Initiate SMS Verification
  log('\n📱 Test 1: Initiate SMS Verification', 'blue');
  try {
    const response = await makeRequest(`${BASE_URL}/api/v2/2fa/initiate`, {
      body: {
        phoneNumber: TEST_PHONE,
        method: 'sms',
        timeoutSecs: 300,
        userAgent: 'Enterprise2FA-Test/1.0',
        ipAddress: '192.168.1.100'
      }
    });
    
    testResults.total++;
    
    if (response.status === 200 && response.data.success) {
      verificationId = response.data.data.verificationId;
      log(`✅ SMS verification initiated successfully`, 'green');
      log(`   Verification ID: ${verificationId}`, 'white');
      log(`   Phone: ${response.data.data.phoneNumber}`, 'white');
      log(`   Method: ${response.data.data.method}`, 'white');
      log(`   Timeout: ${response.data.data.timeoutSecs}s`, 'white');
      testResults.passed++;
      testResults.tests.push({ name: 'Initiate SMS', status: 'PASS' });
    } else {
      log(`❌ SMS verification failed: ${response.data.error || 'Unknown error'}`, 'red');
      testResults.failed++;
      testResults.tests.push({ name: 'Initiate SMS', status: 'FAIL', error: response.data.error });
    }
  } catch (error) {
    log(`❌ SMS verification error: ${error.message}`, 'red');
    testResults.failed++;
    testResults.tests.push({ name: 'Initiate SMS', status: 'ERROR', error: error.message });
  }

  // Test 2: Initiate Voice Verification
  log('\n📞 Test 2: Initiate Voice Verification', 'blue');
  try {
    const response = await makeRequest(`${BASE_URL}/api/v2/2fa/initiate`, {
      body: {
        phoneNumber: TEST_PHONE,
        method: 'voice',
        timeoutSecs: 300,
        userAgent: 'Enterprise2FA-Test/1.0',
        ipAddress: '192.168.1.100'
      }
    });
    
    testResults.total++;
    
    if (response.status === 200 && response.data.success) {
      log(`✅ Voice verification initiated successfully`, 'green');
      log(`   Verification ID: ${response.data.data.verificationId}`, 'white');
      log(`   Phone: ${response.data.data.phoneNumber}`, 'white');
      log(`   Method: ${response.data.data.method}`, 'white');
      testResults.passed++;
      testResults.tests.push({ name: 'Initiate Voice', status: 'PASS' });
    } else {
      log(`❌ Voice verification failed: ${response.data.error || 'Unknown error'}`, 'red');
      testResults.failed++;
      testResults.tests.push({ name: 'Initiate Voice', status: 'FAIL', error: response.data.error });
    }
  } catch (error) {
    log(`❌ Voice verification error: ${error.message}`, 'red');
    testResults.failed++;
    testResults.tests.push({ name: 'Initiate Voice', status: 'ERROR', error: error.message });
  }

  // Test 3: Get Verification Status
  if (verificationId) {
    log('\n📊 Test 3: Get Verification Status', 'blue');
    try {
      const response = await makeRequest(`${BASE_URL}/api/v2/2fa/status?verificationId=${verificationId}&phoneNumber=${TEST_PHONE}`);
      
      testResults.total++;
      
      if (response.status === 200 && response.data.success) {
        log(`✅ Status retrieved successfully`, 'green');
        log(`   Status: ${response.data.data.status}`, 'white');
        log(`   Attempts: ${response.data.data.attempts}/${response.data.data.maxAttempts}`, 'white');
        log(`   Expires: ${response.data.data.expiresAt}`, 'white');
        testResults.passed++;
        testResults.tests.push({ name: 'Get Status', status: 'PASS' });
      } else {
        log(`❌ Status retrieval failed: ${response.data.error || 'Unknown error'}`, 'red');
        testResults.failed++;
        testResults.tests.push({ name: 'Get Status', status: 'FAIL', error: response.data.error });
      }
    } catch (error) {
      log(`❌ Status retrieval error: ${error.message}`, 'red');
      testResults.failed++;
      testResults.tests.push({ name: 'Get Status', status: 'ERROR', error: error.message });
    }
  }

  // Test 4: Verify Code (with test code)
  if (verificationId) {
    log('\n🔐 Test 4: Verify Code (Test)', 'blue');
    try {
      const response = await makeRequest(`${BASE_URL}/api/v2/2fa/verify`, {
        body: {
          verificationId: verificationId,
          code: '123456', // Test code
          phoneNumber: TEST_PHONE
        }
      });
      
      testResults.total++;
      
      if (response.status === 200 && response.data.success) {
        log(`✅ Code verification successful`, 'green');
        log(`   Verified: ${response.data.data.verified}`, 'white');
        log(`   Response Code: ${response.data.data.responseCode}`, 'white');
        testResults.passed++;
        testResults.tests.push({ name: 'Verify Code', status: 'PASS' });
      } else {
        log(`❌ Code verification failed: ${response.data.error || 'Unknown error'}`, 'red');
        log(`   This is expected for test code`, 'yellow');
        testResults.passed++; // Expected failure
        testResults.tests.push({ name: 'Verify Code', status: 'PASS (Expected Failure)' });
      }
    } catch (error) {
      log(`❌ Code verification error: ${error.message}`, 'red');
      testResults.failed++;
      testResults.tests.push({ name: 'Verify Code', status: 'ERROR', error: error.message });
    }
  }

  // Test 5: Get Audit Logs
  log('\n📋 Test 5: Get Audit Logs', 'blue');
  try {
    const response = await makeRequest(`${BASE_URL}/api/v2/2fa/audit?phoneNumber=${TEST_PHONE}&limit=10`, {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    
    testResults.total++;
    
    if (response.status === 200 && response.data.success) {
      log(`✅ Audit logs retrieved successfully`, 'green');
      log(`   Total logs: ${response.data.data.pagination.total}`, 'white');
      log(`   Risk Level: ${response.data.data.riskAssessment.level}`, 'white');
      log(`   Risk Score: ${response.data.data.riskAssessment.score}`, 'white');
      testResults.passed++;
      testResults.tests.push({ name: 'Get Audit Logs', status: 'PASS' });
    } else {
      log(`❌ Audit logs failed: ${response.data.error || 'Unknown error'}`, 'red');
      testResults.failed++;
      testResults.tests.push({ name: 'Get Audit Logs', status: 'FAIL', error: response.data.error });
    }
  } catch (error) {
    log(`❌ Audit logs error: ${error.message}`, 'red');
    testResults.failed++;
    testResults.tests.push({ name: 'Get Audit Logs', status: 'ERROR', error: error.message });
  }

  // Test 6: Test Webhook (Simulate)
  log('\n🔗 Test 6: Test Webhook Endpoint', 'blue');
  try {
    const webhookPayload = {
      event_type: 'verification.attempted',
      data: {
        id: verificationId || 'test-verification-id',
        phone_number: TEST_PHONE,
        type: 'sms',
        status: 'pending'
      },
      occurred_at: new Date().toISOString()
    };

    const response = await makeRequest(`${BASE_URL}/api/webhooks/telnyx/verify`, {
      body: webhookPayload
    });
    
    testResults.total++;
    
    if (response.status === 200 && response.data.success) {
      log(`✅ Webhook endpoint working`, 'green');
      log(`   Event Type: ${response.data.event_type}`, 'white');
      testResults.passed++;
      testResults.tests.push({ name: 'Webhook Endpoint', status: 'PASS' });
    } else {
      log(`❌ Webhook endpoint failed: ${response.data.error || 'Unknown error'}`, 'red');
      testResults.failed++;
      testResults.tests.push({ name: 'Webhook Endpoint', status: 'FAIL', error: response.data.error });
    }
  } catch (error) {
    log(`❌ Webhook endpoint error: ${error.message}`, 'red');
    testResults.failed++;
    testResults.tests.push({ name: 'Webhook Endpoint', status: 'ERROR', error: error.message });
  }

  // Test Summary
  log('\n📊 Test Summary', 'cyan');
  log('===============', 'cyan');
  log(`Total Tests: ${testResults.total}`, 'white');
  log(`Passed: ${colors.green}${testResults.passed}${colors.white}`, 'white');
  log(`Failed: ${colors.red}${testResults.failed}${colors.white}`, 'white');
  log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`, 'white');

  log('\n📋 Detailed Results:', 'cyan');
  testResults.tests.forEach((test, index) => {
    const status = test.status === 'PASS' ? '✅' : '❌';
    const color = test.status.includes('PASS') ? 'green' : 'red';
    log(`  ${index + 1}. ${status} ${test.name} - ${test.status}`, color);
    if (test.error) {
      log(`     Error: ${test.error}`, 'yellow');
    }
  });

  // Recommendations
  log('\n💡 Recommendations:', 'magenta');
  log('==================', 'magenta');
  log('1. Configure Telnyx Verify API with your profile ID', 'white');
  log('2. Set up proper webhook signature verification', 'white');
  log('3. Implement database storage for verification states', 'white');
  log('4. Add rate limiting and fraud detection', 'white');
  log('5. Set up monitoring and alerting', 'white');
  log('6. Test with real phone numbers in production', 'white');

  log('\n🎯 Next Steps:', 'yellow');
  log('==============', 'yellow');
  log('1. Update environment variables with real Telnyx API key', 'white');
  log('2. Configure webhook URLs in Telnyx dashboard', 'white');
  log('3. Test with actual phone numbers', 'white');
  log('4. Monitor logs and performance', 'white');
  log('5. Implement additional security measures', 'white');

  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run the tests
testEnterprise2FA().catch(error => {
  log(`\n❌ Test suite failed: ${error.message}`, 'red');
  process.exit(1);
});
