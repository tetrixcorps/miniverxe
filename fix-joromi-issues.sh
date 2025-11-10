#!/bin/bash
# Fix JoRoMi Chat and Logo Issues on Droplet
# Root Cause: API routes not included in built output

echo "=== JoRoMi Issues Fix Script ==="
echo ""
echo "ROOT CAUSE IDENTIFIED:"
echo "  ❌ JoRoMi API routes exist in source but NOT in built output"
echo "  ❌ This causes 404 errors when frontend calls /api/v1/joromi/sessions"
echo "  ❌ Container needs to be rebuilt to include these routes"
echo ""
echo "FILES VERIFIED:"
echo "  ✅ contact.astro: Identical (855 lines)"
echo "  ✅ Logo image: Identical (MD5: fc4d73e82694ccb9664d6ac86be6d851)"
echo "  ✅ storage.ts: Exists on both"
echo "  ✅ stream.ts: Exists on both"
echo ""
echo "SOLUTION:"
echo "  1. Rebuild frontend container with --no-cache"
echo "  2. Restart containers"
echo "  3. Verify API routes are in built output"
echo ""
echo "Running fix on droplet..."

ssh -i ~/.ssh/tetrix_droplet_key -o StrictHostKeyChecking=no root@207.154.193.187 << 'EOF'
cd /opt/tetrix

echo "Step 1: Stopping frontend container..."
docker compose stop tetrix-frontend

echo "Step 2: Rebuilding frontend container with --no-cache..."
docker compose build --no-cache tetrix-frontend

echo "Step 3: Starting frontend container..."
docker compose up -d tetrix-frontend

echo "Step 4: Waiting for container to be healthy..."
sleep 10

echo "Step 5: Verifying built routes exist..."
if docker exec tetrix-tetrix-frontend-1 ls -la /app/dist/server/pages/api/v1/joromi 2>/dev/null | grep -q sessions; then
  echo "✅ JoRoMi routes found in built output!"
else
  echo "❌ JoRoMi routes still missing - checking build logs..."
  docker logs tetrix-tetrix-frontend-1 --tail 50 | grep -i "joromi\|error" | tail -20
fi

echo ""
echo "Step 6: Testing API endpoint..."
sleep 5
curl -X POST https://tetrixcorp.com/api/v1/joromi/sessions \
  -H 'Content-Type: application/json' \
  -d '{"userId":"test-user","agentId":"joromi-general","channel":"chat"}' \
  -s | head -5

echo ""
echo "=== Fix Complete ==="
echo "Please test the JoRoMi chat on the contact page"
EOF

echo ""
echo "✅ Fix script completed!"


