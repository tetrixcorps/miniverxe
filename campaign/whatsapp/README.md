# WhatsApp Business Platform Setup Guide

## Overview

This directory contains the WhatsApp Business Platform integration for the TETRIX campaign system. The WhatsApp integration enables automated messaging campaigns for construction, fleet management, and healthcare industries using the WhatsApp Cloud API.

## Prerequisites

Before you begin, ensure you have:

1. **Meta Business Account** - [Create one here](https://business.facebook.com/)
2. **Meta App** - Created in the [Meta for Developers](https://developers.facebook.com/apps/) portal
3. **WhatsApp Business Account (WABA)** - Associated with your Meta App
4. **Verified Phone Number** - Registered with your WABA

## Configuration

### 1. Environment Variables

Copy the `env.example` file and create your `.env` file:

```bash
cp env.example .env
```

### 2. Required Credentials

Fill in the following credentials in your `.env` file:

#### **WHATSAPP_ACCESS_TOKEN**
- **How to get it:**
  1. Go to your [Meta App Dashboard](https://developers.facebook.com/apps/)
  2. Select your app
  3. Navigate to **WhatsApp > API Setup**
  4. For testing: Copy the temporary token (valid for 24 hours)
  5. For production: Create a System User and generate a permanent token:
     - Go to **Business Settings > System Users**
     - Create a new system user
     - Assign the WhatsApp Business Management permission
     - Generate a token with `whatsapp_business_management` and `whatsapp_business_messaging` permissions

#### **WHATSAPP_PHONE_NUMBER_ID**
- Already configured: `916283001564486`
- This is the ID of your registered phone number (not the phone number itself)

#### **WHATSAPP_BUSINESS_ACCOUNT_ID**
- Already configured: `868215485645549`
- Found in **WhatsApp > API Setup** section

#### **WHATSAPP_VERIFY_TOKEN**
- **How to set it:**
  1. Generate a random secure string (e.g., using `openssl rand -hex 32`)
  2. Add it to your `.env` file
  3. Use the same value when configuring webhooks in the Meta App Dashboard

#### **WHATSAPP_CERTIFICATE**
- Already configured with your provided certificate
- This certificate is used for end-to-end encryption verification
- Do not modify unless instructed by Meta support

### 3. Webhook Setup

To receive incoming messages and status updates, you need to configure webhooks:

1. **Deploy your application** to a publicly accessible HTTPS endpoint
2. Go to your [Meta App Dashboard](https://developers.facebook.com/apps/)
3. Navigate to **WhatsApp > Configuration**
4. Click **Edit** in the Webhook section
5. Enter your webhook URL: `https://tetrixcorp.com/webhooks/whatsapp`
6. Enter the **Verify Token** (same as `WHATSAPP_VERIFY_TOKEN` in `.env`)
7. Subscribe to the following webhook fields:
   - `messages` - For incoming messages
   - `message_template_status_update` - For template approval status
   - `marketing_messages_onboarding_status` - For onboarding workflow updates

## Usage

### 1. Initialize the Service

```typescript
import { WhatsAppCampaignService } from './WhatsAppCampaignService';

const whatsappService = new WhatsAppCampaignService();
```

### 2. Create a Campaign

```typescript
// Create a campaign for construction industry
const campaign = whatsappService.createCampaignFromTemplate(
  'construction',
  'Q1_Construction_Outreach'
);
```

### 3. Send Messages

```typescript
const recipients = [
  {
    phoneNumber: '+15551234567',
    firstName: 'John',
    lastName: 'Doe',
    company: 'ABC Construction',
    industry: 'construction',
    email: 'john@abcconstruction.com',
    customFields: {},
    tags: ['decision_maker'],
    status: 'active',
    subscribedAt: new Date()
  }
];

const result = await whatsappService.sendCampaign(campaign, recipients);
console.log(`Sent: ${result.sentCount}, Failed: ${result.failedCount}`);
```

### 4. API Endpoints

The webhook handler (`whatsappWebhook.ts`) provides the following endpoints:

#### Webhook Verification (GET)
```
GET /webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=CHALLENGE_STRING
```

#### Webhook Handler (POST)
```
POST /webhooks/whatsapp
```

#### Send Campaign
```
POST /api/whatsapp/campaigns/send
Body: {
  "industry": "construction|fleet|healthcare",
  "recipients": [...]
}
```

#### Get Business Profile
```
GET /api/whatsapp/profile
```

#### Update Business Profile
```
POST /api/whatsapp/profile
Body: {
  "about": "Your business description",
  "address": "123 Business St",
  "description": "What your business does",
  "email": "contact@business.com",
  "websites": ["https://your-website.com"]
}
```

## Message Templates

Before sending template messages in production, you must:

1. **Create and submit templates** for approval in WhatsApp Manager
2. **Wait for approval** (usually takes 24-48 hours)
3. **Use approved templates** in your campaigns

### Template Structure

Templates for each industry follow this structure:

- **Header**: Eye-catching title with emoji
- **Body**: Brief description with key benefits and CTA
- **Footer**: Company branding
- **Buttons**: Quick reply and URL buttons for engagement

### Creating Templates

1. Go to [WhatsApp Manager](https://business.facebook.com/wa/manage/message-templates/)
2. Click **Create Template**
3. Use the template structure from `WhatsAppCampaignService.ts` as reference
4. Submit for review

## Rate Limits

WhatsApp has the following rate limits:

- **Throughput**: Up to 80 messages per second (default)
- **Pair rate limit**: 1 message per 6 seconds to the same user
- **Quality-based limits**: Based on your phone number's quality rating

The service includes automatic throttling to stay within limits.

## Security Best Practices

1. **Never commit credentials** - Always use environment variables
2. **Verify webhook signatures** - Implement HMAC verification in production
3. **Use HTTPS** - All webhook endpoints must use HTTPS
4. **Rotate access tokens** - Regularly rotate system user tokens
5. **Monitor usage** - Track API calls and stay within rate limits

## Testing

### Test Onboarding Status

To check if your account is eligible or onboarded for Marketing Messages API:

**From the whatsapp directory:**
```bash
cd campaign/whatsapp
node test-onboarding.js
```

**Or using TypeScript:**
```bash
cd campaign/whatsapp
npx tsx test-onboarding.ts
```

**From project root:**
```bash
npx tsx campaign/whatsapp/test-onboarding.ts
```

The test will show:
- `ELIGIBLE`: Ready to onboard via App Dashboard
- `ONBOARDED`: Ready to send optimized marketing messages
- `INELIGIBLE`: Review policy compliance

### Test Phone Numbers

For testing, you can use test numbers without approval:

1. Go to **WhatsApp > API Setup**
2. Add test phone numbers in the **To** field
3. Send messages to these numbers without template approval

### Local Development

For local webhook testing, use a tool like [ngrok](https://ngrok.com/):

```bash
ngrok http 3000
# Use the ngrok URL as your webhook endpoint
```

## Troubleshooting

### Common Issues

1. **Webhook verification fails**
   - Ensure `WHATSAPP_VERIFY_TOKEN` matches the token in Meta App Dashboard
   - Check that your endpoint is publicly accessible via HTTPS

2. **Messages not sending**
   - Verify your access token is valid
   - Ensure templates are approved
   - Check phone number format (must be E.164 format)
   - Review rate limits and quality rating

3. **Certificate errors**
   - The certificate is for encryption verification
   - Contact Meta support if you encounter certificate-related issues

## Resources

- [WhatsApp Business Platform Documentation](https://developers.facebook.com/docs/whatsapp)
- [Cloud API Reference](https://developers.facebook.com/docs/whatsapp/cloud-api/reference)
- [Message Templates Guide](https://developers.facebook.com/docs/whatsapp/message-templates)
- [Webhooks Documentation](https://developers.facebook.com/docs/whatsapp/webhooks)
- [Business Management API](https://developers.facebook.com/docs/whatsapp/business-management-api)

## Next Steps

1. **Generate your Access Token** (see instructions above)
2. **Add it to your `.env` file**
3. **Set up webhooks** (see Webhook Setup section)
4. **Create and approve message templates**
5. **Test with sample campaigns**
6. **Monitor performance and optimize**

## Support

For issues or questions:
- Meta Developer Community: [https://developers.facebook.com/community/](https://developers.facebook.com/community/)
- WhatsApp Business API Support: [https://business.facebook.com/wa/manage/home/](https://business.facebook.com/wa/manage/home/)
