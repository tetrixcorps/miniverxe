#!/bin/bash

# Direct fix for Nginx API routing

set -e

DROPLET_IP="207.154.193.187"
DROPLET_KEY="~/.ssh/tetrix_droplet_key"

echo "🔧 Directly fixing Nginx API routing..."
echo ""

echo "1️⃣ Backing up config..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "cp /etc/nginx/sites-available/tetrixcorp.com /etc/nginx/sites-available/tetrixcorp.com.backup.$(date +%Y%m%d_%H%M%S)"

echo ""
echo "2️⃣ Downloading config, fixing it, and uploading..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP << 'EOF'
cd /etc/nginx/sites-available

# Remove all /api location blocks
sed -i '/location \/api {/,/^[[:space:]]*}[[:space:]]*$/d' tetrixcorp.com
sed -i '/# Proxy to frontend/,/^[[:space:]]*}[[:space:]]*$/d' tetrixcorp.com

# Find the line with "location / {" in the HTTPS server block (after line 31)
# and insert the /api block before it
sed -i '/^server {$/,/location \/ {/ {
    /location \/ {/i\
        # API routes - proxy to frontend container\
        location /api {\
            proxy_pass http://localhost:8082;\
            proxy_http_version 1.1;\
            proxy_set_header Upgrade $http_upgrade;\
            proxy_set_header Connection "upgrade";\
            proxy_set_header Host $host;\
            proxy_set_header X-Real-IP $remote_addr;\
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\
            proxy_set_header X-Forwarded-Proto $scheme;\
            proxy_cache_bypass $http_upgrade;\
            proxy_read_timeout 300s;\
            proxy_buffering off;\
        }\

}' tetrixcorp.com

echo "✅ Config fixed"
EOF

echo ""
echo "3️⃣ Testing Nginx config..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "nginx -t && systemctl reload nginx"

echo ""
echo "4️⃣ Testing endpoints..."
sleep 2

echo "Testing /api/v1/joromi/sessions..."
curl -s -X GET https://tetrixcorp.com/api/v1/joromi/sessions 2>&1 | head -5

echo ""
echo "Testing /api/v2/auth/countries..."
curl -s -X GET https://tetrixcorp.com/api/v2/auth/countries 2>&1 | head -5

echo ""
echo "✅ Fix complete!"

