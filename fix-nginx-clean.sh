#!/bin/bash

# Clean fix: Remove all /api blocks and add one correctly inside HTTPS server block

set -e

DROPLET_IP="207.154.193.187"
DROPLET_KEY="$HOME/.ssh/tetrix_droplet_key"
DROPLET_USER="root"

echo "=== Clean Nginx Fix ==="
echo ""

ssh -i "$DROPLET_KEY" -o StrictHostKeyChecking=no "$DROPLET_USER@$DROPLET_IP" << 'FIX_EOF'
set -e

NGINX_CONFIG="/etc/nginx/sites-available/tetrixcorp.com"

echo "=== Step 1: Backup ==="
cp "$NGINX_CONFIG" "${NGINX_CONFIG}.backup.clean.$(date +%Y%m%d_%H%M%S)"
echo "✅ Backup created"
echo ""

echo "=== Step 2: Creating clean config ==="

# Use Python to cleanly fix the config
python3 << 'PYTHON_FIX'
import re

config_path = "/etc/nginx/sites-available/tetrixcorp.com"

with open(config_path, 'r') as f:
    content = f.read()

# API location block to insert
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

# Remove ALL existing /api location blocks (with their content)
# Pattern matches: location /api { ... }
pattern = r'\s*location\s+/api\s*\{[^}]*\}'
content = re.sub(pattern, '', content, flags=re.DOTALL)

# Find the HTTPS server block (listen 443)
# Insert /api location block BEFORE the first "location /" inside HTTPS server block
https_server_pattern = r'(server\s*\{[^}]*listen\s+443[^}]*?)(\s+location\s+/\s*\{)'

def insert_api_block(match):
    server_start = match.group(1)
    location_slash = match.group(2)
    # Check if /api block already exists in this server block
    if '/api' not in server_start:
        return server_start + api_block + location_slash
    return match.group(0)

content = re.sub(https_server_pattern, insert_api_block, content, flags=re.DOTALL)

# Clean up extra blank lines
content = re.sub(r'\n{3,}', '\n\n', content)

with open(config_path, 'w') as f:
    f.write(content)

print("✅ Config cleaned and fixed")
PYTHON_FIX

echo ""
echo "=== Step 3: Verifying ==="
echo "Location blocks:"
grep -n "location" "$NGINX_CONFIG" | head -10
echo ""

echo "=== Step 4: Testing nginx config ==="
if nginx -t 2>&1; then
    echo "✅ Config is valid"
else
    echo "❌ Config has errors!"
    exit 1
fi

echo ""
echo "=== Step 5: Reloading nginx ==="
systemctl reload nginx
echo "✅ Nginx reloaded"
echo ""

echo "=== Step 6: Testing ==="
sleep 2
echo "Testing countries API:"
RESPONSE=$(curl -s https://tetrixcorp.com/api/v2/auth/countries 2>&1)
if echo "$RESPONSE" | grep -q '"success"'; then
    echo "✅ Countries API works!"
    echo "$RESPONSE" | head -3
else
    echo "❌ Still not working"
    echo "Response:"
    echo "$RESPONSE" | head -10
    echo ""
    echo "Checking nginx error log:"
    tail -10 /var/log/nginx/error.log | grep -i "api\|error" || echo "No errors found"
fi
FIX_EOF

echo ""
echo "✅ Fix complete!"

