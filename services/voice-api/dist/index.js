"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const redis_1 = require("redis");
const client_1 = require("@prisma/client");
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const voice_api_1 = __importDefault(require("./routes/voice-api"));
const stripe_webhooks_1 = __importDefault(require("./routes/stripe-webhooks"));
const translation_1 = __importDefault(require("./routes/translation"));
const stt_1 = __importDefault(require("./routes/stt"));
const tts_1 = __importDefault(require("./routes/tts"));
const media_streaming_1 = __importDefault(require("./routes/media-streaming"));
const call_recording_1 = __importDefault(require("./routes/call-recording"));
const ivr_1 = __importDefault(require("./routes/ivr"));
const hitl_1 = __importDefault(require("./routes/hitl"));
const crm_1 = __importDefault(require("./routes/crm"));
const agent_1 = __importDefault(require("./routes/agent"));
const tenant_ivr_1 = __importDefault(require("./routes/tenant-ivr"));
const crm_integration_1 = __importDefault(require("./routes/crm-integration"));
const integration_1 = __importDefault(require("./routes/integration"));
const industry_ivr_1 = __importDefault(require("./routes/industry-ivr"));
const dynamic_onboarding_1 = __importDefault(require("./routes/dynamic-onboarding"));
const phone_migration_1 = __importDefault(require("./routes/phone-migration"));
const webhook_1 = __importDefault(require("./routes/webhook"));
const health_1 = __importDefault(require("./routes/health"));
const VoiceAPIService_1 = require("./services/VoiceAPIService");
const TelnyxVoiceService_1 = require("./services/TelnyxVoiceService");
const TelnyxTranslationService_1 = require("./services/TelnyxTranslationService");
const STTService_1 = require("./services/STTService");
const TTSService_1 = require("./services/TTSService");
const MediaStreamingService_1 = require("./services/MediaStreamingService");
const CallRecordingService_1 = require("./services/CallRecordingService");
const IVRService_1 = require("./services/IVRService");
const HITLService_1 = require("./services/HITLService");
const CRMService_1 = require("./services/CRMService");
const AgentService_1 = require("./services/AgentService");
const AgentRoutingService_1 = require("./services/AgentRoutingService");
const StripeService_1 = require("./services/StripeService");
const TenantIVRService_1 = require("./services/TenantIVRService");
const CRMIntegrationService_1 = require("./services/CRMIntegrationService");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const PORT = process.env.PORT || 4900;
const prisma = new client_1.PrismaClient();
const redis = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});
const voiceAPIService = new VoiceAPIService_1.VoiceAPIService(prisma, redis);
const telnyxVoiceService = new TelnyxVoiceService_1.TelnyxVoiceService(prisma, redis, io, {
    apiKey: process.env.TELNYX_API_KEY || '',
    apiBase: process.env.TELNYX_API_BASE || 'https://api.telnyx.com/v2',
    webhookSecret: process.env.TELNYX_WEBHOOK_SECRET || '',
    webhookUrl: process.env.TELNYX_WEBHOOK_URL || 'https://tetrixcorp.com/webhook'
});
const telnyxTranslationService = new TelnyxTranslationService_1.TelnyxTranslationService(prisma, redis, io, {
    apiKey: process.env.TELNYX_API_KEY || '',
    inferenceBaseUrl: process.env.TELNYX_INFERENCE_BASE_URL || 'https://api.telnyx.com/v2',
    sttModel: process.env.TELNYX_STT_MODEL || 'whisper-1',
    ttsModel: process.env.TELNYX_TTS_MODEL || 'tts-1',
    translationModel: process.env.TELNYX_TRANSLATION_MODEL || 'gpt-3.5-turbo'
});
const sttService = new STTService_1.STTService(prisma, redis, {
    apiKey: process.env.TELNYX_API_KEY || '',
    apiBase: process.env.TELNYX_INFERENCE_BASE_URL || 'https://api.telnyx.com/v2',
    model: process.env.TELNYX_STT_MODEL || 'whisper-1'
});
const ttsService = new TTSService_1.TTSService(prisma, redis, {
    apiKey: process.env.TELNYX_API_KEY || '',
    apiBase: process.env.TELNYX_INFERENCE_BASE_URL || 'https://api.telnyx.com/v2',
    model: process.env.TELNYX_TTS_MODEL || 'tts-1'
});
const mediaStreamingService = new MediaStreamingService_1.MediaStreamingService(prisma, redis, io, {
    maxStreams: 100,
    streamTimeout: 3600,
    quality: 'high'
});
const callRecordingService = new CallRecordingService_1.CallRecordingService(prisma, redis, io, {
    storageProvider: 's3',
    retentionDays: 90,
    encryptionEnabled: true,
    transcriptionEnabled: true
});
const ivrService = new IVRService_1.IVRService(prisma, redis);
const hitlService = new HITLService_1.HITLService(prisma, redis);
const crmService = new CRMService_1.CRMService(prisma, redis);
const agentService = new AgentService_1.AgentService(prisma, redis);
const agentRoutingService = new AgentRoutingService_1.AgentRoutingService(prisma, redis);
const stripeService = new StripeService_1.StripeService(prisma, redis);
const tenantIVRService = new TenantIVRService_1.TenantIVRService(prisma, redis);
const crmIntegrationService = new CRMIntegrationService_1.CRMIntegrationService(prisma, redis);
agentService.setDependencies(stripeService, voiceAPIService);
const voiceApiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: 'Too many voice API requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
app.use('/api/voice-api', voiceApiLimiter);
app.get('/health', (_, res) => res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'voice-api',
    version: '1.0.0'
}));
app.use('/api/voice-api', (0, voice_api_1.default)(prisma, redis, io));
app.use('/api/stripe-webhooks', (0, stripe_webhooks_1.default)(prisma, redis, io));
app.use('/api/translation', (0, translation_1.default)(prisma, redis, io));
app.use('/api/stt', stt_1.default);
app.use('/api/tts', tts_1.default);
app.use('/api/media-streaming', media_streaming_1.default);
app.use('/api/call-recording', call_recording_1.default);
app.use('/api/ivr', ivr_1.default);
app.use('/api/hitl', hitl_1.default);
app.use('/api/crm', crm_1.default);
app.use('/api/agent', agent_1.default);
app.use('/api/tenant-ivr', tenant_ivr_1.default);
app.use('/api/crm-integration', crm_integration_1.default);
app.use('/api/integration', integration_1.default);
app.use('/api/industry-ivr', industry_ivr_1.default);
app.use('/api/dynamic-onboarding', dynamic_onboarding_1.default);
app.use('/api/phone-migration', phone_migration_1.default);
app.use('/api/webhook', webhook_1.default);
app.use('/health', health_1.default);
io.on('connection', (socket) => {
    console.log('🔌 Voice API WebSocket client connected:', socket.id);
    socket.on('join_call', (callId) => {
        socket.join(`call_${callId}`);
        console.log(`📞 Client ${socket.id} joined call: ${callId}`);
    });
    socket.on('leave_call', (callId) => {
        socket.leave(`call_${callId}`);
        console.log(`📞 Client ${socket.id} left call: ${callId}`);
    });
    socket.on('media_stream', async (data) => {
        try {
            const { callId, audioData, metadata } = data;
            const result = await mediaStreamingService.processAudioStream(callId, audioData, metadata);
            socket.to(`call_${callId}`).emit('media_processed', {
                callId,
                result,
                timestamp: new Date().toISOString()
            });
            socket.emit('media_processed', {
                callId,
                result,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            console.error('Error processing media stream:', error);
            socket.emit('error', { message: 'Failed to process media stream' });
        }
    });
    socket.on('disconnect', () => {
        console.log('🔌 Voice API WebSocket client disconnected:', socket.id);
    });
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
const startServer = async () => {
    try {
        await redis.connect();
        console.log('✅ Redis connected');
        await prisma.$connect();
        console.log('✅ Database connected');
        await voiceAPIService.initialize();
        console.log('✅ Voice API service initialized');
        server.listen(PORT, () => {
            console.log(`🚀 Voice API Service running on port ${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/health`);
            console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
            console.log(`📞 Voice API: http://localhost:${PORT}/api/voice-api`);
            console.log(`💰 Stripe Webhooks: http://localhost:${PORT}/api/stripe-webhooks`);
            console.log(`🌍 Translation: http://localhost:${PORT}/api/translation`);
            console.log(`🎤 STT: http://localhost:${PORT}/api/stt`);
            console.log(`🔊 TTS: http://localhost:${PORT}/api/tts`);
            console.log(`📹 Media Streaming: http://localhost:${PORT}/api/media-streaming`);
            console.log(`📼 Call Recording: http://localhost:${PORT}/api/call-recording`);
            console.log(`📋 IVR: http://localhost:${PORT}/api/ivr`);
            console.log(`👥 HITL: http://localhost:${PORT}/api/hitl`);
            console.log(`📊 CRM: http://localhost:${PORT}/api/crm`);
            console.log(`🤖 Agent: http://localhost:${PORT}/api/agent`);
            console.log(`🏢 Tenant IVR: http://localhost:${PORT}/api/tenant-ivr`);
            console.log(`🔗 CRM Integration: http://localhost:${PORT}/api/crm-integration`);
            console.log(`🔧 Integration: http://localhost:${PORT}/api/integration`);
            console.log(`🏭 Industry IVR: http://localhost:${PORT}/api/industry-ivr`);
            console.log(`🚀 Dynamic Onboarding: http://localhost:${PORT}/api/dynamic-onboarding`);
            console.log(`📞 Phone Migration: http://localhost:${PORT}/api/phone-migration`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await prisma.$disconnect();
    await redis.quit();
    process.exit(0);
});
exports.default = app;
//# sourceMappingURL=index.js.map