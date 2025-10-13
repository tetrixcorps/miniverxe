#!/bin/bash

# Focused API Endpoint Testing Script
# Tests critical endpoints for TETRIX cross-platform management services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COLLECTION_FILE="postman-collection.json"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo -e "${BLUE}🚀 Starting Focused API Endpoint Testing${NC}"
echo "=============================================="
echo "Collection: $COLLECTION_FILE"
echo "Timestamp: $TIMESTAMP"
echo ""

# Check if Newman is installed
if ! command -v newman &> /dev/null && ! npx newman --version &> /dev/null; then
    echo -e "${RED}❌ Newman is not installed. Installing...${NC}"
    pnpm add -D newman -w
fi

# Use npx if newman is not in PATH
NEWMAN_CMD="newman"
if ! command -v newman &> /dev/null; then
    NEWMAN_CMD="npx newman"
fi

# Check if collection file exists
if [ ! -f "$COLLECTION_FILE" ]; then
    echo -e "${RED}❌ Collection file not found: $COLLECTION_FILE${NC}"
    exit 1
fi

# Test against Digital Ocean deployment
echo -e "${YELLOW}🌐 Testing against Digital Ocean deployment${NC}"
echo "=============================================="

$NEWMAN_CMD run "$COLLECTION_FILE" \
    --folder "Health Checks & Monitoring" \
    --reporters cli \
    --timeout-request 30000 \
    --timeout-script 30000 \
    --delay-request 1000 \
    --bail

echo ""
echo -e "${YELLOW}📞 Testing Voice API Core Endpoints${NC}"
echo "====================================="

$NEWMAN_CMD run "$COLLECTION_FILE" \
    --folder "Voice API - Call Management" \
    --reporters cli \
    --timeout-request 30000 \
    --timeout-script 30000 \
    --delay-request 1000 \
    --bail

echo ""
echo -e "${YELLOW}🎤 Testing Voice API Transcription${NC}"
echo "==================================="

$NEWMAN_CMD run "$COLLECTION_FILE" \
    --folder "Voice API - Transcription" \
    --reporters cli \
    --timeout-request 30000 \
    --timeout-script 30000 \
    --delay-request 1000 \
    --bail

echo ""
echo -e "${YELLOW}🔗 Testing Cross-Platform Integration${NC}"
echo "====================================="

$NEWMAN_CMD run "$COLLECTION_FILE" \
    --folder "Voice API - Cross-Platform Integration" \
    --reporters cli \
    --timeout-request 30000 \
    --timeout-script 30000 \
    --delay-request 1000 \
    --bail

echo ""
echo -e "${YELLOW}🔐 Testing 2FA Authentication${NC}"
echo "============================="

$NEWMAN_CMD run "$COLLECTION_FILE" \
    --folder "2FA API - Authentication" \
    --reporters cli \
    --timeout-request 30000 \
    --timeout-script 30000 \
    --delay-request 1000 \
    --bail

echo ""
echo -e "${YELLOW}🔗 Testing Webhooks${NC}"
echo "==================="

$NEWMAN_CMD run "$COLLECTION_FILE" \
    --folder "Webhooks - External Services" \
    --reporters cli \
    --timeout-request 30000 \
    --timeout-script 30000 \
    --delay-request 1000 \
    --bail

echo ""
echo -e "${GREEN}✅ Focused API Testing Complete!${NC}"
echo "=============================================="
