import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { phoneNumber, industry } = body;

    // Validate required fields
    if (!phoneNumber || !industry) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Phone number and industry are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Call the working 2FA endpoint internally
    const baseUrl = 'https://tetrix-minimal-uzzxn.ondigitalocean.app';
    
    try {
      const response = await fetch(`${baseUrl}/api/v2/2fa/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          method: 'sms',
          userAgent: 'TETRIX-Industry-Auth/1.0',
          ipAddress: 'unknown',
          sessionId: 'industry_' + Date.now()
        })
      });

      const result = await response.json();

      if (result.success) {
        return new Response(JSON.stringify({
          success: true,
          sessionId: result.data.verificationId,
          verificationId: result.data.verificationId,
          provider: 'telnyx',
          method: result.data.method,
          expiresIn: result.data.timeoutSecs,
          industry: industry,
          message: 'Industry 2FA verification initiated successfully',
          timestamp: new Date().toISOString()
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        return new Response(JSON.stringify({
          success: false,
          error: result.error || 'Failed to initiate 2FA'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (fetchError) {
      console.error('Error calling 2FA service:', fetchError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to initiate 2FA verification'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('❌ Industry auth initiation failed:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error. Please try again later.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
