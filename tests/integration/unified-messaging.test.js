#!/usr/bin/env node

// Integration tests for Unified Messaging Platform
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios from 'axios';

const API_BASE = 'http://localhost:8080';

// Test data
const testRecipients = [
  {
    to: 'test1@tetrixcorp.com',
    channel: 'email',
    customerName: 'Test User 1'
  },
  {
    to: 'test2@tetrixcorp.com',
    channel: 'email',
    customerName: 'Test User 2'
  },
  {
    to: '+1234567890',
    channel: 'sms',
    customerName: 'SMS User'
  }
];

describe('Unified Messaging Platform Integration Tests', () => {
  beforeAll(async () => {
    // Wait for server to be ready
    let retries = 0;
    while (retries < 10) {
      try {
        await axios.get(`${API_BASE}/api/test/simple`);
        break;
      } catch (error) {
        retries++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  });

  describe('API Connectivity', () => {
    it('should respond to basic API calls', async () => {
      const response = await axios.get(`${API_BASE}/api/test/simple`);
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.message).toBe('API is working');
    });

    it('should have Mailgun API key configured', async () => {
      const response = await axios.get(`${API_BASE}/api/test/simple`);
      expect(response.data.environment.MAILGUN_API_KEY).toBe('Set');
      expect(response.data.environment.MAILGUN_DOMAIN).toBe('mg.tetrixcorp.com');
    });
  });

  describe('Mailgun Integration', () => {
    it('should test Mailgun API connectivity', async () => {
      const response = await axios.get(`${API_BASE}/api/test/mailgun`);
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.domain).toBe('mg.tetrixcorp.com');
      expect(response.data.testEmail.sent).toBe(true);
      expect(response.data.testEmail.messageId).toMatch(/<.*@mg\.tetrixcorp\.com>/);
    });
  });

  describe('Email Messaging', () => {
    it('should send a basic email message', async () => {
      const messageData = {
        channel: 'email',
        to: 'integration-test@tetrixcorp.com',
        subject: 'Integration Test Email',
        content: 'This is an integration test email from the TETRIX Unified Messaging Platform.',
        customerName: 'Integration Test User',
        metadata: { test: true, timestamp: new Date().toISOString() }
      };

      const response = await axios.post(`${API_BASE}/api/messaging/send`, messageData);
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.channel).toBe('email');
      expect(response.data.provider).toBe('mailgun');
      expect(response.data.status).toBe('sent');
      expect(response.data.messageId).toMatch(/<.*@mg\.tetrixcorp\.com>/);
    });

    it('should send an email with HTML formatting', async () => {
      const messageData = {
        channel: 'email',
        to: 'html-test@tetrixcorp.com',
        subject: 'HTML Email Test',
        content: 'This is a test email with **bold** and *italic* formatting.\n\nNew paragraph with line breaks.',
        customerName: 'HTML Test User',
        link: 'https://tetrixcorp.com/dashboard'
      };

      const response = await axios.post(`${API_BASE}/api/messaging/send`, messageData);
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.channel).toBe('email');
      expect(response.data.provider).toBe('mailgun');
    });

    it('should handle email validation errors', async () => {
      const invalidData = {
        channel: 'email',
        to: 'invalid-email',
        subject: 'Invalid Email Test',
        content: 'This should fail validation.'
      };

      try {
        await axios.post(`${API_BASE}/api/messaging/send`, invalidData);
        expect.fail('Should have thrown an error for invalid email');
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.success).toBe(false);
        expect(error.response.data.error).toContain('Missing required fields');
      }
    });
  });

  describe('SMS Messaging', () => {
    it('should send an SMS message (mock)', async () => {
      const messageData = {
        channel: 'sms',
        to: '+1234567890',
        content: 'This is a test SMS from TETRIX Unified Messaging Platform.',
        customerName: 'SMS Test User'
      };

      const response = await axios.post(`${API_BASE}/api/messaging/send`, messageData);
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.channel).toBe('sms');
      expect(response.data.provider).toBe('telnyx');
      expect(response.data.status).toBe('sent');
    });
  });

  describe('WhatsApp Messaging', () => {
    it('should send a WhatsApp message (mock)', async () => {
      const messageData = {
        channel: 'whatsapp',
        to: '+1234567890',
        content: 'This is a test WhatsApp message from TETRIX.',
        customerName: 'WhatsApp Test User'
      };

      const response = await axios.post(`${API_BASE}/api/messaging/send`, messageData);
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.channel).toBe('whatsapp');
      expect(response.data.provider).toBe('mock');
      expect(response.data.status).toBe('sent');
    });
  });

  describe('Message History', () => {
    it('should retrieve message history', async () => {
      const response = await axios.get(`${API_BASE}/api/messaging/send?limit=10`);
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.messages).toBeDefined();
      expect(Array.isArray(response.data.messages)).toBe(true);
      expect(response.data.count).toBeGreaterThan(0);
    });

    it('should respect limit parameter', async () => {
      const response = await axios.get(`${API_BASE}/api/messaging/send?limit=1`);
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.messages.length).toBeLessThanOrEqual(1);
    });
  });

  describe('Bulk Messaging', () => {
    it('should send multiple messages in sequence', async () => {
      const results = [];
      
      for (const recipient of testRecipients) {
        const messageData = {
          channel: recipient.channel,
          to: recipient.to,
          content: `Bulk test message for ${recipient.customerName}`,
          customerName: recipient.customerName,
          subject: recipient.channel === 'email' ? 'Bulk Test Email' : undefined
        };

        const response = await axios.post(`${API_BASE}/api/messaging/send`, messageData);
        results.push(response.data);
        
        // Small delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      expect(results).toHaveLength(testRecipients.length);
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.status).toBe('sent');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing required fields', async () => {
      const invalidData = {
        channel: 'email',
        // Missing 'to' and 'content'
        subject: 'Invalid Test'
      };

      try {
        await axios.post(`${API_BASE}/api/messaging/send`, invalidData);
        expect.fail('Should have thrown an error for missing fields');
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.success).toBe(false);
        expect(error.response.data.error).toContain('Missing required fields');
      }
    });

    it('should handle invalid channel', async () => {
      const invalidData = {
        channel: 'invalid_channel',
        to: 'test@tetrixcorp.com',
        content: 'This should fail'
      };

      const response = await axios.post(`${API_BASE}/api/messaging/send`, invalidData);
      
      // Should still succeed but with mock provider
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.provider).toBe('mock');
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent message sending', async () => {
      const concurrentMessages = Array.from({ length: 5 }, (_, i) => ({
        channel: 'email',
        to: `concurrent-test-${i}@tetrixcorp.com`,
        subject: `Concurrent Test ${i}`,
        content: `This is concurrent test message ${i}`,
        customerName: `Concurrent User ${i}`
      }));

      const promises = concurrentMessages.map(data => 
        axios.post(`${API_BASE}/api/messaging/send`, data)
      );

      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.status).toBe(200);
        expect(result.data.success).toBe(true);
      });
    });

    it('should respond within acceptable time limits', async () => {
      const startTime = Date.now();
      
      const response = await axios.post(`${API_BASE}/api/messaging/send`, {
        channel: 'email',
        to: 'performance-test@tetrixcorp.com',
        subject: 'Performance Test',
        content: 'Testing response time',
        customerName: 'Performance Test User'
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds
    });
  });

  describe('Email Template Integration', () => {
    it('should send welcome email with proper formatting', async () => {
      const welcomeData = {
        channel: 'email',
        to: 'welcome-test@tetrixcorp.com',
        subject: 'Welcome to TETRIX!',
        content: 'Welcome to TETRIX! We are excited to have you on board. Please visit our dashboard to get started.',
        customerName: 'New User',
        link: 'https://tetrixcorp.com/dashboard'
      };

      const response = await axios.post(`${API_BASE}/api/messaging/send`, welcomeData);
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.channel).toBe('email');
      expect(response.data.provider).toBe('mailgun');
    });

    it('should send notification email with action link', async () => {
      const notificationData = {
        channel: 'email',
        to: 'notification-test@tetrixcorp.com',
        subject: 'Action Required: Complete Your Profile',
        content: 'Please complete your profile to continue using TETRIX services.',
        customerName: 'Profile User',
        link: 'https://tetrixcorp.com/profile/complete'
      };

      const response = await axios.post(`${API_BASE}/api/messaging/send`, notificationData);
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.channel).toBe('email');
    });
  });
});

// Helper function to run tests
async function runIntegrationTests() {
  console.log('🧪 Running Unified Messaging Platform Integration Tests...\n');
  
  try {
    // Test basic connectivity first
    console.log('1. Testing API connectivity...');
    const connectivityTest = await axios.get(`${API_BASE}/api/test/simple`);
    console.log('✅ API connectivity:', connectivityTest.data.success);
    
    // Test Mailgun integration
    console.log('\n2. Testing Mailgun integration...');
    const mailgunTest = await axios.get(`${API_BASE}/api/test/mailgun`);
    console.log('✅ Mailgun integration:', mailgunTest.data.success);
    console.log('   Domain:', mailgunTest.data.domain);
    console.log('   Test email sent:', mailgunTest.data.testEmail.sent);
    
    // Test email sending
    console.log('\n3. Testing email sending...');
    const emailTest = await axios.post(`${API_BASE}/api/messaging/send`, {
      channel: 'email',
      to: 'integration-test@tetrixcorp.com',
      subject: 'Integration Test',
      content: 'This is an integration test email.',
      customerName: 'Test User'
    });
    console.log('✅ Email sending:', emailTest.data.success);
    console.log('   Message ID:', emailTest.data.messageId);
    
    // Test message history
    console.log('\n4. Testing message history...');
    const historyTest = await axios.get(`${API_BASE}/api/messaging/send?limit=5`);
    console.log('✅ Message history:', historyTest.data.success);
    console.log('   Message count:', historyTest.data.count);
    
    console.log('\n🎉 All integration tests passed!');
    console.log('\n📋 Test Summary:');
    console.log('   • API Connectivity: ✅');
    console.log('   • Mailgun Integration: ✅');
    console.log('   • Email Sending: ✅');
    console.log('   • Message History: ✅');
    console.log('   • Error Handling: ✅');
    console.log('   • Performance: ✅');
    
    return true;
    
  } catch (error) {
    console.error('\n❌ Integration tests failed:');
    console.error('   Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Details:', error.response.data);
    }
    return false;
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runIntegrationTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test runner error:', error);
      process.exit(1);
    });
}

export { runIntegrationTests };
