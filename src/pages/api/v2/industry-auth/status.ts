import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({
    success: true,
    message: 'Industry auth status endpoint is working',
    timestamp: new Date().toISOString(),
    status: 'healthy',
    endpoints: {
      initiate: '/api/v2/industry-auth/initiate',
      verify: '/api/v2/industry-auth/verify',
      status: '/api/v2/industry-auth/status'
    }
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
