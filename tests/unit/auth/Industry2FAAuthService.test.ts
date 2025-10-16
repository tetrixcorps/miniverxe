// Unit tests for Industry2FAAuthService
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Industry2FAAuthService } from '../../../src/services/auth/Industry2FAAuthService';
import { IndustryAuthService } from '../../../src/services/auth/IndustryAuthService';
import { IndustryRolePermissionService } from '../../../src/services/auth/IndustryRolePermissionService';

// Mock dependencies
vi.mock('../../../src/services/auth/IndustryAuthService');
vi.mock('../../../src/services/auth/IndustryRolePermissionService');

describe('Industry2FAAuthService', () => {
  let authService: Industry2FAAuthService;
  let mockIndustryAuthService: any;
  let mockRolePermissionService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create mock instances
    mockIndustryAuthService = {
      findUserByPhone: vi.fn(),
      createIndustryUser: vi.fn(),
      getUserOrganizations: vi.fn(),
      getUserMembership: vi.fn(),
      getUser: vi.fn(),
      getOrganization: vi.fn(),
      getUserPermissions: vi.fn()
    };
    mockRolePermissionService = {};
    
    // Create service instance
    authService = new Industry2FAAuthService();
    
    // Replace private properties with mocks
    (authService as any).industryAuthService = mockIndustryAuthService;
    (authService as any).rolePermissionService = mockRolePermissionService;
  });

  describe('initiateIndustry2FA', () => {
    const validRequest = {
      phoneNumber: '+1234567890',
      industry: 'healthcare' as const,
      method: 'sms' as const,
      rememberDevice: false
    };

    it('should validate phone number format', async () => {
      const invalidRequest = {
        ...validRequest,
        phoneNumber: 'invalid-phone'
      };

      const result = await authService.initiateIndustry2FA(invalidRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid phone number format');
    });

    it('should validate industry', async () => {
      const invalidRequest = {
        ...validRequest,
        industry: 'invalid-industry' as any
      };

      const result = await authService.initiateIndustry2FA(invalidRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid industry');
    });

    it('should validate method', async () => {
      const invalidRequest = {
        ...validRequest,
        method: 'invalid-method' as any
      };

      const result = await authService.initiateIndustry2FA(invalidRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid method');
    });

    it('should create new user if not found', async () => {
      mockIndustryAuthService.findUserByPhone = jest.fn().mockResolvedValue(null);
      mockIndustryAuthService.createIndustryUser = jest.fn().mockResolvedValue({
        id: 'user-123',
        email: '',
        phone: '+1234567890',
        status: 'active',
        createdAt: new Date(),
        mfaEnabled: true,
        mfaVerified: false
      });
      mockIndustryAuthService.getUserOrganizations = jest.fn().mockResolvedValue([]);

      const result = await authService.initiateIndustry2FA(validRequest);

      expect(mockIndustryAuthService.createIndustryUser).toHaveBeenCalledWith(
        '+1234567890',
        'healthcare'
      );
    });

    it('should handle organization selection when multiple organizations exist', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        phone: '+1234567890',
        status: 'active' as const,
        createdAt: new Date(),
        mfaEnabled: true,
        mfaVerified: false
      };

      const mockOrganizations = [
        { id: 'org-1', name: 'Hospital A', industry: 'healthcare' },
        { id: 'org-2', name: 'Clinic B', industry: 'healthcare' }
      ];

      mockIndustryAuthService.findUserByPhone = jest.fn().mockResolvedValue(mockUser);
      mockIndustryAuthService.getUserOrganizations = jest.fn().mockResolvedValue(mockOrganizations);

      const result = await authService.initiateIndustry2FA(validRequest);

      expect(result.success).toBe(true);
      expect(result.requiresOrganizationSelection).toBe(true);
      expect(result.availableOrganizations).toEqual(mockOrganizations);
    });

    it('should proceed with single organization', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        phone: '+1234567890',
        status: 'active' as const,
        createdAt: new Date(),
        mfaEnabled: true,
        mfaVerified: false
      };

      const mockOrganization = { id: 'org-1', name: 'Hospital A', industry: 'healthcare' };
      const mockMembership = {
        userId: 'user-123',
        orgId: 'org-1',
        primaryRole: 'doctor',
        secondaryRoles: [],
        isOrgAdmin: false,
        permissions: ['patient.read', 'patient.write'],
        assignedAt: new Date()
      };

      mockIndustryAuthService.findUserByPhone = jest.fn().mockResolvedValue(mockUser);
      mockIndustryAuthService.getUserOrganizations = jest.fn().mockResolvedValue([mockOrganization]);
      mockIndustryAuthService.getUserMembership = jest.fn().mockResolvedValue(mockMembership);

      // Mock the send2FACode method
      (authService as any).send2FACode = jest.fn().mockResolvedValue({
        success: true,
        provider: 'telnyx'
      });

      const result = await authService.initiateIndustry2FA(validRequest);

      expect(result.success).toBe(true);
      expect(result.sessionId).toBeDefined();
      expect(result.verificationId).toBeDefined();
      expect(result.provider).toBe('telnyx');
    });

    it('should handle 2FA sending failure', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        phone: '+1234567890',
        status: 'active' as const,
        createdAt: new Date(),
        mfaEnabled: true,
        mfaVerified: false
      };

      const mockOrganization = { id: 'org-1', name: 'Hospital A', industry: 'healthcare' };
      const mockMembership = {
        userId: 'user-123',
        orgId: 'org-1',
        primaryRole: 'doctor',
        secondaryRoles: [],
        isOrgAdmin: false,
        permissions: ['patient.read', 'patient.write'],
        assignedAt: new Date()
      };

      mockIndustryAuthService.findUserByPhone = jest.fn().mockResolvedValue(mockUser);
      mockIndustryAuthService.getUserOrganizations = jest.fn().mockResolvedValue([mockOrganization]);
      mockIndustryAuthService.getUserMembership = jest.fn().mockResolvedValue(mockMembership);

      // Mock the send2FACode method to fail
      (authService as any).send2FACode = jest.fn().mockResolvedValue({
        success: false,
        error: 'Failed to send SMS'
      });

      const result = await authService.initiateIndustry2FA(validRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to send verification code');
    });
  });

  describe('verifyIndustry2FA', () => {
    const validRequest = {
      sessionId: 'session-123',
      code: '123456',
      deviceInfo: {
        userAgent: 'test-agent',
        ipAddress: '127.0.0.1'
      }
    };

    beforeEach(() => {
      // Mock active session
      (authService as any).activeSessions.set('session-123', {
        id: 'session-123',
        userId: 'user-123',
        organizationId: 'org-123',
        industry: 'healthcare',
        phoneNumber: '+1234567890',
        verificationId: 'verify-123',
        provider: 'telnyx',
        method: 'sms',
        status: 'pending',
        roles: ['doctor'],
        permissions: ['patient.read'],
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        createdAt: new Date()
      });

      // Mock verification code
      (authService as any).verificationCodes.set('verify-123', {
        code: '123456',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000)
      });
    });

    it('should verify valid code successfully', async () => {
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
        name: 'Hospital A',
        industry: 'healthcare' as const,
        status: 'active' as const,
        createdAt: new Date(),
        settings: {},
        compliance: {}
      };

      mockIndustryAuthService.getUser = jest.fn().mockResolvedValue(mockUser);
      mockIndustryAuthService.getOrganization = jest.fn().mockResolvedValue(mockOrganization);
      mockIndustryAuthService.getUserPermissions = jest.fn().mockResolvedValue(['patient.read', 'patient.write']);

      // Mock generateIndustryTokens
      (authService as any).generateIndustryTokens = jest.fn().mockResolvedValue({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123'
      });

      const result = await authService.verifyIndustry2FA(validRequest);

      expect(result.success).toBe(true);
      expect(result.verified).toBe(true);
      expect(result.accessToken).toBe('access-token-123');
      expect(result.user).toEqual(mockUser);
      expect(result.organization).toEqual(mockOrganization);
    });

    it('should reject invalid session', async () => {
      const result = await authService.verifyIndustry2FA({
        ...validRequest,
        sessionId: 'invalid-session'
      });

      expect(result.success).toBe(false);
      expect(result.verified).toBe(false);
      expect(result.error).toContain('Invalid or expired session');
    });

    it('should reject invalid code', async () => {
      const result = await authService.verifyIndustry2FA({
        ...validRequest,
        code: '000000'
      });

      expect(result.success).toBe(false);
      expect(result.verified).toBe(false);
      expect(result.error).toContain('Invalid verification code');
    });

    it('should reject expired code', async () => {
      // Set expired code
      (authService as any).verificationCodes.set('verify-123', {
        code: '123456',
        expiresAt: new Date(Date.now() - 1000) // Expired
      });

      const result = await authService.verifyIndustry2FA(validRequest);

      expect(result.success).toBe(false);
      expect(result.verified).toBe(false);
      expect(result.error).toContain('Verification code expired');
    });

    it('should reject expired session', async () => {
      // Set expired session
      (authService as any).activeSessions.set('session-123', {
        id: 'session-123',
        userId: 'user-123',
        organizationId: 'org-123',
        industry: 'healthcare',
        phoneNumber: '+1234567890',
        verificationId: 'verify-123',
        provider: 'telnyx',
        method: 'sms',
        status: 'pending',
        roles: ['doctor'],
        permissions: ['patient.read'],
        expiresAt: new Date(Date.now() - 1000), // Expired
        createdAt: new Date()
      });

      const result = await authService.verifyIndustry2FA(validRequest);

      expect(result.success).toBe(false);
      expect(result.verified).toBe(false);
      expect(result.error).toContain('Session expired');
    });
  });

  describe('generateDashboardUrl', () => {
    it('should generate correct URL for healthcare industry', () => {
      const url = (authService as any).generateDashboardUrl('healthcare', 'org-123');
      expect(url).toBe('http://localhost:3000/dashboards/healthcare?org=org-123');
    });

    it('should generate correct URL for legal industry', () => {
      const url = (authService as any).generateDashboardUrl('legal', 'org-456');
      expect(url).toBe('http://localhost:3000/dashboards/legal?org=org-456');
    });

    it('should handle unknown industry', () => {
      const url = (authService as any).generateDashboardUrl('unknown' as any, 'org-789');
      expect(url).toBe('http://localhost:3000/dashboards?org=org-789');
    });
  });

  describe('isValidPhoneNumber', () => {
    it('should validate correct phone numbers', () => {
      expect((authService as any).isValidPhoneNumber('+1234567890')).toBe(true);
      expect((authService as any).isValidPhoneNumber('+44123456789')).toBe(true);
      expect((authService as any).isValidPhoneNumber('+33123456789')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect((authService as any).isValidPhoneNumber('1234567890')).toBe(false);
      expect((authService as any).isValidPhoneNumber('+0123456789')).toBe(false);
      expect((authService as any).isValidPhoneNumber('invalid')).toBe(false);
      expect((authService as any).isValidPhoneNumber('')).toBe(false);
    });
  });

  describe('generateVerificationCode', () => {
    it('should generate 6-digit code', () => {
      const code = (authService as any).generateVerificationCode();
      expect(code).toMatch(/^\d{6}$/);
    });

    it('should generate different codes', () => {
      const code1 = (authService as any).generateVerificationCode();
      const code2 = (authService as any).generateVerificationCode();
      expect(code1).not.toBe(code2);
    });
  });

  describe('send2FACode', () => {
    it('should try Telnyx first, then Sinch on failure', async () => {
      // Mock Telnyx failure
      (authService as any).sendViaTelnyx = jest.fn().mockResolvedValue({
        success: false,
        error: 'Telnyx failed'
      });

      // Mock Sinch success
      (authService as any).sendViaSinch = jest.fn().mockResolvedValue({
        success: true,
        provider: 'sinch'
      });

      const result = await (authService as any).send2FACode('+1234567890', '123456', 'sms');

      expect(result.success).toBe(true);
      expect(result.provider).toBe('sinch');
      expect((authService as any).sendViaTelnyx).toHaveBeenCalledWith('+1234567890', '123456', 'sms');
      expect((authService as any).sendViaSinch).toHaveBeenCalledWith('+1234567890', '123456', 'sms');
    });

    it('should return success when Telnyx succeeds', async () => {
      // Mock Telnyx success
      (authService as any).sendViaTelnyx = jest.fn().mockResolvedValue({
        success: true,
        provider: 'telnyx'
      });

      const result = await (authService as any).send2FACode('+1234567890', '123456', 'sms');

      expect(result.success).toBe(true);
      expect(result.provider).toBe('telnyx');
      expect((authService as any).sendViaSinch).not.toHaveBeenCalled();
    });

    it('should return failure when both providers fail', async () => {
      // Mock both failures
      (authService as any).sendViaTelnyx = jest.fn().mockResolvedValue({
        success: false,
        error: 'Telnyx failed'
      });

      (authService as any).sendViaSinch = jest.fn().mockResolvedValue({
        success: false,
        error: 'Sinch failed'
      });

      const result = await (authService as any).send2FACode('+1234567890', '123456', 'sms');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to send verification code');
    });
  });
});
