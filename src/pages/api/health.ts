// Health check endpoint for DigitalOcean App Platform
import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    // Simple health check response
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'tetrix-voice-api',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'production'
    };

    return new Response(JSON.stringify(healthCheck), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  } catch (error) {
    // Fallback response in case of any errors
    return new Response(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'tetrix-voice-api',
      version: '1.0.0'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  }
};
