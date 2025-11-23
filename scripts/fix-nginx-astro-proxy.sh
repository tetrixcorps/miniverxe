#!/bin/bash

# Fix Nginx proxy configuration for Astro API routes
# Based on comprehensive proxy configuration guide

set -e

DROPLET_IP="207.154.193.187"
DROPLET_KEY="~/.ssh/tetrix_droplet_key"

echo "🔧 Fixing Nginx proxy configuration for Astro..."
echo ""

echo "1️⃣ Backing up config..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "cp /etc/nginx/sites-available/tetrixcorp.com /etc/nginx/sites-available/tetrixcorp.com.backup.$(date +%Y%m%d_%H%M%S)"

echo ""
echo "2️⃣ Downloading config..."
scp -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP:/etc/nginx/sites-available/tetrixcorp.com /tmp/tetrixcorp.com

echo ""
echo "3️⃣ Fixing /api location block with proper proxy headers..."
python3 << 'PYTHON'
import re

with open('/tmp/tetrixcorp.com', 'r') as f:
    content = f.read()

# Remove all existing /api location blocks
content = re.sub(r'\s*# API routes.*?\n', '', content, flags=re.DOTALL)
content = re.sub(r'\s*location\s+/api\s*\{[^}]*\}[^\n]*\n?', '', content, flags=re.DOTALL)

# Find the HTTPS server block and location / block
# Insert the correct /api block before location /
location_root_pattern = r'(\s+)(location\s+/\s*\{)'

def replace_with_api_block(match):
    indent = match.group(1)
    api_block = f'''{indent}# API routes - proxy to frontend container with proper headers
{indent}location /api {{
{indent}    proxy_pass http://localhost:8082;
{indent}    proxy_http_version 1.1;
{indent}    proxy_set_header Host $host;
{indent}    proxy_set_header X-Real-IP $remote_addr;
{indent}    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
{indent}    proxy_set_header X-Forwarded-Proto $scheme;
{indent}    proxy_set_header X-Forwarded-Host $server_name;
{indent}    proxy_set_header Connection "";
{indent}    proxy_buffering off;
{indent}    proxy_request_buffering off;
{indent}    proxy_cache_bypass $http_upgrade;
{indent}    proxy_read_timeout 300s;
{indent}    proxy_connect_timeout 60s;
{indent}    proxy_send_timeout 60s;
{indent}}}

'''
    return api_block + match.group(0)

content = re.sub(location_root_pattern, replace_with_api_block, content)

# Write back
with open('/tmp/tetrixcorp.com', 'w') as f:
    f.write(content)

print("✅ Config fixed with proper proxy headers")
PYTHON

echo ""
echo "4️⃣ Uploading fixed config..."
scp -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    /tmp/tetrixcorp.com root@$DROPLET_IP:/etc/nginx/sites-available/tetrixcorp.com

echo ""
echo "5️⃣ Testing Nginx configuration..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "nginx -t"

if [ $? -eq 0 ]; then
    echo ""
    echo "6️⃣ Reloading Nginx..."
    ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
        root@$DROPLET_IP "systemctl reload nginx"
    
    echo ""
    echo "7️⃣ Waiting for Nginx to reload..."
    sleep 3
    
    echo ""
    echo "8️⃣ Testing API endpoints..."
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
    
    echo ""
    echo "Testing GET /api/v2/auth/countries:"
    RESPONSE3=$(curl -s -X GET https://tetrixcorp.com/api/v2/auth/countries 2>&1)
    if echo "$RESPONSE3" | grep -q '"success":true'; then
        echo "✅ GET /api/v2/auth/countries is working!"
    else
        echo "❌ GET /api/v2/auth/countries failed"
    fi
else
    echo ""
    echo "❌ Nginx configuration test failed. Not reloading."
    exit 1
fi

echo ""
echo "✅ Fix complete!"

