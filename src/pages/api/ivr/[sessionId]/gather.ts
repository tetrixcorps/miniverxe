// IVR DTMF Gather Handler
// Processes DTMF input and advances IVR flow

import type { APIRoute } from 'astro';
import { ivrService } from '../../../../services/ivr/ivrService';

export const POST: APIRoute = async ({ params, request, url }) => {
  try {
    const sessionId = params.sessionId;
    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    // Parse request body (Telnyx sends form data or JSON)
    let body: any = {};
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      // Parse form data
      const formData = await request.formData();
      body = Object.fromEntries(formData);
    }

    // Extract digits from Telnyx webhook
    const digits = body.Digits || body.digits || body.Dtmf || '';
    
    if (!digits) {
      // No input received, replay current step
      const texml = ivrService.getCurrentStepTeXML(sessionId);
      return new Response(texml, {
        status: 200,
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
    }

    // Process DTMF input
    const result = ivrService.processDTMF(sessionId, digits);

    console.log('IVR DTMF processed:', {
      sessionId,
      digits,
      nextStep: result.nextStep
    });

    return new Response(result.texml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error('IVR gather error:', error);
    
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

