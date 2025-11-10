#!/bin/bash

# Script to sync the API proxy fix to droplet

DROPLET_IP="207.154.193.187"
DROPLET_USER="root"
DROPLET_PATH="/root/tetrix"

# Try to connect to droplet with SSH key
SSH_KEY="${HOME}/.ssh/tetrix_droplet_key"
if [ -f "$SSH_KEY" ]; then
    SSH_CMD="ssh -i $SSH_KEY"
    SCP_CMD="scp -i $SSH_KEY"
elif [ -f "${SSH_KEY}.pem" ]; then
    SSH_CMD="ssh -i ${SSH_KEY}.pem"
    SCP_CMD="scp -i ${SSH_KEY}.pem"
else
    SSH_CMD="ssh"
    SCP_CMD="scp"
fi

echo "=========================================="
echo "SYNCING API PROXY FIX TO DROPLET"
echo "=========================================="
echo ""

# Copy the updated API proxy file
echo "=== Copying updated API proxy file ==="
$SCP_CMD src/pages/api/\[...path\].astro ${DROPLET_USER}@${DROPLET_IP}:${DROPLET_PATH}/src/pages/api/\[...path\].astro

# Copy the updated docker-compose.yml
echo "=== Copying updated docker-compose.yml ==="
$SCP_CMD docker-compose.yml ${DROPLET_USER}@${DROPLET_IP}:${DROPLET_PATH}/docker-compose.yml

echo ""

# Rebuild frontend container
echo "=== Rebuilding Frontend Container ==="
$SSH_CMD ${DROPLET_USER}@${DROPLET_IP} << 'EOF'
cd /root/tetrix

echo "Stopping frontend container..."
docker-compose stop tetrix-frontend || docker compose stop tetrix-frontend

echo "Rebuilding frontend container..."
docker-compose build --no-cache tetrix-frontend || docker compose build --no-cache tetrix-frontend

echo "Starting frontend container..."
docker-compose up -d tetrix-frontend || docker compose up -d tetrix-frontend

echo "Waiting for frontend to be healthy..."
sleep 10

echo "Checking frontend status..."
docker-compose ps tetrix-frontend || docker compose ps tetrix-frontend
EOF

echo ""

echo "=========================================="
echo "✅ Sync complete! Frontend should now proxy to backend correctly"
echo "=========================================="








