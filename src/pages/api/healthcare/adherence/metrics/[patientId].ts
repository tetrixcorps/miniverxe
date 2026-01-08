// Adherence Metrics API
// Gets adherence metrics for a patient

import type { APIRoute } from 'astro';
import { medicationAdherenceService } from '../../../../../services/healthcare/medicationAdherenceService';

export const GET: APIRoute = async ({ params, url }) => {
  try {
    const patientId = params.patientId || '';
    const scheduleId = url.searchParams.get('scheduleId') || undefined;
    
    // Get period from query params (default: last 7 days)
    const days = parseInt(url.searchParams.get('days') || '7', 10);
    const periodEnd = new Date();
    const periodStart = new Date(periodEnd.getTime() - days * 24 * 60 * 60 * 1000);

    if (!patientId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing patientId'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const metrics = await medicationAdherenceService.calculateAdherenceMetrics(
      patientId,
      scheduleId,
      periodStart,
      periodEnd
    );

    return new Response(JSON.stringify({
      success: true,
      metrics: {
        ...metrics,
        periodStart: metrics.periodStart.toISOString(),
        periodEnd: metrics.periodEnd.toISOString(),
        lastTaken: metrics.lastTaken?.toISOString(),
        lastMissed: metrics.lastMissed?.toISOString()
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Get metrics error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
