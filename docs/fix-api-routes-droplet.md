# Fix API Routes Missing from Build Output on Droplet

## Problem Analysis

Based on web research and codebase analysis, API routes are missing from the build output despite existing in source code. This is a common issue with Astro + pnpm + Docker builds.

## Root Causes Identified

1. **pnpm Workspace Configuration**: pnpm's strict dependency resolution can cause TypeScript/Astro to not see all files
2. **Build Cache Issues**: Stale build cache may exclude newly added routes
3. **TypeScript Configuration**: Missing explicit include paths for API routes
4. **Astro Build Process**: API routes may not be included if build config is incomplete

## Solution Applied

### 1. Updated tsconfig.json
- Added explicit include paths for API routes
- Added `rootDir` and `baseUrl` for proper path resolution
- Added path aliases (`@/*` and `@api/*`)

### 2. Clear Build Cache
- Clear pnpm store
- Remove node_modules and build artifacts
- Force clean rebuild

### 3. Rebuild Container
- Use `--no-cache` to ensure fresh build
- Verify routes are included in output

## Files Modified

1. `tsconfig.json` - Added explicit API route includes
2. `astro.config.mjs` - Already configured correctly with `output: 'server'`

## Verification Steps

After running the fix script:

1. Check build output:
   ```bash
   docker compose exec tetrix-frontend find /app/dist/server/pages/api -name "*.mjs"
   ```

2. Test endpoints:
   ```bash
   curl https://tetrixcorp.com/api/v2/auth/countries
   curl -X POST https://tetrixcorp.com/api/v1/joromi/sessions \
     -H 'Content-Type: application/json' \
     -d '{"userId":"test","agentId":"joromi-general","channel":"chat"}'
   ```

3. Check browser console on contact page for JoRoMi chat errors

## Expected Results

- ✅ `dist/server/pages/api/v2/auth/countries.mjs` exists
- ✅ `dist/server/pages/api/v1/joromi/sessions/[sessionId]/stream.mjs` exists
- ✅ API endpoints return 200 instead of 404
- ✅ JoRoMi chat works on contact page

## If Issues Persist

1. Check Astro build logs for errors
2. Verify all API route files have correct exports (`export const GET`, `export const POST`, etc.)
3. Ensure `export const prerender = false` is set for dynamic routes
4. Check Docker build logs for any pnpm/TypeScript errors

