#!/bin/bash

# Fix: Ensure /api location block is in HTTPS server block (port 443)

set -e

DROPLET_IP="207.154.193.187"
DROPLET_KEY="~/.ssh/tetrix_droplet_key"

echo "🔧 Fixing Nginx - Ensuring /api block is in HTTPS server block..."
echo ""

echo "1️⃣ Backing up config..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "cp /etc/nginx/sites-available/tetrixcorp.com /etc/nginx/sites-available/tetrixcorp.com.backup.$(date +%Y%m%d_%H%M%S)"

echo ""
echo "2️⃣ Downloading config..."
scp -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP:/etc/nginx/sites-available/tetrixcorp.com /tmp/tetrixcorp.com

echo ""
echo "3️⃣ Removing ALL /api blocks and adding one in HTTPS server block..."
python3 << 'PYTHON'
import re

with open('/tmp/tetrixcorp.com', 'r') as f:
    lines = f.readlines()

# Remove all /api location blocks
new_lines = []
skip_until_brace = 0
in_api_block = False

for line in lines:
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
                continue
        continue
    
    # Skip API comments
    if re.match(r'^\s*#.*API.*routes', line, re.IGNORECASE):
        continue
    
    new_lines.append(line)

# Find HTTPS server block (listen 443) and insert /api before location /
server_count = 0
in_https = False
brace_count = 0
https_start = -1

for i, line in enumerate(new_lines):
    if 'listen 443' in line or (line.strip().startswith('server {') and server_count == 1):
        if 'listen 443' in line:
            in_https = True
            https_start = i
            # Find the opening brace
            for j in range(i, max(0, i-5), -1):
                if new_lines[j].strip().startswith('server {'):
                    https_start = j
                    break
        break
    if line.strip().startswith('server {'):
        server_count += 1

if https_start == -1:
    print("❌ Could not find HTTPS server block")
    exit(1)

# Find location / in HTTPS block
location_root_idx = -1
for i in range(https_start, len(new_lines)):
    if re.match(r'^\s*location\s+/\s*\{', new_lines[i]):
        location_root_idx = i
        break

if location_root_idx == -1:
    print("❌ Could not find 'location /' in HTTPS block")
    exit(1)

# Insert /api block before location /
indent = len(new_lines[location_root_idx]) - len(new_lines[location_root_idx].lstrip())
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

# Insert before location /
new_lines = new_lines[:location_root_idx] + api_block + new_lines[location_root_idx:]

with open('/tmp/tetrixcorp.com', 'w') as f:
    f.writelines(new_lines)

print("✅ Added /api block in HTTPS server block")
PYTHON

echo ""
echo "4️⃣ Verifying /api block placement..."
API_LINE=$(grep -n "location /api" /tmp/tetrixcorp.com | head -1 | cut -d: -f1)
LISTEN_443_LINE=$(grep -n "listen 443" /tmp/tetrixcorp.com | head -1 | cut -d: -f1)

if [ -n "$API_LINE" ] && [ -n "$LISTEN_443_LINE" ] && [ "$API_LINE" -gt "$LISTEN_443_LINE" ]; then
    echo "✅ /api block is after 'listen 443' (in HTTPS block)"
else
    echo "⚠️ /api block placement may be incorrect"
fi

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

