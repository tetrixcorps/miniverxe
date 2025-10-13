// Unit tests for Enhanced Invoice Service

import { enhancedInvoiceService } from '../../src/services/enhancedInvoiceService';
import { 
  createMockStripeInvoice, 
  createMockStripeCustomer, 
  createMockServiceDetails,
  createMockNotificationResponse,
  createMockESIMOrderResult,
  SERVICE_TEST_DATA,
  ERROR_SCENARIOS,
  assertInvoiceDelivery,
  assertNotificationSent,
  assertESIMOrdered
} from '../utils/testHelpers';

// Mock dependencies
jest.mock('../../src/services/notificationService', () => ({
  notificationService: {
    sendNotification: jest.fn()
  }
}));

jest.mock('../../src/services/esimIntegrationService', () => ({
  esimIntegrationService: {
    shouldOrderESIM: jest.fn(),
    createESIMOrder: jest.fn(),
    getActivationDetails: jest.fn(),
    sendActivationDetails: jest.fn()
  }
}));

jest.mock('stripe', () => {
  const mockStripeInstance = {
    customers: {
      retrieve: jest.fn()
    },
    invoices: {
      retrieve: jest.fn()
    },
    subscriptions: {
      list: jest.fn()
    }
  };
  
  return jest.fn().mockImplementation(() => mockStripeInstance);
});

describe('Enhanced Invoice Service', () => {
  let mockNotificationService: any;
  let mockESIMService: any;
  let mockStripe: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mocks
    mockNotificationService = require('../../src/services/notificationService').notificationService;
    mockESIMService = require('../../src/services/esimIntegrationService').esimIntegrationService;
    mockStripe = require('stripe');
    
    // Default mock implementations
    mockNotificationService.sendNotification.mockResolvedValue(createMockNotificationResponse());
    mockESIMService.shouldOrderESIM.mockReturnValue(false);
    mockESIMService.createESIMOrder.mockResolvedValue(createMockESIMOrderResult());
    mockESIMService.getActivationDetails.mockResolvedValue({
      orderId: 'esim_test_123',
      activationCode: 'ACT123456',
      qrCode: 'data:image/png;base64,test',
      downloadUrl: 'https://esim.example.com/download/test',
      deviceInfo: {},
      expiresAt: new Date(Date.now() + 86400000)
    });
    mockESIMService.sendActivationDetails.mockResolvedValue({ email: true, sms: true });
    
    // Configure Stripe mock to return customer
    const mockStripeInstance = new mockStripe();
    mockStripeInstance.customers.retrieve.mockResolvedValue(createMockStripeCustomer());
    mockStripeInstance.invoices.retrieve.mockResolvedValue(createMockStripeInvoice());
    mockStripeInstance.subscriptions.list.mockResolvedValue({ data: [] });
    
    // Override the mock implementation
    mockStripe.mockImplementation(() => mockStripeInstance);
  });

  describe('handlePaymentSuccess', () => {
    it('should process payment success and deliver invoices', async () => {
      // Arrange
      const invoice = createMockStripeInvoice();
      const customer = createMockStripeCustomer();
      mockStripe().customers.retrieve.mockResolvedValue(customer);

      // Act
      const result = await enhancedInvoiceService.handlePaymentSuccess(invoice);

      // Assert
      assertInvoiceDelivery(result);
      expect(result.customerDelivery.email.success).toBe(true);
      expect(result.internalDelivery.success).toBe(true);
      expect(mockNotificationService.sendNotification).toHaveBeenCalledTimes(3); // Customer email + SMS + Internal email
    });

    it('should handle customer with phone number for SMS delivery', async () => {
      // Arrange
      const invoice = createMockStripeInvoice();
      const customer = createMockStripeCustomer({ phone: '+1234567890' });
      mockStripe().customers.retrieve.mockResolvedValue(customer);

      // Act
      const result = await enhancedInvoiceService.handlePaymentSuccess(invoice);

      // Assert
      expect(result.customerDelivery.sms).toBeDefined();
      expect(mockNotificationService.sendNotification).toHaveBeenCalledTimes(3); // Email + SMS + Internal
    });

    it('should handle eSIM ordering for applicable services', async () => {
      // Arrange
      const invoice = createMockStripeInvoice({
        metadata: {
          service_type: 'business',
          plan_tier: 'starter'
        }
      });
      const customer = createMockStripeCustomer();
      mockStripe().customers.retrieve.mockResolvedValue(customer);
      mockESIMService.shouldOrderESIM.mockReturnValue(true);

      // Act
      const result = await enhancedInvoiceService.handlePaymentSuccess(invoice);

      // Assert
      expect(result.esimOrdering).toBeDefined();
      expect(result.esimOrdering.success).toBe(true);
      expect(mockESIMService.createESIMOrder).toHaveBeenCalled();
      expect(mockESIMService.sendActivationDetails).toHaveBeenCalled();
    });

    it('should handle trial conversion payments', async () => {
      // Arrange
      const invoice = createMockStripeInvoice({
        metadata: {
          service_type: 'healthcare',
          plan_tier: 'individual',
          trial_conversion: 'true'
        }
      });
      const customer = createMockStripeCustomer();
      mockStripe().customers.retrieve.mockResolvedValue(customer);

      // Act
      const result = await enhancedInvoiceService.handlePaymentSuccess(invoice);

      // Assert
      expect(result.serviceDetails.isTrialConversion).toBe(true);
      assertInvoiceDelivery(result);
    });

    it('should handle payment processing errors gracefully', async () => {
      // Arrange
      const invoice = createMockStripeInvoice();
      mockStripe().customers.retrieve.mockRejectedValue(ERROR_SCENARIOS.customerNotFound);

      // Act & Assert
      await expect(enhancedInvoiceService.handlePaymentSuccess(invoice))
        .rejects.toThrow('Customer not found');
    });
  });

  describe('Service Analysis', () => {
    it('should correctly analyze healthcare individual service', async () => {
      // Arrange
      const invoice = createMockStripeInvoice({
        metadata: {
          service_type: 'healthcare',
          plan_tier: 'individual',
          unit_count: '2'
        }
      });
      const customer = createMockStripeCustomer();
      mockStripe().customers.retrieve.mockResolvedValue(customer);

      // Act
      const result = await enhancedInvoiceService.handlePaymentSuccess(invoice);

      // Assert
      expect(result.serviceDetails.serviceType).toBe('healthcare');
      expect(result.serviceDetails.tier).toBe('individual');
      expect(result.serviceDetails.planName).toBe('Individual Practice');
      expect(result.serviceDetails.basePrice).toBe(150);
      expect(result.serviceDetails.requiresESIM).toBe(false);
    });

    it('should correctly analyze legal midsize service', async () => {
      // Arrange
      const invoice = createMockStripeInvoice({
        metadata: {
          service_type: 'legal',
          plan_tier: 'midsize',
          unit_count: '50'
        }
      });
      const customer = createMockStripeCustomer();
      mockStripe().customers.retrieve.mockResolvedValue(customer);

      // Act
      const result = await enhancedInvoiceService.handlePaymentSuccess(invoice);

      // Assert
      expect(result.serviceDetails.serviceType).toBe('legal');
      expect(result.serviceDetails.tier).toBe('midsize');
      expect(result.serviceDetails.planName).toBe('Mid-Size Firm');
      expect(result.serviceDetails.basePrice).toBe(1000);
      expect(result.serviceDetails.perUnitPrice).toBe(100);
      expect(result.serviceDetails.requiresESIM).toBe(true);
    });

    it('should correctly analyze business enterprise service', async () => {
      // Arrange
      const invoice = createMockStripeInvoice({
        metadata: {
          service_type: 'business',
          plan_tier: 'enterprise'
        }
      });
      const customer = createMockStripeCustomer();
      mockStripe().customers.retrieve.mockResolvedValue(customer);

      // Act
      const result = await enhancedInvoiceService.handlePaymentSuccess(invoice);

      // Assert
      expect(result.serviceDetails.serviceType).toBe('business');
      expect(result.serviceDetails.tier).toBe('enterprise');
      expect(result.serviceDetails.planName).toBe('Enterprise');
      expect(result.serviceDetails.basePrice).toBe(799);
      expect(result.serviceDetails.requiresESIM).toBe(true);
    });
  });

  describe('Template Generation', () => {
    it('should generate customer invoice template with correct data', async () => {
      // Arrange
      const invoice = createMockStripeInvoice({ amount_paid: 15000 }); // $150.00
      const customer = createMockStripeCustomer();
      mockStripe().customers.retrieve.mockResolvedValue(customer);

      // Act
      await enhancedInvoiceService.handlePaymentSuccess(invoice);

      // Assert
      const emailCall = mockNotificationService.sendNotification.mock.calls.find(
        call => call[0].channel === 'email' && call[0].to === customer.email
      );
      expect(emailCall).toBeDefined();
      expect(emailCall[0].subject).toContain('TETRIX Invoice');
      expect(emailCall[0].subject).toContain('$150.00');
    });

    it('should generate internal invoice template with correct data', async () => {
      // Arrange
      const invoice = createMockStripeInvoice({ amount_paid: 50000 }); // $500.00
      const customer = createMockStripeCustomer();
      mockStripe().customers.retrieve.mockResolvedValue(customer);

      // Act
      await enhancedInvoiceService.handlePaymentSuccess(invoice);

      // Assert
      const internalCall = mockNotificationService.sendNotification.mock.calls.find(
        call => call[0].to === 'support@tetrixcorp.com'
      );
      expect(internalCall).toBeDefined();
      expect(internalCall[0].subject).toContain('New Payment: $500.00');
      expect(internalCall[0].metadata).toBeDefined();
      expect(internalCall[0].metadata.invoiceId).toBe(invoice.id);
    });

    it('should generate SMS template for customer', async () => {
      // Arrange
      const invoice = createMockStripeInvoice({ amount_paid: 29900 }); // $299.00
      const customer = createMockStripeCustomer({ phone: '+1234567890' });
      mockStripe().customers.retrieve.mockResolvedValue(customer);

      // Act
      await enhancedInvoiceService.handlePaymentSuccess(invoice);

      // Assert
      const smsCall = mockNotificationService.sendNotification.mock.calls.find(
        call => call[0].channel === 'sms'
      );
      expect(smsCall).toBeDefined();
      expect(smsCall[0].content).toContain('Payment confirmed!');
      expect(smsCall[0].content).toContain('$299.00');
    });
  });

  describe('Error Handling', () => {
    it('should handle notification service failures', async () => {
      // Arrange
      const invoice = createMockStripeInvoice();
      const customer = createMockStripeCustomer();
      mockStripe().customers.retrieve.mockResolvedValue(customer);
      mockNotificationService.sendNotification.mockRejectedValue(ERROR_SCENARIOS.notificationFailure);

      // Act
      const result = await enhancedInvoiceService.handlePaymentSuccess(invoice);

      // Assert - Service should handle failures gracefully
      expect(result.customerDelivery.email).toBeNull();
      expect(result.internalDelivery).toBeNull();
      expect(result.serviceDetails).toBeDefined();
    });

    it('should handle eSIM ordering failures gracefully', async () => {
      // Arrange
      const invoice = createMockStripeInvoice({
        metadata: {
          service_type: 'business',
          plan_tier: 'starter'
        }
      });
      const customer = createMockStripeCustomer();
      mockStripe().customers.retrieve.mockResolvedValue(customer);
      mockESIMService.shouldOrderESIM.mockReturnValue(true);
      mockESIMService.createESIMOrder.mockRejectedValue(ERROR_SCENARIOS.esimOrderingFailure);

      // Act
      const result = await enhancedInvoiceService.handlePaymentSuccess(invoice);

      // Assert
      expect(result.esimOrdering.success).toBe(false);
      expect(result.esimOrdering.error).toContain('eSIM ordering service error');
      // Should still deliver invoices even if eSIM fails
      assertInvoiceDelivery(result);
    });

    it('should handle missing customer data', async () => {
      // Arrange
      const invoice = createMockStripeInvoice();
      const customer = createMockStripeCustomer();
      // Properly remove email and phone properties
      delete customer.email;
      delete customer.phone;
      mockStripe().customers.retrieve.mockResolvedValue(customer);

      // Debug: Verify the customer object
      expect(customer.email).toBeUndefined();
      expect(customer.phone).toBeUndefined();

      // Act
      const result = await enhancedInvoiceService.handlePaymentSuccess(invoice);

      // Assert - Service should handle missing email gracefully
      expect(result.customerDelivery.email).toBeNull();
      expect(result.customerDelivery.sms).toBeNull();
      expect(result.internalDelivery).toBeDefined(); // Internal email should still work
      expect(result.serviceDetails).toBeDefined();
    });
  });

  describe('Service-Specific Features', () => {
    it('should handle healthcare service with HIPAA compliance', async () => {
      // Arrange
      const invoice = createMockStripeInvoice({
        metadata: {
          service_type: 'healthcare',
          plan_tier: 'individual'
        }
      });
      const customer = createMockStripeCustomer();
      mockStripe().customers.retrieve.mockResolvedValue(customer);

      // Act
      const result = await enhancedInvoiceService.handlePaymentSuccess(invoice);

      // Assert
      expect(result.serviceDetails.features).toContain('HIPAA compliance');
      expect(result.serviceDetails.requiresESIM).toBe(false); // Individual doesn't require eSIM
    });

    it('should handle legal service with attorney-client privilege', async () => {
      // Arrange
      const invoice = createMockStripeInvoice({
        metadata: {
          service_type: 'legal',
          plan_tier: 'solo'
        }
      });
      const customer = createMockStripeCustomer();
      mockStripe().customers.retrieve.mockResolvedValue(customer);

      // Act
      const result = await enhancedInvoiceService.handlePaymentSuccess(invoice);

      // Assert
      expect(result.serviceDetails.features).toContain('Attorney-client privilege protection');
      expect(result.serviceDetails.requiresESIM).toBe(false);
    });

    it('should handle business service with eSIM requirements', async () => {
      // Arrange
      const invoice = createMockStripeInvoice({
        metadata: {
          service_type: 'business',
          plan_tier: 'professional'
        }
      });
      const customer = createMockStripeCustomer();
      mockStripe().customers.retrieve.mockResolvedValue(customer);
      mockESIMService.shouldOrderESIM.mockReturnValue(true);

      // Act
      const result = await enhancedInvoiceService.handlePaymentSuccess(invoice);

      // Assert
      expect(result.serviceDetails.features).toContain('Advanced AI automation + data labeling');
      expect(result.serviceDetails.requiresESIM).toBe(true);
      expect(result.esimOrdering).toBeDefined();
    });
  });
});
