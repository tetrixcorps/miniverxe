#!/bin/bash

# Test JoRoMi API endpoints on droplet

set -e

DROPLET_IP="207.154.193.187"
DROPLET_KEY="~/.ssh/tetrix_droplet_key"
BASE_URL="https://tetrixcorp.com"

echo "🧪 Testing JoRoMi API endpoints on droplet..."
echo ""

echo "1️⃣ Testing sessions endpoint (POST)..."
SESSION_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/joromi/sessions" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-'$(date +%s)'",
    "agentId": "joromi-general",
    "channel": "chat"
  }')

echo "Response: $SESSION_RESPONSE"
echo ""

# Extract session ID if available
SESSION_ID=$(echo "$SESSION_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$SESSION_ID" ]; then
  echo "❌ Failed to create session. Response: $SESSION_RESPONSE"
  exit 1
fi

echo "✅ Session created: $SESSION_ID"
echo ""

echo "2️⃣ Testing stream endpoint (POST)..."
STREAM_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/joromi/sessions/$SESSION_ID/stream" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, JoRoMi!",
    "role": "user",
    "agentId": "joromi-general"
  }' \
  --max-time 5 | head -c 500)

echo "Stream response (first 500 chars): $STREAM_RESPONSE"
echo ""

if echo "$STREAM_RESPONSE" | grep -q "event:" || echo "$STREAM_RESPONSE" | grep -q "data:"; then
  echo "✅ Stream endpoint is working (SSE format detected)"
else
  echo "⚠️ Stream endpoint response format unexpected"
fi

echo ""
echo "3️⃣ Testing sessions endpoint (GET)..."
GET_RESPONSE=$(curl -s "$BASE_URL/api/v1/joromi/sessions?sessionId=$SESSION_ID")
echo "Response: $GET_RESPONSE"
echo ""

if echo "$GET_RESPONSE" | grep -q "$SESSION_ID"; then
  echo "✅ GET sessions endpoint is working"
else
  echo "⚠️ GET sessions endpoint may have issues"
fi

echo ""
echo "✅ Testing complete!"
echo ""
echo "If all tests pass, the JoRoMi chat should work on the contact page."
echo "If tests fail, check:"
echo "  1. Nginx routing for /api/*"
echo "  2. Frontend container logs"
echo "  3. API route handlers in source code"

