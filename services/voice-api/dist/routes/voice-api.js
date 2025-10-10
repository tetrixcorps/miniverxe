"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createVoiceAPIRoutes;
const express_1 = __importDefault(require("express"));
const TelnyxVoiceService_1 = require("../services/TelnyxVoiceService");
const voiceModels_1 = require("../models/voiceModels");
const webhookValidator_1 = require("../utils/webhookValidator");
const logger_1 = __importDefault(require("../utils/logger"));
const router = express_1.default.Router();
function createVoiceAPIRoutes(prisma, redis, io) {
    const voiceConfig = {
        apiKey: process.env.TELNYX_API_KEY || '',
        apiBase: process.env.TELNYX_API_BASE || 'https://api.telnyx.com/v2',
        webhookSecret: process.env.TELNYX_WEBHOOK_SECRET || '',
        webhookUrl: process.env.TELNYX_WEBHOOK_URL || 'https://tetrixcorp.com/webhook',
        connectionId: process.env.TELNYX_CONNECTION_ID || ''
    };
    const voiceService = new TelnyxVoiceService_1.TelnyxVoiceService(prisma, redis, io, voiceConfig);
    const dbService = new voiceModels_1.VoiceDatabaseService(prisma);
    const requireApiKey = (req, res, next) => {
        const apiKey = req.headers.authorization?.replace('Bearer ', '') || req.headers['x-api-key'];
        if (!apiKey || apiKey !== process.env.VOICE_API_KEY) {
            return res.status(401).json({ error: 'Unauthorized: Invalid or missing API key' });
        }
        return next();
    };
    router.get('/health', (req, res) => {
        return res.json({
            status: 'healthy',
            service: 'voice-api',
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        });
    });
    router.get('/calls', requireApiKey, async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const result = await voiceService.getCalls(page, limit);
            return res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            logger_1.default.error('Error fetching calls:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch calls'
            });
        }
    });
    router.get('/calls/:callId', requireApiKey, async (req, res) => {
        try {
            const { callId } = req.params;
            const call = await voiceService.getCallById(callId);
            if (!call) {
                return res.status(404).json({
                    success: false,
                    error: 'Call not found'
                });
            }
            return res.json({
                success: true,
                data: call
            });
        }
        catch (error) {
            logger_1.default.error(`Error fetching call ${req.params.callId}:`, error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch call'
            });
        }
    });
    router.get('/stats', requireApiKey, async (req, res) => {
        try {
            const stats = await dbService.getCallStats();
            return res.json({
                success: true,
                data: stats
            });
        }
        catch (error) {
            logger_1.default.error('Error fetching call stats:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch call statistics'
            });
        }
    });
    router.post('/calls/:callControlId/answer', requireApiKey, async (req, res) => {
        try {
            const { callControlId } = req.params;
            const { client_state } = req.body;
            const result = await voiceService.answerCall(callControlId, client_state);
            return res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            logger_1.default.error(`Error answering call ${req.params.callControlId}:`, error);
            return res.status(500).json({
                success: false,
                error: 'Failed to answer call'
            });
        }
    });
    router.post('/calls/:callControlId/hangup', requireApiKey, async (req, res) => {
        try {
            const { callControlId } = req.params;
            const { client_state } = req.body;
            const result = await voiceService.hangupCall(callControlId, client_state);
            return res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            logger_1.default.error(`Error hanging up call ${req.params.callControlId}:`, error);
            return res.status(500).json({
                success: false,
                error: 'Failed to hangup call'
            });
        }
    });
    router.post('/calls/dial', requireApiKey, async (req, res) => {
        try {
            const { to, from, connection_id, webhook_url, ...options } = req.body;
            if (!to || !from || !connection_id) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: to, from, connection_id'
                });
            }
            const result = await voiceService.dialCall(to, from, connection_id, webhook_url, options);
            return res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            logger_1.default.error('Error making call:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to make call'
            });
        }
    });
    router.post('/calls/:callControlId/bridge', requireApiKey, async (req, res) => {
        try {
            const { callControlId } = req.params;
            const { bridge_to } = req.body;
            if (!bridge_to) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required field: bridge_to'
                });
            }
            const result = await voiceService.bridgeCalls(callControlId, bridge_to);
            return res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            logger_1.default.error(`Error bridging call ${req.params.callControlId}:`, error);
            return res.status(500).json({
                success: false,
                error: 'Failed to bridge call'
            });
        }
    });
    router.post('/calls/:callControlId/speak', requireApiKey, async (req, res) => {
        try {
            const { callControlId } = req.params;
            const { text, voice, language } = req.body;
            if (!text) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required field: text'
                });
            }
            const result = await voiceService.speakText(callControlId, text, voice, language);
            return res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            logger_1.default.error(`Error speaking on call ${req.params.callControlId}:`, error);
            return res.status(500).json({
                success: false,
                error: 'Failed to speak on call'
            });
        }
    });
    router.post('/calls/:callControlId/play', requireApiKey, async (req, res) => {
        try {
            const { callControlId } = req.params;
            const { audio_url, loop } = req.body;
            if (!audio_url) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required field: audio_url'
                });
            }
            const result = await voiceService.playAudio(callControlId, audio_url, loop);
            return res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            logger_1.default.error(`Error playing audio on call ${req.params.callControlId}:`, error);
            return res.status(500).json({
                success: false,
                error: 'Failed to play audio'
            });
        }
    });
    router.post('/calls/:callControlId/stop-playback', requireApiKey, async (req, res) => {
        try {
            const { callControlId } = req.params;
            const result = await voiceService.stopPlayback(callControlId);
            return res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            logger_1.default.error(`Error stopping playback on call ${req.params.callControlId}:`, error);
            return res.status(500).json({
                success: false,
                error: 'Failed to stop playback'
            });
        }
    });
    router.post('/calls/:callControlId/gather', requireApiKey, async (req, res) => {
        try {
            const { callControlId } = req.params;
            const { max_digits, timeout_millis, terminating_digit, valid_digits } = req.body;
            const result = await voiceService.gatherInput(callControlId, max_digits, timeout_millis, terminating_digit, valid_digits);
            return res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            logger_1.default.error(`Error gathering input on call ${req.params.callControlId}:`, error);
            return res.status(500).json({
                success: false,
                error: 'Failed to gather input'
            });
        }
    });
    router.post('/calls/:callControlId/gather-speak', requireApiKey, async (req, res) => {
        try {
            const { callControlId } = req.params;
            const { text, voice, language, max_digits, timeout_millis, terminating_digit, invalid_audio_url } = req.body;
            if (!text) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required field: text'
                });
            }
            const options = {
                max_digits,
                timeout_millis,
                terminating_digit,
                invalid_audio_url
            };
            const result = await voiceService.gatherUsingSpeak(callControlId, text, max_digits, voice, options);
            return res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            logger_1.default.error(`Error gathering with speak on call ${req.params.callControlId}:`, error);
            return res.status(500).json({
                success: false,
                error: 'Failed to gather input with speak'
            });
        }
    });
    router.post('/calls/:callControlId/record-start', requireApiKey, async (req, res) => {
        try {
            const { callControlId } = req.params;
            const { channels, format, play_beep, trimming_enabled, dual_channel_enabled } = req.body;
            const options = {
                channels,
                format,
                play_beep,
                trimming_enabled,
                dual_channel_enabled
            };
            const result = await voiceService.startRecording(callControlId, channels, format, options);
            return res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            logger_1.default.error(`Error starting recording on call ${req.params.callControlId}:`, error);
            return res.status(500).json({
                success: false,
                error: 'Failed to start recording'
            });
        }
    });
    router.post('/calls/:callControlId/record-stop', requireApiKey, async (req, res) => {
        try {
            const { callControlId } = req.params;
            const result = await voiceService.stopRecording(callControlId);
            return res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            logger_1.default.error(`Error stopping recording on call ${req.params.callControlId}:`, error);
            return res.status(500).json({
                success: false,
                error: 'Failed to stop recording'
            });
        }
    });
    router.post('/calls/:callControlId/join-conference', requireApiKey, async (req, res) => {
        try {
            const { callControlId } = req.params;
            const { conference_name, start_conference_on_enter, end_conference_on_exit } = req.body;
            if (!conference_name) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required field: conference_name'
                });
            }
            const result = await voiceService.joinConference(callControlId, conference_name, start_conference_on_enter, end_conference_on_exit);
            return res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            logger_1.default.error(`Error joining conference on call ${req.params.callControlId}:`, error);
            return res.status(500).json({
                success: false,
                error: 'Failed to join conference'
            });
        }
    });
    router.post('/calls/:callControlId/leave-conference', requireApiKey, async (req, res) => {
        try {
            const { callControlId } = req.params;
            const result = await voiceService.leaveConference(callControlId);
            return res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            logger_1.default.error(`Error leaving conference on call ${req.params.callControlId}:`, error);
            return res.status(500).json({
                success: false,
                error: 'Failed to leave conference'
            });
        }
    });
    router.post('/calls/:callControlId/mute', requireApiKey, async (req, res) => {
        try {
            const { callControlId } = req.params;
            const result = await voiceService.muteParticipant(callControlId);
            return res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            logger_1.default.error(`Error muting participant on call ${req.params.callControlId}:`, error);
            return res.status(500).json({
                success: false,
                error: 'Failed to mute participant'
            });
        }
    });
    router.post('/calls/:callControlId/unmute', requireApiKey, async (req, res) => {
        try {
            const { callControlId } = req.params;
            const result = await voiceService.unmuteParticipant(callControlId);
            return res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            logger_1.default.error(`Error unmuting participant on call ${req.params.callControlId}:`, error);
            return res.status(500).json({
                success: false,
                error: 'Failed to unmute participant'
            });
        }
    });
    router.post('/calls/:callControlId/transfer', requireApiKey, async (req, res) => {
        try {
            const { callControlId } = req.params;
            const { to_number } = req.body;
            if (!to_number) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required field: to_number'
                });
            }
            const result = await voiceService.transferCall(callControlId, to_number);
            return res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            logger_1.default.error(`Error transferring call ${req.params.callControlId}:`, error);
            return res.status(500).json({
                success: false,
                error: 'Failed to transfer call'
            });
        }
    });
    router.post('/calls/:callControlId/send-dtmf', requireApiKey, async (req, res) => {
        try {
            const { callControlId } = req.params;
            const { digits } = req.body;
            if (!digits) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required field: digits'
                });
            }
            const result = await voiceService.sendDTMF(callControlId, digits);
            return res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            logger_1.default.error(`Error sending DTMF on call ${req.params.callControlId}:`, error);
            return res.status(500).json({
                success: false,
                error: 'Failed to send DTMF'
            });
        }
    });
    router.post('/calls/:callControlId/fork-start', requireApiKey, async (req, res) => {
        try {
            const { callControlId } = req.params;
            const { target } = req.body;
            if (!target) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required field: target'
                });
            }
            const result = await voiceService.enableFork(callControlId, target);
            return res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            logger_1.default.error(`Error enabling fork on call ${req.params.callControlId}:`, error);
            return res.status(500).json({
                success: false,
                error: 'Failed to enable fork'
            });
        }
    });
    router.post('/calls/:callControlId/fork-stop', requireApiKey, async (req, res) => {
        try {
            const { callControlId } = req.params;
            const result = await voiceService.disableFork(callControlId);
            return res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            logger_1.default.error(`Error disabling fork on call ${req.params.callControlId}:`, error);
            return res.status(500).json({
                success: false,
                error: 'Failed to disable fork'
            });
        }
    });
    router.post('/calls/:callControlId/machine-detection-start', requireApiKey, async (req, res) => {
        try {
            const { callControlId } = req.params;
            const { detection_timeout_millis } = req.body;
            const result = await voiceService.enableMachineDetection(callControlId, detection_timeout_millis);
            return res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            logger_1.default.error(`Error enabling machine detection on call ${req.params.callControlId}:`, error);
            return res.status(500).json({
                success: false,
                error: 'Failed to enable machine detection'
            });
        }
    });
    router.post('/webhook', async (req, res) => {
        try {
            const payload = JSON.stringify(req.body);
            const headers = req.headers;
            const validation = (0, webhookValidator_1.validateTelnyxWebhook)(payload, headers, voiceConfig.webhookSecret);
            if (!validation.isValid) {
                logger_1.default.warn('Webhook validation failed:', validation.error);
                return res.status(401).json({
                    success: false,
                    error: 'Webhook validation failed',
                    details: validation.error
                });
            }
            const result = await voiceService.processWebhook(req.body);
            logger_1.default.info('Webhook processed successfully:', {
                event_type: req.body.data?.event_type,
                call_control_id: req.body.data?.payload?.call_control_id
            });
            return res.json({
                success: true,
                message: 'Webhook processed successfully',
                data: result
            });
        }
        catch (error) {
            logger_1.default.error('Error processing webhook:', error);
            return res.status(500).json({
                success: false,
                error: 'Webhook processing failed'
            });
        }
    });
    return router;
}
//# sourceMappingURL=voice-api.js.map