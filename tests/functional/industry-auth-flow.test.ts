// Functional tests for industry authentication flow
import { Industry2FAAuthService } from '../../src/services/auth/Industry2FAAuthService';

// Mock external dependencies
jest.mock('../../src/services/auth/IndustryAuthService');
jest.mock('../../src/services/auth/IndustryRolePermissionService');

describe('Industry Authentication Flow - Functional Tests', () => {
  let authService: Industry2FAAuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new Industry2FAAuthService();
  });

  describe('Complete Authentication Flow', () => {
    it('should complete full authentication flow for healthcare industry', async () => {
      // Step 1: Initiate authentication
      const initiateRequest = {
        phoneNumber: '+1234567890',
        industry: 'healthcare' as const,
        method: 'sms' as const,
        rememberDevice: false
      };

      // Mock successful initiation
      const mockUser = {
        id: 'user-123',
        email: 'doctor@hospital.com',
        phone: '+1234567890',
        status: 'active' as const,
        createdAt: new Date(),
        mfaEnabled: true,
        mfaVerified: false
      };

      const mockOrganization = {
        id: 'org-123',
        name: 'General Hospital',
        industry: 'healthcare' as const,
        status: 'active' as const,
        createdAt: new Date(),
        settings: {},
        compliance: {}
      };

      const mockMembership = {
        userId: 'user-123',
        orgId: 'org-123',
        primaryRole: 'doctor',
        secondaryRoles: ['emergency_physician'],
        isOrgAdmin: false,
        permissions: ['patient.read', 'patient.write', 'appointment.read', 'appointment.write'],
        assignedAt: new Date()
      };

      // Mock the service methods
      (authService as any).findUserByPhone = jest.fn().mockResolvedValue(mockUser);
      (authService as any).getUserOrganizations = jest.fn().mockResolvedValue([mockOrganization]);
      (authService as any).getUserMembership = jest.fn().mockResolvedValue(mockMembership);
      (authService as any).send2FACode = jest.fn().mockResolvedValue({
        success: true,
        provider: 'telnyx'
      });
      (authService as any).generateIndustryTokens = jest.fn().mockResolvedValue({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123'
      });
      (authService as any).getUserPermissions = jest.fn().mockResolvedValue([
        'patient.read', 'patient.write', 'appointment.read', 'appointment.write'
      ]);

      const initiateResult = await authService.initiateIndustry2FA(initiateRequest);

      expect(initiateResult.success).toBe(true);
      expect(initiateResult.sessionId).toBeDefined();
      expect(initiateResult.verificationId).toBeDefined();
      expect(initiateResult.provider).toBe('telnyx');

      // Step 2: Verify code
      const sessionId = initiateResult.sessionId!;
      const verificationId = initiateResult.verificationId!;

      // Mock verification code
      (authService as any).verificationCodes.set(verificationId, {
        code: '123456',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000)
      });

      // Mock active session
      (authService as any).activeSessions.set(sessionId, {
        id: sessionId,
        userId: 'user-123',
        organizationId: 'org-123',
        industry: 'healthcare',
        phoneNumber: '+1234567890',
        verificationId,
        provider: 'telnyx',
        method: 'sms',
        status: 'pending',
        roles: ['doctor', 'emergency_physician'],
        permissions: ['patient.read', 'patient.write', 'appointment.read', 'appointment.write'],
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        createdAt: new Date()
      });

      const verifyRequest = {
        sessionId,
        code: '123456',
        deviceInfo: {
          userAgent: 'Mozilla/5.0 Test Browser',
          ipAddress: '192.168.1.1',
          deviceId: 'device-123'
        }
      };

      const verifyResult = await authService.verifyIndustry2FA(verifyRequest);

      expect(verifyResult.success).toBe(true);
      expect(verifyResult.verified).toBe(true);
      expect(verifyResult.accessToken).toBe('access-token-123');
      expect(verifyResult.refreshToken).toBe('refresh-token-123');
      expect(verifyResult.user).toEqual(mockUser);
      expect(verifyResult.organization).toEqual(mockOrganization);
      expect(verifyResult.roles).toEqual(['doctor', 'emergency_physician']);
      expect(verifyResult.permissions).toEqual([
        'patient.read', 'patient.write', 'appointment.read', 'appointment.write'
      ]);
      expect(verifyResult.dashboardUrl).toBe('http://localhost:3000/dashboards/healthcare?org=org-123');
    });

    it('should handle organization selection flow', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'admin@multihospital.com',
        phone: '+1234567890',
        status: 'active' as const,
        createdAt: new Date(),
        mfaEnabled: true,
        mfaVerified: false
      };

      const mockOrganizations = [
        { id: 'org-1', name: 'General Hospital', industry: 'healthcare' },
        { id: 'org-2', name: 'Specialty Clinic', industry: 'healthcare' },
        { id: 'org-3', name: 'Emergency Center', industry: 'healthcare' }
      ];

      (authService as any).findUserByPhone = jest.fn().mockResolvedValue(mockUser);
      (authService as any).getUserOrganizations = jest.fn().mockResolvedValue(mockOrganizations);

      const initiateRequest = {
        phoneNumber: '+1234567890',
        industry: 'healthcare' as const,
        method: 'sms' as const,
        rememberDevice: false
      };

      const initiateResult = await authService.initiateIndustry2FA(initiateRequest);

      expect(initiateResult.success).toBe(true);
      expect(initiateResult.requiresOrganizationSelection).toBe(true);
      expect(initiateResult.availableOrganizations).toEqual(mockOrganizations);

      // Test organization selection
      const selectedOrgId = 'org-2';
      const mockMembership = {
        userId: 'user-123',
        orgId: selectedOrgId,
        primaryRole: 'admin',
        secondaryRoles: [],
        isOrgAdmin: true,
        permissions: ['*.*'],
        assignedAt: new Date()
      };

      (authService as any).getUserMembership = jest.fn().mockResolvedValue(mockMembership);
      (authService as any).send2FACode = jest.fn().mockResolvedValue({
        success: true,
        provider: 'sinch'
      });

      const initiateWithOrgRequest = {
        ...initiateRequest,
        organizationId: selectedOrgId
      };

      const initiateWithOrgResult = await authService.initiateIndustry2FA(initiateWithOrgRequest);

      expect(initiateWithOrgResult.success).toBe(true);
      expect(initiateWithOrgResult.requiresOrganizationSelection).toBeUndefined();
      expect(initiateWithOrgResult.sessionId).toBeDefined();
    });

    it('should handle Telnyx failure with Sinch fallback', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        phone: '+1234567890',
        status: 'active' as const,
        createdAt: new Date(),
        mfaEnabled: true,
        mfaVerified: false
      };

      const mockOrganization = { id: 'org-123', name: 'Test Org', industry: 'healthcare' };
      const mockMembership = {
        userId: 'user-123',
        orgId: 'org-123',
        primaryRole: 'user',
        secondaryRoles: [],
        isOrgAdmin: false,
        permissions: ['basic.read'],
        assignedAt: new Date()
      };

      (authService as any).findUserByPhone = jest.fn().mockResolvedValue(mockUser);
      (authService as any).getUserOrganizations = jest.fn().mockResolvedValue([mockOrganization]);
      (authService as any).getUserMembership = jest.fn().mockResolvedValue(mockMembership);

      // Mock Telnyx failure, Sinch success
      (authService as any).sendViaTelnyx = jest.fn().mockResolvedValue({
        success: false,
        error: 'Telnyx service unavailable'
      });
      (authService as any).sendViaSinch = jest.fn().mockResolvedValue({
        success: true,
        provider: 'sinch'
      });

      const initiateRequest = {
        phoneNumber: '+1234567890',
        industry: 'healthcare' as const,
        method: 'sms' as const,
        rememberDevice: false
      };

      const result = await authService.initiateIndustry2FA(initiateRequest);

      expect(result.success).toBe(true);
      expect(result.provider).toBe('sinch');
      expect((authService as any).sendViaTelnyx).toHaveBeenCalled();
      expect((authService as any).sendViaSinch).toHaveBeenCalled();
    });

    it('should handle both SMS and voice methods', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        phone: '+1234567890',
        status: 'active' as const,
        createdAt: new Date(),
        mfaEnabled: true,
        mfaVerified: false
      };

      const mockOrganization = { id: 'org-123', name: 'Test Org', industry: 'healthcare' };
      const mockMembership = {
        userId: 'user-123',
        orgId: 'org-123',
        primaryRole: 'user',
        secondaryRoles: [],
        isOrgAdmin: false,
        permissions: ['basic.read'],
        assignedAt: new Date()
      };

      (authService as any).findUserByPhone = jest.fn().mockResolvedValue(mockUser);
      (authService as any).getUserOrganizations = jest.fn().mockResolvedValue([mockOrganization]);
      (authService as any).getUserMembership = jest.fn().mockResolvedValue(mockMembership);

      // Test SMS method
      (authService as any).send2FACode = jest.fn().mockResolvedValue({
        success: true,
        provider: 'telnyx'
      });

      const smsRequest = {
        phoneNumber: '+1234567890',
        industry: 'healthcare' as const,
        method: 'sms' as const,
        rememberDevice: false
      };

      const smsResult = await authService.initiateIndustry2FA(smsRequest);

      expect(smsResult.success).toBe(true);
      expect(smsResult.method).toBe('sms');

      // Test Voice method
      const voiceRequest = {
        phoneNumber: '+1234567890',
        industry: 'healthcare' as const,
        method: 'voice' as const,
        rememberDevice: false
      };

      const voiceResult = await authService.initiateIndustry2FA(voiceRequest);

      expect(voiceResult.success).toBe(true);
      expect(voiceResult.method).toBe('voice');
    });

    it('should handle session expiration', async () => {
      const sessionId = 'expired-session';
      const verificationId = 'expired-verify';

      // Create expired session
      (authService as any).activeSessions.set(sessionId, {
        id: sessionId,
        userId: 'user-123',
        organizationId: 'org-123',
        industry: 'healthcare',
        phoneNumber: '+1234567890',
        verificationId,
        provider: 'telnyx',
        method: 'sms',
        status: 'pending',
        roles: ['user'],
        permissions: ['basic.read'],
        expiresAt: new Date(Date.now() - 1000), // Expired
        createdAt: new Date()
      });

      const verifyRequest = {
        sessionId,
        code: '123456',
        deviceInfo: {
          userAgent: 'Test Browser',
          ipAddress: '127.0.0.1'
        }
      };

      const result = await authService.verifyIndustry2FA(verifyRequest);

      expect(result.success).toBe(false);
      expect(result.verified).toBe(false);
      expect(result.error).toContain('Session expired');
    });

    it('should handle code expiration', async () => {
      const sessionId = 'valid-session';
      const verificationId = 'expired-code';

      // Create valid session
      (authService as any).activeSessions.set(sessionId, {
        id: sessionId,
        userId: 'user-123',
        organizationId: 'org-123',
        industry: 'healthcare',
        phoneNumber: '+1234567890',
        verificationId,
        provider: 'telnyx',
        method: 'sms',
        status: 'pending',
        roles: ['user'],
        permissions: ['basic.read'],
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        createdAt: new Date()
      });

      // Create expired code
      (authService as any).verificationCodes.set(verificationId, {
        code: '123456',
        expiresAt: new Date(Date.now() - 1000) // Expired
      });

      const verifyRequest = {
        sessionId,
        code: '123456',
        deviceInfo: {
          userAgent: 'Test Browser',
          ipAddress: '127.0.0.1'
        }
      };

      const result = await authService.verifyIndustry2FA(verifyRequest);

      expect(result.success).toBe(false);
      expect(result.verified).toBe(false);
      expect(result.error).toContain('Verification code expired');
    });

    it('should handle all supported industries', async () => {
      const industries = [
        'healthcare', 'legal', 'real_estate', 'ecommerce', 'construction',
        'logistics', 'government', 'education', 'retail', 'hospitality',
        'wellness', 'beauty'
      ];

      for (const industry of industries) {
        const mockUser = {
          id: `user-${industry}`,
          email: `test@${industry}.com`,
          phone: '+1234567890',
          status: 'active' as const,
          createdAt: new Date(),
          mfaEnabled: true,
          mfaVerified: false
        };

        const mockOrganization = { 
          id: `org-${industry}`, 
          name: `${industry} Organization`, 
          industry 
        };
        const mockMembership = {
          userId: `user-${industry}`,
          orgId: `org-${industry}`,
          primaryRole: 'user',
          secondaryRoles: [],
          isOrgAdmin: false,
          permissions: ['basic.read'],
          assignedAt: new Date()
        };

        (authService as any).findUserByPhone = jest.fn().mockResolvedValue(mockUser);
        (authService as any).getUserOrganizations = jest.fn().mockResolvedValue([mockOrganization]);
        (authService as any).getUserMembership = jest.fn().mockResolvedValue(mockMembership);
        (authService as any).send2FACode = jest.fn().mockResolvedValue({
          success: true,
          provider: 'telnyx'
        });

        const request = {
          phoneNumber: '+1234567890',
          industry: industry as any,
          method: 'sms' as const,
          rememberDevice: false
        };

        const result = await authService.initiateIndustry2FA(request);

        expect(result.success).toBe(true);
        expect(result.sessionId).toBeDefined();

        // Test dashboard URL generation
        const dashboardUrl = (authService as any).generateDashboardUrl(industry, `org-${industry}`);
        expect(dashboardUrl).toContain(`/dashboards/${industry}`);
        expect(dashboardUrl).toContain(`org=org-${industry}`);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle service unavailability gracefully', async () => {
      (authService as any).findUserByPhone = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      const request = {
        phoneNumber: '+1234567890',
        industry: 'healthcare' as const,
        method: 'sms' as const,
        rememberDevice: false
      };

      const result = await authService.initiateIndustry2FA(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Authentication service temporarily unavailable');
    });

    it('should handle invalid phone numbers', async () => {
      const invalidPhones = [
        '1234567890', // Missing country code
        '+0123456789', // Invalid country code
        'invalid-phone',
        '',
        '+12345678901234567890' // Too long
      ];

      for (const phone of invalidPhones) {
        const request = {
          phoneNumber: phone,
          industry: 'healthcare' as const,
          method: 'sms' as const,
          rememberDevice: false
        };

        const result = await authService.initiateIndustry2FA(request);

        expect(result.success).toBe(false);
        expect(result.error).toContain('Invalid phone number format');
      }
    });

    it('should handle access denied scenarios', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        phone: '+1234567890',
        status: 'active' as const,
        createdAt: new Date(),
        mfaEnabled: true,
        mfaVerified: false
      };

      (authService as any).findUserByPhone = jest.fn().mockResolvedValue(mockUser);
      (authService as any).getUserOrganizations = jest.fn().mockResolvedValue([{ id: 'org-123', name: 'Test Org', industry: 'healthcare' }]);
      (authService as any).getUserMembership = jest.fn().mockResolvedValue(null); // No membership

      const request = {
        phoneNumber: '+1234567890',
        industry: 'healthcare' as const,
        method: 'sms' as const,
        rememberDevice: false
      };

      const result = await authService.initiateIndustry2FA(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Access denied');
    });
  });
});
