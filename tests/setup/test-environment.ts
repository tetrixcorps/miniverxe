// Test environment setup
import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.TETRIX_API_URL = 'http://localhost:4321';
process.env.JOROMI_URL = 'http://localhost:3000';
process.env.CODE_ACADEMY_URL = 'http://localhost:3001';

// Mock environment variables for testing
export const testEnv = {
  NODE_ENV: 'test',
  TETRIX_API_URL: 'http://localhost:4321',
  JOROMI_URL: 'http://localhost:3000',
  CODE_ACADEMY_URL: 'http://localhost:3001',
  TETRIX_2FA_API_KEY: 'test-2fa-api-key',
  TETRIX_2FA_API_URL: 'http://localhost:4321/api/v2/2fa',
  WEBHOOK_BASE_URL: 'http://localhost:4321',
  CROSS_PLATFORM_SESSION_SECRET: 'test-session-secret'
};

// Export test configuration
export const testConfig = {
  timeout: 10000,
  retries: 3,
  parallel: true,
  coverage: {
    threshold: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    }
  }
};