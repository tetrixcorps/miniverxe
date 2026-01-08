/**
 * Unit Tests for Clinical Workflow Service
 * Tests workflow triggers, alerts, and chart flagging
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { clinicalWorkflowService, type ClinicalAlert, type ChartFlag } from '../../src/services/healthcare/clinicalWorkflowService';

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

// Mock fetch for external API calls
global.fetch = vi.fn();

describe('Clinical Workflow Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.PAGING_SYSTEM_ENDPOINT = 'https://paging.example.com/api/page';
    process.env.PAGING_API_KEY = 'test_paging_key';
    process.env.EHR_API_ENDPOINT = 'https://ehr.example.com/api';
    process.env.EHR_API_KEY = 'test_ehr_key';
  });

  describe('evaluateAndTrigger', () => {
    it('should trigger workflow for chest pain condition', async () => {
      // Mock paging system
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true })
      });

      // Mock EHR chart flagging
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true })
      });

      const result = await clinicalWorkflowService.evaluateAndTrigger(
        'tenant_001',
        'patient_123',
        'chest_pain_detected',
        {
          callId: 'call_456',
          severity: 'urgent',
          message: 'Patient reports chest pain'
        }
      );

      expect(result.triggered).toBe(true);
      expect(result.actionsExecuted).toBeGreaterThan(0);
      expect(result.alertIds.length).toBeGreaterThan(0);
    });

    it('should not trigger for unknown condition', async () => {
      const result = await clinicalWorkflowService.evaluateAndTrigger(
        'tenant_001',
        'patient_123',
        'unknown_condition',
        {}
      );

      expect(result.triggered).toBe(false);
      expect(result.actionsExecuted).toBe(0);
    });

    it('should handle paging system failure gracefully', async () => {
      // Mock paging failure
      (global.fetch as any).mockResolvedValue({
        ok: false,
        statusText: 'Service Unavailable'
      });

      // Mock EHR success
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true })
      });

      // Should still execute other actions
      const result = await clinicalWorkflowService.evaluateAndTrigger(
        'tenant_001',
        'patient_123',
        'chest_pain_detected',
        {
          callId: 'call_456',
          severity: 'urgent'
        }
      );

      // Some actions may have failed, but workflow should still be triggered
      expect(result.triggered).toBe(true);
    });
  });

  describe('createAlert', () => {
    it('should create clinical alert', async () => {
      // Mock EHR submission
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true })
      });

      const alert = await clinicalWorkflowService.createAlert(
        'tenant_001',
        'patient_123',
        {
          alertType: 'symptom',
          severity: 'high',
          message: 'Patient requires immediate attention',
          assignedTo: 'provider_001'
        }
      );

      expect(alert.alertId).toBeDefined();
      expect(alert.patientId).toBe('patient_123');
      expect(alert.alertType).toBe('symptom');
      expect(alert.severity).toBe('high');
      expect(alert.acknowledged).toBe(false);
      expect(alert.timestamp).toBeInstanceOf(Date);
    });

    it('should store alert for retrieval', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true })
      });

      const alert = await clinicalWorkflowService.createAlert(
        'tenant_001',
        'patient_123',
        {
          alertType: 'medication',
          severity: 'medium',
          message: 'Medication alert',
          assignedTo: 'pharmacy'
        }
      );

      const patientAlerts = clinicalWorkflowService.getPatientAlerts('patient_123');
      expect(patientAlerts.length).toBeGreaterThan(0);
      expect(patientAlerts.some(a => a.alertId === alert.alertId)).toBe(true);
    });
  });

  describe('flagChart', () => {
    it('should flag patient chart', async () => {
      // Mock EHR submission
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true })
      });

      const flag = await clinicalWorkflowService['flagChart'](
        'tenant_001',
        'patient_123',
        {
          flagType: 'urgent_review',
          message: 'Chart requires urgent review',
          priority: 'urgent',
          createdBy: 'voice-ai-system'
        }
      );

      expect(flag.patientId).toBe('patient_123');
      expect(flag.flagType).toBe('urgent_review');
      expect(flag.resolved).toBe(false);
      expect(flag.timestamp).toBeInstanceOf(Date);

      const flags = clinicalWorkflowService.getPatientChartFlags('patient_123');
      expect(flags.length).toBeGreaterThan(0);
      expect(flags.some(f => f.message === flag.message)).toBe(true);
    });
  });

  describe('getPatientAlerts', () => {
    it('should return only unacknowledged alerts', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true })
      });

      // Create multiple alerts
      await clinicalWorkflowService.createAlert('tenant_001', 'patient_123', {
        alertType: 'symptom',
        severity: 'high',
        message: 'Alert 1',
        assignedTo: 'provider_001'
      });

      const alert2 = await clinicalWorkflowService.createAlert('tenant_001', 'patient_123', {
        alertType: 'medication',
        severity: 'medium',
        message: 'Alert 2',
        assignedTo: 'provider_002'
      });

      // Acknowledge one alert
      await clinicalWorkflowService.acknowledgeAlert(alert2.alertId, 'provider_002');

      const unacknowledged = clinicalWorkflowService.getPatientAlerts('patient_123');
      expect(unacknowledged.length).toBe(1);
      expect(unacknowledged[0].alertId).not.toBe(alert2.alertId);
    });
  });

  describe('Default Triggers', () => {
    it('should have chest pain trigger configured', () => {
      const triggers = Array.from(clinicalWorkflowService['triggers'].values());
      const chestPainTrigger = triggers.find(t => t.condition === 'chest_pain_detected');
      
      expect(chestPainTrigger).toBeDefined();
      expect(chestPainTrigger?.priority).toBe('urgent');
      expect(chestPainTrigger?.enabled).toBe(true);
      expect(chestPainTrigger?.actions.length).toBeGreaterThan(0);
    });

    it('should have medication reaction trigger configured', () => {
      const triggers = Array.from(clinicalWorkflowService['triggers'].values());
      const medTrigger = triggers.find(t => t.condition === 'medication_adverse_reaction');
      
      expect(medTrigger).toBeDefined();
      expect(medTrigger?.priority).toBe('high');
    });
  });
});
