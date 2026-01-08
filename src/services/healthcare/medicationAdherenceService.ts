// Medication Adherence Service
// Tracks medication schedules, monitors adherence, handles side effects, and processes refills

import { reminderService } from './reminderService';
import { clinicalWorkflowService } from './clinicalWorkflowService';
import { ehrDocumentationService } from './ehrDocumentationService';
import { auditEvidenceService } from '../compliance/auditEvidenceService';
import { backendIntegrationService } from '../ivr/integrations/backendIntegrations';

export interface MedicationSchedule {
  scheduleId: string;
  patientId: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  frequency: 'once_daily' | 'twice_daily' | 'three_times_daily' | 'four_times_daily' | 'as_needed' | 'custom';
  times: string[]; // e.g., ['08:00', '20:00'] for twice daily
  startDate: Date;
  endDate?: Date;
  refillsRemaining: number;
  totalRefills: number;
  pharmacyId?: string;
  pharmacyName?: string;
  prescriberId?: string;
  prescriberName?: string;
  instructions?: string;
  status: 'active' | 'completed' | 'discontinued' | 'on_hold';
  createdAt: Date;
  updatedAt: Date;
}

export interface AdherenceRecord {
  recordId: string;
  scheduleId: string;
  patientId: string;
  scheduledTime: Date;
  actualTime?: Date;
  status: 'taken' | 'missed' | 'late' | 'skipped' | 'pending';
  confirmationMethod?: 'voice' | 'sms' | 'app' | 'manual';
  sideEffects?: string[];
  notes?: string;
  recordedAt: Date;
}

export interface AdherenceCheck {
  checkId: string;
  scheduleId: string;
  patientId: string;
  scheduledTime: Date;
  checkType: 'automated_call' | 'sms' | 'app_notification';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  response?: {
    taken: boolean;
    timeTaken?: Date;
    sideEffects?: string[];
    notes?: string;
  };
  createdAt: Date;
  completedAt?: Date;
}

export interface AdherenceMetrics {
  patientId: string;
  scheduleId?: string;
  periodStart: Date;
  periodEnd: Date;
  totalDoses: number;
  dosesTaken: number;
  dosesMissed: number;
  dosesLate: number;
  adherenceRate: number; // Percentage (0-100)
  averageDelayMinutes?: number;
  sideEffectCount: number;
  lastTaken?: Date;
  lastMissed?: Date;
}

export interface SideEffectReport {
  reportId: string;
  patientId: string;
  scheduleId: string;
  medicationName: string;
  sideEffects: string[];
  severity: 'mild' | 'moderate' | 'severe';
  onsetDate: Date;
  duration?: string;
  impact: 'none' | 'mild' | 'moderate' | 'severe';
  reportedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  actionTaken?: string;
}

class MedicationAdherenceService {
  private schedules: Map<string, MedicationSchedule> = new Map();
  private adherenceRecords: Map<string, AdherenceRecord> = new Map();
  private adherenceChecks: Map<string, AdherenceCheck> = new Map();
  private sideEffectReports: Map<string, SideEffectReport> = new Map();

  /**
   * Create medication schedule
   */
  async createSchedule(
    tenantId: string,
    schedule: Omit<MedicationSchedule, 'scheduleId' | 'status' | 'createdAt' | 'updatedAt'>
  ): Promise<MedicationSchedule> {
    const fullSchedule: MedicationSchedule = {
      ...schedule,
      scheduleId: `SCHED-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Set default times based on frequency if not provided
    if (!fullSchedule.times || fullSchedule.times.length === 0) {
      fullSchedule.times = this.getDefaultTimes(fullSchedule.frequency);
    }

    this.schedules.set(fullSchedule.scheduleId, fullSchedule);

    // Create reminder schedule for each dose time
    await this.scheduleMedicationReminders(tenantId, fullSchedule);

    // Log schedule creation
    await auditEvidenceService.logEvent({
      tenantId,
      callId: fullSchedule.scheduleId,
      eventType: 'data.access',
      eventData: {
        action: 'medication_schedule_created',
        scheduleId: fullSchedule.scheduleId,
        patientId: fullSchedule.patientId,
        medicationName: fullSchedule.medicationName
      },
      metadata: {
        service: 'medication_adherence'
      }
    });

    return fullSchedule;
  }

  /**
   * Get default times for frequency
   */
  private getDefaultTimes(frequency: MedicationSchedule['frequency']): string[] {
    switch (frequency) {
      case 'once_daily':
        return ['09:00'];
      case 'twice_daily':
        return ['08:00', '20:00'];
      case 'three_times_daily':
        return ['08:00', '14:00', '20:00'];
      case 'four_times_daily':
        return ['08:00', '12:00', '18:00', '22:00'];
      case 'as_needed':
        return [];
      default:
        return ['09:00'];
    }
  }

  /**
   * Schedule medication reminders for all dose times
   */
  private async scheduleMedicationReminders(
    tenantId: string,
    schedule: MedicationSchedule
  ): Promise<void> {
    const today = new Date();
    const endDate = schedule.endDate || new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000); // Default 30 days

    // Schedule reminders for next 30 days
    for (let day = 0; day < 30 && today.getTime() + day * 24 * 60 * 60 * 1000 <= endDate.getTime(); day++) {
      const reminderDate = new Date(today);
      reminderDate.setDate(reminderDate.getDate() + day);

      for (const time of schedule.times) {
        const [hours, minutes] = time.split(':').map(Number);
        const reminderTime = new Date(reminderDate);
        reminderTime.setHours(hours, minutes, 0, 0);

        // Skip if reminder time is in the past
        if (reminderTime <= new Date()) continue;

        try {
          await reminderService.scheduleMedicationReminder(
            tenantId,
            schedule.patientId,
            schedule.medicationId,
            schedule.medicationName,
            schedule.dosage,
            reminderTime,
            '', // Phone number would come from patient record
            ['sms', 'voice']
          );
        } catch (error) {
          console.error(`Failed to schedule reminder for ${schedule.medicationName} at ${time}:`, error);
        }
      }
    }
  }

  /**
   * Record medication taken
   */
  async recordMedicationTaken(
    tenantId: string,
    scheduleId: string,
    actualTime?: Date,
    confirmationMethod: AdherenceRecord['confirmationMethod'] = 'voice',
    sideEffects?: string[],
    notes?: string
  ): Promise<AdherenceRecord> {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) {
      throw new Error(`Schedule not found: ${scheduleId}`);
    }

    if (schedule.status !== 'active') {
      throw new Error(`Schedule is not active: ${scheduleId}`);
    }

    const now = actualTime || new Date();
    const scheduledTime = this.getNextScheduledTime(schedule, now);

    // Determine status
    let status: AdherenceRecord['status'] = 'taken';
    if (scheduledTime) {
      const delayMinutes = (now.getTime() - scheduledTime.getTime()) / (1000 * 60);
      if (delayMinutes > 60) {
        status = 'late';
      }
    }

    const record: AdherenceRecord = {
      recordId: `ADH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      scheduleId,
      patientId: schedule.patientId,
      scheduledTime: scheduledTime || now,
      actualTime: now,
      status,
      confirmationMethod,
      sideEffects,
      notes,
      recordedAt: new Date()
    };

    this.adherenceRecords.set(record.recordId, record);

    // If side effects reported, create side effect report
    if (sideEffects && sideEffects.length > 0) {
      await this.reportSideEffects(
        tenantId,
        schedule.patientId,
        scheduleId,
        schedule.medicationName,
        sideEffects
      );
    }

    // Check adherence rate and trigger workflow if low
    const metrics = await this.calculateAdherenceMetrics(
      schedule.patientId,
      scheduleId,
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      new Date()
    );

    if (metrics.adherenceRate < 80) {
      await clinicalWorkflowService.evaluateAndTrigger(
        tenantId,
        schedule.patientId,
        'low_medication_adherence',
        {
          callId: record.recordId,
          severity: metrics.adherenceRate < 50 ? 'high' : 'medium',
          message: `Patient adherence rate is ${metrics.adherenceRate.toFixed(1)}%`,
          metadata: {
            scheduleId,
            medicationName: schedule.medicationName,
            adherenceRate: metrics.adherenceRate
          }
        }
      );
    }

    // Log adherence record
    await auditEvidenceService.logEvent({
      tenantId,
      callId: record.recordId,
      eventType: 'data.access',
      eventData: {
        action: 'medication_taken_recorded',
        scheduleId,
        patientId: schedule.patientId,
        status,
        sideEffects: sideEffects?.length || 0
      },
      metadata: {
        service: 'medication_adherence'
      }
    });

    return record;
  }

  /**
   * Record medication missed
   */
  async recordMedicationMissed(
    tenantId: string,
    scheduleId: string,
    scheduledTime: Date,
    reason?: string
  ): Promise<AdherenceRecord> {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) {
      throw new Error(`Schedule not found: ${scheduleId}`);
    }

    const record: AdherenceRecord = {
      recordId: `ADH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      scheduleId,
      patientId: schedule.patientId,
      scheduledTime,
      status: 'missed',
      notes: reason,
      recordedAt: new Date()
    };

    this.adherenceRecords.set(record.recordId, record);

    // Check adherence and trigger workflow if needed
    const metrics = await this.calculateAdherenceMetrics(
      schedule.patientId,
      scheduleId,
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      new Date()
    );

    if (metrics.adherenceRate < 80) {
      await clinicalWorkflowService.evaluateAndTrigger(
        tenantId,
        schedule.patientId,
        'medication_missed',
        {
          callId: record.recordId,
          severity: 'medium',
          message: `Patient missed ${schedule.medicationName} dose`,
          metadata: {
            scheduleId,
            medicationName: schedule.medicationName,
            scheduledTime
          }
        }
      );
    }

    return record;
  }

  /**
   * Get next scheduled time for medication
   */
  private getNextScheduledTime(schedule: MedicationSchedule, referenceTime: Date): Date | null {
    const today = new Date(referenceTime);
    today.setHours(0, 0, 0, 0);

    for (const timeStr of schedule.times) {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const scheduledTime = new Date(today);
      scheduledTime.setHours(hours, minutes, 0, 0);

      // If time hasn't passed today, return it
      if (scheduledTime > referenceTime) {
        return scheduledTime;
      }
    }

    // If all times passed today, return first time tomorrow
    if (schedule.times.length > 0) {
      const [hours, minutes] = schedule.times[0].split(':').map(Number);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(hours, minutes, 0, 0);
      return tomorrow;
    }

    return null;
  }

  /**
   * Initiate adherence check call
   */
  async initiateAdherenceCheck(
    tenantId: string,
    scheduleId: string,
    checkType: AdherenceCheck['checkType'] = 'automated_call'
  ): Promise<AdherenceCheck> {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) {
      throw new Error(`Schedule not found: ${scheduleId}`);
    }

    const scheduledTime = this.getNextScheduledTime(schedule, new Date());
    if (!scheduledTime) {
      throw new Error(`No scheduled time found for schedule: ${scheduleId}`);
    }

    const check: AdherenceCheck = {
      checkId: `CHECK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      scheduleId,
      patientId: schedule.patientId,
      scheduledTime,
      checkType,
      status: 'pending',
      createdAt: new Date()
    };

    this.adherenceChecks.set(check.checkId, check);

    // Log check initiation
    await auditEvidenceService.logEvent({
      tenantId,
      callId: check.checkId,
      eventType: 'data.access',
      eventData: {
        action: 'adherence_check_initiated',
        checkId: check.checkId,
        scheduleId,
        patientId: schedule.patientId,
        checkType
      },
      metadata: {
        service: 'medication_adherence'
      }
    });

    return check;
  }

  /**
   * Complete adherence check with response
   */
  async completeAdherenceCheck(
    tenantId: string,
    checkId: string,
    response: AdherenceCheck['response']
  ): Promise<void> {
    const check = this.adherenceChecks.get(checkId);
    if (!check) {
      throw new Error(`Adherence check not found: ${checkId}`);
    }

    check.status = 'completed';
    check.response = response;
    check.completedAt = new Date();

    // Record medication taken or missed
    if (response?.taken) {
      await this.recordMedicationTaken(
        tenantId,
        check.scheduleId,
        response.timeTaken,
        'voice',
        response.sideEffects,
        response.notes
      );
    } else {
      await this.recordMedicationMissed(
        tenantId,
        check.scheduleId,
        check.scheduledTime,
        response?.notes || 'Patient reported not taken'
      );
    }
  }

  /**
   * Report side effects
   */
  async reportSideEffects(
    tenantId: string,
    patientId: string,
    scheduleId: string,
    medicationName: string,
    sideEffects: string[],
    severity: SideEffectReport['severity'] = 'mild'
  ): Promise<SideEffectReport> {
    const report: SideEffectReport = {
      reportId: `SE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      patientId,
      scheduleId,
      medicationName,
      sideEffects,
      severity,
      onsetDate: new Date(),
      impact: severity === 'severe' ? 'severe' : severity === 'moderate' ? 'moderate' : 'mild',
      reportedAt: new Date()
    };

    this.sideEffectReports.set(report.reportId, report);

    // Trigger workflow for severe side effects
    if (severity === 'severe') {
      await clinicalWorkflowService.evaluateAndTrigger(
        tenantId,
        patientId,
        'severe_side_effect',
        {
          callId: report.reportId,
          severity: 'urgent',
          message: `Severe side effects reported for ${medicationName}: ${sideEffects.join(', ')}`,
          metadata: {
            reportId: report.reportId,
            medicationName,
            sideEffects
          }
        }
      );
    }

    // Document to EHR
    try {
      const note = ehrDocumentationService.createStructuredNote(
        patientId,
        'side_effect',
        {
          chiefComplaint: `Side effects: ${sideEffects.join(', ')}`,
          symptoms: sideEffects,
          assessment: `Patient reported ${severity} side effects from ${medicationName}`,
          plan: 'Review medication and consider adjustment if needed'
        },
        undefined,
        undefined
      );

      await ehrDocumentationService.documentToEHR(tenantId, note);
    } catch (error) {
      console.error('Failed to document side effects to EHR:', error);
    }

    // Log side effect report
    await auditEvidenceService.logEvent({
      tenantId,
      callId: report.reportId,
      eventType: 'data.access',
      eventData: {
        action: 'side_effect_reported',
        reportId: report.reportId,
        patientId,
        medicationName,
        severity,
        sideEffectCount: sideEffects.length
      },
      metadata: {
        service: 'medication_adherence'
      }
    });

    return report;
  }

  /**
   * Request medication refill
   */
  async requestRefill(
    tenantId: string,
    scheduleId: string,
    requestedBy?: string
  ): Promise<{ success: boolean; refillId?: string; message: string }> {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) {
      throw new Error(`Schedule not found: ${scheduleId}`);
    }

    if (schedule.refillsRemaining <= 0) {
      return {
        success: false,
        message: 'No refills remaining. Please contact your prescriber for a new prescription.'
      };
    }

    // Process refill via backend integration
    try {
      const result = await backendIntegrationService.processPrescriptionRefill(
        schedule.patientId,
        schedule.medicationId,
        schedule.pharmacyId || ''
      );

      if (result.success) {
        // Update schedule
        schedule.refillsRemaining = Math.max(0, schedule.refillsRemaining - 1);
        schedule.updatedAt = new Date();

        // Log refill
        await auditEvidenceService.logEvent({
          tenantId,
          callId: scheduleId,
          eventType: 'data.access',
          eventData: {
            action: 'medication_refill_requested',
            scheduleId,
            patientId: schedule.patientId,
            medicationName: schedule.medicationName,
            refillsRemaining: schedule.refillsRemaining
          },
          metadata: {
            service: 'medication_adherence',
            requestedBy
          }
        });

        return {
          success: true,
          refillId: result.refillId,
          message: `Refill request submitted. ${schedule.refillsRemaining} refills remaining.`
        };
      } else {
        return {
          success: false,
          message: result.message || 'Refill request failed. Please contact your pharmacy.'
        };
      }
    } catch (error) {
      console.error('Refill request error:', error);
      return {
        success: false,
        message: 'Error processing refill request. Please contact your pharmacy directly.'
      };
    }
  }

  /**
   * Calculate adherence metrics
   */
  async calculateAdherenceMetrics(
    patientId: string,
    scheduleId: string | undefined,
    periodStart: Date,
    periodEnd: Date
  ): Promise<AdherenceMetrics> {
    // Get all records for patient/schedule in period
    const records = Array.from(this.adherenceRecords.values())
      .filter(r => {
        if (r.patientId !== patientId) return false;
        if (scheduleId && r.scheduleId !== scheduleId) return false;
        return r.scheduledTime >= periodStart && r.scheduledTime <= periodEnd;
      });

    // Get schedule to determine expected doses
    const schedule = scheduleId ? this.schedules.get(scheduleId) : null;
    const expectedDoses = this.calculateExpectedDoses(schedule, periodStart, periodEnd);

    const dosesTaken = records.filter(r => r.status === 'taken').length;
    const dosesMissed = records.filter(r => r.status === 'missed' || r.status === 'skipped').length;
    const dosesLate = records.filter(r => r.status === 'late').length;

    const adherenceRate = expectedDoses > 0
      ? (dosesTaken / expectedDoses) * 100
      : 0;

    // Calculate average delay for late doses
    let totalDelayMinutes = 0;
    let lateCount = 0;
    records.filter(r => r.status === 'late' && r.actualTime && r.scheduledTime).forEach(r => {
      if (r.actualTime && r.scheduledTime) {
        totalDelayMinutes += (r.actualTime.getTime() - r.scheduledTime.getTime()) / (1000 * 60);
        lateCount++;
      }
    });
    const averageDelayMinutes = lateCount > 0 ? totalDelayMinutes / lateCount : undefined;

    // Count side effects
    const sideEffectCount = records.reduce((count, r) => count + (r.sideEffects?.length || 0), 0);

    // Get last taken and missed
    const takenRecords = records.filter(r => r.status === 'taken' && r.actualTime)
      .sort((a, b) => (b.actualTime?.getTime() || 0) - (a.actualTime?.getTime() || 0));
    const missedRecords = records.filter(r => r.status === 'missed')
      .sort((a, b) => b.scheduledTime.getTime() - a.scheduledTime.getTime());

    return {
      patientId,
      scheduleId: scheduleId || undefined,
      periodStart,
      periodEnd,
      totalDoses: expectedDoses,
      dosesTaken,
      dosesMissed,
      dosesLate,
      adherenceRate: Math.round(adherenceRate * 10) / 10, // Round to 1 decimal
      averageDelayMinutes: averageDelayMinutes ? Math.round(averageDelayMinutes) : undefined,
      sideEffectCount,
      lastTaken: takenRecords[0]?.actualTime,
      lastMissed: missedRecords[0]?.scheduledTime
    };
  }

  /**
   * Calculate expected number of doses in period
   */
  private calculateExpectedDoses(
    schedule: MedicationSchedule | null,
    periodStart: Date,
    periodEnd: Date
  ): number {
    if (!schedule) {
      // If no schedule, estimate based on records
      return 0;
    }

    const days = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (24 * 60 * 60 * 1000));
    const dosesPerDay = schedule.times.length;

    return days * dosesPerDay;
  }

  /**
   * Get patient schedules
   */
  getPatientSchedules(patientId: string, activeOnly: boolean = true): MedicationSchedule[] {
    let schedules = Array.from(this.schedules.values())
      .filter(s => s.patientId === patientId);

    if (activeOnly) {
      schedules = schedules.filter(s => s.status === 'active');
    }

    return schedules.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  /**
   * Get schedule
   */
  getSchedule(scheduleId: string): MedicationSchedule | undefined {
    return this.schedules.get(scheduleId);
  }

  /**
   * Update schedule
   */
  async updateSchedule(
    tenantId: string,
    scheduleId: string,
    updates: Partial<MedicationSchedule>
  ): Promise<MedicationSchedule> {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) {
      throw new Error(`Schedule not found: ${scheduleId}`);
    }

    const updated = {
      ...schedule,
      ...updates,
      updatedAt: new Date()
    };

    this.schedules.set(scheduleId, updated);

    // Log update
    await auditEvidenceService.logEvent({
      tenantId,
      callId: scheduleId,
      eventType: 'data.access',
      eventData: {
        action: 'medication_schedule_updated',
        scheduleId,
        patientId: schedule.patientId
      },
      metadata: {
        service: 'medication_adherence'
      }
    });

    return updated;
  }

  /**
   * Discontinue schedule
   */
  async discontinueSchedule(
    tenantId: string,
    scheduleId: string,
    reason?: string
  ): Promise<void> {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) {
      throw new Error(`Schedule not found: ${scheduleId}`);
    }

    schedule.status = 'discontinued';
    schedule.updatedAt = new Date();

    // Log discontinuation
    await auditEvidenceService.logEvent({
      tenantId,
      callId: scheduleId,
      eventType: 'data.access',
      eventData: {
        action: 'medication_schedule_discontinued',
        scheduleId,
        patientId: schedule.patientId,
        reason
      },
      metadata: {
        service: 'medication_adherence'
      }
    });
  }

  /**
   * Get adherence check
   */
  getCheck(checkId: string): AdherenceCheck | undefined {
    return this.adherenceChecks.get(checkId);
  }

  /**
   * Get patient adherence records
   */
  getPatientAdherenceRecords(patientId: string, scheduleId?: string): AdherenceRecord[] {
    return Array.from(this.adherenceRecords.values())
      .filter(r => {
        if (r.patientId !== patientId) return false;
        if (scheduleId && r.scheduleId !== scheduleId) return false;
        return true;
      })
      .sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime());
  }
}

export const medicationAdherenceService = new MedicationAdherenceService();
