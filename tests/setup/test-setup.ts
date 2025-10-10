// Test Setup and Configuration
import { test as base, expect } from '@playwright/test';

// Test data and utilities
export const testData = {
  validPhoneNumbers: [
    '+1234567890',
    '+1987654321',
    '+15551234567'
  ],
  invalidPhoneNumbers: [
    'invalid-phone',
    '1234567890',
    '+123',
    'abc-def-ghij'
  ],
  testAudioUrls: [
    'https://example.com/test-audio.mp3',
    'https://example.com/sample.wav',
    'https://example.com/voice.m4a'
  ],
  testTranscriptions: [
    'Hello, I need help with my account',
    'What are your business hours?',
    'I want to cancel my subscription',
    'How do I upgrade my plan?',
    'I need technical support'
  ],
  testSessionIds: [
    'test_session_001',
    'test_session_002',
    'test_session_003'
  ]
};

// Mock data generators
export const mockData = {
  generateSessionId: () => `test_session_${Date.now()}`,
  generateCallId: () => `test_call_${Date.now()}`,
  generateTranscription: () => testData.testTranscriptions[Math.floor(Math.random() * testData.testTranscriptions.length)],
  generatePhoneNumber: () => testData.validPhoneNumbers[Math.floor(Math.random() * testData.validPhoneNumbers.length)]
};

// API response mocks
export const mockResponses = {
  successfulVoiceCall: {
    success: true,
    sessionId: 'mock_session_123',
    callId: 'mock_call_456',
    phoneNumber: '+1234567890',
    status: 'initiated',
    startTime: new Date().toISOString(),
    message: 'Voice call initiated successfully'
  },
  successfulTranscription: {
    success: true,
    transcription: {
      text: 'Hello, this is a test transcription',
      confidence: 0.95,
      language: 'en-US',
      timestamp: new Date().toISOString()
    },
    message: 'Transcription completed successfully'
  },
  successfulAIResponse: {
    success: true,
    data: {
      input: 'Hello, I need help',
      response: 'Hello! I\'m SHANGO, your AI Super Agent. How can I help you today?',
      confidence: 0.92,
      agent: 'SHANGO General',
      timestamp: new Date().toISOString()
    }
  },
  texmlResponse: `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="female" language="en-US">Hello! This is SHANGO, your AI Super Agent.</Say>
  <Gather input="speech,dtmf" numDigits="1" timeout="10" action="https://tetrixcorp.com/api/voice/texml" method="POST">
    <Say voice="female" language="en-US">Please tell me how I can help you today, or press any key to continue.</Say>
  </Gather>
</Response>`
};

// Test utilities
export const testUtils = {
  waitForApiResponse: async (request: any, url: string, maxRetries = 5, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await request.get(url);
        if (response.status() === 200) {
          return response;
        }
      } catch (error) {
        // Continue retrying
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    throw new Error(`API endpoint ${url} did not respond after ${maxRetries} retries`);
  },

  validatePhoneNumber: (phoneNumber: string) => {
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
  },

  validateAudioUrl: (url: string) => {
    const urlRegex = /^https?:\/\/.+/;
    return urlRegex.test(url);
  },

  generateRandomString: (length: number) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  sleep: (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
};

// Custom test fixtures
export const test = base.extend<{
  mockApiResponses: typeof mockResponses;
  testData: typeof testData;
  testUtils: typeof testUtils;
}>({
  mockApiResponses: async ({}, use) => {
    await use(mockResponses);
  },
  testData: async ({}, use) => {
    await use(testData);
  },
  testUtils: async ({}, use) => {
    await use(testUtils);
  }
});

// Global test configuration
export const globalTestConfig = {
  baseUrl: process.env.BASE_URL || 'http://localhost:4321',
  apiTimeout: 30000,
  uiTimeout: 10000,
  retryCount: 3,
  parallel: true
};

// Test environment setup
export const setupTestEnvironment = async () => {
  // Set up test environment variables
  process.env.NODE_ENV = 'test';
  process.env.TELNYX_API_KEY = 'test_telnyx_key';
  process.env.DEEPGRAM_API_KEY = 'test_deepgram_key';
  process.env.WEBHOOK_BASE_URL = 'https://tetrixcorp.com';
  
  console.log('Test environment configured');
};

// Cleanup after tests
export const cleanupTestEnvironment = async () => {
  // Clean up any test data or resources
  console.log('Test environment cleaned up');
};

// Export everything
export { expect };
export default test;
