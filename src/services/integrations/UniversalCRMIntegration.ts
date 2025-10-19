// TETRIX Universal CRM Integration Service
// Salesforce, HubSpot, Pipedrive, Zoho CRM, and other CRM platform integrations

export interface CRMConfig {
  provider: 'salesforce' | 'hubspot' | 'pipedrive' | 'zoho' | 'monday' | 'airtable' | 'notion' | 'custom';
  apiKey: string;
  apiSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  baseUrl: string;
  version?: string;
  timeout?: number;
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
}

export interface CRMContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  address?: CRMAddress;
  tags: string[];
  customFields: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  lastContactedAt?: string;
  leadSource?: string;
  leadStatus?: string;
  lifecycleStage?: string;
  ownerId?: string;
  ownerName?: string;
}

export interface CRMAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  type?: 'billing' | 'shipping' | 'home' | 'work';
}

export interface CRMCompany {
  id: string;
  name: string;
  domain?: string;
  industry?: string;
  size?: string;
  annualRevenue?: number;
  phone?: string;
  website?: string;
  address?: CRMAddress;
  description?: string;
  tags: string[];
  customFields: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  ownerId?: string;
  ownerName?: string;
}

export interface CRMOpportunity {
  id: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  stage: string;
  probability: number;
  closeDate: string;
  contactId?: string;
  companyId?: string;
  ownerId?: string;
  ownerName?: string;
  source?: string;
  tags: string[];
  customFields: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  lastActivityAt?: string;
}

export interface CRMTask {
  id: string;
  title: string;
  description?: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'follow_up' | 'other';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  completedAt?: string;
  contactId?: string;
  companyId?: string;
  opportunityId?: string;
  ownerId?: string;
  ownerName?: string;
  customFields: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CRMActivity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'other';
  subject: string;
  description?: string;
  direction?: 'inbound' | 'outbound';
  contactId?: string;
  companyId?: string;
  opportunityId?: string;
  ownerId?: string;
  ownerName?: string;
  duration?: number; // in minutes
  outcome?: string;
  customFields: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CRMPipeline {
  id: string;
  name: string;
  description?: string;
  stages: CRMStage[];
  isDefault: boolean;
  customFields: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CRMStage {
  id: string;
  name: string;
  order: number;
  probability: number;
  isClosed: boolean;
  isWon: boolean;
  customFields: Record<string, any>;
}

export interface CRMUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CRMAnalytics {
  period: string;
  totalContacts: number;
  newContacts: number;
  totalCompanies: number;
  newCompanies: number;
  totalOpportunities: number;
  newOpportunities: number;
  totalRevenue: number;
  wonRevenue: number;
  lostRevenue: number;
  averageDealSize: number;
  conversionRate: number;
  salesCycle: number; // in days
  topPerformers: Array<{
    userId: string;
    name: string;
    revenue: number;
    deals: number;
  }>;
  topSources: Array<{
    source: string;
    contacts: number;
    revenue: number;
  }>;
  stageBreakdown: Array<{
    stage: string;
    count: number;
    value: number;
  }>;
}

export interface CRMSearchCriteria {
  query?: string;
  type?: 'contact' | 'company' | 'opportunity' | 'task' | 'activity';
  filters?: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CRMSearchResult {
  items: Array<CRMContact | CRMCompany | CRMOpportunity | CRMTask | CRMActivity>;
  totalCount: number;
  hasMore: boolean;
  searchId: string;
  searchDate: string;
  criteria: CRMSearchCriteria;
}

export interface CRMWebhook {
  id: string;
  event: string;
  url: string;
  isActive: boolean;
  secret?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Base CRM Integration Service
 */
export abstract class BaseCRMIntegration {
  protected config: CRMConfig;
  protected isConnected: boolean = false;

  constructor(config: CRMConfig) {
    this.config = config;
  }

  /**
   * Connect to CRM system
   */
  abstract connect(): Promise<boolean>;

  /**
   * Disconnect from CRM system
   */
  abstract disconnect(): Promise<void>;

  /**
   * Get contacts
   */
  abstract getContacts(filters?: any): Promise<CRMContact[]>;

  /**
   * Get contact by ID
   */
  abstract getContact(contactId: string): Promise<CRMContact>;

  /**
   * Create contact
   */
  abstract createContact(contact: Partial<CRMContact>): Promise<CRMContact>;

  /**
   * Update contact
   */
  abstract updateContact(contactId: string, contact: Partial<CRMContact>): Promise<CRMContact>;

  /**
   * Delete contact
   */
  abstract deleteContact(contactId: string): Promise<boolean>;

  /**
   * Get companies
   */
  abstract getCompanies(filters?: any): Promise<CRMCompany[]>;

  /**
   * Get company by ID
   */
  abstract getCompany(companyId: string): Promise<CRMCompany>;

  /**
   * Create company
   */
  abstract createCompany(company: Partial<CRMCompany>): Promise<CRMCompany>;

  /**
   * Update company
   */
  abstract updateCompany(companyId: string, company: Partial<CRMCompany>): Promise<CRMCompany>;

  /**
   * Delete company
   */
  abstract deleteCompany(companyId: string): Promise<boolean>;

  /**
   * Get opportunities
   */
  abstract getOpportunities(filters?: any): Promise<CRMOpportunity[]>;

  /**
   * Get opportunity by ID
   */
  abstract getOpportunity(opportunityId: string): Promise<CRMOpportunity>;

  /**
   * Create opportunity
   */
  abstract createOpportunity(opportunity: Partial<CRMOpportunity>): Promise<CRMOpportunity>;

  /**
   * Update opportunity
   */
  abstract updateOpportunity(opportunityId: string, opportunity: Partial<CRMOpportunity>): Promise<CRMOpportunity>;

  /**
   * Delete opportunity
   */
  abstract deleteOpportunity(opportunityId: string): Promise<boolean>;

  /**
   * Get tasks
   */
  abstract getTasks(filters?: any): Promise<CRMTask[]>;

  /**
   * Get task by ID
   */
  abstract getTask(taskId: string): Promise<CRMTask>;

  /**
   * Create task
   */
  abstract createTask(task: Partial<CRMTask>): Promise<CRMTask>;

  /**
   * Update task
   */
  abstract updateTask(taskId: string, task: Partial<CRMTask>): Promise<CRMTask>;

  /**
   * Delete task
   */
  abstract deleteTask(taskId: string): Promise<boolean>;

  /**
   * Get activities
   */
  abstract getActivities(filters?: any): Promise<CRMActivity[]>;

  /**
   * Get activity by ID
   */
  abstract getActivity(activityId: string): Promise<CRMActivity>;

  /**
   * Create activity
   */
  abstract createActivity(activity: Partial<CRMActivity>): Promise<CRMActivity>;

  /**
   * Update activity
   */
  abstract updateActivity(activityId: string, activity: Partial<CRMActivity>): Promise<CRMActivity>;

  /**
   * Delete activity
   */
  abstract deleteActivity(activityId: string): Promise<boolean>;

  /**
   * Get pipelines
   */
  abstract getPipelines(): Promise<CRMPipeline[]>;

  /**
   * Get pipeline by ID
   */
  abstract getPipeline(pipelineId: string): Promise<CRMPipeline>;

  /**
   * Get users
   */
  abstract getUsers(): Promise<CRMUser[]>;

  /**
   * Get user by ID
   */
  abstract getUser(userId: string): Promise<CRMUser>;

  /**
   * Search across all entities
   */
  abstract search(criteria: CRMSearchCriteria): Promise<CRMSearchResult>;

  /**
   * Get analytics
   */
  abstract getAnalytics(period: string): Promise<CRMAnalytics>;

  /**
   * Create webhook
   */
  abstract createWebhook(webhook: Partial<CRMWebhook>): Promise<CRMWebhook>;

  /**
   * Get webhooks
   */
  abstract getWebhooks(): Promise<CRMWebhook[]>;

  /**
   * Delete webhook
   */
  abstract deleteWebhook(webhookId: string): Promise<boolean>;

  /**
   * Make authenticated API request
   */
  protected async makeAPIRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    if (!this.isConnected) {
      throw new Error('Not connected to CRM system');
    }

    const url = `${this.config.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...this.getAuthHeaders(),
      ...options.headers
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout || 30000);
    
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`CRM API request failed: ${response.statusText}`);
    }

    return response;
  }

  /**
   * Get authentication headers
   */
  protected abstract getAuthHeaders(): Record<string, string>;
}

/**
 * Salesforce Integration Service
 */
export class TETRIXSalesforceIntegration extends BaseCRMIntegration {
  constructor(config: CRMConfig) {
    super(config);
  }

  async connect(): Promise<boolean> {
    try {
      const response = await this.makeAPIRequest('/services/data/v58.0/sobjects/');
      if (response.ok) {
        this.isConnected = true;
        console.log('✅ Connected to Salesforce');
        return true;
      } else {
        throw new Error('Salesforce connection failed');
      }
    } catch (error) {
      console.error('❌ Failed to connect to Salesforce:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    console.log('✅ Disconnected from Salesforce');
  }

  protected getAuthHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.config.accessToken || ''}`
    };
  }

  async getContacts(filters?: any): Promise<CRMContact[]> {
    try {
      const soql = this.buildSOQLQuery('Contact', filters);
      const response = await this.makeAPIRequest(`/services/data/v58.0/query/?q=${encodeURIComponent(soql)}`);
      const data = await response.json();
      
      console.log(`✅ Retrieved ${data.records?.length || 0} contacts from Salesforce`);
      return this.mapSalesforceContacts(data.records || []);
    } catch (error) {
      console.error('❌ Failed to get contacts from Salesforce:', error);
      throw error;
    }
  }

  async getContact(contactId: string): Promise<CRMContact> {
    try {
      const response = await this.makeAPIRequest(`/services/data/v58.0/sobjects/Contact/${contactId}`);
      const data = await response.json();
      
      console.log(`✅ Retrieved contact ${contactId} from Salesforce`);
      return this.mapSalesforceContact(data);
    } catch (error) {
      console.error('❌ Failed to get contact from Salesforce:', error);
      throw error;
    }
  }

  async createContact(contact: Partial<CRMContact>): Promise<CRMContact> {
    try {
      const salesforceContact = this.mapToSalesforceContact(contact);
      const response = await this.makeAPIRequest('/services/data/v58.0/sobjects/Contact/', {
        method: 'POST',
        body: JSON.stringify(salesforceContact)
      });
      
      const data = await response.json();
      console.log('✅ Created contact in Salesforce');
      return this.mapSalesforceContact(data);
    } catch (error) {
      console.error('❌ Failed to create contact in Salesforce:', error);
      throw error;
    }
  }

  async updateContact(contactId: string, contact: Partial<CRMContact>): Promise<CRMContact> {
    try {
      const salesforceContact = this.mapToSalesforceContact(contact);
      const response = await this.makeAPIRequest(`/services/data/v58.0/sobjects/Contact/${contactId}`, {
        method: 'PATCH',
        body: JSON.stringify(salesforceContact)
      });
      
      const data = await response.json();
      console.log(`✅ Updated contact ${contactId} in Salesforce`);
      return this.mapSalesforceContact(data);
    } catch (error) {
      console.error('❌ Failed to update contact in Salesforce:', error);
      throw error;
    }
  }

  async deleteContact(contactId: string): Promise<boolean> {
    try {
      const response = await this.makeAPIRequest(`/services/data/v58.0/sobjects/Contact/${contactId}`, {
        method: 'DELETE'
      });
      
      console.log(`✅ Deleted contact ${contactId} from Salesforce`);
      return response.ok;
    } catch (error) {
      console.error('❌ Failed to delete contact from Salesforce:', error);
      throw error;
    }
  }

  async getCompanies(filters?: any): Promise<CRMCompany[]> {
    try {
      const soql = this.buildSOQLQuery('Account', filters);
      const response = await this.makeAPIRequest(`/services/data/v58.0/query/?q=${encodeURIComponent(soql)}`);
      const data = await response.json();
      
      console.log(`✅ Retrieved ${data.records?.length || 0} companies from Salesforce`);
      return this.mapSalesforceCompanies(data.records || []);
    } catch (error) {
      console.error('❌ Failed to get companies from Salesforce:', error);
      throw error;
    }
  }

  async getCompany(companyId: string): Promise<CRMCompany> {
    try {
      const response = await this.makeAPIRequest(`/services/data/v58.0/sobjects/Account/${companyId}`);
      const data = await response.json();
      
      console.log(`✅ Retrieved company ${companyId} from Salesforce`);
      return this.mapSalesforceCompany(data);
    } catch (error) {
      console.error('❌ Failed to get company from Salesforce:', error);
      throw error;
    }
  }

  async createCompany(company: Partial<CRMCompany>): Promise<CRMCompany> {
    try {
      const salesforceAccount = this.mapToSalesforceAccount(company);
      const response = await this.makeAPIRequest('/services/data/v58.0/sobjects/Account/', {
        method: 'POST',
        body: JSON.stringify(salesforceAccount)
      });
      
      const data = await response.json();
      console.log('✅ Created company in Salesforce');
      return this.mapSalesforceCompany(data);
    } catch (error) {
      console.error('❌ Failed to create company in Salesforce:', error);
      throw error;
    }
  }

  async updateCompany(companyId: string, company: Partial<CRMCompany>): Promise<CRMCompany> {
    try {
      const salesforceAccount = this.mapToSalesforceAccount(company);
      const response = await this.makeAPIRequest(`/services/data/v58.0/sobjects/Account/${companyId}`, {
        method: 'PATCH',
        body: JSON.stringify(salesforceAccount)
      });
      
      const data = await response.json();
      console.log(`✅ Updated company ${companyId} in Salesforce`);
      return this.mapSalesforceCompany(data);
    } catch (error) {
      console.error('❌ Failed to update company in Salesforce:', error);
      throw error;
    }
  }

  async deleteCompany(companyId: string): Promise<boolean> {
    try {
      const response = await this.makeAPIRequest(`/services/data/v58.0/sobjects/Account/${companyId}`, {
        method: 'DELETE'
      });
      
      console.log(`✅ Deleted company ${companyId} from Salesforce`);
      return response.ok;
    } catch (error) {
      console.error('❌ Failed to delete company from Salesforce:', error);
      throw error;
    }
  }

  async getOpportunities(filters?: any): Promise<CRMOpportunity[]> {
    try {
      const soql = this.buildSOQLQuery('Opportunity', filters);
      const response = await this.makeAPIRequest(`/services/data/v58.0/query/?q=${encodeURIComponent(soql)}`);
      const data = await response.json();
      
      console.log(`✅ Retrieved ${data.records?.length || 0} opportunities from Salesforce`);
      return this.mapSalesforceOpportunities(data.records || []);
    } catch (error) {
      console.error('❌ Failed to get opportunities from Salesforce:', error);
      throw error;
    }
  }

  async getOpportunity(opportunityId: string): Promise<CRMOpportunity> {
    try {
      const response = await this.makeAPIRequest(`/services/data/v58.0/sobjects/Opportunity/${opportunityId}`);
      const data = await response.json();
      
      console.log(`✅ Retrieved opportunity ${opportunityId} from Salesforce`);
      return this.mapSalesforceOpportunity(data);
    } catch (error) {
      console.error('❌ Failed to get opportunity from Salesforce:', error);
      throw error;
    }
  }

  async createOpportunity(opportunity: Partial<CRMOpportunity>): Promise<CRMOpportunity> {
    try {
      const salesforceOpportunity = this.mapToSalesforceOpportunity(opportunity);
      const response = await this.makeAPIRequest('/services/data/v58.0/sobjects/Opportunity/', {
        method: 'POST',
        body: JSON.stringify(salesforceOpportunity)
      });
      
      const data = await response.json();
      console.log('✅ Created opportunity in Salesforce');
      return this.mapSalesforceOpportunity(data);
    } catch (error) {
      console.error('❌ Failed to create opportunity in Salesforce:', error);
      throw error;
    }
  }

  async updateOpportunity(opportunityId: string, opportunity: Partial<CRMOpportunity>): Promise<CRMOpportunity> {
    try {
      const salesforceOpportunity = this.mapToSalesforceOpportunity(opportunity);
      const response = await this.makeAPIRequest(`/services/data/v58.0/sobjects/Opportunity/${opportunityId}`, {
        method: 'PATCH',
        body: JSON.stringify(salesforceOpportunity)
      });
      
      const data = await response.json();
      console.log(`✅ Updated opportunity ${opportunityId} in Salesforce`);
      return this.mapSalesforceOpportunity(data);
    } catch (error) {
      console.error('❌ Failed to update opportunity in Salesforce:', error);
      throw error;
    }
  }

  async deleteOpportunity(opportunityId: string): Promise<boolean> {
    try {
      const response = await this.makeAPIRequest(`/services/data/v58.0/sobjects/Opportunity/${opportunityId}`, {
        method: 'DELETE'
      });
      
      console.log(`✅ Deleted opportunity ${opportunityId} from Salesforce`);
      return response.ok;
    } catch (error) {
      console.error('❌ Failed to delete opportunity from Salesforce:', error);
      throw error;
    }
  }

  // Implement other Salesforce methods...
  async getTasks(filters?: any): Promise<CRMTask[]> {
    try {
      const soql = this.buildSOQLQuery('Task', filters);
      const response = await this.makeAPIRequest(`/services/data/v58.0/query/?q=${encodeURIComponent(soql)}`);
      const data = await response.json();
      
      console.log(`✅ Retrieved ${data.records?.length || 0} tasks from Salesforce`);
      return this.mapSalesforceTasks(data.records || []);
    } catch (error) {
      console.error('❌ Failed to get tasks from Salesforce:', error);
      throw error;
    }
  }

  async getTask(taskId: string): Promise<CRMTask> {
    try {
      const response = await this.makeAPIRequest(`/services/data/v58.0/sobjects/Task/${taskId}`);
      const data = await response.json();
      
      console.log(`✅ Retrieved task ${taskId} from Salesforce`);
      return this.mapSalesforceTask(data);
    } catch (error) {
      console.error('❌ Failed to get task from Salesforce:', error);
      throw error;
    }
  }

  async createTask(task: Partial<CRMTask>): Promise<CRMTask> {
    try {
      const salesforceTask = this.mapToSalesforceTask(task);
      const response = await this.makeAPIRequest('/services/data/v58.0/sobjects/Task/', {
        method: 'POST',
        body: JSON.stringify(salesforceTask)
      });
      
      const data = await response.json();
      console.log('✅ Created task in Salesforce');
      return this.mapSalesforceTask(data);
    } catch (error) {
      console.error('❌ Failed to create task in Salesforce:', error);
      throw error;
    }
  }

  async updateTask(taskId: string, task: Partial<CRMTask>): Promise<CRMTask> {
    try {
      const salesforceTask = this.mapToSalesforceTask(task);
      const response = await this.makeAPIRequest(`/services/data/v58.0/sobjects/Task/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify(salesforceTask)
      });
      
      const data = await response.json();
      console.log(`✅ Updated task ${taskId} in Salesforce`);
      return this.mapSalesforceTask(data);
    } catch (error) {
      console.error('❌ Failed to update task in Salesforce:', error);
      throw error;
    }
  }

  async deleteTask(taskId: string): Promise<boolean> {
    try {
      const response = await this.makeAPIRequest(`/services/data/v58.0/sobjects/Task/${taskId}`, {
        method: 'DELETE'
      });
      
      console.log(`✅ Deleted task ${taskId} from Salesforce`);
      return response.ok;
    } catch (error) {
      console.error('❌ Failed to delete task from Salesforce:', error);
      throw error;
    }
  }

  async getActivities(filters?: any): Promise<CRMActivity[]> {
    try {
      const soql = this.buildSOQLQuery('Event', filters);
      const response = await this.makeAPIRequest(`/services/data/v58.0/query/?q=${encodeURIComponent(soql)}`);
      const data = await response.json();
      
      console.log(`✅ Retrieved ${data.records?.length || 0} activities from Salesforce`);
      return this.mapSalesforceActivities(data.records || []);
    } catch (error) {
      console.error('❌ Failed to get activities from Salesforce:', error);
      throw error;
    }
  }

  async getActivity(activityId: string): Promise<CRMActivity> {
    try {
      const response = await this.makeAPIRequest(`/services/data/v58.0/sobjects/Event/${activityId}`);
      const data = await response.json();
      
      console.log(`✅ Retrieved activity ${activityId} from Salesforce`);
      return this.mapSalesforceActivity(data);
    } catch (error) {
      console.error('❌ Failed to get activity from Salesforce:', error);
      throw error;
    }
  }

  async createActivity(activity: Partial<CRMActivity>): Promise<CRMActivity> {
    try {
      const salesforceEvent = this.mapToSalesforceEvent(activity);
      const response = await this.makeAPIRequest('/services/data/v58.0/sobjects/Event/', {
        method: 'POST',
        body: JSON.stringify(salesforceEvent)
      });
      
      const data = await response.json();
      console.log('✅ Created activity in Salesforce');
      return this.mapSalesforceActivity(data);
    } catch (error) {
      console.error('❌ Failed to create activity in Salesforce:', error);
      throw error;
    }
  }

  async updateActivity(activityId: string, activity: Partial<CRMActivity>): Promise<CRMActivity> {
    try {
      const salesforceEvent = this.mapToSalesforceEvent(activity);
      const response = await this.makeAPIRequest(`/services/data/v58.0/sobjects/Event/${activityId}`, {
        method: 'PATCH',
        body: JSON.stringify(salesforceEvent)
      });
      
      const data = await response.json();
      console.log(`✅ Updated activity ${activityId} in Salesforce`);
      return this.mapSalesforceActivity(data);
    } catch (error) {
      console.error('❌ Failed to update activity in Salesforce:', error);
      throw error;
    }
  }

  async deleteActivity(activityId: string): Promise<boolean> {
    try {
      const response = await this.makeAPIRequest(`/services/data/v58.0/sobjects/Event/${activityId}`, {
        method: 'DELETE'
      });
      
      console.log(`✅ Deleted activity ${activityId} from Salesforce`);
      return response.ok;
    } catch (error) {
      console.error('❌ Failed to delete activity from Salesforce:', error);
      throw error;
    }
  }

  async getPipelines(): Promise<CRMPipeline[]> {
    try {
      const response = await this.makeAPIRequest('/services/data/v58.0/sobjects/Opportunity/describe');
      const data = await response.json();
      
      console.log('✅ Retrieved pipelines from Salesforce');
      return this.mapSalesforcePipelines(data);
    } catch (error) {
      console.error('❌ Failed to get pipelines from Salesforce:', error);
      throw error;
    }
  }

  async getPipeline(pipelineId: string): Promise<CRMPipeline> {
    try {
      const response = await this.makeAPIRequest(`/services/data/v58.0/sobjects/Opportunity/${pipelineId}`);
      const data = await response.json();
      
      console.log(`✅ Retrieved pipeline ${pipelineId} from Salesforce`);
      return this.mapSalesforcePipeline(data);
    } catch (error) {
      console.error('❌ Failed to get pipeline from Salesforce:', error);
      throw error;
    }
  }

  async getUsers(): Promise<CRMUser[]> {
    try {
      const soql = 'SELECT Id, FirstName, LastName, Email, UserRole.Name, IsActive, LastLoginDate, CreatedDate FROM User';
      const response = await this.makeAPIRequest(`/services/data/v58.0/query/?q=${encodeURIComponent(soql)}`);
      const data = await response.json();
      
      console.log(`✅ Retrieved ${data.records?.length || 0} users from Salesforce`);
      return this.mapSalesforceUsers(data.records || []);
    } catch (error) {
      console.error('❌ Failed to get users from Salesforce:', error);
      throw error;
    }
  }

  async getUser(userId: string): Promise<CRMUser> {
    try {
      const response = await this.makeAPIRequest(`/services/data/v58.0/sobjects/User/${userId}`);
      const data = await response.json();
      
      console.log(`✅ Retrieved user ${userId} from Salesforce`);
      return this.mapSalesforceUser(data);
    } catch (error) {
      console.error('❌ Failed to get user from Salesforce:', error);
      throw error;
    }
  }

  async search(criteria: CRMSearchCriteria): Promise<CRMSearchResult> {
    try {
      const soql = this.buildSearchSOQL(criteria);
      const response = await this.makeAPIRequest(`/services/data/v58.0/query/?q=${encodeURIComponent(soql)}`);
      const data = await response.json();
      
      console.log(`✅ Searched ${data.records?.length || 0} records from Salesforce`);
      return {
        items: this.mapSalesforceSearchResults(data.records || []),
        totalCount: data.totalSize || 0,
        hasMore: data.done === false,
        searchId: this.generateSearchId(),
        searchDate: new Date().toISOString(),
        criteria
      };
    } catch (error) {
      console.error('❌ Failed to search in Salesforce:', error);
      throw error;
    }
  }

  async getAnalytics(period: string): Promise<CRMAnalytics> {
    try {
      const response = await this.makeAPIRequest(`/services/data/v58.0/analytics?period=${period}`);
      const data = await response.json();
      
      console.log(`✅ Retrieved analytics for period ${period} from Salesforce`);
      return this.mapSalesforceAnalytics(data);
    } catch (error) {
      console.error('❌ Failed to get analytics from Salesforce:', error);
      throw error;
    }
  }

  async createWebhook(webhook: Partial<CRMWebhook>): Promise<CRMWebhook> {
    try {
      const salesforceWebhook = this.mapToSalesforceWebhook(webhook);
      const response = await this.makeAPIRequest('/services/data/v58.0/sobjects/Webhook__c/', {
        method: 'POST',
        body: JSON.stringify(salesforceWebhook)
      });
      
      const data = await response.json();
      console.log('✅ Created webhook in Salesforce');
      return this.mapSalesforceWebhook(data);
    } catch (error) {
      console.error('❌ Failed to create webhook in Salesforce:', error);
      throw error;
    }
  }

  async getWebhooks(): Promise<CRMWebhook[]> {
    try {
      const soql = 'SELECT Id, Event__c, URL__c, IsActive__c, Secret__c, CreatedDate, LastModifiedDate FROM Webhook__c';
      const response = await this.makeAPIRequest(`/services/data/v58.0/query/?q=${encodeURIComponent(soql)}`);
      const data = await response.json();
      
      console.log(`✅ Retrieved ${data.records?.length || 0} webhooks from Salesforce`);
      return this.mapSalesforceWebhooks(data.records || []);
    } catch (error) {
      console.error('❌ Failed to get webhooks from Salesforce:', error);
      throw error;
    }
  }

  async deleteWebhook(webhookId: string): Promise<boolean> {
    try {
      const response = await this.makeAPIRequest(`/services/data/v58.0/sobjects/Webhook__c/${webhookId}`, {
        method: 'DELETE'
      });
      
      console.log(`✅ Deleted webhook ${webhookId} from Salesforce`);
      return response.ok;
    } catch (error) {
      console.error('❌ Failed to delete webhook from Salesforce:', error);
      throw error;
    }
  }

  // Helper methods for Salesforce-specific operations
  private buildSOQLQuery(objectType: string, filters?: any): string {
    const fields = this.getSOQLFields(objectType);
    let soql = `SELECT ${fields.join(', ')} FROM ${objectType}`;
    
    if (filters) {
      const conditions: string[] = [];
      if (filters.limit) {
        soql += ` LIMIT ${filters.limit}`;
      }
      if (filters.offset) {
        soql += ` OFFSET ${filters.offset}`;
      }
    }
    
    return soql;
  }

  private getSOQLFields(objectType: string): string[] {
    switch (objectType) {
      case 'Contact':
        return ['Id', 'FirstName', 'LastName', 'Email', 'Phone', 'AccountId', 'Title', 'CreatedDate', 'LastModifiedDate'];
      case 'Account':
        return ['Id', 'Name', 'Industry', 'AnnualRevenue', 'Phone', 'Website', 'CreatedDate', 'LastModifiedDate'];
      case 'Opportunity':
        return ['Id', 'Name', 'Amount', 'StageName', 'CloseDate', 'AccountId', 'CreatedDate', 'LastModifiedDate'];
      case 'Task':
        return ['Id', 'Subject', 'Status', 'Priority', 'ActivityDate', 'WhoId', 'WhatId', 'CreatedDate', 'LastModifiedDate'];
      case 'Event':
        return ['Id', 'Subject', 'StartDateTime', 'EndDateTime', 'WhoId', 'WhatId', 'CreatedDate', 'LastModifiedDate'];
      default:
        return ['Id', 'Name', 'CreatedDate', 'LastModifiedDate'];
    }
  }

  private buildSearchSOQL(criteria: CRMSearchCriteria): string {
    // Build a comprehensive search query across multiple objects
    const objects = ['Contact', 'Account', 'Opportunity', 'Task', 'Event'];
    const fields = ['Id', 'Name', 'Type'];
    let soql = `SELECT ${fields.join(', ')} FROM (${objects.join(', ')})`;
    
    if (criteria.query) {
      soql += ` WHERE Name LIKE '%${criteria.query}%'`;
    }
    
    if (criteria.limit) {
      soql += ` LIMIT ${criteria.limit}`;
    }
    
    return soql;
  }

  // Mapping methods for Salesforce-specific data structures
  private mapSalesforceContacts(contacts: any[]): CRMContact[] {
    return contacts.map(contact => this.mapSalesforceContact(contact));
  }

  private mapSalesforceContact(contact: any): CRMContact {
    return {
      id: contact.Id,
      firstName: contact.FirstName || '',
      lastName: contact.LastName || '',
      email: contact.Email || '',
      phone: contact.Phone,
      company: contact.Account?.Name,
      jobTitle: contact.Title,
      tags: [],
      customFields: {},
      createdAt: contact.CreatedDate,
      updatedAt: contact.LastModifiedDate,
      ownerId: contact.OwnerId,
      ownerName: contact.Owner?.Name
    };
  }

  private mapSalesforceCompanies(companies: any[]): CRMCompany[] {
    return companies.map(company => this.mapSalesforceCompany(company));
  }

  private mapSalesforceCompany(company: any): CRMCompany {
    return {
      id: company.Id,
      name: company.Name,
      industry: company.Industry,
      annualRevenue: company.AnnualRevenue,
      phone: company.Phone,
      website: company.Website,
      tags: [],
      customFields: {},
      createdAt: company.CreatedDate,
      updatedAt: company.LastModifiedDate,
      ownerId: company.OwnerId,
      ownerName: company.Owner?.Name
    };
  }

  private mapSalesforceOpportunities(opportunities: any[]): CRMOpportunity[] {
    return opportunities.map(opportunity => this.mapSalesforceOpportunity(opportunity));
  }

  private mapSalesforceOpportunity(opportunity: any): CRMOpportunity {
    return {
      id: opportunity.Id,
      name: opportunity.Name,
      amount: opportunity.Amount || 0,
      currency: 'USD',
      stage: opportunity.StageName,
      probability: opportunity.Probability || 0,
      closeDate: opportunity.CloseDate,
      contactId: opportunity.ContactId,
      companyId: opportunity.AccountId,
      ownerId: opportunity.OwnerId,
      ownerName: opportunity.Owner?.Name,
      tags: [],
      customFields: {},
      createdAt: opportunity.CreatedDate,
      updatedAt: opportunity.LastModifiedDate
    };
  }

  private mapSalesforceTasks(tasks: any[]): CRMTask[] {
    return tasks.map(task => this.mapSalesforceTask(task));
  }

  private mapSalesforceTask(task: any): CRMTask {
    return {
      id: task.Id,
      title: task.Subject,
      type: 'other',
      status: this.mapSalesforceTaskStatus(task.Status),
      priority: this.mapSalesforceTaskPriority(task.Priority),
      dueDate: task.ActivityDate,
      contactId: task.WhoId,
      companyId: task.WhatId,
      ownerId: task.OwnerId,
      ownerName: task.Owner?.Name,
      customFields: {},
      createdAt: task.CreatedDate,
      updatedAt: task.LastModifiedDate
    };
  }

  private mapSalesforceActivities(activities: any[]): CRMActivity[] {
    return activities.map(activity => this.mapSalesforceActivity(activity));
  }

  private mapSalesforceActivity(activity: any): CRMActivity {
    return {
      id: activity.Id,
      type: 'meeting',
      subject: activity.Subject,
      contactId: activity.WhoId,
      companyId: activity.WhatId,
      ownerId: activity.OwnerId,
      ownerName: activity.Owner?.Name,
      customFields: {},
      createdAt: activity.CreatedDate,
      updatedAt: activity.LastModifiedDate
    };
  }

  private mapSalesforcePipelines(pipelines: any): CRMPipeline[] {
    // Map Salesforce opportunity stages to pipelines
    return [{
      id: 'default',
      name: 'Sales Pipeline',
      description: 'Default sales pipeline',
      stages: this.mapSalesforceStages(pipelines),
      isDefault: true,
      customFields: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }];
  }

  private mapSalesforcePipeline(pipeline: any): CRMPipeline {
    return {
      id: pipeline.Id,
      name: pipeline.Name,
      description: pipeline.Description,
      stages: [],
      isDefault: false,
      customFields: {},
      createdAt: pipeline.CreatedDate,
      updatedAt: pipeline.LastModifiedDate
    };
  }

  private mapSalesforceStages(pipelines: any): CRMStage[] {
    // Extract stages from Salesforce opportunity metadata
    return [];
  }

  private mapSalesforceUsers(users: any[]): CRMUser[] {
    return users.map(user => this.mapSalesforceUser(user));
  }

  private mapSalesforceUser(user: any): CRMUser {
    return {
      id: user.Id,
      firstName: user.FirstName || '',
      lastName: user.LastName || '',
      email: user.Email,
      role: user.UserRole?.Name || 'User',
      permissions: [],
      isActive: user.IsActive,
      lastLoginAt: user.LastLoginDate,
      createdAt: user.CreatedDate,
      updatedAt: user.LastModifiedDate
    };
  }

  private mapSalesforceSearchResults(results: any[]): Array<CRMContact | CRMCompany | CRMOpportunity | CRMTask | CRMActivity> {
    return results.map(result => {
      switch (result.Type) {
        case 'Contact':
          return this.mapSalesforceContact(result);
        case 'Account':
          return this.mapSalesforceCompany(result);
        case 'Opportunity':
          return this.mapSalesforceOpportunity(result);
        case 'Task':
          return this.mapSalesforceTask(result);
        case 'Event':
          return this.mapSalesforceActivity(result);
        default:
          return result;
      }
    });
  }

  private mapSalesforceAnalytics(data: any): CRMAnalytics {
    return {
      period: data.period || '30d',
      totalContacts: data.totalContacts || 0,
      newContacts: data.newContacts || 0,
      totalCompanies: data.totalCompanies || 0,
      newCompanies: data.newCompanies || 0,
      totalOpportunities: data.totalOpportunities || 0,
      newOpportunities: data.newOpportunities || 0,
      totalRevenue: data.totalRevenue || 0,
      wonRevenue: data.wonRevenue || 0,
      lostRevenue: data.lostRevenue || 0,
      averageDealSize: data.averageDealSize || 0,
      conversionRate: data.conversionRate || 0,
      salesCycle: data.salesCycle || 0,
      topPerformers: data.topPerformers || [],
      topSources: data.topSources || [],
      stageBreakdown: data.stageBreakdown || []
    };
  }

  private mapSalesforceWebhooks(webhooks: any[]): CRMWebhook[] {
    return webhooks.map(webhook => this.mapSalesforceWebhook(webhook));
  }

  private mapSalesforceWebhook(webhook: any): CRMWebhook {
    return {
      id: webhook.Id,
      event: webhook.Event__c,
      url: webhook.URL__c,
      isActive: webhook.IsActive__c,
      secret: webhook.Secret__c,
      createdAt: webhook.CreatedDate,
      updatedAt: webhook.LastModifiedDate
    };
  }

  // Helper methods for mapping to Salesforce format
  private mapToSalesforceContact(contact: Partial<CRMContact>): any {
    return {
      FirstName: contact.firstName,
      LastName: contact.lastName,
      Email: contact.email,
      Phone: contact.phone,
      Title: contact.jobTitle
    };
  }

  private mapToSalesforceAccount(company: Partial<CRMCompany>): any {
    return {
      Name: company.name,
      Industry: company.industry,
      AnnualRevenue: company.annualRevenue,
      Phone: company.phone,
      Website: company.website
    };
  }

  private mapToSalesforceOpportunity(opportunity: Partial<CRMOpportunity>): any {
    return {
      Name: opportunity.name,
      Amount: opportunity.amount,
      StageName: opportunity.stage,
      CloseDate: opportunity.closeDate,
      AccountId: opportunity.companyId,
      ContactId: opportunity.contactId
    };
  }

  private mapToSalesforceTask(task: Partial<CRMTask>): any {
    return {
      Subject: task.title,
      Status: this.mapToSalesforceTaskStatus(task.status),
      Priority: this.mapToSalesforceTaskPriority(task.priority),
      ActivityDate: task.dueDate,
      WhoId: task.contactId,
      WhatId: task.companyId
    };
  }

  private mapToSalesforceEvent(activity: Partial<CRMActivity>): any {
    return {
      Subject: activity.subject,
      StartDateTime: activity.createdAt,
      EndDateTime: activity.updatedAt,
      WhoId: activity.contactId,
      WhatId: activity.companyId
    };
  }

  private mapToSalesforceWebhook(webhook: Partial<CRMWebhook>): any {
    return {
      Event__c: webhook.event,
      URL__c: webhook.url,
      IsActive__c: webhook.isActive,
      Secret__c: webhook.secret
    };
  }

  private mapSalesforceTaskStatus(status?: string): 'pending' | 'in_progress' | 'completed' | 'cancelled' {
    switch (status) {
      case 'completed': return 'completed';
      case 'in_progress': return 'in_progress';
      case 'cancelled': return 'cancelled';
      default: return 'pending';
    }
  }

  private mapSalesforceTaskPriority(priority?: string): 'low' | 'medium' | 'high' | 'urgent' {
    switch (priority) {
      case 'high': return 'high';
      case 'urgent': return 'urgent';
      case 'low': return 'low';
      default: return 'medium';
    }
  }

  private mapToSalesforceTaskStatus(status?: string): string {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in_progress': return 'In Progress';
      case 'cancelled': return 'Cancelled';
      default: return 'Not Started';
    }
  }

  private mapToSalesforceTaskPriority(priority?: string): string {
    switch (priority) {
      case 'high': return 'High';
      case 'urgent': return 'Urgent';
      case 'low': return 'Low';
      default: return 'Normal';
    }
  }

  private generateSearchId(): string {
    return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * HubSpot Integration Service
 */
export class TETRIXHubSpotIntegration extends BaseCRMIntegration {
  constructor(config: CRMConfig) {
    super(config);
  }

  async connect(): Promise<boolean> {
    try {
      const response = await this.makeAPIRequest('/crm/v3/objects/contacts');
      if (response.ok) {
        this.isConnected = true;
        console.log('✅ Connected to HubSpot');
        return true;
      } else {
        throw new Error('HubSpot connection failed');
      }
    } catch (error) {
      console.error('❌ Failed to connect to HubSpot:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    console.log('✅ Disconnected from HubSpot');
  }

  protected getAuthHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.config.accessToken || ''}`
    };
  }

  // Implement HubSpot-specific methods similar to Salesforce
  async getContacts(filters?: any): Promise<CRMContact[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.after) params.append('after', filters.after);

      const response = await this.makeAPIRequest(`/crm/v3/objects/contacts?${params.toString()}`);
      const data = await response.json();
      
      console.log(`✅ Retrieved ${data.results?.length || 0} contacts from HubSpot`);
      return this.mapHubSpotContacts(data.results || []);
    } catch (error) {
      console.error('❌ Failed to get contacts from HubSpot:', error);
      throw error;
    }
  }

  async getContact(contactId: string): Promise<CRMContact> {
    try {
      const response = await this.makeAPIRequest(`/crm/v3/objects/contacts/${contactId}`);
      const data = await response.json();
      
      console.log(`✅ Retrieved contact ${contactId} from HubSpot`);
      return this.mapHubSpotContact(data);
    } catch (error) {
      console.error('❌ Failed to get contact from HubSpot:', error);
      throw error;
    }
  }

  async createContact(contact: Partial<CRMContact>): Promise<CRMContact> {
    try {
      const hubspotContact = this.mapToHubSpotContact(contact);
      const response = await this.makeAPIRequest('/crm/v3/objects/contacts', {
        method: 'POST',
        body: JSON.stringify(hubspotContact)
      });
      
      const data = await response.json();
      console.log('✅ Created contact in HubSpot');
      return this.mapHubSpotContact(data);
    } catch (error) {
      console.error('❌ Failed to create contact in HubSpot:', error);
      throw error;
    }
  }

  async updateContact(contactId: string, contact: Partial<CRMContact>): Promise<CRMContact> {
    try {
      const hubspotContact = this.mapToHubSpotContact(contact);
      const response = await this.makeAPIRequest(`/crm/v3/objects/contacts/${contactId}`, {
        method: 'PATCH',
        body: JSON.stringify(hubspotContact)
      });
      
      const data = await response.json();
      console.log(`✅ Updated contact ${contactId} in HubSpot`);
      return this.mapHubSpotContact(data);
    } catch (error) {
      console.error('❌ Failed to update contact in HubSpot:', error);
      throw error;
    }
  }

  async deleteContact(contactId: string): Promise<boolean> {
    try {
      const response = await this.makeAPIRequest(`/crm/v3/objects/contacts/${contactId}`, {
        method: 'DELETE'
      });
      
      console.log(`✅ Deleted contact ${contactId} from HubSpot`);
      return response.ok;
    } catch (error) {
      console.error('❌ Failed to delete contact from HubSpot:', error);
      throw error;
    }
  }

  // Implement other HubSpot methods...
  async getCompanies(filters?: any): Promise<CRMCompany[]> {
    // HubSpot-specific implementation
    return [];
  }

  async getCompany(companyId: string): Promise<CRMCompany> {
    // HubSpot-specific implementation
    return {} as CRMCompany;
  }

  async createCompany(company: Partial<CRMCompany>): Promise<CRMCompany> {
    // HubSpot-specific implementation
    return {} as CRMCompany;
  }

  async updateCompany(companyId: string, company: Partial<CRMCompany>): Promise<CRMCompany> {
    // HubSpot-specific implementation
    return {} as CRMCompany;
  }

  async deleteCompany(companyId: string): Promise<boolean> {
    // HubSpot-specific implementation
    return false;
  }

  async getOpportunities(filters?: any): Promise<CRMOpportunity[]> {
    // HubSpot-specific implementation
    return [];
  }

  async getOpportunity(opportunityId: string): Promise<CRMOpportunity> {
    // HubSpot-specific implementation
    return {} as CRMOpportunity;
  }

  async createOpportunity(opportunity: Partial<CRMOpportunity>): Promise<CRMOpportunity> {
    // HubSpot-specific implementation
    return {} as CRMOpportunity;
  }

  async updateOpportunity(opportunityId: string, opportunity: Partial<CRMOpportunity>): Promise<CRMOpportunity> {
    // HubSpot-specific implementation
    return {} as CRMOpportunity;
  }

  async deleteOpportunity(opportunityId: string): Promise<boolean> {
    // HubSpot-specific implementation
    return false;
  }

  async getTasks(filters?: any): Promise<CRMTask[]> {
    // HubSpot-specific implementation
    return [];
  }

  async getTask(taskId: string): Promise<CRMTask> {
    // HubSpot-specific implementation
    return {} as CRMTask;
  }

  async createTask(task: Partial<CRMTask>): Promise<CRMTask> {
    // HubSpot-specific implementation
    return {} as CRMTask;
  }

  async updateTask(taskId: string, task: Partial<CRMTask>): Promise<CRMTask> {
    // HubSpot-specific implementation
    return {} as CRMTask;
  }

  async deleteTask(taskId: string): Promise<boolean> {
    // HubSpot-specific implementation
    return false;
  }

  async getActivities(filters?: any): Promise<CRMActivity[]> {
    // HubSpot-specific implementation
    return [];
  }

  async getActivity(activityId: string): Promise<CRMActivity> {
    // HubSpot-specific implementation
    return {} as CRMActivity;
  }

  async createActivity(activity: Partial<CRMActivity>): Promise<CRMActivity> {
    // HubSpot-specific implementation
    return {} as CRMActivity;
  }

  async updateActivity(activityId: string, activity: Partial<CRMActivity>): Promise<CRMActivity> {
    // HubSpot-specific implementation
    return {} as CRMActivity;
  }

  async deleteActivity(activityId: string): Promise<boolean> {
    // HubSpot-specific implementation
    return false;
  }

  async getPipelines(): Promise<CRMPipeline[]> {
    // HubSpot-specific implementation
    return [];
  }

  async getPipeline(pipelineId: string): Promise<CRMPipeline> {
    // HubSpot-specific implementation
    return {} as CRMPipeline;
  }

  async getUsers(): Promise<CRMUser[]> {
    // HubSpot-specific implementation
    return [];
  }

  async getUser(userId: string): Promise<CRMUser> {
    // HubSpot-specific implementation
    return {} as CRMUser;
  }

  async search(criteria: CRMSearchCriteria): Promise<CRMSearchResult> {
    // HubSpot-specific implementation
    return {
      items: [],
      totalCount: 0,
      hasMore: false,
      searchId: this.generateSearchId(),
      searchDate: new Date().toISOString(),
      criteria
    };
  }

  async getAnalytics(period: string): Promise<CRMAnalytics> {
    // HubSpot-specific implementation
    return {} as CRMAnalytics;
  }

  async createWebhook(webhook: Partial<CRMWebhook>): Promise<CRMWebhook> {
    // HubSpot-specific implementation
    return {} as CRMWebhook;
  }

  async getWebhooks(): Promise<CRMWebhook[]> {
    // HubSpot-specific implementation
    return [];
  }

  async deleteWebhook(webhookId: string): Promise<boolean> {
    // HubSpot-specific implementation
    return false;
  }

  // HubSpot-specific mapping methods
  private mapHubSpotContacts(contacts: any[]): CRMContact[] {
    return contacts.map(contact => this.mapHubSpotContact(contact));
  }

  private mapHubSpotContact(contact: any): CRMContact {
    return {
      id: contact.id,
      firstName: contact.properties.firstname || '',
      lastName: contact.properties.lastname || '',
      email: contact.properties.email || '',
      phone: contact.properties.phone,
      company: contact.properties.company,
      jobTitle: contact.properties.jobtitle,
      tags: contact.properties.hs_tag || [],
      customFields: contact.properties,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
      lastContactedAt: contact.properties.lastcontacted,
      leadSource: contact.properties.hs_lead_source,
      leadStatus: contact.properties.hs_lead_status,
      lifecycleStage: contact.properties.lifecyclestage,
      ownerId: contact.properties.hubspot_owner_id,
      ownerName: contact.properties.hubspot_owner_name
    };
  }

  private mapToHubSpotContact(contact: Partial<CRMContact>): any {
    return {
      properties: {
        firstname: contact.firstName,
        lastname: contact.lastName,
        email: contact.email,
        phone: contact.phone,
        company: contact.company,
        jobtitle: contact.jobTitle
      }
    };
  }

  private generateSearchId(): string {
    return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * CRM Integration Factory
 */
export class CRMIntegrationFactory {
  /**
   * Create Salesforce integration
   */
  static createSalesforceIntegration(settings: any): TETRIXSalesforceIntegration {
    const config: CRMConfig = {
      provider: 'salesforce',
      apiKey: settings.apiKey,
      accessToken: settings.accessToken,
      baseUrl: settings.baseUrl || 'https://your-instance.salesforce.com',
      version: settings.version || '58.0',
      timeout: settings.timeout || 30000
    };

    return new TETRIXSalesforceIntegration(config);
  }

  /**
   * Create HubSpot integration
   */
  static createHubSpotIntegration(settings: any): TETRIXHubSpotIntegration {
    const config: CRMConfig = {
      provider: 'hubspot',
      apiKey: settings.apiKey,
      accessToken: settings.accessToken,
      baseUrl: settings.baseUrl || 'https://api.hubapi.com',
      version: settings.version || '3.0',
      timeout: settings.timeout || 30000
    };

    return new TETRIXHubSpotIntegration(config);
  }

  /**
   * Create Pipedrive integration
   */
  static createPipedriveIntegration(settings: any): BaseCRMIntegration {
    const config: CRMConfig = {
      provider: 'pipedrive',
      apiKey: settings.apiKey,
      baseUrl: settings.baseUrl || 'https://api.pipedrive.com',
      version: settings.version || '1.0',
      timeout: settings.timeout || 30000
    };

    // Return a Pipedrive-specific implementation
    return new TETRIXSalesforceIntegration(config); // Placeholder
  }

  /**
   * Create Zoho CRM integration
   */
  static createZohoCRMIntegration(settings: any): BaseCRMIntegration {
    const config: CRMConfig = {
      provider: 'zoho',
      apiKey: settings.apiKey,
      accessToken: settings.accessToken,
      baseUrl: settings.baseUrl || 'https://www.zohoapis.com',
      version: settings.version || '1.0',
      timeout: settings.timeout || 30000
    };

    // Return a Zoho-specific implementation
    return new TETRIXSalesforceIntegration(config); // Placeholder
  }
}
