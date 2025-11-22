/**
 * TETRIX Type-Safe Authentication Client SDK
 * Following Better Auth patterns for type safety and developer experience
 */

// ============================================================================
// Type Definitions
// ============================================================================

export type ErrorCode =
  | 'UNAUTHORIZED'
  | 'INVALID_SESSION'
  | 'SESSION_EXPIRED'
  | 'INVALID_OTP'
  | 'OTP_EXPIRED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR';

export interface APIError {
  code: ErrorCode;
  message: string;
  details?: Record<string, any>;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  message?: string;
}

// ============================================================================
// Auth API Types
// ============================================================================

export interface UserLookupRequest {
  phoneNumber: string;
}

export interface UserLookupResponse {
  exists: boolean;
  isNewUser: boolean;
  userId?: string;
}

export interface InitiateOTPRequest {
  phoneNumber: string;
  countryCode: string;
  verificationType?: 'sms' | 'voice' | 'whatsapp';
}

export interface InitiateOTPResponse {
  verificationId: string;
  phoneNumber: string;
  method: string;
  expiresAt: string;
  message: string;
}

export interface RegistrationData {
  firstName: string;
  lastName: string;
  industry: string;
  role: string;
  organization: string;
}

export interface VerifyOTPRequest {
  verificationId: string;
  code: string;
  phoneNumber: string;
  registrationData?: RegistrationData; // Optional registration data for new users
}

export interface VerifyOTPResponse {
  verified: boolean;
  verificationId: string;
  phoneNumber: string;
  token: string;
  refreshToken?: string;
  expiresAt: string;
  user?: {
    id: string;
    email?: string;
    phone: string;
    firstName?: string;
    lastName?: string;
    industry?: string;
    role?: string;
    organization?: string;
  };
}

export interface SessionResponse {
  valid: boolean;
  user?: {
    id: string;
    email: string;
    phone: string | null;
    firstName: string;
    lastName: string;
    role: string | null;
  };
  expiresAt?: string;
}

// ============================================================================
// Client Configuration
// ============================================================================

export interface TetrixAuthClientConfig {
  baseURL?: string;
  timeout?: number;
}

// ============================================================================
// TETRIX Auth Client
// ============================================================================

export class TetrixAuthClient {
  private baseURL: string;
  private timeout: number;

  constructor(config: TetrixAuthClientConfig = {}) {
    this.baseURL = config.baseURL || '/api/v2';
    this.timeout = config.timeout || 30000;
  }

  /**
   * Internal fetch wrapper with error handling
   */
  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
        credentials: 'include', // Include cookies
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: data.error?.code || 'INTERNAL_ERROR',
            message: data.error?.message || 'Request failed',
            details: data.error?.details,
          },
        };
      }

      // For verify endpoint, the backend returns { success, verified, user, session, token }
      // We need to preserve this structure in result.data
      // If data already has a 'data' property, use it; otherwise use the whole response
      const responseData = data.data || data;
      
      return {
        success: true,
        data: responseData,
        message: data.message,
      };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Request timeout',
          },
        };
      }

      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || 'Network error',
        },
      };
    }
  }

  // ========================================================================
  // Auth Methods
  // ========================================================================

  /**
   * Lookup user by phone number
   */
  async lookupUser(phoneNumber: string): Promise<APIResponse<UserLookupResponse>> {
    return this.fetch<UserLookupResponse>('/auth/lookup', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber }),
    });
  }

  /**
   * Initiate OTP verification
   */
  async initiateOTP(
    request: InitiateOTPRequest
  ): Promise<APIResponse<InitiateOTPResponse>> {
    return this.fetch<InitiateOTPResponse>('/2fa/initiate', {
      method: 'POST',
      body: JSON.stringify({
        phoneNumber: request.phoneNumber,
        countryCode: request.countryCode,
        verificationType: request.verificationType || 'sms',
      }),
    });
  }

  /**
   * Verify OTP code
   * Note: Session cookies are automatically set by the server response
   */
  async verifyOTP(
    request: VerifyOTPRequest
  ): Promise<APIResponse<VerifyOTPResponse>> {
    return this.fetch<VerifyOTPResponse>('/2fa/verify', {
      method: 'POST',
      body: JSON.stringify(request),
      credentials: 'include', // Ensure cookies are included and set
    });
  }

  /**
   * Get current session
   */
  async getSession(): Promise<APIResponse<SessionResponse>> {
    return this.fetch<SessionResponse>('/auth/session');
  }

  /**
   * Refresh session token
   */
  async refreshSession(refreshToken: string): Promise<APIResponse<SessionResponse>> {
    return this.fetch<SessionResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  /**
   * Logout (revoke session)
   */
  async logout(): Promise<APIResponse<void>> {
    return this.fetch<void>('/auth/logout', {
      method: 'POST',
    });
  }
}

// ============================================================================
// Default Export - Singleton Instance
// ============================================================================

let defaultClient: TetrixAuthClient | null = null;

/**
 * Get or create default auth client instance
 */
export function getAuthClient(config?: TetrixAuthClientConfig): TetrixAuthClient {
  if (!defaultClient) {
    defaultClient = new TetrixAuthClient(config);
  }
  return defaultClient;
}

/**
 * Create a new auth client instance
 */
export function createAuthClient(config?: TetrixAuthClientConfig): TetrixAuthClient {
  return new TetrixAuthClient(config);
}

// Default export
export default getAuthClient();

