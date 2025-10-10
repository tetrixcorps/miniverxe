"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const redis_1 = require("redis");
const AgentService_1 = require("../services/AgentService");
const AgentRoutingService_1 = require("../services/AgentRoutingService");
const joi_1 = __importDefault(require("joi"));
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const redis = (0, redis_1.createClient)({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
const agentService = new AgentService_1.AgentService(prisma, redis);
const agentRoutingService = new AgentRoutingService_1.AgentRoutingService(prisma, redis);
const createSessionSchema = joi_1.default.object({
    callId: joi_1.default.string().required(),
    userId: joi_1.default.string().required(),
    agentType: joi_1.default.string().valid('sales', 'support', 'billing').required(),
    initialContext: joi_1.default.object().optional()
});
const processInteractionSchema = joi_1.default.object({
    userInput: joi_1.default.string().required(),
    metadata: joi_1.default.object().optional()
});
const routeCallSchema = joi_1.default.object({
    callId: joi_1.default.string().required(),
    userInput: joi_1.default.string().required(),
    callerId: joi_1.default.string().required(),
    tollFreeNumber: joi_1.default.string().required(),
    userId: joi_1.default.string().optional(),
    customerTier: joi_1.default.string().valid('basic', 'premium', 'enterprise').optional()
});
router.post('/session', async (req, res) => {
    try {
        const { error, value } = createSessionSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Invalid request format',
                details: error.details
            });
        }
        const { callId, userId, agentType, initialContext } = value;
        const session = await agentService.createAgentSession(callId, userId, agentType, initialContext);
        return res.json({
            success: true,
            data: session
        });
    }
    catch (error) {
        console.error('Error creating agent session:', error);
        return res.status(500).json({
            error: 'Failed to create agent session',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/session/:sessionId/interact', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { error, value } = processInteractionSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Invalid request format',
                details: error.details
            });
        }
        const { userInput, metadata } = value;
        const response = await agentService.processInteraction(sessionId, userInput, metadata);
        return res.json({
            success: true,
            data: response
        });
    }
    catch (error) {
        console.error('Error processing agent interaction:', error);
        return res.status(500).json({
            error: 'Failed to process agent interaction',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/route', async (req, res) => {
    try {
        const { error, value } = routeCallSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Invalid request format',
                details: error.details
            });
        }
        const { callId, userInput, callerId, tollFreeNumber, userId, customerTier } = value;
        const context = {
            callerId,
            userId,
            tollFreeNumber,
            previousInteractions: [],
            customerTier,
            timeOfDay: new Date().toLocaleTimeString(),
            dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' })
        };
        const routingDecision = await agentRoutingService.routeCall(callId, userInput, context);
        return res.json({
            success: true,
            data: routingDecision
        });
    }
    catch (error) {
        console.error('Error routing call:', error);
        return res.status(500).json({
            error: 'Failed to route call',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/session/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        return res.json({
            success: true,
            data: {
                id: sessionId,
                status: 'active',
                agentType: 'sales',
                startTime: new Date().toISOString()
            }
        });
    }
    catch (error) {
        console.error('Error getting agent session:', error);
        return res.status(500).json({
            error: 'Failed to get agent session',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/stats/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({
                error: 'startDate and endDate are required'
            });
        }
        const stats = await agentService.getAgentStats(userId, new Date(startDate), new Date(endDate));
        return res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        console.error('Error getting agent stats:', error);
        return res.status(500).json({
            error: 'Failed to get agent statistics',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/routing/stats', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({
                error: 'startDate and endDate are required'
            });
        }
        const stats = await agentRoutingService.getRoutingStats(new Date(startDate), new Date(endDate));
        return res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        console.error('Error getting routing stats:', error);
        return res.status(500).json({
            error: 'Failed to get routing statistics',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/routing/logs', async (req, res) => {
    try {
        const { startDate, endDate, limit = 100 } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({
                error: 'startDate and endDate are required'
            });
        }
        const logs = await agentRoutingService.getRoutingLogs(new Date(startDate), new Date(endDate), Number(limit));
        return res.json({
            success: true,
            data: logs
        });
    }
    catch (error) {
        console.error('Error getting routing logs:', error);
        return res.status(500).json({
            error: 'Failed to get routing logs',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/health', async (req, res) => {
    try {
        return res.json({
            success: true,
            data: {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                service: 'agent',
                version: '1.0.0'
            }
        });
    }
    catch (error) {
        console.error('Error checking agent health:', error);
        return res.status(500).json({
            error: 'Failed to check health',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=agent.js.map