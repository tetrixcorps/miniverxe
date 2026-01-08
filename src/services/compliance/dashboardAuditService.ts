// Dashboard Audit Service
// Logs all dashboard actions for compliance and audit purposes

import { auditEvidenceService, type AuditEventType } from './auditEvidenceService';

export interface DashboardAction {
  action: string;
  resource: string;
  resourceId?: string;
  tenantId: string;
  userId?: string;
  industry: string;
  details?: Record<string, any>;
}

class DashboardAuditService {
  /**
   * Log dashboard action for audit compliance
   */
  async logDashboardAction(action: DashboardAction): Promise<void> {
    const eventType = this.mapActionToEventType(action.action);

    await auditEvidenceService.logEvent({
      tenantId: action.tenantId,
      callId: `dashboard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eventType,
      eventData: {
        action: action.action,
        resource: action.resource,
        resourceId: action.resourceId,
        userId: action.userId,
        industry: action.industry,
        details: action.details,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Map dashboard action to audit event type
   */
  private mapActionToEventType(action: string): AuditEventType {
    // Map common dashboard actions to audit event types
    const actionMap: Record<string, AuditEventType> = {
      'ivr.flow.created': 'policy.action_taken',
      'ivr.flow.updated': 'policy.action_taken',
      'ivr.flow.deleted': 'policy.action_taken',
      'ivr.agent.added': 'policy.action_taken',
      'ivr.agent.updated': 'policy.action_taken',
      'ivr.agent.removed': 'policy.action_taken',
      'compliance.policy.updated': 'policy.evaluated',
      'compliance.script.updated': 'disclosure.script_played',
      'consent.revoked': 'consent.revoked',
      'data.exported': 'data.access',
      'audit.trail.exported': 'data.access',
      'recording.deleted': 'recording.stopped',
      'recording.downloaded': 'data.access'
    };

    return actionMap[action] || 'data.access';
  }

  /**
   * Log IVR flow creation
   */
  async logIVRFlowCreated(tenantId: string, flowId: string, industry: string, userId?: string): Promise<void> {
    await this.logDashboardAction({
      action: 'ivr.flow.created',
      resource: 'ivr_flow',
      resourceId: flowId,
      tenantId,
      userId,
      industry,
      details: { flowId }
    });
  }

  /**
   * Log IVR flow update
   */
  async logIVRFlowUpdated(tenantId: string, flowId: string, industry: string, changes: Record<string, any>, userId?: string): Promise<void> {
    await this.logDashboardAction({
      action: 'ivr.flow.updated',
      resource: 'ivr_flow',
      resourceId: flowId,
      tenantId,
      userId,
      industry,
      details: { flowId, changes }
    });
  }

  /**
   * Log IVR flow deletion
   */
  async logIVRFlowDeleted(tenantId: string, flowId: string, industry: string, userId?: string): Promise<void> {
    await this.logDashboardAction({
      action: 'ivr.flow.deleted',
      resource: 'ivr_flow',
      resourceId: flowId,
      tenantId,
      userId,
      industry,
      details: { flowId }
    });
  }

  /**
   * Log agent management action
   */
  async logAgentAction(
    tenantId: string,
    action: 'added' | 'updated' | 'removed',
    agentId: string,
    industry: string,
    details?: Record<string, any>,
    userId?: string
  ): Promise<void> {
    await this.logDashboardAction({
      action: `ivr.agent.${action}`,
      resource: 'ivr_agent',
      resourceId: agentId,
      tenantId,
      userId,
      industry,
      details: { agentId, ...details }
    });
  }

  /**
   * Log compliance policy update
   */
  async logPolicyUpdate(tenantId: string, policyId: string, industry: string, changes: Record<string, any>, userId?: string): Promise<void> {
    await this.logDashboardAction({
      action: 'compliance.policy.updated',
      resource: 'compliance_policy',
      resourceId: policyId,
      tenantId,
      userId,
      industry,
      details: { policyId, changes }
    });
  }

  /**
   * Log disclosure script update
   */
  async logScriptUpdate(tenantId: string, scriptId: string, industry: string, changes: Record<string, any>, userId?: string): Promise<void> {
    await this.logDashboardAction({
      action: 'compliance.script.updated',
      resource: 'disclosure_script',
      resourceId: scriptId,
      tenantId,
      userId,
      industry,
      details: { scriptId, changes }
    });
  }

  /**
   * Log data export
   */
  async logDataExport(tenantId: string, exportType: string, industry: string, recordCount: number, userId?: string): Promise<void> {
    await this.logDashboardAction({
      action: 'data.exported',
      resource: 'data_export',
      tenantId,
      userId,
      industry,
      details: { exportType, recordCount }
    });
  }

  /**
   * Log audit trail export
   */
  async logAuditTrailExport(tenantId: string, callId: string, industry: string, format: string, userId?: string): Promise<void> {
    await this.logDashboardAction({
      action: 'audit.trail.exported',
      resource: 'audit_trail',
      resourceId: callId,
      tenantId,
      userId,
      industry,
      details: { callId, format }
    });
  }

  /**
   * Log recording access
   */
  async logRecordingAccess(tenantId: string, callId: string, industry: string, action: 'downloaded' | 'deleted' | 'viewed', userId?: string): Promise<void> {
    await this.logDashboardAction({
      action: `recording.${action}`,
      resource: 'call_recording',
      resourceId: callId,
      tenantId,
      userId,
      industry,
      details: { callId, action }
    });
  }
}

export const dashboardAuditService = new DashboardAuditService();
