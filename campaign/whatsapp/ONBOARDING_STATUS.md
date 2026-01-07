# Marketing Messages API Onboarding - Quick Start

## ✅ Test Results

Your account status: **ELIGIBLE** ✅

Your WhatsApp Business Account (WABA) is eligible for the Marketing Messages API but needs to complete onboarding.

## 🚀 Next Steps to Onboard

1. **Go to Meta App Dashboard**
   - Visit: https://developers.facebook.com/apps/
   - Select your app

2. **Navigate to WhatsApp Quickstart**
   - Click **WhatsApp** in the left sidebar
   - Click **Quickstart** tab

3. **Start Onboarding**
   - Look for the card: **"Improve ROI with Marketing Messages API for WhatsApp"**
   - Click **"Get started"** button
   - Click **"Continue to integration guide"** to accept Terms of Service

4. **Verify Onboarding**
   - After completing the steps, run the test again:
   ```bash
   cd campaign/whatsapp
   node test-onboarding.js
   ```
   - Status should change to `ONBOARDED`

## 📋 What Happens After Onboarding

Once onboarded, you'll be able to:
- ✅ Send optimized marketing messages with up to 9% higher delivery rates
- ✅ Access Marketing API Insights for campaign analytics
- ✅ Use automated creative optimizations
- ✅ Get performance benchmarks and recommendations

## 🔧 Using the Service

After onboarding, you can use the new `sendMarketingMessage()` method:

```typescript
import { WhatsAppCampaignService } from './WhatsAppCampaignService';

const service = new WhatsAppCampaignService();

// Check status
const eligibility = await service.checkMarketingMessagesEligibility();
if (eligibility.isOnboarded) {
  // Send optimized marketing message
  const result = await service.sendMarketingMessage(
    '+15551234567',
    'your_template_name',
    'en_US',
    components,
    true // message_activity_sharing
  );
}
```

## 📚 Documentation

- [Onboarding Guide](https://developers.facebook.com/documentation/business-messaging/whatsapp/marketing-messages/onboarding)
- [Marketing Messages API Reference](https://developers.facebook.com/docs/whatsapp/marketing-messages)
- [Compliance Guide](../COMPLIANCE_AND_CUSTOMIZATION.md)

