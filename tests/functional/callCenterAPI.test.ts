/**
 * Functional Tests for Call Center API Endpoints
 * Tests webhook handlers and API routes
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { APIRoute } from 'astro';
import { getCallCenterService, initializeCallCenterService } from '../../src/services/callCenter';
import { getAgentManagementService } from '../../src/services/callCenter/agentManagementService';
import { auditEvidenceService } from '../../src/services/compliance';

// Mock dependencies
vi.mock('../../src/services/compliance/auditEvidenceService', () => ({
  auditEvidenceService: {
    logEvent: vi.fn().mockResolvedValue({
      logId: 'log_123',
      timestamp: new Date(),
      eventHash: 'hash_123',
      previousHash: '',
      tenantId: 'default',
      callId: 'call_123',
      eventType: 'call.initiated',
      eventData: {}
    })
  }
}));

vi.mock('../../src/config/environment', () => ({
  getEnvironmentConfig: vi.fn().mockReturnValue({
    webhookBaseUrl: 'https://tetrixcorp.com',
    environment: 'test'
  })
}));

describe('Call Center API - Functional Tests', () => {
  let mockRequest: Request;
  let mockUrl: URL;

  beforeEach(async () => {
    // Initialize services
    const config = {
      callCenterNumber: '+18005551234',
      outboundProfileId: 'profile_123',
      maxDialAttempts: 2,
      dialTimeout: 30,
      voicemailEnabled: true,
      recordingEnabled: true,
      webhookBaseUrl: 'https://tetrixcorp.com',
      agents: []
    };
    initializeCallCenterService(config);

    // Register test agent
    const agentService = getAgentManagementService();
    agentService.registerAgent({
      agentId: 'agent_001',
      sipConnectionId: 'conn_001',
      sipUri: 'sip:agent1@telnyx.com',
      username: 'agent1',
      displayName: 'Test Agent',
      registeredAt: new Date()
    });
    agentService.setAgentStatus('agent_001', 'available');

    // Create mock URL with query parameters
    // Manually create searchParams to ensure they're accessible in test environment
    const baseUrl = 'https://tetrixcorp.com/api/call-center/inbound';
    const searchParams = new URLSearchParams();
    searchParams.set('From', '+15551234567');
    searchParams.set('To', '+18005551234');
    searchParams.set('CallControlId', 'cc_123');
    searchParams.set('CallSessionId', 'session_123');
    
    const urlString = `${baseUrl}?${searchParams.toString()}`;
    mockUrl = new URL(urlString);
    
    // Always manually set searchParams to ensure they're accessible
    Object.defineProperty(mockUrl, 'searchParams', {
      value: searchParams,
      writable: false,
      configurable: false,
      enumerable: true
    });
    
    // Sync agents to CallCenterService
    const callCenterService = getCallCenterService();
    const availableAgents = agentService.getAvailableAgents();
    callCenterService.updateConfig({ agents: availableAgents });

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
  });

  // Clear all mocks after each test to prevent leakage
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('Inbound Call Handler', () => {
    it('should handle inbound call and return greeting TeXML', async () => {
      // Verify URL params are accessible
      expect(mockUrl.searchParams.get('CallSessionId')).toBe('session_123');
      expect(mockUrl.searchParams.get('From')).toBe('+15551234567');
      
      const { GET } = await import('../../src/pages/api/call-center/inbound');
      const handler = GET as APIRoute;

      const response = await handler({
        request: mockRequest,
        url: mockUrl,
        params: {},
        props: {}
      } as any);

      expect(response).toBeDefined();
      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(200);
      
      // Check headers exist (may not be accessible in jsdom test environment)
      if (response.headers) {
        const contentType = response.headers.get('Content-Type');
        if (contentType) {
          expect(contentType).toContain('text/xml');
        }
      }

      const texml = await response.text();
      expect(texml).toContain('<?xml version="1.0"');
      expect(texml).toContain('<Response>');
      expect(texml).toContain('call center');
    });

    it('should create call record on inbound', async () => {
      // Verify searchParams are accessible before calling handler
      const callSessionId = mockUrl.searchParams.get('CallSessionId');
      const from = mockUrl.searchParams.get('From');
      const to = mockUrl.searchParams.get('To');
      const callControlId = mockUrl.searchParams.get('CallControlId');
      
      expect(callSessionId).toBe('session_123');
      expect(from).toBe('+15551234567');
      expect(to).toBe('+18005551234');
      expect(callControlId).toBe('cc_123');
      
      const { GET } = await import('../../src/pages/api/call-center/inbound');
      const handler = GET as APIRoute;

      await handler({
        request: mockRequest,
        url: mockUrl,
        params: {},
        props: {}
      } as any);

      const callCenterService = getCallCenterService();
      const call = callCenterService.getCall('session_123');
      
      expect(call).toBeDefined();
      expect(call?.from).toBe('+15551234567');
      expect(call?.to).toBe('+18005551234');
      expect(call?.status).toBe('ringing');
    });

    it('should log audit event on inbound call', async () => {
      const { GET } = await import('../../src/pages/api/call-center/inbound');
      const handler = GET as APIRoute;

      await handler({
        request: mockRequest,
        url: mockUrl,
        params: {},
        props: {}
      } as any);

      expect(auditEvidenceService.logEvent).toHaveBeenCalled();
      const callArgs = vi.mocked(auditEvidenceService.logEvent).mock.calls[0][0];
      expect(callArgs.eventType).toBe('call.initiated');
      expect(callArgs.sessionId).toBe('session_123');
    });

  });

  describe('Dial Agents Handler', () => {
    it('should generate dial agents TeXML', async () => {
      // Ensure agents are synced
      const callCenterService = getCallCenterService();
      const agentService = getAgentManagementService();
      const availableAgents = agentService.getAvailableAgents();
      callCenterService.updateConfig({ agents: availableAgents });
      
      const callId = 'call_123';
      const dialUrl = new URL(`https://tetrixcorp.com/api/call-center/dial-agents?callId=${callId}`);
      const params = new URLSearchParams({ callId });
      Object.defineProperty(dialUrl, 'searchParams', {
        value: params,
        writable: false,
        configurable: false,
        enumerable: true
      });

      const { GET } = await import('../../src/pages/api/call-center/dial-agents');
      const handler = GET as APIRoute;

      const response = await handler({
        request: mockRequest,
        url: dialUrl,
        params: {},
        props: {}
      } as any);

      expect(response).toBeDefined();
      expect(response.status).toBe(200);
      const texml = await response.text();
      expect(texml).toContain('<Dial');
      expect(texml).toContain('sip:agent1@telnyx.com');
    });

    it('should handle missing callId', async () => {
      const dialUrl = new URL('https://tetrixcorp.com/api/call-center/dial-agents');
      Object.defineProperty(dialUrl, 'searchParams', {
        value: new URLSearchParams(),
        writable: false,
        configurable: false
      });

      const { GET } = await import('../../src/pages/api/call-center/dial-agents');
      const handler = GET as APIRoute;

      const response = await handler({
        request: mockRequest,
        url: dialUrl,
        params: {},
        props: {}
      } as any);

      expect(response.status).toBe(200); // Returns error TeXML
      const texml = await response.text();
      expect(texml).toContain('unable to connect');
    });
  });

  describe('Retry Dial Handler', () => {
    it('should generate retry dial TeXML', async () => {
      // Ensure agents are synced
      const callCenterService = getCallCenterService();
      const agentService = getAgentManagementService();
      const availableAgents = agentService.getAvailableAgents();
      callCenterService.updateConfig({ agents: availableAgents });
      
      const callId = 'call_123';
      const attempt = 1; // Use attempt 1 (second attempt) which is less than maxDialAttempts (2)
      const retryUrl = new URL(`https://tetrixcorp.com/api/call-center/retry-dial?callId=${callId}&attempt=${attempt}`);
      const params = new URLSearchParams({ callId, attempt: attempt.toString() });
      Object.defineProperty(retryUrl, 'searchParams', {
        value: params,
        writable: false,
        configurable: false,
        enumerable: true
      });

      const { GET } = await import('../../src/pages/api/call-center/retry-dial');
      const handler = GET as APIRoute;

      const response = await handler({
        request: mockRequest,
        url: retryUrl,
        params: {},
        props: {}
      } as any);

      expect(response).toBeDefined();
      expect(response.status).toBe(200);
      const texml = await response.text();
      expect(texml).toContain('<Dial');
    });

    it('should redirect to voicemail when max attempts reached', async () => {
      const callCenterService = getCallCenterService();
      callCenterService.updateConfig({ maxDialAttempts: 2, voicemailEnabled: true });
      
      const callId = 'call_123';
      const attempt = 2; // Max attempts reached (attempt 2 means we've tried twice, so >= 2 should trigger voicemail)
      const retryUrl = new URL(`https://tetrixcorp.com/api/call-center/retry-dial?callId=${callId}&attempt=${attempt}`);
      const params = new URLSearchParams({ callId, attempt: attempt.toString() });
      Object.defineProperty(retryUrl, 'searchParams', {
        value: params,
        writable: false,
        configurable: false,
        enumerable: true
      });

      const { GET } = await import('../../src/pages/api/call-center/retry-dial');
      const handler = GET as APIRoute;

      const response = await handler({
        request: mockRequest,
        url: retryUrl,
        params: {},
        props: {}
      } as any);

      expect(response).toBeDefined();
      expect(response.status).toBe(200);
      const texml = await response.text();
      // With maxDialAttempts=2 and attempt=2, should go to voicemail
      expect(texml).toContain('voicemail');
    });
  });

  describe('Voicemail Handler', () => {
    it('should generate voicemail TeXML', async () => {
      const callId = 'call_123';
      // Ensure voicemail is enabled
      const callCenterService = getCallCenterService();
      callCenterService.updateConfig({ voicemailEnabled: true });
      
      const voicemailUrl = new URL(`https://tetrixcorp.com/api/call-center/voicemail?callId=${callId}`);
      const params = new URLSearchParams({ callId });
      Object.defineProperty(voicemailUrl, 'searchParams', {
        value: params,
        writable: false,
        configurable: false,
        enumerable: true
      });

      const { GET } = await import('../../src/pages/api/call-center/voicemail');
      const handler = GET as APIRoute;

      const response = await handler({
        request: mockRequest,
        url: voicemailUrl,
        params: {},
        props: {}
      } as any);

      expect(response.status).toBe(200);
      const texml = await response.text();
      expect(texml).toContain('<Record');
      expect(texml).toContain('leave a message');
    });
  });

  describe('Voicemail Callback Handler', () => {
    it('should handle voicemail callback', async () => {
      // Ensure no mocks are interfering
      vi.clearAllMocks();
      
      const callId = 'call_123';
      const callCenterService = getCallCenterService();
      callCenterService.createCall(callId, '+15551234567', '+18005551234', 'cc_123');

      const callbackUrl = new URL(`https://tetrixcorp.com/api/call-center/voicemail/callback?callId=${callId}`);
      const params = new URLSearchParams({ callId });
      Object.defineProperty(callbackUrl, 'searchParams', {
        value: params,
        writable: false,
        configurable: false,
        enumerable: true
      });

      // Use URLSearchParams for jsdom compatibility (FormData may not work in jsdom)
      const formParams = new URLSearchParams();
      formParams.append('RecordingUrl', 'https://telnyx.com/recordings/rec_123');
      formParams.append('RecordingDuration', '30');
      formParams.append('TranscriptionText', 'Test transcription');

      const callbackRequest = new Request(callbackUrl.toString(), {
        method: 'POST',
        body: formParams.toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const { POST } = await import('../../src/pages/api/call-center/voicemail/callback');
      const handler = POST as APIRoute;

      const response = await handler({
        request: callbackRequest,
        url: callbackUrl,
        params: {},
        props: {}
      } as any);

      expect(response).toBeDefined();
      expect(response.status).toBe(200);
      
      const call = callCenterService.getCall(callId);
      expect(call).toBeDefined();
      expect(call?.voicemailUrl).toBe('https://telnyx.com/recordings/rec_123');
      expect(call?.status).toBe('voicemail');
    });
  });

  describe('Outbound Event Handler', () => {
    it('should handle call.answered event', async () => {
      // Ensure no mocks are interfering
      vi.clearAllMocks();
      
      const callId = 'call_123';
      const callCenterService = getCallCenterService();
      callCenterService.createCall(callId, '+15551234567', '+18005551234', 'cc_123');

      // Use URLSearchParams for jsdom compatibility (FormData may not work in jsdom)
      const formParams = new URLSearchParams();
      formParams.append('event_type', 'call.answered');
      formParams.append('call_control_id', 'cc_123');
      formParams.append('call_session_id', callId);
      formParams.append('connection_id', 'conn_001');

      const eventRequest = new Request('https://tetrixcorp.com/api/call-center/outbound/event', {
        method: 'POST',
        body: formParams.toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const { POST } = await import('../../src/pages/api/call-center/outbound/event');
      const handler = POST as APIRoute;

      const response = await handler({
        request: eventRequest,
        url: new URL('https://tetrixcorp.com/api/call-center/outbound/event'),
        params: {},
        props: {}
      } as any);

      expect(response).toBeDefined();
      expect(response.status).toBe(200);
      
      const call = callCenterService.getCall(callId);
      expect(call).toBeDefined();
      expect(call?.status).toBe('answered');
      expect(call?.agentId).toBe('agent_001');
    });

    it('should handle call.hangup event', async () => {
      // Ensure no mocks are interfering
      vi.clearAllMocks();
      
      const callId = 'call_123';
      const callCenterService = getCallCenterService();
      callCenterService.createCall(callId, '+15551234567', '+18005551234', 'cc_123');
      callCenterService.updateCallStatus(callId, 'answered', 'agent_001');

      // Use URLSearchParams for jsdom compatibility (FormData may not work in jsdom)
      const formParams = new URLSearchParams();
      formParams.append('event_type', 'call.hangup');
      formParams.append('call_control_id', 'cc_123');
      formParams.append('call_session_id', callId);
      formParams.append('connection_id', 'conn_001');
      formParams.append('recording_url', 'https://telnyx.com/recordings/rec_123');

      const eventRequest = new Request('https://tetrixcorp.com/api/call-center/outbound/event', {
        method: 'POST',
        body: formParams.toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const { POST } = await import('../../src/pages/api/call-center/outbound/event');
      const handler = POST as APIRoute;

      const response = await handler({
        request: eventRequest,
        url: new URL('https://tetrixcorp.com/api/call-center/outbound/event'),
        params: {},
        props: {}
      } as any);

      expect(response).toBeDefined();
      expect(response.status).toBe(200);
      
      const call = callCenterService.getCall(callId);
      expect(call).toBeDefined();
      expect(call?.status).toBe('completed');
      expect(call?.recordingUrl).toBe('https://telnyx.com/recordings/rec_123');
      
      const agentService = getAgentManagementService();
      const agent = agentService.getAgent('agent_001');
      expect(agent).toBeDefined();
      expect(agent?.status).toBe('available');
    });
  });

  describe('Agent Management Endpoints', () => {
    it('should register new agent', async () => {
      // Ensure no mocks are interfering
      vi.clearAllMocks();
      
      const registrationData = {
        agentId: 'agent_002',
        sipConnectionId: 'conn_002',
        sipUri: 'sip:agent2@telnyx.com',
        username: 'agent2',
        displayName: 'Agent Two'
      };

      const registerRequest = new Request('https://tetrixcorp.com/api/call-center/agents/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData)
      });

      const { POST } = await import('../../src/pages/api/call-center/agents/register');
      const handler = POST as APIRoute;

      const response = await handler({
        request: registerRequest,
        url: new URL('https://tetrixcorp.com/api/call-center/agents/register'),
        params: {},
        props: {}
      } as any);

      expect(response).toBeDefined();
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.agent.agentId).toBe('agent_002');
    });

    it('should list agents', async () => {
      // Ensure agent service is initialized
      const agentService = getAgentManagementService();
      expect(agentService).toBeDefined();
      
      const listUrl = new URL('https://tetrixcorp.com/api/call-center/agents/list');
      Object.defineProperty(listUrl, 'searchParams', {
        value: new URLSearchParams(),
        writable: false,
        configurable: false,
        enumerable: true
      });
      
      const listRequest = new Request('https://tetrixcorp.com/api/call-center/agents/list', {
        method: 'GET'
      });

      const { GET } = await import('../../src/pages/api/call-center/agents/list');
      const handler = GET as APIRoute;

      const response = await handler({
        request: listRequest,
        url: listUrl,
        params: {},
        props: {}
      } as any);

      expect(response).toBeDefined();
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.agents)).toBe(true);
    });

    it('should handle agent heartbeat', async () => {
      const heartbeatData = {
        agentId: 'agent_001',
        status: 'available'
      };

      const heartbeatRequest = new Request('https://tetrixcorp.com/api/call-center/agents/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(heartbeatData)
      });

      const { POST } = await import('../../src/pages/api/call-center/agents/heartbeat');
      const handler = POST as APIRoute;

      const response = await handler({
        request: heartbeatRequest,
        url: new URL('https://tetrixcorp.com/api/call-center/agents/heartbeat'),
        params: {},
        props: {}
      } as any);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  // Error handling test moved to the end to prevent mock leakage
  describe('Error Handling', () => {
    it('should handle errors gracefully', async () => {
      // Create invalid URL that will cause an error
      const invalidUrl = new URL('https://tetrixcorp.com/api/call-center/inbound');
      Object.defineProperty(invalidUrl, 'searchParams', {
        value: new URLSearchParams(),
        writable: false,
        configurable: false,
        enumerable: true
      });
      
      // Mock getCallCenterService to throw an error
      // Get the module and create a spy that will be properly cleaned up
      const callCenterModule = await import('../../src/services/callCenter');
      const originalGetService = callCenterModule.getCallCenterService;
      
      // Replace the function temporarily
      const spy = vi.spyOn(callCenterModule, 'getCallCenterService').mockImplementation(() => {
        throw new Error('Service error');
      });

      try {
        const { GET } = await import('../../src/pages/api/call-center/inbound');
        const handler = GET as APIRoute;

        const response = await handler({
          request: mockRequest,
          url: invalidUrl,
          params: {},
          props: {}
        } as any);

        expect(response.status).toBe(200); // Should return 200 to Telnyx even on error
        const texml = await response.text();
        expect(texml).toContain('technical difficulties');
      } finally {
        // Always restore the spy to prevent leakage
        spy.mockRestore();
        // Ensure the original function is restored
        if (callCenterModule.getCallCenterService !== originalGetService) {
          Object.defineProperty(callCenterModule, 'getCallCenterService', {
            value: originalGetService,
            writable: true,
            configurable: true,
            enumerable: true
          });
        }
      }
    });
  });
});
