// Test script for Mailgun contact form email functionality
import mailgun from 'mailgun-js';

async function testMailgunContact() {
  console.log('🧪 Testing Mailgun Contact Form Email...\n');
  
  // Check environment variables
  const mailgunApiKey = process.env.MAILGUN_API_KEY;
  const mailgunDomain = process.env.MAILGUN_DOMAIN || 'mg.tetrixcorp.com';
  
  console.log('📋 Configuration:');
  console.log(`   MAILGUN_API_KEY: ${mailgunApiKey ? '✅ Set' : '❌ Not set'}`);
  console.log(`   MAILGUN_DOMAIN: ${mailgunDomain}`);
  console.log('');
  
  if (!mailgunApiKey) {
    console.error('❌ MAILGUN_API_KEY is not set. Please configure it in your environment variables.');
    return;
  }
  
  try {
    // Initialize Mailgun client
    const mg = mailgun({
      apiKey: mailgunApiKey,
      domain: mailgunDomain
    });
    
    console.log('🔧 Testing Mailgun connection...');
    
    // Test domain verification
    try {
      await mg.domains().get(mailgunDomain);
      console.log('✅ Mailgun domain connection successful');
    } catch (domainError) {
      console.log('⚠️  Domain verification failed, but API key might still work');
      console.log(`   Error: ${domainError.message}`);
    }
    
    // Test email sending
    console.log('\n📧 Testing email sending...');
    
    const testEmailData = {
      from: `TETRIX Contact Form Test <noreply@${mailgunDomain}>`,
      to: 'support@tetrixcorp.com',
      subject: 'Test Contact Form Email - Mailgun Integration',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ff3b30, #ff9500, #ffb300); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Test Contact Form Email</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0; border-bottom: 2px solid #ff3b30; padding-bottom: 10px;">Test Details</h2>
              <p style="margin: 10px 0;"><strong>Name:</strong> Test User</p>
              <p style="margin: 10px 0;"><strong>Email:</strong> test@example.com</p>
              <p style="margin: 10px 0;"><strong>Subject:</strong> Test Contact Form Email</p>
              <p style="margin: 10px 0;"><strong>Submission ID:</strong> test-123456</p>
              <p style="margin: 10px 0;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="color: #333; margin-top: 0; border-bottom: 2px solid #ff9500; padding-bottom: 10px;">Test Message</h3>
              <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #ff3b30;">
                This is a test email to verify that the Mailgun integration is working correctly for the TETRIX contact form.
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                This is a test email from your TETRIX contact form system.
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
Test Contact Form Email

Test Details:
- Name: Test User
- Email: test@example.com
- Subject: Test Contact Form Email
- Submission ID: test-123456
- Date: ${new Date().toLocaleString()}

Test Message:
This is a test email to verify that the Mailgun integration is working correctly for the TETRIX contact form.
      `
    };
    
    const result = await mg.messages().send(testEmailData);
    
    console.log('✅ Test email sent successfully!');
    console.log(`   Message ID: ${result.id}`);
    console.log(`   Response: ${result.message}`);
    
    console.log('\n🎉 Mailgun contact form integration is working correctly!');
    console.log('   Check support@tetrixcorp.com for the test email.');
    
  } catch (error) {
    console.error('❌ Mailgun test failed:');
    console.error(`   Error: ${error.message}`);
    
    if (error.message.includes('Forbidden')) {
      console.error('   This usually means the API key is invalid or the domain is not verified.');
    } else if (error.message.includes('Unauthorized')) {
      console.error('   This usually means the API key is incorrect.');
    } else if (error.message.includes('Bad Request')) {
      console.error('   This usually means there is an issue with the email format or domain configuration.');
    }
  }
}

// Run the test
testMailgunContact().catch(console.error);
