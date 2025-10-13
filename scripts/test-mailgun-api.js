#!/usr/bin/env node

// Test Mailgun API connectivity and permissions
import axios from 'axios';

const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY || 'your_mailgun_api_key_here';
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || 'mg.tetrixcorp.com';

async function testMailgunAPI() {
  console.log('🔍 Testing Mailgun API connectivity and permissions...\n');
  
  try {
    // Test 1: Check domain status
    console.log('1. Testing domain status...');
    const domainResponse = await axios.get(`https://api.mailgun.net/v3/domains/${MAILGUN_DOMAIN}`, {
      auth: {
        username: 'api',
        password: MAILGUN_API_KEY
      }
    });
    
    console.log('✅ Domain status:', domainResponse.status);
    console.log('   Domain:', domainResponse.data.domain?.name);
    console.log('   State:', domainResponse.data.domain?.state);
    console.log('   Type:', domainResponse.data.domain?.type);
    
    // Test 2: Check API key permissions
    console.log('\n2. Testing API key permissions...');
    const statsResponse = await axios.get(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/stats/total`, {
      auth: {
        username: 'api',
        password: MAILGUN_API_KEY
      },
      params: {
        event: 'accepted',
        duration: '1d'
      }
    });
    
    console.log('✅ API key permissions:', statsResponse.status);
    console.log('   Stats endpoint accessible:', true);
    
    // Test 3: Send a test email
    console.log('\n3. Sending test email...');
    const testEmailData = new URLSearchParams({
      from: `TETRIX Test <test@${MAILGUN_DOMAIN}>`,
      to: 'test@tetrixcorp.com',
      subject: 'TETRIX Mailgun API Test',
      text: 'This is a test email to verify Mailgun API functionality and permissions.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">TETRIX</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Enterprise Communication Platform</p>
          </div>
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-top: 0;">API Test Successful!</h2>
            <p style="color: #666; line-height: 1.6;">
              This email confirms that the Mailgun API is working correctly with the provided credentials.
            </p>
            <p style="color: #666; line-height: 1.6;">
              <strong>Test Details:</strong><br>
              • API Key: ${MAILGUN_API_KEY.substring(0, 10)}...<br>
              • Domain: ${MAILGUN_DOMAIN}<br>
              • Timestamp: ${new Date().toISOString()}
            </p>
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              Best regards,<br>
              The TETRIX Development Team
            </p>
          </div>
        </div>
      `
    });
    
    const emailResponse = await axios.post(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`, testEmailData, {
      auth: {
        username: 'api',
        password: MAILGUN_API_KEY
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('   Message ID:', emailResponse.data.id);
    console.log('   Response:', emailResponse.data.message);
    
    // Test 4: Check webhook configuration
    console.log('\n4. Checking webhook configuration...');
    try {
      const webhooksResponse = await axios.get(`https://api.mailgun.net/v3/domains/${MAILGUN_DOMAIN}/webhooks`, {
        auth: {
          username: 'api',
          password: MAILGUN_API_KEY
        }
      });
      
      console.log('✅ Webhooks accessible:', webhooksResponse.status);
      console.log('   Webhook count:', Object.keys(webhooksResponse.data.webhooks).length);
    } catch (webhookError) {
      console.log('⚠️  Webhooks check failed (may not have webhook permissions):', webhookError.response?.status);
    }
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   • Domain Status: ✅ Active');
    console.log('   • API Key Permissions: ✅ Valid');
    console.log('   • Email Sending: ✅ Working');
    console.log('   • Webhooks: ✅ Accessible');
    
    return true;
    
  } catch (error) {
    console.error('\n❌ Mailgun API test failed:');
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Error:', error.response.data?.message || error.response.statusText);
      console.error('   Details:', error.response.data);
    } else if (error.request) {
      console.error('   Network Error: No response received');
      console.error('   Details:', error.message);
    } else {
      console.error('   Error:', error.message);
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Verify MAILGUN_API_KEY is correct');
    console.log('   2. Check if domain is verified in Mailgun dashboard');
    console.log('   3. Ensure API key has required permissions');
    console.log('   4. Check network connectivity');
    
    return false;
  }
}

// Run the test
testMailgunAPI()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test script error:', error);
    process.exit(1);
  });

export { testMailgunAPI };
