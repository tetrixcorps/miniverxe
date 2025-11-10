#!/bin/bash

# Fix Nginx /api routing - ensure it proxies to frontend, not backend

set -e

DROPLET_IP="207.154.193.187"
DROPLET_KEY="~/.ssh/tetrix_droplet_key"

echo "🔧 Fixing Nginx /api routing to proxy to frontend (localhost:8082)..."
echo ""

echo "1️⃣ Checking all /api location blocks..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "grep -rn 'location.*\/api' /etc/nginx/sites-available/ /etc/nginx/conf.d/ 2>/dev/null | head -20"

echo ""
echo "2️⃣ Backing up config..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "cp /etc/nginx/sites-available/tetrixcorp.com /etc/nginx/sites-available/tetrixcorp.com.backup.$(date +%Y%m%d_%H%M%S)"

echo ""
echo "3️⃣ Downloading config..."
scp -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP:/etc/nginx/sites-available/tetrixcorp.com /tmp/tetrixcorp.com

echo ""
echo "4️⃣ Removing ALL /api blocks and adding correct one in HTTPS server block..."
python3 << 'PYTHON'
import re

with open('/tmp/tetrixcorp.com', 'r') as f:
    content = f.read()

# Remove ALL /api location blocks (including /api/tetrix/)
# Match location blocks with various patterns
patterns = [
    r'^\s*#.*API.*routes?.*\n',  # API comments
    r'^\s*location\s+/api[^{]*\{[^}]*\}',  # Simple /api blocks
    r'^\s*location\s+/api/tetrix[^{]*\{[^}]*\}',  # /api/tetrix blocks
]

# More robust: remove location blocks line by line
lines = content.split('\n')
new_lines = []
skip_until_brace = 0
in_api_block = False
api_block_indent = 0

i = 0
while i < len(lines):
    line = lines[i]
    
    # Check if this is the start of an /api location block
    if re.match(r'^\s*location\s+/api', line):
        in_api_block = True
        api_block_indent = len(line) - len(line.lstrip())
        skip_until_brace = line.count('{') - line.count('}')
        i += 1
        continue
    
    # If we're in an /api block, skip until we close all braces
    if in_api_block:
        skip_until_brace += line.count('{') - line.count('}')
        if skip_until_brace <= 0:
            in_api_block = False
        i += 1
        continue
    
    # Skip API-related comments
    if re.match(r'^\s*#.*API', line, re.IGNORECASE):
        i += 1
        continue
    
    new_lines.append(line)
    i += 1

content = '\n'.join(new_lines)

# Find HTTPS server block (listen 443)
https_start = -1
https_end = -1
lines = content.split('\n')
brace_count = 0
in_https_server = False

for i, line in enumerate(lines):
    if 'listen 443' in line:
        # Find the server { before this
        for j in range(i, max(0, i-10), -1):
            if lines[j].strip().startswith('server {'):
                https_start = j
                in_https_server = True
                brace_count = 1
                break
        if https_start != -1:
            # Find the end of this server block
            for j in range(https_start + 1, len(lines)):
                brace_count += lines[j].count('{') - lines[j].count('}')
                if brace_count == 0:
                    https_end = j
                    break
            break

if https_start == -1 or https_end == -1:
    print("❌ Could not find HTTPS server block")
    exit(1)

# Find location / in HTTPS block
location_root_idx = -1
for i in range(https_start, https_end):
    if re.match(r'^\s*location\s+/\s*\{', lines[i]):
        location_root_idx = i
        break

if location_root_idx == -1:
    print("❌ Could not find 'location /' in HTTPS block")
    exit(1)

# Insert /api block before location /
indent = len(lines[location_root_idx]) - len(lines[location_root_idx].lstrip())
api_block = [
    ' ' * indent + '# API routes - proxy to frontend container (Astro SSR)',
    ' ' * indent + 'location /api {',
    ' ' * indent + '    proxy_pass http://localhost:8082;',
    ' ' * indent + '    proxy_http_version 1.1;',
    ' ' * indent + '    proxy_set_header Host $host;',
    ' ' * indent + '    proxy_set_header X-Real-IP $remote_addr;',
    ' ' * indent + '    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;',
    ' ' * indent + '    proxy_set_header X-Forwarded-Proto $scheme;',
    ' ' * indent + '    proxy_set_header X-Forwarded-Host $host;',
    ' ' * indent + '    proxy_set_header Connection "";',
    ' ' * indent + '    proxy_buffering off;',
    ' ' * indent + '    proxy_request_buffering off;',
    ' ' * indent + '    proxy_cache_bypass $http_upgrade;',
    ' ' * indent + '    proxy_read_timeout 300s;',
    ' ' * indent + '    proxy_connect_timeout 75s;',
    ' ' * indent + '    proxy_send_timeout 300s;',
    ' ' * indent + '}',
    ''
]

# Insert before location /
new_lines = lines[:location_root_idx] + api_block + lines[location_root_idx:]

with open('/tmp/tetrixcorp.com', 'w') as f:
    f.write('\n'.join(new_lines))

print(f"✅ Removed all /api blocks and added correct one in HTTPS server block (before line {location_root_idx + len(api_block)})")
PYTHON

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
    echo "8️⃣ Waiting for Nginx to reload..."
    sleep 3
    
    echo ""
    echo "9️⃣ Verifying /api block now proxies to frontend..."
    ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
        root@$DROPLET_IP "nginx -T 2>&1 | grep -A 3 'location /api {' | head -10"
    
    echo ""
    echo "🔟 Testing API endpoint through Nginx..."
    RESPONSE=$(curl -s -X GET https://tetrixcorp.com/api/v1/joromi/sessions 2>&1)
    if echo "$RESPONSE" | grep -q '"success":true'; then
        echo "✅ GET /api/v1/joromi/sessions is working!"
        echo "$RESPONSE" | head -3
        echo ""
        echo "🎉 JoRoMi chat should now work on the contact page!"
    else
        echo "❌ Still failing:"
        echo "$RESPONSE" | head -10
    fi
else
    echo ""
    echo "❌ Nginx configuration test failed. Not reloading."
    exit 1
fi

echo ""
echo "✅ Fix complete!"

