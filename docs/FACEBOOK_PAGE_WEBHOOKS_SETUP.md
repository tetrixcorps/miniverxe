# Facebook Page Webhooks Setup Guide

## Overview

This guide walks you through setting up Facebook Page webhooks for TETRIX, enabling:
- ✅ **Messenger conversations** - Two-way customer communication
- ✅ **Lead generation** - Capture leads from Facebook ads
- ✅ **Page engagement** - Monitor comments, mentions, reactions
- ✅ **Post updates** - Track page posts and interactions

---

## Prerequisites

- Facebook Business Account
- Facebook Page (verified and published)
- Meta Developer Account
- TETRIX deployment with public HTTPS endpoint
- Database for storing webhook data

---

## Part 1: Create Meta App

### Step 1: Create App

1. Go to [Meta for Developers](https://developers.facebook.com/apps)
2. Click **"Create App"**
3. Select **"Business"** as app type
4. Fill in app details:
   - **App Name:** `TETRIX Communication Platform`
   - **App Contact Email:** Your email
   - **Business Account:** Select your business
5. Click **"Create App"**

### Step 2: Add Messenger Product

1. In App Dashboard, go to **"Add Products"**
2. Find **"Messenger"** and click **"Set Up"**
3. This adds Messenger Platform to your app

### Step 3: Get App Credentials

1. Go to **Settings → Basic**
2. Copy the following:
   - **App ID** → `FACEBOOK_APP_ID`
   - **App Secret** → `FACEBOOK_APP_SECRET` (click "Show")

---

## Part 2: Generate Page Access Token

### Step 1: Add Page to App

1. Go to **Messenger → Settings**
2. Scroll to **"Access Tokens"** section
3. Click **"Add or Remove Pages"**
4. Select your Facebook Page
5. Grant all requested permissions

### Step 2: Generate Token

1. Under **"Access Tokens"**, select your page
2. Click **"Generate Token"**
3. Review permissions and click **"Continue"**
4. Copy the Page Access Token → `FACEBOOK_PAGE_ACCESS_TOKEN`

**⚠️ Important:** This token expires. For production:
1. Request **"pages_manage_metadata"** permission
2. Generate a long-lived token (60 days)
3. Implement token refresh logic

---

## Part 3: Configure Environment Variables

### Step 1: Create .env File

```bash
cd /home/diegomartinez/Desktop/tetrix/campaign/facebook
cp env.example .env
```

### Step 2: Fill in Values

Edit `.env`:

```bash
# Required
FACEBOOK_VERIFY_TOKEN=your_strong_random_string_12345
FACEBOOK_APP_SECRET=abc123def456...
FACEBOOK_PAGE_ACCESS_TOKEN=EAAxx...
FACEBOOK_PAGE_ID=123456789012345

# Optional
FACEBOOK_APP_ID=987654321
FACEBOOK_WEBHOOK_URL=https://tetrix.com/api/webhooks/facebook-page
```

**Generate Strong Verify Token:**
```bash
openssl rand -hex 32
```

---

## Part 4: Deploy Webhook Endpoint

### Step 1: Verify Endpoint is Live

Your webhook endpoint is at:
```
https://your-domain.com/api/webhooks/facebook-page
```

Test it's accessible:
```bash
curl https://your-domain.com/api/webhooks/facebook-page
```

### Step 2: Configure Nginx (if using mTLS)

If you're using Nginx with mTLS (like WhatsApp), you may need separate configuration:

```nginx
# /etc/nginx/sites-available/tetrix

# Facebook webhooks (no mTLS required)
location /api/webhooks/facebook-page {
    proxy_pass http://localhost:4321;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

---

## Part 5: Configure Webhooks in Meta App

### Step 1: Add Webhook URL

1. Go to **Messenger → Settings → Webhooks**
2. Click **"Add Callback URL"**
3. Enter:
   - **Callback URL:** `https://your-domain.com/api/webhooks/facebook-page`
   - **Verify Token:** (same as `FACEBOOK_VERIFY_TOKEN` in .env)
4. Click **"Verify and Save"**

✅ If successful, you'll see "Complete" status

❌ If verification fails:
- Check server logs
- Verify webhook endpoint is accessible
- Ensure verify token matches
- Check firewall/security group settings

### Step 2: Subscribe to Webhook Fields

Still in **Webhooks** section, under your page subscription:

**Subscribe to these fields:**

#### Messaging Events (Messenger)
- ✅ `messages` - Incoming messages
- ✅ `messaging_postbacks` - Button clicks, quick replies
- ✅ `messaging_optins` - User opt-ins
- ✅ `messaging_optouts` - User opt-outs
- ✅ `message_deliveries` - Delivery confirmations
- ✅ `message_reads` - Read receipts
- ✅ `messaging_referrals` - Referrals from ads
- ✅ `message_reactions` - Message reactions

#### Page Events
- ✅ `feed` - Page posts, edits, deletes
- ✅ `mention` - Page mentions in posts/comments
- ✅ `leadgen` - Lead generation form submissions
- ✅ `ratings` - Page ratings/reviews

Click **"Subscribe"** after selecting fields.

---

## Part 6: Subscribe to Page Events

### Step 1: Navigate to Page Webhooks

1. Go to **Webhooks** (in left sidebar)
2. Find **"Page"** object
3. Click **"Edit Subscription"**

### Step 2: Subscribe to Events

Enable the same fields as above:

```
✅ messages
✅ messaging_postbacks
✅ messaging_optins
✅ messaging_optouts
✅ message_deliveries
✅ message_reads
✅ messaging_referrals
✅ message_reactions
✅ feed
✅ mention
✅ leadgen
✅ ratings
```

Click **"Save"**

---

## Part 7: Grant Page Permissions

### Required Permissions

Your app needs these permissions to access page data:

1. **Go to App Review → Permissions and Features**
2. Request these permissions:

| Permission | Purpose |
|-----------|---------|
| `pages_messaging` | Send/receive Messenger messages |
| `pages_manage_metadata` | Access page metadata |
| `pages_read_engagement` | Read comments, reactions |
| `pages_manage_posts` | Manage page posts |
| `pages_read_user_content` | Read user-generated content |
| `pages_manage_engagement` | Respond to comments/messages |
| `leads_retrieval` | Retrieve lead gen form data |

### Business Verification

⚠️ **Note:** Some permissions require Business Verification:

1. Complete business verification in Business Manager
2. This can take 1-3 business days
3. Until verified, use test mode with limited functionality

---

## Part 8: Testing

### Test 1: Webhook Verification

Check server logs after saving webhook configuration:

```bash
# Should see this in logs:
✅ Facebook Page webhook verified successfully
```

### Test 2: Send Test Message

1. Go to your Facebook Page
2. Send a message to your page from a test account
3. Check server logs:

```bash
📩 Facebook Page webhook received: {...}
💬 Message from 123456789: Hello!
```

### Test 3: Test Lead Generation (if applicable)

1. Create a test lead ad in Ads Manager
2. Fill out the lead form
3. Check server logs:

```bash
📝 Lead generated - ID: 123456789
📊 Lead data: { field_data: [...] }
```

### Test 4: Test Comment

1. Post something on your page
2. Comment on the post
3. Check server logs:

```bash
💬 Comment add - ID: 123456789
📝 Post ID: 987654321
💭 Message: Great post!
```

---

## Part 9: Monitoring and Debugging

### View Webhook Logs in Meta

1. Go to **Webhooks → View Logs**
2. See all webhook deliveries, successes, and failures
3. Check response codes and error messages

### Server-Side Logging

Enable verbose logging in production:

```typescript
// FacebookPageService.ts
console.log('📩 Webhook received:', webhookData);
console.log('💬 Message:', message);
console.log('🔘 Postback:', postback);
```

### Common Issues

#### Webhook Verification Fails
- ❌ Verify token mismatch
- ✅ Check `FACEBOOK_VERIFY_TOKEN` matches exactly

#### Signature Verification Fails
- ❌ App secret incorrect
- ✅ Check `FACEBOOK_APP_SECRET` is correct
- ✅ Ensure raw body is used for signature calculation

#### No Webhooks Received
- ❌ Not subscribed to webhook fields
- ✅ Verify subscriptions in App Dashboard
- ❌ Page not connected to app
- ✅ Check page is added in Messenger settings

#### Webhooks Delayed
- ❌ Server response too slow
- ✅ Optimize webhook processing
- ✅ Respond with 200 immediately, process async

---

## Part 10: Production Checklist

### Before Going Live

- [ ] Business verification complete
- [ ] All required permissions approved
- [ ] Long-lived page access token configured
- [ ] Token refresh logic implemented
- [ ] Database schema for messages/leads created
- [ ] Error handling and logging in place
- [ ] Rate limiting configured
- [ ] Security review complete
- [ ] Backup webhook endpoint configured
- [ ] Monitoring and alerting set up

### Security Best Practices

1. ✅ **Always verify signatures** - Prevent spoofed webhooks
2. ✅ **Use HTTPS** - Required by Meta
3. ✅ **Rotate tokens regularly** - Minimize exposure
4. ✅ **Log webhook activity** - Audit trail
5. ✅ **Rate limit** - Prevent abuse
6. ✅ **Validate payloads** - Sanitize inputs
7. ✅ **Monitor for anomalies** - Detect attacks

---

## Part 11: Advanced Configuration

### Enable Handover Protocol

If you use multiple apps with the same page:

1. Go to **Messenger → Settings → Advanced Messaging Features**
2. Enable **"Handover Protocol"**
3. Set primary/secondary app receivers

### Configure Ice Breakers

Welcome messages when users start conversation:

1. Go to **Messenger → Settings → Ice Breakers**
2. Add greeting text and call-to-action

### Set Up Persistent Menu

Custom menu in Messenger:

1. Use Messenger Profile API
2. Configure menu items with postbacks

---

## Part 12: Integration with TETRIX

### Database Schema

Create tables for:
- `facebook_messages` - Store Messenger conversations
- `facebook_leads` - Store lead form submissions
- `facebook_comments` - Store page comments
- `facebook_mentions` - Store page mentions

### Notification Service

Integrate with existing `WhatsAppNotificationService`:
- Send admin alerts for new leads
- Notify on negative sentiment comments
- Alert on message volume spikes

### Analytics

Track metrics:
- Message response time
- Lead conversion rate
- Engagement rate (comments, reactions)
- Customer satisfaction (ratings)

---

## Troubleshooting

### Meta App Review Rejected

**Common reasons:**
- Insufficient app description
- Screen recordings don't show use case
- Privacy policy missing/incomplete

**Solutions:**
- Provide detailed use case documentation
- Create clear demo video
- Update privacy policy with Facebook-specific data usage

### Webhook Delivery Failures

Meta will retry failed webhooks with exponential backoff.

**Check:**
1. Server response time (<5 seconds recommended)
2. HTTP status codes (always return 200)
3. Server uptime and availability
4. Network connectivity

---

## Support Resources

- **Meta Documentation:** https://developers.facebook.com/docs/messenger-platform
- **Webhook Reference:** https://developers.facebook.com/docs/graph-api/webhooks/reference/page
- **Community Forum:** https://www.facebook.com/groups/fbdevelopers
- **Bug Reports:** https://developers.facebook.com/support/bugs/

---

## Next Steps

1. ✅ Complete webhook setup
2. 🔄 Implement Instagram webhooks (Phase 2)
3. 🔄 Create unified message handler
4. 🔄 Add multi-platform analytics
5. 🔄 Build admin dashboard

---

**Document Version:** 1.0  
**Last Updated:** January 7, 2026  
**Maintained By:** TETRIX Engineering Team

