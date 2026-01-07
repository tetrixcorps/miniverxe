// WhatsApp Campaign Service
// Handles WhatsApp campaigns for construction, fleet management, and healthcare industries

interface WhatsAppCampaign {
  id: string;
  name: string;
  industry: 'construction' | 'fleet' | 'healthcare';
  templateName: string;
  templateComponents: TemplateComponent[];
  scheduledAt?: Date;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  recipientCount: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
}

interface TemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  text?: string;
  buttons?: Array<{
    type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
    text: string;
    url?: string;
    phone_number?: string;
  }>;
}

interface WhatsAppRecipient {
  phoneNumber: string;
  firstName: string;
  lastName: string;
  company: string;
  industry: string;
  email: string;
  customFields: Record<string, any>;
  tags: string[];
  status: 'active' | 'opted_out' | 'invalid' | 'blocked';
  subscribedAt: Date;
  lastActivityAt?: Date;
}

interface WhatsAppTemplate {
  industry: 'construction' | 'fleet' | 'healthcare';
  templateName: string;
  language: string;
  components: TemplateComponent[];
  variables: string[];
  description: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
}

interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  apiVersion: string;
  apiBaseUrl: string;
  certificate?: string;
}

export class WhatsAppCampaignService {
  private config: WhatsAppConfig;
  private baseUrl: string;

  constructor() {
    this.config = {
      accessToken: process.env['WHATSAPP_ACCESS_TOKEN'] || '',
      phoneNumberId: process.env['WHATSAPP_PHONE_NUMBER_ID'] || '',
      businessAccountId: process.env['WHATSAPP_BUSINESS_ACCOUNT_ID'] || '',
      apiVersion: process.env['WHATSAPP_API_VERSION'] || 'v21.0',
      apiBaseUrl: process.env['WHATSAPP_API_BASE_URL'] || 'https://graph.facebook.com',
      certificate: process.env['WHATSAPP_CERTIFICATE']
    };

    if (!this.config.accessToken || !this.config.phoneNumberId) {
      throw new Error('WhatsApp Access Token and Phone Number ID are required');
    }

    this.baseUrl = `${this.config.apiBaseUrl}/${this.config.apiVersion}`;
  }

  // Industry-specific WhatsApp templates
  private getTemplates(): WhatsAppTemplate[] {
    return [
      // Construction Industry Template
      {
        industry: 'construction',
        templateName: 'construction_workflow_automation',
        language: 'en_US',
        category: 'MARKETING',
        components: [
          {
            type: 'HEADER',
            format: 'TEXT',
            text: '🏗️ Transform Your Construction Projects'
          },
          {
            type: 'BODY',
            text: 'Hi {{1}},\n\nStreamline your construction operations with AI-powered workflow automation:\n\n✅ Real-time project tracking\n✅ Safety compliance monitoring\n✅ Resource optimization\n✅ Team collaboration tools\n\nStart your 7-day free trial today!'
          },
          {
            type: 'FOOTER',
            text: 'TETRIX - Construction Management'
          },
          {
            type: 'BUTTONS',
            buttons: [
              {
                type: 'URL',
                text: 'Start Free Trial',
                url: 'https://tetrixcorp.com/dashboards/construction'
              },
              {
                type: 'QUICK_REPLY',
                text: 'Learn More'
              }
            ]
          }
        ],
        variables: ['firstName'],
        description: 'Construction companies workflow automation and safety management'
      },

      // Fleet Management Template
      {
        industry: 'fleet',
        templateName: 'fleet_management_optimization',
        language: 'en_US',
        category: 'MARKETING',
        components: [
          {
            type: 'HEADER',
            format: 'TEXT',
            text: '🚛 Optimize Your Fleet Operations'
          },
          {
            type: 'BODY',
            text: 'Hi {{1}},\n\nMaximize your fleet efficiency with AI-powered management:\n\n✅ Real-time vehicle tracking\n✅ Route optimization\n✅ Driver communication hub\n✅ Delivery automation\n\nStart your 7-day free trial today!'
          },
          {
            type: 'FOOTER',
            text: 'TETRIX - Fleet Management'
          },
          {
            type: 'BUTTONS',
            buttons: [
              {
                type: 'URL',
                text: 'Start Free Trial',
                url: 'https://tetrixcorp.com/dashboards/logistics'
              },
              {
                type: 'QUICK_REPLY',
                text: 'Learn More'
              }
            ]
          }
        ],
        variables: ['firstName'],
        description: 'Fleet management optimization and driver communication'
      },

      // Healthcare Template
      {
        industry: 'healthcare',
        templateName: 'healthcare_communication_platform',
        language: 'en_US',
        category: 'MARKETING',
        components: [
          {
            type: 'HEADER',
            format: 'TEXT',
            text: '🏥 Enhance Patient Care'
          },
          {
            type: 'BODY',
            text: 'Hi {{1}},\n\nStreamline patient care with AI-powered communication:\n\n✅ Smart appointment scheduling\n✅ Emergency triage system\n✅ Patient communication hub\n✅ HIPAA-compliant messaging\n\nStart your 7-day free trial today!'
          },
          {
            type: 'FOOTER',
            text: 'TETRIX - Healthcare Communication'
          },
          {
            type: 'BUTTONS',
            buttons: [
              {
                type: 'URL',
                text: 'Start Free Trial',
                url: 'https://tetrixcorp.com/dashboards/healthcare'
              },
              {
                type: 'QUICK_REPLY',
                text: 'Learn More'
              }
            ]
          }
        ],
        variables: ['firstName'],
        description: 'Healthcare communication and patient management automation'
      }
    ];
  }

  // Send WhatsApp message using template
  async sendTemplateMessage(
    to: string,
    templateName: string,
    language: string,
    components: any[]
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.config.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: to,
            type: 'template',
            template: {
              name: templateName,
              language: {
                code: language
              },
              components: components
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json() as any;
        throw new Error(
          `WhatsApp API error: ${errorData.error?.message || 'Unknown error'}`
        );
      }

      const data = await response.json() as any;
      return {
        success: true,
        messageId: data.messages?.[0]?.id
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Send WhatsApp campaign
  async sendCampaign(
    campaign: WhatsAppCampaign,
    recipients: WhatsAppRecipient[]
  ): Promise<{
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
          // Format phone number to international format
          const formattedPhone = this.formatPhoneNumber(recipient.phoneNumber);

          // Replace template variables
          const components = this.buildTemplateComponents(
            campaign.templateComponents,
            recipient
          );

          const result = await this.sendTemplateMessage(
            formattedPhone,
            campaign.templateName,
            'en_US',
            components
          );

          if (result.success) {
            sentCount++;
          } else {
            failedCount++;
            errors.push(`Failed to send to ${recipient.phoneNumber}: ${result.error}`);
          }

          // Rate limiting: WhatsApp allows ~80 messages per second
          // Add small delay to stay within limits
          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (error) {
          failedCount++;
          errors.push(
            `Failed to send to ${recipient.phoneNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
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

  // Build template components with personalized data
  private buildTemplateComponents(
    templateComponents: TemplateComponent[],
    recipient: WhatsAppRecipient
  ): any[] {
    return templateComponents
      .filter(comp => comp.type === 'HEADER' || comp.type === 'BODY')
      .map(comp => {
        if (comp.type === 'HEADER' && comp.format === 'TEXT') {
          return {
            type: 'header',
            parameters: []
          };
        }

        if (comp.type === 'BODY') {
          return {
            type: 'body',
            parameters: [
              {
                type: 'text',
                text: recipient.firstName || 'Valued Customer'
              }
            ]
          };
        }

        return null;
      })
      .filter(Boolean);
  }

  // Format phone number to international format (E.164)
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    const digits = phoneNumber.replace(/\D/g, '');

    // Add + prefix if not present
    if (!phoneNumber.startsWith('+')) {
      // Assume US number if 10 digits
      if (digits.length === 10) {
        return `+1${digits}`;
      } else if (digits.length === 11 && digits.startsWith('1')) {
        return `+${digits}`;
      }
      return `+${digits}`;
    }

    return phoneNumber;
  }

  // Validate phone number format
  validatePhoneNumber(phoneNumber: string): boolean {
    // Basic E.164 format validation
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    const formatted = this.formatPhoneNumber(phoneNumber);
    return e164Regex.test(formatted);
  }

  // Get campaign template by industry
  getTemplateByIndustry(
    industry: 'construction' | 'fleet' | 'healthcare'
  ): WhatsAppTemplate | null {
    const templates = this.getTemplates();
    return templates.find(t => t.industry === industry) || null;
  }

  // Create campaign from template
  createCampaignFromTemplate(
    industry: 'construction' | 'fleet' | 'healthcare',
    campaignName: string
  ): WhatsAppCampaign {
    const template = this.getTemplateByIndustry(industry);
    if (!template) {
      throw new Error(`No template found for industry: ${industry}`);
    }

    return {
      id: `whatsapp_campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: campaignName,
      industry,
      templateName: template.templateName,
      templateComponents: template.components,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      recipientCount: 0,
      sentCount: 0,
      deliveredCount: 0,
      readCount: 0,
      failedCount: 0
    };
  }

  // Handle incoming webhook messages
  async handleWebhook(webhookData: any): Promise<boolean> {
    try {
      console.log('WhatsApp webhook received:', JSON.stringify(webhookData, null, 2));

      const entry = webhookData.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const field = changes?.field;

      if (!value) return true;

      // Handle based on field type or content
      if (field === 'messages' || value.messages || value.statuses) {
        if (value.messages) {
          for (const message of value.messages) {
            await this.processIncomingMessage(message, value);
          }
        }
        if (value.statuses) {
          for (const status of value.statuses) {
            await this.processMessageStatus(status);
          }
        }
      } else if (field === 'message_template_status_update') {
        await this.processTemplateStatusUpdate(value);
      } else if (field === 'phone_number_quality_update') {
        await this.processPhoneNumberQualityUpdate(value);
      } else if (field === 'account_review_update') {
        await this.processAccountReviewUpdate(value);
      } else if (field === 'account_update') {
        await this.processAccountUpdate(value);
      } else if (field === 'security') {
        await this.processSecurityNotification(value);
      } else {
        console.log(`Unhandled webhook field: ${field}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to process webhook:', error);
      return false;
    }
  }

  // Process message template status update
  private async processTemplateStatusUpdate(value: any): Promise<void> {
    const event = value.event;
    const templateName = value.message_template_name;
    const reason = value.reason;
    
    console.log(`Template Status Update: ${templateName} is now ${event}`);
    if (reason) console.log(`Reason: ${reason}`);

    // TODO: Update template status in database
    // TODO: Notify admin if template is rejected
  }

  // Process phone number quality update
  private async processPhoneNumberQualityUpdate(value: any): Promise<void> {
    const displayPhoneNumber = value.display_phone_number;
    const event = value.event; // 'GREEN', 'YELLOW', 'RED'
    const currentLimit = value.current_limit;

    console.log(`Phone Number Quality Update for ${displayPhoneNumber}: ${event}`);
    console.log(`Current Messaging Limit: ${currentLimit}`);

    // TODO: Alert if quality drops to RED
    // TODO: Update phone number status in database
  }

  // Process account review update
  private async processAccountReviewUpdate(value: any): Promise<void> {
    const decision = value.decision; // 'APPROVED', 'REJECTED'
    
    console.log(`Account Review Update: ${decision}`);
    
    // TODO: Notify admin of account review decision
  }

  // Process account update
  private async processAccountUpdate(value: any): Promise<void> {
    const phoneNumber = value.phone_number;
    const event = value.event; // 'VERIFIED', 'BANNED', 'RESTRICTED', etc.
    
    console.log(`Account Update for ${phoneNumber}: ${event}`);
    
    if (value.ban_info) {
       console.log('Ban Info:', JSON.stringify(value.ban_info));
    }

    // TODO: Handle account bans or restrictions
  }

  // Process security notification
  private async processSecurityNotification(value: any): Promise<void> {
    console.log('Security Notification received:', JSON.stringify(value));
    
    // TODO: Log security event
    // TODO: Alert security team
  }

  // Process incoming message
  private async processIncomingMessage(message: any, value: any): Promise<void> {
    console.log(`Incoming message from ${message.from}: ${message.text?.body || message.type}`);
    
    // In a real implementation, you would:
    // 1. Store the message in your database
    // 2. Trigger any automated responses
    // 3. Update customer engagement metrics
    // 4. Handle opt-out requests
  }

  // Process message status update
  private async processMessageStatus(status: any): Promise<void> {
    console.log(`Message ${status.id} status: ${status.status}`);
    
    // In a real implementation, you would:
    // 1. Update message delivery status in your database
    // 2. Update campaign analytics
    // 3. Handle failed deliveries
  }

  // Verify webhook signature
  verifyWebhookSignature(signature: string, body: string): boolean {
    // In a real implementation, you would verify the webhook signature
    // using your app secret to ensure the request came from Meta
    const appSecret = process.env['WHATSAPP_APP_SECRET'] || '';
    
    if (!appSecret) {
      console.warn('WHATSAPP_APP_SECRET not configured');
      return true; // Allow in development, but should be enforced in production
    }

    // TODO: Implement proper HMAC signature verification
    return true;
  }

  // Get business profile
  async getBusinessProfile(): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.config.phoneNumberId}/whatsapp_business_profile`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch business profile: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get business profile:', error);
      return null;
    }
  }

  // Update business profile
  async updateBusinessProfile(profileData: {
    about?: string;
    address?: string;
    description?: string;
    email?: string;
    profile_picture_url?: string;
    websites?: string[];
  }): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.config.phoneNumberId}/whatsapp_business_profile`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            ...profileData
          })
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Failed to update business profile:', error);
      return false;
    }
  }

  // Check Marketing Messages API Eligibility
  async checkMarketingMessagesEligibility(): Promise<{
    status: string;
    isEligible: boolean;
    isOnboarded: boolean;
    data?: any;
  }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.config.businessAccountId}?fields=marketing_messages_onboarding_status`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to check eligibility: ${response.statusText}`);
      }

      const data = await response.json() as any;
      const status = data.marketing_messages_onboarding_status;
      
      return {
        status,
        isEligible: status === 'ELIGIBLE',
        isOnboarded: status === 'ONBOARDED',
        data
      };
    } catch (error) {
      console.error('Failed to check Marketing Messages eligibility:', error);
      return {
        status: 'ERROR',
        isEligible: false,
        isOnboarded: false,
        data: error
      };
    }
  }

  // Send Optimized Marketing Message with enhanced features
  async sendMarketingMessage(
    to: string,
    templateName: string,
    language: string,
    components: any[],
    options?: {
      messageActivitySharing?: boolean;
      timeToLive?: number; // Time-to-live in seconds (for time-sensitive campaigns)
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const payload: any = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: language
          },
          components: components
        }
      };

      // Add optional parameters
      if (options?.messageActivitySharing !== undefined) {
        payload.message_activity_sharing = options.messageActivitySharing;
      }

      if (options?.timeToLive) {
        payload.time_to_live = options.timeToLive;
      }

      const response = await fetch(
        `${this.baseUrl}/${this.config.phoneNumberId}/marketing_messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const errorData = await response.json() as any;
        throw new Error(
          `WhatsApp Marketing Message API error: ${errorData.error?.message || 'Unknown error'}`
        );
      }

      const data = await response.json() as any;
      return {
        success: true,
        messageId: data.messages?.[0]?.id
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Send Marketing Campaign with automatic optimizations
  async sendMarketingCampaign(
    campaign: WhatsAppCampaign,
    recipients: WhatsAppRecipient[],
    options?: {
      useOptimizations?: boolean; // Use MM API instead of Cloud API
      timeToLive?: number;
      messageActivitySharing?: boolean;
    }
  ): Promise<{
    success: boolean;
    error?: string;
    sentCount: number;
    failedCount: number;
    optimizedCount?: number;
  }> {
    try {
      // Check if account is onboarded for Marketing Messages API
      const eligibility = await this.checkMarketingMessagesEligibility();
      const useMMAPI = options?.useOptimizations !== false && eligibility.isOnboarded;

      if (options?.useOptimizations && !eligibility.isOnboarded) {
        console.warn('Marketing Messages API not onboarded. Falling back to Cloud API.');
      }

      let sentCount = 0;
      let failedCount = 0;
      let optimizedCount = 0;
      const errors: string[] = [];

      for (const recipient of recipients) {
        if (recipient.status !== 'active') {
          failedCount++;
          continue;
        }

        try {
          const formattedPhone = this.formatPhoneNumber(recipient.phoneNumber);
          const components = this.buildTemplateComponents(
            campaign.templateComponents,
            recipient
          );

          let result;
          if (useMMAPI) {
            // Use optimized Marketing Messages API
            result = await this.sendMarketingMessage(
              formattedPhone,
              campaign.templateName,
              'en_US',
              components,
              {
                messageActivitySharing: options?.messageActivitySharing ?? true,
                timeToLive: options?.timeToLive
              }
            );
            if (result.success) optimizedCount++;
          } else {
            // Fallback to Cloud API
            result = await this.sendTemplateMessage(
              formattedPhone,
              campaign.templateName,
              'en_US',
              components
            );
          }

          if (result.success) {
            sentCount++;
          } else {
            failedCount++;
            errors.push(`Failed to send to ${recipient.phoneNumber}: ${result.error}`);
          }

          // Rate limiting: WhatsApp allows ~80 messages per second
          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (error) {
          failedCount++;
          errors.push(
            `Failed to send to ${recipient.phoneNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }

      return {
        success: errors.length === 0,
        sentCount,
        failedCount,
        optimizedCount: useMMAPI ? optimizedCount : undefined,
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

  // Get Marketing Messages Insights (requires linked Ad Account)
  async getMarketingInsights(
    adAccountId: string,
    startDate: string,
    endDate: string,
    metrics: string[] = ['impressions', 'clicks', 'spend']
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Note: This requires the Ad Account ID from the onboarding webhook
      // Format: YYYY-MM-DD
      const response = await fetch(
        `${this.baseUrl}/${adAccountId}/insights?` +
        `time_range={'since':'${startDate}','until':'${endDate}'}&` +
        `fields=${metrics.join(',')}&` +
        `level=ad`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json() as any;
        throw new Error(
          `Insights API error: ${errorData.error?.message || 'Unknown error'}`
        );
      }

      const data = await response.json() as any;
      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

