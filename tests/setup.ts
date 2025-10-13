// Test setup file for TETRIX dual invoice delivery tests

import { jest } from '@jest/globals';

// Global test setup
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key';
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mock_secret';
  process.env.MAILGUN_API_KEY = 'key_mock_mailgun';
  process.env.MAILGUN_DOMAIN = 'mg.test.com';
  process.env.***REMOVED*** = 'KEY_mock_telnyx';
  process.env.ESIM_API_BASE_URL = 'https://api.test-esim.com';
  process.env.ESIM_API_KEY = 'esim_mock_key';
  process.env.INTERNAL_SUPPORT_EMAIL = 'support@test.com';
});

// Global test teardown
afterAll(() => {
  // Clean up any global resources
  jest.clearAllMocks();
});

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  // Suppress console.error and console.warn during tests unless explicitly needed
  // console.error = jest.fn();
  // console.warn = jest.fn();
});

afterEach(() => {
  // Restore console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidInvoice(): R;
      toBeValidCustomer(): R;
      toBeValidESIMOrder(): R;
    }
  }
}

// Custom Jest matchers
expect.extend({
  toBeValidInvoice(received: any) {
    const pass = received && 
      typeof received.id === 'string' &&
      typeof received.amount_paid === 'number' &&
      typeof received.customer === 'string' &&
      received.status === 'paid';
    
    return {
      message: () => `expected ${received} to be a valid invoice`,
      pass
    };
  },
  
  toBeValidCustomer(received: any) {
    const pass = received && 
      typeof received.id === 'string' &&
      typeof received.email === 'string' &&
      received.object === 'customer';
    
    return {
      message: () => `expected ${received} to be a valid customer`,
      pass
    };
  },
  
  toBeValidESIMOrder(received: any) {
    const pass = received && 
      received.success === true &&
      typeof received.orderId === 'string' &&
      Array.isArray(received.activationCodes);
    
    return {
      message: () => `expected ${received} to be a valid eSIM order`,
      pass
    };
  }
});

// Mock fetch globally
global.fetch = jest.fn();

// Mock Stripe globally
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

// Mock notification service globally
jest.mock('../../src/services/notificationService', () => ({
  notificationService: {
    sendNotification: jest.fn(),
    sendBulkNotifications: jest.fn()
  }
}));

// Mock eSIM integration service globally
jest.mock('../../src/services/esimIntegrationService', () => ({
  esimIntegrationService: {
    shouldOrderESIM: jest.fn(),
    createESIMOrder: jest.fn(),
    getActivationDetails: jest.fn(),
    sendActivationDetails: jest.fn()
  }
}));

export {};
