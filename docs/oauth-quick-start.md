# OAuth 2.0 Quick Start Guide

## Installation

### 1. Install Dependencies

```bash
pnpm add redis zod
pnpm add -D @types/node
```

### 2. Configure Environment Variables

Add to `docker.env`:

```bash
# Encryption Key (generate with: openssl rand -hex 32)
ENCRYPTION_KEY=your-32-byte-encryption-key-here

# Redis (already configured in docker-compose.yml)
REDIS_URL=redis://tetrix-redis:6379
REDIS_PASSWORD=tetrix_redis_password_change_me

# Provider Credentials
SALESFORCE_CLIENT_ID=your_client_id
SALESFORCE_CLIENT_SECRET=your_client_secret
```

### 3. Run Database Migrations

```bash
# Apply OAuth schema
psql -U tetrix_user -d tetrix_auth -f src/services/oauth/database/schema.sql
```

---

## Basic Usage

### Connect Salesforce Account

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

// 2. Redirect user
window.location.href = authorizationUrl;

// 3. After callback, tokens are automatically stored
```

### Use with CRM Service

```typescript
import { crmIntegrationService } from '@/services/telemarketing/crmIntegrationService';

// Tokens retrieved automatically from OAuth service
await crmIntegrationService.registerConnector('tenant_123', {
  provider: 'salesforce',
  baseUrl: 'https://instance.salesforce.com',
  // accessToken will be retrieved automatically if OAuth configured
});
```

### Get Access Token

```typescript
const response = await fetch('/api/oauth/token', {
  method: 'POST',
  body: JSON.stringify({
    userId: 'user_123',
    integrationId: 'sf_user_123',
  }),
});

const { accessToken } = await response.json();
```

---

## Supported Providers

- ✅ Salesforce
- ✅ HubSpot
- ✅ Epic (SMART on FHIR)
- ✅ Cerner (SMART on FHIR)
- ✅ Shopify
- ✅ Clio

---

## Next Steps

See `docs/oauth-implementation.md` for detailed documentation.
