// TETRIX RPA Zoho RPA Integration Service
// Handles Zoho RPA agent integration, bot management, and workflow automation

export interface ZohoRPABot {
  id: string;
  name: string;
  description: string;
  type: 'desktop_automation' | 'web_automation' | 'api_integration' | 'data_processing';
  status: 'active' | 'inactive' | 'error' | 'running' | 'maintenance';
  configuration: ZohoRPABotConfiguration;
  runtime: number; // hours used
  executions: number;
  successRate: number;
  lastExecution: Date;
  industry: string;
  compliance: ZohoRPAComplianceSettings;
  zohoBotId?: string; // Zoho RPA platform bot ID
}

export interface ZohoRPABotConfiguration {
  workspaceId: string;
  botName: string;
  automationType: 'desktop' | 'web' | 'hybrid';
  targetApplication?: string;
  targetUrl?: string;
  credentials?: ZohoCredentials;
  workflowSteps: ZohoWorkflowStep[];
  scheduling?: ZohoSchedulingConfig;
  errorHandling: ZohoErrorHandlingConfig;
  monitoring: ZohoMonitoringConfig;
  variables: ZohoVariable[];
}

export interface ZohoWorkflowStep {
  id: string;
  name: string;
  type: 'click' | 'type' | 'extract' | 'navigate' | 'wait' | 'condition' | 'loop' | 'api_call' | 'database_query';
  target: string;
  value?: string;
  selector?: string;
  delay?: number;
  retryAttempts?: number;
  validation?: ZohoValidationRule[];
  nextStep?: string;
  errorStep?: string;
}

export interface ZohoCredentials {
  username?: string;
  password?: string;
  apiKey?: string;
  oauthToken?: string;
  refreshToken?: string;
  encrypted: boolean;
}

export interface ZohoSchedulingConfig {
  enabled: boolean;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'custom';
  schedule: string; // Cron expression or specific time
  timezone: string;
  endDate?: Date;
}

export interface ZohoErrorHandlingConfig {
  retryAttempts: number;
  retryDelay: number;
  fallbackAction: string;
  notificationEnabled: boolean;
  escalation: ZohoEscalationConfig;
  errorLogging: boolean;
}

export interface ZohoMonitoringConfig {
  enabled: boolean;
  metrics: string[];
  alerts: ZohoAlertConfig[];
  reporting: ZohoReportingConfig;
  realTimeMonitoring: boolean;
}

export interface ZohoVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  value: any;
  scope: 'global' | 'workflow' | 'step';
  encrypted: boolean;
}

export interface ZohoRPAComplianceSettings {
  dataPrivacy: boolean;
  encryption: boolean;
  auditLogging: boolean;
  accessControl: boolean;
  dataRetention: number; // days
  gdprCompliance: boolean;
  hipaaCompliance: boolean;
  soxCompliance: boolean;
  iso27001Compliance: boolean;
}

export interface ZohoWorkflowExecution {
  id: string;
  botId: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  executionTime?: number;
  results: ZohoExecutionResult[];
  errors: ZohoExecutionError[];
  variables: Record<string, any>;
}

export interface ZohoExecutionResult {
  stepId: string;
  stepName: string;
  success: boolean;
  output: any;
  timestamp: Date;
  executionTime: number;
}

export interface ZohoExecutionError {
  stepId: string;
  stepName: string;
  error: string;
  errorCode: string;
  timestamp: Date;
  retryAttempt: number;
}

export interface ZohoValidationRule {
  type: 'required' | 'format' | 'length' | 'range' | 'pattern' | 'custom';
  value: any;
  message: string;
  customValidation?: string;
}

export interface ZohoEscalationConfig {
  enabled: boolean;
  threshold: number;
  notificationChannels: string[];
  escalationLevels: ZohoEscalationLevel[];
}

export interface ZohoEscalationLevel {
  level: number;
  condition: string;
  action: string;
  notification: string;
}

export interface ZohoAlertConfig {
  id: string;
  name: string;
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  notification: string;
  enabled: boolean;
}

export interface ZohoReportingConfig {
  enabled: boolean;
  frequency: 'real-time' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  format: 'json' | 'csv' | 'pdf' | 'excel';
  recipients: string[];
  metrics: string[];
}

export interface ZohoRPAMetrics {
  botId: string;
  runtime: number;
  executions: number;
  successRate: number;
  lastExecution: Date;
  averageExecutionTime: number;
  errorRate: number;
  complianceScore: number;
  uptime: number;
}

export class TETRIXZohoRPAIntegrationService {
  private clientId?: string;
  private clientSecret?: string;
  private apiKey?: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private baseUrl: string = 'https://rpaapi.zoho.com';
  private apiVersion: string = 'v1';
  private bots: Map<string, ZohoRPABot> = new Map();
  private executions: Map<string, ZohoWorkflowExecution> = new Map();
  private complianceFramework: ZohoRPAComplianceFramework;
  private tokenExpiry: Date | null = null;

  constructor(
    clientIdOrApiKey: string, 
    clientSecret?: string, 
    accessToken?: string, 
    refreshToken?: string
  ) {
    // Support both API key and OAuth authentication
    if (clientSecret) {
      // OAuth mode: clientId and clientSecret provided
      this.clientId = clientIdOrApiKey;
      this.clientSecret = clientSecret;
    } else {
      // API Key mode: single API key provided
      this.apiKey = clientIdOrApiKey;
    }
    this.accessToken = accessToken || null;
    this.refreshToken = refreshToken || null;
    this.complianceFramework = new ZohoRPAComplianceFramework();
    this.initializeService();
  }

  /**
   * Get authorization headers for API requests
   */
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    // Use API key or Bearer token
    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    } else if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    } else {
      throw new Error('No authentication credentials available');
    }

    return headers;
  }

  /**
   * Initialize the Zoho RPA integration service
   */
  private async initializeService(): Promise<void> {
    try {
      console.log('🔗 Initializing TETRIX Zoho RPA Integration Service...');
      
      // Authenticate with Zoho RPA
      await this.authenticate();
      
      // Test API connection
      await this.testApiConnection();
      
      // Load existing bots
      await this.loadExistingBots();
      
      console.log('✅ Zoho RPA Integration Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Zoho RPA service:', error);
      throw error;
    }
  }

  /**
   * Authenticate with Zoho RPA API using OAuth 2.0 or API Key
   */
  private async authenticate(): Promise<void> {
    try {
      // If using API key, set it as access token
      if (this.apiKey) {
        this.accessToken = this.apiKey;
        console.log('✅ Using Zoho RPA API key for authentication');
        return;
      }

      // OAuth authentication flow
      if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
        console.log('✅ Using existing Zoho RPA access token');
        return;
      }

      if (!this.clientId || !this.clientSecret) {
        throw new Error('Either API key or OAuth credentials (clientId and clientSecret) must be provided');
      }

      if (this.refreshToken) {
        // Try to refresh the token
        try {
          await this.refreshAccessToken();
          return;
        } catch (error) {
          console.log('⚠️ Token refresh failed, requesting new token');
        }
      }

      // Request new access token
      const response = await fetch(`${this.baseUrl}/oauth/v2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          scope: 'ZohoRPA.bot.ALL,ZohoRPA.workflow.ALL'
        })
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token || null;
      this.tokenExpiry = new Date(Date.now() + (data.expires_in * 1000));

      console.log('✅ Zoho RPA authentication successful');
    } catch (error) {
      console.error('❌ Zoho RPA authentication failed:', error);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${this.baseUrl}/oauth/v2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret
      })
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = new Date(Date.now() + (data.expires_in * 1000));

    console.log('✅ Zoho RPA access token refreshed');
  }

  /**
   * Test API connection to Zoho RPA
   */
  private async testApiConnection(): Promise<void> {
    try {
      if (!this.accessToken) {
        throw new Error('No access token or API key available');
      }

      const headers = this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/${this.apiVersion}/health`, {
        headers
      });

      // If health endpoint doesn't exist, try a simple API call
      if (!response.ok && response.status === 404) {
        console.log('⚠️ Health endpoint not available, skipping connection test');
        return;
      }

      if (!response.ok) {
        throw new Error(`API connection failed: ${response.statusText}`);
      }

      console.log('✅ Zoho RPA API connection successful');
    } catch (error) {
      console.error('❌ Zoho RPA API connection failed:', error);
      // Don't throw - allow service to continue even if health check fails
      console.log('⚠️ Continuing without health check verification');
    }
  }

  /**
   * Create a new Zoho RPA bot
   */
  async createBot(config: ZohoRPABotConfiguration, industry: string): Promise<ZohoRPABot> {
    try {
      if (!this.accessToken) {
        await this.authenticate();
      }

      // Validate compliance requirements
      await this.complianceFramework.validateBotConfiguration(config, industry);

      const botId = this.generateBotId(industry);
      
      const bot: ZohoRPABot = {
        id: botId,
        name: `${industry}_zoho_rpa_bot_${Date.now()}`,
        description: `Zoho RPA bot for ${industry} automation`,
        type: this.determineBotType(config),
        status: 'inactive',
        configuration: config,
        runtime: 0,
        executions: 0,
        successRate: 0,
        lastExecution: new Date(),
        industry,
        compliance: this.complianceFramework.getComplianceSettings(industry)
      };

      // Create bot in Zoho RPA platform
      await this.createZohoBot(bot);
      
      this.bots.set(botId, bot);
      
      console.log(`✅ Created Zoho RPA bot for ${industry}: ${botId}`);
      return bot;
    } catch (error) {
      console.error(`❌ Failed to create Zoho RPA bot:`, error);
      throw error;
    }
  }

  /**
   * Execute a workflow on a Zoho RPA bot
   */
  async executeWorkflow(botId: string, workflowId: string, variables?: Record<string, any>): Promise<ZohoWorkflowExecution> {
    try {
      if (!this.accessToken) {
        await this.authenticate();
      }

      const bot = this.bots.get(botId);
      if (!bot) {
        throw new Error(`Bot ${botId} not found`);
      }

      const executionId = this.generateExecutionId();
      const execution: ZohoWorkflowExecution = {
        id: executionId,
        botId,
        workflowId,
        status: 'pending',
        startTime: new Date(),
        results: [],
        errors: [],
        variables: variables || {}
      };

      this.executions.set(executionId, execution);
      
      // Execute workflow in Zoho RPA
      await this.executeZohoWorkflow(execution, bot);
      
      console.log(`✅ Started Zoho RPA workflow execution: ${executionId}`);
      return execution;
    } catch (error) {
      console.error(`❌ Failed to execute Zoho RPA workflow:`, error);
      throw error;
    }
  }

  /**
   * Get workflow execution status
   */
  async getExecutionStatus(executionId: string): Promise<ZohoWorkflowExecution | undefined> {
    try {
      if (!this.accessToken) {
        await this.authenticate();
      }

      const execution = this.executions.get(executionId);
      if (!execution) {
        throw new Error(`Execution ${executionId} not found`);
      }

      // Fetch latest status from Zoho RPA
      await this.updateExecutionStatus(execution);
      
      return execution;
    } catch (error) {
      console.error(`❌ Failed to get execution status:`, error);
      throw error;
    }
  }

  /**
   * Get bot performance metrics
   */
  async getBotMetrics(botId: string): Promise<ZohoRPAMetrics> {
    const bot = this.bots.get(botId);
    if (!bot) {
      throw new Error(`Bot ${botId} not found`);
    }

    return {
      botId,
      runtime: bot.runtime,
      executions: bot.executions,
      successRate: bot.successRate,
      lastExecution: bot.lastExecution,
      averageExecutionTime: this.calculateAverageExecutionTime(bot),
      errorRate: this.calculateErrorRate(bot),
      complianceScore: this.calculateComplianceScore(bot),
      uptime: this.calculateUptime(bot)
    };
  }

  /**
   * Get all bots for industry
   */
  async getIndustryBots(industry: string): Promise<ZohoRPABot[]> {
    return Array.from(this.bots.values()).filter(bot => bot.industry === industry);
  }

  /**
   * Update bot configuration
   */
  async updateBotConfiguration(botId: string, configuration: Partial<ZohoRPABotConfiguration>): Promise<ZohoRPABot> {
    try {
      if (!this.accessToken) {
        await this.authenticate();
      }

      const bot = this.bots.get(botId);
      if (!bot) {
        throw new Error(`Bot ${botId} not found`);
      }

      // Update configuration
      bot.configuration = { ...bot.configuration, ...configuration };

      // Update bot in Zoho RPA platform
      await this.updateZohoBot(bot);
      
      console.log(`✅ Updated Zoho RPA bot configuration: ${botId}`);
      return bot;
    } catch (error) {
      console.error(`❌ Failed to update bot configuration:`, error);
      throw error;
    }
  }

  /**
   * Delete a Zoho RPA bot
   */
  async deleteBot(botId: string): Promise<void> {
    try {
      if (!this.accessToken) {
        await this.authenticate();
      }

      const bot = this.bots.get(botId);
      if (!bot) {
        throw new Error(`Bot ${botId} not found`);
      }

      // Delete bot from Zoho RPA platform
      await this.deleteZohoBot(bot);
      
      this.bots.delete(botId);
      
      console.log(`✅ Deleted Zoho RPA bot: ${botId}`);
    } catch (error) {
      console.error(`❌ Failed to delete bot:`, error);
      throw error;
    }
  }

  /**
   * Create bot in Zoho RPA platform
   */
  private async createZohoBot(bot: ZohoRPABot): Promise<void> {
    try {
      const headers = this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/${this.apiVersion}/bots`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: bot.name,
          description: bot.description,
          workspaceId: bot.configuration.workspaceId,
          automationType: bot.configuration.automationType,
          configuration: bot.configuration
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create Zoho RPA bot: ${response.statusText}`);
      }

      const result = await response.json();
      bot.zohoBotId = result.id;
      console.log(`✅ Created Zoho RPA bot in platform: ${result.id}`);
    } catch (error) {
      console.error(`❌ Failed to create Zoho RPA bot in platform:`, error);
      throw error;
    }
  }

  /**
   * Execute workflow in Zoho RPA platform
   */
  private async executeZohoWorkflow(execution: ZohoWorkflowExecution, bot: ZohoRPABot): Promise<void> {
    try {
      execution.status = 'running';
      
      const headers = this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/${this.apiVersion}/bots/${bot.zohoBotId}/workflows/${execution.workflowId}/execute`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          variables: execution.variables
        })
      });

      if (!response.ok) {
        throw new Error(`Workflow execution failed: ${response.statusText}`);
      }

      const result = await response.json();
      execution.id = result.executionId;
      
      // Poll for execution status
      await this.pollExecutionStatus(execution, bot);
      
      console.log(`✅ Zoho RPA workflow execution completed: ${execution.id}`);
    } catch (error) {
      console.error(`❌ Zoho RPA workflow execution failed:`, error);
      execution.status = 'failed';
      execution.endTime = new Date();
      execution.errors.push({
        stepId: 'general',
        stepName: 'Workflow Execution',
        error: error instanceof Error ? error.message : 'Unknown error',
        errorCode: 'EXECUTION_ERROR',
        timestamp: new Date(),
        retryAttempt: 0
      });
    }
  }

  /**
   * Poll for execution status
   */
  private async pollExecutionStatus(execution: ZohoWorkflowExecution, bot: ZohoRPABot): Promise<void> {
    const maxAttempts = 60; // 5 minutes max
    let attempts = 0;

    while (attempts < maxAttempts && execution.status === 'running') {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

      try {
        const headers = this.getAuthHeaders();
        const response = await fetch(`${this.baseUrl}/${this.apiVersion}/executions/${execution.id}`, {
          headers
        });

        if (response.ok) {
          const status = await response.json();
          execution.status = status.status;
          execution.results = status.results || [];
          execution.errors = status.errors || [];

          if (status.status === 'completed' || status.status === 'failed') {
            execution.endTime = new Date();
            execution.executionTime = status.executionTime;
            break;
          }
        }
      } catch (error) {
        console.error(`Error polling execution status:`, error);
      }

      attempts++;
    }

    if (execution.status === 'running') {
      execution.status = 'failed';
      execution.endTime = new Date();
      execution.errors.push({
        stepId: 'general',
        stepName: 'Status Polling',
        error: 'Execution timeout',
        errorCode: 'TIMEOUT',
        timestamp: new Date(),
        retryAttempt: 0
      });
    }
  }

  /**
   * Update execution status from Zoho RPA
   */
  private async updateExecutionStatus(execution: ZohoWorkflowExecution): Promise<void> {
    try {
      const headers = this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/${this.apiVersion}/executions/${execution.id}`, {
        headers
      });

      if (response.ok) {
        const status = await response.json();
        execution.status = status.status;
        execution.results = status.results || [];
        execution.errors = status.errors || [];
        execution.executionTime = status.executionTime;

        if (status.status === 'completed' || status.status === 'failed') {
          execution.endTime = new Date();
        }
      }
    } catch (error) {
      console.error(`Error updating execution status:`, error);
    }
  }

  /**
   * Update bot in Zoho RPA platform
   */
  private async updateZohoBot(bot: ZohoRPABot): Promise<void> {
    try {
      if (!bot.zohoBotId) {
        throw new Error('Bot not yet created in Zoho RPA platform');
      }

      const headers = this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/${this.apiVersion}/bots/${bot.zohoBotId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          name: bot.name,
          description: bot.description,
          configuration: bot.configuration
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to update Zoho RPA bot: ${response.statusText}`);
      }

      console.log(`✅ Updated Zoho RPA bot in platform: ${bot.zohoBotId}`);
    } catch (error) {
      console.error(`❌ Failed to update Zoho RPA bot in platform:`, error);
      throw error;
    }
  }

  /**
   * Delete bot from Zoho RPA platform
   */
  private async deleteZohoBot(bot: ZohoRPABot): Promise<void> {
    try {
      if (!bot.zohoBotId) {
        return; // Bot not created in platform yet
      }

      const headers = this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/${this.apiVersion}/bots/${bot.zohoBotId}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        throw new Error(`Failed to delete Zoho RPA bot: ${response.statusText}`);
      }

      console.log(`✅ Deleted Zoho RPA bot from platform: ${bot.zohoBotId}`);
    } catch (error) {
      console.error(`❌ Failed to delete Zoho RPA bot from platform:`, error);
      throw error;
    }
  }

  /**
   * Load existing bots from Zoho RPA
   */
  private async loadExistingBots(): Promise<void> {
    try {
      const headers = this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/${this.apiVersion}/bots`, {
        headers
      });

      if (!response.ok) {
        throw new Error(`Failed to load bots: ${response.statusText}`);
      }

      const bots = await response.json();
      console.log(`📋 Loaded ${bots.length} existing Zoho RPA bots`);
    } catch (error) {
      console.error(`❌ Failed to load existing bots:`, error);
    }
  }

  /**
   * Determine bot type from configuration
   */
  private determineBotType(config: ZohoRPABotConfiguration): ZohoRPABot['type'] {
    if (config.automationType === 'desktop') return 'desktop_automation';
    if (config.automationType === 'web') return 'web_automation';
    if (config.automationType === 'hybrid') return 'api_integration';
    return 'data_processing';
  }

  /**
   * Calculate average execution time
   */
  private calculateAverageExecutionTime(bot: ZohoRPABot): number {
    // Simplified calculation - would need actual execution data
    return 45; // seconds
  }

  /**
   * Calculate error rate
   */
  private calculateErrorRate(bot: ZohoRPABot): number {
    return 100 - bot.successRate;
  }

  /**
   * Calculate compliance score
   */
  private calculateComplianceScore(bot: ZohoRPABot): number {
    let score = 100;
    
    if (!bot.compliance.dataPrivacy) score -= 20;
    if (!bot.compliance.encryption) score -= 15;
    if (!bot.compliance.auditLogging) score -= 15;
    if (!bot.compliance.accessControl) score -= 10;
    
    return Math.max(0, score);
  }

  /**
   * Calculate uptime
   */
  private calculateUptime(bot: ZohoRPABot): number {
    // Simplified calculation - would need actual uptime data
    return bot.status === 'active' ? 99.5 : 0;
  }

  /**
   * Generate unique bot ID
   */
  private generateBotId(industry: string): string {
    return `zoho_rpa_bot_${industry}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique execution ID
   */
  private generateExecutionId(): string {
    return `zoho_exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Compliance framework for Zoho RPA integration
class ZohoRPAComplianceFramework {
  async validateBotConfiguration(config: ZohoRPABotConfiguration, industry: string): Promise<void> {
    // Validate compliance requirements
    console.log(`🔐 Validating Zoho RPA bot configuration for ${industry}`);
    
    // Industry-specific validations
    if (industry === 'healthcare' && !config.credentials?.encrypted) {
      throw new Error('Healthcare bots require encrypted credentials');
    }
    
    if (industry === 'financial' && !config.monitoring.realTimeMonitoring) {
      throw new Error('Financial bots require real-time monitoring');
    }
  }

  getComplianceSettings(industry: string): ZohoRPAComplianceSettings {
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
}

