# Authentication System Local Development Fix

## Problem Identified

The authentication system was working correctly on the droplet but not performing the same expected behavior on the local dev server running on port 8082.

### Root Cause

1. **On Droplet (Docker)**: 
   - The API proxy in `src/pages/api/[...path].astro` correctly routes 2FA requests to the backend at `http://tetrix-backend:3001` because `DOCKER_ENV=true` is set
   - Authentication uses the real backend service with Telnyx integration

2. **On Local Dev (port 8082)**:
   - The frontend has specific 2FA endpoints (`/api/v2/2fa/initiate.ts` and `/api/v2/2fa/verify.ts`)
   - These endpoints were using the local `enterprise2FAService` directly, which uses a mock/fallback implementation in development
   - Astro's routing prioritizes specific routes over catch-all routes, so the proxy never got a chance to route to the backend
   - Result: Local dev was using mock authentication instead of the real backend service

## Solution Implemented

Modified the frontend 2FA endpoints to proxy to the backend server in local development, ensuring consistency with droplet deployment behavior.

### Changes Made

1. **`src/pages/api/v2/2fa/initiate.ts`**:
   - Added proxy logic to route requests to backend in local development
   - Falls back to local service only if backend proxy fails

2. **`src/pages/api/v2/2fa/verify.ts`**:
   - Added proxy logic to route requests to backend in local development
   - Falls back to local service only if backend proxy fails

### How It Works

```typescript
// Check if we should proxy to backend (local dev or when BACKEND_URL is set)
const isDocker = process.env.NODE_ENV === 'production' && process.env.DOCKER_ENV === 'true';
const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';

// Always proxy to backend in local development (when not in Docker production)
if (!isDocker) {
  // Proxy to backend for consistency with droplet deployment
  // ... proxy logic ...
}
```

## Testing

### Backend Verification
```bash
# Backend returns real verification IDs (UUID format)
curl -X POST http://localhost:3000/api/v2/2fa/initiate \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+15042749808","method":"sms"}'
# Response: {"success":true,"verificationId":"9c42f37a-3b80-423c-b92c-3cbd830b1528",...}
```

### Frontend Verification (After Restart)
```bash
# Frontend should now proxy to backend and return real verification IDs
curl -X POST http://localhost:8082/api/v2/2fa/initiate \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+15042749808","method":"sms"}'
# Expected: Real UUID verification ID (not mock_*)
```

## Next Steps

1. **Restart the frontend dev server** to pick up the code changes:
   ```bash
   # Stop the current dev server (Ctrl+C)
   # Then restart:
   npm run dev
   # or
   pnpm dev
   ```

2. **Verify the fix**:
   - Test 2FA initiation from the frontend UI
   - Check browser console for proxy logs: `🔄 [requestId] Proxying to backend`
   - Verify that real verification IDs are returned (UUID format, not `mock_*`)

3. **Environment Variables** (Optional):
   - Set `BACKEND_URL=http://localhost:3000` in your `.env` file if you want to explicitly specify the backend URL
   - Default behavior uses `http://localhost:3000` automatically

## Architecture Summary

### Droplet (Production)
- Frontend → API Proxy (`[...path].astro`) → Backend (`tetrix-backend:3001`)
- Uses Docker internal network

### Local Dev (After Fix)
- Frontend → 2FA Endpoints → Backend (`localhost:3000`)
- Direct proxy to backend for consistency

## Benefits

1. **Consistency**: Local dev now behaves the same as droplet deployment
2. **Real Authentication**: Uses actual Telnyx integration instead of mocks
3. **Better Testing**: Can test real authentication flows locally
4. **Fallback Safety**: Falls back to local service if backend is unavailable

## Files Modified

- `src/pages/api/v2/2fa/initiate.ts` - Added backend proxy logic
- `src/pages/api/v2/2fa/verify.ts` - Added backend proxy logic

## Related Documentation

- `docs/2FA_AUTH_DEPLOYMENT_GUIDE.md` - 2FA deployment guide
- `docs/DASHBOARD_AUTH_MAPPING.md` - Authentication flow documentation
- `docs/2FA_AUTH_ISSUES_ANALYSIS.md` - Previous authentication issues analysis




