// Dashboard Action Audit Logging API
// Logs dashboard actions for compliance

import type { APIRoute } from 'astro';
import { dashboardAuditService, type DashboardAction } from '@/services/compliance/dashboardAuditService';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json() as DashboardAction;

    if (!body.action || !body.tenantId || !body.industry) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: action, tenantId, industry' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await dashboardAuditService.logDashboardAction(body);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Dashboard action logged'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Dashboard audit logging error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
