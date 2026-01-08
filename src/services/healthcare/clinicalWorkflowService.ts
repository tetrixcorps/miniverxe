// Clinical Workflow Service
// Triggers clinical workflows based on conversation outcomes
// Supports paging providers, flagging charts, creating alerts, scheduling urgent visits

import { auditEvidenceService } from '../compliance/auditEvidenceService';

export interface WorkflowTrigger {
  triggerId: string;
  condition: string; // e.g., "chest_pain_detected", "medication_adverse_reaction", "vital_sign_abnormal"
  actions: WorkflowAction[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  enabled: boolean;
}

export interface WorkflowAction {
  type: 'page_provider' | 'flag_chart' | 'create_alert' | 'schedule_urgent_visit' | 'notify_department' | 'escalate_to_nurse';
  target: string; // provider ID, department name, etc.
  message?: string;
  metadata?: Record<string, any>;
  delay?: number; // seconds to delay action
}

export interface ClinicalAlert {
  alertId: string;
  patientId: string;
  alertType: 'symptom' | 'medication' | 'vital_sign' | 'adherence' | 'triage' | 'general';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  assignedTo?: string; // provider ID, department, etc.
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface PagingRequest {
  providerId: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  patientId?: string;
  callbackNumber?: string;
  metadata?: Record<string, any>;
}

export interface ChartFlag {
  patientId: string;
  flagType: 'urgent_review' | 'medication_alert' | 'symptom_alert' | 'follow_up_required';
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdBy: string; // system ID or user ID
  timestamp: Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
}

class ClinicalWorkflowService {
  private triggers: Map<string, WorkflowTrigger> = new Map();
  private alerts: Map<string, ClinicalAlert> = new Map();
  private chartFlags: Map<string, ChartFlag[]> = new Map();
  private pagingEndpoint?: string;
  private ehrEndpoint?: string;

  constructor() {
    this.pagingEndpoint = process.env.PAGING_SYSTEM_ENDPOINT;
    this.ehrEndpoint = process.env.EHR_API_ENDPOINT;
    this.initializeDefaultTriggers();
  }

  /**
   * Initialize default workflow triggers
   */
  private initializeDefaultTriggers() {
    // Chest pain trigger
    this.triggers.set('chest_pain', {
      triggerId: 'chest_pain',
      condition: 'chest_pain_detected',
      priority: 'urgent',
      enabled: true,
      actions: [
        {
          type: 'page_provider',
          target: 'on_call_cardiology',
          message: 'Patient reports chest pain - immediate review required',
          priority: 'urgent'
        },
        {
          type: 'flag_chart',
          target: 'patient_chart',
          message: 'URGENT: Chest pain reported',
          priority: 'urgent'
        },
        {
          type: 'create_alert',
          target: 'emergency_department',
          message: 'Chest pain case requires immediate attention',
          severity: 'critical'
        }
      ]
    });

    // Medication adverse reaction trigger
    this.triggers.set('medication_reaction', {
      triggerId: 'medication_reaction',
      condition: 'medication_adverse_reaction',
      priority: 'high',
      enabled: true,
      actions: [
        {
          type: 'page_provider',
          target: 'prescribing_physician',
          message: 'Patient reports adverse reaction to medication',
          priority: 'high'
        },
        {
          type: 'flag_chart',
          target: 'patient_chart',
          message: 'Medication adverse reaction - review required',
          priority: 'high'
        }
      ]
    });

    // Abnormal vital signs trigger
    this.triggers.set('abnormal_vitals', {
      triggerId: 'abnormal_vitals',
      condition: 'vital_sign_abnormal',
      priority: 'medium',
      enabled: true,
      actions: [
        {
          type: 'create_alert',
          target: 'nursing_station',
          message: 'Abnormal vital signs detected',
          severity: 'medium'
        },
        {
          type: 'flag_chart',
          target: 'patient_chart',
          message: 'Abnormal vital signs - follow-up recommended',
          priority: 'medium'
        }
      ]
    });

    // Medication adherence trigger
    this.triggers.set('medication_non_adherence', {
      triggerId: 'medication_non_adherence',
      condition: 'medication_non_adherence',
      priority: 'medium',
      enabled: true,
      actions: [
        {
          type: 'notify_department',
          target: 'pharmacy',
          message: 'Patient reports medication non-adherence',
          metadata: { requiresFollowUp: true }
        },
        {
          type: 'flag_chart',
          target: 'patient_chart',
          message: 'Medication adherence issue - intervention may be needed',
          priority: 'medium'
        }
      ]
    });
  }

  /**
   * Evaluate conditions and trigger workflows
   */
  async evaluateAndTrigger(
    tenantId: string,
    patientId: string,
    condition: string,
    context: {
      callId?: string;
      encounterId?: string;
      severity?: 'low' | 'medium' | 'high' | 'urgent';
      message?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<{
    triggered: boolean;
    actionsExecuted: number;
    alertIds: string[];
  }> {
    const trigger = this.findTriggerByCondition(condition);

    if (!trigger || !trigger.enabled) {
      return {
        triggered: false,
        actionsExecuted: 0,
        alertIds: []
      };
    }

    const alertIds: string[] = [];
    let actionsExecuted = 0;

    // Execute all actions for this trigger
    for (const action of trigger.actions) {
      try {
        // Apply delay if specified
        if (action.delay && action.delay > 0) {
          await new Promise(resolve => setTimeout(resolve, action.delay * 1000));
        }

        switch (action.type) {
          case 'page_provider':
            await this.pageProvider(tenantId, {
              providerId: action.target,
              message: action.message || context.message || 'Clinical alert requires attention',
              priority: trigger.priority,
              patientId,
              metadata: { ...action.metadata, ...context.metadata }
            });
            actionsExecuted++;
            break;

          case 'flag_chart':
            await this.flagChart(tenantId, patientId, {
              flagType: this.determineFlagType(condition),
              message: action.message || context.message || 'Chart requires review',
              priority: trigger.priority,
              createdBy: 'voice-ai-system',
              metadata: { ...action.metadata, ...context.metadata }
            });
            actionsExecuted++;
            break;

          case 'create_alert':
            const alert = await this.createAlert(tenantId, patientId, {
              alertType: this.determineAlertType(condition),
              severity: (action.metadata?.severity as any) || trigger.priority,
              message: action.message || context.message || 'Clinical alert',
              assignedTo: action.target,
              metadata: { ...action.metadata, ...context.metadata }
            });
            alertIds.push(alert.alertId);
            actionsExecuted++;
            break;

          case 'schedule_urgent_visit':
            await this.scheduleUrgentVisit(tenantId, patientId, {
              department: action.target,
              priority: trigger.priority,
              reason: action.message || context.message,
              metadata: { ...action.metadata, ...context.metadata }
            });
            actionsExecuted++;
            break;

          case 'notify_department':
            await this.notifyDepartment(tenantId, action.target, {
              patientId,
              message: action.message || context.message || 'Department notification',
              priority: trigger.priority,
              metadata: { ...action.metadata, ...context.metadata }
            });
            actionsExecuted++;
            break;

          case 'escalate_to_nurse':
            await this.escalateToNurse(tenantId, patientId, {
              message: action.message || context.message || 'Patient requires nurse attention',
              priority: trigger.priority,
              metadata: { ...action.metadata, ...context.metadata }
            });
            actionsExecuted++;
            break;
        }

        // Log workflow action
        await auditEvidenceService.logEvent({
          tenantId,
          callId: context.callId || 'unknown',
          eventType: 'escalation.triggered',
          eventData: {
            condition,
            actionType: action.type,
            target: action.target,
            patientId,
            priority: trigger.priority
          },
          metadata: {
            service: 'clinical_workflow',
            triggerId: trigger.triggerId
          }
        });
      } catch (error) {
        console.error(`Failed to execute workflow action ${action.type}:`, error);
        
        // Log error but continue with other actions
        await auditEvidenceService.logEvent({
          tenantId,
          callId: context.callId || 'unknown',
          eventType: 'error.occurred',
          eventData: {
            error: 'workflow_action_failed',
            actionType: action.type,
            condition,
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
          },
          metadata: {
            service: 'clinical_workflow'
          }
        });
      }
    }

    return {
      triggered: true,
      actionsExecuted,
      alertIds
    };
  }

  /**
   * Page a provider
   */
  private async pageProvider(
    tenantId: string,
    request: PagingRequest
  ): Promise<void> {
    if (!this.pagingEndpoint) {
      console.warn('Paging endpoint not configured, skipping provider page');
      return;
    }

    try {
      const response = await fetch(this.pagingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PAGING_API_KEY || ''}`
        },
        body: JSON.stringify({
          providerId: request.providerId,
          message: request.message,
          priority: request.priority,
          patientId: request.patientId,
          callbackNumber: request.callbackNumber,
          metadata: request.metadata
        })
      });

      if (!response.ok) {
        throw new Error(`Paging failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Provider paging error:', error);
      throw error;
    }
  }

  /**
   * Flag patient chart
   */
  private async flagChart(
    tenantId: string,
    patientId: string,
    flag: Omit<ChartFlag, 'patientId' | 'timestamp' | 'resolved'>
  ): Promise<ChartFlag> {
    const chartFlag: ChartFlag = {
      ...flag,
      patientId,
      timestamp: new Date(),
      resolved: false
    };

    // Store flag
    const flags = this.chartFlags.get(patientId) || [];
    flags.push(chartFlag);
    this.chartFlags.set(patientId, flags);

    // Submit to EHR if endpoint available
    if (this.ehrEndpoint) {
      try {
        await fetch(`${this.ehrEndpoint}/patients/${patientId}/flags`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.EHR_API_KEY || ''}`
          },
          body: JSON.stringify(chartFlag)
        });
      } catch (error) {
        console.error('EHR chart flag submission error:', error);
        // Continue even if EHR submission fails
      }
    }

    return chartFlag;
  }

  /**
   * Create clinical alert
   */
  async createAlert(
    tenantId: string,
    patientId: string,
    alert: Omit<ClinicalAlert, 'alertId' | 'patientId' | 'timestamp' | 'acknowledged'>
  ): Promise<ClinicalAlert> {
    const clinicalAlert: ClinicalAlert = {
      ...alert,
      alertId: `ALERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      patientId,
      timestamp: new Date(),
      acknowledged: false
    };

    // Store alert
    this.alerts.set(clinicalAlert.alertId, clinicalAlert);

    // Submit to EHR/alerting system if available
    if (this.ehrEndpoint) {
      try {
        await fetch(`${this.ehrEndpoint}/alerts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.EHR_API_KEY || ''}`
          },
          body: JSON.stringify(clinicalAlert)
        });
      } catch (error) {
        console.error('EHR alert submission error:', error);
        // Continue even if EHR submission fails
      }
    }

    return clinicalAlert;
  }

  /**
   * Schedule urgent visit
   */
  private async scheduleUrgentVisit(
    tenantId: string,
    patientId: string,
    request: {
      department: string;
      priority: 'low' | 'medium' | 'high' | 'urgent';
      reason: string;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    // This would integrate with appointment scheduling system
    // For now, create an alert that can be acted upon
    await this.createAlert(tenantId, patientId, {
      alertType: 'triage',
      severity: request.priority,
      message: `Urgent visit requested: ${request.reason}`,
      assignedTo: request.department,
      metadata: request.metadata
    });
  }

  /**
   * Notify department
   */
  private async notifyDepartment(
    tenantId: string,
    department: string,
    notification: {
      patientId: string;
      message: string;
      priority: 'low' | 'medium' | 'high' | 'urgent';
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    // Create alert assigned to department
    await this.createAlert(tenantId, notification.patientId, {
      alertType: 'general',
      severity: notification.priority,
      message: notification.message,
      assignedTo: department,
      metadata: notification.metadata
    });
  }

  /**
   * Escalate to nurse
   */
  private async escalateToNurse(
    tenantId: string,
    patientId: string,
    request: {
      message: string;
      priority: 'low' | 'medium' | 'high' | 'urgent';
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    await this.createAlert(tenantId, patientId, {
      alertType: 'triage',
      severity: request.priority,
      message: request.message,
      assignedTo: 'nursing_station',
      metadata: request.metadata
    });
  }

  /**
   * Find trigger by condition
   */
  private findTriggerByCondition(condition: string): WorkflowTrigger | undefined {
    for (const trigger of this.triggers.values()) {
      if (trigger.condition === condition) {
        return trigger;
      }
    }
    return undefined;
  }

  /**
   * Determine flag type from condition
   */
  private determineFlagType(condition: string): ChartFlag['flagType'] {
    if (condition.includes('chest_pain') || condition.includes('urgent')) {
      return 'urgent_review';
    }
    if (condition.includes('medication')) {
      return 'medication_alert';
    }
    if (condition.includes('symptom') || condition.includes('triage')) {
      return 'symptom_alert';
    }
    return 'follow_up_required';
  }

  /**
   * Determine alert type from condition
   */
  private determineAlertType(condition: string): ClinicalAlert['alertType'] {
    if (condition.includes('medication')) {
      return 'medication';
    }
    if (condition.includes('vital')) {
      return 'vital_sign';
    }
    if (condition.includes('adherence')) {
      return 'adherence';
    }
    if (condition.includes('triage') || condition.includes('symptom')) {
      return 'triage';
    }
    return 'general';
  }

  /**
   * Get alerts for patient
   */
  getPatientAlerts(patientId: string): ClinicalAlert[] {
    return Array.from(this.alerts.values())
      .filter(alert => alert.patientId === patientId && !alert.acknowledged);
  }

  /**
   * Get chart flags for patient
   */
  getPatientChartFlags(patientId: string): ChartFlag[] {
    return this.chartFlags.get(patientId) || [];
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(
    alertId: string,
    acknowledgedBy: string
  ): Promise<void> {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedBy = acknowledgedBy;
      alert.acknowledgedAt = new Date();
    }
  }
}

export const clinicalWorkflowService = new ClinicalWorkflowService();
