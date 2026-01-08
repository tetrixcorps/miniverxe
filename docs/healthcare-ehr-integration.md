# Healthcare EHR Integration Guide
## Real-Time Documentation and Clinical Workflow Triggers

This guide explains how to use the new healthcare-specific features for real-time EHR documentation and clinical workflow automation.

---

## Overview

The healthcare integration extends the compliant IVR system with:

1. **Real-Time EHR Documentation**: Document voice conversations directly to EHR systems (Epic, Cerner, etc.) using FHIR standards
2. **Clinical Workflow Triggers**: Automatically trigger clinical workflows (paging providers, flagging charts, creating alerts) based on conversation outcomes
3. **Real-Time Tool Calling**: Execute EHR API calls during live conversations (appointment availability, insurance verification, etc.)

---

## Configuration

### Environment Variables

Add the following to your `docker.env` file:

```bash
# Epic MyChart API
EPIC_FHIR_BASE_URL=https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4
EPIC_CLIENT_ID=your_epic_client_id
EPIC_CLIENT_SECRET=your_epic_client_secret
EPIC_TOKEN_URL=https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token

# Cerner FHIR API
CERNER_FHIR_BASE_URL=https://fhir.cerner.com/r4
CERNER_CLIENT_ID=your_cerner_client_id
CERNER_CLIENT_SECRET=your_cerner_client_secret

# Generic FHIR (for other EHR systems)
FHIR_BASE_URL=https://your-fhir-server.com/fhir
EHR_API_ENDPOINT=https://your-ehr-api.com/api
EHR_API_KEY=your_ehr_api_key

# Paging System
PAGING_SYSTEM_ENDPOINT=https://your-paging-system.com/api/page
PAGING_API_KEY=your_paging_api_key
```

---

## Usage Examples

### 1. Real-Time EHR Documentation

Document a conversation to EHR during or after a call:

```typescript
import { compliantIVRService } from '../services/compliance/compliantIVRService';

// During a conversation
const context = {
  callId: 'call_123',
  callControlId: 'cc_123',
  tenantId: 'healthcare_tenant',
  from: '+15551234567',
  to: '+18005551234',
  industry: 'healthcare',
  region: 'USA',
  language: 'en-US',
  customerId: 'patient_456',
  authenticated: true,
  consentGranted: true,
  previousSteps: ['initiated', 'authenticated', 'consent_captured']
};

// Create structured note from conversation
const note = compliantIVRService.createStructuredNote(
  context,
  'intake',
  {
    transcription: 'Patient called to schedule appointment for chest pain...',
    chiefComplaint: 'Chest pain for 2 hours',
    vitalSigns: {
      bloodPressure: '140/90',
      heartRate: '95',
      temperature: '98.6'
    },
    medications: ['Aspirin 81mg daily', 'Lisinopril 10mg daily'],
    allergies: ['Penicillin'],
    assessment: 'Patient reports chest pain, needs urgent evaluation',
    plan: 'Schedule urgent cardiology appointment'
  },
  'encounter_789',
  'provider_001'
);

// Document to EHR
const result = await compliantIVRService.documentConversationToEHR(
  context,
  note,
  'epic' // or 'cerner', 'generic'
);

console.log(`Note documented: ${result.noteId}`);
```

### 2. Clinical Workflow Triggers

Trigger clinical workflows based on conversation outcomes:

```typescript
// Example: Chest pain detected during triage
await compliantIVRService.evaluateClinicalWorkflow(
  context,
  'chest_pain_detected',
  {
    severity: 'urgent',
    message: 'Patient reports chest pain - immediate review required',
    metadata: {
      duration: '2 hours',
      severity: 'moderate',
      associatedSymptoms: ['shortness of breath', 'nausea']
    }
  }
);

// This will automatically:
// 1. Page on-call cardiology provider
// 2. Flag patient chart as urgent
// 3. Create critical alert in emergency department
```

### 3. Real-Time Tool Calling

Execute EHR API calls during live conversations:

```typescript
// Check appointment availability during conversation
const availability = await compliantIVRService.executeRealTimeToolCall(
  context,
  'check_appointment_availability',
  {
    patientId: 'patient_456',
    department: 'cardiology',
    preferredDate: '2025-01-15',
    preferredTime: '10:00'
  }
);

// Use result in conversation
if (availability.available) {
  // Tell patient about available slots
  const slots = availability.slots;
  // Generate TeXML with available times
}

// Book appointment in real-time
const booking = await compliantIVRService.executeRealTimeToolCall(
  context,
  'book_appointment',
  {
    patientId: 'patient_456',
    department: 'cardiology',
    preferredDate: '2025-01-15',
    preferredTime: '10:00'
  }
);

// Document appointment booking to EHR
await compliantIVRService.documentConversationToEHR(
  context,
  compliantIVRService.createStructuredNote(
    context,
    'intake',
    {
      transcription: `Patient scheduled appointment: ${booking.confirmationNumber}`,
      plan: `Appointment scheduled for ${booking.date} at ${booking.time}`
    }
  )
);
```

---

## Supported EHR Systems

### Epic MyChart
- **FHIR Base URL**: Configured via `EPIC_FHIR_BASE_URL`
- **Authentication**: OAuth2 client credentials
- **Supported Resources**: Composition (clinical notes), Patient, Encounter

### Cerner
- **FHIR Base URL**: Configured via `CERNER_FHIR_BASE_URL`
- **Authentication**: OAuth2 client credentials
- **Supported Resources**: Composition, Patient, Encounter

### Generic FHIR
- **FHIR Base URL**: Configured via `FHIR_BASE_URL`
- **Authentication**: API key or OAuth2
- **Compatible with**: Any FHIR R4 compliant system

---

## Clinical Workflow Triggers

### Default Triggers

The system includes pre-configured triggers:

1. **Chest Pain** (`chest_pain_detected`)
   - Pages on-call cardiology
   - Flags chart as urgent
   - Creates critical alert

2. **Medication Adverse Reaction** (`medication_adverse_reaction`)
   - Pages prescribing physician
   - Flags chart for review

3. **Abnormal Vital Signs** (`vital_sign_abnormal`)
   - Creates alert for nursing station
   - Flags chart for follow-up

4. **Medication Non-Adherence** (`medication_non_adherence`)
   - Notifies pharmacy department
   - Flags chart for intervention

### Custom Triggers

You can add custom triggers programmatically:

```typescript
import { clinicalWorkflowService } from '../services/healthcare/clinicalWorkflowService';

// Add custom trigger
clinicalWorkflowService.triggers.set('custom_condition', {
  triggerId: 'custom_condition',
  condition: 'custom_condition_detected',
  priority: 'high',
  enabled: true,
  actions: [
    {
      type: 'page_provider',
      target: 'specialist_001',
      message: 'Custom condition requires attention',
      priority: 'high'
    }
  ]
});
```

---

## FHIR Note Types

The system maps note types to LOINC codes:

- **Intake**: `51855-5` - Patient intake note
- **Triage**: `51847-2` - Triage note
- **Follow-up**: `11506-3` - Progress note
- **Medication Review**: `10160-0` - Medication review
- **Chronic Care**: `51848-0` - Chronic care management note
- **General**: `11506-3` - Clinical note

---

## Security and Compliance

All EHR interactions are:

- **Audit Logged**: Every API call is logged with cryptographic hashing
- **PHI Protected**: Sensitive data is redacted in audit logs
- **Encrypted**: All data transmission uses TLS 1.2+
- **Access Controlled**: OAuth2 authentication with scoped permissions

---

## Error Handling

The services handle errors gracefully:

- **EHR API Failures**: Errors are logged but don't break the call flow
- **Workflow Trigger Failures**: Individual action failures don't prevent other actions
- **Authentication Failures**: Automatic retry with exponential backoff

---

## Next Steps

1. **Configure EHR Credentials**: Add your Epic/Cerner credentials to `docker.env`
2. **Test Integration**: Use the test endpoints to verify connectivity
3. **Customize Workflows**: Add tenant-specific workflow triggers
4. **Monitor Audit Logs**: Review audit trails for all EHR interactions

For more information, see:
- [Healthcare Voice AI Analysis](./healthcare-voice-ai-analysis.md)
- [FHIR Documentation](https://www.hl7.org/fhir/)
- [Epic FHIR API](https://fhir.epic.com/)
- [Cerner FHIR API](https://fhir.cerner.com/)
