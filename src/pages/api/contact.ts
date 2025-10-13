import type { APIRoute } from 'astro';
import { mailgunConfig, validateMailgunConfig, getMailgunAuthHeader } from '../../config/mailgun';

// Webhook signature verification
function verifyWebhookSignature(timestamp: string, token: string, signature: string): boolean {
  if (!mailgunConfig.webhookSigningKey) {
    console.error('MAILGUN_WEBHOOK_SIGNING_KEY not configured');
    return false;
  }

  const crypto = require('crypto');
  const encodedToken = crypto
    .createHmac('sha256', mailgunConfig.webhookSigningKey)
    .update(timestamp + token)
    .digest('hex');

  return encodedToken === signature;
}

// Send email via Mailgun
async function sendEmail(formData: any) {
  if (!mailgunConfig.apiKey) {
    throw new Error('MAILGUN_API_KEY not configured');
  }

  const { name, email, company, subject, message } = formData;

  // Create email content
  const emailData = {
    from: `${name} <${mailgunConfig.fromEmail}>`,
    to: mailgunConfig.contactEmail,
    'h:Reply-To': email,
    subject: `Contact Form: ${subject}`,
    text: `
Name: ${name}
Email: ${email}
Company: ${company || 'Not provided'}
Subject: ${subject}

Message:
${message}

---
This message was sent from the TETRIX contact form.
    `.trim(),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">New Contact Form Submission</h2>
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Company:</strong> ${company || 'Not provided'}</p>
          <p><strong>Subject:</strong> ${subject}</p>
        </div>
        <div style="background: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h3 style="color: #374151; margin-top: 0;">Message:</h3>
          <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
        </div>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          This message was sent from the TETRIX contact form.
        </p>
      </div>
    `.trim()
  };

  // Send email via Mailgun API
  const response = await fetch(`https://api.mailgun.net/v3/${mailgunConfig.domain}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': getMailgunAuthHeader(),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(emailData).toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Mailgun API error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // Debug environment variables
    console.log('Environment variables check:');
    console.log('MAILGUN_API_KEY:', process.env.MAILGUN_API_KEY ? 'SET' : 'NOT SET');
    console.log('MAILGUN_DOMAIN:', process.env.MAILGUN_DOMAIN || 'NOT SET');
    console.log('MAILGUN_WEBHOOK:', process.env.MAILGUN_WEBHOOK ? 'SET' : 'NOT SET');
    
    // Validate Mailgun configuration
    if (!validateMailgunConfig()) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Email service is not properly configured. Please try again later.'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Get form data
    const formData = await request.formData();
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      company: formData.get('company') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    };

    // Validate required fields
    if (!data.name || !data.email || !data.subject || !data.message) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Please fill in all required fields.'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Please enter a valid email address.'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Send email
    await sendEmail(data);

    return new Response(JSON.stringify({
      success: true,
      message: 'Thank you for your message! We\'ll get back to you within 24 hours.'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Contact form error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Sorry, there was an error sending your message. Please try again or contact us directly.'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

// Handle webhook verification (for Mailgun webhooks)
export const GET: APIRoute = async ({ url }) => {
  const timestamp = url.searchParams.get('timestamp');
  const token = url.searchParams.get('token');
  const signature = url.searchParams.get('signature');

  if (timestamp && token && signature) {
    const isValid = verifyWebhookSignature(timestamp, token, signature);
    
    if (isValid) {
      return new Response('OK', { status: 200 });
    } else {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  return new Response('Bad Request', { status: 400 });
};
