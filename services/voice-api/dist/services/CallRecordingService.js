"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallRecordingService = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
class CallRecordingService {
    constructor(prisma, redis, io, config) {
        this.prisma = prisma;
        this.redis = redis;
        this.io = io;
        this.activeRecordings = new Map();
        this.config = config;
    }
    async startRecording(callId, sessionId, metadata = {}) {
        try {
            const recordingId = `recording_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const recording = {
                id: recordingId,
                callId,
                sessionId,
                status: 'recording',
                startTime: new Date(),
                metadata
            };
            this.activeRecordings.set(recordingId, recording);
            await this.redis.setEx(`recording:${recordingId}`, 86400, JSON.stringify(recording));
            this.io.to(sessionId).emit('recording:started', {
                recordingId,
                callId,
                metadata
            });
            logger_1.default.info(`Started recording: ${recordingId} for call: ${callId}`);
            return recording;
        }
        catch (error) {
            logger_1.default.error('Error starting call recording:', error);
            throw new Error('Failed to start call recording');
        }
    }
    async stopRecording(recordingId) {
        try {
            const recording = this.activeRecordings.get(recordingId);
            if (!recording) {
                throw new Error('Recording not found');
            }
            recording.status = 'completed';
            recording.endTime = new Date();
            recording.duration = recording.endTime.getTime() - recording.startTime.getTime();
            recording.fileUrl = `https://storage.example.com/recordings/${recordingId}.wav`;
            recording.fileSize = Math.floor(Math.random() * 10000000) + 1000000;
            if (this.config.transcriptionEnabled) {
                recording.transcriptionUrl = `https://storage.example.com/transcriptions/${recordingId}.txt`;
            }
            this.activeRecordings.delete(recordingId);
            await this.redis.del(`recording:${recordingId}`);
            this.io.to(recording.sessionId).emit('recording:stopped', {
                recordingId,
                duration: recording.duration,
                fileUrl: recording.fileUrl
            });
            logger_1.default.info(`Stopped recording: ${recordingId}`);
            return recording;
        }
        catch (error) {
            logger_1.default.error('Error stopping call recording:', error);
            throw new Error('Failed to stop call recording');
        }
    }
    async getRecordingUrl(recordingId) {
        try {
            const recording = this.activeRecordings.get(recordingId);
            if (recording && recording.fileUrl) {
                return recording.fileUrl;
            }
            const recordingData = await this.redis.get(`recording:${recordingId}`);
            if (recordingData) {
                const parsed = JSON.parse(recordingData);
                return parsed.fileUrl || null;
            }
            return null;
        }
        catch (error) {
            logger_1.default.error('Error getting recording URL:', error);
            return null;
        }
    }
    async getRecordingStatus(recordingId) {
        try {
            const recording = this.activeRecordings.get(recordingId);
            if (recording) {
                return recording;
            }
            const recordingData = await this.redis.get(`recording:${recordingId}`);
            if (recordingData) {
                return JSON.parse(recordingData);
            }
            return null;
        }
        catch (error) {
            logger_1.default.error('Error getting recording status:', error);
            return null;
        }
    }
    async getRecordingTranscript(recordingId) {
        try {
            const recording = await this.getRecordingStatus(recordingId);
            if (recording && recording.transcriptionUrl) {
                return 'Transcription content would be here...';
            }
            return null;
        }
        catch (error) {
            logger_1.default.error('Error getting recording transcript:', error);
            return null;
        }
    }
    async getRecordingSentiment(recordingId) {
        try {
            return {
                overall: 'neutral',
                confidence: 0.7,
                emotions: {
                    joy: 0.2,
                    sadness: 0.1,
                    anger: 0.1,
                    fear: 0.1,
                    surprise: 0.1,
                    neutral: 0.4
                }
            };
        }
        catch (error) {
            logger_1.default.error('Error getting recording sentiment:', error);
            return null;
        }
    }
    async getRecordingIntent(recordingId) {
        try {
            return {
                primary: 'information_request',
                confidence: 0.8,
                entities: [],
                keywords: []
            };
        }
        catch (error) {
            logger_1.default.error('Error getting recording intent:', error);
            return null;
        }
    }
    async getRecordingEntities(recordingId) {
        try {
            return [];
        }
        catch (error) {
            logger_1.default.error('Error getting recording entities:', error);
            return [];
        }
    }
    async getRecordingKeywords(recordingId) {
        try {
            return [];
        }
        catch (error) {
            logger_1.default.error('Error getting recording keywords:', error);
            return [];
        }
    }
    async getRecordingDuration(recordingId) {
        try {
            const recording = await this.getRecordingStatus(recordingId);
            return recording?.duration || 0;
        }
        catch (error) {
            logger_1.default.error('Error getting recording duration:', error);
            return 0;
        }
    }
    async getRecordingCost(recordingId) {
        try {
            const duration = await this.getRecordingDuration(recordingId);
            return duration * 0.01;
        }
        catch (error) {
            logger_1.default.error('Error getting recording cost:', error);
            return 0;
        }
    }
    async getRecordingRating(recordingId) {
        try {
            return 4.5;
        }
        catch (error) {
            logger_1.default.error('Error getting recording rating:', error);
            return 0;
        }
    }
    async getRecordingFeedback(recordingId) {
        try {
            return 'Good quality recording';
        }
        catch (error) {
            logger_1.default.error('Error getting recording feedback:', error);
            return '';
        }
    }
}
exports.CallRecordingService = CallRecordingService;
//# sourceMappingURL=CallRecordingService.js.map