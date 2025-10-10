import { PrismaClient } from '@prisma/client';
export interface Call {
    id: string;
    call_control_id: string;
    call_session_id?: string;
    connection_id?: string;
    from_number?: string;
    to_number?: string;
    direction: 'inbound' | 'outbound';
    state: string;
    created_at: Date;
    answered_at?: Date;
    ended_at?: Date;
    client_state?: string;
    sip_headers?: Record<string, string>;
    events?: CallEvent[];
    recordings?: Recording[];
}
export interface CallEvent {
    id: number;
    call_id: string;
    event_type: string;
    occurred_at: Date;
    payload?: Record<string, any>;
    call?: Call;
}
export interface Recording {
    id: string;
    call_id: string;
    recording_url?: string;
    duration_seconds?: number;
    channels?: string;
    format?: string;
    status: string;
    created_at: Date;
    call?: Call;
}
export interface Conference {
    id: string;
    name: string;
    status: string;
    created_at: Date;
    ended_at?: Date;
    beep_enabled: boolean;
    call_control_id?: string;
    participants?: ConferenceParticipant[];
}
export interface ConferenceParticipant {
    id: number;
    conference_id: string;
    call_control_id: string;
    phone_number?: string;
    joined_at: Date;
    left_at?: Date;
    muted: boolean;
    conference?: Conference;
}
export interface VoiceAPIConfig {
    apiKey: string;
    apiBase: string;
    webhookSecret: string;
    webhookUrl: string;
    connectionId: string;
}
export interface CallStats {
    active: number;
    total: number;
    answered: number;
    totalDuration: number;
    averageDuration: number;
}
export interface WebhookEvent {
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
export interface AudioPlaybackOptions {
    audio_url: string;
    loop?: number;
    playback_id?: string;
}
export interface RecordingOptions {
    channels?: 'single' | 'dual';
    format?: 'mp3' | 'wav';
    play_beep?: boolean;
    trimming_enabled?: boolean;
    dual_channel_enabled?: boolean;
}
export interface GatherOptions {
    max_digits?: number;
    timeout_millis?: number;
    terminating_digit?: string;
    valid_digits?: string;
    invalid_audio_url?: string;
}
export interface SpeakOptions {
    payload: string;
    voice?: 'male' | 'female';
    language?: string;
    service_level?: 'basic' | 'premium';
}
export interface ConferenceOptions {
    name: string;
    start_conference_on_enter?: boolean;
    end_conference_on_exit?: boolean;
    beep_enabled?: boolean;
    hold_music_url?: string;
    max_participants?: number;
}
export interface TransferOptions {
    to: string;
    from?: string;
    caller_id?: string;
    timeout_millis?: number;
}
export interface MachineDetectionOptions {
    detection_timeout_millis?: number;
    detection_sensitivity?: 'low' | 'medium' | 'high';
    detection_speech_threshold?: number;
    detection_silence_timeout_millis?: number;
}
export interface ForkOptions {
    target: string;
    rtp_packets?: 'all' | 'dtmf';
    stream_url?: string;
    stream_track?: 'inbound_track' | 'outbound_track' | 'both_tracks';
}
export interface CallMetrics {
    call_id: string;
    duration: number;
    quality_score?: number;
    jitter?: number;
    packet_loss?: number;
    rtt?: number;
    mos_score?: number;
}
export interface VoiceAPIService {
    answerCall(callControlId: string, clientState?: string): Promise<any>;
    hangupCall(callControlId: string, clientState?: string): Promise<any>;
    dialCall(to: string, from: string, connectionId: string, webhookUrl?: string, options?: Record<string, any>): Promise<any>;
    bridgeCalls(callControlId: string, bridgeTo: string): Promise<any>;
    speakText(callControlId: string, text: string, voice?: string, language?: string): Promise<any>;
    playAudio(callControlId: string, audioUrl: string, loop?: number): Promise<any>;
    stopPlayback(callControlId: string): Promise<any>;
    gatherInput(callControlId: string, options?: GatherOptions): Promise<any>;
    gatherUsingSpeak(callControlId: string, text: string, options?: GatherOptions & SpeakOptions): Promise<any>;
    startRecording(callControlId: string, options?: RecordingOptions): Promise<any>;
    stopRecording(callControlId: string): Promise<any>;
    joinConference(callControlId: string, conferenceName: string, options?: ConferenceOptions): Promise<any>;
    leaveConference(callControlId: string): Promise<any>;
    muteParticipant(callControlId: string): Promise<any>;
    unmuteParticipant(callControlId: string): Promise<any>;
    transferCall(callControlId: string, toNumber: string, options?: TransferOptions): Promise<any>;
    sendDTMF(callControlId: string, digits: string): Promise<any>;
    enableFork(callControlId: string, target: string, options?: ForkOptions): Promise<any>;
    disableFork(callControlId: string): Promise<any>;
    enableMachineDetection(callControlId: string, options?: MachineDetectionOptions): Promise<any>;
    processWebhook(webhookData: WebhookEvent): Promise<any>;
    getCalls(page?: number, limit?: number): Promise<any>;
    getCallById(callId: string): Promise<any>;
    getCallStats(): Promise<CallStats>;
}
export declare class VoiceDatabaseService {
    private prisma;
    constructor(prisma: PrismaClient);
    createCall(callData: Partial<Call>): Promise<Call>;
    updateCall(callId: string, updateData: Partial<Call>): Promise<Call>;
    getCallByControlId(callControlId: string): Promise<Call | null>;
    getCalls(page?: number, limit?: number): Promise<{
        calls: Call[];
        total: number;
        pages: number;
    }>;
    createCallEvent(eventData: Partial<CallEvent>): Promise<CallEvent>;
    createRecording(recordingData: Partial<Recording>): Promise<Recording>;
    createConference(conferenceData: Partial<Conference>): Promise<Conference>;
    addConferenceParticipant(participantData: Partial<ConferenceParticipant>): Promise<ConferenceParticipant>;
    getCallStats(): Promise<CallStats>;
    getCallMetrics(callId: string): Promise<CallMetrics | null>;
}
//# sourceMappingURL=voiceModels.d.ts.map