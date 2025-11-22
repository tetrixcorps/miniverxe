#!/bin/bash

# Clean fix: Remove ALL /api blocks and add a single correct one

set -e

DROPLET_IP="207.154.193.187"
DROPLET_KEY="~/.ssh/tetrix_droplet_key"

echo "🔧 Cleaning and fixing Nginx API routing..."
echo ""

echo "1️⃣ Backing up config..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "cp /etc/nginx/sites-available/tetrixcorp.com /etc/nginx/sites-available/tetrixcorp.com.backup.$(date +%Y%m%d_%H%M%S)"

echo ""
echo "2️⃣ Removing ALL /api location blocks..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP << 'EOF'
cd /etc/nginx/sites-available

# Remove all /api location blocks (including malformed ones with comments)
# This sed command removes from "location /api" to the closing brace
sed -i '/location \/api {/,/^[[:space:]]*}[[:space:]]*$/d' tetrixcorp.com
sed -i '/# Proxy to frontend/,/^[[:space:]]*}[[:space:]]*$/d' tetrixcorp.com

# Also remove any lines that contain just "location /api {" or similar
sed -i '/^[[:space:]]*location[[:space:]]*\/api[[:space:]]*{/d' tetrixcorp.com

echo "✅ Removed all /api blocks"
EOF

echo ""
echo "3️⃣ Adding single correct /api block in HTTPS server block..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP << 'EOF'
cd /etc/nginx/sites-available

# Find the HTTPS server block (starts around line 31) and insert /api before location /
# Use a more reliable method with awk
awk '
BEGIN { 
    server_count = 0
    in_https = 0
    api_added = 0
}
/^server {/ { 
    server_count++
    if (server_count == 2) {
        in_https = 1
    } else {
        in_https = 0
    }
}
in_https && /^[[:space:]]*location[[:space:]]+\/[[:space:]]+{/ && !api_added {
    # Insert /api block before location /
    print "        # API routes - proxy to frontend container"
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
    print "            proxy_buffering off;"
    print "        }"
    print ""
    api_added = 1
}
{ print }
' tetrixcorp.com > tetrixcorp.com.tmp && mv tetrixcorp.com.tmp tetrixcorp.com

echo "✅ Added /api block"
EOF

echo ""
echo "4️⃣ Testing and reloading Nginx..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "nginx -t && systemctl reload nginx && echo '✅ Nginx reloaded'"

echo ""
echo "5️⃣ Waiting for Nginx..."
sleep 3

echo ""
echo "6️⃣ Testing endpoints..."
echo ""
echo "Testing GET /api/v1/joromi/sessions:"
RESPONSE1=$(curl -s -X GET https://tetrixcorp.com/api/v1/joromi/sessions 2>&1)
echo "$RESPONSE1" | head -5
echo ""

echo "Testing GET /api/v2/auth/countries:"
RESPONSE2=$(curl -s -X GET https://tetrixcorp.com/api/v2/auth/countries 2>&1)
echo "$RESPONSE2" | head -5
echo ""

if echo "$RESPONSE1" | grep -q '"success":true' && echo "$RESPONSE2" | grep -q '"success":true'; then
    echo "✅ All API endpoints are working!"
    echo ""
    echo "Testing POST /api/v1/joromi/sessions:"
    RESPONSE3=$(curl -s -X POST https://tetrixcorp.com/api/v1/joromi/sessions \
        -H "Content-Type: application/json" \
        -d '{"userId":"test","agentId":"joromi-general","channel":"chat"}' 2>&1)
    echo "$RESPONSE3" | head -5
    if echo "$RESPONSE3" | grep -q '"success":true'; then
        echo ""
        echo "✅ POST endpoint is also working! JoRoMi chat should now work on the contact page."
    fi
else
    echo "⚠️ Endpoints may still have issues. Check responses above."
fi

echo ""
echo "✅ Fix complete!"

