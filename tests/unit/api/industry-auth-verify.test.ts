// Unit tests for industry auth verify API endpoint
import { POST } from '../../../src/pages/api/v2/industry-auth/verify';

// Mock the Industry2FAAuthService
jest.mock('../../../src/services/auth/Industry2FAAuthService', () => ({
  industry2FAAuthService: {
    verifyIndustry2FA: jest.fn()
  }
}));

import { industry2FAAuthService } from '../../../src/services/auth/Industry2FAAuthService';

const mockIndustry2FAAuthService = industry2FAAuthService as jest.Mocked<typeof industry2FAAuthService>;

describe('/api/v2/industry-auth/verify', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    it('should return 400 for missing session ID', async () => {
      const request = new Request('http://localhost/api/v2/industry-auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: '123456'
        })
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Session ID and verification code are required');
    });

    it('should return 400 for missing verification code', async () => {
      const request = new Request('http://localhost/api/v2/industry-auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'session-123'
        })
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Session ID and verification code are required');
    });

    it('should return 400 for invalid code format', async () => {
      const request = new Request('http://localhost/api/v2/industry-auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'session-123',
          code: '12345' // Too short
        })
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Verification code must be 6 digits');
    });

    it('should return 400 for non-numeric code', async () => {
      const request = new Request('http://localhost/api/v2/industry-auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'session-123',
          code: 'abcdef' // Non-numeric
        })
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Verification code must be 6 digits');
    });

    it('should return 200 for successful verification', async () => {
      const mockResult = {
        success: true,
        verified: true,
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          phone: '+1234567890',
          status: 'active'
        },
        organization: {
          id: 'org-123',
          name: 'Hospital A',
          industry: 'healthcare'
        },
        roles: ['doctor'],
        permissions: ['patient.read', 'patient.write'],
        dashboardUrl: 'http://localhost:3000/dashboards/healthcare?org=org-123'
      };

      mockIndustry2FAAuthService.verifyIndustry2FA.mockResolvedValue(mockResult);

      const request = new Request('http://localhost/api/v2/industry-auth/verify', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-forwarded-for': '192.168.1.1',
          'user-agent': 'Mozilla/5.0 Test Browser'
        },
        body: JSON.stringify({
          sessionId: 'session-123',
          code: '123456'
        })
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.verified).toBe(true);
      expect(data.user).toEqual(mockResult.user);
      expect(data.organization).toEqual(mockResult.organization);
      expect(data.roles).toEqual(['doctor']);
      expect(data.permissions).toEqual(['patient.read', 'patient.write']);
      expect(data.dashboardUrl).toBe('http://localhost:3000/dashboards/healthcare?org=org-123');

      // Check that cookies are set
      const setCookieHeaders = response.headers.get('Set-Cookie');
      expect(setCookieHeaders).toContain('industry_access_token=access-token-123');
      expect(setCookieHeaders).toContain('industry_refresh_token=refresh-token-123');
      expect(setCookieHeaders).toContain('HttpOnly');
      expect(setCookieHeaders).toContain('Secure');
      expect(setCookieHeaders).toContain('SameSite=Strict');

      expect(mockIndustry2FAAuthService.verifyIndustry2FA).toHaveBeenCalledWith({
        sessionId: 'session-123',
        code: '123456',
        deviceInfo: {
          userAgent: 'Mozilla/5.0 Test Browser',
          ipAddress: '192.168.1.1',
          deviceId: undefined
        }
      });
    });

    it('should return 400 for failed verification', async () => {
      const mockResult = {
        success: false,
        verified: false,
        error: 'Invalid verification code'
      };

      mockIndustry2FAAuthService.verifyIndustry2FA.mockResolvedValue(mockResult);

      const request = new Request('http://localhost/api/v2/industry-auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'session-123',
          code: '000000'
        })
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.verified).toBe(false);
      expect(data.error).toBe('Invalid verification code');
    });

    it('should handle device info in request body', async () => {
      const mockResult = {
        success: true,
        verified: true,
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
        user: { id: 'user-123', email: 'test@example.com', phone: '+1234567890', status: 'active' },
        organization: { id: 'org-123', name: 'Hospital A', industry: 'healthcare' },
        roles: ['doctor'],
        permissions: ['patient.read'],
        dashboardUrl: 'http://localhost:3000/dashboards/healthcare?org=org-123'
      };

      mockIndustry2FAAuthService.verifyIndustry2FA.mockResolvedValue(mockResult);

      const request = new Request('http://localhost/api/v2/industry-auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'session-123',
          code: '123456',
          deviceInfo: {
            deviceId: 'device-123',
            userAgent: 'Custom Agent',
            ipAddress: '10.0.0.1'
          }
        })
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      expect(mockIndustry2FAAuthService.verifyIndustry2FA).toHaveBeenCalledWith({
        sessionId: 'session-123',
        code: '123456',
        deviceInfo: {
          userAgent: 'Custom Agent',
          ipAddress: '10.0.0.1',
          deviceId: 'device-123'
        }
      });
    });

    it('should handle missing IP address in headers', async () => {
      const mockResult = {
        success: true,
        verified: true,
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
        user: { id: 'user-123', email: 'test@example.com', phone: '+1234567890', status: 'active' },
        organization: { id: 'org-123', name: 'Hospital A', industry: 'healthcare' },
        roles: ['doctor'],
        permissions: ['patient.read'],
        dashboardUrl: 'http://localhost:3000/dashboards/healthcare?org=org-123'
      };

      mockIndustry2FAAuthService.verifyIndustry2FA.mockResolvedValue(mockResult);

      const request = new Request('http://localhost/api/v2/industry-auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'session-123',
          code: '123456'
        })
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      expect(mockIndustry2FAAuthService.verifyIndustry2FA).toHaveBeenCalledWith({
        sessionId: 'session-123',
        code: '123456',
        deviceInfo: {
          userAgent: 'unknown',
          ipAddress: 'unknown',
          deviceId: undefined
        }
      });
    });

    it('should handle service exceptions', async () => {
      mockIndustry2FAAuthService.verifyIndustry2FA.mockRejectedValue(new Error('Service unavailable'));

      const request = new Request('http://localhost/api/v2/industry-auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'session-123',
          code: '123456'
        })
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.verified).toBe(false);
      expect(data.error).toContain('Internal server error');
    });

    it('should handle malformed JSON', async () => {
      const request = new Request('http://localhost/api/v2/industry-auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json'
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.verified).toBe(false);
      expect(data.error).toContain('Internal server error');
    });

    it('should validate 6-digit codes only', async () => {
      const invalidCodes = ['12345', '1234567', '12345a', 'abcdef', '12345!'];

      for (const code of invalidCodes) {
        const request = new Request('http://localhost/api/v2/industry-auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: 'session-123',
            code
          })
        });

        const response = await POST({ request } as any);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toContain('Verification code must be 6 digits');
      }
    });

    it('should accept valid 6-digit codes', async () => {
      const validCodes = ['123456', '000000', '999999', '123456'];

      for (const code of validCodes) {
        const mockResult = {
          success: true,
          verified: true,
          accessToken: 'access-token-123',
          refreshToken: 'refresh-token-123',
          user: { id: 'user-123', email: 'test@example.com', phone: '+1234567890', status: 'active' },
          organization: { id: 'org-123', name: 'Hospital A', industry: 'healthcare' },
          roles: ['doctor'],
          permissions: ['patient.read'],
          dashboardUrl: 'http://localhost:3000/dashboards/healthcare?org=org-123'
        };

        mockIndustry2FAAuthService.verifyIndustry2FA.mockResolvedValue(mockResult);

        const request = new Request('http://localhost/api/v2/industry-auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: 'session-123',
            code
          })
        });

        const response = await POST({ request } as any);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.verified).toBe(true);
      }
    });
  });
});
