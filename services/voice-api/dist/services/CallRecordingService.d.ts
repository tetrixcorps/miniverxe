import { PrismaClient } from '@prisma/client';
import { RedisClientType } from 'redis';
import { Server } from 'socket.io';
export interface CallRecordingConfig {
    storageProvider: 'local' | 's3' | 'gcs';
    retentionDays: number;
    encryptionEnabled: boolean;
    transcriptionEnabled: boolean;
}
export interface CallRecording {
    id: string;
    callId: string;
    sessionId: string;
    status: 'recording' | 'completed' | 'failed';
    startTime: Date;
    endTime?: Date;
    duration?: number;
    fileUrl?: string;
    fileSize?: number;
    transcriptionUrl?: string;
    metadata: any;
}
export declare class CallRecordingService {
    private prisma;
    private redis;
    private io;
    private config;
    private activeRecordings;
    constructor(prisma: PrismaClient, redis: RedisClientType, io: Server, config: CallRecordingConfig);
    startRecording(callId: string, sessionId: string, metadata?: any): Promise<CallRecording>;
    stopRecording(recordingId: string): Promise<CallRecording>;
    getRecordingUrl(recordingId: string): Promise<string | null>;
    getRecordingStatus(recordingId: string): Promise<CallRecording | null>;
    getRecordingTranscript(recordingId: string): Promise<string | null>;
    getRecordingSentiment(recordingId: string): Promise<any>;
    getRecordingIntent(recordingId: string): Promise<any>;
    getRecordingEntities(recordingId: string): Promise<any[]>;
    getRecordingKeywords(recordingId: string): Promise<string[]>;
    getRecordingDuration(recordingId: string): Promise<number>;
    getRecordingCost(recordingId: string): Promise<number>;
    getRecordingRating(recordingId: string): Promise<number>;
    getRecordingFeedback(recordingId: string): Promise<string>;
}
//# sourceMappingURL=CallRecordingService.d.ts.map