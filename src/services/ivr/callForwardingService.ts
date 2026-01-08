// Call Forwarding Service
// Handles call transfers and routing to agents, departments, or external numbers

import { ivrService, type IVRCallSession } from './ivrService';

export interface ForwardingConfig {
  type: 'agent' | 'department' | 'external' | 'queue';
  destination: string; // Phone number, SIP URI, or queue ID
  timeout: number;
  callerId?: string;
  recordCall?: boolean;
}

export interface Agent {
  id: string;
  name: string;
  phoneNumber?: string;
  sipUri?: string;
  department: string;
  industry: string;
  status: 'available' | 'busy' | 'offline';
  skills?: string[];
}

class CallForwardingService {
  private agents: Map<string, Agent> = new Map();
  private webhookBaseUrl: string;

  constructor() {
    this.webhookBaseUrl = process.env.WEBHOOK_BASE_URL || 'https://tetrixcorp.com';
    this.initializeDefaultAgents();
  }

  /**
   * Initialize default agents for each industry
   */
  private initializeDefaultAgents() {
    // Healthcare agents
    this.agents.set('healthcare_scheduler', {
      id: 'healthcare_scheduler',
      name: 'Healthcare Scheduler',
      phoneNumber: '+18005551234',
      department: 'Scheduling',
      industry: 'healthcare',
      status: 'available',
      skills: ['appointment_scheduling', 'patient_intake']
    });

    this.agents.set('healthcare_billing', {
      id: 'healthcare_billing',
      name: 'Healthcare Billing',
      phoneNumber: '+18005551235',
      department: 'Billing',
      industry: 'healthcare',
      status: 'available',
      skills: ['billing', 'insurance_verification']
    });

    // Insurance agents
    this.agents.set('insurance_claims', {
      id: 'insurance_claims',
      name: 'Claims Adjuster',
      phoneNumber: '+18005551236',
      department: 'Claims',
      industry: 'insurance',
      status: 'available',
      skills: ['fnol', 'claim_processing']
    });

    // Retail agents
    this.agents.set('retail_customer_service', {
      id: 'retail_customer_service',
      name: 'Customer Service',
      phoneNumber: '+18005551237',
      department: 'Customer Service',
      industry: 'retail',
      status: 'available',
      skills: ['order_status', 'returns', 'product_info']
    });

    // Construction agents
    this.agents.set('construction_project_manager', {
      id: 'construction_project_manager',
      name: 'Project Manager',
      phoneNumber: '+18005551238',
      department: 'Project Management',
      industry: 'construction',
      status: 'available',
      skills: ['project_inquiry', 'vendor_coordination']
    });

    // Real Estate agents
    this.agents.set('real_estate_agent', {
      id: 'real_estate_agent',
      name: 'Real Estate Agent',
      phoneNumber: '+18005551239',
      department: 'Sales',
      industry: 'real_estate',
      status: 'available',
      skills: ['property_inquiry', 'virtual_tour', 'contract_followup']
    });
  }

  /**
   * Forward call to agent
   */
  async forwardToAgent(session: IVRCallSession, agentType: string): Promise<string> {
    // Find available agent for industry and type
    const agent = this.findAvailableAgent(session.industry, agentType);
    
    if (!agent) {
      return this.generateNoAgentAvailableTeXML(session);
    }

    const forwardingConfig: ForwardingConfig = {
      type: 'agent',
      destination: agent.phoneNumber || agent.sipUri || '',
      timeout: 30,
      recordCall: true
    };

    return this.generateForwardingTeXML(forwardingConfig, session);
  }

  /**
   * Forward call to department
   */
  async forwardToDepartment(session: IVRCallSession, department: string): Promise<string> {
    // Find available agent in department
    const agents = Array.from(this.agents.values())
      .filter(a => a.industry === session.industry && a.department === department && a.status === 'available');

    if (agents.length === 0) {
      return this.generateNoAgentAvailableTeXML(session);
    }

    // Use first available agent or implement round-robin
    const agent = agents[0];
    
    const forwardingConfig: ForwardingConfig = {
      type: 'department',
      destination: agent.phoneNumber || agent.sipUri || '',
      timeout: 30,
      recordCall: true
    };

    return this.generateForwardingTeXML(forwardingConfig, session);
  }

  /**
   * Forward call to external number
   */
  async forwardToExternal(session: IVRCallSession, phoneNumber: string): Promise<string> {
    const forwardingConfig: ForwardingConfig = {
      type: 'external',
      destination: phoneNumber,
      timeout: 30,
      recordCall: false
    };

    return this.generateForwardingTeXML(forwardingConfig, session);
  }

  /**
   * Forward call to queue
   */
  async forwardToQueue(session: IVRCallSession, queueId: string): Promise<string> {
    const forwardingConfig: ForwardingConfig = {
      type: 'queue',
      destination: queueId,
      timeout: 60,
      recordCall: true
    };

    return this.generateQueueTeXML(queueId, session);
  }

  /**
   * Find available agent
   */
  private findAvailableAgent(industry: string, agentType: string): Agent | undefined {
    const agents = Array.from(this.agents.values())
      .filter(a => a.industry === industry && a.status === 'available');

    // Match by skills or agent type
    return agents.find(a => 
      a.skills?.includes(agentType) || 
      a.id.includes(agentType) ||
      a.department.toLowerCase().includes(agentType.toLowerCase())
    ) || agents[0]; // Fallback to first available
  }

  /**
   * Generate forwarding TeXML
   */
  private generateForwardingTeXML(config: ForwardingConfig, session: IVRCallSession): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n';
    
    xml += '  <Say voice="alice">Please hold while we connect you.</Say>\n';
    
    if (config.type === 'queue') {
      xml += this.generateQueueTeXML(config.destination, session);
    } else {
      xml += `  <Dial timeout="${config.timeout}" `;
      
      if (config.recordCall) {
        xml += 'record="record-from-answer" ';
      }
      
      xml += `callerId="${config.callerId || session.to}">\n`;
      
      if (config.destination.startsWith('sip:')) {
        xml += `    <Sip>${config.destination}</Sip>\n`;
      } else {
        xml += `    <Number>${config.destination}</Number>\n`;
      }
      
      xml += '  </Dial>\n';
      xml += '  <Say voice="alice">The call could not be completed. Please try again later.</Say>\n';
      xml += '  <Hangup/>\n';
    }
    
    xml += '</Response>';
    return xml;
  }

  /**
   * Generate queue TeXML
   */
  private generateQueueTeXML(queueId: string, session: IVRCallSession): string {
    const waitUrl = `${this.webhookBaseUrl}/api/ivr/${session.sessionId}/queue-wait`;
    const actionUrl = `${this.webhookBaseUrl}/api/ivr/${session.sessionId}/queue-action`;
    
    return `  <Say voice="alice">Thank you for calling. All our representatives are currently busy. Please hold and we will connect you as soon as possible.</Say>\n` +
           `  <Enqueue waitUrl="${waitUrl}" action="${actionUrl}">\n` +
           `    <Queue>${queueId}</Queue>\n` +
           `  </Enqueue>\n` +
           `  <Say voice="alice">We're sorry, but we couldn't connect you to a representative. Please try again later.</Say>\n` +
           `  <Hangup/>\n`;
  }

  /**
   * Generate no agent available TeXML
   */
  private generateNoAgentAvailableTeXML(session: IVRCallSession): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">We're sorry, but no representatives are currently available. Please leave a message and we will return your call as soon as possible.</Say>
  <Record timeout="30" maxLength="300" playBeep="true" transcribe="true" action="${this.webhookBaseUrl}/api/ivr/${session.sessionId}/voicemail" method="POST"/>
  <Say voice="alice">Thank you for your message. Goodbye.</Say>
  <Hangup/>
</Response>`;
  }

  /**
   * Register agent
   */
  registerAgent(agent: Agent): void {
    this.agents.set(agent.id, agent);
  }

  /**
   * Update agent status
   */
  updateAgentStatus(agentId: string, status: Agent['status']): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.status = status;
    }
  }

  /**
   * Get agent by ID
   */
  getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Get all agents for industry
   */
  getAgentsByIndustry(industry: string): Agent[] {
    return Array.from(this.agents.values())
      .filter(a => a.industry === industry);
  }
}

export const callForwardingService = new CallForwardingService();

