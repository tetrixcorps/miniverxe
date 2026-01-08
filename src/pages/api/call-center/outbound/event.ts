// Call Center Outbound Event Handler
// Handles events from agent SIP connections (answered, busy, no answer)

import type { APIRoute } from 'astro';
import { getCallCenterService, initializeCallCenterService } from '../../../../services/callCenter';
import { getAgentManagementService } from '../../../../services/callCenter/agentManagementService';
import { auditEvidenceService } from '../../../../services/compliance';
import { getEnvironmentConfig } from '../../../../config/environment';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse form data from Telnyx
    // Support both multipart/form-data (FormData) and application/x-www-form-urlencoded
    let eventType = '';
    let callControlId = '';
    let callSessionId = '';
    let connectionId = '';
    let recordingUrl = '';
    
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/x-www-form-urlencoded')) {
      // URL-encoded form data (used in tests for jsdom compatibility)
      try {
        const text = await request.text();
        if (text) {
          const params = new URLSearchParams(text);
          eventType = params.get('event_type') || '';
          callControlId = params.get('call_control_id') || '';
          callSessionId = params.get('call_session_id') || callControlId;
          connectionId = params.get('connection_id') || '';
          recordingUrl = params.get('recording_url') || '';
        }
      } catch (error) {
        console.error('Failed to parse URL-encoded form data:', error);
      }
    } else {
      // Multipart form data (FormData) - production use case
      try {
        const formData = await request.formData();
        
        // Extract values from FormData - handle both string and File types
        const eventTypeValue = formData.get('event_type');
        const callControlIdValue = formData.get('call_control_id');
        const callSessionIdValue = formData.get('call_session_id');
        const connectionIdValue = formData.get('connection_id');
        const recordingUrlValue = formData.get('recording_url');
        
        eventType = eventTypeValue instanceof File ? '' : (eventTypeValue ? String(eventTypeValue) : '');
        callControlId = callControlIdValue instanceof File ? '' : (callControlIdValue ? String(callControlIdValue) : '');
        callSessionId = callSessionIdValue instanceof File ? callControlId : (callSessionIdValue ? String(callSessionIdValue) : callControlId);
        connectionId = connectionIdValue instanceof File ? '' : (connectionIdValue ? String(connectionIdValue) : '');
        recordingUrl = recordingUrlValue instanceof File ? '' : (recordingUrlValue ? String(recordingUrlValue) : '');
      } catch (error) {
        console.error('Failed to parse FormData:', error);
      }
    }

    // Get call center service (must be initialized before handlers run)
    let callCenterService;
    try {
      callCenterService = getCallCenterService();
    } catch (error) {
      // Service not initialized - return error response
      console.error('Call center service not initialized:', error);
      const errorHeaders = new Headers();
      errorHeaders.set('Content-Type', 'text/plain');
      return new Response('Service not initialized', {
        status: 500,
        headers: errorHeaders
      });
    }

    // Get agent service (may not be initialized in test environment)
    let agentService;
    let agentId: string | undefined;
    try {
      agentService = getAgentManagementService();
      // Find agent by SIP connection ID
      try {
        const allAgents = agentService.getAllAgents();
        const agent = allAgents.find(a => a.sipConnectionId === connectionId);
        if (agent) {
          agentId = agent.agentId;
        }
      } catch (error) {
        console.warn('Failed to find agent by connection ID:', error);
        // Continue without agentId - handler should still work
      }
    } catch (error) {
      console.warn('Agent management service not available:', error);
      // Continue without agent service - handler should still work
    }

    const call = callCenterService.getCall(callSessionId);

    // Handle different event types
    switch (eventType) {
      case 'call.answered':
        if (call) {
          callCenterService.updateCallStatus(callSessionId, 'answered', agentId);
          if (agentId && agentService) {
            try {
              agentService.setAgentStatus(agentId, 'busy');
              agentService.updateCallMetrics(agentId, true);
            } catch (error) {
              console.warn('Failed to update agent status:', error);
            }
          }
        }
        
        // Log audit event (don't fail if this fails)
        try {
          await auditEvidenceService.logEvent({
            eventType: 'call.answered',
            tenantId: 'default',
            sessionId: callSessionId,
            eventData: {
              callControlId,
              agentId,
              connectionId
            },
            metadata: {
              service: 'call_center',
              event: 'answered'
            }
          });
        } catch (error) {
          console.warn('Failed to log audit event:', error);
        }
        break;

      case 'call.bridged':
        // Call was bridged to agent
        if (call && agentId) {
          call.agentId = agentId;
        }
        break;

      case 'call.hangup':
        if (call) {
          call.status = 'completed';
          call.endTime = new Date();
          if (recordingUrl) {
            call.recordingUrl = recordingUrl;
          }
        }
        
        if (agentId && agentService) {
          try {
            agentService.setAgentStatus(agentId, 'available');
          } catch (error) {
            console.warn('Failed to update agent status:', error);
          }
        }

        // Log audit event (don't fail if this fails)
        try {
          await auditEvidenceService.logEvent({
            eventType: 'call.completed',
            tenantId: 'default',
            sessionId: callSessionId,
            eventData: {
              callControlId,
              agentId,
              recordingUrl: recordingUrl ? '[URL]' : undefined
            },
            metadata: {
              service: 'call_center',
              event: 'hangup'
            }
          });
        } catch (error) {
          console.warn('Failed to log audit event:', error);
        }
        break;

      case 'call.failed':
        if (call) {
          callCenterService.updateCallStatus(callSessionId, 'failed');
        }
        break;

      default:
        // Log unhandled event types for debugging
        if (eventType) {
          console.log(`Unhandled event type: ${eventType}`);
        } else {
          console.warn('Received empty event type - FormData may not have been parsed correctly');
        }
    }

    // Return success response
    const headers = new Headers();
    headers.set('Content-Type', 'text/plain');
    return new Response('OK', {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Outbound event error:', error);
    const errorHeaders = new Headers();
    errorHeaders.set('Content-Type', 'text/plain');
    return new Response('Error', {
      status: 500,
      headers: errorHeaders
    });
  }
};
