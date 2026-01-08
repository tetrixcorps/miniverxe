// Telnyx Call Events Webhook Handler
// Receives real-time call events from Telnyx and updates campaign metrics

import type { APIRoute } from 'astro';
import { predictiveDialerService } from '../../../services/telemarketing/predictiveDialerService';
import { campaignManagementService } from '../../../services/telemarketing/campaignManagementService';

export const POST: APIRoute = async ({ request }) => {
  try {
    const event = await request.json();
    
    // Parse client_state to get campaign info
    let tenantId = 'default';
    let campaignId = '';
    let contactId = '';
    let callId = '';

    if (event.data?.client_state) {
      try {
        const clientState = typeof event.data.client_state === 'string' 
          ? JSON.parse(event.data.client_state)
          : event.data.client_state;
        tenantId = clientState.tenantId || tenantId;
        campaignId = clientState.campaignId || '';
        contactId = clientState.contactId || '';
        callId = clientState.callId || '';
      } catch (e) {
        console.warn('Failed to parse client_state:', e);
      }
    }

    // Handle call event via predictive dialer
    const dialer = predictiveDialerService.getInstance();
    await dialer.handleCallEvent(tenantId, event);

    // Record outcome if call completed
    if (event.event_type === 'call.hangup' && campaignId) {
      const call = dialer.getCall(callId);
      if (call) {
        let outcome: 'answered' | 'voicemail' | 'no_answer' | 'busy' | 'failed' = 'failed';
        
        switch (call.status) {
          case 'answered':
          case 'completed':
            outcome = 'answered';
            break;
          case 'voicemail':
            outcome = 'voicemail';
            break;
          case 'no_answer':
            outcome = 'no_answer';
            break;
          case 'busy':
            outcome = 'busy';
            break;
        }

        await campaignManagementService.recordCallOutcome(tenantId, campaignId, {
          callId: call.callId,
          campaignId,
          contactId,
          phoneNumber: call.phoneNumber,
          outcome,
          agentId: call.connectedToAgent,
          duration: call.duration
        });
      }
    }

    // Return 200 to acknowledge receipt
    return new Response(JSON.stringify({ status: 'received' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Call event handling error:', error);
    
    // Still return 200 to Telnyx (don't want webhook retries)
    return new Response(JSON.stringify({ status: 'error', message: 'Internal error' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
