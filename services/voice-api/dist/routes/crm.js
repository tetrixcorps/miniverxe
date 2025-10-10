"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const redis_1 = require("redis");
const CRMService_1 = require("../services/CRMService");
const joi_1 = __importDefault(require("joi"));
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const redis = (0, redis_1.createClient)({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
const crmService = new CRMService_1.CRMService(prisma, redis);
const createUserSchema = joi_1.default.object({
    userId: joi_1.default.string().required(),
    tollFreeNumbers: joi_1.default.array().items(joi_1.default.string()).required(),
    preferences: joi_1.default.object().optional()
});
const storeInsightSchema = joi_1.default.object({
    callId: joi_1.default.string().required(),
    userId: joi_1.default.string().required(),
    tollFreeNumber: joi_1.default.string().required(),
    callerId: joi_1.default.string().required(),
    duration: joi_1.default.number().required(),
    intent: joi_1.default.string().required(),
    sentiment: joi_1.default.number().min(0).max(1).required(),
    satisfactionScore: joi_1.default.number().min(1).max(5).required(),
    escalationReason: joi_1.default.string().optional(),
    transcript: joi_1.default.string().required(),
    entities: joi_1.default.array().optional(),
    keywords: joi_1.default.array().items(joi_1.default.string()).optional()
});
const analyticsSchema = joi_1.default.object({
    startDate: joi_1.default.date().required(),
    endDate: joi_1.default.date().required(),
    tollFreeNumber: joi_1.default.string().optional()
});
const exportSchema = joi_1.default.object({
    format: joi_1.default.string().valid('csv', 'json', 'xlsx').required(),
    startDate: joi_1.default.date().required(),
    endDate: joi_1.default.date().required(),
    tollFreeNumber: joi_1.default.string().optional()
});
router.post('/user', async (req, res) => {
    try {
        const { error, value } = createUserSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Invalid request format',
                details: error.details
            });
        }
        const { userId, tollFreeNumbers, preferences } = value;
        const crmUser = await crmService.createCRMUser(userId, tollFreeNumbers, preferences);
        return res.json({
            success: true,
            data: crmUser
        });
    }
    catch (error) {
        console.error('Error creating CRM user:', error);
        return res.status(500).json({
            error: 'Failed to create CRM user',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/insight', async (req, res) => {
    try {
        const { error, value } = storeInsightSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Invalid request format',
                details: error.details
            });
        }
        const insight = {
            id: require('uuid').v4(),
            ...value,
            insights: [],
            createdAt: new Date()
        };
        await crmService.storeCallInsight(insight);
        return res.json({
            success: true,
            data: { id: insight.id }
        });
    }
    catch (error) {
        console.error('Error storing call insight:', error);
        return res.status(500).json({
            error: 'Failed to store call insight',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/analytics/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { error, value } = analyticsSchema.validate(req.query);
        if (error) {
            return res.status(400).json({
                error: 'Invalid request format',
                details: error.details
            });
        }
        const { startDate, endDate, tollFreeNumber } = value;
        const analytics = await crmService.getCallAnalytics(userId, new Date(startDate), new Date(endDate), tollFreeNumber);
        return res.json({
            success: true,
            data: analytics
        });
    }
    catch (error) {
        console.error('Error getting call analytics:', error);
        return res.status(500).json({
            error: 'Failed to get call analytics',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/dashboard/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const dashboard = await crmService.getRealTimeDashboard(userId);
        return res.json({
            success: true,
            data: dashboard
        });
    }
    catch (error) {
        console.error('Error getting real-time dashboard:', error);
        return res.status(500).json({
            error: 'Failed to get real-time dashboard',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/insights/:callId', async (req, res) => {
    try {
        const { callId } = req.params;
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({
                error: 'userId is required'
            });
        }
        const insights = await crmService.generateInsights(userId, callId);
        return res.json({
            success: true,
            data: insights
        });
    }
    catch (error) {
        console.error('Error generating insights:', error);
        return res.status(500).json({
            error: 'Failed to generate insights',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/export/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { error, value } = exportSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Invalid request format',
                details: error.details
            });
        }
        const { format, startDate, endDate, tollFreeNumber } = value;
        const exportData = await crmService.exportData(userId, format, new Date(startDate), new Date(endDate), tollFreeNumber);
        return res.json({
            success: true,
            data: { exportData, format }
        });
    }
    catch (error) {
        console.error('Error exporting data:', error);
        return res.status(500).json({
            error: 'Failed to export data',
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
                service: 'crm',
                version: '1.0.0'
            }
        });
    }
    catch (error) {
        console.error('Error checking CRM health:', error);
        return res.status(500).json({
            error: 'Failed to check health',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=crm.js.map