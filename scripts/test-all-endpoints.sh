#!/bin/bash

# Comprehensive API Endpoint Testing Script
# Tests all endpoints in the TETRIX cross-platform management services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COLLECTION_FILE="postman-collection.json"
REPORT_DIR="test-reports"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_FILE="$REPORT_DIR/api-test-report-$TIMESTAMP.html"
JSON_REPORT="$REPORT_DIR/api-test-results-$TIMESTAMP.json"

# Create report directory
mkdir -p "$REPORT_DIR"

echo -e "${BLUE}🚀 Starting Comprehensive API Endpoint Testing${NC}"
echo "=================================================="
echo "Collection: $COLLECTION_FILE"
echo "Report: $REPORT_FILE"
echo "Timestamp: $TIMESTAMP"
echo ""

# Check if Newman is installed
if ! command -v newman &> /dev/null; then
    echo -e "${RED}❌ Newman is not installed. Installing...${NC}"
    pnpm add -D newman -w
fi

# Check if collection file exists
if [ ! -f "$COLLECTION_FILE" ]; then
    echo -e "${RED}❌ Collection file not found: $COLLECTION_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Testing Voice API - Call Management${NC}"
echo "----------------------------------------"

# Test Voice API - Call Management
newman run "$COLLECTION_FILE" \
    --folder "Voice API - Call Management" \
    --reporters cli,html,json \
    --reporter-html-export "$REPORT_DIR/voice-call-management-$TIMESTAMP.html" \
    --reporter-json-export "$REPORT_DIR/voice-call-management-$TIMESTAMP.json" \
    --timeout-request 30000 \
    --timeout-script 30000 \
    --delay-request 1000 \
    --bail

echo ""
echo -e "${YELLOW}📋 Testing Voice API - Webhooks${NC}"
echo "--------------------------------"

# Test Voice API - Webhooks
newman run "$COLLECTION_FILE" \
    --folder "Voice API - Webhooks" \
    --reporters cli,html,json \
    --reporter-html-export "$REPORT_DIR/voice-webhooks-$TIMESTAMP.html" \
    --reporter-json-export "$REPORT_DIR/voice-webhooks-$TIMESTAMP.json" \
    --timeout-request 30000 \
    --timeout-script 30000 \
    --delay-request 1000 \
    --bail

echo ""
echo -e "${YELLOW}📋 Testing Voice API - Transcription${NC}"
echo "------------------------------------"

# Test Voice API - Transcription
newman run "$COLLECTION_FILE" \
    --folder "Voice API - Transcription" \
    --reporters cli,html,json \
    --reporter-html-export "$REPORT_DIR/voice-transcription-$TIMESTAMP.html" \
    --reporter-json-export "$REPORT_DIR/voice-transcription-$TIMESTAMP.json" \
    --timeout-request 30000 \
    --timeout-script 30000 \
    --delay-request 1000 \
    --bail

echo ""
echo -e "${YELLOW}📋 Testing Voice API - Demo & Testing${NC}"
echo "----------------------------------------"

# Test Voice API - Demo & Testing
newman run "$COLLECTION_FILE" \
    --folder "Voice API - Demo & Testing" \
    --reporters cli,html,json \
    --reporter-html-export "$REPORT_DIR/voice-demo-$TIMESTAMP.html" \
    --reporter-json-export "$REPORT_DIR/voice-demo-$TIMESTAMP.json" \
    --timeout-request 30000 \
    --timeout-script 30000 \
    --delay-request 1000 \
    --bail

echo ""
echo -e "${YELLOW}📋 Testing Voice API - Cross-Platform Integration${NC}"
echo "------------------------------------------------"

# Test Voice API - Cross-Platform Integration
newman run "$COLLECTION_FILE" \
    --folder "Voice API - Cross-Platform Integration" \
    --reporters cli,html,json \
    --reporter-html-export "$REPORT_DIR/voice-integration-$TIMESTAMP.html" \
    --reporter-json-export "$REPORT_DIR/voice-integration-$TIMESTAMP.json" \
    --timeout-request 30000 \
    --timeout-script 30000 \
    --delay-request 1000 \
    --bail

echo ""
echo -e "${YELLOW}📋 Testing 2FA API - Authentication${NC}"
echo "------------------------------------"

# Test 2FA API - Authentication
newman run "$COLLECTION_FILE" \
    --folder "2FA API - Authentication" \
    --reporters cli,html,json \
    --reporter-html-export "$REPORT_DIR/2fa-auth-$TIMESTAMP.html" \
    --reporter-json-export "$REPORT_DIR/2fa-auth-$TIMESTAMP.json" \
    --timeout-request 30000 \
    --timeout-script 30000 \
    --delay-request 1000 \
    --bail

echo ""
echo -e "${YELLOW}📋 Testing Webhooks - External Services${NC}"
echo "----------------------------------------"

# Test Webhooks - External Services
newman run "$COLLECTION_FILE" \
    --folder "Webhooks - External Services" \
    --reporters cli,html,json \
    --reporter-html-export "$REPORT_DIR/webhooks-$TIMESTAMP.html" \
    --reporter-json-export "$REPORT_DIR/webhooks-$TIMESTAMP.json" \
    --timeout-request 30000 \
    --timeout-script 30000 \
    --delay-request 1000 \
    --bail

echo ""
echo -e "${YELLOW}📋 Testing Health Checks & Monitoring${NC}"
echo "----------------------------------------"

# Test Health Checks & Monitoring
newman run "$COLLECTION_FILE" \
    --folder "Health Checks & Monitoring" \
    --reporters cli,html,json \
    --reporter-html-export "$REPORT_DIR/health-checks-$TIMESTAMP.html" \
    --reporter-json-export "$REPORT_DIR/health-checks-$TIMESTAMP.json" \
    --timeout-request 30000 \
    --timeout-script 30000 \
    --delay-request 1000 \
    --bail

echo ""
echo -e "${YELLOW}📋 Running Complete Collection Test${NC}"
echo "------------------------------------"

# Run complete collection test
newman run "$COLLECTION_FILE" \
    --reporters cli,html,json \
    --reporter-html-export "$REPORT_FILE" \
    --reporter-json-export "$JSON_REPORT" \
    --timeout-request 30000 \
    --timeout-script 30000 \
    --delay-request 1000 \
    --bail

echo ""
echo -e "${GREEN}✅ API Testing Complete!${NC}"
echo "=================================================="
echo "📊 Reports generated:"
echo "  - HTML Report: $REPORT_FILE"
echo "  - JSON Report: $JSON_REPORT"
echo "  - Individual folder reports in: $REPORT_DIR/"
echo ""

# Generate summary
echo -e "${BLUE}📈 Test Summary${NC}"
echo "=================="

# Count total tests
TOTAL_TESTS=$(find "$REPORT_DIR" -name "*$TIMESTAMP.json" -exec jq '.run.stats.tests.total' {} \; | awk '{sum+=$1} END {print sum}')
PASSED_TESTS=$(find "$REPORT_DIR" -name "*$TIMESTAMP.json" -exec jq '.run.stats.tests.passed' {} \; | awk '{sum+=$1} END {print sum}')
FAILED_TESTS=$(find "$REPORT_DIR" -name "*$TIMESTAMP.json" -exec jq '.run.stats.tests.failed' {} \; | awk '{sum+=$1} END {print sum}')

echo "Total Tests: $TOTAL_TESTS"
echo "Passed: $PASSED_TESTS"
echo "Failed: $FAILED_TESTS"

if [ "$FAILED_TESTS" -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ $FAILED_TESTS tests failed${NC}"
    echo "Check the HTML reports for detailed failure information."
    exit 1
fi
