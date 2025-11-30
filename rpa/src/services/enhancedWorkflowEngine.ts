// TETRIX Enhanced RPA Workflow Engine with Axiom.ai and Zoho RPA Integration
// Combines traditional RPA with browser automation capabilities

import { RPAWorkflow, WorkflowStep, BotConfiguration } from './rpaEngine';
import { AxiomBot, AxiomBotConfiguration, BrowserAction, CSSSelector } from './axiomIntegrationService';
import { ZohoRPABot, ZohoRPABotConfiguration, ZohoWorkflowStep } from './zohoRpaIntegrationService';

export interface EnhancedWorkflowStep extends WorkflowStep {
  axiomIntegration?: AxiomIntegration;
  zohoRpaIntegration?: ZohoRPAIntegration;
  browserAutomation?: BrowserAutomationStep;
  webScraping?: WebScrapingStep;
  formFilling?: FormFillingStep;
}

export interface AxiomIntegration {
  enabled: boolean;
  botId: string;
  targetUrl: string;
  selectors: CSSSelector[];
  actions: BrowserAction[];
  compliance: AxiomComplianceSettings;
  monitoring: AxiomMonitoringSettings;
}

export interface ZohoRPAIntegration {
  enabled: boolean;
  botId: string;
  workflowId: string;
  workspaceId: string;
  automationType: 'desktop' | 'web' | 'hybrid';
  steps: ZohoWorkflowStep[];
  compliance: ZohoRPAComplianceSettings;
  monitoring: ZohoRPAMonitoringSettings;
}

export interface BrowserAutomationStep {
  type: 'browser_automation';
  configuration: BrowserAutomationConfiguration;
  actions: BrowserAction[];
  validation: BrowserValidation;
  errorHandling: BrowserErrorHandling;
}

export interface WebScrapingStep {
  type: 'web_scraping';
  configuration: WebScrapingConfiguration;
  selectors: CSSSelector[];
  dataProcessing: DataProcessingConfig;
  storage: DataStorageConfig;
}

export interface FormFillingStep {
  type: 'form_filling';
  configuration: FormFillingConfiguration;
  formData: FormData;
  validation: FormValidation;
  submission: FormSubmission;
}

export interface BrowserAutomationConfiguration {
  targetUrl: string;
  userAgent: string;
  viewport: ViewportConfig;
  cookies: CookieConfig;
  headers: Record<string, string>;
  timeout: number;
  retryAttempts: number;
}

export interface WebScrapingConfiguration {
  targetUrl: string;
  selectors: CSSSelector[];
  pagination: PaginationConfig;
  rateLimiting: RateLimitingConfig;
  dataValidation: DataValidationConfig;
  storage: DataStorageConfig;
}

export interface FormFillingConfiguration {
  targetUrl: string;
  formData: FormData;
  validation: FormValidation;
  submission: FormSubmission;
  errorHandling: FormErrorHandling;
}

export interface ViewportConfig {
  width: number;
  height: number;
  deviceScaleFactor: number;
  isMobile: boolean;
}

export interface CookieConfig {
  enabled: boolean;
  cookies: Cookie[];
  sessionManagement: boolean;
}

export interface Cookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: Date;
  secure: boolean;
  httpOnly: boolean;
}

export interface PaginationConfig {
  enabled: boolean;
  nextPageSelector: string;
  maxPages: number;
  delayBetweenPages: number;
}

export interface DataProcessingConfig {
  enabled: boolean;
  transformations: DataTransformation[];
  filters: DataFilter[];
  aggregations: DataAggregation[];
}

export interface DataTransformation {
  field: string;
  type: 'format' | 'clean' | 'extract' | 'convert';
  configuration: any;
}

export interface DataFilter {
  field: string;
  condition: string;
  value: any;
}

export interface DataAggregation {
  field: string;
  type: 'count' | 'sum' | 'average' | 'min' | 'max';
  groupBy?: string;
}

export interface DataStorageConfig {
  type: 'database' | 'file' | 'api' | 'cloud';
  destination: string;
  format: 'json' | 'csv' | 'xml' | 'excel';
  compression: boolean;
  encryption: boolean;
}

export interface DataValidationConfig {
  enabled: boolean;
  rules: ValidationRule[];
  required: string[];
  unique: string[];
  format: Record<string, string>;
}

export interface FormData {
  fields: FormField[];
  validation: FormValidation;
  submission: FormSubmission;
}

export interface FormField {
  name: string;
  selector: string;
  value: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'checkbox' | 'radio';
  required: boolean;
  validation?: ValidationRule[];
}

export interface FormValidation {
  rules: ValidationRule[];
  customValidation?: string;
  errorMessages: Record<string, string>;
}

export interface FormSubmission {
  method: 'POST' | 'GET' | 'PUT' | 'DELETE';
  endpoint: string;
  headers: Record<string, string>;
  validation: SubmissionValidation;
}

export interface SubmissionValidation {
  successSelector: string;
  errorSelector: string;
  timeout: number;
  retryAttempts: number;
}

export interface FormErrorHandling {
  retryAttempts: number;
  retryDelay: number;
  fallbackAction: string;
  notificationEnabled: boolean;
}

export interface BrowserValidation {
  successSelectors: string[];
  errorSelectors: string[];
  timeout: number;
  retryAttempts: number;
}

export interface BrowserErrorHandling {
  retryAttempts: number;
  retryDelay: number;
  fallbackAction: string;
  screenshotOnError: boolean;
  notificationEnabled: boolean;
}

export interface AxiomComplianceSettings {
  dataPrivacy: boolean;
  websiteTerms: boolean;
  rateLimiting: boolean;
  userAgentRotation: boolean;
  proxySupport: boolean;
  gdprCompliance: boolean;
  dataRetention: number;
  auditLogging: boolean;
}

export interface AxiomMonitoringSettings {
  enabled: boolean;
  metrics: string[];
  alerts: AlertConfig[];
  reporting: ReportingConfig;
}

export interface ZohoRPAComplianceSettings {
  dataPrivacy: boolean;
  encryption: boolean;
  auditLogging: boolean;
  accessControl: boolean;
  dataRetention: number;
  gdprCompliance: boolean;
  hipaaCompliance: boolean;
  soxCompliance: boolean;
  iso27001Compliance: boolean;
}

export interface ZohoRPAMonitoringSettings {
  enabled: boolean;
  metrics: string[];
  alerts: AlertConfig[];
  reporting: ReportingConfig;
  realTimeMonitoring: boolean;
}

export interface AlertConfig {
  id: string;
  name: string;
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  notification: string;
  enabled: boolean;
}

export interface ReportingConfig {
  enabled: boolean;
  frequency: string;
  format: 'json' | 'csv' | 'pdf';
  recipients: string[];
  metrics: string[];
}

export interface ValidationRule {
  type: 'required' | 'format' | 'length' | 'range' | 'pattern';
  value: any;
  message: string;
}

export interface RateLimitingConfig {
  enabled: boolean;
  requestsPerMinute: number;
  delayBetweenRequests: number;
  maxConcurrentRequests: number;
  backoffMultiplier: number;
}

export class TETRIXEnhancedWorkflowEngine {
  private rpaEngine: any;
  private axiomService: any;
  private zohoRpaService: any;
  private enhancedWorkflows: Map<string, EnhancedWorkflowStep[]> = new Map();
  private industryConfigurations: Map<string, IndustryConfiguration> = new Map();

  constructor(rpaEngine: any, axiomService?: any, zohoRpaService?: any) {
    this.rpaEngine = rpaEngine;
    this.axiomService = axiomService;
    this.zohoRpaService = zohoRpaService;
    this.initializeEnhancedEngine();
  }

  /**
   * Initialize the enhanced workflow engine
   */
  private async initializeEnhancedEngine(): Promise<void> {
    try {
      console.log('🚀 Initializing TETRIX Enhanced Workflow Engine...');
      
      // Load industry configurations
      await this.loadIndustryConfigurations();
      
      // Initialize enhanced workflows
      await this.initializeEnhancedWorkflows();
      
      console.log('✅ Enhanced Workflow Engine initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Enhanced Workflow Engine:', error);
      throw error;
    }
  }

  /**
   * Create enhanced workflow with Axiom.ai and/or Zoho RPA integration
   */
  async createEnhancedWorkflow(industry: string, workflowConfig: EnhancedWorkflowConfig): Promise<EnhancedWorkflow> {
    try {
      const workflowId = this.generateWorkflowId(industry);
      
      // Create Axiom.ai bot if browser automation is required
      let axiomBot: AxiomBot | null = null;
      if (workflowConfig.browserAutomation) {
        axiomBot = await this.createAxiomBotForWorkflow(industry, workflowConfig);
      }
      
      // Create Zoho RPA bot if Zoho RPA automation is required
      let zohoRpaBot: ZohoRPABot | null = null;
      if (workflowConfig.zohoRpa && this.zohoRpaService) {
        zohoRpaBot = await this.createZohoRPABotForWorkflow(industry, workflowConfig);
      }
      
      // Create enhanced workflow
      const enhancedWorkflow: EnhancedWorkflow = {
        id: workflowId,
        name: workflowConfig.name,
        description: workflowConfig.description,
        industry,
        type: 'enhanced',
        status: 'inactive',
        steps: await this.createEnhancedSteps(workflowConfig, axiomBot, zohoRpaBot),
        axiomIntegration: axiomBot ? {
          enabled: true,
          botId: axiomBot.id,
          targetUrl: workflowConfig.browserAutomation?.targetUrl || '',
          selectors: workflowConfig.browserAutomation?.selectors || [],
          actions: workflowConfig.browserAutomation?.actions || [],
          compliance: this.getComplianceSettings(industry),
          monitoring: this.getMonitoringSettings(industry)
        } : undefined,
        zohoRpaIntegration: zohoRpaBot ? {
          enabled: true,
          botId: zohoRpaBot.id,
          workflowId: workflowId,
          workspaceId: workflowConfig.zohoRpa?.workspaceId || '',
          automationType: workflowConfig.zohoRpa?.automationType || 'desktop',
          steps: workflowConfig.zohoRpa?.workflowSteps || [],
          compliance: this.getZohoRPAComplianceSettings(industry),
          monitoring: this.getZohoRPAMonitoringSettings(industry)
        } : undefined,
        compliance: this.getComplianceSettings(industry),
        performance: {
          totalExecutions: 0,
          successfulExecutions: 0,
          failedExecutions: 0,
          averageExecutionTime: 0,
          peakExecutionTime: 0,
          resourceUtilization: 0,
          errorRate: 0,
          uptime: 0
        }
      };
      
      this.enhancedWorkflows.set(workflowId, enhancedWorkflow.steps);
      
      console.log(`✅ Created enhanced workflow for ${industry}: ${workflowId}`);
      return enhancedWorkflow;
    } catch (error) {
      console.error(`❌ Failed to create enhanced workflow:`, error);
      throw error;
    }
  }

  /**
   * Execute enhanced workflow
   */
  async executeEnhancedWorkflow(workflowId: string, inputData: any): Promise<EnhancedExecutionResult> {
    try {
      const workflow = this.enhancedWorkflows.get(workflowId);
      if (!workflow) {
        throw new Error(`Workflow ${workflowId} not found`);
      }

      const executionId = this.generateExecutionId();
      const result: EnhancedExecutionResult = {
        executionId,
        workflowId,
        status: 'running',
        startTime: new Date(),
        steps: [],
        axiomResults: [],
        errors: [],
        performance: {
          totalSteps: workflow.length,
          completedSteps: 0,
          failedSteps: 0,
          executionTime: 0,
          resourceUsage: 0
        }
      };

      // Execute each step
      for (const step of workflow) {
        try {
          const stepResult = await this.executeEnhancedStep(step, inputData, result);
          result.steps.push(stepResult);
          result.performance.completedSteps++;
        } catch (error) {
          console.error(`❌ Step execution failed:`, error);
          result.steps.push({
            stepId: step.id,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            executionTime: 0,
            axiomResult: null
          });
          result.performance.failedSteps++;
          result.errors.push(error instanceof Error ? error.message : 'Unknown error');
        }
      }

      result.status = result.performance.failedSteps === 0 ? 'completed' : 'failed';
      result.endTime = new Date();
      result.performance.executionTime = result.endTime.getTime() - result.startTime.getTime();

      console.log(`✅ Enhanced workflow execution completed: ${executionId}`);
      return result;
    } catch (error) {
      console.error(`❌ Enhanced workflow execution failed:`, error);
      throw error;
    }
  }

  /**
   * Execute enhanced step
   */
  private async executeEnhancedStep(step: EnhancedWorkflowStep, inputData: any, context: any): Promise<StepExecutionResult> {
    const startTime = Date.now();
    
    try {
      let result: any = null;
      
      // Execute based on step type
      switch (step.type) {
        case 'browser_automation':
          result = await this.executeBrowserAutomationStep(step, inputData, context);
          break;
        case 'web_scraping':
          result = await this.executeWebScrapingStep(step, inputData, context);
          break;
        case 'form_filling':
          result = await this.executeFormFillingStep(step, inputData, context);
          break;
        case 'data_extraction':
          result = await this.executeDataExtractionStep(step, inputData, context);
          break;
        case 'api_call':
          result = await this.executeApiCallStep(step, inputData, context);
          break;
        default:
          // Fallback to traditional RPA execution
          result = await this.rpaEngine.executeStep(step, inputData);
      }
      
      return {
        stepId: step.id,
        status: 'completed',
        result,
        executionTime: Date.now() - startTime,
        axiomResult: result.axiomResult || null
      };
    } catch (error) {
      return {
        stepId: step.id,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime,
        axiomResult: null
      };
    }
  }

  /**
   * Execute browser automation step
   */
  private async executeBrowserAutomationStep(step: EnhancedWorkflowStep, inputData: any, context: any): Promise<any> {
    if (!step.browserAutomation || !step.axiomIntegration) {
      throw new Error('Browser automation configuration missing');
    }

    const result = await this.axiomService.executeBrowserAutomation(
      step.axiomIntegration.botId,
      step.browserAutomation.actions
    );

    return {
      success: result.success,
      actionsExecuted: result.actionsExecuted,
      executionTime: result.executionTime,
      screenshots: result.screenshots,
      axiomResult: result
    };
  }

  /**
   * Execute web scraping step
   */
  private async executeWebScrapingStep(step: EnhancedWorkflowStep, inputData: any, context: any): Promise<any> {
    if (!step.webScraping || !step.axiomIntegration) {
      throw new Error('Web scraping configuration missing');
    }

    const result = await this.axiomService.executeWebScraping(
      step.axiomIntegration.botId,
      step.webScraping.configuration.targetUrl,
      step.webScraping.selectors
    );

    return {
      success: result.status === 'completed',
      dataExtracted: result.dataExtracted,
      selectors: result.results,
      axiomResult: result
    };
  }

  /**
   * Execute form filling step
   */
  private async executeFormFillingStep(step: EnhancedWorkflowStep, inputData: any, context: any): Promise<any> {
    if (!step.formFilling || !step.axiomIntegration) {
      throw new Error('Form filling configuration missing');
    }

    const result = await this.axiomService.executeFormFilling(
      step.axiomIntegration.botId,
      step.formFilling.configuration.targetUrl,
      step.formFilling.formData
    );

    return {
      success: result.status === 'completed',
      formData: result.results,
      submissionResult: result,
      axiomResult: result
    };
  }

  /**
   * Execute data extraction step
   */
  private async executeDataExtractionStep(step: EnhancedWorkflowStep, inputData: any, context: any): Promise<any> {
    // Traditional RPA data extraction with enhanced capabilities
    return await this.rpaEngine.executeStep(step, inputData);
  }

  /**
   * Execute API call step
   */
  private async executeApiCallStep(step: EnhancedWorkflowStep, inputData: any, context: any): Promise<any> {
    // Enhanced API calls with better error handling
    return await this.rpaEngine.executeStep(step, inputData);
  }

  /**
   * Create Axiom.ai bot for workflow
   */
  private async createAxiomBotForWorkflow(industry: string, workflowConfig: EnhancedWorkflowConfig): Promise<AxiomBot> {
    const axiomConfig: AxiomBotConfiguration = {
      targetUrl: workflowConfig.browserAutomation?.targetUrl || '',
      selectors: workflowConfig.browserAutomation?.selectors || [],
      actions: workflowConfig.browserAutomation?.actions || [],
      rateLimiting: {
        enabled: true,
        requestsPerMinute: 60,
        delayBetweenRequests: 1000,
        maxConcurrentRequests: 5,
        backoffMultiplier: 2
      },
      errorHandling: {
        retryAttempts: 3,
        retryDelay: 5000,
        fallbackAction: 'notify_admin',
        notificationEnabled: true,
        escalation: {
          enabled: true,
          threshold: 3,
          notificationChannels: ['email', 'slack'],
          escalationLevels: []
        }
      },
      monitoring: {
        enabled: true,
        metrics: ['execution_time', 'success_rate', 'error_rate'],
        alerts: [],
        reporting: {
          enabled: true,
          frequency: 'daily',
          format: 'json',
          recipients: [],
          metrics: []
        }
      }
    };

    return await this.axiomService.createBot(axiomConfig, industry);
  }

  /**
   * Create enhanced steps
   */
  /**
   * Create Zoho RPA bot for workflow
   */
  private async createZohoRPABotForWorkflow(industry: string, workflowConfig: EnhancedWorkflowConfig): Promise<ZohoRPABot> {
    if (!this.zohoRpaService || !workflowConfig.zohoRpa) {
      throw new Error('Zoho RPA service or configuration not available');
    }

    const zohoConfig: ZohoRPABotConfiguration = {
      workspaceId: workflowConfig.zohoRpa.workspaceId,
      botName: `${industry}_zoho_bot_${Date.now()}`,
      automationType: workflowConfig.zohoRpa.automationType,
      targetApplication: workflowConfig.zohoRpa.targetApplication,
      targetUrl: workflowConfig.zohoRpa.targetUrl,
      workflowSteps: workflowConfig.zohoRpa.workflowSteps,
      errorHandling: {
        retryAttempts: 3,
        retryDelay: 5000,
        fallbackAction: 'notify_admin',
        notificationEnabled: true,
        escalation: {
          enabled: true,
          threshold: 3,
          notificationChannels: ['email'],
          escalationLevels: []
        },
        errorLogging: true
      },
      monitoring: {
        enabled: true,
        metrics: ['execution_time', 'success_rate', 'error_rate'],
        alerts: [],
        reporting: {
          enabled: true,
          frequency: 'daily',
          format: 'json',
          recipients: [],
          metrics: []
        },
        realTimeMonitoring: true
      },
      variables: []
    };

    return await this.zohoRpaService.createBot(zohoConfig, industry);
  }

  private async createEnhancedSteps(workflowConfig: EnhancedWorkflowConfig, axiomBot: AxiomBot | null, zohoRpaBot: ZohoRPABot | null): Promise<EnhancedWorkflowStep[]> {
    const steps: EnhancedWorkflowStep[] = [];

    for (const stepConfig of workflowConfig.steps) {
      const enhancedStep: EnhancedWorkflowStep = {
        ...stepConfig,
        axiomIntegration: axiomBot ? {
          enabled: true,
          botId: axiomBot.id,
          targetUrl: workflowConfig.browserAutomation?.targetUrl || '',
          selectors: workflowConfig.browserAutomation?.selectors || [],
          actions: workflowConfig.browserAutomation?.actions || [],
          compliance: this.getComplianceSettings(workflowConfig.industry),
          monitoring: this.getMonitoringSettings(workflowConfig.industry)
        } : undefined,
        zohoRpaIntegration: zohoRpaBot ? {
          enabled: true,
          botId: zohoRpaBot.id,
          workflowId: workflowConfig.zohoRpa?.workspaceId || '',
          workspaceId: workflowConfig.zohoRpa?.workspaceId || '',
          automationType: workflowConfig.zohoRpa?.automationType || 'desktop',
          steps: workflowConfig.zohoRpa?.workflowSteps || [],
          compliance: this.getZohoRPAComplianceSettings(workflowConfig.industry),
          monitoring: this.getZohoRPAMonitoringSettings(workflowConfig.industry)
        } : undefined
      };

      // Add specific step configurations based on type
      if (stepConfig.type === 'browser_automation' && axiomBot) {
        enhancedStep.browserAutomation = {
          type: 'browser_automation',
          configuration: {
            targetUrl: workflowConfig.browserAutomation?.targetUrl || '',
            userAgent: 'TETRIX-RPA-Bot/1.0',
            viewport: { width: 1920, height: 1080, deviceScaleFactor: 1, isMobile: false },
            cookies: { enabled: true, cookies: [], sessionManagement: true },
            headers: {},
            timeout: 30000,
            retryAttempts: 3
          },
          actions: workflowConfig.browserAutomation?.actions || [],
          validation: {
            successSelectors: [],
            errorSelectors: [],
            timeout: 30000,
            retryAttempts: 3
          },
          errorHandling: {
            retryAttempts: 3,
            retryDelay: 5000,
            fallbackAction: 'notify_admin',
            screenshotOnError: true,
            notificationEnabled: true
          }
        };
      }

      steps.push(enhancedStep);
    }

    return steps;
  }

  /**
   * Get compliance settings for industry
   */
  private getComplianceSettings(industry: string): AxiomComplianceSettings {
    return {
      dataPrivacy: true,
      websiteTerms: true,
      rateLimiting: true,
      userAgentRotation: true,
      proxySupport: true,
      gdprCompliance: true,
      dataRetention: 90,
      auditLogging: true
    };
  }

  /**
   * Get monitoring settings for industry
   */
  private getMonitoringSettings(industry: string): AxiomMonitoringSettings {
    return {
      enabled: true,
      metrics: ['execution_time', 'success_rate', 'error_rate', 'compliance_score'],
      alerts: [],
      reporting: {
        enabled: true,
        frequency: 'daily',
        format: 'json',
        recipients: [],
        metrics: []
      }
    };
  }

  /**
   * Get Zoho RPA compliance settings for industry
   */
  private getZohoRPAComplianceSettings(industry: string): ZohoRPAComplianceSettings {
    const baseSettings: ZohoRPAComplianceSettings = {
      dataPrivacy: true,
      encryption: true,
      auditLogging: true,
      accessControl: true,
      dataRetention: 90,
      gdprCompliance: true,
      hipaaCompliance: false,
      soxCompliance: false,
      iso27001Compliance: true
    };

    // Industry-specific compliance
    if (industry === 'healthcare') {
      baseSettings.hipaaCompliance = true;
      baseSettings.dataRetention = 365; // 1 year for healthcare
    }

    if (industry === 'financial') {
      baseSettings.soxCompliance = true;
      baseSettings.dataRetention = 2555; // 7 years for financial
    }

    return baseSettings;
  }

  /**
   * Get Zoho RPA monitoring settings for industry
   */
  private getZohoRPAMonitoringSettings(industry: string): ZohoRPAMonitoringSettings {
    return {
      enabled: true,
      metrics: ['execution_time', 'success_rate', 'error_rate', 'compliance_score', 'uptime'],
      alerts: [],
      reporting: {
        enabled: true,
        frequency: 'daily',
        format: 'json',
        recipients: [],
        metrics: []
      },
      realTimeMonitoring: industry === 'financial' || industry === 'healthcare'
    };
  }

  /**
   * Load industry configurations
   */
  private async loadIndustryConfigurations(): Promise<void> {
    const industries = [
      'healthcare', 'financial', 'legal', 'government', 'manufacturing',
      'retail', 'education', 'construction', 'logistics', 'hospitality',
      'wellness', 'beauty'
    ];

    for (const industry of industries) {
      this.industryConfigurations.set(industry, {
        industry,
        browserAutomation: true,
        webScraping: true,
        formFilling: true,
        compliance: this.getComplianceSettings(industry),
        monitoring: this.getMonitoringSettings(industry)
      });
    }
  }

  /**
   * Initialize enhanced workflows
   */
  private async initializeEnhancedWorkflows(): Promise<void> {
    // Initialize industry-specific enhanced workflows
    console.log('📋 Initializing enhanced workflows for all industries');
  }

  /**
   * Generate workflow ID
   */
  private generateWorkflowId(industry: string): string {
    return `enhanced_workflow_${industry}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate execution ID
   */
  private generateExecutionId(): string {
    return `execution_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Supporting interfaces
export interface EnhancedWorkflowConfig {
  name: string;
  description: string;
  industry: string;
  steps: WorkflowStep[];
  browserAutomation?: BrowserAutomationConfig;
  zohoRpa?: ZohoRPAAutomationConfig;
}

export interface BrowserAutomationConfig {
  targetUrl: string;
  selectors: CSSSelector[];
  actions: BrowserAction[];
}

export interface ZohoRPAAutomationConfig {
  workspaceId: string;
  automationType: 'desktop' | 'web' | 'hybrid';
  targetApplication?: string;
  targetUrl?: string;
  workflowSteps: ZohoWorkflowStep[];
}

export interface EnhancedWorkflow {
  id: string;
  name: string;
  description: string;
  industry: string;
  type: 'enhanced';
  status: 'active' | 'inactive' | 'error' | 'maintenance';
  steps: EnhancedWorkflowStep[];
  axiomIntegration?: AxiomIntegration;
  zohoRpaIntegration?: ZohoRPAIntegration;
  compliance: AxiomComplianceSettings;
  performance: {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageExecutionTime: number;
    peakExecutionTime: number;
    resourceUtilization: number;
    errorRate: number;
    uptime: number;
  };
}

export interface EnhancedExecutionResult {
  executionId: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  steps: StepExecutionResult[];
  axiomResults: any[];
  errors: string[];
  performance: {
    totalSteps: number;
    completedSteps: number;
    failedSteps: number;
    executionTime: number;
    resourceUsage: number;
  };
}

export interface StepExecutionResult {
  stepId: string;
  status: 'completed' | 'failed';
  result?: any;
  error?: string;
  executionTime: number;
  axiomResult?: any;
}

export interface IndustryConfiguration {
  industry: string;
  browserAutomation: boolean;
  webScraping: boolean;
  formFilling: boolean;
  compliance: AxiomComplianceSettings;
  monitoring: AxiomMonitoringSettings;
}
