#!/bin/bash

# TETRIX Code Academy - Comprehensive Test Runner
# This script runs all tests for both backend and frontend

set -e

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to run backend tests
run_backend_tests() {
    print_status "Running backend tests..."
    
    if [ ! -d "code-academy-backend" ]; then
        print_error "Backend directory not found!"
        return 1
    fi
    
    cd code-academy-backend
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_status "Installing backend dependencies..."
        npm install
    fi
    
    # Run tests based on type
    case "$1" in
        "unit")
            print_status "Running backend unit tests..."
            npm run test:unit
            ;;
        "integration")
            print_status "Running backend integration tests..."
            npm run test:integration
            ;;
        "coverage")
            print_status "Running backend tests with coverage..."
            npm run test:coverage
            ;;
        "ci")
            print_status "Running backend tests for CI..."
            npm run test:ci
            ;;
        *)
            print_status "Running all backend tests..."
            npm test
            ;;
    esac
    
    cd ..
    print_success "Backend tests completed!"
}

# Function to run frontend tests
run_frontend_tests() {
    print_status "Running frontend tests..."
    
    if [ ! -d "code-academy-frontend" ]; then
        print_error "Frontend directory not found!"
        return 1
    fi
    
    cd code-academy-frontend
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_status "Installing frontend dependencies..."
        npm install
    fi
    
    # Run tests based on type
    case "$1" in
        "unit")
            print_status "Running frontend unit tests..."
            npm run test:run
            ;;
        "e2e")
            print_status "Running frontend E2E tests..."
            npm run test:e2e
            ;;
        "coverage")
            print_status "Running frontend tests with coverage..."
            npm run test:coverage
            ;;
        "ui")
            print_status "Running frontend tests with UI..."
            npm run test:ui
            ;;
        *)
            print_status "Running all frontend tests..."
            npm run test:all
            ;;
    esac
    
    cd ..
    print_success "Frontend tests completed!"
}

# Function to run all tests
run_all_tests() {
    print_status "Running all tests for TETRIX Code Academy..."
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ] || [ ! -d "code-academy-backend" ] || [ ! -d "code-academy-frontend" ]; then
        print_error "Please run this script from the TETRIX project root directory!"
        exit 1
    fi
    
    # Check dependencies
    if ! command_exists node; then
        print_error "Node.js is not installed!"
        exit 1
    fi
    
    if ! command_exists npm; then
        print_error "npm is not installed!"
        exit 1
    fi
    
    # Run backend tests
    run_backend_tests "$1"
    
    # Run frontend tests
    run_frontend_tests "$1"
    
    print_success "All tests completed successfully!"
}

# Function to setup test environment
setup_test_env() {
    print_status "Setting up test environment..."
    
    # Set test environment variables
    export NODE_ENV=test
    export TEST_DATABASE_URL="postgresql://test:test@localhost:5432/tetrix_code_academy_test"
    
    # Check if PostgreSQL is running
    if ! command_exists psql; then
        print_warning "PostgreSQL not found. Some tests may fail."
    fi
    
    print_success "Test environment setup complete!"
}

# Function to clean up test environment
cleanup_test_env() {
    print_status "Cleaning up test environment..."
    
    # Kill any running test processes
    pkill -f "jest" 2>/dev/null || true
    pkill -f "vitest" 2>/dev/null || true
    pkill -f "playwright" 2>/dev/null || true
    
    print_success "Test environment cleanup complete!"
}

# Function to show help
show_help() {
    echo "TETRIX Code Academy - Test Runner"
    echo ""
    echo "Usage: $0 [OPTIONS] [TEST_TYPE]"
    echo ""
    echo "OPTIONS:"
    echo "  -h, --help          Show this help message"
    echo "  -s, --setup         Setup test environment"
    echo "  -c, --cleanup       Cleanup test environment"
    echo "  -b, --backend       Run only backend tests"
    echo "  -f, --frontend      Run only frontend tests"
    echo "  -a, --all           Run all tests (default)"
    echo ""
    echo "TEST_TYPES:"
    echo "  unit                Run unit tests only"
    echo "  integration         Run integration tests only"
    echo "  e2e                 Run end-to-end tests only"
    echo "  coverage            Run tests with coverage report"
    echo "  ci                  Run tests for CI environment"
    echo "  ui                  Run tests with UI (frontend only)"
    echo ""
    echo "Examples:"
    echo "  $0                  # Run all tests"
    echo "  $0 unit             # Run all unit tests"
    echo "  $0 -b coverage      # Run backend tests with coverage"
    echo "  $0 -f e2e           # Run frontend E2E tests"
    echo "  $0 -s               # Setup test environment"
}

# Main script logic
main() {
    local test_type=""
    local run_backend=false
    local run_frontend=false
    local run_all=true
    local setup_env=false
    local cleanup_env=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -s|--setup)
                setup_env=true
                shift
                ;;
            -c|--cleanup)
                cleanup_env=true
                shift
                ;;
            -b|--backend)
                run_backend=true
                run_all=false
                shift
                ;;
            -f|--frontend)
                run_frontend=true
                run_all=false
                shift
                ;;
            -a|--all)
                run_all=true
                shift
                ;;
            unit|integration|e2e|coverage|ci|ui)
                test_type="$1"
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Handle setup and cleanup
    if [ "$setup_env" = true ]; then
        setup_test_env
        exit 0
    fi
    
    if [ "$cleanup_env" = true ]; then
        cleanup_test_env
        exit 0
    fi
    
    # Run tests
    if [ "$run_all" = true ]; then
        run_all_tests "$test_type"
    elif [ "$run_backend" = true ]; then
        run_backend_tests "$test_type"
    elif [ "$run_frontend" = true ]; then
        run_frontend_tests "$test_type"
    else
        print_error "No test target specified!"
        show_help
        exit 1
    fi
}

# Trap to cleanup on exit
trap cleanup_test_env EXIT

# Run main function
main "$@"
