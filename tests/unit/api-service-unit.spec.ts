// Unit Tests for TETRIX API Service
import { test, expect } from '@playwright/test';
import { TestData, MockResponses, Assertions, DataGenerators } from '../../scripts/test-utilities.js';

test.describe('TETRIX API Service Unit Tests', () => {
  
  test.describe('Voice API Endpoints', () => {
    test('should validate phone number format', async ({ request }) => {
      const response = await request.post('/api/voice/initiate', {
        data: TestData.voiceCall.invalid
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Invalid phone number format');
    });

    test('should require required fields', async ({ request }) => {
      const response = await request.post('/api/voice/initiate', {
        data: TestData.voiceCall.missingFields
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Missing required fields');
    });

    test('should accept valid voice call configuration', async ({ request }) => {
      const response = await request.post('/api/voice/initiate', {
        data: TestData.voiceCall.valid
      });

      // Should validate format even if API keys are missing
      expect([200, 500, 502]).toContain(response.status());
    });

    test('should handle different phone number formats', async ({ request }) => {
      const phoneFormats = [
        '+1234567890',
        '+44 20 7946 0958',
        '+33 1 42 86 83 26',
        '+81 3 1234 5678'
      ];

      for (const phone of phoneFormats) {
        const response = await request.post('/api/voice/initiate', {
          data: {
            ...TestData.voiceCall.valid,
            to: phone
          }
        });

        // Should accept valid formats
        expect([200, 500, 502]).toContain(response.status());
      }
    });
  });

  test.describe('Transcription Service', () => {
    test('should require audio URL for transcription', async ({ request }) => {
      const response = await request.post('/api/voice/transcribe', {
        data: TestData.transcription.missingFields
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Audio URL is required');
    });

    test('should validate audio URL format', async ({ request }) => {
      const response = await request.post('/api/voice/transcribe', {
        data: TestData.transcription.invalid
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Invalid audio URL format');
    });

    test('should accept valid audio URLs', async ({ request }) => {
      const audioFormats = [
        'https://example.com/audio.mp3',
        'https://example.com/audio.wav',
        'https://example.com/audio.m4a',
        'https://example.com/audio.webm'
      ];

      for (const audioUrl of audioFormats) {
        const response = await request.post('/api/voice/transcribe', {
          data: {
            ...TestData.transcription.valid,
            audioUrl
          }
        });

        // Should accept valid formats
        expect([200, 500, 502]).toContain(response.status());
      }
    });

    test('should handle different audio formats', async ({ request }) => {
      const formats = ['mp3', 'wav', 'm4a', 'webm', 'ogg'];
      
      for (const format of formats) {
        const audioUrl = DataGenerators.generateAudioUrl(format);
        const response = await request.post('/api/voice/transcribe', {
          data: {
            ...TestData.transcription.valid,
            audioUrl
          }
        });

        expect([200, 500, 502]).toContain(response.status());
      }
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
        data: TestData.aiResponse.valid
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      
      Assertions.expectField(data, 'success', true);
      Assertions.expectField(data.data, 'input', TestData.aiResponse.valid.transcription);
      Assertions.expectDefined(data.data, 'response');
      Assertions.expectNotEmpty(data.data, 'response');
    });

    test('should handle different transcription inputs', async ({ request }) => {
      for (const transcription of TestData.aiResponse.testCases) {
        const response = await request.post('/api/voice/demo/ai-response', {
          data: {
            transcription,
            sessionId: DataGenerators.generateSessionId()
          }
        });

        expect(response.status()).toBe(200);
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.data.input).toBe(transcription);
        expect(data.data.response).toBeDefined();
        expect(data.data.response.length).toBeGreaterThan(0);
      }
    });

    test('should handle empty transcription', async ({ request }) => {
      const response = await request.post('/api/voice/demo/ai-response', {
        data: {
          transcription: '',
          sessionId: 'test_session_123'
        }
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Transcription text is required');
    });

    test('should handle very long transcriptions', async ({ request }) => {
      const longTranscription = DataGenerators.generateTranscription('long');
      const response = await request.post('/api/voice/demo/ai-response', {
        data: {
          transcription: longTranscription,
          sessionId: DataGenerators.generateSessionId()
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.input).toBe(longTranscription);
    });
  });

  test.describe('TeXML Response Generation', () => {
    test('should generate valid TeXML response', async ({ request }) => {
      const response = await request.post('/api/voice/demo/texml', {
        data: TestData.texml.valid
      });

      expect(response.status()).toBe(200);
      const contentType = response.headers()['content-type'];
      expect(contentType).toContain('text/xml');
    });

    test('should include required TeXML elements', async ({ request }) => {
      const response = await request.post('/api/voice/demo/texml', {
        data: TestData.texml.valid
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
      const response = await request.post('/api/voice/demo/texml', {
        data: TestData.texml.custom
      });

      expect(response.status()).toBe(200);
      const xmlContent = await response.text();
      expect(xmlContent).toContain(TestData.texml.custom.message);
    });

    test('should handle different voice options', async ({ request }) => {
      const voiceOptions = ['male', 'female', 'alice', 'bob'];
      
      for (const voice of voiceOptions) {
        const response = await request.post('/api/voice/demo/texml', {
          data: {
            ...TestData.texml.valid,
            voice
          }
        });

        expect(response.status()).toBe(200);
        const xmlContent = await response.text();
        expect(xmlContent).toContain(`voice="${voice}"`);
      }
    });

    test('should handle different languages', async ({ request }) => {
      const languages = ['en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE'];
      
      for (const language of languages) {
        const response = await request.post('/api/voice/demo/texml', {
          data: {
            ...TestData.texml.valid,
            language
          }
        });

        expect(response.status()).toBe(200);
        const xmlContent = await response.text();
        expect(xmlContent).toContain(`language="${language}"`);
      }
    });
  });

  test.describe('Session Management', () => {
    test('should return active sessions', async ({ request }) => {
      const response = await request.get('/api/voice/sessions');

      expect(response.status()).toBe(200);
      const data = await response.json();
      
      Assertions.expectField(data, 'success', true);
      Assertions.expectArray(data, 'sessions');
    });

    test('should handle session cleanup', async ({ request }) => {
      const response = await request.post('/api/voice/cleanup');

      expect(response.status()).toBe(200);
      const data = await response.json();
      
      Assertions.expectField(data, 'success', true);
      expect(data.message).toContain('cleaned up');
    });

    test('should validate session ID format', async ({ request }) => {
      const response = await request.get('/api/voice/sessions/invalid-session-id');

      expect([404, 400]).toContain(response.status());
    });

    test('should handle session creation', async ({ request }) => {
      const sessionData = {
        userId: 'user_123',
        status: 'active'
      };

      const response = await request.post('/api/voice/sessions', {
        data: sessionData
      });

      expect([200, 201]).toContain(response.status());
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.sessionId).toBeDefined();
    });

    test('should handle session updates', async ({ request }) => {
      const sessionId = DataGenerators.generateSessionId();
      const updateData = {
        status: 'completed',
        duration: 120
      };

      const response = await request.put(`/api/voice/sessions/${sessionId}`, {
        data: updateData
      });

      // Should handle gracefully even if session doesn't exist
      expect([200, 404]).toContain(response.status());
    });
  });

  test.describe('Health Checks', () => {
    test('should return voice API health status', async ({ request }) => {
      const response = await request.get('/api/voice/health');

      expect(response.status()).toBe(200);
      const data = await response.json();
      
      Assertions.expectDefined(data, 'status');
      Assertions.expectDefined(data, 'timestamp');
    });

    test('should return transcription health status', async ({ request }) => {
      const response = await request.get('/api/voice/transcribe/health');

      expect(response.status()).toBe(200);
      const data = await response.json();
      
      Assertions.expectDefined(data, 'status');
      Assertions.expectField(data, 'service', 'deepgram-stt');
    });

    test('should return AI service health status', async ({ request }) => {
      const response = await request.get('/api/voice/ai/health');

      expect(response.status()).toBe(200);
      const data = await response.json();
      
      Assertions.expectDefined(data, 'status');
      Assertions.expectDefined(data, 'service');
    });

    test('should return comprehensive system health', async ({ request }) => {
      const response = await request.get('/api/voice/system/health');

      expect(response.status()).toBe(200);
      const data = await response.json();
      
      Assertions.expectDefined(data, 'status');
      Assertions.expectDefined(data, 'services');
      Assertions.expectDefined(data, 'timestamp');
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

    test('should handle oversized requests', async ({ request }) => {
      const largeData = {
        ...TestData.voiceCall.valid,
        largeField: 'x'.repeat(10000) // 10KB string
      };

      const response = await request.post('/api/voice/initiate', {
        data: largeData
      });

      // Should handle gracefully
      expect([200, 400, 413]).toContain(response.status());
    });

    test('should handle concurrent requests', async ({ request }) => {
      const promises = Array.from({ length: 10 }, () => 
        request.get('/api/voice/health')
      );

      const responses = await Promise.all(promises);
      
      // All requests should succeed
      responses.forEach(response => {
        expect(response.status()).toBe(200);
      });
    });
  });

  test.describe('Configuration Validation', () => {
    test('should validate environment configuration', async ({ request }) => {
      const response = await request.get('/api/voice/demo/capabilities');

      expect(response.status()).toBe(200);
      const data = await response.json();
      
      Assertions.expectField(data, 'success', true);
      Assertions.expectDefined(data, 'capabilities');
      Assertions.expectDefined(data.capabilities, 'voice');
      Assertions.expectDefined(data.capabilities, 'transcription');
      Assertions.expectDefined(data.capabilities, 'texml');
      Assertions.expectDefined(data.capabilities, 'ai');
    });

    test('should return integration status', async ({ request }) => {
      const response = await request.get('/api/voice/integration/status');

      expect(response.status()).toBe(200);
      const data = await response.json();
      
      Assertions.expectField(data, 'success', true);
      Assertions.expectDefined(data, 'status');
      Assertions.expectDefined(data.status, 'voiceAPI');
      Assertions.expectDefined(data.status, 'ivrIntegration');
      Assertions.expectDefined(data.status, 'sinchChatIntegration');
      Assertions.expectDefined(data.status, 'unifiedMessagingIntegration');
    });

    test('should return service versions', async ({ request }) => {
      const response = await request.get('/api/voice/versions');

      expect(response.status()).toBe(200);
      const data = await response.json();
      
      Assertions.expectDefined(data, 'versions');
      Assertions.expectDefined(data.versions, 'voiceAPI');
      Assertions.expectDefined(data.versions, 'transcription');
      Assertions.expectDefined(data.versions, 'ai');
    });
  });
});
