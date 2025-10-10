// TeXML Response API Endpoint
// Handles TeXML response generation

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { message = 'Hello! This is SHANGO, your AI Super Agent.' } = body;

    // Generate TeXML response
    const texmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="female" language="en-US">
    ${message}
  </Say>
  <Gather input="speech,dtmf" numDigits="1" timeout="10" action="${process.env.WEBHOOK_BASE_URL}/api/voice/texml" method="POST">
    <Say voice="female" language="en-US">
      Please tell me how I can help you today, or press any key to continue.
    </Say>
  </Gather>
</Response>`;

    return new Response(texmlResponse, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml'
      }
    });

  } catch (error) {
    console.error('TeXML generation failed:', error);
    return new Response('<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>', {
      status: 500,
      headers: {
        'Content-Type': 'text/xml'
      }
    });
  }
};
