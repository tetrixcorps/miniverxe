import { PrismaClient } from '@prisma/client';
import { RedisClientType } from 'redis';
export interface IndustryConfig {
    industry: string;
    features: string[];
    departments: string[];
    greetings: Record<string, string>;
    routingRules: Record<string, any>;
    integrations: string[];
    pricing: {
        basePrice: number;
        perMinuteRate: number;
        includedMinutes: number;
        features: Record<string, number>;
    };
}
export declare class IndustryIVRService {
    private prisma;
    private redis;
    constructor(prisma: PrismaClient, redis: RedisClientType);
    private industryConfigs;
    getIndustryConfig(industry: string): Promise<IndustryConfig | null>;
    getAllIndustries(): Promise<string[]>;
    createIndustryTenant(industry: string, tenantData: any): Promise<{
        success: boolean;
        tenantId?: string;
        error?: string;
    }>;
    updateIndustryConfiguration(tenantId: string, industry: string, updates: Partial<IndustryConfig>): Promise<{
        success: boolean;
        error?: string;
    }>;
    getIndustryPricing(industry: string): Promise<any>;
    calculateIndustryCost(industry: string, minutes: number, features: string[]): Promise<any>;
}
//# sourceMappingURL=IndustryIVRService.d.ts.map