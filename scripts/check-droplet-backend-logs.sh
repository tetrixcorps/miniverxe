#!/bin/bash

# Script to check backend logs on droplet for 2FA endpoint errors

DROPLET_IP="207.154.193.187"
DROPLET_USER="root"
DROPLET_PATH="/root/tetrix"

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
echo "CHECKING DROPLET BACKEND LOGS"
echo "=========================================="
echo ""

# Check if backend container is running
echo "=== Backend Container Status ==="
$SSH_CMD ${DROPLET_USER}@${DROPLET_IP} "docker ps | grep backend || docker ps | grep tetrix-backend"
echo ""

# Get recent backend logs
echo "=== Recent Backend Logs (last 50 lines) ==="
$SSH_CMD ${DROPLET_USER}@${DROPLET_IP} "docker logs --tail 50 \$(docker ps -q --filter 'name=backend' --filter 'name=tetrix-backend' | head -1) 2>/dev/null || echo 'Backend container not found'"
echo ""

# Check for 2FA route errors
echo "=== Searching for 2FA Route Errors ==="
$SSH_CMD ${DROPLET_USER}@${DROPLET_IP} "docker logs --tail 100 \$(docker ps -q --filter 'name=backend' --filter 'name=tetrix-backend' | head -1) 2>/dev/null | grep -i '2fa\|initiate\|404\|not found' | tail -20 || echo 'No 2FA errors found'"
echo ""

# Check backend server configuration
echo "=== Backend Server Routes ==="
$SSH_CMD ${DROPLET_USER}@${DROPLET_IP} "cd ${DROPLET_PATH} && grep -n 'api/v2/2fa\|enterprise-2fa' backend/src/server-with-db.ts 2>/dev/null | head -10 || echo 'Could not check routes'"
echo ""

# Check if backend is listening on correct port
echo "=== Backend Port Status ==="
$SSH_CMD ${DROPLET_USER}@${DROPLET_IP} "netstat -tlnp | grep 3001 || ss -tlnp | grep 3001 || echo 'Port 3001 not found'"
echo ""

# Check docker-compose configuration
echo "=== Docker Compose Services ==="
$SSH_CMD ${DROPLET_USER}@${DROPLET_IP} "cd ${DROPLET_PATH} && docker-compose ps 2>/dev/null || docker compose ps 2>/dev/null || echo 'Docker compose not available'"
echo ""

echo "=========================================="

