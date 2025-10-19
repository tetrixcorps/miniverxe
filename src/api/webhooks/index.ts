// Webhook Handlers for Real-time Updates
// Handles webhooks from Telnyx, Stripe, and Sinch

import type { Request, Response } from 'express';
import * as crypto from 'crypto';
import { smart2FAService } from '../../services/smart2faService';
import { stripeTrialService } from '../../services/stripeTrialService';
import { whatsappOnboardingService } from '../../services/whatsappOnboardingService';
import { crossPlatformSessionService } from '../../services/crossPlatformSessionService';

// Type definitions for webhook events
interface TelnyxEvent {
  data: {
    event_type: string;
    payload: {
      message_id?: string;
      status?: string;
      to?: string;
      from?: string;
      call_control_id?: string;
      duration?: number;
      recording_url?: string;
    };
  };
}

interface SinchEvent {
  eventType: string;
  wabaId?: string;
  status?: string;
  message?: string;
  timestamp?: string;
  metadata?: any;
}

interface SessionEvent {
  sessionId: string;
  action: string;
  data?: any;
}

// Telnyx 2FA Webhooks
export const handleTelnyxWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['telnyx-signature'] as string;
    const payload = JSON.stringify(req.body);

    // Validate required headers
    if (!signature) {
      console.error('Missing Telnyx signature header');
      return res.status(400).json({ error: 'Missing signature header' });
    }

    // Verify webhook signature
    if (!verifyTelnyxSignature(payload, signature)) {
      console.error('Invalid Telnyx webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    
    // Validate event structure
    if (!event || !event.data || !event.data.event_type) {
      console.error('Invalid Telnyx webhook event structure:', event);
      return res.status(400).json({ error: 'Invalid event structure' });
    }

    console.log('Telnyx webhook received:', event.data.event_type);

    // Handle different event types
    switch (event.data.event_type) {
      case 'message.finalized':
        await handleSMSDelivery(event);
        break;
      case 'call.answered':
        await handleCallAnswered(event);
        break;
      case 'call.hangup':
        await handleCallEnded(event);
        break;
      case 'call.recording.saved':
        await handleCallRecording(event);
        break;
      default:
        console.log('Unhandled Telnyx event:', event.data.event_type);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Telnyx webhook error:', error);
    res.status(500).json({ 
      error: 'Webhook processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Enhanced Stripe Webhooks with Dual Invoice Delivery
export const handleStripeWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    const payload = JSON.stringify(req.body);

    // Import enhanced webhook service
    const { enhancedStripeWebhookService } = await import('../../services/enhancedStripeWebhookService');
    
    // Process webhook with enhanced service
    const result = await enhancedStripeWebhookService.handleWebhook(payload, signature);
    
    console.log('Enhanced Stripe webhook processed:', {
      success: result.success,
      eventType: result.eventType,
      invoiceId: result.invoiceId,
      customerId: result.customerId
    });

    if (result.success) {
      res.status(200).json({ 
        received: true, 
        eventType: result.eventType,
        invoiceId: result.invoiceId,
        customerId: result.customerId
      });
    } else {
      res.status(400).json({ 
        error: 'Webhook processing failed',
        details: result.error
      });
    }
  } catch (error) {
    console.error('Enhanced Stripe webhook error:', error);
    res.status(500).json({ 
      error: 'Webhook processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Sinch WhatsApp Webhooks
export const handleSinchWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['sinch-signature'] as string;
    const payload = JSON.stringify(req.body);

    // Validate required headers
    if (!signature) {
      console.error('Missing Sinch signature header');
      return res.status(400).json({ error: 'Missing signature header' });
    }

    // Verify webhook signature
    if (!verifySinchSignature(payload, signature)) {
      console.error('Invalid Sinch webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    
    // Validate event structure
    if (!event || !event.eventType) {
      console.error('Invalid Sinch webhook event structure:', event);
      return res.status(400).json({ error: 'Invalid event structure' });
    }

    console.log('Sinch webhook received:', event.eventType);

    // Handle WABA events
    if (event.eventType.startsWith('waba.')) {
      try {
        await whatsappOnboardingService.handleWABAWebhook({
          eventType: event.eventType,
          wabaId: event.wabaId,
          status: event.status,
          message: event.message,
          timestamp: new Date(event.timestamp),
          metadata: event.metadata
        });
      } catch (webhookError) {
        console.error('Failed to handle WABA webhook:', webhookError);
        // Don't fail the entire request for WABA processing errors
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Sinch webhook error:', error);
    res.status(500).json({ 
      error: 'Webhook processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Cross-Platform Session Webhooks
export const handleSessionWebhook = async (req: Request, res: Response) => {
  try {
    const { sessionId, action, data } = req.body;

    // Validate required fields
    if (!sessionId || !action) {
      console.error('Missing required fields in session webhook:', { sessionId, action });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('Session webhook received:', { sessionId, action });

    switch (action) {
      case 'session_created':
        await handleSessionCreated(sessionId, data);
        break;
      case 'session_authenticated':
        await handleSessionAuthenticated(sessionId, data);
        break;
      case 'session_expired':
        await handleSessionExpired(sessionId, data);
        break;
      case 'platform_linked':
        await handlePlatformLinked(sessionId, data);
        break;
      default:
        console.log('Unhandled session event:', action);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Session webhook error:', error);
    res.status(500).json({ 
      error: 'Webhook processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Private helper functions
function verifyTelnyxSignature(payload: string, signature: string): boolean {
  try {
    const webhookSecret = process.env.TELNYX_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('TELNYX_WEBHOOK_SECRET not configured');
      return false;
    }

    // Telnyx uses HMAC-SHA256 for webhook signature verification
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload, 'utf8')
      .digest('hex');

    // Compare signatures using constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('Telnyx signature verification failed:', error);
    return false;
  }
}

function verifySinchSignature(payload: string, signature: string): boolean {
  try {
    const webhookSecret = process.env.SINCH_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('SINCH_WEBHOOK_SECRET not configured');
      return false;
    }

    // Sinch uses HMAC-SHA256 for webhook signature verification
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload, 'utf8')
      .digest('hex');

    // Compare signatures using constant-time comparison
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('Sinch signature verification failed:', error);
    return false;
  }
}

async function handleSMSDelivery(event: TelnyxEvent): Promise<void> {
  try {
    const { message_id, status, to, from } = event.data.payload;
    
    if (!message_id || !status) {
      console.error('Invalid SMS delivery event data:', event.data.payload);
      return;
    }
    
    console.log(`SMS delivery status: ${status} for message ${message_id}`);
    
    // Update 2FA session status
    // This would update the database with delivery status
    
    // Send real-time update to frontend if needed
    await sendRealtimeUpdate('sms_delivery', {
      messageId: message_id,
      status,
      to,
      from
    });
  } catch (error) {
    console.error('Failed to handle SMS delivery:', error);
  }
}

async function handleCallAnswered(event: TelnyxEvent): Promise<void> {
  try {
    const { call_control_id, to, from } = event.data.payload;
    
    if (!call_control_id) {
      console.error('Invalid call answered event data:', event.data.payload);
      return;
    }
    
    console.log(`Call answered: ${call_control_id}`);
    
    // Update 2FA session status
    // This would update the database with call status
    
    // Send real-time update to frontend if needed
    await sendRealtimeUpdate('call_answered', {
      callId: call_control_id,
      to,
      from
    });
  } catch (error) {
    console.error('Failed to handle call answered:', error);
  }
}

async function handleCallEnded(event: TelnyxEvent): Promise<void> {
  try {
    const { call_control_id, duration, to, from } = event.data.payload;
    
    if (!call_control_id) {
      console.error('Invalid call ended event data:', event.data.payload);
      return;
    }
    
    console.log(`Call ended: ${call_control_id}, duration: ${duration}s`);
    
    // Update 2FA session status
    // This would update the database with call completion
    
    // Send real-time update to frontend if needed
    await sendRealtimeUpdate('call_ended', {
      callId: call_control_id,
      duration,
      to,
      from
    });
  } catch (error) {
    console.error('Failed to handle call ended:', error);
  }
}

async function handleCallRecording(event: TelnyxEvent): Promise<void> {
  try {
    const { call_control_id, recording_url } = event.data.payload;
    
    if (!call_control_id || !recording_url) {
      console.error('Invalid call recording event data:', event.data.payload);
      return;
    }
    
    console.log(`Call recording saved: ${call_control_id}`);
    
    // Store recording URL in database
    // This would save the recording URL for future reference
    
    // Send real-time update to frontend if needed
    await sendRealtimeUpdate('call_recording', {
      callId: call_control_id,
      recordingUrl: recording_url
    });
  } catch (error) {
    console.error('Failed to handle call recording:', error);
  }
}

async function handleSessionCreated(sessionId: string, data: any): Promise<void> {
  try {
    if (!sessionId) {
      console.error('Invalid session created event: missing sessionId');
      return;
    }
    
    console.log(`Session created: ${sessionId}`);
    
    // Log session creation
    // This would log the session creation event
    
    // Send real-time update to frontend if needed
    await sendRealtimeUpdate('session_created', {
      sessionId,
      data
    });
  } catch (error) {
    console.error('Failed to handle session created:', error);
  }
}

async function handleSessionAuthenticated(sessionId: string, data: any): Promise<void> {
  try {
    if (!sessionId) {
      console.error('Invalid session authenticated event: missing sessionId');
      return;
    }
    
    console.log(`Session authenticated: ${sessionId}`);
    
    // Update session status
    // This would update the session as authenticated
    
    // Send real-time update to frontend if needed
    await sendRealtimeUpdate('session_authenticated', {
      sessionId,
      data
    });
  } catch (error) {
    console.error('Failed to handle session authenticated:', error);
  }
}

async function handleSessionExpired(sessionId: string, data: any): Promise<void> {
  try {
    if (!sessionId) {
      console.error('Invalid session expired event: missing sessionId');
      return;
    }
    
    console.log(`Session expired: ${sessionId}`);
    
    // Clean up session
    await crossPlatformSessionService.destroySession(sessionId);
    
    // Send real-time update to frontend if needed
    await sendRealtimeUpdate('session_expired', {
      sessionId,
      data
    });
  } catch (error) {
    console.error('Failed to handle session expired:', error);
  }
}

async function handlePlatformLinked(sessionId: string, data: any): Promise<void> {
  try {
    if (!sessionId) {
      console.error('Invalid platform linked event: missing sessionId');
      return;
    }
    
    console.log(`Platform linked: ${sessionId}`);
    
    // Update session with platform linkage
    await crossPlatformSessionService.linkPlatforms(
      sessionId,
      data?.tetrixUserId,
      data?.joromiUserId
    );
    
    // Send real-time update to frontend if needed
    await sendRealtimeUpdate('platform_linked', {
      sessionId,
      data
    });
  } catch (error) {
    console.error('Failed to handle platform linked:', error);
  }
}

async function sendRealtimeUpdate(type: string, data: any): Promise<void> {
  try {
    if (!type) {
      console.error('Invalid real-time update: missing type');
      return;
    }
    
    // This would send real-time updates via WebSocket or Server-Sent Events
    // For now, just log the update
    console.log(`Real-time update: ${type}`, data);
    
    // TODO: Implement actual real-time update mechanism
    // This could integrate with:
    // - WebSocket server
    // - Server-Sent Events
    // - Push notifications
    // - Message queue (Redis, RabbitMQ, etc.)
  } catch (error) {
    console.error('Failed to send real-time update:', error);
  }
}

// Webhook endpoint registration
export const webhookEndpoints = {
  '/webhooks/telnyx/sms': handleTelnyxWebhook,
  '/webhooks/telnyx/voice': handleTelnyxWebhook,
  '/webhooks/stripe/trial': handleStripeWebhook,
  '/webhooks/sinch/waba': handleSinchWebhook,
  '/webhooks/session': handleSessionWebhook
};
