# WhatsApp Campaign Services Guide

## Overview

The WhatsApp Campaign module now includes comprehensive services for webhook handling, database storage, admin notifications, analytics tracking, and opt-out management.

## Architecture

```
campaign/whatsapp/
├── WhatsAppCampaignService.ts          # Main service orchestrating all features
├── schemas/
│   └── whatsapp-webhooks.schema.ts     # Database schema definitions
├── services/
│   ├── WhatsAppWebhookStorageService.ts    # Database operations
│   └── WhatsAppNotificationService.ts      # Admin notifications
└── SERVICES_GUIDE.md                   # This file
```

## Services

### 1. WhatsAppCampaignService (Main Service)

The central service that orchestrates all WhatsApp operations.

**Features:**
- Campaign management
- Message sending (Cloud API & Marketing Messages API)
- Webhook processing
- Template management
- Business profile management

**Usage:**
```typescript
const whatsappService = new WhatsAppCampaignService();

// Send a campaign
const result = await whatsappService.sendCampaign(campaign, recipients);

// Handle webhook
await whatsappService.handleWebhook(webhookData);
```

### 2. WhatsAppWebhookStorageService

Handles all database operations for WhatsApp data.

**Features:**
- Webhook logging
- Message storage
- Status tracking
- Template status updates
- Phone number quality tracking
- Campaign analytics
- Opt-out management

**Database Schema:**
- `WhatsAppWebhookLog` - Raw webhook logs
- `WhatsAppMessage` - Message history
- `WhatsAppMessageStatus` - Delivery statuses
- `WhatsAppTemplate` - Template status
- `WhatsAppPhoneNumber` - Phone quality ratings
- `WhatsAppAccountEvent` - Account events
- `WhatsAppCampaignAnalytics` - Campaign metrics
- `WhatsAppOptOut` - Opt-out records

**Integration:**
```typescript
// The service is automatically initialized in WhatsAppCampaignService
// To use with your database:

// 1. Install Prisma/MongoDB/your preferred DB
// 2. Create schema based on whatsapp-webhooks.schema.ts
// 3. Uncomment database operations in WhatsAppWebhookStorageService.ts
// 4. Update with your database client
```

### 3. WhatsAppNotificationService

Sends admin notifications for critical events.

**Supported Channels:**
- Email (default)
- Slack
- SMS
- Custom webhooks

**Event Types:**
- Template rejections
- Phone quality degradation (YELLOW/RED)
- Account bans
- Account restrictions
- Security events
- High failure rates

**Configuration:**
```typescript
const notificationService = new WhatsAppNotificationService({
  templateRejections: true,
  phoneQualityDegradation: true,
  accountBans: true,
  channels: [
    {
      type: 'email',
      enabled: true,
      config: {
        to: 'admin@example.com',
        from: 'alerts@example.com'
      }
    },
    {
      type: 'slack',
      enabled: true,
      config: {
        webhook: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'
      }
    }
  ]
});
```

## Security

### HMAC Signature Verification

All incoming webhooks are verified using HMAC SHA-256:

```typescript
// Automatically handled in verifyWebhookSignature()
// Requires: WHATSAPP_APP_SECRET environment variable
```

**Implementation:**
```typescript
const isValid = whatsappService.verifyWebhookSignature(
  request.headers['x-hub-signature-256'],
  requestBody
);
```

## Webhook Handling

### Supported Webhook Types

1. **messages** - Incoming messages from users
2. **statuses** - Message delivery status updates
3. **message_template_status_update** - Template approvals/rejections
4. **phone_number_quality_update** - Quality rating changes
5. **account_review_update** - Account review decisions
6. **account_update** - Account status changes
7. **security** - Security notifications

### Webhook Flow

```
Webhook Received
    ↓
Signature Verification
    ↓
Log to Database (WhatsAppWebhookLog)
    ↓
Route to Specific Handler
    ↓
Process Event
    ↓
Store Data (Messages, Statuses, Events)
    ↓
Send Notifications (if critical)
    ↓
Update Analytics
```

## Campaign Management

### Creating a Campaign

```typescript
const campaign = whatsappService.createCampaignFromTemplate(
  'construction',
  'Q1 2025 Construction Campaign'
);
```

### Sending a Campaign

```typescript
const recipients: WhatsAppRecipient[] = [
  {
    phoneNumber: '+1234567890',
    firstName: 'John',
    lastName: 'Doe',
    company: 'Acme Construction',
    industry: 'construction',
    email: 'john@acme.com',
    customFields: {},
    tags: ['vip'],
    status: 'active',
    subscribedAt: new Date()
  }
];

const result = await whatsappService.sendCampaign(campaign, recipients);

// With Marketing Messages API optimizations
const result = await whatsappService.sendMarketingCampaign(
  campaign,
  recipients,
  {
    useOptimizations: true,
    messageActivitySharing: true,
    timeToLive: 86400 // 24 hours
  }
);
```

## Opt-Out Management

### Automatic Opt-Out Handling

Users can opt out by sending: `STOP`, `UNSUBSCRIBE`, `CANCEL`, `END`, or `QUIT`

**Flow:**
1. User sends opt-out keyword
2. System adds to opt-out list
3. Confirmation message sent
4. Future campaigns skip opted-out numbers

### Manual Opt-Out

```typescript
await storageService.addOptOut({
  phoneNumber: '+1234567890',
  reason: 'Customer request via support',
  optOutDate: new Date(),
  source: 'admin'
});
```

### Check Opt-Out Status

```typescript
const isOptedOut = await storageService.isOptedOut('+1234567890');
```

## Analytics & Reporting

### Campaign Analytics

```typescript
const analytics = await storageService.getCampaignAnalytics(
  'campaign_id_123',
  new Date('2025-01-01'),
  new Date('2025-01-31')
);

// Returns:
// - totalRecipients
// - messagesSent
// - messagesDelivered
// - messagesRead
// - messagesFailed
// - responseRate
// - averageResponseTime
// - optOutCount
```

### Message History

```typescript
const history = await storageService.getMessageHistory(
  '+1234567890',
  50 // limit
);
```

### Phone Number Status

```typescript
const status = await storageService.getPhoneNumberStatus('phone_number_id');

// Returns:
// - qualityRating: 'GREEN' | 'YELLOW' | 'RED'
// - messagingLimit: 'TIER_1K' | 'TIER_10K' | etc.
// - status: 'CONNECTED' | 'DISCONNECTED' | etc.
```

## Environment Variables

```env
# Required
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id

# For webhook verification
WHATSAPP_APP_SECRET=your_app_secret

# Optional
WHATSAPP_API_VERSION=v21.0
WHATSAPP_API_BASE_URL=https://graph.facebook.com
WHATSAPP_VERIFY_TOKEN=your_webhook_verify_token

# For notifications
ADMIN_EMAIL=admin@example.com
```

## Best Practices

### 1. Webhook Security
- Always verify HMAC signatures
- Use HTTPS with mTLS for webhooks
- Rotate app secrets regularly

### 2. Rate Limiting
- Respect WhatsApp's ~80 messages/second limit
- Implement exponential backoff for failures
- Monitor phone number quality ratings

### 3. Compliance
- Honor opt-out requests immediately
- Keep opt-out records indefinitely
- Include opt-out instructions in templates
- Monitor for TCPA/GDPR compliance

### 4. Monitoring
- Set up alerts for:
  - Phone quality degradation
  - High failure rates (>10%)
  - Template rejections
  - Account restrictions
- Monitor webhook processing delays
- Track campaign performance metrics

### 5. Database
- Index by messageId, phoneNumber, campaignId
- Archive old webhook logs (>90 days)
- Regularly backup opt-out lists
- Implement data retention policies

## Troubleshooting

### Webhook Not Processing
1. Check HMAC signature verification
2. Verify webhook URL is accessible
3. Check mTLS certificate validity
4. Review error logs in WhatsAppWebhookLog

### Messages Not Sending
1. Verify template approval status
2. Check phone number quality rating
3. Ensure recipients haven't opted out
4. Review account status

### Quality Rating Dropped
1. Review recent message content
2. Check user feedback/complaints
3. Verify template compliance
4. Reduce messaging frequency

## Support & Resources

- [WhatsApp Business Platform Documentation](https://developers.facebook.com/docs/whatsapp)
- [Webhook Reference](https://developers.facebook.com/docs/graph-api/webhooks/reference/whatsapp-business-account)
- [Marketing Messages API](https://developers.facebook.com/docs/whatsapp/business-messaging)
- [mTLS Setup Guide](../../docs/NGINX_MTLS_SETUP.md)

## Future Enhancements

- [ ] Automated response templates
- [ ] AI-powered message personalization
- [ ] Advanced analytics dashboard
- [ ] A/B testing for templates
- [ ] Predictive send-time optimization
- [ ] Multi-language template management
- [ ] CRM integration (Salesforce, HubSpot)
- [ ] Conversation AI integration

