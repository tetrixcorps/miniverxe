# Clio Integration Setup

## ✅ Credentials Configured

Clio OAuth credentials have been added to `docker.env.example`:

- **Client ID**: `tnWzRT7HnkEyTbn6nn16COHTHasopRkq9MKEID9d`
- **Client Secret**: `Yq79Ss8735EwE5qBede8dC5Av06Lcsvh0hYYjn2V`

---

## 🔧 Environment Variables

### docker.env.example

```bash
# Clio (Legal) OAuth
CLIO_CLIENT_ID=tnWzRT7HnkEyTbn6nn16COHTHasopRkq9MKEID9d
CLIO_CLIENT_SECRET=Yq79Ss8735EwE5qBede8dC5Av06Lcsvh0hYYjn2V
```

### Copy to docker.env

```bash
cp docker.env.example docker.env
# Credentials are already set in docker.env.example
```

---

## 📚 Clio OAuth 2.0 Implementation

Based on Clio's official documentation:

### Authorization Endpoint
- **URL**: `https://app.clio.com/oauth/authorize`
- **Method**: GET
- **Parameters**:
  - `client_id`: Your Clio client ID
  - `response_type`: `code`
  - `redirect_uri`: Your callback URL
  - `state`: CSRF protection token
  - `scope`: Requested permissions

### Token Endpoint
- **URL**: `https://app.clio.com/oauth/token`
- **Method**: POST
- **Content-Type**: `application/x-www-form-urlencoded`
- **Parameters**:
  - `grant_type`: `authorization_code`
  - `code`: Authorization code from callback
  - `redirect_uri`: Same as authorization request
  - `client_id`: Your Clio client ID
  - `client_secret`: Your Clio client secret

---

## 🚀 Usage

### 1. Initiate OAuth Flow

```typescript
// From legal dashboard
const response = await fetch('/api/legal/clio/authorize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    integrationId: 'clio_user_123',
    userId: 'user_123',
  }),
});

const { authorizationUrl } = await response.json();

// Redirect user to Clio authorization
window.location.href = authorizationUrl;
```

### 2. Handle Callback

The callback is automatically handled by `/api/legal/clio/callback` which:
- Exchanges authorization code for access token
- Stores tokens securely using OAuth service
- Redirects to legal dashboard

### 3. Use Clio Integration

```typescript
import { LegalIntegrationFactory } from '@/services/integrations/LegalIntegrations';

// Create Clio integration (uses environment variables automatically)
const clioIntegration = LegalIntegrationFactory.createClioIntegration();

// Get cases
const cases = await clioIntegration.getCases();

// Get clients
const clients = await clioIntegration.getClients();

// Create case
const newCase = await clioIntegration.createCase({
  name: 'New Matter',
  clientId: 'client_123',
  // ...
});
```

---

## 🔐 Security

- ✅ **No Hardcoded Credentials**: All credentials loaded from environment variables
- ✅ **Secure Token Storage**: Tokens encrypted with AES-256-GCM
- ✅ **Automatic Token Refresh**: Tokens refreshed automatically when expired
- ✅ **CSRF Protection**: State parameter validates OAuth flow

---

## 📝 API Endpoints

### POST /api/legal/clio/authorize
Initiates Clio OAuth flow.

**Request**:
```json
{
  "integrationId": "clio_user_123",
  "userId": "user_123"
}
```

**Response**:
```json
{
  "success": true,
  "authorizationUrl": "https://app.clio.com/oauth/authorize?...",
  "state": "random_state_string",
  "integrationId": "clio_user_123"
}
```

### GET /api/legal/clio/callback
Handles OAuth callback (called by Clio).

**Query Parameters**:
- `code`: Authorization code
- `state`: State parameter
- `user_id`: User ID (optional)
- `integration_id`: Integration ID (optional)
- `redirect_uri`: Redirect URL after success

---

## 🔄 Integration with Legal Dashboard

The legal dashboard can now:

1. **Connect Clio Account**:
   ```typescript
   // Call OAuth authorization endpoint
   const { authorizationUrl } = await fetch('/api/legal/clio/authorize', {
     method: 'POST',
     body: JSON.stringify({ integrationId: 'clio_123' }),
   }).then(r => r.json());
   
   window.location.href = authorizationUrl;
   ```

2. **Use Clio API**:
   ```typescript
   // Integration automatically uses stored OAuth tokens
   const clio = LegalIntegrationFactory.createClioIntegration();
   const cases = await clio.getCases();
   ```

3. **Automatic Token Management**:
   - Tokens retrieved from OAuth service automatically
   - Tokens refreshed when expired
   - No need to manage tokens manually

---

## 📋 Clio API Scopes

The integration requests the following scopes:
- `read` - Read access
- `write` - Write access
- `user:read` - User information
- `matters:read`, `matters:write` - Case management
- `contacts:read`, `contacts:write` - Client management
- `time_entries:read`, `time_entries:write` - Time tracking
- `documents:read`, `documents:write` - Document management
- `invoices:read`, `invoices:write` - Billing
- `tasks:read`, `tasks:write` - Task management
- `calendar_events:read`, `calendar_events:write` - Calendar

---

## 🐛 Troubleshooting

**Issue**: "Clio OAuth credentials not configured"
- **Solution**: Ensure `CLIO_CLIENT_ID` and `CLIO_CLIENT_SECRET` are set in `docker.env`

**Issue**: OAuth callback fails
- **Solution**: Verify `WEBHOOK_BASE_URL` matches your deployment URL and is registered in Clio app settings

**Issue**: Token refresh fails
- **Solution**: Check that refresh token is stored and valid

---

## 📚 References

- **Clio Developer Documentation**: https://docs.developers.clio.com/api-docs/authorization/
- **OAuth Implementation**: `docs/oauth-implementation.md`
- **Legal Integrations**: `src/services/integrations/LegalIntegrations.ts`

---

## ✅ Status

- ✅ Credentials added to environment variables
- ✅ OAuth provider configuration updated
- ✅ Legal integration factory updated to use environment variables
- ✅ API endpoints created for Clio OAuth
- ✅ No hardcoded credentials in codebase
- ✅ Ready for legal dashboard integration

