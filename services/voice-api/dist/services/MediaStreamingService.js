"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaStreamingService = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
class MediaStreamingService {
    constructor(prisma, redis, io, config) {
        this.prisma = prisma;
        this.redis = redis;
        this.io = io;
        this.activeStreams = new Map();
        this.config = config;
    }
    async startStream(sessionId, type, metadata = {}) {
        try {
            const streamId = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const stream = {
                id: streamId,
                sessionId,
                type,
                status: 'active',
                startTime: new Date(),
                metadata
            };
            this.activeStreams.set(streamId, stream);
            await this.redis.setEx(`stream:${streamId}`, this.config.streamTimeout, JSON.stringify(stream));
            this.io.to(sessionId).emit('stream:started', {
                streamId,
                type,
                metadata
            });
            logger_1.default.info(`Started ${type} stream: ${streamId} for session: ${sessionId}`);
            return stream;
        }
        catch (error) {
            logger_1.default.error('Error starting media stream:', error);
            throw new Error('Failed to start media stream');
        }
    }
    async stopStream(streamId) {
        try {
            const stream = this.activeStreams.get(streamId);
            if (!stream) {
                throw new Error('Stream not found');
            }
            stream.status = 'stopped';
            stream.endTime = new Date();
            this.activeStreams.delete(streamId);
            await this.redis.del(`stream:${streamId}`);
            this.io.to(stream.sessionId).emit('stream:stopped', {
                streamId,
                duration: stream.endTime.getTime() - stream.startTime.getTime()
            });
            logger_1.default.info(`Stopped stream: ${streamId}`);
        }
        catch (error) {
            logger_1.default.error('Error stopping media stream:', error);
            throw new Error('Failed to stop media stream');
        }
    }
    async getStreamStatus(streamId) {
        try {
            const stream = this.activeStreams.get(streamId);
            if (stream) {
                return stream;
            }
            const streamData = await this.redis.get(`stream:${streamId}`);
            if (streamData) {
                return JSON.parse(streamData);
            }
            return null;
        }
        catch (error) {
            logger_1.default.error('Error getting stream status:', error);
            return null;
        }
    }
    async getStreamMetrics(sessionId) {
        try {
            const activeStreams = Array.from(this.activeStreams.values())
                .filter(stream => stream.sessionId === sessionId && stream.status === 'active');
            return {
                activeStreams: activeStreams.length,
                totalStreams: activeStreams.length,
                averageDuration: 0,
                streamTypes: {
                    audio: activeStreams.filter(s => s.type === 'audio').length,
                    video: activeStreams.filter(s => s.type === 'video').length
                }
            };
        }
        catch (error) {
            logger_1.default.error('Error getting stream metrics:', error);
            return {
                activeStreams: 0,
                totalStreams: 0,
                averageDuration: 0,
                streamTypes: { audio: 0, video: 0 }
            };
        }
    }
    async processAudioStream(callId, audioData, metadata = {}) {
        try {
            const processedData = {
                callId,
                timestamp: new Date().toISOString(),
                audioLength: audioData?.length || 0,
                metadata,
                processed: true
            };
            this.io.to(`call_${callId}`).emit('audio_processed', processedData);
            logger_1.default.info(`Processed audio stream for call: ${callId}`);
            return processedData;
        }
        catch (error) {
            logger_1.default.error('Error processing audio stream:', error);
            throw new Error('Failed to process audio stream');
        }
    }
}
exports.MediaStreamingService = MediaStreamingService;
//# sourceMappingURL=MediaStreamingService.js.map