import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { sessionId, code, deviceInfo } = body;

    // Validate required fields
    if (!sessionId || !code) {
      return new Response(JSON.stringify({
        success: false,
        verified: false,
        error: 'Session ID and code are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Use the working 2FA service by calling the working endpoint internally
    const baseUrl = process.env.WEBHOOK_BASE_URL || 'https://tetrix-minimal-uzzxn.ondigitalocean.app';
    
    try {
      const response = await fetch(`${baseUrl}/api/v2/2fa/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verificationId: sessionId,
          code: code,
          phoneNumber: deviceInfo?.phoneNumber || 'unknown'
        })
      });

      const result = await response.json();

      if (result.success && result.data?.verified) {
        // Generate mock tokens for industry auth
        const accessToken = `tetrix_access_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const refreshToken = `tetrix_refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const response = new Response(JSON.stringify({
          success: true,
          verified: true,
          message: 'Industry 2FA verification successful',
          accessToken,
          refreshToken,
          dashboardUrl: `/dashboard/${deviceInfo?.industry || 'healthcare'}`,
          industry: deviceInfo?.industry || 'healthcare',
          timestamp: new Date().toISOString()
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

        // Set secure HTTP-only cookies for tokens
        response.headers.set('Set-Cookie',
          `industry_access_token=${accessToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=1800; Path=/`
        );
        response.headers.set('Set-Cookie',
          `industry_refresh_token=${refreshToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=604800; Path=/`
        );

        return response;
      } else {
        return new Response(JSON.stringify({
          success: false,
          verified: false,
          error: result.error || 'Verification failed'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (fetchError) {
      console.error('Error calling 2FA service:', fetchError);
      return new Response(JSON.stringify({
        success: false,
        verified: false,
        error: 'Failed to verify 2FA code'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('❌ Industry auth verification failed:', error);
    return new Response(JSON.stringify({
      success: false,
      verified: false,
      error: 'Internal server error. Please try again later.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
