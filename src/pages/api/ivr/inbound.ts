// IVR Inbound Webhook Handler
// Handles incoming calls and routes to appropriate IVR flow based on industry

import type { APIRoute } from 'astro';
import { ivrService } from '../../../services/ivr/ivrService';

export const GET: APIRoute = async ({ request, url }) => {
  try {
    // Parse query parameters from Telnyx
    const from = url.searchParams.get('From') || '';
    const to = url.searchParams.get('To') || '';
    const callControlId = url.searchParams.get('CallControlId') || '';
    
    // Determine industry from phone number or configuration
    // In production, this would be configured per phone number
    const industry = determineIndustry(to, from);
    
    // Create IVR configuration
    const config = {
      industry,
      language: 'en-US',
      enableSpeechRecognition: true,
      enableDTMF: true,
      timeout: 10,
      maxRetries: 3,
      webhookUrl: `${url.origin}/api/ivr`
    };

    // Create new IVR session
    const session = ivrService.createSession(config, callControlId, from, to);

    // Get initial TeXML response
    const texml = ivrService.getCurrentStepTeXML(session.sessionId);

    console.log('IVR inbound call:', {
      sessionId: session.sessionId,
      from,
      to,
      industry,
      callControlId
    });

    return new Response(texml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error('IVR inbound error:', error);
    
    // Return error TeXML
    const errorTeXML = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">We're experiencing technical difficulties. Please try again later.</Say>
  <Hangup/>
</Response>`;
    
    return new Response(errorTeXML, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
};

/**
 * Determine industry from phone number or configuration
 * In production, this would query a database or configuration service
 */
function determineIndustry(to: string, from: string): string {
  // Check if phone number is configured for specific industry
  // This is a simplified example - in production, use a database lookup
  
  // Healthcare numbers might start with specific prefixes
  if (to.includes('800') || to.includes('855')) {
    // Could check against configured numbers
    return 'healthcare';
  }
  
  // Default to general/retail for now
  // In production, this would be configured per phone number
  return 'retail';
}

