// Call Center Inbound Webhook Handler
// Handles incoming calls to the call center number

import type { APIRoute } from 'astro';
import { getCallCenterService, initializeCallCenterService } from '../../../services/callCenter';
import { auditEvidenceService } from '../../../services/compliance';
import { getEnvironmentConfig } from '../../../config/environment';

export const GET: APIRoute = async ({ request, url }) => {
  try {
    // Parse Telnyx webhook parameters
    const from = url.searchParams.get('From') || '';
    const to = url.searchParams.get('To') || '';
    const callControlId = url.searchParams.get('CallControlId') || '';
    const callSessionId = url.searchParams.get('CallSessionId') || callControlId;
    
    // Get environment config
    const envConfig = getEnvironmentConfig();
    
    // Initialize call center service if not already initialized
    let callCenterService;
    try {
      callCenterService = getCallCenterService();
    } catch (error) {
      // Initialize with default config from environment
      const config = {
        callCenterNumber: to,
        outboundProfileId: process.env.TELNYX_OUTBOUND_PROFILE_ID || '',
        maxDialAttempts: 2,
        dialTimeout: 30,
        voicemailEnabled: true,
        recordingEnabled: true,
        webhookBaseUrl: envConfig.webhookBaseUrl,
        agents: [] // Will be populated from agent management service
      };
      callCenterService = initializeCallCenterService(config);
    }

    // Create call record
    const call = callCenterService.createCall(callSessionId, from, to, callControlId);

    // Log audit event
    await auditEvidenceService.logEvent({
      eventType: 'call.initiated',
      tenantId: 'default', // TODO: Determine from phone number
      sessionId: callSessionId,
      eventData: {
        from,
        to,
        callControlId,
        callType: 'call_center_inbound'
      },
      metadata: {
        service: 'call_center',
        direction: 'inbound'
      }
    });

    // Generate greeting TeXML
    const texml = callCenterService.generateInboundGreeting(callSessionId);

    // Create Response with headers using Headers() for proper API compatibility
    const headers = new Headers();
    headers.set('Content-Type', 'text/xml; charset=utf-8');
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');

    return new Response(texml, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Call Center inbound error:', error);
    
    // Return error TeXML
    const errorTexml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">We're sorry, but we're experiencing technical difficulties. Please try again later.</Say>
  <Hangup/>
</Response>`;

    const errorHeadersObj: Record<string, string> = {
      'Content-Type': 'text/xml; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    };

    return new Response(errorTexml, {
      status: 200, // Return 200 to Telnyx even on error
      headers: errorHeadersObj
    });
  }
};
