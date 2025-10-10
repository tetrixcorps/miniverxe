import { PrismaClient } from '@prisma/client';
import { RedisClientType } from 'redis';
export interface OnboardingSession {
    sessionId: string;
    industry: string;
    step: string;
    data: any;
    phoneNumber?: string;
    email?: string;
    companyName?: string;
    preferences: any;
    createdAt: Date;
    updatedAt: Date;
}
export declare class DynamicOnboardingService {
    private prisma;
    private redis;
    private industryIVRService;
    constructor(prisma: PrismaClient, redis: RedisClientType);
    startOnboardingSession(phoneNumber: string, industry?: string): Promise<{
        success: boolean;
        sessionId?: string;
        error?: string;
    }>;
    getOnboardingSession(sessionId: string): Promise<OnboardingSession | null>;
    updateOnboardingSession(sessionId: string, updates: Partial<OnboardingSession>): Promise<{
        success: boolean;
        error?: string;
    }>;
    processOnboardingStep(sessionId: string, step: string, input: any): Promise<{
        success: boolean;
        response?: string;
        nextStep?: string;
        error?: string;
    }>;
    private getWelcomeMessage;
    private getIndustryConfirmationMessage;
    private getCompanyInfoConfirmationMessage;
    private getContactInfoConfirmationMessage;
    private getRequirementsConfirmationMessage;
    private getPricingMessage;
    private getCompletionMessage;
    completeOnboarding(session: OnboardingSession): Promise<{
        success: boolean;
        tenantId?: string;
        error?: string;
    }>;
    getOnboardingStatus(sessionId: string): Promise<{
        success: boolean;
        status?: any;
        error?: string;
    }>;
    private calculateProgress;
    handleTollFreeCall(phoneNumber: string): Promise<{
        success: boolean;
        response?: string;
        sessionId?: string;
        error?: string;
    }>;
}
//# sourceMappingURL=DynamicOnboardingService.d.ts.map