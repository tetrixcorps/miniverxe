// Health check endpoint for DigitalOcean App Platform
import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'tetrix-voice-api',
    version: '1.0.0',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  };

  return new Response(JSON.stringify(healthCheck, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
  });
};
