// Cross-Platform Integration Status API Endpoint
// Shows integration status across all platforms

import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  try {
    const status = {
      voiceAPI: {
        status: 'active',
        features: ['telnyx', 'deepgram', 'texml', 'shango_ai']
      },
      ivrIntegration: {
        status: 'enabled',
        features: ['dynamic_call_flows', 'ai_responses', 'multi_language']
      },
      sinchChatIntegration: {
        status: 'enabled',
        features: ['voice_calling', 'cross_channel_sync', 'ai_agents']
      },
      messagingIntegration: {
        status: 'enabled',
        features: ['voice_channel', 'transcription', 'cross_platform_sync']
      },
      transcription: {
        status: 'active',
        features: ['real_time', 'speaker_diarization', 'language_detection']
      },
      translation: {
        status: 'disabled',
        features: ['multi_language', 'voice_synthesis']
      },
      crossPlatformSync: {
        status: 'active',
        features: ['session_management', 'message_sync', 'channel_switching']
      },
      webhooks: {
        status: 'active',
        features: ['real_time_events', 'status_updates', 'call_events']
      }
    };

    return new Response(JSON.stringify({
      success: true,
      status,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Failed to get integration status:', error);
    return new Response(JSON.stringify({
      error: 'Failed to get integration status',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
