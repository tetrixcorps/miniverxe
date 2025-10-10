import { PrismaClient } from '@prisma/client';
import { RedisClientType } from 'redis';
export interface OAuthConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scope: string[];
    authUrl: string;
    tokenUrl: string;
    apiBaseUrl: string;
}
export interface OAuthToken {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
    scope: string[];
    tokenType: string;
}
export interface CRMConnection {
    id: string;
    tenantId: string;
    crmType: 'salesforce' | 'hubspot' | 'pipedrive' | 'zoho';
    oauthToken: OAuthToken;
    configuration: any;
    status: 'active' | 'expired' | 'error';
    lastSyncAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare class CRMOAuthService {
    private prisma;
    private redis;
    private oauthConfigs;
    constructor(prisma: PrismaClient, redis: RedisClientType);
    private initializeOAuthConfigs;
    generateAuthUrl(tenantId: string, crmType: string, state?: string): Promise<{
        success: boolean;
        authUrl?: string;
        error?: string;
    }>;
    exchangeCodeForToken(tenantId: string, crmType: string, code: string, state: string): Promise<{
        success: boolean;
        connectionId?: string;
        error?: string;
    }>;
    refreshToken(connectionId: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    getValidToken(connectionId: string): Promise<{
        success: boolean;
        token?: string;
        error?: string;
    }>;
    getCRMConnections(tenantId: string): Promise<{
        success: boolean;
        connections?: CRMConnection[];
        error?: string;
    }>;
    deleteCRMConnection(connectionId: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    testConnection(connectionId: string): Promise<{
        success: boolean;
        error?: string;
    }>;
}
//# sourceMappingURL=CRMOAuthService.d.ts.map