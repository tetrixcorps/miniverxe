// Consent Management Service
// Manages universal ledger of customer consent across all tenants

export interface ConsentRecord {
  consentId: string;
  customerId: string;
  tenantId: string;
  channel: ConsentChannel;
  consentType: ConsentType;
  granted: boolean;
  grantedAt?: Date;
  revokedAt?: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
  auditTrailId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ConsentChannel = 'voice' | 'sms' | 'email' | 'web' | 'mobile_app';
export type ConsentType = 
  | 'call_recording'
  | 'data_processing'
  | 'marketing_communications'
  | 'third_party_sharing'
  | 'payment_processing'
  | 'medical_treatment'
  | 'prescription_refill';

export interface ConsentRequest {
  customerId: string;
  tenantId: string;
  channel: ConsentChannel;
  consentType: ConsentType;
  granted: boolean;
  expiresAt?: Date;
  metadata?: Record<string, any>;
  auditTrailId?: string;
}

export interface ConsentStatus {
  customerId: string;
  tenantId: string;
  consents: ConsentRecord[];
  overallStatus: 'granted' | 'partial' | 'denied' | 'expired';
}

class ConsentManagementService {
  private consentRecords: Map<string, ConsentRecord> = new Map();
  private customerConsents: Map<string, ConsentRecord[]> = new Map();

  /**
   * Record a consent action
   */
  async recordConsent(request: ConsentRequest): Promise<ConsentRecord> {
    const consentId = this.generateConsentId();
    const now = new Date();

    // Check for existing consent
    const existing = this.findExistingConsent(
      request.customerId,
      request.tenantId,
      request.consentType,
      request.channel
    );

    let consentRecord: ConsentRecord;

    if (existing && request.granted) {
      // Update existing consent if granting
      consentRecord = {
        ...existing,
        granted: true,
        grantedAt: now,
        revokedAt: undefined,
        expiresAt: request.expiresAt,
        metadata: { ...existing.metadata, ...request.metadata },
        auditTrailId: request.auditTrailId,
        updatedAt: now
      };
    } else if (existing && !request.granted) {
      // Revoke existing consent
      consentRecord = {
        ...existing,
        granted: false,
        revokedAt: now,
        metadata: { ...existing.metadata, ...request.metadata },
        auditTrailId: request.auditTrailId,
        updatedAt: now
      };
    } else {
      // Create new consent record
      consentRecord = {
        consentId,
        customerId: request.customerId,
        tenantId: request.tenantId,
        channel: request.channel,
        consentType: request.consentType,
        granted: request.granted,
        grantedAt: request.granted ? now : undefined,
        revokedAt: request.granted ? undefined : now,
        expiresAt: request.expiresAt,
        metadata: request.metadata,
        auditTrailId: request.auditTrailId,
        createdAt: now,
        updatedAt: now
      };
    }

    // Store consent record
    this.consentRecords.set(consentId, consentRecord);

    // Update customer consent index
    const customerKey = `${request.tenantId}:${request.customerId}`;
    const customerConsents = this.customerConsents.get(customerKey) || [];
    const existingIndex = customerConsents.findIndex(c => c.consentId === consentRecord.consentId);
    
    if (existingIndex >= 0) {
      customerConsents[existingIndex] = consentRecord;
    } else {
      customerConsents.push(consentRecord);
    }
    
    this.customerConsents.set(customerKey, customerConsents);

    return consentRecord;
  }

  /**
   * Get consent status for a customer
   */
  async getConsentStatus(customerId: string, tenantId: string): Promise<ConsentStatus> {
    const customerKey = `${tenantId}:${customerId}`;
    const consents = this.customerConsents.get(customerKey) || [];

    // Filter out expired consents
    const activeConsents = consents.filter(c => {
      if (!c.granted) return false;
      if (c.revokedAt) return false;
      if (c.expiresAt && c.expiresAt < new Date()) return false;
      return true;
    });

    // Determine overall status
    let overallStatus: ConsentStatus['overallStatus'] = 'denied';
    if (activeConsents.length === 0) {
      overallStatus = 'denied';
    } else if (activeConsents.length === consents.length) {
      overallStatus = 'granted';
    } else {
      overallStatus = 'partial';
    }

    // Check for expired consents
    const hasExpired = consents.some(c => 
      c.expiresAt && c.expiresAt < new Date() && c.granted
    );
    if (hasExpired && activeConsents.length === 0) {
      overallStatus = 'expired';
    }

    return {
      customerId,
      tenantId,
      consents: activeConsents,
      overallStatus
    };
  }

  /**
   * Check if consent is granted for a specific type
   */
  async hasConsent(
    customerId: string,
    tenantId: string,
    consentType: ConsentType,
    channel?: ConsentChannel
  ): Promise<boolean> {
    const status = await this.getConsentStatus(customerId, tenantId);
    
    const relevantConsents = status.consents.filter(c => {
      if (c.consentType !== consentType) return false;
      if (channel && c.channel !== channel) return false;
      return true;
    });

    return relevantConsents.length > 0 && relevantConsents.some(c => c.granted);
  }

  /**
   * Revoke consent
   */
  async revokeConsent(
    customerId: string,
    tenantId: string,
    consentType: ConsentType,
    channel?: ConsentChannel,
    auditTrailId?: string
  ): Promise<ConsentRecord> {
    const existing = this.findExistingConsent(customerId, tenantId, consentType, channel);
    
    if (!existing) {
      throw new Error('Consent record not found');
    }

    return this.recordConsent({
      customerId,
      tenantId,
      channel: existing.channel,
      consentType,
      granted: false,
      auditTrailId
    });
  }

  /**
   * Find existing consent record
   */
  private findExistingConsent(
    customerId: string,
    tenantId: string,
    consentType: ConsentType,
    channel?: ConsentChannel
  ): ConsentRecord | undefined {
    const customerKey = `${tenantId}:${customerId}`;
    const consents = this.customerConsents.get(customerKey) || [];

    return consents.find(c => {
      if (c.consentType !== consentType) return false;
      if (channel && c.channel !== channel) return false;
      return true;
    });
  }

  /**
   * Get all consents for a tenant
   */
  getConsentsForTenant(tenantId: string): ConsentRecord[] {
    const allConsents: ConsentRecord[] = [];
    
    for (const consent of this.consentRecords.values()) {
      if (consent.tenantId === tenantId) {
        allConsents.push(consent);
      }
    }

    return allConsents.sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  /**
   * Get consent history for a customer
   */
  getConsentHistory(customerId: string, tenantId: string): ConsentRecord[] {
    const customerKey = `${tenantId}:${customerId}`;
    return this.customerConsents.get(customerKey) || [];
  }

  /**
   * Generate unique consent ID
   */
  private generateConsentId(): string {
    return `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Export consent records for compliance reporting
   */
  exportConsents(tenantId: string, format: 'json' | 'csv' = 'json'): string {
    const consents = this.getConsentsForTenant(tenantId);

    if (format === 'json') {
      return JSON.stringify(consents, null, 2);
    }

    // CSV format
    const csvLines = [
      'Consent ID,Customer ID,Tenant ID,Channel,Consent Type,Granted,Granted At,Revoked At,Expires At,Created At'
    ];

    for (const consent of consents) {
      csvLines.push([
        consent.consentId,
        consent.customerId,
        consent.tenantId,
        consent.channel,
        consent.consentType,
        consent.granted.toString(),
        consent.grantedAt?.toISOString() || '',
        consent.revokedAt?.toISOString() || '',
        consent.expiresAt?.toISOString() || '',
        consent.createdAt.toISOString()
      ].join(','));
    }

    return csvLines.join('\n');
  }

  /**
   * Clean up expired consents (should be run periodically)
   */
  async cleanupExpiredConsents(): Promise<number> {
    const now = new Date();
    let cleaned = 0;

    for (const [consentId, consent] of this.consentRecords.entries()) {
      if (consent.expiresAt && consent.expiresAt < now && consent.granted) {
        // Auto-revoke expired consents
        await this.revokeConsent(
          consent.customerId,
          consent.tenantId,
          consent.consentType,
          consent.channel,
          `auto_revoked_expired_${now.toISOString()}`
        );
        cleaned++;
      }
    }

    return cleaned;
  }
}

export const consentManagementService = new ConsentManagementService();
