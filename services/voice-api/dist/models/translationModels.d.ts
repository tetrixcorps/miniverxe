import { PrismaClient } from '@prisma/client';
export interface TranslationUsage {
    id: number;
    call_control_id: string;
    customer_id: string;
    source_language: string;
    target_language: string;
    original_text: string;
    translated_text: string;
    processing_time_ms: number;
    cost: number;
    tier: string;
    created_at: Date;
}
export interface CustomerTranslationStats {
    id: number;
    customer_id: string;
    total_translations: number;
    total_cost: number;
    last_translation_at: Date;
    created_at: Date;
    updated_at: Date;
}
export interface TranslationConfig {
    id: number;
    customer_id: string;
    default_source_language: string;
    default_target_language: string;
    auto_detect_language: boolean;
    enabled: boolean;
    created_at: Date;
    updated_at: Date;
}
export interface TranslationPricing {
    tier: string;
    telnyx_cost_per_minute: number;
    markup_per_minute: number;
    total_cost_per_minute: number;
    currency: string;
    features: string[];
}
export interface TranslationMetrics {
    totalTranslations: number;
    totalCost: number;
    averageProcessingTime: number;
    languageDistribution: Record<string, number>;
    costByTier: Record<string, number>;
    translationsToday: number;
    translationsThisMonth: number;
    topLanguagePairs: Array<{
        pair: string;
        count: number;
    }>;
}
export declare class TranslationDatabaseService {
    private prisma;
    constructor(prisma: PrismaClient);
    createTranslationUsage(usageData: Partial<TranslationUsage>): Promise<TranslationUsage>;
    getTranslationUsage(customerId: string, page?: number, limit?: number): Promise<{
        translations: TranslationUsage[];
        total: number;
        pages: number;
    }>;
    getTranslationUsageByCall(callControlId: string): Promise<TranslationUsage[]>;
    getTranslationUsageByDateRange(customerId: string, startDate: Date, endDate: Date): Promise<TranslationUsage[]>;
    createCustomerTranslationStats(statsData: Partial<CustomerTranslationStats>): Promise<CustomerTranslationStats>;
    updateCustomerTranslationStats(customerId: string, updateData: Partial<CustomerTranslationStats>): Promise<CustomerTranslationStats>;
    getCustomerTranslationStats(customerId: string): Promise<CustomerTranslationStats | null>;
    incrementCustomerTranslationStats(customerId: string, cost: number): Promise<CustomerTranslationStats>;
    createTranslationConfig(configData: Partial<TranslationConfig>): Promise<TranslationConfig>;
    updateTranslationConfig(customerId: string, updateData: Partial<TranslationConfig>): Promise<TranslationConfig>;
    getTranslationConfig(customerId: string): Promise<TranslationConfig | null>;
    deleteTranslationConfig(customerId: string): Promise<void>;
    getTranslationMetrics(customerId?: string): Promise<TranslationMetrics>;
    private getTotalTranslations;
    private getTotalCost;
    private getAverageProcessingTime;
    private getLanguageDistribution;
    private getCostByTier;
    private getTranslationsToday;
    private getTranslationsThisMonth;
    private getTopLanguagePairs;
    getCustomerTranslationCosts(customerId: string, startDate: Date, endDate: Date): Promise<{
        totalCost: number;
        translationCount: number;
        averageCost: number;
    }>;
    getTranslationCostsByTier(startDate: Date, endDate: Date): Promise<Record<string, {
        totalCost: number;
        translationCount: number;
    }>>;
    cleanupOldTranslationData(daysOld?: number): Promise<number>;
    exportTranslationData(customerId: string, startDate: Date, endDate: Date): Promise<TranslationUsage[]>;
    getTranslationPricing(): TranslationPricing[];
}
//# sourceMappingURL=translationModels.d.ts.map