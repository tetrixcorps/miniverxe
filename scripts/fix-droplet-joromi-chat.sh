#!/bin/bash

# Script to fix JoRoMi chat on droplet by syncing contact page and API routes
# This ensures the droplet has the same implementation as the local dev server

set -e

DROPLET_IP="207.154.193.187"
DROPLET_KEY="~/.ssh/tetrix_droplet_key"
DROPLET_PATH="/opt/tetrix"
LOCAL_PATH="/home/diegomartinez/Desktop/tetrix"

echo "🔧 Fixing JoRoMi chat on droplet..."
echo ""

# Function to copy file to droplet
copy_to_droplet() {
    local local_file=$1
    local remote_file=$2
    echo "📋 Copying $local_file to $remote_file..."
    scp -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
        "$LOCAL_PATH/$local_file" \
        "root@$DROPLET_IP:$DROPLET_PATH/$remote_file"
}

# Copy contact page
echo "1️⃣ Copying contact.astro..."
copy_to_droplet "src/pages/contact.astro" "src/pages/contact.astro"

# Copy JoRoMi API routes
echo ""
echo "2️⃣ Copying JoRoMi API routes..."

# Sessions endpoint
copy_to_droplet "src/pages/api/v1/joromi/sessions.ts" "src/pages/api/v1/joromi/sessions.ts"

# Storage file
copy_to_droplet "src/pages/api/v1/joromi/storage.ts" "src/pages/api/v1/joromi/storage.ts"

# Stream endpoint
copy_to_droplet "src/pages/api/v1/joromi/sessions/[sessionId]/stream.ts" "src/pages/api/v1/joromi/sessions/[sessionId]/stream.ts"

# Messages stream endpoint
copy_to_droplet "src/pages/api/v1/joromi/sessions/[sessionId]/messages/stream.ts" "src/pages/api/v1/joromi/sessions/[sessionId]/messages/stream.ts"

echo ""
echo "3️⃣ Rebuilding frontend container on droplet..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "cd $DROPLET_PATH && docker compose build --no-cache tetrix-frontend 2>&1 | tail -30"

echo ""
echo "4️⃣ Restarting frontend container..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "cd $DROPLET_PATH && docker compose up -d --force-recreate tetrix-frontend"

echo ""
echo "5️⃣ Verifying API routes in build output..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "cd $DROPLET_PATH && docker compose exec tetrix-frontend ls -la /app/dist/pages/api/v1/joromi/ 2>&1 || echo 'Container not ready yet'"

echo ""
echo "✅ Fix complete! Please test the JoRoMi chat on the contact page."
echo ""
echo "To check logs:"
echo "  ssh -i $DROPLET_KEY root@$DROPLET_IP 'cd $DROPLET_PATH && docker compose logs -f tetrix-frontend'"

