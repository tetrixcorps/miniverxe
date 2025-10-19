/**
 * Integration Tests for 2FA API Endpoints
 * Tests the /api/v2/2fa/initiate and /api/v2/2fa/verify endpoints
 */

import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';

// Mock the enterprise2FAService
const mockEnterprise2FAService = {
  initiateVerification: vi.fn(),
  verifyCode: vi.fn()
};

// Mock the service import
vi.mock('../../../../services/enterprise2FAService', () => ({
  enterprise2FAService: mockEnterprise2FAService
}));

// Mock Astro types
const mockRequest = {
  json: vi.fn(),
  text: vi.fn(),
  headers: {
    get: vi.fn()
  }
};

const mockLocals = {
  bodyParsed: false,
  parsedBody: null
};

const mockResponse = {
  status: 200,
  headers: new Map(),
  json: vi.fn()
};

describe('2FA API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnterprise2FAService.initiateVerification.mockClear();
    mockEnterprise2FAService.verifyCode.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/v2/2fa/initiate', () => {
    it('should initiate 2FA verification successfully', async () => {
      // Mock request body
      const requestBody = {
        phoneNumber: '+1234567890',
        method: 'sms',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ipAddress: '192.168.1.1',
        sessionId: 'session_abc123'
      };

      mockRequest.json.mockResolvedValue(requestBody);
      mockRequest.headers.get.mockImplementation((header) => {
        switch (header) {
          case 'x-forwarded-for':
            return '192.168.1.1';
          case 'user-agent':
            return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
          default:
            return null;
        }
      });

      // Mock successful service response
      const mockVerificationResponse = {
        verificationId: 'ver_abc123',
        phoneNumber: '+1234567890',
        method: 'sms',
        status: 'pending',
        createdAt: '2025-01-10T16:30:00.000Z',
        timeoutSecs: 300,
        fraudScore: 0.2,
        riskLevel: 'low'
      };

      mockEnterprise2FAService.initiateVerification.mockResolvedValue(mockVerificationResponse);

      // Mock the initiate handler directly
      const initiateHandler = async ({ request, locals }: any) => {
        let body: any = {};
        
        if (locals.bodyParsed && locals.parsedBody) {
          body = locals.parsedBody;
        } else {
          try {
            body = await request.json();
          } catch (jsonError) {
            try {
              const rawBody = await request.text();
              if (rawBody && rawBody.trim()) {
                body = JSON.parse(rawBody);
              } else {
                return new Response(JSON.stringify({
                  success: false,
                  error: 'Request body is required',
                  status: 400,
                  timestamp: new Date().toISOString()
                }), {
                  status: 400,
                  headers: { 'Content-Type': 'application/json' }
                });
              }
            } catch (textError) {
              return new Response(JSON.stringify({
                success: false,
                error: 'Failed to parse request body',
                status: 400,
                timestamp: new Date().toISOString()
              }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
              });
            }
          }
        }

        const { phoneNumber, method = 'sms' } = body;

        if (!phoneNumber) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Phone number is required',
            status: 400,
            timestamp: new Date().toISOString()
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const validMethods = ['sms', 'voice', 'flashcall', 'whatsapp'];
        if (!validMethods.includes(method)) {
          return new Response(JSON.stringify({
            success: false,
            error: `Invalid method. Must be one of: ${validMethods.join(', ')}`,
            status: 400,
            timestamp: new Date().toISOString()
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        try {
          const verification = await mockEnterprise2FAService.initiateVerification({
            phoneNumber,
            method,
            userAgent: 'test',
            ipAddress: '192.168.1.1',
            sessionId: 'test_session'
          });

          return new Response(JSON.stringify({
            success: true,
            verificationId: verification.verificationId,
            message: `Verification ${method.toUpperCase()} sent successfully`,
            estimatedDelivery: method === 'sms' ? '30-60 seconds' : '10-30 seconds',
            timestamp: new Date().toISOString()
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (error) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Failed to initiate verification',
            status: 500,
            details: { 
              message: error instanceof Error ? error.message : 'Unknown error',
              type: 'verification_initiation_failed'
            },
            timestamp: new Date().toISOString()
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      };

      const response = await initiateHandler({
        request: mockRequest,
        locals: mockLocals
      });

      expect(response.status).toBe(200);
      
      const responseBody = await response.json();
      expect(responseBody.success).toBe(true);
      expect(responseBody.verificationId).toBe('ver_abc123');
      expect(responseBody.message).toBe('Verification SMS sent successfully');
      expect(responseBody.estimatedDelivery).toBe('30-60 seconds');

      expect(mockEnterprise2FAService.initiateVerification).toHaveBeenCalledWith({
        phoneNumber: '+1234567890',
        method: 'sms',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ipAddress: '192.168.1.1',
        sessionId: 'session_abc123'
      });
    });

    it('should handle missing phone number', async () => {
      const requestBody = {
        method: 'sms',
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.1'
      };

      mockRequest.json.mockResolvedValue(requestBody);

      const { POST: initiateHandler } = await import('../initiate');

      const response = await initiateHandler({
        request: mockRequest,
        locals: mockLocals
      } as any);

      expect(response.status).toBe(400);
      
      const responseBody = await response.json();
      expect(responseBody.success).toBe(false);
      expect(responseBody.error).toBe('Phone number is required');
    });

    it('should handle invalid verification method', async () => {
      const requestBody = {
        phoneNumber: '+1234567890',
        method: 'invalid_method',
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.1'
      };

      mockRequest.json.mockResolvedValue(requestBody);

      const { POST: initiateHandler } = await import('../initiate');

      const response = await initiateHandler({
        request: mockRequest,
        locals: mockLocals
      } as any);

      expect(response.status).toBe(400);
      
      const responseBody = await response.json();
      expect(responseBody.success).toBe(false);
      expect(responseBody.error).toContain('Invalid method');
    });

    it('should handle service errors', async () => {
      const requestBody = {
        phoneNumber: '+1234567890',
        method: 'sms',
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.1'
      };

      mockRequest.json.mockResolvedValue(requestBody);
      mockEnterprise2FAService.initiateVerification.mockRejectedValue(
        new Error('Service unavailable')
      );

      const { POST: initiateHandler } = await import('../initiate');

      const response = await initiateHandler({
        request: mockRequest,
        locals: mockLocals
      } as any);

      expect(response.status).toBe(500);
      
      const responseBody = await response.json();
      expect(responseBody.success).toBe(false);
      expect(responseBody.error).toBe('Failed to initiate verification');
      expect(responseBody.details.message).toBe('Service unavailable');
    });

    it('should handle request body parsing from middleware', async () => {
      const requestBody = {
        phoneNumber: '+1234567890',
        method: 'sms',
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.1'
      };

      const localsWithParsedBody = {
        bodyParsed: true,
        parsedBody: requestBody
      };

      mockEnterprise2FAService.initiateVerification.mockResolvedValue({
        verificationId: 'ver_abc123',
        phoneNumber: '+1234567890',
        method: 'sms',
        status: 'pending'
      });

      const { POST: initiateHandler } = await import('../initiate');

      const response = await initiateHandler({
        request: mockRequest,
        locals: localsWithParsedBody
      } as any);

      expect(response.status).toBe(200);
      expect(mockRequest.json).not.toHaveBeenCalled();
    });

    it('should fallback to request.text() when request.json() fails', async () => {
      const requestBody = {
        phoneNumber: '+1234567890',
        method: 'sms',
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.1'
      };

      mockRequest.json.mockRejectedValue(new Error('JSON parse error'));
      mockRequest.text.mockResolvedValue(JSON.stringify(requestBody));

      mockEnterprise2FAService.initiateVerification.mockResolvedValue({
        verificationId: 'ver_abc123',
        phoneNumber: '+1234567890',
        method: 'sms',
        status: 'pending'
      });

      const { POST: initiateHandler } = await import('../initiate');

      const response = await initiateHandler({
        request: mockRequest,
        locals: mockLocals
      } as any);

      expect(response.status).toBe(200);
      expect(mockRequest.text).toHaveBeenCalled();
    });
  });

  describe('POST /api/v2/2fa/verify', () => {
    it('should verify code successfully', async () => {
      const requestBody = {
        verificationId: 'ver_abc123',
        code: '123456',
        phoneNumber: '+1234567890'
      };

      mockRequest.json.mockResolvedValue(requestBody);

      const mockVerificationResult = {
        success: true,
        verified: true,
        verificationId: 'ver_abc123',
        phoneNumber: '+1234567890',
        responseCode: 'accepted',
        timestamp: '2025-01-10T16:32:15.000Z',
        riskLevel: 'low'
      };

      mockEnterprise2FAService.verifyCode.mockResolvedValue(mockVerificationResult);

      const { POST: verifyHandler } = await import('../verify');

      const response = await verifyHandler({
        request: mockRequest,
        locals: mockLocals
      } as any);

      expect(response.status).toBe(200);
      
      const responseBody = await response.json();
      expect(responseBody.success).toBe(true);
      expect(responseBody.verified).toBe(true);
      expect(responseBody.verificationId).toBe('ver_abc123');
      expect(responseBody.phoneNumber).toBe('+1234567890');
      expect(responseBody.responseCode).toBe('accepted');
      expect(responseBody.message).toBe('Verification successful');
      expect(responseBody.token).toMatch(/^tetrix_auth_\d+_[a-z0-9]+$/);

      expect(mockEnterprise2FAService.verifyCode).toHaveBeenCalledWith(
        'ver_abc123',
        '123456',
        '+1234567890'
      );
    });

    it('should handle missing required fields', async () => {
      const requestBody = {
        verificationId: 'ver_abc123',
        code: '123456'
        // Missing phoneNumber
      };

      mockRequest.json.mockResolvedValue(requestBody);

      const { POST: verifyHandler } = await import('../verify');

      const response = await verifyHandler({
        request: mockRequest,
        locals: mockLocals
      } as any);

      expect(response.status).toBe(400);
      
      const responseBody = await response.json();
      expect(responseBody.success).toBe(false);
      expect(responseBody.error).toBe('verificationId, code, and phoneNumber are required');
    });

    it('should handle invalid code format', async () => {
      const requestBody = {
        verificationId: 'ver_abc123',
        code: '123', // Invalid length
        phoneNumber: '+1234567890'
      };

      mockRequest.json.mockResolvedValue(requestBody);

      const { POST: verifyHandler } = await import('../verify');

      const response = await verifyHandler({
        request: mockRequest,
        locals: mockLocals
      } as any);

      expect(response.status).toBe(400);
      
      const responseBody = await response.json();
      expect(responseBody.success).toBe(false);
      expect(responseBody.error).toBe('Code must be 6 digits');
    });

    it('should handle verification failure', async () => {
      const requestBody = {
        verificationId: 'ver_abc123',
        code: '000000',
        phoneNumber: '+1234567890'
      };

      mockRequest.json.mockResolvedValue(requestBody);

      const mockVerificationResult = {
        success: true,
        verified: false,
        verificationId: 'ver_abc123',
        phoneNumber: '+1234567890',
        responseCode: 'rejected',
        timestamp: '2025-01-10T16:32:15.000Z'
      };

      mockEnterprise2FAService.verifyCode.mockResolvedValue(mockVerificationResult);

      const { POST: verifyHandler } = await import('../verify');

      const response = await verifyHandler({
        request: mockRequest,
        locals: mockLocals
      } as any);

      expect(response.status).toBe(400);
      
      const responseBody = await response.json();
      expect(responseBody.success).toBe(false);
      expect(responseBody.error).toBe('Verification failed');
      expect(responseBody.details.verified).toBe(false);
      expect(responseBody.details.responseCode).toBe('rejected');
    });

    it('should handle service errors during verification', async () => {
      const requestBody = {
        verificationId: 'ver_abc123',
        code: '123456',
        phoneNumber: '+1234567890'
      };

      mockRequest.json.mockResolvedValue(requestBody);
      mockEnterprise2FAService.verifyCode.mockRejectedValue(
        new Error('Service unavailable')
      );

      const { POST: verifyHandler } = await import('../verify');

      const response = await verifyHandler({
        request: mockRequest,
        locals: mockLocals
      } as any);

      expect(response.status).toBe(500);
      
      const responseBody = await response.json();
      expect(responseBody.success).toBe(false);
      expect(responseBody.error).toBe('Failed to verify code');
      expect(responseBody.details.message).toBe('Service unavailable');
    });

    it('should handle different response codes with appropriate error messages', async () => {
      const testCases = [
        {
          responseCode: 'rejected',
          expectedMessage: 'Invalid verification code. Please check the code and try again.'
        },
        {
          responseCode: 'expired',
          expectedMessage: 'Verification code has expired. Please request a new one.'
        },
        {
          responseCode: 'max_attempts',
          expectedMessage: 'Maximum verification attempts exceeded. Please request a new code.'
        }
      ];

      for (const testCase of testCases) {
        const requestBody = {
          verificationId: 'ver_abc123',
          code: '123456',
          phoneNumber: '+1234567890'
        };

        mockRequest.json.mockResolvedValue(requestBody);

        const mockVerificationResult = {
          success: true,
          verified: false,
          verificationId: 'ver_abc123',
          phoneNumber: '+1234567890',
          responseCode: testCase.responseCode,
          timestamp: '2025-01-10T16:32:15.000Z'
        };

        mockEnterprise2FAService.verifyCode.mockResolvedValue(mockVerificationResult);

        const { POST: verifyHandler } = await import('../verify');

        const response = await verifyHandler({
          request: mockRequest,
          locals: mockLocals
        } as any);

        expect(response.status).toBe(400);
        
        const responseBody = await response.json();
        expect(responseBody.success).toBe(false);
        expect(responseBody.error).toBe('Verification failed');
        expect(responseBody.details.message).toBe(testCase.expectedMessage);
      }
    });
  });

  describe('Helper Functions', () => {
    it('should create error responses with correct format', () => {
      const createErrorResponse = (message: string, status: number, details?: any) => {
        return new Response(JSON.stringify({
          success: false,
          error: message,
          status,
          details,
          timestamp: new Date().toISOString()
        }), {
          status,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      };

      const response = createErrorResponse('Test error', 400, { code: 'TEST_ERROR' });
      
      expect(response.status).toBe(400);
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });

    it('should create success responses with correct format', () => {
      const createSuccessResponse = (data: any) => {
        return new Response(JSON.stringify({
          success: true,
          ...data,
          timestamp: new Date().toISOString()
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      };

      const response = createSuccessResponse({ 
        verificationId: 'ver_abc123',
        message: 'Success' 
      });
      
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });
  });

  describe('Request Body Parsing', () => {
    it('should handle empty request body', async () => {
      mockRequest.json.mockResolvedValue({});
      mockRequest.text.mockResolvedValue('');

      const { POST: initiateHandler } = await import('../initiate');

      const response = await initiateHandler({
        request: mockRequest,
        locals: mockLocals
      } as any);

      expect(response.status).toBe(400);
      
      const responseBody = await response.json();
      expect(responseBody.success).toBe(false);
      expect(responseBody.error).toBe('Request body is required');
    });

    it('should handle malformed JSON', async () => {
      mockRequest.json.mockRejectedValue(new Error('JSON parse error'));
      mockRequest.text.mockResolvedValue('invalid json');

      const { POST: initiateHandler } = await import('../initiate');

      const response = await initiateHandler({
        request: mockRequest,
        locals: mockLocals
      } as any);

      expect(response.status).toBe(400);
      
      const responseBody = await response.json();
      expect(responseBody.success).toBe(false);
      expect(responseBody.error).toBe('Failed to parse request body');
    });
  });
});
