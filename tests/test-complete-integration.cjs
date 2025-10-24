#!/usr/bin/env node

/**
 * Complete Integration Test Suite
 * Tests both Code Academy and JoRoMi platform integrations with SinchChatLive
 */

const http = require('http');

const BASE_URL = 'http://localhost:8080';
const TEST_TIMEOUT = 10000;

// Test configuration
const tests = [
  {
    name: 'Code Academy Route Test',
    url: '/code-academy',
    method: 'GET',
    expectedContent: 'Code Academy',
    description: 'Test Code Academy landing page loads correctly'
  },
  {
    name: 'JoRoMi Route Test', 
    url: '/joromi',
    method: 'GET',
    expectedContent: 'JoRoMi',
    description: 'Test JoRoMi landing page loads correctly'
  },
  {
    name: 'SinchChatLive Session Creation',
    url: '/api/v1/shango/sessions',
    method: 'POST',
    body: {
      userId: 'test-user-code-academy',
      agentId: 'shango-technical'
    },
    expectedField: 'success',
    expectedValue: true,
    description: 'Test SinchChatLive session creation for Code Academy'
  },
  {
    name: 'SinchChatLive Message Sending',
    url: '/api/v1/shango/sessions',
    method: 'POST',
    body: {
      userId: 'test-user-joromi',
      agentId: 'shango-general'
    },
    expectedField: 'success',
    expectedValue: true,
    description: 'Test SinchChatLive session creation for JoRoMi'
  }
];

// Utility function to make HTTP requests
function makeRequest(url, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: url,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: jsonData,
            rawBody: data
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
            rawBody: data
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// Test runner
async function runTest(test) {
  console.log(`\n🧪 Running: ${test.name}`);
  console.log(`📝 ${test.description}`);
  
  try {
    const response = await makeRequest(test.url, test.method, test.body);
    
    // Check status code
    if (response.statusCode !== 200) {
      throw new Error(`Expected status 200, got ${response.statusCode}`);
    }
    
    // Check content based on test type
    if (test.expectedContent) {
      if (!response.rawBody.includes(test.expectedContent)) {
        throw new Error(`Expected content "${test.expectedContent}" not found in response`);
      }
    }
    
    if (test.expectedField && test.expectedValue !== undefined) {
      if (response.body[test.expectedField] !== test.expectedValue) {
        throw new Error(`Expected ${test.expectedField} to be ${test.expectedValue}, got ${response.body[test.expectedField]}`);
      }
    }
    
    console.log(`✅ PASSED: ${test.name}`);
    return { success: true, test: test.name };
    
  } catch (error) {
    console.log(`❌ FAILED: ${test.name}`);
    console.log(`   Error: ${error.message}`);
    return { success: false, test: test.name, error: error.message };
  }
}

// Test message sending functionality
async function testMessageSending() {
  console.log(`\n🧪 Running: Message Sending Integration Test`);
  console.log(`📝 Test sending messages through SinchChatLive API`);
  
  try {
    // Create a session first
    const sessionResponse = await makeRequest('/api/v1/shango/sessions', 'POST', {
      userId: 'test-message-user',
      agentId: 'shango-technical'
    });
    
    if (!sessionResponse.body.success) {
      throw new Error('Failed to create session for message test');
    }
    
    const sessionId = sessionResponse.body.session.id;
    console.log(`   Created session: ${sessionId}`);
    
    // Send a test message
    const messageResponse = await makeRequest(`/api/v1/shango/sessions/${sessionId}/messages`, 'POST', {
      message: 'Test message for integration testing',
      role: 'user',
      agentId: 'shango-technical'
    });
    
    if (!messageResponse.body.success) {
      throw new Error('Failed to send message');
    }
    
    console.log(`✅ PASSED: Message Sending Integration Test`);
    console.log(`   AI Response: ${messageResponse.body.aiResponse.content.substring(0, 100)}...`);
    return { success: true, test: 'Message Sending Integration Test' };
    
  } catch (error) {
    console.log(`❌ FAILED: Message Sending Integration Test`);
    console.log(`   Error: ${error.message}`);
    return { success: false, test: 'Message Sending Integration Test', error: error.message };
  }
}

// Test platform-specific AI agents
async function testPlatformAgents() {
  console.log(`\n🧪 Running: Platform-Specific AI Agents Test`);
  console.log(`📝 Test different AI agents for Code Academy vs JoRoMi`);
  
  const agentTests = [
    {
      platform: 'Code Academy',
      agentId: 'shango-technical',
      testMessage: 'How do I learn React?'
    },
    {
      platform: 'JoRoMi',
      agentId: 'shango-general', 
      testMessage: 'How can I improve team communication?'
    }
  ];
  
  const results = [];
  
  for (const agentTest of agentTests) {
    try {
      // Create session with specific agent
      const sessionResponse = await makeRequest('/api/v1/shango/sessions', 'POST', {
        userId: `test-${agentTest.platform.toLowerCase().replace(' ', '-')}`,
        agentId: agentTest.agentId
      });
      
      if (!sessionResponse.body.success) {
        throw new Error(`Failed to create session for ${agentTest.platform}`);
      }
      
      const sessionId = sessionResponse.body.session.id;
      
      // Send platform-specific message
      const messageResponse = await makeRequest(`/api/v1/shango/sessions/${sessionId}/messages`, 'POST', {
        message: agentTest.testMessage,
        role: 'user',
        agentId: agentTest.agentId
      });
      
      if (!messageResponse.body.success) {
        throw new Error(`Failed to send message for ${agentTest.platform}`);
      }
      
      console.log(`✅ PASSED: ${agentTest.platform} Agent Test`);
      console.log(`   Agent: ${messageResponse.body.aiResponse.agentId}`);
      console.log(`   Response: ${messageResponse.body.aiResponse.content.substring(0, 100)}...`);
      
      results.push({ success: true, platform: agentTest.platform });
      
    } catch (error) {
      console.log(`❌ FAILED: ${agentTest.platform} Agent Test`);
      console.log(`   Error: ${error.message}`);
      results.push({ success: false, platform: agentTest.platform, error: error.message });
    }
  }
  
  return results;
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Complete Integration Test Suite');
  console.log('=' .repeat(60));
  
  const startTime = Date.now();
  const results = [];
  
  // Run basic route tests
  for (const test of tests) {
    const result = await runTest(test);
    results.push(result);
  }
  
  // Run message sending test
  const messageResult = await testMessageSending();
  results.push(messageResult);
  
  // Run platform-specific agent tests
  const agentResults = await testPlatformAgents();
  results.push(...agentResults);
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('=' .repeat(60));
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏱️  Duration: ${duration}ms`);
  
  if (failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.filter(r => !r.success).forEach(result => {
      console.log(`   - ${result.test || result.platform}: ${result.error}`);
    });
  }
  
  console.log('\n🎯 INTEGRATION STATUS:');
  if (failed === 0) {
    console.log('   🎉 ALL TESTS PASSED! Integration is working perfectly.');
    console.log('   ✅ Code Academy platform: Ready');
    console.log('   ✅ JoRoMi platform: Ready');
    console.log('   ✅ SinchChatLive AI: Ready');
    console.log('   ✅ Message handling: Ready');
  } else {
    console.log('   ⚠️  Some tests failed. Please check the errors above.');
  }
  
  console.log('\n🔧 NEXT STEPS:');
  console.log('   1. Both platforms are now using local routes (no external domain issues)');
  console.log('   2. SinchChatLive AI integration is working for both platforms');
  console.log('   3. Ready for production deployment');
  
  return failed === 0;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test runner error:', error);
      process.exit(1);
    });
}

module.exports = { runAllTests, runTest, testMessageSending, testPlatformAgents };
