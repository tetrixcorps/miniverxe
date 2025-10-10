"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const redis_1 = require("redis");
const VoiceAPIService_1 = require("../services/VoiceAPIService");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const redis = (0, redis_1.createClient)({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
const voiceAPIService = new VoiceAPIService_1.VoiceAPIService(prisma, redis);
router.post('/telnyx/voice', async (req, res) => {
    try {
        console.log('📞 Telnyx Voice webhook received:', req.body);
        const result = await voiceAPIService.processWebhook(req.body);
        return res.json(result);
    }
    catch (error) {
        console.error('Error processing Telnyx webhook:', error);
        return res.status(500).json({
            error: 'Failed to process webhook',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/telnyx/voice/failover', async (req, res) => {
    try {
        console.log('📞 Telnyx Voice webhook failover received:', req.body);
        const result = await voiceAPIService.processWebhook(req.body);
        return res.json(result);
    }
    catch (error) {
        console.error('Error processing Telnyx webhook failover:', error);
        return res.status(500).json({
            error: 'Failed to process webhook failover',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/', async (req, res) => {
    try {
        console.log('📞 Generic webhook received:', req.body);
        const { type, data } = req.body;
        if (type === 'telnyx_voice') {
            const result = await voiceAPIService.processWebhook(data);
            return res.json(result);
        }
        else {
            return res.json({ success: true, message: 'Webhook received but not processed' });
        }
    }
    catch (error) {
        console.error('Error processing generic webhook:', error);
        return res.status(500).json({
            error: 'Failed to process webhook',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=webhook.js.map