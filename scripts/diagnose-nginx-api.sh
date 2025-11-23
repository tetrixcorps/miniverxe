#!/bin/bash

# Diagnose Nginx API routing issues

set -e

DROPLET_IP="207.154.193.187"
DROPLET_KEY="~/.ssh/tetrix_droplet_key"

echo "🔍 Diagnosing Nginx API routing..."
echo ""

echo "1️⃣ Checking /api block in HTTPS server block..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "grep -A 20 'location /api' /etc/nginx/sites-available/tetrixcorp.com | head -25"

echo ""
echo "2️⃣ Testing direct container access (localhost:8082)..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "curl -s -X GET http://localhost:8082/api/v1/joromi/sessions | head -5"

echo ""
echo "3️⃣ Testing through Nginx (HTTPS)..."
curl -s -X GET https://tetrixcorp.com/api/v1/joromi/sessions | head -10

echo ""
echo "4️⃣ Checking Nginx error logs..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "tail -30 /var/log/nginx/error.log | grep -i 'api\|proxy\|upstream' || echo 'No relevant errors found'"

echo ""
echo "5️⃣ Checking if frontend container is running..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "docker ps | grep tetrix-frontend || echo 'Frontend container not running!'"

echo ""
echo "6️⃣ Checking container logs for API requests..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "docker logs tetrix-frontend --tail 20 | grep -i 'api\|joromi' || echo 'No API logs found'"

echo ""
echo "✅ Diagnosis complete!"

