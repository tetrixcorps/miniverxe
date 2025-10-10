import { PrismaClient } from '@prisma/client';
import { RedisClientType } from 'redis';
export interface DepartmentTemplate {
    id: string;
    name: string;
    type: 'sales' | 'support' | 'billing' | 'technical' | 'custom';
    description: string;
    plan: 'basic' | 'premium' | 'enterprise';
    features: string[];
    defaultConfig: DepartmentConfig;
    routingRules: RoutingRuleTemplate[];
    agentTemplates: AgentTemplate[];
}
export interface DepartmentConfig {
    name: string;
    type: string;
    phoneNumber: string;
    email: string;
    greeting: string;
    businessHours: BusinessHoursConfig;
    agents: AgentConfig[];
    routingRules: RoutingRuleConfig[];
    priority: number;
    active: boolean;
    customFields: Record<string, any>;
    integrations: IntegrationConfig[];
}
export interface BusinessHoursConfig {
    timezone: string;
    weekdays: DaySchedule;
    weekends: DaySchedule;
    holidays: HolidaySchedule[];
    emergencyContact?: string;
}
export interface DaySchedule {
    enabled: boolean;
    startTime: string;
    endTime: string;
    greeting: string;
    afterHoursGreeting: string;
    breakTimes?: BreakTime[];
}
export interface BreakTime {
    startTime: string;
    endTime: string;
    greeting: string;
}
export interface HolidaySchedule {
    date: string;
    name: string;
    enabled: boolean;
    greeting: string;
    specialHours?: DaySchedule;
}
export interface AgentConfig {
    id: string;
    name: string;
    phoneNumber: string;
    email: string;
    skills: string[];
    availability: 'available' | 'busy' | 'offline' | 'break';
    maxConcurrentCalls: number;
    currentCalls: number;
    schedule: AgentSchedule;
    customFields: Record<string, any>;
}
export interface AgentSchedule {
    timezone: string;
    workDays: number[];
    startTime: string;
    endTime: string;
    breaks: BreakTime[];
    timeOff: TimeOffPeriod[];
}
export interface TimeOffPeriod {
    startDate: string;
    endDate: string;
    reason: string;
    type: 'vacation' | 'sick' | 'personal' | 'training';
}
export interface RoutingRuleConfig {
    id: string;
    name: string;
    condition: RoutingCondition;
    action: RoutingAction;
    priority: number;
    active: boolean;
    description: string;
}
export interface RoutingCondition {
    type: 'intent' | 'sentiment' | 'customer_tier' | 'time_of_day' | 'keyword' | 'caller_id' | 'department_load';
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in';
    value: any;
    additionalConditions?: RoutingCondition[];
}
export interface RoutingAction {
    type: 'route' | 'transfer' | 'voicemail' | 'callback' | 'queue' | 'announcement';
    target: string;
    parameters: Record<string, any>;
    fallback?: RoutingAction;
}
export interface IntegrationConfig {
    type: 'crm' | 'ticket_system' | 'calendar' | 'notification' | 'analytics';
    provider: string;
    config: Record<string, any>;
    enabled: boolean;
}
export interface RoutingRuleTemplate {
    id: string;
    name: string;
    condition: RoutingCondition;
    action: RoutingAction;
    priority: number;
    description: string;
}
export interface AgentTemplate {
    id: string;
    name: string;
    skills: string[];
    maxConcurrentCalls: number;
    schedule: AgentSchedule;
    description: string;
}
export declare class DepartmentConfigurationService {
    private prisma;
    private redis;
    private departmentTemplates;
    constructor(prisma: PrismaClient, redis: RedisClientType);
    private initializeTemplates;
    createDepartmentFromTemplate(tenantId: string, templateId: string, customizations?: Partial<DepartmentConfig>): Promise<DepartmentConfig>;
    createCustomDepartment(tenantId: string, config: DepartmentConfig): Promise<DepartmentConfig>;
    updateDepartmentConfig(tenantId: string, departmentId: string, updates: Partial<DepartmentConfig>): Promise<DepartmentConfig>;
    getDepartmentConfig(tenantId: string, departmentId: string): Promise<DepartmentConfig | null>;
    getTenantDepartmentConfigs(tenantId: string): Promise<DepartmentConfig[]>;
    deleteDepartment(tenantId: string, departmentId: string): Promise<void>;
    getAvailableTemplates(plan: string): DepartmentTemplate[];
    private validateDepartmentConfig;
    private createAgentsFromTemplates;
    private createRoutingRulesFromTemplates;
    private isTemplateAvailableForPlan;
    private generatePhoneNumber;
    private getDefaultBusinessHours;
    private getDefaultAgentSchedule;
    private storeDepartmentConfig;
}
//# sourceMappingURL=DepartmentConfigurationService.d.ts.map