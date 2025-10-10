#!/bin/bash

# Voice API Test Runner Script
# Comprehensive test execution for Voice API implementation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL=${BASE_URL:-"http://localhost:4321"}
TEST_ENV=${TEST_ENV:-"development"}
PARALLEL=${PARALLEL:-"true"}
HEADED=${HEADED:-"false"}
DEBUG=${DEBUG:-"false"}

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

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    # Check if pnpm is installed
    if ! command -v pnpm &> /dev/null; then
        print_error "pnpm is not installed"
        exit 1
    fi
    
    # Check if Playwright is installed
    if ! command -v npx &> /dev/null; then
        print_error "npx is not available"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install project dependencies
    pnpm install
    
    # Install Playwright browsers
    npx playwright install
    
    print_success "Dependencies installed successfully"
}

# Function to start development server
start_server() {
    print_status "Starting development server..."
    
    # Check if server is already running
    if curl -s "$BASE_URL" > /dev/null 2>&1; then
        print_warning "Server is already running at $BASE_URL"
        return 0
    fi
    
    # Start server in background
    pnpm run dev &
    SERVER_PID=$!
    
    # Wait for server to start
    print_status "Waiting for server to start..."
    for i in {1..30}; do
        if curl -s "$BASE_URL" > /dev/null 2>&1; then
            print_success "Server started successfully at $BASE_URL"
            return 0
        fi
        sleep 2
    done
    
    print_error "Server failed to start within 60 seconds"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
}

# Function to stop development server
stop_server() {
    if [ ! -z "$SERVER_PID" ]; then
        print_status "Stopping development server..."
        kill $SERVER_PID 2>/dev/null || true
        print_success "Server stopped"
    fi
}

# Function to run unit tests
run_unit_tests() {
    print_status "Running unit tests..."
    
    local cmd="npx playwright test tests/unit/"
    
    if [ "$HEADED" = "true" ]; then
        cmd="$cmd --headed"
    fi
    
    if [ "$DEBUG" = "true" ]; then
        cmd="$cmd --debug"
    fi
    
    if [ "$PARALLEL" = "false" ]; then
        cmd="$cmd --workers=1"
    fi
    
    eval $cmd
    
    if [ $? -eq 0 ]; then
        print_success "Unit tests passed"
    else
        print_error "Unit tests failed"
        return 1
    fi
}

# Function to run integration tests
run_integration_tests() {
    print_status "Running integration tests..."
    
    local cmd="npx playwright test tests/integration/"
    
    if [ "$HEADED" = "true" ]; then
        cmd="$cmd --headed"
    fi
    
    if [ "$DEBUG" = "true" ]; then
        cmd="$cmd --debug"
    fi
    
    if [ "$PARALLEL" = "false" ]; then
        cmd="$cmd --workers=1"
    fi
    
    eval $cmd
    
    if [ $? -eq 0 ]; then
        print_success "Integration tests passed"
    else
        print_error "Integration tests failed"
        return 1
    fi
}

# Function to run functional tests
run_functional_tests() {
    print_status "Running functional tests..."
    
    local cmd="npx playwright test tests/functional/"
    
    if [ "$HEADED" = "true" ]; then
        cmd="$cmd --headed"
    fi
    
    if [ "$DEBUG" = "true" ]; then
        cmd="$cmd --debug"
    fi
    
    if [ "$PARALLEL" = "false" ]; then
        cmd="$cmd --workers=1"
    fi
    
    eval $cmd
    
    if [ $? -eq 0 ]; then
        print_success "Functional tests passed"
    else
        print_error "Functional tests failed"
        return 1
    fi
}

# Function to run end-to-end tests
run_e2e_tests() {
    print_status "Running end-to-end tests..."
    
    local cmd="npx playwright test tests/e2e/"
    
    if [ "$HEADED" = "true" ]; then
        cmd="$cmd --headed"
    fi
    
    if [ "$DEBUG" = "true" ]; then
        cmd="$cmd --debug"
    fi
    
    if [ "$PARALLEL" = "false" ]; then
        cmd="$cmd --workers=1"
    fi
    
    eval $cmd
    
    if [ $? -eq 0 ]; then
        print_success "End-to-end tests passed"
    else
        print_error "End-to-end tests failed"
        return 1
    fi
}

# Function to run cross-platform integration tests
run_cross_platform_tests() {
    print_status "Running cross-platform integration tests..."
    
    node scripts/test-cross-platform-integration.js
    
    if [ $? -eq 0 ]; then
        print_success "Cross-platform integration tests passed"
    else
        print_error "Cross-platform integration tests failed"
        return 1
    fi
}

# Function to run all tests
run_all_tests() {
    print_status "Running all tests..."
    
    local cmd="npx playwright test"
    
    if [ "$HEADED" = "true" ]; then
        cmd="$cmd --headed"
    fi
    
    if [ "$DEBUG" = "true" ]; then
        cmd="$cmd --debug"
    fi
    
    if [ "$PARALLEL" = "false" ]; then
        cmd="$cmd --workers=1"
    fi
    
    eval $cmd
    
    if [ $? -eq 0 ]; then
        print_success "All tests passed"
    else
        print_error "Some tests failed"
        return 1
    fi
}

# Function to generate test report
generate_report() {
    print_status "Generating test report..."
    
    npx playwright show-report
    
    print_success "Test report generated"
}

# Function to show help
show_help() {
    echo "Voice API Test Runner"
    echo ""
    echo "Usage: $0 [OPTIONS] [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  unit              Run unit tests only"
    echo "  integration       Run integration tests only"
    echo "  functional        Run functional tests only"
    echo "  e2e               Run end-to-end tests only"
    echo "  cross-platform    Run cross-platform integration tests only"
    echo "  all               Run all tests (default)"
    echo "  report            Generate and show test report"
    echo "  help              Show this help message"
    echo ""
    echo "Options:"
    echo "  --headed          Run tests in headed mode (show browser)"
    echo "  --debug           Run tests in debug mode"
    echo "  --no-parallel     Run tests sequentially"
    echo "  --no-server       Don't start development server"
    echo "  --base-url URL    Set base URL for tests (default: $BASE_URL)"
    echo "  --env ENV         Set test environment (default: $TEST_ENV)"
    echo ""
    echo "Environment Variables:"
    echo "  BASE_URL          Base URL for the application"
    echo "  TEST_ENV          Test environment (development, staging, production)"
    echo "  PARALLEL          Run tests in parallel (true/false)"
    echo "  HEADED            Run tests in headed mode (true/false)"
    echo "  DEBUG             Run tests in debug mode (true/false)"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Run all tests"
    echo "  $0 unit                              # Run unit tests only"
    echo "  $0 --headed --debug                  # Run all tests in headed debug mode"
    echo "  $0 integration --no-parallel         # Run integration tests sequentially"
    echo "  $0 --base-url http://localhost:3000  # Run tests against different URL"
}

# Function to cleanup
cleanup() {
    print_status "Cleaning up..."
    stop_server
    print_success "Cleanup completed"
}

# Set up signal handlers
trap cleanup EXIT INT TERM

# Parse command line arguments
COMMAND="all"
START_SERVER="true"

while [[ $# -gt 0 ]]; do
    case $1 in
        unit|integration|functional|e2e|cross-platform|all|report|help)
            COMMAND="$1"
            shift
            ;;
        --headed)
            HEADED="true"
            shift
            ;;
        --debug)
            DEBUG="true"
            shift
            ;;
        --no-parallel)
            PARALLEL="false"
            shift
            ;;
        --no-server)
            START_SERVER="false"
            shift
            ;;
        --base-url)
            BASE_URL="$2"
            shift 2
            ;;
        --env)
            TEST_ENV="$2"
            shift 2
            ;;
        --help|-h)
            show_help
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Main execution
main() {
    print_status "Starting Voice API Test Suite"
    print_status "Base URL: $BASE_URL"
    print_status "Test Environment: $TEST_ENV"
    print_status "Parallel: $PARALLEL"
    print_status "Headed: $HEADED"
    print_status "Debug: $DEBUG"
    print_status "Command: $COMMAND"
    echo ""
    
    # Check prerequisites
    check_prerequisites
    
    # Install dependencies
    install_dependencies
    
    # Start server if needed
    if [ "$START_SERVER" = "true" ] && [ "$COMMAND" != "cross-platform" ]; then
        start_server
    fi
    
    # Run tests based on command
    case $COMMAND in
        unit)
            run_unit_tests
            ;;
        integration)
            run_integration_tests
            ;;
        functional)
            run_functional_tests
            ;;
        e2e)
            run_e2e_tests
            ;;
        cross-platform)
            run_cross_platform_tests
            ;;
        all)
            run_all_tests
            ;;
        report)
            generate_report
            ;;
        help)
            show_help
            exit 0
            ;;
        *)
            print_error "Unknown command: $COMMAND"
            show_help
            exit 1
            ;;
    esac
    
    # Generate report if tests were run
    if [ "$COMMAND" != "report" ] && [ "$COMMAND" != "help" ]; then
        print_status "Test execution completed"
        print_status "To view detailed report, run: $0 report"
    fi
}

# Run main function
main "$@"
