import type { APIRoute } from 'astro';
import { DASHBOARD_ROUTES, DEFAULT_DASHBOARD } from '@/lib/dashboardRouting';

/**
 * Industry-Specific 2FA Verification API
 * Proxies to the backend Unified Auth Service (Better Auth)
 * Injects dashboardUrl based on industry for correct routing
 */
export const POST: APIRoute = async ({ request }) => {
  // Determine backend URL
  const isDocker = process.env.NODE_ENV === 'production' && process.env.DOCKER_ENV === 'true';
  const backendUrl = process.env.BACKEND_URL || process.env.TETRIX_BACKEND_URL || 'http://localhost:3001';
  
  const targetUrl = isDocker 
    ? `http://tetrix-backend:3001/api/v2/2fa/verify`
    : `${backendUrl}/api/v2/2fa/verify`;

  try {
    const body = await request.json();
    const { sessionId, code, deviceInfo, industry } = body;

    // Validate required fields
    if ((!sessionId && !body.verificationId) || !code) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: verificationId/sessionId and code are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Prepare body for backend
    // Backend expects: verificationId, code, phoneNumber
    const backendBody = {
      ...body,
      verificationId: body.verificationId || sessionId, // Support both
      phoneNumber: body.phoneNumber || deviceInfo?.phoneNumber, // Ensure phone is passed
    };

    console.log(`🔄 [VERIFY] Proxying to backend: ${targetUrl}`);

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': request.headers.get('user-agent') || 'TetrixAuthProxy/1.0',
      },
      body: JSON.stringify(backendBody),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      // Success! Now determine dashboard URL.
      // Use industry from request OR from user profile if returned
      const userIndustry = result.user?.industry || industry || 'healthcare';
      const dashboardRoute = DASHBOARD_ROUTES[userIndustry] || DEFAULT_DASHBOARD;
      const dashboardUrl = dashboardRoute.path;

      // Inject dashboardUrl into the response
      const finalResult = {
        ...result,
        dashboardUrl,
        // Ensure tokens are present (backend might return 'token', 'session')
        accessToken: result.token || result.session?.token,
        refreshToken: result.refreshToken || result.session?.token // Fallback
      };
      
      // Prepare headers
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const cookieHeader = response.headers.get('set-cookie');
      if (cookieHeader) {
        headers['Set-Cookie'] = cookieHeader;
      }

      const finalResponse = new Response(JSON.stringify(finalResult), {
        status: 200,
        headers: headers
      });

      return finalResponse;
    } else {
      // Forward error
      return new Response(JSON.stringify(result), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('❌ Industry auth verification proxy failed:', error);
    return new Response(JSON.stringify({
      success: false,
      verified: false,
      error: 'Internal server error during verification'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
