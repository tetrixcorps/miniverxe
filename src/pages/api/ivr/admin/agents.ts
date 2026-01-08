// IVR Admin API - Agent Management
// CRUD operations for IVR agents

import type { APIRoute } from 'astro';
import { callForwardingService, type Agent } from '@/services/ivr';

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const agentId = url.searchParams.get('agentId');
    const industry = url.searchParams.get('industry');

    if (agentId) {
      // Get specific agent
      const agent = callForwardingService.getAgent(agentId);
      if (!agent) {
        return new Response(JSON.stringify({ error: 'Agent not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify({ agent }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get agents (filtered by industry if provided)
    const agents = industry
      ? callForwardingService.getAgentsByIndustry(industry)
      : Array.from(callForwardingService.getAgentsByIndustry('healthcare'))
          .concat(callForwardingService.getAgentsByIndustry('insurance'))
          .concat(callForwardingService.getAgentsByIndustry('retail'))
          .concat(callForwardingService.getAgentsByIndustry('construction'))
          .concat(callForwardingService.getAgentsByIndustry('real_estate'));

    return new Response(JSON.stringify({ agents }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const agent: Agent = body.agent;

    if (!agent.id || !agent.name || !agent.industry || !agent.department) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Register the agent
    callForwardingService.registerAgent(agent);

    return new Response(JSON.stringify({ success: true, agent }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { agentId, status } = body;

    if (!agentId || !status) {
      return new Response(JSON.stringify({ error: 'Agent ID and status are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update agent status
    callForwardingService.updateAgentStatus(agentId, status);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
