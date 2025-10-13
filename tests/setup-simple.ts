// Simple test setup for TETRIX 2FA tests
import { jest } from '@jest/globals';

// Global test setup
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.***REMOVED*** = 'KEY_mock_telnyx';
  process.env.TELNYX_PROFILE_ID = 'test-profile-id';
  process.env.MAILGUN_API_KEY = 'key_mock_mailgun';
  process.env.MAILGUN_DOMAIN = 'mg.test.com';
  process.env.ESIM_API_BASE_URL = 'https://api.test-esim.com';
  process.env.ESIM_API_KEY = 'esim_mock_key';
  process.env.INTERNAL_SUPPORT_EMAIL = 'support@test.com';
  process.env.WEBHOOK_BASE_URL = 'http://localhost:3000';
});

// Global test teardown
afterAll(() => {
  jest.clearAllMocks();
});

// Mock fetch globally
global.fetch = jest.fn();

// Mock the enterprise2FAService
jest.mock('../../src/services/enterprise2FAService', () => ({
  enterprise2FAService: {
    initiateVerification: jest.fn(),
    verifyCode: jest.fn(),
    getVerificationStatus: jest.fn(),
    getAuditLogs: jest.fn(),
    blockPhoneNumber: jest.fn()
  }
}));

// Mock the smart2faService
jest.mock('../../src/services/smart2faService', () => ({
  smart2FAService: {
    initiateVerification: jest.fn(),
    verifyCode: jest.fn(),
    getVerificationStatus: jest.fn()
  }
}));

// Mock the notification service
jest.mock('../../src/services/notificationService', () => ({
  notificationService: {
    sendNotification: jest.fn(),
    sendBulkNotifications: jest.fn()
  }
}));

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    customers: {
      retrieve: jest.fn(),
      update: jest.fn(),
      create: jest.fn()
    },
    invoices: {
      retrieve: jest.fn(),
      create: jest.fn()
    },
    subscriptions: {
      list: jest.fn(),
      cancel: jest.fn(),
      create: jest.fn()
    },
    webhooks: {
      constructEvent: jest.fn()
    }
  }));
});

export {};
