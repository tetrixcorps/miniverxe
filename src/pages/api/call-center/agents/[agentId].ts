// Agent Management Endpoint
// Get, update, or delete specific agent

import type { APIRoute } from 'astro';
import { getAgentManagementService } from '../../../../services/callCenter/agentManagementService';
import { getCallCenterService } from '../../../../services/callCenter';

export const GET: APIRoute = async ({ params }) => {
  try {
    const agentId = params.agentId;
    if (!agentId) {
      return new Response(
        JSON.stringify({ error: 'agentId is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const agentService = getAgentManagementService();
    const agent = agentService.getAgent(agentId);
    const metrics = agentService.getAgentMetrics(agentId);

    if (!agent) {
      return new Response(
        JSON.stringify({ error: 'Agent not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        agent: {
          ...agent,
          metrics: metrics || null
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Get agent error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get agent' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const agentId = params.agentId;
    if (!agentId) {
      return new Response(
        JSON.stringify({ error: 'agentId is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { status, displayName } = body;

    const agentService = getAgentManagementService();
    const agent = agentService.getAgent(agentId);

    if (!agent) {
      return new Response(
        JSON.stringify({ error: 'Agent not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update status if provided
    if (status && ['available', 'busy', 'offline'].includes(status)) {
      agentService.setAgentStatus(agentId, status as 'available' | 'busy' | 'offline');
    }

    // Update display name if provided
    if (displayName) {
      agent.displayName = displayName;
    }

    return new Response(
      JSON.stringify({
        success: true,
        agent: agentService.getAgent(agentId)
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Update agent error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update agent' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const agentId = params.agentId;
    if (!agentId) {
      return new Response(
        JSON.stringify({ error: 'agentId is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const agentService = getAgentManagementService();
    const callCenterService = getCallCenterService();

    const removed = agentService.unregisterAgent(agentId);
    callCenterService.removeAgent(agentId);

    if (!removed) {
      return new Response(
        JSON.stringify({ error: 'Agent not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Agent unregistered successfully' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Delete agent error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete agent' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
