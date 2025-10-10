"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const redis_1 = require("redis");
const joi_1 = __importDefault(require("joi"));
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const redis = (0, redis_1.createClient)({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
const startRecordingSchema = joi_1.default.object({
    callId: joi_1.default.string().required(),
    channels: joi_1.default.string().valid('single', 'dual').default('single')
});
const stopRecordingSchema = joi_1.default.object({
    callId: joi_1.default.string().required()
});
router.post('/start', async (req, res) => {
    try {
        const { error, value } = startRecordingSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Invalid request format',
                details: error.details
            });
        }
        const { callId, channels } = value;
        const result = {
            callId: callId,
            recordingId: `rec_${Date.now()}`,
            status: 'recording',
            channels: channels,
            timestamp: new Date().toISOString()
        };
        return res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('Error starting recording:', error);
        return res.status(500).json({
            error: 'Failed to start recording',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/stop', async (req, res) => {
    try {
        const { error, value } = stopRecordingSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Invalid request format',
                details: error.details
            });
        }
        const { callId } = value;
        const result = {
            callId: callId,
            recordingId: `rec_${Date.now()}`,
            status: 'stopped',
            recordingUrl: `https://api.telnyx.com/v2/recordings/${callId}.wav`,
            timestamp: new Date().toISOString()
        };
        return res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('Error stopping recording:', error);
        return res.status(500).json({
            error: 'Failed to stop recording',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/:callId', async (req, res) => {
    try {
        const { callId } = req.params;
        const result = {
            callId: callId,
            recordings: [
                {
                    id: `rec_${Date.now()}`,
                    url: `https://api.telnyx.com/v2/recordings/${callId}.wav`,
                    duration: 120,
                    channels: 'single',
                    createdAt: new Date().toISOString()
                }
            ]
        };
        return res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('Error getting recordings:', error);
        return res.status(500).json({
            error: 'Failed to get recordings',
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
                service: 'call-recording',
                version: '1.0.0'
            }
        });
    }
    catch (error) {
        console.error('Error checking call recording health:', error);
        return res.status(500).json({
            error: 'Failed to check health',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=call-recording.js.map