#!/usr/bin/env node

/**
 * TETRIX Unit Testing Utilities
 * 
 * This module provides utility functions for unit testing across
 * the TETRIX cross-platform management system.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test data generators
export const TestData = {
  // Voice API test data
  voiceCall: {
    valid: {
      from: '+1234567890',
      to: '+0987654321',
      webhookUrl: 'https://tetrixcorp.com/api/voice/webhook',
      recordCall: true,
      transcriptionEnabled: true,
      language: 'en-US',
      timeout: 30,
      maxDuration: 300
    },
    invalid: {
      from: 'invalid-phone',
      to: '+0987654321'
    },
    missingFields: {
      to: '+0987654321'
      // Missing 'from' field
    }
  },

  // Transcription test data
  transcription: {
    valid: {
      sessionId: 'test_session_123',
      audioUrl: 'https://example.com/test-audio.mp3',
      language: 'en-US',
      format: 'mp3'
    },
    invalid: {
      sessionId: 'test_session_123',
      audioUrl: 'invalid-url'
    },
    missingFields: {
      sessionId: 'test_session_123'
      // Missing audioUrl
    }
  },

  // AI Response test data
  aiResponse: {
    valid: {
      transcription: 'Hello, I need help with my account',
      sessionId: 'test_session_123',
      context: 'customer_support'
    },
    testCases: [
      'I need technical support',
      'What are your business hours?',
      'How do I cancel my subscription?',
      'I want to upgrade my plan',
      'I have a billing question',
      'Can you help me with my account?'
    ]
  },

  // TeXML test data
  texml: {
    valid: {
      message: 'Hello! This is a test TeXML response.',
      voice: 'female',
      language: 'en-US'
    },
    custom: {
      message: 'Custom test message for TeXML',
      voice: 'male',
      language: 'en-GB'
    }
  },

  // Session management test data
  session: {
    valid: {
      sessionId: 'test_session_123',
      userId: 'user_456',
      status: 'active',
      createdAt: new Date().toISOString()
    },
    invalid: {
      sessionId: 'invalid-session-id'
    }
  }
};

// Mock API responses
export const MockResponses = {
  // Voice API responses
  voice: {
    initiate: {
      success: {
        status: 200,
        data: {
          callId: 'call_123',
          status: 'initiated',
          sessionId: 'session_456'
        }
      },
      error: {
        status: 400,
        error: 'Invalid phone number format'
      }
    },
    
    transcribe: {
      success: {
        status: 200,
        data: {
          transcription: 'Hello, I need help with my account',
          confidence: 0.95,
          language: 'en-US',
          timestamp: new Date().toISOString()
        }
      },
      error: {
        status: 400,
        error: 'Audio URL is required'
      }
    },

    aiResponse: {
      success: {
        status: 200,
        data: {
          input: 'Hello, I need help with my account',
          response: 'I\'d be happy to help you with your account. What specific assistance do you need?',
          confidence: 0.92,
          timestamp: new Date().toISOString()
        }
      },
      error: {
        status: 400,
        error: 'Transcription text is required'
      }
    }
  },

  // Health check responses
  health: {
    voice: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        telnyx: 'connected',
        deepgram: 'connected',
        ai: 'connected'
      }
    },
    
    transcription: {
      status: 'healthy',
      service: 'deepgram-stt',
      timestamp: new Date().toISOString()
    }
  }
};

// Test assertion helpers
export const Assertions = {
  // HTTP response assertions
  expectStatus: (response, expectedStatus) => {
    if (response.status !== expectedStatus) {
      throw new Error(`Expected status ${expectedStatus}, got ${response.status}`);
    }
  },

  expectJson: (response) => {
    try {
      return JSON.parse(response.body);
    } catch (error) {
      throw new Error(`Invalid JSON response: ${error.message}`);
    }
  },

  expectField: (data, field, expectedValue) => {
    if (data[field] !== expectedValue) {
      throw new Error(`Expected ${field} to be ${expectedValue}, got ${data[field]}`);
    }
  },

  expectArray: (data, field) => {
    if (!Array.isArray(data[field])) {
      throw new Error(`Expected ${field} to be an array`);
    }
  },

  expectString: (data, field) => {
    if (typeof data[field] !== 'string') {
      throw new Error(`Expected ${field} to be a string`);
    }
  },

  expectNumber: (data, field) => {
    if (typeof data[field] !== 'number') {
      throw new Error(`Expected ${field} to be a number`);
    }
  },

  expectBoolean: (data, field) => {
    if (typeof data[field] !== 'boolean') {
      throw new Error(`Expected ${field} to be a boolean`);
    }
  },

  expectDefined: (data, field) => {
    if (data[field] === undefined) {
      throw new Error(`Expected ${field} to be defined`);
    }
  },

  expectNotEmpty: (data, field) => {
    if (!data[field] || data[field].length === 0) {
      throw new Error(`Expected ${field} to not be empty`);
    }
  }
};

// Test environment helpers
export const TestEnvironment = {
  // Get test configuration
  getConfig: () => {
    const configFile = join(__dirname, '..', 'tests', 'config', 'test-config.json');
    if (existsSync(configFile)) {
      return JSON.parse(readFileSync(configFile, 'utf8'));
    }
    return {
      baseUrl: 'http://localhost:3000',
      timeout: 30000,
      retries: 2,
      parallel: true
    };
  },

  // Set up test environment
  setup: async () => {
    console.log('🔧 Setting up test environment...');
    
    // Create test directories
    const testDirs = [
      'tests/unit',
      'tests/integration',
      'tests/functional',
      'tests/e2e',
      'test-results',
      'test-results/coverage'
    ];
    
    testDirs.forEach(dir => {
      const fullPath = join(__dirname, '..', dir);
      if (!existsSync(fullPath)) {
        require('child_process').execSync(`mkdir -p ${fullPath}`);
      }
    });
    
    console.log('✅ Test environment setup complete');
  },

  // Clean up test environment
  cleanup: async () => {
    console.log('🧹 Cleaning up test environment...');
    
    // Remove test artifacts
    const artifacts = [
      'test-results/screenshots',
      'test-results/videos',
      'test-results/traces'
    ];
    
    artifacts.forEach(artifact => {
      const fullPath = join(__dirname, '..', artifact);
      if (existsSync(fullPath)) {
        require('child_process').execSync(`rm -rf ${fullPath}`);
      }
    });
    
    console.log('✅ Test environment cleanup complete');
  }
};

// Test data generators
export const DataGenerators = {
  // Generate random phone numbers
  generatePhoneNumber: (countryCode = 'US') => {
    const formats = {
      US: '+1{area}{exchange}{number}',
      UK: '+44{area}{number}',
      CA: '+1{area}{exchange}{number}'
    };
    
    const format = formats[countryCode] || formats.US;
    const area = Math.floor(Math.random() * 900) + 100;
    const exchange = Math.floor(Math.random() * 900) + 100;
    const number = Math.floor(Math.random() * 9000) + 1000;
    
    return format
      .replace('{area}', area)
      .replace('{exchange}', exchange)
      .replace('{number}', number);
  },

  // Generate random session IDs
  generateSessionId: (prefix = 'test') => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${timestamp}_${random}`;
  },

  // Generate random audio URLs
  generateAudioUrl: (format = 'mp3') => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `https://example.com/audio/${timestamp}_${random}.${format}`;
  },

  // Generate test transcriptions
  generateTranscription: (length = 'short') => {
    const transcriptions = {
      short: [
        'Hello, I need help',
        'What are your hours?',
        'I want to cancel',
        'How do I upgrade?'
      ],
      medium: [
        'Hello, I need help with my account. I can\'t log in.',
        'What are your business hours? I need to call during the day.',
        'I want to cancel my subscription. How do I do that?',
        'How do I upgrade my plan? I need more features.'
      ],
      long: [
        'Hello, I need help with my account. I\'ve been trying to log in for the past hour but I keep getting an error message. I\'ve tried resetting my password but I haven\'t received the email yet.',
        'What are your business hours? I need to call during the day because I work nights and I can only call during business hours. I also need to know if you\'re open on weekends.',
        'I want to cancel my subscription because I\'m not using the service anymore. I signed up for the trial but I haven\'t been using it. How do I cancel and will I get a refund?',
        'How do I upgrade my plan? I need more features for my business. I\'m currently on the basic plan but I need the advanced features. What\'s the difference between the plans?'
      ]
    };
    
    const options = transcriptions[length] || transcriptions.short;
    return options[Math.floor(Math.random() * options.length)];
  }
};

// Test result formatters
export const Formatters = {
  // Format test results for console output
  formatConsole: (results) => {
    const { total, passed, failed, skipped } = results;
    const passRate = ((passed / total) * 100).toFixed(1);
    
    return `
📊 Test Results Summary:
   Total: ${total}
   ✅ Passed: ${passed}
   ❌ Failed: ${failed}
   ⏭️  Skipped: ${skipped}
   📈 Pass Rate: ${passRate}%
`;
  },

  // Format test results for HTML report
  formatHTML: (results) => {
    const { total, passed, failed, skipped } = results;
    const passRate = ((passed / total) * 100).toFixed(1);
    
    return `
<div class="test-summary">
  <h2>Test Results Summary</h2>
  <div class="metrics">
    <div class="metric">
      <span class="label">Total:</span>
      <span class="value">${total}</span>
    </div>
    <div class="metric success">
      <span class="label">Passed:</span>
      <span class="value">${passed}</span>
    </div>
    <div class="metric error">
      <span class="label">Failed:</span>
      <span class="value">${failed}</span>
    </div>
    <div class="metric warning">
      <span class="label">Skipped:</span>
      <span class="value">${skipped}</span>
    </div>
    <div class="metric">
      <span class="label">Pass Rate:</span>
      <span class="value">${passRate}%</span>
    </div>
  </div>
</div>
`;
  },

  // Format test results for JSON
  formatJSON: (results) => {
    return JSON.stringify(results, null, 2);
  }
};

// Export all utilities
export default {
  TestData,
  MockResponses,
  Assertions,
  TestEnvironment,
  DataGenerators,
  Formatters
};
