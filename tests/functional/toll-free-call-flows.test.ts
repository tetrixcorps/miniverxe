// Functional Tests for Toll-Free Number Call Flows
// End-to-end testing of voice call routing and handling

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { TeXMLResponseGenerator } from '../../src/pages/api/voice/texml-enhanced';
import { TeXMLIntegrationService, TeXMLWebhookHandler } from '../../src/services/texmlIntegration';

describe('Toll-Free Call Flow Integration', () => {
  let texmlGenerator: TeXMLResponseGenerator;
  let webhookHandler: TeXMLWebhookHandler;
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
    texmlGenerator = new TeXMLResponseGenerator();
    webhookHandler = new TeXMLWebhookHandler(config);
  });

  describe('Complete Healthcare Call Flow', () => {
    test('should handle patient intake call from start to finish', async () => {
      // Step 1: Call initiated
      const callInitiated = await webhookHandler.handleWebhook('call.initiated', {
        industry: 'healthcare',
        scenario: 'patient_intake',
        language: 'en-US',
        complianceType: 'hipaa',
        data: {
          call_control_id: 'call_123',
          from: '+1234567890',
          to: '+1-800-596-3057'
        }
      });

      expect(callInitiated).toContain('Welcome to TETRIX Healthcare');
      expect(callInitiated).toContain('Press 1 for patient inquiries');
      expect(callInitiated).toContain('Gather input="speech dtmf"');

      // Step 2: Patient presses 1 for patient services
      const patientServices = await webhookHandler.handleWebhook('call.gather.ended', {
        industry: 'healthcare',
        scenario: 'patient_intake',
        data: {
          call_control_id: 'call_123',
          from: '+1234567890',
          to: '+1-800-596-3057',
          digits: '1'
        }
      });

      expect(patientServices).toContain('+1-800-596-3057');
      expect(patientServices).toContain('patient services team');
      expect(patientServices).toContain('medical record purposes');
      expect(patientServices).toContain('record-from-answer');
    });

    test('should handle provider support call flow', async () => {
      // Step 1: Call initiated
      const callInitiated = await webhookHandler.handleWebhook('call.initiated', {
        industry: 'healthcare',
        scenario: 'provider_support',
        language: 'en-US',
        complianceType: 'hipaa'
      });

      expect(callInitiated).toContain('Welcome to TETRIX Healthcare');

      // Step 2: Provider presses 2 for provider support
      const providerSupport = await webhookHandler.handleWebhook('call.gather.ended', {
        industry: 'healthcare',
        scenario: 'provider_support',
        data: { digits: '2' }
      });

      expect(providerSupport).toContain('+1-888-804-6762');
      expect(providerSupport).toContain('provider support team');
      expect(providerSupport).toContain('healthcare specialist');
    });

    test('should handle emergency consultation call flow', async () => {
      // Step 1: Emergency call initiated
      const emergencyCall = await webhookHandler.handleWebhook('call.initiated', {
        industry: 'healthcare',
        scenario: 'emergency_consultation',
        language: 'en-US',
        complianceType: 'hipaa'
      });

      expect(emergencyCall).toContain('Welcome to TETRIX Healthcare');

      // Step 2: Emergency caller presses 0
      const emergencyResponse = await webhookHandler.handleWebhook('call.gather.ended', {
        industry: 'healthcare',
        scenario: 'emergency_consultation',
        data: { digits: '0' }
      });

      expect(emergencyResponse).toContain('+1-800-596-3057');
      expect(emergencyResponse).toContain('emergency assistance');
      expect(emergencyResponse).toContain('emergency coordinator');
    });
  });

  describe('Complete Legal Call Flow', () => {
    test('should handle client intake call flow', async () => {
      const legalConfig = {
        ...config,
        industry: 'legal',
        complianceLevel: 'attorney_client_privilege'
      };
      const legalWebhookHandler = new TeXMLWebhookHandler(legalConfig);

      // Step 1: Legal call initiated
      const callInitiated = await legalWebhookHandler.handleWebhook('call.initiated', {
        industry: 'legal',
        scenario: 'client_intake',
        language: 'en-US',
        complianceType: 'attorney_client_privilege'
      });

      expect(callInitiated).toContain('Welcome to TETRIX Legal Services');
      expect(callInitiated).toContain('Press 1 for client services');

      // Step 2: Client presses 1 for client services
      const clientServices = await legalWebhookHandler.handleWebhook('call.gather.ended', {
        industry: 'legal',
        scenario: 'client_intake',
        data: { digits: '1' }
      });

      expect(clientServices).toContain('+1-800-596-3057');
      expect(clientServices).toContain('legal services');
      expect(clientServices).toContain('attorney-client privilege');
    });

    test('should handle urgent legal matters call flow', async () => {
      const legalConfig = {
        ...config,
        industry: 'legal',
        complianceLevel: 'attorney_client_privilege'
      };
      const legalWebhookHandler = new TeXMLWebhookHandler(legalConfig);

      // Step 1: Urgent legal call
      const urgentCall = await legalWebhookHandler.handleWebhook('call.initiated', {
        industry: 'legal',
        scenario: 'urgent_legal',
        language: 'en-US',
        complianceType: 'attorney_client_privilege'
      });

      expect(urgentCall).toContain('Welcome to TETRIX Legal Services');

      // Step 2: Urgent caller presses 0
      const urgentResponse = await legalWebhookHandler.handleWebhook('call.gather.ended', {
        industry: 'legal',
        scenario: 'urgent_legal',
        data: { digits: '0' }
      });

      expect(urgentResponse).toContain('+1-800-596-3057');
      expect(urgentResponse).toContain('urgent legal matters');
      expect(urgentResponse).toContain('emergency attorney');
    });
  });

  describe('Complete Fleet Management Call Flow', () => {
    test('should handle driver emergency call flow', async () => {
      const fleetConfig = {
        ...config,
        industry: 'fleet',
        complianceLevel: 'fleet_management'
      };
      const fleetWebhookHandler = new TeXMLWebhookHandler(fleetConfig);

      // Step 1: Fleet emergency call initiated
      const emergencyCall = await fleetWebhookHandler.handleWebhook('call.initiated', {
        industry: 'fleet',
        scenario: 'driver_emergency',
        language: 'en-US',
        complianceType: 'fleet_management'
      });

      expect(emergencyCall).toContain('Welcome to TETRIX Fleet Management');
      expect(emergencyCall).toContain('Press 0 for emergency dispatch');

      // Step 2: Driver presses 0 for emergency
      const emergencyResponse = await fleetWebhookHandler.handleWebhook('call.gather.ended', {
        industry: 'fleet',
        scenario: 'driver_emergency',
        data: { digits: '0' }
      });

      expect(emergencyResponse).toContain('+1-800-596-3057');
      expect(emergencyResponse).toContain('emergency dispatch');
      expect(emergencyResponse).toContain('emergency coordinator');
    });

    test('should handle vehicle tracking call flow', async () => {
      const fleetConfig = {
        ...config,
        industry: 'fleet',
        complianceLevel: 'fleet_management'
      };
      const fleetWebhookHandler = new TeXMLWebhookHandler(fleetConfig);

      // Step 1: Fleet call initiated
      const callInitiated = await fleetWebhookHandler.handleWebhook('call.initiated', {
        industry: 'fleet',
        scenario: 'vehicle_tracking',
        language: 'en-US',
        complianceType: 'fleet_management'
      });

      expect(callInitiated).toContain('Welcome to TETRIX Fleet Management');

      // Step 2: Manager presses 2 for vehicle tracking
      const trackingResponse = await fleetWebhookHandler.handleWebhook('call.gather.ended', {
        industry: 'fleet',
        scenario: 'vehicle_tracking',
        data: { digits: '2' }
      });

      expect(trackingResponse).toContain('+1-888-804-6762');
      expect(trackingResponse).toContain('vehicle tracking');
      expect(trackingResponse).toContain('tracking specialist');
    });
  });

  describe('Multi-Language Call Flows', () => {
    test('should handle Spanish healthcare call flow', async () => {
      const spanishConfig = {
        ...config,
        language: 'es-ES'
      };
      const spanishWebhookHandler = new TeXMLWebhookHandler(spanishConfig);

      const callInitiated = await spanishWebhookHandler.handleWebhook('call.initiated', {
        industry: 'healthcare',
        scenario: 'patient_intake',
        language: 'es-ES',
        complianceType: 'hipaa'
      });

      expect(callInitiated).toContain('language="es-ES"');
      expect(callInitiated).toContain('Welcome to TETRIX Healthcare');
    });

    test('should handle French legal call flow', async () => {
      const frenchConfig = {
        ...config,
        industry: 'legal',
        language: 'fr-FR'
      };
      const frenchWebhookHandler = new TeXMLWebhookHandler(frenchConfig);

      const callInitiated = await frenchWebhookHandler.handleWebhook('call.initiated', {
        industry: 'legal',
        scenario: 'client_intake',
        language: 'fr-FR',
        complianceType: 'attorney_client_privilege'
      });

      expect(callInitiated).toContain('language="fr-FR"');
      expect(callInitiated).toContain('Welcome to TETRIX Legal Services');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle invalid DTMF input', async () => {
      const invalidInput = await webhookHandler.handleWebhook('call.gather.ended', {
        industry: 'healthcare',
        scenario: 'patient_intake',
        data: { digits: '9' } // Invalid option
      });

      expect(invalidInput).toContain('Invalid selection');
      expect(invalidInput).toContain('<Redirect>');
    });

    test('should handle missing DTMF input', async () => {
      const noInput = await webhookHandler.handleWebhook('call.gather.ended', {
        industry: 'healthcare',
        scenario: 'patient_intake',
        data: { digits: '' } // No input
      });

      expect(noInput).toContain('Invalid selection');
      expect(noInput).toContain('<Redirect>');
    });

    test('should handle call hangup gracefully', async () => {
      const hangup = await webhookHandler.handleWebhook('call.hangup', {
        industry: 'healthcare',
        scenario: 'patient_intake',
        data: { call_control_id: 'call_123' }
      });

      expect(hangup).toContain('<Hangup/>');
    });

    test('should handle unknown event types', async () => {
      const unknownEvent = await webhookHandler.handleWebhook('unknown.event', {
        industry: 'healthcare',
        scenario: 'patient_intake'
      });

      expect(unknownEvent).toContain('Welcome to TETRIX Healthcare');
      expect(unknownEvent).toContain('time-based routing');
    });
  });

  describe('Call Recording and Compliance', () => {
    test('should include proper recording configuration for healthcare calls', async () => {
      const healthcareCall = await webhookHandler.handleWebhook('call.initiated', {
        industry: 'healthcare',
        scenario: 'patient_intake',
        complianceType: 'hipaa'
      });

      expect(healthcareCall).toContain('record-from-answer');
      expect(healthcareCall).toContain('recordingStatusCallback');
      expect(healthcareCall).toContain('medical record purposes');
    });

    test('should include proper recording configuration for legal calls', async () => {
      const legalConfig = {
        ...config,
        industry: 'legal',
        complianceLevel: 'attorney_client_privilege'
      };
      const legalWebhookHandler = new TeXMLWebhookHandler(legalConfig);

      const legalCall = await legalWebhookHandler.handleWebhook('call.initiated', {
        industry: 'legal',
        scenario: 'client_intake',
        complianceType: 'attorney_client_privilege'
      });

      expect(legalCall).toContain('record-from-answer');
      expect(legalCall).toContain('recordingStatusCallback');
      expect(legalCall).toContain('attorney-client privilege');
    });

    test('should include proper recording configuration for fleet calls', async () => {
      const fleetConfig = {
        ...config,
        industry: 'fleet',
        complianceLevel: 'fleet_management'
      };
      const fleetWebhookHandler = new TeXMLWebhookHandler(fleetConfig);

      const fleetCall = await fleetWebhookHandler.handleWebhook('call.initiated', {
        industry: 'fleet',
        scenario: 'driver_emergency',
        complianceType: 'fleet_management'
      });

      expect(fleetCall).toContain('record-from-answer');
      expect(fleetCall).toContain('recordingStatusCallback');
      expect(fleetCall).toContain('emergency dispatch');
    });
  });

  describe('Time-Based Routing', () => {
    test('should handle business hours routing', async () => {
      // Mock business hours (9 AM - 5 PM)
      const originalDate = Date;
      const mockDate = new Date('2025-01-10T14:00:00Z'); // 2 PM UTC
      global.Date = jest.fn(() => mockDate) as any;
      global.Date.now = jest.fn(() => mockDate.getTime());

      const businessHoursCall = await webhookHandler.handleWebhook('call.initiated', {
        industry: 'healthcare',
        scenario: 'patient_intake'
      });

      expect(businessHoursCall).toContain('Welcome to TETRIX Healthcare');
      expect(businessHoursCall).toContain('Press 1 for patient inquiries');

      // Restore original Date
      global.Date = originalDate;
    });

    test('should handle after-hours routing', async () => {
      // Mock after hours (8 PM)
      const originalDate = Date;
      const mockDate = new Date('2025-01-10T20:00:00Z'); // 8 PM UTC
      global.Date = jest.fn(() => mockDate) as any;
      global.Date.now = jest.fn(() => mockDate.getTime());

      const afterHoursCall = await webhookHandler.handleWebhook('call.initiated', {
        industry: 'healthcare',
        scenario: 'patient_intake'
      });

      expect(afterHoursCall).toContain('offices are currently closed');
      expect(afterHoursCall).toContain('business hours are Monday through Friday');
      expect(afterHoursCall).toContain('Press 0 for emergency assistance');

      // Restore original Date
      global.Date = originalDate;
    });
  });

  describe('Performance and Reliability', () => {
    test('should handle multiple concurrent calls', async () => {
      const promises = Array.from({ length: 10 }, (_, i) => 
        webhookHandler.handleWebhook('call.initiated', {
          industry: 'healthcare',
          scenario: 'patient_intake',
          data: { call_control_id: `call_${i}` }
        })
      );

      const results = await Promise.all(promises);
      
      results.forEach(result => {
        expect(result).toContain('Welcome to TETRIX Healthcare');
        expect(result).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      });
    });

    test('should handle rapid DTMF input changes', async () => {
      // Simulate rapid DTMF input changes
      const dtmfInputs = ['1', '2', '3', '0'];
      
      for (const dtmf of dtmfInputs) {
        const response = await webhookHandler.handleWebhook('call.gather.ended', {
          industry: 'healthcare',
          scenario: 'patient_intake',
          data: { digits: dtmf }
        });

        expect(response).toContain('<?xml version="1.0" encoding="UTF-8"?>');
        expect(response).toContain('<Response>');
      }
    });

    test('should maintain call state across multiple interactions', async () => {
      // Step 1: Call initiated
      const callInitiated = await webhookHandler.handleWebhook('call.initiated', {
        industry: 'healthcare',
        scenario: 'patient_intake',
        data: { call_control_id: 'call_123' }
      });

      expect(callInitiated).toContain('Welcome to TETRIX Healthcare');

      // Step 2: First DTMF input
      const firstInput = await webhookHandler.handleWebhook('call.gather.ended', {
        industry: 'healthcare',
        scenario: 'patient_intake',
        data: { digits: '1', call_control_id: 'call_123' }
      });

      expect(firstInput).toContain('+1-800-596-3057');

      // Step 3: Second DTMF input (should still work)
      const secondInput = await webhookHandler.handleWebhook('call.gather.ended', {
        industry: 'healthcare',
        scenario: 'patient_intake',
        data: { digits: '2', call_control_id: 'call_123' }
      });

      expect(secondInput).toContain('+1-888-804-6762');
    });
  });
});
