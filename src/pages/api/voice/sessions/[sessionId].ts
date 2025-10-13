// Voice Session Management API Endpoint
// Handles individual session operations

import type { APIRoute } from 'astro';

// Mock session storage (in production, use a database)
const sessions = new Map();

export const GET: APIRoute = async ({ params }) => {
  try {
    const { sessionId } = params;
    
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
    if (!session) {
      return new Response(JSON.stringify({
        error: 'Session not found'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      session
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Failed to get session:', error);
    return new Response(JSON.stringify({
      error: 'Failed to get session',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

export const POST: APIRoute = async ({ params, request, url }) => {
  try {
    const { sessionId } = params;
    const pathname = url.pathname;
    
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

    if (pathname.includes('/end')) {
      // End session
      const session = sessions.get(sessionId);
      if (!session) {
        return new Response(JSON.stringify({
          error: 'Session not found'
        }), {
          status: 404,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }

      session.status = 'completed';
      session.endTime = new Date().toISOString();
      sessions.set(sessionId, session);

      return new Response(JSON.stringify({
        success: true,
        message: 'Session ended successfully',
        session
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    return new Response(JSON.stringify({
      error: 'Invalid endpoint'
    }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Session operation failed:', error);
    return new Response(JSON.stringify({
      error: 'Session operation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
