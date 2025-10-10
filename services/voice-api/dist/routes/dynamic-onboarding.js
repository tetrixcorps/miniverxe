"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const redis_1 = require("redis");
const DynamicOnboardingService_1 = require("../services/DynamicOnboardingService");
const logger_1 = __importDefault(require("../utils/logger"));
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const redis = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});
const onboardingService = new DynamicOnboardingService_1.DynamicOnboardingService(prisma, redis);
router.post('/start', async (req, res) => {
    try {
        const { phoneNumber, industry } = req.body;
        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                error: 'Phone number is required',
                metadata: {
                    timestamp: new Date().toISOString(),
                    service: 'dynamic-onboarding',
                    version: '1.0.0'
                }
            });
        }
        const result = await onboardingService.startOnboardingSession(phoneNumber, industry);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error,
                metadata: {
                    timestamp: new Date().toISOString(),
                    service: 'dynamic-onboarding',
                    version: '1.0.0'
                }
            });
        }
        return res.json({
            success: true,
            data: {
                sessionId: result.sessionId,
                message: 'Onboarding session started successfully'
            },
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'dynamic-onboarding',
                version: '1.0.0'
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error starting onboarding session:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to start onboarding session',
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'dynamic-onboarding',
                version: '1.0.0'
            }
        });
    }
});
router.post('/session/:sessionId/step', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { step, input } = req.body;
        if (!step || !input) {
            return res.status(400).json({
                success: false,
                error: 'Step and input are required',
                metadata: {
                    timestamp: new Date().toISOString(),
                    service: 'dynamic-onboarding',
                    version: '1.0.0'
                }
            });
        }
        const result = await onboardingService.processOnboardingStep(sessionId, step, input);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error,
                metadata: {
                    timestamp: new Date().toISOString(),
                    service: 'dynamic-onboarding',
                    version: '1.0.0'
                }
            });
        }
        return res.json({
            success: true,
            data: {
                response: result.response,
                nextStep: result.nextStep,
                sessionId: sessionId
            },
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'dynamic-onboarding',
                version: '1.0.0'
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error processing onboarding step:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to process onboarding step',
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'dynamic-onboarding',
                version: '1.0.0'
            }
        });
    }
});
router.get('/session/:sessionId/status', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const result = await onboardingService.getOnboardingStatus(sessionId);
        if (!result.success) {
            return res.status(404).json({
                success: false,
                error: result.error,
                metadata: {
                    timestamp: new Date().toISOString(),
                    service: 'dynamic-onboarding',
                    version: '1.0.0'
                }
            });
        }
        return res.json({
            success: true,
            data: result.status,
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'dynamic-onboarding',
                version: '1.0.0'
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error getting onboarding status:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to get onboarding status',
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'dynamic-onboarding',
                version: '1.0.0'
            }
        });
    }
});
router.post('/toll-free-call', async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                error: 'Phone number is required',
                metadata: {
                    timestamp: new Date().toISOString(),
                    service: 'dynamic-onboarding',
                    version: '1.0.0'
                }
            });
        }
        const result = await onboardingService.handleTollFreeCall(phoneNumber);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error,
                metadata: {
                    timestamp: new Date().toISOString(),
                    service: 'dynamic-onboarding',
                    version: '1.0.0'
                }
            });
        }
        return res.json({
            success: true,
            data: {
                response: result.response,
                sessionId: result.sessionId,
                isNewCustomer: result.sessionId !== null
            },
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'dynamic-onboarding',
                version: '1.0.0'
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error handling toll-free call:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to handle toll-free call',
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'dynamic-onboarding',
                version: '1.0.0'
            }
        });
    }
});
router.get('/industries', async (req, res) => {
    try {
        const industries = [
            { id: 'construction', name: 'Construction', description: 'Project management and safety communication' },
            { id: 'logistics', name: 'Logistics & Fleet Management', description: 'Delivery tracking and driver communication' },
            { id: 'healthcare', name: 'Healthcare', description: 'Patient communication and appointment scheduling' },
            { id: 'government', name: 'Government', description: 'Citizen services and emergency response' },
            { id: 'education', name: 'Education', description: 'Student and parent communication' },
            { id: 'retail', name: 'Retail', description: 'Customer service and order management' },
            { id: 'hospitality', name: 'Hospitality', description: 'Guest services and reservations' },
            { id: 'wellness', name: 'Wellness', description: 'Health and wellness services' },
            { id: 'beauty', name: 'Beauty', description: 'Appointment scheduling and service inquiries' }
        ];
        return res.json({
            success: true,
            data: industries,
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'dynamic-onboarding',
                version: '1.0.0'
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error getting industries:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to get industries',
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'dynamic-onboarding',
                version: '1.0.0'
            }
        });
    }
});
router.get('/session/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await onboardingService.getOnboardingSession(sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found',
                metadata: {
                    timestamp: new Date().toISOString(),
                    service: 'dynamic-onboarding',
                    version: '1.0.0'
                }
            });
        }
        return res.json({
            success: true,
            data: session,
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'dynamic-onboarding',
                version: '1.0.0'
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error getting onboarding session:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to get onboarding session',
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'dynamic-onboarding',
                version: '1.0.0'
            }
        });
    }
});
router.put('/session/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const updates = req.body;
        const result = await onboardingService.updateOnboardingSession(sessionId, updates);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error,
                metadata: {
                    timestamp: new Date().toISOString(),
                    service: 'dynamic-onboarding',
                    version: '1.0.0'
                }
            });
        }
        return res.json({
            success: true,
            data: {
                sessionId: sessionId,
                message: 'Session updated successfully'
            },
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'dynamic-onboarding',
                version: '1.0.0'
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error updating onboarding session:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to update onboarding session',
            metadata: {
                timestamp: new Date().toISOString(),
                service: 'dynamic-onboarding',
                version: '1.0.0'
            }
        });
    }
});
exports.default = router;
//# sourceMappingURL=dynamic-onboarding.js.map