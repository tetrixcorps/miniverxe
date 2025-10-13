import type { APIRoute } from 'astro';

// Test Mailgun API connectivity and permissions
export const GET: APIRoute = async ({ request }) => {
  try {
    console.log('Testing Mailgun API connectivity...');
    
    // Test Mailgun API directly
    const mailgun = await import('mailgun-js');
    const mg = mailgun.default({
      apiKey: process.env.MAILGUN_API_KEY || 'your_mailgun_api_key_here',
      domain: process.env.MAILGUN_DOMAIN || 'mg.tetrixcorp.com',
    });
    
    // Test sending a verification email
    const testEmail = 'test@tetrixcorp.com';
    const testResult = await mg.messages().send({
      from: `TETRIX Test <test@${process.env.MAILGUN_DOMAIN || 'mg.tetrixcorp.com'}>`,
      to: testEmail,
      subject: 'TETRIX API Test',
      text: 'This is a test email to verify Mailgun API connectivity and permissions.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">TETRIX</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Enterprise Communication Platform</p>
          </div>
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-top: 0;">API Test Successful!</h2>
            <p style="color: #666; line-height: 1.6;">
              This email confirms that the Mailgun API is working correctly with mg.tetrixcorp.com domain.
            </p>
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              Best regards,<br>
              The TETRIX Development Team
            </p>
          </div>
        </div>
      `
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Mailgun API test completed',
      domain: process.env.MAILGUN_DOMAIN || 'mg.tetrixcorp.com',
      testEmail: {
        sent: true,
        messageId: testResult.id,
        response: testResult.message
      },
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Mailgun API test failed:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

// Send a test notification
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { to, channel, subject, content, customerName, link } = body;

    if (!to || !channel || !content) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: to, channel, content'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await notificationService.sendNotification({
      to,
      channel,
      subject,
      content,
      customerName,
      link
    });

    return new Response(JSON.stringify({
      success: result.success,
      messageId: result.messageId,
      provider: result.provider,
      channel: result.channel,
      error: result.error,
      timestamp: result.timestamp
    }), {
      status: result.success ? 200 : 500,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Notification send failed:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
