// Industry-Specific 2FA Authentication Initiation API
// Handles phone number verification for industry dashboards
// Uses TETRIXIndustryAuthService for industry-specific logic

import type { APIRoute } from 'astro';
import { industryAuthService } from '../../../../services/TETRIXIndustryAuthService';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { phoneNumber, industry, organizationId, method = 'sms', rememberDevice = false } = body;

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

    // Validate industry
    const validIndustries = [
      'healthcare', 'legal', 'real_estate', 'ecommerce', 'construction',
      'logistics', 'government', 'education', 'retail', 'hospitality',
      'wellness', 'beauty'
    ];

    if (!validIndustries.includes(industry)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid industry. Please select a valid industry.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate method
    if (!['sms', 'voice'].includes(method)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid method. Use "sms" or "voice".'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Use industry auth service for 2FA initiation
    const result = await industryAuthService.initiateIndustry2FA(
      phoneNumber,
      industry,
      organizationId
    );

    if (result.success) {
      return new Response(JSON.stringify({
        success: true,
        sessionId: result.verificationId,
        verificationId: result.verificationId,
        provider: 'telnyx',
        method: method,
        expiresIn: 300, // 5 minutes
        industry: industry,
        organizationId: organizationId,
        message: 'Industry 2FA verification initiated successfully'
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
