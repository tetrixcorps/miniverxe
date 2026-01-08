// Compliant IVR Inbound Webhook Handler
// Handles incoming calls with full compliance orchestration

import type { APIRoute } from 'astro';
import { ivrService } from '../../../services/ivr/ivrService';
import { compliantIVRService, type CompliantCallContext } from '../../../services/compliance/compliantIVRService';
import { auditEvidenceService } from '../../../services/compliance';

export const GET: APIRoute = async ({ request, url }) => {
  try {
    // Parse query parameters from Telnyx
    const from = url.searchParams.get('From') || '';
    const to = url.searchParams.get('To') || '';
    const callControlId = url.searchParams.get('CallControlId') || '';
    
    // Determine tenant and industry from phone number or configuration
    const tenantId = determineTenantId(to, from);
    const industry = determineIndustry(to, from);
    const region = determineRegion(to, from);
    
    // Create IVR configuration
    const config = {
      industry,
      language: 'en-US',
      enableSpeechRecognition: true,
      enableDTMF: true,
      timeout: 10,
      maxRetries: 3,
      webhookUrl: `${url.origin}/api/ivr`
    };

    // Create new IVR session
    const session = ivrService.createSession(config, callControlId, from, to);
    
    // Create compliant call context
    const compliantContext: CompliantCallContext = {
      callId: session.sessionId,
      callControlId,
      tenantId,
      from,
      to,
      industry,
      region,
      language: config.language,
      authenticated: false,
      consentGranted: false,
      previousSteps: []
    };

    // Handle compliant inbound call
    const response = await compliantIVRService.handleCompliantInboundCall(compliantContext);

    console.log('Compliant IVR inbound call:', {
      sessionId: session.sessionId,
      from,
      to,
      industry,
      tenantId,
      region,
      callControlId,
      nextStep: response.nextStep
    });

    return new Response(response.texml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error('Compliant IVR inbound error:', error);
    
    // Log error to audit trail
    try {
      const from = url.searchParams.get('From') || '';
      const to = url.searchParams.get('To') || '';
      const tenantId = determineTenantId(to, from);
      const callControlId = url.searchParams.get('CallControlId') || '';
      
      await auditEvidenceService.logEvent({
        tenantId,
        callId: callControlId,
        eventType: 'error.occurred',
        eventData: {
          error: error instanceof Error ? error.message : 'Unknown error',
          endpoint: 'compliant-inbound'
        }
      });
    } catch (auditError) {
      console.error('Failed to log audit event:', auditError);
    }
    
    // Return error TeXML
    const errorTeXML = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">We're experiencing technical difficulties. Please try again later.</Say>
  <Hangup/>
</Response>`;
    
    return new Response(errorTeXML, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
};

/**
 * Determine tenant ID from phone number or configuration
 */
function determineTenantId(to: string, from: string): string {
  // In production, this would query a database or configuration service
  // For now, use a simple mapping or default tenant
  return 'default';
}

/**
 * Determine industry from phone number or configuration
 */
function determineIndustry(to: string, from: string): string {
  // In production, this would query a database
  if (to.includes('800') || to.includes('855')) {
    return 'healthcare';
  }
  return 'retail';
}

/**
 * Determine region from phone number or configuration
 */
function determineRegion(to: string, from: string): string {
  // In production, this would determine from phone number prefix or configuration
  // For now, default to USA
  return 'USA';
}
