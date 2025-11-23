#!/bin/bash

# Diagnostic script to identify Astro routing issue

set -e

DROPLET_IP="207.154.193.187"
DROPLET_KEY="~/.ssh/tetrix_droplet_key"

echo "🔍 Diagnosing Astro routing issue..."
echo ""

echo "1️⃣ Testing direct connection to container..."
echo "   Testing with Host: localhost:8082"
RESPONSE1=$(ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "curl -s -H 'Host: localhost:8082' http://localhost:8082/api/v1/joromi/sessions 2>&1")
if echo "$RESPONSE1" | grep -q '"success":true'; then
    echo "   ✅ Works with Host: localhost:8082"
else
    echo "   ❌ Failed with Host: localhost:8082"
    echo "$RESPONSE1" | head -3
fi

echo ""
echo "2️⃣ Testing with Host: tetrixcorp.com (simulating Nginx)..."
RESPONSE2=$(ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "curl -s -H 'Host: tetrixcorp.com' http://localhost:8082/api/v1/joromi/sessions 2>&1")
if echo "$RESPONSE2" | grep -q '"success":true'; then
    echo "   ✅ Works with Host: tetrixcorp.com"
else
    echo "   ❌ Failed with Host: tetrixcorp.com"
    echo "$RESPONSE2" | head -5
fi

echo ""
echo "3️⃣ Checking route files in build..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "cd /opt/tetrix && docker compose exec -T tetrix-frontend find /app/dist/server/pages/api/v1/joromi -name '*.mjs' -type f 2>&1"

echo ""
echo "4️⃣ Testing through Nginx..."
RESPONSE3=$(curl -s -X GET https://tetrixcorp.com/api/v1/joromi/sessions 2>&1)
if echo "$RESPONSE3" | grep -q '"success":true'; then
    echo "   ✅ Works through Nginx"
else
    echo "   ❌ Failed through Nginx"
    echo "$RESPONSE3" | head -5
fi

echo ""
echo "5️⃣ Checking frontend logs for routing errors..."
ssh -i $DROPLET_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    root@$DROPLET_IP "cd /opt/tetrix && docker compose logs --tail=50 tetrix-frontend 2>&1 | grep -iE 'error|404|cannot|route' | tail -10 || echo 'No routing errors found'"

echo ""
echo "✅ Diagnostics complete"

