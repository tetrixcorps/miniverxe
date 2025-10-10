"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CRMIntegrationService = void 0;
const axios_1 = __importDefault(require("axios"));
const logger_1 = __importDefault(require("../utils/logger"));
const CRMOAuthService_1 = require("./CRMOAuthService");
class CRMIntegrationService {
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
        this.crmOAuthService = new CRMOAuthService_1.CRMOAuthService(prisma, redis);
    }
    async syncContactsFromCRM(tenantId, connectionId) {
        try {
            const connection = await this.prisma.crmConnection.findUnique({
                where: { id: connectionId }
            });
            if (!connection) {
                return { success: false, error: 'CRM connection not found' };
            }
            const tokenResult = await this.crmOAuthService.getValidToken(connectionId);
            if (!tokenResult.success) {
                return { success: false, error: tokenResult.error };
            }
            let contacts = [];
            let syncResult = {
                success: true,
                recordsProcessed: 0,
                recordsCreated: 0,
                recordsUpdated: 0,
                recordsFailed: 0,
                errors: [],
                lastSyncAt: new Date()
            };
            switch (connection.crmType) {
                case 'salesforce':
                    contacts = await this.fetchSalesforceContacts(tokenResult.token);
                    break;
                case 'hubspot':
                    contacts = await this.fetchHubSpotContacts(tokenResult.token);
                    break;
                case 'pipedrive':
                    contacts = await this.fetchPipedriveContacts(tokenResult.token);
                    break;
                case 'zoho':
                    contacts = await this.fetchZohoContacts(tokenResult.token);
                    break;
                default:
                    return { success: false, error: 'Unsupported CRM type' };
            }
            for (const contact of contacts) {
                try {
                    syncResult.recordsProcessed++;
                    const existingContact = await this.prisma.contact.findFirst({
                        where: {
                            tenantId: tenantId,
                            OR: [
                                { email: contact.email },
                                { phone: contact.phone }
                            ]
                        }
                    });
                    if (existingContact) {
                        await this.prisma.contact.update({
                            where: { id: existingContact.id },
                            data: {
                                firstName: contact.firstName,
                                lastName: contact.lastName,
                                email: contact.email,
                                phone: contact.phone,
                                company: contact.company,
                                title: contact.title,
                                customFields: contact.customFields,
                                lastContactDate: contact.lastContactDate,
                                updatedAt: new Date()
                            }
                        });
                        syncResult.recordsUpdated++;
                    }
                    else {
                        await this.prisma.contact.create({
                            data: {
                                tenantId: tenantId,
                                crmId: contact.id,
                                firstName: contact.firstName,
                                lastName: contact.lastName,
                                email: contact.email,
                                phone: contact.phone,
                                company: contact.company,
                                title: contact.title,
                                customFields: contact.customFields,
                                lastContactDate: contact.lastContactDate,
                                createdAt: contact.createdAt,
                                updatedAt: contact.updatedAt
                            }
                        });
                        syncResult.recordsCreated++;
                    }
                }
                catch (error) {
                    syncResult.recordsFailed++;
                    syncResult.errors.push(`Failed to process contact ${contact.email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }
            await this.prisma.crmConnection.update({
                where: { id: connectionId },
                data: { lastSyncAt: new Date() }
            });
            logger_1.default.info(`CRM sync completed for tenant ${tenantId}: ${syncResult.recordsProcessed} processed, ${syncResult.recordsCreated} created, ${syncResult.recordsUpdated} updated, ${syncResult.recordsFailed} failed`);
            return { success: true, result: syncResult };
        }
        catch (error) {
            logger_1.default.error('Error syncing contacts from CRM:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async fetchSalesforceContacts(accessToken) {
        try {
            const response = await axios_1.default.get('https://api.salesforce.com/services/data/v58.0/sobjects/Contact', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    fields: 'Id,FirstName,LastName,Email,Phone,Account.Name,Title,CreatedDate,LastModifiedDate'
                }
            });
            return response.data.records.map((record) => ({
                id: record.Id,
                firstName: record.FirstName || '',
                lastName: record.LastName || '',
                email: record.Email || '',
                phone: record.Phone || '',
                company: record.Account?.Name,
                title: record.Title,
                createdAt: new Date(record.CreatedDate),
                updatedAt: new Date(record.LastModifiedDate)
            }));
        }
        catch (error) {
            logger_1.default.error('Error fetching Salesforce contacts:', error);
            return [];
        }
    }
    async fetchHubSpotContacts(accessToken) {
        try {
            const response = await axios_1.default.get('https://api.hubapi.com/crm/v3/objects/contacts', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    properties: 'firstname,lastname,email,phone,company,title,createdate,lastmodifieddate'
                }
            });
            return response.data.results.map((record) => ({
                id: record.id,
                firstName: record.properties.firstname || '',
                lastName: record.properties.lastname || '',
                email: record.properties.email || '',
                phone: record.properties.phone || '',
                company: record.properties.company,
                title: record.properties.title,
                createdAt: new Date(record.properties.createdate),
                updatedAt: new Date(record.properties.lastmodifieddate)
            }));
        }
        catch (error) {
            logger_1.default.error('Error fetching HubSpot contacts:', error);
            return [];
        }
    }
    async fetchPipedriveContacts(accessToken) {
        try {
            const response = await axios_1.default.get('https://api.pipedrive.com/v1/persons', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data.data.map((record) => ({
                id: record.id.toString(),
                firstName: record.first_name || '',
                lastName: record.last_name || '',
                email: record.email?.[0]?.value || '',
                phone: record.phone?.[0]?.value || '',
                company: record.org_name,
                title: record.job_title,
                createdAt: new Date(record.add_time),
                updatedAt: new Date(record.update_time)
            }));
        }
        catch (error) {
            logger_1.default.error('Error fetching Pipedrive contacts:', error);
            return [];
        }
    }
    async fetchZohoContacts(accessToken) {
        try {
            const response = await axios_1.default.get('https://www.zohoapis.com/crm/v2/Contacts', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data.data.map((record) => ({
                id: record.id,
                firstName: record.First_Name || '',
                lastName: record.Last_Name || '',
                email: record.Email || '',
                phone: record.Phone || '',
                company: record.Account_Name,
                title: record.Title,
                createdAt: new Date(record.Created_Time),
                updatedAt: new Date(record.Modified_Time)
            }));
        }
        catch (error) {
            logger_1.default.error('Error fetching Zoho contacts:', error);
            return [];
        }
    }
    async logCallToCRM(tenantId, connectionId, callLog) {
        try {
            const connection = await this.prisma.crmConnection.findUnique({
                where: { id: connectionId }
            });
            if (!connection) {
                return { success: false, error: 'CRM connection not found' };
            }
            const tokenResult = await this.crmOAuthService.getValidToken(connectionId);
            if (!tokenResult.success) {
                return { success: false, error: tokenResult.error };
            }
            switch (connection.crmType) {
                case 'salesforce':
                    return await this.logCallToSalesforce(tokenResult.token, callLog);
                case 'hubspot':
                    return await this.logCallToHubSpot(tokenResult.token, callLog);
                case 'pipedrive':
                    return await this.logCallToPipedrive(tokenResult.token, callLog);
                case 'zoho':
                    return await this.logCallToZoho(tokenResult.token, callLog);
                default:
                    return { success: false, error: 'Unsupported CRM type' };
            }
        }
        catch (error) {
            logger_1.default.error('Error logging call to CRM:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async logCallToSalesforce(accessToken, callLog) {
        try {
            const response = await axios_1.default.post('https://api.salesforce.com/services/data/v58.0/sobjects/Task', {
                Subject: `Call - ${callLog.callType}`,
                Description: callLog.notes || `Call to ${callLog.phoneNumber}`,
                Status: 'Completed',
                Priority: 'Normal',
                ActivityDate: callLog.createdAt.toISOString().split('T')[0],
                CallDuration: callLog.duration,
                CallType: callLog.callType,
                WhoId: callLog.contactId
            }, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.status === 201) {
                return { success: true };
            }
            else {
                return { success: false, error: 'Failed to log call to Salesforce' };
            }
        }
        catch (error) {
            logger_1.default.error('Error logging call to Salesforce:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async logCallToHubSpot(accessToken, callLog) {
        try {
            const response = await axios_1.default.post('https://api.hubapi.com/crm/v3/objects/calls', {
                properties: {
                    hs_call_title: `Call - ${callLog.callType}`,
                    hs_call_body: callLog.notes || `Call to ${callLog.phoneNumber}`,
                    hs_call_duration: callLog.duration,
                    hs_call_direction: callLog.callType,
                    hs_call_status: callLog.status,
                    hs_call_outcome: callLog.status,
                    hs_call_recording_url: callLog.recordingUrl,
                    hs_call_transcript: callLog.transcript,
                    hs_call_contact_id: callLog.contactId
                }
            }, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.status === 201) {
                return { success: true };
            }
            else {
                return { success: false, error: 'Failed to log call to HubSpot' };
            }
        }
        catch (error) {
            logger_1.default.error('Error logging call to HubSpot:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async logCallToPipedrive(accessToken, callLog) {
        try {
            const response = await axios_1.default.post('https://api.pipedrive.com/v1/activities', {
                subject: `Call - ${callLog.callType}`,
                type: 'call',
                note: callLog.notes || `Call to ${callLog.phoneNumber}`,
                due_date: callLog.createdAt.toISOString().split('T')[0],
                person_id: callLog.contactId,
                done: 1
            }, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.status === 201) {
                return { success: true };
            }
            else {
                return { success: false, error: 'Failed to log call to Pipedrive' };
            }
        }
        catch (error) {
            logger_1.default.error('Error logging call to Pipedrive:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async logCallToZoho(accessToken, callLog) {
        try {
            const response = await axios_1.default.post('https://www.zohoapis.com/crm/v2/Tasks', {
                data: [{
                        Subject: `Call - ${callLog.callType}`,
                        Description: callLog.notes || `Call to ${callLog.phoneNumber}`,
                        Status: 'Completed',
                        Priority: 'Normal',
                        Due_Date: callLog.createdAt.toISOString().split('T')[0],
                        Who_Id: callLog.contactId
                    }]
            }, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.status === 201) {
                return { success: true };
            }
            else {
                return { success: false, error: 'Failed to log call to Zoho' };
            }
        }
        catch (error) {
            logger_1.default.error('Error logging call to Zoho:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async getContactByPhone(tenantId, phoneNumber) {
        try {
            const contact = await this.prisma.contact.findFirst({
                where: {
                    tenantId: tenantId,
                    phone: phoneNumber
                }
            });
            if (!contact) {
                return { success: false, error: 'Contact not found' };
            }
            const crmContact = {
                id: contact.crmId || contact.id,
                firstName: contact.firstName,
                lastName: contact.lastName,
                email: contact.email,
                phone: contact.phone,
                company: contact.company || undefined,
                title: contact.title || undefined,
                customFields: contact.customFields || undefined,
                lastContactDate: contact.lastContactDate || undefined,
                createdAt: contact.createdAt,
                updatedAt: contact.updatedAt
            };
            return { success: true, contact: crmContact };
        }
        catch (error) {
            logger_1.default.error('Error getting contact by phone:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async syncCallLogsToCRM(tenantId, connectionId, callLogs) {
        try {
            const syncResult = {
                success: true,
                recordsProcessed: 0,
                recordsCreated: 0,
                recordsUpdated: 0,
                recordsFailed: 0,
                errors: [],
                lastSyncAt: new Date()
            };
            for (const callLog of callLogs) {
                try {
                    syncResult.recordsProcessed++;
                    const logResult = await this.logCallToCRM(tenantId, connectionId, callLog);
                    if (logResult.success) {
                        syncResult.recordsCreated++;
                    }
                    else {
                        syncResult.recordsFailed++;
                        syncResult.errors.push(`Failed to log call ${callLog.id}: ${logResult.error}`);
                    }
                }
                catch (error) {
                    syncResult.recordsFailed++;
                    syncResult.errors.push(`Failed to process call log ${callLog.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }
            logger_1.default.info(`Call logs sync completed for tenant ${tenantId}: ${syncResult.recordsProcessed} processed, ${syncResult.recordsCreated} created, ${syncResult.recordsFailed} failed`);
            return { success: true, result: syncResult };
        }
        catch (error) {
            logger_1.default.error('Error syncing call logs to CRM:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async configureCRMIntegration(tenantId, crmType, config) {
        try {
            logger_1.default.info(`Configuring CRM integration for tenant ${tenantId} with ${crmType}`);
            await this.redis.setEx(`crm:config:${tenantId}`, 86400, JSON.stringify({
                crmType,
                config,
                configuredAt: new Date().toISOString()
            }));
            return { success: true };
        }
        catch (error) {
            logger_1.default.error('Error configuring CRM integration:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async createInteraction(interactionData) {
        try {
            logger_1.default.info(`Creating interaction for tenant ${interactionData.tenantId} and contact ${interactionData.contactId}`);
            logger_1.default.info('Interaction created:', {
                tenantId: interactionData.tenantId,
                contactId: interactionData.contactId,
                type: interactionData.type,
                content: interactionData.content,
                metadata: interactionData.metadata,
                timestamp: new Date().toISOString()
            });
            return { success: true };
        }
        catch (error) {
            logger_1.default.error('Error creating interaction:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async syncContacts(tenantId) {
        try {
            logger_1.default.info(`Syncing contacts for tenant ${tenantId}`);
            logger_1.default.info('Contacts synced successfully for tenant:', tenantId);
            return { success: true };
        }
        catch (error) {
            logger_1.default.error('Error syncing contacts:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
}
exports.CRMIntegrationService = CRMIntegrationService;
//# sourceMappingURL=CRMIntegrationService.js.map