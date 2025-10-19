# TETRIX Campaign System

A comprehensive email and SMS campaign management system designed for construction, fleet management, and healthcare industries.

## 🚀 Features

### Email Campaigns
- **Industry-Specific Templates**: Tailored content for construction, fleet, and healthcare
- **Personalization**: Dynamic content based on lead data
- **Mailgun Integration**: Reliable email delivery
- **Analytics**: Open rates, click rates, and engagement tracking

### SMS Campaigns
- **Telnyx Integration**: High-delivery SMS service
- **Character Optimization**: Messages optimized for 160-character limit
- **Opt-out Handling**: Automatic unsubscribe management
- **Delivery Tracking**: Real-time delivery status updates

### Sales Funnel
- **Multi-Stage Pipeline**: 6-stage sales process
- **Lead Scoring**: AI-powered lead qualification
- **Automated Workflows**: Trigger-based actions
- **Performance Analytics**: Conversion rates and revenue tracking

## 📁 Directory Structure

```
campaign/
├── email/
│   └── EmailCampaignService.ts      # Email campaign management
├── sms/
│   └── SMSCampaignService.ts        # SMS campaign management
├── api/
│   └── CampaignManager.ts           # Centralized campaign management
├── dashboard/
│   └── CampaignDashboard.tsx        # React dashboard component
├── SalesFunnelService.ts            # Sales funnel management
├── executeCampaign.ts               # Campaign execution script
└── README.md                        # This file
```

## 🛠️ Setup

### Prerequisites
- Node.js 18+
- Mailgun account and API key
- Telnyx account and API key
- TypeScript

### Environment Variables
```bash
# Mailgun Configuration
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_mailgun_domain

# Telnyx Configuration
TELNYX_API_KEY=your_telnyx_api_key
TELNYX_MESSAGING_PROFILE_ID=your_messaging_profile_id

# Application Configuration
BASE_URL=https://your-domain.com
```

### Installation
```bash
# Install dependencies
npm install mailgun-js

# Compile TypeScript
npx tsc

# Execute campaigns
node dist/executeCampaign.js
```

## 📧 Email Campaigns

### Industry Templates

#### Construction Industry
- **Subject**: "Transform Your Construction Projects with AI-Powered Workflow Automation"
- **Focus**: Project management, safety compliance, resource optimization
- **Key Features**: Real-time tracking, safety alerts, resource management

#### Fleet Management
- **Subject**: "Optimize Your Fleet Operations with Real-Time AI Management"
- **Focus**: Vehicle tracking, route optimization, driver communication
- **Key Features**: GPS tracking, delivery management, performance analytics

#### Healthcare
- **Subject**: "Enhance Patient Care with AI-Powered Healthcare Communication"
- **Focus**: Appointment scheduling, patient communication, emergency triage
- **Key Features**: EHR integration, HIPAA compliance, care coordination

### Usage Example
```typescript
import { EmailCampaignService } from './email/EmailCampaignService';

const emailService = new EmailCampaignService();

// Create campaign from template
const campaign = emailService.createCampaignFromTemplate(
  'construction',
  'Q1 Construction Campaign',
  'noreply@tetrix.com',
  'TETRIX Team',
  'support@tetrix.com'
);

// Send campaign
const recipients = [
  {
    email: 'john@construction.com',
    firstName: 'John',
    company: 'Construction Co.',
    industry: 'construction',
    status: 'active',
    subscribedAt: new Date()
  }
];

const result = await emailService.sendCampaign(campaign, recipients);
```

## 📱 SMS Campaigns

### Message Templates

#### Construction
```
🏗️ {{firstName}}, transform your construction projects with AI-powered workflow automation. Track safety, manage resources & boost efficiency. Start free trial: https://tetrix.com/dashboards/construction?utm_source=sms&utm_campaign=construction Reply STOP to opt out.
```

#### Fleet Management
```
🚛 {{firstName}}, optimize your fleet operations with real-time AI management. Track vehicles, optimize routes & improve delivery efficiency. Start free trial: https://tetrix.com/dashboards/logistics?utm_source=sms&utm_campaign=fleet Reply STOP to opt out.
```

#### Healthcare
```
🏥 {{firstName}}, enhance patient care with AI-powered healthcare communication. Automate appointments, streamline triage & improve patient satisfaction. Start free trial: https://tetrix.com/dashboards/healthcare?utm_source=sms&utm_campaign=healthcare Reply STOP to opt out.
```

### Usage Example
```typescript
import { SMSCampaignService } from './sms/SMSCampaignService';

const smsService = new SMSCampaignService();

// Create campaign from template
const campaign = smsService.createCampaignFromTemplate(
  'fleet',
  'Q1 Fleet Campaign',
  '+15551234567'
);

// Send campaign
const recipients = [
  {
    phoneNumber: '+15551234568',
    firstName: 'Lisa',
    company: 'Fleet Co.',
    industry: 'fleet',
    status: 'active',
    subscribedAt: new Date()
  }
];

const result = await smsService.sendCampaign(campaign, recipients);
```

## 🎯 Sales Funnel

### Funnel Stages

1. **New Lead** (0-1 days)
   - Welcome email sent immediately
   - Follow-up SMS after 2 hours
   - Auto-advance to "Contacted" after 24 hours

2. **Contacted** (1-7 days)
   - Follow-up email after 2 days
   - Follow-up SMS after 3 days
   - Move to "Interested" on engagement

3. **Interested** (7-14 days)
   - Value proposition email
   - Qualification call scheduled
   - Case study email after 5 days

4. **Qualified** (7-14 days)
   - Demo meeting scheduled
   - Pricing information sent
   - Move to "Proposal" after demo

5. **Proposal** (14-28 days)
   - Proposal sent
   - Follow-up calls
   - Testimonial emails

6. **Negotiation** (21-42 days)
   - Negotiation calls
   - Urgency emails
   - Final decision

### Lead Scoring
- **Industry**: Healthcare (90), Construction (80), Fleet (75)
- **Contact Info**: Email (+10), Phone (+10), Name (+10), Company (+10)
- **Source**: Referral (+20), Website (+15), Email (+10), SMS (+5)

### Usage Example
```typescript
import { SalesFunnelService } from './SalesFunnelService';

const funnelService = new SalesFunnelService();

// Add lead to funnel
const lead = funnelService.addLead({
  email: 'john@company.com',
  phoneNumber: '+15551234567',
  firstName: 'John',
  lastName: 'Smith',
  company: 'Smith Co.',
  industry: 'construction',
  source: 'website'
});

// Update lead status
funnelService.updateLeadStatus(lead.id, 'interested');

// Get analytics
const metrics = funnelService.getCampaignMetrics();
```

## 🎪 Campaign Manager

### Centralized Management
The `CampaignManager` class provides a unified interface for managing all campaign activities:

```typescript
import { CampaignManager } from './api/CampaignManager';

const campaignManager = new CampaignManager({
  emailService,
  smsService,
  funnelService
});

// Execute campaign for all industries
const results = await campaignManager.executeAllIndustryCampaigns(
  leads,
  'Q1 Campaign',
  'noreply@tetrix.com',
  'TETRIX Team',
  'support@tetrix.com',
  '+15551234567'
);
```

### Analytics
```typescript
// Get campaign analytics
const analytics = campaignManager.getCampaignAnalytics();
console.log(`Total Leads: ${analytics.totalLeads}`);
console.log(`Conversion Rate: ${analytics.conversionRate}%`);
console.log(`Revenue: $${analytics.revenue}`);

// Get lead recommendations
const recommendations = campaignManager.getLeadRecommendations();
console.log('Next Actions:', recommendations.nextActions);
```

## 📊 Dashboard

### React Dashboard Component
```tsx
import CampaignDashboard from './dashboard/CampaignDashboard';

<CampaignDashboard className="my-4" />
```

### Features
- Real-time metrics display
- Lead filtering and sorting
- Industry distribution charts
- Lead status tracking
- Performance analytics

## 🚀 Execution

### Run Campaigns
```bash
# Execute all campaigns
npm run campaign:execute

# Or run directly
node dist/executeCampaign.js
```

### Campaign Configuration
```typescript
const campaignConfig = {
  campaignName: 'TETRIX Industry Dashboard Launch',
  fromEmail: 'noreply@tetrix.com',
  fromName: 'TETRIX Team',
  replyTo: 'support@tetrix.com',
  fromNumber: '+15551234567'
};
```

## 📈 Analytics & Reporting

### Key Metrics
- **Total Leads**: Number of leads in the system
- **Conversion Rate**: Percentage of leads that convert
- **Average Score**: Average lead quality score
- **Revenue**: Total revenue generated
- **Industry Distribution**: Leads by industry
- **Source Distribution**: Leads by acquisition source

### Export Data
```typescript
// Export as CSV
const csvData = campaignManager.exportCampaignData('csv');

// Export as JSON
const jsonData = campaignManager.exportCampaignData('json');
```

## 🔧 Customization

### Adding New Industries
1. Add industry to type definitions
2. Create email template in `EmailCampaignService`
3. Create SMS template in `SMSCampaignService`
4. Update funnel stages if needed

### Custom Templates
```typescript
// Add custom email template
const customTemplate = {
  industry: 'retail',
  templateName: 'retail_automation',
  subject: 'Boost Your Retail Operations',
  htmlContent: '<html>...</html>',
  textContent: 'Boost Your Retail Operations...',
  variables: ['firstName', 'storeName'],
  description: 'Retail automation and customer management'
};
```

## 🛡️ Compliance

### Email Compliance
- Unsubscribe links in all emails
- Physical address in footer
- Clear sender identification
- CAN-SPAM Act compliance

### SMS Compliance
- Opt-out instructions (Reply STOP)
- Clear sender identification
- TCPA compliance
- Automatic opt-out handling

## 📞 Support

### Troubleshooting
1. Check environment variables
2. Verify API credentials
3. Check delivery logs
4. Monitor error rates

### Common Issues
- **Email not sending**: Check Mailgun configuration
- **SMS not sending**: Verify Telnyx setup
- **Low delivery rates**: Check recipient data quality
- **High bounce rates**: Validate email addresses

## 🔄 Maintenance

### Regular Tasks
- Monitor campaign performance
- Update lead scores
- Clean up bounced emails
- Review opt-out lists
- Analyze conversion rates

### Performance Optimization
- A/B test subject lines
- Optimize send times
- Segment audiences
- Personalize content
- Track engagement metrics

---

For more information, contact the TETRIX development team or refer to the individual service documentation.
