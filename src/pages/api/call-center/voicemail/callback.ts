// Call Center Voicemail Callback Handler
// Handles voicemail recording completion and transcription

import type { APIRoute } from 'astro';
import { getCallCenterService, initializeCallCenterService } from '../../../../services/callCenter';
import { auditEvidenceService } from '../../../../services/compliance';
import { getEnvironmentConfig } from '../../../../config/environment';

export const POST: APIRoute = async ({ request, url }) => {
  try {
    const callId = url.searchParams.get('callId') || '';
    
    // Parse form data from Telnyx
    let recordingUrl = '';
    let recordingDuration = '';
    let transcriptionText = '';
    
    // Support both multipart/form-data (FormData) and application/x-www-form-urlencoded
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/x-www-form-urlencoded')) {
      // URL-encoded form data (used in tests for jsdom compatibility)
      try {
        const text = await request.text();
        if (text) {
          const params = new URLSearchParams(text);
          recordingUrl = params.get('RecordingUrl') || '';
          recordingDuration = params.get('RecordingDuration') || '';
          transcriptionText = params.get('TranscriptionText') || '';
        }
      } catch (error) {
        console.error('Failed to parse URL-encoded form data:', error);
      }
    } else {
      // Multipart form data (FormData) - production use case
      try {
        const formData = await request.formData();
        
        // Extract values from FormData - handle both string and File types
        const recordingUrlValue = formData.get('RecordingUrl');
        const recordingDurationValue = formData.get('RecordingDuration');
        const transcriptionTextValue = formData.get('TranscriptionText');
        
        recordingUrl = recordingUrlValue instanceof File ? '' : (recordingUrlValue ? String(recordingUrlValue) : '');
        recordingDuration = recordingDurationValue instanceof File ? '' : (recordingDurationValue ? String(recordingDurationValue) : '');
        transcriptionText = transcriptionTextValue instanceof File ? '' : (transcriptionTextValue ? String(transcriptionTextValue) : '');
      } catch (error) {
        console.error('Failed to parse FormData:', error);
        // Continue processing - call status should still be updated
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

    const call = callCenterService.getCall(callId);

    if (call) {
      call.voicemailUrl = recordingUrl;
      call.status = 'voicemail';
      call.endTime = new Date();
    }

    // Log audit event (don't fail if this fails)
    try {
      await auditEvidenceService.logEvent({
        eventType: 'recording.completed',
        tenantId: 'default',
        sessionId: callId,
        eventData: {
          recordingUrl,
          recordingDuration,
          transcriptionText: transcriptionText ? '[REDACTED]' : undefined, // Redact transcription
          callType: 'voicemail'
        },
        metadata: {
          service: 'call_center',
          type: 'voicemail'
        }
      });
    } catch (error) {
      console.warn('Failed to log audit event:', error);
    }

    // Return success response (Telnyx may not need a response, but good practice)
    const headers = new Headers();
    headers.set('Content-Type', 'text/plain');
    return new Response('OK', {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Voicemail callback error:', error);
    const errorHeaders = new Headers();
    errorHeaders.set('Content-Type', 'text/plain');
    return new Response('Error', {
      status: 500,
      headers: errorHeaders
    });
  }
};
