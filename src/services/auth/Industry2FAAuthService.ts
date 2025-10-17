// TETRIX Industry-Specific 2FA Authentication Service
// Integrates with existing RBAC system and 2FA infrastructure

import { TETRIXIndustryAuthService, User, Organization, Membership, IndustryType } from './IndustryAuthService';
import { IndustryRolePermissionService, IndustryRole, IndustryPermission, AccessDecision } from './IndustryRolePermissionService';

export interface Industry2FASession {
  id: string;
  userId: string;
  organizationId: string;
  industry: IndustryType;
  phoneNumber: string;
  verificationId: string;
  provider: 'telnyx' | 'sinch';
  method: 'sms' | 'voice';
  status: 'pending' | 'verified' | 'expired' | 'failed';
  roles: string[];
  permissions: string[];
  expiresAt: Date;
  createdAt: Date;
  verifiedAt?: Date;
}

export interface Industry2FAAuthRequest {
  phoneNumber: string;
  industry: IndustryType;
  organizationId?: string;
  method: 'sms' | 'voice';
  rememberDevice?: boolean;
}

export interface Industry2FAAuthResponse {
  success: boolean;
  sessionId?: string;
  verificationId?: string;
  provider?: string;
  method?: string;
  expiresIn?: number;
  error?: string;
  requiresOrganizationSelection?: boolean;
  availableOrganizations?: Organization[];
}

export interface Industry2FAVerificationRequest {
  sessionId: string;
  code: string;
  deviceInfo?: {
    userAgent: string;
    ipAddress: string;
    deviceId?: string;
  };
}

export interface Industry2FAVerificationResponse {
  success: boolean;
  verified: boolean;
  accessToken?: string;
  refreshToken?: string;
  user?: User;
  organization?: Organization;
  roles?: string[];
  permissions?: string[];
  dashboardUrl?: string;
  error?: string;
}

export class Industry2FAAuthService {
  private industryAuthService: TETRIXIndustryAuthService;
  private rolePermissionService: IndustryRolePermissionService;
  private activeSessions: Map<string, Industry2FASession> = new Map();
  private verificationCodes: Map<string, { code: string; expiresAt: Date }> = new Map();

  constructor() {
    this.industryAuthService = new TETRIXIndustryAuthService();
    this.rolePermissionService = new IndustryRolePermissionService();
  }

  /**
   * Initiate industry-specific 2FA authentication
   */
  async initiateIndustry2FA(request: Industry2FAAuthRequest): Promise<Industry2FAAuthResponse> {
    try {
      console.log('🔐 Initiating industry 2FA authentication:', {
        industry: request.industry,
        phoneNumber: request.phoneNumber,
        method: request.method
      });

      // Validate phone number format
      if (!this.isValidPhoneNumber(request.phoneNumber)) {
        return {
          success: false,
          error: 'Invalid phone number format. Please include country code (e.g., +1234567890)'
        };
      }

      // Check if user exists or needs to be created
      let user = await this.findUserByPhone(request.phoneNumber);
      if (!user) {
        // Create new user for this industry
        user = await this.createIndustryUser(request.phoneNumber, request.industry);
      }

      // Check if organization selection is required
      if (!request.organizationId) {
        const userOrgs = await this.getUserOrganizations(user.id, request.industry);
        if (userOrgs.length === 0) {
          return {
            success: false,
            error: 'No organizations found for this industry. Please contact your administrator.'
          };
        } else if (userOrgs.length > 1) {
          return {
            success: true,
            requiresOrganizationSelection: true,
            availableOrganizations: userOrgs
          };
        } else {
          request.organizationId = userOrgs[0].id;
        }
      }

      // Verify user has access to the organization
      const membership = await this.getUserMembership(user.id, request.organizationId);
      if (!membership) {
        return {
          success: false,
          error: 'Access denied. You do not have permission to access this organization.'
        };
      }

      // Generate verification code
      const verificationCode = this.generateVerificationCode();
      const verificationId = this.generateSessionId();

      // Store verification code
      this.verificationCodes.set(verificationId, {
        code: verificationCode,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
      });

      // Send 2FA code via Telnyx or Sinch
      const sendResult = await this.send2FACode(request.phoneNumber, verificationCode, request.method);
      if (!sendResult.success) {
        return {
          success: false,
          error: `Failed to send verification code: ${sendResult.error}`
        };
      }

      // Create industry 2FA session
      const session: Industry2FASession = {
        id: this.generateSessionId(),
        userId: user.id,
        organizationId: request.organizationId,
        industry: request.industry,
        phoneNumber: request.phoneNumber,
        verificationId,
        provider: sendResult.provider as 'telnyx' | 'sinch',
        method: request.method,
        status: 'pending',
        roles: membership.primaryRole ? [membership.primaryRole, ...membership.secondaryRoles] : [],
        permissions: membership.permissions,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        createdAt: new Date()
      };

      this.activeSessions.set(session.id, session);

      // Log authentication attempt
      await this.logAuthEvent({
        userId: user.id,
        organizationId: request.organizationId,
        action: '2fa_initiated',
        details: {
          industry: request.industry,
          method: request.method,
          provider: sendResult.provider
        }
      });

      return {
        success: true,
        sessionId: session.id,
        verificationId,
        provider: sendResult.provider,
        method: request.method,
        expiresIn: 300 // 5 minutes
      };

    } catch (error) {
      console.error('❌ Industry 2FA initiation failed:', error);
      return {
        success: false,
        error: 'Authentication service temporarily unavailable. Please try again later.'
      };
    }
  }

  /**
   * Verify 2FA code and complete authentication
   */
  async verifyIndustry2FA(request: Industry2FAVerificationRequest): Promise<Industry2FAVerificationResponse> {
    try {
      console.log('🔐 Verifying industry 2FA code for session:', request.sessionId);

      // Get session
      const session = this.activeSessions.get(request.sessionId);
      if (!session) {
        return {
          success: false,
          verified: false,
          error: 'Invalid or expired session. Please start authentication again.'
        };
      }

      // Check if session is expired
      if (new Date() > session.expiresAt) {
        this.activeSessions.delete(request.sessionId);
        return {
          success: false,
          verified: false,
          error: 'Session expired. Please start authentication again.'
        };
      }

      // Verify code
      const storedCode = this.verificationCodes.get(session.verificationId);
      if (!storedCode || storedCode.code !== request.code) {
        return {
          success: false,
          verified: false,
          error: 'Invalid verification code. Please try again.'
        };
      }

      // Check if code is expired
      if (new Date() > storedCode.expiresAt) {
        this.verificationCodes.delete(session.verificationId);
        return {
          success: false,
          verified: false,
          error: 'Verification code expired. Please request a new one.'
        };
      }

      // Get user and organization
      const user = await this.getUser(session.userId);
      const organization = await this.getOrganization(session.organizationId);
      
      if (!user || !organization) {
        return {
          success: false,
          verified: false,
          error: 'User or organization not found.'
        };
      }

      // Update session status
      session.status = 'verified';
      session.verifiedAt = new Date();
      this.activeSessions.set(session.id, session);

      // Clean up verification code
      this.verificationCodes.delete(session.verificationId);

      // Generate access tokens
      const tokens = await this.generateIndustryTokens(user, organization, session);

      // Get user's effective permissions
      const permissions = await this.getUserPermissions(user.id, organization.id);

      // Generate dashboard URL based on industry
      const dashboardUrl = this.generateDashboardUrl(session.industry, organization.id);

      // Log successful authentication
      await this.logAuthEvent({
        userId: user.id,
        organizationId: organization.id,
        action: '2fa_verified',
        details: {
          industry: session.industry,
          method: session.method,
          provider: session.provider,
          deviceInfo: request.deviceInfo
        }
      });

      return {
        success: true,
        verified: true,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user,
        organization,
        roles: session.roles,
        permissions,
        dashboardUrl
      };

    } catch (error) {
      console.error('❌ Industry 2FA verification failed:', error);
      return {
        success: false,
        verified: false,
        error: 'Verification failed. Please try again.'
      };
    }
  }

  /**
   * Get industry-specific dashboard URL
   */
  private generateDashboardUrl(industry: IndustryType, organizationId: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tetrixcorp.com';
    
    switch (industry) {
      case 'healthcare':
        return `${baseUrl}/dashboards/healthcare?org=${organizationId}`;
      case 'legal':
        return `${baseUrl}/dashboards/legal?org=${organizationId}`;
      case 'real_estate':
        return `${baseUrl}/dashboards/real-estate?org=${organizationId}`;
      case 'ecommerce':
        return `${baseUrl}/dashboards/ecommerce?org=${organizationId}`;
      case 'construction':
        return `${baseUrl}/dashboards/construction?org=${organizationId}`;
      case 'logistics':
        return `${baseUrl}/dashboards/logistics?org=${organizationId}`;
      case 'government':
        return `${baseUrl}/dashboards/government?org=${organizationId}`;
      case 'education':
        return `${baseUrl}/dashboards/education?org=${organizationId}`;
      case 'retail':
        return `${baseUrl}/dashboards/retail?org=${organizationId}`;
      case 'hospitality':
        return `${baseUrl}/dashboards/hospitality?org=${organizationId}`;
      case 'wellness':
        return `${baseUrl}/dashboards/wellness?org=${organizationId}`;
      case 'beauty':
        return `${baseUrl}/dashboards/beauty?org=${organizationId}`;
      default:
        return `${baseUrl}/dashboards?org=${organizationId}`;
    }
  }

  /**
   * Send 2FA code using Telnyx or Sinch
   */
  private async send2FACode(phoneNumber: string, code: string, method: 'sms' | 'voice'): Promise<{ success: boolean; provider?: string; error?: string }> {
    try {
      // Try Telnyx first
      const telnyxResult = await this.sendViaTelnyx(phoneNumber, code, method);
      if (telnyxResult.success) {
        return { success: true, provider: 'telnyx' };
      }

      // Fallback to Sinch
      const sinchResult = await this.sendViaSinch(phoneNumber, code, method);
      if (sinchResult.success) {
        return { success: true, provider: 'sinch' };
      }

      return {
        success: false,
        error: 'Failed to send verification code. Please try again later.'
      };

    } catch (error) {
      console.error('❌ 2FA code sending failed:', error);
      return {
        success: false,
        error: 'Failed to send verification code. Please try again later.'
      };
    }
  }

  /**
   * Send code via Telnyx
   */
  private async sendViaTelnyx(phoneNumber: string, code: string, method: 'sms' | 'voice'): Promise<{ success: boolean; error?: string }> {
    try {
      const message = `Your TETRIX verification code is: ${code}`;
      
      if (method === 'sms') {
        // Use existing Telnyx SMS service
        const response = await fetch('/api/v2/2fa/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber,
            method: 'sms',
            message
          })
        });
        
        const result = await response.json();
        return { success: result.success, error: result.error };
      } else {
        // Use existing Telnyx Voice service
        const response = await fetch('/api/v2/2fa/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber,
            method: 'voice',
            message: `Your TETRIX verification code is ${code}. Please enter this code to complete verification.`
          })
        });
        
        const result = await response.json();
        return { success: result.success, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Telnyx service unavailable' };
    }
  }

  /**
   * Send code via Sinch
   */
  private async sendViaSinch(phoneNumber: string, code: string, method: 'sms' | 'voice'): Promise<{ success: boolean; error?: string }> {
    try {
      const message = `Your TETRIX verification code is: ${code}`;
      
      if (method === 'sms') {
        const response = await fetch('/api/v2/2fa/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber,
            method: 'sms',
            provider: 'sinch',
            message
          })
        });
        
        const result = await response.json();
        return { success: result.success, error: result.error };
      } else {
        const response = await fetch('/api/v2/2fa/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber,
            method: 'voice',
            provider: 'sinch',
            message: `Your TETRIX verification code is ${code}. Please enter this code to complete verification.`
          })
        });
        
        const result = await response.json();
        return { success: result.success, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Sinch service unavailable' };
    }
  }

  /**
   * Generate industry-specific access tokens
   */
  private async generateIndustryTokens(user: User, organization: Organization, session: Industry2FASession): Promise<{ accessToken: string; refreshToken: string }> {
    // This would integrate with your existing JWT token generation
    // For now, return mock tokens
    return {
      accessToken: `industry_${session.id}_${Date.now()}`,
      refreshToken: `refresh_${session.id}_${Date.now()}`
    };
  }

  /**
   * Find user by phone number
   */
  private async findUserByPhone(phoneNumber: string): Promise<User | null> {
    // This would query your user database
    // For now, return null to trigger user creation
    return null;
  }

  /**
   * Create new industry user
   */
  private async createIndustryUser(phoneNumber: string, industry: IndustryType): Promise<User> {
    const userId = this.generateSessionId();
    return {
      id: userId,
      email: '', // Will be set later
      phone: phoneNumber,
      status: 'active',
      createdAt: new Date(),
      mfaEnabled: true,
      mfaVerified: false
    };
  }

  /**
   * Get user's organizations for specific industry
   */
  private async getUserOrganizations(userId: string, industry: IndustryType): Promise<Organization[]> {
    // For development/testing, create a default organization
    const defaultOrg: Organization = {
      id: `org_${industry}_default`,
      name: `${industry.charAt(0).toUpperCase() + industry.slice(1)} Organization`,
      industry: industry,
      status: 'active',
      createdAt: new Date(),
      settings: {
        timezone: 'UTC',
        language: 'en',
        notifications: {
          email: true,
          sms: true,
          push: true
        }
      },
      compliance: {
        gdpr: true,
        hipaa: industry === 'healthcare',
        sox: industry === 'legal' || industry === 'government',
        pci: industry === 'retail' || industry === 'ecommerce'
      }
    };

    return [defaultOrg];
  }

  /**
   * Get user membership for organization
   */
  private async getUserMembership(userId: string, organizationId: string): Promise<Membership | null> {
    // For development/testing, create a default membership
    const defaultMembership: Membership = {
      userId: userId,
      orgId: organizationId,
      primaryRole: 'admin',
      secondaryRoles: ['user'],
      isOrgAdmin: true,
      permissions: ['read', 'write', 'admin'],
      department: 'General',
      location: 'Default',
      assignedAt: new Date()
    };

    return defaultMembership;
  }

  /**
   * Get user by ID
   */
  private async getUser(userId: string): Promise<User | null> {
    // For development/testing, return a mock user
    return {
      id: userId,
      email: `user_${userId}@example.com`,
      phone: '+1234567890',
      status: 'active',
      createdAt: new Date(),
      mfaEnabled: true,
      mfaVerified: true
    };
  }

  /**
   * Get organization by ID
   */
  private async getOrganization(organizationId: string): Promise<Organization | null> {
    // For development/testing, return a mock organization
    const industry = organizationId.split('_')[1] as IndustryType;
    return {
      id: organizationId,
      name: `${industry.charAt(0).toUpperCase() + industry.slice(1)} Organization`,
      industry: industry,
      status: 'active',
      createdAt: new Date(),
      settings: {
        timezone: 'UTC',
        language: 'en',
        notifications: {
          email: true,
          sms: true,
          push: true
        }
      },
      compliance: {
        gdpr: true,
        hipaa: industry === 'healthcare',
        sox: industry === 'legal' || industry === 'government',
        pci: industry === 'retail' || industry === 'ecommerce'
      }
    };
  }

  /**
   * Get user permissions
   */
  private async getUserPermissions(userId: string, organizationId: string): Promise<string[]> {
    // For development/testing, return default permissions
    return ['read', 'write', 'admin'];
  }

  /**
   * Validate phone number format
   */
  private isValidPhoneNumber(phoneNumber: string): boolean {
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
  }

  /**
   * Generate verification code
   */
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log authentication event
   */
  private async logAuthEvent(event: {
    userId: string;
    organizationId: string;
    action: string;
    details: any;
  }): Promise<void> {
    console.log('📝 Auth event logged:', event);
    // This would integrate with your audit logging system
  }
}

// Export singleton instance
export const industry2FAAuthService = new Industry2FAAuthService();
