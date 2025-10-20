// Unit tests for Healthcare Integrations
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HealthcareIntegrationService, HEALTHCARE_INTEGRATIONS, type HealthcareConfig } from '../healthcareIntegrations';

// Mock fetch
global.fetch = vi.fn();

describe('HealthcareIntegrationService', () => {
  let service: HealthcareIntegrationService;
  let mockConfig: HealthcareConfig;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockConfig = {
      provider: 'epic',
      apiKey: 'test-api-key',
      baseUrl: 'https://api.epic.com/mychart',
      facilityId: 'test-facility-123',
      compliance: {
        hipaa: true,
        hitech: true,
        fda: true
      }
    };
    
    service = new HealthcareIntegrationService(mockConfig);
  });

  describe('Authentication', () => {
    it('should authenticate successfully with valid credentials', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const result = await service.authenticate();
      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        'https://api.epic.com/mychart/auth',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'test-api-key'
          },
          body: JSON.stringify({
            facilityId: 'test-facility-123',
            compliance: {
              hipaa: true,
              hitech: true,
              fda: true
            }
          })
        })
      );
    });

    it('should handle authentication failure', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      const result = await service.authenticate();
      expect(result).toBe(false);
    });

    it('should handle network errors during authentication', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await service.authenticate();
      expect(result).toBe(false);
    });
  });

  describe('Patient Management', () => {
    it('should create patient successfully', async () => {
      const patientData = {
        id: 'pat-123',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        ssn: '123-45-6789',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zip: '12345'
        },
        phone: '+1234567890',
        email: 'john.doe@example.com',
        emergencyContact: {
          name: 'Jane Doe',
          phone: '+1234567891',
          relationship: 'spouse'
        },
        insurance: {
          provider: 'Test Insurance',
          policyNumber: 'POL-123',
          groupNumber: 'GRP-456'
        },
        medicalHistory: ['diabetes'],
        allergies: ['penicillin'],
        medications: ['metformin']
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ patientId: 'pat-123' })
      });

      const result = await service.createPatient(patientData);
      expect(result).toBe('pat-123');
      expect(fetch).toHaveBeenCalledWith(
        'https://api.epic.com/mychart/patients',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-api-key',
            'X-Facility-ID': 'test-facility-123'
          },
          body: JSON.stringify({
            ...patientData,
            compliance: {
              hipaa: true,
              hitech: true,
              fda: true
            }
          })
        })
      );
    });

    it('should return null when patient creation fails', async () => {
      const patientData = {
        id: 'pat-123',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        ssn: '123-45-6789',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zip: '12345'
        },
        phone: '+1234567890',
        email: 'john.doe@example.com',
        emergencyContact: {
          name: 'Jane Doe',
          phone: '+1234567891',
          relationship: 'spouse'
        },
        insurance: {
          provider: 'Test Insurance',
          policyNumber: 'POL-123',
          groupNumber: 'GRP-456'
        },
        medicalHistory: [],
        allergies: [],
        medications: []
      };

      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400
      });

      const result = await service.createPatient(patientData);
      expect(result).toBeNull();
    });

    it('should get patient data successfully', async () => {
      const patientId = 'pat-123';
      const mockPatient = {
        id: patientId,
        firstName: 'John',
        lastName: 'Doe'
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ patient: mockPatient })
      });

      const result = await service.getPatient(patientId);
      expect(result).toEqual(mockPatient);
      expect(fetch).toHaveBeenCalledWith(
        `https://api.epic.com/mychart/patients/${patientId}`,
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Authorization': 'Bearer test-api-key',
            'X-Facility-ID': 'test-facility-123'
          }
        })
      );
    });
  });

  describe('Appointment Management', () => {
    it('should schedule appointment successfully', async () => {
      const appointmentData = {
        id: 'apt-123',
        patientId: 'pat-123',
        providerId: 'prov-456',
        date: '2024-01-15',
        time: '10:00',
        duration: 30,
        type: 'consultation' as const,
        status: 'scheduled' as const,
        notes: 'Regular checkup',
        room: 'Room 101'
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ appointmentId: 'apt-123' })
      });

      const result = await service.scheduleAppointment(appointmentData);
      expect(result).toBe('apt-123');
    });

    it('should get appointments for date range', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';
      const mockAppointments = [
        { id: 'apt-1', patientId: 'pat-1', date: '2024-01-15' },
        { id: 'apt-2', patientId: 'pat-2', date: '2024-01-16' }
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ appointments: mockAppointments })
      });

      const result = await service.getAppointments(startDate, endDate);
      expect(result).toEqual(mockAppointments);
    });
  });

  describe('Medical Records', () => {
    it('should update medical record successfully', async () => {
      const patientId = 'pat-123';
      const updates = {
        diagnosis: 'Hypertension',
        notes: 'Patient responding well to treatment'
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true
      });

      const result = await service.updateMedicalRecord(patientId, updates);
      expect(result).toBe(true);
    });

    it('should handle medical record update failure', async () => {
      const patientId = 'pat-123';
      const updates = {};

      (fetch as any).mockResolvedValueOnce({
        ok: false
      });

      const result = await service.updateMedicalRecord(patientId, updates);
      expect(result).toBe(false);
    });
  });

  describe('Insurance Claims', () => {
    it('should process insurance claim successfully', async () => {
      const patientId = 'pat-123';
      const claimData = {
        claimId: 'claim-123',
        amount: 150.00,
        procedure: 'Office Visit'
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true
      });

      const result = await service.processInsuranceClaim(patientId, claimData);
      expect(result).toBe(true);
    });
  });

  describe('Patient Communication', () => {
    it('should send patient communication successfully', async () => {
      const patientId = 'pat-123';
      const message = 'Your appointment is scheduled for tomorrow at 10 AM';
      const type = 'sms' as const;

      (fetch as any).mockResolvedValueOnce({
        ok: true
      });

      const result = await service.sendPatientCommunication(patientId, message, type);
      expect(result).toBe(true);
    });

    it('should handle communication failure', async () => {
      const patientId = 'pat-123';
      const message = 'Test message';
      const type = 'email' as const;

      (fetch as any).mockResolvedValueOnce({
        ok: false
      });

      const result = await service.sendPatientCommunication(patientId, message, type);
      expect(result).toBe(false);
    });
  });

  describe('Compliance Reports', () => {
    it('should generate HIPAA compliance report', async () => {
      const reportType = 'hipaa' as const;
      const dateRange = {
        start: '2024-01-01',
        end: '2024-01-31'
      };
      const mockReport = {
        reportId: 'hipaa-report-123',
        generatedAt: '2024-01-31T10:00:00Z',
        findings: []
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockReport)
      });

      const result = await service.generateComplianceReport(reportType, dateRange);
      expect(result).toEqual(mockReport);
    });
  });

  describe('Clinical Decision Support', () => {
    it('should execute clinical decision support', async () => {
      const patientId = 'pat-123';
      const clinicalData = {
        symptoms: ['chest pain', 'shortness of breath'],
        vitalSigns: {
          bloodPressure: '140/90',
          heartRate: 95
        }
      };
      const mockRecommendations = {
        recommendations: ['Consider ECG', 'Monitor vital signs'],
        riskScore: 0.7
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRecommendations)
      });

      const result = await service.executeClinicalDecisionSupport(patientId, clinicalData);
      expect(result).toEqual(mockRecommendations);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await service.authenticate();
      expect(result).toBe(false);
    });

    it('should handle JSON parsing errors', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      const result = await service.getPatient('pat-123');
      expect(result).toBeNull();
    });
  });
});

describe('HEALTHCARE_INTEGRATIONS', () => {
  it('should have all required integration providers', () => {
    expect(HEALTHCARE_INTEGRATIONS).toHaveProperty('epic');
    expect(HEALTHCARE_INTEGRATIONS).toHaveProperty('cerner');
    expect(HEALTHCARE_INTEGRATIONS).toHaveProperty('allscripts');
    expect(HEALTHCARE_INTEGRATIONS).toHaveProperty('nextgen');
    expect(HEALTHCARE_INTEGRATIONS).toHaveProperty('athena');
  });

  it('should have correct structure for Epic integration', () => {
    const epic = HEALTHCARE_INTEGRATIONS.epic;
    
    expect(epic.name).toBe('Epic MyChart');
    expect(epic.provider).toBe('epic');
    expect(epic.authentication).toBe('oauth');
    expect(epic.compliance).toContain('hipaa');
    expect(epic.compliance).toContain('hitech');
    expect(epic.compliance).toContain('fda');
    expect(epic.features).toContain('patient_management');
    expect(epic.features).toContain('appointment_scheduling');
    expect(epic.supportedOperations).toContain('create_patient');
    expect(epic.supportedOperations).toContain('schedule_appointment');
  });

  it('should have correct structure for Cerner integration', () => {
    const cerner = HEALTHCARE_INTEGRATIONS.cerner;
    
    expect(cerner.name).toBe('Cerner PowerChart');
    expect(cerner.provider).toBe('cerner');
    expect(cerner.authentication).toBe('oauth');
    expect(cerner.compliance).toContain('hipaa');
    expect(cerner.compliance).toContain('hitech');
    expect(cerner.compliance).toContain('fda');
    expect(cerner.features).toContain('patient_management');
    expect(cerner.features).toContain('clinical_workflow');
    expect(cerner.supportedOperations).toContain('create_patient');
    expect(cerner.supportedOperations).toContain('clinical_decision_support');
  });
});
