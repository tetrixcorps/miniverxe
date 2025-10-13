// Email notification API
// This uses a simple email service (you can replace with your preferred service)

export async function POST({ request }) {
  try {
    const { name, email, message, submissionId } = await request.json();
    
    // Get email configuration from environment
    const adminEmail = import.meta.env.ADMIN_EMAIL || 't.ogunola@tetrixcorp.com';
    const emailServiceUrl = import.meta.env.EMAIL_SERVICE_URL;
    const emailServiceKey = import.meta.env.EMAIL_SERVICE_KEY;
    
    // Email content
    const emailContent = {
      to: adminEmail,
      subject: `New Contact Form Submission - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f97316;">New Contact Form Submission</h2>
          <p><strong>From:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Message:</strong></p>
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 10px 0;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <p><strong>Submission ID:</strong> ${submissionId}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          <hr style="margin: 20px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            This email was sent from your TETRIX contact form. 
            <a href="${import.meta.env.SITE_URL || 'http://localhost:4323'}/admin/contact-submissions">View in Admin Panel</a>
          </p>
        </div>
      `,
      text: `
New Contact Form Submission

From: ${name}
Email: ${email}
Message: ${message}

Submission ID: ${submissionId}
Date: ${new Date().toLocaleString()}

View in Admin Panel: ${import.meta.env.SITE_URL || 'http://localhost:4323'}/admin/contact-submissions
      `
    };

    // If you have an email service configured, send the email
    if (emailServiceUrl && emailServiceKey) {
      const response = await fetch(emailServiceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${emailServiceKey}`
        },
        body: JSON.stringify(emailContent)
      });

      if (!response.ok) {
        throw new Error(`Email service error: ${response.status}`);
      }
    } else {
      // Log the email content for development
      console.log('Email notification (development mode):', {
        to: adminEmail,
        subject: emailContent.subject,
        content: emailContent.text
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Email notification sent'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Email notification error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to send email notification'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
} 