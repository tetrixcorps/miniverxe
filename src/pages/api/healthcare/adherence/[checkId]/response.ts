// Adherence Check Response Handler
// Processes response to medication adherence check call

import type { APIRoute } from 'astro';
import { compliantIVRService } from '../../../../../services/compliance/compliantIVRService';
import { medicationAdherenceService } from '../../../../../services/healthcare/medicationAdherenceService';

export const POST: APIRoute = async ({ request, params }) => {
  try {
    const checkId = params.checkId || '';
    
    // Parse form data from Telnyx
    const formData = await request.formData();
    const digits = formData.get('Digits')?.toString() || '';
    const callId = formData.get('CallControlId')?.toString() || '';
    
    // Get check
    const check = medicationAdherenceService.getCheck(checkId);
    if (!check) {
      throw new Error(`Adherence check not found: ${checkId}`);
    }

    // Parse response
    const taken = digits === '1';
    
    // Create context
    const context = {
      callId: checkId,
      callControlId: callId,
      tenantId: 'default', // Would come from check metadata
      from: '',
      to: '',
      industry: 'healthcare',
      region: 'USA',
      language: 'en-US',
      customerId: check.patientId,
      authenticated: true,
      consentGranted: true,
      previousSteps: []
    };

    // Process response
    const result = await compliantIVRService.processAdherenceCheckResponse(
      context,
      checkId,
      taken
    );

    return new Response(result.texml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error('Adherence check response error:', error);
    
    const errorTexml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">We're sorry, but we're experiencing technical difficulties. Please try again later.</Say>
  <Hangup/>
</Response>`;

    return new Response(errorTexml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml; charset=utf-8'
      }
    });
  }
};
