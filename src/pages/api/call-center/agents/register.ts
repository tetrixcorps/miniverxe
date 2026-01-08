// Agent Registration Endpoint
// Allows agents to register their SIP connections with the call center

import type { APIRoute } from 'astro';
import { getAgentManagementService } from '../../../../services/callCenter/agentManagementService';
import { getCallCenterService } from '../../../../services/callCenter';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const {
      agentId,
      sipConnectionId,
      sipUri,
      username,
      displayName
    } = body;

    // Validate required fields
    if (!agentId || !sipConnectionId || !sipUri || !username) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: agentId, sipConnectionId, sipUri, username' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const agentService = getAgentManagementService();

    // Register agent
    const agent = agentService.registerAgent({
      agentId,
      sipConnectionId,
      sipUri,
      username,
      displayName: displayName || username,
      registeredAt: new Date()
    });

    // Update call center service with new agent
    const callCenterService = getCallCenterService();
    callCenterService.addAgent(agent);

    return new Response(
      JSON.stringify({
        success: true,
        agent: {
          agentId: agent.agentId,
          sipConnectionId: agent.sipConnectionId,
          sipUri: agent.sipUri,
          username: agent.username,
          displayName: agent.displayName,
          status: agent.status
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Agent registration error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to register agent', details: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
