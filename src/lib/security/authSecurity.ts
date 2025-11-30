/**
 * Authentication Security Module
 * Provides security utilities for authentication endpoints including:
 * - Rate limiting
 * - IP blocking
 * - CSRF protection
 * - Input validation and sanitization
 * - Security headers
 */

interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
  cleaned?: string;
  normalized?: string;
}

// In-memory storage for rate limiting and IP blocking
// In production, this should use Redis or a database
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const blockedIPs = new Map<string, number>(); // IP -> unblock timestamp
const failedAttempts = new Map<string, number>(); // IP -> failed attempt count

// Configuration
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100; // Max requests per window
const STRICT_RATE_LIMIT_MAX = 10; // Max requests for strict endpoints
const MAX_FAILED_ATTEMPTS = 5; // Max failed attempts before blocking
const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes block duration

class AuthSecurity {
  /**
   * Extract client IP from request headers
   */
  getClientIP(headers: Headers): string {
    // Check various headers for IP address
    const forwarded = headers.get('x-forwarded-for');
    if (forwarded) {
      // x-forwarded-for can contain multiple IPs, take the first one
      return forwarded.split(',')[0].trim();
    }

    const realIP = headers.get('x-real-ip');
    if (realIP) {
      return realIP.trim();
    }

    const cfConnectingIP = headers.get('cf-connecting-ip');
    if (cfConnectingIP) {
      return cfConnectingIP.trim();
    }

    // Fallback to a default IP (in production, this should come from the request)
    return 'unknown';
  }

  /**
   * Check if an IP is currently blocked
   */
  isBlocked(ip: string): boolean {
    const unblockTime = blockedIPs.get(ip);
    if (!unblockTime) {
      return false;
    }

    // If block has expired, remove it
    if (Date.now() > unblockTime) {
      blockedIPs.delete(ip);
      failedAttempts.delete(ip);
      return false;
    }

    return true;
  }

  /**
   * Get the unblock time for an IP
   */
  getUnblockTime(ip: string): number | null {
    return blockedIPs.get(ip) || null;
  }

  /**
   * Check rate limit for an IP
   */
  checkRateLimit(ip: string, strict: boolean = false): RateLimitResult {
    const now = Date.now();
    const maxRequests = strict ? STRICT_RATE_LIMIT_MAX : RATE_LIMIT_MAX_REQUESTS;
    const key = `${ip}:${strict ? 'strict' : 'normal'}`;

    const record = rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
      // Create new rate limit record
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + RATE_LIMIT_WINDOW
      });
      return { allowed: true };
    }

    // Increment count
    record.count++;

    if (record.count > maxRequests) {
      // Rate limit exceeded
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      return {
        allowed: false,
        retryAfter
      };
    }

    return { allowed: true };
  }

  /**
   * Validate origin for CSRF protection
   */
  validateOrigin(origin: string | null, referer: string | null): boolean {
    // In development, allow localhost
    if (process.env.NODE_ENV === 'development') {
      if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
        return true;
      }
      if (referer && (referer.includes('localhost') || referer.includes('127.0.0.1'))) {
        return true;
      }
    }

    // Get allowed origins from environment
    const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [];
    const allowedDomains = [
      'tetrixcorp.com',
      'joromi.ai',
      'api.tetrixcorp.com',
      'iot.tetrixcorp.com',
      'vpn.tetrixcorp.com',
      ...allowedOrigins
    ];

    // Check origin
    if (origin) {
      try {
        const originUrl = new URL(origin);
        if (allowedDomains.some(domain => originUrl.hostname === domain || originUrl.hostname.endsWith(`.${domain}`))) {
          return true;
        }
      } catch (e) {
        // Invalid origin URL
      }
    }

    // Check referer
    if (referer) {
      try {
        const refererUrl = new URL(referer);
        if (allowedDomains.some(domain => refererUrl.hostname === domain || refererUrl.hostname.endsWith(`.${domain}`))) {
          return true;
        }
      } catch (e) {
        // Invalid referer URL
      }
    }

    return false;
  }

  /**
   * Validate Content-Type header
   */
  validateContentType(contentType: string | null): boolean {
    if (!contentType) {
      return false;
    }

    // Must be application/json
    return contentType.toLowerCase().includes('application/json');
  }

  /**
   * Record a failed authentication attempt
   */
  recordFailedAttempt(ip: string): void {
    const currentAttempts = failedAttempts.get(ip) || 0;
    const newAttempts = currentAttempts + 1;

    failedAttempts.set(ip, newAttempts);

    // Block IP if max attempts exceeded
    if (newAttempts >= MAX_FAILED_ATTEMPTS) {
      blockedIPs.set(ip, Date.now() + BLOCK_DURATION);
      console.warn(`🚫 IP ${ip} blocked due to ${newAttempts} failed attempts`);
    }
  }

  /**
   * Reset failed attempts for an IP
   */
  resetFailedAttempts(ip: string): void {
    failedAttempts.delete(ip);
    blockedIPs.delete(ip);
  }

  /**
   * Validate verification code format
   */
  validateVerificationCode(code: string): ValidationResult {
    // Remove whitespace
    const cleaned = code.replace(/\s+/g, '');

    // Must be 4-8 digits
    if (!/^\d{4,8}$/.test(cleaned)) {
      return {
        valid: false,
        error: 'Verification code must be 4-8 digits'
      };
    }

    return {
      valid: true,
      cleaned
    };
  }

  /**
   * Validate and normalize phone number
   */
  validatePhoneNumber(phoneNumber: string): ValidationResult {
    // Remove whitespace and special characters except +
    const cleaned = phoneNumber.replace(/[\s\-\(\)\.]/g, '');

    // Must start with + and have 10-15 digits
    if (!/^\+?\d{10,15}$/.test(cleaned)) {
      return {
        valid: false,
        error: 'Invalid phone number format'
      };
    }

    // Normalize to E.164 format (ensure it starts with +)
    const normalized = cleaned.startsWith('+') ? cleaned : `+${cleaned}`;

    return {
      valid: true,
      cleaned: normalized,
      normalized
    };
  }

  /**
   * Sanitize input to prevent injection attacks
   */
  sanitizeInput(input: string): string {
    // Remove potentially dangerous characters
    return input
      .replace(/[<>]/g, '') // Remove HTML brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim()
      .substring(0, 255); // Limit length
  }

  /**
   * Generate a secure random token
   */
  generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    
    // Use crypto.randomBytes if available, otherwise fallback
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const array = new Uint8Array(length);
      crypto.getRandomValues(array);
      for (let i = 0; i < length; i++) {
        token += chars[array[i] % chars.length];
      }
    } else {
      // Fallback for environments without crypto
      for (let i = 0; i < length; i++) {
        token += chars[Math.floor(Math.random() * chars.length)];
      }
    }

    return token;
  }

  /**
   * Get security headers for responses
   */
  getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'",
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    };
  }

  /**
   * Clean up old rate limit records (call periodically)
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key);
      }
    }

    // Clean up expired blocks
    for (const [ip, unblockTime] of blockedIPs.entries()) {
      if (now > unblockTime) {
        blockedIPs.delete(ip);
        failedAttempts.delete(ip);
      }
    }
  }
}

// Export singleton instance
export const authSecurity = new AuthSecurity();

// Cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    authSecurity.cleanup();
  }, 5 * 60 * 1000);
}




