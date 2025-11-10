#!/bin/bash

# Script to fix missing /api/v2/2fa route on droplet backend

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
echo "FIXING DROPLET 2FA ROUTE"
echo "=========================================="
echo ""

# Check current routes
echo "=== Current Routes (before fix) ==="
$SSH_CMD ${DROPLET_USER}@${DROPLET_IP} "cd ${DROPLET_PATH} && grep -A 1 'Enterprise 2FA routes' backend/src/server-with-db.ts"
echo ""

# Add the missing route
echo "=== Adding missing /api/v2/2fa route ==="
$SSH_CMD ${DROPLET_USER}@${DROPLET_IP} << 'EOF'
cd /root/tetrix

# Check if route already exists
if grep -q 'app.use.*"/api/v2/2fa"' backend/src/server-with-db.ts; then
    echo "✅ Route already exists, skipping..."
else
    # Add the route after the enterprise-2fa route
    sed -i '/app.use.*enterprise-2fa.*enterprise2FARoutes/a app.use("/api/v2/2fa", enterprise2FARoutes);' backend/src/server-with-db.ts
    echo "✅ Route added successfully"
fi
EOF

echo ""

# Verify the fix
echo "=== Updated Routes (after fix) ==="
$SSH_CMD ${DROPLET_USER}@${DROPLET_IP} "cd ${DROPLET_PATH} && grep -A 2 'Enterprise 2FA routes' backend/src/server-with-db.ts"
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

# Check backend logs for errors
echo "=== Checking Backend Logs ==="
$SSH_CMD ${DROPLET_USER}@${DROPLET_IP} "docker logs --tail 20 \$(docker ps -q --filter 'name=tetrix-backend' | head -1) 2>/dev/null | grep -E 'Server running|2fa|error|Error' || echo 'No relevant logs found'"
echo ""

echo "=========================================="
echo "✅ Fix complete! Backend should now have /api/v2/2fa route"
echo "=========================================="

