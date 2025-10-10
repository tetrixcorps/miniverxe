// API Helper Functions for Voice API Testing
import { APIRequestContext, expect } from '@playwright/test';

export class VoiceAPIHelper {
  constructor(private request: APIRequestContext) {}

  // Voice Call Management
  async initiateVoiceCall(config: {
    to: string;
    from: string;
    webhookUrl?: string;
    recordCall?: boolean;
    transcriptionEnabled?: boolean;
    language?: string;
    timeout?: number;
    maxDuration?: number;
  }) {
    const response = await this.request.post('/api/voice/initiate', {
      data: {
        webhookUrl: 'https://tetrixcorp.com/api/voice/webhook',
        recordCall: true,
        transcriptionEnabled: true,
        language: 'en-US',
        timeout: 30,
        maxDuration: 300,
        ...config
      }
    });

    return {
      response,
      data: await response.json()
    };
  }

  async getCallStatus(sessionId: string) {
    const response = await this.request.get(`/api/voice/sessions/${sessionId}`);
    return {
      response,
      data: await response.json()
    };
  }

  async endCall(sessionId: string) {
    const response = await this.request.post(`/api/voice/sessions/${sessionId}/end`);
    return {
      response,
      data: await response.json()
    };
  }

  async getActiveSessions() {
    const response = await this.request.get('/api/voice/sessions');
    return {
      response,
      data: await response.json()
    };
  }

  async cleanupSessions() {
    const response = await this.request.post('/api/voice/cleanup');
    return {
      response,
      data: await response.json()
    };
  }

  // Transcription Management
  async transcribeAudio(sessionId: string, audioUrl: string, language = 'en-US') {
    const response = await this.request.post('/api/voice/transcribe', {
      data: {
        sessionId,
        audioUrl,
        language
      }
    });

    return {
      response,
      data: await response.json()
    };
  }

  async getTranscription(sessionId: string) {
    const response = await this.request.get(`/api/voice/transcribe/${sessionId}`);
    return {
      response,
      data: await response.json()
    };
  }

  async batchTranscribe(audioUrls: string[], sessionIds: string[], language = 'en-US') {
    const response = await this.request.post('/api/voice/transcribe/batch', {
      data: {
        audioUrls,
        sessionIds,
        language
      }
    });

    return {
      response,
      data: await response.json()
    };
  }

  async getTranscriptionStats() {
    const response = await this.request.get('/api/voice/transcribe/stats');
    return {
      response,
      data: await response.json()
    };
  }

  // TeXML Management
  async generateTeXMLResponse(message: string) {
    const response = await this.request.post('/api/voice/demo/texml', {
      data: { message }
    });

    return {
      response,
      content: await response.text()
    };
  }

  async handleTeXMLWebhook(webhookData: any) {
    const response = await this.request.post('/api/voice/texml', {
      data: webhookData
    });

    return {
      response,
      content: await response.text()
    };
  }

  // AI Response Management
  async generateAIResponse(transcription: string, sessionId: string) {
    const response = await this.request.post('/api/voice/demo/ai-response', {
      data: {
        transcription,
        sessionId
      }
    });

    return {
      response,
      data: await response.json()
    };
  }

  // Cross-Platform Integration
  async initiateCrossPlatformVoiceCall(config: {
    to: string;
    from: string;
    channel: 'voice' | 'chat' | 'sms' | 'whatsapp';
    platform: 'tetrix' | 'joromi';
    userId?: string;
    conversationId?: string;
    enableTranscription?: boolean;
    enableTranslation?: boolean;
    targetLanguage?: string;
  }) {
    const response = await this.request.post('/api/voice/integration/initiate', {
      data: {
        enableTranscription: true,
        enableTranslation: false,
        targetLanguage: 'en-US',
        ...config
      }
    });

    return {
      response,
      data: await response.json()
    };
  }

  async processCrossPlatformTranscription(sessionId: string, audioUrl: string) {
    const response = await this.request.post('/api/voice/integration/transcribe', {
      data: {
        sessionId,
        audioUrl
      }
    });

    return {
      response,
      data: await response.json()
    };
  }

  async getCrossPlatformSessions() {
    const response = await this.request.get('/api/voice/integration/sessions');
    return {
      response,
      data: await response.json()
    };
  }

  async getCrossPlatformSession(sessionId: string) {
    const response = await this.request.get(`/api/voice/integration/sessions/${sessionId}`);
    return {
      response,
      data: await response.json()
    };
  }

  async getCrossChannelMessages(sessionId: string) {
    const response = await this.request.get(`/api/voice/integration/sessions/${sessionId}/messages`);
    return {
      response,
      data: await response.json()
    };
  }

  async updateSessionStatus(sessionId: string, status: 'initiated' | 'active' | 'completed' | 'failed') {
    const response = await this.request.put(`/api/voice/integration/sessions/${sessionId}/status`, {
      data: { status }
    });

    return {
      response,
      data: await response.json()
    };
  }

  // Demo and Testing
  async runComprehensiveTest() {
    const response = await this.request.post('/api/voice/test/all');
    return {
      response,
      data: await response.json()
    };
  }

  async runCrossPlatformIntegrationTest() {
    const response = await this.request.post('/api/voice/integration/test');
    return {
      response,
      data: await response.json()
    };
  }

  async getIntegrationStatus() {
    const response = await this.request.get('/api/voice/integration/status');
    return {
      response,
      data: await response.json()
    };
  }

  async getCapabilities() {
    const response = await this.request.get('/api/voice/demo/capabilities');
    return {
      response,
      data: await response.json()
    };
  }

  async demonstrateVoiceFlow(phoneNumber: string) {
    const response = await this.request.post('/api/voice/demo/voice-flow', {
      data: { phoneNumber }
    });

    return {
      response,
      data: await response.json()
    };
  }

  // Health Checks
  async checkHealth() {
    const response = await this.request.get('/api/voice/health');
    return {
      response,
      data: await response.json()
    };
  }

  async checkTranscriptionHealth() {
    const response = await this.request.get('/api/voice/transcribe/health');
    return {
      response,
      data: await response.json()
    };
  }

  // Validation Helpers
  validatePhoneNumber(phoneNumber: string): boolean {
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
  }

  validateAudioUrl(url: string): boolean {
    const urlRegex = /^https?:\/\/.+/;
    return urlRegex.test(url);
  }

  validateSessionId(sessionId: string): boolean {
    return typeof sessionId === 'string' && sessionId.length > 0;
  }

  // Assertion Helpers
  async assertSuccessfulResponse(result: { response: any; data: any }, expectedMessage?: string) {
    expect(result.response.status()).toBe(200);
    expect(result.data.success).toBe(true);
    if (expectedMessage) {
      expect(result.data.message).toContain(expectedMessage);
    }
  }

  async assertErrorResponse(result: { response: any; data: any }, expectedStatus: number, expectedError?: string) {
    expect(result.response.status()).toBe(expectedStatus);
    expect(result.data.error).toBeDefined();
    if (expectedError) {
      expect(result.data.error).toContain(expectedError);
    }
  }

  async assertTeXMLResponse(result: { response: any; content: string }) {
    expect(result.response.status()).toBe(200);
    expect(result.response.headers()['content-type']).toContain('text/xml');
    expect(result.content).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(result.content).toContain('<Response>');
    expect(result.content).toContain('</Response>');
  }

  async assertTranscriptionResult(result: { response: any; data: any }) {
    expect(result.response.status()).toBe(200);
    expect(result.data.success).toBe(true);
    expect(result.data.transcription).toBeDefined();
    expect(result.data.transcription.text).toBeDefined();
    expect(result.data.transcription.confidence).toBeDefined();
    expect(result.data.transcription.language).toBeDefined();
  }

  async assertAIResponse(result: { response: any; data: any }) {
    expect(result.response.status()).toBe(200);
    expect(result.data.success).toBe(true);
    expect(result.data.data.input).toBeDefined();
    expect(result.data.data.response).toBeDefined();
    expect(result.data.data.response.length).toBeGreaterThan(0);
  }

  async assertSessionData(result: { response: any; data: any }, expectedSessionId?: string) {
    expect(result.response.status()).toBe(200);
    expect(result.data.success).toBe(true);
    expect(result.data.session).toBeDefined();
    expect(result.data.session.sessionId).toBeDefined();
    if (expectedSessionId) {
      expect(result.data.session.sessionId).toBe(expectedSessionId);
    }
  }
}

// Utility functions
export const createVoiceAPIHelper = (request: APIRequestContext) => new VoiceAPIHelper(request);

export const generateTestData = () => ({
  validPhoneNumber: '+1234567890',
  testSessionId: `test_session_${Date.now()}`,
  testAudioUrl: 'https://example.com/test-audio.mp3',
  testTranscription: 'Hello, this is a test transcription',
  testMessage: 'Hello! This is SHANGO, your AI Super Agent.'
});

export const waitForCondition = async (condition: () => Promise<boolean>, timeout = 10000, interval = 1000) => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error(`Condition not met within ${timeout}ms`);
};
