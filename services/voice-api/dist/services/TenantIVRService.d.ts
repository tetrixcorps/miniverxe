import { PrismaClient } from '@prisma/client';
import { RedisClientType } from 'redis';
export interface Tenant {
    id: string;
    userId: string;
    companyName: string;
    tollFreeNumber: string;
    status: 'active' | 'inactive' | 'suspended';
    settings: TenantSettings;
    departments: TenantDepartment[];
    createdAt: Date;
    updatedAt: Date;
}
export interface TenantSettings {
    timezone: string;
    language: string;
    businessHours: BusinessHours;
    branding: BrandingSettings;
    notifications: NotificationSettings;
    integrations: IntegrationSettings;
}
export interface BusinessHours {
    timezone: string;
    weekdays: DaySchedule;
    weekends: DaySchedule;
    holidays: HolidaySchedule[];
}
export interface DaySchedule {
    enabled: boolean;
    startTime: string;
    endTime: string;
    greeting: string;
    afterHoursGreeting: string;
}
export interface HolidaySchedule {
    date: string;
    name: string;
    enabled: boolean;
    greeting: string;
}
export interface BrandingSettings {
    companyName: string;
    logoUrl?: string;
    primaryColor: string;
    secondaryColor: string;
    customGreeting?: string;
    holdMusic?: string;
}
export interface NotificationSettings {
    email: string;
    sms?: string;
    webhook?: string;
    escalationAlerts: boolean;
    dailyReports: boolean;
}
export interface IntegrationSettings {
    crmType?: 'salesforce' | 'hubspot' | 'pipedrive' | 'custom';
    crmApiKey?: string;
    crmWebhookUrl?: string;
    syncEnabled: boolean;
    syncInterval: number;
}
export interface TenantDepartment {
    id: string;
    tenantId: string;
    name: string;
    type: 'sales' | 'support' | 'billing' | 'technical' | 'custom';
    phoneNumber: string;
    email: string;
    greeting: string;
    businessHours: DaySchedule;
    agents: DepartmentAgent[];
    routingRules: RoutingRule[];
    priority: number;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface DepartmentAgent {
    id: string;
    name: string;
    phoneNumber: string;
    email: string;
    skills: string[];
    availability: 'available' | 'busy' | 'offline';
    maxConcurrentCalls: number;
    currentCalls: number;
}
export interface RoutingRule {
    id: string;
    condition: 'intent' | 'sentiment' | 'customer_tier' | 'time_of_day' | 'keyword';
    value: any;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between';
    action: 'route' | 'transfer' | 'voicemail' | 'callback';
    target: string;
    priority: number;
}
export interface CustomerContext {
    tenantId: string;
    customerId?: string;
    phoneNumber: string;
    email?: string;
    name?: string;
    tier: 'basic' | 'premium' | 'enterprise';
    history: CustomerInteraction[];
    preferences: CustomerPreferences;
    tags: string[];
}
export interface CustomerInteraction {
    id: string;
    timestamp: Date;
    type: 'call' | 'email' | 'chat' | 'ticket';
    department: string;
    agent?: string;
    outcome: 'resolved' | 'escalated' | 'callback' | 'abandoned';
    notes: string;
    duration: number;
    satisfaction?: number;
}
export interface CustomerPreferences {
    language: string;
    communicationMethod: 'call' | 'email' | 'sms';
    preferredDepartment?: string;
    doNotCall: boolean;
    doNotEmail: boolean;
}
export declare class TenantIVRService {
    private prisma;
    private redis;
    constructor(prisma: PrismaClient, redis: RedisClientType);
    createTenant(userId: string, companyName: string, tollFreeNumber: string, settings?: Partial<TenantSettings>): Promise<Tenant>;
    addDepartment(tenantId: string, departmentData: Omit<TenantDepartment, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Promise<TenantDepartment>;
    processTenantCall(tollFreeNumber: string, callerId: string, userInput?: string): Promise<any>;
    private routeToDepartment;
    private evaluateRoutingRule;
    private evaluateCondition;
    private analyzeIntent;
    private analyzeSentiment;
    private getDepartmentByIntent;
    private isBusinessHours;
    private getCustomerContext;
    private storeTenant;
    private getTenant;
    private getTenantByTollFreeNumber;
    private storeDepartment;
    getTenantDepartments(tenantId: string): Promise<TenantDepartment[]>;
    updateTenantSettings(tenantId: string, settings: Partial<TenantSettings>): Promise<void>;
    getTenantAnalytics(tenantId: string, startDate: Date, endDate: Date): Promise<any>;
}
//# sourceMappingURL=TenantIVRService.d.ts.map