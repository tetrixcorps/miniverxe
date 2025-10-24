#!/usr/bin/env node

// Contact form testing script
import https from 'https';

async function testContactForm() {
  try {
    console.log('🔍 Testing Contact Form API...\n');
    
    const baseUrl = 'https://tetrix-minimal-uzzxn.ondigitalocean.app';
    
    // Test data
    const testData = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '+1234567890',
      company: 'Test Company',
      subject: 'API Testing',
      message: 'This is a test message to verify the contact form and email notification system is working correctly.',
      consent: true
    };
    
    console.log('📝 Test Data:');
    console.log(`   Name: ${testData.name}`);
    console.log(`   Email: ${testData.email}`);
    console.log(`   Phone: ${testData.phone}`);
    console.log(`   Company: ${testData.company}`);
    console.log(`   Subject: ${testData.subject}`);
    console.log(`   Message: ${testData.message.substring(0, 50)}...`);
    
    console.log('\n🧪 Testing contact form submission...');
    
    // Test contact form submission
    const contactResponse = await makeRequest(`${baseUrl}/api/contact`, 'POST', testData);
    
    if (contactResponse.success) {
      console.log('✅ Contact form submission successful!');
      console.log(`   Submission ID: ${contactResponse.id}`);
      console.log(`   Message: ${contactResponse.message}`);
    } else {
      console.log('❌ Contact form submission failed:');
      console.log(`   Error: ${contactResponse.error}`);
    }
    
    console.log('\n📧 Testing direct email notification...');
    
    // Test direct email notification
    const notifyData = {
      name: 'Direct Test User',
      email: 'direct-test@example.com',
      message: 'This is a direct test of the email notification system.',
      submissionId: 'direct-test-' + Date.now(),
      source: 'api-test'
    };
    
    const notifyResponse = await makeRequest(`${baseUrl}/api/contact/notify`, 'POST', notifyData);
    
    if (notifyResponse.success) {
      console.log('✅ Email notification sent successfully!');
      console.log(`   Message ID: ${notifyResponse.messageId}`);
      console.log(`   Recipient: ${notifyResponse.recipient}`);
      console.log(`   Timestamp: ${notifyResponse.timestamp}`);
    } else {
      console.log('❌ Email notification failed:');
      console.log(`   Error: ${notifyResponse.error}`);
    }
    
    console.log('\n🎉 Contact form testing completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

function makeRequest(url, method, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 30000
    };
    
    const req = https.request(url, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve(parsed);
        } catch (error) {
          resolve({ success: false, error: 'Invalid JSON response', raw: responseData });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.write(postData);
    req.end();
  });
}

// Run the test
testContactForm();
