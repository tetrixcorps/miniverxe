// TETRIX Industry-Specific Workflow Integrations
// Integrates Enterprise Workflow Engine with industry-specific dashboards
// Maps workflows to existing CRM systems and backend services

import { EnterpriseWorkflowEngine, WorkflowTemplate, WorkflowExecution } from './EnterpriseWorkflowEngine';
import { CRMIntegrationService } from '../crmIntegrationService';

export interface IndustryWorkflowMapping {
  industry: string;
  dashboard: string;
  workflows: string[];
  crmIntegrations: string[];
  backendServices: string[];
}

export interface WorkflowDashboardIntegration {
  industry: string;
  dashboard: string;
  workflowTemplates: WorkflowTemplate[];
  availableIntegrations: string[];
  automationCapabilities: string[];
}

/**
 * Industry Workflow Integrations Service
 * Maps enterprise workflows to industry-specific dashboards and CRM systems
 */
export class IndustryWorkflowIntegrations {
  private workflowEngine: EnterpriseWorkflowEngine;
  private crmService: CRMIntegrationService;
  private industryMappings: Map<string, IndustryWorkflowMapping> = new Map();

  constructor() {
    this.workflowEngine = new EnterpriseWorkflowEngine();
    this.crmService = new CRMIntegrationService();
    this.initializeIndustryMappings();
  }

  /**
   * Initialize industry-specific workflow mappings
   */
  private initializeIndustryMappings(): void {
    // Healthcare Industry
    this.addIndustryMapping({
      industry: 'healthcare',
      dashboard: '/dashboards/healthcare',
      workflows: [
        'new_hire_onboarding',
        'expense_reimbursement',
        'document_approval',
        'contract_management'
      ],
      crmIntegrations: ['Epic MyChart', 'Salesforce Health Cloud', 'HubSpot'],
      backendServices: ['Epic FHIR API', 'Telnyx Voice', 'Deepgram STT', 'SHANGO AI']
    });

    // Legal Services
    this.addIndustryMapping({
      industry: 'legal',
      dashboard: '/dashboards/legal',
      workflows: [
        'document_approval',
        'contract_management',
        'new_hire_onboarding',
        'expense_reimbursement'
      ],
      crmIntegrations: ['Clio', 'MyCase', 'PracticePanther', 'Salesforce'],
      backendServices: ['Clio API', 'DocuSign', 'Telnyx Voice', 'SHANGO AI']
    });

    // Construction
    this.addIndustryMapping({
      industry: 'construction',
      dashboard: '/dashboards/construction',
      workflows: [
        'new_hire_onboarding',
        'expense_reimbursement',
        'document_approval',
        'it_service_request'
      ],
      crmIntegrations: ['Salesforce', 'HubSpot', 'Procore'],
      backendServices: ['Telnyx Voice', 'Deepgram STT', 'SHANGO AI', 'RPA Engine']
    });

    // Logistics & Fleet Management
    this.addIndustryMapping({
      industry: 'logistics',
      dashboard: '/dashboards/logistics',
      workflows: [
        'it_service_request',
        'user_access_provisioning',
        'document_approval',
        'expense_reimbursement'
      ],
      crmIntegrations: ['Salesforce', 'HubSpot', 'Fleet Management Systems'],
      backendServices: ['Telnyx Voice', 'IoT Telematics', 'SHANGO AI', 'RPA Engine']
    });

    // Government & Public Sector
    this.addIndustryMapping({
      industry: 'government',
      dashboard: '/dashboards/government',
      workflows: [
        'document_approval',
        'contract_management',
        'user_access_provisioning',
        'it_service_request'
      ],
      crmIntegrations: ['Salesforce Government Cloud', 'Microsoft Dynamics'],
      backendServices: ['Telnyx Voice', 'SHANGO AI', 'RPA Engine', 'Compliance Framework']
    });

    // Education
    this.addIndustryMapping({
      industry: 'education',
      dashboard: '/dashboards/education',
      workflows: [
        'new_hire_onboarding',
        'leave_request_management',
        'document_approval',
        'it_service_request'
      ],
      crmIntegrations: ['Salesforce Education Cloud', 'HubSpot', 'Student Information Systems'],
      backendServices: ['Telnyx Voice', 'SHANGO AI', 'RPA Engine', 'Unified Messaging']
    });

    // Retail
    this.addIndustryMapping({
      industry: 'retail',
      dashboard: '/dashboards/retail',
      workflows: [
        'lead_qualification_nurturing',
        'sales_proposal_generation',
        'expense_reimbursement',
        'new_hire_onboarding'
      ],
      crmIntegrations: ['Salesforce Commerce Cloud', 'HubSpot', 'Shopify', 'Wix'],
      backendServices: ['Telnyx Voice', 'SHANGO AI', 'RPA Engine', 'Marketing Campaigns']
    });

    // Hospitality
    this.addIndustryMapping({
      industry: 'hospitality',
      dashboard: '/dashboards/hospitality',
      workflows: [
        'lead_qualification_nurturing',
        'new_hire_onboarding',
        'expense_reimbursement',
        'document_approval'
      ],
      crmIntegrations: ['Salesforce', 'HubSpot', 'Property Management Systems'],
      backendServices: ['Telnyx Voice', 'SHANGO AI', 'RPA Engine', 'Unified Messaging']
    });

    // Wellness
    this.addIndustryMapping({
      industry: 'wellness',
      dashboard: '/dashboards/wellness',
      workflows: [
        'new_hire_onboarding',
        'expense_reimbursement',
        'document_approval',
        'lead_qualification_nurturing'
      ],
      crmIntegrations: ['Salesforce Health Cloud', 'HubSpot', 'Wellness Platforms'],
      backendServices: ['Telnyx Voice', 'SHANGO AI', 'RPA Engine', 'Unified Messaging']
    });

    // Beauty
    this.addIndustryMapping({
      industry: 'beauty',
      dashboard: '/dashboards/beauty',
      workflows: [
        'lead_qualification_nurturing',
        'sales_proposal_generation',
        'new_hire_onboarding',
        'expense_reimbursement'
      ],
      crmIntegrations: ['Salesforce', 'HubSpot', 'Beauty Management Systems'],
      backendServices: ['Telnyx Voice', 'SHANGO AI', 'RPA Engine', 'Marketing Campaigns']
    });
  }

  /**
   * Add industry mapping
   */
  private addIndustryMapping(mapping: IndustryWorkflowMapping): void {
    this.industryMappings.set(mapping.industry, mapping);
  }

  /**
   * Get workflow integration for specific industry
   */
  getIndustryWorkflowIntegration(industry: string): WorkflowDashboardIntegration | null {
    const mapping = this.industryMappings.get(industry);
    if (!mapping) {
      return null;
    }

    const workflowTemplates = mapping.workflows.map(workflowId => 
      this.workflowEngine.getWorkflowTemplate(workflowId)
    ).filter(template => template !== null) as WorkflowTemplate[];

    return {
      industry: mapping.industry,
      dashboard: mapping.dashboard,
      workflowTemplates,
      availableIntegrations: mapping.crmIntegrations,
      automationCapabilities: mapping.backendServices
    };
  }

  /**
   * Get all industry workflow integrations
   */
  getAllIndustryWorkflowIntegrations(): WorkflowDashboardIntegration[] {
    const integrations: WorkflowDashboardIntegration[] = [];
    
    for (const [industry, mapping] of this.industryMappings) {
      const integration = this.getIndustryWorkflowIntegration(industry);
      if (integration) {
        integrations.push(integration);
      }
    }
    
    return integrations;
  }

  /**
   * Start industry-specific workflow
   */
  async startIndustryWorkflow(
    industry: string, 
    workflowId: string, 
    data: Record<string, any>
  ): Promise<WorkflowExecution> {
    const mapping = this.industryMappings.get(industry);
    if (!mapping) {
      throw new Error(`Industry ${industry} not supported`);
    }

    if (!mapping.workflows.includes(workflowId)) {
      throw new Error(`Workflow ${workflowId} not available for industry ${industry}`);
    }

    // Add industry-specific context to workflow data
    const industryData = {
      ...data,
      industry,
      dashboard: mapping.dashboard,
      crmIntegrations: mapping.crmIntegrations,
      backendServices: mapping.backendServices
    };

    return await this.workflowEngine.startWorkflow(workflowId, industryData);
  }

  /**
   * Get available workflows for industry
   */
  getAvailableWorkflowsForIndustry(industry: string): WorkflowTemplate[] {
    const mapping = this.industryMappings.get(industry);
    if (!mapping) {
      return [];
    }

    return mapping.workflows.map(workflowId => 
      this.workflowEngine.getWorkflowTemplate(workflowId)
    ).filter(template => template !== null) as WorkflowTemplate[];
  }

  /**
   * Get CRM integrations for industry
   */
  getCRMIntegrationsForIndustry(industry: string): string[] {
    const mapping = this.industryMappings.get(industry);
    return mapping?.crmIntegrations || [];
  }

  /**
   * Get backend services for industry
   */
  getBackendServicesForIndustry(industry: string): string[] {
    const mapping = this.industryMappings.get(industry);
    return mapping?.backendServices || [];
  }

  /**
   * Execute industry-specific workflow with CRM integration
   */
  async executeIndustryWorkflowWithCRM(
    industry: string,
    workflowId: string,
    data: Record<string, any>,
    crmSystem: string
  ): Promise<WorkflowExecution> {
    // Start the workflow
    const execution = await this.startIndustryWorkflow(industry, workflowId, data);

    // Integrate with CRM system
    await this.integrateWithCRM(execution, crmSystem);

    return execution;
  }

  /**
   * Integrate workflow execution with CRM system
   */
  private async integrateWithCRM(execution: WorkflowExecution, crmSystem: string): Promise<void> {
    try {
      // Get CRM integration service
      const crmIntegration = this.crmService.getCRMIntegration(crmSystem);
      if (!crmIntegration) {
        console.warn(`CRM integration ${crmSystem} not found`);
        return;
      }

      // Execute CRM operations based on workflow
      switch (execution.templateId) {
        case 'lead_qualification_nurturing':
          await this.handleLeadQualificationCRM(execution, crmIntegration);
          break;
        case 'sales_proposal_generation':
          await this.handleSalesProposalCRM(execution, crmIntegration);
          break;
        case 'new_hire_onboarding':
          await this.handleNewHireOnboardingCRM(execution, crmIntegration);
          break;
        case 'expense_reimbursement':
          await this.handleExpenseReimbursementCRM(execution, crmIntegration);
          break;
        default:
          console.log(`No specific CRM integration for workflow: ${execution.templateId}`);
      }

      console.log(`✅ CRM integration completed for ${crmSystem}`);
    } catch (error) {
      console.error(`❌ CRM integration failed for ${crmSystem}:`, error);
    }
  }

  /**
   * Handle lead qualification CRM integration
   */
  private async handleLeadQualificationCRM(execution: WorkflowExecution, crmIntegration: any): Promise<void> {
    if (execution.data.leadData) {
      // Create lead in CRM
      await crmIntegration.createLead(execution.data.leadData);
      
      // Update lead score
      if (execution.data.leadData.score) {
        await crmIntegration.updateLeadScore(execution.data.leadData.id, execution.data.leadData.score);
      }
    }
  }

  /**
   * Handle sales proposal CRM integration
   */
  private async handleSalesProposalCRM(execution: WorkflowExecution, crmIntegration: any): Promise<void> {
    if (execution.data.proposalData) {
      // Create opportunity in CRM
      await crmIntegration.createOpportunity(execution.data.proposalData);
      
      // Generate proposal document
      if (execution.data.proposalData.document) {
        await crmIntegration.attachDocument(execution.data.proposalData.id, execution.data.proposalData.document);
      }
    }
  }

  /**
   * Handle new hire onboarding CRM integration
   */
  private async handleNewHireOnboardingCRM(execution: WorkflowExecution, crmIntegration: any): Promise<void> {
    if (execution.data.employeeData) {
      // Create employee record in CRM
      await crmIntegration.createEmployee(execution.data.employeeData);
      
      // Set up employee onboarding tasks
      await crmIntegration.createOnboardingTasks(execution.data.employeeData.id);
    }
  }

  /**
   * Handle expense reimbursement CRM integration
   */
  private async handleExpenseReimbursementCRM(execution: WorkflowExecution, crmIntegration: any): Promise<void> {
    if (execution.data.expenseData) {
      // Create expense record in CRM
      await crmIntegration.createExpense(execution.data.expenseData);
      
      // Process reimbursement
      if (execution.data.expenseData.approved) {
        await crmIntegration.processReimbursement(execution.data.expenseData.id);
      }
    }
  }

  /**
   * Get workflow execution status for industry dashboard
   */
  getWorkflowExecutionStatus(industry: string, executionId: string): {
    execution: WorkflowExecution | null;
    dashboard: string;
    availableActions: string[];
  } {
    const execution = this.workflowEngine.getWorkflowExecution(executionId);
    const mapping = this.industryMappings.get(industry);
    
    if (!execution || !mapping) {
      return {
        execution: null,
        dashboard: '',
        availableActions: []
      };
    }

    const availableActions = this.getAvailableActionsForExecution(execution);
    
    return {
      execution,
      dashboard: mapping.dashboard,
      availableActions
    };
  }

  /**
   * Get available actions for workflow execution
   */
  private getAvailableActionsForExecution(execution: WorkflowExecution): string[] {
    const actions: string[] = [];
    
    if (execution.status === 'paused') {
      actions.push('approve_checkpoint', 'reject_checkpoint', 'view_checkpoints');
    }
    
    if (execution.status === 'running') {
      actions.push('view_progress', 'pause_execution');
    }
    
    if (execution.status === 'completed') {
      actions.push('view_results', 'download_report', 'start_similar_workflow');
    }
    
    if (execution.status === 'failed') {
      actions.push('retry_execution', 'view_error_log', 'contact_support');
    }
    
    return actions;
  }

  /**
   * Get workflow analytics for industry
   */
  getWorkflowAnalytics(industry: string): {
    totalWorkflows: number;
    completedWorkflows: number;
    failedWorkflows: number;
    averageCompletionTime: number;
    mostUsedWorkflows: Array<{ workflow: string; count: number }>;
  } {
    const allExecutions = this.workflowEngine.getAllWorkflowExecutions();
    const industryExecutions = allExecutions.filter(execution => 
      execution.data.industry === industry
    );

    const totalWorkflows = industryExecutions.length;
    const completedWorkflows = industryExecutions.filter(e => e.status === 'completed').length;
    const failedWorkflows = industryExecutions.filter(e => e.status === 'failed').length;
    
    const completedExecutions = industryExecutions.filter(e => e.status === 'completed' && e.completedAt);
    const averageCompletionTime = completedExecutions.length > 0 
      ? completedExecutions.reduce((sum, e) => {
          const duration = e.completedAt!.getTime() - e.startedAt.getTime();
          return sum + duration;
        }, 0) / completedExecutions.length
      : 0;

    // Count workflow usage
    const workflowCounts = new Map<string, number>();
    industryExecutions.forEach(execution => {
      const count = workflowCounts.get(execution.templateId) || 0;
      workflowCounts.set(execution.templateId, count + 1);
    });

    const mostUsedWorkflows = Array.from(workflowCounts.entries())
      .map(([workflow, count]) => ({ workflow, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalWorkflows,
      completedWorkflows,
      failedWorkflows,
      averageCompletionTime,
      mostUsedWorkflows
    };
  }
}
