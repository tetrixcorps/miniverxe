// Unit Tests for Toll-Free Numbers
// Testing voice routing and call handling for +1-800-596-3057 and +1-888-804-6762

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { TeXMLResponseGenerator } from '../../src/pages/api/voice/texml-enhanced';
import { TeXMLTemplateManager, IndustryTeXMLGenerator } from '../../src/services/texmlTemplates';
import { TeXMLIntegrationService } from '../../src/services/texmlIntegration';

describe('Toll-Free Number Voice Routing', () => {
  let texmlGenerator: TeXMLResponseGenerator;
  let templateManager: TeXMLTemplateManager;
  let industryGenerator: IndustryTeXMLGenerator;

  beforeEach(() => {
    texmlGenerator = new TeXMLResponseGenerator();
    templateManager = new TeXMLTemplateManager();
    industryGenerator = new IndustryTeXMLGenerator();
  });

  describe('Primary Toll-Free Number (+1-800-596-3057)', () => {
    test('should route healthcare calls to primary number', () => {
      const texml = texmlGenerator.generateHealthcareRouting('1');
      
      expect(texml).toContain('+1-800-596-3057');
      expect(texml).toContain('patient services team');
      expect(texml).toContain('medical record purposes');
      expect(texml).toContain('record-from-answer');
    });

    test('should route legal emergency calls to primary number', () => {
      const texml = texmlGenerator.generateLegalRouting('0');
      
      expect(texml).toContain('+1-800-596-3057');
      expect(texml).toContain('urgent legal matters');
      expect(texml).toContain('attorney-client privilege');
      expect(texml).toContain('record-from-answer');
    });

    test('should route fleet emergency calls to primary number', () => {
      const texml = texmlGenerator.generateFleetRouting('0');
      
      expect(texml).toContain('+1-800-596-3057');
      expect(texml).toContain('emergency dispatch team');
      expect(texml).toContain('emergency situation');
      expect(texml).toContain('record-from-answer');
    });

    test('should include proper recording and compliance headers', () => {
      const texml = texmlGenerator.generateHealthcareRouting('1');
      
      expect(texml).toContain('recordingStatusCallback');
      expect(texml).toContain('record="record-from-answer"');
      expect(texml).toContain('timeout="30"');
    });
  });

  describe('Secondary Toll-Free Number (+1-888-804-6762)', () => {
    test('should route healthcare provider support to secondary number', () => {
      const texml = texmlGenerator.generateHealthcareRouting('2');
      
      expect(texml).toContain('+1-888-804-6762');
      expect(texml).toContain('provider support team');
      expect(texml).toContain('healthcare specialist');
      expect(texml).toContain('record-from-answer');
    });

    test('should route legal attorney support to secondary number', () => {
      const texml = texmlGenerator.generateLegalRouting('2');
      
      expect(texml).toContain('+1-888-804-6762');
      expect(texml).toContain('attorney support team');
      expect(texml).toContain('attorney-client privilege');
      expect(texml).toContain('record-from-answer');
    });

    test('should route fleet coordination to secondary number', () => {
      const texml = texmlGenerator.generateFleetRouting('1');
      
      expect(texml).toContain('+1-888-804-6762');
      expect(texml).toContain('fleet coordinator');
      expect(texml).toContain('driver support');
      expect(texml).toContain('record-from-answer');
    });

    test('should route billing inquiries to secondary number', () => {
      const texml = texmlGenerator.generateHealthcareRouting('3');
      
      expect(texml).toContain('+1-888-804-6762');
      expect(texml).toContain('billing department');
      expect(texml).toContain('billing specialist');
      expect(texml).toContain('record-from-answer');
    });
  });

  describe('Call Flow Validation', () => {
    test('should handle invalid DTMF input gracefully', () => {
      const texml = texmlGenerator.generateInvalidSelection();
      
      expect(texml).toContain('Invalid selection');
      expect(texml).toContain('<Redirect>');
      expect(texml).toContain('texml-enhanced');
    });

    test('should include proper XML structure', () => {
      const texml = texmlGenerator.generateHealthcareRouting('1');
      
      expect(texml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(texml).toContain('<Response>');
      expect(texml).toContain('<Say voice="alice">');
      expect(texml).toContain('<Dial timeout="30"');
      expect(texml).toContain('<Number>');
      expect(texml).toContain('</Response>');
    });

    test('should include fallback handling for failed calls', () => {
      const texml = texmlGenerator.generateHealthcareRouting('1');
      
      expect(texml).toContain('The call could not be completed');
      expect(texml).toContain('Please try again later');
      expect(texml).toContain('<Hangup/>');
    });
  });

  describe('Industry-Specific Routing', () => {
    test('should route healthcare calls based on DTMF input', () => {
      const routing = {
        '1': { number: '+1-800-596-3057', message: 'patient services' },
        '2': { number: '+1-888-804-6762', message: 'provider support' },
        '3': { number: '+1-888-804-6762', message: 'billing department' },
        '0': { number: '+1-800-596-3057', message: 'emergency assistance' }
      };

      Object.entries(routing).forEach(([dtmf, expected]) => {
        const texml = texmlGenerator.generateHealthcareRouting(dtmf);
        expect(texml).toContain(expected.number);
        expect(texml).toContain(expected.message);
      });
    });

    test('should route legal calls based on DTMF input', () => {
      const routing = {
        '1': { number: '+1-800-596-3057', message: 'legal services' },
        '2': { number: '+1-888-804-6762', message: 'attorney support' },
        '3': { number: '+1-888-804-6762', message: 'case management' },
        '0': { number: '+1-800-596-3057', message: 'urgent legal matters' }
      };

      Object.entries(routing).forEach(([dtmf, expected]) => {
        const texml = texmlGenerator.generateLegalRouting(dtmf);
        expect(texml).toContain(expected.number);
        expect(texml).toContain(expected.message);
      });
    });

    test('should route fleet calls based on DTMF input', () => {
      const routing = {
        '1': { number: '+1-800-596-3057', message: 'driver support' },
        '2': { number: '+1-888-804-6762', message: 'vehicle tracking' },
        '3': { number: '+1-888-804-6762', message: 'maintenance alerts' },
        '0': { number: '+1-800-596-3057', message: 'emergency dispatch' }
      };

      Object.entries(routing).forEach(([dtmf, expected]) => {
        const texml = texmlGenerator.generateFleetRouting(dtmf);
        expect(texml).toContain(expected.number);
        expect(texml).toContain(expected.message);
      });
    });
  });

  describe('Compliance and Security', () => {
    test('should include HIPAA compliance for healthcare calls', () => {
      const texml = texmlGenerator.generateHealthcareRouting('1');
      
      expect(texml).toContain('medical record purposes');
      expect(texml).toContain('record-from-answer');
      expect(texml).toContain('recordingStatusCallback');
    });

    test('should include attorney-client privilege for legal calls', () => {
      const texml = texmlGenerator.generateLegalRouting('1');
      
      expect(texml).toContain('attorney-client privilege');
      expect(texml).toContain('record-from-answer');
      expect(texml).toContain('recordingStatusCallback');
    });

    test('should include fleet safety compliance for fleet calls', () => {
      const texml = texmlGenerator.generateFleetRouting('0');
      
      expect(texml).toContain('emergency dispatch');
      expect(texml).toContain('record-from-answer');
      expect(texml).toContain('recordingStatusCallback');
    });
  });

  describe('Template Integration', () => {
    test('should use healthcare templates with toll-free numbers', () => {
      const template = templateManager.getTemplate('healthcare_patient_intake');
      expect(template).toBeDefined();
      expect(template?.industry).toBe('healthcare');
      expect(template?.variables).toContain('patient_services_number');
    });

    test('should render healthcare template with toll-free numbers', () => {
      const rendered = templateManager.renderTemplate('healthcare_patient_intake', {
        patient_services_number: '+1-800-596-3057'
      });

      expect(rendered).toContain('+1-800-596-3057');
      expect(rendered).toContain('Welcome to TETRIX Healthcare');
      expect(rendered).toContain('medical record purposes');
    });

    test('should use legal templates with toll-free numbers', () => {
      const template = templateManager.getTemplate('legal_client_intake');
      expect(template).toBeDefined();
      expect(template?.industry).toBe('legal');
      expect(template?.variables).toContain('legal_services_number');
    });

    test('should render legal template with toll-free numbers', () => {
      const rendered = templateManager.renderTemplate('legal_client_intake', {
        legal_services_number: '+1-800-596-3057'
      });

      expect(rendered).toContain('+1-800-596-3057');
      expect(rendered).toContain('Welcome to TETRIX Legal Services');
      expect(rendered).toContain('attorney-client privilege');
    });
  });

  describe('Error Handling', () => {
    test('should handle missing phone numbers gracefully', () => {
      const texml = texmlGenerator.generateHangup();
      
      expect(texml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(texml).toContain('<Response>');
      expect(texml).toContain('<Hangup/>');
      expect(texml).toContain('</Response>');
    });

    test('should provide fallback messages for failed calls', () => {
      const texml = texmlGenerator.generateHealthcareRouting('1');
      
      expect(texml).toContain('The call could not be completed');
      expect(texml).toContain('Please try again later');
      expect(texml).toContain('patient portal');
    });
  });
});

describe('Toll-Free Number Integration Service', () => {
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

  test('should generate healthcare TeXML with toll-free numbers', async () => {
    const texml = await integrationService.generateHealthcareTeXML('patient_intake', {
      name: 'John Doe',
      id: 'PAT123'
    });

    expect(texml).toContain('+1-800-596-3057');
    expect(texml).toContain('Welcome to TETRIX Healthcare');
    expect(texml).toContain('medical record purposes');
  });

  test('should generate legal TeXML with toll-free numbers', async () => {
    const texml = await integrationService.generateLegalTeXML('client_intake', {
      name: 'Jane Smith',
      caseNumber: 'CASE456'
    });

    expect(texml).toContain('+1-800-596-3057');
    expect(texml).toContain('Welcome to TETRIX Legal Services');
    expect(texml).toContain('attorney-client privilege');
  });

  test('should generate fleet TeXML with toll-free numbers', async () => {
    const texml = await integrationService.generateFleetTeXML('driver_emergency', {
      id: 'VEH123',
      driverId: 'DRV456'
    });

    expect(texml).toContain('+1-800-596-3057');
    expect(texml).toContain('TETRIX Fleet Management Emergency Line');
    expect(texml).toContain('emergency situation');
  });

  test('should use correct phone numbers for different scenarios', async () => {
    // Test primary number for emergency scenarios
    const emergencyTeXML = await integrationService.generateHealthcareTeXML('patient_intake');
    expect(emergencyTeXML).toContain('+1-800-596-3057');

    // Test secondary number for support scenarios
    const supportConfig = {
      ...config,
      phoneNumbers: {
        primary: '+1-888-804-6762',
        secondary: '+1-888-804-6762',
        emergency: '+1-800-596-3057'
      }
    };
    
    const supportIntegration = new TeXMLIntegrationService(supportConfig);
    const supportTeXML = await supportIntegration.generateHealthcareTeXML('provider_support');
    expect(supportTeXML).toContain('+1-888-804-6762');
  });
});
