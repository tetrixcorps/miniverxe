// Token Management Service
// Handles OAuth 2.0 token storage, retrieval, and refresh with encryption and Redis caching

import { encryptionService } from './encryptionService';
import { redisService } from './redisService';

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number; // seconds
  tokenType?: string;
  scope?: string;
  tokenUrl?: string; // URL for token refresh
  issuedAt?: number; // Unix timestamp
}

export interface StoredTokenData {
  accessToken: string; // encrypted
  refreshToken?: string; // encrypted
  expiresAt: number; // Unix timestamp
  tokenUrl?: string;
  scope?: string;
  tokenType?: string;
}

export class TokenManagementService {
  private readonly TOKEN_PREFIX = 'token';
  private readonly DEFAULT_TTL_BUFFER = 60; // 60 seconds buffer before expiry

  /**
   * Securely store OAuth tokens for a user's integration
   */
  async storeTokens(
    userId: string,
    integrationId: string,
    tokens: OAuthTokens
  ): Promise<void> {
    try {
      // Encrypt sensitive tokens
      const encryptedAccessToken = encryptionService.encrypt(tokens.accessToken);
      const encryptedRefreshToken = tokens.refreshToken
        ? encryptionService.encrypt(tokens.refreshToken)
        : undefined;

      // Calculate expiration timestamp
      const issuedAt = tokens.issuedAt || Math.floor(Date.now() / 1000);
      const expiresAt = issuedAt + tokens.expiresIn;

      // Prepare token data
      const tokenData: StoredTokenData = {
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiresAt,
        tokenUrl: tokens.tokenUrl,
        scope: tokens.scope,
        tokenType: tokens.tokenType || 'Bearer'
      };

      // Store in Redis with TTL (slightly less than expiry for safety)
      const redisKey = this.getTokenKey(userId, integrationId);
      const ttl = tokens.expiresIn - this.DEFAULT_TTL_BUFFER;
      
      if (ttl > 0) {
        await redisService.setex(
          redisKey,
          ttl,
          JSON.stringify(tokenData)
        );
      }

      // Also store in database for persistence (fallback if Redis fails)
      await this.storeTokensInDB(userId, integrationId, tokenData);

      console.log(`Stored tokens for user ${userId}, integration ${integrationId}`);
    } catch (error) {
      console.error('Error storing tokens:', error);
      throw new Error('Failed to store OAuth tokens');
    }
  }

  /**
   * Retrieve and refresh access tokens on demand
   */
  async getAccessToken(
    userId: string,
    integrationId: string,
    autoRefresh = true
  ): Promise<string> {
    try {
      // Try Redis first
      const redisKey = this.getTokenKey(userId, integrationId);
      const cachedTokenData = await redisService.get(redisKey);

      if (cachedTokenData) {
        const tokenData: StoredTokenData = JSON.parse(cachedTokenData);
        
        // Check if token is still valid
        const now = Math.floor(Date.now() / 1000);
        if (tokenData.expiresAt > now) {
          // Token is valid, decrypt and return
          return encryptionService.decrypt(tokenData.accessToken);
        }
      }

      // Token expired or not in cache, try database
      const storedTokens = await this.getStoredTokensFromDB(userId, integrationId);
      
      if (!storedTokens) {
        throw new Error('No tokens found. Re-authentication required.');
      }

      // Check if token is still valid
      const now = Math.floor(Date.now() / 1000);
      if (storedTokens.expiresAt > now) {
        // Token is still valid, decrypt and cache
        const decryptedToken = encryptionService.decrypt(storedTokens.accessToken);
        
        // Re-cache in Redis
        const ttl = storedTokens.expiresAt - now;
        if (ttl > 0) {
          await redisService.setex(redisKey, ttl, JSON.stringify(storedTokens));
        }
        
        return decryptedToken;
      }

      // Token has expired, try to refresh
      if (autoRefresh && storedTokens.refreshToken) {
        return await this.refreshAccessToken(userId, integrationId, storedTokens);
      }

      throw new Error('Access token expired and refresh token not available. Re-authentication required.');
    } catch (error) {
      console.error('Error retrieving access token:', error);
      throw error;
    }
  }

  /**
   * Refresh an expired access token using refresh token
   */
  async refreshAccessToken(
    userId: string,
    integrationId: string,
    storedTokens?: StoredTokenData
  ): Promise<string> {
    try {
      // Get stored tokens if not provided
      if (!storedTokens) {
        storedTokens = await this.getStoredTokensFromDB(userId, integrationId);
      }

      if (!storedTokens || !storedTokens.refreshToken) {
        throw new Error('Refresh token not found. Re-authentication required.');
      }

      // Get integration config to find token URL
      const integrationConfig = await this.getIntegrationConfig(userId, integrationId);
      
      if (!integrationConfig || !storedTokens.tokenUrl) {
        throw new Error('Token refresh URL not configured. Re-authentication required.');
      }

      // Decrypt refresh token
      const refreshToken = encryptionService.decrypt(storedTokens.refreshToken);

      // Request new access token
      const response = await fetch(storedTokens.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: integrationConfig.clientId || '',
          client_secret: integrationConfig.clientSecret || '',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Token refresh failed: ${response.status} ${errorText}`);
      }

      const newTokens: OAuthTokens = await response.json();

      // Store new tokens
      await this.storeTokens(userId, integrationId, {
        ...newTokens,
        tokenUrl: storedTokens.tokenUrl,
        issuedAt: Math.floor(Date.now() / 1000),
      });

      return newTokens.accessToken;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw error;
    }
  }

  /**
   * Revoke tokens for an integration
   */
  async revokeTokens(userId: string, integrationId: string): Promise<void> {
    try {
      // Remove from Redis
      const redisKey = this.getTokenKey(userId, integrationId);
      await redisService.del(redisKey);

      // Remove from database
      await this.deleteTokensFromDB(userId, integrationId);

      console.log(`Revoked tokens for user ${userId}, integration ${integrationId}`);
    } catch (error) {
      console.error('Error revoking tokens:', error);
      throw new Error('Failed to revoke tokens');
    }
  }

  /**
   * Check if tokens exist and are valid
   */
  async hasValidTokens(userId: string, integrationId: string): Promise<boolean> {
    try {
      const token = await this.getAccessToken(userId, integrationId, false);
      return !!token;
    } catch {
      return false;
    }
  }

  /**
   * Get token expiration time
   */
  async getTokenExpiration(userId: string, integrationId: string): Promise<Date | null> {
    try {
      const storedTokens = await this.getStoredTokensFromDB(userId, integrationId);
      if (!storedTokens) {
        return null;
      }
      return new Date(storedTokens.expiresAt * 1000);
    } catch {
      return null;
    }
  }

  /**
   * Generate Redis key for token storage
   */
  private getTokenKey(userId: string, integrationId: string): string {
    return `${this.TOKEN_PREFIX}:${userId}:${integrationId}`;
  }

  /**
   * Store tokens in database (fallback persistence)
   * TODO: Implement actual database storage
   */
  private async storeTokensInDB(
    userId: string,
    integrationId: string,
    tokenData: StoredTokenData
  ): Promise<void> {
    // In production, this would use Prisma or similar ORM
    // For now, this is a placeholder
    console.log(`[DB] Storing tokens for ${userId}:${integrationId}`);
    
    // Example implementation:
    // await prisma.oAuthToken.upsert({
    //   where: { userId_integrationId: { userId, integrationId } },
    //   update: { ...tokenData, updatedAt: new Date() },
    //   create: { userId, integrationId, ...tokenData }
    // });
  }

  /**
   * Retrieve tokens from database
   * TODO: Implement actual database retrieval
   */
  private async getStoredTokensFromDB(
    userId: string,
    integrationId: string
  ): Promise<StoredTokenData | null> {
    // In production, this would use Prisma or similar ORM
    console.log(`[DB] Retrieving tokens for ${userId}:${integrationId}`);
    
    // Example implementation:
    // const token = await prisma.oAuthToken.findUnique({
    //   where: { userId_integrationId: { userId, integrationId } }
    // });
    // return token ? { ...token } : null;
    
    return null; // Placeholder
  }

  /**
   * Delete tokens from database
   * TODO: Implement actual database deletion
   */
  private async deleteTokensFromDB(
    userId: string,
    integrationId: string
  ): Promise<void> {
    // In production, this would use Prisma or similar ORM
    console.log(`[DB] Deleting tokens for ${userId}:${integrationId}`);
    
    // Example implementation:
    // await prisma.oAuthToken.delete({
    //   where: { userId_integrationId: { userId, integrationId } }
    // });
  }

  /**
   * Get integration configuration
   * TODO: Implement actual database retrieval
   */
  private async getIntegrationConfig(
    userId: string,
    integrationId: string
  ): Promise<{ clientId?: string; clientSecret?: string; tokenUrl?: string } | null> {
    // In production, this would retrieve from database
    // For now, return null (should be configured per integration)
    return null;
  }
}

// Export singleton instance
export const tokenManagementService = new TokenManagementService();
