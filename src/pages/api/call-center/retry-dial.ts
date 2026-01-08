// Call Center Retry Dial Handler
// Handles retry dialing agents after first attempt fails

import type { APIRoute } from 'astro';
import { getCallCenterService } from '../../../services/callCenter';
import { getAgentManagementService } from '../../../services/callCenter/agentManagementService';

export const GET: APIRoute = async ({ request, url }) => {
  try {
    const callId = url.searchParams.get('callId') || '';
    const attempt = parseInt(url.searchParams.get('attempt') || '2', 10);
    
    if (!callId) {
      throw new Error('Call ID is required');
    }

    const callCenterService = getCallCenterService();
    const agentService = getAgentManagementService();

    // Update call center service with current available agents
    const availableAgents = agentService.getAvailableAgents();
    callCenterService.updateConfig({ agents: availableAgents });

    // Generate retry dial TeXML
    const texml = callCenterService.generateRetryDialTeXML(callId, attempt);

    return new Response(texml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error('Retry dial error:', error);
    
    const errorTexml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">We're sorry, but we're unable to connect you at this time. Please try again later.</Say>
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
