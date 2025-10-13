#!/usr/bin/env node

// Integration tests for Unified Messaging Platform
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

class IntegrationTestRunner {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.tests = [];
  }

  async runTest(name, testFn) {
    try {
      console.log(`🧪 Running: ${name}`);
      await testFn();
      console.log(`✅ Passed: ${name}`);
      this.passed++;
      this.tests.push({ name, status: 'passed' });
    } catch (error) {
      console.log(`❌ Failed: ${name}`);
      console.log(`   Error: ${error.message}`);
      this.failed++;
      this.tests.push({ name, status: 'failed', error: error.message });
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Unified Messaging Platform Integration Tests\n');

    // Test 1: API Connectivity
    await this.runTest('API Connectivity', async () => {
      const response = await axios.get(`${API_BASE}/api/test/simple`);
      if (response.status !== 200 || !response.data.success) {
        throw new Error('API not responding correctly');
      }
      if (response.data.environment.MAILGUN_API_KEY !== 'Set') {
        throw new Error('MAILGUN_API_KEY not configured');
      }
      if (response.data.environment.MAILGUN_DOMAIN !== 'mg.tetrixcorp.com') {
        throw new Error('MAILGUN_DOMAIN not set correctly');
      }
    });

    // Test 2: Mailgun Integration
    await this.runTest('Mailgun Integration', async () => {
      const response = await axios.get(`${API_BASE}/api/test/mailgun`);
      if (response.status !== 200 || !response.data.success) {
        throw new Error('Mailgun API test failed');
      }
      if (response.data.domain !== 'mg.tetrixcorp.com') {
        throw new Error('Wrong domain configured');
      }
      if (!response.data.testEmail.sent) {
        throw new Error('Test email not sent');
      }
    });

    // Test 3: Email Messaging
    await this.runTest('Email Messaging', async () => {
      const messageData = {
        channel: 'email',
        to: 'integration-test@tetrixcorp.com',
        subject: 'Integration Test Email',
        content: 'This is an integration test email from the TETRIX Unified Messaging Platform.',
        customerName: 'Integration Test User',
        metadata: { test: true, timestamp: new Date().toISOString() }
      };

      const response = await axios.post(`${API_BASE}/api/messaging/send`, messageData);
      
      if (response.status !== 200 || !response.data.success) {
        throw new Error('Email sending failed');
      }
      if (response.data.channel !== 'email') {
        throw new Error('Wrong channel returned');
      }
      if (response.data.provider !== 'mailgun') {
        throw new Error('Wrong provider returned');
      }
      if (response.data.status !== 'sent') {
        throw new Error('Message not marked as sent');
      }
      if (!response.data.messageId.includes('@mg.tetrixcorp.com')) {
        throw new Error('Invalid message ID format');
      }
    });

    // Test 4: HTML Email Formatting
    await this.runTest('HTML Email Formatting', async () => {
      const messageData = {
        channel: 'email',
        to: 'html-test@tetrixcorp.com',
        subject: 'HTML Email Test',
        content: 'This is a test email with **bold** and *italic* formatting.\n\nNew paragraph with line breaks.',
        customerName: 'HTML Test User',
        link: 'https://tetrixcorp.com/dashboard'
      };

      const response = await axios.post(`${API_BASE}/api/messaging/send`, messageData);
      
      if (response.status !== 200 || !response.data.success) {
        throw new Error('HTML email sending failed');
      }
    });

    // Test 5: SMS Messaging
    await this.runTest('SMS Messaging', async () => {
      const messageData = {
        channel: 'sms',
        to: '+1234567890',
        content: 'This is a test SMS from TETRIX Unified Messaging Platform.',
        customerName: 'SMS Test User'
      };

      const response = await axios.post(`${API_BASE}/api/messaging/send`, messageData);
      
      if (response.status !== 200 || !response.data.success) {
        throw new Error('SMS sending failed');
      }
      if (response.data.channel !== 'sms') {
        throw new Error('Wrong channel for SMS');
      }
      if (response.data.provider !== 'telnyx') {
        throw new Error('Wrong provider for SMS');
      }
    });

    // Test 6: WhatsApp Messaging
    await this.runTest('WhatsApp Messaging', async () => {
      const messageData = {
        channel: 'whatsapp',
        to: '+1234567890',
        content: 'This is a test WhatsApp message from TETRIX.',
        customerName: 'WhatsApp Test User'
      };

      const response = await axios.post(`${API_BASE}/api/messaging/send`, messageData);
      
      if (response.status !== 200 || !response.data.success) {
        throw new Error('WhatsApp sending failed');
      }
      if (response.data.channel !== 'whatsapp') {
        throw new Error('Wrong channel for WhatsApp');
      }
    });

    // Test 7: Message History
    await this.runTest('Message History', async () => {
      const response = await axios.get(`${API_BASE}/api/messaging/send?limit=10`);
      
      if (response.status !== 200 || !response.data.success) {
        throw new Error('Message history retrieval failed');
      }
      if (!Array.isArray(response.data.messages)) {
        throw new Error('Messages not returned as array');
      }
      if (response.data.count < 0) {
        throw new Error('Invalid message count');
      }
    });

    // Test 8: Error Handling
    await this.runTest('Error Handling', async () => {
      const invalidData = {
        channel: 'email',
        // Missing 'to' and 'content'
        subject: 'Invalid Test'
      };

      try {
        await axios.post(`${API_BASE}/api/messaging/send`, invalidData);
        throw new Error('Should have thrown an error for missing fields');
      } catch (error) {
        if (error.response.status !== 400) {
          throw new Error('Wrong status code for validation error');
        }
        if (!error.response.data.error.includes('Missing required fields')) {
          throw new Error('Wrong error message for validation');
        }
      }
    });

    // Test 9: Bulk Messaging
    await this.runTest('Bulk Messaging', async () => {
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

      if (results.length !== testRecipients.length) {
        throw new Error('Not all bulk messages processed');
      }
      
      for (const result of results) {
        if (!result.success || result.status !== 'sent') {
          throw new Error('Bulk message failed');
        }
      }
    });

    // Test 10: Performance Test
    await this.runTest('Performance Test', async () => {
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
      
      if (response.status !== 200 || !response.data.success) {
        throw new Error('Performance test message failed');
      }
      if (responseTime > 5000) {
        throw new Error(`Response time too slow: ${responseTime}ms`);
      }
    });

    // Test 11: Email Template Integration
    await this.runTest('Email Template Integration', async () => {
      const welcomeData = {
        channel: 'email',
        to: 'welcome-test@tetrixcorp.com',
        subject: 'Welcome to TETRIX!',
        content: 'Welcome to TETRIX! We are excited to have you on board. Please visit our dashboard to get started.',
        customerName: 'New User',
        link: 'https://tetrixcorp.com/dashboard'
      };

      const response = await axios.post(`${API_BASE}/api/messaging/send`, welcomeData);
      
      if (response.status !== 200 || !response.data.success) {
        throw new Error('Welcome email template failed');
      }
      if (response.data.channel !== 'email' || response.data.provider !== 'mailgun') {
        throw new Error('Wrong channel/provider for welcome email');
      }
    });

    // Test 12: Concurrent Messaging
    await this.runTest('Concurrent Messaging', async () => {
      const concurrentMessages = Array.from({ length: 3 }, (_, i) => ({
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
      
      if (results.length !== 3) {
        throw new Error('Not all concurrent messages processed');
      }
      
      for (const result of results) {
        if (result.status !== 200 || !result.data.success) {
          throw new Error('Concurrent message failed');
        }
      }
    });

    this.printSummary();
  }

  printSummary() {
    console.log('\n📊 Test Summary');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log(`📈 Total: ${this.passed + this.failed}`);
    console.log(`🎯 Success Rate: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%`);

    if (this.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.tests
        .filter(test => test.status === 'failed')
        .forEach(test => {
          console.log(`   • ${test.name}: ${test.error}`);
        });
    }

    console.log('\n🎉 Integration Tests Completed!');
    
    if (this.failed === 0) {
      console.log('🎊 All tests passed! The Unified Messaging Platform is working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Please review the errors above.');
    }
  }
}

// Run the tests
async function main() {
  const runner = new IntegrationTestRunner();
  await runner.runAllTests();
  process.exit(runner.failed > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});
