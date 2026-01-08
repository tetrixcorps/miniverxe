// IVR Admin API - Session Management
// Provides active and recent call session data

import type { APIRoute } from 'astro';
import { ivrService } from '@/services/ivr';
import { ivrAnalyticsService } from '@/services/ivr';

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');
    const status = url.searchParams.get('status'); // 'active' | 'recent'
    const industry = url.searchParams.get('industry') || undefined;
    const limit = parseInt(url.searchParams.get('limit') || '50');

    if (sessionId) {
      // Get specific session
      const session = ivrService.getSession(sessionId);
      const metrics = ivrAnalyticsService.getCallMetrics(sessionId);

      if (!session) {
        return new Response(JSON.stringify({ error: 'Session not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ session, metrics }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get recent calls
    const recentCalls = ivrAnalyticsService.getRecentCalls(limit, industry);

    return new Response(JSON.stringify({ calls: recentCalls }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
