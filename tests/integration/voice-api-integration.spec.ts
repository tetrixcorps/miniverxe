// Integration Tests for Voice API
import { test, expect } from '@playwright/test';

// Test data for integration tests
const integrationTestData = {
  validPhoneNumber: '+1234567890',
  testUserId: 'integration_test_user',
  testConversationId: 'integration_test_conversation',
  testAudioUrl: 'https://example.com/test-audio.mp3',
  testTranscription: 'Hello, this is an integration test for the voice API system'
};

test.describe('Voice API Integration Tests', () => {
  
  test.describe('Cross-Platform Voice Integration', () => {
    test('should initiate cross-platform voice call', async ({ request }) => {
      const response = await request.post('/api/voice/integration/initiate', {
        data: {
          to: integrationTestData.validPhoneNumber,
          from: '+0987654321',
          channel: 'voice',
          platform: 'tetrix',
          userId: integrationTestData.testUserId,
          conversationId: integrationTestData.testConversationId,
          enableTranscription: true,
          enableTranslation: false,
          targetLanguage: 'en-US'
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.session).toBeDefined();
      expect(data.session.sessionId).toBeDefined();
      expect(data.session.callId).toBeDefined();
      expect(data.session.channel).toBe('voice');
      expect(data.session.metadata.platform).toBe('tetrix');
      expect(data.session.metadata.userId).toBe(integrationTestData.testUserId);
    });

    test('should process cross-platform transcription', async ({ request }) => {
      const response = await request.post('/api/voice/integration/transcribe', {
        data: {
          sessionId: 'integration_test_session',
          audioUrl: integrationTestData.testAudioUrl
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.session).toBeDefined();
      expect(data.session.sessionId).toBeDefined();
    });

    test('should retrieve cross-platform sessions', async ({ request }) => {
      const response = await request.get('/api/voice/integration/sessions');

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.sessions)).toBe(true);
      expect(data.count).toBeDefined();
    });

    test('should get cross-channel messages', async ({ request }) => {
      const response = await request.get('/api/voice/integration/sessions/test_session/messages');

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.messages)).toBe(true);
      expect(data.count).toBeDefined();
    });

    test('should update session status', async ({ request }) => {
      const response = await request.put('/api/voice/integration/sessions/test_session/status', {
        data: {
          status: 'active'
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toContain('updated successfully');
    });
  });

  test.describe('Voice Call Workflow Integration', () => {
    test('should complete full voice call workflow', async ({ request }) => {
      // Step 1: Initiate voice call
      const initiateResponse = await request.post('/api/voice/initiate', {
        data: {
          to: integrationTestData.validPhoneNumber,
          from: '+0987654321',
          webhookUrl: 'https://tetrixcorp.com/api/voice/webhook',
          recordCall: true,
          transcriptionEnabled: true,
          language: 'en-US',
          timeout: 30,
          maxDuration: 300
        }
      });

      expect(initiateResponse.status()).toBe(200);
      const initiateData = await initiateResponse.json();
      expect(initiateData.success).toBe(true);
      expect(initiateData.sessionId).toBeDefined();

      // Step 2: Get session status
      const sessionResponse = await request.get(`/api/voice/sessions/${initiateData.sessionId}`);
      expect(sessionResponse.status()).toBe(200);
      const sessionData = await sessionResponse.json();
      expect(sessionData.success).toBe(true);
      expect(sessionData.session).toBeDefined();

      // Step 3: Process transcription
      const transcribeResponse = await request.post('/api/voice/transcribe', {
        data: {
          sessionId: initiateData.sessionId,
          audioUrl: integrationTestData.testAudioUrl
        }
      });

      expect(transcribeResponse.status()).toBe(200);
      const transcribeData = await transcribeResponse.json();
      expect(transcribeData.success).toBe(true);

      // Step 4: Generate AI response
      const aiResponse = await request.post('/api/voice/demo/ai-response', {
        data: {
          transcription: integrationTestData.testTranscription,
          sessionId: initiateData.sessionId
        }
      });

      expect(aiResponse.status()).toBe(200);
      const aiData = await aiResponse.json();
      expect(aiData.success).toBe(true);
      expect(aiData.data.response).toBeDefined();
    });

    test('should handle TeXML response workflow', async ({ request }) => {
      // Step 1: Generate TeXML response
      const texmlResponse = await request.post('/api/voice/demo/texml', {
        data: {
          message: 'Hello! This is SHANGO, your AI Super Agent.'
        }
      });

      expect(texmlResponse.status()).toBe(200);
      const texmlContent = await texmlResponse.text();
      expect(texmlContent).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(texmlContent).toContain('<Response>');

      // Step 2: Test TeXML webhook handling
      const webhookResponse = await request.post('/api/voice/texml', {
        data: {
          CallSid: 'test_call_sid',
          From: integrationTestData.validPhoneNumber,
          To: '+0987654321',
          CallStatus: 'in-progress',
          Digits: '1',
          SpeechResult: 'I need help'
        }
      });

      expect(webhookResponse.status()).toBe(200);
      const webhookContent = await webhookResponse.text();
      expect(webhookContent).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    });
  });

  test.describe('Transcription Pipeline Integration', () => {
    test('should process batch transcription', async ({ request }) => {
      const response = await request.post('/api/voice/transcribe/batch', {
        data: {
          audioUrls: [
            'https://example.com/audio1.mp3',
            'https://example.com/audio2.mp3'
          ],
          sessionIds: [
            'session_1',
            'session_2'
          ],
          language: 'en-US'
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.sessions)).toBe(true);
      expect(data.sessions.length).toBe(2);
    });

    test('should get transcription statistics', async ({ request }) => {
      const response = await request.get('/api/voice/transcribe/stats');

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.stats).toBeDefined();
      expect(data.stats.totalSessions).toBeDefined();
      expect(data.stats.sessionsWithTranscription).toBeDefined();
      expect(data.stats.averageConfidence).toBeDefined();
    });

    test('should handle transcription health check', async ({ request }) => {
      const response = await request.get('/api/voice/transcribe/health');

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.status).toBeDefined();
      expect(data.service).toBe('deepgram-stt');
      expect(data.timestamp).toBeDefined();
    });
  });

  test.describe('Demo and Testing Integration', () => {
    test('should run comprehensive test suite', async ({ request }) => {
      const response = await request.post('/api/voice/test/all');

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.test).toBe('comprehensive_test_suite');
      expect(data.summary).toBeDefined();
      expect(data.summary.total).toBeDefined();
      expect(data.summary.passed).toBeDefined();
      expect(data.summary.failed).toBeDefined();
      expect(data.summary.passRate).toBeDefined();
    });

    test('should test cross-platform integration', async ({ request }) => {
      const response = await request.post('/api/voice/integration/test');

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.test).toBe('cross_platform_integration');
      expect(data.summary).toBeDefined();
      expect(data.results).toBeDefined();
    });

    test('should demonstrate voice flow', async ({ request }) => {
      const response = await request.post('/api/voice/demo/voice-flow', {
        data: {
          phoneNumber: integrationTestData.validPhoneNumber
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.flow).toBeDefined();
      expect(Array.isArray(data.flow)).toBe(true);
      expect(data.flow.length).toBeGreaterThan(0);
    });
  });

  test.describe('Error Handling Integration', () => {
    test('should handle API key errors gracefully', async ({ request }) => {
      const response = await request.post('/api/voice/initiate', {
        data: {
          to: integrationTestData.validPhoneNumber,
          from: '+0987654321',
          webhookUrl: 'https://tetrixcorp.com/api/voice/webhook',
          recordCall: true,
          transcriptionEnabled: true,
          language: 'en-US',
          timeout: 30,
          maxDuration: 300
        }
      });

      // Should either succeed or fail gracefully with proper error message
      expect([200, 500, 502]).toContain(response.status());
      
      if (response.status() !== 200) {
        const data = await response.json();
        expect(data.error).toBeDefined();
        expect(data.message).toBeDefined();
      }
    });

    test('should handle network timeouts gracefully', async ({ request }) => {
      const response = await request.post('/api/voice/transcribe', {
        data: {
          sessionId: 'timeout_test_session',
          audioUrl: 'https://httpstat.us/200?sleep=10000' // 10 second delay
        }
      });

      // Should handle timeout gracefully
      expect([200, 408, 500, 502]).toContain(response.status());
    });

    test('should handle invalid session IDs', async ({ request }) => {
      const response = await request.get('/api/voice/sessions/invalid_session_id');

      expect([404, 400]).toContain(response.status());
    });
  });

  test.describe('Performance Integration', () => {
    test('should handle concurrent requests', async ({ request }) => {
      const promises = Array.from({ length: 5 }, (_, i) => 
        request.post('/api/voice/demo/ai-response', {
          data: {
            transcription: `Concurrent test message ${i}`,
            sessionId: `concurrent_session_${i}`
          }
        })
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status()).toBe(200);
      });

      const data = await Promise.all(responses.map(r => r.json()));
      data.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.data.response).toBeDefined();
      });
    });

    test('should handle large transcription inputs', async ({ request }) => {
      const largeTranscription = 'This is a very long transcription text. '.repeat(100);
      
      const response = await request.post('/api/voice/demo/ai-response', {
        data: {
          transcription: largeTranscription,
          sessionId: 'large_transcription_test'
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.response).toBeDefined();
    });
  });

  test.describe('Data Consistency Integration', () => {
    test('should maintain session consistency across operations', async ({ request }) => {
      // Create a session
      const initiateResponse = await request.post('/api/voice/initiate', {
        data: {
          to: integrationTestData.validPhoneNumber,
          from: '+0987654321',
          webhookUrl: 'https://tetrixcorp.com/api/voice/webhook',
          recordCall: true,
          transcriptionEnabled: true,
          language: 'en-US',
          timeout: 30,
          maxDuration: 300
        }
      });

      expect(initiateResponse.status()).toBe(200);
      const sessionData = await initiateResponse.json();
      const sessionId = sessionData.sessionId;

      // Verify session exists
      const getResponse = await request.get(`/api/voice/sessions/${sessionId}`);
      expect(getResponse.status()).toBe(200);
      const getData = await getResponse.json();
      expect(getData.session.sessionId).toBe(sessionId);

      // Update session status
      const updateResponse = await request.put(`/api/voice/integration/sessions/${sessionId}/status`, {
        data: { status: 'active' }
      });
      expect(updateResponse.status()).toBe(200);

      // Verify status update
      const verifyResponse = await request.get(`/api/voice/integration/sessions/${sessionId}`);
      expect(verifyResponse.status()).toBe(200);
    });
  });
});
