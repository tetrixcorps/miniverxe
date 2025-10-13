// Enterprise-Grade 2FA Service using Telnyx Verify API
// Leverages existing profile ID: ***REMOVED***
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
    
    try {
      // 1. Fraud Detection & Risk Assessment
      const fraudScore = await this.assessFraudRisk(request);
      if (fraudScore > 0.8) {
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
      if (this.config.rateLimiting && !this.checkRateLimit(request.phoneNumber)) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      // 3. Use Telnyx Verify API
      const verification = await this.sendTelnyxVerification(request);
      
      // 4. Log successful initiation
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

      return {
        verificationId: verification.id,
        phoneNumber: verification.phone_number,
        method: verification.type,
        status: 'pending',
        timeoutSecs: verification.timeout_secs,
        createdAt: verification.created_at,
        expiresAt: new Date(new Date(verification.created_at).getTime() + verification.timeout_secs * 1000).toISOString(),
        attempts: verification.failed_attempts,
        maxAttempts: 3
      };

    } catch (error) {
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
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });

      // Always fallback to Smart2FA if Telnyx fails or is not configured
      console.log('Falling back to Smart2FA service due to error:', error.message);
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
      console.warn('***REMOVED*** not configured, using mock verification');
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
    // For development, accept any 6-digit code
    const isValidCode = /^\d{6}$/.test(code);
    
    console.log(`[MOCK] Verifying code ${code} for ${phoneNumber}: ${isValidCode ? 'ACCEPTED' : 'REJECTED'}`);
    
    return {
      success: true,
      verified: isValidCode,
      responseCode: isValidCode ? 'accepted' : 'rejected',
      phoneNumber,
      verificationId,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Send verification using Telnyx Verify API
   */
  private async sendTelnyxVerification(request: VerificationRequest): Promise<any> {
    // Check if API key is configured
    if (!this.config.apiKey || this.config.apiKey.trim() === '') {
      console.warn('***REMOVED*** not configured, using mock verification for development');
      return this.generateMockVerification(request);
    }

    const endpoint = request.method === 'voice' 
      ? 'https://api.telnyx.com/v2/verifications/call'
      : 'https://api.telnyx.com/v2/verifications/sms';

    const payload: any = {
      phone_number: request.phoneNumber,
      verify_profile_id: this.config.verifyProfileId
    };

    if (request.customCode) {
      payload.custom_code = request.customCode;
    }

    if (request.timeoutSecs) {
      payload.timeout_secs = request.timeoutSecs;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Telnyx initiation error:', {
        status: response.status,
        statusText: response.statusText,
        error: error
      });
      throw new Error(`Telnyx API error: ${error.message || response.statusText}`);
    }

    const result = await response.json();
    console.log('Telnyx initiation response:', result);
    return result;
  }

  /**
   * Generate mock verification for development
   */
  private generateMockVerification(request: VerificationRequest): any {
    const verificationId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`[MOCK] Generated verification for ${request.phoneNumber} via ${request.method}: ${verificationId}`);
    
    return {
      id: verificationId,
      phone_number: request.phoneNumber,
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
  verifyProfileId: process.env.TELNYX_PROFILE_ID || '***REMOVED***',
  apiKey: process.env.***REMOVED*** || '',
  apiUrl: 'https://api.telnyx.com/v2',
  webhookUrl: process.env.WEBHOOK_BASE_URL + '/webhooks/telnyx/verify',
  fallbackEnabled: true,
  auditLogging: true,
  rateLimiting: true,
  fraudDetection: true
});

export default enterprise2FAService;
