#!/bin/bash

# Final clean fix: Remove ALL /api blocks and add ONE clean block

set -e

DROPLET_IP="207.154.193.187"
DROPLET_KEY="~/.ssh/tetrix_droplet_key"

echo "🔧 Final clean Nginx fix - Removing ALL duplicates..."
echo ""

echo "1️⃣ Backing up config..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "cp /etc/nginx/sites-available/tetrixcorp.com /etc/nginx/sites-available/tetrixcorp.com.backup.$(date +%Y%m%d_%H%M%S)"

echo ""
echo "2️⃣ Downloading config..."
scp -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP:/etc/nginx/sites-available/tetrixcorp.com /tmp/tetrixcorp.com

echo ""
echo "3️⃣ Removing ALL /api blocks (including duplicates)..."
# Use sed to remove all /api location blocks
sed -i '/location \/api {/,/^[[:space:]]*}/d' /tmp/tetrixcorp.com
# Remove any remaining API-related comments
sed -i '/#.*API.*routes/d' /tmp/tetrixcorp.com
sed -i '/#.*api.*proxy/d' /tmp/tetrixcorp.com

echo ""
echo "4️⃣ Adding single clean /api block..."
python3 << 'PYTHON'
import re

with open('/tmp/tetrixcorp.com', 'r') as f:
    content = f.read()

# Find location / and insert /api before it
location_root_match = re.search(r'(\s+)(location\s+/\s*\{)', content)

if location_root_match:
    indent = location_root_match.group(1)
    location_line = location_root_match.group(0)
    
    # Create clean /api block
    api_block = f'''{indent}# API routes - proxy to frontend container
{indent}location /api {{
{indent}    proxy_pass http://localhost:8082;
{indent}    proxy_http_version 1.1;
{indent}    proxy_set_header Host $host;
{indent}    proxy_set_header X-Real-IP $remote_addr;
{indent}    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
{indent}    proxy_set_header X-Forwarded-Proto $scheme;
{indent}    proxy_set_header X-Forwarded-Host $host;
{indent}    proxy_set_header Connection "";
{indent}    proxy_buffering off;
{indent}    proxy_request_buffering off;
{indent}    proxy_cache_bypass $http_upgrade;
{indent}    proxy_read_timeout 300s;
{indent}    proxy_connect_timeout 75s;
{indent}    proxy_send_timeout 300s;
{indent}}}

'''
    
    # Insert before location /
    content = content.replace(location_line, api_block + location_line)
    
    with open('/tmp/tetrixcorp.com', 'w') as f:
        f.write(content)
    
    print("✅ Added single clean /api block")
else:
    print("❌ Could not find 'location /' block")
    exit(1)
PYTHON

echo ""
echo "5️⃣ Verifying no duplicates..."
API_COUNT=$(grep -c "location /api" /tmp/tetrixcorp.com || echo "0")
if [ "$API_COUNT" -eq "1" ]; then
    echo "✅ Only one /api block found"
else
    echo "⚠️ Found $API_COUNT /api blocks - may still have duplicates"
fi

echo ""
echo "6️⃣ Uploading fixed config..."
scp -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    /tmp/tetrixcorp.com root@$DROPLET_IP:/etc/nginx/sites-available/tetrixcorp.com

echo ""
echo "7️⃣ Testing Nginx configuration..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "nginx -t"

if [ $? -eq 0 ]; then
    echo ""
    echo "8️⃣ Reloading Nginx..."
    ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
        root@$DROPLET_IP "systemctl reload nginx"
    
    echo ""
    echo "9️⃣ Waiting for Nginx..."
    sleep 3
    
    echo ""
    echo "🔟 Testing API endpoints..."
    echo ""
    
    echo "Testing GET /api/v1/joromi/sessions:"
    RESPONSE1=$(curl -s -X GET https://tetrixcorp.com/api/v1/joromi/sessions 2>&1)
    if echo "$RESPONSE1" | grep -q '"success":true'; then
        echo "✅ GET /api/v1/joromi/sessions is working!"
        echo "$RESPONSE1" | head -3
    else
        echo "❌ GET failed:"
        echo "$RESPONSE1" | head -5
    fi
    
    echo ""
    echo "Testing POST /api/v1/joromi/sessions:"
    RESPONSE2=$(curl -s -X POST https://tetrixcorp.com/api/v1/joromi/sessions \
        -H "Content-Type: application/json" \
        -d '{"userId":"test-user","agentId":"joromi-general","channel":"chat"}' 2>&1)
    if echo "$RESPONSE2" | grep -q '"success":true'; then
        echo "✅ POST /api/v1/joromi/sessions is working!"
        echo "$RESPONSE2" | head -3
        echo ""
        echo "🎉 JoRoMi chat should now work on the contact page!"
    else
        echo "❌ POST failed:"
        echo "$RESPONSE2" | head -5
    fi
else
    echo ""
    echo "❌ Nginx configuration test failed. Not reloading."
    exit 1
fi

echo ""
echo "✅ Fix complete!"

