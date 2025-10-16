#!/bin/bash

# TETRIX Industry 2FA Authentication Test Runner
# Runs unit, functional, and integration tests

set -e

echo "🧪 TETRIX Industry 2FA Authentication Test Suite"
echo "================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js to run tests."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm to run tests."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    print_status "Installing test dependencies..."
    npm install --save-dev jest @jest/globals @testing-library/react @testing-library/jest-dom ts-jest
fi

# Set test environment
export NODE_ENV=test
export ***REMOVED***=test_telnyx_key
export TELNYX_PHONE_NUMBER=+1234567890
export SINCH_API_KEY=test_sinch_key
export SINCH_API_SECRET=test_sinch_secret
export SINCH_SERVICE_PLAN_ID=test_service_plan
export SINCH_VIRTUAL_NUMBER=+16465799770
export NEXT_PUBLIC_APP_URL=http://localhost:3000

print_status "Test environment configured"

# Run tests based on argument
case "${1:-all}" in
    "unit")
        print_status "Running unit tests..."
        npx vitest run tests/unit --reporter=verbose
        ;;
    "functional")
        print_status "Running functional tests..."
        npx vitest run tests/functional --reporter=verbose
        ;;
    "integration")
        print_status "Running integration tests..."
        npx vitest run tests/integration --reporter=verbose
        ;;
    "components")
        print_status "Running component tests..."
        npx vitest run tests/components --reporter=verbose
        ;;
    "api")
        print_status "Running API tests..."
        npx vitest run tests/unit/api --reporter=verbose
        ;;
    "auth")
        print_status "Running authentication tests..."
        npx vitest run tests/unit/auth tests/functional tests/integration --reporter=verbose
        ;;
    "all")
        print_status "Running all tests..."
        npx vitest run --reporter=verbose
        ;;
    "coverage")
        print_status "Running tests with coverage..."
        npx vitest run --coverage --reporter=verbose
        ;;
    "watch")
        print_status "Running tests in watch mode..."
        npx vitest --watch
        ;;
    "debug")
        print_status "Running tests in debug mode..."
        npx vitest run --reporter=verbose --bail=1
        ;;
    *)
        echo "Usage: $0 [unit|functional|integration|components|api|auth|all|coverage|watch|debug]"
        echo ""
        echo "Test categories:"
        echo "  unit        - Unit tests for individual functions and classes"
        echo "  functional  - Functional tests for complete workflows"
        echo "  integration - Integration tests for end-to-end scenarios"
        echo "  components  - Component tests for UI components"
        echo "  api         - API endpoint tests"
        echo "  auth        - All authentication-related tests"
        echo "  all         - Run all tests (default)"
        echo "  coverage    - Run tests with coverage report"
        echo "  watch       - Run tests in watch mode"
        echo "  debug       - Run tests in debug mode"
        exit 1
        ;;
esac

# Check test results
if [ $? -eq 0 ]; then
    print_success "All tests passed! ✅"
    echo ""
    echo "Test Summary:"
    echo "- Unit tests: Individual function and class testing"
    echo "- Functional tests: Complete authentication workflows"
    echo "- Integration tests: End-to-end scenarios with external services"
    echo "- Component tests: UI component behavior and interactions"
    echo ""
    echo "Coverage reports available in:"
    echo "- coverage/lcov-report/index.html (HTML)"
    echo "- coverage/lcov.info (LCOV format)"
else
    print_error "Some tests failed! ❌"
    exit 1
fi
