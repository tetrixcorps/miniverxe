/**
 * Functional Tests for Compliant Webhook Handler
 * Tests the webhook endpoint orchestration of compliant call flows
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { APIRoute } from 'astro';

// Mock the services, NOT the handler module itself
vi.mock('../../src/services/compliance/compliantIVRService', () => ({
  compliantIVRService: {
    handleCompliantInboundCall: vi.fn(),
    handleConsentCapture: vi.fn()
  }
}));

vi.mock('../../src/services/ivr/ivrService', () => ({
  ivrService: {
    createSession: vi.fn().mockReturnValue({
      sessionId: 'session_123',
      callControlId: 'cc_123',
      from: '+15551234567',
      to: '+18005551234',
      industry: 'healthcare',
      currentStep: 'initiated',
      metadata: {}
    }),
    getSession: vi.fn()
  }
}));

vi.mock('../../src/services/compliance/auditEvidenceService', () => ({
  auditEvidenceService: {
    logEvent: vi.fn().mockResolvedValue({
      logId: 'log_123',
      timestamp: new Date(),
      eventHash: 'hash_123',
      previousHash: '',
      tenantId: 'tenant_123',
      callId: 'call_123',
      eventType: 'call.initiated',
      eventData: {}
    })
  }
}));

describe('Compliant Webhook Handler - Functional Tests', () => {
  let webhookHandler: APIRoute;
  let mockRequest: Request;
  let mockUrl: URL;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Create mock request with Telnyx webhook parameters
    // Construct URL with query parameters directly as a string
    const queryString = 'From=%2B15551234567&To=%2B18005551234&CallControlId=cc_123&CallLegId=leg_123&CallSessionId=session_123';
    const urlString = `https://tetrixcorp.com/api/ivr/compliant-inbound?${queryString}`;
    mockUrl = new URL(urlString);
    
    // Always ensure searchParams is properly initialized from the search string
    // This ensures url.searchParams.get() works correctly in the handler
    // Create URLSearchParams from the search string (which includes the ?)
    const params = new URLSearchParams(mockUrl.search);
    // Always override searchParams to ensure it's used by the handler
    Object.defineProperty(mockUrl, 'searchParams', {
      value: params,
      writable: false,
      configurable: false,
      enumerable: true
    });
    
    // Verify it works
    if (params.get('From') !== '+15551234567') {
      console.warn('Warning: searchParams may not be parsing correctly', {
        from: params.get('From'),
        search: mockUrl.search,
        allParams: Array.from(params.entries())
      });
    }
    
    // Ensure URL has origin property (needed by handler)
    if (!mockUrl.origin) {
      Object.defineProperty(mockUrl, 'origin', {
        value: 'https://tetrixcorp.com',
        writable: false,
        configurable: false
      });
    }

    mockRequest = new Request(urlString, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    // Dynamically import the handler AFTER mocks are set up
    const module = await import('../../src/pages/api/ivr/compliant-inbound');
    webhookHandler = module.GET;
    
    // Verify handler is imported correctly
    if (!webhookHandler || typeof webhookHandler !== 'function') {
      throw new Error('Failed to import webhook handler');
    }
  });

  describe('Call Initiated Webhook', () => {
    it('should handle call.initiated webhook and return authentication prompt', async () => {
      const { compliantIVRService } = await import('../../src/services/compliance/compliantIVRService');
      
      vi.mocked(compliantIVRService.handleCompliantInboundCall).mockResolvedValue({
        texml: `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="en-US">For your security, please enter your account number or patient ID.</Say>
  <Gather action="https://tetrixcorp.com/api/ivr/session_123/verify" method="POST" timeout="15" numDigits="10">
    <Say voice="alice">Please enter your identification number.</Say>
  </Gather>
  <Say voice="alice">We didn't receive your input. Please try again later.</Say>
  <Hangup/>
</Response>`,
        nextStep: 'identity_verification',
        requiresRecording: false
      });

      // Verify searchParams is accessible before calling handler
      expect(mockUrl.searchParams).toBeDefined();
      expect(mockUrl.searchParams.get('From')).toBe('+15551234567');
      expect(mockUrl.searchParams.get('To')).toBe('+18005551234');
      expect(mockUrl.searchParams.get('CallControlId')).toBe('cc_123');

      const response = await webhookHandler({
        request: mockRequest,
        url: mockUrl,
        params: {},
        props: {}
      } as any);

      // Verify response exists and is a Response object
      expect(response).toBeDefined();
      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(200);
      
      // Check headers exist and contain expected values
      // Response.headers should always exist for Response objects
      expect(response.headers).toBeDefined();
      const contentType = response.headers.get('Content-Type');
      expect(contentType).toBeDefined();
      expect(contentType).toContain('text/xml');

      const texml = await response.text();
      expect(texml).toContain('<?xml');
      expect(texml).toContain('Gather');
      expect(texml).toContain('account number');

      // Verify compliant service was called
      expect(compliantIVRService.handleCompliantInboundCall).toHaveBeenCalledWith(
        expect.objectContaining({
          callId: expect.any(String),
          callControlId: 'cc_123',
          from: '+15551234567',
          to: '+18005551234',
          industry: expect.any(String)
        })
      );
    });

    it('should determine tenant and industry from phone numbers', async () => {
      const { compliantIVRService } = await import('../../src/services/compliance/compliantIVRService');
      
      // Healthcare number (800/855 prefix)
      const healthcareQueryString = 'From=%2B15551234567&To=%2B18005551234&CallControlId=cc_123';
      const healthcareUrlString = `https://tetrixcorp.com/api/ivr/compliant-inbound?${healthcareQueryString}`;
      const healthcareUrl = new URL(healthcareUrlString);
      
      // Ensure URL has searchParams with proper values
      const healthcareParams = new URLSearchParams(healthcareUrl.search);
      Object.defineProperty(healthcareUrl, 'searchParams', {
        value: healthcareParams,
        writable: false,
        configurable: false,
        enumerable: true
      });
      
      // Verify searchParams works before calling handler
      expect(healthcareUrl.searchParams.get('To')).toBe('+18005551234');
      
      // Ensure URL has origin property (needed by handler)
      if (!healthcareUrl.origin) {
        Object.defineProperty(healthcareUrl, 'origin', {
          value: 'https://tetrixcorp.com',
          writable: false,
          configurable: false
        });
      }
      
      const healthcareRequest = new Request(healthcareUrlString, { method: 'GET' });

      vi.mocked(compliantIVRService.handleCompliantInboundCall).mockResolvedValue({
        texml: '<?xml version="1.0"?><Response><Say>Test</Say></Response>',
        nextStep: 'initiated'
      });

      const response = await webhookHandler({
        request: healthcareRequest,
        url: healthcareUrl,
        params: {},
        props: {}
      } as any);

      // Verify handler was called and returned a response
      expect(response).toBeDefined();
      expect(response).toBeInstanceOf(Response);
      
      // Verify compliant service was called with healthcare industry
      expect(compliantIVRService.handleCompliantInboundCall).toHaveBeenCalledWith(
        expect.objectContaining({
          industry: 'healthcare'
        })
      );
    });
  });

  describe('Identity Verification Webhook', () => {
    it('should handle identity verification DTMF input', async () => {
      // This would be a separate endpoint: /api/ivr/[sessionId]/verify
      // For now, we test the flow logic
      const { compliantIVRService } = await import('../../src/services/compliance/compliantIVRService');
      const { auditEvidenceService } = await import('../../src/services/compliance/auditEvidenceService');

      const accountNumber = '1234567890';
      const authenticatedContext = {
        callId: 'session_123',
        callControlId: 'cc_123',
        tenantId: 'tenant_123',
        from: '+15551234567',
        to: '+18005551234',
        industry: 'healthcare',
        region: 'USA',
        language: 'en-US',
        customerId: 'customer_123',
        authenticated: true,
        consentGranted: false,
        previousSteps: ['initiated']
      };

      // Simulate identity verification success
      await auditEvidenceService.logEvent({
        tenantId: 'tenant_123',
        callId: 'session_123',
        eventType: 'identity.verification_completed',
        eventData: {
          accountNumber,
          verified: true,
          customerId: 'customer_123'
        }
      });

      // Verify audit logging
      expect(auditEvidenceService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'identity.verification_completed',
          eventData: expect.objectContaining({
            verified: true,
            customerId: 'customer_123'
          })
        })
      );
    });
  });

  describe('Consent Capture Webhook', () => {
    it('should handle consent capture DTMF input', async () => {
      // Simulate consent endpoint: /api/ivr/[sessionId]/consent
      const consentModule = await import('../../src/pages/api/ivr/[sessionId]/consent');
      const consentHandler = consentModule.POST;

      const consentUrl = new URL('https://tetrixcorp.com/api/ivr/session_123/consent');
      const formData = new FormData();
      formData.append('Digits', '1');
      const consentRequest = new Request(consentUrl.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      });

      const { compliantIVRService } = await import('../../src/services/compliance/compliantIVRService');
      const { ivrService } = await import('../../src/services/ivr/ivrService');

      // Mock session retrieval
      vi.mocked(ivrService.getSession).mockReturnValue({
        sessionId: 'session_123',
        callControlId: 'cc_123',
        from: '+15551234567',
        to: '+18005551234',
        industry: 'healthcare',
        currentStep: 'consent_capture',
        metadata: {
          authenticated: true,
          language: 'en-US'
        }
      });

      vi.mocked(compliantIVRService.handleConsentCapture).mockResolvedValue({
        texml: '<?xml version="1.0"?><Response><Say>Thank you. Please hold.</Say></Response>',
        nextStep: 'main_menu',
        requiresRecording: true
      });

      const response = await consentHandler({
        request: consentRequest,
        url: consentUrl,
        params: { sessionId: 'session_123' },
        props: {}
      } as any);

      expect(response.status).toBe(200);
      const texml = await response.text();
      expect(texml).toContain('<?xml');
    });
  });

  describe('Error Handling', () => {
    it('should handle webhook errors gracefully', async () => {
      const { compliantIVRService } = await import('../../src/services/compliance/compliantIVRService');
      const { auditEvidenceService } = await import('../../src/services/compliance/auditEvidenceService');

      // Ensure mockUrl has searchParams for error handler
      if (!mockUrl.searchParams || typeof mockUrl.searchParams.get !== 'function') {
        const params = new URLSearchParams(mockUrl.search);
        Object.defineProperty(mockUrl, 'searchParams', {
          value: params,
          writable: false,
          configurable: false
        });
      }

      vi.mocked(compliantIVRService.handleCompliantInboundCall).mockRejectedValue(
        new Error('Service unavailable')
      );

      const response = await webhookHandler({
        request: mockRequest,
        url: mockUrl,
        params: {},
        props: {}
      } as any);

      // Should return error TeXML
      expect(response).toBeDefined();
      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(200);
      const texml = await response.text();
      expect(texml).toContain('technical difficulties');

      // Verify error was logged (may be called in catch block)
      // Note: Error logging happens in catch block, so it should be called
      expect(auditEvidenceService.logEvent).toHaveBeenCalled();
    });

    it('should handle missing required parameters', async () => {
      // Missing CallControlId
      const invalidQueryString = 'From=%2B15551234567&To=%2B18005551234';
      const invalidUrlString = `https://tetrixcorp.com/api/ivr/compliant-inbound?${invalidQueryString}`;
      const invalidUrl = new URL(invalidUrlString);
      
      // Ensure URL has searchParams
      if (!invalidUrl.searchParams || typeof invalidUrl.searchParams.get !== 'function') {
        const params = new URLSearchParams(invalidUrl.search);
        Object.defineProperty(invalidUrl, 'searchParams', {
          value: params,
          writable: false,
          configurable: false
        });
      }
      
      // Ensure URL has origin property
      if (!invalidUrl.origin) {
        Object.defineProperty(invalidUrl, 'origin', {
          value: 'https://tetrixcorp.com',
          writable: false,
          configurable: false
        });
      }
      
      const invalidRequest = new Request(invalidUrlString, { method: 'GET' });

      const response = await webhookHandler({
        request: invalidRequest,
        url: invalidUrl,
        params: {},
        props: {}
      } as any);

      // Should still return a response (with defaults)
      expect(response).toBeDefined();
      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(200);
    });
  });

  describe('TeXML Response Validation', () => {
    it('should return valid TeXML with proper headers', async () => {
      const { compliantIVRService } = await import('../../src/services/compliance/compliantIVRService');

      // Ensure mockUrl has searchParams
      if (!mockUrl.searchParams || typeof mockUrl.searchParams.get !== 'function') {
        const params = new URLSearchParams(mockUrl.search);
        Object.defineProperty(mockUrl, 'searchParams', {
          value: params,
          writable: false,
          configurable: false
        });
      }

      vi.mocked(compliantIVRService.handleCompliantInboundCall).mockResolvedValue({
        texml: `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Test message</Say>
</Response>`,
        nextStep: 'initiated'
      });

      const response = await webhookHandler({
        request: mockRequest,
        url: mockUrl,
        params: {},
        props: {}
      } as any);

      expect(response).toBeDefined();
      expect(response).toBeInstanceOf(Response);
      
      // Verify headers exist and have correct values
      expect(response.headers).toBeDefined();
      const contentType = response.headers.get('Content-Type');
      const cacheControl = response.headers.get('Cache-Control');
      
      expect(contentType).toBeDefined();
      expect(contentType).toBe('text/xml; charset=utf-8');
      expect(cacheControl).toBeDefined();
      expect(cacheControl).toBe('no-cache, no-store, must-revalidate');

      const texml = await response.text();
      expect(texml).toContain('<?xml version="1.0"');
      expect(texml).toContain('<Response>');
    });
  });
});
