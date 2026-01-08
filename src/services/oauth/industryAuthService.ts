// Industry Authentication Service
// Handles OAuth 2.0 flows (Authorization Code Grant & Client Credentials Grant) for enterprise integrations

import { tokenManagementService, OAuthTokens } from './tokenManagementService';
import { redisService } from './redisService';
import { auditEvidenceService } from '../compliance/auditEvidenceService';

export type OAuthGrantType = 'authorization_code' | 'client_credentials';
export type IndustryProvider = 
  | 'salesforce' 
  | 'hubspot' 
  | 'epic' 
  | 'cerner' 
  | 'shopify' 
  | 'clio'
  | 'custom';

export interface OAuthConfig {
  provider: IndustryProvider;
  clientId: string;
  clientSecret: string;
  authorizationUrl: string;
  tokenUrl: string;
  redirectUri: string;
  scopes: string[];
  grantType: OAuthGrantType;
  pkceEnabled?: boolean; // For SMART on FHIR (Epic, Cerner)
}

export interface AuthorizationCodeFlowParams {
  userId: string;
  integrationId: string;
  config: OAuthConfig;
  state?: string;
}

export interface ClientCredentialsFlowParams {
  tenantId: string;
  integrationId: string;
  config: OAuthConfig;
}

export interface OAuthCallbackParams {
  code: string;
  state?: string;
  userId: string;
  integrationId: string;
  config: OAuthConfig;
}

export class IndustryAuthService {
  /**
   * Initiate Authorization Code Grant flow (3-legged OAuth)
   * Returns authorization URL for user to visit
   */
  async initiateAuthorizationCodeFlow(
    params: AuthorizationCodeFlowParams
  ): Promise<{ authorizationUrl: string; state: string; codeVerifier?: string }> {
    try {
      const { userId, integrationId, config, state: providedState } = params;

      // Generate state for CSRF protection
      const state = providedState || this.generateState();

      // Generate PKCE code verifier and challenge (for SMART on FHIR)
      let codeVerifier: string | undefined;
      let codeChallenge: string | undefined;

      if (config.pkceEnabled) {
        codeVerifier = this.generateCodeVerifier();
        codeChallenge = await this.generateCodeChallenge(codeVerifier);
      }

      // Build authorization URL
      const authParams = new URLSearchParams({
        response_type: 'code',
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        scope: config.scopes.join(' '),
        state,
        ...(codeChallenge && {
          code_challenge: codeChallenge,
          code_challenge_method: 'S256',
        }),
      });

      const authorizationUrl = `${config.authorizationUrl}?${authParams.toString()}`;

      // Store state and code verifier temporarily (for callback validation)
      await this.storeOAuthState(userId, integrationId, {
        state,
        codeVerifier,
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      });

      // Log audit event
      await auditEvidenceService.logEvent({
        tenantId: userId,
        callId: integrationId,
        eventType: 'oauth.initiate',
        eventData: {
          action: 'oauth_authorization_initiated',
          provider: config.provider,
          grantType: 'authorization_code',
        },
        metadata: {
          service: 'industry_auth',
        },
      });

      return {
        authorizationUrl,
        state,
        codeVerifier,
      };
    } catch (error) {
      console.error('Error initiating authorization code flow:', error);
      throw new Error('Failed to initiate OAuth authorization flow');
    }
  }

  /**
   * Handle OAuth callback and exchange authorization code for tokens
   */
  async handleAuthorizationCallback(
    params: OAuthCallbackParams
  ): Promise<{ success: boolean; integrationId: string }> {
    try {
      const { code, state, userId, integrationId, config } = params;

      // Validate state
      const storedState = await this.getOAuthState(userId, integrationId);
      if (!storedState || storedState.state !== state) {
        throw new Error('Invalid OAuth state. Possible CSRF attack.');
      }

      if (storedState.expiresAt < Date.now()) {
        throw new Error('OAuth state expired. Please restart the flow.');
      }

      // Prepare token request
      const tokenParams: Record<string, string> = {
        grant_type: 'authorization_code',
        code,
        redirect_uri: config.redirectUri,
        client_id: config.clientId,
        client_secret: config.clientSecret,
      };

      // Add PKCE code verifier if enabled
      if (config.pkceEnabled && storedState.codeVerifier) {
        tokenParams.code_verifier = storedState.codeVerifier;
      }

      // Exchange authorization code for tokens
      const response = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(tokenParams),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
      }

      const tokenData: OAuthTokens = await response.json();

      // Store tokens securely
      await tokenManagementService.storeTokens(userId, integrationId, {
        ...tokenData,
        tokenUrl: config.tokenUrl,
        issuedAt: Math.floor(Date.now() / 1000),
      });

      // Clean up state
      await this.clearOAuthState(userId, integrationId);

      // Log audit event
      await auditEvidenceService.logEvent({
        tenantId: userId,
        callId: integrationId,
        eventType: 'oauth.complete',
        eventData: {
          action: 'oauth_authorization_completed',
          provider: config.provider,
          grantType: 'authorization_code',
        },
        metadata: {
          service: 'industry_auth',
        },
      });

      return {
        success: true,
        integrationId,
      };
    } catch (error) {
      console.error('Error handling OAuth callback:', error);
      throw error;
    }
  }

  /**
   * Initiate Client Credentials Grant flow (2-legged OAuth)
   * Server-to-server authentication, no user interaction
   */
  async initiateClientCredentialsFlow(
    params: ClientCredentialsFlowParams
  ): Promise<{ success: boolean; integrationId: string }> {
    try {
      const { tenantId, integrationId, config } = params;

      // Request access token using client credentials
      const response = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: config.clientId,
          client_secret: config.clientSecret,
          scope: config.scopes.join(' '),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Client credentials flow failed: ${response.status} ${errorText}`);
      }

      const tokenData: OAuthTokens = await response.json();

      // Store tokens securely (using tenantId as userId for server-to-server)
      await tokenManagementService.storeTokens(tenantId, integrationId, {
        ...tokenData,
        tokenUrl: config.tokenUrl,
        issuedAt: Math.floor(Date.now() / 1000),
      });

      // Log audit event
      await auditEvidenceService.logEvent({
        tenantId,
        callId: integrationId,
        eventType: 'oauth.complete',
        eventData: {
          action: 'oauth_client_credentials_completed',
          provider: config.provider,
          grantType: 'client_credentials',
        },
        metadata: {
          service: 'industry_auth',
        },
      });

      return {
        success: true,
        integrationId,
      };
    } catch (error) {
      console.error('Error in client credentials flow:', error);
      throw error;
    }
  }

  /**
   * Get access token for integration (with automatic refresh if needed)
   */
  async getAccessToken(
    userId: string,
    integrationId: string
  ): Promise<string> {
    return tokenManagementService.getAccessToken(userId, integrationId, true);
  }

  /**
   * Revoke integration access
   */
  async revokeIntegration(
    userId: string,
    integrationId: string
  ): Promise<void> {
    await tokenManagementService.revokeTokens(userId, integrationId);

    // Log audit event
    await auditEvidenceService.logEvent({
      tenantId: userId,
      callId: integrationId,
      eventType: 'oauth.revoke',
      eventData: {
        action: 'oauth_tokens_revoked',
      },
      metadata: {
        service: 'industry_auth',
      },
    });
  }

  /**
   * Check if integration is authenticated
   */
  async isAuthenticated(
    userId: string,
    integrationId: string
  ): Promise<boolean> {
    return tokenManagementService.hasValidTokens(userId, integrationId);
  }

  /**
   * Generate random state for CSRF protection
   */
  private generateState(): string {
    return crypto.randomBytes(32).toString('base64url');
  }

  /**
   * Generate PKCE code verifier
   */
  private generateCodeVerifier(): string {
    return crypto.randomBytes(32).toString('base64url');
  }

  /**
   * Generate PKCE code challenge from verifier
   */
  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Buffer.from(digest).toString('base64url');
  }

  /**
   * Store OAuth state temporarily (for callback validation)
   */
  private async storeOAuthState(
    userId: string,
    integrationId: string,
    stateData: { state: string; codeVerifier?: string; expiresAt: number }
  ): Promise<void> {
    const key = `oauth_state:${userId}:${integrationId}`;
    const ttl = Math.floor((stateData.expiresAt - Date.now()) / 1000);
    
    if (ttl > 0) {
      await redisService.setex(key, ttl, JSON.stringify(stateData));
    }
  }

  /**
   * Get stored OAuth state
   */
  private async getOAuthState(
    userId: string,
    integrationId: string
  ): Promise<{ state: string; codeVerifier?: string; expiresAt: number } | null> {
    const key = `oauth_state:${userId}:${integrationId}`;
    const stateData = await redisService.get(key);
    
    if (!stateData) {
      return null;
    }

    return JSON.parse(stateData);
  }

  /**
   * Clear OAuth state after use
   */
  private async clearOAuthState(
    userId: string,
    integrationId: string
  ): Promise<void> {
    const key = `oauth_state:${userId}:${integrationId}`;
    await redisService.del(key);
  }
}

// Export singleton instance
export const industryAuthService = new IndustryAuthService();
