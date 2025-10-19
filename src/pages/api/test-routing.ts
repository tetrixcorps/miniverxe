import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({
    success: true,
    message: 'API routing test - working correctly',
    timestamp: new Date().toISOString(),
    status: 'healthy'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
