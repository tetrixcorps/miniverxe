// Unit tests for 2FA API endpoints
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { POST as initiatePOST } from '../../src/pages/api/v2/2fa/initiate';
import { POST as verifyPOST } from '../../src/pages/api/v2/2fa/verify';

// Mock the enterprise2FAService
const mockEnterprise2FAService = {
  initiateVerification: vi.fn(),
  verifyCode: vi.fn()
};

vi.mock('../../src/services/enterprise2FAService', () => ({
  enterprise2FAService: mockEnterprise2FAService
}));

describe('2FA API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/v2/2fa/initiate', () => {
    it('should initiate verification successfully', async () => {
      const mockVerification = {
        verificationId: 'test-verification-id',
        phoneNumber: '+1234567890',
        method: 'sms',
        status: 'pending',
        timeoutSecs: 300,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 300000).toISOString(),
        attempts: 0,
        maxAttempts: 3
      };

      mockEnterprise2FAService.initiateVerification.mockResolvedValue(mockVerification);

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

      const response = await initiatePOST({ request, locals: {} });
      const result = await response.json();

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

    it('should handle different verification methods', async () => {
      const mockVerification = {
        verificationId: 'test-verification-id',
        phoneNumber: '+1234567890',
        method: 'voice',
        status: 'pending',
        timeoutSecs: 300,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 300000).toISOString(),
        attempts: 0,
        maxAttempts: 3
      };

      mockEnterprise2FAService.initiateVerification.mockResolvedValue(mockVerification);

      const request = new Request('http://localhost/api/v2/2fa/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber: '+1234567890',
          method: 'voice',
          timeoutSecs: 600
        })
      });

      const response = await initiatePOST({ request, locals: {} });
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.estimatedDelivery).toBe('10-30 seconds');
      expect(mockEnterprise2FAService.initiateVerification).toHaveBeenCalledWith({
        phoneNumber: '+1234567890',
        method: 'voice',
        customCode: undefined,
        timeoutSecs: 600,
        userAgent: 'unknown',
        ipAddress: 'unknown',
        sessionId: undefined
      });
    });
  });

  describe('POST /api/v2/2fa/verify', () => {
    it('should verify code successfully', async () => {
      const mockVerificationResult = {
        verified: true,
        verificationId: 'test-verification-id',
        phoneNumber: '+1234567890',
        responseCode: 'accepted',
        timestamp: new Date().toISOString(),
        riskLevel: 'low'
      };

      mockEnterprise2FAService.verifyCode.mockResolvedValue(mockVerificationResult);

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
      const mockVerificationResult = {
        verified: false,
        verificationId: 'test-verification-id',
        phoneNumber: '+1234567890',
        responseCode: 'rejected',
        timestamp: new Date().toISOString()
      };

      mockEnterprise2FAService.verifyCode.mockResolvedValue(mockVerificationResult);

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

    it('should handle different response codes', async () => {
      const mockVerificationResult = {
        verified: false,
        verificationId: 'test-verification-id',
        phoneNumber: '+1234567890',
        responseCode: 'expired',
        timestamp: new Date().toISOString()
      };

      mockEnterprise2FAService.verifyCode.mockResolvedValue(mockVerificationResult);

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
      expect(result.message).toBe('Verification code has expired. Please request a new one.');
    });
  });

  describe('Request Body Parsing', () => {
    it('should handle parsed body from middleware', async () => {
      const mockVerification = {
        verificationId: 'test-verification-id',
        phoneNumber: '+1234567890',
        method: 'sms',
        status: 'pending',
        timeoutSecs: 300,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 300000).toISOString(),
        attempts: 0,
        maxAttempts: 3
      };

      mockEnterprise2FAService.initiateVerification.mockResolvedValue(mockVerification);

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
      const mockVerification = {
        verificationId: 'test-verification-id',
        phoneNumber: '+1234567890',
        method: 'sms',
        status: 'pending',
        timeoutSecs: 300,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 300000).toISOString(),
        attempts: 0,
        maxAttempts: 3
      };

      mockEnterprise2FAService.initiateVerification.mockResolvedValue(mockVerification);

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
});
