#!/bin/bash

# Test JoRoMi streaming with debug logging

set -e

DROPLET_IP="207.154.193.187"
DROPLET_KEY="$HOME/.ssh/tetrix_droplet_key"
DROPLET_USER="root"
LOCAL_REPO="/home/diegomartinez/Desktop/tetrix"

echo "=== Testing JoRoMi Streaming with Debug Logs ==="
echo ""

cd "$LOCAL_REPO"

echo "=== Step 1: Copying updated files to droplet ==="
scp -i "$DROPLET_KEY" -o StrictHostKeyChecking=no \
  "src/pages/api/v1/joromi/sessions.ts" \
  "$DROPLET_USER@$DROPLET_IP:/opt/tetrix/src/pages/api/v1/joromi/sessions.ts"

scp -i "$DROPLET_KEY" -o StrictHostKeyChecking=no \
  "src/pages/api/v1/joromi/sessions/[sessionId]/stream.ts" \
  "$DROPLET_USER@$DROPLET_IP:/opt/tetrix/src/pages/api/v1/joromi/sessions/[sessionId]/stream.ts"

echo "✅ Files copied"
echo ""

echo "=== Step 2: Rebuilding frontend container ==="
ssh -i "$DROPLET_KEY" -o StrictHostKeyChecking=no -o LogLevel=ERROR "$DROPLET_USER@$DROPLET_IP" << 'REBUILD'
cd /opt/tetrix

echo "Building frontend container..."
docker compose build --no-cache tetrix-frontend 2>&1 | tail -20

echo ""
echo "Restarting container..."
docker compose up -d --force-recreate tetrix-frontend

echo ""
echo "Waiting for container to be healthy..."
sleep 15
docker compose ps tetrix-frontend
REBUILD

echo ""
echo "=== Step 3: Testing with debug logs ==="
ssh -i "$DROPLET_KEY" -o StrictHostKeyChecking=no -o LogLevel=ERROR "$DROPLET_USER@$DROPLET_IP" << 'TEST'
cd /opt/tetrix

echo "Creating test session..."
SESSION_RESPONSE=$(docker compose exec -T tetrix-frontend curl -s -X POST http://localhost:8080/api/v1/joromi/sessions \
  -H 'Content-Type: application/json' \
  -d '{"userId":"test-debug","agentId":"joromi-general","channel":"chat"}' 2>&1)

echo "Session creation response:"
echo "$SESSION_RESPONSE" | head -5
echo ""

SESSION_ID=$(echo "$SESSION_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$SESSION_ID" ]; then
    echo "✅ Session created: $SESSION_ID"
    echo ""
    echo "Checking container logs for session creation..."
    docker compose logs tetrix-frontend --tail 20 | grep -E "\[SESSIONS\]|session" | tail -5
    echo ""
    echo "Testing stream endpoint (5s timeout)..."
    timeout 5 docker compose exec -T tetrix-frontend curl -s -X POST "http://localhost:8080/api/v1/joromi/sessions/$SESSION_ID/stream" \
      -H 'Content-Type: application/json' \
      -d '{"message":"hello test","agentId":"joromi-general"}' 2>&1 | head -10
    
    echo ""
    echo "Checking container logs for stream attempt..."
    docker compose logs tetrix-frontend --tail 30 | grep -E "\[STREAM\]|session" | tail -10
else
    echo "❌ Could not create session"
    echo "Response: $SESSION_RESPONSE" | head -10
fi
TEST

echo ""
echo "✅ Debug test complete!"
echo ""
echo "Review the logs above to see:"
echo "1. If sessionId is being extracted correctly"
echo "2. If sessions are being stored"
echo "3. If storage is shared between endpoints"

