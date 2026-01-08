/**
 * Unit Tests for EHR Documentation Service
 * Tests real-time EHR documentation with FHIR support
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ehrDocumentationService, type EHRNote } from '../../src/services/healthcare/ehrDocumentationService';

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

// Mock fetch for FHIR API calls
global.fetch = vi.fn();

describe('EHR Documentation Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.EPIC_FHIR_BASE_URL = 'https://fhir.epic.com/api/FHIR/R4';
    process.env.EPIC_CLIENT_ID = 'test_client_id';
    process.env.EPIC_CLIENT_SECRET = 'test_client_secret';
    process.env.EPIC_TOKEN_URL = 'https://fhir.epic.com/oauth2/token';
  });

  describe('createStructuredNote', () => {
    it('should create structured note with all fields', () => {
      const note = ehrDocumentationService.createStructuredNote(
        'patient_123',
        'intake',
        {
          transcription: 'Full conversation transcript',
          chiefComplaint: 'Chest pain',
          vitalSigns: {
            bloodPressure: '140/90',
            heartRate: '95'
          },
          medications: ['Aspirin', 'Lisinopril'],
          allergies: ['Penicillin'],
          assessment: 'Patient needs evaluation',
          plan: 'Schedule appointment'
        },
        'encounter_456',
        'provider_789'
      );

      expect(note.patientId).toBe('patient_123');
      expect(note.noteType).toBe('intake');
      expect(note.structuredData.chiefComplaint).toBe('Chest pain');
      expect(note.structuredData.vitalSigns?.bloodPressure).toBe('140/90');
      expect(note.structuredData.medications).toHaveLength(2);
      expect(note.encounterId).toBe('encounter_456');
      expect(note.providerId).toBe('provider_789');
      expect(note.timestamp).toBeInstanceOf(Date);
    });

    it('should create note with minimal fields', () => {
      const note = ehrDocumentationService.createStructuredNote(
        'patient_123',
        'triage',
        {
          chiefComplaint: 'Fever'
        }
      );

      expect(note.patientId).toBe('patient_123');
      expect(note.noteType).toBe('triage');
      expect(note.structuredData.chiefComplaint).toBe('Fever');
      expect(note.encounterId).toBeUndefined();
      expect(note.providerId).toBeUndefined();
    });
  });

  describe('documentToEHR', () => {
    it('should document note to Epic EHR', async () => {
      const note: EHRNote = {
        patientId: 'patient_123',
        noteType: 'intake',
        structuredData: {
          chiefComplaint: 'Chest pain'
        },
        timestamp: new Date()
      };

      // Mock OAuth2 token response
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'test_access_token',
          token_type: 'Bearer',
          expires_in: 3600
        })
      });

      // Mock FHIR Composition submission
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'composition_123',
          resourceType: 'Composition'
        })
      });

      const result = await ehrDocumentationService.documentToEHR(
        'tenant_001',
        note,
        'epic'
      );

      expect(result.success).toBe(true);
      expect(result.noteId).toBe('composition_123');
      expect(global.fetch).toHaveBeenCalledTimes(2); // OAuth + FHIR submission
    });

    it('should handle EHR system not configured', async () => {
      const note: EHRNote = {
        patientId: 'patient_123',
        noteType: 'intake',
        structuredData: {},
        timestamp: new Date()
      };

      // Clear EHR configs
      process.env.EPIC_FHIR_BASE_URL = '';
      process.env.CERNER_FHIR_BASE_URL = '';
      process.env.FHIR_BASE_URL = '';

      await expect(
        ehrDocumentationService.documentToEHR('tenant_001', note, 'epic')
      ).rejects.toThrow('EHR system not configured');
    });

    it('should handle OAuth2 authentication failure', async () => {
      const note: EHRNote = {
        patientId: 'patient_123',
        noteType: 'intake',
        structuredData: {},
        timestamp: new Date()
      };

      // Mock OAuth2 failure
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized'
      });

      await expect(
        ehrDocumentationService.documentToEHR('tenant_001', note, 'epic')
      ).rejects.toThrow('OAuth2 authentication failed');
    });

    it('should handle FHIR submission failure', async () => {
      const note: EHRNote = {
        patientId: 'patient_123',
        noteType: 'intake',
        structuredData: {},
        timestamp: new Date()
      };

      // Mock OAuth2 success
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'test_token',
          token_type: 'Bearer'
        })
      });

      // Mock FHIR submission failure
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Bad Request'
      });

      await expect(
        ehrDocumentationService.documentToEHR('tenant_001', note, 'epic')
      ).rejects.toThrow('FHIR submission failed');
    });
  });

  describe('FHIR Composition Conversion', () => {
    it('should convert note to FHIR Composition with all sections', async () => {
      const note: EHRNote = {
        patientId: 'patient_123',
        encounterId: 'encounter_456',
        noteType: 'intake',
        structuredData: {
          chiefComplaint: 'Chest pain',
          vitalSigns: {
            bloodPressure: '140/90',
            heartRate: '95'
          },
          medications: ['Aspirin'],
          assessment: 'Needs evaluation',
          plan: 'Schedule appointment'
        },
        transcription: 'Full transcript',
        timestamp: new Date(),
        providerId: 'provider_789'
      };

      // Mock OAuth2
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'token' })
      });

      // Mock FHIR submission - capture the request
      let submittedComposition: any;
      (global.fetch as any).mockImplementationOnce(async (url, options) => {
        if (options?.method === 'POST' && url.includes('Composition')) {
          submittedComposition = JSON.parse(options.body);
        }
        return {
          ok: true,
          json: async () => ({ id: 'composition_123' })
        };
      });

      await ehrDocumentationService.documentToEHR('tenant_001', note, 'epic');

      expect(submittedComposition).toBeDefined();
      expect(submittedComposition.resourceType).toBe('Composition');
      expect(submittedComposition.subject.reference).toBe('Patient/patient_123');
      expect(submittedComposition.encounter?.reference).toBe('Encounter/encounter_456');
      expect(submittedComposition.section).toBeDefined();
      expect(submittedComposition.section.length).toBeGreaterThan(0);
    });
  });
});
