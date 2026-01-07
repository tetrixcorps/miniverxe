# WhatsApp Business Platform - Credentials Needed

## 🔑 Required Credentials

To complete the WhatsApp Business Platform setup, you need to provide **ONE** credential:

### 1. Access Token (REQUIRED)

**What is it?**
The Access Token authenticates your application to send messages via the WhatsApp Cloud API.

**How to get it:**

#### Option A: Temporary Token (Testing - 24 hours)
1. Go to [Meta for Developers](https://developers.facebook.com/apps/)
2. Select your app
3. Navigate to **WhatsApp > API Setup**
4. Copy the temporary access token shown in the panel

#### Option B: Permanent Token (Production - Recommended)
1. Go to [Business Settings](https://business.facebook.com/settings/)
2. Click **System Users** in the left menu
3. Create a new System User or select an existing one
4. Click **Generate New Token**
5. Select your app
6. Enable permissions:
   - `whatsapp_business_management`
   - `whatsapp_business_messaging`
7. Click **Generate Token**
8. **IMPORTANT**: Copy and save the token immediately (you won't see it again)

**Where to add it:**
Update the `.env` file in `campaign/whatsapp/`:
```bash
WHATSAPP_ACCESS_TOKEN=your_access_token_here
```

---

## ✅ Already Configured

The following credentials have been pre-configured based on your account information:

- **Business Profile Name**: TetrixCorp
- **Business Account ID**: 868215485645549
- **Phone Number**: 15558141227
- **Phone Number ID**: 916283001564486
- **Certificate**: Pre-configured for end-to-end encryption

---

## 🔐 Optional: Webhook Verify Token

If you plan to receive incoming messages (webhooks), you'll need a verify token:

**How to set it:**
1. Generate a random secure string:
   ```bash
   openssl rand -hex 32
   ```
   Or use any random string like: `my_secure_verify_token_12345`

2. Add it to your `.env` file:
   ```bash
   WHATSAPP_VERIFY_TOKEN=your_random_string_here
   ```

3. Use the **same value** when configuring webhooks in the Meta App Dashboard

---

## 📋 Summary

### To Continue Setup:

1. **Get your Access Token** (see instructions above)
2. **Update the `.env` file**:
   ```bash
   WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxx
   ```
3. **Optional**: Set a webhook verify token if you need to receive messages
4. **Start sending campaigns!**

### Environment File Location:
```
campaign/whatsapp/.env
```

### What happens next?

Once you provide the access token, you'll be able to:
- ✅ Send WhatsApp template messages
- ✅ Track message delivery status
- ✅ Manage your business profile
- ✅ Run automated campaigns

---

## 🚀 Quick Start After Authentication

Once your access token is configured, you can:

### Test the Connection
```typescript
import { WhatsAppCampaignService } from './WhatsAppCampaignService';

const service = new WhatsAppCampaignService();
const profile = await service.getBusinessProfile();
console.log('Connected to:', profile);
```

### Send Your First Campaign
```typescript
const campaign = service.createCampaignFromTemplate('construction', 'Test Campaign');
const recipients = [{
  phoneNumber: '+15551234567',
  firstName: 'John',
  // ... other fields
}];

const result = await service.sendCampaign(campaign, recipients);
```

---

## 📞 Need Help?

- **Meta Developer Docs**: [WhatsApp Business Platform](https://developers.facebook.com/docs/whatsapp)
- **Access Token Guide**: [Authentication Documentation](https://developers.facebook.com/docs/whatsapp/business-management-api/get-started#access-tokens)
- **System Users**: [Create System Users](https://business.facebook.com/settings/system-users)

