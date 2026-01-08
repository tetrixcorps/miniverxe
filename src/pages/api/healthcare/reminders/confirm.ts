// Reminder Confirmation API
// Patient confirms they received/acted on reminder

import type { APIRoute } from 'astro';
import { reminderService } from '../../../../services/healthcare/reminderService';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { tenantId, reminderId, confirmedBy } = body;

    if (!tenantId || !reminderId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: tenantId, reminderId'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await reminderService.confirmReminder(tenantId, reminderId, confirmedBy);

    return new Response(JSON.stringify({
      success: true,
      message: 'Reminder confirmed'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Reminder confirmation error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

