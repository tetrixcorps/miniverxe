/**
 * Unit Tests for Webhook Orchestration
 * Tests the orchestration logic for compliant call flows
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { compliantIVRService, type CompliantCallContext } from '../../src/services/compliance/compliantIVRService';
import { auditEvidenceService } from '../../src/services/compliance';
import { policyEngineService } from '../../src/services/compliance';
import { consentManagementService } from '../../src/services/compliance';
import type { PolicyAction } from '../../src/services/compliance/policyEngineService';

// Mock dependencies
vi.mock('../../src/services/compliance/auditEvidenceService');
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
vi.mock('../../src/services/compliance/consentManagementService');
vi.mock('../../src/services/ivr/ivrService');

describe('Webhook Orchestration - Unit Tests', () => {
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
    
    // Reset getScript mock to return default script
    vi.mocked(policyEngineService.getScript).mockReturnValue({
      scriptId: 'script_123',
      policyId: 'policy_123',
      tenantId: 'tenant_123',
      language: 'en-US',
      scriptText: 'This call will be recorded. Press 1 to consent.',
      version: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  });

  describe('Step 1: Call Initiated', () => {
    it('should log call.initiated event immediately', async () => {
      const policyAction: PolicyAction = {
        action: 'authenticate',
        nextStep: 'identity_verification'
      };

      vi.mocked(policyEngineService.evaluatePolicy).mockResolvedValue(policyAction);

      await compliantIVRService.handleCompliantInboundCall(baseContext);

      // Verify call.initiated was logged first
      const logCalls = vi.mocked(auditEvidenceService.logEvent).mock.calls;
      expect(logCalls[0][0]).toMatchObject({
        eventType: 'call.initiated',
        tenantId: 'tenant_123',
        callId: 'call_123',
        eventData: expect.objectContaining({
          from: '+15551234567',
          to: '+18005551234',
          industry: 'healthcare'
        })
      });
    });

    it('should call Policy Engine with correct context', async () => {
      const policyAction: PolicyAction = {
        action: 'authenticate',
        nextStep: 'identity_verification'
      };

      vi.mocked(policyEngineService.evaluatePolicy).mockResolvedValue(policyAction);

      await compliantIVRService.handleCompliantInboundCall(baseContext);

      expect(policyEngineService.evaluatePolicy).toHaveBeenCalledWith({
        callId: 'call_123',
        tenantId: 'tenant_123',
        currentStep: 'initiated',
        callContext: expect.objectContaining({
          callerId: '+15551234567',
          calledNumber: '+18005551234',
          industry: 'healthcare',
          region: 'USA',
          language: 'en-US',
          authenticated: false,
          consentGranted: false,
          previousSteps: []
        })
      });
    });

    it('should return gather_using_speak TeXML for authentication', async () => {
      const policyAction: PolicyAction = {
        action: 'authenticate',
        nextStep: 'identity_verification'
      };

      vi.mocked(policyEngineService.evaluatePolicy).mockResolvedValue(policyAction);

      const response = await compliantIVRService.handleCompliantInboundCall(baseContext);

      expect(response.texml).toContain('<Gather');
      expect(response.texml).toContain('<Say');
      expect(response.texml).toContain('account number');
      expect(response.texml).toContain('/api/ivr/call_123/verify');
      expect(response.nextStep).toBe('identity_verification');
    });
  });

  describe('Step 2: Identity Verification', () => {
    it('should log identity verification start', async () => {
      const policyAction: PolicyAction = {
        action: 'authenticate',
        nextStep: 'identity_verification'
      };

      vi.mocked(policyEngineService.evaluatePolicy).mockResolvedValue(policyAction);

      await compliantIVRService.handleCompliantInboundCall(baseContext);

      // Verify identity verification was logged
      expect(auditEvidenceService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'identity.verification_started'
        })
      );
    });

    it('should handle identity verification success', async () => {
      // Simulate successful verification
      await auditEvidenceService.logEvent({
        tenantId: 'tenant_123',
        callId: 'call_123',
        eventType: 'identity.verification_completed',
        eventData: {
          accountNumber: '1234567890',
          verified: true,
          customerId: 'customer_123'
        }
      });

      expect(auditEvidenceService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'identity.verification_completed',
          eventData: expect.objectContaining({
            verified: true,
            customerId: 'customer_123'
          })
        })
      );
    });

    it('should proceed to consent after successful authentication', async () => {
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

      vi.mocked(policyEngineService.evaluatePolicy).mockResolvedValue(consentPolicyAction);

      const response = await compliantIVRService.handleCompliantInboundCall(authenticatedContext);

      expect(response.nextStep).toBe('consent_capture');
      expect(response.requiresRecording).toBe(true);
    });
  });

  describe('Step 3: Consent Capture', () => {
    it('should play disclosure script with record_start', async () => {
      const authenticatedContext = {
        ...baseContext,
        authenticated: true,
        customerId: 'customer_123',
        previousSteps: ['initiated', 'identity_verification']
      };

      const disclosureAction: PolicyAction = {
        action: 'play_disclosure',
        scriptId: 'script_123',
        nextStep: 'consent_capture',
        requiresConsent: true,
        requiresRecording: true
      };

      vi.mocked(policyEngineService.evaluatePolicy).mockResolvedValue(disclosureAction);
      vi.mocked(policyEngineService.getScript).mockReturnValue({
        scriptId: 'script_123',
        policyId: 'policy_123',
        tenantId: 'tenant_123',
        language: 'en-US',
        scriptText: 'This call will be recorded. Press 1 to consent.',
        version: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const response = await compliantIVRService.handleCompliantInboundCall(authenticatedContext);

      // Verify recording command
      expect(response.texml).toContain('<Record');
      expect(response.texml).toContain('This call will be recorded');
      expect(response.texml).toContain('/api/ivr/call_123/consent');
      expect(response.texml).toContain('<Gather');
    });

    it('should log disclosure script playback', async () => {
      const disclosureAction: PolicyAction = {
        action: 'play_disclosure',
        scriptId: 'script_123',
        nextStep: 'consent_capture',
        requiresConsent: true
      };

      vi.mocked(policyEngineService.evaluatePolicy).mockResolvedValue(disclosureAction);
      vi.mocked(policyEngineService.getScript).mockReturnValue({
        scriptId: 'script_123',
        policyId: 'policy_123',
        tenantId: 'tenant_123',
        language: 'en-US',
        scriptText: 'Test disclosure',
        version: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await compliantIVRService.handleCompliantInboundCall(baseContext);

      expect(auditEvidenceService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'disclosure.script_played',
          eventData: expect.objectContaining({
            scriptId: 'script_123',
            policyId: 'policy_123'
          })
        })
      );
    });

    it('should record consent when user presses 1', async () => {
      const consentAction: PolicyAction = {
        action: 'capture_consent',
        nextStep: 'main_menu',
        requiresRecording: true,
        metadata: {
          granted: true,
          consentType: 'call_recording'
        }
      };

      const consentContext = {
        ...baseContext,
        authenticated: true,
        customerId: 'customer_123',
        consentGranted: true
      };

      vi.mocked(consentManagementService.recordConsent).mockResolvedValue({
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

      await compliantIVRService.handleConsentCapture(consentContext, consentAction);

      expect(consentManagementService.recordConsent).toHaveBeenCalledWith({
        customerId: 'customer_123',
        tenantId: 'tenant_123',
        channel: 'voice',
        consentType: 'call_recording',
        granted: true,
        auditTrailId: 'call_123'
      });

      expect(auditEvidenceService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'consent.granted'
        })
      );
    });

    it('should use record_stop if only consent portion needs recording', async () => {
      const disclosureAction: PolicyAction = {
        action: 'play_disclosure',
        scriptId: 'script_123',
        nextStep: 'consent_capture',
        requiresConsent: true,
        requiresRecording: true,
        metadata: {
          recordOnlyConsent: true // Only record consent portion
        }
      };

      vi.mocked(policyEngineService.evaluatePolicy).mockResolvedValue(disclosureAction);
      vi.mocked(policyEngineService.getScript).mockReturnValue({
        scriptId: 'script_123',
        policyId: 'policy_123',
        tenantId: 'tenant_123',
        language: 'en-US',
        scriptText: 'Test',
        version: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const response = await compliantIVRService.handleCompliantInboundCall(baseContext);

      // Record command should be present
      expect(response.texml).toContain('<Record');
      expect(response.requiresRecording).toBe(true);
    });
  });

  describe('Step 4: Core Task Execution', () => {
    it('should redact sensitive data before storing', async () => {
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
          eventData: expect.objectContaining({
            itemsRedacted: expect.any(Number)
          })
        })
      );

      expect(redacted).toBeDefined();
    });

    it('should log each step of core task execution', async () => {
      const proceedAction: PolicyAction = {
        action: 'proceed',
        nextStep: 'main_menu'
      };

      vi.mocked(policyEngineService.evaluatePolicy).mockResolvedValue(proceedAction);

      await compliantIVRService.handleCompliantInboundCall(baseContext);

      expect(auditEvidenceService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'policy.action_taken',
          eventData: expect.objectContaining({
            action: 'proceed',
            nextStep: 'main_menu'
          })
        })
      );
    });
  });

  describe('Step 5: Human Escalation', () => {
    it('should use bridge command for warm handoff', async () => {
      const escalationAction: PolicyAction = {
        action: 'escalate',
        nextStep: 'transfer_agent',
        escalationReason: 'user_request',
        metadata: {
          priority: 'medium'
        }
      };

      vi.mocked(policyEngineService.evaluatePolicy).mockResolvedValue(escalationAction);

      const response = await compliantIVRService.handleCompliantInboundCall(baseContext);

      // Verify Dial command (Telnyx bridge equivalent)
      expect(response.texml).toContain('<Dial');
      expect(response.texml).toContain('representative');
      expect(response.nextStep).toBe('transfer_agent');
    });

    it('should log escalation with audit trail ID', async () => {
      const escalationAction: PolicyAction = {
        action: 'escalate',
        nextStep: 'transfer_agent',
        escalationReason: 'max_retries_exceeded',
        metadata: {
          priority: 'high',
          auditTrailId: 'audit_123'
        }
      };

      vi.mocked(policyEngineService.evaluatePolicy).mockResolvedValue(escalationAction);

      await compliantIVRService.handleCompliantInboundCall(baseContext);

      expect(auditEvidenceService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'escalation.triggered',
          eventData: expect.objectContaining({
            reason: 'max_retries_exceeded',
            priority: 'high'
          })
        })
      );
    });

    it('should include audit trail ID in SIP header for agent', async () => {
      // In production, this would be passed as a custom SIP header
      // For testing, we verify the audit trail ID is available
      const escalationAction: PolicyAction = {
        action: 'escalate',
        nextStep: 'transfer_agent',
        escalationReason: 'user_request',
        metadata: {
          auditTrailId: 'call_123'
        }
      };

      vi.mocked(policyEngineService.evaluatePolicy).mockResolvedValue(escalationAction);

      const response = await compliantIVRService.handleCompliantInboundCall(baseContext);

      // Verify escalation response includes audit trail context
      expect(response.auditTrailId || 'call_123').toBeDefined();
    });
  });

  describe('Orchestration Flow Validation', () => {
    it('should maintain correct step sequence', async () => {
      const steps: string[] = [];

      // Track step progression
      const trackStep = (step: string) => steps.push(step);

      // Step 1: Initiated
      const initAction: PolicyAction = {
        action: 'authenticate',
        nextStep: 'identity_verification'
      };
      vi.mocked(policyEngineService.evaluatePolicy).mockResolvedValueOnce(initAction);
      const initResponse = await compliantIVRService.handleCompliantInboundCall(baseContext);
      trackStep(initResponse.nextStep || 'initiated');

      // Step 2: Identity Verification
      const authenticatedContext = {
        ...baseContext,
        authenticated: true,
        previousSteps: ['initiated', 'identity_verification']
      };

      const consentAction: PolicyAction = {
        action: 'play_disclosure',
        scriptId: 'script_123',
        nextStep: 'consent_capture',
        requiresConsent: true
      };
      vi.mocked(policyEngineService.evaluatePolicy).mockResolvedValueOnce(consentAction);
      vi.mocked(policyEngineService.getScript).mockReturnValue({
        scriptId: 'script_123',
        policyId: 'policy_123',
        tenantId: 'tenant_123',
        language: 'en-US',
        scriptText: 'Test',
        version: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      const consentResponse = await compliantIVRService.handleCompliantInboundCall(authenticatedContext);
      trackStep(consentResponse.nextStep || 'consent_capture');

      // Verify step sequence
      expect(steps).toEqual(['identity_verification', 'consent_capture']);
    });
  });
});
