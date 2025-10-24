#!/usr/bin/env node

/**
 * Comprehensive Functional Test for SinchChatLive Integration
 * Tests the complete SHANGO AI system with SinchChatLive as primary and Ollama as fallback
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:8080';
const OLLAMA_URL = 'http://localhost:11434';

// Test configuration
const TEST_CONFIG = {
  userId: 'test-user-sinch-integration',
  agentId: 'shango-general',
  testMessage: 'What are your enterprise pricing plans?',
  complexMessage: 'I need help with integrating your API into our Node.js application. Can you provide detailed documentation and examples?'
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Utility functions
function logTest(testName, status, details = '') {
  testResults.total++;
  if (status === 'PASS') {
    testResults.passed++;
    console.log(`✅ ${testName}: PASS`);
  } else {
    testResults.failed++;
    console.log(`❌ ${testName}: FAIL - ${details}`);
  }
  testResults.details.push({ test: testName, status, details });
}

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    return { success: false, status: 0, data: null, error: error.message };
  }
}

// Test 1: Ollama Service Availability
async function testOllamaAvailability() {
  console.log('\n🔍 Testing Ollama Service Availability...');
  
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`);
    if (response.ok) {
      const data = await response.json();
      const qwen3Model = data.models?.find(m => m.name.includes('qwen3'));
      if (qwen3Model) {
        logTest('Ollama Service', 'PASS', `qwen3 model available: ${qwen3Model.name}`);
        return true;
      } else {
        logTest('Ollama Service', 'FAIL', 'qwen3 model not found');
        return false;
      }
    } else {
      logTest('Ollama Service', 'FAIL', `HTTP ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('Ollama Service', 'FAIL', error.message);
    return false;
  }
}

// Test 2: SinchChatLive Service Initialization
async function testSinchChatLiveInitialization() {
  console.log('\n🔍 Testing SinchChatLive Service Initialization...');
  
  try {
    // Test if the service can be imported and initialized
    const { realSHANGOAIService } = await import('./src/services/realSinchChatService.ts');
    
    if (realSHANGOAIService) {
      logTest('SinchChatLive Import', 'PASS', 'Service imported successfully');
      
      // Test initialization (this might fail due to API credentials, but we can test the structure)
      try {
        await realSHANGOAIService.initialize();
        logTest('SinchChatLive Init', 'PASS', 'Service initialized successfully');
        return true;
      } catch (initError) {
        logTest('SinchChatLive Init', 'FAIL', `Initialization failed: ${initError.message}`);
        return false;
      }
    } else {
      logTest('SinchChatLive Import', 'FAIL', 'Service not found');
      return false;
    }
  } catch (error) {
    logTest('SinchChatLive Import', 'FAIL', error.message);
    return false;
  }
}

// Test 3: SHANGO API Session Creation
async function testSessionCreation() {
  console.log('\n🔍 Testing SHANGO API Session Creation...');
  
  const result = await makeRequest(`${BASE_URL}/api/v1/shango/sessions`, {
    method: 'POST',
    body: JSON.stringify({
      userId: TEST_CONFIG.userId,
      agentId: TEST_CONFIG.agentId
    })
  });
  
  if (result.success && result.data?.session?.id) {
    logTest('Session Creation', 'PASS', `Session created: ${result.data.session.id}`);
    return result.data.session.id;
  } else {
    logTest('Session Creation', 'FAIL', result.data?.error || 'Unknown error');
    return null;
  }
}

// Test 4: Message Sending with SinchChatLive Primary
async function testMessageSending(sessionId) {
  console.log('\n🔍 Testing Message Sending (SinchChatLive Primary)...');
  
  if (!sessionId) {
    logTest('Message Sending', 'FAIL', 'No session ID provided');
    return false;
  }
  
  const result = await makeRequest(`${BASE_URL}/api/v1/shango/sessions/${sessionId}/messages`, {
    method: 'POST',
    body: JSON.stringify({
      message: TEST_CONFIG.testMessage,
      role: 'user',
      agentId: TEST_CONFIG.agentId
    })
  });
  
  if (result.success && result.data?.aiResponse?.content) {
    logTest('Message Sending', 'PASS', `AI Response: ${result.data.aiResponse.content.substring(0, 100)}...`);
    return true;
  } else {
    logTest('Message Sending', 'FAIL', result.data?.error || 'No AI response received');
    return false;
  }
}

// Test 5: Complex Message Handling
async function testComplexMessage(sessionId) {
  console.log('\n🔍 Testing Complex Message Handling...');
  
  if (!sessionId) {
    logTest('Complex Message', 'FAIL', 'No session ID provided');
    return false;
  }
  
  const result = await makeRequest(`${BASE_URL}/api/v1/shango/sessions/${sessionId}/messages`, {
    method: 'POST',
    body: JSON.stringify({
      message: TEST_CONFIG.complexMessage,
      role: 'user',
      agentId: 'shango-technical'
    })
  });
  
  if (result.success && result.data?.aiResponse?.content) {
    const response = result.data.aiResponse.content;
    if (response.length > 50 && (response.includes('API') || response.includes('integration') || response.includes('Node.js'))) {
      logTest('Complex Message', 'PASS', `Technical response received: ${response.substring(0, 100)}...`);
      return true;
    } else {
      logTest('Complex Message', 'FAIL', 'Response not technical enough');
      return false;
    }
  } else {
    logTest('Complex Message', 'FAIL', result.data?.error || 'No AI response received');
    return false;
  }
}

// Test 6: Ollama Fallback Testing
async function testOllamaFallback() {
  console.log('\n🔍 Testing Ollama Fallback System...');
  
  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen3:latest',
        prompt: 'You are SHANGO, an AI Super Agent. Respond with "Ollama fallback is working!"',
        stream: false
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.response && data.response.includes('Ollama fallback')) {
        logTest('Ollama Fallback', 'PASS', 'Ollama fallback system working');
        return true;
      } else {
        logTest('Ollama Fallback', 'FAIL', 'Unexpected response from Ollama');
        return false;
      }
    } else {
      logTest('Ollama Fallback', 'FAIL', `HTTP ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('Ollama Fallback', 'FAIL', error.message);
    return false;
  }
}

// Test 7: Agent Switching
async function testAgentSwitching(sessionId) {
  console.log('\n🔍 Testing Agent Switching...');
  
  if (!sessionId) {
    logTest('Agent Switching', 'FAIL', 'No session ID provided');
    return false;
  }
  
  const result = await makeRequest(`${BASE_URL}/api/v1/shango/sessions/${sessionId}/messages`, {
    method: 'POST',
    body: JSON.stringify({
      message: 'I need help with billing issues',
      role: 'user',
      agentId: 'shango-billing'
    })
  });
  
  if (result.success && result.data?.aiResponse?.content) {
    const response = result.data.aiResponse.content;
    if (response.includes('billing') || response.includes('payment') || response.includes('account')) {
      logTest('Agent Switching', 'PASS', 'Billing agent response received');
      return true;
    } else {
      logTest('Agent Switching', 'FAIL', 'Response not from billing agent');
      return false;
    }
  } else {
    logTest('Agent Switching', 'FAIL', result.data?.error || 'No AI response received');
    return false;
  }
}

// Test 8: Error Handling
async function testErrorHandling() {
  console.log('\n🔍 Testing Error Handling...');
  
  // Test with invalid session ID
  const result = await makeRequest(`${BASE_URL}/api/v1/shango/sessions/invalid-session-id/messages`, {
    method: 'POST',
    body: JSON.stringify({
      message: 'Test message',
      role: 'user',
      agentId: 'shango-general'
    })
  });
  
  if (!result.success && result.status === 200) {
    // The system should handle this gracefully and still provide a response
    logTest('Error Handling', 'PASS', 'System handled invalid session gracefully');
    return true;
  } else {
    logTest('Error Handling', 'FAIL', 'System did not handle error properly');
    return false;
  }
}

// Test 9: Performance Testing
async function testPerformance(sessionId) {
  console.log('\n🔍 Testing Performance...');
  
  if (!sessionId) {
    logTest('Performance', 'FAIL', 'No session ID provided');
    return false;
  }
  
  const startTime = Date.now();
  
  const result = await makeRequest(`${BASE_URL}/api/v1/shango/sessions/${sessionId}/messages`, {
    method: 'POST',
    body: JSON.stringify({
      message: 'Quick test message',
      role: 'user',
      agentId: TEST_CONFIG.agentId
    })
  });
  
  const endTime = Date.now();
  const responseTime = endTime - startTime;
  
  if (result.success && responseTime < 5000) { // Less than 5 seconds
    logTest('Performance', 'PASS', `Response time: ${responseTime}ms`);
    return true;
  } else {
    logTest('Performance', 'FAIL', `Response time too slow: ${responseTime}ms`);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting SinchChatLive Integration Tests...\n');
  
  // Test 1: Ollama availability
  const ollamaAvailable = await testOllamaAvailability();
  
  // Test 2: SinchChatLive initialization
  const sinchAvailable = await testSinchChatLiveInitialization();
  
  // Test 3: Session creation
  const sessionId = await testSessionCreation();
  
  // Test 4: Message sending
  await testMessageSending(sessionId);
  
  // Test 5: Complex message handling
  await testComplexMessage(sessionId);
  
  // Test 6: Ollama fallback
  await testOllamaFallback();
  
  // Test 7: Agent switching
  await testAgentSwitching(sessionId);
  
  // Test 8: Error handling
  await testErrorHandling();
  
  // Test 9: Performance
  await testPerformance(sessionId);
  
  // Print summary
  console.log('\n📊 Test Summary:');
  console.log('================');
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed}`);
  console.log(`Failed: ${testResults.failed}`);
  console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.details
      .filter(test => test.status === 'FAIL')
      .forEach(test => console.log(`  - ${test.test}: ${test.details}`));
  }
  
  console.log('\n🎯 Integration Status:');
  if (testResults.failed === 0) {
    console.log('✅ ALL TESTS PASSED - SinchChatLive integration is working perfectly!');
  } else if (testResults.passed > testResults.failed) {
    console.log('⚠️  MOSTLY WORKING - Some issues detected, but core functionality is operational');
  } else {
    console.log('❌ MAJOR ISSUES - Significant problems detected in the integration');
  }
  
  return testResults.failed === 0;
}

// Run the tests
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
  });
}

export { runAllTests, testResults };
