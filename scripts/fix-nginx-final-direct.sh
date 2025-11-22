#!/bin/bash

# Final direct fix for Nginx - manually edit the file

set -e

DROPLET_IP="207.154.193.187"
DROPLET_KEY="~/.ssh/tetrix_droplet_key"

echo "🔧 Final direct Nginx fix..."
echo ""

echo "1️⃣ Backing up config..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "cp /etc/nginx/sites-available/tetrixcorp.com /etc/nginx/sites-available/tetrixcorp.com.backup.$(date +%Y%m%d_%H%M%S)"

echo ""
echo "2️⃣ Downloading, fixing, and uploading config..."
scp -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP:/etc/nginx/sites-available/tetrixcorp.com /tmp/tetrixcorp.com

# Remove all /api blocks and duplicate comments
sed -i '/# API routes - proxy to frontend container/d' /tmp/tetrixcorp.com
sed -i '/location \/api {/,/^[[:space:]]*}[[:space:]]*$/d' /tmp/tetrixcorp.com

# Find the line with "location / {" in the HTTPS server block and insert /api before it
# We need to find the second "server {" block (HTTPS) and then find "location / {" within it
python3 << 'PYTHON'
import re

with open('/tmp/tetrixcorp.com', 'r') as f:
    lines = f.readlines()

# Find HTTPS server block (second "server {")
server_count = 0
https_start = -1
for i, line in enumerate(lines):
    if line.strip().startswith('server {'):
        server_count += 1
        if server_count == 2:
            https_start = i
            break

if https_start == -1:
    print("❌ Could not find HTTPS server block")
    exit(1)

# Find "location / {" within HTTPS server block
location_root_idx = -1
for i in range(https_start, len(lines)):
    if re.match(r'^\s*location\s+/\s+{', lines[i]):
        location_root_idx = i
        break

if location_root_idx == -1:
    print("❌ Could not find 'location /' block")
    exit(1)

# Insert /api block before location /
api_block = [
    '        # API routes - proxy to frontend container\n',
    '        location /api {\n',
    '            proxy_pass http://localhost:8082;\n',
    '            proxy_http_version 1.1;\n',
    '            proxy_set_header Upgrade $http_upgrade;\n',
    '            proxy_set_header Connection "upgrade";\n',
    '            proxy_set_header Host $host;\n',
    '            proxy_set_header X-Real-IP $remote_addr;\n',
    '            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n',
    '            proxy_set_header X-Forwarded-Proto $scheme;\n',
    '            proxy_cache_bypass $http_upgrade;\n',
    '            proxy_read_timeout 300s;\n',
    '            proxy_buffering off;\n',
    '        }\n',
    '\n'
]

# Insert the block
lines[location_root_idx:location_root_idx] = api_block

# Write back
with open('/tmp/tetrixcorp.com', 'w') as f:
    f.writelines(lines)

print("✅ Config fixed")
PYTHON

# Upload the fixed config
scp -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    /tmp/tetrixcorp.com root@$DROPLET_IP:/etc/nginx/sites-available/tetrixcorp.com

echo ""
echo "3️⃣ Testing and reloading Nginx..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "nginx -t && systemctl reload nginx && echo '✅ Nginx reloaded'"

echo ""
echo "4️⃣ Waiting for Nginx..."
sleep 3

echo ""
echo "5️⃣ Testing endpoints..."
echo ""
echo "Testing GET /api/v1/joromi/sessions:"
RESPONSE1=$(curl -s -X GET https://tetrixcorp.com/api/v1/joromi/sessions 2>&1)
if echo "$RESPONSE1" | grep -q '"success":true'; then
    echo "✅ GET /api/v1/joromi/sessions is working!"
    echo "$RESPONSE1" | head -3
else
    echo "❌ GET /api/v1/joromi/sessions failed:"
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
    echo "❌ POST /api/v1/joromi/sessions failed:"
    echo "$RESPONSE2" | head -5
fi

echo ""
echo "✅ Fix complete!"

