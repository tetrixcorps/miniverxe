// Mailgun email notification API for contact form submissions
import mailgun from 'mailgun-js';

export async function POST({ request }) {
  try {
    const { name, email, message, subject, submissionId } = await request.json();
    
    // Get Mailgun configuration from environment
    const mailgunApiKey = import.meta.env.MAILGUN_API_KEY;
    const mailgunDomain = import.meta.env.MAILGUN_DOMAIN || 'mg.tetrixcorp.com';
    const supportEmail = 'support@tetrixcorp.com';
    
    // Validate required environment variables
    if (!mailgunApiKey) {
      console.error('MAILGUN_API_KEY is not configured');
      return new Response(JSON.stringify({
        success: false,
        error: 'Email service not configured'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Initialize Mailgun client
    const mg = mailgun({
      apiKey: mailgunApiKey,
      domain: mailgunDomain
    });
    
    // Email content
    const emailData = {
      from: `TETRIX Contact Form <noreply@${mailgunDomain}>`,
      to: supportEmail,
      subject: `New Contact Form Submission${subject ? ` - ${subject}` : ''}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ff3b30, #ff9500, #ffb300); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Contact Form Submission</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0; border-bottom: 2px solid #ff3b30; padding-bottom: 10px;">Contact Details</h2>
              <p style="margin: 10px 0;"><strong>Name:</strong> ${name}</p>
              <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #ff3b30;">${email}</a></p>
              ${subject ? `<p style="margin: 10px 0;"><strong>Subject:</strong> ${subject}</p>` : ''}
              <p style="margin: 10px 0;"><strong>Submission ID:</strong> ${submissionId}</p>
              <p style="margin: 10px 0;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="color: #333; margin-top: 0; border-bottom: 2px solid #ff9500; padding-bottom: 10px;">Message</h3>
              <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #ff3b30;">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                This email was sent from your TETRIX contact form.<br>
                <a href="${import.meta.env.SITE_URL || 'https://tetrixcorp.com'}/admin/contact-submissions" 
                   style="color: #ff3b30; text-decoration: none;">View in Admin Panel</a>
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
New Contact Form Submission

Contact Details:
- Name: ${name}
- Email: ${email}
${subject ? `- Subject: ${subject}` : ''}
- Submission ID: ${submissionId}
- Date: ${new Date().toLocaleString()}

Message:
${message}

View in Admin Panel: ${import.meta.env.SITE_URL || 'https://tetrixcorp.com'}/admin/contact-submissions
      `
    };
    
    // Send email using Mailgun
    const result = await mg.messages().send(emailData);
    
    console.log('Contact form email sent successfully:', result);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Email notification sent successfully',
      messageId: result.id
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Mailgun email notification error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to send email notification',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
