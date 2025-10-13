#!/bin/bash

# Test Working Endpoints Script
# Tests only the endpoints that are confirmed to work

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BASE_URL="http://localhost:4321"

echo -e "${BLUE}🧪 Testing Working Endpoints${NC}"
echo "=============================="
echo "Base URL: $BASE_URL"
echo "Timestamp: $TIMESTAMP"
echo ""

# Test 1: Root Health Check
echo -e "${YELLOW}1. Testing Root Health Check${NC}"
echo "----------------------------"
ROOT_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/")
ROOT_STATUS=$(echo "$ROOT_RESPONSE" | tail -n1)
ROOT_BODY=$(echo "$ROOT_RESPONSE" | head -n -1)

if [ "$ROOT_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Root endpoint: $ROOT_STATUS${NC}"
else
    echo -e "${RED}❌ Root endpoint: $ROOT_STATUS${NC}"
fi

# Test 2: Voice API Health Check
echo -e "${YELLOW}2. Testing Voice API Health Check${NC}"
echo "----------------------------------"
VOICE_HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/voice/health")
VOICE_HEALTH_STATUS=$(echo "$VOICE_HEALTH_RESPONSE" | tail -n1)
VOICE_HEALTH_BODY=$(echo "$VOICE_HEALTH_RESPONSE" | head -n -1)

if [ "$VOICE_HEALTH_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Voice API health: $VOICE_HEALTH_STATUS${NC}"
    echo "Response: $VOICE_HEALTH_BODY"
else
    echo -e "${RED}❌ Voice API health: $VOICE_HEALTH_STATUS${NC}"
fi

# Test 3: Test Endpoint
echo -e "${YELLOW}3. Testing API Test Endpoint${NC}"
echo "----------------------------"
TEST_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" -d '{"test":"data"}' "$BASE_URL/api/test")
TEST_STATUS=$(echo "$TEST_RESPONSE" | tail -n1)
TEST_BODY=$(echo "$TEST_RESPONSE" | head -n -1)

if [ "$TEST_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Test endpoint: $TEST_STATUS${NC}"
    echo "Response: $TEST_BODY"
else
    echo -e "${RED}❌ Test endpoint: $TEST_STATUS${NC}"
fi

# Test 4: Voice Cleanup Endpoint
echo -e "${YELLOW}4. Testing Voice Cleanup Endpoint${NC}"
echo "----------------------------------"
CLEANUP_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/voice/cleanup")
CLEANUP_STATUS=$(echo "$CLEANUP_RESPONSE" | tail -n1)
CLEANUP_BODY=$(echo "$CLEANUP_RESPONSE" | head -n -1)

if [ "$CLEANUP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Voice cleanup: $CLEANUP_STATUS${NC}"
    echo "Response: $CLEANUP_BODY"
else
    echo -e "${RED}❌ Voice cleanup: $CLEANUP_STATUS${NC}"
fi

# Test 5: Transcription Health Check
echo -e "${YELLOW}5. Testing Transcription Health Check${NC}"
echo "--------------------------------------"
TRANS_HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/voice/transcribe/health")
TRANS_HEALTH_STATUS=$(echo "$TRANS_HEALTH_RESPONSE" | tail -n1)
TRANS_HEALTH_BODY=$(echo "$TRANS_HEALTH_RESPONSE" | head -n -1)

if [ "$TRANS_HEALTH_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Transcription health: $TRANS_HEALTH_STATUS${NC}"
    echo "Response: $TRANS_HEALTH_BODY"
else
    echo -e "${RED}❌ Transcription health: $TRANS_HEALTH_STATUS${NC}"
fi

# Test 6: Demo Capabilities
echo -e "${YELLOW}6. Testing Demo Capabilities${NC}"
echo "----------------------------"
DEMO_CAP_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/voice/demo/capabilities")
DEMO_CAP_STATUS=$(echo "$DEMO_CAP_RESPONSE" | tail -n1)
DEMO_CAP_BODY=$(echo "$DEMO_CAP_RESPONSE" | head -n -1)

if [ "$DEMO_CAP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Demo capabilities: $DEMO_CAP_STATUS${NC}"
    echo "Response: $DEMO_CAP_BODY"
else
    echo -e "${RED}❌ Demo capabilities: $DEMO_CAP_STATUS${NC}"
fi

# Test 7: Integration Status
echo -e "${YELLOW}7. Testing Integration Status${NC}"
echo "-------------------------------"
INT_STATUS_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/voice/integration/status")
INT_STATUS_STATUS=$(echo "$INT_STATUS_RESPONSE" | tail -n1)
INT_STATUS_BODY=$(echo "$INT_STATUS_RESPONSE" | head -n -1)

if [ "$INT_STATUS_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Integration status: $INT_STATUS_STATUS${NC}"
    echo "Response: $INT_STATUS_BODY"
else
    echo -e "${RED}❌ Integration status: $INT_STATUS_STATUS${NC}"
fi

echo ""
echo -e "${BLUE}📊 Summary${NC}"
echo "=========="

# Count working endpoints
WORKING_COUNT=0
TOTAL_COUNT=7

if [ "$ROOT_STATUS" = "200" ]; then ((WORKING_COUNT++)); fi
if [ "$VOICE_HEALTH_STATUS" = "200" ]; then ((WORKING_COUNT++)); fi
if [ "$TEST_STATUS" = "200" ]; then ((WORKING_COUNT++)); fi
if [ "$CLEANUP_STATUS" = "200" ]; then ((WORKING_COUNT++)); fi
if [ "$TRANS_HEALTH_STATUS" = "200" ]; then ((WORKING_COUNT++)); fi
if [ "$DEMO_CAP_STATUS" = "200" ]; then ((WORKING_COUNT++)); fi
if [ "$INT_STATUS_STATUS" = "200" ]; then ((WORKING_COUNT++)); fi

SUCCESS_RATE=$((WORKING_COUNT * 100 / TOTAL_COUNT))

echo "Working Endpoints: $WORKING_COUNT/$TOTAL_COUNT"
echo "Success Rate: $SUCCESS_RATE%"

if [ "$SUCCESS_RATE" -ge 80 ]; then
    echo -e "${GREEN}🎉 Excellent! Most endpoints are working.${NC}"
elif [ "$SUCCESS_RATE" -ge 60 ]; then
    echo -e "${YELLOW}⚠️  Good, but some endpoints need attention.${NC}"
else
    echo -e "${RED}❌ Many endpoints are not working properly.${NC}"
fi

echo ""
echo -e "${BLUE}🔍 Detailed Analysis${NC}"
echo "===================="

# Analyze response times
echo "Response Times:"
echo "- Root endpoint: $(echo "$ROOT_RESPONSE" | grep -o '[0-9]*\.[0-9]*ms' | head -1 || echo 'N/A')"
echo "- Voice health: $(echo "$VOICE_HEALTH_RESPONSE" | grep -o '[0-9]*\.[0-9]*ms' | head -1 || echo 'N/A')"
echo "- Test endpoint: $(echo "$TEST_RESPONSE" | grep -o '[0-9]*\.[0-9]*ms' | head -1 || echo 'N/A')"

echo ""
echo -e "${GREEN}✅ Working Endpoints Test Complete!${NC}"
