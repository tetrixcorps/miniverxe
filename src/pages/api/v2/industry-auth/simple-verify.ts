import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { sessionId, code } = body;

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

    // Mock verification for now - this will be replaced with actual 2FA service
    const isValidCode = code === '123456' || code.length === 6;
    
    if (isValidCode) {
      const accessToken = `tetrix_access_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const refreshToken = `tetrix_refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const response = new Response(JSON.stringify({
        success: true,
        verified: true,
        message: '2FA verification successful',
        accessToken,
        refreshToken,
        dashboardUrl: '/dashboard/healthcare' // Mock dashboard URL
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
        error: 'Invalid verification code'
      }), {
        status: 400,
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
