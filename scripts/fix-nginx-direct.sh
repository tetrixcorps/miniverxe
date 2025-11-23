#!/bin/bash

# Direct fix: Add /api location block INSIDE HTTPS server block, BEFORE location /

set -e

DROPLET_IP="207.154.193.187"
DROPLET_KEY="$HOME/.ssh/tetrix_droplet_key"
DROPLET_USER="root"

ssh -i "$DROPLET_KEY" -o StrictHostKeyChecking=no "$DROPLET_USER@$DROPLET_IP" << 'DIRECT_FIX'
set -e

NGINX_CONFIG="/etc/nginx/sites-available/tetrixcorp.com"

echo "=== Direct Nginx Fix ==="
echo ""

# Backup
cp "$NGINX_CONFIG" "${NGINX_CONFIG}.backup.direct.$(date +%Y%m%d_%H%M%S)"
echo "✅ Backup created"
echo ""

# Use Python to insert /api block correctly
python3 << 'PYTHON_DIRECT'
import re

config_path = "/etc/nginx/sites-available/tetrixcorp.com"

with open(config_path, 'r') as f:
    content = f.read()

# API location block
api_block = """        location /api {
            proxy_pass http://localhost:8082;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 300s;
            proxy_connect_timeout 75s;
        }
"""

# Find HTTPS server block and insert /api BEFORE "location /"
# Pattern: Inside HTTPS server block, find "location / {" and insert /api before it
pattern = r'(listen 443[^}]*?)(\s+location\s+/\s*\{)'

def insert_api(match):
    server_content = match.group(1)
    location_slash = match.group(2)
    # Only insert if /api doesn't already exist in this server block
    if 'location /api' not in server_content:
        return server_content + api_block + location_slash
    return match.group(0)

content = re.sub(pattern, insert_api, content, flags=re.DOTALL)

# Remove any /api blocks that are OUTSIDE server blocks
# This is a simple approach: remove /api blocks that come before first "server {"
lines = content.split('\n')
output_lines = []
in_server = False
skip_api = False
api_brace_count = 0

for i, line in enumerate(lines):
    if 'server {' in line:
        in_server = True
    if in_server and '}' in line and '{' not in line:
        # Check if we're closing a server block
        in_server = False
    
    # Skip /api blocks outside server
    if not in_server and re.match(r'^\s*location\s+/api', line):
        skip_api = True
        api_brace_count = 0
        continue
    
    if skip_api:
        api_brace_count += line.count('{') - line.count('}')
        if api_brace_count <= 0 and '}' in line:
            skip_api = False
            continue
        if not skip_api:
            output_lines.append(line)
    else:
        output_lines.append(line)

content = '\n'.join(output_lines)

with open(config_path, 'w') as f:
    f.write(content)

print("✅ Config fixed")
PYTHON_DIRECT

echo ""
echo "=== Testing nginx config ==="
if nginx -t 2>&1; then
    echo "✅ Config valid"
    systemctl reload nginx
    echo "✅ Nginx reloaded"
else
    echo "❌ Config invalid!"
    exit 1
fi

echo ""
echo "=== Testing ==="
sleep 2
RESPONSE=$(curl -s https://tetrixcorp.com/api/v2/auth/countries 2>&1)
if echo "$RESPONSE" | grep -q '"success"'; then
    echo "✅ API works!"
    echo "$RESPONSE" | head -3
else
    echo "❌ Still not working"
    echo "Response: $RESPONSE" | head -5
fi
DIRECT_FIX

echo ""
echo "✅ Fix complete!"

