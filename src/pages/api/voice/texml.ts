// TeXML Response API Endpoint
// Handles TeXML response generation with security hardening

import type { APIRoute } from 'astro';

// Input sanitization function
function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return 'Hello! This is SHANGO, your AI Super Agent.';
  }
  
  return input
    .replace(/[<>]/g, '') // Remove potential XML/HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/&/g, '&amp;') // Escape ampersands
    .replace(/"/g, '&quot;') // Escape quotes
    .replace(/'/g, '&#39;') // Escape single quotes
    .trim()
    .substring(0, 500); // Limit length to prevent abuse
}

// XML validation function
function validateXML(xml: string): boolean {
  try {
    // Basic XML structure validation
    const hasXMLDeclaration = xml.includes('<?xml');
    const hasResponseTag = xml.includes('<Response>') && xml.includes('</Response>');
    const hasProperClosing = xml.split('<').length === xml.split('</').length;
    
    return hasXMLDeclaration && hasResponseTag && hasProperClosing;
  } catch {
    return false;
  }
}

// Generate secure TeXML response
function generateTeXMLResponse(message: string): string {
  const sanitizedMessage = sanitizeInput(message);
  const webhookUrl = process.env.WEBHOOK_BASE_URL || 'https://tetrixcorp.com';
  
  // Validate webhook URL
  const isValidUrl = /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(webhookUrl);
  const safeWebhookUrl = isValidUrl ? webhookUrl : 'https://tetrixcorp.com';
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="female" language="en-US">
    ${sanitizedMessage}
  </Say>
  <Gather input="speech,dtmf" numDigits="1" timeout="10" action="${safeWebhookUrl}/api/voice/texml" method="POST">
    <Say voice="female" language="en-US">
      Please tell me how I can help you today, or press any key to continue.
    </Say>
  </Gather>
</Response>`;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { message = 'Hello! This is SHANGO, your AI Super Agent.' } = body;

    // Generate TeXML response with security measures
    const texmlResponse = generateTeXMLResponse(message);
    
    // Validate the generated XML
    if (!validateXML(texmlResponse)) {
      console.error('Generated TeXML failed validation');
      return new Response('<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>', {
        status: 500,
        headers: {
          'Content-Type': 'text/xml',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'X-Content-Type-Options': 'nosniff'
        }
      });
    }

    return new Response(texmlResponse, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY'
      }
    });

  } catch (error) {
    console.error('TeXML generation failed:', error);
    
    // Log security-relevant errors
    if (error instanceof SyntaxError) {
      console.warn('Invalid JSON in TeXML request:', error.message);
    }
    
    return new Response('<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>', {
      status: 500,
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  }
};
