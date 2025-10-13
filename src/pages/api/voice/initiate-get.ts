// Temporary GET endpoint for voice call initiation
// This works around Astro's request body parsing issues

import type { APIRoute } from 'astro';

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

export const GET: APIRoute = async ({ url }) => {
  try {
    const searchParams = url.searchParams;
    
    // Debug: Log all parameters
    console.log('All search params:', Object.fromEntries(searchParams.entries()));
    
    const to = searchParams.get('to');
    const from = searchParams.get('from');
    const webhookUrl = searchParams.get('webhookUrl');
    const recordCall = searchParams.get('recordCall') === 'true';
    const transcriptionEnabled = searchParams.get('transcriptionEnabled') === 'true';
    const language = searchParams.get('language') || 'en-US';
    const timeout = parseInt(searchParams.get('timeout') || '30');
    const maxDuration = parseInt(searchParams.get('maxDuration') || '300');
    
    console.log('Parsed parameters:', { to, from, webhookUrl, recordCall, transcriptionEnabled, language, timeout, maxDuration });

    // Validate required fields
    if (!to || !from) {
      return createErrorResponse('Missing required parameters: to and from are required', 400);
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
      message: 'Voice call initiated successfully (GET method)',
      note: 'This is a temporary workaround for Astro request body parsing issues'
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
