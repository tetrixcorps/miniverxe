// CRM Integration Service
// Connects to external CRM systems (Salesforce, HubSpot, custom) for customer data and call logging

import { auditEvidenceService } from '../compliance/auditEvidenceService';
import { industryAuthService } from '../oauth';

export interface CRMConfig {
  provider: 'salesforce' | 'hubspot' | 'custom';
  baseUrl: string;
  apiKey?: string;
  accessToken?: string;
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
  tenantId: string;
}

export interface CustomerRecord {
  customerId: string;
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  company?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  tags?: string[];
  customFields?: Record<string, any>;
  lastContacted?: Date;
  previousInteractions?: Array<{
    date: Date;
    type: 'call' | 'email' | 'sms' | 'meeting';
    outcome: string;
    notes?: string;
  }>;
}

export interface CallActivity {
  callId: string;
  customerId: string;
  phoneNumber: string;
  direction: 'inbound' | 'outbound';
  outcome: 'answered' | 'voicemail' | 'no_answer' | 'busy' | 'failed';
  duration?: number; // seconds
  agentId?: string;
  notes?: string;
  tags?: string[];
  nextFollowUp?: Date;
  recordingUrl?: string;
  metadata?: Record<string, any>;
}

export interface CRMConnector {
  getCustomerByPhone(phoneNumber: string): Promise<CustomerRecord | null>;
  getCustomerById(customerId: string): Promise<CustomerRecord | null>;
  logCallActivity(activity: CallActivity): Promise<{ success: boolean; activityId?: string }>;
  updateCustomer(customerId: string, updates: Partial<CustomerRecord>): Promise<boolean>;
  searchCustomers(query: string): Promise<CustomerRecord[]>;
}

class CRMIntegrationService {
  private connectors: Map<string, CRMConnector> = new Map();

  /**
   * Register CRM connector for tenant
   * If accessToken is not provided, attempts to retrieve from OAuth service
   */
  async registerConnector(
    tenantId: string,
    config: CRMConfig,
    connector?: CRMConnector
  ): Promise<void> {
    if (connector) {
      this.connectors.set(tenantId, connector);
      return;
    }

    // If accessToken not provided, try to get from OAuth service or environment
    let finalConfig = { ...config };
    if (!config.accessToken && config.provider !== 'custom') {
      try {
        // Try to get access token from OAuth service
        const integrationId = `${config.provider}_${tenantId}`;
        const accessToken = await industryAuthService.getAccessToken(
          tenantId,
          integrationId
        );
        finalConfig = {
          ...config,
          accessToken,
        };
      } catch (error) {
        console.warn(
          `Could not retrieve OAuth token for ${config.provider}. Trying environment variables.`,
          error
        );
        
        // Fallback to environment variables for API keys
        if (config.provider === 'hubspot' && !config.apiKey) {
          const apiKey = process.env.HUBSPOT_API_KEY || process.env.HUBSPOT_DEVELOPER_API_KEY;
          if (apiKey) {
            finalConfig = {
              ...config,
              apiKey,
            };
          }
        }
        // Continue with provided config (may have accessToken/apiKey set manually)
      }
    }

    // Create connector based on provider
    switch (finalConfig.provider) {
      case 'salesforce':
        this.connectors.set(tenantId, new SalesforceConnector(finalConfig));
        break;
      case 'hubspot':
        this.connectors.set(tenantId, new HubSpotConnector(finalConfig));
        break;
      case 'custom':
        this.connectors.set(tenantId, new CustomCRMConnector(finalConfig));
        break;
      default:
        throw new Error(`Unsupported CRM provider: ${finalConfig.provider}`);
    }

    await auditEvidenceService.logEvent({
      tenantId,
      callId: tenantId,
      eventType: 'data.access',
      eventData: {
        action: 'crm_connector_registered',
        provider: config.provider
      },
      metadata: {
        service: 'crm_integration'
      }
    });
  }

  /**
   * Get customer by phone number
   */
  async getCustomerByPhone(
    tenantId: string,
    phoneNumber: string
  ): Promise<CustomerRecord | null> {
    const connector = this.connectors.get(tenantId);
    if (!connector) {
      console.warn(`No CRM connector registered for tenant: ${tenantId}`);
      return null;
    }

    try {
      return await connector.getCustomerByPhone(phoneNumber);
    } catch (error) {
      console.error(`Error fetching customer from CRM:`, error);
      return null;
    }
  }

  /**
   * Get customer by ID
   */
  async getCustomerById(
    tenantId: string,
    customerId: string
  ): Promise<CustomerRecord | null> {
    const connector = this.connectors.get(tenantId);
    if (!connector) {
      return null;
    }

    try {
      return await connector.getCustomerById(customerId);
    } catch (error) {
      console.error(`Error fetching customer from CRM:`, error);
      return null;
    }
  }

  /**
   * Log call activity to CRM
   */
  async logCallActivity(
    tenantId: string,
    activity: CallActivity
  ): Promise<{ success: boolean; activityId?: string }> {
    const connector = this.connectors.get(tenantId);
    if (!connector) {
      console.warn(`No CRM connector registered for tenant: ${tenantId}`);
      return { success: false };
    }

    try {
      const result = await connector.logCallActivity(activity);

      await auditEvidenceService.logEvent({
        tenantId,
        callId: activity.callId,
        eventType: 'data.access',
        eventData: {
          action: 'crm_call_logged',
          callId: activity.callId,
          customerId: activity.customerId,
          success: result.success
        },
        metadata: {
          service: 'crm_integration'
        }
      });

      return result;
    } catch (error) {
      console.error(`Error logging call to CRM:`, error);
      return { success: false };
    }
  }

  /**
   * Update customer in CRM
   */
  async updateCustomer(
    tenantId: string,
    customerId: string,
    updates: Partial<CustomerRecord>
  ): Promise<boolean> {
    const connector = this.connectors.get(tenantId);
    if (!connector) {
      return false;
    }

    try {
      return await connector.updateCustomer(customerId, updates);
    } catch (error) {
      console.error(`Error updating customer in CRM:`, error);
      return false;
    }
  }

  /**
   * Search customers in CRM
   */
  async searchCustomers(
    tenantId: string,
    query: string
  ): Promise<CustomerRecord[]> {
    const connector = this.connectors.get(tenantId);
    if (!connector) {
      return [];
    }

    try {
      return await connector.searchCustomers(query);
    } catch (error) {
      console.error(`Error searching customers in CRM:`, error);
      return [];
    }
  }
}

/**
 * Salesforce Connector
 */
class SalesforceConnector implements CRMConnector {
  constructor(private config: CRMConfig) {}

  async getCustomerByPhone(phoneNumber: string): Promise<CustomerRecord | null> {
    // In production, use Salesforce REST API
    // For now, return mock data structure
    const response = await fetch(
      `${this.config.baseUrl}/services/data/v57.0/query?q=SELECT+Id,FirstName,LastName,Email,Phone+FROM+Contact+WHERE+Phone='${phoneNumber}'`,
      {
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    ).catch(() => null);

    if (!response || !response.ok) {
      return null;
    }

    const data = await response.json();
    if (data.records && data.records.length > 0) {
      const record = data.records[0];
      return {
        customerId: record.Id,
        phoneNumber: record.Phone,
        firstName: record.FirstName,
        lastName: record.LastName,
        email: record.Email
      };
    }

    return null;
  }

  async getCustomerById(customerId: string): Promise<CustomerRecord | null> {
    // Similar to getCustomerByPhone but by ID
    return null; // Implement in production
  }

  async logCallActivity(activity: CallActivity): Promise<{ success: boolean; activityId?: string }> {
    // Log as Task or Call object in Salesforce
    const response = await fetch(
      `${this.config.baseUrl}/services/data/v57.0/sobjects/Task`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          WhoId: activity.customerId,
          Subject: `Call - ${activity.outcome}`,
          Description: activity.notes,
          CallDurationInSeconds: activity.duration,
          Status: 'Completed',
          CallType: activity.direction === 'inbound' ? 'Inbound' : 'Outbound'
        })
      }
    ).catch(() => null);

    if (response && response.ok) {
      const data = await response.json();
      return { success: true, activityId: data.id };
    }

    return { success: false };
  }

  async updateCustomer(customerId: string, updates: Partial<CustomerRecord>): Promise<boolean> {
    // Update Contact in Salesforce
    return false; // Implement in production
  }

  async searchCustomers(query: string): Promise<CustomerRecord[]> {
    // Search Contacts in Salesforce
    return []; // Implement in production
  }
}

/**
 * HubSpot Connector
 */
class HubSpotConnector implements CRMConnector {
  constructor(private config: CRMConfig) {}

  private getAuthHeader(): string {
    // Prefer OAuth access token, fallback to API key
    if (this.config.accessToken) {
      return `Bearer ${this.config.accessToken}`;
    }
    // Use API key from environment if available
    const apiKey = this.config.apiKey || process.env.HUBSPOT_API_KEY || process.env.HUBSPOT_DEVELOPER_API_KEY;
    if (apiKey) {
      return `Bearer ${apiKey}`;
    }
    throw new Error('HubSpot authentication not configured. Provide accessToken or set HUBSPOT_API_KEY');
  }

  async getCustomerByPhone(phoneNumber: string): Promise<CustomerRecord | null> {
    const response = await fetch(
      `${this.config.baseUrl}/crm/v3/objects/contacts/search`,
      {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filterGroups: [{
            filters: [{
              propertyName: 'phone',
              operator: 'EQ',
              value: phoneNumber
            }]
          }]
        })
      }
    ).catch(() => null);

    if (!response || !response.ok) {
      return null;
    }

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const record = data.results[0];
      return {
        customerId: record.id,
        phoneNumber: record.properties.phone,
        firstName: record.properties.firstname,
        lastName: record.properties.lastname,
        email: record.properties.email
      };
    }

    return null;
  }

  async getCustomerById(customerId: string): Promise<CustomerRecord | null> {
    return null; // Implement in production
  }

  async logCallActivity(activity: CallActivity): Promise<{ success: boolean; activityId?: string }> {
    // Log as Call engagement in HubSpot
    const response = await fetch(
      `${this.config.baseUrl}/crm/v3/objects/calls`,
      {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: {
            hs_call_title: `Call - ${activity.outcome}`,
            hs_call_body: activity.notes,
            hs_call_duration: activity.duration,
            hs_call_direction: activity.direction,
            hs_call_status: activity.outcome
          },
          associations: [{
            to: { id: activity.customerId },
            types: [{
              associationCategory: 'HUBSPOT_DEFINED',
              associationTypeId: 3 // Contact to Call
            }]
          }]
        })
      }
    ).catch(() => null);

    if (response && response.ok) {
      const data = await response.json();
      return { success: true, activityId: data.id };
    }

    return { success: false };
  }

  async updateCustomer(customerId: string, updates: Partial<CustomerRecord>): Promise<boolean> {
    // Update Contact in HubSpot
    const response = await fetch(
      `${this.config.baseUrl}/crm/v3/objects/contacts/${customerId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: {
            ...(updates.firstName && { firstname: updates.firstName }),
            ...(updates.lastName && { lastname: updates.lastName }),
            ...(updates.email && { email: updates.email }),
            ...(updates.phoneNumber && { phone: updates.phoneNumber }),
          }
        })
      }
    ).catch(() => null);

    return response?.ok || false;
  }

  async searchCustomers(query: string): Promise<CustomerRecord[]> {
    // Search Contacts in HubSpot
    const response = await fetch(
      `${this.config.baseUrl}/crm/v3/objects/contacts/search`,
      {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: query,
          limit: 10
        })
      }
    ).catch(() => null);

    if (!response || !response.ok) {
      return [];
    }

    const data = await response.json();
    return (data.results || []).map((record: any) => ({
      customerId: record.id,
      phoneNumber: record.properties.phone,
      firstName: record.properties.firstname,
      lastName: record.properties.lastname,
      email: record.properties.email
    }));
  }
}

/**
 * Custom CRM Connector
 */
class CustomCRMConnector implements CRMConnector {
  constructor(private config: CRMConfig) {}

  async getCustomerByPhone(phoneNumber: string): Promise<CustomerRecord | null> {
    // Generic REST API call
    const response = await fetch(
      `${this.config.baseUrl}/customers/search?phone=${encodeURIComponent(phoneNumber)}`,
      {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey || this.config.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    ).catch(() => null);

    if (!response || !response.ok) {
      return null;
    }

    const data = await response.json();
    return data; // Assume API returns CustomerRecord format
  }

  async getCustomerById(customerId: string): Promise<CustomerRecord | null> {
    const response = await fetch(
      `${this.config.baseUrl}/customers/${customerId}`,
      {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey || this.config.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    ).catch(() => null);

    if (!response || !response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  }

  async logCallActivity(activity: CallActivity): Promise<{ success: boolean; activityId?: string }> {
    const response = await fetch(
      `${this.config.baseUrl}/calls`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey || this.config.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(activity)
      }
    ).catch(() => null);

    if (response && response.ok) {
      const data = await response.json();
      return { success: true, activityId: data.id || data.callId };
    }

    return { success: false };
  }

  async updateCustomer(customerId: string, updates: Partial<CustomerRecord>): Promise<boolean> {
    const response = await fetch(
      `${this.config.baseUrl}/customers/${customerId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey || this.config.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      }
    ).catch(() => null);

    return response?.ok || false;
  }

  async searchCustomers(query: string): Promise<CustomerRecord[]> {
    const response = await fetch(
      `${this.config.baseUrl}/customers/search?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey || this.config.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    ).catch(() => null);

    if (!response || !response.ok) {
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : (data.results || []);
  }
}

export const crmIntegrationService = new CRMIntegrationService();
