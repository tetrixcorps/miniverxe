import { PrismaClient } from '@prisma/client';
import { RedisClientType } from 'redis';
export interface HITLConfig {
    id: string;
    userId: string;
    strategy: 'on_call' | 'ring_group' | 'business_hours' | 'agent_pool';
    primaryNumber: string;
    ringGroup?: string[];
    businessHours?: BusinessHours;
    agentPool?: Agent[];
    escalationRules: EscalationRule[];
    createdAt: Date;
    updatedAt: Date;
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
    forwardingNumber: string;
    voicemailEnabled: boolean;
}
export interface HolidaySchedule {
    date: string;
    name: string;
    enabled: boolean;
    forwardingNumber: string;
    voicemailEnabled: boolean;
}
export interface Agent {
    id: string;
    name: string;
    phoneNumber: string;
    skills: string[];
    availability: 'available' | 'busy' | 'offline';
    maxConcurrentCalls: number;
    currentCalls: number;
}
export interface EscalationRule {
    id: string;
    condition: 'intent' | 'sentiment' | 'duration' | 'keyword';
    value: string;
    action: 'transfer' | 'voicemail' | 'callback';
    target: string;
    priority: number;
}
export interface CallEscalation {
    id: string;
    callId: string;
    userId: string;
    reason: string;
    strategy: string;
    targetNumber: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    attempts: number;
    maxAttempts: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare class HITLService {
    private prisma;
    private redis;
    constructor(prisma: PrismaClient, redis: RedisClientType);
    createOnCallConfig(userId: string, businessNumber: string): Promise<HITLConfig>;
    createRingGroupConfig(userId: string, primaryNumber: string, ringGroup: string[], strategy?: 'simultaneous' | 'sequential'): Promise<HITLConfig>;
    createBusinessHoursConfig(userId: string, primaryNumber: string, businessHours: BusinessHours): Promise<HITLConfig>;
    createAgentPoolConfig(userId: string, primaryNumber: string, agents: Agent[]): Promise<HITLConfig>;
    processEscalation(callId: string, userId: string, reason: string, context: any): Promise<CallEscalation>;
    private determineEscalationTarget;
    private getBusinessHoursTarget;
    private getAgentPoolTarget;
    private isWithinBusinessHours;
    private isHoliday;
    private timeToMinutes;
    private extractRequiredSkills;
    private selectAgent;
    private executeEscalation;
    private storeHITLConfig;
    private getHITLConfig;
    private storeCallEscalation;
    private updateCallEscalation;
    private updateAgent;
    getEscalationHistory(userId: string, limit?: number): Promise<CallEscalation[]>;
    getEscalationStats(userId: string, startDate: Date, endDate: Date): Promise<any>;
}
//# sourceMappingURL=HITLService.d.ts.map