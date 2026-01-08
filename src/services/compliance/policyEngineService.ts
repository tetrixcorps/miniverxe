// Policy Engine Service
// Centralized service for managing tenant-specific compliance rules, disclosure scripts, and escalation logic

import crypto from 'crypto';

export interface PolicyEvaluationRequest {
  callId: string;
  tenantId: string;
  currentStep: string;
  callContext?: CallContext;
  userInput?: string;
}

export interface CallContext {
  callerId?: string;
  calledNumber?: string;
  industry?: string;
  region?: string;
  language?: string;
  authenticated?: boolean;
  consentGranted?: boolean;
  previousSteps?: string[];
}

export interface PolicyAction {
  action: 'play_disclosure' | 'capture_consent' | 'authenticate' | 'proceed' | 'escalate' | 'redact' | 'record';
  scriptId?: string;
  nextStep?: string;
  requiresConsent?: boolean;
  requiresRecording?: boolean;
  escalationReason?: string;
  metadata?: Record<string, any>;
}

export interface DisclosureScript {
  scriptId: string;
  policyId: string;
  tenantId: string;
  language: string;
  scriptText: string;
  version: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompliancePolicy {
  policyId: string;
  tenantId: string;
  region: string;
  policyName: string;
  industry: string;
  requiresConsentRecording: boolean;
  requiresIdentityVerification: boolean;
  requiresDisclosure: boolean;
  disclosureScriptId?: string;
  escalationRules?: EscalationRule[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EscalationRule {
  condition: string; // e.g., "verification_failed_3_times", "user_requested_agent"
  action: 'transfer_to_agent' | 'transfer_to_department' | 'end_call';
  destination?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

class PolicyEngineService {
  private policies: Map<string, CompliancePolicy> = new Map();
  private scripts: Map<string, DisclosureScript> = new Map();
  private webhookBaseUrl: string;

  constructor() {
    this.webhookBaseUrl = process.env.WEBHOOK_BASE_URL || 'https://tetrixcorp.com';
    this.initializeDefaultPolicies();
  }

  /**
   * Initialize default compliance policies for each industry
   */
  private initializeDefaultPolicies() {
    // Healthcare HIPAA Policy
    const healthcarePolicy: CompliancePolicy = {
      policyId: 'healthcare_hipaa_default',
      tenantId: 'default',
      region: 'USA',
      policyName: 'HIPAA Compliance Policy',
      industry: 'healthcare',
      requiresConsentRecording: true,
      requiresIdentityVerification: true,
      requiresDisclosure: true,
      disclosureScriptId: 'hipaa_disclosure_en_us',
      escalationRules: [
        {
          condition: 'verification_failed_3_times',
          action: 'transfer_to_agent',
          priority: 'high'
        },
        {
          condition: 'user_requested_agent',
          action: 'transfer_to_agent',
          priority: 'medium'
        }
      ],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.policies.set(healthcarePolicy.policyId, healthcarePolicy);

    // HIPAA Disclosure Script
    const hipaaScript: DisclosureScript = {
      scriptId: 'hipaa_disclosure_en_us',
      policyId: healthcarePolicy.policyId,
      tenantId: 'default',
      language: 'en-US',
      scriptText: 'This call may be recorded for quality assurance and compliance purposes. Protected Health Information may be discussed. By continuing, you consent to the recording and handling of your information in accordance with HIPAA regulations. Press 1 to consent and continue, or press 0 to speak with a representative.',
      version: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.scripts.set(hipaaScript.scriptId, hipaaScript);

    // Insurance PCI-DSS Policy
    const insurancePolicy: CompliancePolicy = {
      policyId: 'insurance_pci_default',
      tenantId: 'default',
      region: 'USA',
      policyName: 'PCI-DSS Compliance Policy',
      industry: 'insurance',
      requiresConsentRecording: true,
      requiresIdentityVerification: true,
      requiresDisclosure: true,
      disclosureScriptId: 'pci_disclosure_en_us',
      escalationRules: [
        {
          condition: 'payment_processing_required',
          action: 'transfer_to_agent',
          priority: 'high'
        }
      ],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.policies.set(insurancePolicy.policyId, insurancePolicy);

    // PCI-DSS Disclosure Script
    const pciScript: DisclosureScript = {
      scriptId: 'pci_disclosure_en_us',
      policyId: insurancePolicy.policyId,
      tenantId: 'default',
      language: 'en-US',
      scriptText: 'This call may be recorded for quality and compliance purposes. If you provide payment information, it will be processed securely in accordance with PCI-DSS standards. Press 1 to consent and continue, or press 0 to speak with a representative.',
      version: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.scripts.set(pciScript.scriptId, pciScript);
  }

  /**
   * Evaluate policy and return next action
   */
  async evaluatePolicy(request: PolicyEvaluationRequest): Promise<PolicyAction> {
    const { callId, tenantId, currentStep, callContext = {}, userInput } = request;

    // Get tenant-specific policy
    const policy = this.getPolicyForTenant(tenantId, callContext.industry, callContext.region);
    
    if (!policy) {
      // Default action if no policy found
      return {
        action: 'proceed',
        nextStep: currentStep
      };
    }

    // Check if identity verification is required and not completed
    if (policy.requiresIdentityVerification && !callContext.authenticated) {
      return {
        action: 'authenticate',
        nextStep: 'identity_verification',
        metadata: {
          policyId: policy.policyId,
          requiresMFA: false
        }
      };
    }

    // Check if disclosure is required and not yet played
    if (policy.requiresDisclosure && !callContext.consentGranted) {
      const script = this.getScript(policy.disclosureScriptId || '');
      if (script) {
        return {
          action: 'play_disclosure',
          scriptId: script.scriptId,
          nextStep: 'consent_capture',
          requiresConsent: true,
          requiresRecording: policy.requiresConsentRecording,
          metadata: {
            scriptText: script.scriptText,
            language: script.language
          }
        };
      }
    }

    // Check escalation rules
    const escalationAction = this.checkEscalationRules(policy, callContext, userInput);
    if (escalationAction) {
      return escalationAction;
    }

    // Check if consent capture is needed
    if (currentStep === 'consent_capture' && userInput === '1') {
      return {
        action: 'capture_consent',
        nextStep: 'main_menu',
        requiresRecording: policy.requiresConsentRecording,
        metadata: {
          consentType: 'call_recording',
          granted: true
        }
      };
    }

    if (currentStep === 'consent_capture' && userInput === '0') {
      return {
        action: 'escalate',
        escalationReason: 'user_requested_agent',
        nextStep: 'transfer_agent',
        metadata: {
          reason: 'User requested to speak with representative'
        }
      };
    }

    // Default: proceed with normal flow
    return {
      action: 'proceed',
      nextStep: currentStep,
      metadata: {
        policyId: policy.policyId
      }
    };
  }

  /**
   * Get policy for tenant based on industry and region
   */
  private getPolicyForTenant(tenantId: string, industry?: string, region?: string): CompliancePolicy | undefined {
    // In production, this would query a database
    // For now, return default policy based on industry
    const policies = Array.from(this.policies.values());
    
    // Try to find tenant-specific policy first
    let policy = policies.find(p => p.tenantId === tenantId && p.isActive);
    
    // Fallback to industry-specific default
    if (!policy && industry) {
      policy = policies.find(p => 
        p.industry === industry && 
        p.tenantId === 'default' && 
        p.isActive
      );
    }

    // Filter by region if specified
    if (policy && region && policy.region !== region) {
      policy = policies.find(p => 
        p.industry === industry && 
        p.region === region && 
        p.tenantId === 'default' && 
        p.isActive
      );
    }

    return policy;
  }

  /**
   * Get disclosure script by ID
   */
  getScript(scriptId: string): DisclosureScript | undefined {
    return this.scripts.get(scriptId);
  }

  /**
   * Get script for tenant, policy, and language
   */
  async getScriptForTenant(tenantId: string, policyId: string, language: string): Promise<DisclosureScript | undefined> {
    const scripts = Array.from(this.scripts.values());
    return scripts.find(s => 
      s.tenantId === tenantId && 
      s.policyId === policyId && 
      s.language === language && 
      s.isActive
    );
  }

  /**
   * Check escalation rules
   */
  private checkEscalationRules(
    policy: CompliancePolicy,
    callContext: CallContext,
    userInput?: string
  ): PolicyAction | null {
    if (!policy.escalationRules) return null;

    for (const rule of policy.escalationRules) {
      if (this.evaluateEscalationCondition(rule.condition, callContext, userInput)) {
        return {
          action: 'escalate',
          escalationReason: rule.condition,
          nextStep: rule.destination || 'transfer_agent',
          metadata: {
            priority: rule.priority,
            rule: rule.condition
          }
        };
      }
    }

    return null;
  }

  /**
   * Evaluate escalation condition
   */
  private evaluateEscalationCondition(
    condition: string,
    callContext: CallContext,
    userInput?: string
  ): boolean {
    // Simple condition evaluation - in production, use a more sophisticated rule engine
    switch (condition) {
      case 'verification_failed_3_times':
        return (callContext.metadata?.verificationAttempts || 0) >= 3;
      
      case 'user_requested_agent':
        return userInput === '0' || 
               userInput?.toLowerCase().includes('agent') ||
               userInput?.toLowerCase().includes('representative') ||
               userInput?.toLowerCase().includes('human');
      
      case 'payment_processing_required':
        return userInput?.toLowerCase().includes('payment') ||
               userInput?.toLowerCase().includes('pay');
      
      default:
        return false;
    }
  }

  /**
   * Register a new policy
   */
  registerPolicy(policy: CompliancePolicy): void {
    this.policies.set(policy.policyId, policy);
  }

  /**
   * Register a new disclosure script
   */
  registerScript(script: DisclosureScript): void {
    this.scripts.set(script.scriptId, script);
  }

  /**
   * Get all policies for a tenant
   */
  getPoliciesForTenant(tenantId: string): CompliancePolicy[] {
    return Array.from(this.policies.values())
      .filter(p => p.tenantId === tenantId && p.isActive);
  }

  /**
   * Get all scripts for a tenant
   */
  getScriptsForTenant(tenantId: string): DisclosureScript[] {
    return Array.from(this.scripts.values())
      .filter(s => s.tenantId === tenantId && s.isActive);
  }
}

export const policyEngineService = new PolicyEngineService();
