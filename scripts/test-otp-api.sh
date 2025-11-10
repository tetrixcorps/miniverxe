#!/bin/bash

# Script to test OTP API and verify verificationId is present in response

echo "🧪 Testing OTP Initiation API..."
echo ""

# Test the API endpoint
RESPONSE=$(curl -s -X POST http://localhost:8082/api/v2/2fa/initiate \
  -H 'Content-Type: application/json' \
  -d '{
    "phoneNumber": "+15042749808",
    "method": "sms",
    "userAgent": "Test Script",
    "ipAddress": "127.0.0.1",
    "sessionId": "test_session_'$(date +%s)'"
  }')

echo "📥 API Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Check if verificationId is present
if echo "$RESPONSE" | grep -q '"verificationId"'; then
  VERIFICATION_ID=$(echo "$RESPONSE" | grep -o '"verificationId":"[^"]*"' | cut -d'"' -f4)
  echo "✅ SUCCESS: verificationId found in response!"
  echo "   verificationId: $VERIFICATION_ID"
  echo ""
  
  # Check if success is true
  if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "✅ Response has success: true"
    echo ""
    echo "✅ API is working correctly!"
    echo ""
    echo "🔧 Next steps:"
    echo "   1. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)"
    echo "   2. Open DevTools (F12) -> Console tab"
    echo "   3. Try OTP flow again"
    echo "   4. Look for logs with 📥 and 🔍 emojis"
    echo ""
    echo "   If you still see 'verificationId: not present' in console:"
    echo "   - The browser is using cached JavaScript"
    echo "   - Try: DevTools -> Application -> Clear Storage -> Clear site data"
    echo "   - Or restart dev server: pkill -f 'pnpm dev' && pnpm dev"
  else
    echo "⚠️  WARNING: Response has success: false"
  fi
else
  echo "❌ ERROR: verificationId NOT found in response!"
  echo ""
  echo "Full response:"
  echo "$RESPONSE"
  echo ""
  echo "This indicates an API issue. Check server logs."
fi

echo ""
echo "📊 Response Statistics:"
echo "   Response length: $(echo -n "$RESPONSE" | wc -c) bytes"
echo "   Has 'success': $(echo "$RESPONSE" | grep -q '"success"' && echo 'Yes' || echo 'No')"
echo "   Has 'verificationId': $(echo "$RESPONSE" | grep -q '"verificationId"' && echo 'Yes' || echo 'No')"
echo "   Has 'message': $(echo "$RESPONSE" | grep -q '"message"' && echo 'Yes' || echo 'No')"

