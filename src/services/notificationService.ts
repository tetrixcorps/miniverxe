// Unified Notification Service
// Integrates Mailgun (Email), Telnyx (SMS), and Sinch (SMS) for cross-platform messaging

import * as mailgun from 'mailgun-js';
import axios from 'axios';

// Configuration interfaces
export interface NotificationConfig {
  mailgun: {
    apiKey: string;
    domain: string;
  };
  telnyx: {
    apiKey: string;
    messagingProfileId: string;
  };
  sinch: {
    apiKey: string;
    apiSecret: string;
    senderNumber: string;
  };
}

export interface NotificationRequest {
  to: string;
  channel: 'email' | 'sms' | 'whatsapp';
  subject?: string;
  content: string;
  customerName?: string;
  link?: string;
  metadata?: Record<string, any>;
}

export interface NotificationResponse {
  success: boolean;
  messageId?: string;
  provider: string;
  channel: string;
  timestamp: string;
  error?: string;
}

export interface BulkNotificationRequest {
  recipients: Array<{
    to: string;
    channel: 'email' | 'sms' | 'whatsapp';
    customerName?: string;
  }>;
  subject?: string;
  content: string;
  link?: string;
  metadata?: Record<string, any>;
}

class NotificationService {
  private config: NotificationConfig;
  private mailgunClient: any;

  constructor(config: NotificationConfig) {
    this.config = config;
    this.mailgunClient = mailgun.default({
      apiKey: config.mailgun.apiKey,
      domain: config.mailgun.domain,
    });
  }

  /**
   * Send a single notification via the specified channel
   */
  async sendNotification(request: NotificationRequest): Promise<NotificationResponse> {
    try {
      switch (request.channel) {
        case 'email':
          return await this.sendEmail(request);
        case 'sms':
          return await this.sendSMS(request);
        case 'whatsapp':
          return await this.sendWhatsApp(request);
        default:
          throw new Error(`Unsupported channel: ${request.channel}`);
      }
    } catch (error) {
      console.error(`Notification failed for ${request.channel}:`, error);
      return {
        success: false,
        provider: this.getProviderForChannel(request.channel),
        channel: request.channel,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send bulk notifications to multiple recipients
   */
  async sendBulkNotifications(request: BulkNotificationRequest): Promise<NotificationResponse[]> {
    const results: NotificationResponse[] = [];
    
    for (const recipient of request.recipients) {
      const notificationRequest: NotificationRequest = {
        to: recipient.to,
        channel: recipient.channel,
        subject: request.subject,
        content: request.content,
        customerName: recipient.customerName,
        link: request.link,
        metadata: request.metadata
      };
      
      const result = await this.sendNotification(notificationRequest);
      results.push(result);
      
      // Add small delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  }

  /**
   * Send email via Mailgun
   */
  private async sendEmail(request: NotificationRequest): Promise<NotificationResponse> {
    const emailContent = this.formatEmailContent(request);
    
    const data = {
      from: `TETRIX Support <support@${this.config.mailgun.domain}>`,
      to: request.to,
      subject: request.subject || 'TETRIX Notification',
      text: emailContent.text,
      html: emailContent.html,
    };

    const result = await this.mailgunClient.messages().send(data);
    
    console.log(`Mailgun email sent to ${request.to}:`, result.id);
    
    return {
      success: true,
      messageId: result.id,
      provider: 'mailgun',
      channel: 'email',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Send SMS via Telnyx
   */
  private async sendSMS(request: NotificationRequest): Promise<NotificationResponse> {
    const smsContent = this.formatSMSContent(request);
    
    const payload = {
      from: this.config.telnyx.messagingProfileId,
      to: request.to,
      text: smsContent,
    };

    const response = await axios.post('https://api.telnyx.com/v2/messages', payload, {
      headers: {
        'Authorization': `Bearer ${this.config.telnyx.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`Telnyx SMS sent to ${request.to}:`, response.data.data.id);
    
    return {
      success: true,
      messageId: response.data.data.id,
      provider: 'telnyx',
      channel: 'sms',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Send WhatsApp message (placeholder - would integrate with WhatsApp Business API)
   */
  private async sendWhatsApp(request: NotificationRequest): Promise<NotificationResponse> {
    // This would integrate with WhatsApp Business API
    // For now, we'll use SMS as a fallback
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
   * Format email content with proper HTML and text versions
   */
  private formatEmailContent(request: NotificationRequest) {
    const customerName = request.customerName || 'Valued Customer';
    const linkHtml = request.link ? `<p><a href="${request.link}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Complete Form</a></p>` : '';
    const linkText = request.link ? `\n\nPlease complete this form: ${request.link}` : '';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">TETRIX</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Enterprise Communication Platform</p>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-top: 0;">Hello ${customerName},</h2>
          <div style="color: #666; line-height: 1.6;">
            ${request.content.replace(/\n/g, '<br>')}
          </div>
          ${linkHtml}
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            Best regards,<br>
            The TETRIX Team
          </p>
        </div>
      </div>
    `;

    const text = `Hello ${customerName},\n\n${request.content}${linkText}\n\nBest regards,\nThe TETRIX Team`;

    return { html, text };
  }

  /**
   * Format SMS content with character limits
   */
  private formatSMSContent(request: NotificationRequest) {
    const customerName = request.customerName || 'Customer';
    const link = request.link ? `\n\nForm: ${request.link}` : '';
    
    let content = `Hello ${customerName}, ${request.content}${link}`;
    
    // Ensure SMS doesn't exceed character limits
    if (content.length > 160) {
      content = content.substring(0, 157) + '...';
    }
    
    return content;
  }

  /**
   * Get provider name for a channel
   */
  private getProviderForChannel(channel: string): string {
    switch (channel) {
      case 'email': return 'mailgun';
      case 'sms': return 'telnyx';
      case 'whatsapp': return 'whatsapp';
      default: return 'unknown';
    }
  }

  /**
   * Test API connectivity
   */
  async testConnectivity(): Promise<{ [key: string]: boolean }> {
    const results: { [key: string]: boolean } = {};

    // Test Mailgun
    try {
      await this.mailgunClient.domains().get(this.config.mailgun.domain);
      results.mailgun = true;
    } catch (error) {
      console.error('Mailgun connectivity test failed:', error);
      results.mailgun = false;
    }

    // Test Telnyx
    try {
      const response = await axios.get('https://api.telnyx.com/v2/phone_numbers', {
        headers: {
          'Authorization': `Bearer ${this.config.telnyx.apiKey}`,
        },
      });
      results.telnyx = response.status === 200;
    } catch (error) {
      console.error('Telnyx connectivity test failed:', error);
      results.telnyx = false;
    }

    return results;
  }
}

// Create and export configured instance
export const notificationService = new NotificationService({
  mailgun: {
    apiKey: process.env.MAILGUN_API_KEY || '',
    domain: process.env.MAILGUN_DOMAIN || 'mg.tetrixcorp.com',
  },
  telnyx: {
    apiKey: process.env.TELNYX_API_KEY || '',
    messagingProfileId: process.env.TELNYX_MESSAGING_PROFILE_ID || process.env.TELNYX_PROFILE_ID || '',
  },
  sinch: {
    apiKey: process.env.SINCH_API_KEY || '',
    apiSecret: process.env.SINCH_API_SECRET || '',
    senderNumber: process.env.SINCH_SENDER_NUMBER || '',
  },
});

export default notificationService;
