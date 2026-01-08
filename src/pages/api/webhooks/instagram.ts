// src/pages/api/webhooks/instagram.ts

import type { APIRoute } from 'astro';
import { InstagramService } from '../../../../campaign/instagram/InstagramService';

/**
 * Instagram Webhooks Endpoint
 * 
 * Handles webhooks for:
 * - Instagram Direct Messages
 * - Comments on posts/reels/IGTV
 * - @mentions in stories/posts
 * - Story insights
 * - Live video comments
 * 
 * Documentation:
 * https://developers.facebook.com/docs/graph-api/webhooks/reference/instagram
 * https://developers.facebook.com/docs/instagram-api
 */

// Initialize service
const instagramService = new InstagramService();

/**
 * GET - Webhook Verification
 * 
 * Meta sends a GET request to verify the webhook endpoint
 * 
 * Query parameters:
 * - hub.mode: Should be 'subscribe'
 * - hub.verify_token: Verify token set in Meta App Dashboard
 * - hub.challenge: Random string to echo back
 */
export const GET: APIRoute = async ({ request, url }) => {
  try {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    if (!mode || !token || !challenge) {
      console.error('❌ Missing verification parameters');
      return new Response('Bad Request', { status: 400 });
    }

    const result = instagramService.verifyWebhookEndpoint(mode, token, challenge);

    if (result) {
      console.log('✅ Instagram webhook verified successfully');
      return new Response(result, { status: 200 });
    } else {
      console.error('❌ Instagram webhook verification failed');
      return new Response('Forbidden', { status: 403 });
    }
  } catch (error) {
    console.error('❌ Error in Instagram webhook verification:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};

/**
 * POST - Webhook Event Handler
 * 
 * Receives webhook notifications from Meta
 * 
 * Headers:
 * - x-hub-signature-256: HMAC SHA-256 signature of request body
 * 
 * Body: JSON payload with event data
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    // Get signature header
    const signature = request.headers.get('x-hub-signature-256') || '';
    if (!signature) {
      console.error('❌ Missing signature header');
      return new Response('Forbidden', { status: 403 });
    }

    // Get request body
    const bodyText = await request.text();
    if (!bodyText) {
      console.error('❌ Empty request body');
      return new Response('Bad Request', { status: 400 });
    }

    // Verify webhook signature for security
    if (!instagramService.verifyWebhookSignature(signature, bodyText)) {
      console.error('❌ Invalid Instagram webhook signature');
      return new Response('Forbidden', { status: 403 });
    }

    // Parse webhook payload
    const webhookData = JSON.parse(bodyText);

    // Log the webhook for debugging
    console.log('📩 Instagram webhook received:', JSON.stringify(webhookData, null, 2));

    // Handle the webhook
    const success = await instagramService.handleWebhook(webhookData);

    if (success) {
      // Acknowledge receipt of the webhook (Meta requires 200 response)
      return new Response('OK', { status: 200 });
    } else {
      console.error('❌ Failed to process Instagram webhook');
      // Still return 200 to prevent Meta from retrying
      return new Response('OK', { status: 200 });
    }
  } catch (error) {
    console.error('❌ Error processing Instagram webhook:', error);
    
    // Log error details
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    // Return 200 even on error to prevent Meta from retrying
    return new Response('OK', { status: 200 });
  }
};

