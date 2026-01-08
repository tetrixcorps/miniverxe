// Policy Evaluation API Endpoint
// POST /api/compliance/policy/evaluate

import type { APIRoute } from 'astro';
import { policyEngineService, type PolicyEvaluationRequest } from '@/services/compliance';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json() as PolicyEvaluationRequest;

    if (!body.callId || !body.tenantId || !body.currentStep) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: callId, tenantId, currentStep' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const action = await policyEngineService.evaluatePolicy(body);

    return new Response(JSON.stringify({ action }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Policy evaluation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
