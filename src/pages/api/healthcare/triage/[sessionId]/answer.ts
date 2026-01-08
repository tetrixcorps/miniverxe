// Symptom Triage Answer Handler
// Processes answers to triage questions

import type { APIRoute } from 'astro';
import { compliantIVRService } from '../../../../../services/compliance/compliantIVRService';
import { symptomTriageService } from '../../../../../services/healthcare/symptomTriageService';

export const POST: APIRoute = async ({ request, params }) => {
  try {
    const sessionId = params.sessionId || '';
    
    // Parse form data from Telnyx
    const formData = await request.formData();
    const digits = formData.get('Digits')?.toString() || '';
    const callId = formData.get('CallControlId')?.toString() || '';
    
    // Get session
    const session = symptomTriageService.getSession(sessionId);
    if (!session) {
      throw new Error(`Triage session not found: ${sessionId}`);
    }

    // Get current question
    const currentQuestion = symptomTriageService.getCurrentQuestion(sessionId);
    if (!currentQuestion) {
      throw new Error(`No current question for session: ${sessionId}`);
    }

    // Convert DTMF digits to answer
    let answer: string | number = digits;

    if (currentQuestion.responseType === 'yes_no') {
      answer = digits === '1' ? 'yes' : 'no';
    } else if (currentQuestion.responseType === 'scale_1_10') {
      answer = parseInt(digits, 10);
    } else if (currentQuestion.responseType === 'multiple_choice' && currentQuestion.options) {
      const optionIndex = parseInt(digits, 10) - 1;
      answer = currentQuestion.options[optionIndex] || digits;
    }

    // Create context (minimal for triage)
    const context = {
      callId: sessionId,
      callControlId: callId,
      tenantId: 'default', // Would come from session metadata
      from: '',
      to: '',
      industry: 'healthcare',
      region: 'USA',
      language: 'en-US',
      customerId: session.patientId,
      authenticated: true,
      consentGranted: true,
      previousSteps: []
    };

    // Answer question
    const result = await compliantIVRService.answerTriageQuestion(
      context,
      sessionId,
      currentQuestion.questionId,
      answer
    );

    // Return TeXML
    if (result.texml) {
      return new Response(result.texml, {
        status: 200,
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
    }

    // Fallback
    const texml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Thank you for your response.</Say>
  <Hangup/>
</Response>`;

    return new Response(texml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml; charset=utf-8'
      }
    });

  } catch (error) {
    console.error('Triage answer error:', error);
    
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

