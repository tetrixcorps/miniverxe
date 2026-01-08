# Webhook Verification Tokens - Configuration Guide

**Generated:** January 7, 2026  
**Purpose:** Complete webhook configuration for TETRIX Meta integrations

---

## 🔑 Generated Verify Tokens

**IMPORTANT:** These tokens are unique to your TETRIX installation. Keep them secure and never commit to version control.

### WhatsApp Business Verify Token
```
whatsapp_verify_tetrix_2026_8f4e9d2a1b7c3e5f6a8d9b0c1e2f3a4b
```

### Facebook Page Verify Token
```
facebook_verify_tetrix_2026_3c7b9e4d1a8f2c5e6b7a9d0f1e2c3b4a
```

### Instagram Verify Token
```
instagram_verify_tetrix_2026_5e2f9c1b3d7a8e4c6f9b0d1a2e3c4b5f
```

---

## 📝 Step 1: Update Environment Variables

### WhatsApp Configuration

Create or update: `campaign/whatsapp/.env`

```bash
# WhatsApp Business Platform Configuration
# ==========================================

# Webhook Verification
WHATSAPP_VERIFY_TOKEN=whatsapp_verify_tetrix_2026_8f4e9d2a1b7c3e5f6a8d9b0c1e2f3a4b

# App Credentials (get from Meta App Dashboard → Settings → Basic)
WHATSAPP_APP_SECRET=your_app_secret_from_meta_dashboard

# Access Token (get from Meta App Dashboard → WhatsApp → API Setup)
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token_from_meta

# Phone Number ID (get from Meta App Dashboard → WhatsApp → API Setup)
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id

# Business Account ID
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id

# Webhook URL (your production domain)
WHATSAPP_WEBHOOK_URL=https://your-domain.com/api/webhooks/whatsapp
```

### Facebook Page Configuration

Create or update: `campaign/facebook/.env`

```bash
# Facebook Page Integration Configuration
# ==========================================

# Webhook Verification
FACEBOOK_VERIFY_TOKEN=facebook_verify_tetrix_2026_3c7b9e4d1a8f2c5e6b7a9d0f1e2c3b4a

# App Credentials (get from Meta App Dashboard → Settings → Basic)
FACEBOOK_APP_SECRET=your_app_secret_from_meta_dashboard
FACEBOOK_APP_ID=your_app_id_from_meta_dashboard

# Page Access Token (get from Meta App Dashboard → Messenger → Settings)
FACEBOOK_PAGE_ACCESS_TOKEN=your_page_access_token_from_meta

# Page ID (your Facebook Page ID)
FACEBOOK_PAGE_ID=your_facebook_page_id

# Webhook URL (your production domain)
FACEBOOK_WEBHOOK_URL=https://your-domain.com/api/webhooks/facebook-page

# Graph API Version
FACEBOOK_GRAPH_API_VERSION=v21.0
```

### Instagram Configuration

Create or update: `campaign/instagram/.env`

```bash
# Instagram Integration Configuration
# ==========================================

# Webhook Verification
INSTAGRAM_VERIFY_TOKEN=instagram_verify_tetrix_2026_5e2f9c1b3d7a8e4c6f9b0d1a2e3c4b5f

# App Credentials (same as Facebook if using same Meta App)
INSTAGRAM_APP_SECRET=your_app_secret_from_meta_dashboard

# Instagram Access Token (get from Meta App Dashboard → Instagram → Settings)
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token_from_meta

# Instagram Business Account ID
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_ig_business_account_id

# Webhook URL (your production domain)
INSTAGRAM_WEBHOOK_URL=https://your-domain.com/api/webhooks/instagram

# Graph API Version
INSTAGRAM_GRAPH_API_VERSION=v21.0
```

---

## 🌐 Step 2: Configure in Meta Developer Dashboard

### A. WhatsApp Business Platform

1. **Go to:** [Meta Developer Dashboard](https://developers.facebook.com/apps) → Your App → **WhatsApp → Configuration**

2. **Find "Webhook" section** and click **"Edit"** or **"Configure webhooks"**

3. **Enter these values:**
   ```
   Callback URL:
   https://your-domain.com/api/webhooks/whatsapp
   
   Verify Token:
   whatsapp_verify_tetrix_2026_8f4e9d2a1b7c3e5f6a8d9b0c1e2f3a4b
   ```

4. **Click "Verify and Save"**

5. **Subscribe to webhook fields:**
   - ✅ messages
   - ✅ message_status
   - ✅ message_template_status_update
   - ✅ phone_number_quality_update
   - ✅ account_review_update
   - ✅ account_update
   - ✅ security

---

### B. Facebook Page (Messenger)

1. **Go to:** [Meta Developer Dashboard](https://developers.facebook.com/apps) → Your App → **Messenger → Settings**

2. **Scroll to "Webhooks" section** and click **"Add Callback URL"**

3. **Enter these values:**
   ```
   Callback URL:
   https://your-domain.com/api/webhooks/facebook-page
   
   Verify Token:
   facebook_verify_tetrix_2026_3c7b9e4d1a8f2c5e6b7a9d0f1e2c3b4a
   ```

4. **Click "Verify and Save"**

5. **Subscribe to webhook fields:**
   - ✅ messages
   - ✅ messaging_postbacks
   - ✅ messaging_optins
   - ✅ messaging_optouts
   - ✅ message_deliveries
   - ✅ message_reads
   - ✅ messaging_referrals
   - ✅ message_reactions

6. **Go to:** **Webhooks** (main section in left sidebar)

7. **Subscribe to Page object** and enable:
   - ✅ feed
   - ✅ mention
   - ✅ leadgen
   - ✅ ratings

---

### C. Instagram

1. **Go to:** [Meta Developer Dashboard](https://developers.facebook.com/apps) → Your App → **Instagram → Settings**

2. **Scroll to "Webhooks" section** and click **"Add Callback URL"**

3. **Enter these values:**
   ```
   Callback URL:
   https://your-domain.com/api/webhooks/instagram
   
   Verify Token:
   instagram_verify_tetrix_2026_5e2f9c1b3d7a8e4c6f9b0d1a2e3c4b5f
   ```

4. **Click "Verify and Save"**

5. **Subscribe to webhook fields:**
   - ✅ messages
   - ✅ messaging_postback
   - ✅ messaging_seen
   - ✅ messaging_deliveries
   - ✅ messaging_reaction
   - ✅ messaging_referral
   - ✅ messaging_optins
   - ✅ messaging_optouts
   - ✅ comments
   - ✅ mentions
   - ✅ story_insights
   - ✅ live_comments

---

## 🧪 Step 3: Test Webhook Verification

### Test WhatsApp Webhook

```bash
# This simulates Meta's verification request
curl "https://your-domain.com/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=whatsapp_verify_tetrix_2026_8f4e9d2a1b7c3e5f6a8d9b0c1e2f3a4b&hub.challenge=test123"

# Expected response: test123
# Status code: 200
```

### Test Facebook Page Webhook

```bash
curl "https://your-domain.com/api/webhooks/facebook-page?hub.mode=subscribe&hub.verify_token=facebook_verify_tetrix_2026_3c7b9e4d1a8f2c5e6b7a9d0f1e2c3b4a&hub.challenge=test456"

# Expected response: test456
# Status code: 200
```

### Test Instagram Webhook

```bash
curl "https://your-domain.com/api/webhooks/instagram?hub.mode=subscribe&hub.verify_token=instagram_verify_tetrix_2026_5e2f9c1b3d7a8e4c6f9b0d1a2e3c4b5f&hub.challenge=test789"

# Expected response: test789
# Status code: 200
```

---

## 🚨 Troubleshooting

### Verification Failed

**Error:** "The callback URL or verify token couldn't be validated"

**Solutions:**

1. **Check token matches exactly:**
   ```bash
   # In your .env file
   grep VERIFY_TOKEN campaign/whatsapp/.env
   
   # Should output:
   # WHATSAPP_VERIFY_TOKEN=whatsapp_verify_tetrix_2026_8f4e9d2a1b7c3e5f6a8d9b0c1e2f3a4b
   ```

2. **Verify endpoint is accessible:**
   ```bash
   curl -I https://your-domain.com/api/webhooks/whatsapp
   # Should return HTTP 200 or 405 (Method Not Allowed for HEAD)
   ```

3. **Check server logs:**
   ```bash
   # Look for verification requests in your logs
   # Should see GET requests with hub.mode=subscribe
   ```

4. **Ensure HTTPS:**
   - Meta requires HTTPS (not HTTP)
   - Check SSL certificate is valid
   - Test with: `curl https://your-domain.com`

### Token Mismatch

**Symptom:** Getting 403 Forbidden

**Solution:**
1. Verify the token in `.env` matches what you entered in Meta dashboard
2. Restart your application after updating `.env`
3. Check for extra spaces or newlines in the token

### Endpoint Not Found

**Symptom:** 404 Not Found

**Solution:**
1. Verify your API endpoint is deployed:
   ```bash
   ls -la src/pages/api/webhooks/
   # Should show: whatsapp.ts, facebook-page.ts, instagram.ts
   ```

2. Check your web framework routing
3. Verify Nginx/proxy configuration if using reverse proxy

---

## 📋 Quick Reference Card

Copy this to your notes:

```
===========================================
TETRIX WEBHOOK CONFIGURATION
===========================================

WhatsApp Webhook:
URL: https://YOUR_DOMAIN/api/webhooks/whatsapp
Token: whatsapp_verify_tetrix_2026_8f4e9d2a1b7c3e5f6a8d9b0c1e2f3a4b

Facebook Page Webhook:
URL: https://YOUR_DOMAIN/api/webhooks/facebook-page
Token: facebook_verify_tetrix_2026_3c7b9e4d1a8f2c5e6b7a9d0f1e2c3b4a

Instagram Webhook:
URL: https://YOUR_DOMAIN/api/webhooks/instagram
Token: instagram_verify_tetrix_2026_5e2f9c1b3d7a8e4c6f9b0d1a2e3c4b5f

Replace YOUR_DOMAIN with your actual domain
===========================================
```

---

## 🔐 Security Reminders

1. ✅ **Never commit `.env` files to git**
2. ✅ **Use different tokens for each platform**
3. ✅ **Rotate tokens periodically (every 90 days)**
4. ✅ **Keep tokens in secure password manager**
5. ✅ **Use environment variables in production**
6. ✅ **Enable HTTPS only (no HTTP)**
7. ✅ **Monitor webhook logs for suspicious activity**

---

## ✅ Verification Checklist

- [ ] Created `.env` files for all platforms
- [ ] Added verify tokens to `.env` files
- [ ] Added other required credentials (app secret, access tokens)
- [ ] Deployed webhook endpoints to production
- [ ] Configured webhooks in Meta Developer Dashboard
- [ ] Successfully verified all webhook endpoints
- [ ] Subscribed to all required webhook fields
- [ ] Tested with curl commands
- [ ] Verified signature verification works
- [ ] Sent test messages and confirmed receipt
- [ ] Checked server logs for webhook events

---

**Need Help?** 

- Meta Developer Docs: https://developers.facebook.com/docs
- TETRIX Setup Guides: `/docs/*SETUP.md`
- Support: Check Meta App Dashboard → Webhooks → View Logs

---

**Status:** Ready for Production ✅  
**Last Updated:** January 7, 2026

