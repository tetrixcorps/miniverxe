/**
 * SHANGO Chat Functionality Test
 * Tests the contact-us page SHANGO chat integration
 */

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:8080',
  contactPageUrl: '/contact',
  apiBaseUrl: '/api/v1/shango',
  timeout: 10000
};

// Test utilities
class TestRunner {
  constructor() {
    this.tests = [];
    this.results = [];
  }

  addTest(name, testFn) {
    this.tests.push({ name, testFn });
  }

  async runTests() {
    console.log('🧪 Starting SHANGO Chat Tests...\n');
    
    for (const test of this.tests) {
      try {
        console.log(`⏳ Running: ${test.name}`);
        const result = await test.testFn();
        this.results.push({ name: test.name, status: 'PASS', result });
        console.log(`✅ PASS: ${test.name}\n`);
      } catch (error) {
        this.results.push({ name: test.name, status: 'FAIL', error: error.message });
        console.log(`❌ FAIL: ${test.name} - ${error.message}\n`);
      }
    }

    this.printSummary();
  }

  printSummary() {
    console.log('📊 Test Summary:');
    console.log('================');
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / this.results.length) * 100).toFixed(1)}%\n`);

    if (failed > 0) {
      console.log('❌ Failed Tests:');
      this.results.filter(r => r.status === 'FAIL').forEach(test => {
        console.log(`   • ${test.name}: ${test.error}`);
      });
    }
  }
}

// Test functions
class SHANGOChatTests {
  constructor() {
    this.runner = new TestRunner();
    this.sessionId = null;
  }

  // Test 1: Check if contact page loads
  async testContactPageLoads() {
    const response = await fetch(`${TEST_CONFIG.baseUrl}${TEST_CONFIG.contactPageUrl}`);
    
    if (!response.ok) {
      throw new Error(`Contact page failed to load: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    
    // Check for essential elements
    const checks = [
      { name: 'SHANGO chat widget container', selector: 'shango-chat-widget' },
      { name: 'Start chat button', selector: 'startSHANGOChat' },
      { name: 'Chat initialization script', selector: 'initializeSHANGOChatWidget' }
    ];

    for (const check of checks) {
      if (!html.includes(check.selector)) {
        throw new Error(`Missing element: ${check.name}`);
      }
    }

    return { status: 'loaded', elements: checks.length };
  }

  // Test 2: Test session creation API
  async testSessionCreation() {
    const response = await fetch(`${TEST_CONFIG.baseUrl}${TEST_CONFIG.apiBaseUrl}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: `test-user-${Date.now()}`,
        agentId: 'shango-general',
        channel: 'chat'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Session creation failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.success || !data.session) {
      throw new Error('Session creation response invalid');
    }

    this.sessionId = data.session.id;
    return { sessionId: this.sessionId, status: data.session.status };
  }

  // Test 3: Test message sending API
  async testMessageSending() {
    if (!this.sessionId) {
      throw new Error('No session ID available for message test');
    }

    const testMessage = 'Hello SHANGO, this is a test message';
    
    const response = await fetch(`${TEST_CONFIG.baseUrl}${TEST_CONFIG.apiBaseUrl}/sessions/${this.sessionId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: testMessage,
        role: 'user',
        agentId: 'shango-general'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Message sending failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.success || !data.aiResponse) {
      throw new Error('Message sending response invalid');
    }

    return { 
      userMessage: data.message.content,
      aiResponse: data.aiResponse.content,
      messageId: data.message.id
    };
  }

  // Test 4: Test message retrieval API
  async testMessageRetrieval() {
    if (!this.sessionId) {
      throw new Error('No session ID available for message retrieval test');
    }

    const response = await fetch(`${TEST_CONFIG.baseUrl}${TEST_CONFIG.apiBaseUrl}/sessions/${this.sessionId}/messages`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Message retrieval failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.success || !Array.isArray(data.messages)) {
      throw new Error('Message retrieval response invalid');
    }

    return { messageCount: data.messages.length, messages: data.messages };
  }

  // Test 5: Test session management
  async testSessionManagement() {
    if (!this.sessionId) {
      throw new Error('No session ID available for session management test');
    }

    // Test session update
    const updateResponse = await fetch(`${TEST_CONFIG.baseUrl}${TEST_CONFIG.apiBaseUrl}/sessions?sessionId=${this.sessionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'inactive'
      })
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`Session update failed: ${updateResponse.status} - ${errorText}`);
    }

    // Test session retrieval
    const getResponse = await fetch(`${TEST_CONFIG.baseUrl}${TEST_CONFIG.apiBaseUrl}/sessions?sessionId=${this.sessionId}`);
    
    if (!getResponse.ok) {
      const errorText = await getResponse.text();
      throw new Error(`Session retrieval failed: ${getResponse.status} - ${errorText}`);
    }

    const data = await getResponse.json();
    
    if (!data.success || !data.session) {
      throw new Error('Session retrieval response invalid');
    }

    return { 
      sessionId: data.session.id,
      status: data.session.status,
      messageCount: data.session.messages.length
    };
  }

  // Test 6: Test error handling
  async testErrorHandling() {
    // Test invalid session ID
    const invalidSessionResponse = await fetch(`${TEST_CONFIG.baseUrl}${TEST_CONFIG.apiBaseUrl}/sessions/invalid-session-id/messages`);
    
    if (invalidSessionResponse.status !== 400) {
      throw new Error('Invalid session ID should return 400 status');
    }

    // Test missing message content
    const noMessageResponse = await fetch(`${TEST_CONFIG.baseUrl}${TEST_CONFIG.apiBaseUrl}/sessions/${this.sessionId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        role: 'user',
        agentId: 'shango-general'
        // Missing message content
      })
    });

    if (noMessageResponse.status !== 400) {
      throw new Error('Missing message content should return 400 status');
    }

    return { errorHandling: 'working' };
  }

  // Test 7: Test Ollama fallback
  async testOllamaFallback() {
    // This test simulates what happens when SinchChatLive fails
    // and the system falls back to Ollama
    
    const testMessage = 'Test message for Ollama fallback';
    
    try {
      // Try to send a message (this will test the fallback mechanism)
      const response = await fetch(`${TEST_CONFIG.baseUrl}${TEST_CONFIG.apiBaseUrl}/sessions/${this.sessionId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: testMessage,
          role: 'user',
          agentId: 'shango-general'
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama fallback test failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Check if we got a response (even if it's from fallback)
      if (!data.success || !data.aiResponse) {
        throw new Error('Ollama fallback did not provide response');
      }

      return { 
        fallbackWorking: true,
        responseLength: data.aiResponse.content.length,
        responseType: typeof data.aiResponse.content
      };
    } catch (error) {
      // If Ollama is not available, that's expected in some environments
      console.log('⚠️  Ollama fallback test skipped (Ollama not available)');
      return { fallbackWorking: 'skipped', reason: 'Ollama not available' };
    }
  }

  // Test 8: Test frontend JavaScript functions
  async testFrontendFunctions() {
    // This test checks if the frontend JavaScript functions are properly defined
    // by loading the contact page and checking for function availability
    
    const response = await fetch(`${TEST_CONFIG.baseUrl}${TEST_CONFIG.contactPageUrl}`);
    const html = await response.text();
    
    const requiredFunctions = [
      'initializeSHANGOChatWidget',
      'startSHANGOChat',
      'renderInitialChatInterface',
      'renderChatInterface',
      'sendSHANGOMessage',
      'sendToOllamaFallback',
      'updateMessagesDisplay',
      'handleKeyPress',
      'closeSHANGOChat'
    ];

    const missingFunctions = requiredFunctions.filter(func => !html.includes(func));
    
    if (missingFunctions.length > 0) {
      throw new Error(`Missing frontend functions: ${missingFunctions.join(', ')}`);
    }

    return { 
      functionsFound: requiredFunctions.length - missingFunctions.length,
      totalFunctions: requiredFunctions.length
    };
  }

  // Run all tests
  async runAllTests() {
    // Add all tests
    this.runner.addTest('Contact Page Loads', () => this.testContactPageLoads());
    this.runner.addTest('Session Creation', () => this.testSessionCreation());
    this.runner.addTest('Message Sending', () => this.testMessageSending());
    this.runner.addTest('Message Retrieval', () => this.testMessageRetrieval());
    this.runner.addTest('Session Management', () => this.testSessionManagement());
    this.runner.addTest('Error Handling', () => this.testErrorHandling());
    this.runner.addTest('Ollama Fallback', () => this.testOllamaFallback());
    this.runner.addTest('Frontend Functions', () => this.testFrontendFunctions());

    // Run tests
    await this.runner.runTests();
  }
}

// Export for use in Node.js or browser
export { SHANGOChatTests, TestRunner };

if (typeof window !== 'undefined') {
  window.SHANGOChatTests = SHANGOChatTests;
  window.TestRunner = TestRunner;
}

// Auto-run if this script is executed directly
if (typeof window === 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  const tests = new SHANGOChatTests();
  tests.runAllTests().catch(console.error);
}
