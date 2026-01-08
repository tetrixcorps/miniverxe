# Instagram Webhooks Setup Guide

## Overview

This guide walks you through setting up Instagram webhooks for TETRIX, enabling:
- ✅ **Instagram Direct Messages** - Two-way customer communication
- ✅ **Comment monitoring** - Track comments on posts/reels/IGTV
- ✅ **Brand mentions** - @mentions in stories and posts
- ✅ **Story insights** - Engagement metrics for stories
- ✅ **Live video comments** - Real-time engagement during live streams

---

## Prerequisites

- Facebook Business Account
- Instagram Business Account (not Creator Account)
- Facebook Page connected to Instagram
- Meta Developer Account
- TETRIX deployment with public HTTPS endpoint
- Database for storing webhook data

**⚠️ Important:** You must have an **Instagram Business Account**, not a Creator Account. Only Business Accounts support the Messaging API.

---

## Part 1: Prepare Instagram Account

### Step 1: Convert to Business Account (if needed)

1. Open Instagram app
2. Go to **Settings → Account**
3. Select **Switch to Professional Account**
4. Choose **Business**
5. Complete business details

### Step 2: Connect to Facebook Page

1. Instagram app → **Settings → Account**
2. Select **Linked Accounts → Facebook**
3. Choose your Facebook Page
4. This connection is required for API access

---

## Part 2: Create/Configure Meta App

### Step 1: Use Existing or Create New App

**Option A: Use Existing Facebook App**
1. If you already set up Facebook Page webhooks, use that app
2. Go to App Dashboard → **Add Product**
3. Add **Instagram** product

**Option B: Create New App**
1. Go to [Meta for Developers](https://developers.facebook.com/apps)
2. Click **"Create App"**
3. Select **"Business"** type
4. Fill in app details
5. Click **"Create App"**

### Step 2: Add Instagram Product

1. In App Dashboard, go to **"Add Products"**
2. Find **"Instagram"** and click **"Set Up"**
3. This adds Instagram Graph API to your app

### Step 3: Get App Credentials

1. Go to **Settings → Basic**
2. Copy:
   - **App ID** → `INSTAGRAM_APP_ID`
   - **App Secret** → `INSTAGRAM_APP_SECRET` (click "Show")

---

## Part 3: Connect Instagram Business Account

### Step 1: Add Instagram Account to App

1. Go to **Instagram → Settings** (in App Dashboard)
2. Click **"Connect Instagram Business Account"**
3. Login with Facebook account that manages your Instagram
4. Select your Instagram Business Account
5. Grant all requested permissions

### Step 2: Generate Access Token

1. Under **"User Token Generator"**, select your Instagram account
2. Click **"Generate Token"**
3. Review permissions:
   - ✅ instagram_basic
   - ✅ instagram_manage_comments
   - ✅ instagram_manage_messages
   - ✅ pages_read_engagement
4. Copy the access token → `INSTAGRAM_ACCESS_TOKEN`

**⚠️ Important:** This token may expire. For production:
1. Request long-lived token (60 days)
2. Implement token refresh logic
3. Monitor token expiration

---

## Part 4: Configure Environment Variables

### Step 1: Create .env File

```bash
cd /home/diegomartinez/Desktop/tetrix/campaign/instagram
cp env.example .env
```

### Step 2: Fill in Values

Edit `.env`:

```bash
# Required
INSTAGRAM_VERIFY_TOKEN=your_strong_random_string_67890
INSTAGRAM_APP_SECRET=xyz789abc456...
INSTAGRAM_ACCESS_TOKEN=IGQWRxx...
INSTAGRAM_BUSINESS_ACCOUNT_ID=17841401234567890

# Optional
INSTAGRAM_WEBHOOK_URL=https://tetrix.com/api/webhooks/instagram
```

**Generate Strong Verify Token:**
```bash
openssl rand -hex 32
```

**Get Instagram Business Account ID:**
```bash
curl "https://graph.facebook.com/v21.0/me?fields=id,username&access_token=YOUR_TOKEN"
```

---

## Part 5: Deploy Webhook Endpoint

### Step 1: Verify Endpoint is Live

Your webhook endpoint is at:
```
https://your-domain.com/api/webhooks/instagram
```

Test accessibility:
```bash
curl https://your-domain.com/api/webhooks/instagram
```

### Step 2: Configure Nginx (if needed)

```nginx
# /etc/nginx/sites-available/tetrix

# Instagram webhooks (no mTLS required)
location /api/webhooks/instagram {
    proxy_pass http://localhost:4321;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## Part 6: Configure Webhooks in Meta App

### Step 1: Add Webhook URL

1. Go to **Instagram → Settings → Webhooks**
2. Click **"Add Callback URL"**
3. Enter:
   - **Callback URL:** `https://your-domain.com/api/webhooks/instagram`
   - **Verify Token:** (same as `INSTAGRAM_VERIFY_TOKEN` in .env)
4. Click **"Verify and Save"**

✅ If successful, you'll see "Complete" status

❌ If verification fails:
- Check server logs for webhook verification request
- Verify endpoint is publicly accessible
- Ensure verify token matches exactly
- Check HTTPS certificate is valid

### Step 2: Subscribe to Webhook Fields

Still in **Webhooks** section, under your Instagram subscription:

**Subscribe to these fields:**

#### Messaging Events (Instagram DMs)
- ✅ `messages` - Incoming direct messages
- ✅ `messaging_postback` - Button clicks, ice breakers
- ✅ `messaging_seen` - Read receipts
- ✅ `messaging_deliveries` - Delivery confirmations
- ✅ `messaging_reaction` - Message reactions
- ✅ `messaging_referral` - Referrals from ads
- ✅ `messaging_optins` - User opt-ins
- ✅ `messaging_optouts` - User opt-outs

#### Engagement Events
- ✅ `comments` - Comments on posts/reels/IGTV
- ✅ `mentions` - @mentions in stories/posts
- ✅ `story_insights` - Story engagement metrics
- ✅ `live_comments` - Live video comments

Click **"Subscribe"** after selecting fields.

---

## Part 7: Subscribe to Instagram Object

### Step 1: Navigate to Webhooks

1. Go to **Webhooks** (in left sidebar of App Dashboard)
2. Find **"Instagram"** object
3. Click **"Edit Subscription"**

### Step 2: Subscribe to Events

Enable the same fields:

```
✅ messages
✅ messaging_postback
✅ messaging_seen
✅ messaging_deliveries
✅ messaging_reaction
✅ messaging_referral
✅ messaging_optins
✅ messaging_optouts
✅ comments
✅ mentions
✅ story_insights
✅ live_comments
```

Click **"Save"**

---

## Part 8: Request Instagram Permissions

### Required Permissions

Your app needs these permissions:

1. **Go to App Review → Permissions and Features**
2. Request these permissions:

| Permission | Purpose |
|-----------|---------|
| `instagram_basic` | Read basic account info |
| `instagram_manage_comments` | Read/reply to comments |
| `instagram_manage_messages` | Send/receive DMs |
| `instagram_manage_insights` | Read story insights |
| `pages_read_engagement` | Read page engagement |
| `pages_manage_metadata` | Access page metadata |

### App Review Process

⚠️ **Note:** Advanced permissions require App Review:

1. **Prepare Documentation:**
   - Screen recording showing your use case
   - Detailed description of how you'll use each permission
   - Privacy policy URL
   - Terms of service URL

2. **Submit for Review:**
   - Go to **App Review → Permissions and Features**
   - Click **"Request Advanced Access"** for each permission
   - Upload screen recording
   - Provide detailed explanation
   - Submit

3. **Review Timeline:**
   - Usually takes 1-3 business days
   - May take longer for complex use cases
   - You'll receive email notification

4. **Test Mode (Before Approval):**
   - You can test with up to 5 test users
   - Test users can send DMs, comment, etc.
   - Add test users in **Roles → Test Users**

---

## Part 9: Testing

### Test 1: Webhook Verification

Check server logs after saving webhook configuration:

```bash
# Should see this in logs:
✅ Instagram webhook verified successfully
```

### Test 2: Send Test DM

1. Open Instagram app
2. Send a DM to your Instagram Business Account
3. Check server logs:

```bash
📩 Instagram webhook received: {...}
💬 Instagram DM from 123456789: Hello!
```

### Test 3: Test Comment

1. Post something on your Instagram account
2. Comment on the post from a test account
3. Check server logs:

```bash
💬 Instagram comment add - ID: 123456789
📝 Media ID: 987654321
💭 Text: Great post!
```

### Test 4: Test @Mention

1. Post an Instagram story
2. Have test account mention you (@yourusername)
3. Check server logs:

```bash
@️ Instagram mention by testuser (123456)
📝 Media ID: 987654321
```

---

## Part 10: Monitoring and Debugging

### View Webhook Logs in Meta

1. Go to **Webhooks → View Logs**
2. See all webhook deliveries
3. Check response codes and errors
4. Filter by time range and event type

### Server-Side Logging

Enable verbose logging:

```typescript
// InstagramService.ts
console.log('📩 Instagram webhook:', webhookData);
console.log('💬 Message:', message);
console.log('💭 Comment:', comment);
```

### Common Issues

#### Webhook Verification Fails
- ❌ Verify token mismatch
- ✅ Check `INSTAGRAM_VERIFY_TOKEN` matches

#### "Instagram Business Account Required" Error
- ❌ Using Creator Account
- ✅ Convert to Business Account
- ✅ Connect to Facebook Page

#### Signature Verification Fails
- ❌ App secret incorrect
- ✅ Check `INSTAGRAM_APP_SECRET`
- ✅ Use raw request body for signature calculation

#### No DM Webhooks Received
- ❌ Not subscribed to `messages` field
- ✅ Check webhook subscriptions
- ❌ Permissions not approved
- ✅ Complete App Review or use test users

#### Comments Not Triggering Webhooks
- ❌ Not subscribed to `comments` field
- ✅ Verify subscription in App Dashboard
- ❌ Instagram account not connected
- ✅ Reconnect Instagram Business Account

---

## Part 11: Production Checklist

### Before Going Live

- [ ] Instagram Business Account verified
- [ ] App Review approved for all permissions
- [ ] Long-lived access token configured
- [ ] Token refresh logic implemented
- [ ] Database schema for messages/comments created
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
8. ✅ **Respect user privacy** - Follow data protection laws

---

## Part 12: Advanced Features

### Auto-Reply to DMs

Implement in `InstagramService.ts`:

```typescript
private async processMessage(instagramId: string, event: any, timestamp: number) {
  // ... existing code ...
  
  // Auto-reply logic
  if (message.text.toLowerCase().includes('hours')) {
    await this.sendMessage(senderId, 'We're open Mon-Fri 9am-5pm! 🕒');
  }
}
```

### Comment Moderation

Hide negative comments automatically:

```typescript
private async processComment(instagramId: string, value: any, timestamp: number) {
  // ... existing code ...
  
  // Sentiment analysis
  const isNegative = await analyzeSentiment(text);
  if (isNegative) {
    await this.moderateComment(commentId, true); // Hide
    console.log(`🚫 Hid negative comment: ${commentId}`);
  }
}
```

### Story Mentions Auto-Response

Respond to story mentions:

```typescript
private async processMention(instagramId: string, value: any, timestamp: number) {
  // ... existing code ...
  
  // Send thank you message
  await this.sendMessage(fromId, 'Thanks for mentioning us! 💙');
}
```

---

## Part 13: Integration with TETRIX

### Database Schema

Create tables for:
- `instagram_messages` - Store DM conversations
- `instagram_comments` - Store comments on posts
- `instagram_mentions` - Store @mentions
- `instagram_story_insights` - Store engagement metrics

### Unified Message Handler

Integrate with existing message systems:

```typescript
// Unified inbox for WhatsApp + Messenger + Instagram
class UnifiedMessageHandler {
  async handleMessage(platform: 'whatsapp' | 'messenger' | 'instagram', message: any) {
    // Route to appropriate handler
    // Store in unified database
    // Send to admin dashboard
  }
}
```

### Analytics Dashboard

Track metrics:
- DM response time
- Comment engagement rate
- Story mention frequency
- Influencer engagement
- Customer sentiment trends

---

## Troubleshooting

### Instagram Business Account Issues

**Problem:** "This Instagram account is not a Business Account"

**Solution:**
1. Open Instagram app
2. Go to Settings → Account
3. Switch to Professional Account → Business
4. Reconnect to Facebook Page
5. Reconnect to Meta App

### Token Expiration

**Problem:** "Invalid access token" errors

**Solution:**
1. Generate new long-lived token
2. Implement automatic token refresh
3. Monitor token expiration date
4. Set up alerts for expiring tokens

### App Review Rejection

**Common reasons:**
- Screen recording doesn't clearly show use case
- Privacy policy missing Instagram data usage
- Insufficient business verification

**Solutions:**
- Create detailed demo video (3-5 minutes)
- Update privacy policy with Instagram-specific clauses
- Complete business verification in Business Manager
- Provide detailed written explanation

---

## Support Resources

- **Instagram Graph API Docs:** https://developers.facebook.com/docs/instagram-api
- **Webhook Reference:** https://developers.facebook.com/docs/graph-api/webhooks/reference/instagram
- **Messaging API:** https://developers.facebook.com/docs/messenger-platform/instagram
- **Community Forum:** https://www.facebook.com/groups/fbdevelopers
- **Bug Reports:** https://developers.facebook.com/support/bugs/

---

## Next Steps

1. ✅ Complete Instagram webhook setup
2. 🔄 Create unified message storage (Phase 3)
3. 🔄 Build unified webhook router (Phase 3)
4. 🔄 Add multi-platform analytics dashboard
5. 🔄 Implement sentiment analysis for comments

---

**Document Version:** 1.0  
**Last Updated:** January 7, 2026  
**Maintained By:** TETRIX Engineering Team

