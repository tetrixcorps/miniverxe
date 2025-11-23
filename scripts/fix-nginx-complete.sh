#!/bin/bash

# Complete Nginx fix: Remove duplicates, fix proxy buffering, ensure correct config

set -e

DROPLET_IP="207.154.193.187"
DROPLET_KEY="~/.ssh/tetrix_droplet_key"

echo "🔧 Complete Nginx fix - Removing duplicates and fixing proxy issues..."
echo ""

echo "1️⃣ Backing up config..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "cp /etc/nginx/sites-available/tetrixcorp.com /etc/nginx/sites-available/tetrixcorp.com.backup.$(date +%Y%m%d_%H%M%S)"

echo ""
echo "2️⃣ Downloading config..."
scp -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP:/etc/nginx/sites-available/tetrixcorp.com /tmp/tetrixcorp.com

echo ""
echo "3️⃣ Removing ALL /api blocks and fixing config..."
python3 << 'PYTHON'
import re

with open('/tmp/tetrixcorp.com', 'r') as f:
    lines = f.readlines()

# Find HTTPS server block (second "server {")
server_count = 0
https_start = -1
https_end = -1
in_https = False
brace_count = 0

for i, line in enumerate(lines):
    if line.strip().startswith('server {'):
        server_count += 1
        if server_count == 2:
            https_start = i
            in_https = True
            brace_count = 1
        elif in_https:
            brace_count += 1
    elif in_https:
        if '{' in line:
            brace_count += 1
        if '}' in line:
            brace_count -= 1
            if brace_count == 0:
                https_end = i + 1
                break

if https_start == -1 or https_end == -1:
    print("❌ Could not find HTTPS server block")
    exit(1)

# Process HTTPS server block
https_block = lines[https_start:https_end]
new_block = []
skip_until_brace = 0
in_api_block = False

for i, line in enumerate(https_block):
    # Skip /api location blocks
    if re.match(r'^\s*location\s+/api\s*\{', line):
        in_api_block = True
        skip_until_brace = 1
        continue
    
    if in_api_block:
        if '{' in line:
            skip_until_brace += line.count('{')
        if '}' in line:
            skip_until_brace -= line.count('}')
            if skip_until_brace <= 0:
                in_api_block = False
                # Skip the closing brace
                continue
        continue
    
    # Skip duplicate API comments
    if re.match(r'^\s*#.*API.*routes', line, re.IGNORECASE):
        continue
    
    new_block.append(line)
    
    # Insert /api block before location /
    if re.match(r'^\s*location\s+/\s*\{', line) and not any('location /api' in l for l in new_block):
        # Insert /api block
        indent = len(line) - len(line.lstrip())
        api_block = [
            ' ' * indent + '# API routes - proxy to frontend container\n',
            ' ' * indent + 'location /api {\n',
            ' ' * indent + '    proxy_pass http://localhost:8082;\n',
            ' ' * indent + '    proxy_http_version 1.1;\n',
            ' ' * indent + '    proxy_set_header Host $host;\n',
            ' ' * indent + '    proxy_set_header X-Real-IP $remote_addr;\n',
            ' ' * indent + '    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n',
            ' ' * indent + '    proxy_set_header X-Forwarded-Proto $scheme;\n',
            ' ' * indent + '    proxy_set_header X-Forwarded-Host $host;\n',
            ' ' * indent + '    proxy_set_header Connection "";\n',
            ' ' * indent + '    proxy_buffering off;\n',
            ' ' * indent + '    proxy_request_buffering off;\n',
            ' ' * indent + '    proxy_cache_bypass $http_upgrade;\n',
            ' ' * indent + '    proxy_read_timeout 300s;\n',
            ' ' * indent + '    proxy_connect_timeout 75s;\n',
            ' ' * indent + '    proxy_send_timeout 300s;\n',
            ' ' * indent + '}\n',
            '\n'
        ]
        # Insert before current line
        new_block = new_block[:-1] + api_block + [line]

# Reconstruct file
new_lines = lines[:https_start] + new_block + lines[https_end:]

with open('/tmp/tetrixcorp.com', 'w') as f:
    f.writelines(new_lines)

print("✅ Config fixed - Removed duplicates and added single /api block")
PYTHON

echo ""
echo "4️⃣ Fixing Nginx proxy directory permissions..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "mkdir -p /var/lib/nginx/proxy && chown -R www-data:www-data /var/lib/nginx/proxy 2>/dev/null || echo 'Permissions already set'"

echo ""
echo "5️⃣ Uploading fixed config..."
scp -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    /tmp/tetrixcorp.com root@$DROPLET_IP:/etc/nginx/sites-available/tetrixcorp.com

echo ""
echo "6️⃣ Testing Nginx configuration..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "nginx -t"

if [ $? -eq 0 ]; then
    echo ""
    echo "7️⃣ Reloading Nginx..."
    ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
        root@$DROPLET_IP "systemctl reload nginx"
    
    echo ""
    echo "8️⃣ Waiting for Nginx..."
    sleep 3
    
    echo ""
    echo "9️⃣ Testing API endpoints..."
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

