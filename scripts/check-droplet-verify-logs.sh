#!/bin/bash

# Script to check backend logs for OTP verification errors

DROPLET_IP="207.154.193.187"
DROPLET_USER="root"

# Try to connect to droplet with SSH key
SSH_KEY="${HOME}/.ssh/tetrix_droplet_key"
if [ -f "$SSH_KEY" ]; then
    SSH_CMD="ssh -i $SSH_KEY"
elif [ -f "${SSH_KEY}.pem" ]; then
    SSH_CMD="ssh -i ${SSH_KEY}.pem"
else
    SSH_CMD="ssh"
fi

echo "=========================================="
echo "CHECKING DROPLET BACKEND LOGS FOR VERIFY ERRORS"
echo "=========================================="
echo ""

# Get backend container ID
echo "=== Backend Container Status ==="
CONTAINER_ID=$($SSH_CMD ${DROPLET_USER}@${DROPLET_IP} "docker ps -q --filter 'name=tetrix-backend' | head -1")
echo "Container ID: $CONTAINER_ID"
echo ""

# Get recent logs
echo "=== Recent Backend Logs (last 100 lines) ==="
$SSH_CMD ${DROPLET_USER}@${DROPLET_IP} "docker logs --tail 100 $CONTAINER_ID 2>/dev/null"
echo ""

# Search for verify-related errors
echo "=== Searching for Verify/2FA Related Logs ==="
$SSH_CMD ${DROPLET_USER}@${DROPLET_IP} "docker logs --tail 200 $CONTAINER_ID 2>/dev/null | grep -iE 'verify|2fa|otp|initiate|code|error|Error|404|500|POST.*verify|POST.*2fa' | tail -50"
echo ""

# Check for route registration
echo "=== Checking if verify route exists in code ==="
$SSH_CMD ${DROPLET_USER}@${DROPLET_IP} "cd /root/tetrix && grep -n 'verify\|/api/v2/2fa' backend/src/routes/enterprise2FA.ts | head -20"
echo ""

# Check server route mounting
echo "=== Checking server route mounting ==="
$SSH_CMD ${DROPLET_USER}@${DROPLET_IP} "cd /root/tetrix && grep -A 2 'Enterprise 2FA routes' backend/src/server-with-db.ts"
echo ""

echo "=========================================="

