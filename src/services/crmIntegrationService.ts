/**
 * CRM Integration Service
 * Handles integrations with various CRM systems across different industries
 */

export interface CRMConfig {
  provider: string;
  apiKey: string;
  baseUrl: string;
  industry: string;
  features: string[];
}

export interface ContactData {
  id: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  industry: string;
  role: string;
  lastContact: Date;
  status: 'active' | 'inactive' | 'prospect';
  tags: string[];
  customFields: Record<string, any>;
}

export interface CRMIntegration {
  name: string;
  industry: string;
  features: string[];
  apiEndpoint: string;
  authentication: 'api_key' | 'oauth' | 'basic';
  supportedOperations: string[];
}

// Industry-specific CRM integrations
export const CRM_INTEGRATIONS: Record<string, CRMIntegration[]> = {
  healthcare: [
    {
      name: 'Epic MyChart',
      industry: 'healthcare',
      features: ['patient_management', 'appointment_scheduling', 'ehr_integration'],
      apiEndpoint: 'https://api.epic.com/mychart',
      authentication: 'oauth',
      supportedOperations: ['create_patient', 'schedule_appointment', 'update_medical_record']
    },
    {
      name: 'Cerner PowerChart',
      industry: 'healthcare',
      features: ['patient_management', 'clinical_workflow', 'ehr_integration'],
      apiEndpoint: 'https://api.cerner.com/powerchart',
      authentication: 'oauth',
      supportedOperations: ['create_patient', 'update_clinical_data', 'schedule_appointment']
    },
    {
      name: 'Allscripts',
      industry: 'healthcare',
      features: ['patient_management', 'billing_integration', 'ehr_integration'],
      apiEndpoint: 'https://api.allscripts.com',
      authentication: 'api_key',
      supportedOperations: ['create_patient', 'update_billing', 'schedule_appointment']
    }
  ],
  legal: [
    {
      name: 'Clio',
      industry: 'legal',
      features: ['case_management', 'time_tracking', 'billing'],
      apiEndpoint: 'https://api.clio.com',
      authentication: 'oauth',
      supportedOperations: ['create_case', 'track_time', 'generate_bill']
    },
    {
      name: 'MyCase',
      industry: 'legal',
      features: ['case_management', 'client_communication', 'document_management'],
      apiEndpoint: 'https://api.mycase.com',
      authentication: 'oauth',
      supportedOperations: ['create_case', 'send_communication', 'upload_document']
    },
    {
      name: 'PracticePanther',
      industry: 'legal',
      features: ['case_management', 'client_portal', 'billing'],
      apiEndpoint: 'https://api.practicepanther.com',
      authentication: 'api_key',
      supportedOperations: ['create_case', 'update_client', 'generate_invoice']
    }
  ],
  real_estate: [
    {
      name: 'MLS Integration',
      industry: 'real_estate',
      features: ['property_listings', 'market_data', 'agent_management'],
      apiEndpoint: 'https://api.mls.com',
      authentication: 'api_key',
      supportedOperations: ['search_properties', 'create_listing', 'update_agent']
    },
    {
      name: 'Zillow Premier Agent',
      industry: 'real_estate',
      features: ['lead_management', 'market_analytics', 'agent_tools'],
      apiEndpoint: 'https://api.zillow.com/premier',
      authentication: 'oauth',
      supportedOperations: ['manage_leads', 'get_market_data', 'update_profile']
    },
    {
      name: 'Realtor.com',
      industry: 'real_estate',
      features: ['property_listings', 'agent_network', 'market_insights'],
      apiEndpoint: 'https://api.realtor.com',
      authentication: 'api_key',
      supportedOperations: ['search_properties', 'manage_listings', 'track_performance']
    }
  ],
  ecommerce: [
    {
      name: 'Shopify',
      industry: 'ecommerce',
      features: ['product_management', 'order_processing', 'customer_management'],
      apiEndpoint: 'https://api.shopify.com',
      authentication: 'oauth',
      supportedOperations: ['create_product', 'process_order', 'update_customer']
    },
    {
      name: 'Wix',
      industry: 'ecommerce',
      features: ['website_management', 'ecommerce', 'customer_management'],
      apiEndpoint: 'https://api.wix.com',
      authentication: 'oauth',
      supportedOperations: ['update_website', 'manage_products', 'handle_orders']
    },
    {
      name: 'WooCommerce',
      industry: 'ecommerce',
      features: ['product_management', 'order_processing', 'inventory_management'],
      apiEndpoint: 'https://api.woocommerce.com',
      authentication: 'api_key',
      supportedOperations: ['create_product', 'process_order', 'update_inventory']
    }
  ],
  construction: [
    {
      name: 'Procore',
      industry: 'construction',
      features: ['project_management', 'safety_management', 'resource_tracking'],
      apiEndpoint: 'https://api.procore.com',
      authentication: 'oauth',
      supportedOperations: ['create_project', 'track_safety', 'manage_resources']
    },
    {
      name: 'Buildertrend',
      industry: 'construction',
      features: ['project_management', 'customer_communication', 'scheduling'],
      apiEndpoint: 'https://api.buildertrend.com',
      authentication: 'api_key',
      supportedOperations: ['create_project', 'schedule_work', 'communicate_customer']
    }
  ],
  logistics: [
    {
      name: 'Fleet Management System',
      industry: 'logistics',
      features: ['vehicle_tracking', 'driver_management', 'route_optimization'],
      apiEndpoint: 'https://api.fleetmanagement.com',
      authentication: 'api_key',
      supportedOperations: ['track_vehicle', 'manage_driver', 'optimize_route']
    },
    {
      name: 'Samsara',
      industry: 'logistics',
      features: ['fleet_tracking', 'safety_monitoring', 'fuel_management'],
      apiEndpoint: 'https://api.samsara.com',
      authentication: 'oauth',
      supportedOperations: ['track_fleet', 'monitor_safety', 'manage_fuel']
    }
  ]
};

export class CRMIntegrationService {
  private config: CRMConfig;
  private integrations: CRMIntegration[];

  constructor(config: CRMConfig) {
    this.config = config;
    this.integrations = CRM_INTEGRATIONS[config.industry] || [];
  }

  /**
   * Get available CRM integrations for the industry
   */
  getAvailableIntegrations(): CRMIntegration[] {
    return this.integrations;
  }

  /**
   * Authenticate with CRM provider
   */
  async authenticate(provider: string): Promise<boolean> {
    try {
      const integration = this.integrations.find(i => i.name === provider);
      if (!integration) {
        throw new Error(`Integration ${provider} not found`);
      }

      switch (integration.authentication) {
        case 'api_key':
          return await this.authenticateWithApiKey(integration);
        case 'oauth':
          return await this.authenticateWithOAuth(integration);
        case 'basic':
          return await this.authenticateWithBasic(integration);
        default:
          throw new Error(`Unsupported authentication method: ${integration.authentication}`);
      }
    } catch (error) {
      console.error('CRM Authentication Error:', error);
      return false;
    }
  }

  /**
   * Sync contact data with CRM
   */
  async syncContacts(contacts: ContactData[], provider: string): Promise<boolean> {
    try {
      const integration = this.integrations.find(i => i.name === provider);
      if (!integration) {
        throw new Error(`Integration ${provider} not found`);
      }

      const endpoint = `${integration.apiEndpoint}/contacts/sync`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          contacts,
          industry: this.config.industry,
          features: integration.features
        })
      });

      return response.ok;
    } catch (error) {
      console.error('CRM Sync Error:', error);
      return false;
    }
  }

  /**
   * Create contact in CRM
   */
  async createContact(contact: ContactData, provider: string): Promise<string | null> {
    try {
      const integration = this.integrations.find(i => i.name === provider);
      if (!integration) {
        throw new Error(`Integration ${provider} not found`);
      }

      const endpoint = `${integration.apiEndpoint}/contacts`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          ...contact,
          industry: this.config.industry
        })
      });

      if (response.ok) {
        const result = await response.json();
        return result.id;
      }
      return null;
    } catch (error) {
      console.error('CRM Create Contact Error:', error);
      return null;
    }
  }

  /**
   * Update contact in CRM
   */
  async updateContact(contactId: string, updates: Partial<ContactData>, provider: string): Promise<boolean> {
    try {
      const integration = this.integrations.find(i => i.name === provider);
      if (!integration) {
        throw new Error(`Integration ${provider} not found`);
      }

      const endpoint = `${integration.apiEndpoint}/contacts/${contactId}`;
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify(updates)
      });

      return response.ok;
    } catch (error) {
      console.error('CRM Update Contact Error:', error);
      return false;
    }
  }

  /**
   * Get contacts from CRM
   */
  async getContacts(provider: string, filters?: Record<string, any>): Promise<ContactData[]> {
    try {
      const integration = this.integrations.find(i => i.name === provider);
      if (!integration) {
        throw new Error(`Integration ${provider} not found`);
      }

      const endpoint = `${integration.apiEndpoint}/contacts`;
      const queryParams = new URLSearchParams({
        industry: this.config.industry,
        ...filters
      });

      const response = await fetch(`${endpoint}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        return result.contacts || [];
      }
      return [];
    } catch (error) {
      console.error('CRM Get Contacts Error:', error);
      return [];
    }
  }

  /**
   * Execute industry-specific operations
   */
  async executeOperation(operation: string, data: any, provider: string): Promise<any> {
    try {
      const integration = this.integrations.find(i => i.name === provider);
      if (!integration) {
        throw new Error(`Integration ${provider} not found`);
      }

      if (!integration.supportedOperations.includes(operation)) {
        throw new Error(`Operation ${operation} not supported by ${provider}`);
      }

      const endpoint = `${integration.apiEndpoint}/operations/${operation}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          ...data,
          industry: this.config.industry
        })
      });

      if (response.ok) {
        return await response.json();
      }
      throw new Error(`Operation failed: ${response.statusText}`);
    } catch (error) {
      console.error('CRM Operation Error:', error);
      throw error;
    }
  }

  private async authenticateWithApiKey(integration: CRMIntegration): Promise<boolean> {
    // Implement API key authentication
    return true;
  }

  private async authenticateWithOAuth(integration: CRMIntegration): Promise<boolean> {
    // Implement OAuth authentication
    return true;
  }

  private async authenticateWithBasic(integration: CRMIntegration): Promise<boolean> {
    // Implement basic authentication
    return true;
  }

  /**
   * Get CRM integration by name (alias for getIntegration)
   */
  getCRMIntegration(name: string): CRMIntegration | null {
    return this.integrations.find(integration => integration.name === name) || null;
  }
}

// Industry-specific CRM operations
export const INDUSTRY_OPERATIONS = {
  healthcare: [
    'create_patient',
    'schedule_appointment',
    'update_medical_record',
    'send_patient_communication',
    'process_insurance_claim'
  ],
  legal: [
    'create_case',
    'track_time',
    'generate_bill',
    'send_client_communication',
    'schedule_court_appearance'
  ],
  real_estate: [
    'search_properties',
    'create_listing',
    'manage_leads',
    'schedule_showing',
    'generate_contract'
  ],
  ecommerce: [
    'create_product',
    'process_order',
    'update_inventory',
    'manage_customer',
    'generate_report'
  ],
  construction: [
    'create_project',
    'track_safety',
    'manage_resources',
    'schedule_work',
    'communicate_customer'
  ],
  logistics: [
    'track_vehicle',
    'manage_driver',
    'optimize_route',
    'monitor_safety',
    'manage_fuel'
  ]
};
