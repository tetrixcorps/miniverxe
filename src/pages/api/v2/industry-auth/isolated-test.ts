import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({
    success: true,
    message: 'Isolated industry auth test - no service imports',
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
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Isolated industry auth POST test - no service imports',
      received: body,
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
