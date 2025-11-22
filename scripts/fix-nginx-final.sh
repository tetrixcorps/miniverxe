#!/bin/bash

# Final comprehensive nginx fix - properly structure the config

set -e

DROPLET_IP="207.154.193.187"
DROPLET_KEY="$HOME/.ssh/tetrix_droplet_key"
DROPLET_USER="root"

echo "=== Final Nginx Configuration Fix ==="
echo ""

ssh -i "$DROPLET_KEY" -o StrictHostKeyChecking=no "$DROPLET_USER@$DROPLET_IP" << 'FINAL_FIX'
set -e

NGINX_CONFIG="/etc/nginx/sites-available/tetrixcorp.com"

echo "=== Step 1: Backup ==="
cp "$NGINX_CONFIG" "${NGINX_CONFIG}.backup.final.$(date +%Y%m%d_%H%M%S)"
echo "✅ Backup created"
echo ""

echo "=== Step 2: Reading current config ==="
echo "Full config:"
cat "$NGINX_CONFIG"
echo ""
echo "=== End of current config ==="
echo ""

echo "=== Step 3: Creating properly structured config ==="

# Read the entire config and fix it properly
python3 << 'PYTHON_FINAL'
import re
import sys

config_path = "/etc/nginx/sites-available/tetrixcorp.com"

with open(config_path, 'r') as f:
    lines = f.readlines()

# API location block
api_block_lines = [
    "        location /api {\n",
    "            proxy_pass http://localhost:8082;\n",
    "            proxy_http_version 1.1;\n",
    "            proxy_set_header Upgrade $http_upgrade;\n",
    "            proxy_set_header Connection \"upgrade\";\n",
    "            proxy_set_header Host $host;\n",
    "            proxy_set_header X-Real-IP $remote_addr;\n",
    "            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n",
    "            proxy_set_header X-Forwarded-Proto $scheme;\n",
    "            proxy_cache_bypass $http_upgrade;\n",
    "            proxy_read_timeout 300s;\n",
    "            proxy_connect_timeout 75s;\n",
    "        }\n",
    "\n"
]

output_lines = []
in_https_server = False
api_added_to_https = False
skip_api_blocks = False
in_api_block = False
brace_depth = 0
server_brace_depth = 0

i = 0
while i < len(lines):
    line = lines[i]
    stripped = line.strip()
    
    # Detect HTTPS server block start
    if re.match(r'^\s*server\s*\{', line):
        # Check if this is HTTPS server (443)
        lookahead = ''.join(lines[i:min(i+10, len(lines))])
        if '443' in lookahead or 'ssl' in lookahead.lower():
            in_https_server = True
            server_brace_depth = 0
            api_added_to_https = False
        else:
            in_https_server = False
    
    # Track brace depth
    brace_depth += line.count('{') - line.count('}')
    if in_https_server:
        server_brace_depth += line.count('{') - line.count('}')
    
    # Skip /api location blocks that are outside HTTPS server
    if re.match(r'^\s*location\s+/api', line) and not in_https_server:
        in_api_block = True
        api_brace_depth = 0
        # Skip until closing brace
        while i < len(lines):
            api_brace_depth += lines[i].count('{') - lines[i].count('}')
            if api_brace_depth <= 0 and '}' in lines[i]:
                i += 1
                break
            i += 1
        in_api_block = False
        continue
    
    # When we find "location /" inside HTTPS server, add /api before it
    if (in_https_server and 
        re.match(r'^\s*location\s+/', line) and 
        not re.match(r'^\s*location\s+/api', line) and
        not re.match(r'^\s*location\s+/.well-known', line) and
        not api_added_to_https):
        # Insert /api block before this location
        output_lines.extend(api_block_lines)
        api_added_to_https = True
    
    # Check if we're exiting HTTPS server block
    if in_https_server and server_brace_depth < 0:
        in_https_server = False
    
    if not in_api_block:
        output_lines.append(line)
    
    i += 1

# Write fixed config
with open(config_path, 'w') as f:
    f.writelines(output_lines)

print("✅ Config fixed")
PYTHON_FINAL

echo ""
echo "=== Step 4: Verifying structure ==="
echo "Location blocks in HTTPS server:"
awk '/listen 443/,/^}/' "$NGINX_CONFIG" | grep -n "location" || echo "No location blocks found"
echo ""

echo "=== Step 5: Testing nginx syntax ==="
if nginx -t 2>&1; then
    echo "✅ Config is valid"
else
    echo "❌ Config has errors!"
    exit 1
fi

echo ""
echo "=== Step 6: Reloading nginx ==="
systemctl reload nginx
echo "✅ Nginx reloaded"
echo ""

echo "=== Step 7: Testing endpoints ==="
sleep 2

echo "Test 1: Direct container access"
CONTAINER_TEST=$(curl -s http://localhost:8082/api/v2/auth/countries 2>&1 | head -3)
if echo "$CONTAINER_TEST" | grep -q '"success"'; then
    echo "✅ Container works"
else
    echo "❌ Container not responding"
    echo "$CONTAINER_TEST"
fi
echo ""

echo "Test 2: Through nginx (HTTPS)"
NGINX_TEST=$(curl -s https://tetrixcorp.com/api/v2/auth/countries 2>&1 | head -5)
if echo "$NGINX_TEST" | grep -q '"success"'; then
    echo "✅ Countries API works through nginx!"
    echo "$NGINX_TEST" | head -3
else
    echo "❌ Still not working through nginx"
    echo "Response:"
    echo "$NGINX_TEST"
    echo ""
    echo "Checking nginx access log:"
    tail -5 /var/log/nginx/access.log | grep "api" || echo "No API requests in access log"
    echo ""
    echo "Checking nginx error log:"
    tail -5 /var/log/nginx/error.log | grep -i "api\|error" || echo "No errors found"
fi
FINAL_FIX

echo ""
echo "✅ Final fix complete!"

