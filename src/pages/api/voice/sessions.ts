// Voice Sessions API Endpoint
// Handles voice session management

import type { APIRoute } from 'astro';

// Mock session storage (in production, use a database)
const sessions = new Map();

export const GET: APIRoute = async ({ url }) => {
  try {
    const sessionId = url.searchParams.get('sessionId');
    
    if (sessionId) {
      // Get specific session
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
    } else {
      // Get all active sessions
      const allSessions = Array.from(sessions.values());
      
      return new Response(JSON.stringify({
        success: true,
        sessions: allSessions,
        count: allSessions.length
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

  } catch (error) {
    console.error('Failed to get sessions:', error);
    return new Response(JSON.stringify({
      error: 'Failed to get sessions',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

export const POST: APIRoute = async ({ request, url }) => {
  try {
    const pathname = url.pathname;
    
    if (pathname.includes('/cleanup')) {
      // Cleanup sessions
      const now = new Date();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      let cleanedCount = 0;
      for (const [sessionId, session] of sessions.entries()) {
        const sessionTime = new Date(session.startTime);
        if (now.getTime() - sessionTime.getTime() > maxAge) {
          sessions.delete(sessionId);
          cleanedCount++;
        }
      }

      return new Response(JSON.stringify({
        success: true,
        message: `Cleaned up ${cleanedCount} sessions`,
        cleanedCount
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
