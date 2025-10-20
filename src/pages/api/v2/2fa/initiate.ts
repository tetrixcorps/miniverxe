import type { APIRoute } from 'astro';
import { enterprise2FAService } from '../../../../services/enterprise2FAService';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

// Enhanced 2FA initiation endpoint using Telnyx Verify API
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Use parsed body from middleware if available
    let body: any = {};
    
    if ((locals as any).bodyParsed && (locals as any).parsedBody) {
      console.log('Using parsed body from middleware:', (locals as any).parsedBody);
      body = (locals as any).parsedBody;
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
      phoneNumber,
      method = 'sms',
      customCode,
      timeoutSecs = 300,
      userAgent,
      ipAddress,
      sessionId
    } = body;

    // Validate required fields
    if (!phoneNumber) {
      return createErrorResponse('Phone number is required', 400);
    }

    // Normalize phone number to E.164 format
    let phoneStr = String(phoneNumber).trim();
    
    // Basic E.164 format validation and normalization
    // Remove all non-digit characters except +
    let cleanPhone = phoneStr.replace(/[^\d+]/g, '');
    
    // Remove double plus signs
    if (cleanPhone.startsWith('++')) {
      cleanPhone = cleanPhone.substring(1);
    }
    
    // Ensure it starts with +
    if (!cleanPhone.startsWith('+')) {
      cleanPhone = '+' + cleanPhone;
    }
    
    // Extract digits after the +
    const digits = cleanPhone.slice(1).replace(/\D/g, '');
    
    // Validate E.164 format: + followed by 1-15 digits, first digit cannot be 0
    if (digits.length < 7 || digits.length > 15 || digits.startsWith('0')) {
      return createErrorResponse('Invalid phone number format. Please enter a valid international number with country code (e.g., +1 555-123-4567, +44 20 7946 0958, +33 1 23 45 67 89).', 400);
    }
    
    const e164 = cleanPhone; // Use the cleaned E.164 format

    // Validate method
    const validMethods = ['sms', 'voice', 'flashcall', 'whatsapp'];
    if (!validMethods.includes(method)) {
      return createErrorResponse(`Invalid method. Must be one of: ${validMethods.join(', ')}`, 400);
    }

    // Get client IP if not provided
    const clientIP = ipAddress || request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';

    // Get user agent if not provided
    const clientUA = userAgent || request.headers.get('user-agent') || 'unknown';

    // Initiate verification
    const verification = await enterprise2FAService.initiateVerification({
      phoneNumber: e164,
      method,
      customCode,
      timeoutSecs,
      userAgent: clientUA,
      ipAddress: clientIP,
      sessionId
    });

    return createSuccessResponse({
      verificationId: verification.verificationId,
      message: `Verification ${method.toUpperCase()} sent successfully`,
      estimatedDelivery: method === 'sms' ? '30-60 seconds' : '10-30 seconds'
    });

  } catch (error) {
    console.error('Enterprise 2FA initiation failed:', error);
    return createErrorResponse(
      'Failed to initiate verification',
      500,
      { 
        message: error instanceof Error ? error.message : 'Unknown error',
        type: 'verification_initiation_failed'
      }
    );
  }
};

// Helper functions
function createErrorResponse(message: string, status: number, details?: any) {
  return new Response(JSON.stringify({
    success: false,
    error: message,
    status,
    details,
    timestamp: new Date().toISOString()
  }), {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

function createSuccessResponse(data: any) {
  return new Response(JSON.stringify({
    success: true,
    ...data,
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
