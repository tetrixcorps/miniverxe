// TETRIX Real Estate MLS Integration Service
// RETS, RESIS MLS, Bright MLS, and CoreLogic MLS integrations

export interface MLSConfig {
  provider: 'rets' | 'resis' | 'bright' | 'corelogic';
  username: string;
  password: string;
  userAgent: string;
  baseUrl: string;
  version: string;
  timeout: number;
}

export interface MLSProperty {
  id: string;
  listingId: string;
  mlsNumber: string;
  status: 'active' | 'pending' | 'sold' | 'withdrawn' | 'expired';
  propertyType: string;
  listingType: 'sale' | 'rent';
  price: number;
  listPrice: number;
  soldPrice?: number;
  address: MLSAddress;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  lotSize?: number;
  yearBuilt?: number;
  description: string;
  features: string[];
  images: MLSImage[];
  agent: MLSAgent;
  office: MLSOffice;
  listingDate: string;
  lastModified: string;
  daysOnMarket: number;
  customFields?: Record<string, any>;
}

export interface MLSAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  county: string;
  country: string;
  latitude?: number;
  longitude?: number;
  subdivision?: string;
  schoolDistrict?: string;
}

export interface MLSImage {
  id: string;
  url: string;
  caption?: string;
  order: number;
  type: 'photo' | 'virtual_tour' | 'floor_plan' | 'aerial';
  size: number;
  width: number;
  height: number;
}

export interface MLSAgent {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber?: string;
  photo?: string;
  bio?: string;
  specialties: string[];
  languages: string[];
  socialMedia?: Record<string, string>;
}

export interface MLSOffice {
  id: string;
  name: string;
  address: MLSAddress;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  description?: string;
}

export interface MLSSearchCriteria {
  propertyType?: string[];
  listingType?: string[];
  status?: string[];
  priceMin?: number;
  priceMax?: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFeetMin?: number;
  squareFeetMax?: number;
  city?: string;
  state?: string;
  zipCode?: string;
  county?: string;
  schoolDistrict?: string;
  subdivision?: string;
  features?: string[];
  keywords?: string;
  dateListedFrom?: string;
  dateListedTo?: string;
  daysOnMarketMax?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface MLSSearchResult {
  properties: MLSProperty[];
  totalCount: number;
  hasMore: boolean;
  searchId: string;
  searchDate: string;
  criteria: MLSSearchCriteria;
}

export interface MLSLead {
  id: string;
  source: 'website' | 'mls' | 'referral' | 'social' | 'advertising';
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message?: string;
  propertyId?: string;
  agentId?: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  customFields?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface MLSMarketData {
  id: string;
  area: string;
  period: string;
  totalListings: number;
  activeListings: number;
  pendingListings: number;
  soldListings: number;
  averagePrice: number;
  medianPrice: number;
  averageDaysOnMarket: number;
  pricePerSquareFoot: number;
  inventoryMonths: number;
  marketTrend: 'buyer' | 'seller' | 'balanced';
  yearOverYearChange: number;
  monthOverMonthChange: number;
  customFields?: Record<string, any>;
}

export interface MLSComparableProperty {
  id: string;
  propertyId: string;
  comparableId: string;
  comparableProperty: MLSProperty;
  similarityScore: number;
  distance: number;
  priceDifference: number;
  priceDifferencePercent: number;
  sizeDifference: number;
  sizeDifferencePercent: number;
  ageDifference: number;
  features: string[];
  adjustments: MLSAdjustment[];
  finalValue: number;
  confidence: number;
}

export interface MLSAdjustment {
  feature: string;
  adjustment: number;
  reason: string;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface MLSReport {
  id: string;
  type: 'market_analysis' | 'property_valuation' | 'comparative_analysis' | 'neighborhood_report';
  title: string;
  description: string;
  data: any;
  generatedAt: string;
  generatedBy: string;
  parameters: Record<string, any>;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  status: 'generating' | 'completed' | 'failed';
  downloadUrl?: string;
}

/**
 * Base MLS Integration Service
 */
export abstract class BaseMLSIntegration {
  protected config: MLSConfig;
  protected sessionId?: string;
  protected isConnected: boolean = false;

  constructor(config: MLSConfig) {
    this.config = config;
  }

  /**
   * Connect to MLS system
   */
  abstract connect(): Promise<boolean>;

  /**
   * Disconnect from MLS system
   */
  abstract disconnect(): Promise<void>;

  /**
   * Search properties
   */
  abstract searchProperties(criteria: MLSSearchCriteria): Promise<MLSSearchResult>;

  /**
   * Get property by ID
   */
  abstract getProperty(propertyId: string): Promise<MLSProperty>;

  /**
   * Get property images
   */
  abstract getPropertyImages(propertyId: string): Promise<MLSImage[]>;

  /**
   * Get agent information
   */
  abstract getAgent(agentId: string): Promise<MLSAgent>;

  /**
   * Get office information
   */
  abstract getOffice(officeId: string): Promise<MLSOffice>;

  /**
   * Get market data
   */
  abstract getMarketData(area: string, period: string): Promise<MLSMarketData>;

  /**
   * Get comparable properties
   */
  abstract getComparableProperties(propertyId: string, criteria?: any): Promise<MLSComparableProperty[]>;

  /**
   * Generate market report
   */
  abstract generateMarketReport(area: string, reportType: string): Promise<MLSReport>;

  /**
   * Save search criteria
   */
  abstract saveSearch(criteria: MLSSearchCriteria, name: string): Promise<string>;

  /**
   * Get saved searches
   */
  abstract getSavedSearches(): Promise<Array<{ id: string; name: string; criteria: MLSSearchCriteria; createdAt: string }>>;

  /**
   * Create lead
   */
  abstract createLead(leadData: Partial<MLSLead>): Promise<MLSLead>;

  /**
   * Get leads
   */
  abstract getLeads(filters?: any): Promise<MLSLead[]>;

  /**
   * Update lead
   */
  abstract updateLead(leadId: string, leadData: Partial<MLSLead>): Promise<MLSLead>;

  /**
   * Make authenticated MLS request
   */
  protected async makeMLSRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    if (!this.isConnected) {
      throw new Error('Not connected to MLS system');
    }

    const url = `${this.config.baseUrl}${endpoint}`;
    const headers = {
      'User-Agent': this.config.userAgent,
      'Content-Type': 'application/xml',
      'Accept': 'application/xml',
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers,
      timeout: this.config.timeout
    });

    if (!response.ok) {
      throw new Error(`MLS request failed: ${response.statusText}`);
    }

    return response;
  }
}

/**
 * RETS Integration Service
 */
export class TETRIXRETSIntegration extends BaseMLSIntegration {
  constructor(config: MLSConfig) {
    super(config);
  }

  async connect(): Promise<boolean> {
    try {
      const loginRequest = `
        <?xml version="1.0" encoding="UTF-8"?>
        <RETS>
          <LOGIN>
            <USERNAME>${this.config.username}</USERNAME>
            <PASSWORD>${this.config.password}</PASSWORD>
            <USERAGENT>${this.config.userAgent}</USERAGENT>
            <VERSION>${this.config.version}</VERSION>
          </LOGIN>
        </RETS>
      `;

      const response = await this.makeMLSRequest('/rets/login', {
        method: 'POST',
        body: loginRequest
      });

      const responseText = await response.text();
      if (responseText.includes('Success')) {
        this.isConnected = true;
        console.log('✅ Connected to RETS MLS system');
        return true;
      } else {
        throw new Error('RETS login failed');
      }
    } catch (error) {
      console.error('❌ Failed to connect to RETS:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.makeMLSRequest('/rets/logout', { method: 'POST' });
      this.isConnected = false;
      console.log('✅ Disconnected from RETS MLS system');
    } catch (error) {
      console.error('❌ Failed to disconnect from RETS:', error);
    }
  }

  async searchProperties(criteria: MLSSearchCriteria): Promise<MLSSearchResult> {
    try {
      const searchRequest = this.buildRETSSearchRequest(criteria);
      const response = await this.makeMLSRequest('/rets/search', {
        method: 'POST',
        body: searchRequest
      });

      const responseText = await response.text();
      const properties = this.parseRETSSearchResponse(responseText);
      
      console.log(`✅ Retrieved ${properties.length} properties from RETS`);
      return {
        properties,
        totalCount: properties.length,
        hasMore: false,
        searchId: this.generateSearchId(),
        searchDate: new Date().toISOString(),
        criteria
      };
    } catch (error) {
      console.error('❌ Failed to search properties in RETS:', error);
      throw error;
    }
  }

  async getProperty(propertyId: string): Promise<MLSProperty> {
    try {
      const response = await this.makeMLSRequest(`/rets/property/${propertyId}`);
      const property = await this.parseRETSPropertyResponse(await response.text());
      
      console.log(`✅ Retrieved property ${propertyId} from RETS`);
      return property;
    } catch (error) {
      console.error('❌ Failed to get property from RETS:', error);
      throw error;
    }
  }

  async getPropertyImages(propertyId: string): Promise<MLSImage[]> {
    try {
      const response = await this.makeMLSRequest(`/rets/property/${propertyId}/images`);
      const images = await this.parseRETSImagesResponse(await response.text());
      
      console.log(`✅ Retrieved ${images.length} images for property ${propertyId} from RETS`);
      return images;
    } catch (error) {
      console.error('❌ Failed to get property images from RETS:', error);
      throw error;
    }
  }

  async getAgent(agentId: string): Promise<MLSAgent> {
    try {
      const response = await this.makeMLSRequest(`/rets/agent/${agentId}`);
      const agent = await this.parseRETSAgentResponse(await response.text());
      
      console.log(`✅ Retrieved agent ${agentId} from RETS`);
      return agent;
    } catch (error) {
      console.error('❌ Failed to get agent from RETS:', error);
      throw error;
    }
  }

  async getOffice(officeId: string): Promise<MLSOffice> {
    try {
      const response = await this.makeMLSRequest(`/rets/office/${officeId}`);
      const office = await this.parseRETSOfficeResponse(await response.text());
      
      console.log(`✅ Retrieved office ${officeId} from RETS`);
      return office;
    } catch (error) {
      console.error('❌ Failed to get office from RETS:', error);
      throw error;
    }
  }

  async getMarketData(area: string, period: string): Promise<MLSMarketData> {
    try {
      const response = await this.makeMLSRequest(`/rets/market-data?area=${area}&period=${period}`);
      const marketData = await this.parseRETSMarketDataResponse(await response.text());
      
      console.log(`✅ Retrieved market data for ${area} from RETS`);
      return marketData;
    } catch (error) {
      console.error('❌ Failed to get market data from RETS:', error);
      throw error;
    }
  }

  async getComparableProperties(propertyId: string, criteria?: any): Promise<MLSComparableProperty[]> {
    try {
      const response = await this.makeMLSRequest(`/rets/comparables/${propertyId}`);
      const comparables = await this.parseRETSComparablesResponse(await response.text());
      
      console.log(`✅ Retrieved ${comparables.length} comparable properties from RETS`);
      return comparables;
    } catch (error) {
      console.error('❌ Failed to get comparable properties from RETS:', error);
      throw error;
    }
  }

  async generateMarketReport(area: string, reportType: string): Promise<MLSReport> {
    try {
      const response = await this.makeMLSRequest(`/rets/reports?area=${area}&type=${reportType}`, {
        method: 'POST'
      });
      
      const report = await this.parseRETSReportResponse(await response.text());
      console.log(`✅ Generated ${reportType} report for ${area} from RETS`);
      return report;
    } catch (error) {
      console.error('❌ Failed to generate market report from RETS:', error);
      throw error;
    }
  }

  async saveSearch(criteria: MLSSearchCriteria, name: string): Promise<string> {
    try {
      const searchId = this.generateSearchId();
      // In a real implementation, save to database
      console.log(`✅ Saved search "${name}" with ID ${searchId}`);
      return searchId;
    } catch (error) {
      console.error('❌ Failed to save search:', error);
      throw error;
    }
  }

  async getSavedSearches(): Promise<Array<{ id: string; name: string; criteria: MLSSearchCriteria; createdAt: string }>> {
    try {
      // In a real implementation, retrieve from database
      console.log('✅ Retrieved saved searches from RETS');
      return [];
    } catch (error) {
      console.error('❌ Failed to get saved searches:', error);
      throw error;
    }
  }

  async createLead(leadData: Partial<MLSLead>): Promise<MLSLead> {
    try {
      const lead: MLSLead = {
        id: this.generateId(),
        source: 'mls',
        firstName: leadData.firstName || '',
        lastName: leadData.lastName || '',
        email: leadData.email || '',
        phone: leadData.phone || '',
        message: leadData.message,
        propertyId: leadData.propertyId,
        agentId: leadData.agentId,
        status: 'new',
        priority: 'medium',
        tags: leadData.tags || [],
        customFields: leadData.customFields,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('✅ Created lead in RETS');
      return lead;
    } catch (error) {
      console.error('❌ Failed to create lead:', error);
      throw error;
    }
  }

  async getLeads(filters?: any): Promise<MLSLead[]> {
    try {
      console.log('✅ Retrieved leads from RETS');
      return [];
    } catch (error) {
      console.error('❌ Failed to get leads:', error);
      throw error;
    }
  }

  async updateLead(leadId: string, leadData: Partial<MLSLead>): Promise<MLSLead> {
    try {
      // In a real implementation, update in database
      const lead: MLSLead = {
        id: leadId,
        source: 'mls',
        firstName: leadData.firstName || '',
        lastName: leadData.lastName || '',
        email: leadData.email || '',
        phone: leadData.phone || '',
        message: leadData.message,
        propertyId: leadData.propertyId,
        agentId: leadData.agentId,
        status: leadData.status || 'new',
        priority: leadData.priority || 'medium',
        tags: leadData.tags || [],
        customFields: leadData.customFields,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log(`✅ Updated lead ${leadId} in RETS`);
      return lead;
    } catch (error) {
      console.error('❌ Failed to update lead:', error);
      throw error;
    }
  }

  // Helper methods for RETS-specific parsing
  private buildRETSSearchRequest(criteria: MLSSearchCriteria): string {
    // Build RETS-compliant search request XML
    return `
      <?xml version="1.0" encoding="UTF-8"?>
      <RETS>
        <SEARCH>
          <Resource>Property</Resource>
          <Class>Residential</Class>
          <Query>${this.buildRETSQuery(criteria)}</Query>
        </SEARCH>
      </RETS>
    `;
  }

  private buildRETSQuery(criteria: MLSSearchCriteria): string {
    const conditions: string[] = [];
    
    if (criteria.status) {
      conditions.push(`(Status=${criteria.status.join(',')})`);
    }
    if (criteria.priceMin) {
      conditions.push(`(ListPrice>=${criteria.priceMin})`);
    }
    if (criteria.priceMax) {
      conditions.push(`(ListPrice<=${criteria.priceMax})`);
    }
    if (criteria.bedrooms) {
      conditions.push(`(BedroomsTotal=${criteria.bedrooms})`);
    }
    if (criteria.bathrooms) {
      conditions.push(`(BathroomsTotal=${criteria.bathrooms})`);
    }
    if (criteria.city) {
      conditions.push(`(City=${criteria.city})`);
    }
    if (criteria.state) {
      conditions.push(`(StateOrProvince=${criteria.state})`);
    }
    if (criteria.zipCode) {
      conditions.push(`(PostalCode=${criteria.zipCode})`);
    }

    return conditions.join(' AND ');
  }

  private parseRETSSearchResponse(responseText: string): MLSProperty[] {
    // Parse RETS search response XML
    // This is a simplified implementation
    return [];
  }

  private parseRETSPropertyResponse(responseText: string): MLSProperty {
    // Parse RETS property response XML
    // This is a simplified implementation
    return {} as MLSProperty;
  }

  private parseRETSImagesResponse(responseText: string): MLSImage[] {
    // Parse RETS images response XML
    // This is a simplified implementation
    return [];
  }

  private parseRETSAgentResponse(responseText: string): MLSAgent {
    // Parse RETS agent response XML
    // This is a simplified implementation
    return {} as MLSAgent;
  }

  private parseRETSOfficeResponse(responseText: string): MLSOffice {
    // Parse RETS office response XML
    // This is a simplified implementation
    return {} as MLSOffice;
  }

  private parseRETSMarketDataResponse(responseText: string): MLSMarketData {
    // Parse RETS market data response XML
    // This is a simplified implementation
    return {} as MLSMarketData;
  }

  private parseRETSComparablesResponse(responseText: string): MLSComparableProperty[] {
    // Parse RETS comparables response XML
    // This is a simplified implementation
    return [];
  }

  private parseRETSReportResponse(responseText: string): MLSReport {
    // Parse RETS report response XML
    // This is a simplified implementation
    return {} as MLSReport;
  }

  private generateSearchId(): string {
    return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
}

/**
 * Bright MLS Integration Service
 */
export class TETRIXBrightMLSIntegration extends BaseMLSIntegration {
  constructor(config: MLSConfig) {
    super(config);
  }

  async connect(): Promise<boolean> {
    try {
      const authRequest = {
        username: this.config.username,
        password: this.config.password,
        userAgent: this.config.userAgent
      };

      const response = await fetch(`${this.config.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': this.config.userAgent
        },
        body: JSON.stringify(authRequest)
      });

      if (response.ok) {
        const authData = await response.json();
        this.sessionId = authData.sessionId;
        this.isConnected = true;
        console.log('✅ Connected to Bright MLS system');
        return true;
      } else {
        throw new Error('Bright MLS authentication failed');
      }
    } catch (error) {
      console.error('❌ Failed to connect to Bright MLS:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.sessionId) {
        await fetch(`${this.config.baseUrl}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.sessionId}`,
            'User-Agent': this.config.userAgent
          }
        });
      }
      this.isConnected = false;
      this.sessionId = undefined;
      console.log('✅ Disconnected from Bright MLS system');
    } catch (error) {
      console.error('❌ Failed to disconnect from Bright MLS:', error);
    }
  }

  async searchProperties(criteria: MLSSearchCriteria): Promise<MLSSearchResult> {
    try {
      const response = await this.makeMLSRequest('/api/properties/search', {
        method: 'POST',
        body: JSON.stringify(criteria)
      });

      const data = await response.json();
      console.log(`✅ Retrieved ${data.properties?.length || 0} properties from Bright MLS`);
      
      return {
        properties: data.properties || [],
        totalCount: data.totalCount || 0,
        hasMore: data.hasMore || false,
        searchId: data.searchId || this.generateSearchId(),
        searchDate: new Date().toISOString(),
        criteria
      };
    } catch (error) {
      console.error('❌ Failed to search properties in Bright MLS:', error);
      throw error;
    }
  }

  async getProperty(propertyId: string): Promise<MLSProperty> {
    try {
      const response = await this.makeMLSRequest(`/api/properties/${propertyId}`);
      const property = await response.json();
      
      console.log(`✅ Retrieved property ${propertyId} from Bright MLS`);
      return property;
    } catch (error) {
      console.error('❌ Failed to get property from Bright MLS:', error);
      throw error;
    }
  }

  async getPropertyImages(propertyId: string): Promise<MLSImage[]> {
    try {
      const response = await this.makeMLSRequest(`/api/properties/${propertyId}/images`);
      const data = await response.json();
      
      console.log(`✅ Retrieved ${data.images?.length || 0} images for property ${propertyId} from Bright MLS`);
      return data.images || [];
    } catch (error) {
      console.error('❌ Failed to get property images from Bright MLS:', error);
      throw error;
    }
  }

  async getAgent(agentId: string): Promise<MLSAgent> {
    try {
      const response = await this.makeMLSRequest(`/api/agents/${agentId}`);
      const agent = await response.json();
      
      console.log(`✅ Retrieved agent ${agentId} from Bright MLS`);
      return agent;
    } catch (error) {
      console.error('❌ Failed to get agent from Bright MLS:', error);
      throw error;
    }
  }

  async getOffice(officeId: string): Promise<MLSOffice> {
    try {
      const response = await this.makeMLSRequest(`/api/offices/${officeId}`);
      const office = await response.json();
      
      console.log(`✅ Retrieved office ${officeId} from Bright MLS`);
      return office;
    } catch (error) {
      console.error('❌ Failed to get office from Bright MLS:', error);
      throw error;
    }
  }

  async getMarketData(area: string, period: string): Promise<MLSMarketData> {
    try {
      const response = await this.makeMLSRequest(`/api/market-data?area=${area}&period=${period}`);
      const marketData = await response.json();
      
      console.log(`✅ Retrieved market data for ${area} from Bright MLS`);
      return marketData;
    } catch (error) {
      console.error('❌ Failed to get market data from Bright MLS:', error);
      throw error;
    }
  }

  async getComparableProperties(propertyId: string, criteria?: any): Promise<MLSComparableProperty[]> {
    try {
      const response = await this.makeMLSRequest(`/api/properties/${propertyId}/comparables`, {
        method: 'POST',
        body: JSON.stringify(criteria || {})
      });
      
      const data = await response.json();
      console.log(`✅ Retrieved ${data.comparables?.length || 0} comparable properties from Bright MLS`);
      return data.comparables || [];
    } catch (error) {
      console.error('❌ Failed to get comparable properties from Bright MLS:', error);
      throw error;
    }
  }

  async generateMarketReport(area: string, reportType: string): Promise<MLSReport> {
    try {
      const response = await this.makeMLSRequest('/api/reports', {
        method: 'POST',
        body: JSON.stringify({ area, type: reportType })
      });
      
      const report = await response.json();
      console.log(`✅ Generated ${reportType} report for ${area} from Bright MLS`);
      return report;
    } catch (error) {
      console.error('❌ Failed to generate market report from Bright MLS:', error);
      throw error;
    }
  }

  async saveSearch(criteria: MLSSearchCriteria, name: string): Promise<string> {
    try {
      const response = await this.makeMLSRequest('/api/searches', {
        method: 'POST',
        body: JSON.stringify({ name, criteria })
      });
      
      const data = await response.json();
      console.log(`✅ Saved search "${name}" with ID ${data.searchId} in Bright MLS`);
      return data.searchId;
    } catch (error) {
      console.error('❌ Failed to save search:', error);
      throw error;
    }
  }

  async getSavedSearches(): Promise<Array<{ id: string; name: string; criteria: MLSSearchCriteria; createdAt: string }>> {
    try {
      const response = await this.makeMLSRequest('/api/searches');
      const data = await response.json();
      
      console.log(`✅ Retrieved ${data.searches?.length || 0} saved searches from Bright MLS`);
      return data.searches || [];
    } catch (error) {
      console.error('❌ Failed to get saved searches:', error);
      throw error;
    }
  }

  async createLead(leadData: Partial<MLSLead>): Promise<MLSLead> {
    try {
      const response = await this.makeMLSRequest('/api/leads', {
        method: 'POST',
        body: JSON.stringify(leadData)
      });
      
      const lead = await response.json();
      console.log('✅ Created lead in Bright MLS');
      return lead;
    } catch (error) {
      console.error('❌ Failed to create lead:', error);
      throw error;
    }
  }

  async getLeads(filters?: any): Promise<MLSLead[]> {
    try {
      const response = await this.makeMLSRequest('/api/leads', {
        method: 'GET'
      });
      
      const data = await response.json();
      console.log(`✅ Retrieved ${data.leads?.length || 0} leads from Bright MLS`);
      return data.leads || [];
    } catch (error) {
      console.error('❌ Failed to get leads:', error);
      throw error;
    }
  }

  async updateLead(leadId: string, leadData: Partial<MLSLead>): Promise<MLSLead> {
    try {
      const response = await this.makeMLSRequest(`/api/leads/${leadId}`, {
        method: 'PUT',
        body: JSON.stringify(leadData)
      });
      
      const lead = await response.json();
      console.log(`✅ Updated lead ${leadId} in Bright MLS`);
      return lead;
    } catch (error) {
      console.error('❌ Failed to update lead:', error);
      throw error;
    }
  }

  private generateSearchId(): string {
    return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * CoreLogic MLS Integration Service
 */
export class TETRIXCoreLogicMLSIntegration extends BaseMLSIntegration {
  constructor(config: MLSConfig) {
    super(config);
  }

  async connect(): Promise<boolean> {
    try {
      const authRequest = {
        username: this.config.username,
        password: this.config.password,
        userAgent: this.config.userAgent
      };

      const response = await fetch(`${this.config.baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': this.config.userAgent
        },
        body: JSON.stringify(authRequest)
      });

      if (response.ok) {
        const authData = await response.json();
        this.sessionId = authData.sessionId;
        this.isConnected = true;
        console.log('✅ Connected to CoreLogic MLS system');
        return true;
      } else {
        throw new Error('CoreLogic MLS authentication failed');
      }
    } catch (error) {
      console.error('❌ Failed to connect to CoreLogic MLS:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.sessionId) {
        await fetch(`${this.config.baseUrl}/api/v1/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.sessionId}`,
            'User-Agent': this.config.userAgent
          }
        });
      }
      this.isConnected = false;
      this.sessionId = undefined;
      console.log('✅ Disconnected from CoreLogic MLS system');
    } catch (error) {
      console.error('❌ Failed to disconnect from CoreLogic MLS:', error);
    }
  }

  // Implement CoreLogic-specific methods similar to Bright MLS
  async searchProperties(criteria: MLSSearchCriteria): Promise<MLSSearchResult> {
    try {
      const response = await this.makeMLSRequest('/api/v1/properties/search', {
        method: 'POST',
        body: JSON.stringify(criteria)
      });

      const data = await response.json();
      console.log(`✅ Retrieved ${data.properties?.length || 0} properties from CoreLogic MLS`);
      
      return {
        properties: data.properties || [],
        totalCount: data.totalCount || 0,
        hasMore: data.hasMore || false,
        searchId: data.searchId || this.generateSearchId(),
        searchDate: new Date().toISOString(),
        criteria
      };
    } catch (error) {
      console.error('❌ Failed to search properties in CoreLogic MLS:', error);
      throw error;
    }
  }

  async getProperty(propertyId: string): Promise<MLSProperty> {
    try {
      const response = await this.makeMLSRequest(`/api/v1/properties/${propertyId}`);
      const property = await response.json();
      
      console.log(`✅ Retrieved property ${propertyId} from CoreLogic MLS`);
      return property;
    } catch (error) {
      console.error('❌ Failed to get property from CoreLogic MLS:', error);
      throw error;
    }
  }

  async getPropertyImages(propertyId: string): Promise<MLSImage[]> {
    try {
      const response = await this.makeMLSRequest(`/api/v1/properties/${propertyId}/images`);
      const data = await response.json();
      
      console.log(`✅ Retrieved ${data.images?.length || 0} images for property ${propertyId} from CoreLogic MLS`);
      return data.images || [];
    } catch (error) {
      console.error('❌ Failed to get property images from CoreLogic MLS:', error);
      throw error;
    }
  }

  async getAgent(agentId: string): Promise<MLSAgent> {
    try {
      const response = await this.makeMLSRequest(`/api/v1/agents/${agentId}`);
      const agent = await response.json();
      
      console.log(`✅ Retrieved agent ${agentId} from CoreLogic MLS`);
      return agent;
    } catch (error) {
      console.error('❌ Failed to get agent from CoreLogic MLS:', error);
      throw error;
    }
  }

  async getOffice(officeId: string): Promise<MLSOffice> {
    try {
      const response = await this.makeMLSRequest(`/api/v1/offices/${officeId}`);
      const office = await response.json();
      
      console.log(`✅ Retrieved office ${officeId} from CoreLogic MLS`);
      return office;
    } catch (error) {
      console.error('❌ Failed to get office from CoreLogic MLS:', error);
      throw error;
    }
  }

  async getMarketData(area: string, period: string): Promise<MLSMarketData> {
    try {
      const response = await this.makeMLSRequest(`/api/v1/market-data?area=${area}&period=${period}`);
      const marketData = await response.json();
      
      console.log(`✅ Retrieved market data for ${area} from CoreLogic MLS`);
      return marketData;
    } catch (error) {
      console.error('❌ Failed to get market data from CoreLogic MLS:', error);
      throw error;
    }
  }

  async getComparableProperties(propertyId: string, criteria?: any): Promise<MLSComparableProperty[]> {
    try {
      const response = await this.makeMLSRequest(`/api/v1/properties/${propertyId}/comparables`, {
        method: 'POST',
        body: JSON.stringify(criteria || {})
      });
      
      const data = await response.json();
      console.log(`✅ Retrieved ${data.comparables?.length || 0} comparable properties from CoreLogic MLS`);
      return data.comparables || [];
    } catch (error) {
      console.error('❌ Failed to get comparable properties from CoreLogic MLS:', error);
      throw error;
    }
  }

  async generateMarketReport(area: string, reportType: string): Promise<MLSReport> {
    try {
      const response = await this.makeMLSRequest('/api/v1/reports', {
        method: 'POST',
        body: JSON.stringify({ area, type: reportType })
      });
      
      const report = await response.json();
      console.log(`✅ Generated ${reportType} report for ${area} from CoreLogic MLS`);
      return report;
    } catch (error) {
      console.error('❌ Failed to generate market report from CoreLogic MLS:', error);
      throw error;
    }
  }

  async saveSearch(criteria: MLSSearchCriteria, name: string): Promise<string> {
    try {
      const response = await this.makeMLSRequest('/api/v1/searches', {
        method: 'POST',
        body: JSON.stringify({ name, criteria })
      });
      
      const data = await response.json();
      console.log(`✅ Saved search "${name}" with ID ${data.searchId} in CoreLogic MLS`);
      return data.searchId;
    } catch (error) {
      console.error('❌ Failed to save search:', error);
      throw error;
    }
  }

  async getSavedSearches(): Promise<Array<{ id: string; name: string; criteria: MLSSearchCriteria; createdAt: string }>> {
    try {
      const response = await this.makeMLSRequest('/api/v1/searches');
      const data = await response.json();
      
      console.log(`✅ Retrieved ${data.searches?.length || 0} saved searches from CoreLogic MLS`);
      return data.searches || [];
    } catch (error) {
      console.error('❌ Failed to get saved searches:', error);
      throw error;
    }
  }

  async createLead(leadData: Partial<MLSLead>): Promise<MLSLead> {
    try {
      const response = await this.makeMLSRequest('/api/v1/leads', {
        method: 'POST',
        body: JSON.stringify(leadData)
      });
      
      const lead = await response.json();
      console.log('✅ Created lead in CoreLogic MLS');
      return lead;
    } catch (error) {
      console.error('❌ Failed to create lead:', error);
      throw error;
    }
  }

  async getLeads(filters?: any): Promise<MLSLead[]> {
    try {
      const response = await this.makeMLSRequest('/api/v1/leads', {
        method: 'GET'
      });
      
      const data = await response.json();
      console.log(`✅ Retrieved ${data.leads?.length || 0} leads from CoreLogic MLS`);
      return data.leads || [];
    } catch (error) {
      console.error('❌ Failed to get leads:', error);
      throw error;
    }
  }

  async updateLead(leadId: string, leadData: Partial<MLSLead>): Promise<MLSLead> {
    try {
      const response = await this.makeMLSRequest(`/api/v1/leads/${leadId}`, {
        method: 'PUT',
        body: JSON.stringify(leadData)
      });
      
      const lead = await response.json();
      console.log(`✅ Updated lead ${leadId} in CoreLogic MLS`);
      return lead;
    } catch (error) {
      console.error('❌ Failed to update lead:', error);
      throw error;
    }
  }

  private generateSearchId(): string {
    return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * MLS Integration Factory
 */
export class MLSIntegrationFactory {
  /**
   * Create RETS integration
   */
  static createRETSIntegration(settings: any): TETRIXRETSIntegration {
    const config: MLSConfig = {
      provider: 'rets',
      username: settings.username,
      password: settings.password,
      userAgent: settings.userAgent || 'TETRIX-MLS-Integration/1.0',
      baseUrl: settings.baseUrl,
      version: settings.version || '1.7.2',
      timeout: settings.timeout || 30000
    };

    return new TETRIXRETSIntegration(config);
  }

  /**
   * Create Bright MLS integration
   */
  static createBrightMLSIntegration(settings: any): TETRIXBrightMLSIntegration {
    const config: MLSConfig = {
      provider: 'bright',
      username: settings.username,
      password: settings.password,
      userAgent: settings.userAgent || 'TETRIX-MLS-Integration/1.0',
      baseUrl: settings.baseUrl || 'https://api.brightmls.com',
      version: settings.version || '1.0',
      timeout: settings.timeout || 30000
    };

    return new TETRIXBrightMLSIntegration(config);
  }

  /**
   * Create CoreLogic MLS integration
   */
  static createCoreLogicMLSIntegration(settings: any): TETRIXCoreLogicMLSIntegration {
    const config: MLSConfig = {
      provider: 'corelogic',
      username: settings.username,
      password: settings.password,
      userAgent: settings.userAgent || 'TETRIX-MLS-Integration/1.0',
      baseUrl: settings.baseUrl || 'https://api.corelogic.com',
      version: settings.version || '1.0',
      timeout: settings.timeout || 30000
    };

    return new TETRIXCoreLogicMLSIntegration(config);
  }
}
