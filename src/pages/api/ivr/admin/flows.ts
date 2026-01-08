// IVR Admin API - Flow Management
// CRUD operations for IVR call flows

import type { APIRoute } from 'astro';
import { ivrService, type IVRCallFlow } from '@/services/ivr';

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const flowId = url.searchParams.get('flowId');
    const industry = url.searchParams.get('industry');

    if (flowId) {
      // Get specific flow
      const flow = ivrService.getFlow(flowId);
      if (!flow) {
        return new Response(JSON.stringify({ error: 'Flow not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify({ flow }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get all flows (filtered by industry if provided)
    // Note: In production, this would query a database
    // For now, we'll return the default flows
    const defaultFlows: IVRCallFlow[] = [
      {
        id: 'healthcare_main',
        name: 'Healthcare Main Menu',
        industry: 'healthcare',
        steps: []
      },
      {
        id: 'insurance_main',
        name: 'Insurance Main Menu',
        industry: 'insurance',
        steps: []
      },
      {
        id: 'retail_main',
        name: 'Retail Main Menu',
        industry: 'retail',
        steps: []
      },
      {
        id: 'construction_main',
        name: 'Construction Main Menu',
        industry: 'construction',
        steps: []
      },
      {
        id: 'real_estate_main',
        name: 'Real Estate Main Menu',
        industry: 'real_estate',
        steps: []
      }
    ];

    const flows = industry
      ? defaultFlows.filter(f => f.industry === industry)
      : defaultFlows;

    return new Response(JSON.stringify({ flows }), {
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
    const flow: IVRCallFlow = body.flow;

    if (!flow.id || !flow.name || !flow.industry) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Register the flow
    ivrService.registerFlow(flow);

    return new Response(JSON.stringify({ success: true, flow }), {
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
    const flow: IVRCallFlow = body.flow;

    if (!flow.id) {
      return new Response(JSON.stringify({ error: 'Flow ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update the flow
    ivrService.registerFlow(flow);

    return new Response(JSON.stringify({ success: true, flow }), {
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

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const flowId = url.searchParams.get('flowId');

    if (!flowId) {
      return new Response(JSON.stringify({ error: 'Flow ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Note: In production, this would delete from database
    // For now, we'll just return success
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
