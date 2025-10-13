// Integration tests for full system with real service interactions

import { enhancedInvoiceService } from '../../src/services/enhancedInvoiceService';
import { enhancedStripeWebhookService } from '../../src/services/enhancedStripeWebhookService';
import { esimIntegrationService } from '../../src/services/esimIntegrationService';
import { 
  createMockStripeInvoice, 
  createMockStripeCustomer,
  createMockStripeSubscription,
  SERVICE_TEST_DATA
} from '../utils/testHelpers';

// Mock external services
jest.mock('../../src/services/notificationService', () => ({
  notificationService: {
    sendNotification: jest.fn()
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

// Mock fetch for eSIM API calls
global.fetch = jest.fn();

describe('Full System Integration Tests', () => {
  let mockNotificationService: any;
  let mockStripe: any;
  let mockFetch: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mocks
    mockNotificationService = require('../../src/services/notificationService').notificationService;
    mockStripe = require('stripe');
    mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    
    // Default mock implementations
    mockNotificationService.sendNotification.mockResolvedValue({
      success: true,
      messageId: 'msg_test_123',
      provider: 'mailgun',
      channel: 'email',
      timestamp: new Date().toISOString()
    });
  });

  describe('Healthcare Service Integration', () => {
    it('should process healthcare individual practice end-to-end', async () => {
      // Arrange
      const invoice = createMockStripeInvoice({
        metadata: {
          service_type: 'healthcare',
          plan_tier: 'individual',
          unit_count: '3'
        },
        amount_paid: 45000 // $450.00 (3 providers × $150)
      });
      const customer = createMockStripeCustomer({
        email: 'admin@familyclinic.com',
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
      expect(result.serviceDetails.serviceType).toBe('healthcare');
      expect(result.serviceDetails.tier).toBe('individual');
      expect(result.serviceDetails.planName).toBe('Individual Practice');
      expect(result.serviceDetails.basePrice).toBe(150);
      expect(result.serviceDetails.requiresESIM).toBe(false);
      
      // Verify customer delivery
      expect(result.customerDelivery.email.success).toBe(true);
      expect(result.customerDelivery.sms?.success).toBe(true);
      
      // Verify internal delivery
      expect(result.internalDelivery.success).toBe(true);
      
      // Verify no eSIM ordering
      expect(result.esimOrdering).toBeUndefined();
      
      // Verify notification calls
      expect(mockNotificationService.sendNotification).toHaveBeenCalledTimes(3); // Email + SMS + Internal
      
      // Verify email content includes healthcare-specific features
      const customerEmailCall = mockNotificationService.sendNotification.mock.calls.find(
        call => call[0].to === customer.email && call[0].channel === 'email'
      );
      expect(customerEmailCall[0].content.html).toContain('HIPAA compliance');
      expect(customerEmailCall[0].content.html).toContain('2,000 AI voice sessions/month');
    });

    it('should process healthcare professional with eSIM ordering', async () => {
      // Arrange
      const invoice = createMockStripeInvoice({
        metadata: {
          service_type: 'healthcare',
          plan_tier: 'professional',
          unit_count: '25'
        },
        amount_paid: 237500 // $2,375.00 ($500 base + 25 × $75)
      });
      const customer = createMockStripeCustomer({
        email: 'it@hospital.com',
        phone: '+1987654321',
        metadata: {
          businessName: 'Regional Medical Center',
          phoneNumber: '+1987654321'
        }
      });
      
      // Mock eSIM API responses
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              orderId: 'esim_healthcare_123',
              trackingId: 'track_healthcare_123',
              activationCodes: ['ACT_HEALTH_123'],
              qrCodes: ['data:image/png;base64,healthcare_qr'],
              downloadUrls: ['https://esim.example.com/download/healthcare_123'],
              estimatedDelivery: new Date(Date.now() + 86400000).toISOString()
            }
          })
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              orderId: 'esim_healthcare_123',
              activationCode: 'ACT_HEALTH_123',
              qrCode: 'data:image/png;base64,healthcare_qr',
              downloadUrl: 'https://esim.example.com/download/healthcare_123',
              deviceInfo: { model: 'Medical Device Pro' },
              expiresAt: new Date(Date.now() + 86400000).toISOString()
            }
          })
        } as Response);
      
      mockStripe().customers.retrieve.mockResolvedValue(customer);

      // Act
      const result = await enhancedInvoiceService.handlePaymentSuccess(invoice);

      // Assert
      expect(result.serviceDetails.requiresESIM).toBe(true);
      expect(result.esimOrdering.success).toBe(true);
      expect(result.esimOrdering.orderId).toBe('esim_healthcare_123');
      
      // Verify eSIM API calls
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/orders'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'X-Platform': 'tetrix'
          }),
          body: expect.stringContaining('"serviceType":"healthcare"')
        })
      );
      
      // Verify eSIM activation details sent
      expect(mockNotificationService.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          to: customer.email,
          channel: 'email',
          subject: expect.stringContaining('eSIM Activation Details'),
          content: expect.objectContaining({
            html: expect.stringContaining('ACT_HEALTH_123')
          })
        })
      );
    });
  });

  describe('Legal Service Integration', () => {
    it('should process legal solo practice end-to-end', async () => {
      // Arrange
      const invoice = createMockStripeInvoice({
        metadata: {
          service_type: 'legal',
          plan_tier: 'solo',
          unit_count: '1'
        },
        amount_paid: 15000 // $150.00
      });
      const customer = createMockStripeCustomer({
        email: 'attorney@law.com',
        phone: '+1555123456',
        metadata: {
          businessName: 'John Smith Law Office',
          phoneNumber: '+1555123456'
        }
      });
      
      mockStripe().customers.retrieve.mockResolvedValue(customer);

      // Act
      const result = await enhancedInvoiceService.handlePaymentSuccess(invoice);

      // Assert
      expect(result.serviceDetails.serviceType).toBe('legal');
      expect(result.serviceDetails.tier).toBe('solo');
      expect(result.serviceDetails.planName).toBe('Solo Practice');
      expect(result.serviceDetails.requiresESIM).toBe(false);
      
      // Verify legal-specific features in email
      const customerEmailCall = mockNotificationService.sendNotification.mock.calls.find(
        call => call[0].to === customer.email && call[0].channel === 'email'
      );
      expect(customerEmailCall[0].content.html).toContain('Attorney-client privilege protection');
      expect(customerEmailCall[0].content.html).toContain('2,000 AI legal assistant sessions/month');
    });

    it('should process legal midsize firm with eSIM ordering', async () => {
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
        email: 'managing@lawfirm.com',
        phone: '+1555987654',
        metadata: {
          businessName: 'Smith & Associates Law Firm',
          phoneNumber: '+1555987654'
        }
      });
      
      // Mock eSIM API responses
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              orderId: 'esim_legal_123',
              trackingId: 'track_legal_123',
              activationCodes: ['ACT_LEGAL_123'],
              qrCodes: ['data:image/png;base64,legal_qr'],
              downloadUrls: ['https://esim.example.com/download/legal_123'],
              estimatedDelivery: new Date(Date.now() + 86400000).toISOString()
            }
          })
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              orderId: 'esim_legal_123',
              activationCode: 'ACT_LEGAL_123',
              qrCode: 'data:image/png;base64,legal_qr',
              downloadUrl: 'https://esim.example.com/download/legal_123',
              deviceInfo: { model: 'Legal Device Pro' },
              expiresAt: new Date(Date.now() + 86400000).toISOString()
            }
          })
        } as Response);
      
      mockStripe().customers.retrieve.mockResolvedValue(customer);

      // Act
      const result = await enhancedInvoiceService.handlePaymentSuccess(invoice);

      // Assert
      expect(result.serviceDetails.requiresESIM).toBe(true);
      expect(result.esimOrdering.success).toBe(true);
      
      // Verify eSIM configuration for legal service
      const esimOrderCall = mockFetch.mock.calls.find(
        call => call[0].toString().includes('/orders')
      );
      const orderData = JSON.parse(esimOrderCall[1].body as string);
      expect(orderData.serviceType).toBe('legal');
      expect(orderData.planTier).toBe('midsize');
      expect(orderData.dataPlan).toBe('Legal Midsize - 15GB');
    });
  });

  describe('Business Service Integration', () => {
    it('should process business starter with eSIM ordering', async () => {
      // Arrange
      const invoice = createMockStripeInvoice({
        metadata: {
          service_type: 'business',
          plan_tier: 'starter'
        },
        amount_paid: 9900 // $99.00
      });
      const customer = createMockStripeCustomer({
        email: 'founder@startup.com',
        phone: '+1555555555',
        metadata: {
          businessName: 'Tech Startup Inc',
          phoneNumber: '+1555555555'
        }
      });
      
      // Mock eSIM API responses
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              orderId: 'esim_business_123',
              trackingId: 'track_business_123',
              activationCodes: ['ACT_BUSINESS_123'],
              qrCodes: ['data:image/png;base64,business_qr'],
              downloadUrls: ['https://esim.example.com/download/business_123'],
              estimatedDelivery: new Date(Date.now() + 86400000).toISOString()
            }
          })
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              orderId: 'esim_business_123',
              activationCode: 'ACT_BUSINESS_123',
              qrCode: 'data:image/png;base64,business_qr',
              downloadUrl: 'https://esim.example.com/download/business_123',
              deviceInfo: { model: 'Business Device' },
              expiresAt: new Date(Date.now() + 86400000).toISOString()
            }
          })
        } as Response);
      
      mockStripe().customers.retrieve.mockResolvedValue(customer);

      // Act
      const result = await enhancedInvoiceService.handlePaymentSuccess(invoice);

      // Assert
      expect(result.serviceDetails.requiresESIM).toBe(true);
      expect(result.esimOrdering.success).toBe(true);
      
      // Verify business-specific features
      const customerEmailCall = mockNotificationService.sendNotification.mock.calls.find(
        call => call[0].to === customer.email && call[0].channel === 'email'
      );
      expect(customerEmailCall[0].content.html).toContain('1,000 voice minutes included');
      expect(customerEmailCall[0].content.html).toContain('1,000 SMS messages included');
      expect(customerEmailCall[0].content.html).toContain('500 2FA attempts included');
    });

    it('should process business enterprise with custom eSIM configuration', async () => {
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
        phone: '+1555111111',
        metadata: {
          businessName: 'Enterprise Corp',
          phoneNumber: '+1555111111'
        }
      });
      
      // Mock eSIM API responses
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              orderId: 'esim_enterprise_123',
              trackingId: 'track_enterprise_123',
              activationCodes: ['ACT_ENTERPRISE_123'],
              qrCodes: ['data:image/png;base64,enterprise_qr'],
              downloadUrls: ['https://esim.example.com/download/enterprise_123'],
              estimatedDelivery: new Date(Date.now() + 86400000).toISOString()
            }
          })
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              orderId: 'esim_enterprise_123',
              activationCode: 'ACT_ENTERPRISE_123',
              qrCode: 'data:image/png;base64,enterprise_qr',
              downloadUrl: 'https://esim.example.com/download/enterprise_123',
              deviceInfo: { model: 'Enterprise Device Pro' },
              expiresAt: new Date(Date.now() + 86400000).toISOString()
            }
          })
        } as Response);
      
      mockStripe().customers.retrieve.mockResolvedValue(customer);

      // Act
      const result = await enhancedInvoiceService.handlePaymentSuccess(invoice);

      // Assert
      expect(result.serviceDetails.requiresESIM).toBe(true);
      expect(result.esimOrdering.success).toBe(true);
      
      // Verify enterprise eSIM configuration
      const esimOrderCall = mockFetch.mock.calls.find(
        call => call[0].toString().includes('/orders')
      );
      const orderData = JSON.parse(esimOrderCall[1].body as string);
      expect(orderData.esimType).toBe('business_enterprise');
      expect(orderData.features).toContain('priority_support');
      expect(orderData.priority).toBe('critical');
    });
  });

  describe('Webhook Integration', () => {
    it('should process complete webhook flow for payment success', async () => {
      // Arrange
      const invoice = createMockStripeInvoice({
        metadata: {
          service_type: 'business',
          plan_tier: 'professional'
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
      
      // Mock eSIM API responses
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              orderId: 'esim_webhook_123',
              trackingId: 'track_webhook_123',
              activationCodes: ['ACT_WEBHOOK_123'],
              qrCodes: ['data:image/png;base64,webhook_qr'],
              downloadUrls: ['https://esim.example.com/download/webhook_123'],
              estimatedDelivery: new Date(Date.now() + 86400000).toISOString()
            }
          })
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              orderId: 'esim_webhook_123',
              activationCode: 'ACT_WEBHOOK_123',
              qrCode: 'data:image/png;base64,webhook_qr',
              downloadUrl: 'https://esim.example.com/download/webhook_123',
              deviceInfo: {},
              expiresAt: new Date(Date.now() + 86400000).toISOString()
            }
          })
        } as Response);
      
      mockStripe().webhooks.constructEvent.mockReturnValue(event);
      mockStripe().customers.retrieve.mockResolvedValue(customer);

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
      
      // Verify all services were called
      expect(mockNotificationService.sendNotification).toHaveBeenCalledTimes(3); // Email + SMS + Internal
      expect(mockFetch).toHaveBeenCalledTimes(2); // eSIM order + activation details
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

  describe('Error Handling and Recovery', () => {
    it('should handle eSIM API failures gracefully', async () => {
      // Arrange
      const invoice = createMockStripeInvoice({
        metadata: {
          service_type: 'business',
          plan_tier: 'starter'
        }
      });
      const customer = createMockStripeCustomer();
      
      // Mock eSIM API failure
      mockFetch.mockRejectedValueOnce(new Error('eSIM API unavailable'));
      
      mockStripe().customers.retrieve.mockResolvedValue(customer);

      // Act
      const result = await enhancedInvoiceService.handlePaymentSuccess(invoice);

      // Assert
      expect(result.customerDelivery.email.success).toBe(true);
      expect(result.internalDelivery.success).toBe(true);
      expect(result.esimOrdering.success).toBe(false);
      expect(result.esimOrdering.error).toContain('eSIM API unavailable');
    });

    it('should handle notification service failures gracefully', async () => {
      // Arrange
      const invoice = createMockStripeInvoice();
      const customer = createMockStripeCustomer();
      
      mockStripe().customers.retrieve.mockResolvedValue(customer);
      mockNotificationService.sendNotification.mockRejectedValue(
        new Error('Notification service down')
      );

      // Act & Assert
      await expect(enhancedInvoiceService.handlePaymentSuccess(invoice))
        .rejects.toThrow('Notification service down');
    });

    it('should handle webhook signature verification failures', async () => {
      // Arrange
      mockStripe().webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid webhook signature');
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
  });
});
