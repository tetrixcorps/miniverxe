// Cross-Platform Voice Integration Service
// Integrates Voice API with IVR, SinchChatLive, and Unified Messaging Platform

import { telnyxVoiceService } from './telnyxVoiceService';
import { getSHANGOAIService } from './sinchChatService';
import { crossPlatformSessionService } from './crossPlatformSessionService';

export interface VoiceIntegrationConfig {
  enableIVRIntegration: boolean;
  enableSinchChatIntegration: boolean;
  enableUnifiedMessagingIntegration: boolean;
  enableTranscription: boolean;
  enableTranslation: boolean;
  supportedLanguages: string[];
  defaultLanguage: string;
}

export interface VoiceSession {
  sessionId: string;
  callId: string;
  phoneNumber: string;
  channel: 'voice' | 'chat' | 'sms' | 'whatsapp';
  status: 'initiated' | 'active' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  transcription?: {
    text: string;
    confidence: number;
    language: string;
    timestamp: Date;
    speakers?: SpeakerInfo[];
  };
  translation?: {
    originalText: string;
    translatedText: string;
    sourceLanguage: string;
    targetLanguage: string;
    confidence: number;
  };
  aiResponse?: {
    text: string;
    confidence: number;
    agent: string;
    timestamp: Date;
  };
  metadata: {
    platform: 'tetrix' | 'joromi';
    userId?: string;
    conversationId?: string;
    channelId?: string;
  };
}

export interface SpeakerInfo {
  id: string;
  name?: string;
  confidence: number;
  segments: {
    start: number;
    end: number;
    text: string;
  }[];
}

export interface CrossChannelMessage {
  id: string;
  sessionId: string;
  channel: string;
  content: string;
  type: 'text' | 'voice' | 'transcription' | 'translation';
  timestamp: Date;
  metadata: {
    originalChannel?: string;
    transcriptionId?: string;
    translationId?: string;
  };
}

class CrossPlatformVoiceIntegration {
  private config: VoiceIntegrationConfig;
  private activeSessions: Map<string, VoiceSession> = new Map();
  private crossChannelMessages: Map<string, CrossChannelMessage[]> = new Map();

  constructor(config: VoiceIntegrationConfig) {
    this.config = config;
  }

  /**
   * Initiate voice call with cross-platform integration
   */
  async initiateVoiceCall(callConfig: {
    to: string;
    from: string;
    channel: 'voice' | 'chat' | 'sms' | 'whatsapp';
    platform: 'tetrix' | 'joromi';
    userId?: string;
    conversationId?: string;
    enableTranscription?: boolean;
    enableTranslation?: boolean;
    targetLanguage?: string;
  }): Promise<VoiceSession> {
    try {
      // Create voice session
      const voiceSession = await telnyxVoiceService.initiateCall({
        to: callConfig.to,
        from: callConfig.from,
        webhookUrl: `${process.env.WEBHOOK_BASE_URL}/api/voice/webhook`,
        recordCall: true,
        transcriptionEnabled: callConfig.enableTranscription ?? this.config.enableTranscription,
        language: callConfig.targetLanguage ?? this.config.defaultLanguage,
        timeout: 30,
        maxDuration: 300
      });

      // Create cross-platform session
      const session: VoiceSession = {
        sessionId: voiceSession.sessionId,
        callId: voiceSession.callId,
        phoneNumber: callConfig.to,
        channel: callConfig.channel,
        status: 'initiated',
        startTime: new Date(),
        metadata: {
          platform: callConfig.platform,
          userId: callConfig.userId,
          conversationId: callConfig.conversationId
        }
      };

      this.activeSessions.set(session.sessionId, session);

      // Initialize cross-channel messaging
      this.crossChannelMessages.set(session.sessionId, []);

      // Integrate with SinchChatLive if enabled
      if (this.config.enableSinchChatIntegration && callConfig.conversationId) {
        await this.integrateWithSinchChat(session);
      }

      // Integrate with Unified Messaging if enabled
      if (this.config.enableUnifiedMessagingIntegration) {
        await this.integrateWithUnifiedMessaging(session);
      }

      console.log(`Voice call initiated with cross-platform integration: ${session.sessionId}`);
      return session;

    } catch (error) {
      console.error('Failed to initiate voice call with cross-platform integration:', error);
      throw error;
    }
  }

  /**
   * Process voice transcription with cross-platform integration
   */
  async processVoiceTranscription(sessionId: string, audioUrl: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    try {
      // Process transcription with Deepgram
      await telnyxVoiceService.processTranscription(audioUrl, sessionId);
      
      // Get updated session with transcription
      const updatedSession = telnyxVoiceService.getSession(sessionId);
      if (updatedSession?.transcription) {
        session.transcription = {
          text: updatedSession.transcription.text,
          confidence: updatedSession.transcription.confidence,
          language: updatedSession.transcription.language,
          timestamp: updatedSession.transcription.timestamp
        };

        // Process translation if enabled
        if (this.config.enableTranslation && session.transcription.language !== this.config.defaultLanguage) {
          await this.processTranslation(session);
        }

        // Generate AI response
        await this.generateAIResponse(session);

        // Sync across channels
        await this.syncAcrossChannels(session);

        console.log(`Voice transcription processed for session ${sessionId}`);
      }

    } catch (error) {
      console.error('Failed to process voice transcription:', error);
      throw error;
    }
  }

  /**
   * Process translation for voice transcription
   */
  private async processTranslation(session: VoiceSession): Promise<void> {
    if (!session.transcription) return;

    try {
      // This would integrate with a translation service (Google Translate, Azure Translator, etc.)
      const translation = await this.translateText(
        session.transcription.text,
        session.transcription.language,
        this.config.defaultLanguage
      );

      session.translation = {
        originalText: session.transcription.text,
        translatedText: translation.text,
        sourceLanguage: session.transcription.language,
        targetLanguage: this.config.defaultLanguage,
        confidence: translation.confidence
      };

      console.log(`Translation completed for session ${session.sessionId}`);

    } catch (error) {
      console.error('Failed to process translation:', error);
    }
  }

  /**
   * Generate AI response using SHANGO
   */
  private async generateAIResponse(session: VoiceSession): Promise<void> {
    if (!session.transcription) return;

    try {
      const shangoService = getSHANGOAIService();
      // For now, we'll use a simple response since generateResponse doesn't exist
      // In a real implementation, this would integrate with the SHANGO AI service
      const aiResponse = {
        text: `AI Response to: ${session.transcription.text}`,
        confidence: 0.8,
        timestamp: new Date().toISOString()
      };

      session.aiResponse = {
        text: aiResponse.text,
        confidence: aiResponse.confidence,
        agent: 'shango-general',
        timestamp: new Date()
      };

      console.log(`AI response generated for session ${session.sessionId}`);

    } catch (error) {
      console.error('Failed to generate AI response:', error);
    }
  }

  /**
   * Sync voice session across channels
   */
  private async syncAcrossChannels(session: VoiceSession): Promise<void> {
    try {
      // Create cross-channel messages
      const messages: CrossChannelMessage[] = [];

      // Add transcription message
      if (session.transcription) {
        messages.push({
          id: `transcription_${Date.now()}`,
          sessionId: session.sessionId,
          channel: 'voice',
          content: session.transcription.text,
          type: 'transcription',
          timestamp: session.transcription.timestamp,
          metadata: {
            originalChannel: 'voice',
            transcriptionId: session.transcription.timestamp.toISOString()
          }
        });
      }

      // Add translation message if available
      if (session.translation) {
        messages.push({
          id: `translation_${Date.now()}`,
          sessionId: session.sessionId,
          channel: 'voice',
          content: session.translation.translatedText,
          type: 'translation',
          timestamp: new Date(),
          metadata: {
            originalChannel: 'voice',
            translationId: session.translation.sourceLanguage
          }
        });
      }

      // Add AI response message
      if (session.aiResponse) {
        messages.push({
          id: `ai_response_${Date.now()}`,
          sessionId: session.sessionId,
          channel: 'voice',
          content: session.aiResponse.text,
          type: 'text',
          timestamp: session.aiResponse.timestamp,
          metadata: {
            originalChannel: 'voice'
          }
        });
      }

      // Store cross-channel messages
      const existingMessages = this.crossChannelMessages.get(session.sessionId) || [];
      this.crossChannelMessages.set(session.sessionId, [...existingMessages, ...messages]);

      // Sync with SinchChatLive if enabled
      if (this.config.enableSinchChatIntegration && session.metadata.conversationId) {
        await this.syncWithSinchChat(session, messages);
      }

      // Sync with Unified Messaging if enabled
      if (this.config.enableUnifiedMessagingIntegration) {
        await this.syncWithUnifiedMessaging(session, messages);
      }

      console.log(`Cross-channel sync completed for session ${session.sessionId}`);

    } catch (error) {
      console.error('Failed to sync across channels:', error);
    }
  }

  /**
   * Integrate with SinchChatLive
   */
  private async integrateWithSinchChat(session: VoiceSession): Promise<void> {
    try {
      // This would integrate with the existing SinchChatLive service
      console.log(`Integrating voice session ${session.sessionId} with SinchChatLive`);
      
      // Add voice call capability to chat session
      if (session.metadata.conversationId) {
        // Link voice session to chat session
        await this.linkSessions(session.sessionId, session.metadata.conversationId);
      }

    } catch (error) {
      console.error('Failed to integrate with SinchChatLive:', error);
    }
  }

  /**
   * Integrate with Unified Messaging Platform
   */
  private async integrateWithUnifiedMessaging(session: VoiceSession): Promise<void> {
    try {
      // This would integrate with the existing Unified Messaging Platform
      console.log(`Integrating voice session ${session.sessionId} with Unified Messaging Platform`);
      
      // Add voice as a first-class channel
      await this.addVoiceChannel(session);

    } catch (error) {
      console.error('Failed to integrate with Unified Messaging Platform:', error);
    }
  }

  /**
   * Sync with SinchChatLive
   */
  private async syncWithSinchChat(session: VoiceSession, messages: CrossChannelMessage[]): Promise<void> {
    try {
      // Send messages to SinchChatLive
      for (const message of messages) {
        if (session.metadata.conversationId) {
          // This would send the message to the chat session
          console.log(`Syncing message to SinchChatLive: ${message.content}`);
        }
      }

    } catch (error) {
      console.error('Failed to sync with SinchChatLive:', error);
    }
  }

  /**
   * Sync with Unified Messaging Platform
   */
  private async syncWithUnifiedMessaging(session: VoiceSession, messages: CrossChannelMessage[]): Promise<void> {
    try {
      // Send messages to Unified Messaging Platform
      for (const message of messages) {
        // This would send the message to the unified messaging platform
        console.log(`Syncing message to Unified Messaging: ${message.content}`);
      }

    } catch (error) {
      console.error('Failed to sync with Unified Messaging Platform:', error);
    }
  }

  /**
   * Translate text using external service
   */
  private async translateText(text: string, sourceLanguage: string, targetLanguage: string): Promise<{
    text: string;
    confidence: number;
  }> {
    // This would integrate with a translation service
    // For now, return mock data
    return {
      text: `[Translated from ${sourceLanguage} to ${targetLanguage}] ${text}`,
      confidence: 0.95
    };
  }

  /**
   * Link voice session to chat session
   */
  private async linkSessions(voiceSessionId: string, chatSessionId: string): Promise<void> {
    // This would store the link in the database
    console.log(`Linking voice session ${voiceSessionId} to chat session ${chatSessionId}`);
  }

  /**
   * Add voice channel to unified messaging
   */
  private async addVoiceChannel(session: VoiceSession): Promise<void> {
    // This would add voice as a channel in the unified messaging platform
    console.log(`Adding voice channel for session ${session.sessionId}`);
  }

  /**
   * Get voice session
   */
  getSession(sessionId: string): VoiceSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  /**
   * Get all active sessions
   */
  getAllSessions(): VoiceSession[] {
    return Array.from(this.activeSessions.values());
  }

  /**
   * Get cross-channel messages for a session
   */
  getCrossChannelMessages(sessionId: string): CrossChannelMessage[] {
    return this.crossChannelMessages.get(sessionId) || [];
  }

  /**
   * Update session status
   */
  updateSessionStatus(sessionId: string, status: VoiceSession['status']): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.status = status;
      if (status === 'completed' || status === 'failed') {
        session.endTime = new Date();
      }
    }
  }

  /**
   * Cleanup completed sessions
   */
  cleanupSessions(): void {
    const now = new Date();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (session.status === 'completed' && 
          (now.getTime() - session.startTime.getTime()) > maxAge) {
        this.activeSessions.delete(sessionId);
        this.crossChannelMessages.delete(sessionId);
      }
    }
  }
}

// Default configuration
const defaultConfig: VoiceIntegrationConfig = {
  enableIVRIntegration: true,
  enableSinchChatIntegration: true,
  enableUnifiedMessagingIntegration: true,
  enableTranscription: true,
  enableTranslation: false,
  supportedLanguages: ['en-US', 'es-ES', 'fr-FR', 'de-DE'],
  defaultLanguage: 'en-US'
};

export const crossPlatformVoiceIntegration = new CrossPlatformVoiceIntegration(defaultConfig);
