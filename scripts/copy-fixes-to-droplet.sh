#!/bin/bash
# Script to copy contact page and JoRoMi fixes to droplet

DROPLET_IP="207.154.193.187"
SSH_KEY="~/.ssh/tetrix_droplet_key"
DROPLET_PATH="/opt/tetrix"

echo "=== Copying fixed files to droplet ==="
echo ""

# 1. Copy contact.astro
echo "1. Copying contact.astro..."
scp -i $SSH_KEY -o StrictHostKeyChecking=no \
  src/pages/contact.astro \
  root@$DROPLET_IP:$DROPLET_PATH/src/pages/contact.astro
if [ $? -eq 0 ]; then
  echo "✅ contact.astro copied"
else
  echo "❌ Failed to copy contact.astro"
  exit 1
fi

echo ""

# 2. Copy streaming endpoint
echo "2. Copying streaming endpoint..."
scp -i $SSH_KEY -o StrictHostKeyChecking=no \
  "src/pages/api/v1/joromi/sessions/[sessionId]/stream.ts" \
  "root@$DROPLET_IP:$DROPLET_PATH/src/pages/api/v1/joromi/sessions/[sessionId]/stream.ts"
if [ $? -eq 0 ]; then
  echo "✅ stream.ts copied"
else
  echo "❌ Failed to copy stream.ts"
  exit 1
fi

echo ""

# 3. Copy image file
echo "3. Copying image file..."
scp -i $SSH_KEY -o StrictHostKeyChecking=no \
  public/images/joromi-base-logo.jpg \
  root@$DROPLET_IP:$DROPLET_PATH/public/images/joromi-base-logo.jpg
if [ $? -eq 0 ]; then
  echo "✅ Image copied"
else
  echo "❌ Failed to copy image"
  exit 1
fi

echo ""
echo "=== All files copied successfully ==="
echo ""
echo "Next steps:"
echo "1. SSH into droplet: ssh -i $SSH_KEY root@$DROPLET_IP"
echo "2. Rebuild frontend container: cd $DROPLET_PATH && docker compose build --no-cache tetrix-frontend"
echo "3. Restart frontend: docker compose up -d --force-recreate tetrix-frontend"

