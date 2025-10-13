// Test Environment Configuration
// This file sets up environment variables for testing

const fs = require('fs');
const path = require('path');

// Test environment variables
const testEnvVars = {
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

// Function to set environment variables
function setTestEnvironment() {
  console.log('Setting up test environment variables...');
  
  // Set each environment variable
  Object.entries(testEnvVars).forEach(([key, value]) => {
    process.env[key] = value;
    console.log(`Set ${key}=${value}`);
  });
  
  console.log('Test environment variables set successfully');
}

// Function to create .env file for testing
function createTestEnvFile() {
  const envContent = Object.entries(testEnvVars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  const envPath = path.join(__dirname, '.env.test');
  
  try {
    fs.writeFileSync(envPath, envContent);
    console.log(`Test environment file created at: ${envPath}`);
  } catch (error) {
    console.error('Failed to create test environment file:', error);
  }
}

// Function to load environment from file
function loadTestEnvironment() {
  const envPath = path.join(__dirname, '.env.test');
  
  try {
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envLines = envContent.split('\n');
      
      envLines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const [key, ...valueParts] = trimmedLine.split('=');
          const value = valueParts.join('=');
          if (key && value) {
            process.env[key] = value;
          }
        }
      });
      
      console.log('Test environment loaded from file');
    } else {
      console.log('No test environment file found, using defaults');
      setTestEnvironment();
    }
  } catch (error) {
    console.error('Failed to load test environment:', error);
    setTestEnvironment();
  }
}

// Export functions
module.exports = {
  setTestEnvironment,
  createTestEnvFile,
  loadTestEnvironment,
  testEnvVars
};

// Auto-setup if this file is run directly
if (require.main === module) {
  createTestEnvFile();
  setTestEnvironment();
}
