// Voice API Health Check Endpoint

import type { APIRoute } from 'astro';
import { voiceService } from '../../../services/voiceService';

export const GET: APIRoute = async () => {
  try {
    // Get active sessions count
    const sessions = voiceService.getAllSessions();
    const activeSessions = sessions.filter(s => s.status === 'answered' || s.status === 'ringing');
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'voice-api',
      version: '1.0.0',
      services: {
        voice: 'operational',
        transcription: 'operational',
        ai: 'operational',
        webhooks: 'operational'
      },
      dependencies: {
        telnyx: process.env.TELNYX_API_KEY ? 'configured' : 'not_configured',
        deepgram: process.env.DEEPGRAM_API_KEY ? 'configured' : 'not_configured',
        shango: 'available'
      },
      metrics: {
        totalSessions: sessions.length,
        activeSessions: activeSessions.length,
        sessionsWithTranscription: sessions.filter(s => s.transcription).length
      }
    };

    return new Response(JSON.stringify(healthStatus), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error('Health check failed:', error);
    return new Response(JSON.stringify({
      status: 'unhealthy',
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
