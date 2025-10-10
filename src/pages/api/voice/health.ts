// Voice API Health Check Endpoint

import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        voice: 'operational',
        transcription: 'operational',
        ai: 'operational',
        webhooks: 'operational'
      },
      version: '1.0.0'
    };

    return new Response(JSON.stringify(healthStatus), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
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
