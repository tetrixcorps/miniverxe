#!/bin/bash

# Toll-Free Number Testing Suite
# Comprehensive test runner for all toll-free number functionality

set -e

echo "🚀 Starting Toll-Free Number Testing Suite"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run tests and track results
run_test_suite() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "\n${BLUE}Running: $test_name${NC}"
    echo "Command: $test_command"
    echo "----------------------------------------"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ $test_name PASSED${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ $test_name FAILED${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# Function to check if a file exists
check_file() {
    local file_path="$1"
    if [ ! -f "$file_path" ]; then
        echo -e "${RED}❌ File not found: $file_path${NC}"
        return 1
    fi
    return 0
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Not in project root directory${NC}"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Install dependencies if needed
echo -e "\n${YELLOW}📦 Checking dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Check if test files exist
echo -e "\n${YELLOW}🔍 Checking test files...${NC}"

test_files=(
    "tests/integration/texml/texml-integration.test.ts"
    "tests/integration/toll-free-api.test.ts"
    "tests/unit/texml/texml-generator.test.ts"
    "tests/unit/texml/texml-validator.test.ts"
    "tests/unit/texml/texml-compliance.test.ts"
    "tests/unit/texml/texml-multilingual.test.ts"
    "tests/unit/texml/texml-performance.test.ts"
    "tests/unit/texml/texml-security.test.ts"
    "tests/unit/texml/texml-error-handling.test.ts"
    "tests/unit/texml/texml-ivr.test.ts"
    "tests/unit/texml/texml-routing.test.ts"
    "tests/unit/texml/texml-recording.test.ts"
    "tests/unit/texml/texml-transcription.test.ts"
    "tests/unit/texml/texml-analytics.test.ts"
    "tests/unit/texml/texml-monitoring.test.ts"
    "tests/unit/texml/texml-webhook.test.ts"
    "tests/unit/texml/texml-enterprise.test.ts"
    "tests/unit/texml/texml-iot.test.ts"
    "tests/unit/texml/texml-ai.test.ts"
    "tests/unit/texml/texml-advanced.test.ts"
)

missing_files=()
for file in "${test_files[@]}"; do
    if ! check_file "$file"; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Missing test files:${NC}"
    for file in "${missing_files[@]}"; do
        echo "  - $file"
    done
    echo -e "\n${YELLOW}Some tests will be skipped.${NC}"
fi

# Run test suites
echo -e "\n${BLUE}🧪 Running Test Suites${NC}"
echo "=========================="

# Unit Tests
echo -e "\n${YELLOW}📋 Unit Tests${NC}"
echo "------------"

run_test_suite "TeXML Generator Tests" "npx vitest run tests/unit/texml/texml-generator.test.ts"
run_test_suite "TeXML Validator Tests" "npx vitest run tests/unit/texml/texml-validator.test.ts"
run_test_suite "TeXML Compliance Tests" "npx vitest run tests/unit/texml/texml-compliance.test.ts"
run_test_suite "TeXML Multilingual Tests" "npx vitest run tests/unit/texml/texml-multilingual.test.ts"
run_test_suite "TeXML Performance Tests" "npx vitest run tests/unit/texml/texml-performance.test.ts"
run_test_suite "TeXML Security Tests" "npx vitest run tests/unit/texml/texml-security.test.ts"
run_test_suite "TeXML Error Handling Tests" "npx vitest run tests/unit/texml/texml-error-handling.test.ts"
run_test_suite "TeXML IVR Tests" "npx vitest run tests/unit/texml/texml-ivr.test.ts"
run_test_suite "TeXML Routing Tests" "npx vitest run tests/unit/texml/texml-routing.test.ts"
run_test_suite "TeXML Recording Tests" "npx vitest run tests/unit/texml/texml-recording.test.ts"
run_test_suite "TeXML Transcription Tests" "npx vitest run tests/unit/texml/texml-transcription.test.ts"
run_test_suite "TeXML Analytics Tests" "npx vitest run tests/unit/texml/texml-analytics.test.ts"
run_test_suite "TeXML Monitoring Tests" "npx vitest run tests/unit/texml/texml-monitoring.test.ts"
run_test_suite "TeXML Webhook Tests" "npx vitest run tests/unit/texml/texml-webhook.test.ts"
run_test_suite "TeXML Enterprise Tests" "npx vitest run tests/unit/texml/texml-enterprise.test.ts"
run_test_suite "TeXML IoT Tests" "npx vitest run tests/unit/texml/texml-iot.test.ts"
run_test_suite "TeXML AI Tests" "npx vitest run tests/unit/texml/texml-ai.test.ts"
run_test_suite "TeXML Advanced Tests" "npx vitest run tests/unit/texml/texml-advanced.test.ts"

# Integration Tests
echo -e "\n${YELLOW}🔗 Integration Tests${NC}"
echo "-------------------"

run_test_suite "TeXML Integration Tests" "npx vitest run tests/integration/texml/texml-integration.test.ts"
run_test_suite "Toll-Free API Tests" "npx vitest run tests/integration/toll-free-api.test.ts"

# Performance Tests
echo -e "\n${YELLOW}⚡ Performance Tests${NC}"
echo "-------------------"

run_test_suite "TeXML Performance Tests" "npx vitest run tests/unit/texml/texml-performance.test.ts --reporter=verbose"

# Security Tests
echo -e "\n${YELLOW}🔒 Security Tests${NC}"
echo "----------------"

run_test_suite "TeXML Security Tests" "npx vitest run tests/unit/texml/texml-security.test.ts --reporter=verbose"

# Compliance Tests
echo -e "\n${YELLOW}📋 Compliance Tests${NC}"
echo "-------------------"

run_test_suite "TeXML Compliance Tests" "npx vitest run tests/unit/texml/texml-compliance.test.ts --reporter=verbose"

# Test Summary
echo -e "\n${BLUE}📊 Test Summary${NC}"
echo "==============="
echo -e "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed!${NC}"
    echo -e "${GREEN}✅ Toll-Free Number system is ready for production!${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some tests failed. Please review the output above.${NC}"
    echo -e "${YELLOW}💡 Check the test logs for detailed error information.${NC}"
    exit 1
fi
