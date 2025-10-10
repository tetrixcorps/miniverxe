import { PrismaClient } from '@prisma/client';
import { RedisClientType } from 'redis';
export interface STTConfig {
    apiKey: string;
    apiBase: string;
    model: string;
}
export interface STTRequest {
    audio: string;
    language?: string;
    model?: string;
}
export interface STTResponse {
    text: string;
    confidence: number;
    language: string;
    duration: number;
}
export declare class STTService {
    private prisma;
    private redis;
    private config;
    constructor(prisma: PrismaClient, redis: RedisClientType, config: STTConfig);
    transcribe(request: STTRequest): Promise<STTResponse>;
    startTranscriptionStream(sessionId: string): Promise<void>;
    stopTranscriptionStream(sessionId: string): Promise<void>;
    getTranscriptionStatus(sessionId: string): Promise<string>;
    getTranscriptionHistory(userId: string, limit?: number): Promise<any[]>;
    getTranscriptionCost(userId: string, startDate: Date, endDate: Date): Promise<number>;
    getTranscriptionModels(): Promise<string[]>;
}
//# sourceMappingURL=STTService.d.ts.map