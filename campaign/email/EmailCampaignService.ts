// Email Campaign Service
// Handles email campaigns for construction, fleet management, and healthcare industries

import Mailgun from 'mailgun-js';
import { mailgunConfig } from '../config/mailgun';

interface EmailCampaign {
  id: string;
  name: string;
  industry: 'construction' | 'fleet' | 'healthcare';
  subject: string;
  htmlContent: string;
  textContent: string;
  fromEmail: string;
  fromName: string;
  replyTo: string;
  scheduledAt?: Date;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  recipientCount: number;
  sentCount: number;
  openCount: number;
  clickCount: number;
  unsubscribeCount: number;
}

interface EmailRecipient {
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  industry: string;
  phoneNumber: string;
  customFields: Record<string, any>;
  tags: string[];
  status: 'active' | 'unsubscribed' | 'bounced' | 'complained';
  subscribedAt: Date;
  lastActivityAt?: Date;
}

interface CampaignTemplate {
  industry: 'construction' | 'fleet' | 'healthcare';
  templateName: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
  description: string;
}

export class EmailCampaignService {
  private mailgun: Mailgun.Mailgun;
  private domain: string;
  private apiKey: string;

  constructor() {
    this.apiKey = mailgunConfig.apiKey || process.env['MAILGUN_API_KEY'] || '';
    this.domain = mailgunConfig.domain || process.env['MAILGUN_DOMAIN'] || 'mg.tetrixcorp.com';
    
    if (!this.apiKey || !this.domain) {
      throw new Error('Mailgun API key and domain are required');
    }

    this.mailgun = Mailgun({
      apiKey: this.apiKey,
      domain: this.domain,
      host: 'api.mailgun.net'
    });
  }

  // Industry-specific email templates
  private getTemplates(): CampaignTemplate[] {
    return [
      // Construction Industry Template
      {
        industry: 'construction',
        templateName: 'construction_workflow_automation',
        subject: 'Transform Your Construction Projects with AI-Powered Workflow Automation',
        htmlContent: this.getConstructionEmailHTML(),
        textContent: this.getConstructionEmailText(),
        variables: ['firstName', 'companyName', 'projectCount', 'safetyScore'],
        description: 'Construction companies workflow automation and safety management'
      },
      
      // Fleet Management Template
      {
        industry: 'fleet',
        templateName: 'fleet_management_optimization',
        subject: 'Optimize Your Fleet Operations with Real-Time AI Management',
        htmlContent: this.getFleetEmailHTML(),
        textContent: this.getFleetEmailText(),
        variables: ['firstName', 'companyName', 'fleetSize', 'deliveryCount'],
        description: 'Fleet management optimization and driver communication'
      },
      
      // Healthcare Template
      {
        industry: 'healthcare',
        templateName: 'healthcare_communication_platform',
        subject: 'Enhance Patient Care with AI-Powered Healthcare Communication',
        htmlContent: this.getHealthcareEmailHTML(),
        textContent: this.getHealthcareEmailText(),
        variables: ['firstName', 'practiceName', 'patientCount', 'appointmentCount'],
        description: 'Healthcare communication and patient management automation'
      }
    ];
  }

  // Construction Industry Email Content
  private getConstructionEmailHTML(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Transform Your Construction Projects</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #6b7280; }
    .cta-button { display: inline-block; background: #f97316; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
    .feature { margin: 20px 0; padding: 15px; background: #f8fafc; border-left: 4px solid #f97316; }
    .stats { display: flex; justify-content: space-around; margin: 30px 0; }
    .stat { text-align: center; }
    .stat-number { font-size: 24px; font-weight: bold; color: #f97316; }
    .stat-label { font-size: 14px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏗️ Transform Your Construction Projects</h1>
      <p>AI-Powered Workflow Automation for Construction Companies</p>
    </div>
    
    <div class="content">
      <h2>Dear {{firstName}},</h2>
      
      <p>Are you tired of managing construction projects with outdated systems that slow down your team and increase safety risks?</p>
      
      <p>Our <strong>Construction Dashboard</strong> is revolutionizing how construction companies manage projects, ensuring safety compliance, and optimizing resource allocation through AI-powered automation.</p>
      
      <div class="stats">
        <div class="stat">
          <div class="stat-number">85%</div>
          <div class="stat-label">Equipment Utilization</div>
        </div>
        <div class="stat">
          <div class="stat-number">92%</div>
          <div class="stat-label">Workforce Efficiency</div>
        </div>
        <div class="stat">
          <div class="stat-number">78%</div>
          <div class="stat-label">Material Availability</div>
        </div>
      </div>
      
      <h3>🚀 What Our Construction Dashboard Delivers:</h3>
      
      <div class="feature">
        <h4>📊 Real-Time Project Management</h4>
        <p>Track project progress, manage timelines, and coordinate teams across multiple construction sites with live updates and automated reporting.</p>
      </div>
      
      <div class="feature">
        <h4>⚠️ Advanced Safety Management</h4>
        <p>Automated safety alerts, compliance tracking, and incident reporting to keep your workers safe and meet regulatory requirements.</p>
      </div>
      
      <div class="feature">
        <h4>🔧 Resource Optimization</h4>
        <p>AI-powered resource allocation, equipment tracking, and material management to reduce waste and improve efficiency.</p>
      </div>
      
      <div class="feature">
        <h4>📱 Mobile-First Design</h4>
        <p>Access critical project information, safety alerts, and team communication from any device, anywhere on the job site.</p>
      </div>
      
      <div class="feature">
        <h4>🔄 Workflow Automation</h4>
        <p>Automate routine tasks like safety inspections, progress reports, and client updates to focus on what matters most.</p>
      </div>
      
      <h3>💼 Perfect for {{companyName}}</h3>
      <p>Whether you're managing {{projectCount}} active projects or overseeing safety compliance across multiple sites, our platform scales with your business needs.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://tetrixcorp.com/dashboards/construction?utm_source=email&utm_campaign=construction&utm_medium=campaign" class="cta-button">
          Start Your 7-Day Free Trial
        </a>
      </div>
      
      <p><strong>No setup fees. No hidden costs. Cancel anytime during your trial.</strong></p>
      
      <h3>🎯 Industry-Specific Features:</h3>
      <ul>
        <li>Project status tracking with automated updates</li>
        <li>Safety compliance monitoring and alerts</li>
        <li>Resource management and optimization</li>
        <li>Team communication and collaboration tools</li>
        <li>Integration with existing construction software</li>
        <li>Real-time reporting and analytics</li>
      </ul>
      
      <p>Join hundreds of construction companies already using our platform to streamline operations and improve safety outcomes.</p>
      
      <p>Best regards,<br>
      The TETRIX Team</p>
    </div>
    
    <div class="footer">
      <p>TETRIX - AI-Powered Communication Platform</p>
      <p>123 Business Ave, Suite 100, City, State 12345</p>
      <p><a href="https://tetrixcorp.com/unsubscribe?email={{email}}">Unsubscribe</a> | <a href="https://tetrixcorp.com/privacy">Privacy Policy</a></p>
    </div>
  </div>
</body>
</html>`;
  }

  private getConstructionEmailText(): string {
    return `
TRANSFORM YOUR CONSTRUCTION PROJECTS
AI-Powered Workflow Automation for Construction Companies

Dear {{firstName}},

Are you tired of managing construction projects with outdated systems that slow down your team and increase safety risks?

Our Construction Dashboard is revolutionizing how construction companies manage projects, ensuring safety compliance, and optimizing resource allocation through AI-powered automation.

KEY BENEFITS:
• 85% Equipment Utilization Rate
• 92% Workforce Efficiency Improvement  
• 78% Material Availability Optimization

WHAT OUR CONSTRUCTION DASHBOARD DELIVERS:

📊 Real-Time Project Management
Track project progress, manage timelines, and coordinate teams across multiple construction sites with live updates and automated reporting.

⚠️ Advanced Safety Management
Automated safety alerts, compliance tracking, and incident reporting to keep your workers safe and meet regulatory requirements.

🔧 Resource Optimization
AI-powered resource allocation, equipment tracking, and material management to reduce waste and improve efficiency.

📱 Mobile-First Design
Access critical project information, safety alerts, and team communication from any device, anywhere on the job site.

🔄 Workflow Automation
Automate routine tasks like safety inspections, progress reports, and client updates to focus on what matters most.

Perfect for {{companyName}}
Whether you're managing {{projectCount}} active projects or overseeing safety compliance across multiple sites, our platform scales with your business needs.

START YOUR FREE TRIAL TODAY:
https://tetrixcorp.com/dashboards/construction?utm_source=email&utm_campaign=construction&utm_medium=campaign

No setup fees. No hidden costs. Cancel anytime during your trial.

INDUSTRY-SPECIFIC FEATURES:
• Project status tracking with automated updates
• Safety compliance monitoring and alerts
• Resource management and optimization
• Team communication and collaboration tools
• Integration with existing construction software
• Real-time reporting and analytics

Join hundreds of construction companies already using our platform to streamline operations and improve safety outcomes.

Best regards,
The TETRIX Team

---
TETRIX - AI-Powered Communication Platform
123 Business Ave, Suite 100, City, State 12345
Unsubscribe: https://tetrixcorp.com/unsubscribe?email={{email}}
Privacy Policy: https://tetrixcorp.com/privacy
`;
  }

  // Fleet Management Email Content
  private getFleetEmailHTML(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Optimize Your Fleet Operations</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #6b7280; }
    .cta-button { display: inline-block; background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
    .feature { margin: 20px 0; padding: 15px; background: #f8fafc; border-left: 4px solid #3b82f6; }
    .stats { display: flex; justify-content: space-around; margin: 30px 0; }
    .stat { text-align: center; }
    .stat-number { font-size: 24px; font-weight: bold; color: #3b82f6; }
    .stat-label { font-size: 14px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚛 Optimize Your Fleet Operations</h1>
      <p>Real-Time AI Management for Fleet Companies</p>
    </div>
    
    <div class="content">
      <h2>Dear {{firstName}},</h2>
      
      <p>Is your fleet management system holding you back from delivering exceptional service to your customers?</p>
      
      <p>Our <strong>Fleet Management Dashboard</strong> empowers logistics companies with real-time tracking, AI-powered route optimization, and seamless driver communication to maximize efficiency and customer satisfaction.</p>
      
      <div class="stats">
        <div class="stat">
          <div class="stat-number">94%</div>
          <div class="stat-label">On-Time Delivery Rate</div>
        </div>
        <div class="stat">
          <div class="stat-number">87%</div>
          <div class="stat-label">Customer Satisfaction</div>
        </div>
        <div class="stat">
          <div class="stat-number">12%</div>
          <div class="stat-label">Fuel Efficiency Improvement</div>
        </div>
      </div>
      
      <h3>🚀 What Our Fleet Dashboard Delivers:</h3>
      
      <div class="feature">
        <h4>📍 Real-Time Vehicle Tracking</h4>
        <p>Monitor your entire fleet with live GPS tracking, route optimization, and automated delivery status updates for complete visibility.</p>
      </div>
      
      <div class="feature">
        <h4>📱 Driver Communication Hub</h4>
        <p>Seamless communication between dispatchers and drivers with instant messaging, route updates, and emergency alerts.</p>
      </div>
      
      <div class="feature">
        <h4>🎯 Delivery Management</h4>
        <p>Automated delivery scheduling, customer notifications, and proof-of-delivery tracking to ensure every package reaches its destination.</p>
      </div>
      
      <div class="feature">
        <h4>📊 Performance Analytics</h4>
        <p>Comprehensive reporting on driver performance, fuel efficiency, delivery times, and customer satisfaction metrics.</p>
      </div>
      
      <div class="feature">
        <h4>🔄 Workflow Automation</h4>
        <p>Automate routine tasks like route planning, customer notifications, and maintenance scheduling to focus on growth.</p>
      </div>
      
      <h3>💼 Perfect for {{companyName}}</h3>
      <p>Whether you're managing {{fleetSize}} vehicles or processing {{deliveryCount}} deliveries daily, our platform scales with your logistics operations.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://tetrixcorp.com/dashboards/logistics?utm_source=email&utm_campaign=fleet&utm_medium=campaign" class="cta-button">
          Start Your 7-Day Free Trial
        </a>
      </div>
      
      <p><strong>No setup fees. No hidden costs. Cancel anytime during your trial.</strong></p>
      
      <h3>🎯 Industry-Specific Features:</h3>
      <ul>
        <li>Real-time vehicle tracking and monitoring</li>
        <li>AI-powered route optimization</li>
        <li>Driver communication and management</li>
        <li>Delivery automation and tracking</li>
        <li>Fuel efficiency monitoring</li>
        <li>Customer satisfaction tracking</li>
      </ul>
      
      <p>Join leading logistics companies already using our platform to optimize operations and exceed customer expectations.</p>
      
      <p>Best regards,<br>
      The TETRIX Team</p>
    </div>
    
    <div class="footer">
      <p>TETRIX - AI-Powered Communication Platform</p>
      <p>123 Business Ave, Suite 100, City, State 12345</p>
      <p><a href="https://tetrixcorp.com/unsubscribe?email={{email}}">Unsubscribe</a> | <a href="https://tetrixcorp.com/privacy">Privacy Policy</a></p>
    </div>
  </div>
</body>
</html>`;
  }

  private getFleetEmailText(): string {
    return `
OPTIMIZE YOUR FLEET OPERATIONS
Real-Time AI Management for Fleet Companies

Dear {{firstName}},

Is your fleet management system holding you back from delivering exceptional service to your customers?

Our Fleet Management Dashboard empowers logistics companies with real-time tracking, AI-powered route optimization, and seamless driver communication to maximize efficiency and customer satisfaction.

KEY BENEFITS:
• 94% On-Time Delivery Rate
• 87% Customer Satisfaction Score
• 12% Fuel Efficiency Improvement

WHAT OUR FLEET DASHBOARD DELIVERS:

📍 Real-Time Vehicle Tracking
Monitor your entire fleet with live GPS tracking, route optimization, and automated delivery status updates for complete visibility.

📱 Driver Communication Hub
Seamless communication between dispatchers and drivers with instant messaging, route updates, and emergency alerts.

🎯 Delivery Management
Automated delivery scheduling, customer notifications, and proof-of-delivery tracking to ensure every package reaches its destination.

📊 Performance Analytics
Comprehensive reporting on driver performance, fuel efficiency, delivery times, and customer satisfaction metrics.

🔄 Workflow Automation
Automate routine tasks like route planning, customer notifications, and maintenance scheduling to focus on growth.

Perfect for {{companyName}}
Whether you're managing {{fleetSize}} vehicles or processing {{deliveryCount}} deliveries daily, our platform scales with your logistics operations.

START YOUR FREE TRIAL TODAY:
https://tetrixcorp.com/dashboards/logistics?utm_source=email&utm_campaign=fleet&utm_medium=campaign

No setup fees. No hidden costs. Cancel anytime during your trial.

INDUSTRY-SPECIFIC FEATURES:
• Real-time vehicle tracking and monitoring
• AI-powered route optimization
• Driver communication and management
• Delivery automation and tracking
• Fuel efficiency monitoring
• Customer satisfaction tracking

Join leading logistics companies already using our platform to optimize operations and exceed customer expectations.

Best regards,
The TETRIX Team

---
TETRIX - AI-Powered Communication Platform
123 Business Ave, Suite 100, City, State 12345
Unsubscribe: https://tetrixcorp.com/unsubscribe?email={{email}}
Privacy Policy: https://tetrixcorp.com/privacy
`;
  }

  // Healthcare Email Content
  private getHealthcareEmailHTML(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Enhance Patient Care</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #6b7280; }
    .cta-button { display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
    .feature { margin: 20px 0; padding: 15px; background: #f0fdf4; border-left: 4px solid #10b981; }
    .stats { display: flex; justify-content: space-around; margin: 30px 0; }
    .stat { text-align: center; }
    .stat-number { font-size: 24px; font-weight: bold; color: #10b981; }
    .stat-label { font-size: 14px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏥 Enhance Patient Care</h1>
      <p>AI-Powered Healthcare Communication Platform</p>
    </div>
    
    <div class="content">
      <h2>Dear {{firstName}},</h2>
      
      <p>Are you struggling to keep up with patient communication while maintaining the high-quality care your patients deserve?</p>
      
      <p>Our <strong>Healthcare Dashboard</strong> streamlines patient communication, automates appointment management, and enhances care coordination through AI-powered workflows designed specifically for healthcare providers.</p>
      
      <div class="stats">
        <div class="stat">
          <div class="stat-number">156</div>
          <div class="stat-label">Appointment Reminders Sent</div>
        </div>
        <div class="stat">
          <div class="stat-number">89%</div>
          <div class="stat-label">Response Rate</div>
        </div>
        <div class="stat">
          <div class="stat-number">4.8/5</div>
          <div class="stat-label">Patient Satisfaction</div>
        </div>
      </div>
      
      <h3>🚀 What Our Healthcare Dashboard Delivers:</h3>
      
      <div class="feature">
        <h4>📅 Smart Appointment Scheduling</h4>
        <p>Automated appointment booking, reminders, and rescheduling with intelligent conflict detection and provider availability optimization.</p>
      </div>
      
      <div class="feature">
        <h4>🚨 Emergency Triage System</h4>
        <p>AI-powered patient triage, priority assessment, and automated emergency alerts to ensure critical cases receive immediate attention.</p>
      </div>
      
      <div class="feature">
        <h4>📱 Patient Communication Hub</h4>
        <p>Seamless patient communication through multiple channels including SMS, email, and voice calls with automated follow-up workflows.</p>
      </div>
      
      <div class="feature">
        <h4>🔗 EHR Integration</h4>
        <p>Connect with Epic, Cerner, and other major EHR systems for seamless data flow and comprehensive patient records management.</p>
      </div>
      
      <div class="feature">
        <h4>🛡️ HIPAA Compliance</h4>
        <p>Built-in HIPAA compliance features, secure messaging, and audit trails to protect patient privacy and meet regulatory requirements.</p>
      </div>
      
      <h3>💼 Perfect for {{practiceName}}</h3>
      <p>Whether you're managing {{patientCount}} patients or scheduling {{appointmentCount}} appointments daily, our platform enhances your practice's efficiency and patient satisfaction.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://tetrixcorp.com/dashboards/healthcare?utm_source=email&utm_campaign=healthcare&utm_medium=campaign" class="cta-button">
          Start Your 7-Day Free Trial
        </a>
      </div>
      
      <p><strong>No setup fees. No hidden costs. Cancel anytime during your trial.</strong></p>
      
      <h3>🎯 Industry-Specific Features:</h3>
      <ul>
        <li>Appointment scheduling and management</li>
        <li>Patient communication automation</li>
        <li>Emergency triage and alerts</li>
        <li>EHR system integration</li>
        <li>HIPAA-compliant messaging</li>
        <li>Care coordination workflows</li>
      </ul>
      
      <p>Join healthcare providers nationwide who trust our platform to enhance patient care and streamline practice operations.</p>
      
      <p>Best regards,<br>
      The TETRIX Team</p>
    </div>
    
    <div class="footer">
      <p>TETRIX - AI-Powered Communication Platform</p>
      <p>123 Business Ave, Suite 100, City, State 12345</p>
      <p><a href="https://tetrixcorp.com/unsubscribe?email={{email}}">Unsubscribe</a> | <a href="https://tetrixcorp.com/privacy">Privacy Policy</a></p>
    </div>
  </div>
</body>
</html>`;
  }

  private getHealthcareEmailText(): string {
    return `
ENHANCE PATIENT CARE
AI-Powered Healthcare Communication Platform

Dear {{firstName}},

Are you struggling to keep up with patient communication while maintaining the high-quality care your patients deserve?

Our Healthcare Dashboard streamlines patient communication, automates appointment management, and enhances care coordination through AI-powered workflows designed specifically for healthcare providers.

KEY BENEFITS:
• 156 Appointment Reminders Sent Daily
• 89% Patient Response Rate
• 4.8/5 Patient Satisfaction Score

WHAT OUR HEALTHCARE DASHBOARD DELIVERS:

📅 Smart Appointment Scheduling
Automated appointment booking, reminders, and rescheduling with intelligent conflict detection and provider availability optimization.

🚨 Emergency Triage System
AI-powered patient triage, priority assessment, and automated emergency alerts to ensure critical cases receive immediate attention.

📱 Patient Communication Hub
Seamless patient communication through multiple channels including SMS, email, and voice calls with automated follow-up workflows.

🔗 EHR Integration
Connect with Epic, Cerner, and other major EHR systems for seamless data flow and comprehensive patient records management.

🛡️ HIPAA Compliance
Built-in HIPAA compliance features, secure messaging, and audit trails to protect patient privacy and meet regulatory requirements.

Perfect for {{practiceName}}
Whether you're managing {{patientCount}} patients or scheduling {{appointmentCount}} appointments daily, our platform enhances your practice's efficiency and patient satisfaction.

START YOUR FREE TRIAL TODAY:
https://tetrixcorp.com/dashboards/healthcare?utm_source=email&utm_campaign=healthcare&utm_medium=campaign

No setup fees. No hidden costs. Cancel anytime during your trial.

INDUSTRY-SPECIFIC FEATURES:
• Appointment scheduling and management
• Patient communication automation
• Emergency triage and alerts
• EHR system integration
• HIPAA-compliant messaging
• Care coordination workflows

Join healthcare providers nationwide who trust our platform to enhance patient care and streamline practice operations.

Best regards,
The TETRIX Team

---
TETRIX - AI-Powered Communication Platform
123 Business Ave, Suite 100, City, State 12345
Unsubscribe: https://tetrixcorp.com/unsubscribe?email={{email}}
Privacy Policy: https://tetrixcorp.com/privacy
`;
  }

  // Send email campaign
  async sendCampaign(campaign: EmailCampaign, recipients: EmailRecipient[]): Promise<{
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
          const personalizedHTML = this.replaceVariables(campaign.htmlContent, recipient);
          const personalizedText = this.replaceVariables(campaign.textContent, recipient);
          const personalizedSubject = this.replaceVariables(campaign.subject, recipient);

          const data = {
            from: `${campaign.fromName} <${campaign.fromEmail}>`,
            to: recipient.email,
            subject: personalizedSubject,
            html: personalizedHTML,
            text: personalizedText,
            'h:Reply-To': campaign.replyTo,
            'v:campaign_id': campaign.id,
            'v:recipient_id': recipient.email,
            'v:industry': recipient.industry
          };

          await this.mailgun.messages().send(data);
          sentCount++;
        } catch (error) {
          failedCount++;
          errors.push(`Failed to send to ${recipient.email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  // Replace template variables
  private replaceVariables(content: string, recipient: EmailRecipient): string {
    return content
      .replace(/\{\{firstName\}\}/g, recipient.firstName || 'Valued Customer')
      .replace(/\{\{lastName\}\}/g, recipient.lastName || '')
      .replace(/\{\{companyName\}\}/g, recipient.company || 'Your Company')
      .replace(/\{\{practiceName\}\}/g, recipient.company || 'Your Practice')
      .replace(/\{\{email\}\}/g, recipient.email)
      .replace(/\{\{phoneNumber\}\}/g, recipient.phoneNumber || '')
      .replace(/\{\{projectCount\}\}/g, 'multiple')
      .replace(/\{\{fleetSize\}\}/g, 'your fleet')
      .replace(/\{\{deliveryCount\}\}/g, 'daily deliveries')
      .replace(/\{\{patientCount\}\}/g, 'your patients')
      .replace(/\{\{appointmentCount\}\}/g, 'daily appointments')
      .replace(/\{\{safetyScore\}\}/g, 'excellent');
  }

  // Get campaign template by industry
  getTemplateByIndustry(industry: 'construction' | 'fleet' | 'healthcare'): CampaignTemplate | null {
    const templates = this.getTemplates();
    return templates.find(t => t.industry === industry) || null;
  }

  // Create campaign from template
  createCampaignFromTemplate(
    industry: 'construction' | 'fleet' | 'healthcare',
    campaignName: string,
    fromEmail: string = 'noreply@tetrixcorp.com',
    fromName: string = 'TETRIX Team',
    replyTo: string = 'support@tetrixcorp.com'
  ): EmailCampaign {
    const template = this.getTemplateByIndustry(industry);
    if (!template) {
      throw new Error(`No template found for industry: ${industry}`);
    }

    return {
      id: `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: campaignName,
      industry,
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent,
      fromEmail,
      fromName,
      replyTo,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      recipientCount: 0,
      sentCount: 0,
      openCount: 0,
      clickCount: 0,
      unsubscribeCount: 0
    };
  }
}