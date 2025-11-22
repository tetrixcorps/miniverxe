#!/bin/bash
# Deploy OTP verification fixes to droplet
# Fixes:
# 1. Code length validation mismatch (5 digits instead of 6)
# 2. Better error handling in verify button handler

set -e

DROPLET_IP="207.154.193.187"
SSH_KEY="~/.ssh/tetrix_droplet_key"
DROPLET_PATH="/opt/tetrix"

echo "🔧 Deploying OTP Verification Fixes to Droplet"
echo "================================================"
echo ""

# Step 1: Backup existing files
echo "1️⃣ Backing up existing files..."
ssh -i $SSH_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@$DROPLET_IP "cd $DROPLET_PATH && cp src/pages/api/v2/2fa/verify.ts src/pages/api/v2/2fa/verify.ts.backup.\$(date +%s) && cp src/components/auth/UnifiedAuthModal.astro src/components/auth/UnifiedAuthModal.astro.backup.\$(date +%s) && echo '✅ Backups created'"

# Step 2: Copy fixed files
echo ""
echo "2️⃣ Copying fixed files..."
scp -i $SSH_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null src/pages/api/v2/2fa/verify.ts root@$DROPLET_IP:$DROPLET_PATH/src/pages/api/v2/2fa/verify.ts
scp -i $SSH_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null src/components/auth/UnifiedAuthModal.astro root@$DROPLET_IP:$DROPLET_PATH/src/components/auth/UnifiedAuthModal.astro
echo "✅ Files copied"

# Step 3: Rebuild frontend container
echo ""
echo "3️⃣ Rebuilding frontend container..."
ssh -i $SSH_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@$DROPLET_IP "cd $DROPLET_PATH && docker compose build --no-cache tetrix-frontend && echo '✅ Frontend container rebuilt'"

# Step 4: Restart frontend container
echo ""
echo "4️⃣ Restarting frontend container..."
ssh -i $SSH_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@$DROPLET_IP "cd $DROPLET_PATH && docker compose up -d --force-recreate tetrix-frontend && echo '✅ Frontend container restarted'"

# Step 5: Wait for container to be healthy
echo ""
echo "5️⃣ Waiting for container to be healthy..."
sleep 10
ssh -i $SSH_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@$DROPLET_IP "cd $DROPLET_PATH && docker compose ps tetrix-frontend"

echo ""
echo "✅ OTP Verification Fixes Deployed!"
echo ""
echo "Changes:"
echo "  - Fixed code length validation (5 digits instead of 6)"
echo "  - Added better error handling in verify button handler"
echo "  - Added console logging for debugging"
echo ""
echo "Please test the OTP verification flow on the live site."

