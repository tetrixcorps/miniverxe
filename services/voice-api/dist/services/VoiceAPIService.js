"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceAPIService = void 0;
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
class VoiceAPIService {
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
        this.telnyxConfig = {
            apiKey: process.env.TELNYX_API_KEY || '',
            baseUrl: 'https://api.telnyx.com/v2',
            webhookUrl: process.env.TELNYX_WEBHOOK_URL || ''
        };
    }
    async initialize() {
        console.log('🔄 Initializing Voice API service...');
        await this.testTelnyxConnection();
        await this.loadVoiceTemplates();
        console.log('✅ Voice API service initialized');
    }
    async testTelnyxConnection() {
        try {
            const response = await axios_1.default.get(`${this.telnyxConfig.baseUrl}/phone_numbers`, {
                headers: {
                    'Authorization': `Bearer ${this.telnyxConfig.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.status !== 200) {
                throw new Error('Telnyx API connection failed');
            }
            console.log('✅ Telnyx API connection successful');
        }
        catch (error) {
            console.error('❌ Telnyx API connection failed:', error);
            throw error;
        }
    }
    async createOutboundCall(from, to, userId) {
        try {
            const callId = (0, uuid_1.v4)();
            const response = await axios_1.default.post(`${this.telnyxConfig.baseUrl}/calls`, {
                to: to,
                from: from,
                webhook_url: `${this.telnyxConfig.webhookUrl}/api/webhook/telnyx/voice`,
                webhook_failover_url: `${this.telnyxConfig.webhookUrl}/api/webhook/telnyx/voice/failover`,
                client_state: JSON.stringify({ callId, userId }),
                command_id: callId
            }, {
                headers: {
                    'Authorization': `Bearer ${this.telnyxConfig.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            const voiceCall = {
                id: (0, uuid_1.v4)(),
                callId: response.data.data.call_control_id,
                from,
                to,
                status: 'initiated',
                direction: 'outbound',
                userId,
                metadata: response.data.data,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await this.storeCall(voiceCall);
            return {
                success: true,
                data: {
                    callId: voiceCall.callId,
                    status: voiceCall.status,
                    direction: voiceCall.direction
                }
            };
        }
        catch (error) {
            console.error('Error creating outbound call:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async answerCall(callId) {
        try {
            const response = await axios_1.default.post(`${this.telnyxConfig.baseUrl}/calls/${callId}/actions/answer`, {}, {
                headers: {
                    'Authorization': `Bearer ${this.telnyxConfig.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            await this.updateCallStatus(callId, 'answered');
            return {
                success: true,
                data: response.data
            };
        }
        catch (error) {
            console.error('Error answering call:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async hangupCall(callId) {
        try {
            const response = await axios_1.default.post(`${this.telnyxConfig.baseUrl}/calls/${callId}/actions/hangup`, {}, {
                headers: {
                    'Authorization': `Bearer ${this.telnyxConfig.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            await this.updateCallStatus(callId, 'completed');
            return {
                success: true,
                data: response.data
            };
        }
        catch (error) {
            console.error('Error hanging up call:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async transferCall(callId, to) {
        try {
            const response = await axios_1.default.post(`${this.telnyxConfig.baseUrl}/calls/${callId}/actions/transfer`, {
                to: to
            }, {
                headers: {
                    'Authorization': `Bearer ${this.telnyxConfig.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return {
                success: true,
                data: response.data
            };
        }
        catch (error) {
            console.error('Error transferring call:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async playAudio(callId, audioUrl) {
        try {
            const response = await axios_1.default.post(`${this.telnyxConfig.baseUrl}/calls/${callId}/actions/playback_start`, {
                audio_url: audioUrl
            }, {
                headers: {
                    'Authorization': `Bearer ${this.telnyxConfig.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return {
                success: true,
                data: response.data
            };
        }
        catch (error) {
            console.error('Error playing audio:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async speakText(callId, text, voice) {
        try {
            const response = await axios_1.default.post(`${this.telnyxConfig.baseUrl}/calls/${callId}/actions/speak`, {
                payload: text,
                voice: voice || 'alice',
                language: 'en-US'
            }, {
                headers: {
                    'Authorization': `Bearer ${this.telnyxConfig.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return {
                success: true,
                data: response.data
            };
        }
        catch (error) {
            console.error('Error speaking text:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async gatherInput(callId, maxDigits, timeout) {
        try {
            const response = await axios_1.default.post(`${this.telnyxConfig.baseUrl}/calls/${callId}/actions/gather`, {
                max_digits: maxDigits || 1,
                timeout_millis: timeout || 5000,
                terminating_digit: '#'
            }, {
                headers: {
                    'Authorization': `Bearer ${this.telnyxConfig.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return {
                success: true,
                data: response.data
            };
        }
        catch (error) {
            console.error('Error gathering input:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async startRecording(callId, channels) {
        try {
            const response = await axios_1.default.post(`${this.telnyxConfig.baseUrl}/calls/${callId}/actions/record_start`, {
                channels: channels || 'single',
                format: 'wav'
            }, {
                headers: {
                    'Authorization': `Bearer ${this.telnyxConfig.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return {
                success: true,
                data: response.data
            };
        }
        catch (error) {
            console.error('Error starting recording:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async stopRecording(callId) {
        try {
            const response = await axios_1.default.post(`${this.telnyxConfig.baseUrl}/calls/${callId}/actions/record_stop`, {}, {
                headers: {
                    'Authorization': `Bearer ${this.telnyxConfig.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return {
                success: true,
                data: response.data
            };
        }
        catch (error) {
            console.error('Error stopping recording:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async getCallStatus(callId) {
        try {
            const response = await axios_1.default.get(`${this.telnyxConfig.baseUrl}/calls/${callId}`, {
                headers: {
                    'Authorization': `Bearer ${this.telnyxConfig.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return {
                success: true,
                data: response.data.data
            };
        }
        catch (error) {
            console.error('Error getting call status:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async getCallRecordings(callId) {
        try {
            const response = await axios_1.default.get(`${this.telnyxConfig.baseUrl}/call_recordings`, {
                params: {
                    'filter[call_control_id]': callId
                },
                headers: {
                    'Authorization': `Bearer ${this.telnyxConfig.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return {
                success: true,
                data: response.data.data
            };
        }
        catch (error) {
            console.error('Error getting call recordings:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async processWebhook(webhookData) {
        try {
            const { event_type, data } = webhookData;
            console.log(`📞 Processing Telnyx webhook: ${event_type}`);
            switch (event_type) {
                case 'call.initiated':
                    await this.handleCallInitiated(data);
                    break;
                case 'call.answered':
                    await this.handleCallAnswered(data);
                    break;
                case 'call.hangup':
                    await this.handleCallHangup(data);
                    break;
                case 'call.recording.saved':
                    await this.handleCallRecordingSaved(data);
                    break;
                case 'call.gather.ended':
                    await this.handleCallGatherEnded(data);
                    break;
                default:
                    console.log(`Unhandled webhook event: ${event_type}`);
            }
            return {
                success: true,
                data: { processed: true }
            };
        }
        catch (error) {
            console.error('Error processing webhook:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async handleCallInitiated(data) {
        console.log('📞 Call initiated:', data);
    }
    async handleCallAnswered(data) {
        console.log('📞 Call answered:', data);
    }
    async handleCallHangup(data) {
        console.log('📞 Call hangup:', data);
    }
    async handleCallRecordingSaved(data) {
        console.log('📼 Call recording saved:', data);
    }
    async handleCallGatherEnded(data) {
        console.log('📝 Call gather ended:', data);
    }
    async storeCall(voiceCall) {
        await this.redis.setEx(`voice_call:${voiceCall.callId}`, 3600, JSON.stringify(voiceCall));
    }
    async updateCallStatus(callId, status) {
        const callData = await this.redis.get(`voice_call:${callId}`);
        if (callData) {
            const call = JSON.parse(callData);
            call.status = status;
            call.updatedAt = new Date();
            await this.redis.setEx(`voice_call:${callId}`, 3600, JSON.stringify(call));
        }
    }
    async loadVoiceTemplates() {
        console.log('📝 Voice templates loaded');
    }
    async getCall(callId) {
        const callData = await this.redis.get(`voice_call:${callId}`);
        return callData ? JSON.parse(callData) : null;
    }
    async getCallsByUser(userId) {
        return [];
    }
    async getCallsByTollFreeNumber(tollFreeNumber) {
        return [];
    }
}
exports.VoiceAPIService = VoiceAPIService;
//# sourceMappingURL=VoiceAPIService.js.map