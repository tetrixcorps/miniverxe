#!/bin/bash

# Remove /api/ block from nginx.conf to allow site-specific config to handle it

set -e

DROPLET_IP="207.154.193.187"
DROPLET_KEY="~/.ssh/tetrix_droplet_key"

echo "🔧 Removing /api/ block from nginx.conf..."
echo ""

echo "1️⃣ Downloading nginx.conf..."
scp -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP:/etc/nginx/nginx.conf /tmp/nginx.conf

echo ""
echo "2️⃣ Removing /api/ block (keeping /api/tetrix/ block)..."
python3 << 'PYTHON'
with open('/tmp/nginx.conf', 'r') as f:
    lines = f.readlines()

new_lines = []
skip_until_brace = 0
in_api_slash_block = False

i = 0
while i < len(lines):
    line = lines[i]
    
    # Check if this is the start of the /api/ block (not /api/tetrix/)
    if 'location /api/' in line and '/api/tetrix/' not in line:
        in_api_slash_block = True
        skip_until_brace = line.count('{') - line.count('}')
        i += 1
        continue
    
    # If we're in the /api/ block, skip until we close all braces
    if in_api_slash_block:
        skip_until_brace += line.count('{') - line.count('}')
        if skip_until_brace <= 0:
            in_api_slash_block = False
        i += 1
        continue
    
    new_lines.append(line)
    i += 1

with open('/tmp/nginx.conf', 'w') as f:
    f.writelines(new_lines)

print("✅ Removed /api/ block from nginx.conf")
PYTHON

echo ""
echo "3️⃣ Uploading fixed nginx.conf..."
scp -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    /tmp/nginx.conf root@$DROPLET_IP:/etc/nginx/nginx.conf

echo ""
echo "4️⃣ Testing Nginx configuration..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "nginx -t"

if [ $? -eq 0 ]; then
    echo ""
    echo "5️⃣ Reloading Nginx..."
    ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
        root@$DROPLET_IP "systemctl reload nginx"
    
    echo ""
    echo "6️⃣ Waiting for Nginx to reload..."
    sleep 3
    
    echo ""
    echo "7️⃣ Verifying /api/ block is removed..."
    ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
        root@$DROPLET_IP "nginx -T 2>&1 | grep -A 3 'location /api' | head -15"
    
    echo ""
    echo "8️⃣ Testing API endpoint..."
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

