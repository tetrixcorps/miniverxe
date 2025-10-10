"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CRMOAuthService = void 0;
const axios_1 = __importDefault(require("axios"));
const logger_1 = __importDefault(require("../utils/logger"));
class CRMOAuthService {
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
        this.oauthConfigs = {};
        this.initializeOAuthConfigs();
    }
    initializeOAuthConfigs() {
        this.oauthConfigs = {
            salesforce: {
                clientId: process.env.SALESFORCE_CLIENT_ID || '',
                clientSecret: process.env.SALESFORCE_CLIENT_SECRET || '',
                redirectUri: process.env.SALESFORCE_REDIRECT_URI || '',
                scope: ['api', 'refresh_token', 'id'],
                authUrl: 'https://login.salesforce.com/services/oauth2/authorize',
                tokenUrl: 'https://login.salesforce.com/services/oauth2/token',
                apiBaseUrl: 'https://api.salesforce.com'
            },
            hubspot: {
                clientId: process.env.HUBSPOT_CLIENT_ID || '',
                clientSecret: process.env.HUBSPOT_CLIENT_SECRET || '',
                redirectUri: process.env.HUBSPOT_REDIRECT_URI || '',
                scope: ['crm.objects.contacts.read', 'crm.objects.contacts.write', 'crm.objects.deals.read', 'crm.objects.deals.write'],
                authUrl: 'https://app.hubspot.com/oauth/authorize',
                tokenUrl: 'https://api.hubapi.com/oauth/v1/token',
                apiBaseUrl: 'https://api.hubapi.com'
            },
            pipedrive: {
                clientId: process.env.PIPEDRIVE_CLIENT_ID || '',
                clientSecret: process.env.PIPEDRIVE_CLIENT_SECRET || '',
                redirectUri: process.env.PIPEDRIVE_REDIRECT_URI || '',
                scope: ['read', 'write'],
                authUrl: 'https://oauth.pipedrive.com/oauth/authorize',
                tokenUrl: 'https://oauth.pipedrive.com/oauth/token',
                apiBaseUrl: 'https://api.pipedrive.com/v1'
            },
            zoho: {
                clientId: process.env.ZOHO_CLIENT_ID || '',
                clientSecret: process.env.ZOHO_CLIENT_SECRET || '',
                redirectUri: process.env.ZOHO_REDIRECT_URI || '',
                scope: ['ZohoCRM.modules.ALL', 'ZohoCRM.users.ALL'],
                authUrl: 'https://accounts.zoho.com/oauth/v2/auth',
                tokenUrl: 'https://accounts.zoho.com/oauth/v2/token',
                apiBaseUrl: 'https://www.zohoapis.com/crm/v2'
            }
        };
    }
    async generateAuthUrl(tenantId, crmType, state) {
        try {
            const config = this.oauthConfigs[crmType];
            if (!config) {
                return { success: false, error: 'Unsupported CRM type' };
            }
            const stateParam = state || `${tenantId}_${crmType}_${Date.now()}`;
            await this.redis.setEx(`oauth_state:${stateParam}`, 600, JSON.stringify({ tenantId, crmType, timestamp: Date.now() }));
            const params = new URLSearchParams({
                response_type: 'code',
                client_id: config.clientId,
                redirect_uri: config.redirectUri,
                scope: config.scope.join(' '),
                state: stateParam
            });
            const authUrl = `${config.authUrl}?${params.toString()}`;
            logger_1.default.info(`Generated OAuth URL for ${crmType}: ${tenantId}`);
            return { success: true, authUrl };
        }
        catch (error) {
            logger_1.default.error('Error generating OAuth URL:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async exchangeCodeForToken(tenantId, crmType, code, state) {
        try {
            const stateData = await this.redis.get(`oauth_state:${state}`);
            if (!stateData) {
                return { success: false, error: 'Invalid or expired state' };
            }
            const { tenantId: storedTenantId, crmType: storedCrmType } = JSON.parse(stateData);
            if (storedTenantId !== tenantId || storedCrmType !== crmType) {
                return { success: false, error: 'State validation failed' };
            }
            const config = this.oauthConfigs[crmType];
            if (!config) {
                return { success: false, error: 'Unsupported CRM type' };
            }
            const tokenResponse = await axios_1.default.post(config.tokenUrl, {
                grant_type: 'authorization_code',
                client_id: config.clientId,
                client_secret: config.clientSecret,
                redirect_uri: config.redirectUri,
                code: code
            }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            const tokenData = tokenResponse.data;
            const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000));
            const oauthToken = {
                accessToken: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
                expiresAt: expiresAt,
                scope: tokenData.scope ? tokenData.scope.split(' ') : config.scope,
                tokenType: tokenData.token_type || 'Bearer'
            };
            const connection = await this.prisma.crmConnection.create({
                data: {
                    tenantId: tenantId,
                    crmType: crmType,
                    oauthToken: oauthToken,
                    configuration: {},
                    status: 'active',
                    lastSyncAt: new Date()
                }
            });
            await this.redis.del(`oauth_state:${state}`);
            logger_1.default.info(`OAuth token exchanged successfully for ${crmType}: ${connection.id}`);
            return { success: true, connectionId: connection.id };
        }
        catch (error) {
            logger_1.default.error('Error exchanging code for token:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async refreshToken(connectionId) {
        try {
            const connection = await this.prisma.crmConnection.findUnique({
                where: { id: connectionId }
            });
            if (!connection) {
                return { success: false, error: 'Connection not found' };
            }
            const config = this.oauthConfigs[connection.crmType];
            if (!config) {
                return { success: false, error: 'Unsupported CRM type' };
            }
            const tokenResponse = await axios_1.default.post(config.tokenUrl, {
                grant_type: 'refresh_token',
                client_id: config.clientId,
                client_secret: config.clientSecret,
                refresh_token: connection.oauthToken.refreshToken
            }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            const tokenData = tokenResponse.data;
            const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000));
            const updatedOAuthToken = {
                accessToken: tokenData.access_token,
                refreshToken: tokenData.refresh_token || connection.oauthToken.refreshToken,
                expiresAt: expiresAt,
                scope: tokenData.scope ? tokenData.scope.split(' ') : connection.oauthToken.scope,
                tokenType: tokenData.token_type || connection.oauthToken.tokenType
            };
            await this.prisma.crmConnection.update({
                where: { id: connectionId },
                data: {
                    oauthToken: updatedOAuthToken,
                    status: 'active',
                    updatedAt: new Date()
                }
            });
            logger_1.default.info(`Token refreshed successfully for connection: ${connectionId}`);
            return { success: true };
        }
        catch (error) {
            logger_1.default.error('Error refreshing token:', error);
            await this.prisma.crmConnection.update({
                where: { id: connectionId },
                data: { status: 'expired' }
            });
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async getValidToken(connectionId) {
        try {
            const connection = await this.prisma.crmConnection.findUnique({
                where: { id: connectionId }
            });
            if (!connection) {
                return { success: false, error: 'Connection not found' };
            }
            if (connection.oauthToken.expiresAt <= new Date()) {
                const refreshResult = await this.refreshToken(connectionId);
                if (!refreshResult.success) {
                    return { success: false, error: refreshResult.error };
                }
                const updatedConnection = await this.prisma.crmConnection.findUnique({
                    where: { id: connectionId }
                });
                if (!updatedConnection) {
                    return { success: false, error: 'Connection not found after refresh' };
                }
                return { success: true, token: updatedConnection.oauthToken.accessToken };
            }
            return { success: true, token: connection.oauthToken.accessToken };
        }
        catch (error) {
            logger_1.default.error('Error getting valid token:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async getCRMConnections(tenantId) {
        try {
            const connections = await this.prisma.crmConnection.findMany({
                where: { tenantId: tenantId }
            });
            return { success: true, connections };
        }
        catch (error) {
            logger_1.default.error('Error getting CRM connections:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async deleteCRMConnection(connectionId) {
        try {
            await this.prisma.crmConnection.delete({
                where: { id: connectionId }
            });
            logger_1.default.info(`CRM connection deleted: ${connectionId}`);
            return { success: true };
        }
        catch (error) {
            logger_1.default.error('Error deleting CRM connection:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async testConnection(connectionId) {
        try {
            const connection = await this.prisma.crmConnection.findUnique({
                where: { id: connectionId }
            });
            if (!connection) {
                return { success: false, error: 'Connection not found' };
            }
            const tokenResult = await this.getValidToken(connectionId);
            if (!tokenResult.success) {
                return { success: false, error: tokenResult.error };
            }
            const config = this.oauthConfigs[connection.crmType];
            if (!config) {
                return { success: false, error: 'Unsupported CRM type' };
            }
            let testUrl = '';
            switch (connection.crmType) {
                case 'salesforce':
                    testUrl = `${config.apiBaseUrl}/services/data/v58.0/sobjects/Account/describe`;
                    break;
                case 'hubspot':
                    testUrl = `${config.apiBaseUrl}/crm/v3/objects/contacts?limit=1`;
                    break;
                case 'pipedrive':
                    testUrl = `${config.apiBaseUrl}/users/me`;
                    break;
                case 'zoho':
                    testUrl = `${config.apiBaseUrl}/settings/modules`;
                    break;
            }
            const response = await axios_1.default.get(testUrl, {
                headers: {
                    'Authorization': `Bearer ${tokenResult.token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.status === 200) {
                await this.prisma.crmConnection.update({
                    where: { id: connectionId },
                    data: { status: 'active', lastSyncAt: new Date() }
                });
                return { success: true };
            }
            else {
                return { success: false, error: 'API test failed' };
            }
        }
        catch (error) {
            logger_1.default.error('Error testing connection:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
}
exports.CRMOAuthService = CRMOAuthService;
//# sourceMappingURL=CRMOAuthService.js.map