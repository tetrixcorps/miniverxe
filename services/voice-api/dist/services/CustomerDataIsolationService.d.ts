import { PrismaClient } from '@prisma/client';
import { RedisClientType } from 'redis';
export interface TenantDataPolicy {
    tenantId: string;
    dataRetentionDays: number;
    encryptionEnabled: boolean;
    anonymizationEnabled: boolean;
    crossTenantSharing: boolean;
    gdprCompliant: boolean;
    ccpCompliant: boolean;
    dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
    accessControls: AccessControl[];
    auditLogging: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface AccessControl {
    id: string;
    resource: string;
    action: string;
    role: string;
    conditions: AccessCondition[];
    expiresAt?: Date;
}
export interface AccessCondition {
    type: 'ip_whitelist' | 'time_based' | 'user_role' | 'data_classification';
    value: any;
    operator: 'equals' | 'contains' | 'in' | 'not_in';
}
export interface DataIsolationConfig {
    tenantId: string;
    encryptionKey: string;
    dataPrefix: string;
    isolationLevel: 'database' | 'schema' | 'table' | 'row';
    crossTenantQueries: boolean;
    dataMasking: DataMaskingConfig;
    auditTrail: boolean;
}
export interface DataMaskingConfig {
    enabled: boolean;
    fields: string[];
    maskType: 'partial' | 'full' | 'hash' | 'encrypt';
    maskCharacter: string;
    preserveLength: boolean;
}
export interface CustomerData {
    id: string;
    tenantId: string;
    encryptedId: string;
    phone: string;
    email?: string;
    name?: string;
    tier: 'basic' | 'premium' | 'enterprise';
    tags: string[];
    customFields: Record<string, any>;
    interactions: CustomerInteraction[];
    preferences: CustomerPreferences;
    createdAt: Date;
    updatedAt: Date;
    lastActivity: Date;
    dataClassification: string;
    isAnonymized: boolean;
}
export interface CustomerInteraction {
    id: string;
    tenantId: string;
    customerId: string;
    type: 'call' | 'email' | 'chat' | 'ticket';
    department: string;
    agent?: string;
    outcome: 'resolved' | 'escalated' | 'callback' | 'abandoned';
    notes: string;
    duration: number;
    satisfaction?: number;
    tags: string[];
    timestamp: Date;
    dataClassification: string;
    isAnonymized: boolean;
}
export interface CustomerPreferences {
    language: string;
    communicationMethod: 'call' | 'email' | 'sms';
    preferredDepartment?: string;
    doNotCall: boolean;
    doNotEmail: boolean;
    preferredAgent?: string;
    callbackTime?: string;
    timezone: string;
    dataSharing: boolean;
    marketingOptIn: boolean;
}
export interface DataAccessLog {
    id: string;
    tenantId: string;
    userId: string;
    resource: string;
    action: string;
    customerId?: string;
    ipAddress: string;
    userAgent: string;
    timestamp: Date;
    success: boolean;
    errorMessage?: string;
    dataAccessed: string[];
}
export declare class CustomerDataIsolationService {
    private prisma;
    private redis;
    private encryptionKey;
    constructor(prisma: PrismaClient, redis: RedisClientType);
    initializeTenantDataIsolation(tenantId: string, config?: Partial<DataIsolationConfig>): Promise<DataIsolationConfig>;
    private createTenantDataPolicy;
    storeCustomerData(tenantId: string, customerData: Omit<CustomerData, 'id' | 'tenantId' | 'encryptedId' | 'createdAt' | 'updatedAt' | 'dataClassification' | 'isAnonymized'>): Promise<CustomerData>;
    getCustomerData(tenantId: string, customerId: string, requestingUserId: string): Promise<CustomerData | null>;
    searchCustomers(tenantId: string, query: any, requestingUserId: string): Promise<CustomerData[]>;
    storeCustomerInteraction(tenantId: string, interaction: Omit<CustomerInteraction, 'id' | 'tenantId' | 'dataClassification' | 'isAnonymized'>): Promise<CustomerInteraction>;
    anonymizeCustomerData(tenantId: string, customerId: string): Promise<void>;
    deleteCustomerData(tenantId: string, customerId: string): Promise<void>;
    private checkDataAccess;
    private getDataIsolationConfig;
    private getTenantDataPolicy;
    private encryptCustomerData;
    private decryptCustomerData;
    private encryptInteractionData;
    private applyDataMasking;
    private maskString;
    private anonymizeString;
    private anonymizeEmail;
    private anonymizePhone;
    private anonymizeCustomFields;
    private encryptData;
    private decryptData;
    private generateEncryptionKey;
    private matchesSearchQuery;
    private logDataAccess;
}
//# sourceMappingURL=CustomerDataIsolationService.d.ts.map