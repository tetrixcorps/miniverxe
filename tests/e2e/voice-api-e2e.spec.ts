// End-to-End Tests for Voice API - Complete User Scenarios
import { test, expect } from '@playwright/test';

test.describe('Voice API End-to-End Tests', () => {
  
  test.describe('Complete Voice Call Workflow', () => {
    test('should complete full voice call workflow from UI to API', async ({ page, request }) => {
      // Step 1: Navigate to voice demo page
      await page.goto('/voice-demo');
      await expect(page.locator('h1')).toContainText('SHANGO Voice Assistant Demo');
      
      // Step 2: Configure voice call settings
      await page.fill('input[type="tel"]', '+1234567890');
      await page.check('input[type="checkbox"]:near(:text("Record Call"))');
      await page.check('input[type="checkbox"]:near(:text("Enable Transcription"))');
      await page.selectOption('select', 'en-US');
      await page.fill('input[type="number"]', '30');
      
      // Step 3: Initiate voice call via UI
      await page.click('button:has-text("Call")');
      
      // Step 4: Verify call initiation via API
      const sessionsResponse = await request.get('/api/voice/sessions');
      expect(sessionsResponse.status()).toBe(200);
      const sessionsData = await sessionsResponse.json();
      expect(sessionsData.success).toBe(true);
      
      // Step 5: Test transcription processing
      const transcribeResponse = await request.post('/api/voice/transcribe', {
        data: {
          sessionId: 'e2e_test_session',
          audioUrl: 'https://example.com/test-audio.mp3'
        }
      });
      expect(transcribeResponse.status()).toBe(200);
      
      // Step 6: Test AI response generation
      const aiResponse = await request.post('/api/voice/demo/ai-response', {
        data: {
          transcription: 'Hello, I need help with my account',
          sessionId: 'e2e_test_session'
        }
      });
      expect(aiResponse.status()).toBe(200);
      const aiData = await aiResponse.json();
      expect(aiData.success).toBe(true);
      expect(aiData.data.response).toBeDefined();
      
      // Step 7: Verify UI updates with session information
      await expect(page.locator('text=Active Voice Sessions')).toBeVisible();
    });

    test('should handle cross-platform voice call workflow', async ({ page, request }) => {
      // Step 1: Navigate to voice demo page
      await page.goto('/voice-demo');
      
      // Step 2: Initiate cross-platform voice call via API
      const crossPlatformResponse = await request.post('/api/voice/integration/initiate', {
        data: {
          to: '+1234567890',
          from: '+0987654321',
          channel: 'voice',
          platform: 'tetrix',
          userId: 'e2e_test_user',
          conversationId: 'e2e_test_conversation',
          enableTranscription: true,
          enableTranslation: false,
          targetLanguage: 'en-US'
        }
      });
      
      expect(crossPlatformResponse.status()).toBe(200);
      const crossPlatformData = await crossPlatformResponse.json();
      expect(crossPlatformData.success).toBe(true);
      expect(crossPlatformData.session.metadata.platform).toBe('tetrix');
      
      // Step 3: Process cross-platform transcription
      const transcribeResponse = await request.post('/api/voice/integration/transcribe', {
        data: {
          sessionId: crossPlatformData.session.sessionId,
          audioUrl: 'https://example.com/test-audio.mp3'
        }
      });
      
      expect(transcribeResponse.status()).toBe(200);
      
      // Step 4: Get cross-channel messages
      const messagesResponse = await request.get(`/api/voice/integration/sessions/${crossPlatformData.session.sessionId}/messages`);
      expect(messagesResponse.status()).toBe(200);
      
      // Step 5: Update session status
      const statusResponse = await request.put(`/api/voice/integration/sessions/${crossPlatformData.session.sessionId}/status`, {
        data: { status: 'active' }
      });
      expect(statusResponse.status()).toBe(200);
      
      // Step 6: Verify integration status
      const integrationStatusResponse = await request.get('/api/voice/integration/status');
      expect(integrationStatusResponse.status()).toBe(200);
      const statusData = await integrationStatusResponse.json();
      expect(statusData.success).toBe(true);
    });
  });

  test.describe('TeXML Workflow E2E', () => {
    test('should complete TeXML response workflow', async ({ page, request }) => {
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
      expect(texmlContent).toContain('SHANGO');
      
      // Step 2: Test TeXML webhook handling
      const webhookResponse = await request.post('/api/voice/texml', {
        data: {
          CallSid: 'e2e_test_call_sid',
          From: '+1234567890',
          To: '+0987654321',
          CallStatus: 'in-progress',
          Digits: '1',
          SpeechResult: 'I need help with my account'
        }
      });
      
      expect(webhookResponse.status()).toBe(200);
      const webhookContent = await webhookResponse.text();
      expect(webhookContent).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      
      // Step 3: Test voice webhook handling
      const voiceWebhookResponse = await request.post('/api/voice/webhook', {
        data: {
          event_type: 'call.answered',
          data: {
            call_control_id: 'e2e_test_call_control_id',
            from: '+1234567890',
            to: '+0987654321'
          }
        }
      });
      
      expect(voiceWebhookResponse.status()).toBe(200);
    });
  });

  test.describe('Transcription Pipeline E2E', () => {
    test('should complete full transcription pipeline', async ({ request }) => {
      // Step 1: Process single transcription
      const transcribeResponse = await request.post('/api/voice/transcribe', {
        data: {
          sessionId: 'e2e_transcription_test',
          audioUrl: 'https://example.com/test-audio.mp3'
        }
      });
      
      expect(transcribeResponse.status()).toBe(200);
      
      // Step 2: Process batch transcription
      const batchResponse = await request.post('/api/voice/transcribe/batch', {
        data: {
          audioUrls: [
            'https://example.com/audio1.mp3',
            'https://example.com/audio2.mp3'
          ],
          sessionIds: [
            'e2e_batch_session_1',
            'e2e_batch_session_2'
          ],
          language: 'en-US'
        }
      });
      
      expect(batchResponse.status()).toBe(200);
      const batchData = await batchResponse.json();
      expect(batchData.success).toBe(true);
      expect(batchData.sessions.length).toBe(2);
      
      // Step 3: Get transcription statistics
      const statsResponse = await request.get('/api/voice/transcribe/stats');
      expect(statsResponse.status()).toBe(200);
      const statsData = await statsResponse.json();
      expect(statsData.success).toBe(true);
      expect(statsData.stats).toBeDefined();
      
      // Step 4: Test transcription health check
      const healthResponse = await request.get('/api/voice/transcribe/health');
      expect(healthResponse.status()).toBe(200);
      const healthData = await healthResponse.json();
      expect(healthData.status).toBeDefined();
      expect(healthData.service).toBe('deepgram-stt');
    });
  });

  test.describe('Demo and Testing E2E', () => {
    test('should complete comprehensive testing workflow', async ({ request }) => {
      // Step 1: Run comprehensive test suite
      const testResponse = await request.post('/api/voice/test/all');
      expect(testResponse.status()).toBe(200);
      const testData = await testResponse.json();
      expect(testData.success).toBe(true);
      expect(testData.test).toBe('comprehensive_test_suite');
      expect(testData.summary).toBeDefined();
      
      // Step 2: Run cross-platform integration test
      const integrationTestResponse = await request.post('/api/voice/integration/test');
      expect(integrationTestResponse.status()).toBe(200);
      const integrationTestData = await integrationTestResponse.json();
      expect(integrationTestData.success).toBe(true);
      expect(integrationTestData.test).toBe('cross_platform_integration');
      
      // Step 3: Test individual components
      const voiceCallTestResponse = await request.post('/api/voice/test/voice-call');
      expect(voiceCallTestResponse.status()).toBe(200);
      
      const texmlTestResponse = await request.post('/api/voice/test/texml');
      expect(texmlTestResponse.status()).toBe(200);
      
      const transcriptionTestResponse = await request.post('/api/voice/test/transcription');
      expect(transcriptionTestResponse.status()).toBe(200);
      
      const aiResponseTestResponse = await request.post('/api/voice/test/ai-response');
      expect(aiResponseTestResponse.status()).toBe(200);
      
      const sessionManagementTestResponse = await request.post('/api/voice/test/session-management');
      expect(sessionManagementTestResponse.status()).toBe(200);
    });

    test('should demonstrate voice flow capabilities', async ({ request }) => {
      // Step 1: Test voice flow simulation
      const voiceFlowResponse = await request.post('/api/voice/demo/voice-flow', {
        data: {
          phoneNumber: '+1234567890'
        }
      });
      
      expect(voiceFlowResponse.status()).toBe(200);
      const voiceFlowData = await voiceFlowResponse.json();
      expect(voiceFlowData.success).toBe(true);
      expect(voiceFlowData.flow).toBeDefined();
      expect(Array.isArray(voiceFlowData.flow)).toBe(true);
      expect(voiceFlowData.flow.length).toBeGreaterThan(0);
      
      // Step 2: Test demo call initiation
      const demoCallResponse = await request.post('/api/voice/demo/call', {
        data: {
          phoneNumber: '+1234567890'
        }
      });
      
      expect(demoCallResponse.status()).toBe(200);
      const demoCallData = await demoCallResponse.json();
      expect(demoCallData.success).toBe(true);
      expect(demoCallData.session).toBeDefined();
      
      // Step 3: Test demo transcription
      const demoTranscribeResponse = await request.post('/api/voice/demo/transcribe', {
        data: {
          audioUrl: 'https://example.com/test-audio.mp3',
          sessionId: 'demo_test_session'
        }
      });
      
      expect(demoTranscribeResponse.status()).toBe(200);
      
      // Step 4: Get capabilities
      const capabilitiesResponse = await request.get('/api/voice/demo/capabilities');
      expect(capabilitiesResponse.status()).toBe(200);
      const capabilitiesData = await capabilitiesResponse.json();
      expect(capabilitiesData.success).toBe(true);
      expect(capabilitiesData.capabilities).toBeDefined();
    });
  });

  test.describe('Error Handling E2E', () => {
    test('should handle complete error scenarios', async ({ page, request }) => {
      // Step 1: Test invalid phone number
      const invalidPhoneResponse = await request.post('/api/voice/initiate', {
        data: {
          to: 'invalid-phone',
          from: '+1234567890',
          webhookUrl: 'https://tetrixcorp.com/api/voice/webhook',
          recordCall: true,
          transcriptionEnabled: true,
          language: 'en-US',
          timeout: 30,
          maxDuration: 300
        }
      });
      
      expect(invalidPhoneResponse.status()).toBe(400);
      const invalidPhoneData = await invalidPhoneResponse.json();
      expect(invalidPhoneData.error).toContain('Invalid phone number format');
      
      // Step 2: Test missing required fields
      const missingFieldsResponse = await request.post('/api/voice/initiate', {
        data: {
          to: '+1234567890'
          // Missing 'from' field
        }
      });
      
      expect(missingFieldsResponse.status()).toBe(400);
      const missingFieldsData = await missingFieldsResponse.json();
      expect(missingFieldsData.error).toContain('Missing required fields');
      
      // Step 3: Test invalid audio URL
      const invalidAudioResponse = await request.post('/api/voice/transcribe', {
        data: {
          sessionId: 'test_session',
          audioUrl: 'invalid-url'
        }
      });
      
      expect(invalidAudioResponse.status()).toBe(400);
      const invalidAudioData = await invalidAudioResponse.json();
      expect(invalidAudioData.error).toContain('Invalid audio URL format');
      
      // Step 4: Test UI error handling
      await page.goto('/voice-demo');
      await page.fill('input[type="tel"]', 'invalid-phone');
      await page.click('button:has-text("Call")');
      
      // Should handle validation error
      await page.waitForTimeout(1000);
    });
  });

  test.describe('Performance E2E', () => {
    test('should handle concurrent operations', async ({ request }) => {
      // Step 1: Create multiple concurrent requests
      const promises = Array.from({ length: 10 }, (_, i) => 
        request.post('/api/voice/demo/ai-response', {
          data: {
            transcription: `Concurrent test message ${i}`,
            sessionId: `concurrent_e2e_session_${i}`
          }
        })
      );
      
      // Step 2: Wait for all requests to complete
      const responses = await Promise.all(promises);
      
      // Step 3: Verify all requests succeeded
      responses.forEach(response => {
        expect(response.status()).toBe(200);
      });
      
      const data = await Promise.all(responses.map(r => r.json()));
      data.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.data.response).toBeDefined();
      });
    });

    test('should handle large data processing', async ({ request }) => {
      // Step 1: Test large transcription input
      const largeTranscription = 'This is a very long transcription text. '.repeat(1000);
      
      const largeTranscriptionResponse = await request.post('/api/voice/demo/ai-response', {
        data: {
          transcription: largeTranscription,
          sessionId: 'large_transcription_e2e_test'
        }
      });
      
      expect(largeTranscriptionResponse.status()).toBe(200);
      const largeTranscriptionData = await largeTranscriptionResponse.json();
      expect(largeTranscriptionData.success).toBe(true);
      
      // Step 2: Test batch processing with many items
      const batchUrls = Array.from({ length: 50 }, (_, i) => `https://example.com/audio${i}.mp3`);
      const batchSessionIds = Array.from({ length: 50 }, (_, i) => `batch_e2e_session_${i}`);
      
      const largeBatchResponse = await request.post('/api/voice/transcribe/batch', {
        data: {
          audioUrls: batchUrls,
          sessionIds: batchSessionIds,
          language: 'en-US'
        }
      });
      
      expect(largeBatchResponse.status()).toBe(200);
      const largeBatchData = await largeBatchResponse.json();
      expect(largeBatchData.success).toBe(true);
      expect(largeBatchData.sessions.length).toBe(50);
    });
  });

  test.describe('Data Consistency E2E', () => {
    test('should maintain data consistency across operations', async ({ request }) => {
      // Step 1: Create a session
      const createResponse = await request.post('/api/voice/initiate', {
        data: {
          to: '+1234567890',
          from: '+0987654321',
          webhookUrl: 'https://tetrixcorp.com/api/voice/webhook',
          recordCall: true,
          transcriptionEnabled: true,
          language: 'en-US',
          timeout: 30,
          maxDuration: 300
        }
      });
      
      expect(createResponse.status()).toBe(200);
      const createData = await createResponse.json();
      const sessionId = createData.sessionId;
      
      // Step 2: Verify session exists
      const getResponse = await request.get(`/api/voice/sessions/${sessionId}`);
      expect(getResponse.status()).toBe(200);
      const getData = await getResponse.json();
      expect(getData.session.sessionId).toBe(sessionId);
      
      // Step 3: Update session status
      const updateResponse = await request.put(`/api/voice/integration/sessions/${sessionId}/status`, {
        data: { status: 'active' }
      });
      expect(updateResponse.status()).toBe(200);
      
      // Step 4: Verify status update persisted
      const verifyResponse = await request.get(`/api/voice/integration/sessions/${sessionId}`);
      expect(verifyResponse.status()).toBe(200);
      
      // Step 5: Process transcription
      const transcribeResponse = await request.post('/api/voice/transcribe', {
        data: {
          sessionId: sessionId,
          audioUrl: 'https://example.com/test-audio.mp3'
        }
      });
      expect(transcribeResponse.status()).toBe(200);
      
      // Step 6: Verify transcription was processed
      const transcribeData = await transcribeResponse.json();
      expect(transcribeData.success).toBe(true);
      
      // Step 7: Clean up session
      const cleanupResponse = await request.post('/api/voice/cleanup');
      expect(cleanupResponse.status()).toBe(200);
    });
  });
});
