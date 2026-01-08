// Reminder Scheduling API
// Schedules automated reminders for appointments, medications, etc.

import type { APIRoute } from 'astro';
import { reminderService } from '../../../../services/healthcare/reminderService';
import { auditEvidenceService } from '../../../../services/compliance/auditEvidenceService';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const {
      tenantId,
      patientId,
      reminderType,
      scheduledTime,
      channels,
      message,
      metadata
    } = body;

    if (!tenantId || !patientId || !reminderType || !scheduledTime) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: tenantId, patientId, reminderType, scheduledTime'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const reminder = await reminderService.scheduleReminder(tenantId, {
      patientId,
      reminderType,
      scheduledTime: new Date(scheduledTime),
      channels: channels || ['sms', 'email'],
      message: message || '',
      metadata
    });

    return new Response(JSON.stringify({
      success: true,
      reminder: {
        reminderId: reminder.reminderId,
        patientId: reminder.patientId,
        reminderType: reminder.reminderType,
        scheduledTime: reminder.scheduledTime,
        channels: reminder.channels,
        status: reminder.status
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Reminder scheduling error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

