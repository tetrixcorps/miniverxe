"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.STTService = void 0;
const axios_1 = __importDefault(require("axios"));
const logger_1 = __importDefault(require("../utils/logger"));
class STTService {
    constructor(prisma, redis, config) {
        this.prisma = prisma;
        this.redis = redis;
        this.config = config;
    }
    async transcribe(request) {
        try {
            const response = await axios_1.default.post(`${this.config.apiBase}/speech-to-text`, {
                audio: request.audio,
                language: request.language || 'en-US',
                model: request.model || this.config.model
            }, {
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return {
                text: response.data.text,
                confidence: response.data.confidence || 0.9,
                language: response.data.language || 'en-US',
                duration: response.data.duration || 0
            };
        }
        catch (error) {
            logger_1.default.error('STT transcription error:', error);
            throw new Error('Failed to transcribe audio');
        }
    }
    async startTranscriptionStream(sessionId) {
        try {
            await this.redis.setEx(`stt:stream:${sessionId}`, 3600, 'active');
            logger_1.default.info(`Started STT stream for session: ${sessionId}`);
        }
        catch (error) {
            logger_1.default.error('Error starting STT stream:', error);
            throw new Error('Failed to start transcription stream');
        }
    }
    async stopTranscriptionStream(sessionId) {
        try {
            await this.redis.del(`stt:stream:${sessionId}`);
            logger_1.default.info(`Stopped STT stream for session: ${sessionId}`);
        }
        catch (error) {
            logger_1.default.error('Error stopping STT stream:', error);
            throw new Error('Failed to stop transcription stream');
        }
    }
    async getTranscriptionStatus(sessionId) {
        try {
            const status = await this.redis.get(`stt:stream:${sessionId}`);
            return status || 'inactive';
        }
        catch (error) {
            logger_1.default.error('Error getting transcription status:', error);
            return 'inactive';
        }
    }
    async getTranscriptionHistory(userId, limit = 100) {
        try {
            return [];
        }
        catch (error) {
            logger_1.default.error('Error getting transcription history:', error);
            return [];
        }
    }
    async getTranscriptionCost(userId, startDate, endDate) {
        try {
            return 0;
        }
        catch (error) {
            logger_1.default.error('Error getting transcription cost:', error);
            return 0;
        }
    }
    async getTranscriptionModels() {
        try {
            return ['whisper-1', 'whisper-2', 'whisper-3'];
        }
        catch (error) {
            logger_1.default.error('Error getting transcription models:', error);
            return [];
        }
    }
}
exports.STTService = STTService;
//# sourceMappingURL=STTService.js.map