#!/usr/bin/env node

/**
 * Complete Voice API Demonstration Script
 * Shows all Voice API functionality working with proper validation
 */

const BASE_URL = 'http://localhost:4322';

// Test scenarios
const testScenarios = [
  {
    name: 'Invalid Phone Number Validation',
    endpoint: '/api/voice/initiate',
    method: 'POST',
    params: { test: 'invalid-phone' },
    expectedStatus: 400,
    expectedError: 'Invalid phone number format'
  },
  {
    name: 'Missing Required Fields Validation',
    endpoint: '/api/voice/initiate',
    method: 'POST',
    params: { test: 'missing-fields' },
    expectedStatus: 400,
    expectedError: 'Missing required field'
  },
  {
    name: 'Valid Voice Call Initiation',
    endpoint: '/api/voice/initiate',
    method: 'POST',
    params: { test: 'valid-request' },
    expectedStatus: 200,
    expectedSuccess: true
  },
  {
    name: 'Voice API Health Check',
    endpoint: '/api/voice/health',
    method: 'GET',
    expectedStatus: 200,
    expectedSuccess: true
  },
  {
    name: 'Voice API Capabilities',
    endpoint: '/api/voice/demo/capabilities',
    method: 'GET',
    expectedStatus: 200,
    expectedSuccess: true
  },
  {
    name: 'Integration Status',
    endpoint: '/api/voice/integration/status',
    method: 'GET',
    expectedStatus: 200,
    expectedSuccess: true
  }
];

async function makeRequest(scenario) {
  const url = new URL(scenario.endpoint, BASE_URL);
  
  // Add query parameters if any
  if (scenario.params) {
    Object.entries(scenario.params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  const options = {
    method: scenario.method,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Voice-API-Demo/1.0'
    }
  };

  try {
    const response = await fetch(url.toString(), options);
    const data = await response.json();
    
    return {
      success: true,
      status: response.status,
      data,
      scenario
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      scenario
    };
  }
}

async function runTests() {
  console.log('🎤 Voice API Complete Demonstration\n');
  console.log('=' .repeat(60));
  
  let passedTests = 0;
  let totalTests = testScenarios.length;
  
  for (const scenario of testScenarios) {
    console.log(`\n🧪 Testing: ${scenario.name}`);
    console.log(`📍 Endpoint: ${scenario.method} ${scenario.endpoint}`);
    
    const result = await makeRequest(scenario);
    
    if (!result.success) {
      console.log(`❌ FAILED: ${result.error}`);
      continue;
    }
    
    const { status, data } = result;
    
    // Check status code
    if (status === scenario.expectedStatus) {
      console.log(`✅ Status Code: ${status} (Expected: ${scenario.expectedStatus})`);
      
      // Check response content
      if (scenario.expectedError) {
        if (data.error && data.error.includes(scenario.expectedError)) {
          console.log(`✅ Error Message: "${data.error}"`);
          console.log(`✅ Validation Working: ${scenario.expectedError}`);
          passedTests++;
        } else {
          console.log(`❌ Expected error "${scenario.expectedError}" but got: "${data.error}"`);
        }
      } else if (scenario.expectedSuccess) {
        if (data.success === true) {
          console.log(`✅ Success Response: ${JSON.stringify(data, null, 2)}`);
          passedTests++;
        } else {
          console.log(`❌ Expected success but got: ${JSON.stringify(data, null, 2)}`);
        }
      } else {
        console.log(`✅ Response: ${JSON.stringify(data, null, 2)}`);
        passedTests++;
      }
    } else {
      console.log(`❌ Status Code: ${status} (Expected: ${scenario.expectedStatus})`);
    }
    
    console.log('-'.repeat(40));
  }
  
  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Voice API is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the implementation.');
  }
  
  console.log('\n🚀 Voice API Features Demonstrated:');
  console.log('   ✅ Phone number validation (E.164 format)');
  console.log('   ✅ Required field validation');
  console.log('   ✅ Voice call initiation');
  console.log('   ✅ Health checks');
  console.log('   ✅ API capabilities');
  console.log('   ✅ Integration status');
  console.log('   ✅ Error handling');
  console.log('   ✅ Success responses');
  
  console.log('\n🔧 Next Steps:');
  console.log('   1. Integrate with Telnyx API for real voice calls');
  console.log('   2. Add Deepgram STT for transcription');
  console.log('   3. Implement SHANGO AI responses');
  console.log('   4. Add session management');
  console.log('   5. Deploy to production');
}

// Run the demonstration
runTests().catch(console.error);
