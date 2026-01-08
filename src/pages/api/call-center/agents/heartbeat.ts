// Agent Heartbeat Endpoint
// Agents send periodic heartbeats to indicate they're online

import type { APIRoute } from 'astro';
import { getAgentManagementService } from '../../../../services/callCenter/agentManagementService';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { agentId, status } = body;

    if (!agentId) {
      return new Response(
        JSON.stringify({ error: 'agentId is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const agentService = getAgentManagementService();

    // Update heartbeat
    agentService.updateHeartbeat(agentId);

    // Update status if provided
    if (status && ['available', 'busy', 'offline'].includes(status)) {
      agentService.setAgentStatus(agentId, status as 'available' | 'busy' | 'offline');
    }

    return new Response(
      JSON.stringify({ success: true, timestamp: new Date().toISOString() }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Agent heartbeat error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process heartbeat' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
