/**
 * Unit Tests for Symptom Triage Service
 * Tests clinical decision trees and triage assessment
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { symptomTriageService, type TriageSession } from '../../src/services/healthcare/symptomTriageService';

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

vi.mock('../../src/services/healthcare/clinicalWorkflowService', () => ({
  clinicalWorkflowService: {
    evaluateAndTrigger: vi.fn().mockResolvedValue({
      triggered: false,
      actionsExecuted: 0,
      alertIds: []
    })
  }
}));

vi.mock('../../src/services/healthcare/ehrDocumentationService', () => ({
  ehrDocumentationService: {
    createStructuredNote: vi.fn().mockReturnValue({
      patientId: 'patient_123',
      noteType: 'triage',
      structuredData: {},
      timestamp: new Date()
    }),
    documentToEHR: vi.fn().mockResolvedValue({
      success: true,
      noteId: 'note_123'
    })
  }
}));

describe('Symptom Triage Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('startTriageSession', () => {
    it('should start triage session for chest pain', async () => {
      const session = await symptomTriageService.startTriageSession(
        'tenant_001',
        'patient_123',
        'chest_pain'
      );

      expect(session.sessionId).toBeDefined();
      expect(session.patientId).toBe('patient_123');
      expect(session.treeId).toBe('chest_pain');
      expect(session.currentQuestionId).toBe('chest_pain_duration');
      expect(session.severity).toBeNull();
      expect(session.recommendation).toBeNull();
    });

    it('should throw error for unknown condition', async () => {
      await expect(
        symptomTriageService.startTriageSession('tenant_001', 'patient_123', 'unknown_condition')
      ).rejects.toThrow('Decision tree not found');
    });
  });

  describe('answerQuestion', () => {
    it('should process answer and return next question', async () => {
      const session = await symptomTriageService.startTriageSession(
        'tenant_001',
        'patient_123',
        'chest_pain'
      );

      const result = await symptomTriageService.answerQuestion(
        'tenant_001',
        session.sessionId,
        'chest_pain_duration',
        '30 minutes to 2 hours'
      );

      expect(result.nextQuestion).toBeDefined();
      expect(result.escalated).toBe(false);
      expect(result.triageResult).toBeUndefined();
    });

    it('should escalate for urgent condition', async () => {
      const session = await symptomTriageService.startTriageSession(
        'tenant_001',
        'patient_123',
        'chest_pain'
      );

      // Answer with urgent condition (less than 5 minutes)
      const result = await symptomTriageService.answerQuestion(
        'tenant_001',
        session.sessionId,
        'chest_pain_duration',
        'Less than 5 minutes'
      );

      expect(result.escalated).toBe(true);
      expect(result.triageResult).toBeDefined();
      expect(result.triageResult?.severity).toBe('urgent');
      expect(result.triageResult?.recommendation).toBe('emergency');
    });

    it('should complete triage after all questions', async () => {
      const session = await symptomTriageService.startTriageSession(
        'tenant_001',
        'patient_123',
        'fever'
      );

      // Answer all questions
      await symptomTriageService.answerQuestion(
        'tenant_001',
        session.sessionId,
        'fever_temperature',
        '100.4°F to 102°F (38-39°C)'
      );

      await symptomTriageService.answerQuestion(
        'tenant_001',
        session.sessionId,
        'fever_duration',
        '1 to 3 days'
      );

      const result = await symptomTriageService.answerQuestion(
        'tenant_001',
        session.sessionId,
        'fever_symptoms',
        'no'
      );

      expect(result.triageResult).toBeDefined();
      expect(result.triageResult?.severity).toBeDefined();
      expect(result.triageResult?.recommendation).toBeDefined();
    });
  });

  describe('getAvailableTrees', () => {
    it('should return available decision trees', () => {
      const trees = symptomTriageService.getAvailableTrees();
      
      expect(trees.length).toBeGreaterThan(0);
      expect(trees.some(t => t.condition === 'chest_pain')).toBe(true);
      expect(trees.some(t => t.condition === 'fever')).toBe(true);
      expect(trees.some(t => t.condition === 'shortness_of_breath')).toBe(true);
    });
  });

  describe('getCurrentQuestion', () => {
    it('should return current question for session', async () => {
      const session = await symptomTriageService.startTriageSession(
        'tenant_001',
        'patient_123',
        'chest_pain'
      );

      const question = symptomTriageService.getCurrentQuestion(session.sessionId);
      
      expect(question).toBeDefined();
      expect(question?.questionId).toBe('chest_pain_duration');
      expect(question?.questionText).toContain('How long');
    });
  });

  describe('Decision Tree Logic', () => {
    it('should evaluate chest pain severity correctly', async () => {
      const session = await symptomTriageService.startTriageSession(
        'tenant_001',
        'patient_123',
        'chest_pain'
      );

      // Answer with high severity
      await symptomTriageService.answerQuestion(
        'tenant_001',
        session.sessionId,
        'chest_pain_duration',
        '30 minutes to 2 hours'
      );

      const result = await symptomTriageService.answerQuestion(
        'tenant_001',
        session.sessionId,
        'chest_pain_severity',
        9 // High severity
      );

      expect(result.triageResult?.severity).toBe('urgent');
      expect(result.triageResult?.recommendation).toBe('emergency');
    });

    it('should recommend home care for low severity', async () => {
      const session = await symptomTriageService.startTriageSession(
        'tenant_001',
        'patient_123',
        'fever'
      );

      await symptomTriageService.answerQuestion(
        'tenant_001',
        session.sessionId,
        'fever_temperature',
        'Below 100.4°F (38°C)'
      );

      await symptomTriageService.answerQuestion(
        'tenant_001',
        session.sessionId,
        'fever_duration',
        'Less than 24 hours'
      );

      const result = await symptomTriageService.answerQuestion(
        'tenant_001',
        session.sessionId,
        'fever_symptoms',
        'no'
      );

      // Low severity should recommend home care or schedule appointment
      expect(result.triageResult?.severity).toBe('low');
      expect(['home_care', 'schedule_appointment']).toContain(result.triageResult?.recommendation);
    });
  });
});

