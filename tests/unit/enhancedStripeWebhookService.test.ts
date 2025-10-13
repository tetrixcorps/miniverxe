// Unit tests for Enhanced Stripe Webhook Service

import { enhancedStripeWebhookService } from '../../src/services/enhancedStripeWebhookService';
import { 
  createMockStripeInvoice, 
  createMockStripeCustomer, 
  createMockStripeSubscription,
  ERROR_SCENARIOS
} from '../utils/testHelpers';

// Mock dependencies
jest.mock('../../src/services/enhancedInvoiceService', () => ({
  enhancedInvoiceService: {
    handlePaymentSuccess: jest.fn()
  }
}));

jest.mock('stripe', () => {
  const mockStripeInstance = {
    webhooks: {
      constructEvent: jest.fn()
    },
    customers: {
      retrieve: jest.fn(),
      update: jest.fn()
    },
    invoices: {
      retrieve: jest.fn()
    },
    subscriptions: {
      list: jest.fn(),
      cancel: jest.fn()
    }
  };
  
  return jest.fn().mockImplementation(() => mockStripeInstance);
});

describe('Enhanced Stripe Webhook Service', () => {
  let mockInvoiceService: any;
  let mockStripe: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mocks
    mockInvoiceService = require('../../src/services/enhancedInvoiceService').enhancedInvoiceService;
    mockStripe = require('stripe');
    
    // Default mock implementations
    mockInvoiceService.handlePaymentSuccess.mockResolvedValue({
      customerDelivery: { email: { success: true } },
      internalDelivery: { success: true },
      serviceDetails: { serviceType: 'healthcare', tier: 'individual' }
    });
    
    // Configure Stripe mock
    const mockStripeInstance = new mockStripe();
    mockStripeInstance.customers.retrieve.mockResolvedValue(createMockStripeCustomer());
    mockStripeInstance.customers.update.mockResolvedValue(createMockStripeCustomer());
    mockStripeInstance.invoices.retrieve.mockResolvedValue(createMockStripeInvoice());
    mockStripeInstance.subscriptions.list.mockResolvedValue({ data: [] });
    mockStripeInstance.subscriptions.cancel.mockResolvedValue(createMockStripeSubscription());
    
    // Override the mock implementation
    mockStripe.mockImplementation(() => mockStripeInstance);
  });

  describe('handleWebhook', () => {
    it('should process invoice.payment_succeeded event successfully', async () => {
      // Arrange
      const invoice = createMockStripeInvoice();
      const event = {
        id: 'evt_test_123',
        type: 'invoice.payment_succeeded',
        data: { object: invoice },
        created: Math.floor(Date.now() / 1000),
        livemode: false
      };
      
      // Get the mock instance and configure it
      const mockStripeInstance = new mockStripe();
      mockStripeInstance.webhooks.constructEvent.mockReturnValue(event);
      mockStripeInstance.customers.retrieve.mockResolvedValue(createMockStripeCustomer());
      mockStripe.mockImplementation(() => mockStripeInstance);

      // Act
      const result = await enhancedStripeWebhookService.handleWebhook(
        JSON.stringify(event),
        'test_signature'
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.eventType).toBe('invoice.payment_succeeded');
      expect(result.invoiceId).toBe(invoice.id);
      expect(result.customerId).toBe(invoice.customer);
      expect(mockInvoiceService.handlePaymentSuccess).toHaveBeenCalledWith(invoice);
    });

    it('should process invoice.created event successfully', async () => {
      // Arrange
      const invoice = createMockStripeInvoice();
      const event = {
        id: 'evt_test_123',
        type: 'invoice.created',
        data: { object: invoice },
        created: Math.floor(Date.now() / 1000),
        livemode: false
      };
      
      mockStripe().webhooks.constructEvent.mockReturnValue(event);

      // Act
      const result = await enhancedStripeWebhookService.handleWebhook(
        JSON.stringify(event),
        'test_signature'
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.eventType).toBe('invoice.created');
      expect(result.invoiceId).toBe(invoice.id);
    });

    it('should process customer.subscription.created event successfully', async () => {
      // Arrange
      const subscription = createMockStripeSubscription();
      const event = {
        id: 'evt_test_123',
        type: 'customer.subscription.created',
        data: { object: subscription },
        created: Math.floor(Date.now() / 1000),
        livemode: false
      };
      
      mockStripe().webhooks.constructEvent.mockReturnValue(event);

      // Act
      const result = await enhancedStripeWebhookService.handleWebhook(
        JSON.stringify(event),
        'test_signature'
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.eventType).toBe('customer.subscription.created');
      expect(result.customerId).toBe(subscription.customer);
    });

    it('should process customer.subscription.updated event successfully', async () => {
      // Arrange
      const subscription = createMockStripeSubscription({ status: 'active' });
      const event = {
        id: 'evt_test_123',
        type: 'customer.subscription.updated',
        data: { object: subscription },
        created: Math.floor(Date.now() / 1000),
        livemode: false
      };
      
      mockStripe().webhooks.constructEvent.mockReturnValue(event);

      // Act
      const result = await enhancedStripeWebhookService.handleWebhook(
        JSON.stringify(event),
        'test_signature'
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.eventType).toBe('customer.subscription.updated');
      expect(result.customerId).toBe(subscription.customer);
    });

    it('should process customer.subscription.trial_will_end event successfully', async () => {
      // Arrange
      const subscription = createMockStripeSubscription({ 
        status: 'trialing',
        trial_end: Math.floor(Date.now() / 1000) + 86400 // 24 hours
      });
      const event = {
        id: 'evt_test_123',
        type: 'customer.subscription.trial_will_end',
        data: { object: subscription },
        created: Math.floor(Date.now() / 1000),
        livemode: false
      };
      
      mockStripe().webhooks.constructEvent.mockReturnValue(event);

      // Act
      const result = await enhancedStripeWebhookService.handleWebhook(
        JSON.stringify(event),
        'test_signature'
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.eventType).toBe('customer.subscription.trial_will_end');
      expect(result.customerId).toBe(subscription.customer);
    });

    it('should process customer.subscription.deleted event successfully', async () => {
      // Arrange
      const subscription = createMockStripeSubscription({ status: 'canceled' });
      const event = {
        id: 'evt_test_123',
        type: 'customer.subscription.deleted',
        data: { object: subscription },
        created: Math.floor(Date.now() / 1000),
        livemode: false
      };
      
      mockStripe().webhooks.constructEvent.mockReturnValue(event);

      // Act
      const result = await enhancedStripeWebhookService.handleWebhook(
        JSON.stringify(event),
        'test_signature'
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.eventType).toBe('customer.subscription.deleted');
      expect(result.customerId).toBe(subscription.customer);
    });

    it('should process payment_intent.succeeded event successfully', async () => {
      // Arrange
      const paymentIntent = {
        id: 'pi_test_123',
        object: 'payment_intent',
        amount: 15000,
        currency: 'usd',
        customer: 'cus_test_123',
        invoice: 'in_test_123'
      };
      const event = {
        id: 'evt_test_123',
        type: 'payment_intent.succeeded',
        data: { object: paymentIntent },
        created: Math.floor(Date.now() / 1000),
        livemode: false
      };
      
      mockStripe().webhooks.constructEvent.mockReturnValue(event);
      mockStripe().invoices.retrieve.mockResolvedValue(createMockStripeInvoice());

      // Act
      const result = await enhancedStripeWebhookService.handleWebhook(
        JSON.stringify(event),
        'test_signature'
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.eventType).toBe('invoice.payment_succeeded'); // Payment intent with invoice becomes invoice.payment_succeeded
      expect(result.customerId).toBe(paymentIntent.customer);
    });

    it('should process invoice.payment_failed event successfully', async () => {
      // Arrange
      const invoice = createMockStripeInvoice({ 
        status: 'open',
        amount_paid: 0,
        amount_due: 15000
      });
      const event = {
        id: 'evt_test_123',
        type: 'invoice.payment_failed',
        data: { object: invoice },
        created: Math.floor(Date.now() / 1000),
        livemode: false
      };
      
      mockStripe().webhooks.constructEvent.mockReturnValue(event);

      // Act
      const result = await enhancedStripeWebhookService.handleWebhook(
        JSON.stringify(event),
        'test_signature'
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.eventType).toBe('invoice.payment_failed');
      expect(result.invoiceId).toBe(invoice.id);
      expect(result.customerId).toBe(invoice.customer);
    });

    it('should handle unhandled event types gracefully', async () => {
      // Arrange
      const event = {
        id: 'evt_test_123',
        type: 'unhandled.event.type',
        data: { object: {} },
        created: Math.floor(Date.now() / 1000),
        livemode: false
      };
      
      mockStripe().webhooks.constructEvent.mockReturnValue(event);

      // Act
      const result = await enhancedStripeWebhookService.handleWebhook(
        JSON.stringify(event),
        'test_signature'
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.eventType).toBe('unhandled.event.type');
      expect(result.error).toContain('Unhandled event type');
    });

    it('should handle webhook signature verification errors', async () => {
      // Arrange
      mockStripe().webhooks.constructEvent.mockImplementation(() => {
        throw ERROR_SCENARIOS.webhookSignatureError;
      });

      // Act
      const result = await enhancedStripeWebhookService.handleWebhook(
        'invalid_payload',
        'invalid_signature'
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid webhook signature');
    });

    it('should handle processing errors gracefully', async () => {
      // Arrange
      const invoice = createMockStripeInvoice();
      const event = {
        id: 'evt_test_123',
        type: 'invoice.payment_succeeded',
        data: { object: invoice },
        created: Math.floor(Date.now() / 1000),
        livemode: false
      };
      
      mockStripe().webhooks.constructEvent.mockReturnValue(event);
      mockInvoiceService.handlePaymentSuccess.mockRejectedValue(ERROR_SCENARIOS.invalidInvoice);

      // Act
      const result = await enhancedStripeWebhookService.handleWebhook(
        JSON.stringify(event),
        'test_signature'
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid invoice data');
    });
  });

  describe('Subscription Status Handling', () => {
    it('should handle subscription activation', async () => {
      // Arrange
      const subscription = createMockStripeSubscription({ status: 'active' });
      const event = {
        id: 'evt_test_123',
        type: 'customer.subscription.updated',
        data: { object: subscription },
        created: Math.floor(Date.now() / 1000),
        livemode: false
      };
      
      // Configure mock instance
      const mockStripeInstance = new mockStripe();
      mockStripeInstance.webhooks.constructEvent.mockReturnValue(event);
      mockStripeInstance.customers.update.mockResolvedValue(createMockStripeCustomer());
      mockStripe.mockImplementation(() => mockStripeInstance);

      // Act
      const result = await enhancedStripeWebhookService.handleWebhook(
        JSON.stringify(event),
        'test_signature'
      );

      // Assert
      expect(result.success).toBe(true);
      expect(mockStripeInstance.customers.update).toHaveBeenCalled();
    });

    it('should handle subscription past due', async () => {
      // Arrange
      const subscription = createMockStripeSubscription({ status: 'past_due' });
      const event = {
        id: 'evt_test_123',
        type: 'customer.subscription.updated',
        data: { object: subscription },
        created: Math.floor(Date.now() / 1000),
        livemode: false
      };
      
      // Configure mock instance
      const mockStripeInstance = new mockStripe();
      mockStripeInstance.webhooks.constructEvent.mockReturnValue(event);
      mockStripeInstance.customers.update.mockResolvedValue(createMockStripeCustomer());
      mockStripe.mockImplementation(() => mockStripeInstance);

      // Act
      const result = await enhancedStripeWebhookService.handleWebhook(
        JSON.stringify(event),
        'test_signature'
      );

      // Assert
      expect(result.success).toBe(true);
      expect(mockStripeInstance.customers.update).toHaveBeenCalled();
    });

    it('should handle subscription cancellation', async () => {
      // Arrange
      const subscription = createMockStripeSubscription({ status: 'canceled' });
      const event = {
        id: 'evt_test_123',
        type: 'customer.subscription.updated',
        data: { object: subscription },
        created: Math.floor(Date.now() / 1000),
        livemode: false
      };
      
      // Configure mock instance
      const mockStripeInstance = new mockStripe();
      mockStripeInstance.webhooks.constructEvent.mockReturnValue(event);
      mockStripeInstance.customers.update.mockResolvedValue(createMockStripeCustomer());
      mockStripe.mockImplementation(() => mockStripeInstance);

      // Act
      const result = await enhancedStripeWebhookService.handleWebhook(
        JSON.stringify(event),
        'test_signature'
      );

      // Assert
      expect(result.success).toBe(true);
      expect(mockStripeInstance.customers.update).toHaveBeenCalled();
    });
  });

  describe('Error Recovery', () => {
    it('should continue processing other events after one fails', async () => {
      // Arrange
      const invoice1 = createMockStripeInvoice({ id: 'in_test_1' });
      const invoice2 = createMockStripeInvoice({ id: 'in_test_2' });
      
      // Configure mock to succeed first, fail second
      mockInvoiceService.handlePaymentSuccess
        .mockResolvedValueOnce({ success: true })
        .mockRejectedValueOnce(ERROR_SCENARIOS.invalidInvoice);

      // Configure Stripe mock for both events
      const mockStripeInstance = new mockStripe();
      mockStripeInstance.webhooks.constructEvent
        .mockReturnValueOnce({
          id: 'evt_test_1',
          type: 'invoice.payment_succeeded',
          data: { object: invoice1 },
          created: Math.floor(Date.now() / 1000),
          livemode: false
        })
        .mockReturnValueOnce({
          id: 'evt_test_2',
          type: 'invoice.payment_succeeded',
          data: { object: invoice2 },
          created: Math.floor(Date.now() / 1000),
          livemode: false
        });
      mockStripeInstance.customers.retrieve.mockResolvedValue(createMockStripeCustomer());
      mockStripe.mockImplementation(() => mockStripeInstance);

      // Act
      const result1 = await enhancedStripeWebhookService.handleWebhook(
        JSON.stringify({
          id: 'evt_test_1',
          type: 'invoice.payment_succeeded',
          data: { object: invoice1 },
          created: Math.floor(Date.now() / 1000),
          livemode: false
        }),
        'test_signature'
      );

      const result2 = await enhancedStripeWebhookService.handleWebhook(
        JSON.stringify({
          id: 'evt_test_2',
          type: 'invoice.payment_succeeded',
          data: { object: invoice2 },
          created: Math.floor(Date.now() / 1000),
          livemode: false
        }),
        'test_signature'
      );

      // Assert
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(false);
    });
  });
});
