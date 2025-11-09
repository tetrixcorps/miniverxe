import type { APIRoute } from 'astro';
import { enterprise2FAService } from '../../../../services/enterprise2FAService';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

// Enhanced 2FA verification endpoint using Telnyx Verify API
// In local development, this proxies to the backend server for consistency with droplet deployment
export const POST: APIRoute = async ({ request, locals }) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Check if we should proxy to backend
  // In Docker, always proxy to backend. In local dev, proxy if BACKEND_URL is set.
  const isDocker = process.env.NODE_ENV === 'production' && process.env.DOCKER_ENV === 'true';
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
  
  // Always proxy to backend when BACKEND_URL is set or when in Docker
  // This ensures consistency with droplet deployment behavior
  if (process.env.BACKEND_URL || isDocker) {
    // Proxy to backend for consistency with droplet deployment behavior
    const targetUrl = isDocker 
      ? `http://tetrix-backend:3001/api/v2/2fa/verify`
      : `${backendUrl}/api/v2/2fa/verify`;
    
    console.log(`🔄 [${requestId}] Proxying verify to backend: ${targetUrl}`);
    
    try {
      const body = await request.text();
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': request.headers.get('content-type') || 'application/json',
          'User-Agent': request.headers.get('user-agent') || 'TetrixAuthProxy/1.0',
          'Accept': request.headers.get('accept') || 'application/json',
        },
        body: body
      });
      
      const data = await response.text();
      
      return new Response(data, {
        status: response.status,
        headers: {
          'Content-Type': response.headers.get('content-type') || 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    } catch (error) {
      console.error(`❌ [${requestId}] Backend proxy failed:`, error);
      // Fall through to local service as fallback
      console.log(`⚠️ [${requestId}] Falling back to local 2FA service`);
    }
  }
  
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
      verificationId,
      code,
      phoneNumber
    } = body;

    // Validate required fields
    if (!verificationId || !code || !phoneNumber) {
      return createErrorResponse('verificationId, code, and phoneNumber are required', 400);
    }

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return createErrorResponse('Code must be 6 digits', 400);
    }

    // Normalize phone number to E.164 format for verification
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
      return createErrorResponse('Invalid phone number format. Please enter a valid international number with country code.', 400);
    }
    
    const e164 = cleanPhone; // Use the cleaned E.164 format

    // Verify code
    const result = await enterprise2FAService.verifyCode(verificationId, code, e164);

    if (result.verified) {
      return createSuccessResponse({
        success: true,
        verified: true,
        verificationId: result.verificationId,
        phoneNumber: result.phoneNumber,
        responseCode: result.responseCode,
        timestamp: result.timestamp,
        riskLevel: result.riskLevel,
        token: `tetrix_auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        message: 'Verification successful'
      });
    } else {
      return createErrorResponse('Verification failed', 400, {
        verified: false,
        responseCode: result.responseCode,
        message: getVerificationErrorMessage(result.responseCode)
      });
    }

  } catch (error) {
    console.error('Enterprise 2FA verification failed:', error);
    return createErrorResponse(
      'Failed to verify code',
      500,
      { 
        message: error instanceof Error ? error.message : 'Unknown error',
        type: 'verification_failed'
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

function getVerificationErrorMessage(responseCode: string): string {
  switch (responseCode) {
    case 'rejected':
      return 'Invalid verification code. Please try again.';
    case 'expired':
      return 'Verification code has expired. Please request a new one.';
    case 'max_attempts':
      return 'Maximum verification attempts exceeded. Please request a new code.';
    default:
      return 'Verification failed. Please try again.';
  }
}
