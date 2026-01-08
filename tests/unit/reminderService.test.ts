/**
 * Unit Tests for Reminder Service
 * Tests multi-channel reminder scheduling and sending
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { reminderService, type Reminder } from '../../src/services/healthcare/reminderService';

// Mock dependencies
vi.mock('../../src/services/compliance/auditEvidenceService', () => ({
  auditEvidenceService: {
    logEvent: vi.fn().mockResolvedValue({
      logId: 'log_123',
      timestamp: new Date(),
      eventHash: 'hash_123'
    })
  }
}));

// Mock fetch for Telnyx SMS API
global.fetch = vi.fn();

describe('Reminder Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.TELNYX_MESSAGING_API_KEY = 'test_sms_key';
    process.env.TELNYX_MESSAGING_PROFILE_ID = 'test_profile_id';
    process.env.TELNYX_FROM_NUMBER = '+18005551234';
    process.env.EMAIL_SERVICE_ENDPOINT = 'https://email.example.com/api/send';
  });

  describe('scheduleReminder', () => {
    it('should schedule reminder successfully', async () => {
      const reminder = await reminderService.scheduleReminder('tenant_001', {
        patientId: 'patient_123',
        reminderType: 'appointment',
        scheduledTime: new Date('2025-01-15T10:00:00Z'),
        channels: ['sms', 'email'],
        message: 'Appointment reminder'
      });

      expect(reminder.reminderId).toBeDefined();
      expect(reminder.patientId).toBe('patient_123');
      expect(reminder.reminderType).toBe('appointment');
      expect(reminder.status).toBe('pending');
      expect(reminder.channels).toEqual(['sms', 'email']);
    });

    it('should schedule medication reminder', async () => {
      const reminder = await reminderService.scheduleMedicationReminder(
        'tenant_001',
        'patient_123',
        'med_001',
        'Aspirin',
        '81mg daily',
        new Date('2025-01-15T08:00:00Z'),
        '+15551234567',
        ['sms']
      );

      expect(reminder.reminderType).toBe('medication');
      expect(reminder.metadata?.medicationId).toBe('med_001');
    });

    it('should schedule appointment reminder', async () => {
      const reminder = await reminderService.scheduleAppointmentReminder(
        'tenant_001',
        'patient_123',
        'appt_001',
        new Date('2025-01-16T14:00:00Z'),
        '2:00 PM',
        'Dr. Smith',
        'Main Clinic',
        '+15551234567',
        'patient@example.com',
        ['sms', 'email']
      );

      expect(reminder.reminderType).toBe('appointment');
      expect(reminder.metadata?.appointmentId).toBe('appt_001');
      expect(reminder.metadata?.confirmationRequired).toBe(true);
    });
  });

  describe('sendReminder', () => {
    it('should send SMS reminder via Telnyx', async () => {
      // Schedule reminder
      const reminder = await reminderService.scheduleReminder('tenant_001', {
        patientId: 'patient_123',
        reminderType: 'appointment',
        scheduledTime: new Date(),
        channels: ['sms'],
        message: 'Appointment reminder'
      });

      // Mock Telnyx SMS API response
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            id: 'msg_123',
            from: '+18005551234',
            to: '+15551234567',
            text: 'Appointment reminder'
          }
        })
      });

      const result = await reminderService.sendReminder(
        'tenant_001',
        reminder.reminderId,
        {
          phoneNumber: '+15551234567',
          provider: 'Dr. Smith',
          date: 'January 16, 2025',
          time: '2:00 PM',
          location: 'Main Clinic'
        }
      );

      expect(result.channelsSent).toContain('sms');
      expect(result.channelsFailed).toHaveLength(0);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle SMS sending failure gracefully', async () => {
      const reminder = await reminderService.scheduleReminder('tenant_001', {
        patientId: 'patient_123',
        reminderType: 'appointment',
        scheduledTime: new Date(),
        channels: ['sms', 'email'],
        message: 'Appointment reminder'
      });

      // Mock SMS failure
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Bad Request'
      });

      // Mock email success
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      const result = await reminderService.sendReminder(
        'tenant_001',
        reminder.reminderId,
        {
          phoneNumber: '+15551234567',
          email: 'patient@example.com'
        }
      );

      expect(result.channelsSent.length).toBeGreaterThan(0);
      expect(result.channelsFailed.length).toBeGreaterThan(0);
    });
  });

  describe('confirmReminder', () => {
    it('should confirm reminder', async () => {
      const reminder = await reminderService.scheduleReminder('tenant_001', {
        patientId: 'patient_123',
        reminderType: 'appointment',
        scheduledTime: new Date(),
        channels: ['sms'],
        message: 'Appointment reminder'
      });

      await reminderService.confirmReminder('tenant_001', reminder.reminderId, 'patient_123');

      const updatedReminder = reminderService['reminders'].get(reminder.reminderId);
      expect(updatedReminder?.status).toBe('confirmed');
      expect(updatedReminder?.confirmedAt).toBeDefined();
    });
  });

  describe('getPatientReminders', () => {
    it('should return reminders for patient', async () => {
      // Schedule multiple reminders
      await reminderService.scheduleReminder('tenant_001', {
        patientId: 'patient_123',
        reminderType: 'appointment',
        scheduledTime: new Date('2025-01-15T10:00:00Z'),
        channels: ['sms'],
        message: 'Reminder 1'
      });

      await reminderService.scheduleReminder('tenant_001', {
        patientId: 'patient_123',
        reminderType: 'medication',
        scheduledTime: new Date('2025-01-16T08:00:00Z'),
        channels: ['sms'],
        message: 'Reminder 2'
      });

      const reminders = reminderService.getPatientReminders('patient_123');
      expect(reminders.length).toBe(2);
      expect(reminders[0].scheduledTime.getTime()).toBeLessThan(reminders[1].scheduledTime.getTime());
    });
  });

  describe('getPendingReminders', () => {
    it('should return pending reminders scheduled for now or past', async () => {
      const pastTime = new Date();
      pastTime.setHours(pastTime.getHours() - 1);

      const futureTime = new Date();
      futureTime.setHours(futureTime.getHours() + 1);

      await reminderService.scheduleReminder('tenant_001', {
        patientId: 'patient_123',
        reminderType: 'appointment',
        scheduledTime: pastTime,
        channels: ['sms'],
        message: 'Past reminder'
      });

      await reminderService.scheduleReminder('tenant_001', {
        patientId: 'patient_123',
        reminderType: 'appointment',
        scheduledTime: futureTime,
        channels: ['sms'],
        message: 'Future reminder'
      });

      const pending = reminderService.getPendingReminders();
      expect(pending.length).toBe(1);
      expect(pending[0].scheduledTime.getTime()).toBeLessThanOrEqual(new Date().getTime());
    });
  });
});

