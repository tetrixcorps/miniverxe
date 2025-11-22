#!/bin/bash

# Script to fix countries API 404 and JoRoMi logo image issues on droplet
# Run this when the droplet is accessible

set -e

DROPLET_IP="207.154.193.187"
DROPLET_KEY="$HOME/.ssh/tetrix_droplet_key"
DROPLET_USER="root"
DROPLET_PATH="/opt/tetrix"

echo "=== Fixing Droplet Issues ==="
echo ""
echo "This script will:"
echo "1. Copy fixed API route files to droplet"
echo "2. Copy JoRoMi logo image to droplet (if corrupted)"
echo "3. Rebuild frontend container with --no-cache"
echo ""

# Check if SSH key exists
if [ ! -f "$DROPLET_KEY" ]; then
    echo "❌ SSH key not found: $DROPLET_KEY"
    exit 1
fi

# Test SSH connection
echo "🔍 Testing SSH connection..."
if ! ssh -i "$DROPLET_KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=5 "$DROPLET_USER@$DROPLET_IP" "echo 'Connection successful'" 2>/dev/null; then
    echo "❌ Cannot connect to droplet. Please check:"
    echo "   - Droplet is running"
    echo "   - IP address is correct: $DROPLET_IP"
    echo "   - SSH key is correct: $DROPLET_KEY"
    exit 1
fi

echo "✅ SSH connection successful"
echo ""

# Step 1: Copy fixed API route files
echo "📦 Step 1: Copying fixed API route files..."
scp -i "$DROPLET_KEY" -o StrictHostKeyChecking=no \
    src/pages/api/[...path].astro \
    "$DROPLET_USER@$DROPLET_IP:$DROPLET_PATH/src/pages/api/"

scp -i "$DROPLET_KEY" -o StrictHostKeyChecking=no \
    src/pages/api/v2/auth/countries.ts \
    "$DROPLET_USER@$DROPLET_IP:$DROPLET_PATH/src/pages/api/v2/auth/"

echo "✅ API route files copied"
echo ""

# Step 2: Copy JoRoMi logo image (backup existing first)
echo "🖼️  Step 2: Copying JoRoMi logo image..."
ssh -i "$DROPLET_KEY" -o StrictHostKeyChecking=no "$DROPLET_USER@$DROPLET_IP" << EOF
    cd $DROPLET_PATH
    # Backup existing image
    if [ -f public/images/joromi-base-logo.jpg ]; then
        cp public/images/joromi-base-logo.jpg public/images/joromi-base-logo.jpg.backup.\$(date +%Y%m%d_%H%M%S)
        echo "✅ Backed up existing image"
    fi
EOF

scp -i "$DROPLET_KEY" -o StrictHostKeyChecking=no \
    public/images/joromi-base-logo.jpg \
    "$DROPLET_USER@$DROPLET_IP:$DROPLET_PATH/public/images/"

echo "✅ JoRoMi logo image copied"
echo ""

# Step 3: Rebuild frontend container
echo "🔨 Step 3: Rebuilding frontend container (this will take a few minutes)..."
ssh -i "$DROPLET_KEY" -o StrictHostKeyChecking=no "$DROPLET_USER@$DROPLET_IP" << EOF
    cd $DROPLET_PATH
    
    echo "Stopping frontend container..."
    docker compose stop tetrix-frontend || true
    
    echo "Rebuilding with --no-cache..."
    docker compose build --no-cache tetrix-frontend 2>&1 | tee /tmp/frontend-build-\$(date +%Y%m%d_%H%M%S).log | tail -50
    
    echo "Starting frontend container..."
    docker compose up -d tetrix-frontend
    
    echo "Waiting for container to be healthy..."
    sleep 15
    
    echo "Checking container status..."
    docker compose ps tetrix-frontend
EOF

echo ""
echo "✅ Frontend container rebuilt"
echo ""

# Step 4: Verify fixes
echo "🔍 Step 4: Verifying fixes..."
ssh -i "$DROPLET_KEY" -o StrictHostKeyChecking=no "$DROPLET_USER@$DROPLET_IP" << EOF
    cd $DROPLET_PATH
    
    echo "Checking if countries route is in build output..."
    docker compose exec -T tetrix-frontend ls -la /app/dist/server/pages/api/v2/auth/countries* 2>&1 || echo "⚠️  Route not found in build (may need to check build logs)"
    
    echo ""
    echo "Testing countries endpoint..."
    docker compose exec -T tetrix-frontend curl -s http://localhost:8080/api/v2/auth/countries 2>&1 | head -5 || echo "⚠️  Endpoint test failed"
    
    echo ""
    echo "Checking image file..."
    docker compose exec -T tetrix-frontend ls -lh /app/dist/client/images/joromi-base-logo.jpg 2>&1 || echo "⚠️  Image not found in build output"
EOF

echo ""
echo "=== Fix Complete ==="
echo ""
echo "Please test the following on the live site:"
echo "1. Visit https://tetrixcorp.com/contact"
echo "2. Check browser console for errors"
echo "3. Verify JoRoMi logo displays correctly"
echo "4. Verify countries API returns data (check Network tab)"
echo "5. Test JoRoMi chat functionality"
echo ""

