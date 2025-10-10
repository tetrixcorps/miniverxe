import { PrismaClient } from '@prisma/client';
import { RedisClientType } from 'redis';
export interface AgentRoutingDecision {
    agentType: 'sales' | 'support' | 'billing';
    confidence: number;
    reason: string;
    department: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
}
export interface CallContext {
    callerId: string;
    userId?: string;
    tollFreeNumber: string;
    previousInteractions: any[];
    customerTier?: 'basic' | 'premium' | 'enterprise';
    timeOfDay: string;
    dayOfWeek: string;
}
export declare class AgentRoutingService {
    private prisma;
    private redis;
    constructor(prisma: PrismaClient, redis: RedisClientType);
    routeCall(callId: string, userInput: string, context: CallContext): Promise<AgentRoutingDecision>;
    private analyzeUserInput;
    private analyzeIntent;
    private analyzeSentiment;
    private extractKeywords;
    private analyzeUrgency;
    private calculatePatternScore;
    private determineAgentType;
    private calculateConfidence;
    private calculateIntentConfidence;
    private determinePriority;
    private getDepartmentInfo;
    private generateReason;
    private logRoutingDecision;
    getRoutingStats(startDate: Date, endDate: Date): Promise<any>;
    getRoutingLogs(startDate: Date, endDate: Date, limit?: number): Promise<any[]>;
}
//# sourceMappingURL=AgentRoutingService.d.ts.map