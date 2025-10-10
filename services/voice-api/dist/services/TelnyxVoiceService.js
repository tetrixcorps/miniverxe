"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelnyxVoiceService = void 0;
const axios_1 = __importDefault(require("axios"));
const logger_1 = __importDefault(require("../utils/logger"));
class TelnyxVoiceService {
    constructor(prisma, redis, io, config) {
        this.prisma = prisma;
        this.redis = redis;
        this.io = io;
        this.config = config;
        this.client = axios_1.default.create({
            baseURL: config.apiBase,
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
            logger_1.default.info(`Making Telnyx API request: ${config.method?.toUpperCase()} ${config.url}`);
            return config;
        }, (error) => {
            logger_1.default.error('Telnyx API request error:', error);
            return Promise.reject(error);
        });
        this.client.interceptors.response.use((response) => {
            logger_1.default.info(`Telnyx API response: ${response.status} ${response.config.url}`);
            return response;
        }, (error) => {
            logger_1.default.error('Telnyx API response error:', {
                status: error.response?.status,
                data: error.response?.data,
                url: error.config?.url
            });
            return Promise.reject(error);
        });
    }
    async answerCall(callControlId, clientState) {
        try {
            const data = {};
            if (clientState) {
                data.client_state = clientState;
            }
            const response = await this.client.post(`/calls/${callControlId}/actions/answer`, data);
            await this.updateCallState(callControlId, 'answered');
            this.io.emit('call_answered', { call_control_id: callControlId, state: 'answered' });
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error answering call ${callControlId}:`, error);
            throw error;
        }
    }
    async hangupCall(callControlId, clientState) {
        try {
            const data = {};
            if (clientState) {
                data.client_state = clientState;
            }
            const response = await this.client.post(`/calls/${callControlId}/actions/hangup`, data);
            await this.updateCallState(callControlId, 'completed');
            this.io.emit('call_ended', { call_control_id: callControlId, state: 'completed' });
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error hanging up call ${callControlId}:`, error);
            throw error;
        }
    }
    async dialCall(to, from, connectionId, webhookUrl, options = {}) {
        try {
            const data = {
                to,
                from,
                connection_id: connectionId,
                webhook_url: webhookUrl || this.config.webhookUrl,
                ...options
            };
            const response = await this.client.post('/calls', data);
            await this.storeCall({
                call_control_id: response.data.data.call_control_id,
                call_session_id: response.data.data.call_session_id,
                connection_id: connectionId,
                from,
                to,
                direction: 'outbound',
                state: 'initiated',
                client_state: options.client_state,
                sip_headers: options.sip_headers
            });
            this.io.emit('call_initiated', response.data.data);
            return response.data;
        }
        catch (error) {
            logger_1.default.error('Error making call:', error);
            throw error;
        }
    }
    async bridgeCalls(callControlId, bridgeTo) {
        try {
            const data = { call_control_id: bridgeTo };
            const response = await this.client.post(`/calls/${callControlId}/actions/bridge`, data);
            await this.updateCallState(callControlId, 'bridged');
            this.io.emit('call_bridged', { call_control_id: callControlId, state: 'bridged' });
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error bridging call ${callControlId}:`, error);
            throw error;
        }
    }
    async speakText(callControlId, text, voice = 'female', language = 'en') {
        try {
            const data = {
                payload: text,
                voice,
                language
            };
            const response = await this.client.post(`/calls/${callControlId}/actions/speak`, data);
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error speaking text on call ${callControlId}:`, error);
            throw error;
        }
    }
    async playAudio(callControlId, audioUrl, loop = 1) {
        try {
            const data = {
                audio_url: audioUrl,
                loop
            };
            const response = await this.client.post(`/calls/${callControlId}/actions/playback_start`, data);
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error playing audio on call ${callControlId}:`, error);
            throw error;
        }
    }
    async stopPlayback(callControlId) {
        try {
            const response = await this.client.post(`/calls/${callControlId}/actions/playback_stop`);
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error stopping playback on call ${callControlId}:`, error);
            throw error;
        }
    }
    async gatherInput(callControlId, maxDigits = 1, timeoutMillis = 60000, terminatingDigit = '#', validDigits = '0123456789*#') {
        try {
            const data = {
                max_digits: maxDigits,
                timeout_millis: timeoutMillis,
                terminating_digit: terminatingDigit,
                valid_digits: validDigits
            };
            const response = await this.client.post(`/calls/${callControlId}/actions/gather`, data);
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error gathering input on call ${callControlId}:`, error);
            throw error;
        }
    }
    async gatherUsingSpeak(callControlId, text, maxDigits = 1, voice = 'female', options = {}) {
        try {
            const data = {
                payload: text,
                voice,
                invalid_audio_url: options.invalid_audio_url,
                max_digits: maxDigits,
                timeout_millis: options.timeout_millis || 60000,
                terminating_digit: options.terminating_digit || '#'
            };
            const response = await this.client.post(`/calls/${callControlId}/actions/gather_using_speak`, data);
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error gathering with speak on call ${callControlId}:`, error);
            throw error;
        }
    }
    async startRecording(callControlId, channels = 'dual', format = 'mp3', options = {}) {
        try {
            const data = {
                channels,
                format,
                play_beep: options.play_beep,
                trimming_enabled: options.trimming_enabled,
                dual_channel_enabled: options.dual_channel_enabled
            };
            const response = await this.client.post(`/calls/${callControlId}/actions/record_start`, data);
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error starting recording on call ${callControlId}:`, error);
            throw error;
        }
    }
    async stopRecording(callControlId) {
        try {
            const response = await this.client.post(`/calls/${callControlId}/actions/record_stop`);
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error stopping recording on call ${callControlId}:`, error);
            throw error;
        }
    }
    async joinConference(callControlId, conferenceName, startConferenceOnEnter = true, endConferenceOnExit = false) {
        try {
            const data = {
                name: conferenceName,
                start_conference_on_enter: startConferenceOnEnter,
                end_conference_on_exit: endConferenceOnExit
            };
            const response = await this.client.post(`/calls/${callControlId}/actions/join_conference`, data);
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error joining conference on call ${callControlId}:`, error);
            throw error;
        }
    }
    async leaveConference(callControlId) {
        try {
            const response = await this.client.post(`/calls/${callControlId}/actions/leave_conference`);
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error leaving conference on call ${callControlId}:`, error);
            throw error;
        }
    }
    async muteParticipant(callControlId) {
        try {
            const response = await this.client.post(`/calls/${callControlId}/actions/mute`);
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error muting participant on call ${callControlId}:`, error);
            throw error;
        }
    }
    async unmuteParticipant(callControlId) {
        try {
            const response = await this.client.post(`/calls/${callControlId}/actions/unmute`);
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error unmuting participant on call ${callControlId}:`, error);
            throw error;
        }
    }
    async transferCall(callControlId, toNumber) {
        try {
            const data = { to: toNumber };
            const response = await this.client.post(`/calls/${callControlId}/actions/refer`, data);
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error transferring call ${callControlId}:`, error);
            throw error;
        }
    }
    async sendDTMF(callControlId, digits) {
        try {
            const data = { digits };
            const response = await this.client.post(`/calls/${callControlId}/actions/send_dtmf`, data);
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error sending DTMF on call ${callControlId}:`, error);
            throw error;
        }
    }
    async enableFork(callControlId, target) {
        try {
            const data = { target };
            const response = await this.client.post(`/calls/${callControlId}/actions/fork_start`, data);
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error enabling fork on call ${callControlId}:`, error);
            throw error;
        }
    }
    async disableFork(callControlId) {
        try {
            const response = await this.client.post(`/calls/${callControlId}/actions/fork_stop`);
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error disabling fork on call ${callControlId}:`, error);
            throw error;
        }
    }
    async enableMachineDetection(callControlId, detectionTimeout = 30000) {
        try {
            const data = { detection_timeout_millis: detectionTimeout };
            const response = await this.client.post(`/calls/${callControlId}/actions/machine_detection_start`, data);
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`Error enabling machine detection on call ${callControlId}:`, error);
            throw error;
        }
    }
    async storeCall(callData) {
        try {
            await this.prisma.call.upsert({
                where: { call_control_id: callData.call_control_id },
                update: {
                    state: callData.state,
                    answered_at: callData.answered_at ? new Date(callData.answered_at) : null,
                    ended_at: callData.ended_at ? new Date(callData.ended_at) : null,
                    client_state: callData.client_state,
                    sip_headers: callData.sip_headers
                },
                create: {
                    id: callData.call_control_id,
                    call_control_id: callData.call_control_id,
                    call_session_id: callData.call_session_id,
                    connection_id: callData.connection_id,
                    from_number: callData.from,
                    to_number: callData.to,
                    direction: callData.direction,
                    state: callData.state,
                    client_state: callData.client_state,
                    sip_headers: callData.sip_headers
                }
            });
        }
        catch (error) {
            logger_1.default.error('Error storing call in database:', error);
            throw error;
        }
    }
    async updateCallState(callControlId, state) {
        try {
            const updateData = { state };
            if (state === 'answered') {
                updateData.answered_at = new Date();
            }
            else if (state === 'completed') {
                updateData.ended_at = new Date();
            }
            await this.prisma.call.update({
                where: { call_control_id: callControlId },
                data: updateData
            });
        }
        catch (error) {
            logger_1.default.error(`Error updating call state for ${callControlId}:`, error);
            throw error;
        }
    }
    async processWebhook(webhookData) {
        try {
            const eventData = webhookData.data;
            const eventType = eventData.event_type;
            const payload = eventData.payload;
            logger_1.default.info(`Processing Telnyx webhook: ${eventType}`);
            await this.storeWebhookEvent(eventData);
            const handler = this.getWebhookHandler(eventType);
            if (handler) {
                const result = await handler(payload, eventData);
                this.io.emit('webhook_event', {
                    event_type: eventType,
                    payload: payload,
                    timestamp: new Date().toISOString()
                });
                return result;
            }
            else {
                logger_1.default.warning(`No handler for event type: ${eventType}`);
                return { status: 'unhandled' };
            }
        }
        catch (error) {
            logger_1.default.error('Error processing webhook:', error);
            throw error;
        }
    }
    async storeWebhookEvent(eventData) {
        try {
            await this.prisma.callEvent.create({
                data: {
                    call_id: eventData.payload.call_control_id || 'unknown',
                    event_type: eventData.event_type,
                    payload: eventData.payload,
                    occurred_at: new Date(eventData.occurred_at)
                }
            });
        }
        catch (error) {
            logger_1.default.error('Error storing webhook event:', error);
        }
    }
    getWebhookHandler(eventType) {
        const handlers = {
            'call.initiated': this.handleCallInitiated.bind(this),
            'call.answered': this.handleCallAnswered.bind(this),
            'call.bridged': this.handleCallBridged.bind(this),
            'call.hangup': this.handleCallHangup.bind(this),
            'call.machine_detection_ended': this.handleMachineDetection.bind(this),
            'call.recording.saved': this.handleRecordingSaved.bind(this),
            'call.speak.ended': this.handleSpeakEnded.bind(this),
            'call.playback.ended': this.handlePlaybackEnded.bind(this),
            'call.gather.ended': this.handleGatherEnded.bind(this),
            'call.dtmf.received': this.handleDTMFReceived.bind(this),
            'conference.created': this.handleConferenceCreated.bind(this),
            'conference.ended': this.handleConferenceEnded.bind(this),
            'conference.participant.joined': this.handleParticipantJoined.bind(this),
            'conference.participant.left': this.handleParticipantLeft.bind(this)
        };
        return handlers[eventType] || null;
    }
    async handleCallInitiated(payload, eventData) {
        await this.storeCall({
            call_control_id: payload.call_control_id,
            call_session_id: payload.call_session_id,
            connection_id: payload.connection_id,
            from: payload.from,
            to: payload.to,
            direction: payload.direction || 'inbound',
            state: 'initiated',
            client_state: payload.client_state,
            sip_headers: payload.sip_headers
        });
        this.io.emit('call_initiated', payload);
        return { status: 'processed' };
    }
    async handleCallAnswered(payload, eventData) {
        await this.updateCallState(payload.call_control_id, 'answered');
        this.io.emit('call_answered', payload);
        return { status: 'processed' };
    }
    async handleCallBridged(payload, eventData) {
        await this.updateCallState(payload.call_control_id, 'bridged');
        this.io.emit('call_bridged', payload);
        return { status: 'processed' };
    }
    async handleCallHangup(payload, eventData) {
        await this.updateCallState(payload.call_control_id, 'completed');
        this.io.emit('call_ended', payload);
        return { status: 'processed' };
    }
    async handleMachineDetection(payload, eventData) {
        this.io.emit('machine_detection', {
            call_control_id: payload.call_control_id,
            result: payload.machine_detection_result
        });
        return { status: 'processed' };
    }
    async handleRecordingSaved(payload, eventData) {
        await this.prisma.recording.create({
            data: {
                id: eventData.id,
                call_id: payload.call_control_id,
                recording_url: payload.recording_urls?.mp3 || payload.recording_urls?.wav,
                duration_seconds: payload.duration_seconds,
                channels: payload.channels,
                format: payload.format,
                status: 'completed'
            }
        });
        this.io.emit('recording_ready', payload);
        return { status: 'processed' };
    }
    async handleSpeakEnded(payload, eventData) {
        this.io.emit('speak_ended', payload);
        return { status: 'processed' };
    }
    async handlePlaybackEnded(payload, eventData) {
        this.io.emit('playback_ended', payload);
        return { status: 'processed' };
    }
    async handleGatherEnded(payload, eventData) {
        this.io.emit('input_gathered', {
            call_control_id: payload.call_control_id,
            digits: payload.digits,
            status: payload.status
        });
        return { status: 'processed' };
    }
    async handleDTMFReceived(payload, eventData) {
        this.io.emit('dtmf_received', {
            call_control_id: payload.call_control_id,
            digit: payload.digit
        });
        return { status: 'processed' };
    }
    async handleConferenceCreated(payload, eventData) {
        await this.prisma.conference.create({
            data: {
                id: payload.conference_id,
                name: payload.name || `Conference-${payload.conference_id}`,
                status: 'active',
                call_control_id: payload.call_control_id
            }
        });
        this.io.emit('conference_created', payload);
        return { status: 'processed' };
    }
    async handleConferenceEnded(payload, eventData) {
        await this.prisma.conference.update({
            where: { id: payload.conference_id },
            data: {
                status: 'ended',
                ended_at: new Date()
            }
        });
        this.io.emit('conference_ended', payload);
        return { status: 'processed' };
    }
    async handleParticipantJoined(payload, eventData) {
        await this.prisma.conferenceParticipant.create({
            data: {
                conference_id: payload.conference_id,
                call_control_id: payload.call_control_id,
                phone_number: payload.phone_number
            }
        });
        this.io.emit('participant_joined', payload);
        return { status: 'processed' };
    }
    async handleParticipantLeft(payload, eventData) {
        await this.prisma.conferenceParticipant.updateMany({
            where: {
                conference_id: payload.conference_id,
                call_control_id: payload.call_control_id
            },
            data: {
                left_at: new Date()
            }
        });
        this.io.emit('participant_left', payload);
        return { status: 'processed' };
    }
    async getCalls(page = 1, limit = 20) {
        try {
            const calls = await this.prisma.call.findMany({
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: {
                    events: {
                        orderBy: { occurred_at: 'desc' },
                        take: 5
                    },
                    recordings: true
                }
            });
            const total = await this.prisma.call.count();
            return {
                calls: calls.map((call) => ({
                    ...call,
                    duration: call.answered_at && call.ended_at ?
                        Math.floor((call.ended_at.getTime() - call.answered_at.getTime()) / 1000) : null
                })),
                total,
                pages: Math.ceil(total / limit),
                current_page: page
            };
        }
        catch (error) {
            logger_1.default.error('Error fetching calls:', error);
            throw error;
        }
    }
    async getCallById(callId) {
        try {
            return await this.prisma.call.findUnique({
                where: { id: callId },
                include: {
                    events: {
                        orderBy: { occurred_at: 'desc' }
                    },
                    recordings: true
                }
            });
        }
        catch (error) {
            logger_1.default.error(`Error fetching call ${callId}:`, error);
            throw error;
        }
    }
}
exports.TelnyxVoiceService = TelnyxVoiceService;
//# sourceMappingURL=TelnyxVoiceService.js.map