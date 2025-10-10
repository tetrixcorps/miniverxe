import { PrismaClient } from '@prisma/client';
import { RedisClientType } from 'redis';
export interface IVRMenu {
    id: string;
    userId: string;
    tollFreeNumber: string;
    name: string;
    greeting: string;
    options: IVROption[];
    timeout: number;
    maxRetries: number;
    language: string;
    voice: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface IVROption {
    id: string;
    key: string;
    text: string;
    action: 'transfer' | 'speak' | 'gather' | 'submenu' | 'hangup';
    target?: string;
    submenuId?: string;
    conditions?: IVRCondition[];
}
export interface IVRCondition {
    field: 'intent' | 'sentiment' | 'duration' | 'caller_id' | 'time_of_day';
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between';
    value: any;
}
export interface IVRSession {
    id: string;
    callId: string;
    userId: string;
    tollFreeNumber: string;
    menuId: string;
    currentMenu: string;
    path: string[];
    context: any;
    startTime: Date;
    lastActivity: Date;
    status: 'active' | 'completed' | 'abandoned' | 'transferred';
}
export interface CallAnalysis {
    id: string;
    callId: string;
    userId: string;
    transcript: string;
    intent: string;
    sentiment: number;
    entities: any[];
    keywords: string[];
    duration: number;
    escalationReason?: string;
    satisfactionScore?: number;
    createdAt: Date;
}
export interface RealTimeInsight {
    id: string;
    callId: string;
    userId: string;
    type: 'intent' | 'sentiment' | 'escalation' | 'satisfaction' | 'keyword';
    value: any;
    confidence: number;
    timestamp: Date;
    metadata: any;
}
export declare class IVRService {
    private prisma;
    private redis;
    private sttService;
    private ttsService;
    private hitlService;
    constructor(prisma: PrismaClient, redis: RedisClientType);
    setDependencies(sttService: any, ttsService: any, hitlService: any): void;
    createIVRMenu(userId: string, tollFreeNumber: string, name: string, greeting: string, options: Omit<IVROption, 'id'>[]): Promise<IVRMenu>;
    processIncomingCall(callId: string, tollFreeNumber: string, callerId: string): Promise<IVRSession>;
    processUserInput(sessionId: string, input: string, inputType?: 'dtmf' | 'speech'): Promise<any>;
    private playGreeting;
    private findMatchingOption;
    private evaluateConditions;
    private getFieldValue;
    private evaluateCondition;
    private executeOption;
    private handleTransfer;
    private handleSpeak;
    private handleGather;
    private handleSubmenu;
    private handleHangup;
    private handleNoMatch;
    private checkEscalationNeeded;
    private analyzeInput;
    private performRealTimeAnalysis;
    private extractIntent;
    private analyzeSentiment;
    private extractEntities;
    private extractKeywords;
    private storeRealTimeInsight;
    private storeIVRMenu;
    private getIVRMenu;
    private getIVRMenuByNumber;
    private storeIVRSession;
    private getIVRSession;
    private updateIVRSession;
}
//# sourceMappingURL=IVRService.d.ts.map