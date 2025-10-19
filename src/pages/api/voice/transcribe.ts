// Voice Transcription API Endpoint
// Handles speech-to-text processing with Deepgram

import type { APIRoute } from 'astro';
import { voiceService } from '../../../services/voiceService';
import { parseRequestBody, getParsedBody, isBodyParsed } from '../../../middleware/requestParser';

// Inline utility functions to avoid import issues
function validateRequiredFields(data: any, requiredFields: string[]) {
  for (const field of requiredFields) {
    if (!data || data[field] === undefined || data[field] === null || data[field] === '') {
      return { isValid: false, error: `Missing required field: ${field}` };
    }
  }
  return { isValid: true };
}

function validateUrl(url: string) {
  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
}

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

export const POST: APIRoute = async ({ request, url, locals }) => {
  try {
    // Use enhanced request parsing
    let body: any = {};
    
    if (isBodyParsed({ locals } as any)) {
      console.log('✅ Using parsed body from middleware:', getParsedBody({ locals } as any));
      body = getParsedBody({ locals } as any);
    } else {
      console.log('⚠️ Middleware parsing failed, trying direct parsing methods');
      
      const parseResult = await parseRequestBody(request);
      if (!parseResult.isValid) {
        console.error('❌ Request parsing failed:', parseResult.error);
        return createErrorResponse('Failed to parse request body', 400);
      }
      
      body = parseResult.body;
      console.log('✅ Successfully parsed request body:', body);
    }
    
    const pathname = url.pathname;
    
    if (pathname.includes('/batch')) {
      // Batch transcription
      const { audioUrls, sessionIds, language = 'en-US' } = body;

      if (!audioUrls || !Array.isArray(audioUrls) || audioUrls.length === 0) {
        return createErrorResponse('Audio URLs array is required', 400);
      }

      if (!sessionIds || !Array.isArray(sessionIds) || sessionIds.length === 0) {
        return createErrorResponse('Session IDs array is required', 400);
      }

      if (audioUrls.length !== sessionIds.length) {
        return createErrorResponse('Audio URLs and Session IDs arrays must have the same length', 400);
      }

      // Process batch transcription using voice service
      const results = [];
      for (let i = 0; i < audioUrls.length; i++) {
        const audioUrl = audioUrls[i];
        const sessionId = sessionIds[i];
        
        try {
          await voiceService.processTranscription(audioUrl, sessionId);
          const session = voiceService.getSession(sessionId);
          
          results.push({
            sessionId,
            transcription: session?.transcription
          });
        } catch (error) {
          console.error(`Failed to process transcription for session ${sessionId}:`, error);
          results.push({
            sessionId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      return createSuccessResponse({
        sessions: results,
        message: 'Batch transcription completed successfully'
      });
    } else {
      // Single transcription
      const { audioUrl, sessionId, language = 'en-US' } = body;

      // Validate required fields
      const requiredValidation = validateRequiredFields(body, ['audioUrl', 'sessionId']);
      if (!requiredValidation.isValid) {
        return createErrorResponse(requiredValidation.error || 'Missing required fields', 400);
      }

      // Validate audio URL format
      const urlValidation = validateUrl(audioUrl);
      if (!urlValidation.isValid) {
        return createErrorResponse(urlValidation.error || 'Invalid audio URL format', 400);
      }

      // Process transcription using voice service
      await voiceService.processTranscription(audioUrl, sessionId);
      
      // Get updated session
      const session = voiceService.getSession(sessionId);
      if (!session) {
        return createErrorResponse('Session not found', 404);
      }

      return createSuccessResponse({
        transcription: session.transcription,
        message: 'Transcription completed successfully'
      });
    }

  } catch (error) {
    console.error('Transcription failed:', error);
    return createErrorResponse(
      'Failed to process transcription',
      500,
      { message: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
};

export const GET: APIRoute = async ({ url }) => {
  try {
    const pathname = url.pathname;
    
    if (pathname.includes('/stats')) {
      // Get transcription statistics from voice service
      const allSessions = voiceService.getAllSessions();
      const sessionsWithTranscription = allSessions.filter(s => s.transcription);
      
      const stats = {
        totalSessions: allSessions.length,
        sessionsWithTranscription: sessionsWithTranscription.length,
        averageConfidence: sessionsWithTranscription.length > 0 
          ? sessionsWithTranscription.reduce((sum, s) => sum + (s.transcription?.confidence || 0), 0) / sessionsWithTranscription.length
          : 0,
        lastUpdated: new Date().toISOString()
      };

      return new Response(JSON.stringify({
        success: true,
        stats
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } else if (pathname.includes('/health')) {
      // Health check
      return new Response(JSON.stringify({
        status: 'healthy',
        service: 'deepgram-stt',
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } else {
      // Get specific transcription
      const sessionId = pathname.split('/').pop();
      if (!sessionId) {
        return new Response(JSON.stringify({
          error: 'Session ID is required'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }

      const session = voiceService.getSession(sessionId);
      if (!session || !session.transcription) {
        return new Response(JSON.stringify({
          error: 'Transcription not found'
        }), {
          status: 404,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }

      return new Response(JSON.stringify({
        success: true,
        transcription: session.transcription
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

  } catch (error) {
    console.error('Transcription operation failed:', error);
    return new Response(JSON.stringify({
      error: 'Transcription operation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
