import { PrismaClient } from '@prisma/client';
import { RedisClientType } from 'redis';
import { Server } from 'socket.io';
export interface MediaStreamConfig {
    maxStreams: number;
    streamTimeout: number;
    quality: 'low' | 'medium' | 'high';
}
export interface MediaStream {
    id: string;
    sessionId: string;
    type: 'audio' | 'video';
    status: 'active' | 'paused' | 'stopped';
    startTime: Date;
    endTime?: Date;
    metadata: any;
}
export declare class MediaStreamingService {
    private prisma;
    private redis;
    private io;
    private config;
    private activeStreams;
    constructor(prisma: PrismaClient, redis: RedisClientType, io: Server, config: MediaStreamConfig);
    startStream(sessionId: string, type: 'audio' | 'video', metadata?: any): Promise<MediaStream>;
    stopStream(streamId: string): Promise<void>;
    getStreamStatus(streamId: string): Promise<MediaStream | null>;
    getStreamMetrics(sessionId: string): Promise<any>;
    processAudioStream(callId: string, audioData: any, metadata?: any): Promise<any>;
}
//# sourceMappingURL=MediaStreamingService.d.ts.map