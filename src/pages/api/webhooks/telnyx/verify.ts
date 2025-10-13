import type { APIRoute } from 'astro';
import { enterprise2FAService } from '../../../../services/enterprise2FAService';

// Telnyx Verify API Webhook Handler
// Handles real-time events from Telnyx Verify API
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

    // Verify webhook signature (in production, implement proper signature verification)
    const signature = request.headers.get('telnyx-signature');
    if (!signature) {
      console.warn('No Telnyx signature found in webhook request');
    }

    const event = body;
    console.log('Telnyx Verify webhook received:', event);

    // Handle different event types
    switch (event.event_type) {
      case 'verification.attempted':
        await handleVerificationAttempted(event);
        break;
      case 'verification.verified':
        await handleVerificationVerified(event);
        break;
      case 'verification.failed':
        await handleVerificationFailed(event);
        break;
      case 'verification.expired':
        await handleVerificationExpired(event);
        break;
      case 'verification.rate_limited':
        await handleVerificationRateLimited(event);
        break;
      default:
        console.log('Unhandled Telnyx Verify event:', event.event_type);
    }

    return createSuccessResponse({
      received: true,
      event_type: event.event_type,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Telnyx Verify webhook error:', error);
    return createErrorResponse(
      'Webhook processing failed',
      500,
      { 
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    );
  }
};

// Handle verification attempted event
async function handleVerificationAttempted(event: any) {
  console.log('Verification attempted:', {
    verificationId: event.data.id,
    phoneNumber: event.data.phone_number,
    method: event.data.type,
    timestamp: event.occurred_at
  });

  // Update verification status in your database
  // In production, you'd update your database here
  console.log('Updating verification status to attempted');
}

// Handle verification verified event
async function handleVerificationVerified(event: any) {
  console.log('Verification verified:', {
    verificationId: event.data.id,
    phoneNumber: event.data.phone_number,
    method: event.data.type,
    timestamp: event.occurred_at
  });

  // Update verification status to verified
  // Trigger any post-verification actions
  console.log('Verification successful - triggering post-verification actions');
  
  // Example: Update user status, send welcome email, etc.
  await triggerPostVerificationActions(event.data);
}

// Handle verification failed event
async function handleVerificationFailed(event: any) {
  console.log('Verification failed:', {
    verificationId: event.data.id,
    phoneNumber: event.data.phone_number,
    method: event.data.type,
    reason: event.data.failure_reason,
    timestamp: event.occurred_at
  });

  // Update verification status to failed
  // Log failure for security monitoring
  console.log('Verification failed - logging for security monitoring');
  
  // Example: Increment failure count, check for suspicious activity
  await handleVerificationFailure(event.data);
}

// Handle verification expired event
async function handleVerificationExpired(event: any) {
  console.log('Verification expired:', {
    verificationId: event.data.id,
    phoneNumber: event.data.phone_number,
    method: event.data.type,
    timestamp: event.occurred_at
  });

  // Update verification status to expired
  // Clean up any associated resources
  console.log('Verification expired - cleaning up resources');
}

// Handle verification rate limited event
async function handleVerificationRateLimited(event: any) {
  console.log('Verification rate limited:', {
    phoneNumber: event.data.phone_number,
    reason: event.data.rate_limit_reason,
    timestamp: event.occurred_at
  });

  // Log rate limiting for security monitoring
  // Consider implementing additional rate limiting measures
  console.log('Rate limit exceeded - implementing additional security measures');
}

// Post-verification actions
async function triggerPostVerificationActions(verificationData: any) {
  try {
    // Example actions after successful verification:
    // 1. Update user verification status
    // 2. Send welcome email/SMS
    // 3. Create user session
    // 4. Trigger onboarding flow
    // 5. Update analytics
    
    console.log('Executing post-verification actions for:', verificationData.phone_number);
    
    // In production, implement these actions:
    // - Database updates
    // - Email/SMS notifications
    // - Session creation
    // - Analytics tracking
    
  } catch (error) {
    console.error('Post-verification actions failed:', error);
  }
}

// Handle verification failure
async function handleVerificationFailure(verificationData: any) {
  try {
    // Example failure handling:
    // 1. Increment failure count
    // 2. Check for suspicious patterns
    // 3. Implement progressive delays
    // 4. Block if too many failures
    
    console.log('Handling verification failure for:', verificationData.phone_number);
    
    // In production, implement:
    // - Failure tracking
    // - Suspicious activity detection
    // - Progressive security measures
    
  } catch (error) {
    console.error('Verification failure handling failed:', error);
  }
}

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
