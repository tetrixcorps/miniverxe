// Predictive Dialing Engine
// Machine learning-powered pacing algorithms for outbound telemarketing campaigns
// Forecasts agent availability and automatically dials multiple numbers simultaneously

import { auditEvidenceService } from '../compliance/auditEvidenceService';
import { callCenterService } from '../callCenter/callCenterService';
import { getAgentManagementService } from '../callCenter/agentManagementService';

export interface DialingMetrics {
  availableAgents: number;
  busyAgents: number;
  totalAgents: number;
  averageTalkTime: number; // seconds
  averageWrapTime: number; // seconds
  answerRate: number; // 0-1 (percentage of calls answered)
  abandonmentRate: number; // 0-1 (percentage of calls abandoned)
  agentUtilization: number; // 0-1 (percentage of time agents are on calls)
  callsInProgress: number;
  callsWaiting: number;
}

export interface PacingCalculation {
  dialRate: number; // calls per agent per minute
  callsToDial: number; // total calls to place in this cycle
  targetUtilization: number; // desired agent utilization (0-1)
  estimatedConnections: number; // expected answered calls
  estimatedWaitTime: number; // seconds until next agent available
}

export interface DialResult {
  callId: string;
  callControlId: string;
  phoneNumber: string;
  status: 'initiated' | 'answered' | 'busy' | 'no_answer' | 'voicemail' | 'failed';
  connectedToAgent?: string;
  initiatedAt: Date;
  answeredAt?: Date;
  duration?: number;
  error?: string;
}

export interface PredictiveDialerConfig {
  targetAgentUtilization: number; // 0.85 = 85% utilization
  maxCallsPerAgent: number; // Maximum simultaneous calls per agent
  dialTimeout: number; // seconds to wait for answer
  answerDetectionTimeout: number; // seconds to detect if call was answered
  minAvailableAgents: number; // Minimum agents needed before dialing
  pacingUpdateInterval: number; // milliseconds between pacing recalculations
  maxAbandonmentRate: number; // 0.1 = 10% max abandonment
  webhookBaseUrl: string;
  telnyxApiKey: string;
  outboundProfileId: string;
  callerId: string;
}

class PredictiveDialerService {
  private config: PredictiveDialerConfig;
  private activeCalls: Map<string, DialResult> = new Map();
  private metrics: DialingMetrics;
  private pacingInterval?: NodeJS.Timeout;
  private isRunning: boolean = false;

  constructor(config: PredictiveDialerConfig) {
    this.config = config;
    this.metrics = this.initializeMetrics();
  }

  /**
   * Initialize metrics tracking
   */
  private initializeMetrics(): DialingMetrics {
    return {
      availableAgents: 0,
      busyAgents: 0,
      totalAgents: 0,
      averageTalkTime: 180, // Default 3 minutes
      averageWrapTime: 30, // Default 30 seconds
      answerRate: 0.3, // Default 30% answer rate
      abandonmentRate: 0,
      agentUtilization: 0,
      callsInProgress: 0,
      callsWaiting: 0
    };
  }

  /**
   * Start predictive dialing for a campaign
   */
  async startDialing(
    tenantId: string,
    campaignId: string,
    contacts: Array<{ phoneNumber: string; contactId: string; metadata?: Record<string, any> }>
  ): Promise<void> {
    if (this.isRunning) {
      throw new Error('Predictive dialer is already running');
    }

    this.isRunning = true;

    // Start background pacing job
    this.pacingInterval = setInterval(async () => {
      await this.updatePacingAndDial(tenantId, campaignId, contacts);
    }, this.config.pacingUpdateInterval);

    // Initial dial
    await this.updatePacingAndDial(tenantId, campaignId, contacts);

    // Log start
    await auditEvidenceService.logEvent({
      tenantId,
      callId: campaignId,
      eventType: 'data.access',
      eventData: {
        action: 'predictive_dialer_started',
        campaignId,
        contactCount: contacts.length
      },
      metadata: {
        service: 'predictive_dialer'
      }
    });
  }

  /**
   * Stop predictive dialing
   */
  async stopDialing(tenantId: string, campaignId: string): Promise<void> {
    this.isRunning = false;

    if (this.pacingInterval) {
      clearInterval(this.pacingInterval);
      this.pacingInterval = undefined;
    }

    // Log stop
    await auditEvidenceService.logEvent({
      tenantId,
      callId: campaignId,
      eventType: 'data.access',
      eventData: {
        action: 'predictive_dialer_stopped',
        campaignId,
        activeCalls: this.activeCalls.size
      },
      metadata: {
        service: 'predictive_dialer'
      }
    });
  }

  /**
   * Update pacing calculation and dial batch
   */
  private async updatePacingAndDial(
    tenantId: string,
    campaignId: string,
    contacts: Array<{ phoneNumber: string; contactId: string; metadata?: Record<string, any> }>
  ): Promise<void> {
    // Update metrics from agent service
    await this.updateMetrics();

    // Calculate pacing
    const pacing = this.calculatePacing();

    // Check if we should dial
    if (!this.shouldDial(pacing)) {
      return;
    }

    // Get contacts to dial (filter out already dialed)
    const contactsToDial = this.getContactsToDial(contacts, pacing.callsToDial);

    if (contactsToDial.length === 0) {
      return;
    }

    // Dial batch
    await this.dialBatch(tenantId, campaignId, contactsToDial, pacing);
  }

  /**
   * Update metrics from agent service
   */
  private async updateMetrics(): Promise<void> {
    // Get agent status from agent management service
    const agentManagementService = getAgentManagementService();
    const agents = agentManagementService.getAllAgents();
    const metrics = agentManagementService.getAllAgentMetrics();

    this.metrics.totalAgents = agents.length;
    this.metrics.availableAgents = agents.filter(a => a.status === 'available').length;
    this.metrics.busyAgents = agents.filter(a => a.status === 'busy').length;
    this.metrics.callsInProgress = this.activeCalls.size;

    // Calculate average talk time from metrics
    if (metrics.length > 0) {
      const totalTalkTime = metrics.reduce((sum, m) => sum + m.averageCallDuration, 0);
      this.metrics.averageTalkTime = totalTalkTime / metrics.length;
    }

    // Calculate agent utilization
    if (this.metrics.totalAgents > 0) {
      this.metrics.agentUtilization = this.metrics.busyAgents / this.metrics.totalAgents;
    }

    // Update answer rate (would come from campaign metrics in production)
    // For now, use rolling average
    const recentCalls = Array.from(this.activeCalls.values())
      .filter(c => c.status === 'answered' || c.status === 'no_answer' || c.status === 'busy');
    
    if (recentCalls.length > 0) {
      const answered = recentCalls.filter(c => c.status === 'answered').length;
      this.metrics.answerRate = answered / recentCalls.length;
    }
  }

  /**
   * Calculate optimal dial rate using pacing algorithm
   */
  private calculatePacing(): PacingCalculation {
    if (this.metrics.availableAgents === 0) {
      return {
        dialRate: 0,
        callsToDial: 0,
        targetUtilization: this.config.targetAgentUtilization,
        estimatedConnections: 0,
        estimatedWaitTime: 0
      };
    }

    // Pacing formula: (avg_talk_time / available_agents) * answer_rate * target_utilization
    // This ensures we dial enough to keep agents busy but not too many to cause abandonment
    
    const baseDialRate = (this.metrics.averageTalkTime / this.metrics.availableAgents) * this.metrics.answerRate;
    const dialRate = baseDialRate * this.config.targetAgentUtilization;

    // Calculate how many calls to dial in this cycle
    // Based on available agents and expected answer rate
    const estimatedConnections = Math.floor(this.metrics.availableAgents * this.metrics.answerRate);
    const callsToDial = Math.ceil(estimatedConnections / this.metrics.answerRate);

    // Estimate wait time until next agent available
    const estimatedWaitTime = this.metrics.averageWrapTime || 30;

    return {
      dialRate: Math.max(0, dialRate),
      callsToDial: Math.min(callsToDial, this.config.maxCallsPerAgent * this.metrics.availableAgents),
      targetUtilization: this.config.targetAgentUtilization,
      estimatedConnections,
      estimatedWaitTime
    };
  }

  /**
   * Determine if we should dial based on current conditions
   */
  private shouldDial(pacing: PacingCalculation): boolean {
    // Don't dial if no available agents
    if (this.metrics.availableAgents < this.config.minAvailableAgents) {
      return false;
    }

    // Don't dial if abandonment rate is too high
    if (this.metrics.abandonmentRate > this.config.maxAbandonmentRate) {
      return false;
    }

    // Don't dial if utilization is already at or above target
    if (this.metrics.agentUtilization >= this.config.targetAgentUtilization) {
      return false;
    }

    // Don't dial if we have too many calls waiting
    if (this.metrics.callsWaiting > this.metrics.availableAgents * 2) {
      return false;
    }

    return true;
  }

  /**
   * Get contacts that haven't been dialed yet
   */
  private getContactsToDial(
    contacts: Array<{ phoneNumber: string; contactId: string; metadata?: Record<string, any> }>,
    count: number
  ): Array<{ phoneNumber: string; contactId: string; metadata?: Record<string, any> }> {
    const dialedNumbers = new Set(Array.from(this.activeCalls.values()).map(c => c.phoneNumber));
    
    return contacts
      .filter(c => !dialedNumbers.has(c.phoneNumber))
      .slice(0, count);
  }

  /**
   * Dial a batch of contacts in parallel
   */
  private async dialBatch(
    tenantId: string,
    campaignId: string,
    contacts: Array<{ phoneNumber: string; contactId: string; metadata?: Record<string, any> }>,
    pacing: PacingCalculation
  ): Promise<void> {
    const dialPromises = contacts.map(contact =>
      this.placeCall(tenantId, campaignId, contact)
    );

    const results = await Promise.allSettled(dialPromises);

    // Log batch dial
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    await auditEvidenceService.logEvent({
      tenantId,
      callId: campaignId,
      eventType: 'data.access',
      eventData: {
        action: 'predictive_dial_batch',
        campaignId,
        contactsDialed: contacts.length,
        successful,
        failed,
        dialRate: pacing.dialRate
      },
      metadata: {
        service: 'predictive_dialer'
      }
    });
  }

  /**
   * Place a single outbound call via Telnyx API
   */
  private async placeCall(
    tenantId: string,
    campaignId: string,
    contact: { phoneNumber: string; contactId: string; metadata?: Record<string, any> }
  ): Promise<DialResult> {
    const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Initiate call via Telnyx Voice API
      const response = await fetch('https://api.telnyx.com/v2/calls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.telnyxApiKey}`
        },
        body: JSON.stringify({
          to: contact.phoneNumber,
          from: this.config.callerId,
          connection_id: this.config.outboundProfileId,
          webhook_url: `${this.config.webhookBaseUrl}/api/telemarketing/call-events`,
          webhook_url_method: 'POST',
          client_state: JSON.stringify({
            tenantId,
            campaignId,
            contactId: contact.contactId,
            callId
          })
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Telnyx API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      const callControlId = data.data.call_control_id;

      const dialResult: DialResult = {
        callId,
        callControlId,
        phoneNumber: contact.phoneNumber,
        status: 'initiated',
        initiatedAt: new Date()
      };

      this.activeCalls.set(callId, dialResult);

      return dialResult;
    } catch (error) {
      const dialResult: DialResult = {
        callId,
        callControlId: '',
        phoneNumber: contact.phoneNumber,
        status: 'failed',
        initiatedAt: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      this.activeCalls.set(callId, dialResult);
      throw error;
    }
  }

  /**
   * Handle call event from Telnyx webhook
   */
  async handleCallEvent(
    tenantId: string,
    event: {
      event_type: string;
      data: {
        call_control_id: string;
        call_leg_id: string;
        to: string;
        from: string;
        direction: string;
        state: string;
        client_state?: string;
      };
    }
  ): Promise<void> {
    // Find call by call_control_id
    const call = Array.from(this.activeCalls.values())
      .find(c => c.callControlId === event.data.call_control_id);

    if (!call) {
      console.warn(`Call not found for event: ${event.data.call_control_id}`);
      return;
    }

    // Update call status based on event
    switch (event.event_type) {
      case 'call.answered':
        call.status = 'answered';
        call.answeredAt = new Date();
        // Route to available agent
        await this.routeToAgent(tenantId, call);
        break;

      case 'call.hangup':
        if (call.status === 'initiated') {
          call.status = 'no_answer';
        } else if (call.status === 'answered') {
          call.status = 'completed';
          if (call.answeredAt) {
            call.duration = (new Date().getTime() - call.answeredAt.getTime()) / 1000;
          }
        }
        // Remove from active calls after a delay
        setTimeout(() => {
          this.activeCalls.delete(call.callId);
        }, 5000);
        break;

      case 'call.machine.detection':
        call.status = 'voicemail';
        break;

      case 'call.busy':
        call.status = 'busy';
        this.activeCalls.delete(call.callId);
        break;
    }

    // Update metrics
    await this.updateMetrics();
  }

  /**
   * Route answered call to available agent
   */
  private async routeToAgent(tenantId: string, call: DialResult): Promise<void> {
    // Get available agents
    const agentManagementService = getAgentManagementService();
    const agents = agentManagementService.getAllAgents()
      .filter(a => a.status === 'available');

    if (agents.length === 0) {
      // No agents available - call will be abandoned
      call.status = 'abandoned';
      this.metrics.abandonmentRate += 0.01; // Increment abandonment rate
      return;
    }

    // Select agent (round-robin or skill-based)
    const agent = agents[0]; // Simple round-robin for now
    call.connectedToAgent = agent.agentId;

    // Update agent status
    agentManagementService.setAgentStatus(agent.agentId, 'busy');

    // Transfer call to agent via Telnyx
    try {
      await fetch(`https://api.telnyx.com/v2/calls/${call.callControlId}/actions/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.telnyxApiKey}`
        },
        body: JSON.stringify({
          to: agent.sipUri,
          transfer_to: agent.sipUri
        })
      });
    } catch (error) {
      console.error(`Failed to transfer call ${call.callId} to agent ${agent.agentId}:`, error);
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): DialingMetrics {
    return { ...this.metrics };
  }

  /**
   * Get active calls
   */
  getActiveCalls(): DialResult[] {
    return Array.from(this.activeCalls.values());
  }

  /**
   * Get call by ID
   */
  getCall(callId: string): DialResult | undefined {
    return this.activeCalls.get(callId);
  }
}

// Singleton instance (would be initialized with config)
let predictiveDialerInstance: PredictiveDialerService | null = null;

export function getPredictiveDialer(config?: PredictiveDialerConfig): PredictiveDialerService {
  if (!predictiveDialerInstance && config) {
    predictiveDialerInstance = new PredictiveDialerService(config);
  }
  if (!predictiveDialerInstance) {
    throw new Error('Predictive dialer not initialized. Provide config on first call.');
  }
  return predictiveDialerInstance;
}

export const predictiveDialerService = {
  getInstance: getPredictiveDialer,
  createInstance: (config: PredictiveDialerConfig) => {
    predictiveDialerInstance = new PredictiveDialerService(config);
    return predictiveDialerInstance;
  }
};
