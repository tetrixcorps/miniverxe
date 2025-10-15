// TETRIX Audit Logging and Security Monitoring Service
// Comprehensive audit logging, security monitoring, and compliance reporting

export interface AuditEvent {
  id: string;
  timestamp: string;
  eventType: 'authentication' | 'authorization' | 'data_access' | 'data_modification' | 'system_access' | 'security_event' | 'compliance_event';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  userEmail?: string;
  sessionId?: string;
  ipAddress: string;
  userAgent: string;
  action: string;
  resource: string;
  resourceId?: string;
  result: 'success' | 'failure' | 'denied';
  details: Record<string, any>;
  industry: string;
  organizationId: string;
  complianceFrameworks: string[];
  riskScore: number;
  geolocation?: {
    country: string;
    region: string;
    city: string;
    latitude: number;
    longitude: number;
  };
  deviceInfo?: {
    type: string;
    os: string;
    browser: string;
    version: string;
  };
  tags: string[];
  retentionPeriod: number; // in days
  createdAt: string;
}

export interface SecurityAlert {
  id: string;
  timestamp: string;
  alertType: 'suspicious_activity' | 'failed_authentication' | 'privilege_escalation' | 'data_breach' | 'compliance_violation' | 'anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  userId?: string;
  userEmail?: string;
  ipAddress: string;
  affectedResources: string[];
  indicators: string[];
  riskScore: number;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo?: string;
  resolution?: string;
  industry: string;
  organizationId: string;
  complianceFrameworks: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface SecurityMetrics {
  period: string;
  totalEvents: number;
  authenticationEvents: number;
  authorizationEvents: number;
  dataAccessEvents: number;
  securityEvents: number;
  failedAuthentications: number;
  successfulAuthentications: number;
  privilegeEscalations: number;
  dataBreaches: number;
  complianceViolations: number;
  riskScore: number;
  topUsers: Array<{
    userId: string;
    userEmail: string;
    eventCount: number;
    riskScore: number;
  }>;
  topResources: Array<{
    resource: string;
    accessCount: number;
    riskScore: number;
  }>;
  topIPAddresses: Array<{
    ipAddress: string;
    eventCount: number;
    riskScore: number;
    geolocation: string;
  }>;
  complianceStatus: Array<{
    framework: string;
    complianceScore: number;
    violations: number;
  }>;
}

export interface ComplianceReport {
  id: string;
  name: string;
  description: string;
  framework: string;
  organizationId: string;
  period: string;
  status: 'draft' | 'review' | 'approved' | 'published';
  data: ComplianceReportData;
  generatedAt: string;
  generatedBy: string;
  approvedBy?: string;
  publishedAt?: string;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  downloadUrl?: string;
}

export interface ComplianceReportData {
  summary: {
    totalEvents: number;
    complianceScore: number;
    violations: number;
    recommendations: number;
  };
  events: Array<{
    id: string;
    timestamp: string;
    eventType: string;
    severity: string;
    action: string;
    resource: string;
    result: string;
    complianceFrameworks: string[];
  }>;
  violations: Array<{
    id: string;
    timestamp: string;
    framework: string;
    requirement: string;
    severity: string;
    description: string;
    remediation: string;
  }>;
  recommendations: Array<{
    id: string;
    priority: string;
    category: string;
    description: string;
    implementation: string;
  }>;
}

export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  industry: string;
  rules: SecurityRule[];
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface SecurityRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  action: 'alert' | 'block' | 'log' | 'notify';
  severity: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  threshold?: number;
  timeWindow?: number; // in minutes
}

/**
 * Audit Logging and Security Monitoring Service
 */
export class AuditLoggingService {
  private events: Map<string, AuditEvent> = new Map();
  private alerts: Map<string, SecurityAlert> = new Map();
  private policies: Map<string, SecurityPolicy> = new Map();
  private metrics: Map<string, SecurityMetrics> = new Map();

  constructor() {
    this.initializeSecurityPolicies();
  }

  /**
   * Initialize default security policies
   */
  private initializeSecurityPolicies(): void {
    // Failed Authentication Policy
    this.policies.set('failed_auth_policy', {
      id: 'failed_auth_policy',
      name: 'Failed Authentication Policy',
      description: 'Monitor and alert on failed authentication attempts',
      industry: 'all',
      rules: [
        {
          id: 'failed_auth_rule',
          name: 'Multiple Failed Logins',
          description: 'Alert when user has multiple failed login attempts',
          condition: 'eventType == "authentication" AND result == "failure"',
          action: 'alert',
          severity: 'medium',
          isActive: true,
          threshold: 5,
          timeWindow: 15
        }
      ],
      isActive: true,
      priority: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Privilege Escalation Policy
    this.policies.set('privilege_escalation_policy', {
      id: 'privilege_escalation_policy',
      name: 'Privilege Escalation Policy',
      description: 'Monitor for privilege escalation attempts',
      industry: 'all',
      rules: [
        {
          id: 'privilege_escalation_rule',
          name: 'Privilege Escalation Attempt',
          description: 'Alert when user attempts to escalate privileges',
          condition: 'eventType == "authorization" AND action == "privilege_escalation"',
          action: 'alert',
          severity: 'high',
          isActive: true
        }
      ],
      isActive: true,
      priority: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Data Access Policy
    this.policies.set('data_access_policy', {
      id: 'data_access_policy',
      name: 'Data Access Policy',
      description: 'Monitor data access patterns',
      industry: 'all',
      rules: [
        {
          id: 'suspicious_data_access_rule',
          name: 'Suspicious Data Access',
          description: 'Alert on suspicious data access patterns',
          condition: 'eventType == "data_access" AND riskScore > 80',
          action: 'alert',
          severity: 'high',
          isActive: true
        }
      ],
      isActive: true,
      priority: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  /**
   * Log audit event
   */
  async logEvent(event: Omit<AuditEvent, 'id' | 'timestamp' | 'createdAt'>): Promise<AuditEvent> {
    const auditEvent: AuditEvent = {
      ...event,
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    this.events.set(auditEvent.id, auditEvent);
    
    // Check for security alerts
    await this.checkSecurityAlerts(auditEvent);
    
    // Update metrics
    await this.updateMetrics(auditEvent);

    console.log(`✅ Logged audit event: ${auditEvent.action} for user ${auditEvent.userEmail || 'unknown'}`);
    return auditEvent;
  }

  /**
   * Check for security alerts based on events
   */
  private async checkSecurityAlerts(event: AuditEvent): Promise<void> {
    const policies = Array.from(this.policies.values()).filter(policy => 
      policy.isActive && (policy.industry === 'all' || policy.industry === event.industry)
    );

    for (const policy of policies) {
      for (const rule of policy.rules) {
        if (this.evaluateRule(rule, event)) {
          await this.createSecurityAlert(rule, event);
        }
      }
    }
  }

  /**
   * Evaluate security rule against event
   */
  private evaluateRule(rule: SecurityRule, event: AuditEvent): boolean {
    // Simple rule evaluation - in production, this would use a more sophisticated rule engine
    const conditions = rule.condition.split(' AND ');
    
    for (const condition of conditions) {
      const [field, operator, value] = condition.split(' ');
      
      if (!this.evaluateCondition(field, operator, value, event)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Evaluate single condition
   */
  private evaluateCondition(field: string, operator: string, value: string, event: AuditEvent): boolean {
    const eventValue = this.getEventValue(field, event);
    
    switch (operator) {
      case '==':
        return eventValue === value;
      case '!=':
        return eventValue !== value;
      case '>':
        return Number(eventValue) > Number(value);
      case '<':
        return Number(eventValue) < Number(value);
      case '>=':
        return Number(eventValue) >= Number(value);
      case '<=':
        return Number(eventValue) <= Number(value);
      case 'contains':
        return String(eventValue).includes(value);
      case 'not_contains':
        return !String(eventValue).includes(value);
      default:
        return false;
    }
  }

  /**
   * Get event value by field name
   */
  private getEventValue(field: string, event: AuditEvent): any {
    const fieldMap: Record<string, any> = {
      eventType: event.eventType,
      result: event.result,
      action: event.action,
      resource: event.resource,
      riskScore: event.riskScore,
      severity: event.severity,
      userId: event.userId,
      userEmail: event.userEmail,
      ipAddress: event.ipAddress
    };

    return fieldMap[field] || null;
  }

  /**
   * Create security alert
   */
  private async createSecurityAlert(rule: SecurityRule, event: AuditEvent): Promise<void> {
    const alert: SecurityAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      alertType: this.determineAlertType(event),
      severity: rule.severity,
      title: rule.name,
      description: rule.description,
      userId: event.userId,
      userEmail: event.userEmail,
      ipAddress: event.ipAddress,
      affectedResources: [event.resource],
      indicators: [event.action],
      riskScore: event.riskScore,
      status: 'open',
      industry: event.industry,
      organizationId: event.organizationId,
      complianceFrameworks: event.complianceFrameworks,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.alerts.set(alert.id, alert);
    console.log(`🚨 Security alert created: ${alert.title} for user ${alert.userEmail || 'unknown'}`);
  }

  /**
   * Determine alert type based on event
   */
  private determineAlertType(event: AuditEvent): SecurityAlert['alertType'] {
    switch (event.eventType) {
      case 'authentication':
        return event.result === 'failure' ? 'failed_authentication' : 'suspicious_activity';
      case 'authorization':
        return 'privilege_escalation';
      case 'data_access':
        return 'suspicious_activity';
      case 'security_event':
        return 'anomaly';
      case 'compliance_event':
        return 'compliance_violation';
      default:
        return 'suspicious_activity';
    }
  }

  /**
   * Update security metrics
   */
  private async updateMetrics(event: AuditEvent): Promise<void> {
    const period = this.getCurrentPeriod();
    const existingMetrics = this.metrics.get(period);
    
    if (existingMetrics) {
      // Update existing metrics
      existingMetrics.totalEvents++;
      existingMetrics.riskScore = (existingMetrics.riskScore + event.riskScore) / 2;
      
      // Update specific event types
      switch (event.eventType) {
        case 'authentication':
          existingMetrics.authenticationEvents++;
          if (event.result === 'failure') {
            existingMetrics.failedAuthentications++;
          } else {
            existingMetrics.successfulAuthentications++;
          }
          break;
        case 'authorization':
          existingMetrics.authorizationEvents++;
          break;
        case 'data_access':
          existingMetrics.dataAccessEvents++;
          break;
        case 'security_event':
          existingMetrics.securityEvents++;
          break;
      }
      
      this.metrics.set(period, existingMetrics);
    } else {
      // Create new metrics
      const newMetrics: SecurityMetrics = {
        period,
        totalEvents: 1,
        authenticationEvents: event.eventType === 'authentication' ? 1 : 0,
        authorizationEvents: event.eventType === 'authorization' ? 1 : 0,
        dataAccessEvents: event.eventType === 'data_access' ? 1 : 0,
        securityEvents: event.eventType === 'security_event' ? 1 : 0,
        failedAuthentications: event.eventType === 'authentication' && event.result === 'failure' ? 1 : 0,
        successfulAuthentications: event.eventType === 'authentication' && event.result === 'success' ? 1 : 0,
        privilegeEscalations: 0,
        dataBreaches: 0,
        complianceViolations: 0,
        riskScore: event.riskScore,
        topUsers: [],
        topResources: [],
        topIPAddresses: [],
        complianceStatus: []
      };
      
      this.metrics.set(period, newMetrics);
    }
  }

  /**
   * Get current period (e.g., "2023-12")
   */
  private getCurrentPeriod(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  /**
   * Get audit events
   */
  getEvents(filters?: {
    userId?: string;
    eventType?: string;
    severity?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): AuditEvent[] {
    let events = Array.from(this.events.values());
    
    if (filters) {
      if (filters.userId) {
        events = events.filter(event => event.userId === filters.userId);
      }
      if (filters.eventType) {
        events = events.filter(event => event.eventType === filters.eventType);
      }
      if (filters.severity) {
        events = events.filter(event => event.severity === filters.severity);
      }
      if (filters.startDate) {
        events = events.filter(event => event.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        events = events.filter(event => event.timestamp <= filters.endDate!);
      }
    }
    
    // Sort by timestamp (newest first)
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Apply pagination
    if (filters?.offset) {
      events = events.slice(filters.offset);
    }
    if (filters?.limit) {
      events = events.slice(0, filters.limit);
    }
    
    return events;
  }

  /**
   * Get security alerts
   */
  getAlerts(filters?: {
    status?: string;
    severity?: string;
    alertType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): SecurityAlert[] {
    let alerts = Array.from(this.alerts.values());
    
    if (filters) {
      if (filters.status) {
        alerts = alerts.filter(alert => alert.status === filters.status);
      }
      if (filters.severity) {
        alerts = alerts.filter(alert => alert.severity === filters.severity);
      }
      if (filters.alertType) {
        alerts = alerts.filter(alert => alert.alertType === filters.alertType);
      }
      if (filters.startDate) {
        alerts = alerts.filter(alert => alert.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        alerts = alerts.filter(alert => alert.timestamp <= filters.endDate!);
      }
    }
    
    // Sort by timestamp (newest first)
    alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Apply pagination
    if (filters?.offset) {
      alerts = alerts.slice(filters.offset);
    }
    if (filters?.limit) {
      alerts = alerts.slice(0, filters.limit);
    }
    
    return alerts;
  }

  /**
   * Get security metrics
   */
  getMetrics(period?: string): SecurityMetrics | null {
    const targetPeriod = period || this.getCurrentPeriod();
    return this.metrics.get(targetPeriod) || null;
  }

  /**
   * Get compliance report
   */
  async generateComplianceReport(framework: string, organizationId: string, period: string): Promise<ComplianceReport> {
    const events = this.getEvents({
      startDate: `${period}-01`,
      endDate: `${period}-31`
    });

    const frameworkEvents = events.filter(event => 
      event.complianceFrameworks.includes(framework)
    );

    const violations = frameworkEvents.filter(event => 
      event.severity === 'high' || event.severity === 'critical'
    );

    const reportData: ComplianceReportData = {
      summary: {
        totalEvents: frameworkEvents.length,
        complianceScore: this.calculateComplianceScore(frameworkEvents),
        violations: violations.length,
        recommendations: this.generateRecommendations(frameworkEvents).length
      },
      events: frameworkEvents.map(event => ({
        id: event.id,
        timestamp: event.timestamp,
        eventType: event.eventType,
        severity: event.severity,
        action: event.action,
        resource: event.resource,
        result: event.result,
        complianceFrameworks: event.complianceFrameworks
      })),
      violations: violations.map(event => ({
        id: event.id,
        timestamp: event.timestamp,
        framework: framework,
        requirement: event.action,
        severity: event.severity,
        description: event.details.description || 'Compliance violation detected',
        remediation: event.details.remediation || 'Review and address the violation'
      })),
      recommendations: this.generateRecommendations(frameworkEvents)
    };

    const report: ComplianceReport = {
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${framework} Compliance Report - ${period}`,
      description: `Compliance report for ${framework} framework`,
      framework,
      organizationId,
      period,
      status: 'draft',
      data: reportData,
      generatedAt: new Date().toISOString(),
      generatedBy: 'system',
      format: 'json'
    };

    console.log(`✅ Generated compliance report for ${framework} framework`);
    return report;
  }

  /**
   * Calculate compliance score
   */
  private calculateComplianceScore(events: AuditEvent[]): number {
    if (events.length === 0) return 100;
    
    const violations = events.filter(event => 
      event.severity === 'high' || event.severity === 'critical'
    );
    
    const violationRate = violations.length / events.length;
    return Math.max(0, Math.round((1 - violationRate) * 100));
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(events: AuditEvent[]): Array<{
    id: string;
    priority: string;
    category: string;
    description: string;
    implementation: string;
  }> {
    const recommendations: Array<{
      id: string;
      priority: string;
      category: string;
      description: string;
      implementation: string;
    }> = [];

    // Analyze events for patterns
    const highRiskEvents = events.filter(event => event.riskScore > 80);
    const failedAuths = events.filter(event => 
      event.eventType === 'authentication' && event.result === 'failure'
    );

    if (highRiskEvents.length > 0) {
      recommendations.push({
        id: 'high_risk_events',
        priority: 'high',
        category: 'security',
        description: 'High-risk events detected in audit logs',
        implementation: 'Review and investigate high-risk events, implement additional monitoring'
      });
    }

    if (failedAuths.length > 10) {
      recommendations.push({
        id: 'failed_auths',
        priority: 'medium',
        category: 'authentication',
        description: 'High number of failed authentication attempts',
        implementation: 'Implement account lockout policies and monitor for brute force attacks'
      });
    }

    return recommendations;
  }

  /**
   * Update alert status
   */
  async updateAlertStatus(alertId: string, status: SecurityAlert['status'], resolution?: string): Promise<SecurityAlert | null> {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      console.warn(`Alert with ID ${alertId} not found.`);
      return null;
    }

    const updatedAlert = {
      ...alert,
      status,
      resolution,
      updatedAt: new Date().toISOString(),
      resolvedAt: status === 'resolved' ? new Date().toISOString() : undefined
    };

    this.alerts.set(alertId, updatedAlert);
    console.log(`✅ Updated alert ${alertId} status to ${status}`);
    return updatedAlert;
  }

  /**
   * Get audit event by ID
   */
  getEvent(eventId: string): AuditEvent | null {
    return this.events.get(eventId) || null;
  }

  /**
   * Get security alert by ID
   */
  getAlert(alertId: string): SecurityAlert | null {
    return this.alerts.get(alertId) || null;
  }

  /**
   * Get all security policies
   */
  getAllPolicies(): SecurityPolicy[] {
    return Array.from(this.policies.values());
  }

  /**
   * Create security policy
   */
  async createPolicy(policy: Omit<SecurityPolicy, 'id' | 'createdAt' | 'updatedAt'>): Promise<SecurityPolicy> {
    const newPolicy: SecurityPolicy = {
      ...policy,
      id: `policy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.policies.set(newPolicy.id, newPolicy);
    console.log(`✅ Created security policy: ${newPolicy.name}`);
    return newPolicy;
  }

  /**
   * Update security policy
   */
  async updatePolicy(policyId: string, updates: Partial<SecurityPolicy>): Promise<SecurityPolicy | null> {
    const policy = this.policies.get(policyId);
    if (!policy) {
      console.warn(`Policy with ID ${policyId} not found.`);
      return null;
    }

    const updatedPolicy = {
      ...policy,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.policies.set(policyId, updatedPolicy);
    console.log(`✅ Updated security policy: ${updatedPolicy.name}`);
    return updatedPolicy;
  }

  /**
   * Delete security policy
   */
  async deletePolicy(policyId: string): Promise<boolean> {
    const policy = this.policies.get(policyId);
    if (!policy) {
      console.warn(`Policy with ID ${policyId} not found.`);
      return false;
    }

    this.policies.delete(policyId);
    console.log(`✅ Deleted security policy: ${policy.name}`);
    return true;
  }
}
