#!/bin/bash
# Comprehensive script to fix contact page and JoRoMi chat on droplet

DROPLET_IP="207.154.193.187"
SSH_KEY="~/.ssh/tetrix_droplet_key"
DROPLET_PATH="/opt/tetrix"

echo "=== Fixing Droplet Contact Page and JoRoMi Chat ==="
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

# 2. Copy streaming endpoint
echo ""
echo "2. Copying JoRoMi streaming endpoint..."
scp -i $SSH_KEY -o StrictHostKeyChecking=no \
  "src/pages/api/v1/joromi/sessions/[sessionId]/stream.ts" \
  "root@$DROPLET_IP:$DROPLET_PATH/src/pages/api/v1/joromi/sessions/[sessionId]/stream.ts"
if [ $? -eq 0 ]; then
  echo "✅ stream.ts copied"
else
  echo "❌ Failed to copy stream.ts"
  exit 1
fi

# 3. Copy countries endpoint
echo ""
echo "3. Copying countries endpoint..."
scp -i $SSH_KEY -o StrictHostKeyChecking=no \
  src/pages/api/v2/auth/countries.ts \
  root@$DROPLET_IP:$DROPLET_PATH/src/pages/api/v2/auth/countries.ts
if [ $? -eq 0 ]; then
  echo "✅ countries.ts copied"
else
  echo "❌ Failed to copy countries.ts"
  exit 1
fi

# 4. Copy image file (force overwrite)
echo ""
echo "4. Copying image file..."
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
echo "Next: Rebuild and restart frontend container on droplet:"
echo "  ssh -i $SSH_KEY root@$DROPLET_IP"
echo "  cd $DROPLET_PATH"
echo "  docker compose build --no-cache tetrix-frontend"
echo "  docker compose up -d --force-recreate tetrix-frontend"

