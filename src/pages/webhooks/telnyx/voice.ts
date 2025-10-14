// Telnyx Voice Webhook Endpoint
// Handles Telnyx webhook events for toll free numbers

import type { APIRoute } from 'astro';

// TwiML response generators
function generateGreetingTwiML(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Welcome to TETRIX Enterprise Solutions. Press 1 for sales, 2 for support, 3 for billing, or 0 to speak with an operator.</Say>
  <Gather numDigits="1" action="${process.env.WEBHOOK_BASE_URL || 'https://tetrixcorp.com'}/webhooks/telnyx/voice" method="POST" timeout="10">
    <Say voice="alice">Please make your selection.</Say>
  </Gather>
  <Say voice="alice">We didn't receive any input. Please call back later. Goodbye.</Say>
  <Hangup/>
</Response>`;
}

function generateRoutingTwiML(dtmf: string): string {
  const webhookUrl = process.env.WEBHOOK_BASE_URL || 'https://tetrixcorp.com';
  
  switch (dtmf) {
    case '1': // Sales
      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Thank you for your interest in our sales department. Please hold while we connect you to a sales representative.</Say>
  <Dial timeout="30" record="record-from-answer">
    <Number>+1-888-804-6762</Number>
  </Dial>
  <Say voice="alice">The call could not be completed. Please try again later.</Say>
  <Hangup/>
</Response>`;
    case '2': // Support
      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">You have reached our technical support team. Please hold while we connect you to a support specialist.</Say>
  <Dial timeout="30" record="record-from-answer">
    <Number>+1-800-596-3057</Number>
  </Dial>
  <Say voice="alice">The call could not be completed. Please try again later.</Say>
  <Hangup/>
</Response>`;
    case '3': // Billing
      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">You have reached our billing department. Please hold while we connect you to a billing specialist.</Say>
  <Dial timeout="30" record="record-from-answer">
    <Number>+1-888-804-6762</Number>
  </Dial>
  <Say voice="alice">The call could not be completed. Please try again later.</Say>
  <Hangup/>
</Response>`;
    case '0': // Operator
      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Please hold while we connect you to an operator.</Say>
  <Dial timeout="30" record="record-from-answer">
    <Number>+1-800-596-3057</Number>
  </Dial>
  <Say voice="alice">The call could not be completed. Please try again later.</Say>
  <Hangup/>
</Response>`;
    default: // Invalid
      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Invalid selection. Please try again.</Say>
  <Redirect>${webhookUrl}/webhooks/telnyx/voice</Redirect>
</Response>`;
  }
}

function generateHangupTwiML(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Hangup/>
</Response>`;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { event_type, data } = body;
    
    console.log('Telnyx voice webhook received:', {
      event_type,
      call_control_id: data?.call_control_id,
      from: data?.from,
      to: data?.to,
      timestamp: new Date().toISOString()
    });

    let twiMLResponse = '';

    // Handle different event types
    switch (event_type) {
      case 'call.initiated':
      case 'call.answered':
        // Generate greeting with menu
        twiMLResponse = generateGreetingTwiML();
        break;
      case 'call.gather.ended':
        // Handle DTMF input
        const dtmf = data?.digits || data?.dtmf;
        if (dtmf) {
          twiMLResponse = generateRoutingTwiML(dtmf);
        } else {
          twiMLResponse = generateGreetingTwiML();
        }
        break;
      case 'call.hangup':
        // Call ended
        twiMLResponse = generateHangupTwiML();
        break;
      default:
        console.log('Unhandled voice event:', event_type);
        twiMLResponse = generateGreetingTwiML();
    }

    return new Response(twiMLResponse, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Content-Type-Options': 'nosniff'
      }
    });

  } catch (error) {
    console.error('Telnyx webhook processing failed:', error);
    
    // Always return TwiML for voice webhooks
    const errorTwiML = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">We're experiencing technical difficulties. Please try again later.</Say>
  <Hangup/>
</Response>`;
    
    return new Response(errorTwiML, {
      status: 200, // Return 200 to avoid Telnyx retries
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  }
};
