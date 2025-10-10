import { PrismaClient } from '@prisma/client';
import { RedisClientType } from 'redis';
import { TenantIVRService } from './TenantIVRService';
import { CRMIntegrationService } from './CRMIntegrationService';
import { StripeService } from './StripeService';
export interface UserSignupData {
    userId: string;
    email: string;
    companyName: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    plan: 'basic' | 'premium' | 'enterprise';
    crmType?: 'salesforce' | 'hubspot' | 'pipedrive' | 'custom';
    crmCredentials?: any;
}
export interface TenantProvisioningResult {
    tenantId: string;
    tollFreeNumber: string;
    status: 'provisioning' | 'active' | 'failed';
    departments: string[];
    crmConnected: boolean;
    ivrConfigured: boolean;
    provisioningSteps: ProvisioningStep[];
    estimatedCompletionTime: Date;
}
export interface ProvisioningStep {
    id: string;
    name: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    description: string;
    startedAt?: Date;
    completedAt?: Date;
    error?: string;
    dependencies: string[];
}
export interface TenantStatus {
    tenantId: string;
    userId: string;
    companyName: string;
    status: 'active' | 'suspended' | 'provisioning' | 'failed';
    tollFreeNumber?: string;
    departments: string[];
    crmStatus: 'connected' | 'disconnected' | 'pending';
    ivrStatus: 'configured' | 'pending' | 'failed';
    lastActivity: Date;
    createdAt: Date;
    plan: string;
    features: string[];
}
export declare class TenantManagementService {
    private prisma;
    private redis;
    private tenantIVRService;
    private crmIntegrationService;
    private stripeService;
    constructor(prisma: PrismaClient, redis: RedisClientType, tenantIVRService: TenantIVRService, crmIntegrationService: CRMIntegrationService, stripeService: StripeService);
    processUserSignup(signupData: UserSignupData): Promise<TenantProvisioningResult>;
    private createTenantRecord;
    private provisionTollFreeNumber;
    private configureIVRSystem;
    private setupDefaultDepartments;
    private createDepartment;
    private configureCRMIntegration;
    private setupBilling;
    private initializeAnalytics;
    private sendWelcomeEmail;
    getTenantStatus(tenantId: string): Promise<TenantStatus | null>;
    getUserTenants(userId: string): Promise<TenantStatus[]>;
    private getPlanFeatures;
    private getProvisioningSteps;
    private getTimezoneFromEmail;
    private getDefaultBusinessHours;
    private getBrandColor;
    private getSecondaryBrandColor;
    private generateDepartmentNumber;
    private getDefaultAgents;
    private getDefaultRoutingRules;
    private getDepartmentPriority;
    private getCRMAPIEndpoint;
    private getStripePriceId;
    private storeProvisioningResult;
}
//# sourceMappingURL=TenantManagementService.d.ts.map