// Unified Messaging Service
// Integrates Email (Mailgun), SMS (Telnyx), and WhatsApp for cross-platform communication

import { notificationService } from './notificationService';

export interface UnifiedMessage {
  id: string;
  channel: 'email' | 'sms' | 'whatsapp' | 'voice';
  to: string;
  from?: string;
  subject?: string;
  content: string;
  customerName?: string;
  link?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  provider?: string;
  messageId?: string;
}

export interface BulkMessageRequest {
  recipients: Array<{
    to: string;
    channel: 'email' | 'sms' | 'whatsapp' | 'voice';
    customerName?: string;
  }>;
  subject?: string;
  content: string;
  link?: string;
  metadata?: Record<string, any>;
}

export interface MessageTemplate {
  id: string;
  name: string;
  type: 'welcome' | 'verification' | 'notification' | 'reminder' | 'custom';
  channels: ('email' | 'sms' | 'whatsapp')[];
  subject?: string;
  content: string;
  variables: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class UnifiedMessagingService {
  private templates: Map<string, MessageTemplate> = new Map();
  private messageHistory: Map<string, UnifiedMessage> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Send a unified message across multiple channels
   */
  async sendMessage(request: UnifiedMessage): Promise<UnifiedMessage> {
    try {
      console.log(`Sending ${request.channel} message to ${request.to}`);
      
      // Add to message history
      this.messageHistory.set(request.id, request);
      
      // Send based on channel
      let result;
      switch (request.channel) {
        case 'email':
          result = await this.sendEmailMessage(request);
          break;
        case 'sms':
          result = await this.sendSMSMessage(request);
          break;
        case 'whatsapp':
          result = await this.sendWhatsAppMessage(request);
          break;
        case 'voice':
          result = await this.sendVoiceMessage(request);
          break;
        default:
          throw new Error(`Unsupported channel: ${request.channel}`);
      }
      
      // Update message status
      const updatedMessage = {
        ...request,
        status: result.success ? 'sent' : 'failed',
        provider: result.provider,
        messageId: result.messageId,
        metadata: {
          ...request.metadata,
          providerResponse: result
        }
      };
      
      this.messageHistory.set(request.id, updatedMessage);
      return updatedMessage;
      
    } catch (error) {
      console.error(`Failed to send ${request.channel} message:`, error);
      
      const failedMessage = {
        ...request,
        status: 'failed' as const,
        metadata: {
          ...request.metadata,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
      
      this.messageHistory.set(request.id, failedMessage);
      return failedMessage;
    }
  }

  /**
   * Send bulk messages to multiple recipients
   */
  async sendBulkMessages(request: BulkMessageRequest): Promise<UnifiedMessage[]> {
    const messages: UnifiedMessage[] = [];
    
    for (const recipient of request.recipients) {
      const message: UnifiedMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        channel: recipient.channel,
        to: recipient.to,
        subject: request.subject,
        content: request.content,
        customerName: recipient.customerName,
        link: request.link,
        metadata: request.metadata,
        timestamp: new Date(),
        status: 'pending'
      };
      
      const result = await this.sendMessage(message);
      messages.push(result);
      
      // Add delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return messages;
  }

  /**
   * Send message using template
   */
  async sendTemplateMessage(
    templateId: string,
    recipient: { to: string; channel: 'email' | 'sms' | 'whatsapp'; customerName?: string },
    variables: Record<string, string> = {}
  ): Promise<UnifiedMessage> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }
    
    if (!template.channels.includes(recipient.channel)) {
      throw new Error(`Template ${templateId} does not support channel ${recipient.channel}`);
    }
    
    // Replace variables in content
    let content = template.content;
    Object.entries(variables).forEach(([key, value]) => {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    
    const message: UnifiedMessage = {
      id: `tpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      channel: recipient.channel,
      to: recipient.to,
      subject: template.subject,
      content,
      customerName: recipient.customerName,
      metadata: { templateId, variables },
      timestamp: new Date(),
      status: 'pending'
    };
    
    return await this.sendMessage(message);
  }

  /**
   * Send email message
   */
  private async sendEmailMessage(request: UnifiedMessage) {
    return await notificationService.sendNotification({
      to: request.to,
      channel: 'email',
      subject: request.subject || 'TETRIX Notification',
      content: request.content,
      customerName: request.customerName,
      link: request.link,
      metadata: request.metadata
    });
  }

  /**
   * Send SMS message
   */
  private async sendSMSMessage(request: UnifiedMessage) {
    return await notificationService.sendNotification({
      to: request.to,
      channel: 'sms',
      content: request.content,
      customerName: request.customerName,
      link: request.link,
      metadata: request.metadata
    });
  }

  /**
   * Send WhatsApp message (placeholder)
   */
  private async sendWhatsAppMessage(request: UnifiedMessage) {
    // This would integrate with WhatsApp Business API
    console.log(`WhatsApp message to ${request.to}: ${request.content}`);
    
    return {
      success: true,
      messageId: `wa_${Date.now()}`,
      provider: 'whatsapp',
      channel: 'whatsapp',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Send voice message (placeholder)
   */
  private async sendVoiceMessage(request: UnifiedMessage) {
    // This would integrate with voice services
    console.log(`Voice message to ${request.to}: ${request.content}`);
    
    return {
      success: true,
      messageId: `voice_${Date.now()}`,
      provider: 'voice',
      channel: 'voice',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Initialize message templates
   */
  private initializeTemplates() {
    const templates: MessageTemplate[] = [
      {
        id: 'welcome_email',
        name: 'Welcome Email',
        type: 'welcome',
        channels: ['email'],
        subject: 'Welcome to TETRIX!',
        content: `Hello {{customerName}},

Welcome to TETRIX, the enterprise communication platform!

We're excited to have you on board. Your account has been set up and you can now access all our features.

{{link}}

Best regards,
The TETRIX Team`,
        variables: ['customerName', 'link'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'verification_sms',
        name: 'Verification SMS',
        type: 'verification',
        channels: ['sms'],
        content: `TETRIX: Your verification code is {{code}}. This code expires in 10 minutes.`,
        variables: ['code'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'info_request_email',
        name: 'Information Request Email',
        type: 'notification',
        channels: ['email'],
        subject: 'Action Required: Additional Information Needed',
        content: `Hello {{customerName}},

We need some additional information to proceed with your request.

Please complete this form: {{link}}

This will help us provide you with the best possible service.

Thank you for your cooperation.

Best regards,
The TETRIX Team`,
        variables: ['customerName', 'link'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  /**
   * Get message history
   */
  getMessageHistory(limit: number = 100): UnifiedMessage[] {
    return Array.from(this.messageHistory.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get message by ID
   */
  getMessage(id: string): UnifiedMessage | undefined {
    return this.messageHistory.get(id);
  }

  /**
   * Get available templates
   */
  getTemplates(): MessageTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get template by ID
   */
  getTemplate(id: string): MessageTemplate | undefined {
    return this.templates.get(id);
  }

  /**
   * Test connectivity for all providers
   */
  async testConnectivity(): Promise<{ [key: string]: boolean }> {
    return await notificationService.testConnectivity();
  }
}

// Export configured instance
export const unifiedMessagingService = new UnifiedMessagingService();
export default unifiedMessagingService;
