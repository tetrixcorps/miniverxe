// Text Redaction API Endpoint
// POST /api/compliance/redact/text

import type { APIRoute } from 'astro';
import { redactionDLPService, type RedactionRequest } from '@/services/compliance';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json() as RedactionRequest;

    if (!body.content || !body.tenantId || !body.dataTypes || body.dataTypes.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: content, tenantId, dataTypes' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await redactionDLPService.redactText(body);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Redaction error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
