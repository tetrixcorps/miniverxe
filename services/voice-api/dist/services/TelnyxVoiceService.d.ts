import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import { Server } from 'socket.io';
export interface TelnyxCallData {
    call_control_id: string;
    call_session_id?: string;
    connection_id?: string;
    from: string;
    to: string;
    direction: 'inbound' | 'outbound';
    state: string;
    client_state?: string;
    sip_headers?: Record<string, string>;
    created_at?: string;
    answered_at?: string;
    ended_at?: string;
}
export interface TelnyxWebhookEvent {
    data: {
        id: string;
        event_type: string;
        occurred_at: string;
        payload: Record<string, any>;
    };
    meta: {
        attempt: number;
        delivered_at: string;
        webhook_id: string;
    };
}
export interface CallControlCommand {
    action: string;
    data?: Record<string, any>;
}
export interface VoiceAPIConfig {
    apiKey: string;
    apiBase: string;
    webhookSecret: string;
    webhookUrl: string;
}
export declare class TelnyxVoiceService {
    private client;
    private prisma;
    private redis;
    private io;
    private config;
    constructor(prisma: PrismaClient, redis: ReturnType<typeof createClient>, io: Server, config: VoiceAPIConfig);
    private setupInterceptors;
    answerCall(callControlId: string, clientState?: string): Promise<any>;
    hangupCall(callControlId: string, clientState?: string): Promise<any>;
    dialCall(to: string, from: string, connectionId: string, webhookUrl?: string, options?: Record<string, any>): Promise<any>;
    bridgeCalls(callControlId: string, bridgeTo: string): Promise<any>;
    speakText(callControlId: string, text: string, voice?: string, language?: string): Promise<any>;
    playAudio(callControlId: string, audioUrl: string, loop?: number): Promise<any>;
    stopPlayback(callControlId: string): Promise<any>;
    gatherInput(callControlId: string, maxDigits?: number, timeoutMillis?: number, terminatingDigit?: string, validDigits?: string): Promise<any>;
    gatherUsingSpeak(callControlId: string, text: string, maxDigits?: number, voice?: string, options?: Record<string, any>): Promise<any>;
    startRecording(callControlId: string, channels?: string, format?: string, options?: Record<string, any>): Promise<any>;
    stopRecording(callControlId: string): Promise<any>;
    joinConference(callControlId: string, conferenceName: string, startConferenceOnEnter?: boolean, endConferenceOnExit?: boolean): Promise<any>;
    leaveConference(callControlId: string): Promise<any>;
    muteParticipant(callControlId: string): Promise<any>;
    unmuteParticipant(callControlId: string): Promise<any>;
    transferCall(callControlId: string, toNumber: string): Promise<any>;
    sendDTMF(callControlId: string, digits: string): Promise<any>;
    enableFork(callControlId: string, target: string): Promise<any>;
    disableFork(callControlId: string): Promise<any>;
    enableMachineDetection(callControlId: string, detectionTimeout?: number): Promise<any>;
    private storeCall;
    private updateCallState;
    processWebhook(webhookData: TelnyxWebhookEvent): Promise<any>;
    private storeWebhookEvent;
    private getWebhookHandler;
    private handleCallInitiated;
    private handleCallAnswered;
    private handleCallBridged;
    private handleCallHangup;
    private handleMachineDetection;
    private handleRecordingSaved;
    private handleSpeakEnded;
    private handlePlaybackEnded;
    private handleGatherEnded;
    private handleDTMFReceived;
    private handleConferenceCreated;
    private handleConferenceEnded;
    private handleParticipantJoined;
    private handleParticipantLeft;
    getCalls(page?: number, limit?: number): Promise<any>;
    getCallById(callId: string): Promise<any>;
}
//# sourceMappingURL=TelnyxVoiceService.d.ts.map