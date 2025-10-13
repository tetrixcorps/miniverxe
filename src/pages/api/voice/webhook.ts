// Voice Webhook API Endpoint
// Handles Telnyx webhook events and TeXML responses

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, url }) => {
  try {
    const pathname = url.pathname;
    
    if (pathname.includes('/texml')) {
      // TeXML webhook handler
      const body = await request.json();
      const { CallSid, From, To, CallStatus, Digits, SpeechResult } = body;
      
      console.log('TeXML webhook received:', {
        CallSid,
        From,
        To,
        CallStatus,
        Digits,
        SpeechResult
      });

      // Generate TeXML response
      let texmlResponse;
      
      if (CallStatus === 'in-progress') {
        if (Digits || SpeechResult) {
          // User provided input, generate AI response
          const userInput = SpeechResult || Digits;
          texmlResponse = {
            Response: {
              Say: {
                voice: 'female',
                language: 'en-US',
                text: `Thank you for saying "${userInput}". I'm SHANGO, your AI Super Agent. How can I help you today?`
              },
              Gather: {
                input: ['speech', 'dtmf'],
                numDigits: 1,
                timeout: 10,
                action: `${process.env.WEBHOOK_BASE_URL}/api/voice/texml`,
                method: 'POST'
              }
            }
          };
        } else {
          // No input yet, ask for input
          texmlResponse = {
            Response: {
              Say: {
                voice: 'female',
                language: 'en-US',
                text: 'Hello! This is SHANGO, your AI Super Agent. Please tell me how I can help you today, or press any key to continue.'
              },
              Gather: {
                input: ['speech', 'dtmf'],
                numDigits: 1,
                timeout: 10,
                action: `${process.env.WEBHOOK_BASE_URL}/api/voice/texml`,
                method: 'POST'
              }
            }
          };
        }
      } else {
        // Call ended or other status
        texmlResponse = {
          Response: {
            Hangup: {}
          }
        };
      }

      // Format TeXML response
      const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${texmlResponse.Response.Say.voice}" language="${texmlResponse.Response.Say.language}">
    ${texmlResponse.Response.Say.text}
  </Say>
  ${texmlResponse.Response.Gather ? `<Gather input="${texmlResponse.Response.Gather.input.join(',')}" numDigits="${texmlResponse.Response.Gather.numDigits}" timeout="${texmlResponse.Response.Gather.timeout}" action="${texmlResponse.Response.Gather.action}" method="${texmlResponse.Response.Gather.method}">
  </Gather>` : ''}
  ${texmlResponse.Response.Hangup ? '<Hangup/>' : ''}
</Response>`;

      return new Response(xmlContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/xml'
        }
      });
    } else {
      // Voice webhook handler
      const body = await request.json();
      const { event_type, data } = body;
      
      console.log('Voice webhook received:', {
        event_type,
        call_control_id: data?.call_control_id,
        timestamp: new Date().toISOString()
      });

      // Handle different event types
      switch (event_type) {
        case 'call.answered':
          console.log('Call answered:', data);
          break;
        case 'call.hangup':
          console.log('Call ended:', data);
          break;
        case 'call.recording.saved':
          console.log('Call recording saved:', data);
          break;
        case 'call.speak.started':
          console.log('Call speak started:', data);
          break;
        case 'call.speak.ended':
          console.log('Call speak ended:', data);
          break;
        case 'call.gather.ended':
          console.log('Call gather ended:', data);
          break;
        default:
          console.log('Unhandled voice event:', event_type);
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

  } catch (error) {
    console.error('Webhook processing failed:', error);
    
    if (url.pathname.includes('/texml')) {
      return new Response('<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>', {
        status: 500,
        headers: {
          'Content-Type': 'text/xml'
        }
      });
    } else {
      return new Response(JSON.stringify({ error: 'Webhook processing failed' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  }
};
