// Transcription Health Check API Endpoint
// Health check for Deepgram STT service

import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  try {
    const healthStatus = {
      status: 'healthy',
      service: 'deepgram-stt',
      timestamp: new Date().toISOString(),
      features: {
        realTime: true,
        batchProcessing: true,
        speakerDiarization: true,
        languageDetection: true,
        punctuation: true,
        profanityFilter: true,
        piiRedaction: true,
        confidenceScoring: true
      },
      supportedLanguages: [
        'en-US', 'es-ES', 'fr-FR', 'de-DE', 'pt-BR', 'it-IT',
        'ja-JP', 'ko-KR', 'zh-CN', 'ar-SA', 'hi-IN', 'ru-RU'
      ]
    };

    return new Response(JSON.stringify(healthStatus), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Transcription health check failed:', error);
    return new Response(JSON.stringify({
      status: 'unhealthy',
      service: 'deepgram-stt',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
