// IVR Speech Recognition Handler
// Processes speech input and advances IVR flow using NLU

import type { APIRoute } from 'astro';
import { ivrService } from '../../../../services/ivr/ivrService';
import { speechRecognitionService } from '../../../../services/ivr/speechRecognitionService';

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

    // Parse request body from Telnyx
    let body: any = {};
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      const formData = await request.formData();
      body = Object.fromEntries(formData);
    }

    // Extract speech result from Telnyx
    const speechResult = body.SpeechResult || body.speech_result || body.TranscriptionText || '';
    const confidence = parseFloat(body.Confidence || body.confidence || '0');
    
    if (!speechResult) {
      // Fallback to DTMF if available
      const digits = body.Digits || body.digits || '';
      if (digits) {
        const result = ivrService.processDTMF(sessionId, digits);
        return new Response(result.texml, {
          status: 200,
          headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        });
      }

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

    // Process speech input with NLU
    const nluResult = await speechRecognitionService.processSpeechInput(
      sessionId,
      speechResult,
      confidence,
      session
    );

    console.log('IVR Speech processed:', {
      sessionId,
      speechResult,
      confidence,
      intent: nluResult.intent,
      action: nluResult.action
    });

    // If intent was recognized, route to appropriate step
    if (nluResult.nextStep) {
      session.currentStep = nluResult.nextStep;
      const texml = ivrService.getCurrentStepTeXML(sessionId);
      return new Response(texml, {
        status: 200,
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
    }

    // If confidence is low or no intent matched, ask for clarification
    if (confidence < 0.7) {
      const clarificationTeXML = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">I'm sorry, I didn't understand that. Please try again or press a number on your keypad.</Say>
  <Redirect method="POST">${process.env.WEBHOOK_BASE_URL || 'https://tetrixcorp.com'}/api/ivr/${sessionId}/gather</Redirect>
</Response>`;
      
      return new Response(clarificationTeXML, {
        status: 200,
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
    }

    // Default: replay current step
    const texml = ivrService.getCurrentStepTeXML(sessionId);
    return new Response(texml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error('IVR speech error:', error);
    
    const errorTeXML = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">We're experiencing technical difficulties. Please try again later or press a number on your keypad.</Say>
  <Redirect method="POST">${process.env.WEBHOOK_BASE_URL || 'https://tetrixcorp.com'}/api/ivr/${params.sessionId}/gather</Redirect>
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
