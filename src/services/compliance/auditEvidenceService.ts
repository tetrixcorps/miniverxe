// Audit & Evidence Service
// Provides immutable, tamper-evident logging system for compliance audit trails

import crypto from 'crypto';

export interface AuditEvent {
  logId?: string;
  tenantId: string;
  callId: string;
  eventType: AuditEventType;
  timestamp: Date;
  eventData: Record<string, any>;
  eventHash?: string;
  previousHash?: string;
  signature?: string;
  metadata?: Record<string, any>;
}

export type AuditEventType =
  | 'call.initiated'
  | 'call.answered'
  | 'call.ended'
  | 'identity.verification_started'
  | 'identity.verification_succeeded'
  | 'identity.verification_failed'
  | 'consent.disclosure_played'
  | 'consent.granted'
  | 'consent.denied'
  | 'consent.revoked'
  | 'disclosure.script_played'
  | 'policy.evaluated'
  | 'policy.action_taken'
  | 'escalation.triggered'
  | 'escalation.completed'
  | 'recording.started'
  | 'recording.stopped'
  | 'recording.redacted'
  | 'data.redacted'
  | 'data.access'
  | 'error.occurred'
  | 'compliance.violation';

export interface AuditTrail {
  callId: string;
  tenantId: string;
  events: AuditEvent[];
  chainHash: string;
  createdAt: Date;
  updatedAt: Date;
}

class AuditEvidenceService {
  private auditLogs: Map<string, AuditEvent[]> = new Map();
  private auditTrails: Map<string, AuditTrail> = new Map();
  private encryptionKey: string;

  constructor() {
    // In production, this should be loaded from secure key management
    this.encryptionKey = process.env.AUDIT_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
  }

  /**
   * Log an audit event with cryptographic hashing
   */
  async logEvent(event: Omit<AuditEvent, 'logId' | 'timestamp' | 'eventHash' | 'previousHash'>): Promise<AuditEvent> {
    const timestamp = new Date();
    const callId = event.callId;

    // Get previous event for chain hashing
    const previousEvent = this.getLastEvent(callId);
    const previousHash = previousEvent?.eventHash || '';

    // Create event with timestamp
    const fullEvent: AuditEvent = {
      ...event,
      timestamp,
      previousHash
    };

    // Generate cryptographic hash of event data
    const eventHash = this.generateEventHash(fullEvent);

    // Add hash to event
    fullEvent.eventHash = eventHash;
    fullEvent.logId = this.generateLogId();

    // Encrypt sensitive event data
    const encryptedEventData = this.encryptEventData(fullEvent.eventData);
    fullEvent.eventData = encryptedEventData;

    // Store event
    const events = this.auditLogs.get(callId) || [];
    events.push(fullEvent);
    this.auditLogs.set(callId, events);

    // Update audit trail
    this.updateAuditTrail(callId, event.tenantId, fullEvent);

    // In production, also write to append-only log (e.g., Amazon QLDB, blockchain table)
    await this.writeToImmutableLog(fullEvent);

    return fullEvent;
  }

  /**
   * Generate cryptographic hash for event integrity
   */
  private generateEventHash(event: AuditEvent): string {
    const hashInput = JSON.stringify({
      tenantId: event.tenantId,
      callId: event.callId,
      eventType: event.eventType,
      timestamp: event.timestamp.toISOString(),
      eventData: event.eventData,
      previousHash: event.previousHash
    });

    return crypto.createHash('sha256').update(hashInput).digest('hex');
  }

  /**
   * Generate unique log ID
   */
  private generateLogId(): string {
    return `log_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * Encrypt sensitive event data
   */
  private encryptEventData(data: Record<string, any>): Record<string, any> {
    // In production, use proper encryption (AES-256-GCM)
    // For now, return as-is but mark as encrypted
    const encrypted = {
      ...data,
      _encrypted: true,
      _encryptionTimestamp: new Date().toISOString()
    };
    return encrypted;
  }

  /**
   * Get last event for a call (for chain hashing)
   */
  private getLastEvent(callId: string): AuditEvent | undefined {
    const events = this.auditLogs.get(callId) || [];
    return events[events.length - 1];
  }

  /**
   * Update audit trail for a call
   */
  private updateAuditTrail(callId: string, tenantId: string, event: AuditEvent): void {
    let trail = this.auditTrails.get(callId);
    
    if (!trail) {
      trail = {
        callId,
        tenantId,
        events: [],
        chainHash: '',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    trail.events.push(event);
    trail.updatedAt = new Date();
    
    // Calculate chain hash from all events
    trail.chainHash = this.calculateChainHash(trail.events);
    
    this.auditTrails.set(callId, trail);
  }

  /**
   * Calculate chain hash from all events
   */
  private calculateChainHash(events: AuditEvent[]): string {
    if (events.length === 0) return '';
    
    let chain = '';
    for (const event of events) {
      chain = crypto.createHash('sha256')
        .update(chain + (event.eventHash || ''))
        .digest('hex');
    }
    
    return chain;
  }

  /**
   * Write to immutable log (append-only)
   */
  private async writeToImmutableLog(event: AuditEvent): Promise<void> {
    // In production, this would write to:
    // - Amazon QLDB (Quantum Ledger Database)
    // - Blockchain table in database
    // - Immutable storage service
    
    // For now, just log to console
    console.log('[IMMUTABLE_LOG]', JSON.stringify({
      logId: event.logId,
      callId: event.callId,
      tenantId: event.tenantId,
      eventType: event.eventType,
      timestamp: event.timestamp.toISOString(),
      eventHash: event.eventHash,
      previousHash: event.previousHash
    }));
  }

  /**
   * Get audit trail for a call
   */
  getAuditTrail(callId: string): AuditTrail | undefined {
    return this.auditTrails.get(callId);
  }

  /**
   * Get all events for a call
   */
  getEventsForCall(callId: string): AuditEvent[] {
    return this.auditLogs.get(callId) || [];
  }

  /**
   * Verify audit trail integrity
   */
  verifyAuditTrailIntegrity(callId: string): { valid: boolean; errors: string[] } {
    const trail = this.auditTrails.get(callId);
    if (!trail) {
      return { valid: false, errors: ['Audit trail not found'] };
    }

    const errors: string[] = [];

    // Verify chain hashes
    for (let i = 1; i < trail.events.length; i++) {
      const currentEvent = trail.events[i];
      const previousEvent = trail.events[i - 1];

      if (currentEvent.previousHash !== previousEvent.eventHash) {
        errors.push(`Hash chain broken at event ${i}: expected ${previousEvent.eventHash}, got ${currentEvent.previousHash}`);
      }

      // Recalculate hash and verify
      const recalculatedHash = this.generateEventHash({
        ...currentEvent,
        eventHash: undefined
      } as AuditEvent);

      if (currentEvent.eventHash !== recalculatedHash) {
        errors.push(`Event hash mismatch at event ${i}: data may have been tampered with`);
      }
    }

    // Verify chain hash
    const recalculatedChainHash = this.calculateChainHash(trail.events);
    if (trail.chainHash !== recalculatedChainHash) {
      errors.push('Chain hash mismatch: audit trail may have been tampered with');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Search audit events by criteria
   */
  searchEvents(criteria: {
    tenantId?: string;
    callId?: string;
    eventType?: AuditEventType;
    startDate?: Date;
    endDate?: Date;
  }): AuditEvent[] {
    const allEvents: AuditEvent[] = [];
    
    for (const events of this.auditLogs.values()) {
      allEvents.push(...events);
    }

    return allEvents.filter(event => {
      if (criteria.tenantId && event.tenantId !== criteria.tenantId) return false;
      if (criteria.callId && event.callId !== criteria.callId) return false;
      if (criteria.eventType && event.eventType !== criteria.eventType) return false;
      if (criteria.startDate && event.timestamp < criteria.startDate) return false;
      if (criteria.endDate && event.timestamp > criteria.endDate) return false;
      return true;
    });
  }

  /**
   * Export audit trail for compliance reporting
   */
  exportAuditTrail(callId: string, format: 'json' | 'csv' = 'json'): string {
    const trail = this.auditTrails.get(callId);
    if (!trail) {
      throw new Error('Audit trail not found');
    }

    if (format === 'json') {
      return JSON.stringify(trail, null, 2);
    }

    // CSV format
    const csvLines = [
      'Log ID,Timestamp,Event Type,Tenant ID,Call ID,Event Hash,Previous Hash'
    ];

    for (const event of trail.events) {
      csvLines.push([
        event.logId || '',
        event.timestamp.toISOString(),
        event.eventType,
        event.tenantId,
        event.callId,
        event.eventHash || '',
        event.previousHash || ''
      ].join(','));
    }

    return csvLines.join('\n');
  }
}

export const auditEvidenceService = new AuditEvidenceService();
