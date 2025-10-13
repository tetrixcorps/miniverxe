#!/usr/bin/env node

/**
 * TETRIX Legal Integration Test Script
 * Comprehensive testing for legal APIs and services
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

class LegalTester {
  constructor() {
    this.host = 'localhost';
    this.port = 8080;
    this.apiKey = 'test_legal_api_key_12345';
    this.firmId = 'TEST_FIRM_001';
    this.attorneyId = 'TEST_ATTY_001';
    this.baseUrl = `http://${this.host}:${this.port}/api/v1/legal`;
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      details: [],
    };
    this.testData = {
      clientId: 'TEST_CLIENT_001',
      caseId: 'TEST_CASE_001',
      appointmentId: 'TEST_APT_001',
      documentId: 'TEST_DOC_001',
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
        prefix = `${colors.bright}${colors.blue}⚖️${colors.reset}`;
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

  async testLegalAPIHealth() {
    this.log('\nTesting Legal API Health...', 'info');
    try {
      const options = {
        hostname: this.host,
        port: this.port,
        path: '/api/v1/legal/health',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Legal-Firm-ID': this.firmId,
          'X-Attorney-ID': this.attorneyId,
          'Content-Type': 'application/json',
        },
      };
      const { statusCode, data } = await this.makeHttpRequest(options);

      if (statusCode === 200 && data.status === 'healthy') {
        this.recordResult('Legal API Health Check', 'passed', data);
      } else {
        this.recordResult('Legal API Health Check', 'failed', `Status: ${statusCode}, Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      this.recordResult('Legal API Health Check', 'failed', error.message);
    }
  }

  async testClientIntake() {
    this.log('\nTesting Client Intake...', 'info');
    try {
      const intakeData = {
        intakeId: 'INTAKE_001',
        clientId: this.testData.clientId,
        attorneyId: this.attorneyId,
        practiceArea: 'personal_injury',
        intakeType: 'initial_consultation',
        communicationMethod: 'voice_call',
        clientPhoneNumber: '+1234567890',
        preferredLanguage: 'en-US',
        intakeConfiguration: {
          maxDuration: 1800,
          recordingEnabled: true,
          transcriptionEnabled: true,
          aiPersonality: 'professional_legal',
          confidentialityNotice: true,
        },
      };

      const options = {
        hostname: this.host,
        port: this.port,
        path: '/api/v1/legal/client-intake/initiate',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Legal-Firm-ID': this.firmId,
          'X-Attorney-ID': this.attorneyId,
          'Content-Type': 'application/json',
        },
      };
      const { statusCode, data } = await this.makeHttpRequest(options, intakeData);

      if (statusCode === 200 || statusCode === 201) {
        this.recordResult('Client Intake', 'passed', data);
      } else {
        this.recordResult('Client Intake', 'failed', `Status: ${statusCode}, Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      this.recordResult('Client Intake', 'failed', error.message);
    }
  }

  async testCaseManagement() {
    this.log('\nTesting Case Management...', 'info');
    try {
      const caseData = {
        caseId: this.testData.caseId,
        clientId: this.testData.clientId,
        attorneyId: this.attorneyId,
        caseType: 'personal_injury',
        caseTitle: 'Doe v. ABC Insurance - Motor Vehicle Accident',
        practiceArea: 'personal_injury',
        caseStatus: 'active',
        priority: 'high',
        caseDetails: {
          incidentDate: '2025-01-01T00:00:00.000Z',
          incidentLocation: '123 Main St, New York, NY',
          description: 'Client injured in rear-end collision',
          injuries: ['whiplash', 'back_pain'],
          damages: {
            medicalExpenses: 15000,
            lostWages: 5000,
            propertyDamage: 3000,
          },
        },
        deadlines: [
          {
            description: 'Statute of limitations',
            dueDate: '2027-01-01T00:00:00.000Z',
            priority: 'critical',
          },
        ],
        confidentialityLevel: 'attorney_client_privilege',
      };

      const options = {
        hostname: this.host,
        port: this.port,
        path: '/api/v1/legal/cases',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Legal-Firm-ID': this.firmId,
          'X-Attorney-ID': this.attorneyId,
          'Content-Type': 'application/json',
        },
      };
      const { statusCode, data } = await this.makeHttpRequest(options, caseData);

      if (statusCode === 200 || statusCode === 201) {
        this.recordResult('Case Management', 'passed', data);
      } else {
        this.recordResult('Case Management', 'failed', `Status: ${statusCode}, Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      this.recordResult('Case Management', 'failed', error.message);
    }
  }

  async testDocumentGeneration() {
    this.log('\nTesting Document Generation...', 'info');
    try {
      const documentData = {
        documentId: this.testData.documentId,
        documentType: 'retainer_agreement',
        caseId: this.testData.caseId,
        clientId: this.testData.clientId,
        attorneyId: this.attorneyId,
        templateId: 'retainer_agreement_template',
        documentData: {
          clientName: 'John Doe',
          attorneyName: 'Jane Smith, Esq.',
          firmName: 'Smith & Associates',
          caseDescription: 'Personal injury claim arising from motor vehicle accident',
          feeStructure: {
            type: 'contingency',
            percentage: 33.33,
            expenses: 'client_responsible',
          },
          scopeOfWork: 'Representation in personal injury claim',
          terminationClause: 'Either party may terminate with 30 days notice',
        },
        format: 'pdf',
        watermark: true,
        digitalSignature: true,
      };

      const options = {
        hostname: this.host,
        port: this.port,
        path: '/api/v1/legal/documents/generate',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Legal-Firm-ID': this.firmId,
          'X-Attorney-ID': this.attorneyId,
          'Content-Type': 'application/json',
        },
      };
      const { statusCode, data } = await this.makeHttpRequest(options, documentData);

      if (statusCode === 200 || statusCode === 201) {
        this.recordResult('Document Generation', 'passed', data);
      } else {
        this.recordResult('Document Generation', 'failed', `Status: ${statusCode}, Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      this.recordResult('Document Generation', 'failed', error.message);
    }
  }

  async testLegalResearch() {
    this.log('\nTesting Legal Research...', 'info');
    try {
      const researchData = {
        researchId: 'RES_001',
        attorneyId: this.attorneyId,
        caseId: this.testData.caseId,
        searchQuery: 'rear-end collision negligence standard of care',
        jurisdiction: 'New York',
        practiceArea: 'personal_injury',
        dateRange: {
          startDate: '2020-01-01',
          endDate: '2025-01-01',
        },
        searchFilters: {
          courtLevel: ['appellate', 'supreme'],
          caseType: 'civil',
          relevanceThreshold: 0.8,
        },
      };

      const options = {
        hostname: this.host,
        port: this.port,
        path: '/api/v1/legal/research/search',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Legal-Firm-ID': this.firmId,
          'X-Attorney-ID': this.attorneyId,
          'Content-Type': 'application/json',
        },
      };
      const { statusCode, data } = await this.makeHttpRequest(options, researchData);

      if (statusCode === 200 || statusCode === 201) {
        this.recordResult('Legal Research', 'passed', data);
      } else {
        this.recordResult('Legal Research', 'failed', `Status: ${statusCode}, Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      this.recordResult('Legal Research', 'failed', error.message);
    }
  }

  async testAppointmentScheduling() {
    this.log('\nTesting Appointment Scheduling...', 'info');
    try {
      const appointmentData = {
        appointmentId: this.testData.appointmentId,
        clientId: this.testData.clientId,
        attorneyId: this.attorneyId,
        caseId: this.testData.caseId,
        appointmentType: 'initial_consultation',
        scheduledDate: '2025-01-15T14:00:00.000Z',
        duration: 60,
        location: {
          name: 'Smith & Associates Law Firm',
          address: '123 Legal Plaza, Suite 200, New York, NY 10001',
          room: 'Conference Room A',
          phone: '+1234567890',
        },
        communicationPreferences: {
          reminderMethod: 'voice_call',
          reminderTime: '24_hours',
          confirmationRequired: true,
          preferredLanguage: 'en-US',
        },
        appointmentDetails: {
          purpose: 'Initial consultation for personal injury case',
          preparationRequired: [
            'Bring medical records',
            'Bring police report',
            'Bring insurance information',
          ],
          confidentialityNotice: true,
        },
      };

      const options = {
        hostname: this.host,
        port: this.port,
        path: '/api/v1/legal/appointments/schedule',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Legal-Firm-ID': this.firmId,
          'X-Attorney-ID': this.attorneyId,
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

  async testClientCommunication() {
    this.log('\nTesting Client Communication...', 'info');
    try {
      const communicationData = {
        communicationId: 'COMM_001',
        clientId: this.testData.clientId,
        attorneyId: this.attorneyId,
        caseId: this.testData.caseId,
        communicationType: 'case_update',
        subject: 'Update on Your Personal Injury Case',
        message: 'I wanted to update you on the progress of your personal injury case. We have received the police report and are currently reviewing your medical records. I will schedule a follow-up meeting once we have completed our initial review.',
        deliveryMethod: 'email',
        scheduledTime: '2025-01-14T18:00:00.000Z',
        priority: 'normal',
        confidentialityNotice: true,
        attachments: [
          {
            documentId: 'DOC_002',
            name: 'Case Status Report',
            type: 'pdf',
          },
        ],
      };

      const options = {
        hostname: this.host,
        port: this.port,
        path: '/api/v1/legal/communications/send',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Legal-Firm-ID': this.firmId,
          'X-Attorney-ID': this.attorneyId,
          'Content-Type': 'application/json',
        },
      };
      const { statusCode, data } = await this.makeHttpRequest(options, communicationData);

      if (statusCode === 200 || statusCode === 201) {
        this.recordResult('Client Communication', 'passed', data);
      } else {
        this.recordResult('Client Communication', 'failed', `Status: ${statusCode}, Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      this.recordResult('Client Communication', 'failed', error.message);
    }
  }

  async testTimeTracking() {
    this.log('\nTesting Time Tracking...', 'info');
    try {
      const timeData = {
        timeEntryId: 'TIME_001',
        attorneyId: this.attorneyId,
        caseId: this.testData.caseId,
        clientId: this.testData.clientId,
        date: '2025-01-10',
        startTime: '14:00:00',
        endTime: '15:30:00',
        duration: 90,
        description: 'Client consultation - case strategy discussion',
        activityType: 'client_meeting',
        billable: true,
        hourlyRate: 350,
        totalAmount: 525.0,
        notes: 'Discussed case strategy and next steps with client',
      };

      const options = {
        hostname: this.host,
        port: this.port,
        path: '/api/v1/legal/time-tracking/log',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Legal-Firm-ID': this.firmId,
          'X-Attorney-ID': this.attorneyId,
          'Content-Type': 'application/json',
        },
      };
      const { statusCode, data } = await this.makeHttpRequest(options, timeData);

      if (statusCode === 200 || statusCode === 201) {
        this.recordResult('Time Tracking', 'passed', data);
      } else {
        this.recordResult('Time Tracking', 'failed', `Status: ${statusCode}, Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      this.recordResult('Time Tracking', 'failed', error.message);
    }
  }

  async testBillingInvoicing() {
    this.log('\nTesting Billing & Invoicing...', 'info');
    try {
      const billingData = {
        invoiceId: 'INV_001',
        clientId: this.testData.clientId,
        attorneyId: this.attorneyId,
        caseId: this.testData.caseId,
        billingPeriod: {
          startDate: '2025-01-01',
          endDate: '2025-01-31',
        },
        timeEntries: ['TIME_001', 'TIME_002', 'TIME_003'],
        expenses: [
          {
            description: 'Court filing fee',
            amount: 150.0,
            date: '2025-01-15',
          },
        ],
        paymentTerms: 'Net 30',
        dueDate: '2025-02-28',
      };

      const options = {
        hostname: this.host,
        port: this.port,
        path: '/api/v1/legal/billing/invoices/generate',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Legal-Firm-ID': this.firmId,
          'X-Attorney-ID': this.attorneyId,
          'Content-Type': 'application/json',
        },
      };
      const { statusCode, data } = await this.makeHttpRequest(options, billingData);

      if (statusCode === 200 || statusCode === 201) {
        this.recordResult('Billing & Invoicing', 'passed', data);
      } else {
        this.recordResult('Billing & Invoicing', 'failed', `Status: ${statusCode}, Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      this.recordResult('Billing & Invoicing', 'failed', error.message);
    }
  }

  async testWebhookEndpoints() {
    this.log('\nTesting Webhook Endpoints...', 'info');
    try {
      const webhookData = {
        eventType: 'case.created',
        clientId: this.testData.clientId,
        attorneyId: this.attorneyId,
        firmId: this.firmId,
        data: {
          caseId: this.testData.caseId,
          caseNumber: '2025-PI-001',
          caseType: 'personal_injury',
          caseStatus: 'active',
          priority: 'high',
        },
        timestamp: new Date().toISOString(),
        priority: 'normal',
      };

      const options = {
        hostname: this.host,
        port: this.port,
        path: '/api/v1/legal/webhooks/events',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Legal-Firm-ID': this.firmId,
          'X-Attorney-ID': this.attorneyId,
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

  async testAttorneyClientPrivilege() {
    this.log('\nTesting Attorney-Client Privilege...', 'info');
    try {
      // Test privilege data handling
      const privilegeData = {
        clientId: this.testData.clientId,
        attorneyId: this.attorneyId,
        sensitiveData: 'This is privileged attorney-client communication',
        dataType: 'case_strategy',
      };

      const options = {
        hostname: this.host,
        port: this.port,
        path: '/api/v1/legal/privilege/encrypt',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Legal-Firm-ID': this.firmId,
          'X-Attorney-ID': this.attorneyId,
          'Content-Type': 'application/json',
        },
      };
      const { statusCode, data } = await this.makeHttpRequest(options, privilegeData);

      if (statusCode === 200 && data.encrypted) {
        this.recordResult('Attorney-Client Privilege - Data Encryption', 'passed', data);
      } else {
        this.recordResult('Attorney-Client Privilege - Data Encryption', 'failed', `Status: ${statusCode}, Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      this.recordResult('Attorney-Client Privilege - Data Encryption', 'failed', error.message);
    }
  }

  async testErrorHandling() {
    this.log('\nTesting Error Handling...', 'info');
    try {
      // Test invalid API key
      const options = {
        hostname: this.host,
        port: this.port,
        path: '/api/v1/legal/cases',
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid_api_key',
          'X-Legal-Firm-ID': this.firmId,
          'X-Attorney-ID': this.attorneyId,
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
    console.log(`\n${colors.bright}=== Legal Integration Test Summary ===${colors.reset}`);
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
      console.log(`\n${colors.bright}${colors.green}All legal integration tests passed!${colors.reset}`);
      process.exit(0);
    }
  }

  async runAllTests() {
    this.log(`${colors.bright}⚖️ Starting TETRIX Legal Integration Tests...${colors.reset}`);
    this.log('================================================================');

    await this.testLegalAPIHealth();
    await this.testClientIntake();
    await this.testCaseManagement();
    await this.testDocumentGeneration();
    await this.testLegalResearch();
    await this.testAppointmentScheduling();
    await this.testClientCommunication();
    await this.testTimeTracking();
    await this.testBillingInvoicing();
    await this.testWebhookEndpoints();
    await this.testAttorneyClientPrivilege();
    await this.testErrorHandling();

    // Print Summary
    this.printSummary();
  }
}

// Run the tests
const tester = new LegalTester();
tester.runAllTests().catch(console.error);

export default LegalTester;
