# Marketing Messages API - Enhanced Features Guide

## Overview

The Marketing Messages API for WhatsApp provides enhanced features for optimized marketing campaigns. This guide covers the advanced capabilities available in our implementation.

## Key Benefits

Based on the [official documentation](https://developers.facebook.com/documentation/business-messaging/whatsapp/marketing-messages/overview), the Marketing Messages API offers:

### 1. **Boost Business Results**
- **Up to 9% higher delivery rates** for high-engagement messages
- **Performance benchmarks** comparing your messages to similar businesses
- **Tailored recommendations** to improve campaign performance

### 2. **Enhanced Customer Experience**
- **Automatic creative optimizations** (in testing) - image animation and filtering
- **Richer media formats** - Support for GIFs and enhanced media
- **Time-to-live** - Avoid irrelevant or delayed message delivery

### 3. **Easy Upgrade**
- Same technical schema as Cloud API
- Same billing model
- Use existing phone numbers and templates

## Enhanced Features Implementation

### Time-to-Live for Time-Sensitive Campaigns

Use the `timeToLive` parameter to ensure messages are only delivered within a specific timeframe:

```typescript
import { WhatsAppCampaignService } from './WhatsAppCampaignService';

const service = new WhatsAppCampaignService();

// Send a time-sensitive promotion (expires in 2 hours)
const result = await service.sendMarketingMessage(
  '+15551234567',
  'promo_template',
  'en_US',
  components,
  {
    timeToLive: 7200, // 2 hours in seconds
    messageActivitySharing: true
  }
);
```

**Use Cases:**
- **Flash Sales**: Limited-time offers (e.g., 24-hour sale)
- **Event Reminders**: Concert tickets, webinars (expire after event)
- **Urgent Alerts**: Safety warnings, emergency notifications

### Automatic Routing

The service automatically routes eligible messages to the Marketing Messages API:

```typescript
// Automatically uses MM API if onboarded, falls back to Cloud API otherwise
const result = await service.sendMarketingCampaign(
  campaign,
  recipients,
  {
    useOptimizations: true, // Enable automatic optimizations
    timeToLive: 3600, // 1 hour expiration
    messageActivitySharing: true
  }
);

console.log(`Sent: ${result.sentCount}, Optimized: ${result.optimizedCount}`);
```

### Message Activity Sharing Control

Control whether message status events are shared with Meta for optimization:

```typescript
// For healthcare/HIPAA compliance - disable activity sharing
const result = await service.sendMarketingMessage(
  phoneNumber,
  templateName,
  'en_US',
  components,
  {
    messageActivitySharing: false // Disable for privacy-sensitive industries
  }
);
```

**When to Disable:**
- Healthcare messages containing PHI
- Financial services with sensitive data
- Any industry requiring strict data privacy

## Performance Insights

After onboarding, you can access Marketing API Insights for performance analysis:

```typescript
// Get campaign performance metrics
const insights = await service.getMarketingInsights(
  adAccountId, // From onboarding webhook
  '2025-01-01', // Start date
  '2025-01-31', // End date
  ['impressions', 'clicks', 'spend', 'conversions']
);

if (insights.success) {
  console.log('Performance Data:', insights.data);
}
```

**Available Metrics:**
- `impressions` - Message views
- `clicks` - Button/link clicks
- `spend` - Campaign costs
- `conversions` - App events (Add to Cart, Purchase, etc.)
- `read_rate` - Read percentage
- `click_rate` - Click-through rate

## Best Practices

### 1. **Use Time-to-Live for Promotions**
```typescript
// Flash sale: expires in 6 hours
timeToLive: 21600
```

### 2. **Enable Optimizations for High-Value Campaigns**
```typescript
// For campaigns where engagement matters most
useOptimizations: true
```

### 3. **Monitor Performance**
```typescript
// Check insights weekly
const weeklyInsights = await service.getMarketingInsights(
  adAccountId,
  getLastWeekStart(),
  getLastWeekEnd()
);
```

### 4. **Industry-Specific Settings**

**Construction:**
```typescript
{
  useOptimizations: true,
  timeToLive: 86400, // 24 hours for safety alerts
  messageActivitySharing: true
}
```

**Healthcare:**
```typescript
{
  useOptimizations: true,
  timeToLive: 172800, // 48 hours for appointment reminders
  messageActivitySharing: false // HIPAA compliance
}
```

**Fleet Management:**
```typescript
{
  useOptimizations: true,
  timeToLive: 3600, // 1 hour for urgent route updates
  messageActivitySharing: true
}
```

## Migration from Cloud API

The service automatically handles migration:

1. **Check Onboarding Status**
   ```typescript
   const eligibility = await service.checkMarketingMessagesEligibility();
   ```

2. **Use Enhanced Campaign Method**
   ```typescript
   // Automatically uses MM API if available
   await service.sendMarketingCampaign(campaign, recipients, {
     useOptimizations: true
   });
   ```

3. **Monitor Results**
   - Check `optimizedCount` in response
   - Compare delivery rates before/after
   - Review insights for performance improvements

## References

- [Marketing Messages API Overview](https://developers.facebook.com/documentation/business-messaging/whatsapp/marketing-messages/overview)
- [Onboarding Guide](./README.md#onboarding)
- [Compliance Guide](../COMPLIANCE_AND_CUSTOMIZATION.md)

