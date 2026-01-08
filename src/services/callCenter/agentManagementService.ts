// Agent Management Service
// Manages SIP connection agents for the call center

import type { CallCenterAgent } from './callCenterService';

export interface AgentRegistration {
  agentId: string;
  sipConnectionId: string;
  sipUri: string;
  username: string;
  displayName: string;
  registeredAt: Date;
  lastHeartbeat?: Date;
}

export interface AgentMetrics {
  agentId: string;
  totalCalls: number;
  answeredCalls: number;
  missedCalls: number;
  averageCallDuration: number;
  currentStatus: CallCenterAgent['status'];
  lastCallTime?: Date;
}

export class AgentManagementService {
  private agents: Map<string, CallCenterAgent> = new Map();
  private registrations: Map<string, AgentRegistration> = new Map();
  private metrics: Map<string, AgentMetrics> = new Map();

  /**
   * Register a new agent
   */
  registerAgent(registration: AgentRegistration): CallCenterAgent {
    const agent: CallCenterAgent = {
      agentId: registration.agentId,
      sipConnectionId: registration.sipConnectionId,
      sipUri: registration.sipUri,
      username: registration.username,
      displayName: registration.displayName,
      status: 'offline',
      lastSeen: registration.registeredAt,
      metadata: {
        registeredAt: registration.registeredAt.toISOString()
      }
    };

    this.agents.set(registration.agentId, agent);
    this.registrations.set(registration.agentId, registration);
    
    // Initialize metrics
    this.metrics.set(registration.agentId, {
      agentId: registration.agentId,
      totalCalls: 0,
      answeredCalls: 0,
      missedCalls: 0,
      averageCallDuration: 0,
      currentStatus: 'offline'
    });

    return agent;
  }

  /**
   * Update agent heartbeat (indicates agent is online)
   */
  updateHeartbeat(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.lastSeen = new Date();
      agent.status = agent.status === 'offline' ? 'available' : agent.status;
      this.agents.set(agentId, agent);
    }

    const registration = this.registrations.get(agentId);
    if (registration) {
      registration.lastHeartbeat = new Date();
      this.registrations.set(agentId, registration);
    }
  }

  /**
   * Set agent status
   */
  setAgentStatus(agentId: string, status: CallCenterAgent['status']): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.status = status;
      agent.lastSeen = new Date();
      this.agents.set(agentId, agent);

      const metrics = this.metrics.get(agentId);
      if (metrics) {
        metrics.currentStatus = status;
        this.metrics.set(agentId, metrics);
      }
    }
  }

  /**
   * Get agent by ID
   */
  getAgent(agentId: string): CallCenterAgent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Get all agents
   */
  getAllAgents(): CallCenterAgent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get available agents
   */
  getAvailableAgents(): CallCenterAgent[] {
    return Array.from(this.agents.values())
      .filter(agent => agent.status === 'available');
  }

  /**
   * Get agent metrics
   */
  getAgentMetrics(agentId: string): AgentMetrics | undefined {
    return this.metrics.get(agentId);
  }

  /**
   * Get all agent metrics
   */
  getAllAgentMetrics(): AgentMetrics[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Update agent metrics after a call
   */
  updateCallMetrics(agentId: string, answered: boolean, duration?: number): void {
    const metrics = this.metrics.get(agentId);
    if (!metrics) {
      return;
    }

    metrics.totalCalls++;
    if (answered) {
      metrics.answeredCalls++;
      metrics.lastCallTime = new Date();
      
      if (duration) {
        // Calculate rolling average
        const totalDuration = metrics.averageCallDuration * (metrics.answeredCalls - 1) + duration;
        metrics.averageCallDuration = totalDuration / metrics.answeredCalls;
      }
    } else {
      metrics.missedCalls++;
    }

    this.metrics.set(agentId, metrics);
  }

  /**
   * Unregister agent
   */
  unregisterAgent(agentId: string): boolean {
    const removed = this.agents.delete(agentId);
    this.registrations.delete(agentId);
    this.metrics.delete(agentId);
    return removed;
  }

  /**
   * Get agents by status
   */
  getAgentsByStatus(status: CallCenterAgent['status']): CallCenterAgent[] {
    return Array.from(this.agents.values())
      .filter(agent => agent.status === status);
  }

  /**
   * Check if agent is online (has recent heartbeat)
   */
  isAgentOnline(agentId: string, maxAgeSeconds: number = 60): boolean {
    const registration = this.registrations.get(agentId);
    if (!registration || !registration.lastHeartbeat) {
      return false;
    }

    const ageSeconds = (Date.now() - registration.lastHeartbeat.getTime()) / 1000;
    return ageSeconds < maxAgeSeconds;
  }

  /**
   * Mark offline agents (no heartbeat for specified time)
   */
  markOfflineAgents(maxAgeSeconds: number = 120): number {
    let marked = 0;
    for (const [agentId, registration] of this.registrations.entries()) {
      if (!registration.lastHeartbeat) {
        continue;
      }

      const ageSeconds = (Date.now() - registration.lastHeartbeat.getTime()) / 1000;
      if (ageSeconds > maxAgeSeconds) {
        this.setAgentStatus(agentId, 'offline');
        marked++;
      }
    }
    return marked;
  }
}

// Singleton instance
let agentManagementServiceInstance: AgentManagementService | null = null;

/**
 * Get agent management service instance
 */
export function getAgentManagementService(): AgentManagementService {
  if (!agentManagementServiceInstance) {
    agentManagementServiceInstance = new AgentManagementService();
  }
  return agentManagementServiceInstance;
}
