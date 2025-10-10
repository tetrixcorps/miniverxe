"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TTSService = void 0;
const axios_1 = __importDefault(require("axios"));
const logger_1 = __importDefault(require("../utils/logger"));
class TTSService {
    constructor(prisma, redis, config) {
        this.prisma = prisma;
        this.redis = redis;
        this.config = config;
    }
    async synthesizeSpeech(request) {
        try {
            const response = await axios_1.default.post(`${this.config.apiBase}/text-to-speech`, {
                text: request.text,
                voice: request.voice || 'alloy',
                language: request.language || 'en-US',
                model: request.model || this.config.model,
                speed: request.speed || 1.0
            }, {
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return {
                audio: response.data.audio,
                duration: response.data.duration || 0,
                voice: response.data.voice || 'alloy',
                language: response.data.language || 'en-US'
            };
        }
        catch (error) {
            logger_1.default.error('TTS synthesis error:', error);
            throw new Error('Failed to synthesize speech');
        }
    }
    async getVoiceOptions() {
        try {
            return ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
        }
        catch (error) {
            logger_1.default.error('Error getting voice options:', error);
            return [];
        }
    }
    async getLanguageOptions() {
        try {
            return ['en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'pt-BR', 'ja-JP', 'ko-KR', 'zh-CN'];
        }
        catch (error) {
            logger_1.default.error('Error getting language options:', error);
            return [];
        }
    }
    async getTTSCost(userId, startDate, endDate) {
        try {
            return 0;
        }
        catch (error) {
            logger_1.default.error('Error getting TTS cost:', error);
            return 0;
        }
    }
}
exports.TTSService = TTSService;
//# sourceMappingURL=TTSService.js.map