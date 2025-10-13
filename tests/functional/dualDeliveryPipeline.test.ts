// Functional tests for Dual Delivery Pipeline

import { enhancedInvoiceService } from '../../src/services/enhancedInvoiceService';
import { enhancedStripeWebhookService } from '../../src/services/enhancedStripeWebhookService';
import { 
  createMockStripeInvoice, 
  createMockStripeCustomer,
  createMockStripeSubscription,
  generateTestInvoices,
  generateTestCustomers,
  SERVICE_TEST_DATA,
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
  return jest.fn().mockImplementation(() => ({
    customers: {
      retrieve: jest.fn(),
      update: jest.fn()
    },
    webhooks: {
      constructEvent: jest.fn()
    }
  }));
});

describe('Dual Delivery Pipeline - Functional Tests', () => {
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
    mockNotificationService.sendNotification.mockResolvedValue({
      success: true,
      messageId: 'msg_test_123',
      provider: 'mailgun',
      channel: 'email',
      timestamp: new Date().toISOString()
    });
    
    mockESIMService.shouldOrderESIM.mockReturnValue(false);
    mockESIMService.createESIMOrder.mockResolvedValue({
      success: true,
      orderId: 'esim_test_123',
      trackingId: 'track_test_123',
      activationCodes: ['ACT123456'],
      qrCodes: ['data:image/png;base64,test'],
      downloadUrls: ['https://esim.example.com/download/test'],
      estimatedDelivery: new Date(Date.now() + 86400000)
    });
    
    mockESIMService.getActivationDetails.mockResolvedValue({
      orderId: 'esim_test_123',
      activationCode: 'ACT123456',
      qrCode: 'data:image/png;base64,test',
      downloadUrl: 'https://esim.example.com/download/test',
      deviceInfo: {},
      expiresAt: new Date(Date.now() + 86400000)
    });
    
    mockESIMService.sendActivationDetails.mockResolvedValue({ email: true, sms: true });
  });

  describe('End-to-End Payment Processing', () => {
    it('should process healthcare individual practice payment completely', async () => {
      // Arrange
      const invoice = createMockStripeInvoice({
        metadata: {
          service_type: 'healthcare',
          plan_tier: 'individual',
          unit_count: '2'
        },
        amount_paid: 30000 // $300.00 (2 providers × $150)
      });
      const customer = createMockStripeCustomer({
        email: 'doctor@clinic.com',
        phone: '+1234567890',
        metadata: {
          businessName: 'Family Medical Clinic',
          phoneNumber: '+1234567890'
        }
      });
      
      mockStripe().customers.retrieve.mockResolvedValue(customer);

      // Act
      const result = await enhancedInvoiceService.handlePaymentSuccess(invoice);

      // Assert
      assertInvoiceDelivery(result);
      expect(result.serviceDetails.serviceType).toBe('healthcare');
      expect(result.serviceDetails.tier).toBe('individual');
      expect(result.serviceDetails.planName).toBe('Individual Practice');
      expect(result.serviceDetails.requiresESIM).toBe(false);
      
      // Verify customer email sent
      const customerEmailCall = mockNotificationService.sendNotification.mock.calls.find(
        call => call[0].to === customer.email && call[0].channel === 'email'
      );
      expect(customerEmailCall).toBeDefined();
      expect(customerEmailCall[0].subject).toContain('TETRIX Invoice');
      expect(customerEmailCall[0].subject).toContain('$300.00');
      
      // Verify customer SMS sent
      const customerSMSCall = mockNotificationService.sendNotification.mock.calls.find(
        call => call[0].to === customer.phone && call[0].channel === 'sms'
      );
      expect(customerSMSCall).toBeDefined();
      expect(customerSMSCall[0].content).toContain('Payment confirmed!');
      
      // Verify internal email sent
      const internalEmailCall = mockNotificationService.sendNotification.mock.calls.find(
        call => call[0].to === 'support@tetrixcorp.com'
      );
      expect(internalEmailCall).toBeDefined();
      expect(internalEmailCall[0].subject).toContain('New Payment: $300.00');
      expect(internalEmailCall[0].metadata.customerId).toBe(customer.id);
      expect(internalEmailCall[0].metadata.serviceType).toBe('healthcare');
      
      // Verify no eSIM ordering
      expect(result.esimOrdering).toBeUndefined();
    });

    it('should process legal midsize firm payment with eSIM ordering', async () => {
      // Arrange
      const invoice = createMockStripeInvoice({
        metadata: {
          service_type: 'legal',
          plan_tier: 'midsize',
          unit_count: '50'
        },
        amount_paid: 600000 // $6,000.00 ($1,000 base + 50 × $100)
      });
      const customer = createMockStripeCustomer({
        email: 'partner@lawfirm.com',
        phone: '+1987654321',
        metadata: {
          businessName: 'Smith & Associates Law Firm',
          phoneNumber: '+1987654321'
        }
      });
      
      mockStripe().customers.retrieve.mockResolvedValue(customer);
      mockESIMService.shouldOrderESIM.mockReturnValue(true);

      // Act
      const result = await enhancedInvoiceService.handlePaymentSuccess(invoice);

      // Assert
      assertInvoiceDelivery(result);
      expect(result.serviceDetails.serviceType).toBe('legal');
      expect(result.serviceDetails.tier).toBe('midsize');
      expect(result.serviceDetails.planName).toBe('Mid-Size Firm');
      expect(result.serviceDetails.requiresESIM).toBe(true);
      
      // Verify eSIM ordering
      assertESIMOrdered(result.esimOrdering);
      expect(mockESIMService.createESIMOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          invoiceId: invoice.id,
          customerId: customer.id,
          serviceType: 'legal',
          planTier: 'midsize',
          customerEmail: customer.email,
          customerPhone: customer.phone,
          businessName: customer.metadata.businessName
        })
      );
      
      // Verify eSIM activation details sent
      expect(mockESIMService.sendActivationDetails).toHaveBeenCalledWith(
        customer.email,
        customer.phone,
        expect.objectContaining({
          orderId: 'esim_test_123',
          activationCode: 'ACT123456'
        }),
        'legal'
      );
    });

    it('should process business enterprise payment with eSIM ordering', async () => {
      // Arrange
      const invoice = createMockStripeInvoice({
        metadata: {
          service_type: 'business',
          plan_tier: 'enterprise'
        },
        amount_paid: 79900 // $799.00
      });
      const customer = createMockStripeCustomer({
        email: 'admin@enterprise.com',
        phone: '+1555123456',
        metadata: {
          businessName: 'Enterprise Corp',
          phoneNumber: '+1555123456'
        }
      });
      
      mockStripe().customers.retrieve.mockResolvedValue(customer);
      mockESIMService.shouldOrderESIM.mockReturnValue(true);

      // Act
      const result = await enhancedInvoiceService.handlePaymentSuccess(invoice);

      // Assert
      assertInvoiceDelivery(result);
      expect(result.serviceDetails.serviceType).toBe('business');
      expect(result.serviceDetails.tier).toBe('enterprise');
      expect(result.serviceDetails.planName).toBe('Enterprise');
      expect(result.serviceDetails.requiresESIM).toBe(true);
      
      // Verify eSIM ordering with correct configuration
      expect(mockESIMService.createESIMOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          serviceType: 'business',
          planTier: 'enterprise',
          dataPlan: 'Business Enterprise - Unlimited',
          duration: '30 days'
        })
      );
    });

    it('should process trial conversion payment', async () => {
      // Arrange
      const invoice = createMockStripeInvoice({
        metadata: {
          service_type: 'healthcare',
          plan_tier: 'professional',
          trial_conversion: 'true'
        },
        amount_paid: 50000 // $500.00
      });
      const customer = createMockStripeCustomer({
        email: 'trial@clinic.com',
        metadata: {
          businessName: 'Trial Medical Practice',
          trialUser: 'true'
        }
      });
      
      mockStripe().customers.retrieve.mockResolvedValue(customer);
      mockESIMService.shouldOrderESIM.mockReturnValue(true);

      // Act
      const result = await enhancedInvoiceService.handlePaymentSuccess(invoice);

      // Assert
      expect(result.serviceDetails.isTrialConversion).toBe(true);
      assertInvoiceDelivery(result);
      
      // Verify trial-specific messaging
      const customerEmailCall = mockNotificationService.sendNotification.mock.calls.find(
        call => call[0].to === customer.email && call[0].channel === 'email'
      );
      expect(customerEmailCall[0].subject).toContain('Welcome to TETRIX!');
    });
  });

  describe('Webhook Integration', () => {
    it('should process webhook event and trigger dual delivery', async () => {
      // Arrange
      const invoice = createMockStripeInvoice({
        metadata: {
          service_type: 'business',
          plan_tier: 'starter'
        }
      });
      const customer = createMockStripeCustomer();
      
      const event = {
        id: 'evt_test_123',
        type: 'invoice.payment_succeeded',
        data: { object: invoice },
        created: Math.floor(Date.now() / 1000),
        livemode: false
      };
      
      mockStripe().webhooks.constructEvent.mockReturnValue(event);
      mockStripe().customers.retrieve.mockResolvedValue(customer);
      mockESIMService.shouldOrderESIM.mockReturnValue(true);

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
      
      // Verify dual delivery was triggered
      expect(mockNotificationService.sendNotification).toHaveBeenCalledTimes(2); // Email + Internal
    });

    it('should handle subscription trial will end event', async () => {
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
  });

  describe('Bulk Processing', () => {
    it('should process multiple invoices efficiently', async () => {
      // Arrange
      const invoices = generateTestInvoices(5);
      const customers = generateTestCustomers(5);
      
      mockStripe().customers.retrieve
        .mockResolvedValueOnce(customers[0])
        .mockResolvedValueOnce(customers[1])
        .mockResolvedValueOnce(customers[2])
        .mockResolvedValueOnce(customers[3])
        .mockResolvedValueOnce(customers[4]);

      // Act
      const results = await Promise.all(
        invoices.map(invoice => enhancedInvoiceService.handlePaymentSuccess(invoice))
      );

      // Assert
      expect(results).toHaveLength(5);
      results.forEach(result => {
        assertInvoiceDelivery(result);
      });
      
      // Verify all notifications were sent
      expect(mockNotificationService.sendNotification).toHaveBeenCalledTimes(10); // 5 × 2 (email + internal)
    });

    it('should handle mixed service types in bulk processing', async () => {
      // Arrange
      const invoices = [
        createMockStripeInvoice({
          metadata: { service_type: 'healthcare', plan_tier: 'individual' }
        }),
        createMockStripeInvoice({
          metadata: { service_type: 'legal', plan_tier: 'midsize' }
        }),
        createMockStripeInvoice({
          metadata: { service_type: 'business', plan_tier: 'starter' }
        })
      ];
      
      const customers = generateTestCustomers(3);
      mockStripe().customers.retrieve
        .mockResolvedValueOnce(customers[0])
        .mockResolvedValueOnce(customers[1])
        .mockResolvedValueOnce(customers[2]);
      
      mockESIMService.shouldOrderESIM
        .mockReturnValueOnce(false) // healthcare individual
        .mockReturnValueOnce(true)  // legal midsize
        .mockReturnValueOnce(true); // business starter

      // Act
      const results = await Promise.all(
        invoices.map(invoice => enhancedInvoiceService.handlePaymentSuccess(invoice))
      );

      // Assert
      expect(results[0].serviceDetails.serviceType).toBe('healthcare');
      expect(results[0].serviceDetails.requiresESIM).toBe(false);
      expect(results[0].esimOrdering).toBeUndefined();
      
      expect(results[1].serviceDetails.serviceType).toBe('legal');
      expect(results[1].serviceDetails.requiresESIM).toBe(true);
      expect(results[1].esimOrdering).toBeDefined();
      
      expect(results[2].serviceDetails.serviceType).toBe('business');
      expect(results[2].serviceDetails.requiresESIM).toBe(true);
      expect(results[2].esimOrdering).toBeDefined();
    });
  });

  describe('Error Recovery', () => {
    it('should continue processing other deliveries when one fails', async () => {
      // Arrange
      const invoice = createMockStripeInvoice();
      const customer = createMockStripeCustomer();
      
      mockStripe().customers.retrieve.mockResolvedValue(customer);
      mockNotificationService.sendNotification
        .mockResolvedValueOnce({ success: true }) // Customer email succeeds
        .mockRejectedValueOnce(new Error('SMS service down')) // SMS fails
        .mockResolvedValueOnce({ success: true }); // Internal email succeeds

      // Act
      const result = await enhancedInvoiceService.handlePaymentSuccess(invoice);

      // Assert
      expect(result.customerDelivery.email.success).toBe(true);
      expect(result.customerDelivery.sms).toBeUndefined();
      expect(result.internalDelivery.success).toBe(true);
    });

    it('should handle eSIM ordering failure gracefully', async () => {
      // Arrange
      const invoice = createMockStripeInvoice({
        metadata: { service_type: 'business', plan_tier: 'starter' }
      });
      const customer = createMockStripeCustomer();
      
      mockStripe().customers.retrieve.mockResolvedValue(customer);
      mockESIMService.shouldOrderESIM.mockReturnValue(true);
      mockESIMService.createESIMOrder.mockRejectedValue(new Error('eSIM service unavailable'));

      // Act
      const result = await enhancedInvoiceService.handlePaymentSuccess(invoice);

      // Assert
      assertInvoiceDelivery(result);
      expect(result.esimOrdering.success).toBe(false);
      expect(result.esimOrdering.error).toContain('eSIM service unavailable');
    });
  });

  describe('Template Customization', () => {
    it('should generate service-specific email templates', async () => {
      // Arrange
      const healthcareInvoice = createMockStripeInvoice({
        metadata: { service_type: 'healthcare', plan_tier: 'professional' }
      });
      const legalInvoice = createMockStripeInvoice({
        metadata: { service_type: 'legal', plan_tier: 'midsize' }
      });
      const businessInvoice = createMockStripeInvoice({
        metadata: { service_type: 'business', plan_tier: 'enterprise' }
      });
      
      const customer = createMockStripeCustomer();
      mockStripe().customers.retrieve.mockResolvedValue(customer);

      // Act
      await enhancedInvoiceService.handlePaymentSuccess(healthcareInvoice);
      await enhancedInvoiceService.handlePaymentSuccess(legalInvoice);
      await enhancedInvoiceService.handlePaymentSuccess(businessInvoice);

      // Assert
      const healthcareCall = mockNotificationService.sendNotification.mock.calls.find(
        call => call[0].metadata?.serviceType === 'healthcare'
      );
      expect(healthcareCall[0].content.html).toContain('HIPAA compliance');
      
      const legalCall = mockNotificationService.sendNotification.mock.calls.find(
        call => call[0].metadata?.serviceType === 'legal'
      );
      expect(legalCall[0].content.html).toContain('Attorney-client privilege');
      
      const businessCall = mockNotificationService.sendNotification.mock.calls.find(
        call => call[0].metadata?.serviceType === 'business'
      );
      expect(businessCall[0].content.html).toContain('AI automation');
    });
  });
});
