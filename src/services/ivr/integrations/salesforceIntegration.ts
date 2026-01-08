// Salesforce CRM Integration
// Implementation for Salesforce CRM integration

import type { CRMIntegration, Contact, ContactData, Account, Case, CaseData, CallActivityData } from './backendIntegrationService';

export class SalesforceIntegration implements CRMIntegration {
  name = 'Salesforce';
  type = 'crm' as const;
  isConnected = false;
  private accessToken: string;
  private instanceUrl: string;

  constructor(accessToken: string, instanceUrl: string) {
    this.accessToken = accessToken;
    this.instanceUrl = instanceUrl;
  }

  async connect(): Promise<boolean> {
    try {
      // Verify Salesforce connection
      const response = await fetch(`${this.instanceUrl}/services/data/v57.0/`, {
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      });

      this.isConnected = response.ok;
      return this.isConnected;
    } catch (error) {
      console.error('Salesforce connection error:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.instanceUrl}/services/data/v57.0/`, {
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async getContact(contactId: string): Promise<Contact | null> {
    const response = await fetch(`${this.instanceUrl}/services/data/v57.0/sobjects/Contact/${contactId}`, {
      headers: { 'Authorization': `Bearer ${this.accessToken}` }
    });

    if (!response.ok) return null;

    const data = await response.json();
    return {
      id: data.Id,
      name: data.Name,
      email: data.Email,
      phone: data.Phone,
      company: data.Account?.Name
    };
  }

  async searchContacts(query: string): Promise<Contact[]> {
    const soql = `SELECT Id, Name, Email, Phone, Account.Name FROM Contact WHERE Name LIKE '%${query}%' LIMIT 20`;
    const response = await fetch(`${this.instanceUrl}/services/data/v57.0/query?q=${encodeURIComponent(soql)}`, {
      headers: { 'Authorization': `Bearer ${this.accessToken}` }
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.records.map((record: any) => ({
      id: record.Id,
      name: record.Name,
      email: record.Email,
      phone: record.Phone,
      company: record.Account?.Name
    }));
  }

  async createContact(contact: ContactData): Promise<Contact> {
    const response = await fetch(`${this.instanceUrl}/services/data/v57.0/sobjects/Contact`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Name: contact.name,
        Email: contact.email,
        Phone: contact.phone
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create contact');
    }

    const data = await response.json();
    return {
      id: data.id,
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      company: contact.company
    };
  }

  async updateContact(contactId: string, updates: Partial<ContactData>): Promise<Contact> {
    const response = await fetch(`${this.instanceUrl}/services/data/v57.0/sobjects/Contact/${contactId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      throw new Error('Failed to update contact');
    }

    return await this.getContact(contactId) as Contact;
  }

  async getAccount(accountId: string): Promise<Account | null> {
    const response = await fetch(`${this.instanceUrl}/services/data/v57.0/sobjects/Account/${accountId}`, {
      headers: { 'Authorization': `Bearer ${this.accessToken}` }
    });

    if (!response.ok) return null;

    const data = await response.json();
    return {
      id: data.Id,
      name: data.Name,
      industry: data.Industry,
      contacts: []
    };
  }

  async searchAccounts(query: string): Promise<Account[]> {
    const soql = `SELECT Id, Name, Industry FROM Account WHERE Name LIKE '%${query}%' LIMIT 20`;
    const response = await fetch(`${this.instanceUrl}/services/data/v57.0/query?q=${encodeURIComponent(soql)}`, {
      headers: { 'Authorization': `Bearer ${this.accessToken}` }
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.records.map((record: any) => ({
      id: record.Id,
      name: record.Name,
      industry: record.Industry,
      contacts: []
    }));
  }

  async createCase(caseData: CaseData): Promise<Case> {
    const response = await fetch(`${this.instanceUrl}/services/data/v57.0/sobjects/Case`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ContactId: caseData.contactId,
        Subject: caseData.subject,
        Description: caseData.description,
        Priority: caseData.priority || 'Medium',
        Status: 'New'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create case');
    }

    const data = await response.json();
    return {
      id: data.id,
      contactId: caseData.contactId,
      subject: caseData.subject,
      status: 'open',
      priority: caseData.priority || 'medium',
      description: caseData.description
    };
  }

  async getCase(caseId: string): Promise<Case | null> {
    const response = await fetch(`${this.instanceUrl}/services/data/v57.0/sobjects/Case/${caseId}`, {
      headers: { 'Authorization': `Bearer ${this.accessToken}` }
    });

    if (!response.ok) return null;

    const data = await response.json();
    return {
      id: data.Id,
      contactId: data.ContactId,
      subject: data.Subject,
      status: data.Status.toLowerCase().replace(' ', '_') as Case['status'],
      priority: data.Priority.toLowerCase() as Case['priority'],
      description: data.Description
    };
  }

  async updateCase(caseId: string, updates: Partial<CaseData>): Promise<Case> {
    const response = await fetch(`${this.instanceUrl}/services/data/v57.0/sobjects/Case/${caseId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      throw new Error('Failed to update case');
    }

    return await this.getCase(caseId) as Case;
  }

  async logCallActivity(contactId: string, callData: CallActivityData): Promise<void> {
    await fetch(`${this.instanceUrl}/services/data/v57.0/sobjects/Task`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        WhoId: contactId,
        Subject: `Call - ${callData.direction}`,
        Description: `Call duration: ${callData.duration}s. Outcome: ${callData.outcome}`,
        Status: 'Completed',
        Type: 'Call',
        CallDurationInSeconds: callData.duration
      })
    });
  }
}
