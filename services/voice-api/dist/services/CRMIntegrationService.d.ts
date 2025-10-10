import { PrismaClient } from '@prisma/client';
import { RedisClientType } from 'redis';
export interface CRMContact {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company?: string;
    title?: string;
    tier?: string;
    tags?: string[];
    lastInteraction?: Date;
    customFields?: Record<string, any>;
    lastContactDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface CRMCallLog {
    id: string;
    contactId: string;
    phoneNumber: string;
    callType: 'inbound' | 'outbound';
    duration: number;
    status: 'completed' | 'missed' | 'voicemail' | 'busy' | 'failed';
    recordingUrl?: string;
    transcript?: string;
    notes?: string;
    tags?: string[];
    createdAt: Date;
}
export interface CRMSyncResult {
    success: boolean;
    recordsProcessed: number;
    recordsCreated: number;
    recordsUpdated: number;
    recordsFailed: number;
    errors: string[];
    lastSyncAt: Date;
}
export declare class CRMIntegrationService {
    private prisma;
    private redis;
    private crmOAuthService;
    constructor(prisma: PrismaClient, redis: RedisClientType);
    syncContactsFromCRM(tenantId: string, connectionId: string): Promise<{
        success: boolean;
        result?: CRMSyncResult;
        error?: string;
    }>;
    private fetchSalesforceContacts;
    private fetchHubSpotContacts;
    private fetchPipedriveContacts;
    private fetchZohoContacts;
    logCallToCRM(tenantId: string, connectionId: string, callLog: CRMCallLog): Promise<{
        success: boolean;
        error?: string;
    }>;
    private logCallToSalesforce;
    private logCallToHubSpot;
    private logCallToPipedrive;
    private logCallToZoho;
    getContactByPhone(tenantId: string, phoneNumber: string): Promise<{
        success: boolean;
        contact?: CRMContact;
        error?: string;
    }>;
    syncCallLogsToCRM(tenantId: string, connectionId: string, callLogs: CRMCallLog[]): Promise<{
        success: boolean;
        result?: CRMSyncResult;
        error?: string;
    }>;
    configureCRMIntegration(tenantId: string, crmType: string, config: any): Promise<{
        success: boolean;
        error?: string;
    }>;
    createInteraction(interactionData: {
        tenantId: string;
        contactId: string;
        type: string;
        content: string;
        metadata?: any;
    }): Promise<{
        success: boolean;
        error?: string;
    }>;
    syncContacts(tenantId: string): Promise<{
        success: boolean;
        error?: string;
    }>;
}
//# sourceMappingURL=CRMIntegrationService.d.ts.map