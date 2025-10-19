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

    // Mock response for now - this will be replaced with actual 2FA service
    const mockVerificationId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return new Response(JSON.stringify({
      success: true,
      sessionId: mockVerificationId,
      verificationId: mockVerificationId,
      provider: 'telnyx',
      method: 'sms',
      expiresIn: 300,
      industry: industry,
      message: 'Verification SMS sent successfully',
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
