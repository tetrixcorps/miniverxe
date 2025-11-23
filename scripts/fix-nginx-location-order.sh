#!/bin/bash

# Fix Nginx Location Block Order
# The /api location block must be INSIDE the server block and BEFORE location /

set -e

DROPLET_IP="207.154.193.187"
DROPLET_KEY="$HOME/.ssh/tetrix_droplet_key"
DROPLET_USER="root"
NGINX_CONFIG="/etc/nginx/sites-available/tetrixcorp.com"

echo "=== Fixing Nginx Location Block Order ==="
echo ""

# Test SSH connection
if ! ssh -i "$DROPLET_KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=5 "$DROPLET_USER@$DROPLET_IP" "echo 'Connection successful'" 2>/dev/null; then
    echo "❌ Cannot connect to droplet"
    exit 1
fi

echo "✅ SSH connection successful"
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
# Read the full config
FULL_CONFIG=$(cat "$NGINX_CONFIG")

# Check if /api location is outside server block
if echo "$FULL_CONFIG" | grep -q "^[[:space:]]*location /api"; then
    echo "⚠️  /api location block found at top level (outside server block)"
    echo "This needs to be moved inside the server block"
fi
echo ""

echo "=== Step 3: Fixing nginx configuration ==="
# Create a Python script to fix the config
python3 << 'PYTHON_FIX'
import re
import sys

config_path = "/etc/nginx/sites-available/tetrixcorp.com"

with open(config_path, 'r') as f:
    content = f.read()

# Find all server blocks
server_blocks = re.finditer(r'server\s*\{[^}]*\}', content, re.DOTALL)

# The API location block that should be inside server block
api_location = """        location /api {
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
        }"""

# Remove /api location if it's outside server blocks
content = re.sub(r'^\s*location /api \{[^}]*\}\s*$', '', content, flags=re.MULTILINE)

# For each server block that listens on 443 (HTTPS), add /api location before location /
def fix_server_block(match):
    server_block = match.group(0)
    
    # Check if it's HTTPS server block
    if 'listen 443' in server_block or 'server_name tetrixcorp.com' in server_block:
        # Check if /api location already exists inside
        if 'location /api' not in server_block:
            # Find location / and insert /api before it
            if 'location /' in server_block:
                # Insert /api location block before the first location /
                server_block = re.sub(
                    r'(\s+)(location /)',
                    r'\1' + api_location + '\n\n\1\2',
                    server_block,
                    count=1
                )
            else:
                # Add /api location at the end before closing brace
                server_block = re.sub(
                    r'(\s+)\}',
                    r'\1' + api_location + '\n\1}',
                    server_block
                )
    
    return server_block

# Fix all server blocks
content = re.sub(r'server\s*\{[^}]*\}', fix_server_block, content, flags=re.DOTALL)

# Write back
with open(config_path, 'w') as f:
    f.write(content)

print("✅ Nginx config updated")
PYTHON_FIX

if [ $? -ne 0 ]; then
    echo "⚠️  Python fix failed, trying manual fix..."
    
    # Manual fix: Use sed to move /api location inside server block
    # This is a simpler approach
    TEMP_FILE=$(mktemp)
    
    # Read config and fix it
    awk '
    BEGIN { in_server = 0; api_added = 0 }
    /^[[:space:]]*server[[:space:]]*\{/ { in_server = 1 }
    /^[[:space:]]*location \/api/ && !in_server {
        # Skip /api location if outside server block
        # We'll add it later inside the server block
        next
    }
    /^[[:space:]]*location \// && in_server && !api_added {
        # Insert /api location before location /
        print "        location /api {"
        print "            proxy_pass http://localhost:8082;"
        print "            proxy_http_version 1.1;"
        print "            proxy_set_header Upgrade $http_upgrade;"
        print "            proxy_set_header Connection \"upgrade\";"
        print "            proxy_set_header Host $host;"
        print "            proxy_set_header X-Real-IP $remote_addr;"
        print "            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;"
        print "            proxy_set_header X-Forwarded-Proto $scheme;"
        print "            proxy_cache_bypass $http_upgrade;"
        print "            proxy_read_timeout 300s;"
        print "            proxy_connect_timeout 75s;"
        print "        }"
        print ""
        api_added = 1
    }
    /^[[:space:]]*\}/ && in_server { in_server = 0 }
    { print }
    ' "$NGINX_CONFIG" > "$TEMP_FILE"
    
    mv "$TEMP_FILE" "$NGINX_CONFIG"
    echo "✅ Manual fix applied"
fi

echo ""
echo "=== Step 4: Verifying nginx configuration ==="
if nginx -t 2>&1; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration has errors!"
    echo "Restoring backup..."
    cp "${NGINX_CONFIG}.backup."* "$NGINX_CONFIG" 2>/dev/null || true
    exit 1
fi
echo ""

echo "=== Step 5: Checking location block order ==="
echo "Location blocks in order:"
grep -n "^\s*location" "$NGINX_CONFIG" | head -10
echo ""

echo "=== Step 6: Reloading nginx ==="
systemctl reload nginx
echo "✅ Nginx reloaded"
echo ""

echo "=== Step 7: Testing API endpoint ==="
sleep 2
if curl -s https://tetrixcorp.com/api/v2/auth/countries 2>&1 | grep -q "success"; then
    echo "✅ API endpoint works through nginx!"
    curl -s https://tetrixcorp.com/api/v2/auth/countries | head -5
else
    echo "⚠️  API endpoint still not working"
    echo "Response:"
    curl -s https://tetrixcorp.com/api/v2/auth/countries 2>&1 | head -10
    echo ""
    echo "Testing direct container access:"
    curl -s http://localhost:8082/api/v2/auth/countries | head -5
fi
echo ""

echo "=== Fix Complete ==="
NGINX_FIX_EOF

echo ""
echo "✅ Nginx fix script completed!"

