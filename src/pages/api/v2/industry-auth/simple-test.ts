import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({
    success: true,
    message: 'Industry auth simple test endpoint is working',
    timestamp: new Date().toISOString(),
    status: 'healthy'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { phoneNumber, industry } = body;

    return new Response(JSON.stringify({
      success: true,
      message: 'Industry auth simple test POST working',
      received: { phoneNumber, industry },
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Invalid JSON'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
