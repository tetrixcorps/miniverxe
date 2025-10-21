// Enterprise-Grade 2FA Service using Telnyx Verify API
// Leverages existing profile ID: 49000199-7882-f4ce-6514-a67c8190f107
// Integrates with existing Smart2FAService for backward compatibility

import { smart2FAService } from './smart2faService';

export interface Enterprise2FAConfig {
  verifyProfileId: string;
  apiKey: string;
  apiUrl: string;
  webhookUrl: string;
  fallbackEnabled: boolean;
  auditLogging: boolean;
  rateLimiting: boolean;
  fraudDetection: boolean;
}

export interface VerificationRequest {
  phoneNumber: string;
  method: 'sms' | 'voice' | 'flashcall' | 'whatsapp';
  customCode?: string;
  timeoutSecs?: number;
  userAgent?: string;
  ipAddress?: string;
  sessionId?: string;
}

export interface VerificationResponse {
  verificationId: string;
  phoneNumber: string;
  method: string;
  status: 'pending' | 'verified' | 'failed' | 'expired';
  timeoutSecs: number;
  createdAt: string;
  expiresAt: string;
  attempts: number;
  maxAttempts: number;
}

export interface VerificationResult {
  success: boolean;
  verified: boolean;
  responseCode: 'accepted' | 'rejected' | 'expired' | 'max_attempts';
  phoneNumber: string;
  verificationId: string;
  timestamp: string;
  fraudScore?: number;
  riskLevel?: 'low' | 'medium' | 'high';
}

export interface AuditLog {
  id: string;
  phoneNumber: string;
  method: string;
  action: 'initiate' | 'verify' | 'resend' | 'cancel';
  status: 'success' | 'failed' | 'blocked';
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  verificationId?: string;
  fraudScore?: number;
  riskLevel?: string;
  metadata?: Record<string, any>;
}

class Enterprise2FAService {
  private config: Enterprise2FAConfig;
  private auditLogs: Map<string, AuditLog> = new Map();
  private rateLimiter: Map<string, { count: number; resetTime: number }> = new Map();
  private fraudDetector: Map<string, { attempts: number; lastAttempt: number; blocked: boolean }> = new Map();

  constructor(config: Enterprise2FAConfig) {
    this.config = config;
  }

  /**
   * Initiate enterprise-grade 2FA verification
   */
  async initiateVerification(request: VerificationRequest): Promise<VerificationResponse> {
    const startTime = Date.now();
    const verificationId = `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`🔐 [${verificationId}] Starting enterprise 2FA verification`);
    console.log(`📋 [${verificationId}] Request details:`, {
      phoneNumber: request.phoneNumber ? `${request.phoneNumber.substring(0, 3)}***${request.phoneNumber.substring(request.phoneNumber.length - 3)}` : 'NOT_PROVIDED',
      method: request.method,
      userAgent: request.userAgent ? request.userAgent.substring(0, 50) + '...' : 'NOT_PROVIDED',
      ipAddress: request.ipAddress ? request.ipAddress.substring(0, 10) + '...' : 'NOT_PROVIDED',
      sessionId: request.sessionId ? request.sessionId.substring(0, 10) + '...' : 'NOT_PROVIDED'
    });
    
    try {
      // 1. Fraud Detection & Risk Assessment
      console.log(`🛡️ [${verificationId}] Starting fraud risk assessment`);
      const fraudScore = await this.assessFraudRisk(request);
      console.log(`🛡️ [${verificationId}] Fraud risk score: ${fraudScore}`);
      
      if (fraudScore > 0.8) {
        console.log(`🚫 [${verificationId}] High fraud risk detected, blocking verification`);
        await this.logAuditEvent({
          id: this.generateId(),
          phoneNumber: request.phoneNumber,
          method: request.method,
          action: 'initiate',
          status: 'blocked',
          ipAddress: request.ipAddress || 'unknown',
          userAgent: request.userAgent || 'unknown',
          timestamp: new Date().toISOString(),
          fraudScore,
          riskLevel: 'high',
          metadata: { reason: 'High fraud score detected' }
        });
        
        throw new Error('Verification blocked due to high fraud risk');
      }

      // 2. Rate Limiting Check
      console.log(`⏱️ [${verificationId}] Checking rate limits`);
      if (this.config.rateLimiting && !this.checkRateLimit(request.phoneNumber)) {
        console.log(`🚫 [${verificationId}] Rate limit exceeded for phone number`);
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      console.log(`✅ [${verificationId}] Rate limit check passed`);

      // 3. Use Telnyx Verify API
      console.log(`📡 [${verificationId}] Calling Telnyx Verify API`);
      const verification = await this.sendTelnyxVerification(request);
      console.log(`✅ [${verificationId}] Telnyx verification response:`, {
        id: verification.id,
        phone_number: verification.phone_number,
        type: verification.type,
        status: verification.status,
        created_at: verification.created_at,
        timeout_secs: verification.timeout_secs
      });
      
      // 4. Log successful initiation
      console.log(`📝 [${verificationId}] Logging successful initiation`);
      await this.logAuditEvent({
        id: this.generateId(),
        phoneNumber: request.phoneNumber,
        method: request.method,
        action: 'initiate',
        status: 'success',
        ipAddress: request.ipAddress || 'unknown',
        userAgent: request.userAgent || 'unknown',
        timestamp: new Date().toISOString(),
        verificationId: verification.id,
        fraudScore,
        riskLevel: fraudScore > 0.5 ? 'medium' : 'low'
      });

      const response = {
        verificationId: verification.id,
        phoneNumber: verification.phone_number.startsWith('+') ? verification.phone_number.slice(1) : verification.phone_number, // Remove + for storage
        method: verification.type,
        status: 'pending',
        timeoutSecs: verification.timeout_secs,
        createdAt: verification.created_at,
        expiresAt: new Date(new Date(verification.created_at).getTime() + verification.timeout_secs * 1000).toISOString(),
        attempts: verification.failed_attempts,
        maxAttempts: 3
      };

      const responseTime = Date.now() - startTime;
      console.log(`✅ [${verificationId}] Verification initiated successfully in ${responseTime}ms:`, {
        verificationId: response.verificationId,
        phoneNumber: response.phoneNumber,
        method: response.method,
        status: response.status
      });

      return response;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error(`❌ [${verificationId}] Enterprise 2FA verification failed after ${responseTime}ms:`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        type: error instanceof Error ? error.constructor.name : typeof error,
        verificationId,
        responseTime
      });

      // Log failed initiation
      await this.logAuditEvent({
        id: this.generateId(),
        phoneNumber: request.phoneNumber,
        method: request.method,
        action: 'initiate',
        status: 'failed',
        ipAddress: request.ipAddress || 'unknown',
        userAgent: request.userAgent || 'unknown',
        timestamp: new Date().toISOString(),
        metadata: { 
          error: error instanceof Error ? error.message : 'Unknown error',
          verificationId,
          responseTime
        }
      });

      // Always fallback to Smart2FA if Telnyx fails or is not configured
      console.log(`🔄 [${verificationId}] Falling back to Smart2FA service due to error:`, error instanceof Error ? error.message : 'Unknown error');
      return await this.fallbackToSmart2FA(request);
    }
  }

  /**
   * Verify OTP code using Telnyx Verify API
   */
  async verifyCode(verificationId: string, code: string, phoneNumber: string): Promise<VerificationResult> {
    // Handle mock verifications
    if (verificationId.startsWith('mock_')) {
      return this.verifyMockCode(verificationId, code, phoneNumber);
    }

    // Check if API key is configured
    if (!this.config.apiKey || this.config.apiKey.trim() === '') {
      console.warn('TELNYX_API_KEY not configured, using mock verification');
      return this.verifyMockCode(verificationId, code, phoneNumber);
    }

    try {
      const response = await fetch(`https://api.telnyx.com/v2/verifications/${verificationId}/actions/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          code: code
        })
      });

      const result = await response.json();
      
      console.log('Telnyx verification response:', {
        status: response.status,
        ok: response.ok,
        result: result
      });
      
      const verificationResult: VerificationResult = {
        success: response.ok,
        verified: result.data?.response_code === 'accepted',
        responseCode: result.data?.response_code || 'rejected',
        phoneNumber: result.data?.phone_number || phoneNumber,
        verificationId,
        timestamp: new Date().toISOString()
      };

      // Log verification attempt
      await this.logAuditEvent({
        id: this.generateId(),
        phoneNumber,
        method: 'verify',
        action: 'verify',
        status: verificationResult.verified ? 'success' : 'failed',
        ipAddress: 'unknown',
        userAgent: 'unknown',
        timestamp: new Date().toISOString(),
        verificationId,
        metadata: { 
          responseCode: verificationResult.responseCode,
          success: verificationResult.success
        }
      });

      return verificationResult;

    } catch (error) {
      console.error('Telnyx verification error:', error);
      
      await this.logAuditEvent({
        id: this.generateId(),
        phoneNumber,
        method: 'verify',
        action: 'verify',
        status: 'failed',
        ipAddress: 'unknown',
        userAgent: 'unknown',
        timestamp: new Date().toISOString(),
        verificationId,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });

      // Return a failed verification result instead of throwing
      return {
        success: false,
        verified: false,
        responseCode: 'rejected',
        phoneNumber,
        verificationId,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Verify mock verification codes for development
   */
  private verifyMockCode(verificationId: string, code: string, phoneNumber: string): VerificationResult {
    // For development, accept 123456 or any 6-digit code
    const isValidCode = code === '123456' || /^\d{6}$/.test(code);
    
    // Ensure phone number has proper formatting (single +)
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
    
    console.log(`[MOCK] Verifying code ${code} for ${formattedPhone}: ${isValidCode ? 'ACCEPTED' : 'REJECTED'}`);
    console.log(`[MOCK] Expected: 123456 or any 6-digit code`);
    
    return {
      success: true,
      verified: isValidCode,
      responseCode: isValidCode ? 'accepted' : 'rejected',
      phoneNumber: formattedPhone,
      verificationId,
      timestamp: new Date().toISOString(),
      fraudScore: 0.1,
      riskLevel: 'low'
    };
  }

  /**
   * Send verification using Telnyx Verify API
   */
  private async sendTelnyxVerification(request: VerificationRequest): Promise<any> {
    const telnyxId = `telnyx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`📡 [${telnyxId}] Starting Telnyx verification request`);
    
    // Check if API key is configured
    if (!this.config.apiKey || this.config.apiKey.trim() === '') {
      console.warn(`⚠️ [${telnyxId}] TELNYX_API_KEY not configured, using mock verification for development`);
      return this.generateMockVerification(request);
    }

    console.log(`🔑 [${telnyxId}] Telnyx configuration:`, {
      apiKey: this.config.apiKey ? `${this.config.apiKey.substring(0, 10)}...` : 'NOT_SET',
      verifyProfileId: this.config.verifyProfileId,
      method: request.method,
      phoneNumber: request.phoneNumber ? `${request.phoneNumber.substring(0, 3)}***${request.phoneNumber.substring(request.phoneNumber.length - 3)}` : 'NOT_PROVIDED'
    });

    let endpoint = 'https://api.telnyx.com/v2/verifications/sms';
    if (request.method === 'voice') {
      endpoint = 'https://api.telnyx.com/v2/verifications/call';
    } else if (request.method === 'whatsapp') {
      endpoint = 'https://api.telnyx.com/v2/verifications/whatsapp';
    } else if (request.method === 'flashcall' || request.method === 'flash') {
      // Telnyx flash call: phone rings once with last digits as code
      endpoint = 'https://api.telnyx.com/v2/verifications/flashcall';
    }

    console.log(`🎯 [${telnyxId}] Selected endpoint: ${endpoint}`);

    const payload: any = {
      phone_number: request.phoneNumber.startsWith('+') ? request.phoneNumber : `+${request.phoneNumber}`,
      verify_profile_id: this.config.verifyProfileId
    };

    if (request.customCode) {
      payload.custom_code = request.customCode;
    }

    if (request.timeoutSecs) {
      payload.timeout_secs = request.timeoutSecs;
    }

    console.log(`📤 [${telnyxId}] Telnyx request payload:`, {
      ...payload,
      phone_number: payload.phone_number ? `${payload.phone_number.substring(0, 3)}***${payload.phone_number.substring(payload.phone_number.length - 3)}` : 'NOT_PROVIDED'
    });

    console.log(`🚀 [${telnyxId}] Sending request to Telnyx API...`);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify(payload)
    });

    console.log(`📊 [${telnyxId}] Telnyx response status: ${response.status}`);
    console.log(`📋 [${telnyxId}] Telnyx response headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const error = await response.json();
      console.error(`❌ [${telnyxId}] Telnyx initiation error:`, {
        status: response.status,
        statusText: response.statusText,
        error: error
      });
      throw new Error(`Telnyx API error: ${error.message || response.statusText}`);
    }

    const result = await response.json();
    console.log(`✅ [${telnyxId}] Telnyx initiation successful:`, {
      id: result.data?.id,
      phone_number: result.data?.phone_number,
      type: result.data?.type,
      status: result.data?.status
    });
    return result;
  }

  /**
   * Generate mock verification for development
   */
  private generateMockVerification(request: VerificationRequest): any {
    const verificationId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const formattedPhone = request.phoneNumber.startsWith('+') ? request.phoneNumber : `+${request.phoneNumber}`;
    console.log(`[MOCK] Generated verification for ${formattedPhone} via ${request.method}: ${verificationId}`);
    console.log(`[MOCK] In development mode - OTP code is: 123456`);
    console.log(`[MOCK] This verification will expire in ${request.timeoutSecs || 300} seconds`);
    
    return {
      id: verificationId,
      phone_number: formattedPhone, // Use consistently formatted phone number
      type: request.method,
      status: 'pending',
      created_at: new Date().toISOString(),
      timeout_secs: request.timeoutSecs || 300,
      failed_attempts: 0
    };
  }

  /**
   * Fallback to existing Smart2FA service
   */
  private async fallbackToSmart2FA(request: VerificationRequest): Promise<VerificationResponse> {
    const result = await smart2FAService.initiateSmart2FA(
      request.phoneNumber, 
      request.userAgent
    );

    return {
      verificationId: result.verificationId || this.generateId(),
      phoneNumber: request.phoneNumber,
      method: result.method || request.method,
      status: 'pending',
      timeoutSecs: 300,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 300000).toISOString(),
      attempts: 0,
      maxAttempts: 3
    };
  }

  /**
   * Assess fraud risk based on multiple factors
   */
  private async assessFraudRisk(request: VerificationRequest): Promise<number> {
    let riskScore = 0;

    // Check for suspicious patterns
    const fraudData = this.fraudDetector.get(request.phoneNumber) || { attempts: 0, lastAttempt: 0, blocked: false };
    
    if (fraudData.blocked) {
      return 1.0; // Maximum risk
    }

    // Recent attempts
    if (fraudData.attempts > 5) {
      riskScore += 0.3;
    }

    // Time-based analysis
    const timeSinceLastAttempt = Date.now() - fraudData.lastAttempt;
    if (timeSinceLastAttempt < 60000) { // Less than 1 minute
      riskScore += 0.2;
    }

    // IP-based analysis (simplified)
    if (request.ipAddress) {
      // In a real implementation, you'd check against known bad IPs
      // For now, we'll use a simple heuristic
      const ipRisk = this.analyzeIPRisk(request.ipAddress);
      riskScore += ipRisk;
    }

    // User agent analysis
    if (request.userAgent) {
      const uaRisk = this.analyzeUserAgentRisk(request.userAgent);
      riskScore += uaRisk;
    }

    return Math.min(riskScore, 1.0);
  }

  /**
   * Check rate limiting for phone number
   */
  private checkRateLimit(phoneNumber: string): boolean {
    const now = Date.now();
    const limit = this.rateLimiter.get(phoneNumber);

    if (!limit || now > limit.resetTime) {
      this.rateLimiter.set(phoneNumber, { count: 1, resetTime: now + 300000 }); // 5 minutes
      return true;
    }

    if (limit.count >= 5) { // Max 5 attempts per 5 minutes
      return false;
    }

    limit.count++;
    return true;
  }

  /**
   * Log audit events
   */
  private async logAuditEvent(log: AuditLog): Promise<void> {
    if (this.config.auditLogging) {
      this.auditLogs.set(log.id, log);
      
      // In production, you'd send this to your logging service
      console.log('Audit Log:', JSON.stringify(log, null, 2));
    }
  }

  /**
   * Get verification status
   */
  async getVerificationStatus(verificationId: string): Promise<VerificationResponse | null> {
    // In a real implementation, you'd query Telnyx API for status
    // For now, we'll return a mock response
    return {
      verificationId,
      phoneNumber: '+1234567890',
      method: 'sms',
      status: 'pending',
      timeoutSecs: 300,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 300000).toISOString(),
      attempts: 0,
      maxAttempts: 3
    };
  }

  /**
   * Get audit logs for a phone number
   */
  getAuditLogs(phoneNumber: string): AuditLog[] {
    return Array.from(this.auditLogs.values())
      .filter(log => log.phoneNumber === phoneNumber)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Block phone number due to fraud
   */
  blockPhoneNumber(phoneNumber: string, reason: string): void {
    this.fraudDetector.set(phoneNumber, {
      attempts: 0,
      lastAttempt: Date.now(),
      blocked: true
    });

    console.log(`Phone number ${phoneNumber} blocked due to: ${reason}`);
  }

  // Helper methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private analyzeIPRisk(ipAddress: string): number {
    // Simplified IP risk analysis
    // In production, integrate with threat intelligence services
    return 0.1; // Placeholder
  }

  private analyzeUserAgentRisk(userAgent: string): number {
    // Simplified UA risk analysis
    const suspiciousPatterns = ['bot', 'crawler', 'scraper', 'automated'];
    const lowerUA = userAgent.toLowerCase();
    
    for (const pattern of suspiciousPatterns) {
      if (lowerUA.includes(pattern)) {
        return 0.3;
      }
    }
    
    return 0.0;
  }
}

// Export configured instance
export const enterprise2FAService = new Enterprise2FAService({
  verifyProfileId: process.env.TELNYX_PROFILE_ID || '2775849996304516927',
  apiKey: process.env.TELNYX_API_KEY || '',
  apiUrl: 'https://api.telnyx.com/v2',
  webhookUrl: (process.env.WEBHOOK_BASE_URL || 'http://localhost:3000') + '/webhooks/telnyx/verify',
  fallbackEnabled: true,
  auditLogging: true,
  rateLimiting: true,
  fraudDetection: true
});

export default enterprise2FAService;
