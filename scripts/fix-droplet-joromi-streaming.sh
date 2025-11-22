#!/bin/bash

# Fix JoRoMi streaming on droplet: Copy fixed files and rebuild

set -e

DROPLET_IP="207.154.193.187"
DROPLET_KEY="$HOME/.ssh/tetrix_droplet_key"
DROPLET_USER="root"
LOCAL_REPO="/home/diegomartinez/Desktop/tetrix"

echo "=== Fixing JoRoMi Streaming on Droplet ==="
echo ""

cd "$LOCAL_REPO"

echo "=== Step 1: Copying fixed stream.ts file to droplet ==="
scp -i "$DROPLET_KEY" -o StrictHostKeyChecking=no \
  "src/pages/api/v1/joromi/sessions/[sessionId]/messages/stream.ts" \
  "$DROPLET_USER@$DROPLET_IP:/opt/tetrix/src/pages/api/v1/joromi/sessions/[sessionId]/messages/stream.ts"

echo "✅ Copied messages/stream.ts"
echo ""

echo "=== Step 2: Rebuilding frontend container ==="
ssh -i "$DROPLET_KEY" -o StrictHostKeyChecking=no -o LogLevel=ERROR "$DROPLET_USER@$DROPLET_IP" << 'REBUILD'
cd /opt/tetrix

echo "Building frontend container..."
docker compose build --no-cache tetrix-frontend

echo ""
echo "Restarting container..."
docker compose up -d --force-recreate tetrix-frontend

echo ""
echo "Waiting for container to be healthy..."
sleep 10
docker compose ps tetrix-frontend
REBUILD

echo ""
echo "=== Step 3: Testing stream endpoint ==="
ssh -i "$DROPLET_KEY" -o StrictHostKeyChecking=no -o LogLevel=ERROR "$DROPLET_USER@$DROPLET_IP" << 'TEST'
cd /opt/tetrix

echo "Creating test session..."
SESSION_RESPONSE=$(docker compose exec -T tetrix-frontend curl -s -X POST http://localhost:8080/api/v1/joromi/sessions \
  -H 'Content-Type: application/json' \
  -d '{"userId":"test","agentId":"joromi-general","channel":"chat"}' 2>&1)

SESSION_ID=$(echo "$SESSION_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$SESSION_ID" ]; then
    echo "✅ Session created: $SESSION_ID"
    echo ""
    echo "Testing stream endpoint (5 second timeout)..."
    timeout 5 docker compose exec -T tetrix-frontend curl -s -X POST "http://localhost:8080/api/v1/joromi/sessions/$SESSION_ID/stream" \
      -H 'Content-Type: application/json' \
      -d '{"message":"test hello","agentId":"joromi-general"}' 2>&1 | head -10
    
    echo ""
    echo "Testing through nginx..."
    timeout 5 curl -s -X POST "https://tetrixcorp.com/api/v1/joromi/sessions/$SESSION_ID/stream" \
      -H 'Content-Type: application/json' \
      -d '{"message":"test hello","agentId":"joromi-general"}' 2>&1 | head -10
else
    echo "❌ Could not create session"
    echo "Response: $SESSION_RESPONSE" | head -5
fi
TEST

echo ""
echo "✅ Fix complete!"

