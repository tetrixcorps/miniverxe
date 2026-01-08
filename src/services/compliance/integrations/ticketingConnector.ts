// Ticketing System Connector Service
// Integrates with ticketing systems (Zendesk, ServiceNow) for follow-up ticket creation

export interface TicketingConnectorConfig {
  type: 'zendesk' | 'servicenow' | 'custom';
  apiKey: string;
  baseUrl: string;
  tenantId: string;
  defaultQueue?: string;
}

export interface TicketRequest {
  callId: string;
  customerId: string;
  tenantId: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  auditTrailUrl?: string;
  recordingUrl?: string;
  metadata?: Record<string, any>;
}

export interface Ticket {
  ticketId: string;
  ticketNumber: string;
  status: string;
  url?: string;
}

class TicketingConnectorService {
  private connectors: Map<string, TicketingConnectorConfig> = new Map();

  /**
   * Register ticketing connector for a tenant
   */
  registerConnector(tenantId: string, config: TicketingConnectorConfig): void {
    this.connectors.set(tenantId, config);
  }

  /**
   * Create ticket from call
   */
  async createTicket(tenantId: string, request: TicketRequest): Promise<Ticket | null> {
    const connector = this.connectors.get(tenantId);
    if (!connector) {
      console.warn(`No ticketing connector configured for tenant ${tenantId}`);
      return null;
    }

    try {
      switch (connector.type) {
        case 'zendesk':
          return await this.createZendeskTicket(connector, request);
        case 'servicenow':
          return await this.createServiceNowTicket(connector, request);
        default:
          return null;
      }
    } catch (error) {
      console.error(`Failed to create ticket for tenant ${tenantId}:`, error);
      return null;
    }
  }

  /**
   * Create ticket in Zendesk
   */
  private async createZendeskTicket(
    config: TicketingConnectorConfig,
    request: TicketRequest
  ): Promise<Ticket> {
    const response = await fetch(`${config.baseUrl}/api/v2/tickets.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${config.apiKey}/token`).toString('base64')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ticket: {
          subject: request.subject,
          comment: {
            body: `${request.description}\n\nCall ID: ${request.callId}\nAudit Trail: ${request.auditTrailUrl || 'N/A'}\nRecording: ${request.recordingUrl || 'N/A'}`
          },
          priority: request.priority === 'urgent' ? 'urgent' : request.priority,
          type: 'task',
          tags: ['ivr', 'voice', `call-${request.callId}`],
          custom_fields: [
            {
              id: 360000000000, // Example custom field ID for Call ID
              value: request.callId
            }
          ]
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Zendesk API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      ticketId: data.ticket.id.toString(),
      ticketNumber: data.ticket.id.toString(),
      status: data.ticket.status,
      url: data.ticket.url
    };
  }

  /**
   * Create ticket in ServiceNow
   */
  private async createServiceNowTicket(
    config: TicketingConnectorConfig,
    request: TicketRequest
  ): Promise<Ticket> {
    const response = await fetch(`${config.baseUrl}/api/now/table/incident`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(config.apiKey).toString('base64')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        short_description: request.subject,
        description: `${request.description}\n\nCall ID: ${request.callId}\nAudit Trail: ${request.auditTrailUrl || 'N/A'}\nRecording: ${request.recordingUrl || 'N/A'}`,
        urgency: request.priority === 'urgent' ? '1' : request.priority === 'high' ? '2' : '3',
        impact: '3',
        category: request.category || 'Voice Call',
        u_call_id: request.callId,
        u_audit_trail_url: request.auditTrailUrl,
        u_recording_url: request.recordingUrl
      })
    });

    if (!response.ok) {
      throw new Error(`ServiceNow API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      ticketId: data.result.sys_id,
      ticketNumber: data.result.number,
      status: data.result.state,
      url: `${config.baseUrl}/nav_to.do?uri=incident.do?sys_id=${data.result.sys_id}`
    };
  }

  /**
   * Update ticket with additional information
   */
  async updateTicket(
    tenantId: string,
    ticketId: string,
    updates: {
      comment?: string;
      status?: string;
      priority?: string;
    }
  ): Promise<boolean> {
    const connector = this.connectors.get(tenantId);
    if (!connector) {
      return false;
    }

    try {
      switch (connector.type) {
        case 'zendesk':
          return await this.updateZendeskTicket(connector, ticketId, updates);
        case 'servicenow':
          return await this.updateServiceNowTicket(connector, ticketId, updates);
        default:
          return false;
      }
    } catch (error) {
      console.error(`Failed to update ticket for tenant ${tenantId}:`, error);
      return false;
    }
  }

  /**
   * Update Zendesk ticket
   */
  private async updateZendeskTicket(
    config: TicketingConnectorConfig,
    ticketId: string,
    updates: { comment?: string; status?: string; priority?: string }
  ): Promise<boolean> {
    const response = await fetch(`${config.baseUrl}/api/v2/tickets/${ticketId}.json`, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${config.apiKey}/token`).toString('base64')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ticket: {
          ...(updates.status && { status: updates.status }),
          ...(updates.priority && { priority: updates.priority }),
          ...(updates.comment && {
            comment: {
              body: updates.comment,
              public: true
            }
          })
        }
      })
    });

    return response.ok;
  }

  /**
   * Update ServiceNow ticket
   */
  private async updateServiceNowTicket(
    config: TicketingConnectorConfig,
    ticketId: string,
    updates: { comment?: string; status?: string; priority?: string }
  ): Promise<boolean> {
    const response = await fetch(`${config.baseUrl}/api/now/table/incident/${ticketId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${Buffer.from(config.apiKey).toString('base64')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        ...(updates.status && { state: updates.status }),
        ...(updates.priority && { urgency: updates.priority }),
        ...(updates.comment && { work_notes: updates.comment })
      })
    });

    return response.ok;
  }
}

export const ticketingConnectorService = new TicketingConnectorService();
