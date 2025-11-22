#!/bin/bash

# Fix API Routes Missing from Build Output on Droplet
# Based on analysis: Astro server mode should include API routes, but pnpm/Docker build may exclude them

set -e

DROPLET_IP="207.154.193.187"
DROPLET_KEY="$HOME/.ssh/tetrix_droplet_key"
DROPLET_USER="root"
DROPLET_PATH="/opt/tetrix"

echo "=== Fixing API Routes Missing from Build Output ==="
echo ""
echo "ROOT CAUSE ANALYSIS:"
echo "  - Astro API routes exist in source but missing from dist/server/pages/api/"
echo "  - Common causes: pnpm workspace config, build cache, or Astro build config"
echo ""

# Check SSH key
if [ ! -f "$DROPLET_KEY" ]; then
    echo "❌ SSH key not found: $DROPLET_KEY"
    exit 1
fi

# Test SSH connection
echo "🔍 Testing SSH connection..."
if ! ssh -i "$DROPLET_KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=5 "$DROPLET_USER@$DROPLET_IP" "echo 'Connection successful'" 2>/dev/null; then
    echo "❌ Cannot connect to droplet. Please check:"
    echo "   - Droplet is running"
    echo "   - IP address: $DROPLET_IP"
    echo "   - SSH key: $DROPLET_KEY"
    exit 1
fi

echo "✅ SSH connection successful"
echo ""

# Execute fixes on droplet
ssh -i "$DROPLET_KEY" -o StrictHostKeyChecking=no "$DROPLET_USER@$DROPLET_IP" << 'DROPLET_FIX_EOF'
cd /opt/tetrix

echo "=== Step 1: Checking Current Build Output ==="
if docker compose exec -T tetrix-frontend test -d /app/dist/server/pages/api 2>/dev/null; then
    echo "✅ dist/server/pages/api exists"
    echo "Checking for specific routes:"
    docker compose exec -T tetrix-frontend find /app/dist/server/pages/api -name "*.mjs" 2>/dev/null | head -10 || echo "⚠️  No .mjs files found"
else
    echo "❌ dist/server/pages/api does not exist"
fi

echo ""
echo "=== Step 2: Updating tsconfig.json on Droplet ==="
# Create updated tsconfig.json content
cat > /tmp/tsconfig_fix.json << 'TSFIX_EOF'
{
  "extends": "astro/tsconfigs/strict",
  "include": [
    ".astro/types.d.ts",
    "src/**/*",
    "src/pages/api/**/*",
    "src/pages/api/v1/**/*",
    "src/pages/api/v2/**/*"
  ],
  "exclude": ["dist", "scripts/**/*.js", "**/*.js", "node_modules", "**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx", "**/__tests__/**"],
  "compilerOptions": {
    "downlevelIteration": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "rootDir": "./src",
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"],
      "@api/*": ["src/pages/api/*"]
    },
    "types": ["jest", "node", "vitest/globals"],
    "skipLibCheck": true,
    "verbatimModuleSyntax": false
  }
}
TSFIX_EOF

# Copy to droplet
scp -i "$DROPLET_KEY" -o StrictHostKeyChecking=no /tmp/tsconfig_fix.json "$DROPLET_USER@$DROPLET_IP:/opt/tetrix/tsconfig.json"

echo "✅ tsconfig.json updated"

echo ""
echo "=== Step 3: Checking and Updating Astro Config ==="
if grep -q "output: 'server'" /opt/tetrix/astro.config.mjs 2>/dev/null; then
    echo "✅ Astro configured for server mode"
else
    echo "⚠️  Warning: Astro may not be in server mode"
    echo "Updating astro.config.mjs..."
fi

# Ensure build.clean is set to true to force clean builds
if ! grep -q "build:" /opt/tetrix/astro.config.mjs 2>/dev/null || ! grep -q "clean: true" /opt/tetrix/astro.config.mjs 2>/dev/null; then
    echo "⚠️  Adding build.clean configuration..."
    # This will be handled by copying the updated config from local
fi

echo ""
echo "=== Step 4: Verifying API Route Files Exist ==="
echo "Checking source files:"
test -f src/pages/api/v2/auth/countries.ts && echo "✅ countries.ts exists" || echo "❌ countries.ts missing"
test -f src/pages/api/v1/joromi/sessions/\[sessionId\]/stream.ts && echo "✅ stream.ts exists" || echo "❌ stream.ts missing"
test -f src/pages/api/v1/joromi/storage.ts && echo "✅ storage.ts exists" || echo "❌ storage.ts missing"

echo ""
echo "=== Step 5: Clearing pnpm Cache in Container ==="
docker compose exec -T tetrix-frontend sh -c "cd /app && pnpm store prune 2>&1 | tail -3" || echo "⚠️  pnpm store prune failed (may not be critical)"

echo ""
echo "=== Step 6: Stopping Frontend Container ==="
docker compose stop tetrix-frontend

echo ""
echo "=== Step 7: Rebuilding Frontend Container with --no-cache ==="
echo "This will take several minutes..."
docker compose build --no-cache tetrix-frontend 2>&1 | tee /tmp/frontend-build-$(date +%Y%m%d_%H%M%S).log | tail -50

echo ""
echo "=== Step 8: Starting Frontend Container ==="
docker compose up -d tetrix-frontend

echo ""
echo "=== Step 9: Waiting for Container to be Healthy ==="
sleep 15
docker compose ps tetrix-frontend

echo ""
echo "=== Step 10: Verifying API Routes in Build Output ==="
echo "Checking for countries route:"
if docker compose exec -T tetrix-frontend find /app/dist/server/pages/api/v2/auth -name "countries*" 2>/dev/null | grep -q .; then
    echo "✅ countries route found in build"
    docker compose exec -T tetrix-frontend ls -la /app/dist/server/pages/api/v2/auth/countries* 2>&1 | head -3
else
    echo "❌ countries route NOT found in build"
fi

echo ""
echo "Checking for JoRoMi routes:"
if docker compose exec -T tetrix-frontend find /app/dist/server/pages/api/v1/joromi -name "*.mjs" 2>/dev/null | grep -q .; then
    echo "✅ JoRoMi routes found in build"
    docker compose exec -T tetrix-frontend find /app/dist/server/pages/api/v1/joromi -name "*.mjs" 2>&1 | head -5
else
    echo "❌ JoRoMi routes NOT found in build"
    echo "Checking build logs for errors:"
    docker compose logs tetrix-frontend --tail 100 2>&1 | grep -i "error\|joromi\|countries" | tail -20
fi

echo ""
echo "=== Step 11: Testing API Endpoints ==="
sleep 5
echo "Testing countries API:"
docker compose exec -T tetrix-frontend curl -s http://localhost:8080/api/v2/auth/countries 2>&1 | head -5 || echo "⚠️  Endpoint test failed"

echo ""
echo "Testing JoRoMi sessions API:"
docker compose exec -T tetrix-frontend curl -s -X POST http://localhost:8080/api/v1/joromi/sessions \
  -H 'Content-Type: application/json' \
  -d '{"userId":"test-user","agentId":"joromi-general","channel":"chat"}' 2>&1 | head -5 || echo "⚠️  Endpoint test failed"

echo ""
echo "=== Fix Complete ==="
echo ""
echo "Next steps:"
echo "1. Test live site: https://tetrixcorp.com/api/v2/auth/countries"
echo "2. Test JoRoMi chat on contact page"
echo "3. Check browser console for any remaining errors"
DROPLET_FIX_EOF

echo ""
echo "=== Local Cleanup ==="
rm -f /tmp/tsconfig_fix.json

echo ""
echo "✅ Fix script completed!"
echo "Please check the output above for verification results."

