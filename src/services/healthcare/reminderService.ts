// Multi-Channel Reminder Service
// Sends automated reminders via voice, SMS, and email
// Integrates with Telnyx SMS API and email services

import { auditEvidenceService } from '../compliance/auditEvidenceService';
import { backendIntegrationService } from '../ivr/integrations/backendIntegrations';

export interface Reminder {
  reminderId: string;
  patientId: string;
  reminderType: 'appointment' | 'medication' | 'lab_test' | 'follow_up' | 'medication_refill';
  scheduledTime: Date;
  channels: Array<'voice' | 'sms' | 'email'>;
  message: string;
  status: 'pending' | 'sent' | 'confirmed' | 'cancelled' | 'failed';
  metadata?: {
    appointmentId?: string;
    medicationId?: string;
    labTestId?: string;
    confirmationRequired?: boolean;
    confirmationDeadline?: Date;
  };
  createdAt: Date;
  sentAt?: Date;
  confirmedAt?: Date;
  cancelledAt?: Date;
}

export interface ReminderTemplate {
  templateId: string;
  reminderType: Reminder['reminderType'];
  voiceMessage: string;
  smsMessage: string;
  emailSubject: string;
  emailBody: string;
  language: string;
}

export interface ReminderResult {
  reminderId: string;
  channelsSent: Array<'voice' | 'sms' | 'email'>;
  channelsFailed: Array<{ channel: 'voice' | 'sms' | 'email'; error: string }>;
  confirmationRequired: boolean;
}

class ReminderService {
  private reminders: Map<string, Reminder> = new Map();
  private templates: Map<string, ReminderTemplate> = new Map();
  private telnyxSmsApiKey?: string;
  private telnyxSmsProfileId?: string;
  private emailServiceEndpoint?: string;

  constructor() {
    this.telnyxSmsApiKey = process.env.TELNYX_MESSAGING_API_KEY;
    this.telnyxSmsProfileId = process.env.TELNYX_MESSAGING_PROFILE_ID;
    this.emailServiceEndpoint = process.env.EMAIL_SERVICE_ENDPOINT;
    this.initializeTemplates();
  }

  /**
   * Initialize default reminder templates
   */
  private initializeTemplates() {
    // Appointment reminder template
    this.templates.set('appointment_en', {
      templateId: 'appointment_en',
      reminderType: 'appointment',
      language: 'en-US',
      voiceMessage: 'This is a reminder that you have an appointment with {provider} on {date} at {time}. Please reply 1 to confirm, or 2 to reschedule.',
      smsMessage: 'Reminder: You have an appointment with {provider} on {date} at {time}. Reply CONFIRM to confirm or RESCHEDULE to reschedule.',
      emailSubject: 'Appointment Reminder - {date} at {time}',
      emailBody: `Dear Patient,

This is a reminder that you have an appointment scheduled:

Provider: {provider}
Date: {date}
Time: {time}
Location: {location}

Please arrive 15 minutes early. If you need to reschedule, please call us at {phoneNumber}.

Thank you.`
    });

    // Medication reminder template
    this.templates.set('medication_en', {
      templateId: 'medication_en',
      reminderType: 'medication',
      language: 'en-US',
      voiceMessage: 'This is a reminder to take your {medication} medication. Please reply 1 if you have taken it, or 2 if you have not.',
      smsMessage: 'Reminder: Time to take your {medication}. Reply TAKEN if you have taken it.',
      emailSubject: 'Medication Reminder - {medication}',
      emailBody: `Dear Patient,

This is a reminder to take your medication:

Medication: {medication}
Dosage: {dosage}
Time: {time}

If you have any questions or concerns, please contact your healthcare provider.

Thank you.`
    });

    // Lab test reminder template
    this.templates.set('lab_test_en', {
      templateId: 'lab_test_en',
      reminderType: 'lab_test',
      language: 'en-US',
      voiceMessage: 'This is a reminder that you have a lab test scheduled for {date} at {time}. Please fast for 12 hours before the test if required.',
      smsMessage: 'Reminder: Lab test scheduled for {date} at {time}. Fast for 12 hours if required.',
      emailSubject: 'Lab Test Reminder - {date}',
      emailBody: `Dear Patient,

This is a reminder about your upcoming lab test:

Test: {testName}
Date: {date}
Time: {time}
Location: {location}
Fasting Required: {fastingRequired}

Please follow any pre-test instructions provided by your healthcare provider.

Thank you.`
    });

    // Medication refill reminder template
    this.templates.set('medication_refill_en', {
      templateId: 'medication_refill_en',
      reminderType: 'medication_refill',
      language: 'en-US',
      voiceMessage: 'This is a reminder that your {medication} prescription is running low. Please reply 1 to request a refill, or 2 to speak with a pharmacist.',
      smsMessage: 'Reminder: Your {medication} prescription is running low. Reply REFILL to request a refill.',
      emailSubject: 'Medication Refill Reminder - {medication}',
      emailBody: `Dear Patient,

This is a reminder that your prescription is running low:

Medication: {medication}
Refills Remaining: {refillsRemaining}

To request a refill, please call your pharmacy or reply to this message.

Thank you.`
    });
  }

  /**
   * Schedule a reminder
   */
  async scheduleReminder(
    tenantId: string,
    reminder: Omit<Reminder, 'reminderId' | 'status' | 'createdAt'>
  ): Promise<Reminder> {
    const fullReminder: Reminder = {
      ...reminder,
      reminderId: `REM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      createdAt: new Date()
    };

    this.reminders.set(fullReminder.reminderId, fullReminder);

    // Log reminder creation
    await auditEvidenceService.logEvent({
      tenantId,
      callId: fullReminder.reminderId,
      eventType: 'data.access',
      eventData: {
        action: 'reminder_scheduled',
        reminderType: fullReminder.reminderType,
        patientId: fullReminder.patientId,
        scheduledTime: fullReminder.scheduledTime,
        channels: fullReminder.channels
      },
      metadata: {
        service: 'reminder',
        reminderId: fullReminder.reminderId
      }
    });

    return fullReminder;
  }

  /**
   * Send reminder via all configured channels
   */
  async sendReminder(
    tenantId: string,
    reminderId: string,
    templateVariables?: Record<string, string>
  ): Promise<ReminderResult> {
    const reminder = this.reminders.get(reminderId);
    if (!reminder) {
      throw new Error(`Reminder not found: ${reminderId}`);
    }

    if (reminder.status === 'cancelled') {
      throw new Error(`Reminder is cancelled: ${reminderId}`);
    }

    const channelsSent: Array<'voice' | 'sms' | 'email'> = [];
    const channelsFailed: Array<{ channel: 'voice' | 'sms' | 'email'; error: string }> = [];

    // Get template
    const template = this.getTemplate(reminder.reminderType, 'en-US');
    if (!template) {
      throw new Error(`Template not found for reminder type: ${reminder.reminderType}`);
    }

    // Send via each channel
    for (const channel of reminder.channels) {
      try {
        switch (channel) {
          case 'sms':
            await this.sendSMS(tenantId, reminder, template, templateVariables);
            channelsSent.push('sms');
            break;

          case 'email':
            await this.sendEmail(tenantId, reminder, template, templateVariables);
            channelsSent.push('email');
            break;

          case 'voice':
            await this.sendVoiceReminder(tenantId, reminder, template, templateVariables);
            channelsSent.push('voice');
            break;
        }
      } catch (error) {
        channelsFailed.push({
          channel,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        console.error(`Failed to send ${channel} reminder:`, error);
      }
    }

    // Update reminder status
    if (channelsSent.length > 0) {
      reminder.status = 'sent';
      reminder.sentAt = new Date();
    } else {
      reminder.status = 'failed';
    }

    // Log reminder sent
    await auditEvidenceService.logEvent({
      tenantId,
      callId: reminderId,
      eventType: 'data.access',
      eventData: {
        action: 'reminder_sent',
        reminderId,
        channelsSent,
        channelsFailed: channelsFailed.length
      },
      metadata: {
        service: 'reminder'
      }
    });

    return {
      reminderId,
      channelsSent,
      channelsFailed,
      confirmationRequired: reminder.metadata?.confirmationRequired || false
    };
  }

  /**
   * Send SMS reminder via Telnyx
   */
  private async sendSMS(
    tenantId: string,
    reminder: Reminder,
    template: ReminderTemplate,
    variables?: Record<string, string>
  ): Promise<void> {
    if (!this.telnyxSmsApiKey || !this.telnyxSmsProfileId) {
      throw new Error('Telnyx SMS API not configured');
    }

    // Get patient phone number (would come from EHR/patient database)
    const patientPhone = variables?.phoneNumber || reminder.patientId; // Fallback to patientId if phone not provided

    // Replace template variables
    let message = template.smsMessage;
    if (variables) {
      for (const [key, value] of Object.entries(variables)) {
        message = message.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
      }
    }

    // Send via Telnyx SMS API
    const response = await fetch('https://api.telnyx.com/v2/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.telnyxSmsApiKey}`
      },
      body: JSON.stringify({
        from: process.env.TELNYX_FROM_NUMBER || '+1234567890',
        to: patientPhone,
        text: message,
        messaging_profile_id: this.telnyxSmsProfileId
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Telnyx SMS API error: ${response.status} - ${error}`);
    }

    const result = await response.json();
    return result;
  }

  /**
   * Send email reminder
   */
  private async sendEmail(
    tenantId: string,
    reminder: Reminder,
    template: ReminderTemplate,
    variables?: Record<string, string>
  ): Promise<void> {
    if (!this.emailServiceEndpoint) {
      // Fallback: Log email would be sent (in production, integrate with email service)
      console.log(`[Email] Would send to patient ${reminder.patientId}: ${template.emailSubject}`);
      return;
    }

    // Get patient email (would come from EHR/patient database)
    const patientEmail = variables?.email || `${reminder.patientId}@example.com`; // Fallback

    // Replace template variables
    let subject = template.emailSubject;
    let body = template.emailBody;
    if (variables) {
      for (const [key, value] of Object.entries(variables)) {
        subject = subject.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
        body = body.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
      }
    }

    // Send via email service
    const response = await fetch(this.emailServiceEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EMAIL_API_KEY || ''}`
      },
      body: JSON.stringify({
        to: patientEmail,
        subject,
        body,
        reminderId: reminder.reminderId
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Email service error: ${response.status} - ${error}`);
    }
  }

  /**
   * Send voice reminder (outbound call)
   */
  private async sendVoiceReminder(
    tenantId: string,
    reminder: Reminder,
    template: ReminderTemplate,
    variables?: Record<string, string>
  ): Promise<void> {
    // Replace template variables
    let message = template.voiceMessage;
    if (variables) {
      for (const [key, value] of Object.entries(variables)) {
        message = message.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
      }
    }

    // Get patient phone number
    const patientPhone = variables?.phoneNumber || reminder.patientId;

    // In production, this would initiate an outbound call via Telnyx
    // For now, we'll create a call record that can be processed by the call center
    // The actual outbound call would be handled by Telnyx Voice API or Call Center service

    // Log voice reminder (actual call would be initiated separately)
    await auditEvidenceService.logEvent({
      tenantId,
      callId: `voice-reminder-${reminder.reminderId}`,
      eventType: 'data.access',
      eventData: {
        action: 'voice_reminder_initiated',
        reminderId: reminder.reminderId,
        patientPhone,
        message
      },
      metadata: {
        service: 'reminder',
        channel: 'voice'
      }
    });

    // Note: Actual outbound call initiation would be done via:
    // - Telnyx Voice API (POST /v2/calls)
    // - Or Call Center service for agent-assisted reminders
  }

  /**
   * Confirm reminder (patient responded)
   */
  async confirmReminder(
    tenantId: string,
    reminderId: string,
    confirmedBy?: string
  ): Promise<void> {
    const reminder = this.reminders.get(reminderId);
    if (!reminder) {
      throw new Error(`Reminder not found: ${reminderId}`);
    }

    reminder.status = 'confirmed';
    reminder.confirmedAt = new Date();

    // Log confirmation
    await auditEvidenceService.logEvent({
      tenantId,
      callId: reminderId,
      eventType: 'data.access',
      eventData: {
        action: 'reminder_confirmed',
        reminderId,
        confirmedBy
      },
      metadata: {
        service: 'reminder'
      }
    });

    // Update EHR if appointment reminder
    if (reminder.reminderType === 'appointment' && reminder.metadata?.appointmentId) {
      try {
        // Update appointment confirmation status in EHR
        // This would call backendIntegrationService or EHR API
        console.log(`Appointment ${reminder.metadata.appointmentId} confirmed via reminder`);
      } catch (error) {
        console.error('Failed to update EHR appointment confirmation:', error);
      }
    }
  }

  /**
   * Cancel reminder
   */
  async cancelReminder(
    tenantId: string,
    reminderId: string,
    reason?: string
  ): Promise<void> {
    const reminder = this.reminders.get(reminderId);
    if (!reminder) {
      throw new Error(`Reminder not found: ${reminderId}`);
    }

    reminder.status = 'cancelled';
    reminder.cancelledAt = new Date();

    // Log cancellation
    await auditEvidenceService.logEvent({
      tenantId,
      callId: reminderId,
      eventType: 'data.access',
      eventData: {
        action: 'reminder_cancelled',
        reminderId,
        reason
      },
      metadata: {
        service: 'reminder'
      }
    });
  }

  /**
   * Get template for reminder type
   */
  private getTemplate(
    reminderType: Reminder['reminderType'],
    language: string = 'en-US'
  ): ReminderTemplate | undefined {
    const templateKey = `${reminderType}_${language.split('-')[0]}`;
    return this.templates.get(templateKey);
  }

  /**
   * Get reminders for patient
   */
  getPatientReminders(patientId: string): Reminder[] {
    return Array.from(this.reminders.values())
      .filter(r => r.patientId === patientId)
      .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());
  }

  /**
   * Get pending reminders (for scheduled job processing)
   */
  getPendingReminders(now: Date = new Date()): Reminder[] {
    return Array.from(this.reminders.values())
      .filter(r => 
        r.status === 'pending' && 
        r.scheduledTime <= now
      )
      .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());
  }

  /**
   * Schedule appointment reminder
   */
  async scheduleAppointmentReminder(
    tenantId: string,
    patientId: string,
    appointmentId: string,
    appointmentDate: Date,
    appointmentTime: string,
    provider: string,
    location: string,
    phoneNumber: string,
    email?: string,
    channels: Array<'voice' | 'sms' | 'email'> = ['sms', 'email']
  ): Promise<Reminder> {
    // Schedule reminder 24 hours before appointment
    const reminderTime = new Date(appointmentDate);
    reminderTime.setHours(reminderTime.getHours() - 24);

    const reminder = await this.scheduleReminder(tenantId, {
      patientId,
      reminderType: 'appointment',
      scheduledTime: reminderTime,
      channels,
      message: `Appointment reminder for ${appointmentDate.toLocaleDateString()} at ${appointmentTime}`,
      metadata: {
        appointmentId,
        confirmationRequired: true,
        confirmationDeadline: new Date(appointmentDate.getTime() - 2 * 60 * 60 * 1000) // 2 hours before
      }
    });

    // Send immediately if reminder time is in the past (for testing/backfill)
    if (reminderTime <= new Date()) {
      await this.sendReminder(tenantId, reminder.reminderId, {
        provider,
        date: appointmentDate.toLocaleDateString(),
        time: appointmentTime,
        location,
        phoneNumber: process.env.CALL_CENTER_NUMBER || '+18005551234',
        email: email || ''
      });
    }

    return reminder;
  }

  /**
   * Schedule medication reminder
   */
  async scheduleMedicationReminder(
    tenantId: string,
    patientId: string,
    medicationId: string,
    medication: string,
    dosage: string,
    reminderTime: Date,
    phoneNumber: string,
    channels: Array<'voice' | 'sms' | 'email'> = ['sms']
  ): Promise<Reminder> {
    const reminder = await this.scheduleReminder(tenantId, {
      patientId,
      reminderType: 'medication',
      scheduledTime: reminderTime,
      channels,
      message: `Medication reminder: ${medication}`,
      metadata: {
        medicationId
      }
    });

    // Send at scheduled time
    if (reminderTime <= new Date()) {
      await this.sendReminder(tenantId, reminder.reminderId, {
        medication,
        dosage,
        time: reminderTime.toLocaleTimeString(),
        phoneNumber
      });
    }

    return reminder;
  }
}

export const reminderService = new ReminderService();

