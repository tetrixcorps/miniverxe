// Epic EHR Integration
// Implementation for Epic Systems EHR integration

import type { EHRIntegration, AppointmentSlot, AppointmentRequest, Appointment, Patient, Prescription, RefillRequest, LabResult, BillingInfo, ClaimInfo } from './backendIntegrationService';

export class EpicIntegration implements EHRIntegration {
  name = 'Epic Systems';
  type = 'ehr' as const;
  isConnected = false;
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async connect(): Promise<boolean> {
    try {
      // Implement Epic OAuth/API connection
      // This would use Epic's FHIR API or MyChart API
      const response = await fetch(`${this.baseUrl}/oauth2/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: this.apiKey })
      });

      this.isConnected = response.ok;
      return this.isConnected;
    } catch (error) {
      console.error('Epic connection error:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async checkAppointmentAvailability(department: string, dateRange?: { start: Date; end: Date }): Promise<AppointmentSlot[]> {
    // Epic FHIR API call for appointment slots
    // This would use Epic's Scheduling API
    const url = `${this.baseUrl}/AppointmentSlot?department=${department}`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch appointment availability');
    }

    const data = await response.json();
    return data.entry?.map((entry: any) => ({
      date: new Date(entry.resource.start),
      time: entry.resource.start,
      department,
      provider: entry.resource.actor?.display
    })) || [];
  }

  async bookAppointment(patientId: string, appointment: AppointmentRequest): Promise<Appointment> {
    // Epic FHIR API call to create appointment
    const response = await fetch(`${this.baseUrl}/Appointment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        resourceType: 'Appointment',
        status: 'booked',
        patient: { reference: `Patient/${patientId}` },
        serviceType: [{ coding: [{ code: appointment.department }] }],
        start: appointment.preferredDate?.toISOString(),
        minutesDuration: 30
      })
    });

    if (!response.ok) {
      throw new Error('Failed to book appointment');
    }

    const data = await response.json();
    return {
      id: data.id,
      patientId,
      department: appointment.department,
      date: appointment.preferredDate || new Date(),
      time: appointment.preferredTime || '10:00 AM',
      status: 'scheduled'
    };
  }

  async cancelAppointment(appointmentId: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/Appointment/${appointmentId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'cancelled' })
    });

    return response.ok;
  }

  async getAppointment(appointmentId: string): Promise<Appointment | null> {
    const response = await fetch(`${this.baseUrl}/Appointment/${appointmentId}`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    });

    if (!response.ok) return null;

    const data = await response.json();
    return {
      id: data.id,
      patientId: data.patient.reference.split('/')[1],
      department: data.serviceType[0]?.coding[0]?.code || '',
      date: new Date(data.start),
      time: new Date(data.start).toLocaleTimeString(),
      status: data.status === 'booked' ? 'scheduled' : 'cancelled'
    };
  }

  async getPatient(patientId: string): Promise<Patient | null> {
    const response = await fetch(`${this.baseUrl}/Patient/${patientId}`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    });

    if (!response.ok) return null;

    const data = await response.json();
    return {
      id: data.id,
      name: `${data.name[0].given.join(' ')} ${data.name[0].family}`,
      dateOfBirth: new Date(data.birthDate),
      phoneNumber: data.telecom?.find((t: any) => t.system === 'phone')?.value,
      email: data.telecom?.find((t: any) => t.system === 'email')?.value
    };
  }

  async searchPatients(query: string): Promise<Patient[]> {
    const response = await fetch(`${this.baseUrl}/Patient?name=${encodeURIComponent(query)}`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.entry?.map((entry: any) => ({
      id: entry.resource.id,
      name: `${entry.resource.name[0].given.join(' ')} ${entry.resource.name[0].family}`,
      dateOfBirth: new Date(entry.resource.birthDate),
      phoneNumber: entry.resource.telecom?.find((t: any) => t.system === 'phone')?.value
    })) || [];
  }

  async getPrescription(prescriptionNumber: string): Promise<Prescription | null> {
    const response = await fetch(`${this.baseUrl}/MedicationRequest?identifier=${prescriptionNumber}`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    });

    if (!response.ok) return null;

    const data = await response.json();
    const prescription = data.entry?.[0]?.resource;
    if (!prescription) return null;

    return {
      id: prescription.id,
      prescriptionNumber,
      patientId: prescription.subject.reference.split('/')[1],
      medication: prescription.medicationCodeableConcept.text,
      quantity: prescription.dispenseRequest?.quantity?.value || 0,
      refillsRemaining: prescription.dispenseRequest?.numberOfRepeatsAllowed || 0,
      status: prescription.status === 'active' ? 'active' : 'expired'
    };
  }

  async requestPrescriptionRefill(prescriptionNumber: string, patientId: string): Promise<RefillRequest> {
    // Epic API call to request refill
    const response = await fetch(`${this.baseUrl}/MedicationRequest`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        resourceType: 'MedicationRequest',
        status: 'active',
        intent: 'order',
        medicationReference: { reference: `Medication/${prescriptionNumber}` },
        subject: { reference: `Patient/${patientId}` }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to request prescription refill');
    }

    return {
      id: (await response.json()).id,
      prescriptionNumber,
      status: 'pending',
      estimatedReadyDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };
  }

  async getLabResults(patientId: string, dateOfBirth: string): Promise<LabResult[]> {
    const response = await fetch(`${this.baseUrl}/DiagnosticReport?subject=Patient/${patientId}`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.entry?.map((entry: any) => ({
      id: entry.resource.id,
      patientId,
      testName: entry.resource.code.text,
      date: new Date(entry.resource.effectiveDateTime),
      status: entry.resource.status === 'final' ? 'completed' : 'pending',
      results: entry.resource.conclusion
    })) || [];
  }

  async getBillingInfo(accountNumber: string): Promise<BillingInfo | null> {
    // Epic billing API call
    const response = await fetch(`${this.baseUrl}/Account?identifier=${accountNumber}`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    });

    if (!response.ok) return null;

    const data = await response.json();
    return {
      accountNumber,
      balance: data.balance?.value || 0,
      lastPaymentDate: data.period?.end ? new Date(data.period.end) : undefined,
      claims: []
    };
  }

  async getClaimInfo(claimNumber: string): Promise<ClaimInfo | null> {
    const response = await fetch(`${this.baseUrl}/Claim?identifier=${claimNumber}`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    });

    if (!response.ok) return null;

    const data = await response.json();
    const claim = data.entry?.[0]?.resource;
    if (!claim) return null;

    return {
      claimNumber,
      date: new Date(claim.created),
      amount: claim.total?.value || 0,
      status: claim.status === 'active' ? 'pending' : 'approved'
    };
  }
}
