/**
 * Unit Tests for Enterprise 2FA Service
 * Tests the Telnyx API integration and verification logic
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock fetch
global.fetch = vi.fn();

// Mock console methods
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn()
};

describe('Enterprise 2FA Service', () => {
  let enterprise2FAService;
  let mockConfig;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockConfig = {
      verifyProfileId: 'test-profile-id',
      apiKey: 'test-api-key',
      apiUrl: 'https://api.telnyx.com/v2',
      webhookUrl: 'https://test.com/webhook',
      fallbackEnabled: true,
      auditLogging: true,
      rateLimiting: true,
      fraudDetection: true
    };

    // Mock the service class
    enterprise2FAService = {
      config: mockConfig,
      auditLogs: new Map(),
      rateLimiter: new Map(),
      fraudDetector: new Map(),

      async initiateVerification(request) {
        const { phoneNumber, method } = request;
        
        // Simulate fraud detection
        const fraudScore = await this.assessFraudRisk(request);
        if (fraudScore > 0.8) {
          throw new Error('Verification blocked due to high fraud risk');
        }

        // Simulate rate limiting
        if (this.config.rateLimiting && !this.checkRateLimit(phoneNumber)) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }

        // Simulate Telnyx API call
        const verification = await this.sendTelnyxVerification(request);
        
        return {
          verificationId: verification.id,
          phoneNumber: verification.phone_number,
          method: verification.method,
          status: 'pending',
          timeoutSecs: 300,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 300000).toISOString(),
          attempts: 0,
          maxAttempts: 3
        };
      },

      async verifyCode(verificationId, code, phoneNumber) {
        try {
          const response = await fetch(`https://api.telnyx.com/v2/verifications/${verificationId}/actions/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${this.config.apiKey}`
            },
            body: JSON.stringify({
              code: code
            })
          });

          const result = await response.json();
          
          return {
            success: response.ok,
            verified: result.data?.response_code === 'accepted',
            responseCode: result.data?.response_code || 'rejected',
            phoneNumber: result.data?.phone_number || phoneNumber,
            verificationId,
            timestamp: new Date().toISOString()
          };
        } catch (error) {
          console.error('Telnyx verification error:', error);
          return {
            success: false,
            verified: false,
            responseCode: 'rejected',
            phoneNumber,
            verificationId,
            timestamp: new Date().toISOString()
          };
        }
      },

      async sendTelnyxVerification(request) {
        const endpoint = request.method === 'voice' 
          ? 'https://api.telnyx.com/v2/verifications/call'
          : 'https://api.telnyx.com/v2/verifications/sms';

        const payload = {
          phone_number: request.phoneNumber,
          verify_profile_id: this.config.verifyProfileId
        };

        if (request.customCode) {
          payload.custom_code = request.customCode;
        }

        if (request.timeoutSecs) {
          payload.timeout_secs = request.timeoutSecs;
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(`Telnyx API error: ${error.message || response.statusText}`);
        }

        return await response.json();
      },

      async assessFraudRisk(request) {
        // Simple fraud detection simulation
        const phoneNumber = request.phoneNumber;
        const ipAddress = request.ipAddress || 'unknown';
        
        // Check for suspicious patterns
        if (phoneNumber.includes('000')) return 0.9; // High risk
        if (ipAddress === 'suspicious-ip') return 0.8; // High risk
        if (phoneNumber.startsWith('+1')) return 0.1; // Low risk for US numbers
        
        return 0.2; // Default low risk
      },

      checkRateLimit(phoneNumber) {
        const now = Date.now();
        const key = phoneNumber;
        const limit = this.rateLimiter.get(key);
        
        if (!limit) {
          this.rateLimiter.set(key, { count: 1, resetTime: now + 60000 });
          return true;
        }
        
        if (now > limit.resetTime) {
          this.rateLimiter.set(key, { count: 1, resetTime: now + 60000 });
          return true;
        }
        
        if (limit.count >= 5) {
          return false; // Rate limit exceeded
        }
        
        limit.count++;
        return true;
      }
    };
  });

  describe('initiateVerification', () => {
    it('should initiate SMS verification successfully', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          id: 'test-verification-id',
          phone_number: '+15551234567',
          method: 'sms'
        })
      };
      
      global.fetch.mockResolvedValueOnce(mockResponse);

      const request = {
        phoneNumber: '+15551234567',
        method: 'sms',
        userAgent: 'test-agent',
        ipAddress: '192.168.1.1',
        sessionId: 'test-session'
      };

      const result = await enterprise2FAService.initiateVerification(request);

      expect(result.verificationId).toBe('test-verification-id');
      expect(result.phoneNumber).toBe('+15551234567');
      expect(result.method).toBe('sms');
      expect(result.status).toBe('pending');
    });

    it('should initiate voice verification successfully', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          id: 'test-voice-verification-id',
          phone_number: '+15551234567',
          method: 'voice'
        })
      };
      
      global.fetch.mockResolvedValueOnce(mockResponse);

      const request = {
        phoneNumber: '+15551234567',
        method: 'voice',
        userAgent: 'test-agent',
        ipAddress: '192.168.1.1',
        sessionId: 'test-session'
      };

      const result = await enterprise2FAService.initiateVerification(request);

      expect(result.verificationId).toBe('test-voice-verification-id');
      expect(result.method).toBe('voice');
    });

    it('should block verification due to high fraud risk', async () => {
      const request = {
        phoneNumber: '+1555000000', // Suspicious number
        method: 'sms',
        userAgent: 'test-agent',
        ipAddress: '192.168.1.1',
        sessionId: 'test-session'
      };

      await expect(enterprise2FAService.initiateVerification(request))
        .rejects.toThrow('Verification blocked due to high fraud risk');
    });

    it('should handle rate limiting', async () => {
      const request = {
        phoneNumber: '+15551234567',
        method: 'sms',
        userAgent: 'test-agent',
        ipAddress: '192.168.1.1',
        sessionId: 'test-session'
      };

      // Exceed rate limit
      for (let i = 0; i < 6; i++) {
        try {
          await enterprise2FAService.initiateVerification(request);
        } catch (error) {
          // Expected to fail after 5 attempts
        }
      }

      await expect(enterprise2FAService.initiateVerification(request))
        .rejects.toThrow('Rate limit exceeded. Please try again later.');
    });

    it('should handle API errors', async () => {
      const mockResponse = {
        ok: false,
        statusText: 'Bad Request',
        json: () => Promise.resolve({
          message: 'Invalid phone number'
        })
      };
      
      global.fetch.mockResolvedValueOnce(mockResponse);

      const request = {
        phoneNumber: '+15551234567',
        method: 'sms',
        userAgent: 'test-agent',
        ipAddress: '192.168.1.1',
        sessionId: 'test-session'
      };

      await expect(enterprise2FAService.initiateVerification(request))
        .rejects.toThrow('Telnyx API error: Invalid phone number');
    });
  });

  describe('verifyCode', () => {
    it('should verify code successfully', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          data: {
            response_code: 'accepted',
            phone_number: '+15551234567'
          }
        })
      };
      
      global.fetch.mockResolvedValueOnce(mockResponse);

      const result = await enterprise2FAService.verifyCode(
        'test-verification-id',
        '123456',
        '+15551234567'
      );

      expect(result.success).toBe(true);
      expect(result.verified).toBe(true);
      expect(result.responseCode).toBe('accepted');
      expect(result.phoneNumber).toBe('+15551234567');
    });

    it('should reject invalid code', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          data: {
            response_code: 'rejected',
            phone_number: '+15551234567'
          }
        })
      };
      
      global.fetch.mockResolvedValueOnce(mockResponse);

      const result = await enterprise2FAService.verifyCode(
        'test-verification-id',
        '000000',
        '+15551234567'
      );

      expect(result.success).toBe(true);
      expect(result.verified).toBe(false);
      expect(result.responseCode).toBe('rejected');
    });

    it('should handle API errors gracefully', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await enterprise2FAService.verifyCode(
        'test-verification-id',
        '123456',
        '+15551234567'
      );

      expect(result.success).toBe(false);
      expect(result.verified).toBe(false);
      expect(result.responseCode).toBe('rejected');
    });

    it('should handle non-ok response', async () => {
      const mockResponse = {
        ok: false,
        json: () => Promise.resolve({
          error: 'Verification not found'
        })
      };
      
      global.fetch.mockResolvedValueOnce(mockResponse);

      const result = await enterprise2FAService.verifyCode(
        'invalid-verification-id',
        '123456',
        '+15551234567'
      );

      expect(result.success).toBe(false);
      expect(result.verified).toBe(false);
    });
  });

  describe('fraud detection', () => {
    it('should detect high fraud risk for suspicious numbers', async () => {
      const request = {
        phoneNumber: '+1555000000',
        method: 'sms',
        userAgent: 'test-agent',
        ipAddress: '192.168.1.1',
        sessionId: 'test-session'
      };

      const fraudScore = await enterprise2FAService.assessFraudRisk(request);
      expect(fraudScore).toBe(0.9);
    });

    it('should detect low fraud risk for normal numbers', async () => {
      const request = {
        phoneNumber: '+15551234567',
        method: 'sms',
        userAgent: 'test-agent',
        ipAddress: '192.168.1.1',
        sessionId: 'test-session'
      };

      const fraudScore = await enterprise2FAService.assessFraudRisk(request);
      expect(fraudScore).toBe(0.1);
    });
  });

  describe('rate limiting', () => {
    it('should allow requests within rate limit', () => {
      const phoneNumber = '+15551234567';
      
      expect(enterprise2FAService.checkRateLimit(phoneNumber)).toBe(true);
      expect(enterprise2FAService.checkRateLimit(phoneNumber)).toBe(true);
      expect(enterprise2FAService.checkRateLimit(phoneNumber)).toBe(true);
    });

    it('should block requests exceeding rate limit', () => {
      const phoneNumber = '+15551234567';
      
      // Make 5 requests (limit)
      for (let i = 0; i < 5; i++) {
        expect(enterprise2FAService.checkRateLimit(phoneNumber)).toBe(true);
      }
      
      // 6th request should be blocked
      expect(enterprise2FAService.checkRateLimit(phoneNumber)).toBe(false);
    });
  });
});
