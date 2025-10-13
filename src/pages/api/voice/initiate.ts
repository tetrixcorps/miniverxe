// Voice Call Initiation API Endpoint
// Handles voice call initiation with Telnyx and Deepgram STT

import type { APIRoute } from 'astro';

// Inline utility functions to avoid import issues
async function parseRequestBody(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      const body = await request.json();
      return { body, isValid: true };
    } else {
      const text = await request.text();
      if (text) {
        try {
          const body = JSON.parse(text);
          return { body, isValid: true };
        } catch {
          return { body: { raw: text }, isValid: true };
        }
      } else {
        return { body: {}, isValid: true };
      }
    }
  } catch (error) {
    return { 
      body: null, 
      isValid: false, 
      error: `Request parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

function validatePhoneNumber(phone: string) {
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, error: 'Phone number is required' };
  }
  if (!phoneRegex.test(phone)) {
    return { isValid: false, error: 'Invalid phone number format. Use E.164 format (e.g., +1234567890)' };
  }
  return { isValid: true };
}

function validateRequiredFields(data: any, requiredFields: string[]) {
  for (const field of requiredFields) {
    if (!data || data[field] === undefined || data[field] === null || data[field] === '') {
      return { isValid: false, error: `Missing required field: ${field}` };
    }
  }
  return { isValid: true };
}

function validateUrl(url: string) {
  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
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
    const {
      to,
      from,
      webhookUrl,
      recordCall = true,
      transcriptionEnabled = true,
      language = 'en-US',
      timeout = 30,
      maxDuration = 300
    } = body;

    // Validate required fields
    const requiredValidation = validateRequiredFields(body, ['to', 'from']);
    if (!requiredValidation.isValid) {
      return createErrorResponse(requiredValidation.error || 'Missing required fields', 400);
    }

    // Validate phone number format
    const toValidation = validatePhoneNumber(to);
    if (!toValidation.isValid) {
      return createErrorResponse(toValidation.error || 'Invalid phone number format', 400);
    }

    const fromValidation = validatePhoneNumber(from);
    if (!fromValidation.isValid) {
      return createErrorResponse(fromValidation.error || 'Invalid phone number format', 400);
    }

    // Validate webhook URL if provided
    if (webhookUrl) {
      const urlValidation = validateUrl(webhookUrl);
      if (!urlValidation.isValid) {
        return createErrorResponse(urlValidation.error || 'Invalid webhook URL', 400);
      }
    }

    // Generate session and call IDs
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create session data
    const session = {
      sessionId,
      callId,
      phoneNumber: to,
      status: 'initiated',
      startTime: new Date().toISOString(),
      metadata: {
        from,
        webhookUrl: webhookUrl || `${process.env.WEBHOOK_BASE_URL}/api/voice/webhook`,
        recordCall,
        transcriptionEnabled,
        language,
        timeout,
        maxDuration
      }
    };

    // In a real implementation, you would:
    // 1. Call Telnyx API to initiate the call
    // 2. Store session in database
    // 3. Set up webhooks

    return createSuccessResponse({
      sessionId: session.sessionId,
      callId: session.callId,
      phoneNumber: session.phoneNumber,
      status: session.status,
      startTime: session.startTime,
      message: 'Voice call initiated successfully'
    });

  } catch (error) {
    console.error('Voice call initiation failed:', error);
    return createErrorResponse(
      'Failed to initiate voice call',
      500,
      { message: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
};
