#!/bin/bash

# Fix Nginx API Location Block - Properly move /api inside server block
# This script uses Python for more reliable config parsing

set -e

DROPLET_IP="207.154.193.187"
DROPLET_KEY="$HOME/.ssh/tetrix_droplet_key"
DROPLET_USER="root"
NGINX_CONFIG="/etc/nginx/sites-available/tetrixcorp.com"

echo "=== Fixing Nginx API Location Block (v2) ==="
echo ""

# Execute fix on droplet
ssh -i "$DROPLET_KEY" -o StrictHostKeyChecking=no "$DROPLET_USER@$DROPLET_IP" << 'NGINX_FIX_EOF'
set -e

NGINX_CONFIG="/etc/nginx/sites-available/tetrixcorp.com"

echo "=== Step 1: Backing up nginx config ==="
cp "$NGINX_CONFIG" "${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
echo "✅ Backup created"
echo ""

echo "=== Step 2: Reading current config ==="
echo "Current structure (first 50 lines):"
head -50 "$NGINX_CONFIG" | cat -n
echo ""

echo "=== Step 3: Creating fixed configuration ==="

# Use Python to properly parse and fix the config
python3 << 'PYTHON_SCRIPT'
import re
import sys

config_path = "/etc/nginx/sites-available/tetrixcorp.com"

# Read the config
with open(config_path, 'r') as f:
    lines = f.readlines()

# API location block content (to be inserted)
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

output_lines = []
in_server_block = False
in_https_server = False
api_added = False
skip_api_outside = False
brace_count = 0
server_brace_count = 0

i = 0
while i < len(lines):
    line = lines[i]
    original_line = line
    
    # Track braces for server block
    if re.match(r'^\s*server\s*\{', line):
        in_server_block = True
        server_brace_count = 0
        # Check if it's HTTPS server
        if i + 1 < len(lines):
            next_lines = ''.join(lines[i:i+5])
            if '443' in next_lines or 'ssl' in next_lines.lower() or 'tetrixcorp.com' in next_lines:
                in_https_server = True
    
    # Count braces
    brace_count += line.count('{') - line.count('}')
    if in_server_block:
        server_brace_count += line.count('{') - line.count('}')
        if server_brace_count < 0:
            in_server_block = False
            in_https_server = False
    
    # Skip /api location blocks that are OUTSIDE server blocks
    if re.match(r'^\s*location\s+/api', line) and not in_server_block:
        skip_api_outside = True
        brace_count_api = 0
        # Skip until we find the closing brace
        while i < len(lines) and (skip_api_outside or brace_count_api > 0):
            if '{' in lines[i]:
                brace_count_api += 1
            if '}' in lines[i]:
                brace_count_api -= 1
                if brace_count_api == 0:
                    skip_api_outside = False
            i += 1
        continue
    
    # When we find "location /" inside HTTPS server block, add /api before it
    if (re.match(r'^\s*location\s+/', line) and 
        in_https_server and 
        not api_added and
        not re.match(r'^\s*location\s+/api', line) and
        not re.match(r'^\s*location\s+/.well-known', line)):
        # Insert /api location block before this location
        output_lines.append(api_block)
        output_lines.append("\n")
        api_added = True
    
    output_lines.append(original_line)
    i += 1

# Write the fixed config
with open(config_path, 'w') as f:
    f.writelines(output_lines)

print("✅ Config updated")
PYTHON_SCRIPT

echo ""
echo "=== Step 4: Verifying location block order ==="
echo "Location blocks in order:"
grep -n "^\s*location" "$NGINX_CONFIG" | head -15
echo ""

echo "=== Step 5: Checking server block structure ==="
echo "Server blocks and their location blocks:"
awk '/^[[:space:]]*server[[:space:]]*\{/,/^[[:space:]]*\}/ { 
    if (/server/) print ">>> Server block starts"
    if (/location/) print "  " $0
    if (/^[[:space:]]*\}/ && !/^[[:space:]]*location/) print "<<< Server block ends"
}' "$NGINX_CONFIG" | head -30
echo ""

echo "=== Step 6: Testing nginx configuration ==="
if nginx -t 2>&1; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration has errors!"
    echo "Restoring backup..."
    cp "${NGINX_CONFIG}.backup."* "$NGINX_CONFIG" 2>/dev/null || true
    exit 1
fi
echo ""

echo "=== Step 7: Reloading nginx ==="
systemctl reload nginx
echo "✅ Nginx reloaded"
echo ""

echo "=== Step 8: Testing direct container access ==="
echo "Testing container directly (bypassing nginx):"
CONTAINER_RESPONSE=$(curl -s http://localhost:8082/api/v2/auth/countries 2>&1 | head -5)
if echo "$CONTAINER_RESPONSE" | grep -qE '(success|countries|error)'; then
    echo "✅ Container responds to API requests"
    echo "$CONTAINER_RESPONSE"
else
    echo "⚠️  Container may not be responding correctly"
    echo "$CONTAINER_RESPONSE"
fi
echo ""

echo "=== Step 9: Testing API endpoints through nginx ==="
sleep 2
echo "Testing countries API:"
RESPONSE=$(curl -s https://tetrixcorp.com/api/v2/auth/countries 2>&1)
if echo "$RESPONSE" | grep -qE '(success|countries|\[)'; then
    echo "✅ Countries API works!"
    echo "$RESPONSE" | head -5
else
    echo "⚠️  Countries API still not working"
    echo "Response:"
    echo "$RESPONSE" | head -10
    echo ""
    echo "Checking nginx error logs:"
    tail -5 /var/log/nginx/error.log 2>&1 | grep -i "api\|error" || echo "No recent errors in nginx log"
fi
echo ""

echo "Testing JoRoMi sessions API:"
RESPONSE2=$(curl -s -X POST https://tetrixcorp.com/api/v1/joromi/sessions \
  -H 'Content-Type: application/json' \
  -d '{"userId":"test","agentId":"joromi-general","channel":"chat"}' 2>&1)
if echo "$RESPONSE2" | grep -qE '(success|session|id)'; then
    echo "✅ JoRoMi Sessions API works!"
    echo "$RESPONSE2" | head -5
else
    echo "⚠️  JoRoMi Sessions API still not working"
    echo "Response:"
    echo "$RESPONSE2" | head -10
fi
echo ""

echo "=== Fix Complete ==="
echo ""
echo "If APIs still don't work, check:"
echo "1. Container is running: docker compose ps tetrix-frontend"
echo "2. Container responds: curl http://localhost:8082/api/v2/auth/countries"
echo "3. Nginx error logs: tail -f /var/log/nginx/error.log"
echo "4. Nginx access logs: tail -f /var/log/nginx/access.log | grep api"
NGINX_FIX_EOF

echo ""
echo "✅ Nginx fix script (v2) completed!"

