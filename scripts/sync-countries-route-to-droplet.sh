#!/bin/bash

# Script to sync the countries route fix to droplet

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
echo "SYNCING COUNTRIES ROUTE TO DROPLET"
echo "=========================================="
echo ""

# Copy the updated backend server file
echo "=== Copying updated backend server file ==="
$SCP_CMD backend/src/server-with-db.ts ${DROPLET_USER}@${DROPLET_IP}:${DROPLET_PATH}/backend/src/server-with-db.ts

echo ""

# Verify the route was copied
echo "=== Verifying route exists ==="
$SSH_CMD ${DROPLET_USER}@${DROPLET_IP} "cd ${DROPLET_PATH} && grep -A 2 'app.get.*\"/api/v2/auth/countries\"' backend/src/server-with-db.ts | head -5"
echo ""

# Rebuild backend container
echo "=== Rebuilding Backend Container ==="
$SSH_CMD ${DROPLET_USER}@${DROPLET_IP} << 'EOF'
cd /root/tetrix

echo "Stopping backend container..."
docker-compose stop tetrix-backend || docker compose stop tetrix-backend

echo "Rebuilding backend container..."
docker-compose build --no-cache tetrix-backend || docker compose build --no-cache tetrix-backend

echo "Starting backend container..."
docker-compose up -d tetrix-backend || docker compose up -d tetrix-backend

echo "Waiting for backend to be healthy..."
sleep 10

echo "Checking backend status..."
docker-compose ps tetrix-backend || docker compose ps tetrix-backend
EOF

echo ""

echo "=========================================="
echo "✅ Sync complete! Backend should now have /api/v2/auth/countries route"
echo "=========================================="

