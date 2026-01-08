// Medication Refill Request API
// Requests a medication refill

import type { APIRoute } from 'astro';
import { medicationAdherenceService } from '../../../../services/healthcare/medicationAdherenceService';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { tenantId, scheduleId, requestedBy } = body;

    if (!tenantId || !scheduleId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: tenantId, scheduleId'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await medicationAdherenceService.requestRefill(
      tenantId,
      scheduleId,
      requestedBy
    );

    return new Response(JSON.stringify({
      success: result.success,
      message: result.message,
      refillId: result.refillId
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Refill request error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
