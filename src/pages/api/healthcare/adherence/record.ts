// Record Medication Taken API
// Records that patient took medication

import type { APIRoute } from 'astro';
import { medicationAdherenceService } from '../../../../services/healthcare/medicationAdherenceService';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const {
      tenantId,
      scheduleId,
      actualTime,
      sideEffects,
      notes
    } = body;

    if (!tenantId || !scheduleId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: tenantId, scheduleId'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const record = await medicationAdherenceService.recordMedicationTaken(
      tenantId,
      scheduleId,
      actualTime ? new Date(actualTime) : undefined,
      'manual',
      sideEffects,
      notes
    );

    return new Response(JSON.stringify({
      success: true,
      record: {
        recordId: record.recordId,
        scheduleId: record.scheduleId,
        status: record.status,
        actualTime: record.actualTime,
        sideEffects: record.sideEffects
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Medication recording error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
