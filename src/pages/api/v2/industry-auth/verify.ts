// Industry-Specific 2FA Authentication Verification API
// Verifies 2FA code and returns access tokens for industry dashboards

import type { APIRoute } from 'astro';
import { Industry2FAAuthService } from '../../../../services/auth/Industry2FAAuthService';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { sessionId, code, deviceInfo } = body;

    // Validate required fields
    if (!sessionId || !code) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Session ID and verification code are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate code format
    if (!/^\d{6}$/.test(code)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Verification code must be 6 digits'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get client IP and user agent for device info
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create industry 2FA service instance
    const industry2FAService = new Industry2FAAuthService();
    
    // Verify 2FA code
    const result = await industry2FAService.verifyIndustry2FA({
      sessionId,
      code,
      deviceInfo: {
        userAgent,
        ipAddress: clientIP,
        deviceId: deviceInfo?.deviceId
      }
    });

    if (result.success && result.verified) {
      // Set secure HTTP-only cookies for tokens
      const response = new Response(JSON.stringify({
        success: true,
        verified: true,
        user: {
          id: result.user?.id,
          email: result.user?.email,
          phone: result.user?.phone,
          status: result.user?.status
        },
        organization: {
          id: result.organization?.id,
          name: result.organization?.name,
          industry: result.organization?.industry
        },
        roles: result.roles,
        permissions: result.permissions,
        dashboardUrl: result.dashboardUrl
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

      // Set secure cookies
      if (result.accessToken) {
        response.headers.set('Set-Cookie', 
          `industry_access_token=${result.accessToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=1800; Path=/`
        );
      }

      if (result.refreshToken) {
        response.headers.set('Set-Cookie', 
          `industry_refresh_token=${result.refreshToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=604800; Path=/`
        );
      }

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
