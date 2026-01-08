// Call Center Voicemail Handler
// Handles voicemail recording when no agents are available

import type { APIRoute } from 'astro';
import { getCallCenterService } from '../../../services/callCenter';

export const GET: APIRoute = async ({ request, url }) => {
  try {
    const callId = url.searchParams.get('callId') || '';
    
    if (!callId) {
      throw new Error('Call ID is required');
    }

    const callCenterService = getCallCenterService();

    // Generate voicemail TeXML
    const texml = callCenterService.generateVoicemailTeXML(callId);

    return new Response(texml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error('Voicemail error:', error);
    
    const errorTexml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">We're sorry, but we're unable to take your message at this time. Please try again later.</Say>
  <Hangup/>
</Response>`;

    return new Response(errorTexml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml; charset=utf-8'
      }
    });
  }
};
