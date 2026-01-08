// IVR Consent Capture Handler
// Processes consent input from disclosure script

import type { APIRoute } from 'astro';
import { ivrService } from '../../../../services/ivr/ivrService';
import { compliantIVRService, type CompliantCallContext } from '../../../../services/compliance/compliantIVRService';
import { auditEvidenceService } from '../../../../services/compliance';

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const sessionId = params.sessionId;
    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    const session = ivrService.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Parse request body
    let body: any = {};
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      const formData = await request.formData();
      body = Object.fromEntries(formData);
    }

    const digits = body.Digits || body.digits || '';
    const consentGranted = digits === '1';

    // Create compliant context
    const compliantContext: CompliantCallContext = {
      callId: sessionId,
      callControlId: session.callControlId,
      tenantId: 'default', // In production, get from session metadata
      from: session.from,
      to: session.to,
      industry: session.industry,
      region: 'USA', // In production, get from session metadata
      language: session.metadata.language as string || 'en-US',
      authenticated: session.metadata.authenticated as boolean || false,
      consentGranted: false,
      previousSteps: []
    };

    // Handle consent capture
    const response = await compliantIVRService.handleConsentCapture(compliantContext, {
      action: 'capture_consent',
      nextStep: 'main_menu',
      requiresRecording: true,
      metadata: {
        granted: consentGranted,
        consentType: 'call_recording'
      }
    });

    return new Response(response.texml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error('IVR consent error:', error);
    
    const errorTeXML = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">We're experiencing technical difficulties. Please try again later.</Say>
  <Hangup/>
</Response>`;
    
    return new Response(errorTeXML, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
};
