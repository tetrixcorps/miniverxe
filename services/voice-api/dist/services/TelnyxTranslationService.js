"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelnyxTranslationService = void 0;
const axios_1 = __importDefault(require("axios"));
const logger_1 = __importDefault(require("../utils/logger"));
class TelnyxTranslationService {
    constructor(prisma, redis, io, config) {
        this.TELNYX_COST_PER_MINUTE = 0.07;
        this.MARKUP_PER_MINUTE = 1.00;
        this.PREMIUM_TIER_COST = this.TELNYX_COST_PER_MINUTE + this.MARKUP_PER_MINUTE;
        this.SUPPORTED_LANGUAGES = [
            {
                code: 'en',
                name: 'English',
                nativeName: 'English',
                voiceModels: ['en-US-Standard-A', 'en-US-Standard-B', 'en-US-Standard-C'],
                sttModels: ['en-US-Standard-A', 'en-US-Standard-B']
            },
            {
                code: 'es',
                name: 'Spanish',
                nativeName: 'Español',
                voiceModels: ['es-ES-Standard-A', 'es-ES-Standard-B', 'es-ES-Standard-C'],
                sttModels: ['es-ES-Standard-A', 'es-ES-Standard-B']
            },
            {
                code: 'fr',
                name: 'French',
                nativeName: 'Français',
                voiceModels: ['fr-FR-Standard-A', 'fr-FR-Standard-B', 'fr-FR-Standard-C'],
                sttModels: ['fr-FR-Standard-A', 'fr-FR-Standard-B']
            },
            {
                code: 'de',
                name: 'German',
                nativeName: 'Deutsch',
                voiceModels: ['de-DE-Standard-A', 'de-DE-Standard-B', 'de-DE-Standard-C'],
                sttModels: ['de-DE-Standard-A', 'de-DE-Standard-B']
            },
            {
                code: 'it',
                name: 'Italian',
                nativeName: 'Italiano',
                voiceModels: ['it-IT-Standard-A', 'it-IT-Standard-B', 'it-IT-Standard-C'],
                sttModels: ['it-IT-Standard-A', 'it-IT-Standard-B']
            },
            {
                code: 'pt',
                name: 'Portuguese',
                nativeName: 'Português',
                voiceModels: ['pt-PT-Standard-A', 'pt-PT-Standard-B', 'pt-PT-Standard-C'],
                sttModels: ['pt-PT-Standard-A', 'pt-PT-Standard-B']
            },
            {
                code: 'ru',
                name: 'Russian',
                nativeName: 'Русский',
                voiceModels: ['ru-RU-Standard-A', 'ru-RU-Standard-B', 'ru-RU-Standard-C'],
                sttModels: ['ru-RU-Standard-A', 'ru-RU-Standard-B']
            },
            {
                code: 'ja',
                name: 'Japanese',
                nativeName: '日本語',
                voiceModels: ['ja-JP-Standard-A', 'ja-JP-Standard-B', 'ja-JP-Standard-C'],
                sttModels: ['ja-JP-Standard-A', 'ja-JP-Standard-B']
            },
            {
                code: 'ko',
                name: 'Korean',
                nativeName: '한국어',
                voiceModels: ['ko-KR-Standard-A', 'ko-KR-Standard-B', 'ko-KR-Standard-C'],
                sttModels: ['ko-KR-Standard-A', 'ko-KR-Standard-B']
            },
            {
                code: 'zh',
                name: 'Chinese',
                nativeName: '中文',
                voiceModels: ['zh-CN-Standard-A', 'zh-CN-Standard-B', 'zh-CN-Standard-C'],
                sttModels: ['zh-CN-Standard-A', 'zh-CN-Standard-B']
            },
            {
                code: 'ar',
                name: 'Arabic',
                nativeName: 'العربية',
                voiceModels: ['ar-SA-Standard-A', 'ar-SA-Standard-B', 'ar-SA-Standard-C'],
                sttModels: ['ar-SA-Standard-A', 'ar-SA-Standard-B']
            },
            {
                code: 'hi',
                name: 'Hindi',
                nativeName: 'हिन्दी',
                voiceModels: ['hi-IN-Standard-A', 'hi-IN-Standard-B', 'hi-IN-Standard-C'],
                sttModels: ['hi-IN-Standard-A', 'hi-IN-Standard-B']
            }
        ];
        this.prisma = prisma;
        this.redis = redis;
        this.io = io;
        this.config = config;
        this.client = axios_1.default.create({
            baseURL: config.inferenceBaseUrl,
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 30000
        });
        this.setupInterceptors();
    }
    setupInterceptors() {
        this.client.interceptors.request.use((config) => {
            logger_1.default.info(`Making Telnyx Inference request: ${config.method?.toUpperCase()} ${config.url}`);
            return config;
        }, (error) => {
            logger_1.default.error('Telnyx Inference request error:', error);
            return Promise.reject(error);
        });
        this.client.interceptors.response.use((response) => {
            logger_1.default.info(`Telnyx Inference response: ${response.status} ${response.config.url}`);
            return response;
        }, (error) => {
            logger_1.default.error('Telnyx Inference response error:', {
                status: error.response?.status,
                data: error.response?.data,
                url: error.config?.url
            });
            return Promise.reject(error);
        });
    }
    async processRealTimeTranslation(request) {
        const startTime = Date.now();
        try {
            logger_1.default.info('Starting real-time translation', {
                callControlId: request.callControlId,
                sourceLanguage: request.sourceLanguage,
                targetLanguage: request.targetLanguage,
                customerId: request.customerId,
                tier: request.tier
            });
            if (!this.hasTranslationAccess(request.tier)) {
                throw new Error(`Translation service not available for ${request.tier} tier`);
            }
            const sttResult = await this.performSpeechToText(request.audioData, request.sourceLanguage);
            const detectedLanguage = request.sourceLanguage || sttResult.detectedLanguage;
            const translationResult = await this.performTranslation(sttResult.text, detectedLanguage, request.targetLanguage);
            const ttsResult = await this.performTextToSpeech(translationResult.translatedText, request.targetLanguage);
            const processingTime = Date.now() - startTime;
            const cost = this.calculateCost(processingTime, request.tier);
            await this.logTranslationUsage({
                callControlId: request.callControlId,
                customerId: request.customerId,
                sourceLanguage: detectedLanguage,
                targetLanguage: request.targetLanguage,
                originalText: sttResult.text,
                translatedText: translationResult.translatedText,
                processingTime,
                cost,
                tier: request.tier
            });
            this.io.emit('translation_completed', {
                callControlId: request.callControlId,
                sourceLanguage: detectedLanguage,
                targetLanguage: request.targetLanguage,
                originalText: sttResult.text,
                translatedText: translationResult.translatedText,
                processingTime,
                cost
            });
            return {
                success: true,
                translatedAudio: ttsResult.audio,
                translatedText: translationResult.translatedText,
                sourceLanguage: detectedLanguage,
                targetLanguage: request.targetLanguage,
                confidence: translationResult.confidence,
                processingTime,
                cost
            };
        }
        catch (error) {
            logger_1.default.error('Translation processing failed:', error);
            return {
                success: false,
                sourceLanguage: request.sourceLanguage || 'unknown',
                targetLanguage: request.targetLanguage,
                confidence: 0,
                processingTime: Date.now() - startTime,
                cost: 0,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async performSpeechToText(audioData, sourceLanguage) {
        try {
            const sttModel = sourceLanguage
                ? this.getSTTModel(sourceLanguage)
                : this.config.sttModel;
            const response = await this.client.post('/v1/speech-to-text', {
                audio: audioData.toString('base64'),
                model: sttModel,
                language: sourceLanguage,
                enable_language_detection: !sourceLanguage
            });
            return {
                text: response.data.text,
                confidence: response.data.confidence || 0.9,
                detectedLanguage: response.data.detected_language || sourceLanguage || 'en'
            };
        }
        catch (error) {
            logger_1.default.error('STT processing failed:', error);
            throw new Error('Speech-to-text conversion failed');
        }
    }
    async performTranslation(text, sourceLanguage, targetLanguage) {
        try {
            const response = await this.client.post('/v1/translation', {
                text,
                source_language: sourceLanguage,
                target_language: targetLanguage,
                model: this.config.translationModel,
                preserve_tone: true,
                preserve_context: true
            });
            return {
                translatedText: response.data.translated_text,
                confidence: response.data.confidence || 0.9
            };
        }
        catch (error) {
            logger_1.default.error('Translation failed:', error);
            throw new Error('Translation processing failed');
        }
    }
    async performTextToSpeech(text, targetLanguage) {
        try {
            const ttsModel = this.getTTSModel(targetLanguage);
            const response = await this.client.post('/v1/text-to-speech', {
                text,
                model: ttsModel,
                language: targetLanguage,
                voice: 'natural',
                speed: 1.0,
                pitch: 1.0
            });
            return {
                audio: Buffer.from(response.data.audio, 'base64'),
                duration: response.data.duration || 0
            };
        }
        catch (error) {
            logger_1.default.error('TTS processing failed:', error);
            throw new Error('Text-to-speech conversion failed');
        }
    }
    async detectLanguage(audioData) {
        try {
            const response = await this.client.post('/v1/language-detection', {
                audio: audioData.toString('base64'),
                supported_languages: this.SUPPORTED_LANGUAGES.map(lang => lang.code)
            });
            return {
                language: response.data.detected_language,
                confidence: response.data.confidence,
                alternatives: response.data.alternatives || []
            };
        }
        catch (error) {
            logger_1.default.error('Language detection failed:', error);
            throw new Error('Language detection failed');
        }
    }
    getSupportedLanguages() {
        return this.SUPPORTED_LANGUAGES;
    }
    isLanguageSupported(languageCode) {
        return this.SUPPORTED_LANGUAGES.some(lang => lang.code === languageCode);
    }
    getSTTModel(languageCode) {
        const language = this.SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode);
        return language?.sttModels[0] || this.config.sttModel;
    }
    getTTSModel(languageCode) {
        const language = this.SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode);
        return language?.voiceModels[0] || this.config.ttsModel;
    }
    hasTranslationAccess(tier) {
        return tier === 'premium' || tier === 'enterprise';
    }
    calculateCost(processingTimeMs, tier) {
        const processingTimeMinutes = processingTimeMs / (1000 * 60);
        if (tier === 'premium' || tier === 'enterprise') {
            return processingTimeMinutes * this.PREMIUM_TIER_COST;
        }
        return 0;
    }
    async logTranslationUsage(data) {
        try {
            await this.prisma.translationUsage.create({
                data: {
                    call_control_id: data.callControlId,
                    customer_id: data.customerId,
                    source_language: data.sourceLanguage,
                    target_language: data.targetLanguage,
                    original_text: data.originalText,
                    translated_text: data.translatedText,
                    processing_time_ms: data.processingTime,
                    cost: data.cost,
                    tier: data.tier,
                    created_at: new Date()
                }
            });
            await this.updateCustomerTranslationStats(data.customerId, data.cost);
        }
        catch (error) {
            logger_1.default.error('Failed to log translation usage:', error);
        }
    }
    async updateCustomerTranslationStats(customerId, cost) {
        try {
            await this.prisma.customerTranslationStats.upsert({
                where: { customer_id: customerId },
                update: {
                    total_translations: { increment: 1 },
                    total_cost: { increment: cost },
                    last_translation_at: new Date()
                },
                create: {
                    customer_id: customerId,
                    total_translations: 1,
                    total_cost: cost,
                    last_translation_at: new Date()
                }
            });
        }
        catch (error) {
            logger_1.default.error('Failed to update customer translation stats:', error);
        }
    }
    async getCustomerTranslationStats(customerId) {
        try {
            return await this.prisma.customerTranslationStats.findUnique({
                where: { customer_id: customerId }
            });
        }
        catch (error) {
            logger_1.default.error('Failed to get customer translation stats:', error);
            throw error;
        }
    }
    async getTranslationUsageHistory(customerId, page = 1, limit = 20) {
        try {
            const skip = (page - 1) * limit;
            const [translations, total] = await Promise.all([
                this.prisma.translationUsage.findMany({
                    where: { customer_id: customerId },
                    skip,
                    take: limit,
                    orderBy: { created_at: 'desc' }
                }),
                this.prisma.translationUsage.count({
                    where: { customer_id: customerId }
                })
            ]);
            return {
                translations,
                total,
                pages: Math.ceil(total / limit)
            };
        }
        catch (error) {
            logger_1.default.error('Failed to get translation usage history:', error);
            throw error;
        }
    }
    getTranslationPricing() {
        return {
            telnyxCost: this.TELNYX_COST_PER_MINUTE,
            markup: this.MARKUP_PER_MINUTE,
            totalCost: this.PREMIUM_TIER_COST,
            currency: 'USD'
        };
    }
    async enableCallTranslation(callControlId, sourceLanguage, targetLanguage, customerId, tier) {
        try {
            if (!this.hasTranslationAccess(tier)) {
                return {
                    success: false,
                    error: `Translation service not available for ${tier} tier`
                };
            }
            if (!this.isLanguageSupported(sourceLanguage) || !this.isLanguageSupported(targetLanguage)) {
                return {
                    success: false,
                    error: 'Unsupported language combination'
                };
            }
            await this.redis.setEx(`translation:${callControlId}`, 3600, JSON.stringify({
                sourceLanguage,
                targetLanguage,
                customerId,
                tier,
                enabled: true,
                createdAt: new Date().toISOString()
            }));
            logger_1.default.info('Call translation enabled', {
                callControlId,
                sourceLanguage,
                targetLanguage,
                customerId,
                tier
            });
            return { success: true };
        }
        catch (error) {
            logger_1.default.error('Failed to enable call translation:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async disableCallTranslation(callControlId) {
        try {
            await this.redis.del(`translation:${callControlId}`);
            logger_1.default.info('Call translation disabled', { callControlId });
            return { success: true };
        }
        catch (error) {
            logger_1.default.error('Failed to disable call translation:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async getCallTranslationConfig(callControlId) {
        try {
            const config = await this.redis.get(`translation:${callControlId}`);
            return config ? JSON.parse(config) : null;
        }
        catch (error) {
            logger_1.default.error('Failed to get call translation config:', error);
            return null;
        }
    }
}
exports.TelnyxTranslationService = TelnyxTranslationService;
//# sourceMappingURL=TelnyxTranslationService.js.map