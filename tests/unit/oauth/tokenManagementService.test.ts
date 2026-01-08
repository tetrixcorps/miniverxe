// Unit tests for Token Management Service

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { tokenManagementService, OAuthTokens } from '../../../src/services/oauth/tokenManagementService';
import { encryptionService } from '../../../src/services/oauth/encryptionService';
import { redisService } from '../../../src/services/oauth/redisService';

// Mock dependencies
vi.mock('../../../src/services/oauth/encryptionService');
vi.mock('../../../src/services/oauth/redisService');

describe('TokenManagementService', () => {
  const mockUserId = 'user_123';
  const mockIntegrationId = 'integration_456';
  const mockTokens: OAuthTokens = {
    accessToken: 'test_access_token',
    refreshToken: 'test_refresh_token',
    expiresIn: 3600,
    tokenType: 'Bearer',
    scope: 'api',
    tokenUrl: 'https://api.example.com/token',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('storeTokens', () => {
    it('should encrypt and store tokens', async () => {
      const mockEncrypt = vi.fn((token: string) => `encrypted_${token}`);
      (encryptionService.encrypt as any) = mockEncrypt;
      (redisService.setex as any) = vi.fn().mockResolvedValue(true);

      await tokenManagementService.storeTokens(mockUserId, mockIntegrationId, mockTokens);

      expect(mockEncrypt).toHaveBeenCalledWith('test_access_token');
      expect(mockEncrypt).toHaveBeenCalledWith('test_refresh_token');
      expect(redisService.setex).toHaveBeenCalled();
    });

    it('should handle missing refresh token', async () => {
      const tokensWithoutRefresh = { ...mockTokens };
      delete tokensWithoutRefresh.refreshToken;

      const mockEncrypt = vi.fn((token: string) => `encrypted_${token}`);
      (encryptionService.encrypt as any) = mockEncrypt;
      (redisService.setex as any) = vi.fn().mockResolvedValue(true);

      await tokenManagementService.storeTokens(mockUserId, mockIntegrationId, tokensWithoutRefresh);

      expect(mockEncrypt).toHaveBeenCalledTimes(1); // Only access token
    });
  });

  describe('getAccessToken', () => {
    it('should retrieve and decrypt token from cache', async () => {
      const mockTokenData = {
        accessToken: 'encrypted_token',
        expiresAt: Math.floor(Date.now() / 1000) + 3600,
      };

      (redisService.get as any) = vi.fn().mockResolvedValue(JSON.stringify(mockTokenData));
      (encryptionService.decrypt as any) = vi.fn((encrypted: string) => encrypted.replace('encrypted_', ''));

      const token = await tokenManagementService.getAccessToken(mockUserId, mockIntegrationId, false);

      expect(token).toBe('token');
      expect(encryptionService.decrypt).toHaveBeenCalledWith('encrypted_token');
    });

    it('should return null if token expired and no refresh token', async () => {
      const mockTokenData = {
        accessToken: 'encrypted_token',
        expiresAt: Math.floor(Date.now() / 1000) - 100, // Expired
      };

      (redisService.get as any) = vi.fn().mockResolvedValue(JSON.stringify(mockTokenData));
      (tokenManagementService as any).getStoredTokensFromDB = vi.fn().mockResolvedValue(mockTokenData);

      await expect(
        tokenManagementService.getAccessToken(mockUserId, mockIntegrationId, false)
      ).rejects.toThrow('Access token expired');
    });
  });

  describe('revokeTokens', () => {
    it('should remove tokens from Redis and database', async () => {
      (redisService.del as any) = vi.fn().mockResolvedValue(true);
      (tokenManagementService as any).deleteTokensFromDB = vi.fn().mockResolvedValue(undefined);

      await tokenManagementService.revokeTokens(mockUserId, mockIntegrationId);

      expect(redisService.del).toHaveBeenCalled();
    });
  });

  describe('hasValidTokens', () => {
    it('should return true if valid tokens exist', async () => {
      const mockTokenData = {
        accessToken: 'encrypted_token',
        expiresAt: Math.floor(Date.now() / 1000) + 3600,
      };

      (redisService.get as any) = vi.fn().mockResolvedValue(JSON.stringify(mockTokenData));
      (encryptionService.decrypt as any) = vi.fn(() => 'token');

      const hasTokens = await tokenManagementService.hasValidTokens(mockUserId, mockIntegrationId);

      expect(hasTokens).toBe(true);
    });

    it('should return false if no tokens exist', async () => {
      (redisService.get as any) = vi.fn().mockResolvedValue(null);
      (tokenManagementService as any).getStoredTokensFromDB = vi.fn().mockResolvedValue(null);

      const hasTokens = await tokenManagementService.hasValidTokens(mockUserId, mockIntegrationId);

      expect(hasTokens).toBe(false);
    });
  });
});
