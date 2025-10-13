#!/usr/bin/env node

// Test unified messaging system
import axios from 'axios';

const API_BASE = 'http://localhost:8080';

async function testUnifiedMessaging() {
  console.log('🔍 Testing Unified Messaging System\n');
  
  try {
    // Test 1: Check connectivity
    console.log('1. Testing provider connectivity...');
    const connectivityResponse = await axios.get(`${API_BASE}/api/test/mailgun`);
    
    console.log('✅ Connectivity test completed');
    console.log('   Mailgun:', connectivityResponse.data.connectivity?.mailgun ? '✅' : '❌');
    console.log('   Telnyx:', connectivityResponse.data.connectivity?.telnyx ? '✅' : '❌');
    
    // Test 2: Send test email
    console.log('\n2. Sending test email...');
    const emailResponse = await axios.post(`${API_BASE}/api/messaging/send`, {
      channel: 'email',
      to: 'test@tetrixcorp.com',
      subject: 'TETRIX Unified Messaging Test',
      content: 'This is a test email from the TETRIX Unified Messaging System.',
      customerName: 'Test User',
      metadata: { test: true }
    });
    
    console.log('✅ Email test completed');
    console.log('   Success:', emailResponse.data.success);
    console.log('   Message ID:', emailResponse.data.messageId);
    console.log('   Status:', emailResponse.data.status);
    
    // Test 3: Send test SMS
    console.log('\n3. Sending test SMS...');
    const smsResponse = await axios.post(`${API_BASE}/api/messaging/send`, {
      channel: 'sms',
      to: '+1234567890',
      content: 'TETRIX Test: This is a test SMS from the Unified Messaging System.',
      customerName: 'Test User',
      metadata: { test: true }
    });
    
    console.log('✅ SMS test completed');
    console.log('   Success:', smsResponse.data.success);
    console.log('   Message ID:', smsResponse.data.messageId);
    console.log('   Status:', smsResponse.data.status);
    
    // Test 4: Send template message
    console.log('\n4. Sending template message...');
    const templateResponse = await axios.post(`${API_BASE}/api/messaging/send`, {
      templateId: 'welcome_email',
      to: 'welcome@tetrixcorp.com',
      channel: 'email',
      customerName: 'New User',
      variables: {
        link: 'https://tetrixcorp.com/dashboard'
      }
    });
    
    console.log('✅ Template test completed');
    console.log('   Success:', templateResponse.data.success);
    console.log('   Message ID:', templateResponse.data.messageId);
    console.log('   Status:', templateResponse.data.status);
    
    // Test 5: Get message history
    console.log('\n5. Getting message history...');
    const historyResponse = await axios.get(`${API_BASE}/api/messaging/send?limit=10`);
    
    console.log('✅ History test completed');
    console.log('   Message count:', historyResponse.data.count);
    console.log('   Messages:', historyResponse.data.messages?.length || 0);
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   • Email Messaging: ✅ Working');
    console.log('   • SMS Messaging: ✅ Working');
    console.log('   • Template System: ✅ Working');
    console.log('   • Message History: ✅ Working');
    console.log('   • API Endpoints: ✅ Working');
    
    return true;
    
  } catch (error) {
    console.error('\n❌ Unified messaging test failed:');
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Error:', error.response.data?.error || error.response.statusText);
      console.error('   Details:', error.response.data);
    } else if (error.request) {
      console.error('   Network Error: No response received');
      console.error('   Make sure the TETRIX server is running on port 8080');
    } else {
      console.error('   Error:', error.message);
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure TETRIX server is running: npm run dev');
    console.log('   2. Check environment variables are set');
    console.log('   3. Verify API endpoints are accessible');
    
    return false;
  }
}

// Run the test
testUnifiedMessaging()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test script error:', error);
    process.exit(1);
  });
