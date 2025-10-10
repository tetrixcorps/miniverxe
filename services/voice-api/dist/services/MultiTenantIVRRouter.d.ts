import { PrismaClient } from '@prisma/client';
import { RedisClientType } from 'redis';
import { TenantIVRService } from './TenantIVRService';
import { DepartmentConfigurationService } from './DepartmentConfigurationService';
import { CRMIntegrationService } from './CRMIntegrationService';
export interface CallContext {
    callId: string;
    tenantId: string;
    tollFreeNumber: string;
    callerId: string;
    userInput?: string;
    timestamp: Date;
    sessionId: string;
    customerContext?: CustomerContext;
    routingHistory: RoutingDecision[];
    currentDepartment?: string;
    escalationLevel: number;
    maxEscalationLevel: number;
}
export interface CustomerContext {
    customerId?: string;
    name?: string;
    email?: string;
    phone: string;
    tier: 'basic' | 'premium' | 'enterprise';
    history: CustomerInteraction[];
    preferences: CustomerPreferences;
    tags: string[];
    lastInteraction?: Date;
    satisfactionScore?: number;
    isVIP: boolean;
    language: string;
    timezone: string;
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
    tags: string[];
}
export interface CustomerPreferences {
    language: string;
    communicationMethod: 'call' | 'email' | 'sms';
    preferredDepartment?: string;
    doNotCall: boolean;
    doNotEmail: boolean;
    preferredAgent?: string;
    callbackTime?: string;
}
export interface RoutingDecision {
    id: string;
    timestamp: Date;
    department: string;
    reason: string;
    confidence: number;
    customerTier: string;
    intent: string;
    sentiment: number;
    businessHours: boolean;
    agentAvailable: boolean;
    escalationLevel: number;
}
export interface RoutingResult {
    action: 'route' | 'transfer' | 'voicemail' | 'callback' | 'announcement' | 'escalate';
    department: string;
    agent?: string;
    message: string;
    phoneNumber?: string;
    callbackTime?: Date;
    escalationReason?: string;
    nextSteps?: string[];
    metadata: Record<string, any>;
}
export declare class MultiTenantIVRRouter {
    private prisma;
    private redis;
    private tenantIVRService;
    private departmentConfigService;
    private crmIntegrationService;
    constructor(prisma: PrismaClient, redis: RedisClientType, tenantIVRService: TenantIVRService, departmentConfigService: DepartmentConfigurationService, crmIntegrationService: CRMIntegrationService);
    routeCall(tollFreeNumber: string, callerId: string, userInput?: string): Promise<RoutingResult>;
    private identifyTenant;
    private createCallContext;
    private getCustomerContext;
    private analyzeCall;
    private analyzeIntent;
    private analyzeSentiment;
    private analyzeUrgency;
    private detectLanguage;
    private extractKeywords;
    private calculateKeywordScore;
    private calculateConfidence;
    private getAvailableDepartments;
    private applyRoutingRules;
    private evaluateRoutingRule;
    private getConditionValue;
    private evaluateCondition;
    private checkAvailability;
    private generateRoutingResult;
    private updateRoutingHistory;
    private logInteraction;
    private generateErrorResult;
    private getDepartmentPhoneNumber;
    private getNextBusinessDay;
}
//# sourceMappingURL=MultiTenantIVRRouter.d.ts.map