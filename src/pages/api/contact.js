import { submitContactForm } from '../../lib/firebase.js';

export async function POST({ request }) {
  try {
    const formData = await request.json();
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.message) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: name, email, and message are required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid email format'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Submit to Firebase
    const result = await submitContactForm(formData);
    
    if (result.success) {
      // Send email notification using Mailgun
      try {
        const emailResponse = await fetch(`${import.meta.env.SITE_URL || 'http://localhost:4323'}/api/contact/notify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            subject: formData.subject || 'Contact Form Submission',
            message: formData.message,
            submissionId: result.id
          })
        });

        if (!emailResponse.ok) {
          console.warn('Email notification failed, but form submission succeeded');
        }
      } catch (emailError) {
        console.warn('Email notification error:', emailError);
        // Don't fail the form submission if email fails
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Thank you for your message! We\'ll get back to you soon.',
        id: result.id
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        error: result.error || 'Failed to submit form'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
} 