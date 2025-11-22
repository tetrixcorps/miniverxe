#!/bin/bash

# Complete JoRoMi fix: Rebuild and verify

set -e

DROPLET_IP="207.154.193.187"
DROPLET_KEY="/home/diegomartinez/.ssh/tetrix_droplet_key"
DROPLET_PATH="/opt/tetrix"

echo "🔧 Completing JoRoMi fix on droplet..."
echo ""

echo "1️⃣ Verifying JoRoMi API files are in place..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "cd $DROPLET_PATH && find src/pages/api/v1/joromi -type f"
echo ""

echo "2️⃣ Rebuilding frontend container..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "cd $DROPLET_PATH && docker compose build --no-cache tetrix-frontend 2>&1 | tail -50"
echo ""

echo "3️⃣ Restarting frontend container..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "cd $DROPLET_PATH && docker compose up -d --force-recreate tetrix-frontend"
echo ""

echo "4️⃣ Waiting for container to be ready..."
sleep 15

echo "5️⃣ Verifying JoRoMi API routes in build output..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "cd $DROPLET_PATH && docker compose exec -T tetrix-frontend find /app/dist/pages/api/v1/joromi -type f 2>/dev/null || echo 'Checking build output...'"
echo ""

echo "6️⃣ Checking API directory structure..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "cd $DROPLET_PATH && docker compose exec -T tetrix-frontend ls -la /app/dist/pages/api/v1/ 2>/dev/null | head -20 || echo 'Directory not found'"
echo ""

echo "✅ Rebuild complete! Please test the JoRoMi chat on the contact page at https://tetrixcorp.com/contact"
echo ""
echo "If you see errors, check the logs:"
echo "  ssh -i $DROPLET_KEY root@$DROPLET_IP 'cd $DROPLET_PATH && docker compose logs tetrix-frontend | tail -50'"

