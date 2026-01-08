// Advanced ACD (Automated Call Distribution) Service
// Skill-based routing, language routing, geographic routing, and screen pop

import { agentManagementService } from '../callCenter/agentManagementService';
import { auditEvidenceService } from '../compliance/auditEvidenceService';

export interface AgentSkill {
  agentId: string;
  skills: string[]; // e.g., ['sales', 'support', 'billing']
  languages: string[]; // e.g., ['en-US', 'es-US']
  experience: 'junior' | 'mid' | 'senior' | 'expert';
  geographicRegions?: string[]; // e.g., ['US-East', 'US-West']
  maxConcurrentCalls: number;
  currentCalls: number;
  priority: number; // Higher = more priority
}

export interface CallRoutingRequest {
  callId: string;
  tenantId: string;
  requiredSkills?: string[];
  preferredLanguage?: string;
  geographicRegion?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  customerData?: Record<string, any>; // For screen pop
  metadata?: Record<string, any>;
}

export interface RoutingResult {
  agentId: string;
  agentSipUri: string;
  routingMethod: 'skill_match' | 'language_match' | 'geographic' | 'round_robin' | 'least_busy';
  matchScore: number; // 0-1, how well agent matches requirements
  screenPopData?: Record<string, any>;
}

export interface ScreenPopData {
  customerId?: string;
  customerName?: string;
  phoneNumber: string;
  email?: string;
  previousInteractions?: Array<{
    date: Date;
    type: 'call' | 'email' | 'sms';
    outcome: string;
    notes?: string;
  }>;
  accountInfo?: Record<string, any>;
  tags?: string[];
  metadata?: Record<string, any>;
}

class AdvancedACDService {
  private agentSkills: Map<string, AgentSkill> = new Map();
  private callQueues: Map<string, CallRoutingRequest[]> = new Map(); // priority -> queue

  /**
   * Register agent skills
   */
  async registerAgentSkills(
    tenantId: string,
    agentId: string,
    skills: AgentSkill
  ): Promise<void> {
    this.agentSkills.set(agentId, skills);

    await auditEvidenceService.logEvent({
      tenantId,
      callId: agentId,
      eventType: 'data.access',
      eventData: {
        action: 'agent_skills_registered',
        agentId,
        skills: skills.skills,
        languages: skills.languages
      },
      metadata: {
        service: 'advanced_acd'
      }
    });
  }

  /**
   * Route call to best available agent
   */
  async routeCall(request: CallRoutingRequest): Promise<RoutingResult> {
    const availableAgents = this.getAvailableAgents();

    if (availableAgents.length === 0) {
      // No agents available - queue call
      this.queueCall(request);
      throw new Error('No agents available - call queued');
    }

    // Try skill-based routing first
    if (request.requiredSkills && request.requiredSkills.length > 0) {
      const skillMatch = this.routeBySkills(availableAgents, request);
      if (skillMatch) {
        return skillMatch;
      }
    }

    // Try language-based routing
    if (request.preferredLanguage) {
      const languageMatch = this.routeByLanguage(availableAgents, request);
      if (languageMatch) {
        return languageMatch;
      }
    }

    // Try geographic routing
    if (request.geographicRegion) {
      const geoMatch = this.routeByGeography(availableAgents, request);
      if (geoMatch) {
        return geoMatch;
      }
    }

    // Fallback to least busy or round-robin
    return this.routeByLeastBusy(availableAgents, request);
  }

  /**
   * Route by agent skills
   */
  private routeBySkills(
    agents: AgentSkill[],
    request: CallRoutingRequest
  ): RoutingResult | null {
    if (!request.requiredSkills || request.requiredSkills.length === 0) {
      return null;
    }

    // Score agents based on skill match
    const scoredAgents = agents
      .map(agent => {
        const matchingSkills = agent.skills.filter(skill =>
          request.requiredSkills!.includes(skill)
        );
        const matchScore = matchingSkills.length / request.requiredSkills!.length;

        // Boost score for higher experience
        const experienceBoost = {
          junior: 0.1,
          mid: 0.2,
          senior: 0.3,
          expert: 0.4
        }[agent.experience] || 0;

        return {
          agent,
          matchScore: matchScore + experienceBoost,
          matchingSkills
        };
      })
      .filter(a => a.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);

    if (scoredAgents.length === 0) {
      return null;
    }

    const bestMatch = scoredAgents[0];
    const agent = agentManagementService.getAgent(bestMatch.agent.agentId);
    if (!agent) {
      return null;
    }

    return {
      agentId: bestMatch.agent.agentId,
      agentSipUri: agent.sipUri,
      routingMethod: 'skill_match',
      matchScore: bestMatch.matchScore,
      screenPopData: this.prepareScreenPop(request)
    };
  }

  /**
   * Route by language
   */
  private routeByLanguage(
    agents: AgentSkill[],
    request: CallRoutingRequest
  ): RoutingResult | null {
    if (!request.preferredLanguage) {
      return null;
    }

    const languageAgents = agents.filter(agent =>
      agent.languages.includes(request.preferredLanguage!)
    );

    if (languageAgents.length === 0) {
      return null;
    }

    // Select least busy agent with language match
    const leastBusy = languageAgents.reduce((best, current) => {
      const bestUtilization = best.currentCalls / best.maxConcurrentCalls;
      const currentUtilization = current.currentCalls / current.maxConcurrentCalls;
      return currentUtilization < bestUtilization ? current : best;
    });

    const agent = agentManagementService.getAgent(leastBusy.agentId);
    if (!agent) {
      return null;
    }

    return {
      agentId: leastBusy.agentId,
      agentSipUri: agent.sipUri,
      routingMethod: 'language_match',
      matchScore: 0.8, // Good match for language
      screenPopData: this.prepareScreenPop(request)
    };
  }

  /**
   * Route by geography
   */
  private routeByGeography(
    agents: AgentSkill[],
    request: CallRoutingRequest
  ): RoutingResult | null {
    if (!request.geographicRegion) {
      return null;
    }

    const geoAgents = agents.filter(agent =>
      agent.geographicRegions?.includes(request.geographicRegion!)
    );

    if (geoAgents.length === 0) {
      return null;
    }

    // Select least busy agent in region
    const leastBusy = geoAgents.reduce((best, current) => {
      const bestUtilization = best.currentCalls / best.maxConcurrentCalls;
      const currentUtilization = current.currentCalls / current.maxConcurrentCalls;
      return currentUtilization < bestUtilization ? current : best;
    });

    const agent = agentManagementService.getAgent(leastBusy.agentId);
    if (!agent) {
      return null;
    }

    return {
      agentId: leastBusy.agentId,
      agentSipUri: agent.sipUri,
      routingMethod: 'geographic',
      matchScore: 0.7,
      screenPopData: this.prepareScreenPop(request)
    };
  }

  /**
   * Route by least busy (fallback)
   */
  private routeByLeastBusy(
    agents: AgentSkill[],
    request: CallRoutingRequest
  ): RoutingResult {
    const leastBusy = agents.reduce((best, current) => {
      const bestUtilization = best.currentCalls / best.maxConcurrentCalls;
      const currentUtilization = current.currentCalls / current.maxConcurrentCalls;
      return currentUtilization < bestUtilization ? current : best;
    });

    const agent = agentManagementService.getAgent(leastBusy.agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    return {
      agentId: leastBusy.agentId,
      agentSipUri: agent.sipUri,
      routingMethod: 'least_busy',
      matchScore: 0.5,
      screenPopData: this.prepareScreenPop(request)
    };
  }

  /**
   * Prepare screen pop data
   */
  private prepareScreenPop(request: CallRoutingRequest): ScreenPopData {
    return {
      phoneNumber: request.customerData?.phoneNumber || '',
      customerId: request.customerData?.customerId,
      customerName: request.customerData?.customerName,
      email: request.customerData?.email,
      previousInteractions: request.customerData?.previousInteractions || [],
      accountInfo: request.customerData?.accountInfo,
      tags: request.customerData?.tags,
      metadata: request.metadata
    };
  }

  /**
   * Get available agents with skills
   */
  private getAvailableAgents(): AgentSkill[] {
    const allAgents = agentManagementService.getAllAgents()
      .filter(a => a.status === 'available');

    return allAgents
      .map(agent => this.agentSkills.get(agent.agentId))
      .filter((skill): skill is AgentSkill => skill !== undefined)
      .filter(skill => skill.currentCalls < skill.maxConcurrentCalls);
  }

  /**
   * Queue call when no agents available
   */
  private queueCall(request: CallRoutingRequest): void {
    const priority = request.priority || 'medium';
    const queue = this.callQueues.get(priority) || [];
    queue.push(request);
    this.callQueues.set(priority, queue);
  }

  /**
   * Get queued calls
   */
  getQueuedCalls(priority?: CallRoutingRequest['priority']): CallRoutingRequest[] {
    if (priority) {
      return this.callQueues.get(priority) || [];
    }

    // Return all queued calls sorted by priority
    const priorities: CallRoutingRequest['priority'][] = ['urgent', 'high', 'medium', 'low'];
    const allQueued: CallRoutingRequest[] = [];

    for (const p of priorities) {
      allQueued.push(...(this.callQueues.get(p) || []));
    }

    return allQueued;
  }

  /**
   * Get agent skills
   */
  getAgentSkills(agentId: string): AgentSkill | undefined {
    return this.agentSkills.get(agentId);
  }
}

export const advancedACDService = new AdvancedACDService();
