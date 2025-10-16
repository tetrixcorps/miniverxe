// Voice API Integration Service
export interface VoiceAPIConfig {
  vonage: {
    apiKey: string;
    apiSecret: string;
    applicationId: string;
    privateKey: string;
  };
  telnyx: {
    apiKey: string;
    messagingProfileId: string;
  };
  twilio: {
    accountSid: string;
    authToken: string;
  };
}

export interface CallParams {
  to: string;
  from: string;
  industry: string;
  context?: any;
  recordCall?: boolean;
  transcriptionEnabled?: boolean;
  language?: string;
  timeout?: number;
  maxDuration?: number;
}

export interface CallResponse {
  id: string;
  callSid: string;
  status: 'initiated' | 'ringing' | 'answered' | 'completed' | 'failed' | 'busy' | 'no-answer';
  from: string;
  to: string;
  duration?: number;
  recordingUrl?: string;
  transcription?: string;
  cost?: number;
  timestamp: Date;
}

export interface RecordingResponse {
  id: string;
  callId: string;
  status: 'started' | 'stopped' | 'completed' | 'failed';
  url?: string;
  duration?: number;
  format: string;
  timestamp: Date;
}

export interface TranscriptionResponse {
  id: string;
  recordingId: string;
  text: string;
  confidence: number;
  language: string;
  timestamp: Date;
}

export interface CallAnalytics {
  totalCalls: number;
  answeredCalls: number;
  missedCalls: number;
  averageDuration: number;
  totalCost: number;
  successRate: number;
  industryBreakdown: Record<string, number>;
  timeRange: {
    start: Date;
    end: Date;
  };
}

class VoiceAPIService {
  private config: VoiceAPIConfig;
  private activeProvider: 'vonage' | 'telnyx' | 'twilio' = 'vonage';

  constructor(config: VoiceAPIConfig) {
    this.config = config;
  }

  setProvider(provider: 'vonage' | 'telnyx' | 'twilio'): void {
    this.activeProvider = provider;
  }

  async initiateCall(params: CallParams): Promise<CallResponse> {
    try {
      switch (this.activeProvider) {
        case 'vonage':
          return await this.initiateVonageCall(params);
        case 'telnyx':
          return await this.initiateTelnyxCall(params);
        case 'twilio':
          return await this.initiateTwilioCall(params);
        default:
          throw new Error('Invalid voice provider');
      }
    } catch (error) {
      console.error('Error initiating call:', error);
      throw error;
    }
  }

  private async initiateVonageCall(params: CallParams): Promise<CallResponse> {
    try {
      const response = await fetch('/api/voice/vonage/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.vonage.apiKey}`
        },
        body: JSON.stringify({
          to: params.to,
          from: params.from,
          recordCall: params.recordCall || false,
          transcriptionEnabled: params.transcriptionEnabled || false,
          language: params.language || 'en-US',
          timeout: params.timeout || 30,
          maxDuration: params.maxDuration || 300,
          context: params.context
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        id: data.id,
        callSid: data.callSid,
        status: 'initiated',
        from: params.from,
        to: params.to,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error initiating Vonage call:', error);
      throw error;
    }
  }

  private async initiateTelnyxCall(params: CallParams): Promise<CallResponse> {
    try {
      const response = await fetch('/api/voice/telnyx/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.telnyx.apiKey}`
        },
        body: JSON.stringify({
          to: params.to,
          from: params.from,
          recordCall: params.recordCall || false,
          transcriptionEnabled: params.transcriptionEnabled || false,
          language: params.language || 'en-US',
          timeout: params.timeout || 30,
          maxDuration: params.maxDuration || 300,
          context: params.context
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        id: data.id,
        callSid: data.callSid,
        status: 'initiated',
        from: params.from,
        to: params.to,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error initiating Telnyx call:', error);
      throw error;
    }
  }

  private async initiateTwilioCall(params: CallParams): Promise<CallResponse> {
    try {
      const response = await fetch('/api/voice/twilio/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.twilio.accountSid}`
        },
        body: JSON.stringify({
          to: params.to,
          from: params.from,
          recordCall: params.recordCall || false,
          transcriptionEnabled: params.transcriptionEnabled || false,
          language: params.language || 'en-US',
          timeout: params.timeout || 30,
          maxDuration: params.maxDuration || 300,
          context: params.context
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        id: data.id,
        callSid: data.callSid,
        status: 'initiated',
        from: params.from,
        to: params.to,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error initiating Twilio call:', error);
      throw error;
    }
  }

  async recordCall(callId: string, action: 'start' | 'stop'): Promise<RecordingResponse> {
    try {
      const response = await fetch(`/api/voice/${this.activeProvider}/record`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getProviderApiKey()}`
        },
        body: JSON.stringify({
          callId,
          action
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        id: data.id,
        callId,
        status: action === 'start' ? 'started' : 'stopped',
        url: data.url,
        duration: data.duration,
        format: data.format || 'mp3',
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error recording call:', error);
      throw error;
    }
  }

  async transcribeCall(recordingId: string): Promise<TranscriptionResponse> {
    try {
      const response = await fetch(`/api/voice/${this.activeProvider}/transcribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getProviderApiKey()}`
        },
        body: JSON.stringify({
          recordingId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        id: data.id,
        recordingId,
        text: data.text,
        confidence: data.confidence || 0.8,
        language: data.language || 'en-US',
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error transcribing call:', error);
      throw error;
    }
  }

  async getCallAnalytics(industry?: string, startDate?: Date, endDate?: Date): Promise<CallAnalytics> {
    try {
      const params = new URLSearchParams();
      if (industry) params.append('industry', industry);
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());

      const response = await fetch(`/api/voice/analytics?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${this.getProviderApiKey()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        totalCalls: data.totalCalls || 0,
        answeredCalls: data.answeredCalls || 0,
        missedCalls: data.missedCalls || 0,
        averageDuration: data.averageDuration || 0,
        totalCost: data.totalCost || 0,
        successRate: data.successRate || 0,
        industryBreakdown: data.industryBreakdown || {},
        timeRange: {
          start: new Date(data.timeRange?.start || Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date(data.timeRange?.end || Date.now())
        }
      };
    } catch (error) {
      console.error('Error getting call analytics:', error);
      throw error;
    }
  }

  private getProviderApiKey(): string {
    switch (this.activeProvider) {
      case 'vonage':
        return this.config.vonage.apiKey;
      case 'telnyx':
        return this.config.telnyx.apiKey;
      case 'twilio':
        return this.config.twilio.accountSid;
      default:
        throw new Error('Invalid voice provider');
    }
  }

  getActiveProvider(): string {
    return this.activeProvider;
  }

  updateConfig(newConfig: Partial<VoiceAPIConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Create singleton instance
const voiceAPIConfig: VoiceAPIConfig = {
  vonage: {
    apiKey: process.env.NEXT_PUBLIC_VONAGE_API_KEY || '',
    apiSecret: process.env.NEXT_PUBLIC_VONAGE_API_SECRET || '',
    applicationId: process.env.NEXT_PUBLIC_VONAGE_APPLICATION_ID || '',
    privateKey: process.env.NEXT_PUBLIC_VONAGE_PRIVATE_KEY || ''
  },
  telnyx: {
    apiKey: process.env.NEXT_PUBLIC_***REMOVED*** || '',
    messagingProfileId: process.env.NEXT_PUBLIC_TELNYX_MESSAGING_PROFILE_ID || ''
  },
  twilio: {
    accountSid: process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID || '',
    authToken: process.env.NEXT_PUBLIC_TWILIO_AUTH_TOKEN || ''
  }
};

export const voiceAPIService = new VoiceAPIService(voiceAPIConfig);

// Industry-specific voice functions
export const industryVoiceFunctions = {
  healthcare: {
    scheduleAppointmentCall: (patient: any, appointment: any) => 
      voiceAPIService.initiateCall({
        to: patient.phoneNumber,
        from: '+1-800-HEALTH',
        industry: 'healthcare',
        context: { type: 'appointment_reminder', appointment },
        recordCall: true,
        transcriptionEnabled: true
      }),
    sendEmergencyAlert: (patient: any, message: string) =>
      voiceAPIService.initiateCall({
        to: patient.phoneNumber,
        from: '+1-800-HEALTH',
        industry: 'healthcare',
        context: { type: 'emergency_alert', message },
        recordCall: true
      })
  },
  legal: {
    initiateClientCall: (client: any, attorney: any) =>
      voiceAPIService.initiateCall({
        to: client.phoneNumber,
        from: attorney.phoneNumber,
        industry: 'legal',
        context: { type: 'client_consultation', attorney, client },
        recordCall: true,
        transcriptionEnabled: true
      }),
    sendCourtReminder: (client: any, courtDate: any) =>
      voiceAPIService.initiateCall({
        to: client.phoneNumber,
        from: '+1-800-LEGAL',
        industry: 'legal',
        context: { type: 'court_reminder', courtDate },
        recordCall: true
      })
  },
  retail: {
    initiateSupportCall: (customer: any, issue: any) =>
      voiceAPIService.initiateCall({
        to: customer.phoneNumber,
        from: '+1-800-SUPPORT',
        industry: 'retail',
        context: { type: 'customer_support', issue },
        recordCall: true,
        transcriptionEnabled: true
      }),
    sendOrderUpdate: (customer: any, order: any) =>
      voiceAPIService.initiateCall({
        to: customer.phoneNumber,
        from: '+1-800-ORDERS',
        industry: 'retail',
        context: { type: 'order_update', order },
        recordCall: true
      })
  },
  construction: {
    sendSiteUpdate: (stakeholder: any, update: any) =>
      voiceAPIService.initiateCall({
        to: stakeholder.phoneNumber,
        from: '+1-800-CONSTRUCTION',
        industry: 'construction',
        context: { type: 'site_update', update },
        recordCall: true
      }),
    sendSafetyAlert: (worker: any, alert: any) =>
      voiceAPIService.initiateCall({
        to: worker.phoneNumber,
        from: '+1-800-SAFETY',
        industry: 'construction',
        context: { type: 'safety_alert', alert },
        recordCall: true
      })
  }
};

export default voiceAPIService;
