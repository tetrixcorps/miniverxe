// Call Center Dial Agents Handler
// Handles dialing multiple agents simultaneously

import type { APIRoute } from 'astro';
import { getCallCenterService } from '../../../services/callCenter';
import { getAgentManagementService } from '../../../services/callCenter/agentManagementService';

export const GET: APIRoute = async ({ request, url }) => {
  try {
    const callId = url.searchParams.get('callId') || '';
    
    if (!callId) {
      throw new Error('Call ID is required');
    }

    const callCenterService = getCallCenterService();
    const agentService = getAgentManagementService();

    // Update call center service with current available agents
    const availableAgents = agentService.getAvailableAgents();
    callCenterService.updateConfig({ agents: availableAgents });

    // Generate dial agents TeXML
    const texml = callCenterService.generateDialAgentsTeXML(callId, 1);

    return new Response(texml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error('Dial agents error:', error);
    
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
