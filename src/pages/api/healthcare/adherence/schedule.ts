// Medication Schedule API
// Creates a new medication schedule

import type { APIRoute } from 'astro';
import { medicationAdherenceService } from '../../../../services/healthcare/medicationAdherenceService';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const {
      tenantId,
      patientId,
      medicationId,
      medicationName,
      dosage,
      frequency,
      times,
      startDate,
      endDate,
      refillsRemaining,
      totalRefills,
      pharmacyId,
      pharmacyName,
      prescriberId,
      prescriberName,
      instructions
    } = body;

    if (!tenantId || !patientId || !medicationName || !dosage || !frequency) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: tenantId, patientId, medicationName, dosage, frequency'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const schedule = await medicationAdherenceService.createSchedule(tenantId, {
      patientId,
      medicationId: medicationId || `med_${Date.now()}`,
      medicationName,
      dosage,
      frequency,
      times: times || [],
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : undefined,
      refillsRemaining: refillsRemaining || 0,
      totalRefills: totalRefills || 0,
      pharmacyId,
      pharmacyName,
      prescriberId,
      prescriberName,
      instructions
    });

    return new Response(JSON.stringify({
      success: true,
      schedule: {
        scheduleId: schedule.scheduleId,
        patientId: schedule.patientId,
        medicationName: schedule.medicationName,
        dosage: schedule.dosage,
        frequency: schedule.frequency,
        times: schedule.times,
        status: schedule.status
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Schedule creation error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
