// Enhanced Telnyx Voice API Service with Deepgram STT and TeXML
// Implements advanced voice capabilities for TETRIX platform

export interface VoiceCallConfig {
  from: string;
  to: string;
  webhookUrl: string;
  recordCall: boolean;
  transcriptionEnabled: boolean;
  language: string;
  timeout: number;
  maxDuration: number;
}

export interface TeXMLResponse {
  Response: {
    Say?: {
      voice: string;
      language: string;
      text: string;
    };
    Gather?: {
      input: string[];
      numDigits: number;
      timeout: number;
      action: string;
      method: string;
    };
    Play?: {
      url: string;
    };
    Record?: {
      timeout: number;
      maxLength: number;
      playBeep: boolean;
      action: string;
      method: string;
    };
    Redirect?: {
      url: string;
    };
    Hangup?: {};
  };
}

export interface DeepgramSTTConfig {
  model: string;
  language: string;
  punctuate: boolean;
  profanity_filter: boolean;
  redact: string[];
  diarize: boolean;
  multichannel: boolean;
  alternatives: number;
  interim_results: boolean;
  endpointing: number;
  vad_turnoff: number;
  smart_format: boolean;
}

export interface VoiceCallSession {
  callId: string;
  sessionId: string;
  phoneNumber: string;
  startTime: Date;
  status: 'initiated' | 'ringing' | 'answered' | 'in_progress' | 'completed' | 'failed';
  transcription?: {
    text: string;
    confidence: number;
    language: string;
    timestamp: Date;
  };
  recording?: {
    url: string;
    duration: number;
    format: string;
  };
  metadata: Record<string, any>;
}

class TelnyxVoiceService {
  private apiKey: string;
  private apiUrl: string;
  private deepgramApiKey: string;
  private deepgramApiUrl: string;
  private webhookBaseUrl: string;
  private activeSessions: Map<string, VoiceCallSession> = new Map();

  constructor() {
    this.apiKey = process.env.TELNYX_API_KEY || '';
    this.apiUrl = process.env.TELNYX_API_URL || 'https://api.telnyx.com/v2';
    this.deepgramApiKey = process.env.DEEPGRAM_API_KEY || '';
    this.deepgramApiUrl = process.env.DEEPGRAM_API_URL || 'https://api.deepgram.com/v1';
    this.webhookBaseUrl = process.env.WEBHOOK_BASE_URL || 'https://tetrixcorp.com';
    
    if (!this.apiKey) {
      throw new Error('Telnyx API key not configured');
    }
    if (!this.deepgramApiKey) {
      throw new Error('Deepgram API key not configured');
    }
  }

  /**
   * Initiate a voice call with advanced features
   */
  async initiateCall(config: VoiceCallConfig): Promise<VoiceCallSession> {
    const sessionId = this.generateSessionId();
    const callId = this.generateCallId();

    const session: VoiceCallSession = {
      callId,
      sessionId,
      phoneNumber: config.to,
      startTime: new Date(),
      status: 'initiated',
      metadata: {
        from: config.from,
        webhookUrl: config.webhookUrl,
        recordCall: config.recordCall,
        transcriptionEnabled: config.transcriptionEnabled,
        language: config.language
      }
    };

    this.activeSessions.set(sessionId, session);

    try {
      // Create TeXML for the call flow
      const texmlResponse = this.generateTeXMLResponse(config);
      
      const callPayload = {
        to: config.to,
        from: config.from,
        webhook_url: config.webhookUrl,
        webhook_url_method: 'POST',
        time_limit: config.maxDuration,
        timeout: config.timeout,
        record: config.recordCall,
        record_format: 'mp3',
        record_channels: 'dual',
        record_play_beep: true,
        // TeXML configuration
        texml: this.formatTeXML(texmlResponse),
        // Deepgram STT configuration
        transcription: config.transcriptionEnabled ? {
          provider: 'deepgram',
          language: config.language,
          model: 'nova-2',
          punctuate: true,
          profanity_filter: false,
          redact: ['pci', 'ssn'],
          diarize: true,
          multichannel: true,
          alternatives: 3,
          interim_results: true,
          endpointing: 300,
          vad_turnoff: 500,
          smart_format: true
        } : undefined
      };

      const response = await fetch(`${this.apiUrl}/calls`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(callPayload)
      });

      if (!response.ok) {
        throw new Error(`Telnyx API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      session.callId = result.data.call_control_id;
      session.status = 'ringing';

      console.log(`Voice call initiated: ${sessionId} -> ${config.to}`);
      return session;

    } catch (error) {
      session.status = 'failed';
      console.error('Failed to initiate voice call:', error);
      throw error;
    }
  }

  /**
   * Generate TeXML response for call flow
   */
  private generateTeXMLResponse(config: VoiceCallConfig): TeXMLResponse {
    return {
      Response: {
        Say: {
          voice: 'female',
          language: config.language,
          text: 'Hello! This is SHANGO, your AI Super Agent. How can I help you today?'
        },
        Gather: {
          input: ['speech', 'dtmf'],
          numDigits: 1,
          timeout: 10,
          action: `${this.webhookBaseUrl}/api/voice/gather`,
          method: 'POST'
        },
        Record: {
          timeout: 30,
          maxLength: 300,
          playBeep: true,
          action: `${this.webhookBaseUrl}/api/voice/record`,
          method: 'POST'
        },
        Redirect: {
          url: `${this.webhookBaseUrl}/api/voice/next-action`
        }
      }
    };
  }

  /**
   * Format TeXML response as XML string
   */
  private formatTeXML(texml: TeXMLResponse): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?><Response>';
    
    if (texml.Response.Say) {
      xml += `<Say voice="${texml.Response.Say.voice}" language="${texml.Response.Say.language}">${texml.Response.Say.text}</Say>`;
    }
    
    if (texml.Response.Gather) {
      xml += `<Gather input="${texml.Response.Gather.input.join(' ')}" numDigits="${texml.Response.Gather.numDigits}" timeout="${texml.Response.Gather.timeout}" action="${texml.Response.Gather.action}" method="${texml.Response.Gather.method}">`;
      xml += '</Gather>';
    }
    
    if (texml.Response.Record) {
      xml += `<Record timeout="${texml.Response.Record.timeout}" maxLength="${texml.Response.Record.maxLength}" playBeep="${texml.Response.Record.playBeep}" action="${texml.Response.Record.action}" method="${texml.Response.Record.method}">`;
      xml += '</Record>';
    }
    
    if (texml.Response.Play) {
      xml += `<Play>${texml.Response.Play.url}</Play>`;
    }
    
    if (texml.Response.Redirect) {
      xml += `<Redirect>${texml.Response.Redirect.url}</Redirect>`;
    }
    
    if (texml.Response.Hangup) {
      xml += '<Hangup/>';
    }
    
    xml += '</Response>';
    return xml;
  }

  /**
   * Process Deepgram STT transcription
   */
  async processTranscription(audioUrl: string, sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    try {
      const response = await fetch(`${this.deepgramApiUrl}/listen`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.deepgramApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: audioUrl,
          model: 'nova-2',
          language: session.metadata.language || 'en-US',
          punctuate: true,
          profanity_filter: false,
          redact: ['pci', 'ssn'],
          diarize: true,
          multichannel: true,
          alternatives: 3,
          interim_results: true,
          endpointing: 300,
          vad_turnoff: 500,
          smart_format: true
        })
      });

      if (!response.ok) {
        throw new Error(`Deepgram API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.results && result.results.channels && result.results.channels[0]) {
        const channel = result.results.channels[0];
        const alternative = channel.alternatives[0];
        
        session.transcription = {
          text: alternative.transcript,
          confidence: alternative.confidence,
          language: result.results.language || 'en-US',
          timestamp: new Date()
        };

        console.log(`Transcription completed for session ${sessionId}:`, session.transcription.text);
      }

    } catch (error) {
      console.error('Transcription processing failed:', error);
      throw error;
    }
  }

  /**
   * Handle call events from webhooks
   */
  async handleCallEvent(event: any): Promise<void> {
    const { call_control_id, event_type } = event.data;
    const session = Array.from(this.activeSessions.values())
      .find(s => s.callId === call_control_id);

    if (!session) {
      console.log('Session not found for call event:', call_control_id);
      return;
    }

    switch (event_type) {
      case 'call.answered':
        session.status = 'answered';
        console.log(`Call answered: ${session.sessionId}`);
        break;
        
      case 'call.hangup':
        session.status = 'completed';
        console.log(`Call completed: ${session.sessionId}`);
        break;
        
      case 'call.recording.saved':
        if (event.data.recording_url) {
          session.recording = {
            url: event.data.recording_url,
            duration: event.data.recording_duration || 0,
            format: 'mp3'
          };
          
          // Process transcription if enabled
          if (session.metadata.transcriptionEnabled) {
            await this.processTranscription(event.data.recording_url, session.sessionId);
          }
        }
        break;
        
      case 'call.speak.started':
        console.log(`Speak started: ${session.sessionId}`);
        break;
        
      case 'call.speak.ended':
        console.log(`Speak ended: ${session.sessionId}`);
        break;
        
      case 'call.gather.ended':
        console.log(`Gather ended: ${session.sessionId}`, event.data);
        break;
        
      default:
        console.log(`Unhandled call event: ${event_type} for session ${session.sessionId}`);
    }
  }

  /**
   * Generate AI response based on transcription
   */
  async generateAIResponse(transcription: string, sessionId: string): Promise<string> {
    // This would integrate with your AI service (SHANGO)
    // For now, returning a simple response
    const responses = [
      "I understand you said: " + transcription + ". How can I help you further?",
      "Thank you for that information. Let me assist you with that.",
      "I heard: " + transcription + ". Is there anything specific you'd like me to do?",
      "Got it! " + transcription + ". Let me process that for you."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Create follow-up TeXML response
   */
  createFollowUpResponse(aiResponse: string, nextAction?: string): TeXMLResponse {
    return {
      Response: {
        Say: {
          voice: 'female',
          language: 'en-US',
          text: aiResponse
        },
        ...(nextAction ? {
          Redirect: {
            url: nextAction
          }
        } : {
          Hangup: {}
        })
      }
    };
  }

  /**
   * Get active session
   */
  getSession(sessionId: string): VoiceCallSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  /**
   * Get all active sessions
   */
  getAllSessions(): VoiceCallSession[] {
    return Array.from(this.activeSessions.values());
  }

  /**
   * Clean up completed sessions
   */
  cleanupSessions(): void {
    const now = new Date();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (session.status === 'completed' && 
          (now.getTime() - session.startTime.getTime()) > maxAge) {
        this.activeSessions.delete(sessionId);
      }
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Generate unique call ID
   */
  private generateCallId(): string {
    return 'call_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

export const telnyxVoiceService = new TelnyxVoiceService();
