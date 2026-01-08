/**
 * Unit Tests for Campaign Management Service
 * Tests campaign creation, contact lists, and metrics tracking
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { campaignManagementService } from '../../src/services/telemarketing/campaignManagementService';

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

vi.mock('../../src/services/telemarketing/tcpaComplianceService', () => ({
  tcpaComplianceService: {
    validateContact: vi.fn().mockResolvedValue({
      phoneNumber: '+15551234567',
      isValid: true,
      safeToCall: true,
      dncStatus: 'not_listed'
    }),
    validateContacts: vi.fn().mockImplementation(async (tenantId, contacts) => {
      const results = new Map();
      contacts.forEach((c: any) => {
        results.set(c.contactId, {
          phoneNumber: c.phoneNumber,
          isValid: true,
          safeToCall: true
        });
      });
      return results;
    })
  }
}));

vi.mock('../../src/services/telemarketing/predictiveDialerService', () => ({
  predictiveDialerService: {
    getInstance: vi.fn().mockReturnValue({
      startDialing: vi.fn().mockResolvedValue(undefined),
      stopDialing: vi.fn().mockResolvedValue(undefined)
    })
  }
}));

describe('Campaign Management Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Campaign Creation', () => {
    it('should create campaign successfully', async () => {
      const campaign = await campaignManagementService.createCampaign('tenant_001', {
        name: 'Test Campaign',
        contactListId: 'list_123',
        dialerMode: 'predictive',
        outcomeTags: ['answered', 'voicemail'],
        timezoneBasedCalling: true,
        dncCheck: true,
        recordingEnabled: true
      });

      expect(campaign.campaignId).toBeDefined();
      expect(campaign.name).toBe('Test Campaign');
      expect(campaign.status).toBe('draft');
      expect(campaign.dialerMode).toBe('predictive');
    });

    it('should initialize campaign metrics', async () => {
      const campaign = await campaignManagementService.createCampaign('tenant_001', {
        name: 'Test Campaign',
        contactListId: 'list_123',
        dialerMode: 'predictive',
        outcomeTags: []
      });

      const metrics = campaignManagementService.getCampaignMetrics(campaign.campaignId);
      expect(metrics).toBeDefined();
      expect(metrics?.campaignId).toBe(campaign.campaignId);
      expect(metrics?.totalContacts).toBe(0);
      expect(metrics?.totalDials).toBe(0);
    });
  });

  describe('Contact List Management', () => {
    it('should create contact list', async () => {
      const list = await campaignManagementService.createContactList('tenant_001', {
        name: 'Test List',
        contacts: [
          { contactId: 'c1', phoneNumber: '+15551234567', firstName: 'John' },
          { contactId: 'c2', phoneNumber: '+15551234568', firstName: 'Jane' }
        ]
      });

      expect(list.listId).toBeDefined();
      expect(list.name).toBe('Test List');
      expect(list.contacts.length).toBe(2);
    });
  });

  describe('Campaign Start', () => {
    it('should start campaign successfully', async () => {
      // Create contact list
      const list = await campaignManagementService.createContactList('tenant_001', {
        name: 'Test List',
        contacts: [
          { contactId: 'c1', phoneNumber: '+15551234567' },
          { contactId: 'c2', phoneNumber: '+15551234568' }
        ]
      });

      // Create campaign
      const campaign = await campaignManagementService.createCampaign('tenant_001', {
        name: 'Test Campaign',
        contactListId: list.listId,
        dialerMode: 'predictive',
        outcomeTags: []
      });

      // Start campaign
      const result = await campaignManagementService.startCampaign('tenant_001', campaign.campaignId);

      expect(result.success).toBe(true);
      
      const updatedCampaign = campaignManagementService.getCampaign(campaign.campaignId);
      expect(updatedCampaign?.status).toBe('running');
      expect(updatedCampaign?.actualStartTime).toBeDefined();
    });

    it('should reject start if no valid contacts', async () => {
      // Create empty contact list
      const list = await campaignManagementService.createContactList('tenant_001', {
        name: 'Empty List',
        contacts: []
      });

      const campaign = await campaignManagementService.createCampaign('tenant_001', {
        name: 'Test Campaign',
        contactListId: list.listId,
        dialerMode: 'predictive',
        outcomeTags: []
      });

      const result = await campaignManagementService.startCampaign('tenant_001', campaign.campaignId);

      expect(result.success).toBe(false);
      expect(result.message).toContain('No valid contacts');
    });
  });

  describe('Call Outcome Recording', () => {
    it('should record call outcome', async () => {
      const campaign = await campaignManagementService.createCampaign('tenant_001', {
        name: 'Test Campaign',
        contactListId: 'list_123',
        dialerMode: 'predictive',
        outcomeTags: []
      });

      const outcome = await campaignManagementService.recordCallOutcome('tenant_001', campaign.campaignId, {
        callId: 'call_123',
        campaignId: campaign.campaignId,
        contactId: 'contact_123',
        phoneNumber: '+15551234567',
        outcome: 'answered',
        agentId: 'agent_001',
        duration: 180
      });

      expect(outcome.callId).toBe('call_123');
      expect(outcome.outcome).toBe('answered');

      // Check metrics updated
      const metrics = campaignManagementService.getCampaignMetrics(campaign.campaignId);
      expect(metrics?.totalDials).toBe(1);
      expect(metrics?.callsAnswered).toBe(1);
    });

    it('should update metrics for different outcomes', async () => {
      const campaign = await campaignManagementService.createCampaign('tenant_001', {
        name: 'Test Campaign',
        contactListId: 'list_123',
        dialerMode: 'predictive',
        outcomeTags: []
      });

      // Record multiple outcomes
      await campaignManagementService.recordCallOutcome('tenant_001', campaign.campaignId, {
        callId: 'call_1',
        campaignId: campaign.campaignId,
        contactId: 'c1',
        phoneNumber: '+15551234567',
        outcome: 'answered',
        duration: 180
      });

      await campaignManagementService.recordCallOutcome('tenant_001', campaign.campaignId, {
        callId: 'call_2',
        campaignId: campaign.campaignId,
        contactId: 'c2',
        phoneNumber: '+15551234568',
        outcome: 'no_answer'
      });

      await campaignManagementService.recordCallOutcome('tenant_001', campaign.campaignId, {
        callId: 'call_3',
        campaignId: campaign.campaignId,
        contactId: 'c3',
        phoneNumber: '+15551234569',
        outcome: 'voicemail'
      });

      const metrics = campaignManagementService.getCampaignMetrics(campaign.campaignId);
      expect(metrics?.totalDials).toBe(3);
      expect(metrics?.callsAnswered).toBe(1);
      expect(metrics?.callsNoAnswer).toBe(1);
      expect(metrics?.callsVoicemail).toBe(1);
      expect(metrics?.answerRate).toBeCloseTo(1/3, 2);
    });
  });

  describe('Metrics', () => {
    it('should calculate live metrics', async () => {
      const campaign = await campaignManagementService.createCampaign('tenant_001', {
        name: 'Test Campaign',
        contactListId: 'list_123',
        dialerMode: 'predictive',
        outcomeTags: []
      });

      // Start campaign
      await campaignManagementService.startCampaign('tenant_001', campaign.campaignId);

      // Record some outcomes
      await campaignManagementService.recordCallOutcome('tenant_001', campaign.campaignId, {
        callId: 'call_1',
        campaignId: campaign.campaignId,
        contactId: 'c1',
        phoneNumber: '+15551234567',
        outcome: 'answered',
        duration: 120
      });

      const liveMetrics = campaignManagementService.getLiveMetrics(campaign.campaignId);

      expect(liveMetrics.totalDials).toBe(1);
      expect(liveMetrics.callsPerMinute).toBeDefined();
      expect(liveMetrics.answerRate).toBe(1);
    });
  });
});
