import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { phoneNumber, industry } = body;

    // Validate required fields
    if (!phoneNumber || !industry) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Phone number and industry are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // For now, return a simple success response
    // The actual 2FA will be handled by the 2FA modal
    return new Response(JSON.stringify({
      success: true,
      message: 'Industry authentication ready',
      industry: industry,
      phoneNumber: phoneNumber,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Industry auth initiation failed:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error. Please try again later.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
