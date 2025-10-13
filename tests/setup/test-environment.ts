// Test Environment Setup for Voice API
// Configures environment variables and test data

import { test as base, expect } from '@playwright/test';

// Test environment configuration
const testEnvironment = {
  // Application Configuration
  NODE_ENV: 'test',
  BASE_URL: 'http://localhost:4321',
  HOST: '0.0.0.0',
  PORT: '4321',

  // Voice API Configuration
  ***REMOVED***: 'test_telnyx_key',
  TELNYX_PHONE_NUMBER: '+1234567890',
  TELNYX_API_URL: 'https://api.telnyx.com/v2',

  // Deepgram STT Configuration
  DEEPGRAM_API_KEY: 'eb197abcaaf966b07d11f14ad1ec08e27711e51b',
  DEEPGRAM_API_URL: 'https://api.deepgram.com/v1',

  // Webhook Configuration
  WEBHOOK_BASE_URL: 'https://tetrixcorp.com',

  // Cross-Platform Integration
  CROSS_PLATFORM_SESSION_SECRET: 'test_cross_platform_secret_key_12345',
  TETRIX_API_URL: 'http://localhost:4321',
  JOROMI_DOMAIN: 'https://joromi.ai',
  TETRIX_DOMAIN: 'https://tetrixcorp.com',

  // SinchChatLive Configuration
  SINCH_API_KEY: 'test_sinch_api_key',
  SINCH_SERVICE_PLAN_ID: 'test_service_plan_id',
  SINCH_CONVERSATION_PROJECT_ID: 'test_conversation_project_id',
  SINCH_VIRTUAL_NUMBER: '+1234567890',
  SINCH_BACKUP_NUMBER_1: '+1987654321',
  SINCH_BACKUP_NUMBER_2: '+15551234567',
  SINCH_BACKUP_NUMBER_3: '+15559876543',
  NEXT_PUBLIC_SINCH_API_KEY: 'test_public_sinch_key',
  NEXT_PUBLIC_SINCH_WIDGET_ID: 'test_widget_id',

  // SHANGO AI Configuration
  SHANGO_MAX_MESSAGES: '100',
  SHANGO_SESSION_TIMEOUT: '1800',
  SHANGO_DEFAULT_AGENT: 'SHANGO General',

  // Test Configuration
  TEST_PHONE_NUMBER: '+1234567890',
  TEST_USER_ID: 'test_user_123',
  TEST_CONVERSATION_ID: 'test_conversation_456',
  TEST_SESSION_ID: 'test_session_789',

  // Database Configuration (for testing)
  DATABASE_URL: 'postgresql://test:test@localhost:5432/voice_api_test',
  REDIS_URL: 'redis://localhost:6379/1',

  // Logging Configuration
  LOG_LEVEL: 'debug',
  ENABLE_DEBUG_LOGS: 'true',

  // Security Configuration
  JWT_SECRET: 'test_jwt_secret_key_12345',
  ENCRYPTION_KEY: 'test_encryption_key_12345',

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: '900000',
  RATE_LIMIT_MAX_REQUESTS: '100',

  // File Upload Configuration
  MAX_FILE_SIZE: '10485760',
  ALLOWED_AUDIO_TYPES: 'mp3,wav,m4a,ogg',

  // Monitoring Configuration
  ENABLE_METRICS: 'true',
  METRICS_PORT: '9090',

  // Feature Flags
  ENABLE_VOICE_CALLS: 'true',
  ENABLE_TRANSCRIPTION: 'true',
  ENABLE_AI_RESPONSES: 'true',
  ENABLE_CROSS_PLATFORM_SYNC: 'true',
  ENABLE_WEBHOOKS: 'true',
  ENABLE_DEMO_MODE: 'true'
};

// Function to set up test environment
export function setupTestEnvironment() {
  console.log('Setting up test environment...');
  
  // Set environment variables
  Object.entries(testEnvironment).forEach(([key, value]) => {
    process.env[key] = value;
  });
  
  console.log('Test environment configured with Deepgram API key');
  console.log(`Deepgram API Key: ${process.env.DEEPGRAM_API_KEY?.substring(0, 8)}...`);
  console.log(`Base URL: ${process.env.BASE_URL}`);
  console.log(`Test Phone Number: ${process.env.TEST_PHONE_NUMBER}`);
}

// Function to validate test environment
export function validateTestEnvironment() {
  const requiredVars = [
    'DEEPGRAM_API_KEY',
    'BASE_URL',
    'TEST_PHONE_NUMBER',
    '***REMOVED***',
    'WEBHOOK_BASE_URL'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
  
  console.log('Test environment validation passed');
}

// Test data for Deepgram integration
export const deepgramTestData = {
  validAudioUrls: [
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
  supportedLanguages: [
    'en-US',
    'es-ES',
    'fr-FR',
    'de-DE',
    'pt-BR',
    'it-IT',
    'ja-JP',
    'ko-KR',
    'zh-CN',
    'ar-SA',
    'hi-IN',
    'ru-RU'
  ]
};

// Deepgram API test configuration
export const deepgramConfig = {
  model: 'nova-2',
  language: 'en-US',
  punctuate: true,
  profanity_filter: false,
  redact: ['pci', 'ssn'],
  diarize: true,
  multichannel: true,
  alternatives: 3,
  interim_results: true,
  endpointing: 300,
  vad_turnoff: 500,
  smart_format: true
};

// Test utilities for Deepgram integration
export const deepgramTestUtils = {
  validateApiKey: (apiKey: string) => {
    return apiKey && apiKey.length > 0 && apiKey.startsWith('eb');
  },
  
  validateAudioUrl: (url: string) => {
    const urlRegex = /^https?:\/\/.+/;
    return urlRegex.test(url);
  },
  
  generateTestTranscription: () => {
    const transcriptions = deepgramTestData.testTranscriptions;
    return transcriptions[Math.floor(Math.random() * transcriptions.length)];
  },
  
  createMockTranscriptionResponse: (text: string, confidence = 0.95) => {
    return {
      success: true,
      transcription: {
        text,
        confidence,
        language: 'en-US',
        timestamp: new Date().toISOString()
      },
      message: 'Transcription completed successfully'
    };
  }
};

// Custom test fixtures with environment setup
export const test = base.extend<{
  testEnvironment: typeof testEnvironment;
  deepgramTestData: typeof deepgramTestData;
  deepgramConfig: typeof deepgramConfig;
  deepgramTestUtils: typeof deepgramTestUtils;
}>({
  testEnvironment: async ({}, use) => {
    setupTestEnvironment();
    validateTestEnvironment();
    await use(testEnvironment);
  },
  deepgramTestData: async ({}, use) => {
    await use(deepgramTestData);
  },
  deepgramConfig: async ({}, use) => {
    await use(deepgramConfig);
  },
  deepgramTestUtils: async ({}, use) => {
    await use(deepgramTestUtils);
  }
});

// Global test setup
test.beforeAll(async () => {
  setupTestEnvironment();
  validateTestEnvironment();
});

// Export everything
export { expect };
export default test;
