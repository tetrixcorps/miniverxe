// Validate Contacts API
// Bulk validate contacts against TCPA compliance before dialing

import type { APIRoute } from 'astro';
import { tcpaComplianceService } from '../../../../services/telemarketing/tcpaComplianceService';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { tenantId, contacts, callTime } = body;

    if (!tenantId || !contacts || !Array.isArray(contacts)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: tenantId, contacts (array)'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const results = await tcpaComplianceService.validateContacts(
      tenantId,
      contacts,
      callTime ? new Date(callTime) : undefined
    );

    // Convert Map to array for JSON response
    const validations = Array.from(results.entries()).map(([contactId, validation]) => ({
      contactId,
      ...validation,
      nextSafeCallTime: validation.nextSafeCallTime?.toISOString()
    }));

    const validCount = validations.filter(v => v.safeToCall).length;
    const invalidCount = validations.length - validCount;

    return new Response(JSON.stringify({
      success: true,
      totalContacts: contacts.length,
      validContacts: validCount,
      invalidContacts: invalidCount,
      validations
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Contact validation error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
