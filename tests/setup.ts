// Test setup file for TETRIX 2FA and dual invoice delivery tests

import { vi } from 'vitest';

// Global test setup
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key';
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mock_secret';
  process.env.MAILGUN_API_KEY = 'key_mock_mailgun';
  process.env.MAILGUN_DOMAIN = 'mg.test.com';
  process.env.***REMOVED*** = 'KEY_mock_telnyx';
  process.env.TELNYX_PROFILE_ID = 'test-profile-id';
  process.env.ESIM_API_BASE_URL = 'https://api.test-esim.com';
  process.env.ESIM_API_KEY = 'esim_mock_key';
  process.env.INTERNAL_SUPPORT_EMAIL = 'support@test.com';
  process.env.WEBHOOK_BASE_URL = 'http://localhost:3000';
});

// Global test teardown
afterAll(() => {
  // Clean up any global resources
  vi.clearAllMocks();
});

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  // Suppress console.error and console.warn during tests unless explicitly needed
  // console.error = vi.fn();
  // console.warn = vi.fn();
});

afterEach(() => {
  // Restore console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global test utilities
declare global {
  namespace Vi {
    interface Matchers<R> {
      toBeValidInvoice(): R;
      toBeValidCustomer(): R;
      toBeValidESIMOrder(): R;
      toBeValid2FAResponse(): R;
    }
  }
}

// Custom Vitest matchers
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
  },

  toBeValid2FAResponse(received: any) {
    const pass = received && 
      typeof received.success === 'boolean' &&
      (received.verificationId || received.verified !== undefined);
    
    return {
      message: () => `expected ${received} to be a valid 2FA response`,
      pass
    };
  }
});

// Mock fetch globally
global.fetch = vi.fn();

// Mock Stripe globally
vi.mock('stripe', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      customers: {
        retrieve: vi.fn(),
        update: vi.fn(),
        create: vi.fn()
      },
      invoices: {
        retrieve: vi.fn(),
        create: vi.fn()
      },
      subscriptions: {
        list: vi.fn(),
        cancel: vi.fn(),
        create: vi.fn()
      },
      webhooks: {
        constructEvent: vi.fn()
      }
    }))
  };
});

// Mock notification service globally
vi.mock('../../src/services/notificationService', () => ({
  notificationService: {
    sendNotification: vi.fn(),
    sendBulkNotifications: vi.fn()
  }
}));

// Mock eSIM integration service globally
vi.mock('../../src/services/esimIntegrationService', () => ({
  esimIntegrationService: {
    shouldOrderESIM: vi.fn(),
    createESIMOrder: vi.fn(),
    getActivationDetails: vi.fn(),
    sendActivationDetails: vi.fn()
  }
}));

// Mock enterprise 2FA service globally
vi.mock('../../src/services/enterprise2FAService', () => ({
  enterprise2FAService: {
    initiateVerification: vi.fn(),
    verifyCode: vi.fn(),
    getVerificationStatus: vi.fn(),
    getAuditLogs: vi.fn(),
    blockPhoneNumber: vi.fn()
  }
}));

export {};
