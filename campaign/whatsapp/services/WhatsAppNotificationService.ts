// WhatsApp Admin Notification Service
// Handles alerts and notifications for critical WhatsApp events

export interface NotificationChannel {
  type: 'email' | 'slack' | 'sms' | 'webhook';
  enabled: boolean;
  config: Record<string, any>;
}

export interface NotificationSettings {
  templateRejections: boolean;
  phoneQualityDegradation: boolean;
  accountBans: boolean;
  accountRestrictions: boolean;
  securityEvents: boolean;
  highFailureRate: boolean;
  channels: NotificationChannel[];
}

export class WhatsAppNotificationService {
  private settings: NotificationSettings;

  constructor(settings?: Partial<NotificationSettings>) {
    this.settings = {
      templateRejections: true,
      phoneQualityDegradation: true,
      accountBans: true,
      accountRestrictions: true,
      securityEvents: true,
      highFailureRate: true,
      channels: settings?.channels || [
        {
          type: 'email',
          enabled: true,
          config: {
            to: process.env['ADMIN_EMAIL'] || 'admin@tetrixcorp.com',
            from: 'alerts@tetrixcorp.com'
          }
        }
      ],
      ...settings
    };
  }

  // Notify about template rejection
  async notifyTemplateRejection(templateName: string, reason?: string): Promise<void> {
    if (!this.settings.templateRejections) return;

    const message = `
🚨 WhatsApp Template Rejected

Template: ${templateName}
Reason: ${reason || 'Not specified'}
Action Required: Review and resubmit the template with corrections

Time: ${new Date().toISOString()}
    `.trim();

    await this.sendNotification({
      subject: `[URGENT] WhatsApp Template Rejected: ${templateName}`,
      message,
      priority: 'high'
    });
  }

  // Notify about phone number quality degradation
  async notifyPhoneQualityChange(
    displayPhoneNumber: string,
    qualityRating: 'GREEN' | 'YELLOW' | 'RED',
    currentLimit: string,
    previousRating?: string
  ): Promise<void> {
    if (!this.settings.phoneQualityDegradation) return;

    // Only notify on degradation
    if (qualityRating === 'GREEN') return;

    const emoji = qualityRating === 'RED' ? '🔴' : '⚠️';
    const urgency = qualityRating === 'RED' ? 'CRITICAL' : 'WARNING';

    const message = `
${emoji} WhatsApp Phone Number Quality ${urgency}

Phone Number: ${displayPhoneNumber}
Quality Rating: ${previousRating || 'Unknown'} → ${qualityRating}
Messaging Limit: ${currentLimit}

${qualityRating === 'RED' 
  ? '⚠️ IMMEDIATE ACTION REQUIRED: Phone number messaging may be restricted soon!'
  : '⚠️ Action Recommended: Review messaging practices to prevent further degradation'}

Recommendations:
1. Review recent message templates and content
2. Check user feedback and complaints
3. Ensure compliance with WhatsApp policies
4. Reduce message frequency if needed

Time: ${new Date().toISOString()}
    `.trim();

    await this.sendNotification({
      subject: `[${urgency}] WhatsApp Quality Alert: ${displayPhoneNumber}`,
      message,
      priority: qualityRating === 'RED' ? 'critical' : 'high'
    });
  }

  // Notify about account ban
  async notifyAccountBan(phoneNumber: string, banInfo?: any): Promise<void> {
    if (!this.settings.accountBans) return;

    const message = `
🚨 CRITICAL: WhatsApp Account Banned

Phone Number: ${phoneNumber}
Ban Info: ${banInfo ? JSON.stringify(banInfo, null, 2) : 'No details provided'}

IMMEDIATE ACTION REQUIRED:
1. Contact WhatsApp Business Support immediately
2. Review account activity for policy violations
3. Prepare appeal documentation
4. Pause all campaigns on this number

Support: https://business.facebook.com/support/

Time: ${new Date().toISOString()}
    `.trim();

    await this.sendNotification({
      subject: `[CRITICAL] WhatsApp Account Banned: ${phoneNumber}`,
      message,
      priority: 'critical'
    });
  }

  // Notify about account restriction
  async notifyAccountRestriction(phoneNumber: string, event: string): Promise<void> {
    if (!this.settings.accountRestrictions) return;

    const message = `
⚠️ WhatsApp Account Restricted

Phone Number: ${phoneNumber}
Event: ${event}

Action Required:
1. Review account status in WhatsApp Business Manager
2. Check for policy violations
3. Take corrective action if needed

Time: ${new Date().toISOString()}
    `.trim();

    await this.sendNotification({
      subject: `[WARNING] WhatsApp Account Restricted: ${phoneNumber}`,
      message,
      priority: 'high'
    });
  }

  // Notify about account review decision
  async notifyAccountReview(decision: 'APPROVED' | 'REJECTED'): Promise<void> {
    const emoji = decision === 'APPROVED' ? '✅' : '❌';
    const message = `
${emoji} WhatsApp Account Review ${decision}

Decision: ${decision}
${decision === 'REJECTED' 
  ? 'Action Required: Contact WhatsApp Business Support for more information'
  : 'Your account has been approved and is ready for use'}

Time: ${new Date().toISOString()}
    `.trim();

    await this.sendNotification({
      subject: `WhatsApp Account Review ${decision}`,
      message,
      priority: decision === 'REJECTED' ? 'high' : 'normal'
    });
  }

  // Notify about security event
  async notifySecurityEvent(eventData: any): Promise<void> {
    if (!this.settings.securityEvents) return;

    const message = `
🔒 WhatsApp Security Event Detected

Event Data: ${JSON.stringify(eventData, null, 2)}

Action Required:
1. Review security logs
2. Check for unauthorized access
3. Update security protocols if needed
4. Contact security team

Time: ${new Date().toISOString()}
    `.trim();

    await this.sendNotification({
      subject: '[SECURITY] WhatsApp Security Event',
      message,
      priority: 'critical'
    });
  }

  // Notify about high failure rate
  async notifyHighFailureRate(campaignId: string, failureRate: number, failedCount: number): Promise<void> {
    if (!this.settings.highFailureRate) return;
    if (failureRate < 0.1) return; // Only notify if >10% failure rate

    const message = `
⚠️ High Message Failure Rate Detected

Campaign ID: ${campaignId}
Failure Rate: ${(failureRate * 100).toFixed(2)}%
Failed Messages: ${failedCount}

Possible Causes:
1. Invalid phone numbers
2. Template issues
3. Phone number quality problems
4. Policy violations

Action Required:
1. Review failed messages
2. Check phone number validity
3. Verify template approval status
4. Review phone number quality rating

Time: ${new Date().toISOString()}
    `.trim();

    await this.sendNotification({
      subject: `[WARNING] High Message Failure Rate: Campaign ${campaignId}`,
      message,
      priority: 'high'
    });
  }

  // Send notification through configured channels
  private async sendNotification(notification: {
    subject: string;
    message: string;
    priority: 'normal' | 'high' | 'critical';
  }): Promise<void> {
    for (const channel of this.settings.channels) {
      if (!channel.enabled) continue;

      try {
        switch (channel.type) {
          case 'email':
            await this.sendEmail(notification, channel.config);
            break;
          case 'slack':
            await this.sendSlack(notification, channel.config);
            break;
          case 'sms':
            await this.sendSMS(notification, channel.config);
            break;
          case 'webhook':
            await this.sendWebhook(notification, channel.config);
            break;
        }
      } catch (error) {
        console.error(`Failed to send notification via ${channel.type}:`, error);
      }
    }
  }

  // Email notification implementation
  private async sendEmail(notification: any, config: any): Promise<void> {
    console.log(`📧 Email notification to ${config.to}:`, notification.subject);
    
    // TODO: Integrate with email service (e.g., SendGrid, Mailgun, AWS SES)
    // Example with Mailgun:
    // const mailgun = require('mailgun-js')({
    //   apiKey: process.env.MAILGUN_API_KEY,
    //   domain: process.env.MAILGUN_DOMAIN
    // });
    // 
    // await mailgun.messages().send({
    //   from: config.from,
    //   to: config.to,
    //   subject: notification.subject,
    //   text: notification.message
    // });
  }

  // Slack notification implementation
  private async sendSlack(notification: any, config: any): Promise<void> {
    console.log(`💬 Slack notification to ${config.webhook}:`, notification.subject);
    
    // TODO: Integrate with Slack
    // await fetch(config.webhook, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     text: notification.subject,
    //     blocks: [
    //       {
    //         type: 'section',
    //         text: {
    //           type: 'mrkdwn',
    //           text: notification.message
    //         }
    //       }
    //     ]
    //   })
    // });
  }

  // SMS notification implementation
  private async sendSMS(notification: any, config: any): Promise<void> {
    console.log(`📱 SMS notification to ${config.to}:`, notification.subject);
    
    // TODO: Integrate with SMS service (e.g., Twilio, Telnyx)
  }

  // Webhook notification implementation
  private async sendWebhook(notification: any, config: any): Promise<void> {
    console.log(`🔗 Webhook notification to ${config.url}:`, notification.subject);
    
    // TODO: Send to custom webhook endpoint
    // await fetch(config.url, {
    //   method: 'POST',
    //   headers: { 
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${config.token}`
    //   },
    //   body: JSON.stringify(notification)
    // });
  }
}

