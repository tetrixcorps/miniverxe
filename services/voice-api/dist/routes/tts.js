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
const synthesizeSpeechSchema = joi_1.default.object({
    text: joi_1.default.string().required(),
    voice: joi_1.default.string().default('alice'),
    language: joi_1.default.string().default('en-US'),
    callId: joi_1.default.string().optional()
});
router.post('/synthesize', async (req, res) => {
    try {
        const { error, value } = synthesizeSpeechSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Invalid request format',
                details: error.details
            });
        }
        const { text, voice, language, callId } = value;
        const result = {
            audioUrl: `https://api.telnyx.com/v2/tts/${Date.now()}.wav`,
            text: text,
            voice: voice,
            language: language,
            callId: callId,
            duration: text.length * 0.1,
            timestamp: new Date().toISOString()
        };
        return res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('Error synthesizing speech:', error);
        return res.status(500).json({
            error: 'Failed to synthesize speech',
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
                service: 'tts',
                version: '1.0.0'
            }
        });
    }
    catch (error) {
        console.error('Error checking TTS health:', error);
        return res.status(500).json({
            error: 'Failed to check health',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=tts.js.map