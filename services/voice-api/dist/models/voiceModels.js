"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceDatabaseService = void 0;
class VoiceDatabaseService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createCall(callData) {
        return await this.prisma.call.create({
            data: {
                id: callData.id,
                call_control_id: callData.call_control_id,
                call_session_id: callData.call_session_id,
                connection_id: callData.connection_id,
                from_number: callData.from_number,
                to_number: callData.to_number,
                direction: callData.direction,
                state: callData.state,
                client_state: callData.client_state,
                sip_headers: callData.sip_headers
            }
        });
    }
    async updateCall(callId, updateData) {
        return await this.prisma.call.update({
            where: { id: callId },
            data: updateData
        });
    }
    async getCallByControlId(callControlId) {
        return await this.prisma.call.findUnique({
            where: { call_control_id: callControlId }
        });
    }
    async getCalls(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [calls, total] = await Promise.all([
            this.prisma.call.findMany({
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: {
                    events: {
                        orderBy: { occurred_at: 'desc' },
                        take: 5
                    },
                    recordings: true
                }
            }),
            this.prisma.call.count()
        ]);
        return {
            calls,
            total,
            pages: Math.ceil(total / limit)
        };
    }
    async createCallEvent(eventData) {
        return await this.prisma.callEvent.create({
            data: {
                call_id: eventData.call_id,
                event_type: eventData.event_type,
                payload: eventData.payload,
                occurred_at: eventData.occurred_at || new Date()
            }
        });
    }
    async createRecording(recordingData) {
        return await this.prisma.recording.create({
            data: {
                id: recordingData.id,
                call_id: recordingData.call_id,
                recording_url: recordingData.recording_url,
                duration_seconds: recordingData.duration_seconds,
                channels: recordingData.channels,
                format: recordingData.format,
                status: recordingData.status || 'processing'
            }
        });
    }
    async createConference(conferenceData) {
        return await this.prisma.conference.create({
            data: {
                id: conferenceData.id,
                name: conferenceData.name,
                status: conferenceData.status || 'active',
                beep_enabled: conferenceData.beep_enabled ?? true,
                call_control_id: conferenceData.call_control_id
            }
        });
    }
    async addConferenceParticipant(participantData) {
        return await this.prisma.conferenceParticipant.create({
            data: {
                conference_id: participantData.conference_id,
                call_control_id: participantData.call_control_id,
                phone_number: participantData.phone_number,
                muted: participantData.muted ?? false
            }
        });
    }
    async getCallStats() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const [active, total, answered, callsWithDuration] = await Promise.all([
            this.prisma.call.count({
                where: {
                    state: { in: ['initiated', 'answered', 'bridged'] }
                }
            }),
            this.prisma.call.count({
                where: {
                    created_at: { gte: today }
                }
            }),
            this.prisma.call.count({
                where: {
                    state: 'answered',
                    created_at: { gte: today }
                }
            }),
            this.prisma.call.findMany({
                where: {
                    answered_at: { not: null },
                    ended_at: { not: null },
                    created_at: { gte: today }
                },
                select: {
                    answered_at: true,
                    ended_at: true
                }
            })
        ]);
        const totalDuration = callsWithDuration.reduce((sum, call) => {
            if (call.answered_at && call.ended_at) {
                return sum + (call.ended_at.getTime() - call.answered_at.getTime()) / 1000;
            }
            return sum;
        }, 0);
        return {
            active,
            total,
            answered,
            totalDuration,
            averageDuration: answered > 0 ? totalDuration / answered : 0
        };
    }
    async getCallMetrics(callId) {
        const call = await this.prisma.call.findUnique({
            where: { id: callId },
            select: {
                answered_at: true,
                ended_at: true,
                events: {
                    where: {
                        event_type: { in: ['call.answered', 'call.hangup'] }
                    },
                    orderBy: { occurred_at: 'asc' }
                }
            }
        });
        if (!call || !call.answered_at || !call.ended_at) {
            return null;
        }
        const duration = (call.ended_at.getTime() - call.answered_at.getTime()) / 1000;
        return {
            call_id: callId,
            duration: Math.floor(duration)
        };
    }
}
exports.VoiceDatabaseService = VoiceDatabaseService;
//# sourceMappingURL=voiceModels.js.map