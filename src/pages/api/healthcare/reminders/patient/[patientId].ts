// Get Patient Reminders API
// Retrieves all reminders for a patient

import type { APIRoute } from 'astro';
import { reminderService } from '../../../../../services/healthcare/reminderService';

export const GET: APIRoute = async ({ params }) => {
  try {
    const patientId = params.patientId || '';

    if (!patientId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing patientId'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const reminders = reminderService.getPatientReminders(patientId);

    return new Response(JSON.stringify({
      success: true,
      reminders: reminders.map(r => ({
        reminderId: r.reminderId,
        reminderType: r.reminderType,
        scheduledTime: r.scheduledTime,
        channels: r.channels,
        status: r.status,
        message: r.message
      }))
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Get reminders error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

