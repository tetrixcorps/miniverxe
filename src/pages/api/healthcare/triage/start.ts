// Symptom Triage Start Handler
// Initiates a symptom triage session

import type { APIRoute } from 'astro';
import { compliantIVRService } from '../../../../services/compliance/compliantIVRService';
import { auditEvidenceService } from '../../../../services/compliance/auditEvidenceService';

export const POST: APIRoute = async ({ request, url }) => {
  try {
    // Parse request body
    const body = await request.json();
    const { callId, tenantId, patientId, condition, from, to, industry, region, language, metadata } = body;

    if (!callId || !tenantId || !patientId || !condition) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: callId, tenantId, patientId, condition'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create compliant call context
    const context = {
      callId,
      callControlId: callId,
      tenantId,
      from: from || '',
      to: to || '',
      industry: industry || 'healthcare',
      region: region || 'USA',
      language: language || 'en-US',
      customerId: patientId,
      authenticated: true, // Assume authenticated for triage
      consentGranted: true, // Assume consent granted
      previousSteps: []
    };

    // Start triage session
    const session = await compliantIVRService.startSymptomTriage(
      context,
      condition,
      metadata
    );

    // Get first question
    const { symptomTriageService } = await import('../../../../services/healthcare/symptomTriageService');
    const firstQuestion = symptomTriageService.getCurrentQuestion(session.sessionId);

    // Generate TeXML for first question
    let texml: string;
    if (firstQuestion) {
      // Use CompliantIVRService to generate TeXML (will need to make method public or use helper)
      const questionTeXML = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="${context.language}">${firstQuestion.questionText}</Say>
  ${firstQuestion.responseType === 'yes_no' ? `
  <Gather 
    action="${process.env.WEBHOOK_BASE_URL || 'https://tetrixcorp.com'}/api/healthcare/triage/${session.sessionId}/answer" 
    method="POST" 
    timeout="10" 
    numDigits="1">
    <Say voice="alice" language="${context.language}">Press 1 for yes, or 2 for no.</Say>
  </Gather>` : ''}
  ${firstQuestion.responseType === 'scale_1_10' ? `
  <Gather 
    action="${process.env.WEBHOOK_BASE_URL || 'https://tetrixcorp.com'}/api/healthcare/triage/${session.sessionId}/answer" 
    method="POST" 
    timeout="15" 
    numDigits="2">
    <Say voice="alice" language="${context.language}">Please enter a number from 1 to 10.</Say>
  </Gather>` : ''}
  ${firstQuestion.responseType === 'multiple_choice' && firstQuestion.options ? `
  <Gather 
    action="${process.env.WEBHOOK_BASE_URL || 'https://tetrixcorp.com'}/api/healthcare/triage/${session.sessionId}/answer" 
    method="POST" 
    timeout="15" 
    numDigits="1">
    <Say voice="alice" language="${context.language}">${firstQuestion.options.map((opt: string, idx: number) => `Press ${idx + 1} for ${opt}`).join('. ')}.</Say>
  </Gather>` : ''}
  <Say voice="alice" language="${context.language}">We didn't receive your response. Please try again.</Say>
  <Hangup/>
</Response>`;
      texml = questionTeXML;
    } else {
      texml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="${context.language}">Thank you for calling. We'll help assess your symptoms.</Say>
  <Redirect>${process.env.WEBHOOK_BASE_URL || 'https://tetrixcorp.com'}/api/healthcare/triage/${session.sessionId}/answer</Redirect>
</Response>`;
    }

    return new Response(texml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error('Triage start error:', error);
    
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

