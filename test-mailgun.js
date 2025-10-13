#!/usr/bin/env node

// Simple Mailgun test script
import mailgun from 'mailgun-js';

async function testMailgun() {
  try {
    console.log('🔍 Testing Mailgun Configuration...\n');
    
    // Check environment variables
    const apiKey = process.env.MAILGUN_API_KEY || 'your_mailgun_api_key_here';
    const domain = process.env.MAILGUN_DOMAIN || 'mg.tetrixcorp.com';
    
    console.log(`📧 Domain: ${domain}`);
    console.log(`🔑 API Key: ${apiKey.substring(0, 10)}...`);
    
    if (apiKey === 'your_mailgun_api_key_here') {
      console.log('❌ Error: MAILGUN_API_KEY environment variable not set!');
      console.log('Please set: export MAILGUN_API_KEY="your_actual_api_key"');
      return;
    }
    
    // Initialize Mailgun
    const mg = mailgun({
      apiKey: apiKey,
      domain: domain,
    });
    
    console.log('\n🧪 Testing domain access...');
    
    // Test domain access
    try {
      const domainInfo = await mg.domains().get(domain);
      console.log('✅ Domain access successful!');
      console.log(`   Domain: ${domainInfo.domain.name}`);
      console.log(`   State: ${domainInfo.domain.state}`);
    } catch (error) {
      console.log('❌ Domain access failed:', error.message);
      return;
    }
    
    console.log('\n📤 Testing email send...');
    
    // Test sending email
    const testData = {
      from: `TETRIX Test <test@${domain}>`,
      to: 'support@tetrixcorp.com',
      subject: 'TETRIX Mailgun Test - ' + new Date().toISOString(),
      text: 'This is a test email to verify Mailgun integration is working correctly.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #dc2626 0%, #ea580c 50%, #f59e0b 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">TETRIX</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Enterprise Communication Platform</p>
          </div>
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-top: 0;">✅ Mailgun Test Successful!</h2>
            <p style="color: #666; line-height: 1.6;">
              This email confirms that the Mailgun API is working correctly with ${domain} domain.
            </p>
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              Test completed at: ${new Date().toLocaleString()}<br>
              Best regards,<br>
              The TETRIX Development Team
            </p>
          </div>
        </div>
      `
    };
    
    const result = await mg.messages().send(testData);
    
    console.log('✅ Email sent successfully!');
    console.log(`   Message ID: ${result.id}`);
    console.log(`   Response: ${result.message}`);
    console.log(`   Recipient: support@tetrixcorp.com`);
    
    console.log('\n🎉 Mailgun integration test completed successfully!');
    
  } catch (error) {
    console.error('❌ Mailgun test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testMailgun();
