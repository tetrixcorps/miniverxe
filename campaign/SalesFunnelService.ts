// Sales Funnel Service
// Manages the complete sales funnel for email and SMS campaigns

interface Lead {
  id: string;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  company: string;
  industry: 'construction' | 'fleet' | 'healthcare';
  source: 'email' | 'sms' | 'website' | 'referral';
  status: 'new' | 'contacted' | 'interested' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  score: number; // 0-100 lead scoring
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt?: Date;
  customFields: Record<string, any>;
  tags: string[];
  notes?: string;
}

interface FunnelStage {
  name: string;
  description: string;
  actions: FunnelAction[];
  triggers: FunnelTrigger[];
  nextStage?: string;
  previousStage?: string;
  expectedDuration: number; // in days
  conversionRate: number; // percentage
}

interface FunnelAction {
  type: 'email' | 'sms' | 'call' | 'meeting' | 'demo' | 'proposal';
  template: string;
  delay: number; // in hours
  conditions?: Record<string, any>;
  priority: 'high' | 'medium' | 'low';
}

interface FunnelTrigger {
  type: 'email_open' | 'email_click' | 'sms_response' | 'website_visit' | 'form_submit' | 'demo_request' | 'time_based';
  conditions?: Record<string, any>;
  delay?: number; // in hours
}

interface CampaignMetrics {
  totalLeads: number;
  emailLeads: number;
  smsLeads: number;
  conversionRate: number;
  averageScore: number;
  stageDistribution: Record<string, number>;
  industryDistribution: Record<string, number>;
  sourceDistribution: Record<string, number>;
  timeToConversion: number; // in days
  revenue: number;
}

export class SalesFunnelService {
  private leads: Lead[] = [];
  private funnelStages: Map<string, FunnelStage> = new Map();

  constructor() {
    this.initializeFunnelStages();
  }

  // Initialize the sales funnel stages
  private initializeFunnelStages(): void {
    // Stage 1: New Lead
    this.funnelStages.set('new', {
      name: 'New Lead',
      description: 'Lead has been captured but not yet contacted',
      actions: [
        {
          type: 'email',
          template: 'welcome_email',
          delay: 0, // Immediate
          priority: 'high'
        },
        {
          type: 'sms',
          template: 'welcome_sms',
          delay: 2, // 2 hours after email
          priority: 'medium'
        }
      ],
      triggers: [
        {
          type: 'time_based',
          delay: 24 // Move to contacted after 24 hours
        }
      ],
      nextStage: 'contacted',
      expectedDuration: 1,
      conversionRate: 85
    });

    // Stage 2: Contacted
    this.funnelStages.set('contacted', {
      name: 'Contacted',
      description: 'Lead has been contacted via email and/or SMS',
      actions: [
        {
          type: 'email',
          template: 'follow_up_email',
          delay: 48, // 2 days after initial contact
          priority: 'high'
        },
        {
          type: 'sms',
          template: 'follow_up_sms',
          delay: 72, // 3 days after initial contact
          priority: 'medium'
        }
      ],
      triggers: [
        {
          type: 'email_open',
          conditions: { count: 1 }
        },
        {
          type: 'email_click',
          conditions: { count: 1 }
        },
        {
          type: 'sms_response',
          conditions: { response: 'yes' }
        },
        {
          type: 'time_based',
          delay: 168 // 7 days
        }
      ],
      nextStage: 'interested',
      previousStage: 'new',
      expectedDuration: 7,
      conversionRate: 60
    });

    // Stage 3: Interested
    this.funnelStages.set('interested', {
      name: 'Interested',
      description: 'Lead has shown interest in the product/service',
      actions: [
        {
          type: 'email',
          template: 'value_proposition_email',
          delay: 24, // 1 day after showing interest
          priority: 'high'
        },
        {
          type: 'call',
          template: 'qualification_call',
          delay: 48, // 2 days after showing interest
          priority: 'high'
        },
        {
          type: 'email',
          template: 'case_study_email',
          delay: 120, // 5 days after showing interest
          priority: 'medium'
        }
      ],
      triggers: [
        {
          type: 'website_visit',
          conditions: { pages: ['pricing', 'features', 'demo'] }
        },
        {
          type: 'demo_request',
          conditions: {}
        },
        {
          type: 'time_based',
          delay: 336 // 14 days
        }
      ],
      nextStage: 'qualified',
      previousStage: 'contacted',
      expectedDuration: 14,
      conversionRate: 40
    });

    // Stage 4: Qualified
    this.funnelStages.set('qualified', {
      name: 'Qualified',
      description: 'Lead has been qualified as a potential customer',
      actions: [
        {
          type: 'meeting',
          template: 'demo_meeting',
          delay: 24, // 1 day after qualification
          priority: 'high'
        },
        {
          type: 'email',
          template: 'demo_preparation_email',
          delay: 2, // 2 hours before demo
          priority: 'high'
        },
        {
          type: 'email',
          template: 'pricing_email',
          delay: 48, // 2 days after qualification
          priority: 'medium'
        }
      ],
      triggers: [
        {
          type: 'demo_request',
          conditions: {}
        },
        {
          type: 'time_based',
          delay: 168 // 7 days
        }
      ],
      nextStage: 'proposal',
      previousStage: 'interested',
      expectedDuration: 7,
      conversionRate: 25
    });

    // Stage 5: Proposal
    this.funnelStages.set('proposal', {
      name: 'Proposal',
      description: 'Proposal has been sent to the lead',
      actions: [
        {
          type: 'email',
          template: 'proposal_follow_up',
          delay: 72, // 3 days after proposal
          priority: 'high'
        },
        {
          type: 'call',
          template: 'proposal_call',
          delay: 120, // 5 days after proposal
          priority: 'high'
        },
        {
          type: 'email',
          template: 'testimonial_email',
          delay: 168, // 7 days after proposal
          priority: 'medium'
        }
      ],
      triggers: [
        {
          type: 'time_based',
          delay: 336 // 14 days
        }
      ],
      nextStage: 'negotiation',
      previousStage: 'qualified',
      expectedDuration: 14,
      conversionRate: 15
    });

    // Stage 6: Negotiation
    this.funnelStages.set('negotiation', {
      name: 'Negotiation',
      description: 'Lead is in negotiation phase',
      actions: [
        {
          type: 'call',
          template: 'negotiation_call',
          delay: 24, // 1 day after entering negotiation
          priority: 'high'
        },
        {
          type: 'email',
          template: 'negotiation_email',
          delay: 48, // 2 days after entering negotiation
          priority: 'high'
        },
        {
          type: 'email',
          template: 'urgency_email',
          delay: 168, // 7 days after entering negotiation
          priority: 'medium'
        }
      ],
      triggers: [
        {
          type: 'time_based',
          delay: 504 // 21 days
        }
      ],
      nextStage: 'closed_won',
      previousStage: 'proposal',
      expectedDuration: 21,
      conversionRate: 10
    });
  }

  // Add a new lead to the funnel
  addLead(lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'score'>): Lead {
    const newLead: Lead = {
      ...lead,
      id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'new',
      score: this.calculateLeadScore(lead),
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActivityAt: new Date()
    };

    this.leads.push(newLead);
    this.processLead(newLead);
    return newLead;
  }

  // Calculate lead score based on available data
  private calculateLeadScore(lead: Partial<Lead>): number {
    let score = 0;

    // Industry scoring
    const industryScores = {
      'healthcare': 90,
      'construction': 80,
      'fleet': 75
    };
    score += industryScores[lead.industry as keyof typeof industryScores] || 50;

    // Contact information completeness
    if (lead.email) score += 10;
    if (lead.phoneNumber) score += 10;
    if (lead.firstName && lead.lastName) score += 10;
    if (lead.company) score += 10;

    // Source scoring
    const sourceScores = {
      'referral': 20,
      'website': 15,
      'email': 10,
      'sms': 5
    };
    score += sourceScores[lead.source as keyof typeof sourceScores] || 0;

    return Math.min(score, 100);
  }

  // Process a lead through the funnel
  private processLead(lead: Lead): void {
    const stage = this.funnelStages.get(lead.status);
    if (!stage) return;

    // Execute actions for the current stage
    stage.actions.forEach(action => {
      this.scheduleAction(lead, action);
    });

    // Set up triggers for the current stage
    stage.triggers.forEach(trigger => {
      this.setupTrigger(lead, trigger);
    });
  }

  // Schedule an action for a lead
  private scheduleAction(lead: Lead, action: FunnelAction): void {
    const delayMs = action.delay * 60 * 60 * 1000; // Convert hours to milliseconds
    
    setTimeout(() => {
      this.executeAction(lead, action);
    }, delayMs);
  }

  // Execute an action for a lead
  private executeAction(lead: Lead, action: FunnelAction): void {
    console.log(`Executing ${action.type} action for lead ${lead.id} using template ${action.template}`);
    
    // In a real implementation, you would:
    // 1. Send the email/SMS using the appropriate service
    // 2. Schedule a call or meeting
    // 3. Update the lead's activity log
    // 4. Track the action in analytics
  }

  // Set up a trigger for a lead
  private setupTrigger(_lead: Lead, _trigger: FunnelTrigger): void {
    // In a real implementation, you would:
    // 1. Set up webhook listeners for email/SMS events
    // 2. Monitor website activity
    // 3. Set up time-based triggers
    // 4. Handle trigger conditions
  }

  // Update lead status
  updateLeadStatus(leadId: string, newStatus: Lead['status']): boolean {
    const lead = this.leads.find(l => l.id === leadId);
    if (!lead) return false;

    lead.status = newStatus;
    lead.updatedAt = new Date();
    lead.lastActivityAt = new Date();

    // Process the lead in the new stage
    this.processLead(lead);
    return true;
  }

  // Update lead score
  updateLeadScore(leadId: string, newScore: number): boolean {
    const lead = this.leads.find(l => l.id === leadId);
    if (!lead) return false;

    lead.score = Math.min(Math.max(newScore, 0), 100);
    lead.updatedAt = new Date();
    return true;
  }

  // Get leads by status
  getLeadsByStatus(status: Lead['status']): Lead[] {
    return this.leads.filter(lead => lead.status === status);
  }

  // Get leads by industry
  getLeadsByIndustry(industry: Lead['industry']): Lead[] {
    return this.leads.filter(lead => lead.industry === industry);
  }

  // Get high-value leads (score > 80)
  getHighValueLeads(): Lead[] {
    return this.leads.filter(lead => lead.score > 80);
  }

  // Get campaign metrics
  getCampaignMetrics(): CampaignMetrics {
    const totalLeads = this.leads.length;
    const emailLeads = this.leads.filter(lead => lead.source === 'email').length;
    const smsLeads = this.leads.filter(lead => lead.source === 'sms').length;
    
    const closedWonLeads = this.leads.filter(lead => lead.status === 'closed_won');
    const conversionRate = totalLeads > 0 ? (closedWonLeads.length / totalLeads) * 100 : 0;
    
    const averageScore = totalLeads > 0 ? this.leads.reduce((sum, lead) => sum + lead.score, 0) / totalLeads : 0;
    
    const stageDistribution = this.leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const industryDistribution = this.leads.reduce((acc, lead) => {
      acc[lead.industry] = (acc[lead.industry] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const sourceDistribution = this.leads.reduce((acc, lead) => {
      acc[lead.source] = (acc[lead.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const timeToConversion = this.calculateAverageTimeToConversion();
    const revenue = this.calculateRevenue();

    return {
      totalLeads,
      emailLeads,
      smsLeads,
      conversionRate,
      averageScore,
      stageDistribution,
      industryDistribution,
      sourceDistribution,
      timeToConversion,
      revenue
    };
  }

  // Calculate average time to conversion
  private calculateAverageTimeToConversion(): number {
    const convertedLeads = this.leads.filter(lead => 
      lead.status === 'closed_won' && lead.lastActivityAt
    );
    
    if (convertedLeads.length === 0) return 0;
    
    const totalDays = convertedLeads.reduce((sum, lead) => {
      const days = Math.ceil(
        (lead.lastActivityAt!.getTime() - lead.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      return sum + days;
    }, 0);
    
    return totalDays / convertedLeads.length;
  }

  // Calculate total revenue
  private calculateRevenue(): number {
    const convertedLeads = this.leads.filter(lead => lead.status === 'closed_won');
    
    // In a real implementation, you would calculate based on actual deal values
    // For now, use average deal values by industry
    const industryValues = {
      'healthcare': 5000,
      'construction': 3000,
      'fleet': 4000
    };
    
    return convertedLeads.reduce((sum, lead) => {
      return sum + (industryValues[lead.industry] || 2000);
    }, 0);
  }

  // Get funnel stage information
  getFunnelStage(stageName: string): FunnelStage | undefined {
    return this.funnelStages.get(stageName);
  }

  // Get all funnel stages
  getAllFunnelStages(): FunnelStage[] {
    return Array.from(this.funnelStages.values());
  }

  // Get leads that need attention (stuck in stage too long)
  getLeadsNeedingAttention(): Lead[] {
    const now = new Date();
    const attentionThreshold = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    
    return this.leads.filter(lead => {
      if (!lead.lastActivityAt) return true;
      
      const timeSinceLastActivity = now.getTime() - lead.lastActivityAt.getTime();
      return timeSinceLastActivity > attentionThreshold;
    });
  }
}
