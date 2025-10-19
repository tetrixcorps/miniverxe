// SMS Campaign Service
// Handles SMS campaigns for construction, fleet management, and healthcare industries

interface SMSCampaign {
  id: string;
  name: string;
  industry: 'construction' | 'fleet' | 'healthcare';
  message: string;
  fromNumber: string;
  scheduledAt?: Date;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  recipientCount: number;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  optOutCount: number;
}

interface SMSRecipient {
  phoneNumber: string;
  firstName: string;
  lastName: string;
  company: string;
  industry: string;
  email: string;
  customFields: Record<string, any>;
  tags: string[];
  status: 'active' | 'opted_out' | 'invalid' | 'bounced';
  subscribedAt: Date;
  lastActivityAt?: Date;
}

interface SMSTemplate {
  industry: 'construction' | 'fleet' | 'healthcare';
  templateName: string;
  message: string;
  variables: string[];
  description: string;
  maxLength: number;
}

export class SMSCampaignService {
  private telnyxApiKey: string;
  private telnyxBaseUrl: string;

  constructor() {
    this.telnyxApiKey = process.env['TELNYX_API_KEY'] || '';
    this.telnyxBaseUrl = 'https://api.telnyx.com/v2';
    
    if (!this.telnyxApiKey) {
      throw new Error('Telnyx API key is required');
    }
  }

  // Industry-specific SMS templates
  private getTemplates(): SMSTemplate[] {
    return [
      // Construction Industry SMS Template
      {
        industry: 'construction',
        templateName: 'construction_workflow_automation',
        message: '🏗️ {{firstName}}, AI construction mgmt. Track safety, resources & efficiency. 7-day free trial: tetrixcorp.com/construction Reply STOP to opt out.',
        variables: ['firstName', 'companyName'],
        description: 'Construction companies workflow automation and safety management',
        maxLength: 160
      },
      
      // Fleet Management SMS Template
      {
        industry: 'fleet',
        templateName: 'fleet_management_optimization',
        message: '🚛 {{firstName}}, AI fleet optimization. Track vehicles, routes & delivery. 7-day free trial: tetrixcorp.com/fleet Reply STOP to opt out.',
        variables: ['firstName', 'companyName'],
        description: 'Fleet management optimization and driver communication',
        maxLength: 160
      },
      
      // Healthcare SMS Template
      {
        industry: 'healthcare',
        templateName: 'healthcare_communication_platform',
        message: '🏥 {{firstName}}, AI patient care platform. Automate appointments & triage. 7-day free trial: tetrixcorp.com/healthcare Reply STOP to opt out.',
        variables: ['firstName', 'practiceName'],
        description: 'Healthcare communication and patient management automation',
        maxLength: 160
      }
    ];
  }

  // Send SMS campaign
  async sendCampaign(campaign: SMSCampaign, recipients: SMSRecipient[]): Promise<{
    success: boolean;
    error?: string;
    sentCount: number;
    failedCount: number;
  }> {
    try {
      let sentCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      for (const recipient of recipients) {
        if (recipient.status !== 'active') {
          failedCount++;
          continue;
        }

        try {
          // Replace template variables
          const personalizedMessage = this.replaceVariables(campaign.message, recipient);

          // Check message length
          if (personalizedMessage.length > 160) {
            console.warn(`Message too long for ${recipient.phoneNumber}: ${personalizedMessage.length} characters`);
            failedCount++;
            continue;
          }

          await this.sendSMS({
            to: recipient.phoneNumber,
            from: campaign.fromNumber,
            text: personalizedMessage,
            webhook_url: `${process.env['BASE_URL']}/api/webhooks/sms/delivery`,
            webhook_failover_url: `${process.env['BASE_URL']}/api/webhooks/sms/failover`,
            type: 'SMS',
            use_messaging_profile: true,
            messaging_profile_id: process.env['TELNYX_MESSAGING_PROFILE_ID'] || ''
          });

          sentCount++;
        } catch (error) {
          failedCount++;
          errors.push(`Failed to send to ${recipient.phoneNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return {
        success: errors.length === 0,
        sentCount,
        failedCount,
        ...(errors.length > 0 && { error: errors.join('; ') })
      };
    } catch (error) {
      return {
        success: false,
        sentCount: 0,
        failedCount: recipients.length,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Send individual SMS
  private async sendSMS(data: {
    to: string;
    from: string;
    text: string;
    webhook_url?: string;
    webhook_failover_url?: string;
    type: string;
    use_messaging_profile?: boolean;
    messaging_profile_id?: string;
  }): Promise<any> {
    const response = await fetch(`${this.telnyxBaseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.telnyxApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json() as any;
      throw new Error(`Telnyx API error: ${errorData.errors?.[0]?.detail || 'Unknown error'}`);
    }

    return response.json();
  }

  // Replace template variables
  private replaceVariables(message: string, recipient: SMSRecipient): string {
    return message
      .replace(/\{\{firstName\}\}/g, recipient.firstName || 'Valued Customer')
      .replace(/\{\{lastName\}\}/g, recipient.lastName || '')
      .replace(/\{\{companyName\}\}/g, recipient.company || 'Your Company')
      .replace(/\{\{practiceName\}\}/g, recipient.company || 'Your Practice')
      .replace(/\{\{phoneNumber\}\}/g, recipient.phoneNumber)
      .replace(/\{\{email\}\}/g, recipient.email || '');
  }

  // Get campaign template by industry
  getTemplateByIndustry(industry: 'construction' | 'fleet' | 'healthcare'): SMSTemplate | null {
    const templates = this.getTemplates();
    return templates.find(t => t.industry === industry) || null;
  }

  // Create campaign from template
  createCampaignFromTemplate(
    industry: 'construction' | 'fleet' | 'healthcare',
    campaignName: string,
    fromNumber: string
  ): SMSCampaign {
    const template = this.getTemplateByIndustry(industry);
    if (!template) {
      throw new Error(`No template found for industry: ${industry}`);
    }

    return {
      id: `sms_campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: campaignName,
      industry,
      message: template.message,
      fromNumber,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      recipientCount: 0,
      sentCount: 0,
      deliveredCount: 0,
      failedCount: 0,
      optOutCount: 0
    };
  }

  // Validate phone number
  validatePhoneNumber(phoneNumber: string): boolean {
    // Basic E.164 format validation
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phoneNumber);
  }

  // Format phone number to E.164
  formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    const digits = phoneNumber.replace(/\D/g, '');
    
    // Add +1 for US numbers if not already present
    if (digits.length === 10) {
      return `+1${digits}`;
    } else if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`;
    } else if (phoneNumber.startsWith('+')) {
      return phoneNumber;
    }
    
    return `+${digits}`;
  }

  // Get campaign analytics
  async getCampaignAnalytics(_campaignId: string): Promise<{
    sentCount: number;
    deliveredCount: number;
    failedCount: number;
    optOutCount: number;
    deliveryRate: number;
    optOutRate: number;
  }> {
    // In a real implementation, you would fetch this data from your database
    // For now, return mock data
    return {
      sentCount: 0,
      deliveredCount: 0,
      failedCount: 0,
      optOutCount: 0,
      deliveryRate: 0,
      optOutRate: 0
    };
  }

  // Handle opt-out requests
  async handleOptOut(phoneNumber: string): Promise<boolean> {
    try {
      // In a real implementation, you would update the recipient status in your database
      console.log(`Opt-out request received for: ${phoneNumber}`);
      return true;
    } catch (error) {
      console.error('Failed to process opt-out:', error);
      return false;
    }
  }

  // Handle delivery status updates
  async handleDeliveryStatus(webhookData: any): Promise<boolean> {
    try {
      // In a real implementation, you would update the campaign analytics in your database
      console.log('SMS delivery status update:', webhookData);
      return true;
    } catch (error) {
      console.error('Failed to process delivery status:', error);
      return false;
    }
  }
}
