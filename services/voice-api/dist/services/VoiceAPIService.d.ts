import { PrismaClient } from '@prisma/client';
import { RedisClientType } from 'redis';
export interface VoiceCall {
    id: string;
    callId: string;
    from: string;
    to: string;
    status: 'initiated' | 'ringing' | 'answered' | 'completed' | 'failed';
    direction: 'inbound' | 'outbound';
    userId?: string;
    tollFreeNumber?: string;
    metadata: any;
    createdAt: Date;
    updatedAt: Date;
}
export interface VoiceResponse {
    success: boolean;
    data?: any;
    error?: string;
}
export interface TelnyxConfig {
    apiKey: string;
    baseUrl: string;
    webhookUrl: string;
}
export declare class VoiceAPIService {
    private prisma;
    private redis;
    private telnyxConfig;
    constructor(prisma: PrismaClient, redis: RedisClientType);
    initialize(): Promise<void>;
    private testTelnyxConnection;
    createOutboundCall(from: string, to: string, userId?: string): Promise<VoiceResponse>;
    answerCall(callId: string): Promise<VoiceResponse>;
    hangupCall(callId: string): Promise<VoiceResponse>;
    transferCall(callId: string, to: string): Promise<VoiceResponse>;
    playAudio(callId: string, audioUrl: string): Promise<VoiceResponse>;
    speakText(callId: string, text: string, voice?: string): Promise<VoiceResponse>;
    gatherInput(callId: string, maxDigits?: number, timeout?: number): Promise<VoiceResponse>;
    startRecording(callId: string, channels?: 'single' | 'dual'): Promise<VoiceResponse>;
    stopRecording(callId: string): Promise<VoiceResponse>;
    getCallStatus(callId: string): Promise<VoiceResponse>;
    getCallRecordings(callId: string): Promise<VoiceResponse>;
    processWebhook(webhookData: any): Promise<VoiceResponse>;
    private handleCallInitiated;
    private handleCallAnswered;
    private handleCallHangup;
    private handleCallRecordingSaved;
    private handleCallGatherEnded;
    private storeCall;
    private updateCallStatus;
    private loadVoiceTemplates;
    getCall(callId: string): Promise<VoiceCall | null>;
    getCallsByUser(userId: string): Promise<VoiceCall[]>;
    getCallsByTollFreeNumber(tollFreeNumber: string): Promise<VoiceCall[]>;
}
//# sourceMappingURL=VoiceAPIService.d.ts.map