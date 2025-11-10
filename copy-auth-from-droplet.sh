#!/bin/bash
# Script to copy working authentication system from droplet to local dev server

DROPLET_IP="207.154.193.187"
SSH_KEY="~/.ssh/tetrix_droplet_key"
DROPLET_PATH="/opt/tetrix"
LOCAL_PATH="."

echo "=== Copying Authentication System from Droplet to Local ==="
echo ""

# Create necessary directories if they don't exist
mkdir -p src/pages/api/v2/2fa
mkdir -p src/pages/api/v2/auth
mkdir -p src/middleware
mkdir -p src/pages/api
mkdir -p public/assets

# 1. Copy middleware files
echo "1. Copying middleware files..."
scp -i $SSH_KEY -o StrictHostKeyChecking=no \
  root@$DROPLET_IP:$DROPLET_PATH/src/middleware.ts \
  $LOCAL_PATH/src/middleware.ts
if [ $? -eq 0 ]; then
  echo "✅ middleware.ts copied"
else
  echo "❌ Failed to copy middleware.ts"
fi

scp -i $SSH_KEY -o StrictHostKeyChecking=no \
  root@$DROPLET_IP:$DROPLET_PATH/src/middleware/requestParser.ts \
  $LOCAL_PATH/src/middleware/requestParser.ts
if [ $? -eq 0 ]; then
  echo "✅ requestParser.ts copied"
else
  echo "❌ Failed to copy requestParser.ts"
fi

scp -i $SSH_KEY -o StrictHostKeyChecking=no \
  root@$DROPLET_IP:$DROPLET_PATH/src/middleware/index.ts \
  $LOCAL_PATH/src/middleware/index.ts 2>/dev/null
if [ $? -eq 0 ]; then
  echo "✅ middleware/index.ts copied"
fi

# 2. Copy 2FA endpoints
echo ""
echo "2. Copying 2FA endpoints..."
scp -i $SSH_KEY -o StrictHostKeyChecking=no \
  root@$DROPLET_IP:$DROPLET_PATH/src/pages/api/v2/2fa/initiate.ts \
  $LOCAL_PATH/src/pages/api/v2/2fa/initiate.ts
if [ $? -eq 0 ]; then
  echo "✅ 2FA initiate.ts copied"
else
  echo "❌ Failed to copy 2FA initiate.ts"
fi

scp -i $SSH_KEY -o StrictHostKeyChecking=no \
  root@$DROPLET_IP:$DROPLET_PATH/src/pages/api/v2/2fa/verify.ts \
  $LOCAL_PATH/src/pages/api/v2/2fa/verify.ts
if [ $? -eq 0 ]; then
  echo "✅ 2FA verify.ts copied"
else
  echo "❌ Failed to copy 2FA verify.ts"
fi

# 3. Copy auth endpoints
echo ""
echo "3. Copying auth endpoints..."
scp -i $SSH_KEY -o StrictHostKeyChecking=no \
  root@$DROPLET_IP:$DROPLET_PATH/src/pages/api/v2/auth/countries.ts \
  $LOCAL_PATH/src/pages/api/v2/auth/countries.ts
if [ $? -eq 0 ]; then
  echo "✅ countries.ts copied"
else
  echo "❌ Failed to copy countries.ts"
fi

# 4. Copy catch-all route
echo ""
echo "4. Copying catch-all API route..."
scp -i $SSH_KEY -o StrictHostKeyChecking=no \
  "root@$DROPLET_IP:$DROPLET_PATH/src/pages/api/[...path].astro" \
  "$LOCAL_PATH/src/pages/api/[...path].astro"
if [ $? -eq 0 ]; then
  echo "✅ [...path].astro copied"
else
  echo "❌ Failed to copy [...path].astro"
fi

# 5. Copy auth proxy script
echo ""
echo "5. Copying auth proxy script..."
scp -i $SSH_KEY -o StrictHostKeyChecking=no \
  root@$DROPLET_IP:$DROPLET_PATH/public/assets/auth-proxy.js \
  $LOCAL_PATH/public/assets/auth-proxy.js
if [ $? -eq 0 ]; then
  echo "✅ auth-proxy.js copied"
else
  echo "❌ Failed to copy auth-proxy.js"
fi

# 6. Copy storage file (if exists)
echo ""
echo "6. Copying JoRoMi storage file..."
scp -i $SSH_KEY -o StrictHostKeyChecking=no \
  "root@$DROPLET_IP:$DROPLET_PATH/src/pages/api/v1/joromi/storage.ts" \
  "$LOCAL_PATH/src/pages/api/v1/joromi/storage.ts" 2>/dev/null
if [ $? -eq 0 ]; then
  echo "✅ storage.ts copied"
else
  echo "⚠️ storage.ts not found (may not exist)"
fi

echo ""
echo "=== Authentication system files copied ==="
echo ""
echo "Files copied:"
echo "  - src/middleware.ts"
echo "  - src/middleware/requestParser.ts"
echo "  - src/pages/api/v2/2fa/initiate.ts"
echo "  - src/pages/api/v2/2fa/verify.ts"
echo "  - src/pages/api/v2/auth/countries.ts"
echo "  - src/pages/api/[...path].astro"
echo "  - public/assets/auth-proxy.js"
echo ""
echo "Next steps:"
echo "  1. Review the copied files"
echo "  2. Restart your local dev server: pnpm dev"
echo "  3. Test authentication endpoints"

