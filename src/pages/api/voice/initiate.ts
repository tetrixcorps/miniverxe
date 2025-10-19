// Voice Call Initiation API Endpoint
// Handles voice call initiation with Telnyx and Deepgram STT

import type { APIRoute } from 'astro';
import { voiceService } from '../../../services/voiceService';
import { parseRequestBody, getParsedBody, isBodyParsed } from '../../../middleware/requestParser';

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
    // Use enhanced request parsing
    let body: any = {};
    
    if (isBodyParsed({ locals } as any)) {
      console.log('✅ Using parsed body from middleware:', getParsedBody({ locals } as any));
      body = getParsedBody({ locals } as any);
    } else {
      console.log('⚠️ Middleware parsing failed, trying direct parsing methods');
      
      const parseResult = await parseRequestBody(request);
      if (!parseResult.isValid) {
        console.error('❌ Request parsing failed:', parseResult.error);
        return createErrorResponse('Failed to parse request body', 400);
      }
      
      body = parseResult.body;
      console.log('✅ Successfully parsed request body:', body);
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

    // Create call configuration
    const callConfig = {
      from,
      to,
      webhookUrl: webhookUrl || `${process.env.WEBHOOK_BASE_URL}/api/voice/webhook`,
      recordCall,
      transcriptionEnabled,
      language,
      timeout,
      maxDuration
    };

    // Initiate the call using voice service
    const session = await voiceService.initiateCall(callConfig);

    return createSuccessResponse({
      sessionId: session.sessionId,
      callId: session.callId,
      phoneNumber: session.phoneNumber,
      status: session.status,
      startTime: session.startTime.toISOString(),
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
