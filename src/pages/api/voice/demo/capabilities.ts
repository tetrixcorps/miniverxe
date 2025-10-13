// Voice API Capabilities Demo Endpoint
// Shows available Voice API capabilities

import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  try {
    const capabilities = {
      voice: {
        callInitiation: true,
        callManagement: true,
        callRecording: true,
        callTransfer: true,
        callQueuing: true,
        holdMusic: true
      },
      transcription: {
        realTime: true,
        batchProcessing: true,
        speakerDiarization: true,
        languageDetection: true,
        punctuation: true,
        profanityFilter: true,
        piiRedaction: true,
        confidenceScoring: true,
        supportedLanguages: [
          'en-US', 'es-ES', 'fr-FR', 'de-DE', 'pt-BR', 'it-IT',
          'ja-JP', 'ko-KR', 'zh-CN', 'ar-SA', 'hi-IN', 'ru-RU'
        ]
      },
      texml: {
        dynamicResponses: true,
        voicePrompts: true,
        dtmfInput: true,
        speechInput: true,
        callFlowControl: true,
        webhookIntegration: true
      },
      ai: {
        responseGeneration: true,
        intentRecognition: true,
        contextAwareness: true,
        multiAgentSupport: true,
        confidenceScoring: true,
        entityExtraction: true,
        agents: [
          'SHANGO General',
          'SHANGO Tech',
          'SHANGO Sales',
          'SHANGO Billing'
        ]
      },
      integration: {
        telnyx: true,
        deepgram: true,
        crossPlatform: true,
        webhooks: true,
        realTimeSync: true,
        sessionManagement: true
      },
      features: {
        multiChannel: true,
        crossPlatformSync: true,
        realTimeTranscription: true,
        aiPoweredResponses: true,
        intelligentRouting: true,
        contextPreservation: true,
        multiLanguageSupport: true,
        speakerIdentification: true
      }
    };

    return new Response(JSON.stringify({
      success: true,
      capabilities,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Failed to get capabilities:', error);
    return new Response(JSON.stringify({
      error: 'Failed to get capabilities',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
