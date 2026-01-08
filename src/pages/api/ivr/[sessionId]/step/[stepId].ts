// IVR Step Handler
// Handles step transitions in IVR flow

import type { APIRoute } from 'astro';
import { ivrService } from '../../../../../services/ivr/ivrService';

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const sessionId = params.sessionId;
    const stepId = params.stepId;
    
    if (!sessionId || !stepId) {
      throw new Error('Session ID and Step ID are required');
    }

    // Update session to current step
    ivrService.updateSession(sessionId, { currentStep: stepId });

    // Get TeXML for the step
    const texml = ivrService.getCurrentStepTeXML(sessionId);

    console.log('IVR step transition:', {
      sessionId,
      stepId
    });

    return new Response(texml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error('IVR step error:', error);
    
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

