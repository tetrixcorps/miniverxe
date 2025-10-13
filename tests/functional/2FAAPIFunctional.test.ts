// Functional tests for 2FA API endpoints
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock the enterprise2FAService
const mockEnterprise2FAService = {
  initiateVerification: jest.fn(),
  verifyCode: jest.fn()
};

jest.mock('../../src/services/enterprise2FAService', () => ({
  enterprise2FAService: mockEnterprise2FAService
}));

// Import the API handlers
import { POST as initiatePOST } from '../../src/pages/api/v2/2fa/initiate';
import { POST as verifyPOST } from '../../src/pages/api/v2/2fa/verify';

describe('2FA API Functional Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Authentication Flow', () => {
    it('should complete full SMS authentication flow', async () => {
      // Step 1: Mock successful initiation
      mockEnterprise2FAService.initiateVerification.mockResolvedValue({
        verificationId: 'test-verification-123',
        phoneNumber: '+1234567890',
        method: 'sms',
        status: 'pending',
        timeoutSecs: 300,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 300000).toISOString(),
        attempts: 0,
        maxAttempts: 3
      });

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

      // Step 2: Mock successful verification
      mockEnterprise2FAService.verifyCode.mockResolvedValue({
        verified: true,
        verificationId: 'test-verification-123',
        phoneNumber: '+1234567890',
        responseCode: 'accepted',
        timestamp: new Date().toISOString(),
        riskLevel: 'low'
      });

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

    it('should complete voice call authentication flow', async () => {
      // Mock voice call initiation
      mockEnterprise2FAService.initiateVerification.mockResolvedValue({
        verificationId: 'test-voice-verification-123',
        phoneNumber: '+1234567890',
        method: 'voice',
        status: 'pending',
        timeoutSecs: 300,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 300000).toISOString(),
        attempts: 0,
        maxAttempts: 3
      });

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
      expect(initiateResult.verificationId).toBe('test-voice-verification-123');
      expect(initiateResult.estimatedDelivery).toBe('10-30 seconds');
    });

    it('should handle authentication failure and retry', async () => {
      // Step 1: Successful initiation
      mockEnterprise2FAService.initiateVerification.mockResolvedValue({
        verificationId: 'test-verification-123',
        phoneNumber: '+1234567890',
        method: 'sms',
        status: 'pending',
        timeoutSecs: 300,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 300000).toISOString(),
        attempts: 0,
        maxAttempts: 3
      });

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

      // Step 2: Wrong code attempt
      mockEnterprise2FAService.verifyCode.mockResolvedValueOnce({
        verified: false,
        verificationId: 'test-verification-123',
        phoneNumber: '+1234567890',
        responseCode: 'rejected',
        timestamp: new Date().toISOString()
      });

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

      // Step 3: Correct code attempt
      mockEnterprise2FAService.verifyCode.mockResolvedValueOnce({
        verified: true,
        verificationId: 'test-verification-123',
        phoneNumber: '+1234567890',
        responseCode: 'accepted',
        timestamp: new Date().toISOString(),
        riskLevel: 'low'
      });

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

  describe('Error Handling', () => {
    it('should handle missing phone number', async () => {
      const request = new Request('http://localhost/api/v2/2fa/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          method: 'sms'
        })
      });

      const response = await initiatePOST({ request, locals: {} });
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Phone number is required');
    });

    it('should handle invalid method', async () => {
      const request = new Request('http://localhost/api/v2/2fa/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber: '+1234567890',
          method: 'invalid-method'
        })
      });

      const response = await initiatePOST({ request, locals: {} });
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid method. Must be one of: sms, voice, flashcall, whatsapp');
    });

    it('should handle service errors', async () => {
      mockEnterprise2FAService.initiateVerification.mockRejectedValue(new Error('Service error'));

      const request = new Request('http://localhost/api/v2/2fa/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber: '+1234567890',
          method: 'sms'
        })
      });

      const response = await initiatePOST({ request, locals: {} });
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to initiate verification');
    });

    it('should handle invalid code format', async () => {
      const request = new Request('http://localhost/api/v2/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          verificationId: 'test-verification-123',
          code: '12345', // Invalid - only 5 digits
          phoneNumber: '+1234567890'
        })
      });

      const response = await verifyPOST({ request, locals: {} });
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Code must be 6 digits');
    });

    it('should handle verification failure', async () => {
      mockEnterprise2FAService.verifyCode.mockResolvedValue({
        verified: false,
        verificationId: 'test-verification-123',
        phoneNumber: '+1234567890',
        responseCode: 'rejected',
        timestamp: new Date().toISOString()
      });

      const request = new Request('http://localhost/api/v2/2fa/verify', {
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

      const response = await verifyPOST({ request, locals: {} });
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.verified).toBe(false);
      expect(result.message).toBe('Invalid verification code. Please try again.');
    });
  });

  describe('Request Parsing', () => {
    it('should handle parsed body from middleware', async () => {
      mockEnterprise2FAService.initiateVerification.mockResolvedValue({
        verificationId: 'test-verification-123',
        phoneNumber: '+1234567890',
        method: 'sms',
        status: 'pending',
        timeoutSecs: 300,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 300000).toISOString(),
        attempts: 0,
        maxAttempts: 3
      });

      const request = new Request('http://localhost/api/v2/2fa/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber: '+1234567890',
          method: 'sms'
        })
      });

      const locals = {
        bodyParsed: true,
        parsedBody: {
          phoneNumber: '+1234567890',
          method: 'sms'
        }
      };

      const response = await initiatePOST({ request, locals });
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
    });

    it('should fallback to direct parsing when middleware fails', async () => {
      mockEnterprise2FAService.initiateVerification.mockResolvedValue({
        verificationId: 'test-verification-123',
        phoneNumber: '+1234567890',
        method: 'sms',
        status: 'pending',
        timeoutSecs: 300,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 300000).toISOString(),
        attempts: 0,
        maxAttempts: 3
      });

      const request = new Request('http://localhost/api/v2/2fa/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber: '+1234567890',
          method: 'sms'
        })
      });

      const locals = {
        bodyParsed: false
      };

      const response = await initiatePOST({ request, locals });
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
    });
  });

  describe('Response Format Validation', () => {
    it('should return properly formatted success response', async () => {
      mockEnterprise2FAService.initiateVerification.mockResolvedValue({
        verificationId: 'test-verification-123',
        phoneNumber: '+1234567890',
        method: 'sms',
        status: 'pending',
        timeoutSecs: 300,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 300000).toISOString(),
        attempts: 0,
        maxAttempts: 3
      });

      const request = new Request('http://localhost/api/v2/2fa/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber: '+1234567890',
          method: 'sms'
        })
      });

      const response = await initiatePOST({ request, locals: {} });
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('verificationId');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('estimatedDelivery');
    });

    it('should return properly formatted error response', async () => {
      const request = new Request('http://localhost/api/v2/2fa/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          method: 'sms'
        })
      });

      const response = await initiatePOST({ request, locals: {} });
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toHaveProperty('success', false);
      expect(result).toHaveProperty('error');
      expect(result).toHaveProperty('status', 400);
      expect(result).toHaveProperty('timestamp');
    });
  });
});
