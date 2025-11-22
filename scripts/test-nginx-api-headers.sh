#!/bin/bash

# Test Nginx API routing with exact headers

set -e

DROPLET_IP="207.154.193.187"
DROPLET_KEY="~/.ssh/tetrix_droplet_key"

echo "🔍 Testing Nginx API routing with exact headers..."
echo ""

echo "1️⃣ Checking if route exists in container build output..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "docker exec tetrix-tetrix-frontend-1 find /app/dist -name '*joromi*sessions*' -type f 2>/dev/null | head -10"

echo ""
echo "2️⃣ Testing with exact Nginx headers (simulating what Nginx sends)..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "curl -v -X GET http://localhost:8082/api/v1/joromi/sessions \
        -H 'Host: tetrixcorp.com' \
        -H 'X-Real-IP: 127.0.0.1' \
        -H 'X-Forwarded-For: 127.0.0.1' \
        -H 'X-Forwarded-Proto: https' \
        -H 'X-Forwarded-Host: tetrixcorp.com' \
        2>&1 | grep -E '^< HTTP|^< |Cannot|success' | head -10"

echo ""
echo "3️⃣ Checking container logs in real-time (make a request now)..."
echo "   (This will wait 5 seconds for you to make a request)"
sleep 5

echo ""
echo "4️⃣ Checking recent container logs..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "docker logs tetrix-tetrix-frontend-1 --since 10s 2>&1 | tail -30"

echo ""
echo "5️⃣ Verifying Nginx is actually using the /api block..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "nginx -T 2>&1 | grep -A 15 'location /api' | head -20"

echo ""
echo "✅ Testing complete!"

