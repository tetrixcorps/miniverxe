#!/bin/bash

# Deploy JoRoMi sessions endpoint fix with CORS headers

set -e

DROPLET_IP="207.154.193.187"
DROPLET_KEY="~/.ssh/tetrix_droplet_key"
DROPLET_PATH="/opt/tetrix"
LOCAL_PATH="/home/diegomartinez/Desktop/tetrix"

echo "🔧 Deploying JoRoMi sessions endpoint fix..."
echo ""

echo "1️⃣ Copying updated sessions.ts with CORS headers..."
scp -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    "$LOCAL_PATH/src/pages/api/v1/joromi/sessions.ts" \
    "root@$DROPLET_IP:$DROPLET_PATH/src/pages/api/v1/joromi/sessions.ts"

echo ""
echo "2️⃣ Copying updated catch-all route..."
scp -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    "$LOCAL_PATH/src/pages/api/[...path].astro" \
    "root@$DROPLET_IP:$DROPLET_PATH/src/pages/api/[...path].astro"

echo ""
echo "3️⃣ Rebuilding frontend container..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "cd $DROPLET_PATH && docker compose build --no-cache tetrix-frontend 2>&1 | tail -40"

echo ""
echo "4️⃣ Restarting frontend container..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "cd $DROPLET_PATH && docker compose up -d --force-recreate tetrix-frontend"

echo ""
echo "5️⃣ Waiting for container to be ready..."
sleep 15

echo ""
echo "6️⃣ Testing sessions endpoint..."
RESPONSE=$(curl -s -X POST https://tetrixcorp.com/api/v1/joromi/sessions \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user","agentId":"joromi-general","channel":"chat"}' 2>&1)

echo "Response: $RESPONSE"
echo ""

if echo "$RESPONSE" | grep -q '"success":true'; then
  echo "✅ Sessions endpoint is working!"
else
  echo "⚠️ Sessions endpoint may still have issues. Check the response above."
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Test the JoRoMi chat on: https://tetrixcorp.com/contact"

