#!/usr/bin/env node

/**
 * Voice API Demonstration Script
 * Showcases Telnyx Voice API with Deepgram STT and TeXML capabilities
 */

const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
  baseUrl: process.env.VOICE_API_URL || 'http://localhost:4321',
  telnyxApiKey: process.env.TELNYX_API_KEY || 'KEY1234567890abcdef',
  deepgramApiKey: process.env.DEEPGRAM_API_KEY || 'your_deepgram_key_here',
  testPhoneNumber: process.env.TEST_PHONE_NUMBER || '+1234567890',
  webhookUrl: process.env.WEBHOOK_BASE_URL || 'https://tetrixcorp.com'
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

// Demo functions
async function testVoiceCallInitiation() {
  log('\n🎤 Testing Voice Call Initiation...', 'cyan');
  
  try {
    const response = await makeRequest(`${CONFIG.baseUrl}/api/voice/initiate`, {
      method: 'POST',
      body: {
        to: CONFIG.testPhoneNumber,
        from: '+1234567890',
        webhookUrl: `${CONFIG.webhookUrl}/api/voice/webhook`,
        recordCall: true,
        transcriptionEnabled: true,
        language: 'en-US',
        timeout: 30,
        maxDuration: 300
      }
    });
    
    if (response.status === 200) {
      log('✅ Voice call initiated successfully!', 'green');
      log(`   Session ID: ${response.data.sessionId}`, 'blue');
      log(`   Call ID: ${response.data.callId}`, 'blue');
      log(`   Phone Number: ${response.data.phoneNumber}`, 'blue');
      log(`   Status: ${response.data.status}`, 'blue');
      return response.data;
    } else {
      log(`❌ Voice call initiation failed: ${response.data.error}`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ Error initiating voice call: ${error.message}`, 'red');
    return null;
  }
}

async function testTeXMLGeneration() {
  log('\n📝 Testing TeXML Response Generation...', 'cyan');
  
  try {
    const response = await makeRequest(`${CONFIG.baseUrl}/api/voice/demo/texml`, {
      method: 'POST',
      body: {
        message: 'Hello! This is SHANGO, your AI Super Agent. How can I help you today?'
      }
    });
    
    if (response.status === 200) {
      log('✅ TeXML response generated successfully!', 'green');
      log('   XML Response:', 'blue');
      console.log(response.data);
      return true;
    } else {
      log(`❌ TeXML generation failed: ${response.data.error}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Error generating TeXML: ${error.message}`, 'red');
    return false;
  }
}

async function testTranscriptionProcessing() {
  log('\n🎧 Testing Transcription Processing...', 'cyan');
  
  try {
    const response = await makeRequest(`${CONFIG.baseUrl}/api/voice/demo/transcribe`, {
      method: 'POST',
      body: {
        audioUrl: 'https://example.com/test-audio.mp3',
        sessionId: `demo_${Date.now()}`
      }
    });
    
    if (response.status === 200) {
      log('✅ Transcription processing test completed!', 'green');
      log(`   Session ID: ${response.data.session.sessionId}`, 'blue');
      if (response.data.session.transcription) {
        log(`   Transcription: "${response.data.session.transcription.text}"`, 'blue');
        log(`   Confidence: ${Math.round(response.data.session.transcription.confidence * 100)}%`, 'blue');
      }
      return true;
    } else {
      log(`❌ Transcription processing failed: ${response.data.error}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Error processing transcription: ${error.message}`, 'red');
    return false;
  }
}

async function testAIResponseGeneration() {
  log('\n🤖 Testing AI Response Generation...', 'cyan');
  
  try {
    const response = await makeRequest(`${CONFIG.baseUrl}/api/voice/demo/ai-response`, {
      method: 'POST',
      body: {
        transcription: 'Hello, I need help with my account balance',
        sessionId: `demo_${Date.now()}`
      }
    });
    
    if (response.status === 200) {
      log('✅ AI response generated successfully!', 'green');
      log(`   Input: "${response.data.data.input}"`, 'blue');
      log(`   AI Response: "${response.data.data.response}"`, 'blue');
      return true;
    } else {
      log(`❌ AI response generation failed: ${response.data.error}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Error generating AI response: ${error.message}`, 'red');
    return false;
  }
}

async function testVoiceFlowSimulation() {
  log('\n🔄 Testing Voice Flow Simulation...', 'cyan');
  
  try {
    const response = await makeRequest(`${CONFIG.baseUrl}/api/voice/demo/voice-flow`, {
      method: 'POST',
      body: {
        phoneNumber: CONFIG.testPhoneNumber
      }
    });
    
    if (response.status === 200) {
      log('✅ Voice flow simulation initiated!', 'green');
      log('   Flow Steps:', 'blue');
      response.data.flow.forEach(step => {
        log(`   ${step.step}. ${step.description}`, 'blue');
      });
      return true;
    } else {
      log(`❌ Voice flow simulation failed: ${response.data.error}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Error simulating voice flow: ${error.message}`, 'red');
    return false;
  }
}

async function testCapabilities() {
  log('\n📊 Testing API Capabilities...', 'cyan');
  
  try {
    const response = await makeRequest(`${CONFIG.baseUrl}/api/voice/demo/capabilities`);
    
    if (response.status === 200) {
      log('✅ Capabilities retrieved successfully!', 'green');
      log('   Voice Features:', 'blue');
      response.data.capabilities.voice.features.forEach(feature => {
        log(`   • ${feature}`, 'blue');
      });
      log('   Transcription Features:', 'blue');
      response.data.capabilities.transcription.features.forEach(feature => {
        log(`   • ${feature}`, 'blue');
      });
      log('   TeXML Features:', 'blue');
      response.data.capabilities.texml.features.forEach(feature => {
        log(`   • ${feature}`, 'blue');
      });
      log('   AI Features:', 'blue');
      response.data.capabilities.ai.features.forEach(feature => {
        log(`   • ${feature}`, 'blue');
      });
      return true;
    } else {
      log(`❌ Capabilities retrieval failed: ${response.data.error}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Error retrieving capabilities: ${error.message}`, 'red');
    return false;
  }
}

async function testComprehensiveSuite() {
  log('\n🧪 Running Comprehensive Test Suite...', 'cyan');
  
  try {
    const response = await makeRequest(`${CONFIG.baseUrl}/api/voice/test/all`, {
      method: 'POST'
    });
    
    if (response.status === 200) {
      log('✅ Comprehensive test suite completed!', 'green');
      log(`   Total Tests: ${response.data.summary.total}`, 'blue');
      log(`   Passed: ${response.data.summary.passed}`, 'green');
      log(`   Failed: ${response.data.summary.failed}`, 'red');
      log(`   Pass Rate: ${response.data.summary.passRate}`, 'blue');
      return true;
    } else {
      log(`❌ Comprehensive test suite failed: ${response.data.error}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Error running test suite: ${error.message}`, 'red');
    return false;
  }
}

async function demonstrateVoiceAPI() {
  log('🎤 SHANGO Voice API Demonstration', 'bright');
  log('=====================================', 'bright');
  
  const results = {
    voiceCall: false,
    texml: false,
    transcription: false,
    aiResponse: false,
    voiceFlow: false,
    capabilities: false,
    testSuite: false
  };
  
  // Run all demonstrations
  results.voiceCall = await testVoiceCallInitiation();
  results.texml = await testTeXMLGeneration();
  results.transcription = await testTranscriptionProcessing();
  results.aiResponse = await testAIResponseGeneration();
  results.voiceFlow = await testVoiceFlowSimulation();
  results.capabilities = await testCapabilities();
  results.testSuite = await testComprehensiveSuite();
  
  // Summary
  log('\n📋 Demonstration Summary', 'bright');
  log('========================', 'bright');
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  log(`Voice Call Initiation: ${results.voiceCall ? '✅ PASSED' : '❌ FAILED'}`, results.voiceCall ? 'green' : 'red');
  log(`TeXML Generation: ${results.texml ? '✅ PASSED' : '❌ FAILED'}`, results.texml ? 'green' : 'red');
  log(`Transcription Processing: ${results.transcription ? '✅ PASSED' : '❌ FAILED'}`, results.transcription ? 'green' : 'red');
  log(`AI Response Generation: ${results.aiResponse ? '✅ PASSED' : '❌ FAILED'}`, results.aiResponse ? 'green' : 'red');
  log(`Voice Flow Simulation: ${results.voiceFlow ? '✅ PASSED' : '❌ FAILED'}`, results.voiceFlow ? 'green' : 'red');
  log(`Capabilities Retrieval: ${results.capabilities ? '✅ PASSED' : '❌ FAILED'}`, results.capabilities ? 'green' : 'red');
  log(`Test Suite: ${results.testSuite ? '✅ PASSED' : '❌ FAILED'}`, results.testSuite ? 'green' : 'red');
  
  log(`\nOverall Success Rate: ${Math.round((passed / total) * 100)}% (${passed}/${total})`, passed === total ? 'green' : 'yellow');
  
  if (passed === total) {
    log('\n🎉 All Voice API demonstrations completed successfully!', 'green');
    log('   The enhanced Voice API with Telnyx, Deepgram STT, and TeXML is fully functional.', 'green');
  } else {
    log('\n⚠️  Some demonstrations failed. Check the logs above for details.', 'yellow');
  }
}

// Main execution
if (require.main === module) {
  demonstrateVoiceAPI().catch(error => {
    log(`\n💥 Demonstration failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = {
  demonstrateVoiceAPI,
  testVoiceCallInitiation,
  testTeXMLGeneration,
  testTranscriptionProcessing,
  testAIResponseGeneration,
  testVoiceFlowSimulation,
  testCapabilities,
  testComprehensiveSuite
};
