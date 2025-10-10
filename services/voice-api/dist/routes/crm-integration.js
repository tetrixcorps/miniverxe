"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const redis_1 = require("redis");
const CRMOAuthService_1 = require("../services/CRMOAuthService");
const CRMIntegrationService_1 = require("../services/CRMIntegrationService");
const logger_1 = __importDefault(require("../utils/logger"));
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const redis = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});
const crmOAuthService = new CRMOAuthService_1.CRMOAuthService(prisma, redis);
const crmIntegrationService = new CRMIntegrationService_1.CRMIntegrationService(prisma, redis);
router.post('/oauth/:crmType/authorize', async (req, res) => {
    try {
        const { crmType } = req.params;
        const { tenantId, state } = req.body;
        if (!tenantId) {
            return res.status(400).json({
                success: false,
                error: 'Tenant ID is required',
                metadata: {
                    timestamp: new Date().toISOString(),
                    service: 'crm-integration',
                    version: '1.0.0'
                }
            });
        }
        const result = await crmOAuthService.generateAuthUrl(tenantId, crmType, state);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error,
                metadata: {
                    timestamp: new Date().toISOString(),
                    service: 'crm-integration',
                    version: '1.0.0'
                }
            });
        }
        return res.json({
            success: true,
            data: {
                authUrl: result.authUrl,
                crmType: crmType,
                tenantId: tenantId
            },
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'crm-integration',
                version: '1.0.0'
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error generating OAuth URL:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to generate OAuth URL',
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'crm-integration',
                version: '1.0.0'
            }
        });
    }
});
router.post('/oauth/:crmType/callback', async (req, res) => {
    try {
        const { crmType } = req.params;
        const { tenantId, code, state } = req.body;
        if (!tenantId || !code || !state) {
            return res.status(400).json({
                success: false,
                error: 'Tenant ID, code, and state are required',
                metadata: {
                    timestamp: new Date().toISOString(),
                    service: 'crm-integration',
                    version: '1.0.0'
                }
            });
        }
        const result = await crmOAuthService.exchangeCodeForToken(tenantId, crmType, code, state);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error,
                metadata: {
                    timestamp: new Date().toISOString(),
                    service: 'crm-integration',
                    version: '1.0.0'
                }
            });
        }
        return res.json({
            success: true,
            data: {
                connectionId: result.connectionId,
                crmType: crmType,
                tenantId: tenantId,
                status: 'connected'
            },
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'crm-integration',
                version: '1.0.0'
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error handling OAuth callback:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to handle OAuth callback',
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'crm-integration',
                version: '1.0.0'
            }
        });
    }
});
router.get('/connections/:tenantId', async (req, res) => {
    try {
        const { tenantId } = req.params;
        const result = await crmOAuthService.getCRMConnections(tenantId);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error,
                metadata: {
                    timestamp: new Date().toISOString(),
                    service: 'crm-integration',
                    version: '1.0.0'
                }
            });
        }
        return res.json({
            success: true,
            data: result.connections,
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'crm-integration',
                version: '1.0.0'
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error getting CRM connections:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to get CRM connections',
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'crm-integration',
                version: '1.0.0'
            }
        });
    }
});
router.delete('/connections/:connectionId', async (req, res) => {
    try {
        const { connectionId } = req.params;
        const result = await crmOAuthService.deleteCRMConnection(connectionId);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error,
                metadata: {
                    timestamp: new Date().toISOString(),
                    service: 'crm-integration',
                    version: '1.0.0'
                }
            });
        }
        return res.json({
            success: true,
            data: {
                connectionId: connectionId,
                status: 'deleted'
            },
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'crm-integration',
                version: '1.0.0'
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error deleting CRM connection:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to delete CRM connection',
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'crm-integration',
                version: '1.0.0'
            }
        });
    }
});
router.post('/connections/:connectionId/test', async (req, res) => {
    try {
        const { connectionId } = req.params;
        const result = await crmOAuthService.testConnection(connectionId);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error,
                metadata: {
                    timestamp: new Date().toISOString(),
                    service: 'crm-integration',
                    version: '1.0.0'
                }
            });
        }
        return res.json({
            success: true,
            data: {
                connectionId: connectionId,
                status: 'tested',
                result: 'success'
            },
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'crm-integration',
                version: '1.0.0'
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error testing CRM connection:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to test CRM connection',
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'crm-integration',
                version: '1.0.0'
            }
        });
    }
});
router.post('/sync/contacts/:connectionId', async (req, res) => {
    try {
        const { connectionId } = req.params;
        const { tenantId } = req.body;
        if (!tenantId) {
            return res.status(400).json({
                success: false,
                error: 'Tenant ID is required',
                metadata: {
                    timestamp: new Date().toISOString(),
                    service: 'crm-integration',
                    version: '1.0.0'
                }
            });
        }
        const result = await crmIntegrationService.syncContactsFromCRM(tenantId, connectionId);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error,
                metadata: {
                    timestamp: new Date().toISOString(),
                    service: 'crm-integration',
                    version: '1.0.0'
                }
            });
        }
        return res.json({
            success: true,
            data: result.result,
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'crm-integration',
                version: '1.0.0'
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error syncing contacts:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to sync contacts',
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'crm-integration',
                version: '1.0.0'
            }
        });
    }
});
router.post('/sync/call-logs/:connectionId', async (req, res) => {
    try {
        const { connectionId } = req.params;
        const { tenantId, callLogs } = req.body;
        if (!tenantId || !callLogs) {
            return res.status(400).json({
                success: false,
                error: 'Tenant ID and call logs are required',
                metadata: {
                    timestamp: new Date().toISOString(),
                    service: 'crm-integration',
                    version: '1.0.0'
                }
            });
        }
        const result = await crmIntegrationService.syncCallLogsToCRM(tenantId, connectionId, callLogs);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error,
                metadata: {
                    timestamp: new Date().toISOString(),
                    service: 'crm-integration',
                    version: '1.0.0'
                }
            });
        }
        return res.json({
            success: true,
            data: result.result,
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'crm-integration',
                version: '1.0.0'
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error syncing call logs:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to sync call logs',
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'crm-integration',
                version: '1.0.0'
            }
        });
    }
});
router.get('/contacts/:tenantId/phone/:phoneNumber', async (req, res) => {
    try {
        const { tenantId, phoneNumber } = req.params;
        const result = await crmIntegrationService.getContactByPhone(tenantId, phoneNumber);
        if (!result.success) {
            return res.status(404).json({
                success: false,
                error: result.error,
                metadata: {
                    timestamp: new Date().toISOString(),
                    service: 'crm-integration',
                    version: '1.0.0'
                }
            });
        }
        return res.json({
            success: true,
            data: result.contact,
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'crm-integration',
                version: '1.0.0'
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error getting contact by phone:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to get contact by phone',
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'crm-integration',
                version: '1.0.0'
            }
        });
    }
});
router.post('/webhook/:crmType', async (req, res) => {
    try {
        const { crmType } = req.params;
        const webhookData = req.body;
        switch (crmType) {
            case 'salesforce':
                logger_1.default.info('Received Salesforce webhook:', webhookData);
                break;
            case 'hubspot':
                logger_1.default.info('Received HubSpot webhook:', webhookData);
                break;
            case 'pipedrive':
                logger_1.default.info('Received Pipedrive webhook:', webhookData);
                break;
            case 'zoho':
                logger_1.default.info('Received Zoho webhook:', webhookData);
                break;
            default:
                return res.status(400).json({
                    success: false,
                    error: 'Unsupported CRM type',
                    metadata: {
                        timestamp: new Date().toISOString(),
                        service: 'crm-integration',
                        version: '1.0.0'
                    }
                });
        }
        return res.json({
            success: true,
            data: {
                crmType: crmType,
                status: 'webhook_received'
            },
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'crm-integration',
                version: '1.0.0'
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error handling CRM webhook:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to handle CRM webhook',
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'crm-integration',
                version: '1.0.0'
            }
        });
    }
});
exports.default = router;
//# sourceMappingURL=crm-integration.js.map