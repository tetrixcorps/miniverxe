// Voice Sessions API Endpoint
// Handles session management for voice calls

import type { APIRoute } from 'astro';
import { voiceService } from '../../../services/voiceService';

function createErrorResponse(message: string, status: number = 400, details?: any) {
  return new Response(JSON.stringify({
    error: message,
    ...(details && { details })
  }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function createSuccessResponse(data: any, status: number = 200) {
  return new Response(JSON.stringify({
    success: true,
    ...data
  }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Get all active sessions
export const GET: APIRoute = async ({ url }) => {
  try {
    const pathname = url.pathname;
    
    if (pathname.includes('/cleanup')) {
      // Cleanup old sessions
      voiceService.cleanupSessions();
      
      return createSuccessResponse({
        message: 'Sessions cleaned up successfully'
      });
    } else {
      // Get all sessions
      const sessions = voiceService.getAllSessions();
      
      return createSuccessResponse({
        sessions: sessions.map(session => ({
          sessionId: session.sessionId,
          callId: session.callId,
          phoneNumber: session.phoneNumber,
          status: session.status,
          startTime: session.startTime.toISOString(),
          hasTranscription: !!session.transcription,
          hasRecording: !!session.recording
        })),
        count: sessions.length
      });
    }

  } catch (error) {
    console.error('Failed to get sessions:', error);
    return createErrorResponse(
      'Failed to get sessions',
      500,
      { message: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
};

// Get specific session
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse request body
    let body: any = {};
    
    try {
      body = await request.json();
    } catch (jsonError) {
      try {
        const rawBody = await request.text();
        if (rawBody && rawBody.trim()) {
          body = JSON.parse(rawBody);
        }
      } catch (textError) {
        console.error('Failed to parse request body:', { jsonError, textError });
        return createErrorResponse('Failed to parse request body', 400);
      }
    }
    
    const { sessionId, action } = body;
    
    if (!sessionId) {
      return createErrorResponse('Session ID is required', 400);
    }
    
    const session = voiceService.getSession(sessionId);
    
    if (!session) {
      return createErrorResponse('Session not found', 404);
    }
    
    // Handle different actions
    switch (action) {
      case 'get':
        return createSuccessResponse({
          session: {
            sessionId: session.sessionId,
            callId: session.callId,
            phoneNumber: session.phoneNumber,
            status: session.status,
            startTime: session.startTime.toISOString(),
            transcription: session.transcription,
            recording: session.recording,
            metadata: session.metadata
          }
        });
        
      case 'end':
        // Update session status to completed
        session.status = 'completed';
        return createSuccessResponse({
          message: 'Call ended successfully',
          session: {
            sessionId: session.sessionId,
            status: session.status
          }
        });
        
      case 'status':
        return createSuccessResponse({
          sessionId: session.sessionId,
          status: session.status,
          phoneNumber: session.phoneNumber,
          startTime: session.startTime.toISOString()
        });
        
      default:
        return createErrorResponse('Invalid action. Use: get, end, or status', 400);
    }

  } catch (error) {
    console.error('Session operation failed:', error);
    return createErrorResponse(
      'Session operation failed',
      500,
      { message: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
};