#!/bin/bash

# Fix JoRoMi streaming endpoint routing in nginx

set -e

DROPLET_IP="207.154.193.187"
DROPLET_KEY="$HOME/.ssh/tetrix_droplet_key"
DROPLET_USER="root"

echo "=== Fixing JoRoMi Streaming Endpoint ==="
echo ""

ssh -i "$DROPLET_KEY" -o StrictHostKeyChecking=no -o LogLevel=ERROR "$DROPLET_USER@$DROPLET_IP" << 'FIX_STREAMING'
set -e

NGINX_CONFIG="/etc/nginx/sites-available/tetrixcorp.com"

echo "=== Step 1: Backup nginx config ==="
cp "$NGINX_CONFIG" "${NGINX_CONFIG}.backup.streaming.$(date +%Y%m%d_%H%M%S)"
echo "✅ Backup created"
echo ""

echo "=== Step 2: Checking current /api location block ==="
grep -A 15 "location /api" "$NGINX_CONFIG" | head -20
echo ""

echo "=== Step 3: Verifying /api location is in HTTPS server block ==="
# Check if /api is inside the HTTPS server block (443)
if awk '/listen 443/,/^}/' "$NGINX_CONFIG" | grep -q "location /api"; then
    echo "✅ /api location block is in HTTPS server block"
else
    echo "❌ /api location block is NOT in HTTPS server block"
    echo "This needs to be fixed!"
fi
echo ""

echo "=== Step 4: Testing container endpoint directly ==="
cd /opt/tetrix

# Create a test session
echo "Creating test session..."
SESSION_RESPONSE=$(docker compose exec -T tetrix-frontend curl -s -X POST http://localhost:8080/api/v1/joromi/sessions \
  -H 'Content-Type: application/json' \
  -d '{"userId":"test","agentId":"joromi-general","channel":"chat"}' 2>&1)

SESSION_ID=$(echo "$SESSION_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$SESSION_ID" ]; then
    echo "⚠️  Could not create test session"
    echo "Response: $SESSION_RESPONSE" | head -5
else
    echo "✅ Session created: $SESSION_ID"
    echo ""
    echo "Testing stream endpoint..."
    STREAM_RESPONSE=$(docker compose exec -T tetrix-frontend timeout 3 curl -s -X POST "http://localhost:8080/api/v1/joromi/sessions/$SESSION_ID/stream" \
      -H 'Content-Type: application/json' \
      -d '{"message":"test","agentId":"joromi-general"}' 2>&1 | head -3)
    
    if echo "$STREAM_RESPONSE" | grep -qE "(data:|event:|token)"; then
        echo "✅ Stream endpoint works in container!"
        echo "Response preview:"
        echo "$STREAM_RESPONSE"
    else
        echo "⚠️  Stream endpoint may have issues"
        echo "Response: $STREAM_RESPONSE"
    fi
fi
echo ""

echo "=== Step 5: Testing through nginx ==="
# Test GET first (simpler)
NGINX_TEST=$(curl -s -I "https://tetrixcorp.com/api/v2/auth/countries" 2>&1 | head -1)
if echo "$NGINX_TEST" | grep -q "200\|404"; then
    echo "✅ Nginx is routing /api requests"
    if echo "$NGINX_TEST" | grep -q "404"; then
        echo "⚠️  But endpoint returns 404 (may need rebuild)"
    fi
else
    echo "❌ Nginx routing issue detected"
fi
echo ""

echo "=== Step 6: Checking nginx error logs for streaming ==="
echo "Recent nginx errors related to /api:"
tail -20 /var/log/nginx/error.log | grep -i "api\|joromi\|stream" || echo "No recent errors found"
echo ""

echo "=== Summary ==="
echo "If container endpoint works but nginx doesn't:"
echo "1. Ensure /api location block is INSIDE HTTPS server block"
echo "2. Ensure it comes BEFORE location /"
echo "3. Ensure proxy_pass is http://localhost:8082 (no trailing slash)"
echo "4. Rebuild frontend container if routes are missing"
FIX_STREAMING

echo ""
echo "✅ Streaming diagnostic complete!"

