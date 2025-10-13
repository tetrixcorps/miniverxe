// Voice Session Cleanup API Endpoint
// Handles session cleanup operations

import type { APIRoute } from 'astro';

// Mock session storage (in production, use a database)
const sessions = new Map();

export const POST: APIRoute = async () => {
  try {
    // Cleanup sessions older than 24 hours
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

  } catch (error) {
    console.error('Session cleanup failed:', error);
    return new Response(JSON.stringify({
      error: 'Session cleanup failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
