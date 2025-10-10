"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createTranslationRoutes;
const express_1 = require("express");
const joi_1 = __importDefault(require("joi"));
const TelnyxTranslationService_1 = require("../services/TelnyxTranslationService");
const translationModels_1 = require("../models/translationModels");
const logger_1 = __importDefault(require("../utils/logger"));
const auth_1 = require("../middleware/auth");
const rateLimiter_1 = require("../middleware/rateLimiter");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
function createTranslationRoutes(prisma, redis, io) {
    const translationService = new TelnyxTranslationService_1.TelnyxTranslationService(prisma, redis, io, {
        apiKey: process.env.TELNYX_API_KEY || '',
        inferenceBaseUrl: process.env.TELNYX_INFERENCE_BASE_URL || 'https://api.telnyx.com/v2',
        sttModel: process.env.TELNYX_STT_MODEL || 'whisper-1',
        ttsModel: process.env.TELNYX_TTS_MODEL || 'tts-1',
        translationModel: process.env.TELNYX_TRANSLATION_MODEL || 'gpt-3.5-turbo'
    });
    const translationDB = new translationModels_1.TranslationDatabaseService(prisma);
    router.get('/languages', rateLimiter_1.apiLimiter, async (req, res) => {
        try {
            const languages = translationService.getSupportedLanguages();
            return res.json({
                success: true,
                languages,
                count: languages.length
            });
        }
        catch (error) {
            logger_1.default.error('Failed to get supported languages:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to get supported languages'
            });
        }
    });
    router.get('/pricing', rateLimiter_1.apiLimiter, async (req, res) => {
        try {
            const pricing = translationService.getTranslationPricing();
            const tierPricing = translationDB.getTranslationPricing();
            return res.json({
                success: true,
                pricing: {
                    current: pricing,
                    byTier: tierPricing
                }
            });
        }
        catch (error) {
            logger_1.default.error('Failed to get translation pricing:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to get translation pricing'
            });
        }
    });
    router.post('/translate', auth_1.authenticateToken, rateLimiter_1.apiLimiter, (0, validation_1.validateRequest)(joi_1.default.object({
        callControlId: joi_1.default.string().required(),
        audioData: joi_1.default.string().required(),
        sourceLanguage: joi_1.default.string().optional(),
        targetLanguage: joi_1.default.string().required(),
        customerId: joi_1.default.string().required(),
        tier: joi_1.default.string().valid('basic', 'premium', 'enterprise').required()
    })), async (req, res) => {
        try {
            const { callControlId, audioData, sourceLanguage, targetLanguage, customerId, tier } = req.body;
            if (sourceLanguage && !translationService.isLanguageSupported(sourceLanguage)) {
                return res.status(400).json({
                    success: false,
                    error: `Unsupported source language: ${sourceLanguage}`
                });
            }
            if (!translationService.isLanguageSupported(targetLanguage)) {
                return res.status(400).json({
                    success: false,
                    error: `Unsupported target language: ${targetLanguage}`
                });
            }
            const audioBuffer = Buffer.from(audioData, 'base64');
            const translationRequest = {
                callControlId,
                audioData: audioBuffer,
                sourceLanguage,
                targetLanguage,
                customerId,
                tier
            };
            const result = await translationService.processRealTimeTranslation(translationRequest);
            if (result.success) {
                return res.json({
                    success: true,
                    data: {
                        translatedAudio: result.translatedAudio?.toString('base64'),
                        translatedText: result.translatedText,
                        sourceLanguage: result.sourceLanguage,
                        targetLanguage: result.targetLanguage,
                        confidence: result.confidence,
                        processingTime: result.processingTime,
                        cost: result.cost
                    }
                });
            }
            else {
                return res.status(400).json({
                    success: false,
                    error: result.error || 'Translation failed'
                });
            }
        }
        catch (error) {
            logger_1.default.error('Translation request failed:', error);
            return res.status(500).json({
                success: false,
                error: 'Translation processing failed'
            });
        }
    });
    router.post('/detect-language', auth_1.authenticateToken, rateLimiter_1.apiLimiter, (0, validation_1.validateRequest)(joi_1.default.object({
        audioData: joi_1.default.string().required()
    })), async (req, res) => {
        try {
            const { audioData } = req.body;
            const audioBuffer = Buffer.from(audioData, 'base64');
            const result = await translationService.detectLanguage(audioBuffer);
            return res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            logger_1.default.error('Language detection failed:', error);
            return res.status(500).json({
                success: false,
                error: 'Language detection failed'
            });
        }
    });
    router.post('/calls/:callControlId/enable', auth_1.authenticateToken, rateLimiter_1.apiLimiter, (0, validation_1.validateRequest)(joi_1.default.object({
        callControlId: joi_1.default.string().required(),
        sourceLanguage: joi_1.default.string().required(),
        targetLanguage: joi_1.default.string().required(),
        customerId: joi_1.default.string().required(),
        tier: joi_1.default.string().valid('basic', 'premium', 'enterprise').required()
    })), async (req, res) => {
        try {
            const { callControlId } = req.params;
            const { sourceLanguage, targetLanguage, customerId, tier } = req.body;
            const result = await translationService.enableCallTranslation(callControlId, sourceLanguage, targetLanguage, customerId, tier);
            if (result.success) {
                return res.json({
                    success: true,
                    message: 'Translation enabled for call'
                });
            }
            else {
                return res.status(400).json({
                    success: false,
                    error: result.error
                });
            }
        }
        catch (error) {
            logger_1.default.error('Failed to enable call translation:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to enable call translation'
            });
        }
    });
    router.post('/calls/:callControlId/disable', auth_1.authenticateToken, rateLimiter_1.apiLimiter, async (req, res) => {
        try {
            const { callControlId } = req.params;
            const result = await translationService.disableCallTranslation(callControlId);
            if (result.success) {
                return res.json({
                    success: true,
                    message: 'Translation disabled for call'
                });
            }
            else {
                return res.status(400).json({
                    success: false,
                    error: result.error
                });
            }
        }
        catch (error) {
            logger_1.default.error('Failed to disable call translation:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to disable call translation'
            });
        }
    });
    router.get('/calls/:callControlId/config', auth_1.authenticateToken, rateLimiter_1.apiLimiter, async (req, res) => {
        try {
            const { callControlId } = req.params;
            const config = await translationService.getCallTranslationConfig(callControlId);
            return res.json({
                success: true,
                data: config
            });
        }
        catch (error) {
            logger_1.default.error('Failed to get call translation config:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to get call translation config'
            });
        }
    });
    router.get('/stats/:customerId', auth_1.authenticateToken, rateLimiter_1.apiLimiter, async (req, res) => {
        try {
            const { customerId } = req.params;
            const stats = await translationService.getCustomerTranslationStats(customerId);
            return res.json({
                success: true,
                data: stats
            });
        }
        catch (error) {
            logger_1.default.error('Failed to get customer translation stats:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to get customer translation stats'
            });
        }
    });
    router.get('/usage/:customerId', auth_1.authenticateToken, rateLimiter_1.apiLimiter, async (req, res) => {
        try {
            const { customerId } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const history = await translationService.getTranslationUsageHistory(customerId, page, limit);
            return res.json({
                success: true,
                data: history
            });
        }
        catch (error) {
            logger_1.default.error('Failed to get translation usage history:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to get translation usage history'
            });
        }
    });
    router.get('/metrics', auth_1.authenticateToken, rateLimiter_1.apiLimiter, async (req, res) => {
        try {
            const customerId = req.query.customerId;
            const metrics = await translationDB.getTranslationMetrics(customerId);
            return res.json({
                success: true,
                data: metrics
            });
        }
        catch (error) {
            logger_1.default.error('Failed to get translation metrics:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to get translation metrics'
            });
        }
    });
    router.get('/costs/:customerId', auth_1.authenticateToken, rateLimiter_1.apiLimiter, async (req, res) => {
        try {
            const { customerId } = req.params;
            const startDate = new Date(req.query.startDate);
            const endDate = new Date(req.query.endDate);
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid date range'
                });
            }
            const costs = await translationDB.getCustomerTranslationCosts(customerId, startDate, endDate);
            return res.json({
                success: true,
                data: costs
            });
        }
        catch (error) {
            logger_1.default.error('Failed to get translation costs:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to get translation costs'
            });
        }
    });
    router.post('/config', auth_1.authenticateToken, rateLimiter_1.apiLimiter, (0, validation_1.validateRequest)(joi_1.default.object({
        customerId: joi_1.default.string().required(),
        defaultSourceLanguage: joi_1.default.string().optional(),
        defaultTargetLanguage: joi_1.default.string().optional(),
        autoDetectLanguage: joi_1.default.boolean().optional(),
        enabled: joi_1.default.boolean().optional()
    })), async (req, res) => {
        try {
            const { customerId, defaultSourceLanguage, defaultTargetLanguage, autoDetectLanguage, enabled } = req.body;
            const config = await translationDB.updateTranslationConfig(customerId, {
                default_source_language: defaultSourceLanguage,
                default_target_language: defaultTargetLanguage,
                auto_detect_language: autoDetectLanguage,
                enabled
            });
            return res.json({
                success: true,
                data: config
            });
        }
        catch (error) {
            logger_1.default.error('Failed to update translation config:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to update translation config'
            });
        }
    });
    router.get('/config/:customerId', auth_1.authenticateToken, rateLimiter_1.apiLimiter, async (req, res) => {
        try {
            const { customerId } = req.params;
            const config = await translationDB.getTranslationConfig(customerId);
            return res.json({
                success: true,
                data: config
            });
        }
        catch (error) {
            logger_1.default.error('Failed to get translation config:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to get translation config'
            });
        }
    });
    router.get('/export/:customerId', auth_1.authenticateToken, rateLimiter_1.apiLimiter, async (req, res) => {
        try {
            const { customerId } = req.params;
            const startDate = new Date(req.query.startDate);
            const endDate = new Date(req.query.endDate);
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid date range'
                });
            }
            const data = await translationDB.exportTranslationData(customerId, startDate, endDate);
            return res.json({
                success: true,
                data,
                count: data.length,
                dateRange: { startDate, endDate }
            });
        }
        catch (error) {
            logger_1.default.error('Failed to export translation data:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to export translation data'
            });
        }
    });
    router.get('/health', async (req, res) => {
        try {
            const languages = translationService.getSupportedLanguages();
            return res.json({
                success: true,
                status: 'healthy',
                supportedLanguages: languages.length,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            logger_1.default.error('Translation service health check failed:', error);
            return res.status(500).json({
                success: false,
                status: 'unhealthy',
                error: 'Translation service unavailable'
            });
        }
    });
    return router;
}
//# sourceMappingURL=translation.js.map