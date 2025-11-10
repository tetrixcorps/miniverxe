#!/bin/bash

# Script to test OTP API on droplet and check if it has the same issue

DROPLET_IP="207.154.193.187"
DROPLET_USER="root"
DROPLET_PATH="/opt/tetrix"
DROPLET_URL="https://tetrixcorp.com"

# Try to connect to droplet with SSH key
SSH_KEY="${HOME}/.ssh/tetrix_droplet_key"
if [ -f "$SSH_KEY" ]; then
    SSH_CMD="ssh -i $SSH_KEY"
elif [ -f "${SSH_KEY}.pem" ]; then
    SSH_CMD="ssh -i ${SSH_KEY}.pem"
else
    SSH_CMD="ssh"
fi

echo "🧪 Testing OTP API on Droplet"
echo "=========================================="
echo ""

# Test 1: Test the API endpoint directly
echo "📡 Test 1: Testing API endpoint on droplet..."
echo ""
RESPONSE=$(curl -s -X POST "${DROPLET_URL}/api/v2/2fa/initiate" \
  -H 'Content-Type: application/json' \
  -d '{
    "phoneNumber": "+15042749808",
    "method": "sms",
    "userAgent": "Test Script",
    "ipAddress": "127.0.0.1",
    "sessionId": "test_session_'$(date +%s)'"
  }')

echo "📥 API Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Check if verificationId is present
if echo "$RESPONSE" | grep -q '"verificationId"'; then
  VERIFICATION_ID=$(echo "$RESPONSE" | grep -o '"verificationId":"[^"]*"' | cut -d'"' -f4)
  echo "✅ SUCCESS: verificationId found in droplet API response!"
  echo "   verificationId: $VERIFICATION_ID"
  echo ""
else
  echo "❌ ERROR: verificationId NOT found in droplet API response!"
  echo ""
fi

# Test 2: Check if the code fixes are on the droplet
echo "📋 Test 2: Checking if code fixes are on droplet..."
echo ""

# Check if UnifiedAuthModal.astro has the fixes
echo "=== Checking UnifiedAuthModal.astro for fixes ==="
$SSH_CMD ${DROPLET_USER}@${DROPLET_IP} "cd ${DROPLET_PATH} && grep -n '📥.*RAW response text\|🔍.*VerificationId check\|if (result.success)' src/components/auth/UnifiedAuthModal.astro 2>/dev/null | head -10 || echo 'File not found or fixes not present'"
echo ""

# Check if initiate.ts has the logging
echo "=== Checking initiate.ts for logging ==="
$SSH_CMD ${DROPLET_USER}@${DROPLET_IP} "cd ${DROPLET_PATH} && grep -n '📤.*Response body being sent\|Preparing response data' src/pages/api/v2/2fa/initiate.ts 2>/dev/null | head -10 || echo 'File not found or logging not present'"
echo ""

# Test 3: Check frontend container status
echo "📦 Test 3: Checking frontend container status..."
echo ""
$SSH_CMD ${DROPLET_USER}@${DROPLET_IP} "docker ps | grep -E 'frontend|astro' | head -3"
echo ""

# Test 4: Check when frontend was last rebuilt
echo "📅 Test 4: Checking frontend container build time..."
echo ""
$SSH_CMD ${DROPLET_USER}@${DROPLET_IP} "docker inspect \$(docker ps -q --filter 'name=frontend' | head -1) 2>/dev/null | grep -E 'Created|StartedAt' | head -2 || echo 'Frontend container not found'"
echo ""

# Test 5: Compare code versions
echo "📊 Test 5: Comparing code versions..."
echo ""
echo "=== Local code (last modified) ==="
stat -c "%y" src/components/auth/UnifiedAuthModal.astro 2>/dev/null || stat -f "%Sm" src/components/auth/UnifiedAuthModal.astro 2>/dev/null || echo "Cannot determine"
echo ""

echo "=== Droplet code (last modified) ==="
$SSH_CMD ${DROPLET_USER}@${DROPLET_IP} "stat -c '%y' ${DROPLET_PATH}/src/components/auth/UnifiedAuthModal.astro 2>/dev/null || echo 'File not found'"
echo ""

# Summary
echo "=========================================="
echo "📊 SUMMARY"
echo "=========================================="
echo ""

if echo "$RESPONSE" | grep -q '"verificationId"'; then
  echo "✅ Droplet API: Working correctly (verificationId present)"
else
  echo "❌ Droplet API: Issue detected (verificationId missing)"
fi

echo ""
echo "🔧 Next Steps:"
echo "   1. If droplet API works but frontend doesn't: Rebuild frontend container"
echo "   2. If droplet code is outdated: Pull latest changes and rebuild"
echo "   3. If both work: Issue is browser cache on local dev"
echo ""

