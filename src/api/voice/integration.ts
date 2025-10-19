// Cross-Platform Voice Integration API Endpoints
// Handles integration between Voice API, IVR, SinchChatLive, and Unified Messaging

import type { APIRoute } from 'astro';
import { crossPlatformVoiceIntegration } from '../../services/crossPlatformVoiceIntegration';

// Initiate voice call with cross-platform integration
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const {
      to,
      from,
      channel = 'voice',
      platform = 'tetrix',
      userId,
      conversationId,
      enableTranscription = true,
      enableTranslation = false,
      targetLanguage = 'en-US'
    } = body;

    // Validate required fields
    if (!to || !from) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: to, from'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate phone number format
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(to) || !phoneRegex.test(from)) {
      return new Response(JSON.stringify({
        error: 'Invalid phone number format. Use E.164 format (e.g., +1234567890)'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Initiate cross-platform voice call
    const session = await crossPlatformVoiceIntegration.initiateVoiceCall({
      to,
      from,
      channel,
      platform,
      userId,
      conversationId,
      enableTranscription,
      enableTranslation,
      targetLanguage
    });

    return new Response(JSON.stringify({
      success: true,
      session,
      message: 'Cross-platform voice call initiated successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Cross-platform voice call initiation failed:', error);
    return new Response(JSON.stringify({
      error: 'Failed to initiate cross-platform voice call',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Process voice transcription with cross-platform integration
export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { sessionId, audioUrl } = body;

    if (!sessionId || !audioUrl) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: sessionId, audioUrl'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Process transcription with cross-platform integration
    await crossPlatformVoiceIntegration.processVoiceTranscription(sessionId, audioUrl);

    // Get updated session
    const session = crossPlatformVoiceIntegration.getSession(sessionId);
    
    if (!session) {
      return new Response(JSON.stringify({
        error: 'Session not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      session,
      message: 'Cross-platform transcription processed successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Cross-platform transcription processing failed:', error);
    return new Response(JSON.stringify({
      error: 'Failed to process cross-platform transcription',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Get cross-platform voice session
export const GET: APIRoute = async ({ url }) => {
  try {
    const sessionId = url.searchParams.get('sessionId');

    if (!sessionId) {
      return new Response(JSON.stringify({
        error: 'Session ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const session = crossPlatformVoiceIntegration.getSession(sessionId);
    
    if (!session) {
      return new Response(JSON.stringify({
        error: 'Session not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      session
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Failed to get cross-platform session:', error);
    return new Response(JSON.stringify({
      error: 'Failed to get cross-platform session',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};