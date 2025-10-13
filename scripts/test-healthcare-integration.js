#!/usr/bin/env node

/**
 * TETRIX Healthcare Integration Test Script
 * Comprehensive testing for healthcare APIs and services
 */

import https from 'https';
import http from 'http';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',

  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',

  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
};

class HealthcareTester {
  constructor() {
    this.host = 'localhost';
    this.port = 8080;
    this.apiKey = 'test_healthcare_api_key_12345';
    this.providerId = 'TEST_PROV_001';
    this.facilityId = 'TEST_FAC_001';
    this.baseUrl = `http://${this.host}:${this.port}/api/v1/healthcare`;
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      details: [],
    };
    this.testData = {
      patientId: 'TEST_PAT_001',
      memberId: 'TEST_INS_123456789',
      appointmentId: 'TEST_APT_001',
      prescriptionId: 'TEST_RX_001',
    };
  }

  log(message, type = 'info') {
    let prefix = '';
    switch (type) {
      case 'info':
        prefix = `${colors.blue}🔍${colors.reset}`;
        break;
      case 'success':
        prefix = `${colors.green}✅${colors.reset}`;
        break;
      case 'fail':
        prefix = `${colors.red}❌${colors.reset}`;
        break;
      case 'warn':
        prefix = `${colors.yellow}⚠️ ${colors.reset}`;
        break;
      case 'header':
        prefix = `${colors.bright}${colors.blue}🏥${colors.reset}`;
        break;
      case 'subheader':
        prefix = `${colors.bright}${colors.blue}📊${colors.reset}`;
        break;
    }
    console.log(`${prefix} ${message}`);
  }

  recordResult(testName, status, message = '') {
    this.results.total++;
    if (status === 'passed') {
      this.results.passed++;
      this.log(`${testName} (${status})`, 'success');
    } else if (status === 'failed') {
      this.results.failed++;
      this.log(`${testName} (${status})`, 'fail');
      if (message) {
        this.log(`   Response: ${message}`, 'fail');
      }
    } else if (status === 'skipped') {
      this.results.skipped++;
      this.log(`${testName} (${status})`, 'warn');
    }
    this.results.details.push({ testName, status, message });
  }

  makeHttpRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
      const client = options.port === 443 || options.protocol === 'https:' ? https : http;
      const req = client.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ statusCode: res.statusCode, data }); // Return raw data if not JSON
          }
        });
      });

      req.on('error', (e) => reject(e));

      if (postData) {
        req.write(JSON.stringify(postData));
      }
      req.end();
    });
  }

  async testHealthcareAPIHealth() {
    this.log('\nTesting Healthcare API Health...', 'info');
    try {
      const options = {
        hostname: this.host,
        port: this.port,
        path: '/api/v1/healthcare/health',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Healthcare-Provider-ID': this.providerId,
          'X-Healthcare-Facility-ID': this.facilityId,
          'Content-Type': 'application/json',
        },
      };
      const { statusCode, data } = await this.makeHttpRequest(options);

      if (statusCode === 200 && data.status === 'healthy') {
        this.recordResult('Healthcare API Health Check', 'passed', data);
      } else {
        this.recordResult('Healthcare API Health Check', 'failed', `Status: ${statusCode}, Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      this.recordResult('Healthcare API Health Check', 'failed', error.message);
    }
  }

  async testBenefitVerification() {
    this.log('\nTesting Benefit Verification...', 'info');
    try {
      const benefitData = {
        verificationId: 'BEN_VER_001',
        patientId: this.testData.patientId,
        memberId: this.testData.memberId,
        providerId: this.providerId,
        serviceCodes: ['99213', '99214'],
        diagnosisCodes: ['Z00.00', 'I10'],
        verificationType: 'standard',
        urgency: 'normal',
        additionalInfo: {
          dateOfBirth: '1980-01-15',
          lastName: 'Doe',
          groupNumber: 'GRP001',
        },
      };

      const options = {
        hostname: this.host,
        port: this.port,
        path: '/api/v1/healthcare/benefits/verify',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Healthcare-Provider-ID': this.providerId,
          'X-Healthcare-Facility-ID': this.facilityId,
          'Content-Type': 'application/json',
        },
      };
      const { statusCode, data } = await this.makeHttpRequest(options, benefitData);

      if (statusCode === 200 || statusCode === 201) {
        this.recordResult('Benefit Verification', 'passed', data);
      } else {
        this.recordResult('Benefit Verification', 'failed', `Status: ${statusCode}, Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      this.recordResult('Benefit Verification', 'failed', error.message);
    }
  }

  async testPriorAuthorization() {
    this.log('\nTesting Prior Authorization...', 'info');
    try {
      const priorAuthData = {
        requestId: 'PA_001',
        patientId: this.testData.patientId,
        providerId: this.providerId,
        serviceRequested: {
          procedureCode: '99213',
          description: 'Office visit, established patient',
          diagnosisCode: 'I10',
          diagnosisDescription: 'Essential hypertension',
          requestedDate: '2025-01-15T00:00:00.000Z',
          quantity: 1,
        },
        clinicalJustification: 'Patient requires ongoing management of hypertension',
        urgency: 'standard',
        supportingDocuments: [
          {
            documentType: 'clinical_notes',
            documentId: 'DOC_001',
            url: 'https://your-system.com/documents/DOC_001',
            description: 'Clinical notes from last visit',
          },
        ],
        insuranceInfo: {
          memberId: this.testData.memberId,
          groupNumber: 'GRP001',
          insuranceProvider: 'Blue Cross Blue Shield',
        },
      };

      const options = {
        hostname: this.host,
        port: this.port,
        path: '/api/v1/healthcare/prior-auth/submit',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Healthcare-Provider-ID': this.providerId,
          'X-Healthcare-Facility-ID': this.facilityId,
          'Content-Type': 'application/json',
        },
      };
      const { statusCode, data } = await this.makeHttpRequest(options, priorAuthData);

      if (statusCode === 200 || statusCode === 201) {
        this.recordResult('Prior Authorization Submission', 'passed', data);
      } else {
        this.recordResult('Prior Authorization Submission', 'failed', `Status: ${statusCode}, Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      this.recordResult('Prior Authorization Submission', 'failed', error.message);
    }
  }

  async testPrescriptionFollowUp() {
    this.log('\nTesting Prescription Follow-up...', 'info');
    try {
      const followUpData = {
        followUpId: 'FU_001',
        patientId: this.testData.patientId,
        prescriptionId: this.testData.prescriptionId,
        medication: {
          name: 'Lisinopril 10mg',
          ndc: '68180-123-01',
          quantity: 30,
          refills: 3,
          instructions: 'Take once daily with or without food',
        },
        followUpType: 'adherence_check',
        scheduledDate: '2025-01-20T00:00:00.000Z',
        communicationPreferences: {
          method: 'voice_call',
          timeOfDay: 'morning',
          phoneNumber: '+1234567890',
          preferredLanguage: 'en-US',
        },
        questions: [
          'How are you feeling on the new medication?',
          'Are you experiencing any side effects?',
          'Are you taking the medication as prescribed?',
          'Do you have any questions about your medication?',
        ],
        providerId: this.providerId,
        pharmacyInfo: {
          name: 'CVS Pharmacy',
          phone: '+1234567890',
          address: '123 Main St, New York, NY 10001',
        },
      };

      const options = {
        hostname: this.host,
        port: this.port,
        path: '/api/v1/healthcare/prescriptions/follow-up',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Healthcare-Provider-ID': this.providerId,
          'X-Healthcare-Facility-ID': this.facilityId,
          'Content-Type': 'application/json',
        },
      };
      const { statusCode, data } = await this.makeHttpRequest(options, followUpData);

      if (statusCode === 200 || statusCode === 201) {
        this.recordResult('Prescription Follow-up', 'passed', data);
      } else {
        this.recordResult('Prescription Follow-up', 'failed', `Status: ${statusCode}, Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      this.recordResult('Prescription Follow-up', 'failed', error.message);
    }
  }

  async testAppointmentScheduling() {
    this.log('\nTesting Appointment Scheduling...', 'info');
    try {
      const appointmentData = {
        appointmentId: this.testData.appointmentId,
        patientId: this.testData.patientId,
        providerId: this.providerId,
        appointmentType: 'follow_up',
        scheduledDate: '2025-01-15T14:00:00.000Z',
        duration: 30,
        location: {
          name: 'Main Clinic',
          address: '123 Medical Center Dr, New York, NY 10001',
          room: 'Room 205',
          phone: '+1234567890',
        },
        communicationPreferences: {
          reminderMethod: 'voice_call',
          reminderTime: '24_hours',
          confirmationRequired: true,
          preferredLanguage: 'en-US',
        },
        appointmentDetails: {
          reason: 'Hypertension follow-up',
          notes: 'Patient doing well on current medication',
          priority: 'normal',
        },
      };

      const options = {
        hostname: this.host,
        port: this.port,
        path: '/api/v1/healthcare/appointments/schedule',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Healthcare-Provider-ID': this.providerId,
          'X-Healthcare-Facility-ID': this.facilityId,
          'Content-Type': 'application/json',
        },
      };
      const { statusCode, data } = await this.makeHttpRequest(options, appointmentData);

      if (statusCode === 200 || statusCode === 201) {
        this.recordResult('Appointment Scheduling', 'passed', data);
      } else {
        this.recordResult('Appointment Scheduling', 'failed', `Status: ${statusCode}, Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      this.recordResult('Appointment Scheduling', 'failed', error.message);
    }
  }

  async testPatientCommunication() {
    this.log('\nTesting Patient Communication...', 'info');
    try {
      const communicationData = {
        communicationId: 'COMM_001',
        patientId: this.testData.patientId,
        communicationType: 'appointment_reminder',
        message: 'This is a reminder for your appointment with Dr. Smith on January 15th at 2:00 PM at Main Clinic, Room 205.',
        deliveryMethod: 'voice_call',
        scheduledTime: '2025-01-14T18:00:00.000Z',
        priority: 'normal',
        communicationPreferences: {
          preferredLanguage: 'en-US',
          timeOfDay: 'evening',
          retryAttempts: 3,
        },
      };

      const options = {
        hostname: this.host,
        port: this.port,
        path: '/api/v1/healthcare/communications/send',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Healthcare-Provider-ID': this.providerId,
          'X-Healthcare-Facility-ID': this.facilityId,
          'Content-Type': 'application/json',
        },
      };
      const { statusCode, data } = await this.makeHttpRequest(options, communicationData);

      if (statusCode === 200 || statusCode === 201) {
        this.recordResult('Patient Communication', 'passed', data);
      } else {
        this.recordResult('Patient Communication', 'failed', `Status: ${statusCode}, Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      this.recordResult('Patient Communication', 'failed', error.message);
    }
  }

  async testEHRIntegration() {
    this.log('\nTesting EHR Integration...', 'info');
    try {
      const ehrData = {
        syncId: 'SYNC_001',
        sourceSystem: 'epic',
        syncType: 'full',
        patientData: {
          patientId: this.testData.patientId,
          demographics: {
            firstName: 'John',
            lastName: 'Doe',
            dateOfBirth: '1980-01-15',
            gender: 'male',
            phoneNumber: '+1234567890',
            email: 'john.doe@email.com',
            address: {
              street: '123 Main St',
              city: 'New York',
              state: 'NY',
              zipCode: '10001',
            },
          },
          insurance: {
            provider: 'Blue Cross Blue Shield',
            memberId: this.testData.memberId,
            groupNumber: 'GRP001',
            effectiveDate: '2024-01-01',
            primary: true,
          },
          medicalHistory: {
            allergies: ['Penicillin'],
            chronicConditions: ['Hypertension'],
            medications: ['Lisinopril 10mg'],
            lastVisit: '2025-01-01T00:00:00.000Z',
          },
        },
        lastSyncDate: '2025-01-09T00:00:00.000Z',
      };

      const options = {
        hostname: this.host,
        port: this.port,
        path: '/api/v1/healthcare/integration/patients/sync',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Healthcare-Provider-ID': this.providerId,
          'X-Healthcare-Facility-ID': this.facilityId,
          'Content-Type': 'application/json',
        },
      };
      const { statusCode, data } = await this.makeHttpRequest(options, ehrData);

      if (statusCode === 200 || statusCode === 201) {
        this.recordResult('EHR Integration', 'passed', data);
      } else {
        this.recordResult('EHR Integration', 'failed', `Status: ${statusCode}, Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      this.recordResult('EHR Integration', 'failed', error.message);
    }
  }

  async testClinicalDataExchange() {
    this.log('\nTesting Clinical Data Exchange...', 'info');
    try {
      const clinicalData = {
        dataId: 'CLIN_001',
        patientId: this.testData.patientId,
        providerId: this.providerId,
        dataType: 'lab_results',
        data: {
          testName: 'Complete Blood Count',
          testDate: '2025-01-10T08:00:00.000Z',
          results: {
            hemoglobin: {
              value: '14.2',
              unit: 'g/dL',
              referenceRange: '12.0-16.0',
              status: 'normal',
            },
            hematocrit: {
              value: '42.1',
              unit: '%',
              referenceRange: '36.0-46.0',
              status: 'normal',
            },
            whiteBloodCells: {
              value: '7.2',
              unit: 'K/uL',
              referenceRange: '4.5-11.0',
              status: 'normal',
            },
            platelets: {
              value: '285',
              unit: 'K/uL',
              referenceRange: '150-450',
              status: 'normal',
            },
          },
          overallStatus: 'normal',
          labProvider: 'Quest Diagnostics',
          orderingProvider: 'Dr. Smith',
        },
        recipientSystem: 'cerner',
        urgency: 'normal',
        retentionPolicy: '7_years',
      };

      const options = {
        hostname: this.host,
        port: this.port,
        path: '/api/v1/healthcare/integration/clinical/send',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Healthcare-Provider-ID': this.providerId,
          'X-Healthcare-Facility-ID': this.facilityId,
          'Content-Type': 'application/json',
        },
      };
      const { statusCode, data } = await this.makeHttpRequest(options, clinicalData);

      if (statusCode === 200 || statusCode === 201) {
        this.recordResult('Clinical Data Exchange', 'passed', data);
      } else {
        this.recordResult('Clinical Data Exchange', 'failed', `Status: ${statusCode}, Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      this.recordResult('Clinical Data Exchange', 'failed', error.message);
    }
  }

  async testVoiceAgentSession() {
    this.log('\nTesting Voice Agent Session...', 'info');
    try {
      const voiceAgentData = {
        sessionId: 'SESSION_001',
        patientId: this.testData.patientId,
        providerId: this.providerId,
        sessionType: 'benefit_verification',
        communicationMethod: 'voice_call',
        patientPhoneNumber: '+1234567890',
        preferredLanguage: 'en-US',
        sessionConfiguration: {
          maxDuration: 300,
          recordingEnabled: true,
          transcriptionEnabled: true,
          aiPersonality: 'professional_healthcare',
        },
      };

      const options = {
        hostname: this.host,
        port: this.port,
        path: '/api/v1/healthcare/voice-agents/sessions',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Healthcare-Provider-ID': this.providerId,
          'X-Healthcare-Facility-ID': this.facilityId,
          'Content-Type': 'application/json',
        },
      };
      const { statusCode, data } = await this.makeHttpRequest(options, voiceAgentData);

      if (statusCode === 200 || statusCode === 201) {
        this.recordResult('Voice Agent Session', 'passed', data);
      } else {
        this.recordResult('Voice Agent Session', 'failed', `Status: ${statusCode}, Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      this.recordResult('Voice Agent Session', 'failed', error.message);
    }
  }

  async testWebhookEndpoints() {
    this.log('\nTesting Webhook Endpoints...', 'info');
    try {
      const webhookData = {
        eventType: 'benefits.verification_completed',
        patientId: this.testData.patientId,
        providerId: this.providerId,
        facilityId: this.facilityId,
        data: {
          verificationId: 'BEN_VER_001',
          coverageStatus: 'active',
          deductible: 1500,
          copay: 25,
          coinsurance: 20,
          patientResponsibility: 30,
        },
        timestamp: new Date().toISOString(),
        priority: 'high',
        requiresAction: true,
      };

      const options = {
        hostname: this.host,
        port: this.port,
        path: '/api/v1/healthcare/webhooks/events',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Healthcare-Provider-ID': this.providerId,
          'X-Healthcare-Facility-ID': this.facilityId,
          'Content-Type': 'application/json',
        },
      };
      const { statusCode, data } = await this.makeHttpRequest(options, webhookData);

      if (statusCode === 200 || statusCode === 201) {
        this.recordResult('Webhook Endpoints', 'passed', data);
      } else {
        this.recordResult('Webhook Endpoints', 'failed', `Status: ${statusCode}, Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      this.recordResult('Webhook Endpoints', 'failed', error.message);
    }
  }

  async testHIPAACompliance() {
    this.log('\nTesting HIPAA Compliance...', 'info');
    try {
      // Test PHI data handling
      const phiData = {
        patientId: this.testData.patientId,
        sensitiveData: 'This is PHI data that should be encrypted',
        dataType: 'demographics',
      };

      const options = {
        hostname: this.host,
        port: this.port,
        path: '/api/v1/healthcare/phi/encrypt',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Healthcare-Provider-ID': this.providerId,
          'X-Healthcare-Facility-ID': this.facilityId,
          'Content-Type': 'application/json',
        },
      };
      const { statusCode, data } = await this.makeHttpRequest(options, phiData);

      if (statusCode === 200 && data.encrypted) {
        this.recordResult('HIPAA Compliance - PHI Encryption', 'passed', data);
      } else {
        this.recordResult('HIPAA Compliance - PHI Encryption', 'failed', `Status: ${statusCode}, Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      this.recordResult('HIPAA Compliance - PHI Encryption', 'failed', error.message);
    }
  }

  async testErrorHandling() {
    this.log('\nTesting Error Handling...', 'info');
    try {
      // Test invalid API key
      const options = {
        hostname: this.host,
        port: this.port,
        path: '/api/v1/healthcare/benefits/verify',
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid_api_key',
          'X-Healthcare-Provider-ID': this.providerId,
          'X-Healthcare-Facility-ID': this.facilityId,
          'Content-Type': 'application/json',
        },
      };
      const { statusCode, data } = await this.makeHttpRequest(options);

      if (statusCode === 401) {
        this.recordResult('Error Handling - Invalid API Key', 'passed', data);
      } else {
        this.recordResult('Error Handling - Invalid API Key', 'failed', `Status: ${statusCode}, Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      this.recordResult('Error Handling - Invalid API Key', 'failed', error.message);
    }
  }

  printSummary() {
    console.log(`\n${colors.bright}=== Healthcare Integration Test Summary ===${colors.reset}`);
    console.log(`Total Tests: ${this.results.total}`);
    console.log(`${colors.green}Passed: ${this.results.passed}${colors.reset}`);
    console.log(`${colors.red}Failed: ${this.results.failed}${colors.reset}`);
    console.log(`${colors.yellow}Skipped: ${this.results.skipped}${colors.reset}`);

    if (this.results.failed > 0) {
      console.log(`\n${colors.bright}${colors.red}Failed Tests Details:${colors.reset}`);
      this.results.details.forEach((detail) => {
        if (detail.status === 'failed') {
          this.log(`${detail.testName}: ${detail.message}`, 'fail');
        }
      });
      process.exit(1); // Exit with error code if tests failed
    } else {
      console.log(`\n${colors.bright}${colors.green}All healthcare integration tests passed!${colors.reset}`);
      process.exit(0);
    }
  }

  async runAllTests() {
    this.log(`${colors.bright}🏥 Starting TETRIX Healthcare Integration Tests...${colors.reset}`);
    this.log('================================================================');

    await this.testHealthcareAPIHealth();
    await this.testBenefitVerification();
    await this.testPriorAuthorization();
    await this.testPrescriptionFollowUp();
    await this.testAppointmentScheduling();
    await this.testPatientCommunication();
    await this.testEHRIntegration();
    await this.testClinicalDataExchange();
    await this.testVoiceAgentSession();
    await this.testWebhookEndpoints();
    await this.testHIPAACompliance();
    await this.testErrorHandling();

    // Print Summary
    this.printSummary();
  }
}

// Run the tests
const tester = new HealthcareTester();
tester.runAllTests().catch(console.error);

export default HealthcareTester;
