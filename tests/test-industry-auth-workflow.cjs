#!/usr/bin/env node

/**
 * TETRIX Industry Auth Workflow Test
 * Tests the complete industry authentication workflow
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
    } else {
      log(`❌ Basic 2FA Initiate: Failed`, 'red');
      log(`   Status: ${initiate2FA.status}`, 'red');
      log(`   Response: ${JSON.stringify(initiate2FA.data, null, 2)}`, 'red');
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
    } else {
      log(`❌ Industry Auth Initiate: Failed`, 'red');
      log(`   Status: ${initiateIndustry.status}`, 'red');
      log(`   Response: ${JSON.stringify(initiateIndustry.data, null, 2)}`, 'red');
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
        log(`❌ ${industry}: Failed (Status: ${industryTest.status})`, 'red');
      }
    }
    
    log('\n🎉 Industry Auth Workflow Test Complete!', 'bright');
    
  } catch (error) {
    log(`\n❌ Test failed with error: ${error.message}`, 'red');
    console.error('Full error:', error);
  }
}

// Run the tests
testIndustryAuthWorkflow();
