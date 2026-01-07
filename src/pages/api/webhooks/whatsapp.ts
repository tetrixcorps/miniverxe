import type { APIRoute } from 'astro';
import { WhatsAppCampaignService } from '../../../../../campaign/whatsapp/WhatsAppCampaignService';

// Initialize service
// Note: In a real app, you might want to use a singleton pattern or dependency injection
const whatsappService = new WhatsAppCampaignService();

export const GET: APIRoute = async ({ request, url }) => {
  try {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    const verifyToken = import.meta.env.WHATSAPP_VERIFY_TOKEN || process.env['WHATSAPP_VERIFY_TOKEN'];

    // Check if the mode and token are correct
    if (mode === 'subscribe' && token === verifyToken) {
      console.log('✅ WhatsApp webhook verified successfully');
      return new Response(challenge, { status: 200 });
    } else {
      console.error('❌ WhatsApp webhook verification failed');
      return new Response('Forbidden', { status: 403 });
    }
  } catch (error) {
    console.error('Error in webhook verification:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const signature = request.headers.get('x-hub-signature-256') || '';
    const bodyText = await request.text();
    
    // Verify webhook signature for security
    if (!whatsappService.verifyWebhookSignature(signature, bodyText)) {
      console.error('❌ Invalid webhook signature');
      return new Response('Forbidden', { status: 403 });
    }

    // Process the webhook payload
    const webhookData = JSON.parse(bodyText);

    // Log the webhook for debugging
    console.log('📩 WhatsApp webhook received:', JSON.stringify(webhookData, null, 2));

    // Handle the webhook
    await whatsappService.handleWebhook(webhookData);

    // Acknowledge receipt of the webhook
    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};

