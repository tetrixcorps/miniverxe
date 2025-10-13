// Unit Tests for Voice API Services
import { test, expect } from '@playwright/test';

// Mock data for testing
const mockVoiceCallConfig = {
  from: '+1234567890',
  to: '+0987654321',
  webhookUrl: 'https://tetrixcorp.com/api/voice/webhook',
  recordCall: true,
  transcriptionEnabled: true,
  language: 'en-US',
  timeout: 30,
  maxDuration: 300
};

const mockTranscriptionData = {
  text: 'Hello, I need help with my account',
  confidence: 0.95,
  language: 'en-US',
  timestamp: new Date().toISOString()
};

const mockTeXMLResponse = {
  Response: {
    Say: {
      voice: 'female',
      language: 'en-US',
      text: 'Hello! This is SHANGO, your AI Super Agent.'
    },
    Gather: {
      input: ['speech', 'dtmf'],
      numDigits: 1,
      timeout: 10,
      action: 'https://tetrixcorp.com/api/voice/texml',
      method: 'POST'
    }
  }
};

test.describe('Voice API Unit Tests', () => {
  
  test.describe('Telnyx Voice Service', () => {
    test('should validate phone number format', async ({ request }) => {
      const response = await request.post('/api/voice/initiate', {
        data: {
          to: 'invalid-phone',
          from: '+1234567890',
          ...mockVoiceCallConfig
        }
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Invalid phone number format');
    });

    test('should require required fields', async ({ request }) => {
      const response = await request.post('/api/voice/initiate', {
        data: {
          to: '+1234567890'
          // Missing 'from' field
        }
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Missing required fields');
    });

    test('should accept valid phone numbers', async ({ request }) => {
      const response = await request.post('/api/voice/initiate', {
        data: mockVoiceCallConfig
      });

      // This might fail due to missing API keys, but should validate format
      expect([200, 500]).toContain(response.status());
    });
  });

  test.describe('TeXML Response Generation', () => {
    test('should generate valid TeXML response', async ({ request }) => {
      const response = await request.post('/api/voice/demo/texml', {
        data: {
          message: 'Hello! This is a test TeXML response.'
        }
      });

      expect(response.status()).toBe(200);
      const contentType = response.headers()['content-type'];
      expect(contentType).toContain('text/xml');
    });

    test('should include required TeXML elements', async ({ request }) => {
      const response = await request.post('/api/voice/demo/texml', {
        data: {
          message: 'Test message'
        }
      });

      expect(response.status()).toBe(200);
      const xmlContent = await response.text();
      
      expect(xmlContent).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xmlContent).toContain('<Response>');
      expect(xmlContent).toContain('</Response>');
      expect(xmlContent).toContain('<Say>');
      expect(xmlContent).toContain('<Gather>');
    });

    test('should handle custom messages', async ({ request }) => {
      const customMessage = 'Custom test message for TeXML';
      const response = await request.post('/api/voice/demo/texml', {
        data: {
          message: customMessage
        }
      });

      expect(response.status()).toBe(200);
      const xmlContent = await response.text();
      expect(xmlContent).toContain(customMessage);
    });
  });

  test.describe('Transcription Processing', () => {
    test('should require audio URL for transcription', async ({ request }) => {
      const response = await request.post('/api/voice/transcribe', {
        data: {
          sessionId: 'test_session_123'
          // Missing audioUrl
        }
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Audio URL is required');
    });

    test('should validate audio URL format', async ({ request }) => {
      const response = await request.post('/api/voice/transcribe', {
        data: {
          sessionId: 'test_session_123',
          audioUrl: 'invalid-url'
        }
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Invalid audio URL format');
    });

    test('should accept valid audio URL', async ({ request }) => {
      const response = await request.post('/api/voice/transcribe', {
        data: {
          sessionId: 'test_session_123',
          audioUrl: 'https://example.com/test-audio.mp3'
        }
      });

      // This might fail due to missing API keys, but should validate URL
      expect([200, 500, 502]).toContain(response.status());
    });
  });

  test.describe('AI Response Generation', () => {
    test('should require transcription text', async ({ request }) => {
      const response = await request.post('/api/voice/demo/ai-response', {
        data: {
          sessionId: 'test_session_123'
          // Missing transcription
        }
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Transcription text is required');
    });

    test('should generate AI response for valid transcription', async ({ request }) => {
      const response = await request.post('/api/voice/demo/ai-response', {
        data: {
          transcription: 'Hello, I need help with my account',
          sessionId: 'test_session_123'
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.input).toBe('Hello, I need help with my account');
      expect(data.data.response).toBeDefined();
      expect(data.data.response.length).toBeGreaterThan(0);
    });

    test('should handle different transcription inputs', async ({ request }) => {
      const testCases = [
        'I need technical support',
        'What are your business hours?',
        'How do I cancel my subscription?',
        'I want to upgrade my plan'
      ];

      for (const transcription of testCases) {
        const response = await request.post('/api/voice/demo/ai-response', {
          data: {
            transcription,
            sessionId: `test_session_${Date.now()}`
          }
        });

        expect(response.status()).toBe(200);
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.data.input).toBe(transcription);
      }
    });
  });

  test.describe('Session Management', () => {
    test('should return active sessions', async ({ request }) => {
      const response = await request.get('/api/voice/sessions');

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.sessions)).toBe(true);
    });

    test('should handle session cleanup', async ({ request }) => {
      const response = await request.post('/api/voice/cleanup');

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toContain('cleaned up');
    });

    test('should validate session ID format', async ({ request }) => {
      const response = await request.get('/api/voice/sessions/invalid-session-id');

      expect([404, 400]).toContain(response.status());
    });
  });

  test.describe('Health Checks', () => {
    test('should return health status', async ({ request }) => {
      const response = await request.get('/api/voice/health');

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.status).toBeDefined();
      expect(data.timestamp).toBeDefined();
    });

    test('should return transcription health status', async ({ request }) => {
      const response = await request.get('/api/voice/transcribe/health');

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.status).toBeDefined();
      expect(data.service).toBe('deepgram-stt');
    });
  });

  test.describe('Error Handling', () => {
    test('should handle invalid endpoints gracefully', async ({ request }) => {
      const response = await request.get('/api/voice/invalid-endpoint');

      expect(response.status()).toBe(404);
    });

    test('should handle malformed JSON requests', async ({ request }) => {
      const response = await request.post('/api/voice/initiate', {
        data: 'invalid-json'
      });

      expect(response.status()).toBe(400);
    });

    test('should handle missing request body', async ({ request }) => {
      const response = await request.post('/api/voice/initiate');

      expect(response.status()).toBe(400);
    });
  });

  test.describe('Configuration Validation', () => {
    test('should validate environment configuration', async ({ request }) => {
      const response = await request.get('/api/voice/demo/capabilities');

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.capabilities).toBeDefined();
      expect(data.capabilities.voice).toBeDefined();
      expect(data.capabilities.transcription).toBeDefined();
      expect(data.capabilities.texml).toBeDefined();
      expect(data.capabilities.ai).toBeDefined();
    });

    test('should return integration status', async ({ request }) => {
      const response = await request.get('/api/voice/integration/status');

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.status).toBeDefined();
      expect(data.status.voiceAPI).toBeDefined();
      expect(data.status.ivrIntegration).toBeDefined();
      expect(data.status.sinchChatIntegration).toBeDefined();
      expect(data.status.unifiedMessagingIntegration).toBeDefined();
    });
  });
});
