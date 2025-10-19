import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({
    success: true,
    message: 'Industry auth mock test - no service imports',
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
    
    // Mock response without any service imports
    return new Response(JSON.stringify({
      success: true,
      message: 'Industry auth mock POST test - no service imports',
      received: body,
      mockResponse: {
        sessionId: 'mock_session_' + Date.now(),
        verificationId: 'mock_verification_' + Date.now(),
        provider: 'mock',
        method: 'sms',
        expiresIn: 300,
        industry: body.industry || 'healthcare',
        organizationId: body.organizationId || 'mock_org'
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
