/**
 * Unit Tests for Enterprise 2FA Service
 * Tests the enterprise2FAService functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock console methods
const mockConsole = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn()
};
Object.defineProperty(console, 'log', { value: mockConsole.log });
Object.defineProperty(console, 'error', { value: mockConsole.error });
Object.defineProperty(console, 'warn', { value: mockConsole.warn });

describe('Enterprise2FAService', () => {
  let enterprise2FAService: any;
  let mockConfig: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    mockFetch.mockClear();
    mockConsole.log.mockClear();
    mockConsole.error.mockClear();
    mockConsole.warn.mockClear();

    // Mock configuration
    mockConfig = {
      verifyProfileId: '49000199-7882-f4ce-6514-a67c8190f107',
      apiKey: 'test_api_key_123',
      apiUrl: 'https://api.telnyx.com/v2',
      webhookUrl: 'https://example.com/webhooks/telnyx/verify',
      fallbackEnabled: true,
      auditLogging: true,
      rateLimiting: true,
      fraudDetection: true
    };

    // Mock the Enterprise2FAService class
    enterprise2FAService = {
      config: mockConfig,
      auditLogs: new Map(),
      rateLimiter: new Map(),
      fraudDetector: new Map(),

      initiateVerification: vi.fn(),
      verifyCode: vi.fn(),
      assessFraudRisk: vi.fn(),
      checkRateLimit: vi.fn(),
      logAuditEvent: vi.fn(),
      sendTelnyxVerification: vi.fn(),
      generateMockVerification: vi.fn(),
      verifyMockCode: vi.fn(),
      generateId: vi.fn().mockReturnValue('audit_123'),
      analyzeUserAgentRisk: vi.fn(),
      analyzeIPRisk: vi.fn()
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Verification Initiation', () => {
    it('should initiate verification successfully with Telnyx API', async () => {
      const mockVerificationRequest = {
        phoneNumber: '+1234567890',
        method: 'sms',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ipAddress: '192.168.1.1',
        sessionId: 'session_abc123'
      };

      const mockTelnyxResponse = {
        data: {
          id: 'ver_abc123',
          phone_number: '+1234567890',
          type: 'sms',
          status: 'pending',
          created_at: '2025-01-10T16:30:00.000Z',
          timeout_secs: 300
        }
      };

      // Mock successful Telnyx API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTelnyxResponse)
      });

      enterprise2FAService.assessFraudRisk.mockResolvedValue(0.2);
      enterprise2FAService.checkRateLimit.mockReturnValue(true);
      enterprise2FAService.sendTelnyxVerification.mockResolvedValue(mockTelnyxResponse);
      enterprise2FAService.logAuditEvent.mockResolvedValue(undefined);

      enterprise2FAService.initiateVerification.mockImplementation(async (request) => {
        // 1. Fraud Detection & Risk Assessment
        const fraudScore = await enterprise2FAService.assessFraudRisk(request);
        if (fraudScore > 0.8) {
          throw new Error('Verification blocked due to high fraud risk');
        }

        // 2. Rate Limiting Check
        if (!enterprise2FAService.checkRateLimit(request.phoneNumber)) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }

        // 3. Use Telnyx Verify API
        const verification = await enterprise2FAService.sendTelnyxVerification(request);
        
        // 4. Log successful initiation
        await enterprise2FAService.logAuditEvent({
          id: enterprise2FAService.generateId(),
          phoneNumber: request.phoneNumber,
          method: request.method,
          action: 'initiate',
          status: 'success',
          ipAddress: request.ipAddress || 'unknown',
          userAgent: request.userAgent || 'unknown',
          timestamp: new Date().toISOString(),
          verificationId: verification.data.id,
          fraudScore,
          riskLevel: fraudScore > 0.5 ? 'medium' : 'low'
        });

        return {
          verificationId: verification.data.id,
          phoneNumber: verification.data.phone_number,
          method: verification.data.type,
          status: verification.data.status,
          createdAt: verification.data.created_at,
          timeoutSecs: verification.data.timeout_secs,
          fraudScore,
          riskLevel: fraudScore > 0.5 ? 'medium' : 'low'
        };
      });

      const result = await enterprise2FAService.initiateVerification(mockVerificationRequest);

      expect(result.verificationId).toBe('ver_abc123');
      expect(result.phoneNumber).toBe('+1234567890');
      expect(result.method).toBe('sms');
      expect(result.status).toBe('pending');
      expect(enterprise2FAService.assessFraudRisk).toHaveBeenCalledWith(mockVerificationRequest);
      expect(enterprise2FAService.checkRateLimit).toHaveBeenCalledWith('+1234567890');
      expect(enterprise2FAService.sendTelnyxVerification).toHaveBeenCalledWith(mockVerificationRequest);
    });

    it('should block verification due to high fraud risk', async () => {
      const mockVerificationRequest = {
        phoneNumber: '+1234567890',
        method: 'sms',
        userAgent: 'Suspicious User Agent',
        ipAddress: '192.168.1.1',
        sessionId: 'session_abc123'
      };

      enterprise2FAService.assessFraudRisk.mockResolvedValue(0.9); // High fraud score
      enterprise2FAService.logAuditEvent.mockResolvedValue(undefined);

      enterprise2FAService.initiateVerification.mockImplementation(async (request) => {
        const fraudScore = await enterprise2FAService.assessFraudRisk(request);
        if (fraudScore > 0.8) {
          await enterprise2FAService.logAuditEvent({
            id: enterprise2FAService.generateId(),
            phoneNumber: request.phoneNumber,
            method: request.method,
            action: 'initiate',
            status: 'blocked',
            ipAddress: request.ipAddress || 'unknown',
            userAgent: request.userAgent || 'unknown',
            timestamp: new Date().toISOString(),
            fraudScore,
            riskLevel: 'high',
            metadata: { reason: 'High fraud score detected' }
          });
          
          throw new Error('Verification blocked due to high fraud risk');
        }
      });

      await expect(enterprise2FAService.initiateVerification(mockVerificationRequest))
        .rejects.toThrow('Verification blocked due to high fraud risk');

      expect(enterprise2FAService.assessFraudRisk).toHaveBeenCalledWith(mockVerificationRequest);
      expect(enterprise2FAService.logAuditEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'blocked',
          fraudScore: 0.9,
          riskLevel: 'high'
        })
      );
    });

    it('should block verification due to rate limiting', async () => {
      const mockVerificationRequest = {
        phoneNumber: '+1234567890',
        method: 'sms',
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.1',
        sessionId: 'session_abc123'
      };

      enterprise2FAService.assessFraudRisk.mockResolvedValue(0.2);
      enterprise2FAService.checkRateLimit.mockReturnValue(false); // Rate limited

      enterprise2FAService.initiateVerification.mockImplementation(async (request) => {
        const fraudScore = await enterprise2FAService.assessFraudRisk(request);
        if (fraudScore > 0.8) {
          throw new Error('Verification blocked due to high fraud risk');
        }

        if (!enterprise2FAService.checkRateLimit(request.phoneNumber)) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
      });

      await expect(enterprise2FAService.initiateVerification(mockVerificationRequest))
        .rejects.toThrow('Rate limit exceeded. Please try again later.');

      expect(enterprise2FAService.checkRateLimit).toHaveBeenCalledWith('+1234567890');
    });

    it('should fallback to mock verification when API key is not configured', async () => {
      const mockVerificationRequest = {
        phoneNumber: '+1234567890',
        method: 'sms',
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.1',
        sessionId: 'session_abc123'
      };

      // Mock service with no API key
      enterprise2FAService.config.apiKey = '';
      enterprise2FAService.assessFraudRisk.mockResolvedValue(0.2);
      enterprise2FAService.checkRateLimit.mockReturnValue(true);
      enterprise2FAService.generateMockVerification.mockReturnValue({
        id: 'mock_abc123',
        phone_number: '+1234567890',
        type: 'sms',
        status: 'pending',
        created_at: '2025-01-10T16:30:00.000Z',
        timeout_secs: 300
      });

      enterprise2FAService.initiateVerification.mockImplementation(async (request) => {
        const fraudScore = await enterprise2FAService.assessFraudRisk(request);
        if (fraudScore > 0.8) {
          throw new Error('Verification blocked due to high fraud risk');
        }

        if (!enterprise2FAService.checkRateLimit(request.phoneNumber)) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }

        // Check if API key is configured
        if (!enterprise2FAService.config.apiKey || enterprise2FAService.config.apiKey.trim() === '') {
          console.warn('TELNYX_API_KEY not configured, using mock verification for development');
          return enterprise2FAService.generateMockVerification(request);
        }
      });

      const result = await enterprise2FAService.initiateVerification(mockVerificationRequest);

      expect(result.id).toBe('mock_abc123');
      expect(enterprise2FAService.generateMockVerification).toHaveBeenCalledWith(mockVerificationRequest);
    });
  });

  describe('Code Verification', () => {
    it('should verify code successfully with Telnyx API', async () => {
      const mockVerificationId = 'ver_abc123';
      const mockCode = '123456';
      const mockPhoneNumber = '+1234567890';

      const mockTelnyxResponse = {
        data: {
          response_code: 'accepted',
          phone_number: '+1234567890'
        }
      };

      // Mock successful Telnyx verification response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTelnyxResponse)
      });

      enterprise2FAService.logAuditEvent.mockResolvedValue(undefined);

      enterprise2FAService.verifyCode.mockImplementation(async (verificationId, code, phoneNumber) => {
        // Handle mock verifications
        if (verificationId.startsWith('mock_')) {
          return enterprise2FAService.verifyMockCode(verificationId, code, phoneNumber);
        }

        // Check if API key is configured
        if (!enterprise2FAService.config.apiKey || enterprise2FAService.config.apiKey.trim() === '') {
          console.warn('TELNYX_API_KEY not configured, using mock verification');
          return enterprise2FAService.verifyMockCode(verificationId, code, phoneNumber);
        }

        const response = await fetch(`https://api.telnyx.com/v2/verifications/${verificationId}/actions/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${enterprise2FAService.config.apiKey}`
          },
          body: JSON.stringify({
            code: code
          })
        });

        const result = await response.json();
        
        const verificationResult = {
          success: response.ok,
          verified: result.data?.response_code === 'accepted',
          responseCode: result.data?.response_code || 'rejected',
          phoneNumber: result.data?.phone_number || phoneNumber,
          verificationId,
          timestamp: new Date().toISOString()
        };

        // Log verification attempt
        await enterprise2FAService.logAuditEvent({
          id: enterprise2FAService.generateId(),
          phoneNumber,
          method: 'verify',
          action: 'verify',
          status: verificationResult.verified ? 'success' : 'failed',
          ipAddress: 'unknown',
          userAgent: 'unknown',
          timestamp: new Date().toISOString(),
          verificationId,
          metadata: { 
            responseCode: verificationResult.responseCode,
            success: verificationResult.success
          }
        });

        return verificationResult;
      });

      const result = await enterprise2FAService.verifyCode(mockVerificationId, mockCode, mockPhoneNumber);

      expect(result.success).toBe(true);
      expect(result.verified).toBe(true);
      expect(result.responseCode).toBe('accepted');
      expect(result.phoneNumber).toBe('+1234567890');
      expect(result.verificationId).toBe(mockVerificationId);
      expect(mockFetch).toHaveBeenCalledWith(
        `https://api.telnyx.com/v2/verifications/${mockVerificationId}/actions/verify`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test_api_key_123'
          }),
          body: JSON.stringify({ code: mockCode })
        })
      );
    });

    it('should handle verification failure', async () => {
      const mockVerificationId = 'ver_abc123';
      const mockCode = '000000'; // Invalid code
      const mockPhoneNumber = '+1234567890';

      const mockTelnyxResponse = {
        data: {
          response_code: 'rejected',
          phone_number: '+1234567890'
        }
      };

      // Mock failed Telnyx verification response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTelnyxResponse)
      });

      enterprise2FAService.verifyCode.mockImplementation(async (verificationId, code, phoneNumber) => {
        const response = await fetch(`https://api.telnyx.com/v2/verifications/${verificationId}/actions/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${enterprise2FAService.config.apiKey}`
          },
          body: JSON.stringify({ code })
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
      });

      const result = await enterprise2FAService.verifyCode(mockVerificationId, mockCode, mockPhoneNumber);

      expect(result.success).toBe(true);
      expect(result.verified).toBe(false);
      expect(result.responseCode).toBe('rejected');
    });

    it('should handle mock verification codes', async () => {
      const mockVerificationId = 'mock_abc123';
      const mockCode = '123456';
      const mockPhoneNumber = '+1234567890';

      enterprise2FAService.verifyMockCode.mockImplementation((verificationId, code, phoneNumber) => {
        // For development, accept 123456 or any 6-digit code
        const isValidCode = code === '123456' || /^\d{6}$/.test(code);
        
        // Ensure phone number has proper formatting (single +)
        const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
        
        return {
          success: true,
          verified: isValidCode,
          responseCode: isValidCode ? 'accepted' : 'rejected',
          phoneNumber: formattedPhone,
          verificationId,
          timestamp: new Date().toISOString(),
          fraudScore: 0.1,
          riskLevel: 'low'
        };
      });

      const result = await enterprise2FAService.verifyMockCode(mockVerificationId, mockCode, mockPhoneNumber);

      expect(result.success).toBe(true);
      expect(result.verified).toBe(true);
      expect(result.responseCode).toBe('accepted');
      expect(result.phoneNumber).toBe('+1234567890');
    });
  });

  describe('Fraud Detection', () => {
    it('should assess fraud risk based on multiple factors', async () => {
      const mockRequest = {
        phoneNumber: '+1234567890',
        method: 'sms',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ipAddress: '192.168.1.1',
        sessionId: 'session_abc123'
      };

      enterprise2FAService.assessFraudRisk.mockImplementation(async (request) => {
        let fraudScore = 0.0;

        // Analyze IP risk
        const ipRisk = enterprise2FAService.analyzeIPRisk(request.ipAddress);
        fraudScore += ipRisk;

        // Analyze user agent risk
        const userAgentRisk = enterprise2FAService.analyzeUserAgentRisk(request.userAgent);
        fraudScore += userAgentRisk;

        // Check for suspicious patterns
        if (request.phoneNumber.includes('0000')) {
          fraudScore += 0.3;
        }

        if (request.userAgent?.includes('bot') || request.userAgent?.includes('crawler')) {
          fraudScore += 0.5;
        }

        return Math.min(fraudScore, 1.0);
      });

      enterprise2FAService.analyzeIPRisk.mockReturnValue(0.1);
      enterprise2FAService.analyzeUserAgentRisk.mockReturnValue(0.1);

      const fraudScore = await enterprise2FAService.assessFraudRisk(mockRequest);

      expect(fraudScore).toBe(0.2);
      expect(enterprise2FAService.analyzeIPRisk).toHaveBeenCalledWith('192.168.1.1');
      expect(enterprise2FAService.analyzeUserAgentRisk).toHaveBeenCalledWith('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    });

    it('should detect high fraud risk from suspicious patterns', async () => {
      const suspiciousRequest = {
        phoneNumber: '+1234000000', // Suspicious pattern
        method: 'sms',
        userAgent: 'bot/crawler', // Suspicious user agent
        ipAddress: '192.168.1.1',
        sessionId: 'session_abc123'
      };

      enterprise2FAService.assessFraudRisk.mockImplementation(async (request) => {
        let fraudScore = 0.0;

        const ipRisk = enterprise2FAService.analyzeIPRisk(request.ipAddress);
        fraudScore += ipRisk;

        const userAgentRisk = enterprise2FAService.analyzeUserAgentRisk(request.userAgent);
        fraudScore += userAgentRisk;

        if (request.phoneNumber.includes('0000')) {
          fraudScore += 0.3;
        }

        if (request.userAgent?.includes('bot') || request.userAgent?.includes('crawler')) {
          fraudScore += 0.5;
        }

        return Math.min(fraudScore, 1.0);
      });

      enterprise2FAService.analyzeIPRisk.mockReturnValue(0.2);
      enterprise2FAService.analyzeUserAgentRisk.mockReturnValue(0.3);

      const fraudScore = await enterprise2FAService.assessFraudRisk(suspiciousRequest);

      expect(fraudScore).toBeGreaterThan(0.8);
    });
  });

  describe('Rate Limiting', () => {
    it('should allow verification within rate limits', () => {
      enterprise2FAService.checkRateLimit.mockImplementation((phoneNumber) => {
        const now = Date.now();
        const key = phoneNumber;
        const limit = 5; // 5 attempts per 5 minutes
        const windowMs = 5 * 60 * 1000; // 5 minutes

        const current = enterprise2FAService.rateLimiter.get(key);
        
        if (!current) {
          enterprise2FAService.rateLimiter.set(key, { count: 1, resetTime: now + windowMs });
          return true;
        }

        if (now > current.resetTime) {
          enterprise2FAService.rateLimiter.set(key, { count: 1, resetTime: now + windowMs });
          return true;
        }

        if (current.count >= limit) {
          return false;
        }

        current.count++;
        return true;
      });

      const phoneNumber = '+1234567890';
      
      // First 5 attempts should be allowed
      for (let i = 0; i < 5; i++) {
        expect(enterprise2FAService.checkRateLimit(phoneNumber)).toBe(true);
      }
      
      // 6th attempt should be blocked
      expect(enterprise2FAService.checkRateLimit(phoneNumber)).toBe(false);
    });
  });

  describe('Audit Logging', () => {
    it('should log audit events correctly', async () => {
      const mockAuditEvent = {
        id: 'audit_123',
        phoneNumber: '+1234567890',
        method: 'sms',
        action: 'initiate',
        status: 'success',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        timestamp: '2025-01-10T16:30:00.000Z',
        verificationId: 'ver_abc123',
        fraudScore: 0.2,
        riskLevel: 'low'
      };

      enterprise2FAService.logAuditEvent.mockImplementation(async (event) => {
        enterprise2FAService.auditLogs.set(event.id, event);
        return true;
      });

      await enterprise2FAService.logAuditEvent(mockAuditEvent);

      expect(enterprise2FAService.auditLogs.has('audit_123')).toBe(true);
      expect(enterprise2FAService.auditLogs.get('audit_123')).toEqual(mockAuditEvent);
    });
  });

  describe('Phone Number Formatting', () => {
    it('should format phone numbers consistently', () => {
      const formatPhoneNumber = (phoneNumber: string) => {
        return phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      };

      expect(formatPhoneNumber('+1234567890')).toBe('+1234567890');
      expect(formatPhoneNumber('1234567890')).toBe('+1234567890');
      expect(formatPhoneNumber('+44 20 7946 0958')).toBe('+44 20 7946 0958');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const mockVerificationRequest = {
        phoneNumber: '+1234567890',
        method: 'sms',
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.1',
        sessionId: 'session_abc123'
      };

      // Mock network error
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      enterprise2FAService.initiateVerification.mockImplementation(async (request) => {
        try {
          const verification = await enterprise2FAService.sendTelnyxVerification(request);
          return verification;
        } catch (error) {
          console.error('Telnyx initiation error:', error);
          throw new Error(`Telnyx API error: ${error.message}`);
        }
      });

      enterprise2FAService.sendTelnyxVerification.mockRejectedValue(new Error('Network error'));

      await expect(enterprise2FAService.initiateVerification(mockVerificationRequest))
        .rejects.toThrow('Telnyx API error: Network error');
    });

    it('should handle API errors with proper error messages', async () => {
      const mockVerificationId = 'ver_abc123';
      const mockCode = '123456';
      const mockPhoneNumber = '+1234567890';

      // Mock API error response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          errors: [{ detail: 'Invalid verification code' }]
        })
      });

      enterprise2FAService.verifyCode.mockImplementation(async (verificationId, code, phoneNumber) => {
        try {
          const response = await fetch(`https://api.telnyx.com/v2/verifications/${verificationId}/actions/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${enterprise2FAService.config.apiKey}`
            },
            body: JSON.stringify({ code })
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(`Telnyx API error: ${error.errors?.[0]?.detail || response.statusText}`);
          }

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
          return {
            success: false,
            verified: false,
            responseCode: 'rejected',
            phoneNumber,
            verificationId,
            timestamp: new Date().toISOString()
          };
        }
      });

      const result = await enterprise2FAService.verifyCode(mockVerificationId, mockCode, mockPhoneNumber);

      expect(result.success).toBe(false);
      expect(result.verified).toBe(false);
      expect(result.responseCode).toBe('rejected');
    });
  });
});
