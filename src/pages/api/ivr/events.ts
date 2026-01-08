// IVR Events Webhook Handler
// Handles status callbacks from Telnyx for IVR calls

import type { APIRoute } from 'astro';
import { ivrService } from '../../../services/ivr/ivrService';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { event_type, data } = body;

    console.log('IVR event received:', {
      event_type,
      call_control_id: data?.call_control_id,
      from: data?.from,
      to: data?.to,
      timestamp: new Date().toISOString()
    });

    // Find session by call control ID
    const sessions = Array.from((ivrService as any).activeSessions.values());
    const session = sessions.find((s: any) => s.callControlId === data?.call_control_id);

    if (!session) {
      console.warn('Session not found for call control ID:', data?.call_control_id);
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Handle different event types
    switch (event_type) {
      case 'call.answered':
        ivrService.updateSession(session.sessionId, { status: 'in_progress' });
        break;

      case 'call.hangup':
        ivrService.endSession(session.sessionId);
        // Log call completion for analytics
        await logCallCompletion(session, data);
        break;

      case 'call.recording.saved':
        // Store recording URL
        if (data.recording_urls) {
          ivrService.updateSession(session.sessionId, {
            metadata: {
              ...session.metadata,
              recordingUrl: data.recording_urls.completed_calls
            }
          });
        }
        break;

      case 'call.speak.ended':
        // Track TTS completion
        break;

      case 'call.gather.ended':
        // DTMF input already handled in gather endpoint
        break;

      default:
        console.log('Unhandled IVR event:', event_type);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('IVR events error:', error);
    return new Response(JSON.stringify({ error: 'Event processing failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

/**
 * Log call completion for analytics
 */
async function logCallCompletion(session: any, data: any) {
  try {
    // Integration with analytics service
    const callData = {
      sessionId: session.sessionId,
      industry: session.industry,
      duration: data.duration || 0,
      status: session.status,
      collectedData: session.collectedData,
      timestamp: new Date().toISOString()
    };

    // Send to analytics endpoint
    // await fetch('/api/analytics/ivr-calls', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(callData)
    // });

    console.log('Call completion logged:', callData);
  } catch (error) {
    console.error('Error logging call completion:', error);
  }
}

