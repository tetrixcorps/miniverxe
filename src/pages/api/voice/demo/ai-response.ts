// AI Response Demo API Endpoint
// Demonstrates SHANGO AI response generation

import type { APIRoute } from 'astro';

// Inline utility functions to avoid import issues
function validateRequiredFields(data: any, requiredFields: string[]) {
  for (const field of requiredFields) {
    if (!data || data[field] === undefined || data[field] === null || data[field] === '') {
      return { isValid: false, error: `Missing required field: ${field}` };
    }
  }
  return { isValid: true };
}

function createErrorResponse(message: string, status: number = 400, details?: any) {
  return new Response(JSON.stringify({
    error: message,
    ...(details && { details })
  }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function createSuccessResponse(data: any, status: number = 200) {
  return new Response(JSON.stringify({
    success: true,
    ...data
  }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Use parsed body from middleware if available
    let body: any = {};
    
    if (locals.bodyParsed && locals.parsedBody) {
      console.log('Using parsed body from middleware:', locals.parsedBody);
      body = locals.parsedBody;
    } else {
      console.log('Middleware parsing failed, trying direct parsing methods');
      
      try {
        // Method 1: Try request.json() first
        body = await request.json();
        console.log('Successfully parsed with request.json():', body);
      } catch (jsonError) {
        console.log('request.json() failed, trying request.text():', jsonError);
        
        try {
          // Method 2: Try request.text() and parse manually
          const rawBody = await request.text();
          console.log('Raw request body:', rawBody);
          
          if (rawBody && rawBody.trim()) {
            body = JSON.parse(rawBody);
            console.log('Successfully parsed with request.text() + JSON.parse():', body);
          } else {
            console.log('Empty request body');
            return createErrorResponse('Request body is required', 400);
          }
        } catch (textError) {
          console.error('Both parsing methods failed:', { jsonError, textError });
          return createErrorResponse('Failed to parse request body', 400);
        }
      }
    }
    const { transcription, sessionId } = body;

    // Validate required fields
    const requiredValidation = validateRequiredFields(body, ['transcription']);
    if (!requiredValidation.isValid) {
      return createErrorResponse(requiredValidation.error || 'Transcription text is required', 400);
    }

    // Mock AI response generation
    const responses = {
      'hello': 'Hello! I\'m SHANGO, your AI Super Agent. How can I help you today?',
      'help': 'I\'m here to help! I can assist you with account questions, technical support, billing inquiries, or general information. What do you need?',
      'account': 'I can help you with your account. I can check your account status, update your information, or answer questions about your subscription.',
      'billing': 'I can help you with billing questions. I can check your payment history, update payment methods, or explain charges on your account.',
      'technical': 'I\'m here to help with technical issues. I can troubleshoot problems, guide you through setup, or connect you with our technical team.',
      'cancel': 'I understand you want to cancel. I\'d be happy to help you with that process or discuss any concerns you might have.',
      'upgrade': 'I can help you upgrade your plan! Let me show you the available options and benefits of upgrading.',
      'hours': 'Our business hours are Monday through Friday, 9 AM to 6 PM EST. I\'m available 24/7 to help you with immediate questions.',
      'contact': 'You can reach us by phone at 1-800-SHANGO, by email at support@tetrixcorp.com, or through this chat system.',
      'default': 'Thank you for your message. I\'m SHANGO, your AI Super Agent, and I\'m here to help you with any questions or concerns you might have.'
    };

    // Simple keyword matching for demo
    const lowerTranscription = transcription.toLowerCase();
    let response = responses.default;
    
    for (const [keyword, aiResponse] of Object.entries(responses)) {
      if (lowerTranscription.includes(keyword)) {
        response = aiResponse;
        break;
      }
    }

    const aiResponse = {
      input: transcription,
      response: response,
      confidence: 0.92,
      agent: 'SHANGO General',
      timestamp: new Date().toISOString(),
      sessionId: sessionId || `session_${Date.now()}`
    };

    return createSuccessResponse({
      data: aiResponse
    });

  } catch (error) {
    console.error('AI response generation failed:', error);
    return createErrorResponse(
      'Failed to generate AI response',
      500,
      { message: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
};
