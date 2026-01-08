/**
 * Functional Tests for Compliant Call Flow
 * Tests the complete end-to-end compliant call flow orchestration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { compliantIVRService, type CompliantCallContext } from '../../src/services/compliance/compliantIVRService';
import { auditEvidenceService } from '../../src/services/compliance';
import { policyEngineService } from '../../src/services/compliance';
import { consentManagementService } from '../../src/services/compliance';
import { ivrService } from '../../src/services/ivr/ivrService';
import type { PolicyAction } from '../../src/services/compliance/policyEngineService';

// Mock all dependencies
vi.mock('../../src/services/compliance/auditEvidenceService');
vi.mock('../../src/services/compliance/policyEngineService');
vi.mock('../../src/services/compliance/consentManagementService');
vi.mock('../../src/services/ivr/ivrService');

describe('Compliant Call Flow - End-to-End', () => {
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

    // Setup default mocks
    vi.mocked(auditEvidenceService.logEvent).mockResolvedValue({
      logId: 'log_123',
      timestamp: new Date(),
      eventHash: 'hash_123',
      previousHash: '',
      tenantId: 'tenant_123',
      callId: 'call_123',
      eventType: 'call.initiated',
      eventData: {}
    });

    vi.mocked(policyEngineService.getScript).mockReturnValue({
      scriptId: 'script_123',
      policyId: 'policy_123',
      tenantId: 'tenant_123',
      language: 'en-US',
      scriptText: 'This call will be recorded for compliance purposes. Press 1 to consent, or press 2 to decline.',
      version: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    vi.mocked(ivrService.getSession).mockReturnValue({
      sessionId: 'call_123',
      callControlId: 'cc_123',
      from: '+15551234567',
      to: '+18005551234',
      industry: 'healthcare',
      currentStep: 'main_menu',
      metadata: { language: 'en-US' }
    });

    vi.mocked(ivrService.getCurrentStepTeXML).mockReturnValue(
      '<?xml version="1.0"?><Response><Say>Main menu</Say></Response>'
    );
  });

  describe('Complete Call Flow: Initiation → Authentication → Consent → Core Task', () => {
    it('should execute full compliant call flow with all steps', async () => {
      // Step 1: Call Initiated
      const initPolicyAction: PolicyAction = {
        action: 'authenticate',
        nextStep: 'identity_verification'
      };

      vi.mocked(policyEngineService.evaluatePolicy).mockResolvedValueOnce(initPolicyAction);

      const initResponse = await compliantIVRService.handleCompliantInboundCall(baseContext);

      // Verify call initiation was logged
      expect(auditEvidenceService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'call.initiated',
          tenantId: 'tenant_123',
          callId: 'call_123'
        })
      );

      // Verify authentication prompt
      expect(initResponse.texml).toContain('Gather');
      expect(initResponse.texml).toContain('account number');
      expect(initResponse.nextStep).toBe('identity_verification');

      // Step 2: Identity Verification (simulated)
      const authenticatedContext = {
        ...baseContext,
        authenticated: true,
        customerId: 'customer_123',
        previousSteps: ['initiated', 'identity_verification']
      };

      const consentPolicyAction: PolicyAction = {
        action: 'play_disclosure',
        scriptId: 'script_123',
        nextStep: 'consent_capture',
        requiresConsent: true,
        requiresRecording: true
      };

      vi.mocked(policyEngineService.evaluatePolicy).mockResolvedValueOnce(consentPolicyAction);

      // Simulate identity verification success logged
      await auditEvidenceService.logEvent({
        tenantId: 'tenant_123',
        callId: 'call_123',
        eventType: 'identity.verification_completed',
        eventData: { customerId: 'customer_123', verified: true }
      });

      // Step 3: Consent Capture
      const disclosureResponse = await compliantIVRService.handleCompliantInboundCall(authenticatedContext);

      // Verify disclosure was played
      expect(disclosureResponse.texml).toContain('This call will be recorded');
      expect(disclosureResponse.texml).toContain('Record');
      expect(disclosureResponse.texml).toContain('/api/ivr/call_123/consent');
      expect(disclosureResponse.requiresRecording).toBe(true);

      // Verify disclosure was logged
      expect(auditEvidenceService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'disclosure.script_played',
          eventData: expect.objectContaining({
            scriptId: 'script_123'
          })
        })
      );

      // Step 4: User grants consent (simulated via consent capture)
      const consentGrantedContext = {
        ...authenticatedContext,
        consentGranted: true
      };

      const consentAction: PolicyAction = {
        action: 'capture_consent',
        nextStep: 'main_menu',
        requiresRecording: true,
        metadata: {
          granted: true,
          consentType: 'call_recording'
        }
      };

      // Simulate consent capture
      vi.mocked(consentManagementService.recordConsent).mockResolvedValueOnce({
        consentId: 'consent_123',
        customerId: 'customer_123',
        tenantId: 'tenant_123',
        channel: 'voice',
        consentType: 'call_recording',
        granted: true,
        grantedAt: new Date(),
        revokedAt: null,
        createdAt: new Date()
      });

      const consentResponse = await compliantIVRService.handleConsentCapture(
        consentGrantedContext,
        consentAction
      );

      // Verify consent was recorded
      expect(consentManagementService.recordConsent).toHaveBeenCalledWith(
        expect.objectContaining({
          customerId: 'customer_123',
          tenantId: 'tenant_123',
          channel: 'voice',
          consentType: 'call_recording',
          granted: true
        })
      );

      // Verify consent was logged
      expect(auditEvidenceService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'consent.granted',
          eventData: expect.objectContaining({
            granted: true
          })
        })
      );

      // Step 5: Proceed to core task
      expect(consentResponse.nextStep).toBe('main_menu');
      expect(consentResponse.texml).toBeDefined();
    });
  });

  describe('Call Flow: Consent Denied → Escalation', () => {
    it('should escalate to agent when consent is denied', async () => {
      const authenticatedContext = {
        ...baseContext,
        authenticated: true,
        customerId: 'customer_123',
        previousSteps: ['initiated', 'identity_verification']
      };

      const consentDeniedAction: PolicyAction = {
        action: 'capture_consent',
        nextStep: 'transfer_agent',
        requiresRecording: false,
        metadata: {
          granted: false,
          consentType: 'call_recording'
        }
      };

      const response = await compliantIVRService.handleConsentCapture(
        authenticatedContext,
        consentDeniedAction
      );

      // Verify consent denial was logged
      expect(auditEvidenceService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'consent.denied'
        })
      );

      // Verify escalation
      expect(response.texml).toContain('Dial');
      expect(response.texml).toContain('representative');
      expect(response.nextStep).toBe('transfer_agent');
    });
  });

  describe('Call Flow: Max Retries → Escalation', () => {
    it('should escalate after max authentication retries', async () => {
      const maxRetriesContext = {
        ...baseContext,
        previousSteps: ['initiated', 'identity_verification', 'identity_verification', 'identity_verification']
      };

      const escalationAction: PolicyAction = {
        action: 'escalate',
        nextStep: 'transfer_agent',
        escalationReason: 'max_retries_exceeded',
        metadata: {
          priority: 'high'
        }
      };

      vi.mocked(policyEngineService.evaluatePolicy).mockResolvedValue(escalationAction);

      const response = await compliantIVRService.handleCompliantInboundCall(maxRetriesContext);

      // Verify escalation was logged
      expect(auditEvidenceService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'escalation.triggered',
          eventData: expect.objectContaining({
            reason: 'max_retries_exceeded',
            priority: 'high'
          })
        })
      );

      // Verify escalation TeXML
      expect(response.texml).toContain('Dial');
      expect(response.nextStep).toBe('transfer_agent');
    });
  });

  describe('Call Flow: Data Redaction During Core Task', () => {
    it('should redact sensitive data from call transcript', async () => {
      const transcript = `
        Caller: My social security number is 123-45-6789.
        Agent: Thank you. Your credit card ending in 4111 will be charged.
        Caller: My email is john.doe@example.com.
      `;

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
          callId: 'call_123',
          eventData: expect.objectContaining({
            itemsRedacted: expect.any(Number)
          })
        })
      );

      expect(redacted).toBeDefined();
    });
  });

  describe('Call Flow: Audit Trail Integrity', () => {
    it('should maintain complete audit trail throughout call flow', async () => {
      const events: string[] = [];

      // Track all events logged
      vi.mocked(auditEvidenceService.logEvent).mockImplementation(async (event) => {
        events.push(event.eventType);
        return {
          logId: `log_${events.length}`,
          timestamp: new Date(),
          eventHash: `hash_${events.length}`,
          previousHash: events.length > 1 ? `hash_${events.length - 1}` : '',
          tenantId: event.tenantId,
          callId: event.callId,
          eventType: event.eventType,
          eventData: event.eventData
        };
      });

      // Execute call flow
      const initAction: PolicyAction = {
        action: 'authenticate',
        nextStep: 'identity_verification'
      };

      vi.mocked(policyEngineService.evaluatePolicy).mockResolvedValue(initAction);

      await compliantIVRService.handleCompliantInboundCall(baseContext);

      // Verify audit trail sequence
      expect(events).toContain('call.initiated');
      expect(events).toContain('identity.verification_started');

      // Verify events are in correct order
      const initIndex = events.indexOf('call.initiated');
      const verifyIndex = events.indexOf('identity.verification_started');
      expect(verifyIndex).toBeGreaterThan(initIndex);
    });
  });

  describe('Call Flow: Healthcare HIPAA Compliance', () => {
    it('should enforce HIPAA compliance for healthcare calls', async () => {
      const healthcareContext = {
        ...baseContext,
        industry: 'healthcare',
        authenticated: true,
        customerId: 'patient_123'
      };

      const hipaaPolicyAction: PolicyAction = {
        action: 'play_disclosure',
        scriptId: 'hipaa_script_123',
        nextStep: 'consent_capture',
        requiresConsent: true,
        requiresRecording: true,
        metadata: {
          complianceType: 'HIPAA',
          requiresPHIProtection: true
        }
      };

      vi.mocked(policyEngineService.evaluatePolicy).mockResolvedValue(hipaaPolicyAction);

      vi.mocked(policyEngineService.getScript).mockReturnValue({
        scriptId: 'hipaa_script_123',
        policyId: 'hipaa_policy_123',
        tenantId: 'tenant_123',
        language: 'en-US',
        scriptText: 'This call contains protected health information. Your consent is required. Press 1 to consent.',
        version: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const response = await compliantIVRService.handleCompliantInboundCall(healthcareContext);

      // Verify HIPAA-specific disclosure
      expect(response.texml).toContain('protected health information');
      expect(response.texml).toContain('Record');
      expect(response.requiresRecording).toBe(true);

      // Verify HIPAA compliance logging
      expect(auditEvidenceService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'disclosure.script_played',
          eventData: expect.objectContaining({
            scriptId: 'hipaa_script_123'
          })
        })
      );
    });
  });

  describe('Call Flow: Error Handling', () => {
    it('should handle policy engine errors gracefully', async () => {
      vi.mocked(policyEngineService.evaluatePolicy).mockRejectedValue(
        new Error('Policy evaluation failed')
      );

      await expect(
        compliantIVRService.handleCompliantInboundCall(baseContext)
      ).rejects.toThrow('Policy evaluation failed');

      // Verify error was logged
      expect(auditEvidenceService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'call.initiated'
        })
      );
    });

    it('should handle missing disclosure script gracefully', async () => {
      const disclosureAction: PolicyAction = {
        action: 'play_disclosure',
        scriptId: 'missing_script',
        nextStep: 'consent_capture'
      };

      vi.mocked(policyEngineService.evaluatePolicy).mockResolvedValue(disclosureAction);
      vi.mocked(policyEngineService.getScript).mockReturnValue(null as any);

      await expect(
        compliantIVRService.handleCompliantInboundCall(baseContext)
      ).rejects.toThrow('Disclosure script not found');
    });
  });
});
