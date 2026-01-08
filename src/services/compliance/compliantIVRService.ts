// Compliant IVR Service
// Orchestrates compliance-aware IVR call flows with Telnyx
// Supports real-time EHR documentation and clinical workflow triggers

import { ivrService, type IVRCallSession, type IVRConfig } from '../ivr/ivrService';
import { policyEngineService, type PolicyAction } from './policyEngineService';
import { auditEvidenceService, type AuditEventType } from './auditEvidenceService';
import { consentManagementService, type ConsentType } from './consentManagementService';
import { redactionDLPService } from './redactionDLPService';
import { ehrDocumentationService, type EHRNote } from '../healthcare/ehrDocumentationService';
import { clinicalWorkflowService } from '../healthcare/clinicalWorkflowService';
import { symptomTriageService, type TriageSession, type TriageResult } from '../healthcare/symptomTriageService';
import { reminderService, type Reminder } from '../healthcare/reminderService';
import { medicationAdherenceService, type MedicationSchedule, type AdherenceCheck } from '../healthcare/medicationAdherenceService';
import { backendIntegrationService } from '../ivr/integrations/backendIntegrations';

export interface CompliantCallContext {
  callId: string;
  callControlId: string;
  tenantId: string;
  from: string;
  to: string;
  industry: string;
  region: string;
  language: string;
  customerId?: string;
  authenticated: boolean;
  consentGranted: boolean;
  previousSteps: string[];
}

export interface CompliantIVRResponse {
  texml: string;
  nextStep?: string;
  requiresRecording?: boolean;
  auditTrailId?: string;
}

class CompliantIVRService {
  private webhookBaseUrl: string;

  constructor() {
    this.webhookBaseUrl = process.env.WEBHOOK_BASE_URL || 'https://tetrixcorp.com';
  }

  /**
   * Handle compliant inbound call
   */
  async handleCompliantInboundCall(context: CompliantCallContext): Promise<CompliantIVRResponse> {
    // Log call initiation
    await auditEvidenceService.logEvent({
      tenantId: context.tenantId,
      callId: context.callId,
      eventType: 'call.initiated',
      eventData: {
        from: context.from,
        to: context.to,
        industry: context.industry,
        region: context.region
      }
    });

    // Evaluate policy for initial action
    const policyAction = await policyEngineService.evaluatePolicy({
      callId: context.callId,
      tenantId: context.tenantId,
      currentStep: 'initiated',
      callContext: {
        callerId: context.from,
        calledNumber: context.to,
        industry: context.industry,
        region: context.region,
        language: context.language,
        authenticated: context.authenticated,
        consentGranted: context.consentGranted,
        previousSteps: context.previousSteps
      }
    });

    // Handle policy action
    return this.handlePolicyAction(context, policyAction);
  }

  /**
   * Handle policy action and generate appropriate TeXML
   */
  private async handlePolicyAction(
    context: CompliantCallContext,
    action: PolicyAction
  ): Promise<CompliantIVRResponse> {
    switch (action.action) {
      case 'authenticate':
        return this.handleAuthentication(context, action);
      
      case 'play_disclosure':
        return this.handleDisclosure(context, action);
      
      case 'capture_consent':
        return this.handleConsentCapture(context, action);
      
      case 'escalate':
        return this.handleEscalation(context, action);
      
      case 'proceed':
        return this.handleProceed(context, action);
      
      default:
        return this.handleProceed(context, action);
    }
  }

  /**
   * Handle identity verification
   */
  private async handleAuthentication(
    context: CompliantCallContext,
    action: PolicyAction
  ): Promise<CompliantIVRResponse> {
    await auditEvidenceService.logEvent({
      tenantId: context.tenantId,
      callId: context.callId,
      eventType: 'identity.verification_started',
      eventData: {
        step: action.nextStep
      }
    });

    const texml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="${context.language}">For your security, please enter your account number or patient ID.</Say>
  <Gather 
    action="${this.webhookBaseUrl}/api/ivr/${context.callId}/verify" 
    method="POST" 
    timeout="15" 
    numDigits="10">
    <Say voice="alice">Please enter your identification number.</Say>
  </Gather>
  <Say voice="alice">We didn't receive your input. Please try again later.</Say>
  <Hangup/>
</Response>`;

    return {
      texml,
      nextStep: action.nextStep || 'identity_verification',
      requiresRecording: false
    };
  }

  /**
   * Handle disclosure script playback
   */
  private async handleDisclosure(
    context: CompliantCallContext,
    action: PolicyAction
  ): Promise<CompliantIVRResponse> {
    const script = policyEngineService.getScript(action.scriptId || '');
    if (!script) {
      throw new Error(`Disclosure script not found: ${action.scriptId}`);
    }

    await auditEvidenceService.logEvent({
      tenantId: context.tenantId,
      callId: context.callId,
      eventType: 'disclosure.script_played',
      eventData: {
        scriptId: script.scriptId,
        policyId: script.policyId
      }
    });

    // Start recording if required
    const recordCommand = action.requiresRecording
      ? `<Record action="${this.webhookBaseUrl}/api/ivr/${context.callId}/recording" method="POST" record="record-from-answer" playBeep="false"/>`
      : '';

    const texml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  ${recordCommand}
  <Say voice="alice" language="${script.language}">${this.escapeXML(script.scriptText)}</Say>
  <Gather 
    action="${this.webhookBaseUrl}/api/ivr/${context.callId}/consent" 
    method="POST" 
    timeout="10" 
    numDigits="1">
    <Say voice="alice">Please make your selection.</Say>
  </Gather>
  <Say voice="alice">We didn't receive your input. Please try again later.</Say>
  <Hangup/>
</Response>`;

    return {
      texml,
      nextStep: action.nextStep || 'consent_capture',
      requiresRecording: action.requiresRecording
    };
  }

  /**
   * Handle consent capture
   * Public method for testing and direct consent handling
   */
  async handleConsentCapture(
    context: CompliantCallContext,
    action: PolicyAction
  ): Promise<CompliantIVRResponse> {
    const consentGranted = action.metadata?.granted === true;

    // Record consent
    if (context.customerId) {
      await consentManagementService.recordConsent({
        customerId: context.customerId,
        tenantId: context.tenantId,
        channel: 'voice',
        consentType: (action.metadata?.consentType as ConsentType) || 'call_recording',
        granted: consentGranted,
        auditTrailId: context.callId
      });
    }

    // Log consent event
    await auditEvidenceService.logEvent({
      tenantId: context.tenantId,
      callId: context.callId,
      eventType: consentGranted ? 'consent.granted' : 'consent.denied',
      eventData: {
        consentType: action.metadata?.consentType,
        granted: consentGranted
      }
    });

    if (consentGranted) {
      // Proceed to main menu
      const session = ivrService.getSession(context.callId);
      if (session) {
        session.currentStep = action.nextStep || 'main_menu';
        const texml = ivrService.getCurrentStepTeXML(context.callId);
        return {
          texml,
          nextStep: action.nextStep || 'main_menu',
          requiresRecording: action.requiresRecording
        };
      }
    } else {
      // Escalate to agent
      return this.handleEscalation(context, {
        action: 'escalate',
        escalationReason: 'consent_denied',
        nextStep: 'transfer_agent'
      });
    }

    // Default fallback
    const texml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="${context.language}">Thank you. Please hold while we connect you.</Say>
  <Redirect method="POST">${this.webhookBaseUrl}/api/ivr/${context.callId}/step/${action.nextStep || 'main_menu'}</Redirect>
</Response>`;

    return {
      texml,
      nextStep: action.nextStep || 'main_menu'
    };
  }

  /**
   * Handle escalation to human agent
   */
  private async handleEscalation(
    context: CompliantCallContext,
    action: PolicyAction
  ): Promise<CompliantIVRResponse> {
    await auditEvidenceService.logEvent({
      tenantId: context.tenantId,
      callId: context.callId,
      eventType: 'escalation.triggered',
      eventData: {
        reason: action.escalationReason,
        priority: action.metadata?.priority || 'medium'
      }
    });

    // In production, this would bridge to an agent using Telnyx bridge command
    const texml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="${context.language}">Please hold while we connect you to a representative.</Say>
  <Dial timeout="30" record="record-from-answer">
    <Number>+18005551234</Number>
  </Dial>
  <Say voice="alice">We're sorry, but we couldn't connect you to a representative. Please try again later.</Say>
  <Hangup/>
</Response>`;

    return {
      texml,
      nextStep: action.nextStep || 'transfer_agent'
    };
  }

  /**
   * Handle proceed action (normal flow)
   */
  private async handleProceed(
    context: CompliantCallContext,
    action: PolicyAction
  ): Promise<CompliantIVRResponse> {
    await auditEvidenceService.logEvent({
      tenantId: context.tenantId,
      callId: context.callId,
      eventType: 'policy.action_taken',
      eventData: {
        action: action.action,
        nextStep: action.nextStep
      }
    });

    const session = ivrService.getSession(context.callId);
    if (session && action.nextStep) {
      session.currentStep = action.nextStep;
      const texml = ivrService.getCurrentStepTeXML(context.callId);
      return {
        texml,
        nextStep: action.nextStep
      };
    }

    // Default response
    const texml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="${context.language}">Please hold.</Say>
  <Redirect method="POST">${this.webhookBaseUrl}/api/ivr/${context.callId}/step/${action.nextStep || 'main_menu'}</Redirect>
</Response>`;

    return {
      texml,
      nextStep: action.nextStep || 'main_menu'
    };
  }

  /**
   * Redact sensitive data from call transcript
   */
  async redactCallTranscript(
    transcript: string,
    tenantId: string,
    callId: string,
    industry: string
  ): Promise<string> {
    const result = await redactionDLPService.redactWithContext(transcript, {
      industry,
      tenantId,
      callId
    });

    await auditEvidenceService.logEvent({
      tenantId,
      callId,
      eventType: 'data.redacted',
      eventData: {
        originalLength: result.originalLength,
        redactedLength: result.redactedLength,
        itemsRedacted: result.redactedItems.length
      }
    });

    return result.redactedContent;
  }

  /**
   * Real-time tool calling - Execute API calls during live conversations
   * Supports EHR lookups, appointment availability, insurance verification, etc.
   */
  async executeRealTimeToolCall(
    context: CompliantCallContext,
    toolName: string,
    parameters: Record<string, any>
  ): Promise<any> {
    try {
      // Log tool call initiation
      await auditEvidenceService.logEvent({
        tenantId: context.tenantId,
        callId: context.callId,
        eventType: 'data.access',
        eventData: {
          action: 'real_time_tool_call',
          toolName,
          parameters: this.sanitizeParameters(parameters)
        },
        metadata: {
          service: 'compliant_ivr',
          industry: context.industry
        }
      });

      let result: any;

      switch (toolName) {
        case 'check_appointment_availability':
          result = await backendIntegrationService.checkAppointmentAvailability({
            patientId: parameters.patientId || context.customerId || '',
            department: parameters.department || '',
            preferredDate: parameters.preferredDate,
            preferredTime: parameters.preferredTime
          });
          break;

        case 'book_appointment':
          result = await backendIntegrationService.bookAppointment({
            patientId: parameters.patientId || context.customerId || '',
            department: parameters.department || '',
            preferredDate: parameters.preferredDate,
            preferredTime: parameters.preferredTime
          });
          break;

        case 'process_prescription_refill':
          result = await backendIntegrationService.processPrescriptionRefill(
            parameters.prescriptionNumber || '',
            parameters.patientId || context.customerId
          );
          break;

        case 'retrieve_lab_results':
          result = await backendIntegrationService.retrieveLabResults(
            parameters.patientId || context.customerId || '',
            parameters.dateOfBirth || ''
          );
          break;

        default:
          throw new Error(`Unknown tool: ${toolName}`);
      }

      // Log successful tool call
      await auditEvidenceService.logEvent({
        tenantId: context.tenantId,
        callId: context.callId,
        eventType: 'data.access',
        eventData: {
          action: 'real_time_tool_call_success',
          toolName,
          resultSummary: this.summarizeResult(result)
        },
        metadata: {
          service: 'compliant_ivr'
        }
      });

      return result;
    } catch (error) {
      console.error(`Real-time tool call failed: ${toolName}`, error);
      
      // Log error
      await auditEvidenceService.logEvent({
        tenantId: context.tenantId,
        callId: context.callId,
        eventType: 'error.occurred',
        eventData: {
          error: 'real_time_tool_call_failed',
          toolName,
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        },
        metadata: {
          service: 'compliant_ivr'
        }
      });

      throw error;
    }
  }

  /**
   * Document conversation to EHR in real-time
   */
  async documentConversationToEHR(
    context: CompliantCallContext,
    note: Omit<EHRNote, 'patientId' | 'timestamp'>,
    ehrSystem?: string
  ): Promise<{
    success: boolean;
    noteId: string;
    ehrEncounterId?: string;
  }> {
    try {
      const fullNote: EHRNote = {
        ...note,
        patientId: context.customerId || context.from, // Use customerId or phone number as fallback
        timestamp: new Date()
      };

      const result = await ehrDocumentationService.documentToEHR(
        context.tenantId,
        fullNote,
        ehrSystem
      );

      return result;
    } catch (error) {
      console.error('EHR documentation error:', error);
      throw error;
    }
  }

  /**
   * Evaluate and trigger clinical workflows
   */
  async evaluateClinicalWorkflow(
    context: CompliantCallContext,
    condition: string,
    workflowContext: {
      severity?: 'low' | 'medium' | 'high' | 'urgent';
      message?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<{
    triggered: boolean;
    actionsExecuted: number;
    alertIds: string[];
  }> {
    try {
      const patientId = context.customerId || context.from;
      
      const result = await clinicalWorkflowService.evaluateAndTrigger(
        context.tenantId,
        patientId,
        condition,
        {
          callId: context.callId,
          severity: workflowContext.severity,
          message: workflowContext.message,
          metadata: workflowContext.metadata
        }
      );

      return result;
    } catch (error) {
      console.error('Clinical workflow evaluation error:', error);
      throw error;
    }
  }

  /**
   * Create structured EHR note from conversation data
   */
  createStructuredNote(
    context: CompliantCallContext,
    noteType: EHRNote['noteType'],
    conversationData: {
      transcription?: string;
      chiefComplaint?: string;
      vitalSigns?: Record<string, any>;
      medications?: string[];
      allergies?: string[];
      symptoms?: string[];
      assessment?: string;
      plan?: string;
      triageSeverity?: 'low' | 'medium' | 'high' | 'urgent';
      redFlags?: string[];
    },
    encounterId?: string,
    providerId?: string
  ): EHRNote {
    return ehrDocumentationService.createStructuredNote(
      context.customerId || context.from,
      noteType,
      conversationData,
      encounterId,
      providerId
    );
  }

  /**
   * Sanitize parameters for audit logging (remove PHI)
   */
  private sanitizeParameters(parameters: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    const phiFields = ['patientId', 'ssn', 'dateOfBirth', 'medicalRecordNumber'];
    
    for (const [key, value] of Object.entries(parameters)) {
      if (phiFields.includes(key)) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }

  /**
   * Summarize result for audit logging
   */
  private summarizeResult(result: any): string {
    if (typeof result === 'object') {
      if (result.success !== undefined) {
        return `Success: ${result.success}`;
      }
      if (result.status !== undefined) {
        return `Status: ${result.status}`;
      }
      return 'Result object returned';
    }
    return String(result);
  }

  /**
   * Escape XML special characters
   */
  private escapeXML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Start symptom triage session
   */
  async startSymptomTriage(
    context: CompliantCallContext,
    condition: string,
    metadata?: Record<string, any>
  ): Promise<TriageSession> {
    try {
      const patientId = context.customerId || context.from;
      
      const session = await symptomTriageService.startTriageSession(
        context.tenantId,
        patientId,
        condition,
        {
          ...metadata,
          callId: context.callId,
          industry: context.industry
        }
      );

      return session;
    } catch (error) {
      console.error('Symptom triage start error:', error);
      throw error;
    }
  }

  /**
   * Answer triage question
   */
  async answerTriageQuestion(
    context: CompliantCallContext,
    sessionId: string,
    questionId: string,
    answer: string | number
  ): Promise<{
    nextQuestion?: any;
    triageResult?: TriageResult;
    escalated: boolean;
    texml?: string;
  }> {
    try {
      const result = await symptomTriageService.answerQuestion(
        context.tenantId,
        sessionId,
        questionId,
        answer
      );

      // If triage is complete, generate TeXML for result
      if (result.triageResult) {
        const texml = this.generateTriageResultTeXML(
          context,
          result.triageResult
        );

        return {
          ...result,
          texml
        };
      }

      // If there's a next question, generate TeXML for it
      if (result.nextQuestion) {
        const texml = this.generateTriageQuestionTeXML(
          context,
          result.nextQuestion,
          sessionId
        );

        return {
          ...result,
          texml
        };
      }

      return result;
    } catch (error) {
      console.error('Triage question answer error:', error);
      throw error;
    }
  }

  /**
   * Generate TeXML for triage question
   */
  private generateTriageQuestionTeXML(
    context: CompliantCallContext,
    question: any,
    sessionId: string
  ): string {
    let gatherAction = '';
    let sayText = question.questionText;

    if (question.responseType === 'yes_no') {
      gatherAction = `
  <Gather 
    action="${this.webhookBaseUrl}/api/ivr/triage/${sessionId}/answer" 
    method="POST" 
    timeout="10" 
    numDigits="1">
    <Say voice="alice" language="${context.language}">${this.escapeXML(sayText)} Press 1 for yes, or 2 for no.</Say>
  </Gather>`;
    } else if (question.responseType === 'scale_1_10') {
      gatherAction = `
  <Gather 
    action="${this.webhookBaseUrl}/api/ivr/triage/${sessionId}/answer" 
    method="POST" 
    timeout="15" 
    numDigits="2">
    <Say voice="alice" language="${context.language}">${this.escapeXML(sayText)} Please enter a number from 1 to 10.</Say>
  </Gather>`;
    } else if (question.responseType === 'multiple_choice' && question.options) {
      const optionsText = question.options
        .map((opt: string, idx: number) => `Press ${idx + 1} for ${opt}`)
        .join('. ');
      
      gatherAction = `
  <Gather 
    action="${this.webhookBaseUrl}/api/ivr/triage/${sessionId}/answer" 
    method="POST" 
    timeout="15" 
    numDigits="1">
    <Say voice="alice" language="${context.language}">${this.escapeXML(sayText)} ${optionsText}.</Say>
  </Gather>`;
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="${context.language}">${this.escapeXML(sayText)}</Say>${gatherAction}
  <Say voice="alice" language="${context.language}">We didn't receive your response. Please try again.</Say>
  <Hangup/>
</Response>`;
  }

  /**
   * Generate TeXML for triage result
   */
  private generateTriageResultTeXML(
    context: CompliantCallContext,
    result: TriageResult
  ): string {
    const nextStepsText = result.nextSteps
      .map((step, idx) => `${idx + 1}. ${step}`)
      .join('. ');

    let actionTeXML = '';

    if (result.recommendation === 'emergency') {
      actionTeXML = `
  <Say voice="alice" language="${context.language}">This is a medical emergency. Please hang up and call 911 immediately, or go to the nearest emergency room.</Say>
  <Hangup/>`;
    } else if (result.recommendation === 'escalate_nurse') {
      actionTeXML = `
  <Say voice="alice" language="${context.language}">A nurse will call you back within 1 to 2 hours. Please keep your phone nearby.</Say>
  <Hangup/>`;
    } else if (result.recommendation === 'schedule_appointment' || result.recommendation === 'immediate_care') {
      actionTeXML = `
  <Say voice="alice" language="${context.language}">Would you like to schedule an appointment now? Press 1 for yes, or 2 to end the call.</Say>
  <Gather 
    action="${this.webhookBaseUrl}/api/ivr/${context.callId}/schedule" 
    method="POST" 
    timeout="10" 
    numDigits="1">
  </Gather>
  <Say voice="alice" language="${context.language}">Thank you for calling. Goodbye.</Say>
  <Hangup/>`;
    } else {
      actionTeXML = `
  <Say voice="alice" language="${context.language}">Thank you for completing the assessment. If your symptoms persist or worsen, please call back or schedule an appointment.</Say>
  <Hangup/>`;
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="${context.language}">${this.escapeXML(result.message)}</Say>
  <Say voice="alice" language="${context.language}">Next steps: ${this.escapeXML(nextStepsText)}</Say>${actionTeXML}
</Response>`;
  }

  /**
   * Schedule reminder
   */
  async scheduleReminder(
    context: CompliantCallContext,
    reminder: Omit<Reminder, 'reminderId' | 'status' | 'createdAt'>
  ): Promise<Reminder> {
    try {
      return await reminderService.scheduleReminder(
        context.tenantId,
        reminder
      );
    } catch (error) {
      console.error('Reminder scheduling error:', error);
      throw error;
    }
  }

  /**
   * Send reminder
   */
  async sendReminder(
    context: CompliantCallContext,
    reminderId: string,
    templateVariables?: Record<string, string>
  ): Promise<any> {
    try {
      return await reminderService.sendReminder(
        context.tenantId,
        reminderId,
        templateVariables
      );
    } catch (error) {
      console.error('Reminder sending error:', error);
      throw error;
    }
  }

  /**
   * Create medication schedule
   */
  async createMedicationSchedule(
    context: CompliantCallContext,
    schedule: Omit<MedicationSchedule, 'scheduleId' | 'status' | 'createdAt' | 'updatedAt'>
  ): Promise<MedicationSchedule> {
    try {
      return await medicationAdherenceService.createSchedule(
        context.tenantId,
        schedule
      );
    } catch (error) {
      console.error('Medication schedule creation error:', error);
      throw error;
    }
  }

  /**
   * Record medication taken
   */
  async recordMedicationTaken(
    context: CompliantCallContext,
    scheduleId: string,
    actualTime?: Date,
    sideEffects?: string[],
    notes?: string
  ): Promise<any> {
    try {
      return await medicationAdherenceService.recordMedicationTaken(
        context.tenantId,
        scheduleId,
        actualTime,
        'voice',
        sideEffects,
        notes
      );
    } catch (error) {
      console.error('Medication recording error:', error);
      throw error;
    }
  }

  /**
   * Initiate adherence check call
   */
  async initiateAdherenceCheck(
    context: CompliantCallContext,
    scheduleId: string
  ): Promise<{ check: AdherenceCheck; texml: string }> {
    try {
      const check = await medicationAdherenceService.initiateAdherenceCheck(
        context.tenantId,
        scheduleId,
        'automated_call'
      );

      const schedule = medicationAdherenceService.getSchedule(scheduleId);
      if (!schedule) {
        throw new Error(`Schedule not found: ${scheduleId}`);
      }

      // Generate TeXML for adherence check
      const texml = this.generateAdherenceCheckTeXML(
        context,
        check,
        schedule
      );

      return { check, texml };
    } catch (error) {
      console.error('Adherence check initiation error:', error);
      throw error;
    }
  }

  /**
   * Generate TeXML for adherence check
   */
  private generateAdherenceCheckTeXML(
    context: CompliantCallContext,
    check: AdherenceCheck,
    schedule: MedicationSchedule
  ): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="${context.language}">Hello, this is a medication reminder call. Did you take your ${this.escapeXML(schedule.medicationName)} at the scheduled time? Press 1 for yes, or 2 for no.</Say>
  <Gather 
    action="${this.webhookBaseUrl}/api/healthcare/adherence/${check.checkId}/response" 
    method="POST" 
    timeout="10" 
    numDigits="1">
  </Gather>
  <Say voice="alice" language="${context.language}">We didn't receive your response. Please call back if you have any questions about your medication.</Say>
  <Hangup/>
</Response>`;
  }

  /**
   * Process adherence check response
   */
  async processAdherenceCheckResponse(
    context: CompliantCallContext,
    checkId: string,
    taken: boolean,
    sideEffects?: string[],
    notes?: string
  ): Promise<{ success: boolean; texml: string }> {
    try {
      await medicationAdherenceService.completeAdherenceCheck(
        context.tenantId,
        checkId,
        {
          taken,
          timeTaken: taken ? new Date() : undefined,
          sideEffects,
          notes
        }
      );

      let responseMessage = '';
      if (taken) {
        responseMessage = 'Thank you for confirming. If you experience any side effects, please contact your healthcare provider.';
      } else {
        responseMessage = 'Thank you for letting us know. Please take your medication as soon as possible. If you have concerns, please contact your healthcare provider.';
      }

      if (sideEffects && sideEffects.length > 0) {
        responseMessage += ' We have noted the side effects you reported. A healthcare provider will review this information.';
      }

      const texml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="${context.language}">${this.escapeXML(responseMessage)}</Say>
  <Hangup/>
</Response>`;

      return { success: true, texml };
    } catch (error) {
      console.error('Adherence check response processing error:', error);
      throw error;
    }
  }

  /**
   * Request medication refill
   */
  async requestMedicationRefill(
    context: CompliantCallContext,
    scheduleId: string
  ): Promise<{ success: boolean; message: string; texml: string }> {
    try {
      const result = await medicationAdherenceService.requestRefill(
        context.tenantId,
        scheduleId,
        context.customerId || context.from
      );

      const texml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="${context.language}">${this.escapeXML(result.message)}</Say>
  <Hangup/>
</Response>`;

      return {
        success: result.success,
        message: result.message,
        texml
      };
    } catch (error) {
      console.error('Medication refill request error:', error);
      throw error;
    }
  }
}

export const compliantIVRService = new CompliantIVRService();
