// Get Patient Schedules API
// Retrieves all medication schedules for a patient

import type { APIRoute } from 'astro';
import { medicationAdherenceService } from '../../../../../services/healthcare/medicationAdherenceService';

export const GET: APIRoute = async ({ params, url }) => {
  try {
    const patientId = params.patientId || '';
    const activeOnly = url.searchParams.get('activeOnly') !== 'false';

    if (!patientId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing patientId'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const schedules = medicationAdherenceService.getPatientSchedules(patientId, activeOnly);

    return new Response(JSON.stringify({
      success: true,
      schedules: schedules.map(s => ({
        scheduleId: s.scheduleId,
        medicationName: s.medicationName,
        dosage: s.dosage,
        frequency: s.frequency,
        times: s.times,
        startDate: s.startDate.toISOString(),
        endDate: s.endDate?.toISOString(),
        refillsRemaining: s.refillsRemaining,
        status: s.status
      }))
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Get schedules error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
