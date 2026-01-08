/**
 * Unit Tests for CompliantIVRService
 * Tests the orchestration of compliance-aware IVR call flows
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { compliantIVRService, type CompliantCallContext } from '../../src/services/compliance/compliantIVRService';
import { auditEvidenceService } from '../../src/services/compliance';
import { policyEngineService } from '../../src/services/compliance';
import { consentManagementService } from '../../src/services/compliance';
import { ivrService } from '../../src/services/ivr/ivrService';
import type { PolicyAction } from '../../src/services/compliance/policyEngineService';

// Mock dependencies
vi.mock('../../src/services/compliance/auditEvidenceService', () => ({
  auditEvidenceService: {
    logEvent: vi.fn().mockResolvedValue({
      logId: 'log_123',
      timestamp: new Date(),
      eventHash: 'hash_123',
      previousHash: '',
      tenantId: 'tenant_123',
      callId: 'call_123',
      eventType: 'call.initiated',
      eventData: {}
    }),
    searchEvents: vi.fn().mockReturnValue([])
  }
}));

vi.mock('../../src/services/compliance/policyEngineService', () => ({
  policyEngineService: {
    evaluatePolicy: vi.fn(),
    getScript: vi.fn().mockReturnValue({
      scriptId: 'script_123',
      policyId: 'policy_123',
      tenantId: 'tenant_123',
      language: 'en-US',
      scriptText: 'This call will be recorded. Press 1 to consent.',
      version: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }
}));

vi.mock('../../src/services/compliance/consentManagementService', () => ({
  consentManagementService: {
    recordConsent: vi.fn().mockResolvedValue({
      consentId: 'consent_123',
      customerId: 'customer_123',
      tenantId: 'tenant_123',
      channel: 'voice',
      consentType: 'call_recording',
      granted: true,
      grantedAt: new Date(),
      revokedAt: null,
      createdAt: new Date()
    })
  }
}));

vi.mock('../../src/services/ivr/ivrService', () => ({
  ivrService: {
    createSession: vi.fn().mockReturnValue({
      sessionId: 'session_123',
      callControlId: 'cc_123',
      from: '+15551234567',
      to: '+18005551234',
      industry: 'healthcare',
      currentStep: 'initiated',
      metadata: {}
    }),
    getSession: vi.fn().mockReturnValue({
      sessionId: 'session_123',
      callControlId: 'cc_123',
      from: '+15551234567',
      to: '+18005551234',
      industry: 'healthcare',
      currentStep: 'main_menu',
      metadata: {}
    }),
    getCurrentStepTeXML: vi.fn().mockReturnValue('<?xml version="1.0"?><Response><Say>Main menu</Say></Response>')
  }
}));

describe('CompliantIVRService', () => {
  const baseContext: CompliantCallContext = {
    callId: 'call_123',
    callControlId: 'cc_123',
    tenantId: 'tenant_123',
    from: '+15551234567',
    to: '+18005551234',
    industry: 'healthcare',
    region: 'USA',
    language: 'en-US',
    authenticated: false,
    consentGranted: false,
    previousSteps: []
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.WEBHOOK_BASE_URL = 'https://tetrixcorp.com';
  });

  describe('handleCompliantInboundCall', () => {
    it('should log call initiation and evaluate policy', async () => {
      const policyAction: PolicyAction = {
        action: 'authenticate',
        nextStep: 'identity_verification'
      };

      vi.mocked(policyEngineService.evaluatePolicy).mockResolvedValue(policyAction);

      const response = await compliantIVRService.handleCompliantInboundCall(baseContext);

      // Verify audit logging
      expect(auditEvidenceService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: 'tenant_123',
          callId: 'call_123',
          eventType: 'call.initiated',
          eventData: expect.objectContaining({
            from: '+15551234567',
            to: '+18005551234',
            industry: 'healthcare'
          })
        })
      );

      // Verify policy evaluation
      expect(policyEngineService.evaluatePolicy).toHaveBeenCalledWith(
        expect.objectContaining({
          callId: 'call_123',
          tenantId: 'tenant_123',
          currentStep: 'initiated'
        })
      );

      // Verify response contains TeXML
      expect(response.texml).toContain('<?xml');
      expect(response.nextStep).toBe('identity_verification');
    });

    it('should handle authentication action', async () => {
      const policyAction: PolicyAction = {
        action: 'authenticate',
        nextStep: 'identity_verification'
      };

      vi.mocked(policyEngineService.evaluatePolicy).mockResolvedValue(policyAction);

      const response = await compliantIVRService.handleCompliantInboundCall(baseContext);

      expect(response.texml).toContain('Gather');
      expect(response.texml).toContain('account number');
      expect(response.texml).toContain('/api/ivr/call_123/verify');
      expect(response.nextStep).toBe('identity_verification');
    });

    it('should handle disclosure playback with recording', async () => {
      const policyAction: PolicyAction = {
        action: 'play_disclosure',
        scriptId: 'script_123',
        nextStep: 'consent_capture',
        requiresConsent: true,
        requiresRecording: true
      };

      vi.mocked(policyEngineService.evaluatePolicy).mockResolvedValue(policyAction);

      const response = await compliantIVRService.handleCompliantInboundCall(baseContext);

      expect(response.texml).toContain('Record');
      expect(response.texml).toContain('This call will be recorded');
      expect(response.texml).toContain('/api/ivr/call_123/consent');
      expect(response.requiresRecording).toBe(true);
    });

    it('should handle escalation to agent', async () => {
      const policyAction: PolicyAction = {
        action: 'escalate',
        nextStep: 'transfer_agent',
        escalationReason: 'max_retries_exceeded'
      };

      vi.mocked(policyEngineService.evaluatePolicy).mockResolvedValue(policyAction);

      const response = await compliantIVRService.handleCompliantInboundCall(baseContext);

      expect(response.texml).toContain('Dial');
      expect(response.texml).toContain('representative');
      expect(response.nextStep).toBe('transfer_agent');

      // Verify escalation was logged
      expect(auditEvidenceService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'escalation.triggered'
        })
      );
    });
  });

  describe('redactCallTranscript', () => {
    it('should redact sensitive data from transcript', async () => {
      const transcript = 'My SSN is 123-45-6789 and my credit card is 4111-1111-1111-1111';
      
      const redacted = await compliantIVRService.redactCallTranscript(
        transcript,
        'tenant_123',
        'call_123',
        'healthcare'
      );

      // Verify redaction was logged
      expect(auditEvidenceService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'data.redacted',
          tenantId: 'tenant_123',
          callId: 'call_123'
        })
      );

      expect(redacted).toBeDefined();
    });
  });

  describe('TeXML Generation', () => {
    it('should escape XML special characters in disclosure scripts', async () => {
      const scriptWithSpecialChars = {
        scriptId: 'script_123',
        policyId: 'policy_123',
        tenantId: 'tenant_123',
        language: 'en-US',
        scriptText: 'This call will be recorded & monitored. Press 1 to consent <or> press 2 to decline.',
        version: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      vi.mocked(policyEngineService.getScript).mockReturnValue(scriptWithSpecialChars);

      const policyAction: PolicyAction = {
        action: 'play_disclosure',
        scriptId: 'script_123',
        nextStep: 'consent_capture'
      };

      vi.mocked(policyEngineService.evaluatePolicy).mockResolvedValue(policyAction);

      const response = await compliantIVRService.handleCompliantInboundCall(baseContext);

      // Verify XML is properly escaped
      expect(response.texml).toContain('&amp;'); // & escaped
      expect(response.texml).toContain('&lt;'); // < escaped
      expect(response.texml).toContain('&gt;'); // > escaped
    });
  });
});
