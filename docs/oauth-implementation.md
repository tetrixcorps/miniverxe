# OAuth 2.0 Authentication & Token Management Implementation

## Overview

This document describes the comprehensive OAuth 2.0 authentication and token management system implemented for enterprise integrations across 13+ industries.

---

## Architecture

### Core Services

1. **EncryptionService** (`src/services/oauth/encryptionService.ts`)
   - AES-256-GCM encryption for secure token storage
   - PBKDF2 hashing for passwords
   - Secure key derivation

2. **RedisService** (`src/services/oauth/redisService.ts`)
   - Redis client for token caching
   - Session management
   - Automatic reconnection handling

3. **TokenManagementService** (`src/services/oauth/tokenManagementService.ts`)
   - Secure token storage (encrypted)
   - Automatic token refresh
   - Redis caching with database fallback
   - Token expiration management

4. **IndustryAuthService** (`src/services/oauth/industryAuthService.ts`)
   - OAuth 2.0 Authorization Code Grant (3-legged)
   - OAuth 2.0 Client Credentials Grant (2-legged)
   - PKCE support (for SMART on FHIR)
   - State management for CSRF protection

---

## OAuth 2.0 Grant Types

### 1. Authorization Code Grant (3-legged OAuth)

**Use Case**: User-facing integrations where a user grants permission to access their data.

**Flow**:
1. User initiates OAuth flow via `/api/oauth/authorize`
2. System generates authorization URL with state (CSRF protection)
3. User redirected to provider (Salesforce, HubSpot, etc.)
4. User authorizes access
5. Provider redirects to `/api/oauth/callback` with authorization code
6. System exchanges code for access token
7. Tokens stored securely (encrypted)

**Example**:
```typescript
// Initiate flow
POST /api/oauth/authorize
{
  "provider": "salesforce",
  "integrationId": "sf_integration_123",
  "scopes": ["api", "refresh_token"]
}

// Response
{
  "authorizationUrl": "https://login.salesforce.com/services/oauth2/authorize?...",
  "state": "random_state_string"
}
```

### 2. Client Credentials Grant (2-legged OAuth)

**Use Case**: Server-to-server integrations where no user is present.

**Flow**:
1. System requests access token using client credentials
2. Provider returns access token
3. Tokens stored securely

**Example**:
```typescript
POST /api/oauth/client-credentials
{
  "provider": "salesforce",
  "integrationId": "sf_server_123",
  "tenantId": "tenant_abc",
  "scopes": ["api"]
}
```

---

## Supported Providers

### Currently Configured

1. **Salesforce**
   - Authorization Code Grant
   - Client Credentials Grant
   - Scopes: `api`, `refresh_token`, `full`

2. **HubSpot**
   - Authorization Code Grant
   - Scopes: `contacts`, `content`, `crm.objects.contacts.read/write`

3. **Epic (SMART on FHIR)**
   - Authorization Code Grant with PKCE
   - Scopes: `patient/Patient.read`, `patient/Appointment.read/write`, etc.

4. **Cerner (SMART on FHIR)**
   - Authorization Code Grant with PKCE
   - Healthcare-specific scopes

5. **Shopify**
   - Authorization Code Grant
   - Scopes: `read_orders`, `write_orders`, `read_products`, `read_customers`

6. **Clio (Legal)**
   - Authorization Code Grant
   - Scopes: `read`, `write`

---

## API Endpoints

### 1. Initiate OAuth Flow
```
POST /api/oauth/authorize
Body: {
  provider: string,
  integrationId: string,
  scopes?: string[],
  state?: string
}
```

### 2. OAuth Callback
```
GET /api/oauth/callback?code=...&state=...
```

### 3. Client Credentials
```
POST /api/oauth/client-credentials
Body: {
  provider: string,
  integrationId: string,
  tenantId: string,
  scopes?: string[]
}
```

### 4. Get Access Token
```
POST /api/oauth/token
Body: {
  userId: string,
  integrationId: string
}
```

### 5. Revoke Integration
```
POST /api/oauth/revoke
Body: {
  userId: string,
  integrationId: string
}
```

---

## Token Management

### Storage

- **Redis**: Cached tokens with TTL (slightly less than expiry)
- **Database**: Persistent storage (encrypted) as fallback
- **Encryption**: AES-256-GCM for access/refresh tokens

### Automatic Refresh

Tokens are automatically refreshed when:
- Access token expires
- Token retrieval is requested
- Refresh token is available

### Security Features

- **Encryption**: All tokens encrypted at rest
- **State Validation**: CSRF protection via state parameter
- **PKCE**: Code challenge/verifier for SMART on FHIR
- **TTL Management**: Tokens expire and are cleaned up automatically

---

## Integration with CRM Service

The OAuth service integrates seamlessly with the existing CRM Integration Service:

```typescript
// CRM Integration Service automatically retrieves tokens
const crmService = new CRMIntegrationService();

// Register connector - tokens retrieved automatically if OAuth configured
await crmService.registerConnector(tenantId, {
  provider: 'salesforce',
  baseUrl: 'https://instance.salesforce.com',
  // accessToken will be retrieved from OAuth service if not provided
});
```

---

## Database Schema

See `src/services/oauth/database/schema.sql` for:
- `oauth_integrations` - Integration metadata
- `oauth_tokens` - Encrypted token storage
- `oauth_configurations` - Provider configurations
- `oauth_states` - Temporary state storage

---

## Environment Variables

Add to `docker.env`:

```bash
# Encryption
ENCRYPTION_KEY=your-32-byte-encryption-key-here

# Redis
REDIS_URL=redis://tetrix-redis:6379
REDIS_PASSWORD=tetrix_redis_password_change_me

# Provider OAuth Credentials
SALESFORCE_CLIENT_ID=your_salesforce_client_id
SALESFORCE_CLIENT_SECRET=your_salesforce_client_secret

HUBSPOT_CLIENT_ID=your_hubspot_client_id
HUBSPOT_CLIENT_SECRET=your_hubspot_client_secret

EPIC_CLIENT_ID=your_epic_client_id
EPIC_CLIENT_SECRET=your_epic_client_secret
EPIC_AUTH_URL=https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize
EPIC_TOKEN_URL=https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token

CERNER_CLIENT_ID=your_cerner_client_id
CERNER_CLIENT_SECRET=your_cerner_client_secret
CERNER_AUTH_URL=https://authorization.cerner.com/tenants/{tenant}/protocols/oauth2/profiles/smart-v1/personas/provider/authorize
CERNER_TOKEN_URL=https://authorization.cerner.com/tenants/{tenant}/protocols/oauth2/profiles/smart-v1/token

SHOPIFY_CLIENT_ID=your_shopify_client_id
SHOPIFY_CLIENT_SECRET=your_shopify_client_secret
SHOPIFY_AUTH_URL=https://{shop}.myshopify.com/admin/oauth/authorize
SHOPIFY_TOKEN_URL=https://{shop}.myshopify.com/admin/oauth/access_token

CLIO_CLIENT_ID=your_clio_client_id
CLIO_CLIENT_SECRET=your_clio_client_secret
```

---

## Dependencies

### Required Packages

```json
{
  "redis": "^4.6.10",
  "zod": "^3.22.0"
}
```

Install:
```bash
pnpm add redis zod
pnpm add -D @types/node
```

---

## Usage Examples

### 1. Connect Salesforce Account

```typescript
// 1. Initiate OAuth flow
const response = await fetch('/api/oauth/authorize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'salesforce',
    integrationId: 'sf_user_123',
  }),
});

const { authorizationUrl } = await response.json();

// 2. Redirect user to authorizationUrl
window.location.href = authorizationUrl;

// 3. After callback, tokens are stored automatically
// 4. Use tokens via CRM service
```

### 2. Server-to-Server Authentication

```typescript
// Client credentials flow (no user interaction)
const response = await fetch('/api/oauth/client-credentials', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'salesforce',
    integrationId: 'sf_server_123',
    tenantId: 'tenant_abc',
  }),
});
```

### 3. Retrieve Access Token

```typescript
// Get access token (auto-refreshes if expired)
const response = await fetch('/api/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user_123',
    integrationId: 'sf_user_123',
  }),
});

const { accessToken } = await response.json();
```

---

## Industry-Specific Implementations

### Healthcare (Epic, Cerner)

- **SMART on FHIR** standard
- **PKCE required** for security
- **Patient-scoped** tokens
- **FHIR API** integration

### Banking (Salesforce Financial Services Cloud)

- **Authorization Code Grant** for customer data
- **Client Credentials** for system-level operations
- **Account balance** and transaction APIs

### Legal (Clio)

- **Authorization Code Grant**
- **Matter and contact** management
- **Calendar integration**

---

## Security Considerations

1. **Token Encryption**: All tokens encrypted with AES-256-GCM
2. **State Validation**: CSRF protection via state parameter
3. **PKCE**: Required for SMART on FHIR providers
4. **Token Expiration**: Automatic cleanup of expired tokens
5. **Audit Logging**: All OAuth events logged for compliance
6. **Redis Security**: Password-protected Redis instance

---

## Next Steps

1. **Database Integration**: Implement Prisma/ORM for token persistence
2. **Provider Expansion**: Add more industry providers
3. **Token Rotation**: Implement refresh token rotation
4. **Monitoring**: Add token usage metrics and alerts
5. **Testing**: Comprehensive unit and integration tests

---

## File Structure

```
src/services/oauth/
├── encryptionService.ts      # AES-256-GCM encryption
├── redisService.ts           # Redis client
├── tokenManagementService.ts # Token storage & refresh
├── industryAuthService.ts    # OAuth 2.0 flows
├── providerConfigs.ts        # Provider configurations
├── index.ts                  # Exports
└── database/
    └── schema.sql            # Database schema

src/pages/api/oauth/
├── authorize.ts              # Initiate OAuth flow
├── callback.ts               # OAuth callback handler
├── client-credentials.ts     # Client credentials flow
├── token.ts                  # Get access token
└── revoke.ts                 # Revoke integration
```

---

## Status

✅ **Core Services**: Implemented
✅ **OAuth Flows**: Authorization Code & Client Credentials
✅ **Token Management**: Encryption, caching, auto-refresh
✅ **API Endpoints**: All endpoints created
✅ **CRM Integration**: Automatic token retrieval
✅ **Provider Configs**: 6 providers configured
⏳ **Database Integration**: Schema created, ORM pending
⏳ **Unit Tests**: Pending
⏳ **Documentation**: Complete

---

## Support

For questions or issues, refer to:
- OAuth 2.0 Specification: https://oauth.net/2/
- SMART on FHIR: https://www.hl7.org/fhir/smart-app-launch/
- Provider-specific documentation in `providerConfigs.ts`
