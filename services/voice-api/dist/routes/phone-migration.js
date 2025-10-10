"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const redis_1 = require("redis");
const PhoneNumberMigrationService_1 = require("../services/PhoneNumberMigrationService");
const logger_1 = __importDefault(require("../utils/logger"));
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const redis = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});
const phoneMigrationService = new PhoneNumberMigrationService_1.PhoneNumberMigrationService(prisma, redis);
router.post('/porting/initiate', async (req, res) => {
    try {
        const { tenantId, phoneNumber, currentProvider, targetProvider } = req.body;
        if (!tenantId || !phoneNumber || !currentProvider || !targetProvider) {
            return res.status(400).json({
                success: false,
                error: 'Tenant ID, phone number, current provider, and target provider are required',
                metadata: {
                    timestamp: new Date().toISOString(),
                    service: 'phone-migration',
                    version: '1.0.0'
                }
            });
        }
        const result = await phoneMigrationService.initiatePortingRequest(tenantId, phoneNumber, currentProvider, targetProvider);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error,
                metadata: {
                    timestamp: new Date().toISOString(),
                    service: 'phone-migration',
                    version: '1.0.0'
                }
            });
        }
        return res.json({
            success: true,
            data: {
                portingId: result.portingId,
                phoneNumber: phoneNumber,
                currentProvider: currentProvider,
                targetProvider: targetProvider,
                status: 'initiated'
            },
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'phone-migration',
                version: '1.0.0'
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error initiating porting request:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to initiate porting request',
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'phone-migration',
                version: '1.0.0'
            }
        });
    }
});
router.get('/porting/:portingId/status', async (req, res) => {
    try {
        const { portingId } = req.params;
        const result = await phoneMigrationService.getPortingStatus(portingId);
        if (!result.success) {
            return res.status(404).json({
                success: false,
                error: result.error,
                metadata: {
                    timestamp: new Date().toISOString(),
                    service: 'phone-migration',
                    version: '1.0.0'
                }
            });
        }
        return res.json({
            success: true,
            data: result.status,
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'phone-migration',
                version: '1.0.0'
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error getting porting status:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to get porting status',
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'phone-migration',
                version: '1.0.0'
            }
        });
    }
});
router.post('/migration/plan', async (req, res) => {
    try {
        const { tenantId, migrationType, currentNumbers, targetNumbers } = req.body;
        if (!tenantId || !migrationType || !currentNumbers || !targetNumbers) {
            return res.status(400).json({
                success: false,
                error: 'Tenant ID, migration type, current numbers, and target numbers are required',
                metadata: {
                    timestamp: new Date().toISOString(),
                    service: 'phone-migration',
                    version: '1.0.0'
                }
            });
        }
        const result = await phoneMigrationService.createMigrationPlan(tenantId, migrationType, currentNumbers, targetNumbers);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error,
                metadata: {
                    timestamp: new Date().toISOString(),
                    service: 'phone-migration',
                    version: '1.0.0'
                }
            });
        }
        return res.json({
            success: true,
            data: {
                migrationPlanId: result.migrationPlanId,
                tenantId: tenantId,
                migrationType: migrationType,
                status: 'planned'
            },
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'phone-migration',
                version: '1.0.0'
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error creating migration plan:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to create migration plan',
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'phone-migration',
                version: '1.0.0'
            }
        });
    }
});
router.get('/migration/:migrationPlanId', async (req, res) => {
    try {
        const { migrationPlanId } = req.params;
        const result = await phoneMigrationService.getMigrationPlan(migrationPlanId);
        if (!result.success) {
            return res.status(404).json({
                success: false,
                error: result.error,
                metadata: {
                    timestamp: new Date().toISOString(),
                    service: 'phone-migration',
                    version: '1.0.0'
                }
            });
        }
        return res.json({
            success: true,
            data: result.plan,
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'phone-migration',
                version: '1.0.0'
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error getting migration plan:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to get migration plan',
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'phone-migration',
                version: '1.0.0'
            }
        });
    }
});
router.post('/migration/:migrationPlanId/execute/:stepNumber', async (req, res) => {
    try {
        const { migrationPlanId, stepNumber } = req.params;
        const result = await phoneMigrationService.executeMigrationStep(migrationPlanId, parseInt(stepNumber));
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error,
                metadata: {
                    timestamp: new Date().toISOString(),
                    service: 'phone-migration',
                    version: '1.0.0'
                }
            });
        }
        return res.json({
            success: true,
            data: {
                migrationPlanId: migrationPlanId,
                stepNumber: parseInt(stepNumber),
                status: 'executed'
            },
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'phone-migration',
                version: '1.0.0'
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error executing migration step:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to execute migration step',
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'phone-migration',
                version: '1.0.0'
            }
        });
    }
});
router.post('/webhook/:provider', async (req, res) => {
    try {
        const { provider } = req.params;
        const webhookData = req.body;
        if (provider !== 'telnyx' && provider !== 'twilio') {
            return res.status(400).json({
                success: false,
                error: 'Unsupported provider',
                metadata: {
                    timestamp: new Date().toISOString(),
                    service: 'phone-migration',
                    version: '1.0.0'
                }
            });
        }
        const result = await phoneMigrationService.handlePortingWebhook(provider, webhookData);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error,
                metadata: {
                    timestamp: new Date().toISOString(),
                    service: 'phone-migration',
                    version: '1.0.0'
                }
            });
        }
        return res.json({
            success: true,
            data: {
                provider: provider,
                status: 'webhook_processed'
            },
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'phone-migration',
                version: '1.0.0'
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error handling porting webhook:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to handle porting webhook',
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'phone-migration',
                version: '1.0.0'
            }
        });
    }
});
router.get('/migration/:migrationPlanId/progress', async (req, res) => {
    try {
        const { migrationPlanId } = req.params;
        const result = await phoneMigrationService.getMigrationPlan(migrationPlanId);
        if (!result.success) {
            return res.status(404).json({
                success: false,
                error: result.error,
                metadata: {
                    timestamp: new Date().toISOString(),
                    service: 'phone-migration',
                    version: '1.0.0'
                }
            });
        }
        const plan = result.plan;
        const totalSteps = plan.migrationSteps.length;
        const completedSteps = plan.migrationSteps.filter((step) => step.status === 'completed').length;
        const inProgressSteps = plan.migrationSteps.filter((step) => step.status === 'in_progress').length;
        const failedSteps = plan.migrationSteps.filter((step) => step.status === 'failed').length;
        const progress = {
            totalSteps: totalSteps,
            completedSteps: completedSteps,
            inProgressSteps: inProgressSteps,
            failedSteps: failedSteps,
            progressPercentage: Math.round((completedSteps / totalSteps) * 100),
            currentStep: plan.migrationSteps.find((step) => step.status === 'in_progress')?.stepNumber || null,
            nextStep: plan.migrationSteps.find((step) => step.status === 'pending')?.stepNumber || null,
            status: plan.status
        };
        return res.json({
            success: true,
            data: progress,
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'phone-migration',
                version: '1.0.0'
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error getting migration progress:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to get migration progress',
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'phone-migration',
                version: '1.0.0'
            }
        });
    }
});
router.post('/migration/:migrationPlanId/start', async (req, res) => {
    try {
        const { migrationPlanId } = req.params;
        await prisma.migrationPlan.update({
            where: { id: migrationPlanId },
            data: {
                status: 'in_progress',
                startDate: new Date()
            }
        });
        return res.json({
            success: true,
            data: {
                migrationPlanId: migrationPlanId,
                status: 'started',
                startDate: new Date()
            },
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'phone-migration',
                version: '1.0.0'
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error starting migration:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to start migration',
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'phone-migration',
                version: '1.0.0'
            }
        });
    }
});
router.post('/migration/:migrationPlanId/complete', async (req, res) => {
    try {
        const { migrationPlanId } = req.params;
        await prisma.migrationPlan.update({
            where: { id: migrationPlanId },
            data: {
                status: 'completed',
                endDate: new Date()
            }
        });
        return res.json({
            success: true,
            data: {
                migrationPlanId: migrationPlanId,
                status: 'completed',
                endDate: new Date()
            },
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'phone-migration',
                version: '1.0.0'
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error completing migration:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to complete migration',
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'phone-migration',
                version: '1.0.0'
            }
        });
    }
});
exports.default = router;
//# sourceMappingURL=phone-migration.js.map