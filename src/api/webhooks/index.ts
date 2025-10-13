// Webhook Handlers for Real-time Updates
// Handles webhooks from Telnyx, Stripe, and Sinch

import { Request, Response } from 'express';
import { smart2FAService } from '../../services/smart2faService';
import { stripeTrialService } from '../../services/stripeTrialService';
import { whatsappOnboardingService } from '../../services/whatsappOnboardingService';
import { crossPlatformSessionService } from '../../services/crossPlatformSessionService';

// Telnyx 2FA Webhooks
export const handleTelnyxWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['telnyx-signature'] as string;
    const payload = JSON.stringify(req.body);

    // Verify webhook signature
    if (!verifyTelnyxSignature(payload, signature)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body;
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
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// Stripe Trial Webhooks
export const handleStripeWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    const payload = req.body;

    // Verify webhook signature
    const event = stripeTrialService.handleWebhook(payload, signature);
    
    console.log('Stripe webhook received:', event.type);

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
};

// Sinch WhatsApp Webhooks
export const handleSinchWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['sinch-signature'] as string;
    const payload = JSON.stringify(req.body);

    // Verify webhook signature
    if (!verifySinchSignature(payload, signature)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    console.log('Sinch webhook received:', event.eventType);

    // Handle WABA events
    if (event.eventType.startsWith('waba.')) {
      await whatsappOnboardingService.handleWABAWebhook({
        eventType: event.eventType,
        wabaId: event.wabaId,
        status: event.status,
        message: event.message,
        timestamp: new Date(event.timestamp),
        metadata: event.metadata
      });
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Sinch webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// Cross-Platform Session Webhooks
export const handleSessionWebhook = async (req: Request, res: Response) => {
  try {
    const { sessionId, action, data } = req.body;

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
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// Private helper functions
function verifyTelnyxSignature(payload: string, signature: string): boolean {
  // Implement Telnyx signature verification
  // This would use the webhook secret to verify the signature
  return true; // Placeholder
}

function verifySinchSignature(payload: string, signature: string): boolean {
  // Implement Sinch signature verification
  // This would use the webhook secret to verify the signature
  return true; // Placeholder
}

async function handleSMSDelivery(event: any): Promise<void> {
  try {
    const { message_id, status, to, from } = event.data.payload;
    
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

async function handleCallAnswered(event: any): Promise<void> {
  try {
    const { call_control_id, to, from } = event.data.payload;
    
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

async function handleCallEnded(event: any): Promise<void> {
  try {
    const { call_control_id, duration, to, from } = event.data.payload;
    
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

async function handleCallRecording(event: any): Promise<void> {
  try {
    const { call_control_id, recording_url } = event.data.payload;
    
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
    console.log(`Platform linked: ${sessionId}`);
    
    // Update session with platform linkage
    await crossPlatformSessionService.linkPlatforms(
      sessionId,
      data.tetrixUserId,
      data.joromiUserId
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
    // This would send real-time updates via WebSocket or Server-Sent Events
    // For now, just log the update
    console.log(`Real-time update: ${type}`, data);
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
