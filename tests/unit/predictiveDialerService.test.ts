/**
 * Unit Tests for Predictive Dialer Service
 * Tests pacing algorithm, agent forecasting, and parallel call initiation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PredictiveDialerService, type PredictiveDialerConfig } from '../../src/services/telemarketing/predictiveDialerService';

// Mock dependencies
vi.mock('../../src/services/compliance/auditEvidenceService', () => ({
  auditEvidenceService: {
    logEvent: vi.fn().mockResolvedValue({
      logId: 'log_123',
      timestamp: new Date(),
      eventHash: 'hash_123'
    })
  }
}));

vi.mock('../../src/services/callCenter/callCenterService', () => ({
  callCenterService: {}
}));

vi.mock('../../src/services/callCenter/agentManagementService', () => ({
  agentManagementService: {
    getAllAgents: vi.fn().mockReturnValue([
      { agentId: 'agent_1', status: 'available', sipUri: 'sip:agent1@telnyx.com' },
      { agentId: 'agent_2', status: 'available', sipUri: 'sip:agent2@telnyx.com' }
    ]),
    getAgentMetrics: vi.fn().mockReturnValue([
      { agentId: 'agent_1', averageCallDuration: 180 },
      { agentId: 'agent_2', averageCallDuration: 200 }
    ]),
    getAgent: vi.fn().mockReturnValue({ agentId: 'agent_1', sipUri: 'sip:agent1@telnyx.com' }),
    updateAgentStatus: vi.fn()
  }
}));

// Mock fetch for Telnyx API
global.fetch = vi.fn();

describe('Predictive Dialer Service', () => {
  let dialer: PredictiveDialerService;
  let config: PredictiveDialerConfig;

  beforeEach(() => {
    vi.clearAllMocks();
    
    config = {
      targetAgentUtilization: 0.85,
      maxCallsPerAgent: 3,
      dialTimeout: 30,
      answerDetectionTimeout: 5,
      minAvailableAgents: 1,
      pacingUpdateInterval: 5000,
      maxAbandonmentRate: 0.1,
      webhookBaseUrl: 'https://tetrixcorp.com',
      telnyxApiKey: 'test_key',
      outboundProfileId: 'profile_123',
      callerId: '+18005551234'
    };

    dialer = new PredictiveDialerService(config);
  });

  describe('Pacing Calculation', () => {
    it('should calculate dial rate based on agent availability', () => {
      // Access private method via type assertion for testing
      const metrics = (dialer as any).metrics;
      metrics.availableAgents = 2;
      metrics.averageTalkTime = 180;
      metrics.answerRate = 0.3;

      const pacing = (dialer as any).calculatePacing();

      expect(pacing.dialRate).toBeGreaterThan(0);
      expect(pacing.callsToDial).toBeGreaterThan(0);
      expect(pacing.targetUtilization).toBe(0.85);
    });

    it('should return zero dial rate when no agents available', () => {
      const metrics = (dialer as any).metrics;
      metrics.availableAgents = 0;

      const pacing = (dialer as any).calculatePacing();

      expect(pacing.dialRate).toBe(0);
      expect(pacing.callsToDial).toBe(0);
    });

    it('should adjust dial rate based on answer rate', () => {
      const metrics = (dialer as any).metrics;
      metrics.availableAgents = 2;
      metrics.averageTalkTime = 180;

      // High answer rate
      metrics.answerRate = 0.5;
      const pacingHigh = (dialer as any).calculatePacing();

      // Low answer rate
      metrics.answerRate = 0.1;
      const pacingLow = (dialer as any).calculatePacing();

      expect(pacingHigh.dialRate).toBeGreaterThan(pacingLow.dialRate);
    });
  });

  describe('Should Dial Logic', () => {
    it('should not dial if no available agents', () => {
      const metrics = (dialer as any).metrics;
      metrics.availableAgents = 0;

      const pacing = { dialRate: 5, callsToDial: 10, targetUtilization: 0.85, estimatedConnections: 5, estimatedWaitTime: 30 };
      const shouldDial = (dialer as any).shouldDial(pacing);

      expect(shouldDial).toBe(false);
    });

    it('should not dial if abandonment rate too high', () => {
      const metrics = (dialer as any).metrics;
      metrics.availableAgents = 2;
      metrics.abandonmentRate = 0.15; // Above max of 0.1

      const pacing = { dialRate: 5, callsToDial: 10, targetUtilization: 0.85, estimatedConnections: 5, estimatedWaitTime: 30 };
      const shouldDial = (dialer as any).shouldDial(pacing);

      expect(shouldDial).toBe(false);
    });

    it('should dial when conditions are met', () => {
      const metrics = (dialer as any).metrics;
      metrics.availableAgents = 2;
      metrics.abandonmentRate = 0.05;
      metrics.agentUtilization = 0.5;
      metrics.callsWaiting = 0;

      const pacing = { dialRate: 5, callsToDial: 10, targetUtilization: 0.85, estimatedConnections: 5, estimatedWaitTime: 30 };
      const shouldDial = (dialer as any).shouldDial(pacing);

      expect(shouldDial).toBe(true);
    });
  });

  describe('Call Placement', () => {
    it('should place call via Telnyx API', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            call_control_id: 'cc_123',
            id: 'call_123'
          }
        })
      });

      const result = await (dialer as any).placeCall(
        'tenant_001',
        'campaign_123',
        { phoneNumber: '+15551234567', contactId: 'contact_123' }
      );

      expect(result.callId).toBeDefined();
      expect(result.callControlId).toBe('cc_123');
      expect(result.phoneNumber).toBe('+15551234567');
      expect(result.status).toBe('initiated');
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => 'Bad Request'
      });

      await expect(
        (dialer as any).placeCall(
          'tenant_001',
          'campaign_123',
          { phoneNumber: '+15551234567', contactId: 'contact_123' }
        )
      ).rejects.toThrow();
    });
  });

  describe('Call Event Handling', () => {
    it('should handle call.answered event', async () => {
      const callId = 'call_123';
      (dialer as any).activeCalls.set(callId, {
        callId,
        callControlId: 'cc_123',
        phoneNumber: '+15551234567',
        status: 'initiated',
        initiatedAt: new Date()
      });

      await dialer.handleCallEvent('tenant_001', {
        event_type: 'call.answered',
        data: {
          call_control_id: 'cc_123',
          call_leg_id: 'leg_123',
          to: '+15551234567',
          from: '+18005551234',
          direction: 'outbound',
          state: 'answered'
        }
      });

      const call = (dialer as any).activeCalls.get(callId);
      expect(call.status).toBe('answered');
      expect(call.answeredAt).toBeDefined();
    });

    it('should handle call.hangup event', async () => {
      const callId = 'call_123';
      const answeredAt = new Date();
      (dialer as any).activeCalls.set(callId, {
        callId,
        callControlId: 'cc_123',
        phoneNumber: '+15551234567',
        status: 'answered',
        answeredAt,
        initiatedAt: new Date()
      });

      await dialer.handleCallEvent('tenant_001', {
        event_type: 'call.hangup',
        data: {
          call_control_id: 'cc_123',
          call_leg_id: 'leg_123',
          to: '+15551234567',
          from: '+18005551234',
          direction: 'outbound',
          state: 'hangup'
        }
      });

      const call = (dialer as any).activeCalls.get(callId);
      expect(call.status).toBe('completed');
      expect(call.duration).toBeDefined();
    });
  });

  describe('Metrics', () => {
    it('should return current metrics', () => {
      const metrics = dialer.getMetrics();
      
      expect(metrics).toBeDefined();
      expect(metrics.availableAgents).toBeDefined();
      expect(metrics.answerRate).toBeDefined();
      expect(metrics.agentUtilization).toBeDefined();
    });

    it('should return active calls', () => {
      const activeCalls = dialer.getActiveCalls();
      expect(Array.isArray(activeCalls)).toBe(true);
    });
  });
});
