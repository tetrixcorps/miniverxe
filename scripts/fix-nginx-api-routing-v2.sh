#!/bin/bash

# Fix Nginx API routing - properly format and place /api location block

set -e

DROPLET_IP="207.154.193.187"
DROPLET_KEY="~/.ssh/tetrix_droplet_key"

echo "🔧 Fixing Nginx API routing (v2)..."
echo ""

echo "1️⃣ Backing up current Nginx config..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "cp /etc/nginx/sites-available/tetrixcorp.com /etc/nginx/sites-available/tetrixcorp.com.backup.$(date +%Y%m%d_%H%M%S)"

echo ""
echo "2️⃣ Fixing Nginx config..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP << 'EOF'
cd /etc/nginx/sites-available

# Read the file
content=$(cat tetrixcorp.com)

# Remove all existing /api location blocks (including malformed ones)
content=$(echo "$content" | sed '/# Proxy to frontend on 8082/,/^[[:space:]]*}[[:space:]]*$/d')
content=$(echo "$content" | sed '/location \/api {/,/^[[:space:]]*}[[:space:]]*$/d')

# Find the HTTPS server block (starts at line 31) and insert /api block before location /
# We'll use awk to do this more reliably
awk '
BEGIN { in_https_server = 0; api_added = 0; }
/^server {/ { 
    server_count++; 
    if (server_count == 2) in_https_server = 1; 
}
in_https_server && /location \/ {/ && !api_added {
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
    print "            proxy_buffering off;  # Important for SSE streams"
    print "        }"
    print ""
    api_added = 1;
}
{ print }
' tetrixcorp.com > tetrixcorp.com.new && mv tetrixcorp.com.new tetrixcorp.com

echo "✅ Fixed Nginx configuration"
EOF

echo ""
echo "3️⃣ Testing Nginx configuration..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "nginx -t"

if [ $? -eq 0 ]; then
    echo ""
    echo "4️⃣ Reloading Nginx..."
    ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
        root@$DROPLET_IP "systemctl reload nginx"
    
    echo ""
    echo "5️⃣ Waiting for Nginx to reload..."
    sleep 3
    
    echo ""
    echo "6️⃣ Testing API endpoints..."
    echo "Testing /api/v2/auth/countries..."
    RESPONSE1=$(curl -s -X GET https://tetrixcorp.com/api/v2/auth/countries 2>&1 | head -3)
    echo "Response: $RESPONSE1"
    
    echo ""
    echo "Testing /api/v1/joromi/sessions..."
    RESPONSE2=$(curl -s -X GET https://tetrixcorp.com/api/v1/joromi/sessions 2>&1 | head -3)
    echo "Response: $RESPONSE2"
    
    if echo "$RESPONSE1" | grep -q '"success":true' && echo "$RESPONSE2" | grep -q '"success":true'; then
        echo ""
        echo "✅ All API endpoints are working!"
    else
        echo ""
        echo "⚠️ Some endpoints may still have issues. Check responses above."
    fi
else
    echo ""
    echo "❌ Nginx configuration test failed. Not reloading."
fi

echo ""
echo "✅ Fix complete!"

