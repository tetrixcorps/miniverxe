// Campaign Management Service
// Manages outbound telemarketing campaigns, contact lists, and KPI tracking

import { auditEvidenceService } from '../compliance/auditEvidenceService';
import { tcpaComplianceService } from './tcpaComplianceService';
import { predictiveDialerService } from './predictiveDialerService';

export interface Contact {
  contactId: string;
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  metadata?: Record<string, any>;
  tags?: string[];
  lastContacted?: Date;
  lastOutcome?: 'answered' | 'voicemail' | 'no_answer' | 'busy' | 'callback' | 'do_not_call';
  notes?: string;
}

export interface ContactList {
  listId: string;
  name: string;
  description?: string;
  contacts: Contact[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface Campaign {
  campaignId: string;
  tenantId: string;
  name: string;
  description?: string;
  contactListId: string;
  dialerMode: 'predictive' | 'progressive' | 'preview';
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled';
  scheduledStartTime?: Date;
  scheduledEndTime?: Date;
  actualStartTime?: Date;
  actualEndTime?: Date;
  script?: string;
  outcomeTags: string[];
  timezoneBasedCalling: boolean;
  dncCheck: boolean;
  recordingEnabled: boolean;
  targetAgents?: string[]; // Agent IDs
  maxCallsPerContact?: number;
  retrySettings?: {
    enabled: boolean;
    maxRetries: number;
    retryDelay: number; // minutes
    retryConditions: Array<'no_answer' | 'busy' | 'voicemail'>;
  };
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface CampaignMetrics {
  campaignId: string;
  totalContacts: number;
  totalDials: number;
  callsConnected: number;
  callsAnswered: number;
  callsVoicemail: number;
  callsNoAnswer: number;
  callsBusy: number;
  callsFailed: number;
  callsAbandoned: number;
  agentUtilization: number;
  averageTalkTime: number; // seconds
  averageWrapTime: number; // seconds
  answerRate: number; // 0-1
  connectionRate: number; // 0-1
  abandonmentRate: number; // 0-1
  costPerCall: number;
  totalCost: number;
  outcomes: Map<string, number>; // outcome tag -> count
  startTime?: Date;
  lastUpdateTime: Date;
}

export interface CallOutcome {
  callId: string;
  campaignId: string;
  contactId: string;
  phoneNumber: string;
  outcome: 'answered' | 'voicemail' | 'no_answer' | 'busy' | 'callback' | 'do_not_call' | 'failed';
  agentId?: string;
  duration?: number; // seconds
  notes?: string;
  tags?: string[];
  nextFollowUp?: Date;
  recordedAt: Date;
}

class CampaignManagementService {
  private campaigns: Map<string, Campaign> = new Map();
  private contactLists: Map<string, ContactList> = new Map();
  private callOutcomes: Map<string, CallOutcome> = new Map();
  private campaignMetrics: Map<string, CampaignMetrics> = new Map();

  /**
   * Create a new campaign
   */
  async createCampaign(
    tenantId: string,
    campaign: Omit<Campaign, 'campaignId' | 'status' | 'createdAt' | 'updatedAt'>
  ): Promise<Campaign> {
    const fullCampaign: Campaign = {
      ...campaign,
      campaignId: `CAMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.campaigns.set(fullCampaign.campaignId, fullCampaign);

    // Initialize metrics
    const metrics: CampaignMetrics = {
      campaignId: fullCampaign.campaignId,
      totalContacts: 0,
      totalDials: 0,
      callsConnected: 0,
      callsAnswered: 0,
      callsVoicemail: 0,
      callsNoAnswer: 0,
      callsBusy: 0,
      callsFailed: 0,
      callsAbandoned: 0,
      agentUtilization: 0,
      averageTalkTime: 0,
      averageWrapTime: 0,
      answerRate: 0,
      connectionRate: 0,
      abandonmentRate: 0,
      costPerCall: 0,
      totalCost: 0,
      outcomes: new Map(),
      lastUpdateTime: new Date()
    };

    this.campaignMetrics.set(fullCampaign.campaignId, metrics);

    // Log campaign creation
    await auditEvidenceService.logEvent({
      tenantId,
      callId: fullCampaign.campaignId,
      eventType: 'data.access',
      eventData: {
        action: 'campaign_created',
        campaignId: fullCampaign.campaignId,
        name: fullCampaign.name,
        dialerMode: fullCampaign.dialerMode
      },
      metadata: {
        service: 'campaign_management'
      }
    });

    return fullCampaign;
  }

  /**
   * Create a contact list
   */
  async createContactList(
    tenantId: string,
    list: Omit<ContactList, 'listId' | 'createdAt' | 'updatedAt'>
  ): Promise<ContactList> {
    const fullList: ContactList = {
      ...list,
      listId: `LIST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.contactLists.set(fullList.listId, fullList);

    // Log list creation
    await auditEvidenceService.logEvent({
      tenantId,
      callId: fullList.listId,
      eventType: 'data.access',
      eventData: {
        action: 'contact_list_created',
        listId: fullList.listId,
        name: fullList.name,
        contactCount: fullList.contacts.length
      },
      metadata: {
        service: 'campaign_management'
      }
    });

    return fullList;
  }

  /**
   * Start a campaign
   */
  async startCampaign(
    tenantId: string,
    campaignId: string
  ): Promise<{ success: boolean; message: string }> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      throw new Error(`Campaign not found: ${campaignId}`);
    }

    if (campaign.tenantId !== tenantId) {
      throw new Error('Campaign does not belong to tenant');
    }

    if (campaign.status !== 'draft' && campaign.status !== 'scheduled' && campaign.status !== 'paused') {
      return {
        success: false,
        message: `Campaign cannot be started from status: ${campaign.status}`
      };
    }

    // Get contact list
    const contactList = this.contactLists.get(campaign.contactListId);
    if (!contactList) {
      throw new Error(`Contact list not found: ${campaign.contactListId}`);
    }

    // Validate and filter contacts
    const validContacts = await this.validateContacts(tenantId, contactList.contacts);

    if (validContacts.length === 0) {
      return {
        success: false,
        message: 'No valid contacts to dial after compliance checks'
      };
    }

    // Update campaign status
    campaign.status = 'running';
    campaign.actualStartTime = new Date();
    campaign.updatedAt = new Date();

    // Update metrics
    const metrics = this.campaignMetrics.get(campaignId);
    if (metrics) {
      metrics.totalContacts = validContacts.length;
      metrics.startTime = new Date();
    }

    // Start predictive dialer if in predictive mode
    if (campaign.dialerMode === 'predictive') {
      const dialer = predictiveDialerService.getInstance();
      await dialer.startDialing(
        tenantId,
        campaignId,
        validContacts.map(c => ({
          phoneNumber: c.phoneNumber,
          contactId: c.contactId,
          metadata: c.metadata
        }))
      );
    }

    // Log campaign start
    await auditEvidenceService.logEvent({
      tenantId,
      callId: campaignId,
      eventType: 'data.access',
      eventData: {
        action: 'campaign_started',
        campaignId,
        contactCount: validContacts.length
      },
      metadata: {
        service: 'campaign_management'
      }
    });

    return {
      success: true,
      message: `Campaign started with ${validContacts.length} valid contacts`
    };
  }

  /**
   * Validate contacts against TCPA compliance
   */
  private async validateContacts(
    tenantId: string,
    contacts: Contact[]
  ): Promise<Contact[]> {
    const validContacts: Contact[] = [];

    for (const contact of contacts) {
      const validation = await tcpaComplianceService.validateContact(
        tenantId,
        contact.phoneNumber
      );

      if (validation.safeToCall) {
        validContacts.push(contact);
      } else {
        // Mark contact as do_not_call
        contact.lastOutcome = 'do_not_call';
      }
    }

    return validContacts;
  }

  /**
   * Pause a campaign
   */
  async pauseCampaign(tenantId: string, campaignId: string): Promise<void> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      throw new Error(`Campaign not found: ${campaignId}`);
    }

    if (campaign.status !== 'running') {
      throw new Error(`Campaign is not running (status: ${campaign.status})`);
    }

    campaign.status = 'paused';
    campaign.updatedAt = new Date();

    // Stop dialer if running
    if (campaign.dialerMode === 'predictive') {
      const dialer = predictiveDialerService.getInstance();
      await dialer.stopDialing(tenantId, campaignId);
    }

    await auditEvidenceService.logEvent({
      tenantId,
      callId: campaignId,
      eventType: 'data.access',
      eventData: {
        action: 'campaign_paused',
        campaignId
      },
      metadata: {
        service: 'campaign_management'
      }
    });
  }

  /**
   * Complete a campaign
   */
  async completeCampaign(tenantId: string, campaignId: string): Promise<void> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      throw new Error(`Campaign not found: ${campaignId}`);
    }

    campaign.status = 'completed';
    campaign.actualEndTime = new Date();
    campaign.updatedAt = new Date();

    // Stop dialer if running
    if (campaign.dialerMode === 'predictive') {
      const dialer = predictiveDialerService.getInstance();
      await dialer.stopDialing(tenantId, campaignId);
    }

    await auditEvidenceService.logEvent({
      tenantId,
      callId: campaignId,
      eventType: 'data.access',
      eventData: {
        action: 'campaign_completed',
        campaignId
      },
      metadata: {
        service: 'campaign_management'
      }
    });
  }

  /**
   * Record call outcome
   */
  async recordCallOutcome(
    tenantId: string,
    campaignId: string,
    outcome: Omit<CallOutcome, 'recordedAt'>
  ): Promise<CallOutcome> {
    const fullOutcome: CallOutcome = {
      ...outcome,
      recordedAt: new Date()
    };

    this.callOutcomes.set(outcome.callId, fullOutcome);

    // Update campaign metrics
    await this.updateCampaignMetrics(campaignId, fullOutcome);

    // Log outcome
    await auditEvidenceService.logEvent({
      tenantId,
      callId: outcome.callId,
      eventType: 'data.access',
      eventData: {
        action: 'call_outcome_recorded',
        campaignId,
        callId: outcome.callId,
        outcome: outcome.outcome
      },
      metadata: {
        service: 'campaign_management'
      }
    });

    return fullOutcome;
  }

  /**
   * Update campaign metrics based on call outcome
   */
  private async updateCampaignMetrics(
    campaignId: string,
    outcome: CallOutcome
  ): Promise<void> {
    const metrics = this.campaignMetrics.get(campaignId);
    if (!metrics) {
      return;
    }

    metrics.totalDials++;
    metrics.lastUpdateTime = new Date();

    switch (outcome.outcome) {
      case 'answered':
        metrics.callsAnswered++;
        metrics.callsConnected++;
        if (outcome.duration) {
          // Update average talk time
          const totalTalkTime = metrics.averageTalkTime * (metrics.callsAnswered - 1) + outcome.duration;
          metrics.averageTalkTime = totalTalkTime / metrics.callsAnswered;
        }
        break;

      case 'voicemail':
        metrics.callsVoicemail++;
        metrics.callsConnected++;
        break;

      case 'no_answer':
        metrics.callsNoAnswer++;
        break;

      case 'busy':
        metrics.callsBusy++;
        break;

      case 'failed':
        metrics.callsFailed++;
        break;

      case 'callback':
        metrics.callsConnected++;
        break;
    }

    // Update rates
    if (metrics.totalDials > 0) {
      metrics.answerRate = metrics.callsAnswered / metrics.totalDials;
      metrics.connectionRate = metrics.callsConnected / metrics.totalDials;
    }

    // Update outcome tags
    if (outcome.tags) {
      for (const tag of outcome.tags) {
        const current = metrics.outcomes.get(tag) || 0;
        metrics.outcomes.set(tag, current + 1);
      }
    }
  }

  /**
   * Get campaign metrics
   */
  getCampaignMetrics(campaignId: string): CampaignMetrics | undefined {
    return this.campaignMetrics.get(campaignId);
  }

  /**
   * Get live metrics for dashboard
   */
  getLiveMetrics(campaignId: string): CampaignMetrics & {
    callsPerMinute: number;
    estimatedCompletionTime?: Date;
  } {
    const metrics = this.campaignMetrics.get(campaignId);
    if (!metrics) {
      throw new Error(`Campaign metrics not found: ${campaignId}`);
    }

    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      throw new Error(`Campaign not found: ${campaignId}`);
    }

    // Calculate calls per minute
    let callsPerMinute = 0;
    if (metrics.startTime) {
      const minutesElapsed = (new Date().getTime() - metrics.startTime.getTime()) / (1000 * 60);
      if (minutesElapsed > 0) {
        callsPerMinute = metrics.totalDials / minutesElapsed;
      }
    }

    // Estimate completion time
    let estimatedCompletionTime: Date | undefined;
    if (campaign.status === 'running' && metrics.totalDials > 0 && metrics.answerRate > 0) {
      const remainingContacts = metrics.totalContacts - metrics.totalDials;
      const minutesRemaining = remainingContacts / callsPerMinute;
      estimatedCompletionTime = new Date(Date.now() + minutesRemaining * 60 * 1000);
    }

    return {
      ...metrics,
      callsPerMinute,
      estimatedCompletionTime
    };
  }

  /**
   * Get campaign
   */
  getCampaign(campaignId: string): Campaign | undefined {
    return this.campaigns.get(campaignId);
  }

  /**
   * Get campaigns for tenant
   */
  getTenantCampaigns(tenantId: string): Campaign[] {
    return Array.from(this.campaigns.values())
      .filter(c => c.tenantId === tenantId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get contact list
   */
  getContactList(listId: string): ContactList | undefined {
    return this.contactLists.get(listId);
  }

  /**
   * Get call outcomes for campaign
   */
  getCampaignOutcomes(campaignId: string): CallOutcome[] {
    return Array.from(this.callOutcomes.values())
      .filter(o => o.campaignId === campaignId)
      .sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime());
  }
}

export const campaignManagementService = new CampaignManagementService();
