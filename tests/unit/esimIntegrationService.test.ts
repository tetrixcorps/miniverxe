// Unit tests for eSIM Integration Service

// Set up environment variables before imports
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key';
process.env.NODE_ENV = 'test';

import { esimIntegrationService } from '../../src/services/esimIntegrationService';
import { 
  createMockESIMOrderResult,
  ERROR_SCENARIOS
} from '../utils/testHelpers';

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock notification service
jest.mock('../../src/services/notificationService', () => ({
  notificationService: {
    sendNotification: jest.fn()
  }
}));

describe('eSIM Integration Service', () => {
  let mockNotificationService: any;
  let mockFetch: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mocks
    mockNotificationService = require('../../src/services/notificationService').notificationService;
    mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    
    // Default mock implementations
    mockNotificationService.sendNotification.mockResolvedValue({
      success: true,
      messageId: 'msg_test_123'
    });
    
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          orderId: 'esim_test_123',
          trackingId: 'track_test_123',
          activationCodes: ['ACT123456'],
          qrCodes: ['data:image/png;base64,test'],
          downloadUrls: ['https://esim.example.com/download/test'],
          estimatedDelivery: new Date(Date.now() + 86400000).toISOString()
        }
      })
    } as Response);
  });

  describe('shouldOrderESIM', () => {
    it('should return true for business services', () => {
      expect(esimIntegrationService.shouldOrderESIM('business', 'starter')).toBe(true);
      expect(esimIntegrationService.shouldOrderESIM('business', 'professional')).toBe(true);
      expect(esimIntegrationService.shouldOrderESIM('business', 'enterprise')).toBe(true);
      expect(esimIntegrationService.shouldOrderESIM('business', 'custom')).toBe(true);
    });

    it('should return true for healthcare professional and enterprise', () => {
      expect(esimIntegrationService.shouldOrderESIM('healthcare', 'professional')).toBe(true);
      expect(esimIntegrationService.shouldOrderESIM('healthcare', 'enterprise')).toBe(true);
    });

    it('should return true for legal midsize and enterprise', () => {
      expect(esimIntegrationService.shouldOrderESIM('legal', 'midsize')).toBe(true);
      expect(esimIntegrationService.shouldOrderESIM('legal', 'enterprise')).toBe(true);
    });

    it('should return false for individual/solo plans', () => {
      expect(esimIntegrationService.shouldOrderESIM('healthcare', 'individual')).toBe(false);
      expect(esimIntegrationService.shouldOrderESIM('legal', 'solo')).toBe(false);
    });

    it('should return false for small plans', () => {
      expect(esimIntegrationService.shouldOrderESIM('healthcare', 'small')).toBe(false);
      expect(esimIntegrationService.shouldOrderESIM('legal', 'small')).toBe(false);
    });
  });

  describe('createESIMOrder', () => {
    const mockOrderRequest = {
      invoiceId: 'in_test_123',
      customerId: 'cus_test_123',
      serviceType: 'business' as const,
      planTier: 'starter',
      customerEmail: 'test@example.com',
      customerPhone: '+1234567890',
      businessName: 'Test Business',
      quantity: 1,
      region: 'US',
      dataPlan: 'Business Starter - 5GB',
      duration: '30 days'
    };

    it('should create eSIM order successfully', async () => {
      // Act
      const result = await esimIntegrationService.createESIMOrder(mockOrderRequest);

      // Assert
      expect(result.success).toBe(true);
      expect(result.orderId).toBe('esim_test_123');
      expect(result.trackingId).toBe('track_test_123');
      expect(result.activationCodes).toEqual(['ACT123456']);
      expect(result.qrCodes).toEqual(['data:image/png;base64,test']);
      expect(result.downloadUrls).toEqual(['https://esim.example.com/download/test']);
      expect(result.estimatedDelivery).toBeInstanceOf(Date);
    });

    it('should not create eSIM order for non-eligible services', async () => {
      // Arrange
      const request = { ...mockOrderRequest, serviceType: 'healthcare' as const, planTier: 'individual' };

      // Act
      const result = await esimIntegrationService.createESIMOrder(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('eSIM ordering not required');
    });

    it('should handle API errors gracefully', async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ error: 'API Error' })
      } as Response);

      // Act
      const result = await esimIntegrationService.createESIMOrder(mockOrderRequest);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('eSIM API error');
    });

    it('should handle network errors gracefully', async () => {
      // Arrange
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      // Act
      const result = await esimIntegrationService.createESIMOrder(mockOrderRequest);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });

    it('should include correct headers in API request', async () => {
      // Act
      await esimIntegrationService.createESIMOrder(mockOrderRequest);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/orders'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ',
            'X-Platform': 'tetrix'
          },
          body: expect.stringContaining('"serviceType":"business"')
        })
      );
    });
  });

  describe('getActivationDetails', () => {
    it('should retrieve activation details successfully', async () => {
      // Arrange
      const orderId = 'esim_test_123';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            orderId: 'esim_test_123',
            activationCode: 'ACT123456',
            qrCode: 'data:image/png;base64,test',
            downloadUrl: 'https://esim.example.com/download/test',
            deviceInfo: { model: 'iPhone 12' },
            expiresAt: new Date(Date.now() + 86400000).toISOString()
          }
        })
      } as Response);

      // Act
      const result = await esimIntegrationService.getActivationDetails(orderId);

      // Assert
      expect(result).toBeDefined();
      expect(result!.orderId).toBe('esim_test_123');
      expect(result!.activationCode).toBe('ACT123456');
      expect(result!.qrCode).toBe('data:image/png;base64,test');
      expect(result!.downloadUrl).toBe('https://esim.example.com/download/test');
      expect(result!.deviceInfo).toEqual({ model: 'iPhone 12' });
      expect(result!.expiresAt).toBeInstanceOf(Date);
    });

    it('should return null on API error', async () => {
      // Arrange
      const orderId = 'esim_test_123';
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ error: 'Order not found' })
      } as Response);

      // Act
      const result = await esimIntegrationService.getActivationDetails(orderId);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null on network error', async () => {
      // Arrange
      const orderId = 'esim_test_123';
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      // Act
      const result = await esimIntegrationService.getActivationDetails(orderId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('sendActivationDetails', () => {
    const mockActivationDetails = {
      orderId: 'esim_test_123',
      activationCode: 'ACT123456',
      qrCode: 'data:image/png;base64,test',
      downloadUrl: 'https://esim.example.com/download/test',
      deviceInfo: { model: 'iPhone 12' },
      expiresAt: new Date(Date.now() + 86400000)
    };

    it('should send activation details via email and SMS', async () => {
      // Act
      const result = await esimIntegrationService.sendActivationDetails(
        'test@example.com',
        '+1234567890',
        mockActivationDetails,
        'business'
      );

      // Assert
      expect(result.email).toBe(true);
      expect(result.sms).toBe(true);
      expect(mockNotificationService.sendNotification).toHaveBeenCalledTimes(2);
    });

    it('should send only email when phone is not provided', async () => {
      // Act
      const result = await esimIntegrationService.sendActivationDetails(
        'test@example.com',
        undefined,
        mockActivationDetails,
        'business'
      );

      // Assert
      expect(result.email).toBe(true);
      expect(result.sms).toBe(false);
      expect(mockNotificationService.sendNotification).toHaveBeenCalledTimes(1);
    });

    it('should send only SMS when email is not provided', async () => {
      // Act
      const result = await esimIntegrationService.sendActivationDetails(
        '',
        '+1234567890',
        mockActivationDetails,
        'business'
      );

      // Assert
      expect(result.email).toBe(false);
      expect(result.sms).toBe(true);
      expect(mockNotificationService.sendNotification).toHaveBeenCalledTimes(1);
    });

    it('should handle notification failures gracefully', async () => {
      // Arrange
      mockNotificationService.sendNotification
        .mockRejectedValueOnce(ERROR_SCENARIOS.notificationFailure) // Email fails
        .mockRejectedValueOnce(ERROR_SCENARIOS.notificationFailure); // SMS fails

      // Act
      const result = await esimIntegrationService.sendActivationDetails(
        'test@example.com',
        '+1234567890',
        mockActivationDetails,
        'business'
      );

      // Assert
      expect(result.email).toBe(false);
      expect(result.sms).toBe(false);
    });

    it('should generate correct email content', async () => {
      // Act
      await esimIntegrationService.sendActivationDetails(
        'test@example.com',
        '+1234567890',
        mockActivationDetails,
        'business'
      );

      // Assert
      const emailCall = mockNotificationService.sendNotification.mock.calls.find(
        call => call[0].channel === 'email'
      );
      expect(emailCall).toBeDefined();
      expect(emailCall[0].subject).toContain('TETRIX eSIM Activation Details');
      expect(emailCall[0].subject).toContain('Business Service');
      expect(emailCall[0].content.html).toContain('ACT123456');
      expect(emailCall[0].content.html).toContain('data:image/png;base64,test');
    });

    it('should generate correct SMS content', async () => {
      // Act
      await esimIntegrationService.sendActivationDetails(
        'test@example.com',
        '+1234567890',
        mockActivationDetails,
        'business'
      );

      // Assert
      const smsCall = mockNotificationService.sendNotification.mock.calls.find(
        call => call[0].channel === 'sms'
      );
      expect(smsCall).toBeDefined();
      expect(smsCall[0].content).toContain('eSIM is ready!');
      expect(smsCall[0].content).toContain('ACT123456');
      expect(smsCall[0].content).toContain('https://esim.example.com/download/test');
    });
  });

  describe('Service-Specific Configurations', () => {
    it('should return correct configuration for healthcare professional', () => {
      const config = (esimIntegrationService as any).getESIMConfiguration('healthcare', 'professional');
      expect(config.esimType).toBe('healthcare_professional');
      expect(config.features).toContain('voice');
      expect(config.features).toContain('sms');
      expect(config.features).toContain('data');
      expect(config.features).toContain('secure_messaging');
      expect(config.priority).toBe('high');
    });

    it('should return correct configuration for legal enterprise', () => {
      const config = (esimIntegrationService as any).getESIMConfiguration('legal', 'enterprise');
      expect(config.esimType).toBe('legal_enterprise');
      expect(config.features).toContain('voice');
      expect(config.features).toContain('sms');
      expect(config.features).toContain('data');
      expect(config.features).toContain('secure_communication');
      expect(config.features).toContain('video_calls');
      expect(config.features).toContain('priority_support');
      expect(config.priority).toBe('critical');
    });

    it('should return correct configuration for business starter', () => {
      const config = (esimIntegrationService as any).getESIMConfiguration('business', 'starter');
      expect(config.esimType).toBe('business_starter');
      expect(config.features).toContain('voice');
      expect(config.features).toContain('sms');
      expect(config.features).toContain('data');
      expect(config.priority).toBe('normal');
    });

    it('should return default configuration for unknown service/tier', () => {
      const config = (esimIntegrationService as any).getESIMConfiguration('unknown', 'unknown');
      expect(config.esimType).toBe('standard');
      expect(config.features).toEqual(['voice', 'sms', 'data']);
      expect(config.priority).toBe('normal');
    });
  });
});
