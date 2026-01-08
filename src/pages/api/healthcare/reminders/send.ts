// Reminder Send API
// Manually trigger reminder sending (for testing or immediate sends)

import type { APIRoute } from 'astro';
import { reminderService } from '../../../../services/healthcare/reminderService';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { tenantId, reminderId, templateVariables } = body;

    if (!tenantId || !reminderId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: tenantId, reminderId'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await reminderService.sendReminder(
      tenantId,
      reminderId,
      templateVariables
    );

    return new Response(JSON.stringify({
      success: true,
      result
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Reminder send error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

