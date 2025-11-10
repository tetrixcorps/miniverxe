#!/bin/bash

# Script to sync OTP fix to droplet and rebuild frontend container

DROPLET_IP="207.154.193.187"
DROPLET_USER="root"
DROPLET_PATH="/opt/tetrix"
DROPLET_BRANCH="droplet-deployment"

# Try to connect to droplet with SSH key
SSH_KEY="${HOME}/.ssh/tetrix_droplet_key"
if [ -f "$SSH_KEY" ]; then
    SSH_CMD="ssh -i $SSH_KEY"
elif [ -f "${SSH_KEY}.pem" ]; then
    SSH_CMD="ssh -i ${SSH_KEY}.pem"
else
    SSH_CMD="ssh"
fi

echo "🔄 Syncing OTP Fix to Droplet"
echo "=========================================="
echo ""

# Step 1: Check current git status on droplet
echo "📋 Step 1: Checking droplet git status..."
echo ""
$SSH_CMD ${DROPLET_USER}@${DROPLET_IP} "cd ${DROPLET_PATH} && git status --short | head -10"
echo ""

# Step 2: Check current branch and pull latest changes
echo "📥 Step 2: Checking branch and pulling latest changes..."
echo ""
CURRENT_BRANCH=$($SSH_CMD ${DROPLET_USER}@${DROPLET_IP} "cd ${DROPLET_PATH} && git branch --show-current 2>/dev/null || echo 'unknown'")
echo "Current branch: $CURRENT_BRANCH"
echo "Target branch: $DROPLET_BRANCH"
echo ""

# Switch to correct branch if needed
if [ "$CURRENT_BRANCH" != "$DROPLET_BRANCH" ]; then
  echo "🔄 Switching to $DROPLET_BRANCH branch..."
  $SSH_CMD ${DROPLET_USER}@${DROPLET_IP} "cd ${DROPLET_PATH} && git checkout $DROPLET_BRANCH 2>&1"
  echo ""
fi

echo "📥 Pulling latest changes..."
$SSH_CMD ${DROPLET_USER}@${DROPLET_IP} "cd ${DROPLET_PATH} && git pull origin $DROPLET_BRANCH 2>&1"
echo ""

# Step 3: Verify the fixes are present
echo "✅ Step 3: Verifying fixes are present..."
echo ""
FIXES_PRESENT=$($SSH_CMD ${DROPLET_USER}@${DROPLET_IP} "cd ${DROPLET_PATH} && grep -q '📥.*RAW response text\|🔍.*VerificationId check\|if (result.success)' src/components/auth/UnifiedAuthModal.astro 2>/dev/null && echo 'YES' || echo 'NO'")
echo "Fixes present: $FIXES_PRESENT"
echo ""

if [ "$FIXES_PRESENT" = "NO" ]; then
  echo "⚠️  WARNING: Fixes not found in droplet code!"
  echo "   This might mean:"
  echo "   1. Changes haven't been committed/pushed to remote"
  echo "   2. Droplet is on a different branch"
  echo ""
  echo "   Checking current branch..."
  $SSH_CMD ${DROPLET_USER}@${DROPLET_IP} "cd ${DROPLET_PATH} && git branch --show-current"
  echo ""
  echo "   Checking if files exist..."
  $SSH_CMD ${DROPLET_USER}@${DROPLET_IP} "cd ${DROPLET_PATH} && ls -la src/components/auth/UnifiedAuthModal.astro 2>/dev/null || echo 'File not found'"
  echo ""
  echo "❌ Cannot proceed - fixes not found. Please commit and push changes first."
  exit 1
fi

# Step 4: Rebuild frontend container
echo "🔨 Step 4: Rebuilding frontend container..."
echo ""
echo "This will take a few minutes..."
echo ""

$SSH_CMD ${DROPLET_USER}@${DROPLET_IP} "cd ${DROPLET_PATH} && docker-compose build --no-cache tetrix-frontend 2>&1 | tail -20"
echo ""

# Step 5: Restart frontend container
echo "🔄 Step 5: Restarting frontend container..."
echo ""
$SSH_CMD ${DROPLET_USER}@${DROPLET_IP} "cd ${DROPLET_PATH} && docker-compose restart tetrix-frontend 2>&1"
echo ""

# Step 6: Wait for container to be healthy
echo "⏳ Step 6: Waiting for container to be healthy..."
echo ""
sleep 5

# Check container status
echo "📊 Container Status:"
$SSH_CMD ${DROPLET_USER}@${DROPLET_IP} "docker ps | grep frontend"
echo ""

# Step 7: Test the API again
echo "🧪 Step 7: Testing API after rebuild..."
echo ""
RESPONSE=$(curl -s -X POST "https://tetrixcorp.com/api/v2/2fa/initiate" \
  -H 'Content-Type: application/json' \
  -d '{
    "phoneNumber": "+15042749808",
    "method": "sms",
    "userAgent": "Test Script",
    "ipAddress": "127.0.0.1",
    "sessionId": "test_session_'$(date +%s)'"
  }')

if echo "$RESPONSE" | grep -q '"verificationId"'; then
  echo "✅ API still working after rebuild"
else
  echo "❌ API issue after rebuild"
fi
echo ""

echo "=========================================="
echo "✅ SYNC COMPLETE"
echo "=========================================="
echo ""
echo "📋 Next steps:"
echo "   1. Wait 1-2 minutes for container to fully start"
echo "   2. Test OTP flow on https://tetrixcorp.com"
echo "   3. Check browser console for new logs (📥 and 🔍 emojis)"
echo "   4. Clear browser cache if needed"
echo ""

