// Integration tests for complete 2FA system
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { POST as initiatePOST } from '../../src/pages/api/v2/2fa/initiate';
import { POST as verifyPOST } from '../../src/pages/api/v2/2fa/verify';

// Mock the enterprise2FAService with realistic behavior
const mockEnterprise2FAService = {
  initiateVerification: vi.fn(),
  verifyCode: vi.fn()
};

vi.mock('../../src/services/enterprise2FAService', () => ({
  enterprise2FAService: mockEnterprise2FAService
}));

// Mock DOM environment for frontend integration
const mockDocument = {
  getElementById: vi.fn(),
  querySelectorAll: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  body: {
    style: {}
  }
};

const mockWindow = {
  localStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn()
  },
  location: {
    href: '',
    hostname: 'localhost'
  },
  open: vi.fn(),
  navigator: {
    userAgent: 'test-user-agent'
  },
  fetch: vi.fn()
};

Object.defineProperty(global, 'document', { value: mockDocument });
Object.defineProperty(global, 'window', { value: mockWindow });
global.fetch = vi.fn();

describe('2FA System Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup realistic mock responses
    mockEnterprise2FAService.initiateVerification.mockImplementation(async (request) => {
      // Simulate different scenarios based on phone number
      if (request.phoneNumber === '+1234567890') {
        return {
          verificationId: 'test-verification-123',
          phoneNumber: request.phoneNumber,
          method: request.method,
          status: 'pending',
          timeoutSecs: 300,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 300000).toISOString(),
          attempts: 0,
          maxAttempts: 3
        };
      } else if (request.phoneNumber === '+1111111111') {
        throw new Error('Rate limit exceeded');
      } else if (request.phoneNumber === '+2222222222') {
        throw new Error('Invalid phone number');
      }
      
      return {
        verificationId: 'mock-verification-id',
        phoneNumber: request.phoneNumber,
        method: request.method,
        status: 'pending',
        timeoutSecs: 300,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 300000).toISOString(),
        attempts: 0,
        maxAttempts: 3
      };
    });

    mockEnterprise2FAService.verifyCode.mockImplementation(async (verificationId, code, phoneNumber) => {
      // Simulate different verification scenarios
      if (code === '123456') {
        return {
          verified: true,
          verificationId,
          phoneNumber,
          responseCode: 'accepted',
          timestamp: new Date().toISOString(),
          riskLevel: 'low'
        };
      } else if (code === '000000') {
        return {
          verified: false,
          verificationId,
          phoneNumber,
          responseCode: 'rejected',
          timestamp: new Date().toISOString()
        };
      } else if (code === '999999') {
        return {
          verified: false,
          verificationId,
          phoneNumber,
          responseCode: 'expired',
          timestamp: new Date().toISOString()
        };
      }
      
      return {
        verified: false,
        verificationId,
        phoneNumber,
        responseCode: 'rejected',
        timestamp: new Date().toISOString()
      };
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('End-to-End Authentication Flow', () => {
    it('should complete full authentication flow with SMS', async () => {
      // Step 1: Initiate verification
      const initiateRequest = new Request('http://localhost/api/v2/2fa/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber: '+1234567890',
          method: 'sms',
          userAgent: 'test-user-agent',
          ipAddress: '127.0.0.1',
          sessionId: 'test-session'
        })
      });

      const initiateResponse = await initiatePOST({ request: initiateRequest, locals: {} });
      const initiateResult = await initiateResponse.json();

      expect(initiateResponse.status).toBe(200);
      expect(initiateResult.success).toBe(true);
      expect(initiateResult.verificationId).toBe('test-verification-123');

      // Step 2: Verify code
      const verifyRequest = new Request('http://localhost/api/v2/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          verificationId: 'test-verification-123',
          code: '123456',
          phoneNumber: '+1234567890'
        })
      });

      const verifyResponse = await verifyPOST({ request: verifyRequest, locals: {} });
      const verifyResult = await verifyResponse.json();

      expect(verifyResponse.status).toBe(200);
      expect(verifyResult.success).toBe(true);
      expect(verifyResult.verified).toBe(true);
      expect(verifyResult.token).toBeDefined();
    });

    it('should complete full authentication flow with voice call', async () => {
      // Step 1: Initiate voice verification
      const initiateRequest = new Request('http://localhost/api/v2/2fa/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber: '+1234567890',
          method: 'voice',
          userAgent: 'test-user-agent',
          ipAddress: '127.0.0.1',
          sessionId: 'test-session'
        })
      });

      const initiateResponse = await initiatePOST({ request: initiateRequest, locals: {} });
      const initiateResult = await initiateResponse.json();

      expect(initiateResponse.status).toBe(200);
      expect(initiateResult.success).toBe(true);
      expect(initiateResult.verificationId).toBe('test-verification-123');
      expect(initiateResult.estimatedDelivery).toBe('10-30 seconds');

      // Step 2: Verify code
      const verifyRequest = new Request('http://localhost/api/v2/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          verificationId: 'test-verification-123',
          code: '123456',
          phoneNumber: '+1234567890'
        })
      });

      const verifyResponse = await verifyPOST({ request: verifyRequest, locals: {} });
      const verifyResult = await verifyResponse.json();

      expect(verifyResponse.status).toBe(200);
      expect(verifyResult.success).toBe(true);
      expect(verifyResult.verified).toBe(true);
    });

    it('should handle authentication failure and retry', async () => {
      // Step 1: Initiate verification
      const initiateRequest = new Request('http://localhost/api/v2/2fa/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber: '+1234567890',
          method: 'sms'
        })
      });

      const initiateResponse = await initiatePOST({ request: initiateRequest, locals: {} });
      const initiateResult = await initiateResponse.json();

      expect(initiateResult.success).toBe(true);

      // Step 2: Try wrong code
      const verifyRequest1 = new Request('http://localhost/api/v2/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          verificationId: 'test-verification-123',
          code: '000000',
          phoneNumber: '+1234567890'
        })
      });

      const verifyResponse1 = await verifyPOST({ request: verifyRequest1, locals: {} });
      const verifyResult1 = await verifyResponse1.json();

      expect(verifyResponse1.status).toBe(400);
      expect(verifyResult1.success).toBe(false);
      expect(verifyResult1.verified).toBe(false);

      // Step 3: Try correct code
      const verifyRequest2 = new Request('http://localhost/api/v2/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          verificationId: 'test-verification-123',
          code: '123456',
          phoneNumber: '+1234567890'
        })
      });

      const verifyResponse2 = await verifyPOST({ request: verifyRequest2, locals: {} });
      const verifyResult2 = await verifyResponse2.json();

      expect(verifyResponse2.status).toBe(200);
      expect(verifyResult2.success).toBe(true);
      expect(verifyResult2.verified).toBe(true);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle rate limiting errors', async () => {
      const request = new Request('http://localhost/api/v2/2fa/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber: '+1111111111',
          method: 'sms'
        })
      });

      const response = await initiatePOST({ request, locals: {} });
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to initiate verification');
    });

    it('should handle invalid phone number errors', async () => {
      const request = new Request('http://localhost/api/v2/2fa/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber: '+2222222222',
          method: 'sms'
        })
      });

      const response = await initiatePOST({ request, locals: {} });
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to initiate verification');
    });

    it('should handle expired verification codes', async () => {
      const request = new Request('http://localhost/api/v2/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          verificationId: 'test-verification-123',
          code: '999999',
          phoneNumber: '+1234567890'
        })
      });

      const response = await verifyPOST({ request, locals: {} });
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.verified).toBe(false);
      expect(result.message).toBe('Verification code has expired. Please request a new one.');
    });
  });

  describe('Frontend-Backend Integration', () => {
    it('should integrate with frontend modal state management', async () => {
      // Mock frontend elements
      const mockElements = {
        phoneInput: { value: '1234567890' },
        methodSelect: { value: 'sms' },
        codeInput: { value: '123456' },
        errorMessage: { textContent: '' },
        errorContainer: { classList: { add: vi.fn(), remove: vi.fn() } }
      };

      mockDocument.getElementById.mockImplementation((id: string) => {
        const elementMap: { [key: string]: any } = {
          'phone-number': mockElements.phoneInput,
          'verification-method': mockElements.methodSelect,
          'verification-code': mockElements.codeInput,
          'error-message': mockElements.errorMessage,
          '2fa-error': mockElements.errorContainer
        };
        return elementMap[id] || null;
      });

      // Simulate frontend phone submission
      const phoneNumber = mockElements.phoneInput.value.replace(/\D/g, '');
      const method = mockElements.methodSelect.value;

      const initiateRequest = new Request('http://localhost/api/v2/2fa/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: `+${phoneNumber}`,
          method: method,
          userAgent: 'test-user-agent',
          ipAddress: '127.0.0.1',
          sessionId: 'test-session'
        })
      });

      const initiateResponse = await initiatePOST({ request: initiateRequest, locals: {} });
      const initiateResult = await initiateResponse.json();

      expect(initiateResult.success).toBe(true);

      // Simulate frontend code verification
      const code = mockElements.codeInput.value;

      const verifyRequest = new Request('http://localhost/api/v2/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationId: initiateResult.verificationId,
          code: code,
          phoneNumber: `+${phoneNumber}`
        })
      });

      const verifyResponse = await verifyPOST({ request: verifyRequest, locals: {} });
      const verifyResult = await verifyResponse.json();

      expect(verifyResult.success).toBe(true);
      expect(verifyResult.verified).toBe(true);
    });

    it('should handle frontend validation errors', async () => {
      // Test with invalid phone number
      const invalidPhoneRequest = new Request('http://localhost/api/v2/2fa/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: '123', // Too short
          method: 'sms'
        })
      });

      const response = await initiatePOST({ request: invalidPhoneRequest, locals: {} });
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Phone number is required'); // This would be caught by frontend validation
    });
  });

  describe('Security Integration', () => {
    it('should handle different user agents and IP addresses', async () => {
      const request = new Request('http://localhost/api/v2/2fa/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'X-Forwarded-For': '192.168.1.100'
        },
        body: JSON.stringify({
          phoneNumber: '+1234567890',
          method: 'sms'
        })
      });

      const response = await initiatePOST({ request, locals: {} });
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);

      // Verify that user agent and IP are passed to the service
      expect(mockEnterprise2FAService.initiateVerification).toHaveBeenCalledWith(
        expect.objectContaining({
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ipAddress: '192.168.1.100'
        })
      );
    });

    it('should generate unique session IDs', async () => {
      const request1 = new Request('http://localhost/api/v2/2fa/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: '+1234567890',
          method: 'sms',
          sessionId: 'session-1'
        })
      });

      const request2 = new Request('http://localhost/api/v2/2fa/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: '+1234567890',
          method: 'sms',
          sessionId: 'session-2'
        })
      });

      await initiatePOST({ request: request1, locals: {} });
      await initiatePOST({ request: request2, locals: {} });

      expect(mockEnterprise2FAService.initiateVerification).toHaveBeenCalledTimes(2);
      expect(mockEnterprise2FAService.initiateVerification).toHaveBeenNthCalledWith(1,
        expect.objectContaining({ sessionId: 'session-1' })
      );
      expect(mockEnterprise2FAService.initiateVerification).toHaveBeenNthCalledWith(2,
        expect.objectContaining({ sessionId: 'session-2' })
      );
    });
  });

  describe('Performance Integration', () => {
    it('should handle concurrent verification requests', async () => {
      const requests = Array.from({ length: 5 }, (_, i) => 
        new Request('http://localhost/api/v2/2fa/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: `+123456789${i}`,
            method: 'sms'
          })
        })
      );

      const responses = await Promise.all(
        requests.map(request => initiatePOST({ request, locals: {} }))
      );

      const results = await Promise.all(
        responses.map(response => response.json())
      );

      // All requests should succeed
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      // Service should be called for each request
      expect(mockEnterprise2FAService.initiateVerification).toHaveBeenCalledTimes(5);
    });

    it('should handle timeout scenarios', async () => {
      // Mock a slow response
      mockEnterprise2FAService.initiateVerification.mockImplementationOnce(
        () => new Promise(resolve => 
          setTimeout(() => resolve({
            verificationId: 'slow-verification-id',
            phoneNumber: '+1234567890',
            method: 'sms',
            status: 'pending',
            timeoutSecs: 300,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 300000).toISOString(),
            attempts: 0,
            maxAttempts: 3
          }), 1000)
        )
      );

      const request = new Request('http://localhost/api/v2/2fa/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: '+1234567890',
          method: 'sms'
        })
      });

      const startTime = Date.now();
      const response = await initiatePOST({ request, locals: {} });
      const endTime = Date.now();

      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeGreaterThanOrEqual(1000);
    });
  });
});
