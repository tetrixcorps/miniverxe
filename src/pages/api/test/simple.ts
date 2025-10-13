import type { APIRoute } from 'astro';

// Simple test endpoint
export const GET: APIRoute = async ({ request }) => {
  try {
    return new Response(JSON.stringify({
      success: true,
      message: 'API is working',
      timestamp: new Date().toISOString(),
      environment: {
        MAILGUN_API_KEY: process.env.MAILGUN_API_KEY ? 'Set' : 'Not set',
        MAILGUN_DOMAIN: process.env.MAILGUN_DOMAIN || 'Not set'
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
