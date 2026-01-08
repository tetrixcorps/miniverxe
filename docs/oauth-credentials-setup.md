# OAuth Credentials Setup

## ✅ Credentials Configured

The following CRM credentials have been added to `docker.env.example`:

### Salesforce
- **Client ID**: `YOUR_SALESFORCE_CLIENT_ID`
- **Client Secret**: `YOUR_SALESFORCE_CLIENT_SECRET`

### HubSpot
- **API Key**: `YOUR_HUBSPOT_API_KEY`
- **Developer API Key**: `YOUR_HUBSPOT_DEVELOPER_API_KEY`

---

## 🔧 Environment Variable Injection

### How It Works

1. **OAuth Flow**: When OAuth is used, tokens are stored securely and retrieved automatically
2. **API Key Fallback**: For HubSpot, if OAuth token is not available, the system falls back to `HUBSPOT_API_KEY` or `HUBSPOT_DEVELOPER_API_KEY` from environment variables
3. **CRM Integration**: The CRM Integration Service automatically:
   - Tries to get OAuth token from OAuth service
   - Falls back to environment variables if OAuth not available
   - Uses provided credentials if explicitly set

### Code Flow

```typescript
// 1. CRM Service registers connector
await crmIntegrationService.registerConnector('tenant_123', {
  provider: 'salesforce',
  baseUrl: 'https://instance.salesforce.com',
  // No accessToken provided
});

// 2. Service automatically tries OAuth
// - Checks OAuth service for stored tokens
// - If not found, falls back to environment variables (HubSpot only)
// - Uses provided config if explicitly set

// 3. HubSpot connector uses getAuthHeader()
// - Prefers OAuth access token
// - Falls back to HUBSPOT_API_KEY or HUBSPOT_DEVELOPER_API_KEY
// - Throws error if none available
```

---

## 📝 Configuration Files

### docker.env.example

All credentials are stored in `docker.env.example`:

```bash
# Salesforce OAuth
SALESFORCE_CLIENT_ID=your_salesforce_client_id
SALESFORCE_CLIENT_SECRET=your_salesforce_client_secret

# HubSpot OAuth
HUBSPOT_CLIENT_ID=your_hubspot_client_id
HUBSPOT_CLIENT_SECRET=your_hubspot_client_secret
# HubSpot API Key (for API-based integrations, fallback if OAuth not available)
HUBSPOT_API_KEY=your_hubspot_api_key
HUBSPOT_DEVELOPER_API_KEY=your_hubspot_developer_api_key
```

### Copy to docker.env

```bash
cp docker.env.example docker.env
# Edit docker.env with your actual values
```

---

## 🔐 Security Notes

1. **Never commit `docker.env`**: It's in `.gitignore`
2. **Use environment variables**: All credentials loaded from environment
3. **Encryption**: OAuth tokens are encrypted with AES-256-GCM
4. **Fallback logic**: HubSpot uses API key as fallback, but OAuth is preferred

---

## 🚀 Usage

### Salesforce (OAuth Required)

```typescript
// 1. Initiate OAuth flow
POST /api/oauth/authorize
{
  "provider": "salesforce",
  "integrationId": "sf_user_123"
}

// 2. After OAuth callback, tokens stored automatically
// 3. CRM service automatically uses stored tokens
```

### HubSpot (OAuth or API Key)

```typescript
// Option 1: Use OAuth (preferred)
POST /api/oauth/authorize
{
  "provider": "hubspot",
  "integrationId": "hs_user_123"
}

// Option 2: Use API Key (fallback)
// Set HUBSPOT_API_KEY in docker.env
// CRM service will automatically use it if OAuth not available
```

---

## ✅ Verification

To verify credentials are loaded:

1. Check environment variables are set:
   ```bash
   docker-compose exec tetrix-backend env | grep SALESFORCE
   docker-compose exec tetrix-backend env | grep HUBSPOT
   ```

2. Test OAuth flow:
   ```bash
   curl -X POST http://localhost:3001/api/oauth/authorize \
     -H "Content-Type: application/json" \
     -d '{"provider":"salesforce","integrationId":"test_123"}'
   ```

3. Test CRM integration:
   ```typescript
   await crmIntegrationService.registerConnector('tenant_123', {
     provider: 'salesforce',
     baseUrl: 'https://instance.salesforce.com',
   });
   ```

---

## 📚 Next Steps

See `docs/oauth-next-steps.md` for:
- Database ORM integration
- Running unit tests
- End-to-end testing
- Production deployment checklist
