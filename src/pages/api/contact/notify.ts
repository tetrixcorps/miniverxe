import type { APIRoute } from 'astro';

// Contact form notification API using Mailgun
export const POST: APIRoute = async ({ request }) => {
  try {
    const { name, email, phone, company, subject, message, submissionId, timestamp, userAgent, source } = await request.json();
    
    // Validate required fields
    if (!name || !email || !message) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: name, email, and message are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get Mailgun configuration
    const mailgunApiKey = process.env.MAILGUN_API_KEY || 'your_mailgun_api_key_here';
    const mailgunDomain = process.env.MAILGUN_DOMAIN || 'mg.tetrixcorp.com';
    const supportEmail = 'support@tetrixcorp.com';

    // Initialize Mailgun
    const mailgun = await import('mailgun-js');
    const mg = mailgun.default({
      apiKey: mailgunApiKey,
      domain: mailgunDomain,
    });

    // Format the email content
    const emailSubject = `New Contact Form Submission${subject ? ` - ${subject}` : ''} from ${name}`;
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; background: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #dc2626 0%, #ea580c 50%, #f59e0b 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">TETRIX</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 16px;">Enterprise Communication Platform</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px; background: #f8fafc; border-radius: 0 0 8px 8px;">
          <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #1f2937; margin-top: 0; font-size: 24px; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">
              📧 New Contact Form Submission
            </h2>
            
            <!-- Contact Information -->
            <div style="margin: 25px 0;">
              <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 18px;">Contact Information</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #4b5563; width: 120px;">Name:</td>
                  <td style="padding: 8px 0; color: #1f2937;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">Email:</td>
                  <td style="padding: 8px 0; color: #1f2937;">
                    <a href="mailto:${email}" style="color: #dc2626; text-decoration: none;">${email}</a>
                  </td>
                </tr>
                ${phone ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">Phone:</td>
                  <td style="padding: 8px 0; color: #1f2937;">
                    <a href="tel:${phone}" style="color: #dc2626; text-decoration: none;">${phone}</a>
                  </td>
                </tr>
                ` : ''}
                ${company ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">Company:</td>
                  <td style="padding: 8px 0; color: #1f2937;">${company}</td>
                </tr>
                ` : ''}
                ${subject ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">Subject:</td>
                  <td style="padding: 8px 0; color: #1f2937;">${subject}</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            <!-- Message -->
            <div style="margin: 25px 0;">
              <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 18px;">Message</h3>
              <div style="background: #f9fafb; padding: 20px; border-radius: 6px; border-left: 4px solid #dc2626; color: #374151; line-height: 1.6;">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>
            
            <!-- Submission Details -->
            <div style="margin: 25px 0; padding: 20px; background: #f3f4f6; border-radius: 6px;">
              <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 18px;">Submission Details</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 4px 0; font-weight: bold; color: #6b7280; width: 120px;">Submission ID:</td>
                  <td style="padding: 4px 0; color: #374151; font-family: monospace;">${submissionId}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-weight: bold; color: #6b7280;">Date:</td>
                  <td style="padding: 4px 0; color: #374151;">${new Date().toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-weight: bold; color: #6b7280;">Source:</td>
                  <td style="padding: 4px 0; color: #374151;">${source || 'contact-page'}</td>
                </tr>
                ${userAgent ? `
                <tr>
                  <td style="padding: 4px 0; font-weight: bold; color: #6b7280;">User Agent:</td>
                  <td style="padding: 4px 0; color: #374151; font-size: 12px; word-break: break-all;">${userAgent}</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            <!-- Action Buttons -->
            <div style="margin: 30px 0; text-align: center;">
              <a href="mailto:${email}?subject=Re: ${encodeURIComponent(emailSubject)}" 
                 style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px; display: inline-block;">
                📧 Reply to Customer
              </a>
              <a href="${import.meta.env.SITE_URL || 'http://localhost:4323'}/admin/contact-submissions" 
                 style="background: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                🔍 View in Admin Panel
              </a>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 14px;">
          <p style="margin: 0;">This email was sent from your TETRIX contact form system.</p>
          <p style="margin: 5px 0 0 0;">Please respond to customer inquiries within 24 hours.</p>
        </div>
      </div>
    `;

    const textContent = `
TETRIX - New Contact Form Submission

Contact Information:
- Name: ${name}
- Email: ${email}
${phone ? `- Phone: ${phone}` : ''}
${company ? `- Company: ${company}` : ''}
${subject ? `- Subject: ${subject}` : ''}

Message:
${message}

Submission Details:
- Submission ID: ${submissionId}
- Date: ${new Date().toLocaleString()}
- Source: ${source || 'contact-page'}
${userAgent ? `- User Agent: ${userAgent}` : ''}

Reply to customer: mailto:${email}?subject=Re: ${encodeURIComponent(emailSubject)}
View in Admin Panel: ${import.meta.env.SITE_URL || 'http://localhost:4323'}/admin/contact-submissions

This email was sent from your TETRIX contact form system.
Please respond to customer inquiries within 24 hours.
    `;

    // Send email using Mailgun
    const result = await mg.messages().send({
      from: `TETRIX Contact Form <noreply@${mailgunDomain}>`,
      to: supportEmail,
      subject: emailSubject,
      text: textContent,
      html: htmlContent,
      'h:Reply-To': email, // Set reply-to as customer's email
      'h:X-Mailgun-Tag': 'contact-form',
      'h:X-Mailgun-Variables': JSON.stringify({
        submissionId,
        customerEmail: email,
        customerName: name,
        source: source || 'contact-page'
      })
    });

    console.log(`Contact form notification sent to ${supportEmail}:`, result.id);

    return new Response(JSON.stringify({
      success: true,
      messageId: result.id,
      message: 'Email notification sent successfully',
      recipient: supportEmail,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Contact notification error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to send email notification',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
