// TETRIX Legal Practice Management Integrations
// Clio, MyCase, and PracticePanther integrations for legal professionals

export interface LegalConfig {
  provider: 'clio' | 'mycase' | 'practicepanther';
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  baseUrl: string;
  scope: string[];
}

export interface LegalAuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  scope: string;
  userId: string;
  firmId: string;
}

export interface LegalCase {
  id: string;
  name: string;
  status: string;
  clientId: string;
  clientName: string;
  matterType: string;
  practiceArea: string;
  openDate: string;
  closeDate?: string;
  description?: string;
  customFields?: Record<string, any>;
  tags?: string[];
  responsibleAttorney?: string;
  billingRate?: number;
}

export interface LegalClient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: LegalAddress;
  type: 'individual' | 'business';
  status: 'active' | 'inactive';
  customFields?: Record<string, any>;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LegalAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface LegalContact {
  id: string;
  clientId: string;
  name: string;
  email?: string;
  phone?: string;
  title?: string;
  isPrimary: boolean;
  customFields?: Record<string, any>;
}

export interface LegalDocument {
  id: string;
  caseId: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
  tags?: string[];
  isConfidential: boolean;
  version: number;
}

export interface LegalTimeEntry {
  id: string;
  caseId: string;
  description: string;
  date: string;
  duration: number; // in minutes
  rate: number;
  amount: number;
  billable: boolean;
  attorney: string;
  category?: string;
  customFields?: Record<string, any>;
}

export interface LegalExpense {
  id: string;
  caseId: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  billable: boolean;
  reimbursable: boolean;
  vendor?: string;
  receipt?: string;
  customFields?: Record<string, any>;
}

export interface LegalInvoice {
  id: string;
  clientId: string;
  caseId?: string;
  number: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  date: string;
  dueDate: string;
  subtotal: number;
  tax: number;
  total: number;
  paidAmount: number;
  balance: number;
  lineItems: LegalInvoiceLineItem[];
  customFields?: Record<string, any>;
}

export interface LegalInvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  type: 'time' | 'expense' | 'fee';
  timeEntryId?: string;
  expenseId?: string;
}

export interface LegalTask {
  id: string;
  caseId: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  dueDate?: string;
  completedAt?: string;
  customFields?: Record<string, any>;
  tags?: string[];
}

export interface LegalCalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  allDay: boolean;
  location?: string;
  attendees?: string[];
  caseId?: string;
  clientId?: string;
  type: 'appointment' | 'court_date' | 'deadline' | 'meeting' | 'other';
  reminder?: number; // minutes before
  customFields?: Record<string, any>;
}

export interface LegalUser {
  id: string;
  name: string;
  email: string;
  role: 'attorney' | 'paralegal' | 'admin' | 'staff';
  status: 'active' | 'inactive';
  permissions: string[];
  customFields?: Record<string, any>;
}

export interface LegalFirm {
  id: string;
  name: string;
  address: LegalAddress;
  phone?: string;
  email?: string;
  website?: string;
  settings: LegalFirmSettings;
  customFields?: Record<string, any>;
}

export interface LegalFirmSettings {
  timezone: string;
  currency: string;
  dateFormat: string;
  billingMethod: 'hourly' | 'flat_fee' | 'contingency' | 'retainer';
  taxRate: number;
  customFields?: Record<string, any>;
}

/**
 * Base Legal Integration Service
 */
export abstract class BaseLegalIntegration {
  protected config: LegalConfig;
  protected accessToken?: string;
  protected refreshToken?: string;
  protected userId?: string;
  protected firmId?: string;

  constructor(config: LegalConfig) {
    this.config = config;
  }

  /**
   * Initialize OAuth flow
   */
  abstract initiateOAuthFlow(state: string): Promise<string>;

  /**
   * Exchange code for tokens
   */
  abstract exchangeCodeForToken(code: string, state: string): Promise<LegalAuthResponse>;

  /**
   * Refresh access token
   */
  abstract refreshAccessToken(): Promise<LegalAuthResponse>;

  /**
   * Get cases
   */
  abstract getCases(filters?: any): Promise<LegalCase[]>;

  /**
   * Get case by ID
   */
  abstract getCase(caseId: string): Promise<LegalCase>;

  /**
   * Create case
   */
  abstract createCase(caseData: Partial<LegalCase>): Promise<LegalCase>;

  /**
   * Update case
   */
  abstract updateCase(caseId: string, caseData: Partial<LegalCase>): Promise<LegalCase>;

  /**
   * Get clients
   */
  abstract getClients(filters?: any): Promise<LegalClient[]>;

  /**
   * Get client by ID
   */
  abstract getClient(clientId: string): Promise<LegalClient>;

  /**
   * Create client
   */
  abstract createClient(clientData: Partial<LegalClient>): Promise<LegalClient>;

  /**
   * Update client
   */
  abstract updateClient(clientId: string, clientData: Partial<LegalClient>): Promise<LegalClient>;

  /**
   * Get time entries
   */
  abstract getTimeEntries(caseId?: string, filters?: any): Promise<LegalTimeEntry[]>;

  /**
   * Create time entry
   */
  abstract createTimeEntry(timeEntryData: Partial<LegalTimeEntry>): Promise<LegalTimeEntry>;

  /**
   * Get documents
   */
  abstract getDocuments(caseId?: string, filters?: any): Promise<LegalDocument[]>;

  /**
   * Upload document
   */
  abstract uploadDocument(caseId: string, file: File, metadata?: any): Promise<LegalDocument>;

  /**
   * Get invoices
   */
  abstract getInvoices(filters?: any): Promise<LegalInvoice[]>;

  /**
   * Create invoice
   */
  abstract createInvoice(invoiceData: Partial<LegalInvoice>): Promise<LegalInvoice>;

  /**
   * Get tasks
   */
  abstract getTasks(caseId?: string, filters?: any): Promise<LegalTask[]>;

  /**
   * Create task
   */
  abstract createTask(taskData: Partial<LegalTask>): Promise<LegalTask>;

  /**
   * Get calendar events
   */
  abstract getCalendarEvents(startDate?: string, endDate?: string): Promise<LegalCalendarEvent[]>;

  /**
   * Create calendar event
   */
  abstract createCalendarEvent(eventData: Partial<LegalCalendarEvent>): Promise<LegalCalendarEvent>;

  /**
   * Make authenticated API request
   */
  protected async makeRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    const url = `${this.config.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, try to refresh
        try {
          await this.refreshAccessToken();
          // Retry the request with new token
          return this.makeRequest(endpoint, options);
        } catch (refreshError) {
          console.error('❌ Token refresh failed:', refreshError);
          throw new Error('Authentication failed');
        }
      }
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response;
  }
}

/**
 * Clio Integration Service
 */
export class TETRIXClioIntegration extends BaseLegalIntegration {
  constructor(config: LegalConfig) {
    super(config);
  }

  async initiateOAuthFlow(state: string): Promise<string> {
    const authUrl = new URL(`${this.config.baseUrl}/oauth/authorize`);
    authUrl.searchParams.set('client_id', this.config.clientId);
    authUrl.searchParams.set('redirect_uri', this.config.redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', this.config.scope.join(' '));
    authUrl.searchParams.set('state', state);

    console.log('🔗 Initiating Clio OAuth flow...');
    return authUrl.toString();
  }

  async exchangeCodeForToken(code: string, state: string): Promise<LegalAuthResponse> {
    const tokenRequest = {
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: this.config.redirectUri,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret
    };

    const response = await fetch(`${this.config.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams(tokenRequest)
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    const tokenData = await response.json();
    
    this.accessToken = tokenData.access_token;
    this.refreshToken = tokenData.refresh_token;
    this.userId = tokenData.user_id;
    this.firmId = tokenData.firm_id;

    console.log('✅ Clio OAuth token exchange successful');
    
    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      tokenType: tokenData.token_type,
      expiresIn: tokenData.expires_in,
      scope: tokenData.scope,
      userId: tokenData.user_id,
      firmId: tokenData.firm_id
    };
  }

  async refreshAccessToken(): Promise<LegalAuthResponse> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const refreshRequest = {
      grant_type: 'refresh_token',
      refresh_token: this.refreshToken,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret
    };

    const response = await fetch(`${this.config.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams(refreshRequest)
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }

    const tokenData = await response.json();
    
    this.accessToken = tokenData.access_token;
    if (tokenData.refresh_token) {
      this.refreshToken = tokenData.refresh_token;
    }

    console.log('✅ Clio access token refreshed');
    
    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      tokenType: tokenData.token_type,
      expiresIn: tokenData.expires_in,
      scope: tokenData.scope,
      userId: this.userId!,
      firmId: this.firmId!
    };
  }

  async getCases(filters?: any): Promise<LegalCase[]> {
    const response = await this.makeRequest('/api/v4/matters', {
      method: 'GET'
    });

    const data = await response.json();
    console.log(`✅ Retrieved ${data.data?.length || 0} cases from Clio`);
    return data.data || [];
  }

  async getCase(caseId: string): Promise<LegalCase> {
    const response = await this.makeRequest(`/api/v4/matters/${caseId}`);
    const data = await response.json();
    console.log(`✅ Retrieved case ${caseId} from Clio`);
    return data.data;
  }

  async createCase(caseData: Partial<LegalCase>): Promise<LegalCase> {
    const response = await this.makeRequest('/api/v4/matters', {
      method: 'POST',
      body: JSON.stringify(caseData)
    });

    const data = await response.json();
    console.log('✅ Created new case in Clio');
    return data.data;
  }

  async updateCase(caseId: string, caseData: Partial<LegalCase>): Promise<LegalCase> {
    const response = await this.makeRequest(`/api/v4/matters/${caseId}`, {
      method: 'PUT',
      body: JSON.stringify(caseData)
    });

    const data = await response.json();
    console.log(`✅ Updated case ${caseId} in Clio`);
    return data.data;
  }

  async getClients(filters?: any): Promise<LegalClient[]> {
    const response = await this.makeRequest('/api/v4/contacts', {
      method: 'GET'
    });

    const data = await response.json();
    console.log(`✅ Retrieved ${data.data?.length || 0} clients from Clio`);
    return data.data || [];
  }

  async getClient(clientId: string): Promise<LegalClient> {
    const response = await this.makeRequest(`/api/v4/contacts/${clientId}`);
    const data = await response.json();
    console.log(`✅ Retrieved client ${clientId} from Clio`);
    return data.data;
  }

  async createClient(clientData: Partial<LegalClient>): Promise<LegalClient> {
    const response = await this.makeRequest('/api/v4/contacts', {
      method: 'POST',
      body: JSON.stringify(clientData)
    });

    const data = await response.json();
    console.log('✅ Created new client in Clio');
    return data.data;
  }

  async updateClient(clientId: string, clientData: Partial<LegalClient>): Promise<LegalClient> {
    const response = await this.makeRequest(`/api/v4/contacts/${clientId}`, {
      method: 'PUT',
      body: JSON.stringify(clientData)
    });

    const data = await response.json();
    console.log(`✅ Updated client ${clientId} in Clio`);
    return data.data;
  }

  async getTimeEntries(caseId?: string, filters?: any): Promise<LegalTimeEntry[]> {
    let url = '/api/v4/time_entries';
    if (caseId) {
      url += `?matter_id=${caseId}`;
    }

    const response = await this.makeRequest(url);
    const data = await response.json();
    console.log(`✅ Retrieved ${data.data?.length || 0} time entries from Clio`);
    return data.data || [];
  }

  async createTimeEntry(timeEntryData: Partial<LegalTimeEntry>): Promise<LegalTimeEntry> {
    const response = await this.makeRequest('/api/v4/time_entries', {
      method: 'POST',
      body: JSON.stringify(timeEntryData)
    });

    const data = await response.json();
    console.log('✅ Created new time entry in Clio');
    return data.data;
  }

  async getDocuments(caseId?: string, filters?: any): Promise<LegalDocument[]> {
    let url = '/api/v4/documents';
    if (caseId) {
      url += `?matter_id=${caseId}`;
    }

    const response = await this.makeRequest(url);
    const data = await response.json();
    console.log(`✅ Retrieved ${data.data?.length || 0} documents from Clio`);
    return data.data || [];
  }

  async uploadDocument(caseId: string, file: File, metadata?: any): Promise<LegalDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('matter_id', caseId);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    const response = await this.makeRequest('/api/v4/documents', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    console.log('✅ Uploaded document to Clio');
    return data.data;
  }

  async getInvoices(filters?: any): Promise<LegalInvoice[]> {
    const response = await this.makeRequest('/api/v4/invoices', {
      method: 'GET'
    });

    const data = await response.json();
    console.log(`✅ Retrieved ${data.data?.length || 0} invoices from Clio`);
    return data.data || [];
  }

  async createInvoice(invoiceData: Partial<LegalInvoice>): Promise<LegalInvoice> {
    const response = await this.makeRequest('/api/v4/invoices', {
      method: 'POST',
      body: JSON.stringify(invoiceData)
    });

    const data = await response.json();
    console.log('✅ Created new invoice in Clio');
    return data.data;
  }

  async getTasks(caseId?: string, filters?: any): Promise<LegalTask[]> {
    let url = '/api/v4/tasks';
    if (caseId) {
      url += `?matter_id=${caseId}`;
    }

    const response = await this.makeRequest(url);
    const data = await response.json();
    console.log(`✅ Retrieved ${data.data?.length || 0} tasks from Clio`);
    return data.data || [];
  }

  async createTask(taskData: Partial<LegalTask>): Promise<LegalTask> {
    const response = await this.makeRequest('/api/v4/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });

    const data = await response.json();
    console.log('✅ Created new task in Clio');
    return data.data;
  }

  async getCalendarEvents(startDate?: string, endDate?: string): Promise<LegalCalendarEvent[]> {
    let url = '/api/v4/calendar_events';
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await this.makeRequest(url);
    const data = await response.json();
    console.log(`✅ Retrieved ${data.data?.length || 0} calendar events from Clio`);
    return data.data || [];
  }

  async createCalendarEvent(eventData: Partial<LegalCalendarEvent>): Promise<LegalCalendarEvent> {
    const response = await this.makeRequest('/api/v4/calendar_events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });

    const data = await response.json();
    console.log('✅ Created new calendar event in Clio');
    return data.data;
  }
}

/**
 * MyCase Integration Service
 */
export class TETRIXMyCaseIntegration extends BaseLegalIntegration {
  constructor(config: LegalConfig) {
    super(config);
  }

  async initiateOAuthFlow(state: string): Promise<string> {
    const authUrl = new URL(`${this.config.baseUrl}/oauth/authorize`);
    authUrl.searchParams.set('client_id', this.config.clientId);
    authUrl.searchParams.set('redirect_uri', this.config.redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', this.config.scope.join(' '));
    authUrl.searchParams.set('state', state);

    console.log('🔗 Initiating MyCase OAuth flow...');
    return authUrl.toString();
  }

  async exchangeCodeForToken(code: string, state: string): Promise<LegalAuthResponse> {
    const tokenRequest = {
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: this.config.redirectUri,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret
    };

    const response = await fetch(`${this.config.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams(tokenRequest)
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    const tokenData = await response.json();
    
    this.accessToken = tokenData.access_token;
    this.refreshToken = tokenData.refresh_token;
    this.userId = tokenData.user_id;
    this.firmId = tokenData.firm_id;

    console.log('✅ MyCase OAuth token exchange successful');
    
    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      tokenType: tokenData.token_type,
      expiresIn: tokenData.expires_in,
      scope: tokenData.scope,
      userId: tokenData.user_id,
      firmId: tokenData.firm_id
    };
  }

  async refreshAccessToken(): Promise<LegalAuthResponse> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const refreshRequest = {
      grant_type: 'refresh_token',
      refresh_token: this.refreshToken,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret
    };

    const response = await fetch(`${this.config.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams(refreshRequest)
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }

    const tokenData = await response.json();
    
    this.accessToken = tokenData.access_token;
    if (tokenData.refresh_token) {
      this.refreshToken = tokenData.refresh_token;
    }

    console.log('✅ MyCase access token refreshed');
    
    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      tokenType: tokenData.token_type,
      expiresIn: tokenData.expires_in,
      scope: tokenData.scope,
      userId: this.userId!,
      firmId: this.firmId!
    };
  }

  // Implement MyCase-specific API methods
  async getCases(filters?: any): Promise<LegalCase[]> {
    const response = await this.makeRequest('/api/v1/cases');
    const data = await response.json();
    console.log(`✅ Retrieved ${data.data?.length || 0} cases from MyCase`);
    return data.data || [];
  }

  async getCase(caseId: string): Promise<LegalCase> {
    const response = await this.makeRequest(`/api/v1/cases/${caseId}`);
    const data = await response.json();
    console.log(`✅ Retrieved case ${caseId} from MyCase`);
    return data.data;
  }

  async createCase(caseData: Partial<LegalCase>): Promise<LegalCase> {
    const response = await this.makeRequest('/api/v1/cases', {
      method: 'POST',
      body: JSON.stringify(caseData)
    });

    const data = await response.json();
    console.log('✅ Created new case in MyCase');
    return data.data;
  }

  async updateCase(caseId: string, caseData: Partial<LegalCase>): Promise<LegalCase> {
    const response = await this.makeRequest(`/api/v1/cases/${caseId}`, {
      method: 'PUT',
      body: JSON.stringify(caseData)
    });

    const data = await response.json();
    console.log(`✅ Updated case ${caseId} in MyCase`);
    return data.data;
  }

  async getClients(filters?: any): Promise<LegalClient[]> {
    const response = await this.makeRequest('/api/v1/clients');
    const data = await response.json();
    console.log(`✅ Retrieved ${data.data?.length || 0} clients from MyCase`);
    return data.data || [];
  }

  async getClient(clientId: string): Promise<LegalClient> {
    const response = await this.makeRequest(`/api/v1/clients/${clientId}`);
    const data = await response.json();
    console.log(`✅ Retrieved client ${clientId} from MyCase`);
    return data.data;
  }

  async createClient(clientData: Partial<LegalClient>): Promise<LegalClient> {
    const response = await this.makeRequest('/api/v1/clients', {
      method: 'POST',
      body: JSON.stringify(clientData)
    });

    const data = await response.json();
    console.log('✅ Created new client in MyCase');
    return data.data;
  }

  async updateClient(clientId: string, clientData: Partial<LegalClient>): Promise<LegalClient> {
    const response = await this.makeRequest(`/api/v1/clients/${clientId}`, {
      method: 'PUT',
      body: JSON.stringify(clientData)
    });

    const data = await response.json();
    console.log(`✅ Updated client ${clientId} in MyCase`);
    return data.data;
  }

  async getTimeEntries(caseId?: string, filters?: any): Promise<LegalTimeEntry[]> {
    let url = '/api/v1/time_entries';
    if (caseId) {
      url += `?case_id=${caseId}`;
    }

    const response = await this.makeRequest(url);
    const data = await response.json();
    console.log(`✅ Retrieved ${data.data?.length || 0} time entries from MyCase`);
    return data.data || [];
  }

  async createTimeEntry(timeEntryData: Partial<LegalTimeEntry>): Promise<LegalTimeEntry> {
    const response = await this.makeRequest('/api/v1/time_entries', {
      method: 'POST',
      body: JSON.stringify(timeEntryData)
    });

    const data = await response.json();
    console.log('✅ Created new time entry in MyCase');
    return data.data;
  }

  async getDocuments(caseId?: string, filters?: any): Promise<LegalDocument[]> {
    let url = '/api/v1/documents';
    if (caseId) {
      url += `?case_id=${caseId}`;
    }

    const response = await this.makeRequest(url);
    const data = await response.json();
    console.log(`✅ Retrieved ${data.data?.length || 0} documents from MyCase`);
    return data.data || [];
  }

  async uploadDocument(caseId: string, file: File, metadata?: any): Promise<LegalDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('case_id', caseId);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    const response = await this.makeRequest('/api/v1/documents', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    console.log('✅ Uploaded document to MyCase');
    return data.data;
  }

  async getInvoices(filters?: any): Promise<LegalInvoice[]> {
    const response = await this.makeRequest('/api/v1/invoices');
    const data = await response.json();
    console.log(`✅ Retrieved ${data.data?.length || 0} invoices from MyCase`);
    return data.data || [];
  }

  async createInvoice(invoiceData: Partial<LegalInvoice>): Promise<LegalInvoice> {
    const response = await this.makeRequest('/api/v1/invoices', {
      method: 'POST',
      body: JSON.stringify(invoiceData)
    });

    const data = await response.json();
    console.log('✅ Created new invoice in MyCase');
    return data.data;
  }

  async getTasks(caseId?: string, filters?: any): Promise<LegalTask[]> {
    let url = '/api/v1/tasks';
    if (caseId) {
      url += `?case_id=${caseId}`;
    }

    const response = await this.makeRequest(url);
    const data = await response.json();
    console.log(`✅ Retrieved ${data.data?.length || 0} tasks from MyCase`);
    return data.data || [];
  }

  async createTask(taskData: Partial<LegalTask>): Promise<LegalTask> {
    const response = await this.makeRequest('/api/v1/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });

    const data = await response.json();
    console.log('✅ Created new task in MyCase');
    return data.data;
  }

  async getCalendarEvents(startDate?: string, endDate?: string): Promise<LegalCalendarEvent[]> {
    let url = '/api/v1/calendar_events';
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await this.makeRequest(url);
    const data = await response.json();
    console.log(`✅ Retrieved ${data.data?.length || 0} calendar events from MyCase`);
    return data.data || [];
  }

  async createCalendarEvent(eventData: Partial<LegalCalendarEvent>): Promise<LegalCalendarEvent> {
    const response = await this.makeRequest('/api/v1/calendar_events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });

    const data = await response.json();
    console.log('✅ Created new calendar event in MyCase');
    return data.data;
  }
}

/**
 * PracticePanther Integration Service
 */
export class TETRIXPracticePantherIntegration extends BaseLegalIntegration {
  constructor(config: LegalConfig) {
    super(config);
  }

  async initiateOAuthFlow(state: string): Promise<string> {
    const authUrl = new URL(`${this.config.baseUrl}/oauth/authorize`);
    authUrl.searchParams.set('client_id', this.config.clientId);
    authUrl.searchParams.set('redirect_uri', this.config.redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', this.config.scope.join(' '));
    authUrl.searchParams.set('state', state);

    console.log('🔗 Initiating PracticePanther OAuth flow...');
    return authUrl.toString();
  }

  async exchangeCodeForToken(code: string, state: string): Promise<LegalAuthResponse> {
    const tokenRequest = {
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: this.config.redirectUri,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret
    };

    const response = await fetch(`${this.config.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams(tokenRequest)
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    const tokenData = await response.json();
    
    this.accessToken = tokenData.access_token;
    this.refreshToken = tokenData.refresh_token;
    this.userId = tokenData.user_id;
    this.firmId = tokenData.firm_id;

    console.log('✅ PracticePanther OAuth token exchange successful');
    
    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      tokenType: tokenData.token_type,
      expiresIn: tokenData.expires_in,
      scope: tokenData.scope,
      userId: tokenData.user_id,
      firmId: tokenData.firm_id
    };
  }

  async refreshAccessToken(): Promise<LegalAuthResponse> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const refreshRequest = {
      grant_type: 'refresh_token',
      refresh_token: this.refreshToken,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret
    };

    const response = await fetch(`${this.config.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams(refreshRequest)
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }

    const tokenData = await response.json();
    
    this.accessToken = tokenData.access_token;
    if (tokenData.refresh_token) {
      this.refreshToken = tokenData.refresh_token;
    }

    console.log('✅ PracticePanther access token refreshed');
    
    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      tokenType: tokenData.token_type,
      expiresIn: tokenData.expires_in,
      scope: tokenData.scope,
      userId: this.userId!,
      firmId: this.firmId!
    };
  }

  // Implement PracticePanther-specific API methods
  async getCases(filters?: any): Promise<LegalCase[]> {
    const response = await this.makeRequest('/api/v1/matters');
    const data = await response.json();
    console.log(`✅ Retrieved ${data.data?.length || 0} cases from PracticePanther`);
    return data.data || [];
  }

  async getCase(caseId: string): Promise<LegalCase> {
    const response = await this.makeRequest(`/api/v1/matters/${caseId}`);
    const data = await response.json();
    console.log(`✅ Retrieved case ${caseId} from PracticePanther`);
    return data.data;
  }

  async createCase(caseData: Partial<LegalCase>): Promise<LegalCase> {
    const response = await this.makeRequest('/api/v1/matters', {
      method: 'POST',
      body: JSON.stringify(caseData)
    });

    const data = await response.json();
    console.log('✅ Created new case in PracticePanther');
    return data.data;
  }

  async updateCase(caseId: string, caseData: Partial<LegalCase>): Promise<LegalCase> {
    const response = await this.makeRequest(`/api/v1/matters/${caseId}`, {
      method: 'PUT',
      body: JSON.stringify(caseData)
    });

    const data = await response.json();
    console.log(`✅ Updated case ${caseId} in PracticePanther`);
    return data.data;
  }

  async getClients(filters?: any): Promise<LegalClient[]> {
    const response = await this.makeRequest('/api/v1/contacts');
    const data = await response.json();
    console.log(`✅ Retrieved ${data.data?.length || 0} clients from PracticePanther`);
    return data.data || [];
  }

  async getClient(clientId: string): Promise<LegalClient> {
    const response = await this.makeRequest(`/api/v1/contacts/${clientId}`);
    const data = await response.json();
    console.log(`✅ Retrieved client ${clientId} from PracticePanther`);
    return data.data;
  }

  async createClient(clientData: Partial<LegalClient>): Promise<LegalClient> {
    const response = await this.makeRequest('/api/v1/contacts', {
      method: 'POST',
      body: JSON.stringify(clientData)
    });

    const data = await response.json();
    console.log('✅ Created new client in PracticePanther');
    return data.data;
  }

  async updateClient(clientId: string, clientData: Partial<LegalClient>): Promise<LegalClient> {
    const response = await this.makeRequest(`/api/v1/contacts/${clientId}`, {
      method: 'PUT',
      body: JSON.stringify(clientData)
    });

    const data = await response.json();
    console.log(`✅ Updated client ${clientId} in PracticePanther`);
    return data.data;
  }

  async getTimeEntries(caseId?: string, filters?: any): Promise<LegalTimeEntry[]> {
    let url = '/api/v1/time_entries';
    if (caseId) {
      url += `?matter_id=${caseId}`;
    }

    const response = await this.makeRequest(url);
    const data = await response.json();
    console.log(`✅ Retrieved ${data.data?.length || 0} time entries from PracticePanther`);
    return data.data || [];
  }

  async createTimeEntry(timeEntryData: Partial<LegalTimeEntry>): Promise<LegalTimeEntry> {
    const response = await this.makeRequest('/api/v1/time_entries', {
      method: 'POST',
      body: JSON.stringify(timeEntryData)
    });

    const data = await response.json();
    console.log('✅ Created new time entry in PracticePanther');
    return data.data;
  }

  async getDocuments(caseId?: string, filters?: any): Promise<LegalDocument[]> {
    let url = '/api/v1/documents';
    if (caseId) {
      url += `?matter_id=${caseId}`;
    }

    const response = await this.makeRequest(url);
    const data = await response.json();
    console.log(`✅ Retrieved ${data.data?.length || 0} documents from PracticePanther`);
    return data.data || [];
  }

  async uploadDocument(caseId: string, file: File, metadata?: any): Promise<LegalDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('matter_id', caseId);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    const response = await this.makeRequest('/api/v1/documents', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    console.log('✅ Uploaded document to PracticePanther');
    return data.data;
  }

  async getInvoices(filters?: any): Promise<LegalInvoice[]> {
    const response = await this.makeRequest('/api/v1/invoices');
    const data = await response.json();
    console.log(`✅ Retrieved ${data.data?.length || 0} invoices from PracticePanther`);
    return data.data || [];
  }

  async createInvoice(invoiceData: Partial<LegalInvoice>): Promise<LegalInvoice> {
    const response = await this.makeRequest('/api/v1/invoices', {
      method: 'POST',
      body: JSON.stringify(invoiceData)
    });

    const data = await response.json();
    console.log('✅ Created new invoice in PracticePanther');
    return data.data;
  }

  async getTasks(caseId?: string, filters?: any): Promise<LegalTask[]> {
    let url = '/api/v1/tasks';
    if (caseId) {
      url += `?matter_id=${caseId}`;
    }

    const response = await this.makeRequest(url);
    const data = await response.json();
    console.log(`✅ Retrieved ${data.data?.length || 0} tasks from PracticePanther`);
    return data.data || [];
  }

  async createTask(taskData: Partial<LegalTask>): Promise<LegalTask> {
    const response = await this.makeRequest('/api/v1/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });

    const data = await response.json();
    console.log('✅ Created new task in PracticePanther');
    return data.data;
  }

  async getCalendarEvents(startDate?: string, endDate?: string): Promise<LegalCalendarEvent[]> {
    let url = '/api/v1/calendar_events';
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await this.makeRequest(url);
    const data = await response.json();
    console.log(`✅ Retrieved ${data.data?.length || 0} calendar events from PracticePanther`);
    return data.data || [];
  }

  async createCalendarEvent(eventData: Partial<LegalCalendarEvent>): Promise<LegalCalendarEvent> {
    const response = await this.makeRequest('/api/v1/calendar_events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });

    const data = await response.json();
    console.log('✅ Created new calendar event in PracticePanther');
    return data.data;
  }
}

/**
 * Legal Integration Factory
 */
export class LegalIntegrationFactory {
  /**
   * Create Clio integration
   * Uses environment variables for client ID and secret
   */
  static createClioIntegration(settings?: any): TETRIXClioIntegration {
    const baseUrl = process.env.WEBHOOK_BASE_URL || 'http://localhost:3001';
    
    const config: LegalConfig = {
      provider: 'clio',
      clientId: settings?.clientId || process.env.CLIO_CLIENT_ID || '',
      clientSecret: settings?.clientSecret || process.env.CLIO_CLIENT_SECRET || '',
      redirectUri: settings?.redirectUri || `${baseUrl}/api/oauth/callback`,
      baseUrl: 'https://app.clio.com',
      scope: [
        'read',
        'write',
        'user:read',
        'matters:read',
        'matters:write',
        'contacts:read',
        'contacts:write',
        'time_entries:read',
        'time_entries:write',
        'documents:read',
        'documents:write',
        'invoices:read',
        'invoices:write',
        'tasks:read',
        'tasks:write',
        'calendar_events:read',
        'calendar_events:write'
      ]
    };

    if (!config.clientId || !config.clientSecret) {
      throw new Error('Clio OAuth credentials not configured. Set CLIO_CLIENT_ID and CLIO_CLIENT_SECRET environment variables.');
    }

    return new TETRIXClioIntegration(config);
  }

  /**
   * Create MyCase integration
   */
  static createMyCaseIntegration(settings: any): TETRIXMyCaseIntegration {
    const config: LegalConfig = {
      provider: 'mycase',
      clientId: settings.clientId,
      clientSecret: settings.clientSecret,
      redirectUri: settings.redirectUri,
      baseUrl: 'https://api.mycase.com',
      scope: [
        'read',
        'write',
        'user:read',
        'cases:read',
        'cases:write',
        'clients:read',
        'clients:write',
        'time_entries:read',
        'time_entries:write',
        'documents:read',
        'documents:write',
        'invoices:read',
        'invoices:write',
        'tasks:read',
        'tasks:write',
        'calendar_events:read',
        'calendar_events:write'
      ]
    };

    return new TETRIXMyCaseIntegration(config);
  }

  /**
   * Create PracticePanther integration
   */
  static createPracticePantherIntegration(settings: any): TETRIXPracticePantherIntegration {
    const config: LegalConfig = {
      provider: 'practicepanther',
      clientId: settings.clientId,
      clientSecret: settings.clientSecret,
      redirectUri: settings.redirectUri,
      baseUrl: 'https://api.practicepanther.com',
      scope: [
        'read',
        'write',
        'user:read',
        'matters:read',
        'matters:write',
        'contacts:read',
        'contacts:write',
        'time_entries:read',
        'time_entries:write',
        'documents:read',
        'documents:write',
        'invoices:read',
        'invoices:write',
        'tasks:read',
        'tasks:write',
        'calendar_events:read',
        'calendar_events:write'
      ]
    };

    return new TETRIXPracticePantherIntegration(config);
  }
}
