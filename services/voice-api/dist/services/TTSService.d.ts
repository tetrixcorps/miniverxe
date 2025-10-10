import { PrismaClient } from '@prisma/client';
import { RedisClientType } from 'redis';
export interface TTSConfig {
    apiKey: string;
    apiBase: string;
    model: string;
}
export interface TTSRequest {
    text: string;
    voice?: string;
    language?: string;
    model?: string;
    speed?: number;
}
export interface TTSResponse {
    audio: string;
    duration: number;
    voice: string;
    language: string;
}
export declare class TTSService {
    private prisma;
    private redis;
    private config;
    constructor(prisma: PrismaClient, redis: RedisClientType, config: TTSConfig);
    synthesizeSpeech(request: TTSRequest): Promise<TTSResponse>;
    getVoiceOptions(): Promise<string[]>;
    getLanguageOptions(): Promise<string[]>;
    getTTSCost(userId: string, startDate: Date, endDate: Date): Promise<number>;
}
//# sourceMappingURL=TTSService.d.ts.map