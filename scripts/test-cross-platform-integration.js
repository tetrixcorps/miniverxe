#!/usr/bin/env node

/**
 * Cross-Platform Voice Integration Test Script
 * Tests integration between Voice API, IVR, SinchChatLive, and Unified Messaging Platform
 */

const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
  baseUrl: process.env.VOICE_API_URL || 'http://localhost:4321',
  testPhoneNumber: process.env.TEST_PHONE_NUMBER || '+1234567890',
  testUserId: 'test_user_123',
  testConversationId: 'test_conversation_456'
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
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const req = client.request(url, {
      method: options.method || 'GET',
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

// Test functions
async function testCrossPlatformVoiceCall() {
  log('\n🎤 Testing Cross-Platform Voice Call Initiation...', 'cyan');
  
  try {
    const response = await makeRequest(`${CONFIG.baseUrl}/api/voice/integration/initiate`, {
      method: 'POST',
      body: {
        to: CONFIG.testPhoneNumber,
        from: '+1234567890',
        channel: 'voice',
        platform: 'tetrix',
        userId: CONFIG.testUserId,
        conversationId: CONFIG.testConversationId,
        enableTranscription: true,
        enableTranslation: false,
        targetLanguage: 'en-US'
      }
    });
    
    if (response.status === 200) {
      log('✅ Cross-platform voice call initiated successfully!', 'green');
      log(`   Session ID: ${response.data.session.sessionId}`, 'blue');
      log(`   Call ID: ${response.data.session.callId}`, 'blue');
      log(`   Channel: ${response.data.session.channel}`, 'blue');
      log(`   Platform: ${response.data.session.metadata.platform}`, 'blue');
      return response.data.session;
    } else {
      log(`❌ Cross-platform voice call initiation failed: ${response.data.error}`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ Error initiating cross-platform voice call: ${error.message}`, 'red');
    return null;
  }
}

async function testCrossPlatformTranscription() {
  log('\n🎧 Testing Cross-Platform Transcription Processing...', 'cyan');
  
  try {
    const response = await makeRequest(`${CONFIG.baseUrl}/api/voice/integration/transcribe`, {
      method: 'POST',
      body: {
        sessionId: 'test_session_123',
        audioUrl: 'https://example.com/test-audio.mp3'
      }
    });
    
    if (response.status === 200) {
      log('✅ Cross-platform transcription processed successfully!', 'green');
      log(`   Session ID: ${response.data.session.sessionId}`, 'blue');
      if (response.data.session.transcription) {
        log(`   Transcription: "${response.data.session.transcription.text}"`, 'blue');
        log(`   Confidence: ${Math.round(response.data.session.transcription.confidence * 100)}%`, 'blue');
        log(`   Language: ${response.data.session.transcription.language}`, 'blue');
      }
      return true;
    } else {
      log(`❌ Cross-platform transcription processing failed: ${response.data.error}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Error processing cross-platform transcription: ${error.message}`, 'red');
    return false;
  }
}

async function testIntegrationStatus() {
  log('\n📊 Testing Integration Status...', 'cyan');
  
  try {
    const response = await makeRequest(`${CONFIG.baseUrl}/api/voice/integration/status`);
    
    if (response.status === 200) {
      log('✅ Integration status retrieved successfully!', 'green');
      log('   Voice API Status:', 'blue');
      log(`   - Status: ${response.data.status.voiceAPI.status}`, 'blue');
      log(`   - Features: ${response.data.status.voiceAPI.features.join(', ')}`, 'blue');
      log('   IVR Integration Status:', 'blue');
      log(`   - Status: ${response.data.status.ivrIntegration.status}`, 'blue');
      log(`   - Features: ${response.data.status.ivrIntegration.features.join(', ')}`, 'blue');
      log('   SinchChatLive Integration Status:', 'blue');
      log(`   - Status: ${response.data.status.sinchChatIntegration.status}`, 'blue');
      log(`   - Features: ${response.data.status.sinchChatIntegration.features.join(', ')}`, 'blue');
      log('   Unified Messaging Integration Status:', 'blue');
      log(`   - Status: ${response.data.status.unifiedMessagingIntegration.status}`, 'blue');
      log(`   - Features: ${response.data.status.unifiedMessagingIntegration.features.join(', ')}`, 'blue');
      return true;
    } else {
      log(`❌ Integration status retrieval failed: ${response.data.error}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Error retrieving integration status: ${error.message}`, 'red');
    return false;
  }
}

async function testCrossChannelMessages() {
  log('\n💬 Testing Cross-Channel Messages...', 'cyan');
  
  try {
    const response = await makeRequest(`${CONFIG.baseUrl}/api/voice/integration/sessions/test_session_123/messages`);
    
    if (response.status === 200) {
      log('✅ Cross-channel messages retrieved successfully!', 'green');
      log(`   Message Count: ${response.data.count}`, 'blue');
      response.data.messages.forEach((message, index) => {
        log(`   Message ${index + 1}:`, 'blue');
        log(`   - Type: ${message.type}`, 'blue');
        log(`   - Channel: ${message.channel}`, 'blue');
        log(`   - Content: ${message.content.substring(0, 50)}...`, 'blue');
      });
      return true;
    } else {
      log(`❌ Cross-channel messages retrieval failed: ${response.data.error}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Error retrieving cross-channel messages: ${error.message}`, 'red');
    return false;
  }
}

async function testSessionManagement() {
  log('\n📋 Testing Session Management...', 'cyan');
  
  try {
    const response = await makeRequest(`${CONFIG.baseUrl}/api/voice/integration/sessions`);
    
    if (response.status === 200) {
      log('✅ Session management test passed!', 'green');
      log(`   Total Sessions: ${response.data.count}`, 'blue');
      response.data.sessions.forEach((session, index) => {
        log(`   Session ${index + 1}:`, 'blue');
        log(`   - ID: ${session.sessionId}`, 'blue');
        log(`   - Status: ${session.status}`, 'blue');
        log(`   - Channel: ${session.channel}`, 'blue');
        log(`   - Platform: ${session.metadata.platform}`, 'blue');
      });
      return true;
    } else {
      log(`❌ Session management test failed: ${response.data.error}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Error testing session management: ${error.message}`, 'red');
    return false;
  }
}

async function testComprehensiveIntegration() {
  log('\n🧪 Testing Comprehensive Cross-Platform Integration...', 'cyan');
  
  try {
    const response = await makeRequest(`${CONFIG.baseUrl}/api/voice/integration/test`, {
      method: 'POST'
    });
    
    if (response.status === 200) {
      log('✅ Comprehensive integration test completed!', 'green');
      log(`   Total Tests: ${response.data.summary.total}`, 'blue');
      log(`   Passed: ${response.data.summary.passed}`, 'green');
      log(`   Failed: ${response.data.summary.failed}`, 'red');
      log(`   Pass Rate: ${response.data.summary.passRate}`, 'blue');
      
      log('\n   Test Results:', 'blue');
      Object.entries(response.data.results).forEach(([test, result]) => {
        const color = result.result === 'PASSED' ? 'green' : 'red';
        log(`   - ${test}: ${result.result}`, color);
      });
      
      return true;
    } else {
      log(`❌ Comprehensive integration test failed: ${response.data.error}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Error running comprehensive integration test: ${error.message}`, 'red');
    return false;
  }
}

async function testCrossPlatformIntegration() {
  log('🔗 Cross-Platform Voice Integration Test Suite', 'bright');
  log('================================================', 'bright');
  
  const results = {
    voiceCall: false,
    transcription: false,
    integrationStatus: false,
    crossChannelMessages: false,
    sessionManagement: false,
    comprehensiveTest: false
  };
  
  // Run all tests
  results.voiceCall = await testCrossPlatformVoiceCall();
  results.transcription = await testCrossPlatformTranscription();
  results.integrationStatus = await testIntegrationStatus();
  results.crossChannelMessages = await testCrossChannelMessages();
  results.sessionManagement = await testSessionManagement();
  results.comprehensiveTest = await testComprehensiveIntegration();
  
  // Summary
  log('\n📋 Test Results Summary', 'bright');
  log('========================', 'bright');
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  log(`Cross-Platform Voice Call: ${results.voiceCall ? '✅ PASSED' : '❌ FAILED'}`, results.voiceCall ? 'green' : 'red');
  log(`Cross-Platform Transcription: ${results.transcription ? '✅ PASSED' : '❌ FAILED'}`, results.transcription ? 'green' : 'red');
  log(`Integration Status: ${results.integrationStatus ? '✅ PASSED' : '❌ FAILED'}`, results.integrationStatus ? 'green' : 'red');
  log(`Cross-Channel Messages: ${results.crossChannelMessages ? '✅ PASSED' : '❌ FAILED'}`, results.crossChannelMessages ? 'green' : 'red');
  log(`Session Management: ${results.sessionManagement ? '✅ PASSED' : '❌ FAILED'}`, results.sessionManagement ? 'green' : 'red');
  log(`Comprehensive Test: ${results.comprehensiveTest ? '✅ PASSED' : '❌ FAILED'}`, results.comprehensiveTest ? 'green' : 'red');
  
  log(`\nOverall Success Rate: ${Math.round((passed / total) * 100)}% (${passed}/${total})`, passed === total ? 'green' : 'yellow');
  
  if (passed === total) {
    log('\n🎉 All cross-platform integration tests completed successfully!', 'green');
    log('   The Voice API is fully integrated with IVR, SinchChatLive, and Unified Messaging Platform.', 'green');
  } else {
    log('\n⚠️  Some integration tests failed. Check the logs above for details.', 'yellow');
  }
}

// Main execution
if (require.main === module) {
  testCrossPlatformIntegration().catch(error => {
    log(`\n💥 Integration test failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = {
  testCrossPlatformIntegration,
  testCrossPlatformVoiceCall,
  testCrossPlatformTranscription,
  testIntegrationStatus,
  testCrossChannelMessages,
  testSessionManagement,
  testComprehensiveIntegration
};
