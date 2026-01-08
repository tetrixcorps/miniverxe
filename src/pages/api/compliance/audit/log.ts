// Audit Log API Endpoint
// POST /api/compliance/audit/log

import type { APIRoute } from 'astro';
import { auditEvidenceService, type AuditEvent } from '@/services/compliance';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json() as Omit<AuditEvent, 'logId' | 'timestamp' | 'eventHash' | 'previousHash'>;

    if (!body.tenantId || !body.callId || !body.eventType) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: tenantId, callId, eventType' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const event = await auditEvidenceService.logEvent(body);

    return new Response(JSON.stringify({ 
      success: true,
      logId: event.logId,
      eventHash: event.eventHash,
      timestamp: event.timestamp
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Audit log error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
