import type { APIRoute } from 'astro';
import { WhatsAppCampaignService } from '../../../../campaign/whatsapp/WhatsAppCampaignService';

// Initialize service
const whatsAppService = new WhatsAppCampaignService();

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { accessToken } = body;

    if (!accessToken) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Access Token is required' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Exchange for long-lived token
    const result = await whatsAppService.exchangeForLongLivedToken(accessToken);

    if (result.success) {
      // In a production app, you would:
      // 1. Store this token securely in your database associated with the user's account/tenant
      // 2. Use this token to register the WABA phone number (if not already done)
      // 3. Subscribe to webhooks for this WABA

      return new Response(JSON.stringify({ 
        success: true, 
        accessToken: result.accessToken,
        expiresIn: result.expiresIn
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      console.error('Token exchange failed:', result.error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: result.error 
      }), { 
        status: 400, // or 500 depending on the error
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error in token exchange endpoint:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal Server Error' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

