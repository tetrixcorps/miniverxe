// Consent Management API Endpoint
// POST /api/compliance/consent - Record consent
// GET /api/compliance/consent?customerId=xxx&tenantId=xxx - Get consent status

import type { APIRoute } from 'astro';
import { consentManagementService, type ConsentRequest } from '@/services/compliance';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json() as ConsentRequest;

    if (!body.customerId || !body.tenantId || !body.channel || !body.consentType) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: customerId, tenantId, channel, consentType' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const consent = await consentManagementService.recordConsent(body);

    return new Response(JSON.stringify({ 
      success: true,
      consent 
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Consent recording error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const customerId = url.searchParams.get('customerId');
    const tenantId = url.searchParams.get('tenantId');
    const consentType = url.searchParams.get('consentType');
    const channel = url.searchParams.get('channel');

    if (!customerId || !tenantId) {
      return new Response(JSON.stringify({ 
        error: 'Missing required parameters: customerId, tenantId' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (consentType) {
      // Check specific consent
      const hasConsent = await consentManagementService.hasConsent(
        customerId,
        tenantId,
        consentType as any,
        channel as any
      );

      return new Response(JSON.stringify({ hasConsent }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get full consent status
    const status = await consentManagementService.getConsentStatus(customerId, tenantId);

    return new Response(JSON.stringify(status), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Consent retrieval error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
