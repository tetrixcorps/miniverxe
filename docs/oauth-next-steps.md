# OAuth 2.0 Implementation - Next Steps

## ✅ Completed

1. **Core Services**: Encryption, Redis, Token Management, Industry Auth
2. **OAuth Flows**: Authorization Code & Client Credentials
3. **API Endpoints**: All OAuth endpoints created
4. **Provider Configs**: 6 providers configured
5. **CRM Integration**: Automatic token retrieval
6. **Environment Variables**: Credentials configured
7. **Unit Tests**: Test files created

---

## 🔄 Remaining Tasks

### 1. Install Dependencies

```bash
pnpm add redis zod
pnpm add -D @types/node
```

### 2. Database ORM Integration

**Option A: Prisma (Recommended)**

1. Install Prisma:
   ```bash
   pnpm add -D prisma
   pnpm add @prisma/client
   ```

2. Initialize Prisma:
   ```bash
   npx prisma init
   ```

3. Add OAuth schema to `prisma/schema.prisma` (see `src/services/oauth/database/prismaSchema.ts`)

4. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```

5. Run migrations:
   ```bash
   npx prisma migrate dev --name add_oauth_tables
   ```

**Option B: Direct SQL**

1. Run SQL schema:
   ```bash
   psql -U tetrix_user -d tetrix_auth -f src/services/oauth/database/schema.sql
   ```

2. Implement database methods in `tokenManagementService.ts`:
   - `storeTokensInDB()`
   - `getStoredTokensFromDB()`
   - `deleteTokensFromDB()`
   - `getIntegrationConfig()`

### 3. Update Token Management Service

Replace placeholder database methods with actual implementations:

```typescript
// In tokenManagementService.ts
private async storeTokensInDB(
  userId: string,
  integrationId: string,
  tokenData: StoredTokenData
): Promise<void> {
  // Prisma example:
  // await prisma.oAuthToken.upsert({
  //   where: { userId_integrationId: { userId, integrationId } },
  //   update: { ...tokenData, updatedAt: new Date() },
  //   create: { userId, integrationId, ...tokenData }
  // });
  
  // Or direct SQL:
  // await db.query(`
  //   INSERT INTO oauth_tokens (...)
  //   VALUES (...)
  //   ON CONFLICT (...) DO UPDATE SET ...
  // `);
}
```

### 4. Run Unit Tests

```bash
# Run OAuth tests
pnpm test tests/unit/oauth

# Run all tests
pnpm test
```

### 5. Test OAuth Flows

**Test Authorization Code Flow:**

1. Start the application
2. Call `POST /api/oauth/authorize` with Salesforce provider
3. Redirect user to returned `authorizationUrl`
4. Complete OAuth flow
5. Verify tokens stored in Redis and database

**Test Client Credentials Flow:**

1. Call `POST /api/oauth/client-credentials` with tenant ID
2. Verify tokens stored
3. Test token retrieval via `POST /api/oauth/token`

### 6. Integration Testing

Test CRM integration with OAuth:

```typescript
// Test automatic token retrieval
const crmService = new CRMIntegrationService();
await crmService.registerConnector('tenant_123', {
  provider: 'salesforce',
  baseUrl: 'https://instance.salesforce.com',
  // accessToken should be retrieved automatically
});

// Test CRM operations
const customer = await crmService.getCustomerByPhone('tenant_123', '+1234567890');
```

### 7. Production Deployment Checklist

- [ ] Set `ENCRYPTION_KEY` (generate with `openssl rand -hex 32`)
- [ ] Configure all provider credentials in `docker.env`
- [ ] Set `REDIS_PASSWORD` in production
- [ ] Run database migrations
- [ ] Test OAuth flows in staging
- [ ] Monitor token refresh rates
- [ ] Set up alerts for token expiration failures
- [ ] Configure audit logging
- [ ] Review security settings

### 8. Monitoring & Alerts

**Key Metrics to Monitor:**

- Token refresh success rate
- Token expiration failures
- OAuth callback errors
- Redis connection status
- Database query performance

**Alerts to Configure:**

- Token refresh failures > 5% in 5 minutes
- OAuth callback errors > 10 in 1 hour
- Redis connection failures
- Database connection issues

### 9. Documentation Updates

- [ ] Update API documentation with OAuth endpoints
- [ ] Create user guide for connecting integrations
- [ ] Document troubleshooting steps
- [ ] Add architecture diagrams

### 10. Security Review

- [ ] Review encryption implementation
- [ ] Verify CSRF protection (state parameter)
- [ ] Check PKCE implementation for SMART on FHIR
- [ ] Audit token storage security
- [ ] Review audit logging coverage
- [ ] Test token revocation
- [ ] Verify environment variable security

---

## 🚀 Quick Start Commands

```bash
# 1. Install dependencies
pnpm add redis zod @prisma/client
pnpm add -D prisma @types/node

# 2. Initialize Prisma (if using)
npx prisma init
# Add OAuth schema to prisma/schema.prisma

# 3. Generate Prisma Client
npx prisma generate

# 4. Run migrations
npx prisma migrate dev --name add_oauth_tables

# 5. Update docker.env with credentials
# (Already done - see docker.env.example)

# 6. Start services
docker-compose up -d

# 7. Test OAuth flow
curl -X POST http://localhost:3001/api/oauth/authorize \
  -H "Content-Type: application/json" \
  -d '{"provider":"salesforce","integrationId":"test_123"}'
```

---

## 📝 Notes

- **Environment Variables**: All credentials are now in `docker.env.example`
- **CRM Integration**: Automatically uses OAuth tokens when available
- **Fallback Support**: HubSpot connector falls back to API key if OAuth not available
- **Security**: All tokens encrypted with AES-256-GCM
- **Caching**: Redis used for fast token retrieval with database fallback

---

## 🐛 Troubleshooting

**Issue**: Redis connection fails
- **Solution**: Check `REDIS_URL` and `REDIS_PASSWORD` in `docker.env`

**Issue**: OAuth callback fails
- **Solution**: Verify `WEBHOOK_BASE_URL` matches your deployment URL

**Issue**: Token refresh fails
- **Solution**: Check `tokenUrl` in provider config and verify refresh token is valid

**Issue**: CRM connector can't get tokens
- **Solution**: Ensure OAuth flow completed and tokens stored in database

---

## 📚 Reference

- **Full Documentation**: `docs/oauth-implementation.md`
- **Quick Start**: `docs/oauth-quick-start.md`
- **Database Schema**: `src/services/oauth/database/schema.sql`
- **Prisma Schema**: `src/services/oauth/database/prismaSchema.ts`
