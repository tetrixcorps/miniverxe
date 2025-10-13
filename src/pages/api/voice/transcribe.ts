// Voice Transcription API Endpoint
// Handles speech-to-text processing with Deepgram

import type { APIRoute } from 'astro';

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

// Mock session storage (in production, use a database)
const sessions = new Map();

export const POST: APIRoute = async ({ request, url, locals }) => {
  try {
    // Use parsed body from middleware if available
    let body: any = {};
    
    if (locals.bodyParsed && locals.parsedBody) {
      console.log('Using parsed body from middleware:', locals.parsedBody);
      body = locals.parsedBody;
    } else {
      console.log('Middleware parsing failed, trying direct parsing methods');
      
      try {
        // Method 1: Try request.json() first
        body = await request.json();
        console.log('Successfully parsed with request.json():', body);
      } catch (jsonError) {
        console.log('request.json() failed, trying request.text():', jsonError);
        
        try {
          // Method 2: Try request.text() and parse manually
          const rawBody = await request.text();
          console.log('Raw request body:', rawBody);
          
          if (rawBody && rawBody.trim()) {
            body = JSON.parse(rawBody);
            console.log('Successfully parsed with request.text() + JSON.parse():', body);
          } else {
            console.log('Empty request body');
            return createErrorResponse('Request body is required', 400);
          }
        } catch (textError) {
          console.error('Both parsing methods failed:', { jsonError, textError });
          return createErrorResponse('Failed to parse request body', 400);
        }
      }
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

      // Process batch transcription
      const results = audioUrls.map((audioUrl, index) => {
        const sessionId = sessionIds[index];
        const session = sessions.get(sessionId) || {
          sessionId,
          status: 'active',
          startTime: new Date().toISOString()
        };

        // Mock transcription result
        const transcription = {
          text: `Transcribed text for ${audioUrl}`,
          confidence: 0.95,
          language,
          timestamp: new Date().toISOString()
        };

        session.transcription = transcription;
        sessions.set(sessionId, session);

        return {
          sessionId,
          transcription
        };
      });

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

      // Get or create session
      let session = sessions.get(sessionId);
      if (!session) {
        session = {
          sessionId,
          status: 'active',
          startTime: new Date().toISOString()
        };
      }

      // Mock Deepgram transcription
      const transcription = {
        text: `Hello, this is a test transcription from ${audioUrl}`,
        confidence: 0.95,
        language,
        timestamp: new Date().toISOString()
      };

      session.transcription = transcription;
      sessions.set(sessionId, session);

      return createSuccessResponse({
        transcription,
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
      // Get transcription statistics
      const allSessions = Array.from(sessions.values());
      const sessionsWithTranscription = allSessions.filter(s => s.transcription);
      
      const stats = {
        totalSessions: allSessions.length,
        sessionsWithTranscription: sessionsWithTranscription.length,
        averageConfidence: sessionsWithTranscription.length > 0 
          ? sessionsWithTranscription.reduce((sum, s) => sum + s.transcription.confidence, 0) / sessionsWithTranscription.length
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

      const session = sessions.get(sessionId);
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
