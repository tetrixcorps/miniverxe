// Call Center Events Handler
// Handles general call center events from Telnyx

import type { APIRoute } from 'astro';
import { getCallCenterService } from '../../../services/callCenter';
import { auditEvidenceService } from '../../../services/compliance';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse form data from Telnyx
    const formData = await request.formData();
    const eventType = formData.get('event_type')?.toString() || '';
    const callControlId = formData.get('call_control_id')?.toString() || '';
    const callSessionId = formData.get('call_session_id')?.toString() || callControlId;

    const callCenterService = getCallCenterService();

    // Handle different event types
    switch (eventType) {
      case 'call.initiated':
        // Already handled in inbound.ts
        break;

      case 'call.answered':
        const call = callCenterService.getCall(callSessionId);
        if (call) {
          callCenterService.updateCallStatus(callSessionId, 'answered');
        }
        break;

      case 'call.hangup':
        const endedCall = callCenterService.getCall(callSessionId);
        if (endedCall) {
          callCenterService.updateCallStatus(callSessionId, 'completed');
        }
        break;

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    // Log audit event
    await auditEvidenceService.logEvent({
      eventType: eventType as any,
      tenantId: 'default',
      sessionId: callSessionId,
      eventData: {
        callControlId,
        eventType
      },
      metadata: {
        service: 'call_center'
      }
    });

    // Return success response
    return new Response('OK', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain'
      }
    });

  } catch (error) {
    console.error('Call center events error:', error);
    return new Response('Error', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  }
};
