#!/bin/bash

# Fix Nginx API Location Block - Move /api inside server block before location /
# This script automatically fixes the nginx configuration

set -e

DROPLET_IP="207.154.193.187"
DROPLET_KEY="$HOME/.ssh/tetrix_droplet_key"
DROPLET_USER="root"
NGINX_CONFIG="/etc/nginx/sites-available/tetrixcorp.com"

echo "=== Fixing Nginx API Location Block ==="
echo ""

# Test SSH connection
if ! ssh -i "$DROPLET_KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=5 "$DROPLET_USER@$DROPLET_IP" "echo 'Connection successful'" 2>/dev/null; then
    echo "❌ Cannot connect to droplet"
    exit 1
fi

echo "✅ SSH connection successful"
echo ""

# Execute fix on droplet
ssh -i "$DROPLET_KEY" -o StrictHostKeyChecking=no "$DROPLET_USER@$DROPLET_IP" << 'NGINX_FIX_EOF'
set -e

NGINX_CONFIG="/etc/nginx/sites-available/tetrixcorp.com"

echo "=== Step 1: Backing up nginx config ==="
cp "$NGINX_CONFIG" "${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
echo "✅ Backup created"
echo ""

echo "=== Step 2: Reading current config structure ==="
echo "Current location blocks:"
grep -n "^\s*location" "$NGINX_CONFIG" | head -10
echo ""

echo "=== Step 3: Fixing nginx configuration ==="
# Create fixed config
TEMP_FILE=$(mktemp)

# Read config and fix it
awk '
BEGIN { 
    in_server = 0
    in_https_server = 0
    api_added = 0
    skip_api_block = 0
}

# Track when we enter a server block
/^[[:space:]]*server[[:space:]]*\{/ {
    in_server = 1
    if (/443/ || /ssl/ || /tetrixcorp\.com/) {
        in_https_server = 1
    }
}

# Skip /api location blocks that are outside server blocks
/^[[:space:]]*location \/api/ && !in_server {
    skip_api_block = 1
    next
}

# End of /api block outside server
skip_api_block && /^[[:space:]]*\}/ {
    skip_api_block = 0
    next
}

# Skip lines inside /api block outside server
skip_api_block {
    next
}

# When we find location / inside HTTPS server block, add /api before it
/^[[:space:]]*location \// && in_https_server && !api_added {
    # Insert /api location block
    print "        location /api {"
    print "            proxy_pass http://localhost:8082;"
    print "            proxy_http_version 1.1;"
    print "            proxy_set_header Upgrade $http_upgrade;"
    print "            proxy_set_header Connection \"upgrade\";"
    print "            proxy_set_header Host $host;"
    print "            proxy_set_header X-Real-IP $remote_addr;"
    print "            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;"
    print "            proxy_set_header X-Forwarded-Proto $scheme;"
    print "            proxy_cache_bypass $http_upgrade;"
    print "            proxy_read_timeout 300s;"
    print "            proxy_connect_timeout 75s;"
    print "        }"
    print ""
    api_added = 1
}

# Track when we exit a server block
/^[[:space:]]*\}/ && in_server {
    in_server = 0
    in_https_server = 0
}

# Print all other lines
{ print }
' "$NGINX_CONFIG" > "$TEMP_FILE"

# Replace original config
mv "$TEMP_FILE" "$NGINX_CONFIG"
echo "✅ Config updated"
echo ""

echo "=== Step 4: Verifying location block order ==="
echo "Location blocks in order:"
grep -n "^\s*location" "$NGINX_CONFIG" | head -10
echo ""

echo "=== Step 5: Testing nginx configuration ==="
if nginx -t 2>&1; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration has errors!"
    echo "Restoring backup..."
    cp "${NGINX_CONFIG}.backup."* "$NGINX_CONFIG" 2>/dev/null || true
    exit 1
fi
echo ""

echo "=== Step 6: Reloading nginx ==="
systemctl reload nginx
echo "✅ Nginx reloaded"
echo ""

echo "=== Step 7: Testing API endpoints ==="
sleep 2
echo "Testing countries API:"
RESPONSE=$(curl -s https://tetrixcorp.com/api/v2/auth/countries 2>&1)
if echo "$RESPONSE" | grep -q "success"; then
    echo "✅ Countries API works!"
    echo "$RESPONSE" | head -3
else
    echo "⚠️  Countries API still not working"
    echo "Response:"
    echo "$RESPONSE" | head -5
fi
echo ""

echo "Testing JoRoMi sessions API:"
RESPONSE2=$(curl -s -X POST https://tetrixcorp.com/api/v1/joromi/sessions \
  -H 'Content-Type: application/json' \
  -d '{"userId":"test","agentId":"joromi-general","channel":"chat"}' 2>&1)
if echo "$RESPONSE2" | grep -q "success"; then
    echo "✅ JoRoMi Sessions API works!"
    echo "$RESPONSE2" | head -3
else
    echo "⚠️  JoRoMi Sessions API still not working"
    echo "Response:"
    echo "$RESPONSE2" | head -5
fi
echo ""

echo "=== Fix Complete ==="
echo ""
echo "If APIs still don't work, check:"
echo "1. Container is running: docker compose ps tetrix-frontend"
echo "2. Container responds: curl http://localhost:8082/api/v2/auth/countries"
echo "3. Nginx error logs: tail -f /var/log/nginx/error.log"
NGINX_FIX_EOF

echo ""
echo "✅ Nginx fix script completed!"

