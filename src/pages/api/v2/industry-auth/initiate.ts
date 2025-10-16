// Industry-Specific 2FA Authentication Initiation API
// Handles phone number verification for industry dashboards

import type { APIRoute } from 'astro';
import { industry2FAAuthService } from '../../../../services/auth/Industry2FAAuthService';

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

    // Initiate industry 2FA
    const result = await industry2FAAuthService.initiateIndustry2FA({
      phoneNumber,
      industry,
      organizationId,
      method,
      rememberDevice
    });

    if (result.success) {
      return new Response(JSON.stringify({
        success: true,
        sessionId: result.sessionId,
        verificationId: result.verificationId,
        provider: result.provider,
        method: result.method,
        expiresIn: result.expiresIn,
        requiresOrganizationSelection: result.requiresOrganizationSelection,
        availableOrganizations: result.availableOrganizations
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        error: result.error
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
