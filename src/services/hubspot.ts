import { Client } from '@hubspot/api-client';
import { hubspotConfig, validateHubSpotConfig } from '../config/hubspot';

let hubspotClient: Client | null = null;

if (validateHubSpotConfig()) {
  hubspotClient = new Client({ accessToken: hubspotConfig.accessToken });
}

export const hubspotService = {
  // ... existing CRM methods ...
  async createContact(data: { email: string; firstname: string; company?: string }) {
    if (!hubspotClient) return null;

    try {
      const contactObj = {
        properties: {
          email: data.email,
          firstname: data.firstname,
          company: data.company || '',
        },
      };

      const contact = await hubspotClient.crm.contacts.basicApi.create(contactObj);
      return contact;
    } catch (e: any) {
        if (e.code === 409) {
             console.log("Contact already exists, searching for it...");
             const searchResponse = await hubspotClient.crm.contacts.searchApi.doSearch({
                 filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: data.email }] }],
                 sorts: ['email'],
                 properties: ['email'],
                 limit: 1,
                 after: 0
             });
             if (searchResponse.results.length > 0) {
                 return searchResponse.results[0];
             }
        }
      console.error('Error creating HubSpot contact:', e);
      throw e;
    }
  },

  async createTicket(contactId: string, data: { subject: string; content: string }) {
      if (!hubspotClient) return null;

      // Delegation Logic based on subject keywords
      // Default to 'New' stage (usually '1' in default pipeline '0')
      let pipelineStage = '1'; 
      let pipeline = '0';
      
      const subject = data.subject.toLowerCase();

      // Example Department Delegation
      if (subject.includes('sales') || subject.includes('quote') || subject.includes('pricing')) {
          // Sales Department
          // In a real scenario, you might change the pipeline or owner_id
          // ticketProps.hubspot_owner_id = 'SALES_REP_ID';
      } else if (subject.includes('support') || subject.includes('help') || subject.includes('issue')) {
          // Support Department
      } else if (subject.includes('billing') || subject.includes('invoice')) {
          // Billing Department
      }

      const ticketObj = {
          properties: {
              hs_pipeline: pipeline,
              hs_pipeline_stage: pipelineStage,
              hs_ticket_priority: 'HIGH',
              subject: data.subject,
              content: data.content
          },
          associations: [
            {
              to: { id: contactId },
              types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 16 }] // Ticket to Contact
            }
          ]
      };

      try {
          const ticket = await hubspotClient.crm.tickets.basicApi.create(ticketObj);
          return ticket;
      } catch (e) {
          console.error('Error creating HubSpot ticket:', e);
          throw e;
      }
  },

  /**
   * Submit data to HubSpot Forms API.
   * This is preferred over direct CRM API for marketing attribution.
   * Documentation: https://developers.hubspot.com/docs/api-reference/marketing-forms-v3/guide
   */
  async submitForm(data: { email: string; firstname: string; company?: string; subject: string; message: string }, context?: { pageUri: string; pageName: string }) {
      if (!hubspotConfig.portalId || !hubspotConfig.formGuid) {
          console.warn('HubSpot Portal ID or Form GUID not configured. Skipping Forms API submission.');
          return null;
      }

      const endpoint = `https://api.hsforms.com/submissions/v3/integration/submit/${hubspotConfig.portalId}/${hubspotConfig.formGuid}`;
      
      const payload = {
          fields: [
              { name: 'email', value: data.email },
              { name: 'firstname', value: data.firstname },
              { name: 'company', value: data.company },
              { name: 'subject', value: data.subject }, // Ensure 'subject' field exists in your HubSpot form
              { name: 'message', value: data.message }  // Ensure 'message' field exists in your HubSpot form
          ],
          context: {
              pageUri: context?.pageUri || 'www.tetrixcorp.com/contact',
              pageName: context?.pageName || 'Contact Us'
          }
      };

      try {
          const response = await fetch(endpoint, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(payload)
          });

          if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`HubSpot Forms API error: ${response.status} - ${errorText}`);
          }

          return await response.json();
      } catch (e) {
          console.error('Error submitting to HubSpot Forms API:', e);
          // Don't throw, as we might fallback to CRM API or just log it
          return null;
      }
  },

  /**
   * Retrieve tickets by Department (simulated via Search API).
   * In a real implementation, you would use Custom Properties (e.g., 'department').
   * Here we simulate it by searching subject keywords, similar to the routing logic.
   */
  async getTicketsByDepartment(department: 'Sales' | 'Support' | 'Billing') {
      if (!hubspotClient) return [];

      const keywords = {
          'Sales': ['sales', 'quote', 'pricing'],
          'Support': ['support', 'help', 'issue', 'problem'],
          'Billing': ['billing', 'invoice', 'payment']
      };

      // Construct filters for each keyword in the department
      // Note: HubSpot Search API uses AND between filters in a group, and OR between groups.
      // We want: Subject CONTAINS "sales" OR Subject CONTAINS "quote" ...
      const filterGroups = keywords[department].map(keyword => ({
          filters: [
              { propertyName: 'subject', operator: 'CONTAINS_TOKEN', value: `*${keyword}*` }
          ]
      }));

      try {
          const publicObjectSearchRequest = {
              filterGroups,
              sorts: ['createdate'], // Sort by newest
              properties: ['subject', 'content', 'createdate', 'hs_pipeline_stage', 'hs_ticket_priority'],
              limit: 20,
              after: 0,
          };

          const result = await hubspotClient.crm.tickets.searchApi.doSearch(publicObjectSearchRequest);
          return result.results;

      } catch (e) {
          console.error(`Error searching tickets for ${department}:`, e);
          return [];
      }
  }
};
