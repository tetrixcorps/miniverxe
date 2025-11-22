#!/bin/bash

# Fix Nginx API routing to properly route /api/* requests to frontend container

set -e

DROPLET_IP="207.154.193.187"
DROPLET_KEY="~/.ssh/tetrix_droplet_key"

echo "🔧 Fixing Nginx API routing..."
echo ""

echo "1️⃣ Backing up current Nginx config..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "cp /etc/nginx/sites-available/tetrixcorp.com /etc/nginx/sites-available/tetrixcorp.com.backup.$(date +%Y%m%d_%H%M%S)"

echo ""
echo "2️⃣ Checking current Nginx config..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "cat /etc/nginx/sites-available/tetrixcorp.com | grep -n 'location /api'"

echo ""
echo "3️⃣ Fixing Nginx config - removing duplicate /api blocks and ensuring correct routing..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP << 'EOF'
cd /etc/nginx/sites-available

# Create a Python script to fix the config
python3 << 'PYTHON'
import re

with open('tetrixcorp.com', 'r') as f:
    content = f.read()

# Find the HTTPS server block
https_server_pattern = r'(server\s*\{[^}]*listen\s+443[^}]*\{[^}]*)(.*?)(\})'
https_match = re.search(https_server_pattern, content, re.DOTALL)

if https_match:
    server_block = https_match.group(0)
    
    # Remove all existing /api location blocks
    server_block = re.sub(r'\s*location\s+/api\s*\{[^}]*\}[^\n]*\n?', '', server_block, flags=re.DOTALL)
    
    # Find where to insert the /api block (before location /)
    location_root_match = re.search(r'(location\s+/\s*\{)', server_block)
    
    if location_root_match:
        insert_pos = location_root_match.start()
        
        # Create the /api location block
        api_block = '''
        # API routes - proxy to frontend container
        location /api {
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
            proxy_buffering off;  # Important for SSE streams
        }
'''
        
        # Insert the /api block before location /
        server_block = server_block[:insert_pos] + api_block + server_block[insert_pos:]
        
        # Replace the server block in the original content
        content = content[:https_match.start()] + server_block + content[https_match.end():]
        
        # Write the fixed content
        with open('tetrixcorp.com', 'w') as f:
            f.write(content)
        
        print("✅ Fixed Nginx configuration")
    else:
        print("⚠️ Could not find 'location /' block")
else:
    print("⚠️ Could not find HTTPS server block")
PYTHON
EOF

echo ""
echo "4️⃣ Testing Nginx configuration..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "nginx -t"

echo ""
echo "5️⃣ Reloading Nginx..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "systemctl reload nginx"

echo ""
echo "6️⃣ Testing API endpoint..."
sleep 2
RESPONSE=$(curl -s -X GET https://tetrixcorp.com/api/v2/auth/countries 2>&1 | head -5)
echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q '"success":true'; then
  echo ""
  echo "✅ Nginx routing is working!"
else
  echo ""
  echo "⚠️ Nginx routing may still have issues. Check the response above."
fi

echo ""
echo "✅ Fix complete!"
