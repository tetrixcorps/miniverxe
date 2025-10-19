// Industry-Specific 2FA Authentication Verification API
// Verifies 2FA code and returns access tokens for industry dashboards
// Uses TETRIXIndustryAuthService for industry-specific logic

import type { APIRoute } from 'astro';
import { industryAuthService } from '../../../../services/TETRIXIndustryAuthService';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { sessionId, code, deviceInfo } = body;

    // Validate required fields
    if (!sessionId || !code) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: sessionId and code are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get client information
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Use industry auth service for 2FA verification
    const result = await industryAuthService.verifyIndustry2FA(
      sessionId,
      code,
      deviceInfo?.phoneNumber || 'unknown'
    );

    if (result.success && result.verified) {
      // Generate mock tokens for now
      const accessToken = `tetrix_access_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const refreshToken = `tetrix_refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const response = new Response(JSON.stringify({
        success: true,
        verified: true,
        user: {
          id: 'user_' + Date.now(),
          email: 'user@tetrix.com',
          phone: deviceInfo?.phoneNumber || 'unknown',
          status: 'active'
        },
        organization: {
          id: 'org_' + Date.now(),
          name: 'TETRIX Organization',
          industry: 'healthcare'
        },
        roles: ['user'],
        permissions: ['read', 'write'],
        dashboardUrl: '/dashboard',
        accessToken: accessToken,
        refreshToken: refreshToken,
        expiresIn: 3600
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

      // Set secure cookies
      response.headers.set('Set-Cookie', [
        `tetrix_access_token=${accessToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=3600; Path=/`,
        `tetrix_refresh_token=${refreshToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=604800; Path=/`
      ].join(', '));

      return response;
    } else {
      return new Response(JSON.stringify({
        success: false,
        verified: false,
        error: result.error || '2FA verification failed'
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
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};