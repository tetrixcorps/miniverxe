/**
 * Unit Tests for Medication Adherence Service
 * Tests medication schedule tracking, adherence monitoring, and refill processing
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { medicationAdherenceService, type MedicationSchedule } from '../../src/services/healthcare/medicationAdherenceService';

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

vi.mock('../../src/services/healthcare/reminderService', () => ({
  reminderService: {
    scheduleMedicationReminder: vi.fn().mockResolvedValue({
      reminderId: 'rem_123',
      status: 'pending'
    })
  }
}));

vi.mock('../../src/services/healthcare/clinicalWorkflowService', () => ({
  clinicalWorkflowService: {
    evaluateAndTrigger: vi.fn().mockResolvedValue({
      triggered: false,
      actionsExecuted: 0
    })
  }
}));

vi.mock('../../src/services/healthcare/ehrDocumentationService', () => ({
  ehrDocumentationService: {
    createStructuredNote: vi.fn().mockReturnValue({
      patientId: 'patient_123',
      noteType: 'side_effect',
      structuredData: {},
      timestamp: new Date()
    }),
    documentToEHR: vi.fn().mockResolvedValue({
      success: true,
      noteId: 'note_123'
    })
  }
}));

vi.mock('../../src/services/ivr/integrations/backendIntegrations', () => ({
  backendIntegrationService: {
    processPrescriptionRefill: vi.fn().mockResolvedValue({
      success: true,
      refillId: 'refill_123',
      message: 'Refill processed successfully'
    })
  }
}));

describe('Medication Adherence Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createSchedule', () => {
    it('should create medication schedule successfully', async () => {
      const schedule = await medicationAdherenceService.createSchedule('tenant_001', {
        patientId: 'patient_123',
        medicationId: 'med_001',
        medicationName: 'Aspirin',
        dosage: '81mg',
        frequency: 'once_daily',
        times: ['09:00'],
        startDate: new Date('2025-01-15'),
        refillsRemaining: 3,
        totalRefills: 3
      });

      expect(schedule.scheduleId).toBeDefined();
      expect(schedule.patientId).toBe('patient_123');
      expect(schedule.medicationName).toBe('Aspirin');
      expect(schedule.status).toBe('active');
      expect(schedule.times).toEqual(['09:00']);
    });

    it('should set default times based on frequency', async () => {
      const schedule = await medicationAdherenceService.createSchedule('tenant_001', {
        patientId: 'patient_123',
        medicationId: 'med_001',
        medicationName: 'Metformin',
        dosage: '500mg',
        frequency: 'twice_daily',
        times: [], // Empty - should use defaults
        startDate: new Date(),
        refillsRemaining: 0,
        totalRefills: 0
      });

      expect(schedule.times.length).toBe(2);
      expect(schedule.times).toContain('08:00');
      expect(schedule.times).toContain('20:00');
    });
  });

  describe('recordMedicationTaken', () => {
    it('should record medication taken on time', async () => {
      const schedule = await medicationAdherenceService.createSchedule('tenant_001', {
        patientId: 'patient_123',
        medicationId: 'med_001',
        medicationName: 'Aspirin',
        dosage: '81mg',
        frequency: 'once_daily',
        times: ['09:00'],
        startDate: new Date(),
        refillsRemaining: 0,
        totalRefills: 0
      });

      const record = await medicationAdherenceService.recordMedicationTaken(
        'tenant_001',
        schedule.scheduleId,
        new Date(),
        'voice'
      );

      expect(record.status).toBe('taken');
      expect(record.scheduleId).toBe(schedule.scheduleId);
      expect(record.confirmationMethod).toBe('voice');
    });

    it('should record medication as late if taken more than 60 minutes after scheduled time', async () => {
      const schedule = await medicationAdherenceService.createSchedule('tenant_001', {
        patientId: 'patient_123',
        medicationId: 'med_001',
        medicationName: 'Aspirin',
        dosage: '81mg',
        frequency: 'once_daily',
        times: ['09:00'],
        startDate: new Date(),
        refillsRemaining: 0,
        totalRefills: 0
      });

      // Create a time 2 hours after 9 AM
      const lateTime = new Date();
      lateTime.setHours(11, 0, 0, 0);

      const record = await medicationAdherenceService.recordMedicationTaken(
        'tenant_001',
        schedule.scheduleId,
        lateTime,
        'voice'
      );

      expect(record.status).toBe('late');
    });

    it('should record side effects when provided', async () => {
      const schedule = await medicationAdherenceService.createSchedule('tenant_001', {
        patientId: 'patient_123',
        medicationId: 'med_001',
        medicationName: 'Aspirin',
        dosage: '81mg',
        frequency: 'once_daily',
        times: ['09:00'],
        startDate: new Date(),
        refillsRemaining: 0,
        totalRefills: 0
      });

      const record = await medicationAdherenceService.recordMedicationTaken(
        'tenant_001',
        schedule.scheduleId,
        new Date(),
        'voice',
        ['nausea', 'dizziness'],
        'Feeling unwell after taking medication'
      );

      expect(record.sideEffects).toEqual(['nausea', 'dizziness']);
      expect(record.notes).toContain('Feeling unwell');
    });
  });

  describe('initiateAdherenceCheck', () => {
    it('should initiate adherence check call', async () => {
      const schedule = await medicationAdherenceService.createSchedule('tenant_001', {
        patientId: 'patient_123',
        medicationId: 'med_001',
        medicationName: 'Aspirin',
        dosage: '81mg',
        frequency: 'once_daily',
        times: ['09:00'],
        startDate: new Date(),
        refillsRemaining: 0,
        totalRefills: 0
      });

      const check = await medicationAdherenceService.initiateAdherenceCheck(
        'tenant_001',
        schedule.scheduleId,
        'automated_call'
      );

      expect(check.checkId).toBeDefined();
      expect(check.scheduleId).toBe(schedule.scheduleId);
      expect(check.patientId).toBe('patient_123');
      expect(check.status).toBe('pending');
      expect(check.checkType).toBe('automated_call');
    });
  });

  describe('completeAdherenceCheck', () => {
    it('should complete check and record medication taken', async () => {
      const schedule = await medicationAdherenceService.createSchedule('tenant_001', {
        patientId: 'patient_123',
        medicationId: 'med_001',
        medicationName: 'Aspirin',
        dosage: '81mg',
        frequency: 'once_daily',
        times: ['09:00'],
        startDate: new Date(),
        refillsRemaining: 0,
        totalRefills: 0
      });

      const check = await medicationAdherenceService.initiateAdherenceCheck(
        'tenant_001',
        schedule.scheduleId
      );

      await medicationAdherenceService.completeAdherenceCheck(
        'tenant_001',
        check.checkId,
        {
          taken: true,
          timeTaken: new Date()
        }
      );

      const updatedCheck = medicationAdherenceService.getCheck(check.checkId);
      expect(updatedCheck?.status).toBe('completed');
      expect(updatedCheck?.response?.taken).toBe(true);
    });

    it('should record missed medication if not taken', async () => {
      const schedule = await medicationAdherenceService.createSchedule('tenant_001', {
        patientId: 'patient_123',
        medicationId: 'med_001',
        medicationName: 'Aspirin',
        dosage: '81mg',
        frequency: 'once_daily',
        times: ['09:00'],
        startDate: new Date(),
        refillsRemaining: 0,
        totalRefills: 0
      });

      const check = await medicationAdherenceService.initiateAdherenceCheck(
        'tenant_001',
        schedule.scheduleId
      );

      await medicationAdherenceService.completeAdherenceCheck(
        'tenant_001',
        check.checkId,
        {
          taken: false,
          notes: 'Patient forgot to take medication'
        }
      );

      const records = medicationAdherenceService.getPatientAdherenceRecords('patient_123', schedule.scheduleId);
      const missedRecord = records.find(r => r.status === 'missed');
      expect(missedRecord).toBeDefined();
    });
  });

  describe('reportSideEffects', () => {
    it('should create side effect report', async () => {
      const schedule = await medicationAdherenceService.createSchedule('tenant_001', {
        patientId: 'patient_123',
        medicationId: 'med_001',
        medicationName: 'Aspirin',
        dosage: '81mg',
        frequency: 'once_daily',
        times: ['09:00'],
        startDate: new Date(),
        refillsRemaining: 0,
        totalRefills: 0
      });

      const report = await medicationAdherenceService.reportSideEffects(
        'tenant_001',
        'patient_123',
        schedule.scheduleId,
        'Aspirin',
        ['nausea', 'headache'],
        'moderate'
      );

      expect(report.reportId).toBeDefined();
      expect(report.sideEffects).toEqual(['nausea', 'headache']);
      expect(report.severity).toBe('moderate');
    });
  });

  describe('requestRefill', () => {
    it('should request refill successfully', async () => {
      const schedule = await medicationAdherenceService.createSchedule('tenant_001', {
        patientId: 'patient_123',
        medicationId: 'med_001',
        medicationName: 'Aspirin',
        dosage: '81mg',
        frequency: 'once_daily',
        times: ['09:00'],
        startDate: new Date(),
        refillsRemaining: 3,
        totalRefills: 3,
        pharmacyId: 'pharmacy_001'
      });

      const result = await medicationAdherenceService.requestRefill(
        'tenant_001',
        schedule.scheduleId,
        'patient_123'
      );

      expect(result.success).toBe(true);
      expect(result.refillId).toBeDefined();
      
      const updatedSchedule = medicationAdherenceService.getSchedule(schedule.scheduleId);
      expect(updatedSchedule?.refillsRemaining).toBe(2);
    });

    it('should reject refill if no refills remaining', async () => {
      const schedule = await medicationAdherenceService.createSchedule('tenant_001', {
        patientId: 'patient_123',
        medicationId: 'med_001',
        medicationName: 'Aspirin',
        dosage: '81mg',
        frequency: 'once_daily',
        times: ['09:00'],
        startDate: new Date(),
        refillsRemaining: 0,
        totalRefills: 0
      });

      const result = await medicationAdherenceService.requestRefill(
        'tenant_001',
        schedule.scheduleId
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('No refills remaining');
    });
  });

  describe('calculateAdherenceMetrics', () => {
    it('should calculate adherence metrics correctly', async () => {
      const schedule = await medicationAdherenceService.createSchedule('tenant_001', {
        patientId: 'patient_123',
        medicationId: 'med_001',
        medicationName: 'Aspirin',
        dosage: '81mg',
        frequency: 'once_daily',
        times: ['09:00'],
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        refillsRemaining: 0,
        totalRefills: 0
      });

      // Record some doses
      await medicationAdherenceService.recordMedicationTaken(
        'tenant_001',
        schedule.scheduleId,
        new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
      );

      await medicationAdherenceService.recordMedicationTaken(
        'tenant_001',
        schedule.scheduleId,
        new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      );

      await medicationAdherenceService.recordMedicationMissed(
        'tenant_001',
        schedule.scheduleId,
        new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      );

      const metrics = await medicationAdherenceService.calculateAdherenceMetrics(
        'patient_123',
        schedule.scheduleId,
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        new Date()
      );

      expect(metrics.patientId).toBe('patient_123');
      expect(metrics.dosesTaken).toBeGreaterThan(0);
      expect(metrics.adherenceRate).toBeGreaterThanOrEqual(0);
      expect(metrics.adherenceRate).toBeLessThanOrEqual(100);
    });
  });

  describe('getPatientSchedules', () => {
    it('should return schedules for patient', async () => {
      await medicationAdherenceService.createSchedule('tenant_001', {
        patientId: 'patient_123',
        medicationId: 'med_001',
        medicationName: 'Aspirin',
        dosage: '81mg',
        frequency: 'once_daily',
        times: ['09:00'],
        startDate: new Date(),
        refillsRemaining: 0,
        totalRefills: 0
      });

      await medicationAdherenceService.createSchedule('tenant_001', {
        patientId: 'patient_123',
        medicationId: 'med_002',
        medicationName: 'Metformin',
        dosage: '500mg',
        frequency: 'twice_daily',
        times: ['08:00', '20:00'],
        startDate: new Date(),
        refillsRemaining: 0,
        totalRefills: 0
      });

      const schedules = medicationAdherenceService.getPatientSchedules('patient_123');
      expect(schedules.length).toBe(2);
      expect(schedules.some(s => s.medicationName === 'Aspirin')).toBe(true);
      expect(schedules.some(s => s.medicationName === 'Metformin')).toBe(true);
    });
  });
});
