import { PrismaClient } from '@prisma/client';
import { RedisClientType } from 'redis';
export interface PortingRequest {
    id: string;
    tenantId: string;
    phoneNumber: string;
    currentProvider: string;
    targetProvider: 'telnyx' | 'twilio';
    portingStatus: 'initiated' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
    portingId?: string;
    estimatedCompletionDate?: Date;
    actualCompletionDate?: Date;
    errorMessage?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface MigrationPlan {
    id: string;
    tenantId: string;
    migrationType: 'gradual' | 'cutover' | 'parallel';
    currentNumbers: string[];
    targetNumbers: string[];
    migrationSteps: MigrationStep[];
    status: 'planned' | 'in_progress' | 'completed' | 'failed';
    startDate?: Date;
    endDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface MigrationStep {
    stepNumber: number;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    startTime?: Date;
    endTime?: Date;
    errorMessage?: string;
}
export declare class PhoneNumberMigrationService {
    private prisma;
    private redis;
    constructor(prisma: PrismaClient, redis: RedisClientType);
    initiatePortingRequest(tenantId: string, phoneNumber: string, currentProvider: string, targetProvider: 'telnyx' | 'twilio'): Promise<{
        success: boolean;
        portingId?: string;
        error?: string;
    }>;
    private initiateProviderPorting;
    private initiateTelnyxPorting;
    private initiateTwilioPorting;
    createMigrationPlan(tenantId: string, migrationType: 'gradual' | 'cutover' | 'parallel', currentNumbers: string[], targetNumbers: string[]): Promise<{
        success: boolean;
        migrationPlanId?: string;
        error?: string;
    }>;
    private createMigrationSteps;
    executeMigrationStep(migrationPlanId: string, stepNumber: number): Promise<{
        success: boolean;
        error?: string;
    }>;
    private executeStepLogic;
    private setupParallelRouting;
    private testParallelRouting;
    private switchToNewSystem;
    private validateSystem;
    private monitorSystem;
    private decommissionOldSystem;
    getPortingStatus(portingId: string): Promise<{
        success: boolean;
        status?: any;
        error?: string;
    }>;
    getMigrationPlan(migrationPlanId: string): Promise<{
        success: boolean;
        plan?: any;
        error?: string;
    }>;
    private isValidPhoneNumber;
    handlePortingWebhook(provider: 'telnyx' | 'twilio', webhookData: any): Promise<{
        success: boolean;
        error?: string;
    }>;
    private handleTelnyxPortingWebhook;
    private handleTwilioPortingWebhook;
}
//# sourceMappingURL=PhoneNumberMigrationService.d.ts.map