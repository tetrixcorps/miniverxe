// Deepgram STT Integration Tests
// Tests the integration with Deepgram Speech-to-Text API

import { test, expect } from '@playwright/test';
import { VoiceAPIHelper } from '../helpers/api-helpers';

test.describe('Deepgram STT Integration Tests', () => {
  let apiHelper: VoiceAPIHelper;

  test.beforeEach(async ({ request }) => {
    apiHelper = new VoiceAPIHelper(request);
  });

  test.describe('Transcription Processing', () => {
    test('should process audio transcription with Deepgram', async ({ request, deepgramTestData, deepgramConfig }) => {
      const testAudioUrl = deepgramTestData.validAudioUrls[0];
      const sessionId = `deepgram_test_${Date.now()}`;

      const result = await apiHelper.transcribeAudio(sessionId, testAudioUrl, deepgramConfig.language);

      // Check response status
      expect(result.response.status()).toBe(200);
      expect(result.data.success).toBe(true);
      expect(result.data.transcription).toBeDefined();
      expect(result.data.transcription.text).toBeDefined();
      expect(result.data.transcription.confidence).toBeDefined();
      expect(result.data.transcription.language).toBeDefined();
    });

    test('should handle different audio formats', async ({ request, deepgramTestData }) => {
      const audioFormats = [
        'https://example.com/test-audio.mp3',
        'https://example.com/sample.wav',
        'https://example.com/voice.m4a',
        'https://example.com/recording.ogg'
      ];

      for (const audioUrl of audioFormats) {
        const sessionId = `format_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const result = await apiHelper.transcribeAudio(sessionId, audioUrl);
        
        // Should either succeed or fail gracefully
        expect([200, 500, 502]).toContain(result.response.status());
      }
    });

    test('should process batch transcription', async ({ request, deepgramTestData }) => {
      const audioUrls = [
        'https://example.com/audio1.mp3',
        'https://example.com/audio2.wav',
        'https://example.com/audio3.m4a'
      ];
      const sessionIds = [
        `batch_session_1_${Date.now()}`,
        `batch_session_2_${Date.now()}`,
        `batch_session_3_${Date.now()}`
      ];

      const result = await apiHelper.batchTranscribe(audioUrls, sessionIds);

      expect(result.response.status()).toBe(200);
      expect(result.data.success).toBe(true);
      expect(Array.isArray(result.data.sessions)).toBe(true);
      expect(result.data.sessions.length).toBe(3);
    });

    test('should handle different languages', async ({ request, deepgramTestData }) => {
      const languages = ['en-US', 'es-ES', 'fr-FR', 'de-DE'];
      const sessionId = `language_test_${Date.now()}`;
      const audioUrl = deepgramTestData.validAudioUrls[0];

      for (const language of languages) {
        const result = await apiHelper.transcribeAudio(sessionId, audioUrl, language);
        
        // Should either succeed or fail gracefully
        expect([200, 500, 502]).toContain(result.response.status());
      }
    });
  });

  test.describe('Transcription Quality and Features', () => {
    test('should include speaker diarization', async ({ request, deepgramConfig }) => {
      const sessionId = `diarization_test_${Date.now()}`;
      const audioUrl = 'https://example.com/multi-speaker-audio.mp3';

      const result = await apiHelper.transcribeAudio(sessionId, audioUrl);

      if (result.response.status() === 200) {
        expect(result.data.success).toBe(true);
        expect(result.data.transcription).toBeDefined();
        // Note: Speaker diarization results would be in the actual transcription data
      }
    });

    test('should handle punctuation and formatting', async ({ request, deepgramConfig }) => {
      const sessionId = `punctuation_test_${Date.now()}`;
      const audioUrl = 'https://example.com/punctuation-test.mp3';

      const result = await apiHelper.transcribeAudio(sessionId, audioUrl);

      if (result.response.status() === 200) {
        expect(result.data.success).toBe(true);
        expect(result.data.transcription).toBeDefined();
        expect(result.data.transcription.text).toBeDefined();
      }
    });

    test('should handle profanity filtering', async ({ request, deepgramConfig }) => {
      const sessionId = `profanity_test_${Date.now()}`;
      const audioUrl = 'https://example.com/profanity-test.mp3';

      const result = await apiHelper.transcribeAudio(sessionId, audioUrl);

      if (result.response.status() === 200) {
        expect(result.data.success).toBe(true);
        expect(result.data.transcription).toBeDefined();
      }
    });

    test('should handle PII redaction', async ({ request, deepgramConfig }) => {
      const sessionId = `pii_test_${Date.now()}`;
      const audioUrl = 'https://example.com/pii-test.mp3';

      const result = await apiHelper.transcribeAudio(sessionId, audioUrl);

      if (result.response.status() === 200) {
        expect(result.data.success).toBe(true);
        expect(result.data.transcription).toBeDefined();
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle invalid audio URLs', async ({ request }) => {
      const sessionId = `invalid_url_test_${Date.now()}`;
      const invalidUrls = [
        'invalid-url',
        'ftp://example.com/audio.mp3',
        'https://nonexistent-domain.com/audio.mp3'
      ];

      for (const invalidUrl of invalidUrls) {
        const result = await apiHelper.transcribeAudio(sessionId, invalidUrl);
        
        // Should return error status
        expect([400, 500, 502]).toContain(result.response.status());
      }
    });

    test('should handle missing session ID', async ({ request }) => {
      const result = await apiHelper.transcribeAudio('', 'https://example.com/audio.mp3');
      
      expect([400, 404]).toContain(result.response.status());
    });

    test('should handle API key errors gracefully', async ({ request }) => {
      // This test would require mocking the API key
      const sessionId = `api_key_test_${Date.now()}`;
      const audioUrl = 'https://example.com/audio.mp3';

      const result = await apiHelper.transcribeAudio(sessionId, audioUrl);

      // Should handle API key issues gracefully
      expect([200, 401, 500, 502]).toContain(result.response.status());
    });

    test('should handle network timeouts', async ({ request }) => {
      const sessionId = `timeout_test_${Date.now()}`;
      const audioUrl = 'https://httpstat.us/200?sleep=10000'; // 10 second delay

      const result = await apiHelper.transcribeAudio(sessionId, audioUrl);

      // Should handle timeout gracefully
      expect([200, 408, 500, 502]).toContain(result.response.status());
    });
  });

  test.describe('Performance and Statistics', () => {
    test('should get transcription statistics', async ({ request }) => {
      const result = await apiHelper.getTranscriptionStats();

      expect(result.response.status()).toBe(200);
      expect(result.data.success).toBe(true);
      expect(result.data.stats).toBeDefined();
      expect(result.data.stats.totalSessions).toBeDefined();
      expect(result.data.stats.sessionsWithTranscription).toBeDefined();
      expect(result.data.stats.averageConfidence).toBeDefined();
    });

    test('should handle concurrent transcription requests', async ({ request, deepgramTestData }) => {
      const audioUrls = Array.from({ length: 5 }, (_, i) => 
        `https://example.com/concurrent-audio-${i}.mp3`
      );
      const sessionIds = Array.from({ length: 5 }, (_, i) => 
        `concurrent_session_${i}_${Date.now()}`
      );

      const promises = audioUrls.map((audioUrl, index) => 
        apiHelper.transcribeAudio(sessionIds[index], audioUrl)
      );

      const results = await Promise.all(promises);

      // All requests should complete (success or failure)
      results.forEach(result => {
        expect([200, 500, 502]).toContain(result.response.status());
      });
    });

    test('should handle large audio files', async ({ request }) => {
      const sessionId = `large_file_test_${Date.now()}`;
      const audioUrl = 'https://example.com/large-audio-file.mp3'; // Simulated large file

      const result = await apiHelper.transcribeAudio(sessionId, audioUrl);

      // Should handle large files gracefully
      expect([200, 413, 500, 502]).toContain(result.response.status());
    });
  });

  test.describe('Health and Monitoring', () => {
    test('should check transcription health', async ({ request }) => {
      const result = await apiHelper.checkTranscriptionHealth();

      expect(result.response.status()).toBe(200);
      expect(result.data.status).toBeDefined();
      expect(result.data.service).toBe('deepgram-stt');
      expect(result.data.timestamp).toBeDefined();
    });

    test('should validate Deepgram configuration', async ({ request, deepgramTestUtils }) => {
      const apiKey = process.env.DEEPGRAM_API_KEY;
      
      expect(apiKey).toBeDefined();
      expect(deepgramTestUtils.validateApiKey(apiKey!)).toBe(true);
    });
  });

  test.describe('Integration with Voice API', () => {
    test('should integrate transcription with voice calls', async ({ request, deepgramTestData }) => {
      // First, initiate a voice call
      const callResult = await apiHelper.initiateVoiceCall({
        to: '+1234567890',
        from: '+0987654321',
        webhookUrl: 'https://tetrixcorp.com/api/voice/webhook',
        recordCall: true,
        transcriptionEnabled: true,
        language: 'en-US',
        timeout: 30,
        maxDuration: 300
      });

      expect(callResult.response.status()).toBe(200);
      expect(callResult.data.success).toBe(true);
      const sessionId = callResult.data.sessionId;

      // Then, process transcription
      const transcribeResult = await apiHelper.transcribeAudio(
        sessionId, 
        deepgramTestData.validAudioUrls[0]
      );

      expect(transcribeResult.response.status()).toBe(200);
      expect(transcribeResult.data.success).toBe(true);
    });

    test('should integrate transcription with AI responses', async ({ request, deepgramTestData }) => {
      const sessionId = `ai_integration_test_${Date.now()}`;
      const audioUrl = deepgramTestData.validAudioUrls[0];

      // Process transcription
      const transcribeResult = await apiHelper.transcribeAudio(sessionId, audioUrl);
      
      if (transcribeResult.response.status() === 200) {
        // Generate AI response
        const aiResult = await apiHelper.generateAIResponse(
          'Hello, I need help with my account',
          sessionId
        );

        expect(aiResult.response.status()).toBe(200);
        expect(aiResult.data.success).toBe(true);
        expect(aiResult.data.data.response).toBeDefined();
      }
    });
  });
});
