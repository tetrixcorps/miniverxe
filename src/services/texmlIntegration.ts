// TeXML Integration Services
// Connects TeXML voice applications with existing industry implementations

import { IndustryTeXMLGenerator, AdvancedTeXMLFeatures } from './texmlTemplates';

export interface TeXMLIntegrationConfig {
  industry: string;
  webhookUrl: string;
  complianceLevel: string;
  features: string[];
  phoneNumbers: {
    primary: string;
    secondary: string;
    emergency: string;
  };
}

export class TeXMLIntegrationService {
  private industryGenerator: IndustryTeXMLGenerator;
  private advancedFeatures: AdvancedTeXMLFeatures;
  private config: TeXMLIntegrationConfig;

  constructor(config: TeXMLIntegrationConfig) {
    this.industryGenerator = new IndustryTeXMLGenerator();
    this.advancedFeatures = new AdvancedTeXMLFeatures();
    this.config = config;
  }

  // Healthcare Integration
  async generateHealthcareTeXML(scenario: string, patientData?: any): Promise<string> {
    const variables = {
      patient_services_number: this.config.phoneNumbers.primary,
      emergency_services_number: this.config.phoneNumbers.emergency,
      billing_services_number: this.config.phoneNumbers.secondary
    };

    // Add patient-specific data if available
    if (patientData) {
      variables.patient_name = patientData.name || '';
      variables.patient_id = patientData.id || '';
    }

    return this.industryGenerator.generateHealthcareTeXML(scenario, variables);
  }

  // Legal Integration
  async generateLegalTeXML(scenario: string, clientData?: any): Promise<string> {
    const variables = {
      legal_services_number: this.config.phoneNumbers.primary,
      attorney_support_number: this.config.phoneNumbers.secondary,
      emergency_legal_number: this.config.phoneNumbers.emergency
    };

    // Add client-specific data if available
    if (clientData) {
      variables.client_name = clientData.name || '';
      variables.case_number = clientData.caseNumber || '';
    }

    return this.industryGenerator.generateLegalTeXML(scenario, variables);
  }

  // Fleet Management Integration
  async generateFleetTeXML(scenario: string, vehicleData?: any): Promise<string> {
    const variables = {
      emergency_dispatch_number: this.config.phoneNumbers.emergency,
      fleet_coordination_number: this.config.phoneNumbers.primary,
      maintenance_dispatch_number: this.config.phoneNumbers.secondary
    };

    // Add vehicle-specific data if available
    if (vehicleData) {
      variables.vehicle_id = vehicleData.id || '';
      variables.driver_id = vehicleData.driverId || '';
    }

    return this.industryGenerator.generateFleetTeXML(scenario, variables);
  }

  // General Business Integration
  async generateGeneralTeXML(scenario: string, businessData?: any): Promise<string> {
    const variables = {
      sales_number: this.config.phoneNumbers.primary,
      support_number: this.config.phoneNumbers.secondary,
      operator_number: this.config.phoneNumbers.emergency
    };

    // Add business-specific data if available
    if (businessData) {
      variables.company_name = businessData.name || '';
      variables.account_id = businessData.accountId || '';
    }

    return this.industryGenerator.generateGeneralTeXML(scenario, variables);
  }

  // Advanced Features Integration
  async generateAdvancedTeXML(feature: string, params: any): Promise<string> {
    switch (feature) {
      case 'conference':
        return this.advancedFeatures.generateConferenceTeXML(
          params.conferenceId,
          params.maxParticipants
        );
      
      case 'voicemail':
        return this.advancedFeatures.generateVoicemailTeXML(
          params.mailboxId,
          params.greeting
        );
      
      case 'queue':
        return this.advancedFeatures.generateQueueTeXML(
          params.queueId,
          params.waitMessage
        );
      
      case 'multi_language':
        return this.advancedFeatures.generateMultiLanguageTeXML(
          params.message,
          params.language
        );
      
      default:
        throw new Error(`Advanced feature ${feature} not supported`);
    }
  }
}

// TeXML Webhook Handler
export class TeXMLWebhookHandler {
  private integrationService: TeXMLIntegrationService;

  constructor(config: TeXMLIntegrationConfig) {
    this.integrationService = new TeXMLIntegrationService(config);
  }

  async handleWebhook(eventType: string, data: any): Promise<string> {
    try {
      const { industry, scenario, language, complianceType, ...params } = data;

      // Route based on industry
      switch (industry) {
        case 'healthcare':
          return await this.integrationService.generateHealthcareTeXML(scenario, params);
        
        case 'legal':
          return await this.integrationService.generateLegalTeXML(scenario, params);
        
        case 'fleet':
          return await this.integrationService.generateFleetTeXML(scenario, params);
        
        case 'general':
        default:
          return await this.integrationService.generateGeneralTeXML(scenario, params);
      }
    } catch (error) {
      console.error('TeXML webhook handling failed:', error);
      
      // Return error TeXML
      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">We're experiencing technical difficulties. Please try again later.</Say>
  <Hangup/>
</Response>`;
    }
  }
}

// TeXML Analytics and Monitoring
export class TeXMLAnalytics {
  private analyticsData: Map<string, any> = new Map();

  trackCallEvent(eventType: string, data: any) {
    const event = {
      timestamp: new Date().toISOString(),
      eventType,
      data,
      industry: data.industry || 'general',
      compliance: data.complianceType || 'general'
    };

    this.analyticsData.set(`${eventType}_${Date.now()}`, event);
    
    // Send to analytics service
    this.sendToAnalytics(event);
  }

  private async sendToAnalytics(event: any) {
    try {
      // Send to your analytics service
      console.log('TeXML Analytics Event:', event);
      
      // Example: Send to external analytics
      // await fetch('/api/analytics/texml-events', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event)
      // });
    } catch (error) {
      console.error('Analytics tracking failed:', error);
    }
  }

  getCallMetrics(timeRange: string = '24h'): any {
    const now = new Date();
    const timeRangeMs = this.getTimeRangeMs(timeRange);
    const cutoffTime = new Date(now.getTime() - timeRangeMs);

    const events = Array.from(this.analyticsData.values())
      .filter(event => new Date(event.timestamp) > cutoffTime);

    return {
      totalCalls: events.filter(e => e.eventType === 'call.initiated').length,
      completedCalls: events.filter(e => e.eventType === 'call.hangup').length,
      industryBreakdown: this.getIndustryBreakdown(events),
      complianceBreakdown: this.getComplianceBreakdown(events),
      averageCallDuration: this.getAverageCallDuration(events),
      topScenarios: this.getTopScenarios(events)
    };
  }

  private getTimeRangeMs(timeRange: string): number {
    const ranges = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };
    return ranges[timeRange as keyof typeof ranges] || ranges['24h'];
  }

  private getIndustryBreakdown(events: any[]): Record<string, number> {
    const breakdown: Record<string, number> = {};
    events.forEach(event => {
      const industry = event.industry || 'general';
      breakdown[industry] = (breakdown[industry] || 0) + 1;
    });
    return breakdown;
  }

  private getComplianceBreakdown(events: any[]): Record<string, number> {
    const breakdown: Record<string, number> = {};
    events.forEach(event => {
      const compliance = event.compliance || 'general';
      breakdown[compliance] = (breakdown[compliance] || 0) + 1;
    });
    return breakdown;
  }

  private getAverageCallDuration(events: any[]): number {
    const callDurations = events
      .filter(e => e.eventType === 'call.hangup' && e.data.duration)
      .map(e => e.data.duration);
    
    if (callDurations.length === 0) return 0;
    
    return callDurations.reduce((sum, duration) => sum + duration, 0) / callDurations.length;
  }

  private getTopScenarios(events: any[]): Array<{scenario: string, count: number}> {
    const scenarioCounts: Record<string, number> = {};
    
    events.forEach(event => {
      if (event.data.scenario) {
        scenarioCounts[event.data.scenario] = (scenarioCounts[event.data.scenario] || 0) + 1;
      }
    });

    return Object.entries(scenarioCounts)
      .map(([scenario, count]) => ({ scenario, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }
}

// TeXML Compliance Manager
export class TeXMLComplianceManager {
  private complianceRules: Map<string, any> = new Map();

  constructor() {
    this.initializeComplianceRules();
  }

  private initializeComplianceRules() {
    // HIPAA compliance rules
    this.complianceRules.set('hipaa', {
      recordingConsent: true,
      dataRetention: '7 years',
      accessLogging: true,
      encryptionRequired: true,
      auditTrail: true
    });

    // Attorney-client privilege rules
    this.complianceRules.set('attorney_client_privilege', {
      privilegeProtection: true,
      confidentialityNotice: true,
      accessRestriction: true,
      auditTrail: true,
      dataRetention: 'indefinite'
    });

    // Fleet management compliance
    this.complianceRules.set('fleet_management', {
      driverConsent: true,
      locationTracking: true,
      safetyLogging: true,
      dataRetention: '2 years'
    });

    // General business compliance
    this.complianceRules.set('general_business', {
      basicRecording: true,
      dataRetention: '1 year',
      accessLogging: false
    });
  }

  validateCompliance(complianceType: string, texmlData: any): boolean {
    const rules = this.complianceRules.get(complianceType);
    if (!rules) {
      return false;
    }

    // Check compliance rules
    if (rules.recordingConsent && !texmlData.recordingConsent) {
      return false;
    }

    if (rules.privilegeProtection && !texmlData.privilegeProtection) {
      return false;
    }

    if (rules.accessLogging && !texmlData.accessLogging) {
      return false;
    }

    return true;
  }

  getComplianceRequirements(complianceType: string): any {
    return this.complianceRules.get(complianceType) || {};
  }
}

export default {
  TeXMLIntegrationService,
  TeXMLWebhookHandler,
  TeXMLAnalytics,
  TeXMLComplianceManager
};
