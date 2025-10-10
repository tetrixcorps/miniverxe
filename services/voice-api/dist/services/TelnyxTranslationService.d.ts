import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import { Server } from 'socket.io';
export interface TranslationConfig {
    apiKey: string;
    inferenceBaseUrl: string;
    sttModel: string;
    ttsModel: string;
    translationModel: string;
}
export interface TranslationRequest {
    callControlId: string;
    audioData: Buffer;
    sourceLanguage?: string;
    targetLanguage: string;
    customerId: string;
    tier: 'basic' | 'premium' | 'enterprise';
}
export interface TranslationResponse {
    success: boolean;
    translatedAudio?: Buffer;
    translatedText?: string;
    sourceLanguage: string;
    targetLanguage: string;
    confidence: number;
    processingTime: number;
    cost: number;
    error?: string;
}
export interface LanguageDetectionResult {
    language: string;
    confidence: number;
    alternatives: Array<{
        language: string;
        confidence: number;
    }>;
}
export interface SupportedLanguage {
    code: string;
    name: string;
    nativeName: string;
    voiceModels: string[];
    sttModels: string[];
}
export declare class TelnyxTranslationService {
    private client;
    private prisma;
    private redis;
    private io;
    private config;
    private readonly TELNYX_COST_PER_MINUTE;
    private readonly MARKUP_PER_MINUTE;
    private readonly PREMIUM_TIER_COST;
    private readonly SUPPORTED_LANGUAGES;
    constructor(prisma: PrismaClient, redis: ReturnType<typeof createClient>, io: Server, config: TranslationConfig);
    private setupInterceptors;
    processRealTimeTranslation(request: TranslationRequest): Promise<TranslationResponse>;
    private performSpeechToText;
    private performTranslation;
    private performTextToSpeech;
    detectLanguage(audioData: Buffer): Promise<LanguageDetectionResult>;
    getSupportedLanguages(): SupportedLanguage[];
    isLanguageSupported(languageCode: string): boolean;
    private getSTTModel;
    private getTTSModel;
    private hasTranslationAccess;
    private calculateCost;
    private logTranslationUsage;
    private updateCustomerTranslationStats;
    getCustomerTranslationStats(customerId: string): Promise<any>;
    getTranslationUsageHistory(customerId: string, page?: number, limit?: number): Promise<{
        translations: any[];
        total: number;
        pages: number;
    }>;
    getTranslationPricing(): {
        telnyxCost: number;
        markup: number;
        totalCost: number;
        currency: string;
    };
    enableCallTranslation(callControlId: string, sourceLanguage: string, targetLanguage: string, customerId: string, tier: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    disableCallTranslation(callControlId: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    getCallTranslationConfig(callControlId: string): Promise<any>;
}
//# sourceMappingURL=TelnyxTranslationService.d.ts.map