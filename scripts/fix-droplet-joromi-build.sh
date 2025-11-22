#!/bin/bash

# Script to fix JoRoMi API routes not being included in build output on droplet

set -e

DROPLET_IP="207.154.193.187"
DROPLET_KEY="~/.ssh/tetrix_droplet_key"
DROPLET_PATH="/opt/tetrix"
LOCAL_PATH="/home/diegomartinez/Desktop/tetrix"

echo "🔧 Fixing JoRoMi API routes build issue on droplet..."
echo ""

# Function to run command on droplet
run_on_droplet() {
    ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
        root@$DROPLET_IP "cd $DROPLET_PATH && $1"
}

# Function to copy file to droplet
copy_to_droplet() {
    local local_file=$1
    local remote_file=$2
    echo "📋 Copying $local_file to $remote_file..."
    scp -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
        "$LOCAL_PATH/$local_file" \
        "root@$DROPLET_IP:$DROPLET_PATH/$remote_file"
}

echo "1️⃣ Verifying source files exist on droplet..."
run_on_droplet "ls -la src/pages/api/v1/joromi/ 2>&1 || echo 'Directory not found'"
echo ""

echo "2️⃣ Checking for JoRoMi API route files..."
run_on_droplet "find src/pages/api/v1/joromi -type f 2>/dev/null | head -10"
echo ""

echo "3️⃣ Copying all JoRoMi API route files..."
# Copy storage file
copy_to_droplet "src/pages/api/v1/joromi/storage.ts" "src/pages/api/v1/joromi/storage.ts"

# Copy sessions endpoint
copy_to_droplet "src/pages/api/v1/joromi/sessions.ts" "src/pages/api/v1/joromi/sessions.ts"

# Copy stream endpoint
copy_to_droplet "src/pages/api/v1/joromi/sessions/[sessionId]/stream.ts" "src/pages/api/v1/joromi/sessions/[sessionId]/stream.ts"

# Copy messages stream endpoint
copy_to_droplet "src/pages/api/v1/joromi/sessions/[sessionId]/messages/stream.ts" "src/pages/api/v1/joromi/sessions/[sessionId]/messages/stream.ts"

# Copy contact page
copy_to_droplet "src/pages/contact.astro" "src/pages/contact.astro"

echo ""
echo "4️⃣ Ensuring tsconfig.json includes API routes..."
copy_to_droplet "tsconfig.json" "tsconfig.json"

echo ""
echo "5️⃣ Cleaning build artifacts on droplet..."
run_on_droplet "rm -rf dist .astro node_modules/.vite 2>/dev/null || true"

echo ""
echo "6️⃣ Cleaning pnpm cache..."
run_on_droplet "pnpm store prune 2>/dev/null || true"

echo ""
echo "7️⃣ Rebuilding frontend container with --no-cache..."
run_on_droplet "docker compose build --no-cache tetrix-frontend 2>&1 | tail -50"

echo ""
echo "8️⃣ Restarting frontend container..."
run_on_droplet "docker compose up -d --force-recreate tetrix-frontend"

echo ""
echo "9️⃣ Waiting for container to be ready..."
sleep 10

echo ""
echo "🔟 Verifying JoRoMi API routes in build output..."
run_on_droplet "docker compose exec -T tetrix-frontend find /app/dist/pages/api/v1/joromi -type f 2>/dev/null | head -20 || echo 'Routes not found in build output'"

echo ""
echo "1️⃣1️⃣ Checking build output structure..."
run_on_droplet "docker compose exec -T tetrix-frontend ls -la /app/dist/pages/api/v1/ 2>/dev/null || echo 'API v1 directory not found'"

echo ""
echo "✅ Fix complete! Please test the JoRoMi chat on the contact page."
echo ""
echo "If routes are still missing, check build logs:"
echo "  ssh -i $DROPLET_KEY root@$DROPLET_IP 'cd $DROPLET_PATH && docker compose logs tetrix-frontend | tail -100'"

