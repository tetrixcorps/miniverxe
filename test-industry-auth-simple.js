#!/usr/bin/env node

/**
 * Simple test for TETRIX Industry Auth Services
 * Tests the industry authentication workflow
 */

const https = require('https');

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

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testIndustryAuthWorkflow() {
  log('🧪 TETRIX Industry Auth - Comprehensive Workflow Test', 'bright');
  log('====================================================', 'bright');
  
  const BASE_URL = 'https://tetrix-2fa-simple-fhafz.ondigitalocean.app';
  
  try {
    // Test 1: Basic 2FA endpoints (should work)
    log('\n1. Testing Basic 2FA Endpoints...', 'blue');
    
    const initiate2FA = await makeRequest(`${BASE_URL}/api/v2/2fa/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      phoneNumber: '+1234567890',
      method: 'sms'
    });
    
    if (initiate2FA.status === 200 && initiate2FA.data.success) {
      log(`✅ Basic 2FA Initiate: Working`, 'green');
      log(`   Verification ID: ${initiate2FA.data.verificationId}`, 'cyan');
      
      // Test verify
      const verify2FA = await makeRequest(`${BASE_URL}/api/v2/2fa/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        verificationId: initiate2FA.data.verificationId,
        code: '123456',
        phoneNumber: '+1234567890'
      });
      
      if (verify2FA.status === 200 && verify2FA.data.success) {
        log(`✅ Basic 2FA Verify: Working`, 'green');
      } else {
        log(`❌ Basic 2FA Verify: Failed`, 'red');
      }
    } else {
      log(`❌ Basic 2FA Initiate: Failed`, 'red');
    }
    
    // Test 2: Industry Auth endpoints
    log('\n2. Testing Industry Auth Endpoints...', 'blue');
    
    const initiateIndustry = await makeRequest(`${BASE_URL}/api/v2/industry-auth/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      phoneNumber: '+1234567890',
      industry: 'healthcare',
      organizationId: 'test_org',
      method: 'sms'
    });
    
    if (initiateIndustry.status === 200 && initiateIndustry.data.success) {
      log(`✅ Industry Auth Initiate: Working`, 'green');
      log(`   Session ID: ${initiateIndustry.data.sessionId}`, 'cyan');
      log(`   Provider: ${initiateIndustry.data.provider}`, 'cyan');
      log(`   Industry: ${initiateIndustry.data.industry}`, 'cyan');
      
      // Test verify
      const verifyIndustry = await makeRequest(`${BASE_URL}/api/v2/industry-auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        sessionId: initiateIndustry.data.sessionId,
        code: '123456',
        deviceInfo: {
          phoneNumber: '+1234567890',
          deviceId: 'test_device'
        }
      });
      
      if (verifyIndustry.status === 200 && verifyIndustry.data.success) {
        log(`✅ Industry Auth Verify: Working`, 'green');
        log(`   User ID: ${verifyIndustry.data.user?.id}`, 'cyan');
        log(`   Organization: ${verifyIndustry.data.organization?.name}`, 'cyan');
        log(`   Roles: ${verifyIndustry.data.roles?.join(', ')}`, 'cyan');
        log(`   Dashboard URL: ${verifyIndustry.data.dashboardUrl}`, 'cyan');
      } else {
        log(`❌ Industry Auth Verify: Failed`, 'red');
        log(`   Error: ${verifyIndustry.data.error}`, 'red');
      }
    } else {
      log(`❌ Industry Auth Initiate: Failed`, 'red');
      log(`   Status: ${initiateIndustry.status}`, 'red');
      log(`   Error: ${initiateIndustry.data.error || 'Unknown error'}`, 'red');
    }
    
    // Test 3: Different industries
    log('\n3. Testing Different Industries...', 'blue');
    
    const industries = ['healthcare', 'construction', 'logistics', 'government'];
    
    for (const industry of industries) {
      const industryTest = await makeRequest(`${BASE_URL}/api/v2/industry-auth/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        phoneNumber: '+1234567890',
        industry: industry,
        method: 'sms'
      });
      
      if (industryTest.status === 200 && industryTest.data.success) {
        log(`✅ ${industry}: Working`, 'green');
      } else {
        log(`❌ ${industry}: Failed`, 'red');
      }
    }
    
    // Test 4: Error handling
    log('\n4. Testing Error Handling...', 'blue');
    
    const invalidIndustry = await makeRequest(`${BASE_URL}/api/v2/industry-auth/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      phoneNumber: '+1234567890',
      industry: 'invalid_industry',
      method: 'sms'
    });
    
    if (invalidIndustry.status === 400) {
      log(`✅ Invalid industry handling: Working`, 'green');
    } else {
      log(`❌ Invalid industry handling: Failed`, 'red');
    }
    
    log('\n🎉 Industry Auth Workflow Test Complete!', 'bright');
    
  } catch (error) {
    log(`\n❌ Test failed with error: ${error.message}`, 'red');
    console.error('Full error:', error);
  }
}

// Run the tests
testIndustryAuthWorkflow();
