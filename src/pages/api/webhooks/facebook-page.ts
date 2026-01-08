// src/pages/api/webhooks/facebook-page.ts

import type { APIRoute } from 'astro';
import { FacebookPageService } from '../../../../campaign/facebook/FacebookPageService';

/**
 * Facebook Page Webhooks Endpoint
 * 
 * Handles webhooks for:
 * - Messenger conversations
 * - Lead generation forms
 * - Page engagement (comments, mentions, reactions)
 * - Post updates
 * 
 * Documentation:
 * https://developers.facebook.com/docs/graph-api/webhooks/reference/page
 * https://developers.facebook.com/docs/messenger-platform/webhooks
 */

// Initialize service
const facebookPageService = new FacebookPageService();

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

    const result = facebookPageService.verifyWebhookEndpoint(mode, token, challenge);

    if (result) {
      console.log('✅ Facebook Page webhook verified successfully');
      return new Response(result, { status: 200 });
    } else {
      console.error('❌ Facebook Page webhook verification failed');
      return new Response('Forbidden', { status: 403 });
    }
  } catch (error) {
    console.error('❌ Error in webhook verification:', error);
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
    if (!facebookPageService.verifyWebhookSignature(signature, bodyText)) {
      console.error('❌ Invalid webhook signature');
      return new Response('Forbidden', { status: 403 });
    }

    // Parse webhook payload
    const webhookData = JSON.parse(bodyText);

    // Log the webhook for debugging
    console.log('📩 Facebook Page webhook received:', JSON.stringify(webhookData, null, 2));

    // Handle the webhook
    const success = await facebookPageService.handleWebhook(webhookData);

    if (success) {
      // Acknowledge receipt of the webhook (Meta requires 200 response)
      return new Response('OK', { status: 200 });
    } else {
      console.error('❌ Failed to process webhook');
      // Still return 200 to prevent Meta from retrying
      return new Response('OK', { status: 200 });
    }
  } catch (error) {
    console.error('❌ Error processing Facebook Page webhook:', error);
    
    // Log error details
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    // Return 200 even on error to prevent Meta from retrying
    // (errors should be handled internally, not by retrying the webhook)
    return new Response('OK', { status: 200 });
  }
};

