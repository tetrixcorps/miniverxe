// Voice API Routes
// Centralized routing for all voice-related endpoints

import { Router } from 'express';
import { 
  initiateVoiceCall, 
  getCallStatus, 
  endCall, 
  getActiveSessions, 
  cleanupSessions 
} from './initiate';
import { 
  handleVoiceWebhook, 
  handleTeXMLResponse, 
  healthCheck 
} from './webhook';
import { 
  transcribeAudio, 
  getTranscription, 
  batchTranscribe, 
  getTranscriptionStats, 
  transcriptionHealthCheck 
} from './transcribe';
import {
  demoCall,
  demoTexml,
  demoTranscription,
  demoAIResponse,
  demoVoiceFlow,
  getCapabilities
} from './demo';
import {
  testVoiceCall,
  testTeXML,
  testTranscription,
  testAIResponse,
  testSessionManagement,
  runAllTests
} from './test';
import {
  initiateCrossPlatformVoiceCall,
  processCrossPlatformTranscription,
  getCrossPlatformSession,
  getAllCrossPlatformSessions,
  getCrossChannelMessages,
  updateSessionStatus,
  cleanupSessions as cleanupCrossPlatformSessions,
  getIntegrationStatus,
  testCrossPlatformIntegration
} from './integration';

const router = Router();

// Call Management Routes
router.post('/initiate', initiateVoiceCall);
router.get('/sessions', getActiveSessions);
router.get('/sessions/:sessionId', getCallStatus);
router.post('/sessions/:sessionId/end', endCall);
router.post('/cleanup', cleanupSessions);

// Webhook Routes
router.post('/webhook', handleVoiceWebhook);
router.post('/texml', handleTeXMLResponse);
router.get('/health', healthCheck);

// Transcription Routes
router.post('/transcribe', transcribeAudio);
router.get('/transcribe/:sessionId', getTranscription);
router.post('/transcribe/batch', batchTranscribe);
router.get('/transcribe/stats', getTranscriptionStats);
router.get('/transcribe/health', transcriptionHealthCheck);

// Demo Routes
router.post('/demo/call', demoCall);
router.post('/demo/texml', demoTexml);
router.post('/demo/transcribe', demoTranscription);
router.post('/demo/ai-response', demoAIResponse);
router.post('/demo/voice-flow', demoVoiceFlow);
router.get('/demo/capabilities', getCapabilities);

// Test Routes
router.post('/test/voice-call', testVoiceCall);
router.post('/test/texml', testTeXML);
router.post('/test/transcription', testTranscription);
router.post('/test/ai-response', testAIResponse);
router.post('/test/session-management', testSessionManagement);
router.post('/test/all', runAllTests);

// Cross-Platform Integration Routes
router.post('/integration/initiate', initiateCrossPlatformVoiceCall);
router.post('/integration/transcribe', processCrossPlatformTranscription);
router.get('/integration/sessions', getAllCrossPlatformSessions);
router.get('/integration/sessions/:sessionId', getCrossPlatformSession);
router.get('/integration/sessions/:sessionId/messages', getCrossChannelMessages);
router.put('/integration/sessions/:sessionId/status', updateSessionStatus);
router.post('/integration/cleanup', cleanupCrossPlatformSessions);
router.get('/integration/status', getIntegrationStatus);
router.post('/integration/test', testCrossPlatformIntegration);

export default router;