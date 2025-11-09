import type { APIRoute } from 'astro';
import { enterprise2FAService } from '../../../../services/enterprise2FAService';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

// Enhanced 2FA initiation endpoint using Telnyx Verify API
// In local development, this proxies to the backend server for consistency with droplet deployment
export const POST: APIRoute = async ({ request, locals }) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();
  
  console.log(`🚀 [${requestId}] Starting 2FA initiation request`);
  console.log(`🌐 [${requestId}] Request URL: ${request.url}`);
  console.log(`🔍 [${requestId}] Request headers:`, Object.fromEntries(request.headers.entries()));
  console.log(`📊 [${requestId}] Request method: ${request.method}`);
  
  // Check if we should proxy to backend
  // In Docker, always proxy to backend. In local dev, proxy if BACKEND_URL is set.
  const isDocker = process.env.NODE_ENV === 'production' && process.env.DOCKER_ENV === 'true';
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
  
  // Always proxy to backend when BACKEND_URL is set or when in Docker
  // This ensures consistency with droplet deployment behavior
  if (process.env.BACKEND_URL || isDocker) {
    // Proxy to backend for consistency with droplet deployment behavior
    const targetUrl = isDocker 
      ? `http://tetrix-backend:3001/api/v2/2fa/initiate`
      : `${backendUrl}/api/v2/2fa/initiate`;
    
    console.log(`🔄 [${requestId}] Proxying to backend: ${targetUrl}`);
    
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
      console.log(`✅ [${requestId}] Using parsed body from middleware:`, (locals as any).parsedBody);
      body = (locals as any).parsedBody;
    } else {
      console.log(`⚠️ [${requestId}] Middleware parsing failed, trying direct parsing methods`);
      
      try {
        // Method 1: Try request.json() first
        body = await request.json();
        console.log(`✅ [${requestId}] Successfully parsed with request.json():`, body);
      } catch (jsonError) {
        console.log(`❌ [${requestId}] request.json() failed:`, jsonError);
        
        try {
          // Method 2: Try request.text() and parse manually
          const rawBody = await request.text();
          console.log(`📝 [${requestId}] Raw request body:`, rawBody);
          
          if (rawBody && rawBody.trim()) {
            body = JSON.parse(rawBody);
            console.log(`✅ [${requestId}] Successfully parsed with request.text() + JSON.parse():`, body);
          } else {
            console.log(`❌ [${requestId}] Empty request body`);
            return createErrorResponse('Request body is required', 400, { requestId });
          }
        } catch (textError) {
          console.error(`❌ [${requestId}] Both parsing methods failed:`, { jsonError, textError });
          return createErrorResponse('Failed to parse request body', 400, { requestId, jsonError: jsonError.message, textError: textError.message });
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

    console.log(`📋 [${requestId}] Extracted parameters:`, {
      phoneNumber: phoneNumber ? `${phoneNumber.substring(0, 3)}***${phoneNumber.substring(phoneNumber.length - 3)}` : 'NOT_PROVIDED',
      method,
      customCode: customCode ? 'PROVIDED' : 'NOT_PROVIDED',
      timeoutSecs,
      userAgent: userAgent ? userAgent.substring(0, 50) + '...' : 'NOT_PROVIDED',
      ipAddress: ipAddress ? ipAddress.substring(0, 10) + '...' : 'NOT_PROVIDED',
      sessionId: sessionId ? sessionId.substring(0, 10) + '...' : 'NOT_PROVIDED'
    });

    // Validate required fields
    if (!phoneNumber) {
      console.log(`❌ [${requestId}] Phone number validation failed: NOT_PROVIDED`);
      return createErrorResponse('Phone number is required', 400, { requestId });
    }

    // Normalize phone number to E.164 format
    let phoneStr = String(phoneNumber).trim();
    console.log(`📞 [${requestId}] Original phone number: ${phoneStr}`);
    
    // Basic E.164 format validation and normalization
    // Remove all non-digit characters except +
    let cleanPhone = phoneStr.replace(/[^\d+]/g, '');
    console.log(`🧹 [${requestId}] After removing non-digits: ${cleanPhone}`);
    
    // Remove double plus signs
    if (cleanPhone.startsWith('++')) {
      cleanPhone = cleanPhone.substring(1);
      console.log(`🔧 [${requestId}] Removed double plus: ${cleanPhone}`);
    }
    
    // Ensure it starts with +
    if (!cleanPhone.startsWith('+')) {
      cleanPhone = '+' + cleanPhone;
      console.log(`🔧 [${requestId}] Added plus prefix: ${cleanPhone}`);
    }
    
    // Extract digits after the +
    const digits = cleanPhone.slice(1).replace(/\D/g, '');
    console.log(`🔢 [${requestId}] Extracted digits: ${digits} (length: ${digits.length})`);
    
    // Validate E.164 format: + followed by 1-15 digits, first digit cannot be 0
    if (digits.length < 7 || digits.length > 15 || digits.startsWith('0')) {
      console.log(`❌ [${requestId}] Phone number validation failed:`, {
        length: digits.length,
        startsWithZero: digits.startsWith('0'),
        cleanPhone
      });
      return createErrorResponse('Invalid phone number format. Please enter a valid international number with country code (e.g., +1 555-123-4567, +44 20 7946 0958, +33 1 23 45 67 89).', 400, { requestId, cleanPhone, digits });
    }
    
    const e164 = cleanPhone; // Use the cleaned E.164 format
    console.log(`✅ [${requestId}] Final E.164 phone number: ${e164}`);

    // Validate method
    const validMethods = ['sms', 'voice', 'flashcall', 'whatsapp'];
    if (!validMethods.includes(method)) {
      console.log(`❌ [${requestId}] Invalid method: ${method}, valid methods: ${validMethods.join(', ')}`);
      return createErrorResponse(`Invalid method. Must be one of: ${validMethods.join(', ')}`, 400, { requestId, method, validMethods });
    }
    console.log(`✅ [${requestId}] Method validation passed: ${method}`);

    // Get client IP if not provided
    const clientIP = ipAddress || request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    console.log(`🌐 [${requestId}] Client IP: ${clientIP}`);

    // Get user agent if not provided
    const clientUA = userAgent || request.headers.get('user-agent') || 'unknown';
    console.log(`🖥️ [${requestId}] User Agent: ${clientUA.substring(0, 100)}...`);

    console.log(`🚀 [${requestId}] Calling enterprise2FAService.initiateVerification with:`, {
      phoneNumber: e164,
      method,
      customCode: customCode ? 'PROVIDED' : 'NOT_PROVIDED',
      timeoutSecs,
      userAgent: clientUA.substring(0, 50) + '...',
      ipAddress: clientIP,
      sessionId: sessionId ? sessionId.substring(0, 10) + '...' : 'NOT_PROVIDED'
    });

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

    console.log(`✅ [${requestId}] Verification initiated successfully:`, {
      verificationId: verification.verificationId,
      phoneNumber: verification.phoneNumber,
      method: verification.method,
      status: verification.status
    });

    const responseTime = Date.now() - startTime;
    console.log(`⏱️ [${requestId}] Total request time: ${responseTime}ms`);

    return createSuccessResponse({
      verificationId: verification.verificationId,
      message: `Verification ${method.toUpperCase()} sent successfully`,
      estimatedDelivery: method === 'sms' ? '30-60 seconds' : '10-30 seconds',
      requestId,
      responseTime
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`❌ [${requestId}] Enterprise 2FA initiation failed after ${responseTime}ms:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: error instanceof Error ? error.constructor.name : typeof error,
      requestId,
      responseTime
    });
    
    return createErrorResponse(
      'Authentication service is temporarily unavailable. Please try again later.',
      500,
      { 
        message: error instanceof Error ? error.message : 'Unknown error',
        type: 'verification_initiation_failed',
        requestId,
        responseTime,
        timestamp: new Date().toISOString()
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
