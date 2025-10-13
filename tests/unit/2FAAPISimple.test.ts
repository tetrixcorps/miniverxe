// Simple unit tests for 2FA API endpoints
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

describe('2FA API Endpoints - Simple Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v2/2fa/initiate', () => {
    it('should initiate verification successfully', async () => {
      // Mock the service response
      mockEnterprise2FAService.initiateVerification.mockResolvedValue({
        verificationId: 'test-verification-id',
        phoneNumber: '+1234567890',
        method: 'sms',
        status: 'pending',
        timeoutSecs: 300,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 300000).toISOString(),
        attempts: 0,
        maxAttempts: 3
      });

      // Create a mock request
      const request = new Request('http://localhost/api/v2/2fa/initiate', {
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

      // Call the API handler
      const response = await initiatePOST({ request, locals: {} });
      const result = await response.json();

      // Assertions
      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.verificationId).toBe('test-verification-id');
      expect(result.message).toBe('Verification SMS sent successfully');
      expect(mockEnterprise2FAService.initiateVerification).toHaveBeenCalledWith({
        phoneNumber: '+1234567890',
        method: 'sms',
        customCode: undefined,
        timeoutSecs: 300,
        userAgent: 'test-user-agent',
        ipAddress: '127.0.0.1',
        sessionId: 'test-session'
      });
    });

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
  });

  describe('POST /api/v2/2fa/verify', () => {
    it('should verify code successfully', async () => {
      // Mock the service response
      mockEnterprise2FAService.verifyCode.mockResolvedValue({
        verified: true,
        verificationId: 'test-verification-id',
        phoneNumber: '+1234567890',
        responseCode: 'accepted',
        timestamp: new Date().toISOString(),
        riskLevel: 'low'
      });

      const request = new Request('http://localhost/api/v2/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          verificationId: 'test-verification-id',
          code: '123456',
          phoneNumber: '+1234567890'
        })
      });

      const response = await verifyPOST({ request, locals: {} });
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.verified).toBe(true);
      expect(result.verificationId).toBe('test-verification-id');
      expect(result.token).toBeDefined();
      expect(mockEnterprise2FAService.verifyCode).toHaveBeenCalledWith(
        'test-verification-id',
        '123456',
        '+1234567890'
      );
    });

    it('should handle missing required fields', async () => {
      const request = new Request('http://localhost/api/v2/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          verificationId: 'test-verification-id'
        })
      });

      const response = await verifyPOST({ request, locals: {} });
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error).toBe('verificationId, code, and phoneNumber are required');
    });

    it('should handle invalid code format', async () => {
      const request = new Request('http://localhost/api/v2/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          verificationId: 'test-verification-id',
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
        verificationId: 'test-verification-id',
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
          verificationId: 'test-verification-id',
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

    it('should handle service errors', async () => {
      mockEnterprise2FAService.verifyCode.mockRejectedValue(new Error('Service error'));

      const request = new Request('http://localhost/api/v2/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          verificationId: 'test-verification-id',
          code: '123456',
          phoneNumber: '+1234567890'
        })
      });

      const response = await verifyPOST({ request, locals: {} });
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to verify code');
    });
  });
});
