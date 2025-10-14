// TeXML Integration Tests
// Comprehensive testing for TeXML voice applications

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { TeXMLTemplateManager, IndustryTeXMLGenerator, AdvancedTeXMLFeatures } from '../../src/services/texmlTemplates';
import { TeXMLIntegrationService, TeXMLWebhookHandler, TeXMLAnalytics, TeXMLComplianceManager } from '../../src/services/texmlIntegration';

describe('TeXML Template Manager', () => {
  let templateManager: TeXMLTemplateManager;

  beforeEach(() => {
    templateManager = new TeXMLTemplateManager();
  });

  test('should initialize with default templates', () => {
    const templates = templateManager.getAllTemplates();
    expect(templates.length).toBeGreaterThan(0);
    
    const healthcareTemplates = templateManager.getTemplatesByIndustry('healthcare');
    expect(healthcareTemplates.length).toBeGreaterThan(0);
  });

  test('should get specific template', () => {
    const template = templateManager.getTemplate('healthcare_patient_intake');
    expect(template).toBeDefined();
    expect(template?.industry).toBe('healthcare');
    expect(template?.variables).toContain('patient_services_number');
  });

  test('should render template with variables', () => {
    const rendered = templateManager.renderTemplate('healthcare_patient_intake', {
      patient_services_number: '+1-800-596-3057'
    });

    expect(rendered).toContain('+1-800-596-3057');
    expect(rendered).toContain('Welcome to TETRIX Healthcare');
    expect(rendered).toContain('<?xml version="1.0" encoding="UTF-8"?>');
  });

  test('should validate template variables', () => {
    const isValid = templateManager.validateTemplate('healthcare_patient_intake', {
      patient_services_number: '+1-800-596-3057'
    });
    expect(isValid).toBe(true);

    const isInvalid = templateManager.validateTemplate('healthcare_patient_intake', {
      wrong_variable: 'value'
    });
    expect(isInvalid).toBe(false);
  });

  test('should throw error for non-existent template', () => {
    expect(() => {
      templateManager.renderTemplate('non_existent_template', {});
    }).toThrow('Template non_existent_template not found');
  });
});

describe('Industry TeXML Generator', () => {
  let industryGenerator: IndustryTeXMLGenerator;

  beforeEach(() => {
    industryGenerator = new IndustryTeXMLGenerator();
  });

  test('should generate healthcare TeXML', () => {
    const texml = industryGenerator.generateHealthcareTeXML('patient_intake', {
      patient_services_number: '+1-800-596-3057'
    });

    expect(texml).toContain('Welcome to TETRIX Healthcare');
    expect(texml).toContain('+1-800-596-3057');
    expect(texml).toContain('medical record purposes');
  });

  test('should generate legal TeXML', () => {
    const texml = industryGenerator.generateLegalTeXML('client_intake', {
      legal_services_number: '+1-800-596-3057'
    });

    expect(texml).toContain('Welcome to TETRIX Legal Services');
    expect(texml).toContain('+1-800-596-3057');
    expect(texml).toContain('attorney-client privilege');
  });

  test('should generate fleet TeXML', () => {
    const texml = industryGenerator.generateFleetTeXML('driver_emergency', {
      emergency_dispatch_number: '+1-800-596-3057'
    });

    expect(texml).toContain('TETRIX Fleet Management Emergency Line');
    expect(texml).toContain('+1-800-596-3057');
    expect(texml).toContain('emergency situation');
  });

  test('should generate general TeXML', () => {
    const texml = industryGenerator.generateGeneralTeXML('sales_inquiry', {
      sales_number: '+1-800-596-3057'
    });

    expect(texml).toContain('Welcome to TETRIX Enterprise Solutions');
    expect(texml).toContain('+1-800-596-3057');
    expect(texml).toContain('business needs');
  });

  test('should throw error for unsupported scenario', () => {
    expect(() => {
      industryGenerator.generateHealthcareTeXML('unsupported_scenario', {});
    }).toThrow('Healthcare scenario unsupported_scenario not supported');
  });
});

describe('Advanced TeXML Features', () => {
  let advancedFeatures: AdvancedTeXMLFeatures;

  beforeEach(() => {
    advancedFeatures = new AdvancedTeXMLFeatures();
  });

  test('should generate multi-language TeXML', () => {
    const texml = advancedFeatures.generateMultiLanguageTeXML(
      'Welcome to TETRIX',
      'es-ES'
    );

    expect(texml).toContain('Welcome to TETRIX');
    expect(texml).toContain('language="es-ES"');
    expect(texml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
  });

  test('should generate conference TeXML', () => {
    const texml = advancedFeatures.generateConferenceTeXML('test-conference', 25);

    expect(texml).toContain('tetrix-test-conference');
    expect(texml).toContain('maxParticipants="25"');
    expect(texml).toContain('<Conference');
  });

  test('should generate voicemail TeXML', () => {
    const texml = advancedFeatures.generateVoicemailTeXML('test-mailbox', 'Custom greeting');

    expect(texml).toContain('Custom greeting');
    expect(texml).toContain('tetrix-test-mailbox');
    expect(texml).toContain('<Record');
    expect(texml).toContain('transcribe="true"');
  });

  test('should generate queue TeXML', () => {
    const texml = advancedFeatures.generateQueueTeXML('test-queue', 'Custom wait message');

    expect(texml).toContain('Custom wait message');
    expect(texml).toContain('tetrix-test-queue');
    expect(texml).toContain('<Enqueue');
  });
});

describe('TeXML Integration Service', () => {
  let integrationService: TeXMLIntegrationService;
  const config = {
    industry: 'healthcare',
    webhookUrl: 'https://tetrixcorp.com',
    complianceLevel: 'hipaa',
    features: ['transcription', 'recording', 'analytics'],
    phoneNumbers: {
      primary: '+1-800-596-3057',
      secondary: '+1-888-804-6762',
      emergency: '+1-800-596-3057'
    }
  };

  beforeEach(() => {
    integrationService = new TeXMLIntegrationService(config);
  });

  test('should generate healthcare TeXML with patient data', async () => {
    const texml = await integrationService.generateHealthcareTeXML('patient_intake', {
      name: 'John Doe',
      id: 'PAT123'
    });

    expect(texml).toContain('Welcome to TETRIX Healthcare');
    expect(texml).toContain('+1-800-596-3057');
    expect(texml).toContain('medical record purposes');
  });

  test('should generate legal TeXML with client data', async () => {
    const texml = await integrationService.generateLegalTeXML('client_intake', {
      name: 'Jane Smith',
      caseNumber: 'CASE456'
    });

    expect(texml).toContain('Welcome to TETRIX Legal Services');
    expect(texml).toContain('+1-800-596-3057');
    expect(texml).toContain('attorney-client privilege');
  });

  test('should generate fleet TeXML with vehicle data', async () => {
    const texml = await integrationService.generateFleetTeXML('driver_emergency', {
      id: 'VEH123',
      driverId: 'DRV456'
    });

    expect(texml).toContain('TETRIX Fleet Management Emergency Line');
    expect(texml).toContain('+1-800-596-3057');
    expect(texml).toContain('emergency situation');
  });

  test('should generate general TeXML with business data', async () => {
    const texml = await integrationService.generateGeneralTeXML('sales_inquiry', {
      name: 'Acme Corp',
      accountId: 'ACC789'
    });

    expect(texml).toContain('Welcome to TETRIX Enterprise Solutions');
    expect(texml).toContain('+1-800-596-3057');
    expect(texml).toContain('business needs');
  });

  test('should generate advanced TeXML features', async () => {
    const conferenceTeXML = await integrationService.generateAdvancedTeXML('conference', {
      conferenceId: 'test-conf',
      maxParticipants: 50
    });

    expect(conferenceTeXML).toContain('tetrix-test-conf');
    expect(conferenceTeXML).toContain('maxParticipants="50"');
  });
});

describe('TeXML Webhook Handler', () => {
  let webhookHandler: TeXMLWebhookHandler;
  const config = {
    industry: 'healthcare',
    webhookUrl: 'https://tetrixcorp.com',
    complianceLevel: 'hipaa',
    features: ['transcription', 'recording'],
    phoneNumbers: {
      primary: '+1-800-596-3057',
      secondary: '+1-888-804-6762',
      emergency: '+1-800-596-3057'
    }
  };

  beforeEach(() => {
    webhookHandler = new TeXMLWebhookHandler(config);
  });

  test('should handle healthcare webhook', async () => {
    const texml = await webhookHandler.handleWebhook('call.initiated', {
      industry: 'healthcare',
      scenario: 'patient_intake',
      language: 'en-US',
      complianceType: 'hipaa'
    });

    expect(texml).toContain('Welcome to TETRIX Healthcare');
    expect(texml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
  });

  test('should handle legal webhook', async () => {
    const texml = await webhookHandler.handleWebhook('call.initiated', {
      industry: 'legal',
      scenario: 'client_intake',
      language: 'en-US',
      complianceType: 'attorney_client_privilege'
    });

    expect(texml).toContain('Welcome to TETRIX Legal Services');
    expect(texml).toContain('attorney-client privilege');
  });

  test('should handle fleet webhook', async () => {
    const texml = await webhookHandler.handleWebhook('call.initiated', {
      industry: 'fleet',
      scenario: 'driver_emergency',
      language: 'en-US',
      complianceType: 'fleet_management'
    });

    expect(texml).toContain('TETRIX Fleet Management Emergency Line');
    expect(texml).toContain('emergency situation');
  });

  test('should handle error gracefully', async () => {
    const texml = await webhookHandler.handleWebhook('call.initiated', {
      industry: 'invalid_industry',
      scenario: 'invalid_scenario'
    });

    expect(texml).toContain('We\'re experiencing technical difficulties');
    expect(texml).toContain('<Hangup/>');
  });
});

describe('TeXML Analytics', () => {
  let analytics: TeXMLAnalytics;

  beforeEach(() => {
    analytics = new TeXMLAnalytics();
  });

  test('should track call events', () => {
    analytics.trackCallEvent('call.initiated', {
      industry: 'healthcare',
      scenario: 'patient_intake',
      callId: 'call_123'
    });

    const metrics = analytics.getCallMetrics('1h');
    expect(metrics.totalCalls).toBe(1);
    expect(metrics.industryBreakdown.healthcare).toBe(1);
  });

  test('should calculate call metrics', () => {
    // Track multiple events
    analytics.trackCallEvent('call.initiated', { industry: 'healthcare', scenario: 'patient_intake' });
    analytics.trackCallEvent('call.initiated', { industry: 'legal', scenario: 'client_intake' });
    analytics.trackCallEvent('call.hangup', { industry: 'healthcare', duration: 120 });
    analytics.trackCallEvent('call.hangup', { industry: 'legal', duration: 180 });

    const metrics = analytics.getCallMetrics('1h');
    expect(metrics.totalCalls).toBe(2);
    expect(metrics.completedCalls).toBe(2);
    expect(metrics.industryBreakdown.healthcare).toBe(1);
    expect(metrics.industryBreakdown.legal).toBe(1);
    expect(metrics.averageCallDuration).toBe(150);
  });

  test('should get top scenarios', () => {
    analytics.trackCallEvent('call.initiated', { industry: 'healthcare', scenario: 'patient_intake' });
    analytics.trackCallEvent('call.initiated', { industry: 'healthcare', scenario: 'patient_intake' });
    analytics.trackCallEvent('call.initiated', { industry: 'legal', scenario: 'client_intake' });

    const metrics = analytics.getCallMetrics('1h');
    expect(metrics.topScenarios[0].scenario).toBe('patient_intake');
    expect(metrics.topScenarios[0].count).toBe(2);
  });
});

describe('TeXML Compliance Manager', () => {
  let complianceManager: TeXMLComplianceManager;

  beforeEach(() => {
    complianceManager = new TeXMLComplianceManager();
  });

  test('should validate HIPAA compliance', () => {
    const isCompliant = complianceManager.validateCompliance('hipaa', {
      recordingConsent: true,
      accessLogging: true,
      encryptionRequired: true
    });

    expect(isCompliant).toBe(true);
  });

  test('should reject non-compliant data', () => {
    const isCompliant = complianceManager.validateCompliance('hipaa', {
      recordingConsent: false,
      accessLogging: true,
      encryptionRequired: true
    });

    expect(isCompliant).toBe(false);
  });

  test('should validate attorney-client privilege', () => {
    const isCompliant = complianceManager.validateCompliance('attorney_client_privilege', {
      privilegeProtection: true,
      confidentialityNotice: true,
      accessRestriction: true
    });

    expect(isCompliant).toBe(true);
  });

  test('should get compliance requirements', () => {
    const hipaaRequirements = complianceManager.getComplianceRequirements('hipaa');
    expect(hipaaRequirements.recordingConsent).toBe(true);
    expect(hipaaRequirements.dataRetention).toBe('7 years');
    expect(hipaaRequirements.encryptionRequired).toBe(true);
  });

  test('should return empty for unknown compliance type', () => {
    const requirements = complianceManager.getComplianceRequirements('unknown');
    expect(requirements).toEqual({});
  });
});

describe('TeXML End-to-End Integration', () => {
  test('should handle complete healthcare call flow', async () => {
    const config = {
      industry: 'healthcare',
      webhookUrl: 'https://tetrixcorp.com',
      complianceLevel: 'hipaa',
      features: ['transcription', 'recording', 'analytics'],
      phoneNumbers: {
        primary: '+1-800-596-3057',
        secondary: '+1-888-804-6762',
        emergency: '+1-800-596-3057'
      }
    };

    const integrationService = new TeXMLIntegrationService(config);
    const webhookHandler = new TeXMLWebhookHandler(config);
    const analytics = new TeXMLAnalytics();

    // Simulate call initiation
    const callInitiatedTeXML = await webhookHandler.handleWebhook('call.initiated', {
      industry: 'healthcare',
      scenario: 'patient_intake',
      language: 'en-US',
      complianceType: 'hipaa',
      patientData: { name: 'John Doe', id: 'PAT123' }
    });

    expect(callInitiatedTeXML).toContain('Welcome to TETRIX Healthcare');
    expect(callInitiatedTeXML).toContain('medical record purposes');

    // Track analytics
    analytics.trackCallEvent('call.initiated', {
      industry: 'healthcare',
      scenario: 'patient_intake',
      callId: 'call_123'
    });

    // Simulate call completion
    analytics.trackCallEvent('call.hangup', {
      industry: 'healthcare',
      callId: 'call_123',
      duration: 180
    });

    const metrics = analytics.getCallMetrics('1h');
    expect(metrics.totalCalls).toBe(1);
    expect(metrics.completedCalls).toBe(1);
    expect(metrics.averageCallDuration).toBe(180);
  });

  test('should handle multi-language support', async () => {
    const advancedFeatures = new AdvancedTeXMLFeatures();
    
    const englishTeXML = advancedFeatures.generateMultiLanguageTeXML(
      'Welcome to TETRIX',
      'en-US'
    );
    
    const spanishTeXML = advancedFeatures.generateMultiLanguageTeXML(
      'Bienvenido a TETRIX',
      'es-ES'
    );

    expect(englishTeXML).toContain('language="en-US"');
    expect(spanishTeXML).toContain('language="es-ES"');
    expect(spanishTeXML).toContain('Bienvenido a TETRIX');
  });

  test('should handle conference calling', async () => {
    const advancedFeatures = new AdvancedTeXMLFeatures();
    
    const conferenceTeXML = advancedFeatures.generateConferenceTeXML(
      'enterprise-meeting-123',
      50
    );

    expect(conferenceTeXML).toContain('tetrix-enterprise-meeting-123');
    expect(conferenceTeXML).toContain('maxParticipants="50"');
    expect(conferenceTeXML).toContain('record="record-from-start"');
  });
});
