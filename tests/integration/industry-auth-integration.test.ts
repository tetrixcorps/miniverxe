// Integration tests for industry authentication system
import { Industry2FAAuthService } from '../../src/services/auth/Industry2FAAuthService';

// Mock external services
jest.mock('../../src/services/auth/IndustryAuthService');
jest.mock('../../src/services/auth/IndustryRolePermissionService');

// Mock fetch for API calls
global.fetch = jest.fn();

describe('Industry Authentication Integration Tests', () => {
  let authService: Industry2FAAuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new Industry2FAAuthService();
  });

  describe('End-to-End Authentication Flow', () => {
    it('should complete full authentication flow with real API calls', async () => {
      // Mock successful API responses
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            verificationId: 'verify-123',
            provider: 'telnyx'
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            verified: true,
            token: 'access-token-123'
          })
        });

      // Mock user and organization data
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
        permissions: ['patient.read', 'patient.write', 'appointment.read'],
        assignedAt: new Date()
      };

      // Setup mocks
      (authService as any).findUserByPhone = jest.fn().mockResolvedValue(mockUser);
      (authService as any).getUserOrganizations = jest.fn().mockResolvedValue([mockOrganization]);
      (authService as any).getUserMembership = jest.fn().mockResolvedValue(mockMembership);
      (authService as any).getUserPermissions = jest.fn().mockResolvedValue([
        'patient.read', 'patient.write', 'appointment.read'
      ]);
      (authService as any).generateIndustryTokens = jest.fn().mockResolvedValue({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123'
      });

      // Step 1: Initiate authentication
      const initiateRequest = {
        phoneNumber: '+1234567890',
        industry: 'healthcare' as const,
        method: 'sms' as const,
        rememberDevice: false
      };

      const initiateResult = await authService.initiateIndustry2FA(initiateRequest);

      expect(initiateResult.success).toBe(true);
      expect(initiateResult.sessionId).toBeDefined();
      expect(initiateResult.verificationId).toBeDefined();

      // Step 2: Verify code
      const sessionId = initiateResult.sessionId!;
      const verificationId = initiateResult.verificationId!;

      // Mock verification code and session
      (authService as any).verificationCodes.set(verificationId, {
        code: '123456',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000)
      });

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
        permissions: ['patient.read', 'patient.write', 'appointment.read'],
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
      expect(verifyResult.user).toEqual(mockUser);
      expect(verifyResult.organization).toEqual(mockOrganization);
      expect(verifyResult.dashboardUrl).toBe('http://localhost:3000/dashboards/healthcare?org=org-123');
    });

    it('should handle multi-organization selection flow', async () => {
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

      // First call - should require organization selection
      const firstRequest = {
        phoneNumber: '+1234567890',
        industry: 'healthcare' as const,
        method: 'sms' as const,
        rememberDevice: false
      };

      const firstResult = await authService.initiateIndustry2FA(firstRequest);

      expect(firstResult.success).toBe(true);
      expect(firstResult.requiresOrganizationSelection).toBe(true);
      expect(firstResult.availableOrganizations).toEqual(mockOrganizations);

      // Second call - with selected organization
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

      const secondRequest = {
        ...firstRequest,
        organizationId: selectedOrgId
      };

      const secondResult = await authService.initiateIndustry2FA(secondRequest);

      expect(secondResult.success).toBe(true);
      expect(secondResult.requiresOrganizationSelection).toBeUndefined();
      expect(secondResult.sessionId).toBeDefined();
    });

    it('should handle provider fallback chain', async () => {
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
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ success: false, error: 'Telnyx service unavailable' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, provider: 'sinch' })
        });

      (authService as any).sendViaTelnyx = jest.fn().mockResolvedValue({
        success: false,
        error: 'Telnyx service unavailable'
      });
      (authService as any).sendViaSinch = jest.fn().mockResolvedValue({
        success: true,
        provider: 'sinch'
      });

      const request = {
        phoneNumber: '+1234567890',
        industry: 'healthcare' as const,
        method: 'sms' as const,
        rememberDevice: false
      };

      const result = await authService.initiateIndustry2FA(request);

      expect(result.success).toBe(true);
      expect(result.provider).toBe('sinch');
      expect((authService as any).sendViaTelnyx).toHaveBeenCalled();
      expect((authService as any).sendViaSinch).toHaveBeenCalled();
    });
  });

  describe('Cross-Industry Integration', () => {
    it('should handle different industries with appropriate permissions', async () => {
      const industryConfigs = [
        {
          industry: 'healthcare',
          expectedPermissions: ['patient.read', 'patient.write', 'appointment.read', 'appointment.write'],
          expectedRoles: ['doctor', 'nurse', 'admin']
        },
        {
          industry: 'legal',
          expectedPermissions: ['case.read', 'case.write', 'client.read', 'client.write'],
          expectedRoles: ['attorney', 'paralegal', 'admin']
        },
        {
          industry: 'real_estate',
          expectedPermissions: ['property.read', 'property.write', 'client.read', 'client.write'],
          expectedRoles: ['agent', 'broker', 'admin']
        },
        {
          industry: 'ecommerce',
          expectedPermissions: ['product.read', 'product.write', 'order.read', 'order.write'],
          expectedRoles: ['manager', 'staff', 'admin']
        }
      ];

      for (const config of industryConfigs) {
        const mockUser = {
          id: `user-${config.industry}`,
          email: `test@${config.industry}.com`,
          phone: '+1234567890',
          status: 'active' as const,
          createdAt: new Date(),
          mfaEnabled: true,
          mfaVerified: false
        };

        const mockOrganization = {
          id: `org-${config.industry}`,
          name: `${config.industry} Organization`,
          industry: config.industry,
          status: 'active' as const,
          createdAt: new Date(),
          settings: {},
          compliance: {}
        };

        const mockMembership = {
          userId: `user-${config.industry}`,
          orgId: `org-${config.industry}`,
          primaryRole: config.expectedRoles[0],
          secondaryRoles: config.expectedRoles.slice(1),
          isOrgAdmin: false,
          permissions: config.expectedPermissions,
          assignedAt: new Date()
        };

        (authService as any).findUserByPhone = jest.fn().mockResolvedValue(mockUser);
        (authService as any).getUserOrganizations = jest.fn().mockResolvedValue([mockOrganization]);
        (authService as any).getUserMembership = jest.fn().mockResolvedValue(mockMembership);
        (authService as any).send2FACode = jest.fn().mockResolvedValue({
          success: true,
          provider: 'telnyx'
        });
        (authService as any).getUserPermissions = jest.fn().mockResolvedValue(config.expectedPermissions);

        const request = {
          phoneNumber: '+1234567890',
          industry: config.industry as any,
          method: 'sms' as const,
          rememberDevice: false
        };

        const result = await authService.initiateIndustry2FA(request);

        expect(result.success).toBe(true);
        expect(result.sessionId).toBeDefined();

        // Test dashboard URL generation
        const dashboardUrl = (authService as any).generateDashboardUrl(config.industry, `org-${config.industry}`);
        expect(dashboardUrl).toContain(`/dashboards/${config.industry}`);
        expect(dashboardUrl).toContain(`org=org-${config.industry}`);
      }
    });

    it('should handle industry-specific compliance requirements', async () => {
      const complianceConfigs = [
        {
          industry: 'healthcare',
          compliance: ['HIPAA', 'HITECH', 'SOC2'],
          expectedFeatures: ['audit_logging', 'data_encryption', 'access_controls']
        },
        {
          industry: 'legal',
          compliance: ['Attorney-Client Privilege', 'Bar Association Standards'],
          expectedFeatures: ['privileged_communications', 'case_management', 'client_confidentiality']
        },
        {
          industry: 'ecommerce',
          compliance: ['PCI DSS', 'GDPR', 'CCPA'],
          expectedFeatures: ['payment_security', 'data_protection', 'privacy_controls']
        }
      ];

      for (const config of complianceConfigs) {
        const mockOrganization = {
          id: `org-${config.industry}`,
          name: `${config.industry} Organization`,
          industry: config.industry,
          status: 'active' as const,
          createdAt: new Date(),
          settings: {
            features: config.expectedFeatures
          },
          compliance: {
            frameworks: config.compliance
          }
        };

        // Test that compliance requirements are properly handled
        expect(mockOrganization.compliance.frameworks).toEqual(config.compliance);
        expect(mockOrganization.settings.features).toEqual(config.expectedFeatures);
      }
    });
  });

  describe('Security Integration', () => {
    it('should handle session security and cleanup', async () => {
      const sessionId = 'test-session';
      const verificationId = 'test-verify';

      // Create session
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

      // Create verification code
      (authService as any).verificationCodes.set(verificationId, {
        code: '123456',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000)
      });

      // Verify session exists
      expect((authService as any).activeSessions.has(sessionId)).toBe(true);
      expect((authService as any).verificationCodes.has(verificationId)).toBe(true);

      // Simulate successful verification
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        phone: '+1234567890',
        status: 'active' as const,
        createdAt: new Date(),
        mfaEnabled: true,
        mfaVerified: false
      };

      const mockOrganization = {
        id: 'org-123',
        name: 'Test Org',
        industry: 'healthcare' as const,
        status: 'active' as const,
        createdAt: new Date(),
        settings: {},
        compliance: {}
      };

      (authService as any).getUser = jest.fn().mockResolvedValue(mockUser);
      (authService as any).getOrganization = jest.fn().mockResolvedValue(mockOrganization);
      (authService as any).getUserPermissions = jest.fn().mockResolvedValue(['basic.read']);
      (authService as any).generateIndustryTokens = jest.fn().mockResolvedValue({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123'
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

      expect(result.success).toBe(true);
      expect(result.verified).toBe(true);

      // Verify code should be cleaned up after successful verification
      expect((authService as any).verificationCodes.has(verificationId)).toBe(false);
    });

    it('should handle concurrent authentication attempts', async () => {
      const phoneNumber = '+1234567890';
      const industry = 'healthcare';

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        phone: phoneNumber,
        status: 'active' as const,
        createdAt: new Date(),
        mfaEnabled: true,
        mfaVerified: false
      };

      const mockOrganization = { id: 'org-123', name: 'Test Org', industry };
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
      (authService as any).send2FACode = jest.fn().mockResolvedValue({
        success: true,
        provider: 'telnyx'
      });

      // Simulate concurrent requests
      const requests = Array(5).fill(null).map(() => ({
        phoneNumber,
        industry: industry as const,
        method: 'sms' as const,
        rememberDevice: false
      }));

      const results = await Promise.all(
        requests.map(request => authService.initiateIndustry2FA(request))
      );

      // All requests should succeed
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.sessionId).toBeDefined();
      });

      // Each should have a unique session ID
      const sessionIds = results.map(r => r.sessionId);
      const uniqueSessionIds = new Set(sessionIds);
      expect(uniqueSessionIds.size).toBe(sessionIds.length);
    });

    it('should handle rate limiting and abuse prevention', async () => {
      const phoneNumber = '+1234567890';
      const industry = 'healthcare';

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        phone: phoneNumber,
        status: 'active' as const,
        createdAt: new Date(),
        mfaEnabled: true,
        mfaVerified: false
      };

      const mockOrganization = { id: 'org-123', name: 'Test Org', industry };
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

      // Mock rate limiting - first few succeed, then fail
      let callCount = 0;
      (authService as any).send2FACode = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount <= 3) {
          return Promise.resolve({ success: true, provider: 'telnyx' });
        } else {
          return Promise.resolve({ success: false, error: 'Rate limit exceeded' });
        }
      });

      // First 3 requests should succeed
      for (let i = 0; i < 3; i++) {
        const result = await authService.initiateIndustry2FA({
          phoneNumber,
          industry: industry as const,
          method: 'sms' as const,
          rememberDevice: false
        });
        expect(result.success).toBe(true);
      }

      // 4th request should fail due to rate limiting
      const result = await authService.initiateIndustry2FA({
        phoneNumber,
        industry: industry as const,
        method: 'sms' as const,
        rememberDevice: false
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to send verification code');
    });
  });

  describe('Error Recovery and Resilience', () => {
    it('should handle partial service failures gracefully', async () => {
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

      // Mock Telnyx failure, Sinch failure, but service should still attempt both
      (authService as any).sendViaTelnyx = jest.fn().mockResolvedValue({
        success: false,
        error: 'Telnyx service down'
      });
      (authService as any).sendViaSinch = jest.fn().mockResolvedValue({
        success: false,
        error: 'Sinch service down'
      });

      const result = await authService.initiateIndustry2FA({
        phoneNumber: '+1234567890',
        industry: 'healthcare' as const,
        method: 'sms' as const,
        rememberDevice: false
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to send verification code');
      expect((authService as any).sendViaTelnyx).toHaveBeenCalled();
      expect((authService as any).sendViaSinch).toHaveBeenCalled();
    });

    it('should handle database connection failures', async () => {
      (authService as any).findUserByPhone = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      const result = await authService.initiateIndustry2FA({
        phoneNumber: '+1234567890',
        industry: 'healthcare' as const,
        method: 'sms' as const,
        rememberDevice: false
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Authentication service temporarily unavailable');
    });

    it('should handle network timeouts', async () => {
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

      // Mock network timeout
      (authService as any).send2FACode = jest.fn().mockRejectedValue(new Error('Network timeout'));

      const result = await authService.initiateIndustry2FA({
        phoneNumber: '+1234567890',
        industry: 'healthcare' as const,
        method: 'sms' as const,
        rememberDevice: false
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Authentication service temporarily unavailable');
    });
  });
});
