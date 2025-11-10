#!/bin/bash

# Rebuild containers to pick up merged changes

set -e

DROPLET_IP="207.154.193.187"
DROPLET_KEY="$HOME/.ssh/tetrix_droplet_key"
DROPLET_USER="root"
LOCAL_REPO="/home/diegomartinez/Desktop/tetrix"

echo "=== Container Rebuild Script ==="
echo ""
echo "This will rebuild containers to pick up the merged changes:"
echo "  - API route fixes"
echo "  - Authentication improvements"
echo "  - tsconfig.json updates"
echo ""

read -p "Rebuild LOCAL containers? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "=== Rebuilding LOCAL frontend container ==="
    cd "$LOCAL_REPO"
    
    echo "Building with --no-cache..."
    docker compose build --no-cache tetrix-frontend
    
    echo ""
    echo "Restarting container..."
    docker compose up -d --force-recreate tetrix-frontend
    
    echo ""
    echo "✅ Local frontend container rebuilt"
    echo "Waiting for container to be healthy..."
    sleep 5
    docker compose ps tetrix-frontend
fi

echo ""
read -p "Rebuild DROPLET containers? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "=== Rebuilding DROPLET frontend container ==="
    
    ssh -i "$DROPLET_KEY" -o StrictHostKeyChecking=no -o LogLevel=ERROR "$DROPLET_USER@$DROPLET_IP" << 'DROPLET_REBUILD'
cd /opt/tetrix

echo "Building with --no-cache..."
docker compose build --no-cache tetrix-frontend

echo ""
echo "Restarting container..."
docker compose up -d --force-recreate tetrix-frontend

echo ""
echo "✅ Droplet frontend container rebuilt"
echo "Waiting for container to be healthy..."
sleep 10
docker compose ps tetrix-frontend

echo ""
echo "Testing API endpoint..."
sleep 5
docker compose exec tetrix-frontend wget -qO- http://localhost:8080/api/v2/auth/countries 2>&1 | head -5
DROPLET_REBUILD
fi

echo ""
echo "=== Rebuild Complete ==="
echo ""
echo "Next steps:"
echo "1. Test local API: curl http://localhost:8082/api/v2/auth/countries"
echo "2. Test droplet API: curl https://tetrixcorp.com/api/v2/auth/countries"
echo "3. Check container logs if issues: docker compose logs tetrix-frontend"

