// CRM Connector Service
// Integrates with CRM systems (Salesforce, HubSpot) for customer context and call logging

import type { CRMIntegration } from '../../ivr/integrations';

export interface CRMConnectorConfig {
  type: 'salesforce' | 'hubspot' | 'custom';
  apiKey: string;
  baseUrl: string;
  tenantId: string;
}

export interface CallSummary {
  callId: string;
  customerId: string;
  duration: number;
  direction: 'inbound' | 'outbound';
  outcome: string;
  recordingUrl?: string;
  transcriptUrl?: string;
  auditTrailUrl?: string;
  metadata?: Record<string, any>;
}

class CRMConnectorService {
  private connectors: Map<string, CRMConnectorConfig> = new Map();

  /**
   * Register CRM connector for a tenant
   */
  registerConnector(tenantId: string, config: CRMConnectorConfig): void {
    this.connectors.set(tenantId, config);
  }

  /**
   * Get customer context at start of call
   */
  async getCustomerContext(tenantId: string, phoneNumber: string): Promise<{
    customerId?: string;
    name?: string;
    email?: string;
    accountId?: string;
    metadata?: Record<string, any>;
  }> {
    const connector = this.connectors.get(tenantId);
    if (!connector) {
      return {};
    }

    try {
      switch (connector.type) {
        case 'salesforce':
          return await this.getSalesforceCustomerContext(connector, phoneNumber);
        case 'hubspot':
          return await this.getHubSpotCustomerContext(connector, phoneNumber);
        default:
          return {};
      }
    } catch (error) {
      console.error(`Failed to get customer context for tenant ${tenantId}:`, error);
      return {};
    }
  }

  /**
   * Push call summary to CRM at end of call
   */
  async pushCallSummary(tenantId: string, summary: CallSummary): Promise<boolean> {
    const connector = this.connectors.get(tenantId);
    if (!connector) {
      return false;
    }

    try {
      switch (connector.type) {
        case 'salesforce':
          return await this.pushToSalesforce(connector, summary);
        case 'hubspot':
          return await this.pushToHubSpot(connector, summary);
        default:
          return false;
      }
    } catch (error) {
      console.error(`Failed to push call summary for tenant ${tenantId}:`, error);
      return false;
    }
  }

  /**
   * Get customer context from Salesforce
   */
  private async getSalesforceCustomerContext(
    config: CRMConnectorConfig,
    phoneNumber: string
  ): Promise<{
    customerId?: string;
    name?: string;
    email?: string;
    accountId?: string;
    metadata?: Record<string, any>;
  }> {
    // Query Salesforce for contact by phone number
    const soql = `SELECT Id, Name, Email, AccountId FROM Contact WHERE Phone = '${phoneNumber}' LIMIT 1`;
    const response = await fetch(`${config.baseUrl}/services/data/v57.0/query?q=${encodeURIComponent(soql)}`, {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`
      }
    });

    if (!response.ok) {
      return {};
    }

    const data = await response.json();
    const contact = data.records?.[0];
    
    if (!contact) {
      return {};
    }

    return {
      customerId: contact.Id,
      name: contact.Name,
      email: contact.Email,
      accountId: contact.AccountId,
      metadata: {
        salesforceContactId: contact.Id
      }
    };
  }

  /**
   * Push call summary to Salesforce
   */
  private async pushToSalesforce(config: CRMConnectorConfig, summary: CallSummary): Promise<boolean> {
    // Create Task in Salesforce with call details
    const response = await fetch(`${config.baseUrl}/services/data/v57.0/sobjects/Task`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        WhoId: summary.customerId,
        Subject: `Call - ${summary.direction}`,
        Description: `Call duration: ${summary.duration}s. Outcome: ${summary.outcome}. Audit Trail: ${summary.auditTrailUrl}`,
        Status: 'Completed',
        Type: 'Call',
        CallDurationInSeconds: summary.duration,
        CallDisposition: summary.outcome
      })
    });

    return response.ok;
  }

  /**
   * Get customer context from HubSpot
   */
  private async getHubSpotCustomerContext(
    config: CRMConnectorConfig,
    phoneNumber: string
  ): Promise<{
    customerId?: string;
    name?: string;
    email?: string;
    accountId?: string;
    metadata?: Record<string, any>;
  }> {
    // Search HubSpot for contact by phone number
    const response = await fetch(`${config.baseUrl}/crm/v3/objects/contacts/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
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
    });

    if (!response.ok) {
      return {};
    }

    const data = await response.json();
    const contact = data.results?.[0];
    
    if (!contact) {
      return {};
    }

    return {
      customerId: contact.id,
      name: contact.properties?.firstname + ' ' + contact.properties?.lastname,
      email: contact.properties?.email,
      metadata: {
        hubspotContactId: contact.id
      }
    };
  }

  /**
   * Push call summary to HubSpot
   */
  private async pushToHubSpot(config: CRMConnectorConfig, summary: CallSummary): Promise<boolean> {
    // Create engagement in HubSpot
    const response = await fetch(`${config.baseUrl}/crm/v3/objects/engagements`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        engagement: {
          type: 'CALL',
          timestamp: Date.now()
        },
        associations: {
          contactIds: [summary.customerId]
        },
        metadata: {
          body: `Call duration: ${summary.duration}s. Outcome: ${summary.outcome}. Audit Trail: ${summary.auditTrailUrl}`,
          durationMilliseconds: summary.duration * 1000,
          toNumber: summary.metadata?.toNumber,
          fromNumber: summary.metadata?.fromNumber
        }
      })
    });

    return response.ok;
  }
}

export const crmConnectorService = new CRMConnectorService();
