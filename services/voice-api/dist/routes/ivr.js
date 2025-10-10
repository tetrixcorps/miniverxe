"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const redis_1 = require("redis");
const IVRService_1 = require("../services/IVRService");
const joi_1 = __importDefault(require("joi"));
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const redis = (0, redis_1.createClient)({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
const ivrService = new IVRService_1.IVRService(prisma, redis);
const createMenuSchema = joi_1.default.object({
    userId: joi_1.default.string().required(),
    tollFreeNumber: joi_1.default.string().required(),
    name: joi_1.default.string().required(),
    greeting: joi_1.default.string().required(),
    options: joi_1.default.array().items(joi_1.default.object({
        key: joi_1.default.string().required(),
        text: joi_1.default.string().required(),
        action: joi_1.default.string().valid('transfer', 'speak', 'gather', 'submenu', 'hangup').required(),
        target: joi_1.default.string().optional(),
        submenuId: joi_1.default.string().optional(),
        conditions: joi_1.default.array().items(joi_1.default.object({
            field: joi_1.default.string().valid('intent', 'sentiment', 'duration', 'caller_id', 'time_of_day').required(),
            operator: joi_1.default.string().valid('equals', 'contains', 'greater_than', 'less_than', 'between').required(),
            value: joi_1.default.any().required()
        })).optional()
    })).min(1).required()
});
const processInputSchema = joi_1.default.object({
    input: joi_1.default.string().required(),
    inputType: joi_1.default.string().valid('dtmf', 'speech').default('speech')
});
router.post('/menu', async (req, res) => {
    try {
        const { error, value } = createMenuSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Invalid request format',
                details: error.details
            });
        }
        const { userId, tollFreeNumber, name, greeting, options } = value;
        const menu = await ivrService.createIVRMenu(userId, tollFreeNumber, name, greeting, options);
        return res.json({
            success: true,
            data: menu
        });
    }
    catch (error) {
        console.error('Error creating IVR menu:', error);
        return res.status(500).json({
            error: 'Failed to create IVR menu',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/call', async (req, res) => {
    try {
        const { callId, tollFreeNumber, callerId } = req.body;
        if (!callId || !tollFreeNumber || !callerId) {
            return res.status(400).json({
                error: 'callId, tollFreeNumber, and callerId are required'
            });
        }
        const session = await ivrService.processIncomingCall(callId, tollFreeNumber, callerId);
        return res.json({
            success: true,
            data: session
        });
    }
    catch (error) {
        console.error('Error processing incoming call:', error);
        return res.status(500).json({
            error: 'Failed to process incoming call',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/session/:sessionId/input', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { error, value } = processInputSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Invalid request format',
                details: error.details
            });
        }
        const { input, inputType } = value;
        const result = await ivrService.processUserInput(sessionId, input, inputType);
        return res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('Error processing user input:', error);
        return res.status(500).json({
            error: 'Failed to process user input',
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
                service: 'ivr',
                version: '1.0.0'
            }
        });
    }
    catch (error) {
        console.error('Error checking IVR health:', error);
        return res.status(500).json({
            error: 'Failed to check health',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=ivr.js.map