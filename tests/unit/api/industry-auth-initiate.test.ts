// Unit tests for industry auth initiate API endpoint
import { POST } from '../../../src/pages/api/v2/industry-auth/initiate';

// Mock the Industry2FAAuthService
jest.mock('../../../src/services/auth/Industry2FAAuthService', () => ({
  industry2FAAuthService: {
    initiateIndustry2FA: jest.fn()
  }
}));

import { industry2FAAuthService } from '../../../src/services/auth/Industry2FAAuthService';

const mockIndustry2FAAuthService = industry2FAAuthService as jest.Mocked<typeof industry2FAAuthService>;

describe('/api/v2/industry-auth/initiate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    it('should return 400 for missing phone number', async () => {
      const request = new Request('http://localhost/api/v2/industry-auth/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: 'healthcare',
          method: 'sms'
        })
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Phone number and industry are required');
    });

    it('should return 400 for missing industry', async () => {
      const request = new Request('http://localhost/api/v2/industry-auth/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: '+1234567890',
          method: 'sms'
        })
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Phone number and industry are required');
    });

    it('should return 400 for invalid industry', async () => {
      const request = new Request('http://localhost/api/v2/industry-auth/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: '+1234567890',
          industry: 'invalid-industry',
          method: 'sms'
        })
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid industry');
    });

    it('should return 400 for invalid method', async () => {
      const request = new Request('http://localhost/api/v2/industry-auth/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: '+1234567890',
          industry: 'healthcare',
          method: 'invalid-method'
        })
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid method');
    });

    it('should return 200 for valid request', async () => {
      const mockResult = {
        success: true,
        sessionId: 'session-123',
        verificationId: 'verify-123',
        provider: 'telnyx',
        method: 'sms',
        expiresIn: 300
      };

      mockIndustry2FAAuthService.initiateIndustry2FA.mockResolvedValue(mockResult);

      const request = new Request('http://localhost/api/v2/industry-auth/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: '+1234567890',
          industry: 'healthcare',
          method: 'sms'
        })
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.sessionId).toBe('session-123');
      expect(data.verificationId).toBe('verify-123');
      expect(data.provider).toBe('telnyx');
      expect(mockIndustry2FAAuthService.initiateIndustry2FA).toHaveBeenCalledWith({
        phoneNumber: '+1234567890',
        industry: 'healthcare',
        method: 'sms',
        rememberDevice: false
      });
    });

    it('should return 200 with organization selection when required', async () => {
      const mockResult = {
        success: true,
        requiresOrganizationSelection: true,
        availableOrganizations: [
          { id: 'org-1', name: 'Hospital A', industry: 'healthcare' },
          { id: 'org-2', name: 'Clinic B', industry: 'healthcare' }
        ]
      };

      mockIndustry2FAAuthService.initiateIndustry2FA.mockResolvedValue(mockResult);

      const request = new Request('http://localhost/api/v2/industry-auth/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: '+1234567890',
          industry: 'healthcare',
          method: 'sms'
        })
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.requiresOrganizationSelection).toBe(true);
      expect(data.availableOrganizations).toHaveLength(2);
    });

    it('should return 400 when service returns error', async () => {
      const mockResult = {
        success: false,
        error: 'Invalid phone number format'
      };

      mockIndustry2FAAuthService.initiateIndustry2FA.mockResolvedValue(mockResult);

      const request = new Request('http://localhost/api/v2/industry-auth/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: 'invalid-phone',
          industry: 'healthcare',
          method: 'sms'
        })
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid phone number format');
    });

    it('should handle service exceptions', async () => {
      mockIndustry2FAAuthService.initiateIndustry2FA.mockRejectedValue(new Error('Service unavailable'));

      const request = new Request('http://localhost/api/v2/industry-auth/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: '+1234567890',
          industry: 'healthcare',
          method: 'sms'
        })
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Internal server error');
    });

    it('should handle malformed JSON', async () => {
      const request = new Request('http://localhost/api/v2/industry-auth/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json'
      });

      const response = await POST({ request } as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Internal server error');
    });

    it('should validate all supported industries', async () => {
      const validIndustries = [
        'healthcare', 'legal', 'real_estate', 'ecommerce', 'construction',
        'logistics', 'government', 'education', 'retail', 'hospitality',
        'wellness', 'beauty'
      ];

      for (const industry of validIndustries) {
        const mockResult = {
          success: true,
          sessionId: 'session-123',
          verificationId: 'verify-123',
          provider: 'telnyx',
          method: 'sms',
          expiresIn: 300
        };

        mockIndustry2FAAuthService.initiateIndustry2FA.mockResolvedValue(mockResult);

        const request = new Request('http://localhost/api/v2/industry-auth/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: '+1234567890',
            industry,
            method: 'sms'
          })
        });

        const response = await POST({ request } as any);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
      }
    });

    it('should validate both SMS and voice methods', async () => {
      const methods = ['sms', 'voice'];

      for (const method of methods) {
        const mockResult = {
          success: true,
          sessionId: 'session-123',
          verificationId: 'verify-123',
          provider: 'telnyx',
          method,
          expiresIn: 300
        };

        mockIndustry2FAAuthService.initiateIndustry2FA.mockResolvedValue(mockResult);

        const request = new Request('http://localhost/api/v2/industry-auth/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: '+1234567890',
            industry: 'healthcare',
            method
          })
        });

        const response = await POST({ request } as any);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.method).toBe(method);
      }
    });
  });
});
