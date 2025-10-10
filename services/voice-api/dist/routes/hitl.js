"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const redis_1 = require("redis");
const HITLService_1 = require("../services/HITLService");
const joi_1 = __importDefault(require("joi"));
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const redis = (0, redis_1.createClient)({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
const hitlService = new HITLService_1.HITLService(prisma, redis);
const onCallConfigSchema = joi_1.default.object({
    userId: joi_1.default.string().required(),
    businessNumber: joi_1.default.string().required()
});
const ringGroupConfigSchema = joi_1.default.object({
    userId: joi_1.default.string().required(),
    primaryNumber: joi_1.default.string().required(),
    ringGroup: joi_1.default.array().items(joi_1.default.string()).min(1).required(),
    strategy: joi_1.default.string().valid('simultaneous', 'sequential').default('simultaneous')
});
const businessHoursConfigSchema = joi_1.default.object({
    userId: joi_1.default.string().required(),
    primaryNumber: joi_1.default.string().required(),
    businessHours: joi_1.default.object({
        timezone: joi_1.default.string().required(),
        weekdays: joi_1.default.object({
            enabled: joi_1.default.boolean().required(),
            startTime: joi_1.default.string().pattern(/^\d{2}:\d{2}$/).required(),
            endTime: joi_1.default.string().pattern(/^\d{2}:\d{2}$/).required(),
            forwardingNumber: joi_1.default.string().required(),
            voicemailEnabled: joi_1.default.boolean().default(false)
        }).required(),
        weekends: joi_1.default.object({
            enabled: joi_1.default.boolean().required(),
            startTime: joi_1.default.string().pattern(/^\d{2}:\d{2}$/).required(),
            endTime: joi_1.default.string().pattern(/^\d{2}:\d{2}$/).required(),
            forwardingNumber: joi_1.default.string().required(),
            voicemailEnabled: joi_1.default.boolean().default(false)
        }).required(),
        holidays: joi_1.default.array().items(joi_1.default.object({
            date: joi_1.default.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
            name: joi_1.default.string().required(),
            enabled: joi_1.default.boolean().required(),
            forwardingNumber: joi_1.default.string().required(),
            voicemailEnabled: joi_1.default.boolean().default(false)
        })).default([])
    }).required()
});
const agentPoolConfigSchema = joi_1.default.object({
    userId: joi_1.default.string().required(),
    primaryNumber: joi_1.default.string().required(),
    agents: joi_1.default.array().items(joi_1.default.object({
        name: joi_1.default.string().required(),
        phoneNumber: joi_1.default.string().required(),
        skills: joi_1.default.array().items(joi_1.default.string()).required(),
        availability: joi_1.default.string().valid('available', 'busy', 'offline').default('available'),
        maxConcurrentCalls: joi_1.default.number().min(1).default(1)
    })).min(1).required()
});
const escalationSchema = joi_1.default.object({
    callId: joi_1.default.string().required(),
    userId: joi_1.default.string().required(),
    reason: joi_1.default.string().required(),
    context: joi_1.default.object().optional()
});
router.post('/config/on-call', async (req, res) => {
    try {
        const { error, value } = onCallConfigSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Invalid request format',
                details: error.details
            });
        }
        const { userId, businessNumber } = value;
        const config = await hitlService.createOnCallConfig(userId, businessNumber);
        return res.json({
            success: true,
            data: config
        });
    }
    catch (error) {
        console.error('Error creating on-call config:', error);
        return res.status(500).json({
            error: 'Failed to create on-call configuration',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/config/ring-group', async (req, res) => {
    try {
        const { error, value } = ringGroupConfigSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Invalid request format',
                details: error.details
            });
        }
        const { userId, primaryNumber, ringGroup, strategy } = value;
        const config = await hitlService.createRingGroupConfig(userId, primaryNumber, ringGroup, strategy);
        return res.json({
            success: true,
            data: config
        });
    }
    catch (error) {
        console.error('Error creating ring group config:', error);
        return res.status(500).json({
            error: 'Failed to create ring group configuration',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/config/business-hours', async (req, res) => {
    try {
        const { error, value } = businessHoursConfigSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Invalid request format',
                details: error.details
            });
        }
        const { userId, primaryNumber, businessHours } = value;
        const config = await hitlService.createBusinessHoursConfig(userId, primaryNumber, businessHours);
        return res.json({
            success: true,
            data: config
        });
    }
    catch (error) {
        console.error('Error creating business hours config:', error);
        return res.status(500).json({
            error: 'Failed to create business hours configuration',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/config/agent-pool', async (req, res) => {
    try {
        const { error, value } = agentPoolConfigSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Invalid request format',
                details: error.details
            });
        }
        const { userId, primaryNumber, agents } = value;
        const config = await hitlService.createAgentPoolConfig(userId, primaryNumber, agents);
        return res.json({
            success: true,
            data: config
        });
    }
    catch (error) {
        console.error('Error creating agent pool config:', error);
        return res.status(500).json({
            error: 'Failed to create agent pool configuration',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/escalate', async (req, res) => {
    try {
        const { error, value } = escalationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Invalid request format',
                details: error.details
            });
        }
        const { callId, userId, reason, context } = value;
        const escalation = await hitlService.processEscalation(callId, userId, reason, context);
        return res.json({
            success: true,
            data: escalation
        });
    }
    catch (error) {
        console.error('Error processing escalation:', error);
        return res.status(500).json({
            error: 'Failed to process escalation',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 50 } = req.query;
        const history = await hitlService.getEscalationHistory(userId, Number(limit));
        return res.json({
            success: true,
            data: history
        });
    }
    catch (error) {
        console.error('Error getting escalation history:', error);
        return res.status(500).json({
            error: 'Failed to get escalation history',
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
        const stats = await hitlService.getEscalationStats(userId, new Date(startDate), new Date(endDate));
        return res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        console.error('Error getting escalation stats:', error);
        return res.status(500).json({
            error: 'Failed to get escalation statistics',
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
                service: 'hitl',
                version: '1.0.0'
            }
        });
    }
    catch (error) {
        console.error('Error checking HITL health:', error);
        return res.status(500).json({
            error: 'Failed to check health',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=hitl.js.map