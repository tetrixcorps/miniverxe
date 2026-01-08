// Call Center Service
// Manages call routing to multiple agents (SIP connections) with call recording and voicemail
// Based on Telnyx Call Center architecture, adapted for TypeScript/Node.js

export interface CallCenterAgent {
  agentId: string;
  sipConnectionId: string;
  sipUri: string; // e.g., sip:agent1@telnyx.com
  username: string;
  displayName: string;
  status: 'available' | 'busy' | 'offline';
  lastSeen?: Date;
  metadata?: Record<string, any>;
}

export interface CallCenterConfig {
  callCenterNumber: string;
  outboundProfileId: string;
  maxDialAttempts: number;
  dialTimeout: number;
  voicemailEnabled: boolean;
  recordingEnabled: boolean;
  webhookBaseUrl: string;
  agents: CallCenterAgent[];
}

export interface CallCenterCall {
  callId: string;
  callControlId: string;
  from: string;
  to: string;
  status: 'ringing' | 'answered' | 'busy' | 'no_answer' | 'voicemail' | 'completed' | 'failed';
  agentId?: string;
  startTime: Date;
  answerTime?: Date;
  endTime?: Date;
  recordingUrl?: string;
  voicemailUrl?: string;
  metadata?: Record<string, any>;
}

export interface DialResult {
  success: boolean;
  agentId?: string;
  reason?: 'answered' | 'busy' | 'no_answer' | 'timeout' | 'failed';
  callControlId?: string;
}

export class CallCenterService {
  private config: CallCenterConfig;
  private activeCalls: Map<string, CallCenterCall> = new Map();
  private agentStatus: Map<string, CallCenterAgent> = new Map();

  constructor(config: CallCenterConfig) {
    this.config = config;
    this.initializeAgents();
  }

  /**
   * Initialize agent status tracking
   */
  private initializeAgents() {
    // Clear existing agents
    this.agentStatus.clear();
    // Add all agents from config
    for (const agent of this.config.agents) {
      this.agentStatus.set(agent.agentId, agent);
    }
  }

  /**
   * Generate TeXML for inbound call greeting
   */
  generateInboundGreeting(callId: string): string {
    const webhookUrl = `${this.config.webhookBaseUrl}/api/call-center/events`;
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Hello, you have reached the call center. Please hold while we connect you to the next available agent.</Say>
  <Redirect>${this.config.webhookBaseUrl}/api/call-center/dial-agents?callId=${callId}</Redirect>
</Response>`;
  }

  /**
   * Generate TeXML for dialing multiple agents simultaneously
   */
  generateDialAgentsTeXML(callId: string, attempt: number = 1): string {
    const availableAgents = this.getAvailableAgents();
    
    if (availableAgents.length === 0) {
      return this.generateBusyMessage(callId);
    }

    // Build SIP URIs for all available agents
    const sipUris = availableAgents
      .map(agent => `    <Sip>${agent.sipUri}</Sip>`)
      .join('\n');

    const webhookUrl = `${this.config.webhookBaseUrl}/api/call-center/outbound/event`;
    const timeout = this.config.dialTimeout;
    const recordSetting = this.config.recordingEnabled ? 'record-from-answer' : 'do-not-record';

    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial timeout="${timeout}" record="${recordSetting}" 
        action="${webhookUrl}" 
        method="POST"
        hangupOnStar="false"
        timeLimit="3600"
        callerId="${this.config.callCenterNumber}">
${sipUris}
  </Dial>
  <Redirect>${this.config.webhookBaseUrl}/api/call-center/retry-dial?callId=${callId}&attempt=${attempt + 1}</Redirect>
</Response>`;
  }

  /**
   * Generate TeXML for retry dialing (second attempt)
   */
  generateRetryDialTeXML(callId: string, attempt: number): string {
    // If we've reached or exceeded max attempts, go to voicemail
    if (attempt >= this.config.maxDialAttempts) {
      return this.generateVoicemailTeXML(callId);
    }

    return this.generateDialAgentsTeXML(callId, attempt);
  }

  /**
   * Generate TeXML for busy message
   */
  generateBusyMessage(callId: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">We're sorry, but all agents are currently busy. Please try again later or leave a voicemail.</Say>
  ${this.config.voicemailEnabled ? `<Redirect>${this.config.webhookBaseUrl}/api/call-center/voicemail?callId=${callId}</Redirect>` : '<Hangup/>'}
</Response>`;
  }

  /**
   * Generate TeXML for voicemail recording
   */
  generateVoicemailTeXML(callId: string): string {
    if (!this.config.voicemailEnabled) {
      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">We're sorry, but no agents are available at this time. Please try again later. Thank you for calling.</Say>
  <Hangup/>
</Response>`;
    }

    const callbackUrl = `${this.config.webhookBaseUrl}/api/call-center/voicemail/callback?callId=${callId}`;

    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">No agents are available at this time. Please leave a message after the beep. Press the pound key when you're finished.</Say>
  <Record timeout="10" maxLength="300" playBeep="true" 
          finishOnKey="#"
          action="${callbackUrl}"
          method="POST"
          transcribe="true"
          transcribeCallback="${callbackUrl}">
    <Say voice="alice">Please leave your message after the beep.</Say>
  </Record>
  <Say voice="alice">Thank you for your message. We will get back to you as soon as possible.</Say>
  <Hangup/>
</Response>`;
  }

  /**
   * Generate TeXML for answered call (thank you message after call ends)
   */
  generateAnsweredCallTeXML(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Thank you for calling. Have a great day!</Say>
  <Hangup/>
</Response>`;
  }

  /**
   * Get available agents
   */
  getAvailableAgents(): CallCenterAgent[] {
    return Array.from(this.agentStatus.values())
      .filter(agent => agent.status === 'available');
  }

  /**
   * Get all agents
   */
  getAllAgents(): CallCenterAgent[] {
    return Array.from(this.agentStatus.values());
  }

  /**
   * Update agent status
   */
  updateAgentStatus(agentId: string, status: CallCenterAgent['status']): void {
    const agent = this.agentStatus.get(agentId);
    if (agent) {
      agent.status = status;
      agent.lastSeen = new Date();
      this.agentStatus.set(agentId, agent);
    }
  }

  /**
   * Create a new call record
   */
  createCall(callId: string, from: string, to: string, callControlId: string): CallCenterCall {
    const call: CallCenterCall = {
      callId,
      callControlId,
      from,
      to,
      status: 'ringing',
      startTime: new Date(),
      metadata: {}
    };
    this.activeCalls.set(callId, call);
    return call;
  }

  /**
   * Update call status
   */
  updateCallStatus(callId: string, status: CallCenterCall['status'], agentId?: string): CallCenterCall | null {
    const call = this.activeCalls.get(callId);
    if (!call) {
      return null;
    }

    call.status = status;
    if (agentId) {
      call.agentId = agentId;
    }
    if (status === 'answered') {
      call.answerTime = new Date();
    }
    if (status === 'completed' || status === 'failed') {
      call.endTime = new Date();
    }

    this.activeCalls.set(callId, call);
    return call;
  }

  /**
   * Get call by ID
   */
  getCall(callId: string): CallCenterCall | undefined {
    return this.activeCalls.get(callId);
  }

  /**
   * Get active calls
   */
  getActiveCalls(): CallCenterCall[] {
    return Array.from(this.activeCalls.values())
      .filter(call => call.status !== 'completed' && call.status !== 'failed');
  }

  /**
   * Add agent to call center
   */
  addAgent(agent: CallCenterAgent): void {
    this.agentStatus.set(agent.agentId, agent);
    this.config.agents.push(agent);
  }

  /**
   * Remove agent from call center
   */
  removeAgent(agentId: string): void {
    this.agentStatus.delete(agentId);
    this.config.agents = this.config.agents.filter(a => a.agentId !== agentId);
  }

  /**
   * Get configuration
   */
  getConfig(): CallCenterConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<CallCenterConfig>): void {
    this.config = { ...this.config, ...updates };
    if (updates.agents) {
      this.initializeAgents();
    }
  }
}

// Singleton instance
let callCenterServiceInstance: CallCenterService | null = null;

/**
 * Initialize call center service
 */
export function initializeCallCenterService(config: CallCenterConfig): CallCenterService {
  callCenterServiceInstance = new CallCenterService(config);
  return callCenterServiceInstance;
}

/**
 * Get call center service instance
 */
export function getCallCenterService(): CallCenterService {
  if (!callCenterServiceInstance) {
    throw new Error('Call Center Service not initialized. Call initializeCallCenterService first.');
  }
  return callCenterServiceInstance;
}
