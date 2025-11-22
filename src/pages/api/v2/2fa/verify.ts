import type { APIRoute } from 'astro';
import { enterprise2FAService } from '@/services/enterprise2FAService';
import { authSecurity } from '@/lib/security/authSecurity';

// Enhanced 2FA verification endpoint using Telnyx Verify API
// Production-grade security: rate limiting, CSRF protection, input validation
export const POST: APIRoute = async ({ request, locals }) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // ========== SECURITY CHECKS ==========
  
  // 1. Get client IP
  const clientIP = authSecurity.getClientIP(request.headers);
  
  // 2. Check if IP is blocked
  if (authSecurity.isBlocked(clientIP)) {
    const unblockTime = authSecurity.getUnblockTime(clientIP)!;
    const retryAfter = Math.ceil((unblockTime - Date.now()) / 1000);
    return createErrorResponse('Too many failed attempts. Please try again later.', 429, {
      retryAfter,
      type: 'ip_blocked'
    }, {
      'X-Retry-After': retryAfter.toString(),
      ...authSecurity.getSecurityHeaders()
    });
  }
  
  // 3. Check rate limit (strict for 2FA verification)
  const rateLimitCheck = authSecurity.checkRateLimit(clientIP, true);
  if (!rateLimitCheck.allowed) {
    return createErrorResponse('Too many requests. Please try again later.', 429, {
      retryAfter: rateLimitCheck.retryAfter,
      type: 'rate_limit_exceeded'
    }, {
      'X-Retry-After': (rateLimitCheck.retryAfter || 0).toString(),
      ...authSecurity.getSecurityHeaders()
    });
  }
  
  // 4. CSRF Protection: Validate Origin
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  if (!authSecurity.validateOrigin(origin, referer)) {
    console.warn(`🚫 [${requestId}] CSRF check failed: origin=${origin}, referer=${referer}`);
    authSecurity.recordFailedAttempt(clientIP);
    return createErrorResponse('Invalid request origin', 403, {
      type: 'csrf_validation_failed'
    }, authSecurity.getSecurityHeaders());
  }
  
  // 5. CSRF Protection: Validate Content-Type
  const contentType = request.headers.get('content-type');
  if (!authSecurity.validateContentType(contentType)) {
    console.warn(`🚫 [${requestId}] Invalid Content-Type: ${contentType}`);
    authSecurity.recordFailedAttempt(clientIP);
    return createErrorResponse('Invalid Content-Type. Must be application/json', 400, {
      type: 'invalid_content_type'
    }, authSecurity.getSecurityHeaders());
  }
  
  // Check if we should proxy to backend
  const isDocker = process.env.NODE_ENV === 'production' && process.env.DOCKER_ENV === 'true';
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
  
  if (process.env.BACKEND_URL || isDocker) {
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
          ...authSecurity.getSecurityHeaders()
        }
      });
    } catch (error) {
      console.error(`❌ [${requestId}] Backend proxy failed:`, error);
      console.log(`⚠️ [${requestId}] Falling back to local 2FA service`);
    }
  }
  
  try {
    // Parse request body
    let body: any = {};
    
    if ((locals as any).bodyParsed && (locals as any).parsedBody) {
      body = (locals as any).parsedBody;
    } else {
      try {
        body = await request.json();
      } catch (jsonError) {
        try {
          const rawBody = await request.text();
          if (rawBody && rawBody.trim()) {
            body = JSON.parse(rawBody);
          } else {
            return createErrorResponse('Request body is required', 400, {}, authSecurity.getSecurityHeaders());
          }
        } catch (textError) {
          return createErrorResponse('Failed to parse request body', 400, {}, authSecurity.getSecurityHeaders());
        }
      }
    }

    const { verificationId, code, phoneNumber } = body;

    // ========== INPUT VALIDATION ==========
    
    // Validate required fields
    if (!verificationId || !code || !phoneNumber) {
      authSecurity.recordFailedAttempt(clientIP);
      return createErrorResponse('verificationId, code, and phoneNumber are required', 400, {}, authSecurity.getSecurityHeaders());
    }

    // Sanitize and validate verification code
    const codeValidation = authSecurity.validateVerificationCode(String(code));
    if (!codeValidation.valid) {
      authSecurity.recordFailedAttempt(clientIP);
      return createErrorResponse(codeValidation.error || 'Invalid verification code', 400, {}, authSecurity.getSecurityHeaders());
    }
    const cleanedCode = codeValidation.cleaned!;

    // Sanitize and validate phone number
    const phoneValidation = authSecurity.validatePhoneNumber(String(phoneNumber));
    if (!phoneValidation.valid) {
      authSecurity.recordFailedAttempt(clientIP);
      return createErrorResponse(phoneValidation.error || 'Invalid phone number', 400, {}, authSecurity.getSecurityHeaders());
    }
    const e164 = phoneValidation.normalized!;

    // Sanitize verification ID
    const sanitizedVerificationId = authSecurity.sanitizeInput(String(verificationId));

    // ========== VERIFY CODE ==========
    
    const result = await enterprise2FAService.verifyCode(sanitizedVerificationId, cleanedCode, e164);

    if (result.verified) {
      // Reset failed attempts on successful verification
      authSecurity.resetFailedAttempts(clientIP);
      
      // Generate secure token
      const secureToken = authSecurity.generateSecureToken(32);
      
      return createSuccessResponse({
        success: true,
        verified: true,
        verificationId: result.verificationId,
        phoneNumber: result.phoneNumber,
        responseCode: result.responseCode,
        timestamp: result.timestamp,
        riskLevel: result.riskLevel,
        token: `tetrix_auth_${Date.now()}_${secureToken}`,
        message: 'Verification successful'
      }, authSecurity.getSecurityHeaders());
    } else {
      // Record failed attempt
      authSecurity.recordFailedAttempt(clientIP);
      
      return createErrorResponse('Verification failed', 400, {
        verified: false,
        responseCode: result.responseCode,
        message: getVerificationErrorMessage(result.responseCode)
      }, authSecurity.getSecurityHeaders());
    }

  } catch (error) {
    console.error(`❌ [${requestId}] Enterprise 2FA verification failed:`, error);
    authSecurity.recordFailedAttempt(clientIP);
    
    return createErrorResponse(
      'Failed to verify code',
      500,
      { 
        message: error instanceof Error ? error.message : 'Unknown error',
        type: 'verification_failed'
      },
      authSecurity.getSecurityHeaders()
    );
  }
};

// Helper functions
function createErrorResponse(message: string, status: number, details?: any, headers?: Record<string, string>) {
  return new Response(JSON.stringify({
    success: false,
    error: message,
    status,
    details,
    timestamp: new Date().toISOString()
  }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  });
}

function createSuccessResponse(data: any, headers?: Record<string, string>) {
  return new Response(JSON.stringify({
    success: true,
    ...data,
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...headers
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
