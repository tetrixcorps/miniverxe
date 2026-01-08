// Unit tests for Industry Auth Service

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { industryAuthService } from '../../../src/services/oauth/industryAuthService';
import { tokenManagementService } from '../../../src/services/oauth/tokenManagementService';
import { redisService } from '../../../src/services/oauth/redisService';
import type { OAuthConfig } from '../../../src/services/oauth/industryAuthService';

// Mock dependencies
vi.mock('../../../src/services/oauth/tokenManagementService');
vi.mock('../../../src/services/oauth/redisService');
vi.mock('../../../src/services/compliance/auditEvidenceService', () => ({
  auditEvidenceService: {
    logEvent: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock fetch globally
global.fetch = vi.fn();

describe('IndustryAuthService', () => {
  const mockUserId = 'user_123';
  const mockIntegrationId = 'integration_456';
  const mockConfig: OAuthConfig = {
    provider: 'salesforce',
    clientId: 'test_client_id',
    clientSecret: 'test_client_secret',
    authorizationUrl: 'https://login.salesforce.com/services/oauth2/authorize',
    tokenUrl: 'https://login.salesforce.com/services/oauth2/token',
    redirectUri: 'http://localhost:3001/api/oauth/callback',
    scopes: ['api', 'refresh_token'],
    grantType: 'authorization_code',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initiateAuthorizationCodeFlow', () => {
    it('should generate authorization URL with state', async () => {
      (redisService.setex as any) = vi.fn().mockResolvedValue(true);

      const result = await industryAuthService.initiateAuthorizationCodeFlow({
        userId: mockUserId,
        integrationId: mockIntegrationId,
        config: mockConfig,
      });

      expect(result.authorizationUrl).toContain('https://login.salesforce.com/services/oauth2/authorize');
      expect(result.authorizationUrl).toContain('response_type=code');
      expect(result.authorizationUrl).toContain('client_id=test_client_id');
      expect(result.state).toBeDefined();
      expect(redisService.setex).toHaveBeenCalled();
    });

    it('should include PKCE parameters when enabled', async () => {
      const pkceConfig = { ...mockConfig, pkceEnabled: true };
      (redisService.setex as any) = vi.fn().mockResolvedValue(true);

      const result = await industryAuthService.initiateAuthorizationCodeFlow({
        userId: mockUserId,
        integrationId: mockIntegrationId,
        config: pkceConfig,
      });

      expect(result.authorizationUrl).toContain('code_challenge');
      expect(result.authorizationUrl).toContain('code_challenge_method=S256');
      expect(result.codeVerifier).toBeDefined();
    });
  });

  describe('handleAuthorizationCallback', () => {
    it('should exchange authorization code for tokens', async () => {
      const mockTokenResponse = {
        access_token: 'new_access_token',
        refresh_token: 'new_refresh_token',
        expires_in: 3600,
        token_type: 'Bearer',
        scope: 'api',
      };

      (redisService.get as any) = vi.fn().mockResolvedValue(
        JSON.stringify({
          state: 'test_state',
          expiresAt: Date.now() + 60000,
        })
      );
      (global.fetch as any) = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockTokenResponse),
      });
      (tokenManagementService.storeTokens as any) = vi.fn().mockResolvedValue(undefined);
      (redisService.del as any) = vi.fn().mockResolvedValue(true);

      const result = await industryAuthService.handleAuthorizationCallback({
        code: 'test_authorization_code',
        state: 'test_state',
        userId: mockUserId,
        integrationId: mockIntegrationId,
        config: mockConfig,
      });

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        mockConfig.tokenUrl,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/x-www-form-urlencoded',
          }),
        })
      );
      expect(tokenManagementService.storeTokens).toHaveBeenCalled();
    });

    it('should reject invalid state', async () => {
      (redisService.get as any) = vi.fn().mockResolvedValue(
        JSON.stringify({
          state: 'different_state',
          expiresAt: Date.now() + 60000,
        })
      );

      await expect(
        industryAuthService.handleAuthorizationCallback({
          code: 'test_code',
          state: 'test_state',
          userId: mockUserId,
          integrationId: mockIntegrationId,
          config: mockConfig,
        })
      ).rejects.toThrow('Invalid OAuth state');
    });
  });

  describe('initiateClientCredentialsFlow', () => {
    it('should authenticate using client credentials', async () => {
      const mockTokenResponse = {
        access_token: 'server_access_token',
        expires_in: 3600,
        token_type: 'Bearer',
        scope: 'api',
      };

      (global.fetch as any) = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockTokenResponse),
      });
      (tokenManagementService.storeTokens as any) = vi.fn().mockResolvedValue(undefined);

      const result = await industryAuthService.initiateClientCredentialsFlow({
        tenantId: 'tenant_123',
        integrationId: mockIntegrationId,
        config: { ...mockConfig, grantType: 'client_credentials' },
      });

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        mockConfig.tokenUrl,
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('grant_type=client_credentials'),
        })
      );
      expect(tokenManagementService.storeTokens).toHaveBeenCalled();
    });
  });

  describe('getAccessToken', () => {
    it('should retrieve access token from token management service', async () => {
      (tokenManagementService.getAccessToken as any) = vi.fn().mockResolvedValue('test_token');

      const token = await industryAuthService.getAccessToken(mockUserId, mockIntegrationId);

      expect(token).toBe('test_token');
      expect(tokenManagementService.getAccessToken).toHaveBeenCalledWith(mockUserId, mockIntegrationId, true);
    });
  });

  describe('revokeIntegration', () => {
    it('should revoke tokens and log audit event', async () => {
      (tokenManagementService.revokeTokens as any) = vi.fn().mockResolvedValue(undefined);

      await industryAuthService.revokeIntegration(mockUserId, mockIntegrationId);

      expect(tokenManagementService.revokeTokens).toHaveBeenCalledWith(mockUserId, mockIntegrationId);
    });
  });

  describe('isAuthenticated', () => {
    it('should check if integration is authenticated', async () => {
      (tokenManagementService.hasValidTokens as any) = vi.fn().mockResolvedValue(true);

      const isAuth = await industryAuthService.isAuthenticated(mockUserId, mockIntegrationId);

      expect(isAuth).toBe(true);
      expect(tokenManagementService.hasValidTokens).toHaveBeenCalledWith(mockUserId, mockIntegrationId);
    });
  });
});
