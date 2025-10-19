// Test utilities and helpers for TETRIX dual invoice delivery tests

import Stripe from 'stripe';
import type { ServiceType, ServiceDetails } from '../../src/services/enhancedInvoiceService';

// Mock Stripe objects
export const createMockStripeInvoice = (overrides: Partial<Stripe.Invoice> = {}): Stripe.Invoice => ({
  id: 'in_test_123',
  object: 'invoice',
  amount_due: 15000, // $150.00
  amount_paid: 15000,
  amount_remaining: 0,
  billing_reason: 'subscription_create',
  charge: 'ch_test_123',
  collection_method: 'charge_automatically',
  created: Math.floor(Date.now() / 1000),
  currency: 'usd',
  customer: 'cus_test_123',
  customer_email: 'test@example.com',
  customer_name: 'Test Customer',
  description: 'Test invoice',
  due_date: null,
  ending_balance: 0,
  hosted_invoice_url: 'https://invoice.stripe.com/i/acct_test/inv_test_123',
  invoice_pdf: 'https://pay.stripe.com/invoice/acct_test/inv_test_123.pdf',
  last_finalization_invoice: null,
  last_payment_intent: 'pi_test_123',
  lines: {
    object: 'list',
    data: [],
    has_more: false,
    total_count: 0,
    url: '/v1/invoices/in_test_123/lines'
  },
  livemode: false,
  metadata: {
    service_type: 'healthcare',
    plan_tier: 'individual',
    trial_conversion: 'false'
  },
  next_payment_attempt: null,
  number: 'TEST-001',
  paid: true,
  payment_intent: 'pi_test_123',
  period_end: Math.floor(Date.now() / 1000) + 2592000, // 30 days
  period_start: Math.floor(Date.now() / 1000),
  receipt_number: null,
  starting_balance: 0,
  statement_descriptor: null,
  status: 'paid',
  status_transitions: {
    finalized_at: Math.floor(Date.now() / 1000),
    marked_uncollectible_at: null,
    paid_at: Math.floor(Date.now() / 1000),
    voided_at: null
  },
  subscription: 'sub_test_123',
  subtotal: 15000,
  tax: null,
  total: 15000,
  webhooks_delivered_at: Math.floor(Date.now() / 1000),
  ...overrides
});

export const createMockStripeCustomer = (overrides: Partial<Stripe.Customer> = {}): Stripe.Customer => ({
  id: 'cus_test_123',
  object: 'customer',
  address: null,
  balance: 0,
  created: Math.floor(Date.now() / 1000),
  currency: 'usd',
  default_source: null,
  delinquent: false,
  description: 'Test customer',
  discount: null,
  email: 'test@example.com',
  invoice_prefix: 'TEST',
  invoice_settings: {
    custom_fields: null,
    default_payment_method: null,
    footer: null
  },
  livemode: false,
  metadata: {
    businessName: 'Test Business',
    phoneNumber: '+1234567890'
  },
  name: 'Test Customer',
  next_invoice_sequence: 1,
  phone: '+1234567890',
  preferred_locales: ['en'],
  shipping: null,
  tax_exempt: 'none',
  ...overrides
});

export const createMockStripeSubscription = (overrides: Partial<Stripe.Subscription> = {}): Stripe.Subscription => ({
  id: 'sub_test_123',
  object: 'subscription',
  application: null,
  application_fee_percent: null,
  automatic_tax: {
    enabled: false
  },
  billing_cycle_anchor: Math.floor(Date.now() / 1000),
  cancel_at: null,
  cancel_at_period_end: false,
  canceled_at: null,
  collection_method: 'charge_automatically',
  created: Math.floor(Date.now() / 1000),
  currency: 'usd',
  current_period_end: Math.floor(Date.now() / 1000) + 2592000, // 30 days
  current_period_start: Math.floor(Date.now() / 1000),
  customer: 'cus_test_123',
  default_payment_method: 'pm_test_123',
  default_source: null,
  default_tax_rates: [],
  description: null,
  discount: null,
  ended_at: null,
  items: {
    object: 'list',
    data: [],
    has_more: false,
    total_count: 0,
    url: '/v1/subscription_items'
  },
  latest_invoice: 'in_test_123',
  livemode: false,
  metadata: {
    service_type: 'healthcare',
    plan_tier: 'individual'
  },
  next_pending_invoice_item_invoice: null,
  pause_collection: null,
  pending_setup_intent: null,
  pending_update: null,
  schedule: null,
  start_date: Math.floor(Date.now() / 1000),
  status: 'active',
  tax_percent: null,
  trial_end: null,
  trial_start: null,
  ...overrides
});

// Mock service details
export const createMockServiceDetails = (overrides: Partial<ServiceDetails> = {}): ServiceDetails => ({
  serviceType: 'healthcare',
  tier: 'individual',
  planName: 'Individual Practice',
  basePrice: 150,
  period: 'per provider/month',
  description: '1-4 Providers',
  features: [
    '2,000 AI voice sessions/month',
    'Basic benefit verification',
    'Appointment scheduling',
    'Patient communication',
    'Basic EHR integration',
    'HIPAA compliance',
    'Email support'
  ],
  isTrialConversion: false,
  requiresESIM: false,
  ...overrides
});

// Mock notification responses
export const createMockNotificationResponse = (overrides: any = {}) => ({
  success: true,
  messageId: 'msg_test_123',
  provider: 'mailgun',
  channel: 'email',
  timestamp: new Date().toISOString(),
  ...overrides
});

// Mock eSIM order result
export const createMockESIMOrderResult = (overrides: any = {}) => ({
  success: true,
  orderId: 'esim_test_123',
  trackingId: 'track_test_123',
  activationCodes: ['ACT123456'],
  qrCodes: ['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='],
  downloadUrls: ['https://esim.example.com/download/esim_test_123'],
  estimatedDelivery: new Date(Date.now() + 86400000), // 24 hours
  ...overrides
});

// Test data generators
export const generateTestInvoices = (count: number): Stripe.Invoice[] => {
  return Array.from({ length: count }, (_, index) => 
    createMockStripeInvoice({
      id: `in_test_${index + 1}`,
      amount_due: (index + 1) * 10000, // $100, $200, $300, etc.
      amount_paid: (index + 1) * 10000,
      total: (index + 1) * 10000,
      metadata: {
        service_type: ['healthcare', 'legal', 'business'][index % 3],
        plan_tier: ['individual', 'solo', 'starter'][index % 3],
        trial_conversion: index % 2 === 0 ? 'true' : 'false'
      }
    })
  );
};

export const generateTestCustomers = (count: number): Stripe.Customer[] => {
  return Array.from({ length: count }, (_, index) => 
    createMockStripeCustomer({
      id: `cus_test_${index + 1}`,
      email: `test${index + 1}@example.com`,
      name: `Test Customer ${index + 1}`,
      phone: `+123456789${index}`,
      metadata: {
        businessName: `Test Business ${index + 1}`,
        phoneNumber: `+123456789${index}`
      }
    })
  );
};

// Service type test data
export const SERVICE_TEST_DATA = {
  healthcare: {
    individual: createMockServiceDetails({
      serviceType: 'healthcare',
      tier: 'individual',
      planName: 'Individual Practice',
      basePrice: 150,
      requiresESIM: false
    }),
    professional: createMockServiceDetails({
      serviceType: 'healthcare',
      tier: 'professional',
      planName: 'Professional',
      basePrice: 500,
      perUnitPrice: 75,
      requiresESIM: true
    })
  },
  legal: {
    solo: createMockServiceDetails({
      serviceType: 'legal',
      tier: 'solo',
      planName: 'Solo Practice',
      basePrice: 150,
      requiresESIM: false
    }),
    midsize: createMockServiceDetails({
      serviceType: 'legal',
      tier: 'midsize',
      planName: 'Mid-Size Firm',
      basePrice: 1000,
      perUnitPrice: 100,
      requiresESIM: true
    })
  },
  business: {
    starter: createMockServiceDetails({
      serviceType: 'business',
      tier: 'starter',
      planName: 'Starter',
      basePrice: 99,
      requiresESIM: true
    }),
    enterprise: createMockServiceDetails({
      serviceType: 'business',
      tier: 'enterprise',
      planName: 'Enterprise',
      basePrice: 799,
      requiresESIM: true
    })
  }
};

// Error scenarios
export const ERROR_SCENARIOS = {
  invalidInvoice: new Error('Invalid invoice data'),
  notificationFailure: new Error('Notification service unavailable'),
  esimOrderingFailure: new Error('eSIM ordering service error'),
  webhookSignatureError: new Error('Invalid webhook signature'),
  customerNotFound: new Error('Customer not found'),
  serviceAnalysisError: new Error('Service analysis failed')
};

// Test assertions helpers
export const assertInvoiceDelivery = (result: any) => {
  expect(result).toBeDefined();
  expect(result.customerDelivery).toBeDefined();
  expect(result.customerDelivery.email).toBeDefined();
  expect(result.internalDelivery).toBeDefined();
  expect(result.serviceDetails).toBeDefined();
};

export const assertNotificationSent = (notification: any) => {
  expect(notification.success).toBe(true);
  expect(notification.messageId).toBeDefined();
  expect(notification.timestamp).toBeDefined();
};

export const assertESIMOrdered = (esimResult: any) => {
  expect(esimResult.success).toBe(true);
  expect(esimResult.orderId).toBeDefined();
  expect(esimResult.activationCodes).toBeDefined();
};

// Mock functions
export const createMockNotificationService = () => ({
  sendNotification: jest.fn().mockResolvedValue(createMockNotificationResponse()),
  sendBulkNotifications: jest.fn().mockResolvedValue([createMockNotificationResponse()])
});

export const createMockESIMService = () => ({
  shouldOrderESIM: jest.fn().mockReturnValue(true),
  createESIMOrder: jest.fn().mockResolvedValue(createMockESIMOrderResult()),
  getActivationDetails: jest.fn().mockResolvedValue({
    orderId: 'esim_test_123',
    activationCode: 'ACT123456',
    qrCode: 'data:image/png;base64,test',
    downloadUrl: 'https://esim.example.com/download/test',
    deviceInfo: {},
    expiresAt: new Date(Date.now() + 86400000)
  }),
  sendActivationDetails: jest.fn().mockResolvedValue({ email: true, sms: true })
});

export const createMockStripeService = () => ({
  customers: {
    retrieve: jest.fn().mockResolvedValue(createMockStripeCustomer()),
    update: jest.fn().mockResolvedValue(createMockStripeCustomer())
  },
  invoices: {
    retrieve: jest.fn().mockResolvedValue(createMockStripeInvoice())
  },
  subscriptions: {
    list: jest.fn().mockResolvedValue({ data: [createMockStripeSubscription()] }),
    cancel: jest.fn().mockResolvedValue(createMockStripeSubscription())
  }
});
