#!/bin/bash

# Fix JoRoMi routes being intercepted by catch-all route

set -e

DROPLET_IP="207.154.193.187"
DROPLET_KEY="~/.ssh/tetrix_droplet_key"
DROPLET_PATH="/opt/tetrix"
LOCAL_PATH="/home/diegomartinez/Desktop/tetrix"

echo "🔧 Fixing JoRoMi catch-all route interception..."
echo ""

echo "1️⃣ Copying updated catch-all route..."
scp -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    "$LOCAL_PATH/src/pages/api/[...path].astro" \
    "root@$DROPLET_IP:$DROPLET_PATH/src/pages/api/[...path].astro"

echo ""
echo "2️⃣ Rebuilding frontend container..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "cd $DROPLET_PATH && docker compose build --no-cache tetrix-frontend 2>&1 | tail -30"

echo ""
echo "3️⃣ Restarting frontend container..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "cd $DROPLET_PATH && docker compose up -d --force-recreate tetrix-frontend"

echo ""
echo "4️⃣ Waiting for container to be ready..."
sleep 10

echo ""
echo "✅ Fix complete! The catch-all route now properly excludes JoRoMi routes."
echo ""
echo "Test the JoRoMi chat on: https://tetrixcorp.com/contact"
echo ""
echo "Or test the API directly:"
echo "  curl -X POST https://tetrixcorp.com/api/v1/joromi/sessions \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"userId\":\"test\",\"agentId\":\"joromi-general\",\"channel\":\"chat\"}'"

