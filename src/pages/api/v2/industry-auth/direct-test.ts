import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({
    success: true,
    message: 'Industry auth direct test endpoint is working',
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

    // Simple mock response without any service imports
    return new Response(JSON.stringify({
      success: true,
      message: 'Industry auth direct test POST working',
      received: { phoneNumber, industry },
      mockResponse: {
        sessionId: 'direct_test_' + Date.now(),
        verificationId: 'direct_verification_' + Date.now(),
        provider: 'mock',
        method: 'sms',
        expiresIn: 300,
        industry: industry || 'healthcare'
      },
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
