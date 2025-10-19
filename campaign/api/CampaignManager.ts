// Campaign Manager API
// Centralized management of email and SMS campaigns with sales funnel integration

import { EmailCampaignService } from '../email/EmailCampaignService';
import { SMSCampaignService } from '../sms/SMSCampaignService';
import { SalesFunnelService } from '../SalesFunnelService';

interface CampaignManagerConfig {
  emailService: EmailCampaignService;
  smsService: SMSCampaignService;
  funnelService: SalesFunnelService;
}

interface CampaignExecutionResult {
  success: boolean;
  campaignId: string;
  industry: string;
  emailResults?: {
    sentCount: number;
    failedCount: number;
    error?: string;
  };
  smsResults?: {
    sentCount: number;
    failedCount: number;
    error?: string;
  };
  funnelResults?: {
    leadsAdded: number;
    highValueLeads: number;
  };
  totalRecipients: number;
  totalSent: number;
  totalFailed: number;
  executionTime: number;
}

interface LeadData {
  email: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  industry: 'construction' | 'fleet' | 'healthcare';
  source: 'email' | 'sms' | 'website' | 'referral';
  customFields?: Record<string, any>;
  tags?: string[];
}

export class CampaignManager {
  private emailService: EmailCampaignService;
  private smsService: SMSCampaignService;
  private funnelService: SalesFunnelService;

  constructor(config: CampaignManagerConfig) {
    this.emailService = config.emailService;
    this.smsService = config.smsService;
    this.funnelService = config.funnelService;
  }

  // Execute a complete campaign for an industry
  async executeIndustryCampaign(
    industry: 'construction' | 'fleet' | 'healthcare',
    leads: LeadData[],
    campaignName: string,
    fromEmail: string,
    fromName: string,
    replyTo: string,
    fromNumber: string
  ): Promise<CampaignExecutionResult> {
    const startTime = Date.now();
    const campaignId = `campaign_${industry}_${Date.now()}`;

    try {
      // Filter leads by industry
      const industryLeads = leads.filter(lead => lead.industry === industry);
      
      if (industryLeads.length === 0) {
        throw new Error(`No leads found for industry: ${industry}`);
      }

      // Separate leads with email and phone numbers
      const emailLeads = industryLeads.filter(lead => lead.email);
      const smsLeads = industryLeads.filter(lead => lead.phoneNumber);

      let emailResults;
      let smsResults;
      let funnelResults;

      // Execute email campaign
      if (emailLeads.length > 0) {
        const emailCampaign = this.emailService.createCampaignFromTemplate(
          industry,
          `${campaignName} - Email`,
          fromEmail,
          fromName,
          replyTo
        );

        const emailRecipients = emailLeads.map(lead => ({
          email: lead.email!,
          firstName: lead.firstName || '',
          lastName: lead.lastName || '',
          company: lead.company || '',
          industry: lead.industry,
          phoneNumber: lead.phoneNumber || '',
          customFields: lead.customFields || {},
          tags: lead.tags || [],
          status: 'active' as const,
          subscribedAt: new Date()
        }));

        emailResults = await this.emailService.sendCampaign(emailCampaign, emailRecipients);

        // Add email leads to sales funnel
        emailLeads.forEach(lead => {
          this.funnelService.addLead({
            email: lead.email!,
            phoneNumber: lead.phoneNumber || '',
            firstName: lead.firstName || '',
            lastName: lead.lastName || '',
            company: lead.company || '',
            industry: lead.industry,
            source: 'email',
            customFields: lead.customFields || {},
            tags: lead.tags || []
          });
        });
      }

      // Execute SMS campaign
      if (smsLeads.length > 0) {
        const smsCampaign = this.smsService.createCampaignFromTemplate(
          industry,
          `${campaignName} - SMS`,
          fromNumber
        );

        const smsRecipients = smsLeads.map(lead => ({
          phoneNumber: this.smsService.formatPhoneNumber(lead.phoneNumber!),
          firstName: lead.firstName || '',
          lastName: lead.lastName || '',
          company: lead.company || '',
          industry: lead.industry,
          email: lead.email || '',
          customFields: lead.customFields || {},
          tags: lead.tags || [],
          status: 'active' as const,
          subscribedAt: new Date()
        }));

        smsResults = await this.smsService.sendCampaign(smsCampaign, smsRecipients);

        // Add SMS leads to sales funnel
        smsLeads.forEach(lead => {
          this.funnelService.addLead({
            email: lead.email || '',
            phoneNumber: lead.phoneNumber || '',
            firstName: lead.firstName || '',
            lastName: lead.lastName || '',
            company: lead.company || '',
            industry: lead.industry,
            source: 'sms',
            customFields: lead.customFields || {},
            tags: lead.tags || []
          });
        });
      }

      // Get funnel results
      const highValueLeads = this.funnelService.getHighValueLeads().filter(
        lead => lead.industry === industry
      );
      funnelResults = {
        leadsAdded: industryLeads.length,
        highValueLeads: highValueLeads.length
      };

      const executionTime = Date.now() - startTime;
      const totalSent = (emailResults?.sentCount || 0) + (smsResults?.sentCount || 0);
      const totalFailed = (emailResults?.failedCount || 0) + (smsResults?.failedCount || 0);

      return {
        success: true,
        campaignId,
        industry,
        emailResults: emailResults || { sentCount: 0, failedCount: 0 },
        smsResults: smsResults || { sentCount: 0, failedCount: 0 },
        funnelResults,
        totalRecipients: industryLeads.length,
        totalSent,
        totalFailed,
        executionTime
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      return {
        success: false,
        campaignId,
        industry,
        totalRecipients: leads.length,
        totalSent: 0,
        totalFailed: leads.length,
        executionTime,
        emailResults: {
          sentCount: 0,
          failedCount: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  // Execute campaigns for all industries
  async executeAllIndustryCampaigns(
    leads: LeadData[],
    campaignName: string,
    fromEmail: string,
    fromName: string,
    replyTo: string,
    fromNumber: string
  ): Promise<CampaignExecutionResult[]> {
    const industries: ('construction' | 'fleet' | 'healthcare')[] = ['construction', 'fleet', 'healthcare'];
    const results: CampaignExecutionResult[] = [];

    for (const industry of industries) {
      try {
        const result = await this.executeIndustryCampaign(
          industry,
          leads,
          campaignName,
          fromEmail,
          fromName,
          replyTo,
          fromNumber
        );
        results.push(result);
      } catch (error) {
        console.error(`Failed to execute campaign for ${industry}:`, error);
        results.push({
          success: false,
          campaignId: `failed_${industry}_${Date.now()}`,
          industry,
          totalRecipients: 0,
          totalSent: 0,
          totalFailed: 0,
          executionTime: 0,
          emailResults: {
            sentCount: 0,
            failedCount: 0,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        });
      }
    }

    return results;
  }

  // Get campaign analytics
  getCampaignAnalytics(): {
    totalLeads: number;
    industryBreakdown: Record<string, number>;
    sourceBreakdown: Record<string, number>;
    conversionRates: Record<string, number>;
    revenue: number;
    topPerformingIndustries: string[];
    leadsNeedingAttention: number;
  } {
    const metrics = this.funnelService.getCampaignMetrics();
    const leadsNeedingAttention = this.funnelService.getLeadsNeedingAttention();

    // Calculate conversion rates by industry
    const conversionRates: Record<string, number> = {};
    const industries = ['construction', 'fleet', 'healthcare'];
    
    industries.forEach(industry => {
      const industryLeads = this.funnelService.getLeadsByIndustry(industry as any);
      const convertedLeads = industryLeads.filter(lead => lead.status === 'closed_won');
      conversionRates[industry] = industryLeads.length > 0 
        ? (convertedLeads.length / industryLeads.length) * 100 
        : 0;
    });

    // Get top performing industries
    const topPerformingIndustries = Object.entries(conversionRates)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([industry]) => industry);

    return {
      totalLeads: metrics.totalLeads,
      industryBreakdown: metrics.industryDistribution,
      sourceBreakdown: metrics.sourceDistribution,
      conversionRates,
      revenue: metrics.revenue,
      topPerformingIndustries,
      leadsNeedingAttention: leadsNeedingAttention.length
    };
  }

    // Get lead recommendations
    getLeadRecommendations(): {
      highValueLeads: any[];
      leadsNeedingAttention: any[];
      industryOpportunities: Record<string, number>;
      nextActions: string[];
    } {
      const highValueLeads = this.funnelService.getHighValueLeads();
      const leadsNeedingAttention = this.funnelService.getLeadsNeedingAttention();

    // Calculate industry opportunities (leads in early stages)
    const industryOpportunities: Record<string, number> = {};
    const industries = ['construction', 'fleet', 'healthcare'];
    
    industries.forEach(industry => {
      const industryLeads = this.funnelService.getLeadsByIndustry(industry as any);
      const earlyStageLeads = industryLeads.filter(lead => 
        ['new', 'contacted', 'interested'].includes(lead.status)
      );
      industryOpportunities[industry] = earlyStageLeads.length;
    });

      // Generate next actions
      const nextActions: string[] = [];
      
      if (leadsNeedingAttention.length > 0) {
        nextActions.push(`Follow up with ${leadsNeedingAttention.length} leads that need attention`);
      }
      
      if (highValueLeads.length > 0) {
        nextActions.push(`Prioritize ${highValueLeads.length} high-value leads`);
      }
      
      const newLeads = this.funnelService.getLeadsByStatus('new');
      if (newLeads.length > 0) {
        nextActions.push(`Process ${newLeads.length} new leads`);
      }

      return {
        highValueLeads: highValueLeads.slice(0, 10), // Top 10
        leadsNeedingAttention: leadsNeedingAttention.slice(0, 10), // Top 10
        industryOpportunities,
        nextActions
      };
  }

  // Export campaign data
  exportCampaignData(format: 'csv' | 'json'): string {
    const metrics = this.funnelService.getCampaignMetrics();
    const allLeads = this.funnelService['leads']; // Access private property

    if (format === 'json') {
      return JSON.stringify({
        metrics,
        leads: allLeads,
        exportedAt: new Date().toISOString()
      }, null, 2);
    } else {
      // CSV format
      const headers = ['ID', 'Email', 'Phone', 'Name', 'Company', 'Industry', 'Source', 'Status', 'Score', 'Created At'];
      const rows = allLeads.map(lead => [
        lead.id,
        lead.email,
        lead.phoneNumber || '',
        `${lead.firstName || ''} ${lead.lastName || ''}`.trim(),
        lead.company || '',
        lead.industry,
        lead.source,
        lead.status,
        lead.score,
        lead.createdAt.toISOString()
      ]);

      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
  }
}
