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
const processSpeechSchema = joi_1.default.object({
    audioData: joi_1.default.string().required(),
    language: joi_1.default.string().default('en-US'),
    callId: joi_1.default.string().optional()
});
router.post('/process', async (req, res) => {
    try {
        const { error, value } = processSpeechSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Invalid request format',
                details: error.details
            });
        }
        const { audioData, language, callId } = value;
        const result = {
            text: 'Hello, I would like to speak with a representative',
            confidence: 0.95,
            language: language,
            callId: callId,
            timestamp: new Date().toISOString()
        };
        return res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('Error processing speech:', error);
        return res.status(500).json({
            error: 'Failed to process speech',
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
                service: 'stt',
                version: '1.0.0'
            }
        });
    }
    catch (error) {
        console.error('Error checking STT health:', error);
        return res.status(500).json({
            error: 'Failed to check health',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=stt.js.map