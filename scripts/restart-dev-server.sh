#!/bin/bash

# Script to restart the dev server and clear cache

echo "🔄 Restarting dev server..."
echo ""

# Kill existing dev server processes
echo "⏹️  Stopping existing dev server..."
pkill -f 'pnpm dev' 2>/dev/null
pkill -f 'astro dev' 2>/dev/null
sleep 2

# Check if processes were killed
if pgrep -f 'pnpm dev' > /dev/null; then
  echo "⚠️  Some processes still running, force killing..."
  pkill -9 -f 'pnpm dev' 2>/dev/null
  pkill -9 -f 'astro dev' 2>/dev/null
  sleep 1
fi

echo "✅ Dev server stopped"
echo ""
echo "🚀 Starting dev server..."
echo "   (This will run in the background)"
echo ""

# Start dev server in background
cd "$(dirname "$0")/.."
pnpm dev > /tmp/tetrix-dev-server.log 2>&1 &
DEV_PID=$!

echo "✅ Dev server started (PID: $DEV_PID)"
echo ""
echo "📋 Next steps:"
echo "   1. Wait 10-15 seconds for server to start"
echo "   2. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)"
echo "   3. Clear browser cache: DevTools -> Application -> Clear Storage"
echo "   4. Try OTP flow again"
echo ""
echo "📊 To check server logs:"
echo "   tail -f /tmp/tetrix-dev-server.log"
echo ""
echo "🛑 To stop server:"
echo "   kill $DEV_PID"

