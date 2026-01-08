// List Agents Endpoint
// Returns list of all registered agents and their status

import type { APIRoute } from 'astro';
import { getAgentManagementService } from '../../../../services/callCenter/agentManagementService';

export const GET: APIRoute = async ({ request, url }) => {
  try {
    const agentService = getAgentManagementService();
    const statusFilter = url.searchParams.get('status') as 'available' | 'busy' | 'offline' | null;

    let agents;
    if (statusFilter) {
      agents = agentService.getAgentsByStatus(statusFilter);
    } else {
      agents = agentService.getAllAgents();
    }

    // Include metrics for each agent
    const agentsWithMetrics = agents.map(agent => {
      const metrics = agentService.getAgentMetrics(agent.agentId);
      return {
        ...agent,
        metrics: metrics || null
      };
    });

    return new Response(
      JSON.stringify({
        success: true,
        agents: agentsWithMetrics,
        total: agentsWithMetrics.length
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('List agents error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to list agents' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
